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
import fs3 from "node:fs/promises";
import path3 from "node:path";
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
var spliceMember = (text, key, valueText) => {
  const source = text.trim().length === 0 ? "{\n}\n" : text;
  const scan = findMember(source, key);
  const indented = valueText.replace(/\n/g, "\n  ");
  if (scan.span) return `${source.slice(0, scan.span.start)}${indented}${source.slice(scan.span.end)}`;
  const separator = scan.hasMembers ? "," : "";
  return `${source.slice(0, scan.close)}${separator}
  ${JSON.stringify(key)}: ${indented}
${source.slice(scan.close)}`;
};
var keysOfMember = (text, key) => {
  const scan = findMember(text, key);
  if (!scan.span) return [];
  const tokens = significant(tokenize(text));
  const keys = [];
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token2 = tokens[index];
    if (!token2 || token2.start < scan.span.start || token2.end > scan.span.end) continue;
    if (token2.type === "punct" && (token2.value === "{" || token2.value === "[")) {
      depth += 1;
      continue;
    }
    if (token2.type === "punct" && (token2.value === "}" || token2.value === "]")) {
      depth -= 1;
      continue;
    }
    if (depth === 1 && token2.type === "string" && tokens[index + 1]?.value === ":") keys.push(token2.value);
  }
  return keys;
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
  const counts = /* @__PURE__ */ new Map();
  try {
    for (const key of keysOfMember(text, "mcp")) counts.set(key, (counts.get(key) ?? 0) + 1);
  } catch {
    return [];
  }
  return [...counts.entries()].flatMap(([key, count]) => count > 1 ? [key] : []);
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
  const next = spliceMember(previous, "mcp", JSON.stringify(mcp, null, 2));
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

