// src/service/main.ts
import http from "node:http";
import os from "node:os";

// src/core/groups.ts
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// src/shared/groups.ts
var GROUP_LIMIT = 50;
var GROUP_NAME_MAX = 40;
var GROUP_MEMBER_LIMIT = 200;
var GROUP_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
var RESERVED_GROUP_IDS = /* @__PURE__ */ new Set(["all", "new"]);
var GroupFileError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "GroupFileError";
  }
};
var DEFAULT_SERVER_GROUPS = [];
var cloneDefaultGroups = () => DEFAULT_SERVER_GROUPS.map((group) => ({ ...group, serverIds: [...group.serverIds] }));
var normalizeGroupsFile = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GroupFileError("Invalid group config format");
  }
  const record = value;
  if (record.version !== 1) throw new GroupFileError("Unsupported group config version");
  if (!Array.isArray(record.groups)) throw new GroupFileError("Invalid group list format");
  if (record.groups.length > GROUP_LIMIT) throw new GroupFileError(`Cannot have more than ${GROUP_LIMIT} groups`);
  const groups = [];
  const groupIds = /* @__PURE__ */ new Set();
  const names = /* @__PURE__ */ new Set();
  for (const [index, item] of record.groups.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new GroupFileError(`Group ${index + 1} has an invalid format`);
    }
    const group = item;
    if (typeof group.id !== "string" || !GROUP_ID_PATTERN.test(group.id) || RESERVED_GROUP_IDS.has(group.id)) {
      throw new GroupFileError(`Group ${index + 1} has an invalid ID`);
    }
    if (groupIds.has(group.id)) throw new GroupFileError(`Duplicate group ID: ${group.id}`);
    const name = typeof group.name === "string" ? group.name.trim() : "";
    if (!name || name.length > GROUP_NAME_MAX || /[\u0000-\u001f\u007f]/.test(name)) {
      throw new GroupFileError(`Group ${index + 1} name must be 1-${GROUP_NAME_MAX} characters`);
    }
    const nameKey = name.toLowerCase();
    if (names.has(nameKey)) throw new GroupFileError(`Duplicate group name: ${name}`);
    if (!Array.isArray(group.serverIds)) throw new GroupFileError(`Group "${name}" has an invalid member format`);
    if (group.serverIds.length > GROUP_MEMBER_LIMIT) {
      throw new GroupFileError(`Group "${name}" cannot have more than ${GROUP_MEMBER_LIMIT} members`);
    }
    const serverIds = [];
    const seen = /* @__PURE__ */ new Set();
    for (const serverId of group.serverIds) {
      if (typeof serverId !== "string" || !serverId || serverId.length > 128) {
        throw new GroupFileError(`Group "${name}" contains an invalid server ID`);
      }
      if (seen.has(serverId)) continue;
      seen.add(serverId);
      serverIds.push(serverId);
    }
    groupIds.add(group.id);
    names.add(nameKey);
    groups.push({ id: group.id, name, serverIds });
  }
  return { version: 1, groups };
};

// src/core/groups.ts
var DATA_DIR = [".config", "openchamber", "mcp-manager"];
var GROUPS_FILE = "groups.json";
var GroupError = class extends Error {
  code;
  status;
  constructor(code, status, message) {
    super(message);
    this.name = "GroupError";
    this.code = code;
    this.status = status;
  }
};
var defaults = () => ({ version: 1, groups: cloneDefaultGroups() });
var groupsFile = (home) => path.join(home, ...DATA_DIR, GROUPS_FILE);
var readGroups = async (home) => {
  let raw;
  try {
    raw = await fs.readFile(groupsFile(home), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return defaults();
    throw new GroupError("read-error", 500, "Cannot read group config, check file permissions");
  }
  try {
    return normalizeGroupsFile(JSON.parse(raw));
  } catch {
    throw new GroupError(
      "invalid-groups",
      500,
      "Group config file is corrupt; the original file was not modified (~/.config/openchamber/mcp-manager/groups.json)"
    );
  }
};
var writeGroups = async (home, value) => {
  let normalized;
  try {
    normalized = normalizeGroupsFile(value);
  } catch (error) {
    if (error instanceof GroupFileError) throw new GroupError("invalid-groups", 400, error.message);
    throw new GroupError("invalid-groups", 400, "Group config format is invalid");
  }
  const dir = path.join(home, ...DATA_DIR);
  const file = groupsFile(home);
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await fs.mkdir(dir, { recursive: true, mode: 448 });
    await fs.writeFile(temporary, `${JSON.stringify(normalized, null, 2)}
`, { encoding: "utf8", mode: 384 });
    await fs.rename(temporary, file);
    return await readGroups(home);
  } catch (error) {
    try {
      await fs.unlink(temporary);
    } catch {
    }
    if (error instanceof GroupError) throw error;
    throw new GroupError("write-error", 500, "Failed to save group config, check directory permissions");
  }
};

// src/core/errors.ts
var McpError = class extends Error {
  code;
  status;
  conflicts;
  constructor(code, status, message, conflicts) {
    super(message);
    this.name = "McpError";
    this.code = code;
    this.status = status;
    this.conflicts = conflicts;
  }
};

// src/core/servers.ts
import fs4 from "node:fs/promises";
import path4 from "node:path";
import { createHash } from "node:crypto";

// src/core/config.ts
import fs2 from "node:fs/promises";
import path2 from "node:path";
import { randomUUID as randomUUID2 } from "node:crypto";

