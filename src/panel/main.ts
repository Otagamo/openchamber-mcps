import { connectHost, HostRequestError } from "@openchamber/sdk";
import { applyHostReady, mountButton, mountSelect } from "@openchamber/sdk/ui";
import type {
  ConfigView,
  ConflictKind,
  ConflictView,
  DetailResponse,
  ServerState,
  ServerFailureView,
  ServerView,
  ServersResponse,
  Summary,
  TransportKind,
} from "../shared/types.ts";
import {
  GROUP_NAME_MAX,
  normalizeGroupsFile,
  type ServerGroup,
} from "../shared/groups.ts";
import css from "./style.css";
import native from "../../ui/native.css";

const host = connectHost({ requestTimeoutMs: 30_000 });
const root = document.querySelector<HTMLElement>("#root");
if (!root) throw new Error("Missing #root");
const style = document.createElement("style");
style.textContent = native + css;
document.head.append(style);

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

type Tone = "info" | "success" | "warning" | "error";
type NoticeAction = { label: string; onClick: () => void; primary?: boolean };
type Notice = { text: string; tone: Tone; actions?: NoticeAction[] };
type GroupDraft = { id: string | null; name: string; members: string[] };
type ServerDraft = {
  id: string | null;
  base: Record<string, unknown>;
  name: string;
  transport: "local" | "remote";
  command: string;
  cwd: string;
  environment: string;
  url: string;
  headers: string;
  enabled: boolean;
  maskedEnvironment: string[];
  maskedHeaders: string[];
};

const SERVER_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const MASKED_HINT =
  "Values hidden by opencode.json stay blank; leaving them blank keeps what opencode.json already stores (kept from opencode.json).";
const ENVIRONMENT_HINT = "One KEY=VALUE per line.";
const HEADERS_HINT = "One Name: value per line.";

class ServiceError extends Error {
  readonly code: string | null;
  readonly conflicts: ConflictView[];

  constructor(message: string, code: string | null, conflicts: ConflictView[]) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.conflicts = conflicts;
  }
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;
const asNullableString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;
const asBool = (value: unknown): boolean => value === true;
const asNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;
const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const isServerState = (value: unknown): value is ServerState =>
  value === "enabled" ||
  value === "disabled" ||
  value === "invalid" ||
  value === "conflict";
const isTransportKind = (value: unknown): value is TransportKind =>
  value === "local" || value === "remote" || value === "unknown";
const isConflictKind = (value: unknown): value is ConflictKind =>
  value === "both" ||
  value === "read-error" ||
  value === "duplicate" ||
  value === "invalid" ||
  value === "stub" ||
  value === "tools-off" ||
  value === "insecure-url";
const isOAuthState = (value: unknown): value is ServerView["oauth"] =>
  value === "auto" ||
  value === "disabled" ||
  value === "configured" ||
  value === "none";

const parseConflict = (value: unknown): ConflictView | null => {
  const record = asRecord(value);
  if (!record || !isConflictKind(record.kind)) return null;
  return {
    kind: record.kind,
    serverId: asString(record.serverId),
    message: asString(record.message, "Conflict"),
    paths: stringArray(record.paths),
    blocking: asBool(record.blocking),
  };
};

const parseConfig = (value: unknown): ConfigView => {
  const record = asRecord(value);
  return {
    path: asString(record?.path),
    exists: asBool(record?.exists),
    error: typeof record?.error === "string" ? record.error : null,
  };
};

const parseFailure = (value: unknown): ServerFailureView | null => {
  const record = asRecord(value);
  if (!record) return null;
  return {
    message: asString(record.message, "mcp connect failed"),
    detail: asNullableString(record.detail),
    at: asString(record.at),
    directory: asNullableString(record.directory),
  };
};

const parseServer = (value: unknown): ServerView | null => {
  const record = asRecord(value);
  if (
    !record ||
    typeof record.id !== "string" ||
    !record.id ||
    !isServerState(record.state)
  )
    return null;
  return {
    id: record.id,
    container: record.container === "legacy" ? "legacy" : "servers",
    transport: isTransportKind(record.transport) ? record.transport : "unknown",
    command: stringArray(record.command),
    url: asNullableString(record.url),
    cwd: asNullableString(record.cwd),
    environmentKeys: stringArray(record.environmentKeys),
    headerKeys: stringArray(record.headerKeys),
    timeout: asNullableString(record.timeout),
    codemode: asBool(record.codemode),
    protocol: asNullableString(record.protocol),
    oauth: isOAuthState(record.oauth) ? record.oauth : "none",
    enabled: asBool(record.enabled),
    state: record.state,
    advertised: asBool(record.advertised),
    toolsOff: stringArray(record.toolsOff),
    paths: stringArray(record.paths),
    targets: stringArray(record.targets),
    conflicts: Array.isArray(record.conflicts)
      ? record.conflicts
          .map(parseConflict)
          .filter((item): item is ConflictView => item !== null)
      : [],
    warnings: stringArray(record.warnings),
    failure: parseFailure(record.failure),
    contentHash: asString(record.contentHash),
  };
};

const parseResponse = (value: unknown): ServersResponse => {
  const record = asRecord(value);
  if (!record || !Array.isArray(record.servers)) {
    throw new ServiceError(
      "The service returned data in an invalid format.",
      "parse",
      [],
    );
  }
  const servers = record.servers
    .map(parseServer)
    .filter((item): item is ServerView => item !== null);
  const conflicts = Array.isArray(record.conflicts)
    ? record.conflicts
        .map(parseConflict)
        .filter((item): item is ConflictView => item !== null)
    : servers.flatMap((server) => server.conflicts);
  const blockingConflicts = conflicts.filter(
    (conflict) => conflict.blocking,
  ).length;
  const summary: Summary = {
    total: servers.length,
    advertised: servers.filter((server) => server.advertised).length,
    enabled: servers.filter((server) => server.state === "enabled").length,
    disabled: servers.filter((server) => server.state === "disabled").length,
    invalid: servers.filter(
      (server) => server.state === "invalid" || server.state === "conflict",
    ).length,
    legacy: servers.filter((server) => server.container === "legacy").length,
    blockingConflicts,
    warnings: conflicts.length - blockingConflicts,
  };
  return {
    servers,
    conflicts,
    summary,
    config: parseConfig(record.config),
    scanned: Array.isArray(record.scanned)
      ? record.scanned.map(parseConfig).filter((item) => item.path.length > 0)
      : [],
    scannedAt: asNumber(record.scannedAt),
  };
};

const parseGroups = (value: unknown): ServerGroup[] => {
  try {
    return normalizeGroupsFile(value).groups;
  } catch (error) {
    throw new ServiceError(
      error instanceof Error
        ? error.message
        : "The group configuration format is invalid.",
      "parse",
      [],
    );
  }
};

const parseDetail = (value: unknown): DetailResponse => {
  const record = asRecord(value);
  const definition = asRecord(record?.definition);
  if (!record || !definition)
    throw new ServiceError(
      "The service returned an invalid server definition.",
      "parse",
      [],
    );
  return {
    id: asString(record.id),
    container: record.container === "legacy" ? "legacy" : "servers",
    definition,
    paths: stringArray(record.paths),
    maskedPaths: stringArray(record.maskedPaths),
  };
};