// src/core/servers.ts
var ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
var MAX_COMMAND_ITEMS = 64;
var MAX_STRING = 4096;
var MAX_ENTRIES = 500;
var MAX_TIMEOUT = 6e5;
var MAX_IMPORT_BYTES = 512 * 1024;
var IMPORT_TIMEOUT_MS = 15e3;
var isPlainObject2 = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
var objectKeys = (value, label, errors, warnings) => {
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
var analyzeDefinition = (value) => {
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
    oauth: "none",
    errors,
    warnings
  };
  if (!isPlainObject2(value)) {
    errors.push("Definition must be a JSON object");
    return info;
  }
  const declaredType = value.type;
  if (declaredType !== void 0 && declaredType !== "local" && declaredType !== "remote") {
    errors.push('type must be "local" or "remote"');
  }
  const hasCommand = value.command !== void 0;
  const hasUrl = value.url !== void 0;
  const type = declaredType === "local" || declaredType === "remote" ? declaredType : hasCommand && !hasUrl ? "local" : hasUrl && !hasCommand ? "remote" : null;
  if (!type) {
    if (declaredType === void 0) errors.push("type is required, or a command (local) or url (remote) must be given");
    return info;
  }
  info.transport = type;
  if (type === "local") {
    info.command = stringList(value.command, "command", errors);
    if (value.cwd !== void 0) {
      if (typeof value.cwd !== "string" || value.cwd.length === 0 || value.cwd.length > MAX_STRING) {
        errors.push("cwd must be a non-empty string");
      } else {
        info.cwd = value.cwd;
      }
    }
    if (value.url !== void 0) warnings.push("url is ignored for a local server");
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
  }
  info.environmentKeys = objectKeys(value.environment, "environment", errors, warnings);
  info.headerKeys = objectKeys(value.headers, "headers", errors, warnings);
  if (value.timeout !== void 0) {
    if (typeof value.timeout !== "number" || !Number.isFinite(value.timeout) || value.timeout <= 0) {
      errors.push("timeout must be a positive number of milliseconds");
    } else if (value.timeout > MAX_TIMEOUT) {
      errors.push(`timeout cannot exceed ${MAX_TIMEOUT} ms`);
    } else {
      info.timeout = value.timeout;
    }
  }
  if (value.enabled !== void 0 && typeof value.enabled !== "boolean") {
    errors.push("enabled must be a boolean");
  }
  if (value.oauth === false) info.oauth = "disabled";
  else if (isPlainObject2(value.oauth)) info.oauth = "configured";
  else if (value.oauth === void 0) info.oauth = type === "remote" ? "auto" : "none";
  else if (value.oauth !== true) errors.push("oauth must be an object or false");
  return info;
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
var collect = (configs) => {
  const entries = [];
  const configConflicts = [];
  for (const config of configs) {
    if (config.error) {
      configConflicts.push({
        kind: "read-error",
        serverId: "",
        message: `Cannot read ${config.path}: ${config.error}`,
        paths: [config.path],
        blocking: true
      });
      continue;
    }
    if (config.parseError) {
      configConflicts.push({
        kind: "read-error",
        serverId: "",
        message: `${config.parseError} (${config.path})`,
        paths: [config.path],
        blocking: true
      });
      continue;
    }
    if (config.data && config.data.mcp !== void 0 && !isPlainObject2(config.data.mcp)) {
      configConflicts.push({
        kind: "invalid",
        serverId: "",
        message: `"mcp" in ${config.name} must be an object of servers; the block is ignored`,
        paths: [config.path],
        blocking: true
      });
      continue;
    }
    for (const key of config.duplicateKeys) {
      configConflicts.push({
        kind: "duplicate",
        serverId: key,
        message: `"${key}" is defined more than once in ${config.name}; OpenCode keeps only the last one`,
        paths: [config.path],
        blocking: false
      });
    }
    if (!config.mcp) continue;
    const patterns = toolsDisabledPatterns(config);
    for (const [id, value] of Object.entries(config.mcp)) {
      const definition = isPlainObject2(value) ? value : null;
      const info = analyzeDefinition(value);
      const off = patterns.filter((pattern) => patternCovers(pattern, id));
      if (off.length > 0) info.warnings.push(`tools disabled by ${off.map((item) => `"${item}"`).join(", ")}`);
      entries.push({
        id,
        path: config.path,
        definition,
        info,
        enabled: definition?.enabled !== false,
        hash: hashOf(definition),
        toolsOff: off
      });
    }
  }
  return { entries, configConflicts };
};
var buildResponse = (configs) => {
  const { entries, configConflicts } = collect(configs);
  const groups = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const group = groups.get(entry.id);
    if (group) group.push(entry);
    else groups.set(entry.id, [entry]);
  }
  const servers = [];
  for (const [id, group] of groups) {
    group.sort((left, right) => left.path.localeCompare(right.path));
    const winner = group.at(-1) ?? group[0];
    if (!winner) continue;
    const paths = Array.from(new Set(group.map((entry) => entry.path)));
    const both = paths.length > 1;
    const conflicts2 = [];
    const push = (conflict) => {
      const duplicate = conflicts2.some(
        (item) => item.kind === conflict.kind && item.message === conflict.message && item.paths.join() === conflict.paths.join()
      );
      if (!duplicate) conflicts2.push(conflict);
    };
    if (both) {
      push({
        kind: "both",
        serverId: id,
        message: `"${id}" is defined in ${paths.length} config files; OpenCode loads only one of them`,
        paths,
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
    if (winner.toolsOff) {
      push({
        kind: "tools-off",
        serverId: id,
        message: 'Server is enabled but its tools are disabled by the "tools" section; the model cannot call them',
        paths: [winner.path],
        blocking: false
      });
    }
    const state = both ? "conflict" : winner.info.errors.length > 0 ? "invalid" : winner.enabled ? "enabled" : "disabled";
    const advertised = state === "enabled" && winner.toolsOff.length === 0;
    servers.push({
      id,
      transport: winner.info.transport,
      command: winner.info.command,
      url: winner.info.url,
      cwd: winner.info.cwd,
      environmentKeys: winner.info.environmentKeys,
      headerKeys: winner.info.headerKeys,
      timeout: winner.info.timeout,
      oauth: winner.info.oauth,
      enabled: winner.enabled,
      state,
      advertised,
      toolsOff: winner.toolsOff,
      paths,
      conflicts: conflicts2,
      warnings: Array.from(/* @__PURE__ */ new Set([...winner.info.warnings, ...conflicts2.filter((item) => !item.blocking).map((item) => item.message)])),
      contentHash: winner.hash
    });
  }
  servers.sort((left, right) => left.id.localeCompare(right.id));
  const conflicts = [...configConflicts, ...servers.flatMap((server2) => server2.conflicts)];
  const blocking = conflicts.filter((item) => item.blocking);
  const summary = {
    total: servers.length,
    advertised: servers.filter((server2) => server2.advertised).length,
    enabled: servers.filter((server2) => server2.enabled && server2.state !== "conflict").length,
    disabled: servers.filter((server2) => server2.state === "disabled").length,
    invalid: servers.filter((server2) => server2.state === "invalid" || server2.state === "conflict").length,
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
var scanServers = async (home) => buildResponse(await loadConfigs(home));
var ownersOf = (configs, id) => configs.filter((config) => config.mcp && Object.prototype.hasOwnProperty.call(config.mcp, id));
var failList = (title, ids) => {
  throw new McpError("invalid-manifest", 400, `${title}: ${ids.join(", ")}`);
};
var assertIdKnown = (configs, id) => {
  if (!id) throw new McpError("invalid-request", 400, "Missing id");
  if (id.length > 128) throw new McpError("invalid-request", 400, "id is too long");
  const owners = ownersOf(configs, id);
  if (owners.length === 0) throw new McpError("not-found", 404, `MCP server ${id} not found`);
  return owners;
};
var definitionOf = (config, id) => {
  const value = config.mcp?.[id];
  if (!isPlainObject2(value)) {
    throw new McpError("invalid-definition", 409, `MCP server ${id} is not a JSON object; edit its definition first`);
  }
  return value;
};
var applyEnabled = (configs, id, enabled) => {
  const owners = assertIdKnown(configs, id);
  if (owners.length > 1) {
    throw new McpError("conflict", 409, `MCP server ${id} is defined in ${owners.length} config files; resolve the duplicate first`);
  }
  const config = owners[0];
  if (!config || !config.mcp) throw new McpError("not-found", 404, `MCP server ${id} not found`);
  const mcp = { ...config.mcp };
  mcp[id] = { ...definitionOf(config, id), enabled };
  return { path: config.path, mcp };
};
var setServerEnabled = async (home, id, enabled) => {
  const configs = await loadConfigs(home);
  const write = applyEnabled(configs, id, enabled);
  await writeMcpBlock(write.path, write.mcp);
  return scanServers(home);
};
var collectBatch = (configs, enable, disable) => {
  const writes = /* @__PURE__ */ new Map();
  for (const [enabled, ids] of [
    [true, enable],
    [false, disable]
  ]) {
    for (const id of ids) {
      const write = applyEnabled(configs, id, enabled);
      writes.set(write.path, write.mcp);
    }
  }
  return writes;
};
var batchSetEnabled = async (home, enable, disable) => {
  const configs = await loadConfigs(home);
  const enableIds = Array.from(new Set(enable));
  const disableIds = Array.from(new Set(disable));
  if (enableIds.some((id) => disableIds.includes(id))) {
    throw new McpError("invalid-request", 400, "The same server cannot be enabled and disabled at once");
  }
  if (enableIds.length + disableIds.length > 200) {
    throw new McpError("invalid-request", 400, "Too many servers in one request");
  }
  if (enableIds.length + disableIds.length === 0) {
    return { ...buildResponse(configs), changed: [] };
  }
  const writes = collectBatch(configs, enableIds, disableIds);
  for (const [file, mcp] of writes) await writeMcpBlock(file, mcp);
  const after = await scanServers(home);
  return { ...after, changed: [...enableIds, ...disableIds] };
};
var bulkSetEnabled = async (home, enabled) => {
  const configs = await loadConfigs(home);
  const before = buildResponse(configs);
  const blocking = before.conflicts.filter((conflict) => conflict.blocking);
  if (blocking.length > 0) {
    throw new McpError("conflict", 409, "Config problems remain; bulk changes are blocked", blocking);
  }
  const ids = before.servers.filter((server2) => server2.enabled !== enabled).map((server2) => server2.id);
  const writable = ids.filter((id) => ownersOf(configs, id).length === 1);
  if (writable.length !== ids.length) {
    throw new McpError("conflict", 409, "Some servers are defined in two config files; resolve the duplicates first");
  }
  if (writable.length === 0) return { ...before, changed: [] };
  const writes = collectBatch(configs, enabled ? writable : [], enabled ? [] : writable);
  for (const [file, mcp] of writes) await writeMcpBlock(file, mcp);
  const after = await scanServers(home);
  return { ...after, changed: writable };
};
var preserveSecrets = (next, previous) => {
  if (!previous) return;
  for (const field of ["environment", "headers"]) {
    const source = previous[field];
    const target = next[field];
    if (!isPlainObject2(source) || !isPlainObject2(target)) continue;
    const merged = { ...target };
    for (const [key, value] of Object.entries(target)) {
      if (value !== "") continue;
      const prior = source[key];
      if (typeof prior === "string" && prior.length > 0) merged[key] = prior;
      else delete merged[key];
    }
    next[field] = merged;
  }
  const oauth = next.oauth;
  const priorOauth = previous.oauth;
  if (isPlainObject2(oauth) && isPlainObject2(priorOauth) && !oauth.clientSecret && priorOauth.clientSecret) {
    next.oauth = { ...oauth, clientSecret: priorOauth.clientSecret };
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
  if (previousId && !previousId.trim()) throw new McpError("invalid-request", 400, "previousId is invalid");
  const definition = { ...input.definition };
  definition.enabled = input.enabled !== false;
  const info = analyzeDefinition(definition);
  if (info.errors.length > 0) {
    throw new McpError("invalid-definition", 400, `Definition is invalid: ${info.errors.join("; ")}`);
  }
  const configs = await loadConfigs(home);
  const broken = configs.find((config) => config.parseError);
  if (broken?.parseError) {
    throw new McpError("invalid-config", 409, `${broken.parseError}. Fix the file before adding servers.`);
  }
  const previousOwners = ownersOf(configs, previousId);
  const target = previousOwners[0] ?? configs.find((config) => config.exists) ?? configs[0];
  if (!target) throw new McpError("write-error", 500, "No OpenCode config path available");
  const previousDefinition = target.mcp?.[previousId];
  preserveSecrets(definition, isPlainObject2(previousDefinition) ? previousDefinition : void 0);
  const mcp = { ...target.mcp ?? {} };
  if (previousOwners.length > 0 && previousId !== id) delete mcp[previousId];
  mcp[id] = definition;
  if (Object.keys(mcp).length > MAX_ENTRIES) {
    throw new McpError("invalid-request", 400, `Cannot have more than ${MAX_ENTRIES} MCP servers`);
  }
  const backupPath = await writeMcpBlock(target.path, mcp);
  for (const owner of previousOwners) {
    if (owner.path === target.path || !owner.mcp) continue;
    const other = { ...owner.mcp };
    delete other[id === previousId ? id : previousId];
    await writeMcpBlock(owner.path, other);
  }
  const after = await scanServers(home);
  return { ...after, id, backupPath };
};
var readDefinition = async (home, id) => {
  const configs = await loadConfigs(home);
  const owners = assertIdKnown(configs, id);
  if (owners.length > 1) {
    throw new McpError("conflict", 409, `MCP server ${id} is defined in ${owners.length} config files; resolve the duplicate first`);
  }
  const config = owners[0];
  if (!config) throw new McpError("not-found", 404, `MCP server ${id} not found`);
  const definition = JSON.parse(JSON.stringify(definitionOf(config, id)));
  const masked = [];
  for (const field of ["environment", "headers"]) {
    const block = definition[field];
    if (!isPlainObject2(block)) continue;
    for (const key of Object.keys(block)) {
      block[key] = "";
      masked.push(`${field}.${key}`);
    }
  }
  if (isPlainObject2(definition.oauth) && typeof definition.oauth.clientSecret === "string" && definition.oauth.clientSecret) {
    definition.oauth = { ...definition.oauth, clientSecret: "" };
    masked.push("oauth.clientSecret");
  }
  return { id, definition, paths: [config.path], maskedPaths: masked };
};
var removeServer = async (home, id) => {
  const configs = await loadConfigs(home);
  const owners = assertIdKnown(configs, id);
  const removedPaths = [];
  for (const owner of owners) {
    if (!owner.mcp) continue;
    const mcp = { ...owner.mcp };
    delete mcp[id];
    await writeMcpBlock(owner.path, mcp);
    removedPaths.push(owner.path);
  }
  const after = await scanServers(home);
  return { ...after, id, removedPaths };
};
var resolveDuplicate = async (home, id, keepPath) => {
  const configs = await loadConfigs(home);
  const owners = assertIdKnown(configs, id);
  if (owners.length < 2) throw new McpError("not-found", 404, `MCP server ${id} is not defined twice`);
  const keep = owners.find((owner) => owner.path === keepPath);
  if (!keep) throw new McpError("invalid-request", 400, "keep must be one of the config paths that define this server");
  let backupPath = `${keepPath}.mcp-manager.bak`;
  for (const owner of owners) {
    if (owner.path === keepPath || !owner.mcp) continue;
    const mcp = { ...owner.mcp };
    delete mcp[id];
    backupPath = await writeMcpBlock(owner.path, mcp) ?? backupPath;
  }
  return { ...await scanServers(home), backupPath };
};
var looksLikeDefinition = (value) => value.type === "local" || value.type === "remote" || value.command !== void 0 || value.url !== void 0;
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
    const target = path3.resolve(value.trim());
    let text;
    try {
      const info = await fs3.stat(target);
      if (info.isDirectory()) {
        const candidates = ["mcp.json", ".mcp.json", "opencode.json", "opencode.jsonc"];
        let found = null;
        for (const candidate of candidates) {
          const file = path3.join(target, candidate);
          try {
            await fs3.access(file);
            found = file;
            break;
          } catch {
          }
        }
        if (!found) {
          throw new McpError("import-failed", 404, `No mcp.json, .mcp.json or opencode.json in ${target}`);
        }
        text = await fs3.readFile(found, "utf8");
        return { text, source: found };
      }
      text = await fs3.readFile(target, "utf8");
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError("import-failed", 400, `Cannot read ${target}: ${describeFs(error)}`);
    }
    if (text.length > MAX_IMPORT_BYTES) throw new McpError("import-failed", 400, "Manifest is larger than 512 KB");
    return { text, source: target };
  }
  throw new McpError("invalid-request", 400, "kind must be paste, url or path");
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
  const drafts = [];
  const candidates = [];
  if (isPlainObject2(parsed.mcp)) {
    for (const [id, definition] of Object.entries(parsed.mcp)) candidates.push([id, definition]);
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
  const invalid = [];
  for (const [id, definition] of candidates) {
    if (!ID_PATTERN.test(id)) {
      invalid.push(`${id} (invalid id)`);
      continue;
    }
    if (!isPlainObject2(definition)) {
      invalid.push(`${id} (not an object)`);
      continue;
    }
    const info = analyzeDefinition(definition);
    if (info.errors.length > 0) invalid.push(`${id} (${info.errors[0]})`);
    else drafts.push({ id, definition, enabled: definition.enabled !== false });
  }
  if (invalid.length > 0) failList("Manifest contains invalid servers", invalid);
  const current = buildResponse(await loadConfigs(home));
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
