const params = new URLSearchParams(location.search);
let dark = params.get("theme") === "dark";
let width = Number(params.get("width") || 400);
let mode = params.get("state") || "clean";
let resolved = false;

const configPath = (name) => `~/.config/opencode/${name}`;
const primary = configPath("opencode.json");
const alternate = configPath("opencode.jsonc");

const baseServers = () => ({
  filesystem: {
    definition: {
      type: "local",
      command: [
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/you/projects",
      ],
      environment: { LOG_LEVEL: "info" },
      enabled: true,
    },
    enabled: true,
    paths: [primary],
  },
  github: {
    definition: {
      type: "remote",
      url: "https://api.githubcopilot.com/mcp/",
      headers: { Authorization: "Bearer ghp_example_value" },
      enabled: true,
    },
    enabled: true,
    paths: [primary],
  },
  playwright: {
    definition: {
      type: "local",
      command: ["npx", "-y", "@playwright/mcp@latest"],
      timeout: 20000,
      enabled: false,
    },
    enabled: false,
    paths: [primary],
  },
  sentry: {
    definition: {
      type: "remote",
      url: "https://mcp.sentry.dev/mcp",
      headers: {
        Authorization: "Bearer sntry_example_value",
        "X-Org": "example",
      },
      enabled: true,
    },
    enabled: true,
    paths: [primary],
  },
  context7: {
    definition: {
      type: "remote",
      url: "https://mcp.context7.com/mcp",
      enabled: true,
    },
    enabled: true,
    paths: [primary],
  },
  postgres: {
    definition: {
      type: "local",
      command: [
        "npx",
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost/app",
      ],
      environment: { DATABASE_URL: "postgresql://localhost/app" },
      enabled: false,
    },
    enabled: false,
    paths: [primary],
  },
});

const defaultGroups = [
  { id: "web", name: "Web", serverIds: ["playwright", "context7"] },
  {
    id: "remote",
    name: "Remote APIs",
    serverIds: ["github", "sentry", "context7"],
  },
  { id: "local", name: "Local files", serverIds: ["filesystem", "postgres"] },
];

let servers = baseServers();
let groups = defaultGroups.map((group) => ({
  ...group,
  serverIds: [...group.serverIds],
}));

const reset = (nextMode) => {
  mode = nextMode;
  resolved = false;
  servers = baseServers();
  groups = defaultGroups.map((group) => ({
    ...group,
    serverIds: [...group.serverIds],
  }));
  if (mode === "conflict" && !resolved) {
    servers.delta = {
      definition: {
        type: "local",
        command: ["npx", "-y", "delta-mcp"],
        enabled: true,
      },
      enabled: true,
      paths: [primary, alternate],
      conflicts: [
        {
          kind: "both",
          serverId: "delta",
          message:
            "The same server is defined in opencode.json and opencode.jsonc; only one definition can be used.",
          paths: [primary, alternate],
          blocking: true,
        },
      ],
    };
    servers.broken = {
      definition: { type: "local" },
      enabled: true,
      paths: [primary],
      invalid: true,
      warnings: ["The definition has no command and is skipped."],
    };
  }
};

const formatTimeout = (value) => {
  if (typeof value === "number") return `${value % 1000 === 0 ? value / 1000 : value}${value % 1000 === 0 ? "s" : "ms"}`;
  if (value && typeof value === "object") {
    const parts = Object.entries(value).map(([key, ms]) => `${key} ${ms % 1000 === 0 ? ms / 1000 : ms}${ms % 1000 === 0 ? "s" : "ms"}`);
    return parts.length > 0 ? parts.join(" · ") : null;
  }
  return null;
};

const view = (id, entry) => {
  const definition = entry.definition;
  const transport = definition.type === "remote" ? "remote" : "local";
  const command = Array.isArray(definition.command) ? definition.command : [];
  const environment =
    definition.environment && typeof definition.environment === "object"
      ? Object.keys(definition.environment)
      : [];
  const headers =
    definition.headers && typeof definition.headers === "object"
      ? Object.keys(definition.headers)
      : [];
  const state = entry.invalid
    ? "invalid"
    : entry.conflicts && entry.conflicts.length > 0
      ? "conflict"
      : entry.enabled
        ? "enabled"
        : "disabled";
  return {
    id,
    container: entry.container ?? "servers",
    transport: entry.invalid ? "unknown" : transport,
    command,
    url: transport === "remote" ? String(definition.url || "") : null,
    cwd: typeof definition.cwd === "string" ? definition.cwd : null,
    environmentKeys: environment,
    headerKeys: headers,
    timeout: formatTimeout(definition.timeout),
    codemode: definition.codemode === true,
    protocol: typeof definition.protocol === "string" ? definition.protocol : null,
    oauth: headers.some((key) => /authorization/i.test(key))
      ? "configured"
      : "none",
    enabled: Boolean(entry.enabled),
    state,
    advertised: state === "enabled",
    toolsOff: [],
    paths: entry.paths ?? [primary],
    targets: (entry.paths ?? [primary]).map(
      (file) => `${file}#${entry.container ?? "servers"}`,
    ),
    conflicts: entry.conflicts ?? [],
    warnings: entry.warnings ?? [],
    contentHash: `${id}-hash`,
  };
};