const request = async (
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<unknown> => {
  const response = await host.serviceRequest({
    method,
    path,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.body) as unknown;
  } catch {
    throw new ServiceError(
      "The service returned unrecognized data. Try again.",
      "parse",
      [],
    );
  }
  if (response.status >= 400) {
    const record = asRecord(parsed) ?? {};
    const message =
      typeof record.error === "string"
        ? record.error
        : `Request failed (${response.status})`;
    const code = typeof record.code === "string" ? record.code : null;
    const conflicts = Array.isArray(record.conflicts)
      ? record.conflicts
          .map(parseConflict)
          .filter((item): item is ConflictView => item !== null)
      : [];
    throw new ServiceError(message, code, conflicts);
  }
  return parsed;
};

const describeError = (error: unknown): string => {
  if (error instanceof HostRequestError) {
    if (error.code === "NO_SERVICE")
      return 'Allow "MCP Manager" to run its local service in Settings → Extensions.';
    if (error.code === "SERVICE_FAILED")
      return "The local service is not ready. Reload the extension and try again.";
    if (error.code === "DISABLED")
      return "The MCP Manager extension is disabled. Enable it in extension settings.";
    if (error.code === "HOST_TIMEOUT")
      return "The local service timed out. Try again.";
    if (error.code === "NOT_GRANTED")
      return "Allow the required permission in extension settings, or reinstall the extension.";
    return "Cannot connect to the local service. Check the extension permissions.";
  }
  if (error instanceof ServiceError) return error.message;
  return error instanceof Error
    ? error.message
    : "The operation failed. Try again.";
};

const describeGroupsError = (error: unknown): string =>
  error instanceof ServiceError && error.code === "not-found"
    ? 'The local service is outdated. Disable and re-enable "MCP Manager" in extension settings.'
    : describeError(error);

const app = el("main", "ext mc");
app.setAttribute("aria-label", "MCP Manager");
const header = el("header", "mc-header");
const titleRow = el("div", "mc-title-row");
const titleBlock = el("div", "mc-title-block");
const title = el("h1", "mc-title", "MCP Manager");
const titleCount = el("span", "mc-title-count");
const actionRoot = el("div", "mc-actions");
const refresh = mountButton(actionRoot, {
  label: "Rescan",
  variant: "outline",
  size: "sm",
  onClick: () => {
    void loadAll(true);
    void reloadGroups();
  },
});
const enableAll = mountButton(actionRoot, {
  label: "Enable all",
  variant: "outline",
  size: "sm",
  onClick: () => requestBulk(true),
});
const disableAll = mountButton(actionRoot, {
  label: "Disable all",
  variant: "outline",
  size: "sm",
  onClick: () => requestBulk(false),
});
titleBlock.append(title, titleCount);
titleRow.append(titleBlock);

header.append(titleRow);

const body = el("div", "mc-body");
const noticeRoot = el("div", "mc-notice-root");
noticeRoot.setAttribute("aria-live", "polite");
const groupsNote = el("div", "mc-groups-note");
const groupsRow = el("div", "mc-groups-row");
const groupsRoot = el("div", "mc-groups");
const groupSelectRoot = el("div", "mc-group-select");
const editGroups = el("button", "mc-chip mc-groups-edit", "Edit groups");
editGroups.type = "button";
editGroups.setAttribute("aria-pressed", "false");
editGroups.addEventListener("click", () => {
  if (groupDraft) closeGroupEditor();
  else openGroupEditor();
});
groupsRow.append(groupsRoot, groupSelectRoot, editGroups);
const groupEditor = el("div", "mc-group-editor-root");
const serverEditor = el("div", "mc-server-editor-root");
const groupBarRoot = el("div");
const conflictRoot = el("div");
const search = el("input", "mc-search");
search.type = "search";
search.placeholder = "Search name, command or URL";
search.setAttribute("aria-label", "Search MCP servers");
search.addEventListener("input", () => {
  query = search.value.trim().toLowerCase();
  renderList();
});
header.append(search);
const listRoot = el("div", "mc-list");
listRoot.setAttribute("role", "list");
const footer = el("footer", "mc-footer");
footer.append(
  el(
    "p",
    "",
    "Manages the mcp.servers block of ~/.config/opencode/opencode.json (and opencode.jsonc when present). Writes preserve comments and the rest of the file; every write keeps the previous content in opencode.json.mcp-manager.bak.",
  ),
  el(
    "p",
    "",
    "Changes take effect when OpenCode reloads its config; running sessions keep the tools they already loaded.",
  ),
);
body.append(
  noticeRoot,
  actionRoot,
  groupsNote,
  groupsRow,
  groupEditor,
  serverEditor,
  groupBarRoot,
  conflictRoot,
  listRoot,
  footer,
);
app.append(header, body);
root.append(app);

let data: ServersResponse | null = null;
let loading = false;
let loadError: string | null = null;
let notice: Notice | null = null;
let busy: string | null = null;
let pendingBulk: boolean | null = null;
let pendingOnlyGroup: ServerGroup | null = null;
let pendingDeleteServer: string | null = null;
let selectedGroup: string | null = null;
let groups: ServerGroup[] = [];
let groupsError: string | null = null;
let groupsLoading = true;
let groupDraft: GroupDraft | null = null;
let groupEditorError: string | null = null;
let pendingDeleteGroup = false;
let serverDraft: ServerDraft | null = null;
let serverDraftError: string | null = null;
let query = "";
let initialized = false;

const groupSelect = mountSelect(groupSelectRoot, {
  value: "all",
  options: [{ id: "all", label: "All" }],
  onChange: (id) => {
    selectedGroup = id === "all" ? null : id;
    render();
  },
});
const groupSelectTrigger =
  groupSelectRoot.querySelector<HTMLButtonElement>(".oc-sdk-trigger");
if (groupSelectTrigger) {
  groupSelectTrigger.setAttribute("aria-label", "Filter by group");
  groupSelectTrigger.removeAttribute("aria-labelledby");
}

const configBlocked = (): boolean => Boolean(data?.config.error);

const toneForState = (server: ServerView): Tone => {
  if (server.state === "conflict") return "error";
  if (server.state === "invalid") return "warning";
  if (server.state === "disabled") return "info";
  return server.advertised ? "success" : "warning";
};

const stateText = (server: ServerView): string => {
  if (server.state === "conflict") return "Conflict";
  if (server.state === "invalid") return "Invalid";
  if (server.state === "disabled") return "Disabled";
  return "Enabled";
};

const badge = (
  text: string,
  tone: Tone | "neutral" = "neutral",
): HTMLSpanElement => {
  const node = el("span", "mc-badge", text);
  node.dataset.tone = tone;
  return node;
};

const conflictTitle = (kind: ConflictKind): string => {
  switch (kind) {
    case "both":
      return "Defined in more than one config file";
    case "duplicate":
      return "Duplicate entry inside mcp.servers";
    case "invalid":
      return "Definition cannot be read";
    case "read-error":
      return "Config cannot be read";
    case "tools-off":
      return "A tool is turned off";
    case "insecure-url":
      return "URL is not encrypted";
    default:
      return "Conflict";
  }
};

const pathLine = (label: string, file: string | null): HTMLElement | null => {
  if (!file) return null;
  const line = el("p", "mc-path");
  line.append(el("span", "mc-path-label", `${label}: `), el("code", "", file));
  return line;
};

const actionButton = (
  label: string,
  onClick: () => void,
  primary = false,
  disabled = false,
): HTMLButtonElement => {
  const button = el(
    "button",
    primary ? "mc-inline-button mc-inline-primary" : "mc-inline-button",
    label,
  );
  button.type = "button";
  button.disabled = Boolean(busy) || disabled;
  button.addEventListener("click", onClick);
  return button;
};

const field = (
  label: string,
  control: HTMLElement,
  hint: string | null = null,
): HTMLElement => {
  const wrap = el("div", "mc-field");
  wrap.append(el("span", "mc-field-label", label), control);
  if (
    control instanceof HTMLInputElement ||
    control instanceof HTMLTextAreaElement ||
    control instanceof HTMLSelectElement
  ) {
    control.setAttribute("aria-label", label);
  }
  if (hint) wrap.append(el("span", "mc-field-hint", hint));
  return wrap;
};

const basename = (file: string): string => file.split(/[\\/]/).pop() || file;

const conflictItem = (conflict: ConflictView): HTMLElement => {
  const item = el("li", "mc-conflict-item");
  item.dataset.tone = conflict.blocking ? "error" : "warning";
  const copy = el("div", "mc-conflict-copy");
  copy.append(
    el("strong", "", conflictTitle(conflict.kind)),
    el("p", "mc-conflict-message", conflict.message),
  );
  for (const file of conflict.paths) {
    const line = pathLine("Config", file);
    if (line) copy.append(line);
  }
  item.append(copy);

  if (conflict.kind === "both") {
    const server =
      data?.servers.find((item) => item.id === conflict.serverId) ?? null;
    const targets = server?.targets ?? [];
    if (targets.length >= 2) {
      const actions = el("div", "mc-conflict-actions");
      for (const target of targets) {
        const [file] = target.split("#");
        const container = target.endsWith("#legacy")
          ? "legacy entry"
          : "mcp.servers";
        actions.append(
          actionButton(
            `Keep ${basename(file ?? target)} · ${container}`,
            () => void resolveConflict(conflict, target),
            false,
            configBlocked(),
          ),
        );
      }
      item.append(actions);
    }
  }
  return item;
};

const renderConflicts = (): void => {
  conflictRoot.replaceChildren();
  if (!data) return;
  const all = data.conflicts;
  const blocking = all.filter((conflict) => conflict.blocking);
  const warnings = all.filter((conflict) => !conflict.blocking);
  if (blocking.length === 0 && warnings.length === 0) return;

  const card = el("section", "mc-conflicts");
  card.setAttribute("aria-label", "Conflict check");
  const head = el("div", "mc-section-head");
  head.append(
    el("h2", "mc-section-title", "Conflict check"),
    el(
      "span",
      "mc-section-count",
      `${blocking.length} blocking · ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`,
    ),
  );
  card.append(head);

  if (blocking.length > 0) {
    const list = el("ul", "mc-conflict-list");
    for (const conflict of blocking) list.append(conflictItem(conflict));
    card.append(list);
  }
  if (warnings.length > 0) {
    const details = el("details", "mc-warning-details");
    details.append(el("summary", "", `Warnings (${warnings.length})`));
    const list = el("ul", "mc-conflict-list");
    for (const conflict of warnings) list.append(conflictItem(conflict));
    details.append(list);
    card.append(details);
  }
  conflictRoot.append(card);
};

const renderNotice = (): void => {
  noticeRoot.replaceChildren();
  if (pendingDeleteServer !== null) {
    const id = pendingDeleteServer;
    const node = el(
      "div",
      "mc-notice",
      `Remove ${id} from opencode.json? The server definition is deleted; a copy is kept in opencode.json.mcp-manager.bak.`,
    );
    node.dataset.tone = "warning";
    node.setAttribute("role", "status");
    const actions = el("div", "mc-notice-actions");
    actions.append(
      actionButton("Confirm remove", () => void removeServer(id), true),
      actionButton("Cancel", () => {
        pendingDeleteServer = null;
        render();
      }),
    );
    node.append(actions);
    noticeRoot.append(node);
    return;
  }
  if (pendingOnlyGroup) {
    const group = pendingOnlyGroup;
    const memberIds = new Set(group.serverIds);
    const others = data
      ? data.servers.filter((server) => !memberIds.has(server.id)).length
      : 0;
    const node = el(
      "div",
      "mc-notice",
      `Only "${group.name}": ${others} other servers will be disabled.`,
    );
    node.dataset.tone = "warning";
    node.setAttribute("role", "status");
    const actions = el("div", "mc-notice-actions");
    actions.append(
      actionButton("Confirm", () => void applyOnlyGroup(), true),
      actionButton("Cancel", () => {
        pendingOnlyGroup = null;
        render();
      }),
    );
    node.append(actions);
    noticeRoot.append(node);
    return;
  }
  if (pendingBulk !== null) {
    const count = data
      ? data.servers.filter((server) => server.enabled !== pendingBulk).length
      : 0;
    const node = el(
      "div",
      "mc-notice",
      pendingBulk
        ? `${count} servers will be enabled.`
        : `${count} servers will be disabled.`,
    );
    node.dataset.tone = "warning";
    node.setAttribute("role", "status");
    const actions = el("div", "mc-notice-actions");
    actions.append(
      actionButton(
        pendingBulk ? "Confirm enable" : "Confirm disable",
        () => void applyBulk(),
        true,
      ),
      actionButton("Cancel", () => {
        pendingBulk = null;
        render();
      }),
    );
    node.append(actions);
    noticeRoot.append(node);
    return;
  }
  if (notice) {
    const node = el("div", "mc-notice", notice.text);
    node.dataset.tone = notice.tone;
    node.setAttribute("role", notice.tone === "error" ? "alert" : "status");
    if (notice.actions?.length) {
      const actions = el("div", "mc-notice-actions");
      for (const action of notice.actions)
        actions.append(
          actionButton(action.label, action.onClick, action.primary),
        );
      node.append(actions);
    }
    noticeRoot.append(node);
    return;
  }
  if (loadError) {
    const node = el("div", "mc-notice", loadError);
    node.dataset.tone = "error";
    node.setAttribute("role", "alert");
    noticeRoot.append(node);
    return;
  }
  if (loading && !data) {
    const node = el("div", "mc-notice", "Reading servers…");
    node.dataset.tone = "info";
    node.setAttribute("role", "status");
    noticeRoot.append(node);
  }
};

const groupServerIds = (group: ServerGroup): string[] =>
  group.serverIds.filter((id) =>
    data?.servers.some((server) => server.id === id),
  );

const groupState = (group: ServerGroup): string => {
  const servers = groupServerIds(group)
    .map((id) => data?.servers.find((server) => server.id === id))
    .filter((server): server is ServerView => Boolean(server));
  if (servers.length === 0) return "No servers";
  if (servers.some((server) => server.state === "conflict"))
    return "Has conflicts";
  const enabled = servers.filter((server) => server.state === "enabled").length;
  if (enabled === servers.length) return "All on";
  if (enabled === 0) return "All off";
  return "Partial";
};

const focusGroupChip = (id: string): void => {
  const target = Array.from(
    groupsRoot.querySelectorAll<HTMLElement>("[data-group]"),
  ).find((node) => node.dataset.group === id);
  target?.focus();
};

const makeGroupId = (): string => {
  const suffix =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ??
    Math.random().toString(36).slice(2, 10);
  return `custom-${suffix}`;
};

const renderGroupsNote = (): void => {
  groupsNote.replaceChildren();
  if (!groupsError) return;
  const node = el(
    "div",
    "mc-notice",
    `Group configuration cannot be read: ${groupsError}`,
  );
  node.dataset.tone = "error";
  node.setAttribute("role", "alert");
  const actions = el("div", "mc-notice-actions");
  actions.append(
    actionButton("Reload", () => void reloadGroups(), false, groupsLoading),
  );
  node.append(actions);
  groupsNote.append(node);
};

const startGroupDraft = (group: ServerGroup | null): void => {
  groupDraft = {
    id: group?.id ?? null,
    name: group?.name ?? "",
    members: group ? [...group.serverIds] : [],
  };
  groupEditorError = null;
  pendingDeleteGroup = false;
  render();
  const input = groupEditor.querySelector<HTMLInputElement>(".mc-group-name");
  input?.focus();
  input?.select();
};

const openGroupEditor = (): void => {
  if (groupsError || groupsLoading || !data || configBlocked()) return;
  const group =
    groups.find((item) => item.id === selectedGroup) ?? groups[0] ?? null;
  startGroupDraft(group);
  groupEditor.scrollIntoView({ block: "nearest" });
};

const closeGroupEditor = (): void => {
  if (busy) return;
  groupDraft = null;
  groupEditorError = null;
  pendingDeleteGroup = false;
  render();
  editGroups.focus();
};

const selectDraftGroup = (id: string): void => {
  if (id === "new") {
    startGroupDraft(null);
    return;
  }
  const group = groups.find((item) => item.id === id);
  if (group) startGroupDraft(group);
};

const focusDraftName = (): void => {
  groupEditor.querySelector<HTMLInputElement>(".mc-group-name")?.focus();
};

const saveGroupDraft = async (): Promise<void> => {
  const draft = groupDraft;
  if (!draft || busy || groupsError) return;
  const name = draft.name.trim();
  if (!name) {
    groupEditorError = "Enter a group name.";
    render();
    focusDraftName();
    return;
  }
  if (name.length > GROUP_NAME_MAX) {
    groupEditorError = `Group name cannot exceed ${GROUP_NAME_MAX} characters.`;
    render();
    focusDraftName();
    return;
  }
  if (
    groups.some(
      (group) =>
        group.id !== draft.id &&
        group.name.trim().toLowerCase() === name.toLowerCase(),
    )
  ) {
    groupEditorError = `A group named "${name}" already exists.`;
    render();
    focusDraftName();
    return;
  }
  if (draft.members.length === 0) {
    groupEditorError = "A group needs at least one member.";
    render();
    return;
  }
  const id = draft.id ?? makeGroupId();
  const saved: ServerGroup = { id, name, serverIds: [...draft.members] };
  const next = draft.id
    ? groups.map((group) => (group.id === draft.id ? saved : group))
    : [...groups, saved];
  busy = "groups";
  groupEditorError = null;
  render();
  try {
    groups = parseGroups(
      await request("POST", "/groups", { version: 1, groups: next }),
    );
    groupsError = null;
    selectedGroup = id;
    pendingOnlyGroup = null;
    const stored = groups.find((group) => group.id === id) ?? null;
    groupDraft = stored
      ? { id: stored.id, name: stored.name, members: [...stored.serverIds] }
      : null;
    notice = { text: `Saved group "${name}".`, tone: "success" };
    void host
      .toast({ kind: "success", message: `Saved group "${name}"` })
      .catch(() => undefined);
  } catch (error) {
    groupEditorError = describeError(error);
  } finally {
    busy = null;
    render();
  }
};

const requestDeleteGroup = (): void => {
  if (!groupDraft?.id || busy) return;
  pendingDeleteGroup = true;
  render();
};

const confirmDeleteGroup = async (): Promise<void> => {
  if (!groupDraft?.id || busy) return;
  const removed = groupDraft.id;
  const next = groups.filter((group) => group.id !== removed);
  busy = "groups";
  pendingDeleteGroup = false;
  groupEditorError = null;
  render();
  try {
    groups = parseGroups(
      await request("POST", "/groups", { version: 1, groups: next }),
    );
    groupsError = null;
    if (pendingOnlyGroup?.id === removed) pendingOnlyGroup = null;
    if (selectedGroup === removed) selectedGroup = null;
    const target =
      groups.find((group) => group.id === selectedGroup) ?? groups[0] ?? null;
    selectedGroup = target?.id ?? null;
    groupDraft = target
      ? { id: target.id, name: target.name, members: [...target.serverIds] }
      : null;
    notice = { text: "Group deleted.", tone: "success" };
  } catch (error) {
    groupEditorError = describeError(error);
  } finally {
    busy = null;
    render();
  }
};

const renderGroupEditor = (): void => {
  groupEditor.replaceChildren();
  if (!groupDraft) return;
  const draft = groupDraft;
  const card = el("section", "mc-group-editor");
  card.setAttribute("aria-label", "Edit groups");
  const head = el("div", "mc-section-head");
  head.append(
    el("h2", "mc-section-title", "Edit groups"),
    actionButton("Close", closeGroupEditor, false, Boolean(busy)),
  );
  card.append(head);

  const selectField = el("label", "mc-field");
  selectField.append(el("span", "mc-field-label", "Select group"));
  const select = el("select", "mc-input");
  select.setAttribute("aria-label", "Select group");
  const newOption = el("option", "", "New group");
  newOption.value = "new";
  select.append(newOption);
  for (const group of groups) {
    const option = el(
      "option",
      "",
      `${group.name} (${group.serverIds.length})`,
    );
    option.value = group.id;
    select.append(option);
  }
  select.value = draft.id ?? "new";
  select.disabled = Boolean(busy);
  select.addEventListener("change", () => selectDraftGroup(select.value));
  selectField.append(select);

  const nameField = el("label", "mc-field");
  nameField.append(el("span", "mc-field-label", "Name"));
  const nameInput = el("input", "mc-input mc-group-name");
  nameInput.type = "text";
  nameInput.value = draft.name;
  nameInput.maxLength = GROUP_NAME_MAX;
  nameInput.placeholder = "e.g. Daily development";
  nameInput.autocomplete = "off";
  nameInput.spellcheck = false;
  nameInput.disabled = Boolean(busy);
  nameInput.addEventListener("input", () => {
    if (!groupDraft) return;
    groupDraft.name = nameInput.value;
    groupEditorError = null;
  });
  nameInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void saveGroupDraft();
  });
  nameField.append(nameInput);
  card.append(selectField, nameField);

  const members = el("fieldset", "mc-members");
  const legend = el("legend", "", `Members (${draft.members.length})`);
  members.append(legend);
  const tools = el("div", "mc-members-tools");
  tools.append(
    actionButton(
      "Select all",
      () => {
        if (!groupDraft) return;
        const existing = data?.servers.map((server) => server.id) ?? [];
        const missing = groupDraft.members.filter(
          (id) => !existing.includes(id),
        );
        groupDraft.members = [...existing, ...missing];
        render();
      },
      false,
      Boolean(busy),
    ),
    actionButton(
      "Clear",
      () => {
        if (!groupDraft) return;
        groupDraft.members = [];
        render();
      },
      false,
      Boolean(busy),
    ),
  );
  members.append(tools);
  const memberList = el("div", "mc-member-list");
  for (const server of data?.servers ?? []) {
    const row = el("label", "mc-check");
    const checkbox = el("input");
    checkbox.type = "checkbox";
    checkbox.checked = draft.members.includes(server.id);
    checkbox.disabled = Boolean(busy);
    checkbox.addEventListener("change", () => {
      if (!groupDraft) return;
      if (checkbox.checked) {
        if (!groupDraft.members.includes(server.id))
          groupDraft.members.push(server.id);
      } else {
        groupDraft.members = groupDraft.members.filter(
          (id) => id !== server.id,
        );
      }
      legend.textContent = `Members (${groupDraft.members.length})`;
      groupEditorError = null;
    });
    const copy = el("span", "mc-check-copy");
    copy.append(
      el("span", "mc-check-name", server.id),
      el("code", "mc-check-id", server.transport),
    );
    row.append(checkbox, copy);
    memberList.append(row);
  }
  members.append(memberList);

  const existingIds = new Set(data?.servers.map((server) => server.id) ?? []);
  const missing = draft.members.filter((id) => !existingIds.has(id));
  if (missing.length > 0) {
    const box = el("div", "mc-missing");
    box.append(el("span", "mc-missing-label", "Missing from config:"));
    for (const id of missing) {
      const chip = el("button", "mc-missing-chip", `${id} ×`);
      chip.type = "button";
      chip.disabled = Boolean(busy);
      chip.title = "Remove this missing member from the group";
      chip.addEventListener("click", () => {
        if (!groupDraft) return;
        groupDraft.members = groupDraft.members.filter((item) => item !== id);
        render();
      });
      box.append(chip);
    }
    members.append(box);
  }
  card.append(members);

  if (groupEditorError) {
    const error = el("p", "mc-editor-error", groupEditorError);
    error.setAttribute("role", "alert");
    card.append(error);
  }

  const actions = el("div", "mc-editor-actions");
  if (draft.id)
    actions.append(
      actionButton("Delete group", requestDeleteGroup, false, Boolean(busy)),
    );
  actions.append(
    actionButton(
      draft.id ? "Save changes" : "Create group",
      () => void saveGroupDraft(),
      true,
      Boolean(busy),
    ),
  );
  card.append(actions);

  if (pendingDeleteGroup) {
    const confirm = el("div", "mc-editor-confirm");
    confirm.dataset.tone = "warning";
    confirm.append(
      el(
        "p",
        "",
        `Delete group "${draft.name.trim() || "Untitled"}"? The servers themselves are not changed.`,
      ),
    );
    const buttons = el("div", "mc-actions");
    buttons.append(
      actionButton(
        "Confirm delete",
        () => void confirmDeleteGroup(),
        true,
        Boolean(busy),
      ),
      actionButton(
        "Cancel",
        () => {
          pendingDeleteGroup = false;
          render();
        },
        false,
        Boolean(busy),
      ),
    );
    confirm.append(buttons);
    card.append(confirm);
  }

  card.append(
    el(
      "p",
      "mc-editor-hint",
      "Groups only affect panel filtering and bulk toggles; they do not change servers. Members are written to groups.json on save.",
    ),
  );
  groupEditor.append(card);
};