// src/core/jsonc.ts
var JsoncError = class extends Error {
  position;
  constructor(message, position) {
    super(message);
    this.name = "JsoncError";
    this.position = position;
  }
};
var tokenize = (text) => {
  const tokens = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index] ?? "";
    if (char === " " || char === "	" || char === "\n" || char === "\r") {
      index += 1;
      continue;
    }
    if (char === "/" && text[index + 1] === "/") {
      const newline = text.indexOf("\n", index);
      const end = newline < 0 ? text.length : newline;
      tokens.push({ type: "comment", start: index, end, value: text.slice(index, end) });
      index = end;
      continue;
    }
    if (char === "/" && text[index + 1] === "*") {
      const close = text.indexOf("*/", index + 2);
      if (close < 0) throw new JsoncError("Unterminated block comment", index);
      const end = close + 2;
      tokens.push({ type: "comment", start: index, end, value: text.slice(index, end) });
      index = end;
      continue;
    }
    if (char === '"') {
      let cursor2 = index + 1;
      let closed = false;
      while (cursor2 < text.length) {
        const next = text[cursor2];
        if (next === "\\") {
          cursor2 += 2;
          continue;
        }
        if (next === '"') {
          cursor2 += 1;
          closed = true;
          break;
        }
        if (next === "\n") break;
        cursor2 += 1;
      }
      if (!closed) throw new JsoncError("Unterminated string", index);
      tokens.push({ type: "string", start: index, end: cursor2, value: text.slice(index + 1, cursor2 - 1) });
      index = cursor2;
      continue;
    }
    if ("{}[]:,".includes(char)) {
      tokens.push({ type: "punct", start: index, end: index + 1, value: char });
      index += 1;
      continue;
    }
    let cursor = index;
    while (cursor < text.length && !'{}[]:,"/ 	\n\r'.includes(text[cursor] ?? "")) cursor += 1;
    tokens.push({ type: "word", start: index, end: cursor, value: text.slice(index, cursor) });
    index = cursor;
  }
  return tokens;
};
var significant = (tokens) => tokens.filter((token2) => token2.type !== "comment");
var stripComments = (text) => {
  const tokens = tokenize(text);
  const out = text.split("");
  const blank = (start, end) => {
    for (let index = start; index < end; index += 1) {
      if (out[index] !== "\n" && out[index] !== "\r") out[index] = " ";
    }
  };
  for (const token2 of tokens) if (token2.type === "comment") blank(token2.start, token2.end);
  const compact = significant(tokens);
  for (let index = 0; index < compact.length; index += 1) {
    const token2 = compact[index];
    if (!token2 || token2.type !== "punct" || token2.value !== ",") continue;
    const next = compact[index + 1];
    if (next && next.type === "punct" && (next.value === "}" || next.value === "]")) blank(token2.start, token2.end);
  }
  return out.join("");
};
var parseJsonc = (text) => {
  const cleaned = stripComments(text).replace(/^\uFEFF/, "");
  if (cleaned.trim().length === 0) return {};
  return JSON.parse(cleaned);
};
var objectScan = (text) => {
  const tokens = significant(tokenize(text));
  const open = tokens.findIndex((token2) => token2.type === "punct" && token2.value === "{");
  if (open < 0) throw new JsoncError("Root value must be an object", 0);
  const scan = { span: null, close: -1, hasMembers: false, keys: [] };
  let depth = 0;
  for (let index = open; index < tokens.length; index += 1) {
    const token2 = tokens[index];
    if (!token2) break;
    if (token2.type === "punct" && (token2.value === "{" || token2.value === "[")) {
      depth += 1;
      continue;
    }
    if (token2.type === "punct" && (token2.value === "}" || token2.value === "]")) {
      depth -= 1;
      if (depth === 0) {
        scan.close = token2.start;
        break;
      }
      continue;
    }
    if (depth === 1 && token2.type === "string" && tokens[index + 1]?.value === ":") scan.keys.push(token2.value);
  }
  scan.hasMembers = scan.keys.length > 0;
  if (scan.close < 0) throw new JsoncError("Root object is not closed", text.length);
  return scan;
};
var findMember = (text, key) => {
  const scan = objectScan(text);
  const tokens = significant(tokenize(text));
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token2 = tokens[index];
    if (!token2) break;
    if (token2.type === "punct" && (token2.value === "{" || token2.value === "[")) {
      depth += 1;
      continue;
    }
    if (token2.type === "punct" && (token2.value === "}" || token2.value === "]")) {
      depth -= 1;
      if (depth === 0) break;
      continue;
    }
    if (depth !== 1 || token2.type !== "string" || token2.value !== key) continue;
    if (tokens[index + 1]?.value !== ":") continue;
    const first = tokens[index + 2];
    if (!first) throw new JsoncError("Member has no value", token2.end);
    let cursor = index + 2;
    let inner = 0;
    let last = first;
    while (cursor < tokens.length) {
      const current = tokens[cursor];
      if (!current) break;
      if (current.type === "punct" && (current.value === "{" || current.value === "[")) inner += 1;
      else if (current.type === "punct" && (current.value === "}" || current.value === "]")) {
        if (inner === 0) break;
        inner -= 1;
      } else if (current.type === "punct" && current.value === "," && inner === 0) break;
      last = current;
      cursor += 1;
    }
    return { ...scan, span: { start: first.start, end: last.end } };
  }
  return { ...scan, span: null };
};
var indentUnit = (text) => {
  if (text.trim().length === 0) return "  ";
  const scan = findMember(text, "mcp");
  if (!scan.span) return "  ";
  const lineStart = text.lastIndexOf("\n", scan.span.start) + 1;
  const memberIndent = /^[ \t]*/.exec(text.slice(lineStart, scan.span.start))?.[0] ?? "";
  const afterBrace = text.slice(scan.span.start + 1);
  const newline = afterBrace.indexOf("\n");
  if (newline < 0) return "  ";
  const childIndent = /^[ \t]*/.exec(afterBrace.slice(newline + 1))?.[0] ?? "";
  if (childIndent.length > memberIndent.length) return childIndent.slice(memberIndent.length);
  return "  ";
};
var spliceMember = (text, key, valueText, eol = "\n") => {
  const source = text.trim().length === 0 ? `{${eol}}${eol}` : text;
  const scan = findMember(source, key);
  const anchor = scan.span ? scan.span.start : scan.close;
  const lineStart = source.lastIndexOf("\n", anchor) + 1;
  const memberIndent = /^[ \t]*/.exec(source.slice(lineStart, anchor))?.[0] ?? "  ";
  const indented = valueText.replace(/\r\n/g, "\n").replace(/\n/g, `${eol}${memberIndent}`);
  if (scan.span) return `${source.slice(0, scan.span.start)}${indented}${source.slice(scan.span.end)}`;
  const separator = scan.hasMembers ? "," : "";
  return `${source.slice(0, scan.close)}${separator}${eol}${memberIndent}${JSON.stringify(key)}: ${indented}${eol}${source.slice(scan.close)}`;
};
var objectKeys = (text) => {
  const tokens = significant(tokenize(text));
  const keys = [];
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token2 = tokens[index];
    if (!token2) break;
    if (token2.type === "punct" && (token2.value === "{" || token2.value === "[")) {
      depth += 1;
      continue;
    }
    if (token2.type === "punct" && (token2.value === "}" || token2.value === "]")) {
      depth -= 1;
      if (depth === 0) break;
      continue;
    }
    if (depth === 1 && token2.type === "string" && tokens[index + 1]?.value === ":") keys.push(token2.value);
  }
  return keys;
};
var memberText = (text, key) => {
  const scan = findMember(text, key);
  return scan.span ? text.slice(scan.span.start, scan.span.end) : "";
};