const buildData = () => {
  const list = Object.entries(servers).map(([id, entry]) => view(id, entry));
  const conflicts = list.flatMap((server) => server.conflicts);
  const blocking = conflicts.filter((conflict) => conflict.blocking).length;
  return {
    servers: list,
    conflicts,
    summary: {
      total: list.length,
      advertised: list.filter((server) => server.advertised).length,
      enabled: list.filter((server) => server.state === "enabled").length,
      disabled: list.filter((server) => server.state === "disabled").length,
      invalid: list.filter((server) => server.state === "invalid" || server.state === "conflict").length,
      legacy: list.filter((server) => server.container === "legacy").length,
      blockingConflicts: blocking,
      warnings: conflicts.length - blocking,
    },
    config: { path: primary, exists: true, error: null },
    scanned: [
      { path: primary, exists: true, error: null },
      {
        path: alternate,
        exists: mode === "conflict" && !resolved,
        error: null,
      },
    ],
    scannedAt: Date.now(),
  };
};

const mask = (definition) => {
  const maskedPaths = [];
  const copy = { ...definition };
  const hide = (section) => {
    const value = definition[section];
    if (!value || typeof value !== "object") return;
    const next = {};
    for (const key of Object.keys(value)) {
      next[key] = "";
      maskedPaths.push(`${section}.${key}`);
    }
    copy[section] = next;
  };
  hide("environment");
  hide("headers");
  return { definition: copy, maskedPaths };
};

const draftsFrom = (value) => {
  if (!value || typeof value !== "object") return [];
  if (value.mcp && typeof value.mcp === "object") {
    return Object.entries(value.mcp).map(([id, definition]) => ({
      id,
      definition,
      enabled: !definition || definition.enabled !== false,
    }));
  }
  if (value.type === "local" || value.type === "remote") {
    return [
      {
        id: "pasted-server",
        definition: value,
        enabled: value.enabled !== false,
      },
    ];
  }
  return [];
};

const frame = document.querySelector("iframe");
const audit = document.querySelector("#audit");
const buttons = {
  clean: document.querySelector("#clean"),
  conflict: document.querySelector("#conflict"),
};

const tokens = (isDark) => ({
  background: isDark ? "#20201e" : "#faf9f7",
  elevated: isDark ? "#282724" : "#f2f1ee",
  foreground: isDark ? "#dedbd3" : "#484744",
  muted: isDark ? "#a7a39b" : "#77736c",
  subtle: isDark ? "#817d76" : "#a29e98",
  border: isDark ? "#3c3a35" : "#e3e0db",
  hover: isDark ? "#ffffff0a" : "#00000005",
  selection: isDark ? "#4a3327" : "#f2e6dc",
  focus: "#b07750",
  primary: isDark ? "#d59a6f" : "#a4663b",
  mutedSurface: isDark ? "#272622" : "#f1efec",
  elevatedForeground: isDark ? "#dedbd3" : "#484744",
  active: isDark ? "#ffffff12" : "#00000009",
  selectionForeground: isDark ? "#f2d4bc" : "#724324",
  primaryForeground: "#ffffff",
  primaryText: isDark ? "#e3b18c" : "#965421",
  successText: isDark ? "#a0b48c" : "#4f6a3b",
  warningText: isDark ? "#d6b774" : "#8b6322",
  errorText: isDark ? "#e39b8b" : "#b34635",
  infoText: isDark ? "#9eb4c9" : "#496d88",
  success: "#759862",
  warning: "#c3944d",
  error: "#ce6a55",
  info: "#6995bb",
  font: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  mono: "ui-monospace,SFMono-Regular,monospace",
  radius: "7px",
});

const ready = () => {
  frame.contentWindow?.postMessage(
    {
      channel: "openchamber.sdk",
      v: 1,
      type: "ready",
      payload: {
        theme: { mode: dark ? "dark" : "light", tokens: tokens(dark) },
        locale: "en",
        directory: null,
        session: null,
        surface: "panel",
        connection: { connected: true, account: "fixture" },
        settings: {},
        item: null,
      },
    },
    "*",
  );
};

const send = (target, id, payload) =>
  target.postMessage(
    { channel: "openchamber.sdk", v: 1, type: "result", id, ok: true, payload },
    "*",
  );
const reply = (target, id, status, body) =>
  send(target, id, { status, body: JSON.stringify(body) });