const renderGroups = (): void => {
  groupsRoot.replaceChildren();
  const total = data?.servers.length ?? 0;
  const all = el("button", "mc-chip", `All ${total}`);
  all.type = "button";
  all.dataset.group = "all";
  all.setAttribute("aria-pressed", selectedGroup === null ? "true" : "false");
  all.addEventListener("click", () => {
    selectedGroup = null;
    render();
    focusGroupChip("all");
  });
  groupsRoot.append(all);
  for (const group of groups) {
    const count = groupServerIds(group).length;
    const chip = el("button", "mc-chip", `${group.name} ${count}`);
    chip.type = "button";
    chip.dataset.group = group.id;
    chip.setAttribute(
      "aria-pressed",
      selectedGroup === group.id ? "true" : "false",
    );
    chip.addEventListener("click", () => {
      selectedGroup = group.id;
      render();
      focusGroupChip(group.id);
    });
    groupsRoot.append(chip);
  }
  editGroups.textContent = groupDraft ? "Close editor" : "Edit groups";
  editGroups.setAttribute("aria-pressed", groupDraft ? "true" : "false");
  editGroups.disabled =
    groupsLoading ||
    Boolean(groupsError) ||
    Boolean(busy) ||
    !data ||
    configBlocked();
  editGroups.title = groupsLoading
    ? "Reading groups…"
    : groupsError
      ? "Group configuration cannot be read. Fix the file and reload."
      : !data
        ? "Server list not loaded yet"
        : configBlocked()
          ? "Config cannot be read"
          : "";
  groupSelect.update({
    value: selectedGroup ?? "all",
    options: [
      { id: "all", label: `All ${total}` },
      ...groups.map((group) => ({
        id: group.id,
        label: `${group.name} ${groupServerIds(group).length}`,
        hint: groupState(group),
      })),
    ],
  });
};