// src/core/config.ts
var CONFIG_DIR = [".config", "opencode"];
var PRIMARY_NAME = "opencode.json";
var ALTERNATE_NAME = "opencode.jsonc";
var BACKUP_SUFFIX = ".mcp-manager.bak";
var describeFs = (error) => {
  const code = error.code;
  if (code === "EACCES" || code === "EPERM") return "permission denied";
  if (code === "ENOENT") return "path does not exist";
  if (code === "ENOTDIR") return "not a directory";
  if (code === "EISDIR") return "is a directory";
  return error instanceof Error ? error.message : "filesystem error";
};
var configPaths = (home) => [PRIMARY_NAME, ALTERNATE_NAME].map((name) => path2.join(home, ...CONFIG_DIR, name));
var primaryConfigPath = (home) => configPaths(home)[0] ?? "";
var isPlainObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
var duplicatesOf = (text) => {
  const duplicates = /* @__PURE__ */ new Set();
  const countInto = (keys) => {
    const counts = /* @__PURE__ */ new Map();
    for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
    for (const [key, count] of counts) if (count > 1) duplicates.add(key);
  };
  const mcpText = memberText(text, "mcp");
  if (!mcpText) return [];
  try {
    countInto(objectKeys(mcpText).filter((key) => key !== "servers" && key !== "timeout"));
    const serversText = memberText(mcpText, "servers");
    if (serversText) countInto(objectKeys(serversText));
  } catch {
    return [];
  }
  return [...duplicates];
};
var loadOne = async (file) => {
  const name = path2.basename(file);
  const base = {
    path: file,
    name,
    exists: false,
    text: "",
    data: null,
    parseError: null,
    mcp: null,
    duplicateKeys: [],
    error: null
  };
  try {
    const text = await fs2.readFile(file, "utf8");
    let parsed;
    try {
      parsed = parseJsonc(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : "invalid JSON";
      return { ...base, exists: true, text, parseError: `${name} is not valid JSON(C): ${message}` };
    }
    if (!isPlainObject(parsed)) {
      return { ...base, exists: true, text, parseError: `${name} must contain a JSON object at the top level` };
    }
    const mcpValue = parsed.mcp;
    const mcp = isPlainObject(mcpValue) ? mcpValue : null;
    const duplicateKeys = mcp && findMember(text, "mcp").span ? duplicatesOf(text) : [];
    return { ...base, exists: true, text, data: parsed, mcp, duplicateKeys };
  } catch (error) {
    if (error.code === "ENOENT") return base;
    return { ...base, error: describeFs(error) };
  }
};
var loadConfigs = async (home) => Promise.all(configPaths(home).map((file) => loadOne(file)));
var writeMcpBlock = async (target, mcp) => {
  let previous = "";
  let exists = false;
  let mode = 384;
  try {
    previous = await fs2.readFile(target, "utf8");
    exists = true;
    try {
      mode = (await fs2.stat(target)).mode & 511;
    } catch {
      mode = 384;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new McpError("read-error", 500, `Cannot read ${target}: ${describeFs(error)}`);
    }
  }
  if (exists) {
    try {
      parseJsonc(previous);
    } catch (error) {
      throw new McpError(
        "invalid-config",
        409,
        `Refusing to write ${target}: the file is not valid JSON(C) (${error instanceof Error ? error.message : "parse error"}). Fix it first.`
      );
    }
  }
  const eol = previous.includes("\r\n") ? "\r\n" : "\n";
  const serialized = JSON.stringify(mcp, null, indentUnit(previous)).replace(/\n/g, eol);
  const next = spliceMember(previous, "mcp", serialized, eol);
  let verified;
  try {
    verified = parseJsonc(next);
  } catch (error) {
    throw new McpError(
      "write-error",
      500,
      `Refusing to write ${target}: the result would not parse (${error instanceof Error ? error.message : "parse error"})`
    );
  }
  const roundTrip = isPlainObject(verified) ? verified.mcp : void 0;
  if (JSON.stringify(roundTrip) !== JSON.stringify(mcp)) {
    throw new McpError("write-error", 500, `Refusing to write ${target}: the mcp block did not round-trip`);
  }
  const dir = path2.dirname(target);
  const temporary = `${target}.${randomUUID2()}.tmp`;
  let backupPath = null;
  try {
    await fs2.mkdir(dir, { recursive: true, mode: 448 });
    if (exists) {
      backupPath = `${target}${BACKUP_SUFFIX}`;
      await fs2.writeFile(backupPath, previous, { encoding: "utf8", mode });
    }
    await fs2.writeFile(temporary, next, { encoding: "utf8", mode });
    await fs2.rename(temporary, target);
  } catch (error) {
    try {
      await fs2.unlink(temporary);
    } catch {
    }
    throw new McpError("write-error", 500, `Failed to write ${target}: ${describeFs(error)}`);
  }
  return backupPath;
};

// src/core/logs.ts
import fs3 from "node:fs/promises";
import path3 from "node:path";
var logDir = (home) => path3.join(home, ".local", "share", "opencode", "log");
var TAIL_BYTES = 4 * 1024 * 1024;
var CHUNK_BYTES = 128 * 1024;
var FAILED_MESSAGES = /* @__PURE__ */ new Set([
  "mcp connect failed",
  "mcp http authentication rejected",
  "mcp oauth authorization failed"
]);
var CONNECTED_MESSAGE = "mcp connected";
var unquote = (value) => value.replace(/\\(["\\])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "");
var field = (line, key) => {
  const quoted = new RegExp(`(?:^|\\s)${key}="((?:[^"\\\\]|\\\\.)*)"`).exec(line);
  if (quoted?.[1] !== void 0) return unquote(quoted[1]);
  const bare = new RegExp(`(?:^|\\s)${key}=([^\\s]+)`).exec(line);
  return bare?.[1] ?? null;
};
var describeDetail = (line, message) => {
  const error = field(line, "error") ?? field(line, "status.error");
  if (error) return error;
  if (message === "mcp http authentication rejected") {
    const code = field(line, "status");
    const origin = field(line, "origin");
    if (code || origin) return [code ? `HTTP ${code}` : null, origin].filter(Boolean).join(" from ");
  }
  return null;
};
var parseLine = (line) => {
  const message = field(line, "message");
  if (!message) return null;
  const failed = FAILED_MESSAGES.has(message);
  if (!failed && message !== CONNECTED_MESSAGE) return null;
  const id = field(line, "server");
  if (!id) return null;
  const atText = field(line, "timestamp") ?? "";
  const at = Number.isNaN(Date.parse(atText)) ? 0 : Date.parse(atText);
  return {
    id,
    event: {
      ok: !failed,
      message,
      detail: failed ? describeDetail(line, message) : null,
      at,
      atText,
      directory: field(line, "directory"),
      tools: Number.parseInt(field(line, "tools") ?? "", 10)
    }
  };
};
var readTail = async (file, pending) => {
  const found = /* @__PURE__ */ new Map();
  const wanted = (id) => !pending || pending.has(id);
  let handle2 = null;
  try {
    handle2 = await fs3.open(file, "r");
    const { size } = await handle2.stat();
    let position = size;
    let budget = TAIL_BYTES;
    let carry = "";
    while (position > 0 && budget > 0 && (!pending || pending.size > 0)) {
      const length = Math.min(CHUNK_BYTES, position, budget);
      const buffer = Buffer.allocUnsafe(length);
      await handle2.read(buffer, 0, length, position - length);
      budget -= length;
      position -= length;
      const lines = (buffer.toString("utf8") + carry).split("\n");
      carry = position === 0 ? "" : lines.shift() ?? "";
      for (let index = lines.length - 1; index >= 0; index -= 1) {
        const line = lines[index];
        if (!line || !line.includes("mcp ")) continue;
        const parsed = parseLine(line);
        if (!parsed || !wanted(parsed.id) || found.has(parsed.id)) continue;
        found.set(parsed.id, parsed.event);
        pending?.delete(parsed.id);
      }
    }
    return found;
  } catch {
    return found;
  } finally {
    await handle2?.close().catch(() => void 0);
  }
};
var pickLogFiles = async (home) => {
  const dir = logDir(home);
  let names;
  try {
    names = await fs3.readdir(dir);
  } catch {
    return [];
  }
  if (names.includes("opencode.log")) return [path3.join(dir, "opencode.log")];
  const candidates = await Promise.all(
    names.filter((name) => name.endsWith(".log")).map(async (name) => {
      const file = path3.join(dir, name);
      const stat = await fs3.stat(file).catch(() => null);
      return stat ? { file, mtime: stat.mtimeMs } : null;
    })
  );
  const newest = candidates.filter((item) => item !== null).sort((left, right) => right.mtime - left.mtime)[0];
  return newest ? [newest.file] : [];
};
var readServerOutcomes = async (home, ids) => {
  const pending = ids ? new Set(ids) : null;
  const latest = /* @__PURE__ */ new Map();
  for (const file of await pickLogFiles(home)) {
    if (pending && pending.size === 0) break;
    const events = await readTail(file, pending);
    for (const [id, event] of events) if (!latest.has(id)) latest.set(id, event);
  }
  const outcomes = /* @__PURE__ */ new Map();
  for (const [id, event] of latest) {
    outcomes.set(id, {
      ok: event.ok,
      message: event.message,
      detail: event.detail,
      at: event.atText,
      directory: event.directory,
      tools: Number.isFinite(event.tools) ? event.tools : null
    });
  }
  return outcomes;
};

// src/core/servers.ts
var ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
var MAX_COMMAND_ITEMS = 64;
var MAX_STRING = 4096;
var MAX_ENTRIES = 500;
var MAX_TIMEOUT = 36e5;
var MAX_IMPORT_BYTES = 512 * 1024;
var IMPORT_TIMEOUT_MS = 15e3;
var RESERVED_KEYS = /* @__PURE__ */ new Set(["servers", "timeout"]);
var TIMEOUT_KEYS = ["startup", "catalog", "execution"];
var isPlainObject2 = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
var looksLikeDefinition = (value) => isPlainObject2(value) && (value.type !== void 0 || value.command !== void 0 || value.url !== void 0);
var stringList = (value, label, errors) => {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array of strings`);
    return [];
  }
  if (value.length === 0) {
    errors.push(`${label} must contain at least one entry`);
    return [];
  }
  if (value.length > MAX_COMMAND_ITEMS) {
    errors.push(`${label} has more than ${MAX_COMMAND_ITEMS} entries`);
    return [];
  }
  const out = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0 || item.length > MAX_STRING) {
      errors.push(`${label} entries must be non-empty strings under ${MAX_STRING} characters`);
      return [];
    }
    out.push(item);
  }
  return out;
};
var objectKeys2 = (value, label, errors, warnings) => {
  if (value === void 0) return [];
  if (!isPlainObject2(value)) {
    errors.push(`${label} must be an object`);
    return [];
  }
  const keys = [];
  for (const [key, item] of Object.entries(value)) {
    if (!key || key.length > 128) {
      errors.push(`${label} contains an invalid key`);
      continue;
    }
    if (typeof item !== "string") warnings.push(`${label}.${key} is not a string; OpenCode expects strings`);
    keys.push(key);
  }
  return keys;
};
var formatMs = (ms) => ms % 1e3 === 0 ? `${ms / 1e3}s` : `${ms}ms`;
var positiveInt = (value) => typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_TIMEOUT ? value : null;
var timeoutInfo = (value, container, errors, warnings) => {
  if (value === void 0) return null;
  if (container === "legacy") {
    if (isPlainObject2(value)) {
      errors.push("timeout must be a positive whole number of milliseconds in a deprecated entry");
      return null;
    }
    const ms = positiveInt(value);
    if (ms === null) {
      errors.push(`timeout must be a positive whole number of milliseconds up to ${MAX_TIMEOUT}`);
      return null;
    }
    return formatMs(ms);
  }
  if (typeof value === "number") {
    errors.push("timeout must be an object with startup, catalog or execution (milliseconds); a bare number is the deprecated shape");
    return null;
  }
  if (!isPlainObject2(value)) {
    errors.push("timeout must be an object with startup, catalog or execution");
    return null;
  }
  const parts = [];
  for (const [key, raw] of Object.entries(value)) {
    if (!TIMEOUT_KEYS.includes(key)) {
      warnings.push(`timeout.${key} is not a recognized timeout field and is ignored`);
      continue;
    }
    const ms = positiveInt(raw);
    if (ms === null) errors.push(`timeout.${key} must be a positive whole number of milliseconds`);
    else parts.push(`${key} ${formatMs(ms)}`);
  }
  return parts.length > 0 ? parts.join(" \xB7 ") : null;
};
var flagInfo = (value, container, errors, warnings) => {
  if (container === "servers") {
    if (value.enabled !== void 0) warnings.push('"enabled" is the deprecated flag; use "disabled" inside mcp.servers');
    if (value.disabled !== void 0 && typeof value.disabled !== "boolean") errors.push("disabled must be a boolean");
    return value.disabled !== true;
  }
  if (value.disabled !== void 0) warnings.push('"disabled" is ignored in a deprecated entry; use "enabled"');
  if (value.enabled !== void 0 && typeof value.enabled !== "boolean") errors.push("enabled must be a boolean");
  return value.enabled !== false;
};
var analyzeDefinition = (value, container = "servers") => {
  const errors = [];
  const warnings = [];
  const info = {
    transport: "unknown",
    command: [],
    url: null,
    cwd: null,
    environmentKeys: [],
    headerKeys: [],
    timeout: null,
    codemode: false,
    protocol: null,
    oauth: "none",
    enabled: true,
    errors,
    warnings
  };
  if (!isPlainObject2(value)) {
    errors.push("Definition must be a JSON object");
    return info;
  }
  info.enabled = flagInfo(value, container, errors, warnings);
  info.timeout = timeoutInfo(value.timeout, container, errors, warnings);
  info.environmentKeys = objectKeys2(value.environment, "environment", errors, warnings);
  info.headerKeys = objectKeys2(value.headers, "headers", errors, warnings);
  if (container === "servers") {
    if (value.codemode !== void 0) {
      if (typeof value.codemode !== "boolean") errors.push("codemode must be a boolean");
      else info.codemode = value.codemode;
    }
    if (value.protocol !== void 0) {
      if (value.protocol !== "legacy" && value.protocol !== "auto" && value.protocol !== "2026-07-28") {
        errors.push('protocol must be "legacy", "auto" or "2026-07-28"');
      } else {
        info.protocol = value.protocol;
      }
    }
  } else if (value.codemode !== void 0 || value.protocol !== void 0) {
    warnings.push("codemode and protocol are only read from mcp.servers; move this server there to use them");
  }
  if (value.oauth === false) info.oauth = "disabled";
  else if (isPlainObject2(value.oauth)) info.oauth = "configured";
  else if (value.oauth === void 0) info.oauth = "none";
  else errors.push("oauth must be an object or false");
  const declaredType = value.type;
  if (declaredType === void 0) {
    if (container === "legacy" && value.enabled !== void 0 && !looksLikeDefinition(value)) {
      warnings.push('Definition only sets "enabled"; add type and command or url');
      return info;
    }
    errors.push('type is required ("local" or "remote")');
    return info;
  }
  if (declaredType !== "local" && declaredType !== "remote") {
    errors.push('type must be "local" or "remote"');
    return info;
  }
  info.transport = declaredType;
  if (declaredType === "local") {
    info.command = stringList(value.command, "command", errors);
    if (value.cwd !== void 0) {
      if (typeof value.cwd !== "string" || value.cwd.length === 0 || value.cwd.length > MAX_STRING) {
        errors.push("cwd must be a non-empty string");
      } else {
        info.cwd = value.cwd;
      }
    }
    if (value.url !== void 0) warnings.push("url is ignored for a local server");
    if (value.headers !== void 0) warnings.push("headers are ignored for a local server");
  } else {
    info.url = typeof value.url === "string" ? value.url : null;
    if (!info.url) {
      errors.push("url is required for a remote server");
    } else if (info.url.length > MAX_STRING) {
      errors.push(`url cannot exceed ${MAX_STRING} characters`);
    } else {
      let parsedUrl = null;
      try {
        parsedUrl = new URL(info.url);
      } catch {
        errors.push("url is not a valid URL");
      }
      if (parsedUrl && parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        errors.push("url must use http or https");
      } else if (parsedUrl?.protocol === "http:") {
        warnings.push("url uses plain http; headers and tokens travel unencrypted");
      }
    }
    if (value.command !== void 0) warnings.push("command is ignored for a remote server");
    if (value.environment !== void 0) warnings.push("environment is ignored for a remote server");
  }
  return info;
};
var targetOf = (entry) => `${entry.path}#${entry.container}`;
var splitTarget = (target) => {
  const index = target.lastIndexOf("#");
  if (index <= 0) return null;
  const container = target.slice(index + 1);
  if (container !== "servers" && container !== "legacy") return null;
  return { path: target.slice(0, index), container };
};
var toolsDisabledPatterns = (config) => {
  const tools = config.data?.tools;
  if (!isPlainObject2(tools)) return [];
  return Object.entries(tools).flatMap(([pattern, value]) => value === false ? [pattern] : []);
};
var patternCovers = (pattern, id) => {
  if (pattern === "*") return true;
  const base = pattern.endsWith("*") ? pattern.slice(0, -1) : pattern;
  if (base === "") return true;
  return base === id || base.startsWith(`${id}_`) || base.startsWith(`${id}.`);
};
var hashOf = (definition) => definition ? createHash("sha256").update(JSON.stringify(definition)).digest("hex") : "";
var pushEntry = (entries, config, patterns, id, value, container) => {
  const definition = isPlainObject2(value) ? value : null;
  const info = analyzeDefinition(value, container);
  const off = patterns.filter((pattern) => patternCovers(pattern, id));
  entries.push({
    id,
    path: config.path,
    container,
    definition,
    info,
    hash: hashOf(definition),
    toolsOff: off
  });
};
var collect = (configs) => {
  const entries = [];
  const configConflicts = [];
  for (const config of configs) {
    if (config.error || config.parseError) {
      configConflicts.push({
        kind: "read-error",
        serverId: "",
        message: config.error ? `Cannot read ${config.path}: ${config.error}` : `${config.parseError} (${config.path})`,
        paths: [config.path],
        blocking: true
      });
      continue;
    }
    if (!config.data) continue;
    if (config.data.mcp !== void 0 && !isPlainObject2(config.data.mcp)) {
      configConflicts.push({
        kind: "invalid",
        serverId: "",
        message: `"mcp" in ${config.name} must be an object; the block is ignored`,
        paths: [config.path],
        blocking: true
      });
      continue;
    }
    for (const key of config.duplicateKeys) {
      configConflicts.push({
        kind: "duplicate",
        serverId: key,
        message: `"${key}" is defined more than once in the mcp block of ${config.name}; OpenCode keeps only the last one`,
        paths: [config.path],
        blocking: false
      });
    }
    const mcp = config.mcp;
    if (!mcp) continue;
    const patterns = toolsDisabledPatterns(config);
    if (mcp.servers !== void 0 && !isPlainObject2(mcp.servers)) {
      configConflicts.push({
        kind: "invalid",
        serverId: "",
        message: `"mcp.servers" in ${config.name} must be an object of servers; no server in that file is listed`,
        paths: [config.path],
        blocking: true
      });
    } else if (isPlainObject2(mcp.servers)) {
      for (const [id, value] of Object.entries(mcp.servers)) pushEntry(entries, config, patterns, id, value, "servers");
    }
    for (const [id, value] of Object.entries(mcp)) {
      if (RESERVED_KEYS.has(id) && (id === "servers" || !looksLikeDefinition(value))) continue;
      pushEntry(entries, config, patterns, id, value, "legacy");
    }
  }
  return { entries, configConflicts };
};
var containerLabel = (container) => container === "servers" ? "mcp.servers" : "a deprecated top-level entry";
var buildResponse = async (home, configs) => {
  const { entries, configConflicts } = collect(configs);
  const outcomes = await readServerOutcomes(
    home,
    entries.map((entry) => entry.id)
  );
  const groups = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const group = groups.get(entry.id);
    if (group) group.push(entry);
    else groups.set(entry.id, [entry]);
  }
  const servers = [];
  for (const [id, group] of groups) {
    group.sort((left, right) => {
      if (left.container !== right.container) return left.container === "servers" ? 1 : -1;
      return left.path.localeCompare(right.path);
    });
    const winner = group.at(-1) ?? group[0];
    if (!winner) continue;
    const duplicate = group.length > 1;
    const conflicts2 = [];
    const push = (conflict) => {
      const seen = conflicts2.some(
        (item) => item.kind === conflict.kind && item.message === conflict.message && item.paths.join() === conflict.paths.join()
      );
      if (!seen) conflicts2.push(conflict);
    };
    if (duplicate) {
      push({
        kind: "both",
        serverId: id,
        message: `"${id}" is defined in ${group.length} places: ${group.map((entry) => `${path4.basename(entry.path)} (${containerLabel(entry.container)})`).join(", ")}; OpenCode loads only one`,
        paths: Array.from(new Set(group.map((entry) => entry.path))),
        blocking: true
      });
    }
    if (winner.info.errors.length > 0) {
      push({
        kind: "invalid",
        serverId: id,
        message: `Definition is invalid: ${winner.info.errors.join("; ")}`,
        paths: [winner.path],
        blocking: false
      });
    }
    if (winner.info.warnings.some((warning) => warning.startsWith("Definition only sets"))) {
      push({
        kind: "stub",
        serverId: id,
        message: `${containerLabel(winner.container)} for "${id}" only sets the on/off flag; it defines no command or url`,
        paths: [winner.path],
        blocking: false
      });
    }
    if (winner.toolsOff.length > 0) {
      push({
        kind: "tools-off",
        serverId: id,
        message: 'Server is enabled but its tools are disabled by the "tools" section; the model cannot call them',
        paths: [winner.path],
        blocking: false
      });
    }
    const invalid = winner.info.errors.length > 0;
    const state = duplicate ? "conflict" : invalid ? "invalid" : winner.info.enabled ? "enabled" : "disabled";
    const advertised = state === "enabled" && winner.toolsOff.length === 0;
    servers.push({
      id,
      container: winner.container,
      transport: winner.info.transport,
      command: winner.info.command,
      url: winner.info.url,
      cwd: winner.info.cwd,
      environmentKeys: winner.info.environmentKeys,
      headerKeys: winner.info.headerKeys,
      timeout: winner.info.timeout,
      codemode: winner.info.codemode,
      protocol: winner.info.protocol,
      oauth: winner.info.oauth,
      enabled: winner.info.enabled,
      state,
      advertised,
      toolsOff: winner.toolsOff,
      paths: Array.from(new Set(group.map((entry) => entry.path))),
      targets: group.map((entry) => targetOf(entry)),
      conflicts: conflicts2,
      warnings: Array.from(
        /* @__PURE__ */ new Set([...winner.info.warnings, ...conflicts2.filter((item) => !item.blocking).map((item) => item.message)])
      ),
      runtime: outcomes.get(id) ?? null,
      contentHash: winner.hash
    });
  }
  servers.sort((left, right) => left.id.localeCompare(right.id));
  const conflicts = [...configConflicts, ...servers.flatMap((server2) => server2.conflicts)];
  const blocking = conflicts.filter((item) => item.blocking);
  const summary = {
    total: servers.length,
    advertised: servers.filter((server2) => server2.advertised).length,
    enabled: servers.filter((server2) => server2.state === "enabled").length,
    disabled: servers.filter((server2) => server2.state === "disabled").length,
    invalid: servers.filter((server2) => server2.state === "invalid" || server2.state === "conflict").length,
    legacy: servers.filter((server2) => server2.container === "legacy").length,
    blockingConflicts: blocking.length,
    warnings: conflicts.length - blocking.length
  };
  const view = (config) => ({
    path: config.path,
    exists: config.exists,
    error: config.error ?? config.parseError
  });
  const primary = configs[0];
  return {
    servers,
    conflicts,
    summary,
    config: primary ? view(primary) : { path: primaryConfigPath(""), exists: false, error: null },
    scanned: configs.map(view),
    scannedAt: Date.now()
  };
};
var scanServers = async (home) => buildResponse(home, await loadConfigs(home));
var entriesOf = async (home) => {
  const configs = await loadConfigs(home);
  return { configs, entries: collect(configs).entries };
};
var entriesFor = (entries, id) => entries.filter((entry) => entry.id === id);
var assertKnown = (entries, id) => {
  if (!id) throw new McpError("invalid-request", 400, "Missing id");
  if (id.length > 128) throw new McpError("invalid-request", 400, "id is too long");
  const found = entriesFor(entries, id);
  if (found.length === 0) throw new McpError("not-found", 404, `MCP server ${id} not found`);
  if (found.length > 1) {
    throw new McpError("conflict", 409, `MCP server ${id} is defined in ${found.length} places; resolve the duplicate first`);
  }
  return found;
};
var containerWrite = (config, container, id, definition) => {
  const mcp = { ...config.mcp ?? {} };
  if (container === "servers") {
    const servers = isPlainObject2(mcp.servers) ? { ...mcp.servers } : {};
    if (definition) servers[id] = definition;
    else delete servers[id];
    mcp.servers = servers;
  } else if (definition) {
    mcp[id] = definition;
  } else {
    delete mcp[id];
  }
  return mcp;
};
var withFlag = (definition, container, enabled) => {
  const key = container === "servers" ? "disabled" : "enabled";
  const other = container === "servers" ? "enabled" : "disabled";
  const value = container === "servers" ? !enabled : enabled;
  const next = {};
  for (const [name, item] of Object.entries(definition)) {
    if (name === other) continue;
    next[name] = name === key ? value : item;
  }
  if (!(key in next)) next[key] = value;
  return next;
};
var writeToggle = async (configs, entries, id, enabled) => {
  const [entry] = assertKnown(entries, id);
  if (!entry) return;
  const config = configs.find((item) => item.path === entry.path);
  if (!config) throw new McpError("not-found", 404, `Config for ${id} not found`);
  if (!entry.definition) throw new McpError("invalid-definition", 409, `MCP server ${id} is not a JSON object; edit its definition first`);
  await writeMcpBlock(entry.path, containerWrite(config, entry.container, id, withFlag(entry.definition, entry.container, enabled)));
};
var setServerEnabled = async (home, id, enabled) => {
  const { configs, entries } = await entriesOf(home);
  await writeToggle(configs, entries, id, enabled);
  return scanServers(home);
};
var batchSetEnabled = async (home, enable, disable) => {
  const { configs, entries } = await entriesOf(home);
  const enableIds = Array.from(new Set(enable));
  const disableIds = Array.from(new Set(disable));
  if (enableIds.some((id) => disableIds.includes(id))) {
    throw new McpError("invalid-request", 400, "The same server cannot be enabled and disabled at once");
  }
  if (enableIds.length + disableIds.length > 200) {
    throw new McpError("invalid-request", 400, "Too many servers in one request");
  }
  if (enableIds.length + disableIds.length === 0) return { ...await buildResponse(home, configs), changed: [] };
  const writes = /* @__PURE__ */ new Map();
  const stage = (id, enabled) => {
    const [entry] = assertKnown(entries, id);
    if (!entry) return;
    const config = configs.find((item) => item.path === entry.path);
    if (!config) throw new McpError("invalid-definition", 409, `Config for ${id} not found`);
    if (!entry.definition) throw new McpError("invalid-definition", 409, `MCP server ${id} cannot be read`);
    const next = { ...writes.get(entry.path) ?? config.mcp ?? {} };
    const definition = withFlag(entry.definition, entry.container, enabled);
    if (entry.container === "servers") {
      next.servers = { ...isPlainObject2(next.servers) ? next.servers : {}, [id]: definition };
    } else {
      next[id] = definition;
    }
    writes.set(entry.path, next);
  };
  for (const id of enableIds) stage(id, true);
  for (const id of disableIds) stage(id, false);
  for (const [file, mcp] of writes) await writeMcpBlock(file, mcp);
  const after = await scanServers(home);
  return { ...after, changed: [...enableIds, ...disableIds] };
};
var bulkSetEnabled = async (home, enabled) => {
  const { configs, entries } = await entriesOf(home);
  const before = await buildResponse(home, configs);
  const blocking = before.conflicts.filter((conflict) => conflict.blocking);
  if (blocking.length > 0) {
    throw new McpError("conflict", 409, "Config problems remain; bulk changes are blocked", blocking);
  }
  const ids = before.servers.filter((server2) => server2.enabled !== enabled).map((server2) => server2.id);
  if (ids.length === 0) return { ...before, changed: [] };
  return { ...await batchSetEnabled(home, enabled ? ids : [], enabled ? [] : ids), changed: ids };
};
var preserveSecrets = (next, previous) => {
  if (!previous) return;
  for (const field2 of ["environment", "headers"]) {
    const source = previous[field2];
    const target = next[field2];
    if (!isPlainObject2(source) || !isPlainObject2(target)) continue;
    const merged = { ...target };
    for (const [key, value] of Object.entries(target)) {
      if (value !== "") continue;
      const prior = source[key];
      if (typeof prior === "string" && prior.length > 0) merged[key] = prior;
      else delete merged[key];
    }
    next[field2] = merged;
  }
  const oauth = next.oauth;
  const priorOauth = previous.oauth;
  if (isPlainObject2(oauth) && isPlainObject2(priorOauth)) {
    const secret = oauth.client_secret ?? oauth.clientSecret;
    const prior = priorOauth.client_secret ?? priorOauth.clientSecret;
    if (!secret && typeof prior === "string" && prior.length > 0) {
      next.oauth = { ...oauth, ..."client_secret" in priorOauth ? { client_secret: prior } : { clientSecret: prior } };
    }
  }
};
var saveServer = async (home, input) => {
  if (!isPlainObject2(input.definition)) throw new McpError("invalid-request", 400, "definition must be a JSON object");
  const id = (input.id ?? input.previousId ?? "").trim();
  if (!id) throw new McpError("invalid-request", 400, "Missing id");
  if (!ID_PATTERN.test(id)) {
    throw new McpError("invalid-request", 400, "id must start with a letter or digit and use only letters, digits, dot, dash or underscore");
  }
  const previousId = input.previousId?.trim() ?? id;
  const { configs, entries } = await entriesOf(home);
  const broken = configs.find((config) => config.parseError);
  if (broken?.parseError) {
    throw new McpError("invalid-config", 409, `${broken.parseError}. Fix the file before saving servers.`);
  }
  const previousEntries = entriesFor(entries, previousId);
  if (previousEntries.length > 1) {
    throw new McpError("conflict", 409, `MCP server ${previousId} is defined in ${previousEntries.length} places; resolve the duplicate first`);
  }
  const previousEntry = previousEntries[0];
  const enabled = input.enabled !== false;
  const container = previousEntry?.container ?? "servers";
  const targetPath = previousEntry?.path ?? configs.find((config) => config.exists)?.path ?? configs[0]?.path ?? primaryConfigPath(home);
  let definition = { ...input.definition };
  delete definition.enabled;
  delete definition.disabled;
  preserveSecrets(definition, previousEntry?.definition ?? void 0);
  definition = withFlag(definition, container, enabled);
  const info = analyzeDefinition(definition, container);
  if (info.errors.length > 0) {
    throw new McpError("invalid-definition", 400, `Definition is invalid: ${info.errors.join("; ")}`);
  }
  const targetConfig = configs.find((config) => config.path === targetPath);
  if (!targetConfig) throw new McpError("write-error", 500, "No OpenCode config path available");
  let mcp = containerWrite(targetConfig, container, id, definition);
  if (previousEntry && previousEntry.container === "servers" && previousId !== id) {
    const servers = isPlainObject2(mcp.servers) ? { ...mcp.servers } : {};
    delete servers[previousId];
    mcp = { ...mcp, servers };
  }
  if (previousEntry && previousEntry.container === "legacy" && previousId !== id) delete mcp[previousId];
  const backupPath = await writeMcpBlock(targetPath, mcp);
  for (const other of previousEntries) {
    if (other.path === targetPath) continue;
    const otherConfig = configs.find((config) => config.path === other.path);
    if (!otherConfig) continue;
    await writeMcpBlock(other.path, containerWrite(otherConfig, other.container, previousId, null));
  }
  return { ...await scanServers(home), id, backupPath };
};
var readDefinition = async (home, id) => {
  const { entries } = await entriesOf(home);
  const [entry] = assertKnown(entries, id);
  if (!entry) throw new McpError("not-found", 404, `MCP server ${id} not found`);
  if (!entry.definition) {
    throw new McpError("invalid-definition", 409, `MCP server ${id} is not a JSON object; edit the config by hand`);
  }
  const definition = JSON.parse(JSON.stringify(entry.definition));
  const masked = [];
  for (const field2 of ["environment", "headers"]) {
    const block = definition[field2];
    if (!isPlainObject2(block)) continue;
    for (const key of Object.keys(block)) {
      block[key] = "";
      masked.push(`${field2}.${key}`);
    }
  }
  const oauth = definition.oauth;
  if (isPlainObject2(oauth)) {
    for (const key of ["client_secret", "clientSecret"]) {
      if (typeof oauth[key] === "string" && oauth[key]) {
        oauth[key] = "";
        masked.push(`oauth.${key}`);
      }
    }
  }
  return { id, container: entry.container, definition, paths: [entry.path], maskedPaths: masked };
};
var removeServer = async (home, id) => {
  const { configs, entries } = await entriesOf(home);
  const owners = entriesFor(entries, id);
  if (owners.length === 0) throw new McpError("not-found", 404, `MCP server ${id} not found`);
  const removedPaths = [];
  for (const owner of owners) {
    const config = configs.find((item) => item.path === owner.path);
    if (!config) continue;
    await writeMcpBlock(owner.path, containerWrite(config, owner.container, id, null));
    removedPaths.push(owner.path);
  }
  return { ...await scanServers(home), id, removedPaths: Array.from(new Set(removedPaths)) };
};
var resolveDuplicate = async (home, id, keepTarget) => {
  const { configs, entries } = await entriesOf(home);
  const owners = entriesFor(entries, id);
  if (owners.length < 2) throw new McpError("not-found", 404, `MCP server ${id} is not defined twice`);
  const parsed = splitTarget(keepTarget);
  const keep = owners.find((entry) => entry.path === parsed?.path && entry.container === parsed.container);
  if (!keep) throw new McpError("invalid-request", 400, "keep must be one of the definitions reported for this server");
  let backupPath = `${keep.path}.mcp-manager.bak`;
  for (const owner of owners) {
    if (owner.path === keep.path && owner.container === keep.container) continue;
    const config = configs.find((item) => item.path === owner.path);
    if (!config) continue;
    backupPath = await writeMcpBlock(owner.path, containerWrite(config, owner.container, id, null)) ?? backupPath;
  }
  return { ...await scanServers(home), backupPath };
};
var readImportText = async (kind, value) => {
  if (kind === "paste") {
    if (!value.trim()) throw new McpError("invalid-request", 400, "Paste a manifest first");
    return { text: value, source: "pasted manifest" };
  }
  if (kind === "url") {
    let url;
    try {
      url = new URL(value.trim());
    } catch {
      throw new McpError("invalid-request", 400, "Enter a valid manifest URL");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new McpError("invalid-request", 400, "Manifest URL must use http or https");
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal, redirect: "follow" });
      if (!response.ok) throw new McpError("import-failed", 400, `Manifest download failed: HTTP ${response.status}`);
      const text = await response.text();
      if (text.length > MAX_IMPORT_BYTES) throw new McpError("import-failed", 400, "Manifest is larger than 512 KB");
      return { text, source: url.toString() };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const message = error instanceof Error && error.name === "AbortError" ? "download timed out" : describeFs(error);
      throw new McpError("import-failed", 400, `Manifest download failed: ${message}`);
    } finally {
      clearTimeout(timer);
    }
  }
  if (kind === "path") {
    const target = path4.resolve(value.trim());
    let text;
    try {
      const info = await fs4.stat(target);
      if (info.isDirectory()) {
        const candidates = ["mcp.json", ".mcp.json", "opencode.json", "opencode.jsonc"];
        let found = null;
        for (const candidate of candidates) {
          const file = path4.join(target, candidate);
          try {
            await fs4.access(file);
            found = file;
            break;
          } catch {
          }
        }
        if (!found) throw new McpError("import-failed", 404, `No mcp.json, .mcp.json or opencode.json in ${target}`);
        text = await fs4.readFile(found, "utf8");
        return { text, source: found };
      }
      text = await fs4.readFile(target, "utf8");
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError("import-failed", 400, `Cannot read ${target}: ${describeFs(error)}`);
    }
    if (text.length > MAX_IMPORT_BYTES) throw new McpError("import-failed", 400, "Manifest is larger than 512 KB");
    return { text, source: target };
  }
  throw new McpError("invalid-request", 400, "kind must be paste, url or path");
};
var normalizeForImport = (definition) => {
  const next = { ...definition };
  delete next.enabled;
  delete next.disabled;
  if (typeof next.timeout === "number") next.timeout = { execution: next.timeout };
  return next;
};
var importManifest = async (home, kind, value) => {
  const { text, source } = await readImportText(kind, value);
  let parsed;
  try {
    parsed = parseJsonc(text);
  } catch (error) {
    throw new McpError("invalid-manifest", 400, `Manifest is not valid JSON(C): ${error instanceof Error ? error.message : "parse error"}`);
  }
  if (!isPlainObject2(parsed)) throw new McpError("invalid-manifest", 400, "Manifest must be a JSON object");
  const candidates = [];
  if (isPlainObject2(parsed.mcp)) {
    const block = parsed.mcp;
    if (isPlainObject2(block.servers)) {
      for (const [id, definition] of Object.entries(block.servers)) candidates.push([id, definition]);
    }
    for (const [id, definition] of Object.entries(block)) {
      if (RESERVED_KEYS.has(id) && (id === "servers" || !looksLikeDefinition(definition))) continue;
      candidates.push([id, definition]);
    }
  } else if (looksLikeDefinition(parsed)) {
    const name = typeof parsed.name === "string" ? parsed.name : typeof parsed.id === "string" ? parsed.id : "";
    if (!name) {
      throw new McpError("invalid-manifest", 400, 'A single server definition needs a "name" field, or wrap it in an "mcp" block');
    }
    const { name: _name, id: _id, ...definition } = parsed;
    candidates.push([name, definition]);
  } else {
    throw new McpError("invalid-manifest", 400, 'Manifest has no "mcp" block and is not a single server definition');
  }
  if (candidates.length === 0) throw new McpError("invalid-manifest", 400, "Manifest contains no servers");
  if (candidates.length > MAX_ENTRIES) throw new McpError("invalid-manifest", 400, `Manifest has more than ${MAX_ENTRIES} servers`);
  const drafts = [];
  const invalid = [];
  for (const [id, raw] of candidates) {
    if (!ID_PATTERN.test(id)) {
      invalid.push(`${id} (invalid id)`);
      continue;
    }
    if (!isPlainObject2(raw)) {
      invalid.push(`${id} (not an object)`);
      continue;
    }
    const definition = normalizeForImport(raw);
    const info = analyzeDefinition(definition, "servers");
    const enabled = raw.enabled !== false && raw.disabled !== true;
    if (info.errors.length > 0) invalid.push(`${id} (${info.errors[0]})`);
    else drafts.push({ id, definition, enabled });
  }
  if (invalid.length > 0) {
    throw new McpError("invalid-manifest", 400, `Manifest contains invalid servers: ${invalid.join(", ")}`);
  }
  const current = await buildResponse(home, await loadConfigs(home));
  const existing = drafts.map((draft) => draft.id).filter((id) => current.servers.some((server2) => server2.id === id));
  return { drafts, existing, source };
};

// src/service/main.ts
var port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
var token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? "";
if (!port || !token) {
  console.error("OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required");
  process.exit(1);
}
var HOME = os.homedir();
var json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
};
var readBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  let failed = false;
  req.on("data", (chunk) => {
    if (failed) return;
    size += chunk.length;
    if (size > 1024 * 1024) {
      failed = true;
      chunks.length = 0;
      reject(new McpError("too-large", 413, "Request body too large"));
      return;
    }
    chunks.push(chunk);
  });
  req.on("error", () => reject(new McpError("invalid-request", 400, "Request interrupted, retry")));
  req.on("end", () => {
    if (failed) return;
    try {
      const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
      resolve(parsed);
    } catch {
      reject(new McpError("invalid-request", 400, "Request body must be a valid JSON object"));
    }
  });
});
var queue = Promise.resolve();
var exclusive = (action) => {
  const next = queue.then(() => action(), () => action());
  queue = next.catch(() => void 0);
  return next;
};
var stringField = (body, key, max) => {
  const value = typeof body[key] === "string" ? body[key].trim() : "";
  if (!value) throw new McpError("invalid-request", 400, `Missing ${key}`);
  if (value.length > max) throw new McpError("invalid-request", 400, `${key} is too long`);
  return value;
};
var optionalStringField = (body, key, max) => {
  if (body[key] === void 0 || body[key] === null || body[key] === "") return void 0;
  return stringField(body, key, max);
};
var booleanField = (body, key) => {
  const value = body[key];
  if (typeof value !== "boolean") throw new McpError("invalid-request", 400, `${key} must be a boolean`);
  return value;
};
var stringArrayField = (body, key) => {
  const value = body[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0 || item.length > 128)) {
    throw new McpError("invalid-request", 400, `${key} must be an array of MCP server IDs`);
  }
  if (value.length > 200) throw new McpError("invalid-request", 400, `${key} has too many entries`);
  return value;
};
var handle = async (req, res) => {
  if (req.headers.authorization !== `Bearer ${token}`) {
    throw new McpError("unauthorized", 401, "unauthorized");
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/health" && req.method === "GET") {
    json(res, 200, { ok: true });
    return;
  }
  if (url.pathname === "/servers" && req.method === "GET") {
    json(res, 200, await exclusive(() => scanServers(HOME)));
    return;
  }
  if (url.pathname === "/servers/detail" && req.method === "GET") {
    const id = url.searchParams.get("id")?.trim() ?? "";
    if (!id) throw new McpError("invalid-request", 400, "Missing id");
    json(res, 200, await exclusive(() => readDefinition(HOME, id)));
    return;
  }
  if (url.pathname === "/servers/toggle" && req.method === "POST") {
    const body = await readBody(req);
    const id = stringField(body, "id", 128);
    const enabled = booleanField(body, "enabled");
    json(res, 200, await exclusive(() => setServerEnabled(HOME, id, enabled)));
    return;
  }
  if (url.pathname === "/servers/bulk" && req.method === "POST") {
    const body = await readBody(req);
    const enabled = booleanField(body, "enabled");
    json(res, 200, await exclusive(() => bulkSetEnabled(HOME, enabled)));
    return;
  }
  if (url.pathname === "/servers/batch" && req.method === "POST") {
    const body = await readBody(req);
    const enable = stringArrayField(body, "enable");
    const disable = stringArrayField(body, "disable");
    json(res, 200, await exclusive(() => batchSetEnabled(HOME, enable, disable)));
    return;
  }
  if (url.pathname === "/servers/save" && req.method === "POST") {
    const body = await readBody(req);
    const definition = body.definition;
    if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
      throw new McpError("invalid-request", 400, "definition must be a JSON object");
    }
    const input = {
      id: optionalStringField(body, "id", 128),
      previousId: optionalStringField(body, "previousId", 128),
      definition,
      enabled: body.enabled === void 0 ? void 0 : booleanField(body, "enabled")
    };
    json(res, 200, await exclusive(() => saveServer(HOME, input)));
    return;
  }
  if (url.pathname === "/servers/remove" && req.method === "POST") {
    const body = await readBody(req);
    const id = stringField(body, "id", 128);
    json(res, 200, await exclusive(() => removeServer(HOME, id)));
    return;
  }
  if (url.pathname === "/servers/import" && req.method === "POST") {
    const body = await readBody(req);
    const kind = stringField(body, "kind", 16);
    const value = typeof body.value === "string" ? body.value : "";
    json(res, 200, await exclusive(() => importManifest(HOME, kind, value)));
    return;
  }
  if (url.pathname === "/servers/resolve" && req.method === "POST") {
    const body = await readBody(req);
    const id = stringField(body, "id", 128);
    const keep = stringField(body, "keep", 4096);
    json(res, 200, await exclusive(() => resolveDuplicate(HOME, id, keep)));
    return;
  }
  if (url.pathname === "/groups" && req.method === "GET") {
    json(res, 200, await exclusive(() => readGroups(HOME)));
    return;
  }
  if (url.pathname === "/groups" && req.method === "POST") {
    const body = await readBody(req);
    json(res, 200, await exclusive(() => writeGroups(HOME, body)));
    return;
  }
  throw new McpError("not-found", 404, "not-found");
};
var server = http.createServer((req, res) => {
  void handle(req, res).catch((error) => {
    if (res.headersSent || res.destroyed) return;
    if (error instanceof McpError || error instanceof GroupError) {
      json(res, error.status, {
        error: error.message,
        code: error.code,
        ...error instanceof McpError && error.conflicts ? { conflicts: error.conflicts } : {}
      });
      return;
    }
    console.error("mcp service:", error instanceof Error ? error.message : error);
    json(res, 500, { error: "Local service failed to handle the request, retry", code: "internal" });
  });
});
server.listen(port, "127.0.0.1");