window.addEventListener("message", (event) => {
  const message = event.data;
  if (
    event.source !== frame.contentWindow ||
    message?.channel !== "openchamber.sdk"
  )
    return;
  if (message.type === "hello") {
    ready();
    return;
  }
  if (message.type !== "service-request") {
    send(event.source, message.id, {});
    return;
  }
  const { method, path, body } = message.payload;
  const input = body ? JSON.parse(body) : {};

  if (method === "GET" && path === "/servers") {
    reply(event.source, message.id, 200, buildData());
    return;
  }
  if (method === "GET" && path === "/groups") {
    reply(event.source, message.id, 200, { version: 1, groups });
    return;
  }
  if (method === "POST" && path === "/groups") {
    if (!input || input.version !== 1 || !Array.isArray(input.groups)) {
      reply(event.source, message.id, 400, {
        error: "Invalid group configuration format.",
        code: "invalid-groups",
      });
      return;
    }
    groups = input.groups;
    reply(event.source, message.id, 200, { version: 1, groups });
    return;
  }
  if (method === "GET" && path.startsWith("/servers/detail")) {
    const id = new URLSearchParams(path.split("?")[1] ?? "").get("id") ?? "";
    const entry = servers[id];
    if (!entry) {
      reply(event.source, message.id, 404, {
        error: `No server named ${id} in the config.`,
        code: "not-found",
      });
      return;
    }
    reply(event.source, message.id, 200, {
      id,
      paths: entry.paths ?? [primary],
      ...mask(entry.definition),
    });
    return;
  }
  if (method === "POST" && path === "/servers/toggle") {
    const entry = servers[input.id];
    if (!entry) {
      reply(event.source, message.id, 404, {
        error: "Server not found",
        code: "not-found",
      });
      return;
    }
    const current = view(input.id, entry);
    if (current.state === "conflict" || current.state === "invalid") {
      reply(event.source, message.id, 409, {
        error: "Fix the definition before toggling it.",
        code: "conflict",
        conflicts: current.conflicts,
      });
      return;
    }
    servers[input.id] = { ...entry, enabled: Boolean(input.enabled) };
    reply(event.source, message.id, 200, buildData());
    return;
  }
  if (method === "POST" && path === "/servers/bulk") {
    const ids = Object.keys(servers);
    for (const id of ids)
      servers[id] = { ...servers[id], enabled: Boolean(input.enabled) };
    resolved = true;
    reply(event.source, message.id, 200, { ...buildData(), changed: ids });
    return;
  }
  if (method === "POST" && path === "/servers/batch") {
    const enable = Array.isArray(input.enable) ? input.enable : [];
    const disable = Array.isArray(input.disable) ? input.disable : [];
    for (const id of enable)
      if (servers[id]) servers[id] = { ...servers[id], enabled: true };
    for (const id of disable)
      if (servers[id]) servers[id] = { ...servers[id], enabled: false };
    resolved = true;
    reply(event.source, message.id, 200, {
      ...buildData(),
      changed: [...new Set([...enable, ...disable])],
    });
    return;
  }
  if (method === "POST" && path === "/servers/save") {
    const id = String(input.id ?? "").trim();
    if (!id || !input.definition || typeof input.definition !== "object") {
      reply(event.source, message.id, 400, {
        error: "A server needs an ID and a definition.",
        code: "invalid",
      });
      return;
    }
    if (input.previousId && input.previousId !== id)
      delete servers[input.previousId];
    servers[id] = {
      definition: input.definition,
      enabled: input.enabled !== false,
      paths: [primary],
    };
    reply(event.source, message.id, 200, {
      ...buildData(),
      id,
      backupPath: `${primary}.mcp-manager.bak`,
    });
    return;
  }
  if (method === "POST" && path === "/servers/remove") {
    const id = String(input.id ?? "");
    const entry = servers[id];
    if (!entry) {
      reply(event.source, message.id, 404, {
        error: "Server not found",
        code: "not-found",
      });
      return;
    }
    const removedPaths = entry.paths ?? [primary];
    delete servers[id];
    reply(event.source, message.id, 200, { ...buildData(), id, removedPaths });
    return;
  }
  if (method === "POST" && path === "/servers/import") {
    let drafts = [];
    let source = "pasted manifest";
    if (input.kind === "paste") {
      try {
        drafts = draftsFrom(JSON.parse(String(input.value ?? "")));
      } catch {
        reply(event.source, message.id, 400, {
          error: "The pasted manifest is not valid JSON.",
          code: "invalid-json",
        });
        return;
      }
      if (drafts.length === 0) {
        reply(event.source, message.id, 400, {
          error: "No server found in the pasted manifest.",
          code: "no-servers",
        });
        return;
      }
    } else if (input.kind === "url") {
      source = String(input.value ?? "");
      drafts = [
        {
          id: "imported-remote",
          definition: {
            type: "remote",
            url: "https://mcp.example.com/sse",
            headers: { Authorization: "Bearer example" },
            enabled: true,
          },
          enabled: true,
        },
      ];
    } else {
      source = String(input.value ?? "");
      drafts = [
        {
          id: "imported-local",
          definition: {
            type: "local",
            command: ["npx", "-y", "example-mcp"],
            enabled: true,
          },
          enabled: true,
        },
      ];
    }
    reply(event.source, message.id, 200, {
      drafts,
      existing: Object.keys(servers),
      source,
    });
    return;
  }
  if (method === "POST" && path === "/servers/resolve") {
    const id = String(input.id ?? "");
    const entry = servers[id];
    if (!entry || !input.keep) {
      reply(event.source, message.id, 404, {
        error: "Conflict not found",
        code: "not-found",
      });
      return;
    }
    resolved = true;
    servers[id] = { ...entry, conflicts: [], paths: [String(input.keep)] };
    reply(event.source, message.id, 200, {
      ...buildData(),
      backupPath: `${primary}.mcp-manager.bak`,
    });
    return;
  }
  reply(event.source, message.id, 404, {
    error: "not-found",
    code: "not-found",
  });
});