const renderGroupBar = (): void => {
  groupBarRoot.replaceChildren();
  if (!data || !selectedGroup) return;
  const current = data;
  const group = groups.find((item) => item.id === selectedGroup);
  if (!group) return;
  const available = groupServerIds(group);
  const missing = group.serverIds.filter((id) => !available.includes(id));
  const servers = available
    .map((id) => current.servers.find((server) => server.id === id))
    .filter((server): server is ServerView => Boolean(server));
  const conflict = servers.some((server) => server.state === "conflict");
  const blocked = configBlocked() || conflict || available.length === 0;
  const bar = el("div", "mc-groupbar");
  const text = el("div", "mc-groupbar-text");
  text.append(
    el("strong", "", group.name),
    el("span", "mc-group-state", `${available.length} · ${groupState(group)}`),
  );
  if (missing.length > 0)
    text.append(el("p", "mc-group-warning", `Missing: ${missing.join(", ")}`));
  const actions = el("div", "mc-groupbar-actions");
  actions.append(
    actionButton(
      "Enable group",
      () => void runGroup(group, true),
      false,
      blocked,
    ),
    actionButton(
      "Disable group",
      () => void runGroup(group, false),
      false,
      blocked,
    ),
  );
  const only = actionButton(
    "Only this group",
    () => requestOnlyGroup(group),
    false,
    blocked || missing.length > 0,
  );
  if (missing.length > 0)
    only.title =
      "The group has missing servers. Fix them before using only this group.";
  actions.append(only);
  bar.append(text, actions);
  groupBarRoot.append(bar);
};

const runGroup = async (
  group: ServerGroup,
  enabled: boolean,
): Promise<void> => {
  if (!data || busy) return;
  const ids = groupServerIds(group);
  if (ids.length === 0) return;
  busy = `group:${group.id}:${enabled ? "on" : "off"}`;
  pendingOnlyGroup = null;
  pendingBulk = null;
  pendingDeleteServer = null;
  notice = null;
  render();
  try {
    data = parseResponse(
      await request("POST", "/servers/batch", {
        enable: enabled ? ids : [],
        disable: enabled ? [] : ids,
      }),
    );
    notice = {
      text: `${ids.length} servers in "${group.name}" ${enabled ? "enabled" : "disabled"}.`,
      tone: "success",
    };
    void host
      .toast({
        kind: "success",
        message: `${enabled ? "Enabled" : "Disabled"} "${group.name}"`,
      })
      .catch(() => undefined);
  } catch (error) {
    notice = { text: describeError(error), tone: "error" };
    busy = null;
    render();
    void loadServers(false, true);
    return;
  }
  busy = null;
  render();
};

const requestOnlyGroup = (group: ServerGroup): void => {
  if (!data || busy) return;
  const available = groupServerIds(group);
  const missing = group.serverIds.filter((id) => !available.includes(id));
  if (available.length === 0 || missing.length > 0) return;
  pendingOnlyGroup = group;
  pendingBulk = null;
  pendingDeleteServer = null;
  notice = null;
  render();
  noticeRoot.scrollIntoView({ block: "nearest" });
  noticeRoot.querySelector<HTMLButtonElement>("button")?.focus();
};

const applyOnlyGroup = async (): Promise<void> => {
  if (!data || busy || !pendingOnlyGroup) return;
  const group = pendingOnlyGroup;
  pendingOnlyGroup = null;
  const enable = groupServerIds(group);
  const missing = group.serverIds.filter((id) => !enable.includes(id));
  if (enable.length === 0 || missing.length > 0) {
    notice = {
      text: "The group has missing servers. Nothing changed.",
      tone: "error",
    };
    render();
    return;
  }
  const memberIds = new Set(group.serverIds);
  const disable = data.servers
    .filter((server) => !memberIds.has(server.id))
    .map((server) => server.id);
  busy = `group-only:${group.id}`;
  notice = null;
  render();
  try {
    data = parseResponse(
      await request("POST", "/servers/batch", { enable, disable }),
    );
    notice = {
      text: `Only "${group.name}" enabled; ${disable.length} other servers disabled.`,
      tone: "success",
    };
    void host
      .toast({ kind: "success", message: `Only "${group.name}" enabled` })
      .catch(() => undefined);
  } catch (error) {
    notice = { text: describeError(error), tone: "error" };
    busy = null;
    render();
    void loadServers(false, true);
    return;
  }
  busy = null;
  render();
};

const splitCommand = (
  input: string,
): { tokens: string[]; error: string | null } => {
  const tokens: string[] = [];
  let current = "";
  let quoted = false;
  let started = false;
  for (const char of input) {
    if (char === '"') {
      quoted = !quoted;
      started = true;
      continue;
    }
    if (!quoted && /\s/.test(char)) {
      if (started) {
        tokens.push(current);
        current = "";
        started = false;
      }
      continue;
    }
    current += char;
    started = true;
  }
  if (quoted)
    return { tokens, error: "A double quote in the command is not closed." };
  if (started) tokens.push(current);
  return { tokens, error: null };
};

const quoteArgument = (value: string): string =>
  /\s/.test(value) ? `"${value}"` : value;

const parsePairs = (
  text: string,
  separator: "=" | ":",
  format: string,
): { values: Record<string, string>; error: string | null } => {
  const values: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf(separator);
    if (index <= 0) return { values, error: `"${trimmed}" is not ${format}` };
    const key = trimmed.slice(0, index).trim();
    if (!key) return { values, error: `"${trimmed}" is not ${format}` };
    values[key] = trimmed.slice(index + 1).trim();
  }
  return { values, error: null };
};

const pairLines = (value: unknown): { lines: string[]; masked: string[] } => {
  const record = asRecord(value);
  const lines: string[] = [];
  const masked: string[] = [];
  if (!record) return { lines, masked };
  for (const [key, raw] of Object.entries(record)) {
    const text = typeof raw === "string" ? raw : "";
    if (text === "") masked.push(key);
    lines.push(`${key}=${text}`);
  }
  return { lines, masked };
};

const headerLines = (value: unknown): { lines: string[]; masked: string[] } => {
  const record = asRecord(value);
  const lines: string[] = [];
  const masked: string[] = [];
  if (!record) return { lines, masked };
  for (const [key, raw] of Object.entries(record)) {
    const text = typeof raw === "string" ? raw : "";
    if (text === "") masked.push(key);
    lines.push(`${key}: ${text}`);
  }
  return { lines, masked };
};