const paint = () => {
  document.body.classList.toggle("dark", dark);
  document.documentElement.style.setProperty("--width", `${width}px`);
  buttons.clean.setAttribute(
    "aria-pressed",
    mode === "clean" ? "true" : "false",
  );
  buttons.conflict.setAttribute(
    "aria-pressed",
    mode === "conflict" ? "true" : "false",
  );
  const counts = Object.entries(servers).map(([id, entry]) => view(id, entry));
  audit.textContent = `mode=${mode} · ${counts.length} servers · ${counts.filter((server) => server.state === "enabled").length} enabled`;
};
const show = () => {
  frame.src = `/panel/index.html?state=${encodeURIComponent(mode)}&t=${Date.now()}`;
  paint();
};

document.querySelector("#theme").onclick = () => {
  dark = !dark;
  paint();
  ready();
};
document.querySelector("#narrow").onclick = () => {
  width = width === 280 ? 400 : 280;
  paint();
};
buttons.clean.onclick = () => {
  reset("clean");
  show();
};
buttons.conflict.onclick = () => {
  reset("conflict");
  show();
};
document.querySelector("#group").onclick = () => {
  const doc = frame.contentDocument;
  const chip = doc?.querySelector('[data-group="local"]');
  if (chip && chip.getClientRects().length > 0) {
    chip.click();
    return;
  }
  doc?.querySelector(".oc-sdk-trigger")?.click();
  setTimeout(() => {
    const option = [...(doc?.querySelectorAll(".oc-sdk-option") ?? [])].find(
      (node) => node.textContent?.includes("Local files"),
    );
    option?.click();
  }, 50);
};
document.querySelector("#edit-groups").onclick = () => {
  frame.contentDocument?.querySelector(".mc-groups-edit")?.click();
};
document.querySelector("#add-server").onclick = () => {
  const doc = frame.contentDocument;
  const button = [...(doc?.querySelectorAll("button") ?? [])].find(
    (node) => node.textContent === "Add server",
  );
  if (!button) {
    audit.textContent = "Add test failed: header button not found";
    return;
  }
  button.click();
  setTimeout(() => {
    audit.textContent = `Editor: ${doc?.querySelector(".mc-group-editor .mc-section-title")?.textContent ?? "missing"}`;
  }, 80);
};
document.querySelector("#install").onclick = () => {
  const doc = frame.contentDocument;
  const details = doc?.querySelector(".mc-install");
  if (!details) {
    audit.textContent = "Install test failed: panel not found";
    return;
  }
  details.open = true;
  const paste = doc?.querySelector('[data-field="paste"]');
  if (!paste) {
    audit.textContent = "Install test failed: paste field not found";
    return;
  }
  paste.value = JSON.stringify({
    mcp: {
      "fixture-import": { type: "local", command: ["npx", "-y", "fixture-mcp"], environment: { TOKEN: "hidden" } },
      github: { type: "remote", url: "https://api.githubcopilot.com/mcp/" },
    },
  });
  paste.dispatchEvent(new Event("input", { bubbles: true }));
  const importButton = [...(doc?.querySelectorAll(".mc-install button") ?? [])].find(
    (node) => node.textContent === "Import",
  );
  importButton?.click();
  setTimeout(() => {
    const drafts = doc?.querySelectorAll(".mc-install-draft").length ?? 0;
    audit.textContent = `Install preview: ${drafts} draft(s) from the pasted manifest`;
    doc?.querySelector(".mc-install")?.scrollIntoView({ block: "start" });
  }, 200);
};
document.querySelector("#reload").onclick = show;

paint();
show();