const draftFromDefinition = (
  id: string,
  definition: Record<string, unknown>,
): ServerDraft => {
  const environment = pairLines(definition.environment);
  const headers = headerLines(definition.headers);
  return {
    id,
    base: definition,
    name: id,
    transport: definition.type === "remote" ? "remote" : "local",
    command: stringArray(definition.command).map(quoteArgument).join(" "),
    cwd: asString(definition.cwd),
    environment: environment.lines.join("\n"),
    url: asString(definition.url),
    headers: headers.lines.join("\n"),
    enabled: definition.disabled !== true && definition.enabled !== false,
    maskedEnvironment: environment.masked,
    maskedHeaders: headers.masked,
  };
};

const buildDefinition = (
  draft: ServerDraft,
): { definition: Record<string, unknown>; error: string | null } => {
  // Everything the form does not edit (timeout, codemode, protocol, oauth, future keys) rides along in base.
  const definition: Record<string, unknown> = { ...draft.base };
  for (const key of [
    "type",
    "command",
    "cwd",
    "environment",
    "url",
    "headers",
    "enabled",
    "disabled",
  ]) {
    delete definition[key];
  }
  definition.type = draft.transport;
  if (draft.transport === "local") {
    const parts = splitCommand(draft.command);
    if (parts.error) return { definition, error: parts.error };
    if (parts.tokens.length === 0)
      return { definition, error: "Enter the command that starts the server." };
    definition.command = parts.tokens;
    const cwd = draft.cwd.trim();
    if (cwd) definition.cwd = cwd;
    const environment = parsePairs(draft.environment, "=", "KEY=VALUE");
    if (environment.error)
      return { definition, error: `Environment: ${environment.error}` };
    if (Object.keys(environment.values).length > 0)
      definition.environment = environment.values;
  } else {
    const url = draft.url.trim();
    if (!/^https?:\/\/\S+$/i.test(url))
      return {
        definition,
        error: "Enter the URL, starting with http:// or https://.",
      };
    definition.url = url;
    const headers = parsePairs(draft.headers, ":", "Name: value");
    if (headers.error)
      return { definition, error: `Headers: ${headers.error}` };
    if (Object.keys(headers.values).length > 0)
      definition.headers = headers.values;
  }
  return { definition, error: null };
};

const focusDraftField = (name: string): void => {
  serverEditor.querySelector<HTMLElement>(`[data-field="${name}"]`)?.focus();
};

const startServerDraft = (draft: ServerDraft): void => {
  serverDraft = draft;
  serverDraftError = null;
  pendingDeleteServer = null;
  render();
  serverEditor.scrollIntoView({ block: "nearest" });
  focusDraftField("id");
  serverEditor.querySelector<HTMLInputElement>('[data-field="id"]')?.select();
};

const openEditServer = async (server: ServerView): Promise<void> => {
  if (busy || configBlocked()) return;
  busy = `detail:${server.id}`;
  notice = null;
  render();
  try {
    const detail = parseDetail(
      await request(
        "GET",
        `/servers/detail?id=${encodeURIComponent(server.id)}`,
      ),
    );
    busy = null;
    startServerDraft(
      draftFromDefinition(detail.id || server.id, detail.definition),
    );
    return;
  } catch (error) {
    notice = { text: describeError(error), tone: "error" };
  }
  busy = null;
  render();
};

const closeServerEditor = (): void => {
  if (busy) return;
  serverDraft = null;
  serverDraftError = null;
  render();
  const trigger = actionRoot.querySelector<HTMLButtonElement>("button");
  trigger?.focus();
};

const saveServer = async (): Promise<void> => {
  const draft = serverDraft;
  if (!draft || busy) return;
  const name = draft.name.trim();
  if (!SERVER_ID_PATTERN.test(name)) {
    serverDraftError =
      "Server ID: use letters, numbers, dots, dashes and underscores, starting with a letter or number.";
    render();
    focusDraftField("id");
    return;
  }
  const renaming = Boolean(draft.id) && draft.id !== name;
  if (
    (!draft.id || renaming) &&
    data?.servers.some((server) => server.id === name)
  ) {
    serverDraftError = `A server named "${name}" already exists in the config.`;
    render();
    focusDraftField("id");
    return;
  }
  const built = buildDefinition(draft);
  if (built.error) {
    serverDraftError = built.error;
    render();
    return;
  }
  busy = "save-server";
  serverDraftError = null;
  render();
  try {
    const raw = await request("POST", "/servers/save", {
      id: name,
      ...(draft.id ? { previousId: draft.id } : {}),
      definition: built.definition,
      enabled: draft.enabled,
    });
    const record = asRecord(raw);
    const backupPath =
      typeof record?.backupPath === "string" ? record.backupPath : null;
    data = parseResponse(raw);
    serverDraft = null;
    notice = {
      text: draft.id
        ? `Saved ${name}${backupPath ? `; previous config copied to ${backupPath}` : ""}.`
        : `Added ${name}.`,
      tone: "success",
    };
    void host
      .toast({
        kind: "success",
        message: draft.id ? `Saved ${name}` : `Added ${name}`,
      })
      .catch(() => undefined);
  } catch (error) {
    serverDraftError = describeError(error);
  } finally {
    busy = null;
    render();
  }
};

const renderServerEditor = (): void => {
  serverEditor.replaceChildren();
  if (!serverDraft) return;
  const draft = serverDraft;
  const card = el("section", "mc-group-editor");
  card.setAttribute("aria-label", draft.id ? "Edit server" : "Add server");
  const head = el("div", "mc-section-head");
  head.append(
    el("h2", "mc-section-title", draft.id ? "Edit server" : "Add server"),
    actionButton("Close", closeServerEditor, false, Boolean(busy)),
  );
  card.append(head);

  const idInput = el("input", "mc-input");
  idInput.type = "text";
  idInput.value = draft.name;
  idInput.placeholder = "my-server";
  idInput.autocomplete = "off";
  idInput.spellcheck = false;
  idInput.dataset.field = "id";
  idInput.disabled = Boolean(busy);
  idInput.addEventListener("input", () => {
    if (!serverDraft) return;
    serverDraft.name = idInput.value;
    serverDraftError = null;
  });
  idInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void saveServer();
  });

  const typeRow = el("div", "mc-segment");
  for (const kind of ["local", "remote"] as const) {
    const button = el("button", "mc-inline-button", kind);
    button.type = "button";
    button.dataset.field = `type-${kind}`;
    button.setAttribute(
      "aria-pressed",
      draft.transport === kind ? "true" : "false",
    );
    button.disabled = Boolean(busy);
    button.addEventListener("click", () => {
      if (!serverDraft || serverDraft.transport === kind) return;
      serverDraft.transport = kind;
      serverDraftError = null;
      render();
    });
    typeRow.append(button);
  }

  card.append(
    field("ID", idInput, "The key inside mcp.servers of opencode.json."),
    field("Type", typeRow),
  );

  if (draft.transport === "local") {
    const command = el("input", "mc-input");
    command.type = "text";
    command.value = draft.command;
    command.placeholder = "npx -y @modelcontextprotocol/server-everything";
    command.autocomplete = "off";
    command.spellcheck = false;
    command.dataset.field = "command";
    command.disabled = Boolean(busy);
    command.addEventListener("input", () => {
      if (!serverDraft) return;
      serverDraft.command = command.value;
      serverDraftError = null;
    });

    const cwd = el("input", "mc-input");
    cwd.type = "text";
    cwd.value = draft.cwd;
    cwd.placeholder = "Defaults to where OpenCode runs";
    cwd.autocomplete = "off";
    cwd.spellcheck = false;
    cwd.dataset.field = "cwd";
    cwd.disabled = Boolean(busy);
    cwd.addEventListener("input", () => {
      if (!serverDraft) return;
      serverDraft.cwd = cwd.value;
      serverDraftError = null;
    });

    const environment = el("textarea", "mc-input mc-textarea");
    environment.value = draft.environment;
    environment.placeholder = "LOG_LEVEL=info\nAPI_TOKEN=";
    environment.spellcheck = false;
    environment.dataset.field = "environment";
    environment.disabled = Boolean(busy);
    environment.addEventListener("input", () => {
      if (!serverDraft) return;
      serverDraft.environment = environment.value;
      serverDraftError = null;
    });

    card.append(
      field(
        "Command",
        command,
        "Split on spaces; wrap an argument that contains spaces in double quotes.",
      ),
      field("Working directory", cwd, "Optional."),
      field(
        "Environment",
        environment,
        draft.maskedEnvironment.length > 0
          ? `${MASKED_HINT} ${ENVIRONMENT_HINT}`
          : ENVIRONMENT_HINT,
      ),
    );
  } else {
    const url = el("input", "mc-input");
    url.type = "url";
    url.value = draft.url;
    url.placeholder = "https://example.com/mcp";
    url.autocomplete = "off";
    url.spellcheck = false;
    url.dataset.field = "url";
    url.disabled = Boolean(busy);
    url.addEventListener("input", () => {
      if (!serverDraft) return;
      serverDraft.url = url.value;
      serverDraftError = null;
    });

    const headers = el("textarea", "mc-input mc-textarea");
    headers.value = draft.headers;
    headers.placeholder = "Authorization: Bearer …";
    headers.spellcheck = false;
    headers.dataset.field = "headers";
    headers.disabled = Boolean(busy);
    headers.addEventListener("input", () => {
      if (!serverDraft) return;
      serverDraft.headers = headers.value;
      serverDraftError = null;
    });

    card.append(
      field("URL", url, "The MCP endpoint, starting with http:// or https://."),
      field(
        "Headers",
        headers,
        draft.maskedHeaders.length > 0
          ? `${MASKED_HINT} ${HEADERS_HINT}`
          : HEADERS_HINT,
      ),
    );
  }

  const enabledRow = el("label", "mc-check");
  const enabledInput = el("input");
  enabledInput.type = "checkbox";
  enabledInput.checked = draft.enabled;
  enabledInput.dataset.field = "enabled";
  enabledInput.disabled = Boolean(busy);
  enabledInput.addEventListener("change", () => {
    if (!serverDraft) return;
    serverDraft.enabled = enabledInput.checked;
  });
  const enabledCopy = el("span", "mc-check-copy");
  enabledCopy.append(el("span", "mc-check-name", "Enabled"));
  enabledRow.append(enabledInput, enabledCopy);
  card.append(enabledRow);

  if (serverDraftError) {
    const error = el("p", "mc-editor-error", serverDraftError);
    error.setAttribute("role", "alert");
    card.append(error);
  }

  const actions = el("div", "mc-editor-actions");
  actions.append(
    actionButton("Cancel", closeServerEditor, false, Boolean(busy)),
    actionButton(
      draft.id ? "Save changes" : "Add server",
      () => void saveServer(),
      true,
      Boolean(busy),
    ),
  );
  card.append(actions);
  card.append(
    el(
      "p",
      "mc-editor-hint",
      "Only this server definition is written. Secrets already in opencode.json are kept when the field is left blank; a new value replaces them.",
    ),
  );
  serverEditor.append(card);
};

const failureHeadline = (failure: ServerFailureView): string => {
  switch (failure.message) {
    case "mcp http authentication rejected":
      return "OpenCode reached the endpoint but it rejected the credentials.";
    case "mcp oauth authorization failed":
      return "OpenCode could not complete the OAuth flow.";
    default:
      return "OpenCode could not start this server.";
  }
};

const failureTime = (value: string): string => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString();
};

/** Native disclosure: no state to track, keyboard accessible, no JS. */
const failureDetails = (failure: ServerFailureView): HTMLElement => {
  const details = el("details", "mc-failure");
  const summary = el("summary", "mc-failure-summary", "Why did it fail?");
  const body = el("div", "mc-failure-body");
  body.append(el("p", "mc-failure-lead", failureHeadline(failure)));
  if (failure.detail) body.append(el("pre", "mc-failure-detail", failure.detail));
  const meta = el("p", "mc-failure-meta");
  meta.textContent = [
    failure.at ? `Last attempt ${failureTime(failure.at)}` : null,
    failure.directory ? `from ${failure.directory}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  if (meta.textContent) body.append(meta);
  details.append(summary, body);
  return details;
};

const serverAction = (server: ServerView): HTMLElement => {
  const holder = el("div", "mc-server-action");
  const note = el("span", "mc-action-note");
  const blocked = configBlocked();

  if (server.state === "conflict") {
    note.textContent = `Defined in ${server.targets.length || 2} places`;
    const button = el("button", "mc-inline-button", "Resolve");
    button.type = "button";
    button.disabled = Boolean(busy) || blocked;
    button.addEventListener("click", () => {
      conflictRoot.scrollIntoView({ block: "nearest" });
      conflictRoot.querySelector<HTMLButtonElement>("button")?.focus();
    });
    holder.append(note, button);
  } else if (server.state === "invalid") {
    note.textContent = "Definition is invalid";
    const button = el("button", "mc-inline-button", "Edit definition");
    button.type = "button";
    button.disabled = Boolean(busy) || blocked;
    button.addEventListener("click", () => void openEditServer(server));
    holder.append(note, button);
  } else {
    const checked = server.state === "enabled";
    const control = el("button", "mc-switch");
    control.type = "button";
    control.setAttribute("role", "switch");
    control.setAttribute("aria-checked", checked ? "true" : "false");
    control.setAttribute(
      "aria-label",
      `${checked ? "Disable" : "Enable"} ${server.id}`,
    );
    control.dataset.serverId = server.id;
    control.disabled = Boolean(busy) || blocked;
    control.append(el("span", "mc-thumb"));
    control.addEventListener("click", () => {
      if (control.disabled) return;
      void toggleServer(server, !checked);
    });
    if (checked)
      note.textContent = blocked
        ? "Config cannot be read"
        : server.failure
          ? "Failed to load"
          : server.advertised
            ? "Visible to model"
            : "No tools enabled";
    else note.textContent = blocked ? "Config cannot be read" : "Disabled";
    holder.append(note, control);
  }

  const rowActions = el("div", "mc-mini-actions");
  if (server.state !== "invalid" && server.state !== "conflict") {
    const edit = el("button", "mc-inline-button", "Edit");
    edit.type = "button";
    edit.disabled = Boolean(busy) || blocked;
    edit.addEventListener("click", () => void openEditServer(server));
    rowActions.append(edit);
  }
  const remove = el("button", "mc-inline-button", "Delete");
  remove.type = "button";
  remove.disabled = Boolean(busy) || blocked;
  remove.addEventListener("click", () => requestDeleteServer(server.id));
  rowActions.append(remove);
  holder.append(rowActions);
  return holder;
};

const renderServer = (server: ServerView): HTMLElement => {
  const row = el("article", "mc-server");
  row.dataset.state = server.state;
  row.setAttribute("role", "listitem");
  const main = el("div", "mc-server-main");
  const head = el("div", "mc-server-head");
  head.append(
    el("strong", "mc-name mc-mono", server.id),
    badge(stateText(server), toneForState(server)),
    badge(
      server.transport === "unknown" ? "unknown" : server.transport,
      "neutral",
    ),
  );
  if (server.enabled && server.failure) head.append(badge("failed", "error"));

  const meta = el("div", "mc-meta");
  if (server.container === "legacy")
    meta.append(el("span", "mc-stat", "deprecated entry"));
  if (server.environmentKeys.length > 0)
    meta.append(el("span", "mc-stat", `env ${server.environmentKeys.length}`));
  if (server.headerKeys.length > 0)
    meta.append(el("span", "mc-stat", `headers ${server.headerKeys.length}`));
  if (server.timeout !== null)
    meta.append(el("span", "mc-stat", `timeout ${server.timeout}`));
  if (server.codemode) meta.append(el("span", "mc-stat", "codemode"));
  if (server.protocol !== null)
    meta.append(el("span", "mc-stat", `protocol ${server.protocol}`));

  const target =
    server.transport === "remote"
      ? (server.url ?? "No URL")
      : server.command.length > 0
        ? server.command.join(" ")
        : server.state === "invalid"
          ? "Definition is invalid"
          : "No command";
  const description = el("p", "mc-desc mc-cmd", target);

  main.append(head);
  if (meta.childElementCount > 0) main.append(meta);
  main.append(description);
  if (server.warnings.length > 0) {
    main.append(el("p", "mc-warn", server.warnings.slice(0, 2).join(" · ")));
  }
  if (server.enabled && server.failure) main.append(failureDetails(server.failure));
  row.append(main, serverAction(server));
  return row;
};

const renderList = (): void => {
  listRoot.replaceChildren();
  if (!data) return;
  const group = selectedGroup
    ? groups.find((item) => item.id === selectedGroup)
    : null;
  const base = group
    ? group.serverIds
        .map((id) => data?.servers.find((server) => server.id === id))
        .filter((server): server is ServerView => Boolean(server))
    : data.servers;
  const servers = base.filter((server) => {
    if (!query) return true;
    const haystack = [
      server.id,
      ...server.command,
      server.url ?? "",
      ...server.environmentKeys,
      ...server.headerKeys,
      ...server.warnings,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
  if (servers.length === 0) {
    const empty = el("div", "mc-empty");
    empty.append(
      el(
        "h2",
        "",
        data.servers.length === 0
          ? "No MCP servers configured"
          : group
            ? "This group has no available servers"
            : "No matching servers",
      ),
      el(
        "p",
        "",
        data.servers.length === 0
          ? "Nothing under mcp.servers in ~/.config/opencode/opencode.json yet."
          : group
            ? "Check whether the servers in this group were removed."
            : "Try a different search term.",
      ),
    );
    listRoot.append(empty);
    return;
  }
  for (const server of servers) listRoot.append(renderServer(server));
};

const render = (): void => {
  app.setAttribute("aria-busy", loading ? "true" : "false");
  titleCount.textContent = data
    ? `- ${data.summary.enabled} / ${data.summary.total} enabled`
    : "";
  renderNotice();
  renderGroupsNote();
  renderGroups();
  renderGroupEditor();
  renderServerEditor();
  renderGroupBar();
  renderConflicts();
  renderList();
  refresh.update({
    label: loading ? "Reading…" : "Rescan",
    loading,
    disabled: loading || Boolean(busy),
  });
  const blocked = configBlocked();
  enableAll.update({ disabled: loading || Boolean(busy) || !data || blocked });
  disableAll.update({ disabled: loading || Boolean(busy) || !data || blocked });
};

const focusServer = (id: string): void => {
  const target = Array.from(
    document.querySelectorAll<HTMLElement>("[data-server-id]"),
  ).find((node) => node.dataset.serverId === id);
  target?.focus();
};

const loadServers = async (
  showLoading = false,
  silent = false,
): Promise<void> => {
  if (loading) return;
  loading = true;
  if (!silent) loadError = null;
  if (showLoading) render();
  try {
    data = parseResponse(await request("GET", "/servers"));
    loadError = null;
  } catch (error) {
    if (!silent) loadError = describeError(error);
  } finally {
    loading = false;
    render();
  }
};

const reloadGroups = async (force = false): Promise<void> => {
  if ((groupsLoading && !force) || groupDraft) return;
  groupsLoading = true;
  render();
  try {
    groups = parseGroups(await request("GET", "/groups"));
    groupsError = null;
    if (selectedGroup && !groups.some((group) => group.id === selectedGroup))
      selectedGroup = null;
  } catch (error) {
    groupsError = describeGroupsError(error);
  } finally {
    groupsLoading = false;
    render();
  }
};

const loadAll = async (showLoading = false): Promise<void> => {
  if (loading) return;
  loading = true;
  if (showLoading) render();
  try {
    data = parseResponse(await request("GET", "/servers"));
    loadError = null;
  } catch (error) {
    loadError = describeError(error);
  }
  loading = false;
  render();
};

const toggleServer = async (
  server: ServerView,
  enabled: boolean,
): Promise<void> => {
  if (busy) return;
  busy = `toggle:${server.id}`;
  pendingBulk = null;
  pendingOnlyGroup = null;
  pendingDeleteServer = null;
  notice = null;
  render();
  try {
    data = parseResponse(
      await request("POST", "/servers/toggle", { id: server.id, enabled }),
    );
    notice = {
      text: enabled
        ? `Enabled ${server.id}.`
        : `Disabled ${server.id}; OpenCode will drop its tools after the next config reload.`,
      tone: "success",
    };
    void host
      .toast({
        kind: "success",
        message: enabled ? `Enabled ${server.id}` : `Disabled ${server.id}`,
      })
      .catch(() => undefined);
  } catch (error) {
    notice = { text: describeError(error), tone: "error" };
    busy = null;
    render();
    void loadServers(false, true);
    return;
  }
  busy = null;
  render();
  focusServer(server.id);
};

const requestDeleteServer = (id: string): void => {
  if (busy) return;
  pendingDeleteServer = id;
  pendingBulk = null;
  pendingOnlyGroup = null;
  notice = null;
  render();
  noticeRoot.scrollIntoView({ block: "nearest" });
  noticeRoot.querySelector<HTMLButtonElement>("button")?.focus();
};

const removeServer = async (id: string): Promise<void> => {
  if (busy) return;
  pendingDeleteServer = null;
  busy = `remove:${id}`;
  notice = null;
  render();
  try {
    const raw = await request("POST", "/servers/remove", { id });
    const record = asRecord(raw);
    const removedPaths = stringArray(record?.removedPaths);
    data = parseResponse(raw);
    if (serverDraft?.id === id) {
      serverDraft = null;
      serverDraftError = null;
    }
    notice = {
      text: `Removed ${id}${removedPaths.length > 1 ? ` from ${removedPaths.length} config files` : " from opencode.json"}.`,
      tone: "success",
    };
    void host
      .toast({ kind: "success", message: `Removed ${id}` })
      .catch(() => undefined);
  } catch (error) {
    notice = { text: describeError(error), tone: "error" };
    busy = null;
    render();
    void loadServers(false, true);
    return;
  }
  busy = null;
  render();
};

const resolveConflict = async (
  conflict: ConflictView,
  keepTarget: string,
): Promise<void> => {
  if (busy) return;
  if (!conflict.serverId || !keepTarget) return;
  busy = `resolve:${conflict.serverId}`;
  notice = null;
  render();
  try {
    const raw = await request("POST", "/servers/resolve", {
      id: conflict.serverId,
      keep: keepTarget,
    });
    const record = asRecord(raw);
    const backupPath =
      typeof record?.backupPath === "string" ? record.backupPath : null;
    data = parseResponse(raw);
    notice = {
      text: `Kept the definition in ${keepTarget.split("#")[0] ?? keepTarget}${backupPath ? `; previous content copied to ${backupPath}` : ""}.`,
      tone: "success",
    };
    void host
      .toast({ kind: "success", message: "Config conflict resolved" })
      .catch(() => undefined);
  } catch (error) {
    notice = { text: describeError(error), tone: "error" };
    busy = null;
    render();
    void loadServers(false, true);
    return;
  }
  busy = null;
  render();
};

const requestBulk = (enabled: boolean): void => {
  if (!data || busy) return;
  pendingBulk = enabled;
  pendingOnlyGroup = null;
  pendingDeleteServer = null;
  notice = null;
  render();
  noticeRoot.scrollIntoView({ block: "nearest" });
  noticeRoot.querySelector<HTMLButtonElement>("button")?.focus();
};

const applyBulk = async (): Promise<void> => {
  if (pendingBulk === null || busy) return;
  const enabled = pendingBulk;
  pendingBulk = null;
  pendingOnlyGroup = null;
  busy = "bulk";
  notice = null;
  render();
  try {
    const raw = await request("POST", "/servers/bulk", { enabled });
    const record = asRecord(raw);
    const changed = stringArray(record?.changed);
    data = parseResponse(raw);
    notice = {
      text: `${changed.length} server${changed.length === 1 ? "" : "s"} ${enabled ? "enabled" : "disabled"}.`,
      tone: "success",
    };
    void host
      .toast({
        kind: "success",
        message: `${changed.length} servers ${enabled ? "enabled" : "disabled"}`,
      })
      .catch(() => undefined);
  } catch (error) {
    notice = { text: describeError(error), tone: "error" };
    busy = null;
    render();
    void loadServers(false, true);
    return;
  }
  busy = null;
  render();
};

host.onReady((context) => {
  applyHostReady(context, document.documentElement);
  document.documentElement.lang = "en";
  if (initialized) {
    render();
    return;
  }
  initialized = true;
  void loadAll(true);
  void reloadGroups(true);
});

render();
