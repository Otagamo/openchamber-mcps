import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type {
  BatchResponse,
  BulkResponse,
  ConfigView,
  ConflictView,
  ContainerKind,
  DefinedServer,
  DetailResponse,
  ImportResponse,
  RemoveResponse,
  ResolveResponse,
  SaveResponse,
  ServersResponse,
  ServerState,
  ServerView,
  Summary,
  TransportKind,
} from '../shared/types.ts';
import { McpError } from './errors.ts';
import { describeFs, loadConfigs, primaryConfigPath, writeMcpBlock, type LoadedConfig } from './config.ts';
import { parseJsonc } from './jsonc.ts';
import { readServerOutcomes } from './logs.ts';

export const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const MAX_COMMAND_ITEMS = 64;
const MAX_STRING = 4096;
const MAX_ENTRIES = 500;
const MAX_TIMEOUT = 3_600_000;
const MAX_IMPORT_BYTES = 512 * 1024;
const IMPORT_TIMEOUT_MS = 15_000;
/** Keys of the `mcp` object that are not servers: the current container and the global timeout. */
const RESERVED_KEYS = new Set(['servers', 'timeout']);
const TIMEOUT_KEYS = ['startup', 'catalog', 'execution'] as const;

export type DefInfo = {
  transport: TransportKind;
  command: string[];
  url: string | null;
  cwd: string | null;
  environmentKeys: string[];
  headerKeys: string[];
  timeout: string | null;
  codemode: boolean;
  protocol: string | null;
  oauth: 'auto' | 'disabled' | 'configured' | 'none';
  enabled: boolean;
  errors: string[];
  warnings: string[];
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** A value that carries server-definition fields rather than a global `mcp` setting. */
const looksLikeDefinition = (value: unknown): boolean =>
  isPlainObject(value) && (value.type !== undefined || value.command !== undefined || value.url !== undefined);

const stringList = (value: unknown, label: string, errors: string[]): string[] => {
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
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.length === 0 || item.length > MAX_STRING) {
      errors.push(`${label} entries must be non-empty strings under ${MAX_STRING} characters`);
      return [];
    }
    out.push(item);
  }
  return out;
};

const objectKeys = (value: unknown, label: string, errors: string[], warnings: string[]): string[] => {
  if (value === undefined) return [];
  if (!isPlainObject(value)) {
    errors.push(`${label} must be an object`);
    return [];
  }
  const keys: string[] = [];
  for (const [key, item] of Object.entries(value)) {
    if (!key || key.length > 128) {
      errors.push(`${label} contains an invalid key`);
      continue;
    }
    if (typeof item !== 'string') warnings.push(`${label}.${key} is not a string; OpenCode expects strings`);
    keys.push(key);
  }
  return keys;
};

const formatMs = (ms: number): string => (ms % 1000 === 0 ? `${ms / 1000}s` : `${ms}ms`);

const positiveInt = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= MAX_TIMEOUT ? value : null;

/**
 * `mcp.servers` timeouts are `{startup, catalog, execution}`; a bare number is the old shape.
 */
const timeoutInfo = (
  value: unknown,
  container: ContainerKind,
  errors: string[],
  warnings: string[],
): string | null => {
  if (value === undefined) return null;
  if (container === 'legacy') {
    if (isPlainObject(value)) {
      errors.push('timeout must be a positive whole number of milliseconds in a deprecated entry');
      return null;
    }
    const ms = positiveInt(value);
    if (ms === null) {
      errors.push(`timeout must be a positive whole number of milliseconds up to ${MAX_TIMEOUT}`);
      return null;
    }
    return formatMs(ms);
  }
  if (typeof value === 'number') {
    errors.push('timeout must be an object with startup, catalog or execution (milliseconds); a bare number is the deprecated shape');
    return null;
  }
  if (!isPlainObject(value)) {
    errors.push('timeout must be an object with startup, catalog or execution');
    return null;
  }
  const parts: string[] = [];
  for (const [key, raw] of Object.entries(value)) {
    if (!(TIMEOUT_KEYS as readonly string[]).includes(key)) {
      warnings.push(`timeout.${key} is not a recognized timeout field and is ignored`);
      continue;
    }
    const ms = positiveInt(raw);
    if (ms === null) errors.push(`timeout.${key} must be a positive whole number of milliseconds`);
    else parts.push(`${key} ${formatMs(ms)}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
};

const flagInfo = (
  value: Record<string, unknown>,
  container: ContainerKind,
  errors: string[],
  warnings: string[],
): boolean => {
  if (container === 'servers') {
    if (value.enabled !== undefined) warnings.push('"enabled" is the deprecated flag; use "disabled" inside mcp.servers');
    if (value.disabled !== undefined && typeof value.disabled !== 'boolean') errors.push('disabled must be a boolean');
    return value.disabled !== true;
  }
  if (value.disabled !== undefined) warnings.push('"disabled" is ignored in a deprecated entry; use "enabled"');
  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') errors.push('enabled must be a boolean');
  return value.enabled !== false;
};

/** Validates one server definition against the current (`mcp.servers`) or deprecated shape. */
export const analyzeDefinition = (value: unknown, container: ContainerKind = 'servers'): DefInfo => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: DefInfo = {
    transport: 'unknown',
    command: [],
    url: null,
    cwd: null,
    environmentKeys: [],
    headerKeys: [],
    timeout: null,
    codemode: false,
    protocol: null,
    oauth: 'none',
    enabled: true,
    errors,
    warnings,
  };
  if (!isPlainObject(value)) {
    errors.push('Definition must be a JSON object');
    return info;
  }

  info.enabled = flagInfo(value, container, errors, warnings);
  info.timeout = timeoutInfo(value.timeout, container, errors, warnings);
  info.environmentKeys = objectKeys(value.environment, 'environment', errors, warnings);
  info.headerKeys = objectKeys(value.headers, 'headers', errors, warnings);

  if (container === 'servers') {
    if (value.codemode !== undefined) {
      if (typeof value.codemode !== 'boolean') errors.push('codemode must be a boolean');
      else info.codemode = value.codemode;
    }
    if (value.protocol !== undefined) {
      if (value.protocol !== 'legacy' && value.protocol !== 'auto' && value.protocol !== '2026-07-28') {
        errors.push('protocol must be "legacy", "auto" or "2026-07-28"');
      } else {
        info.protocol = value.protocol;
      }
    }
  } else if (value.codemode !== undefined || value.protocol !== undefined) {
    warnings.push('codemode and protocol are only read from mcp.servers; move this server there to use them');
  }

  if (value.oauth === false) info.oauth = 'disabled';
  else if (isPlainObject(value.oauth)) info.oauth = 'configured';
  else if (value.oauth === undefined) info.oauth = 'none';
  else errors.push('oauth must be an object or false');

  const declaredType = value.type;
  if (declaredType === undefined) {
    // The deprecated shape allows a stub entry that only carries the on/off flag.
    if (container === 'legacy' && value.enabled !== undefined && !looksLikeDefinition(value)) {
      warnings.push('Definition only sets "enabled"; add type and command or url');
      return info;
    }
    errors.push('type is required ("local" or "remote")');
    return info;
  }
  if (declaredType !== 'local' && declaredType !== 'remote') {
    errors.push('type must be "local" or "remote"');
    return info;
  }
  info.transport = declaredType;

  if (declaredType === 'local') {
    info.command = stringList(value.command, 'command', errors);
    if (value.cwd !== undefined) {
      if (typeof value.cwd !== 'string' || value.cwd.length === 0 || value.cwd.length > MAX_STRING) {
        errors.push('cwd must be a non-empty string');
      } else {
        info.cwd = value.cwd;
      }
    }
    if (value.url !== undefined) warnings.push('url is ignored for a local server');
    if (value.headers !== undefined) warnings.push('headers are ignored for a local server');
  } else {
    info.url = typeof value.url === 'string' ? value.url : null;
    if (!info.url) {
      errors.push('url is required for a remote server');
    } else if (info.url.length > MAX_STRING) {
      errors.push(`url cannot exceed ${MAX_STRING} characters`);
    } else {
      let parsedUrl: URL | null = null;
      try {
        parsedUrl = new URL(info.url);
      } catch {
        errors.push('url is not a valid URL');
      }
      if (parsedUrl && parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        errors.push('url must use http or https');
      } else if (parsedUrl?.protocol === 'http:') {
        warnings.push('url uses plain http; headers and tokens travel unencrypted');
      }
    }
    if (value.command !== undefined) warnings.push('command is ignored for a remote server');
    if (value.environment !== undefined) warnings.push('environment is ignored for a remote server');
  }

  return info;
};

type Entry = {
  id: string;
  path: string;
  container: ContainerKind;
  definition: Record<string, unknown> | null;
  info: DefInfo;
  hash: string;
  toolsOff: string[];
};

export const targetOf = (entry: { path: string; container: ContainerKind }): string =>
  `${entry.path}#${entry.container}`;

const splitTarget = (target: string): { path: string; container: ContainerKind } | null => {
  const index = target.lastIndexOf('#');
  if (index <= 0) return null;
  const container = target.slice(index + 1);
  if (container !== 'servers' && container !== 'legacy') return null;
  return { path: target.slice(0, index), container };
};

const toolsDisabledPatterns = (config: LoadedConfig): string[] => {
  const tools = config.data?.tools;
  if (!isPlainObject(tools)) return [];
  return Object.entries(tools).flatMap(([pattern, value]) => (value === false ? [pattern] : []));
};

const patternCovers = (pattern: string, id: string): boolean => {
  if (pattern === '*') return true;
  const base = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
  if (base === '') return true;
  return base === id || base.startsWith(`${id}_`) || base.startsWith(`${id}.`);
};

const hashOf = (definition: Record<string, unknown> | null): string =>
  definition ? createHash('sha256').update(JSON.stringify(definition)).digest('hex') : '';

const pushEntry = (
  entries: Entry[],
  config: LoadedConfig,
  patterns: string[],
  id: string,
  value: unknown,
  container: ContainerKind,
): void => {
  const definition = isPlainObject(value) ? value : null;
  const info = analyzeDefinition(value, container);
  const off = patterns.filter((pattern) => patternCovers(pattern, id));
  entries.push({
    id,
    path: config.path,
    container,
    definition,
    info,
    hash: hashOf(definition),
    toolsOff: off,
  });
};

const collect = (configs: LoadedConfig[]): { entries: Entry[]; configConflicts: ConflictView[] } => {
  const entries: Entry[] = [];
  const configConflicts: ConflictView[] = [];
  for (const config of configs) {
    if (config.error || config.parseError) {
      configConflicts.push({
        kind: 'read-error',
        serverId: '',
        message: config.error ? `Cannot read ${config.path}: ${config.error}` : `${config.parseError} (${config.path})`,
        paths: [config.path],
        blocking: true,
      });
      continue;
    }
    if (!config.data) continue;
    if (config.data.mcp !== undefined && !isPlainObject(config.data.mcp)) {
      configConflicts.push({
        kind: 'invalid',
        serverId: '',
        message: `"mcp" in ${config.name} must be an object; the block is ignored`,
        paths: [config.path],
        blocking: true,
      });
      continue;
    }
    for (const key of config.duplicateKeys) {
      configConflicts.push({
        kind: 'duplicate',
        serverId: key,
        message: `"${key}" is defined more than once in the mcp block of ${config.name}; OpenCode keeps only the last one`,
        paths: [config.path],
        blocking: false,
      });
    }
    const mcp = config.mcp;
    if (!mcp) continue;
    const patterns = toolsDisabledPatterns(config);

    if (mcp.servers !== undefined && !isPlainObject(mcp.servers)) {
      configConflicts.push({
        kind: 'invalid',
        serverId: '',
        message: `"mcp.servers" in ${config.name} must be an object of servers; no server in that file is listed`,
        paths: [config.path],
        blocking: true,
      });
    } else if (isPlainObject(mcp.servers)) {
      for (const [id, value] of Object.entries(mcp.servers)) pushEntry(entries, config, patterns, id, value, 'servers');
    }
    for (const [id, value] of Object.entries(mcp)) {
      if (RESERVED_KEYS.has(id) && (id === 'servers' || !looksLikeDefinition(value))) continue;
      pushEntry(entries, config, patterns, id, value, 'legacy');
    }
  }
  return { entries, configConflicts };
};

const containerLabel = (container: ContainerKind): string =>
  container === 'servers' ? 'mcp.servers' : 'a deprecated top-level entry';

const buildResponse = async (home: string, configs: LoadedConfig[]): Promise<ServersResponse> => {
  const { entries, configConflicts } = collect(configs);
  const failures = await readServerOutcomes(home);
  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const group = groups.get(entry.id);
    if (group) group.push(entry);
    else groups.set(entry.id, [entry]);
  }

  const servers: ServerView[] = [];
  for (const [id, group] of groups) {
    group.sort((left, right) => {
      if (left.container !== right.container) return left.container === 'servers' ? 1 : -1;
      return left.path.localeCompare(right.path);
    });
    const winner = group.at(-1) ?? group[0];
    if (!winner) continue;
    const duplicate = group.length > 1;
    const conflicts: ConflictView[] = [];
    const push = (conflict: ConflictView): void => {
      const seen = conflicts.some(
        (item) => item.kind === conflict.kind && item.message === conflict.message && item.paths.join() === conflict.paths.join(),
      );
      if (!seen) conflicts.push(conflict);
    };

    if (duplicate) {
      push({
        kind: 'both',
        serverId: id,
        message: `"${id}" is defined in ${group.length} places: ${group
          .map((entry) => `${path.basename(entry.path)} (${containerLabel(entry.container)})`)
          .join(', ')}; OpenCode loads only one`,
        paths: Array.from(new Set(group.map((entry) => entry.path))),
        blocking: true,
      });
    }
    if (winner.info.errors.length > 0) {
      push({
        kind: 'invalid',
        serverId: id,
        message: `Definition is invalid: ${winner.info.errors.join('; ')}`,
        paths: [winner.path],
        blocking: false,
      });
    }
    if (winner.info.warnings.some((warning) => warning.startsWith('Definition only sets'))) {
      push({
        kind: 'stub',
        serverId: id,
        message: `${containerLabel(winner.container)} for "${id}" only sets the on/off flag; it defines no command or url`,
        paths: [winner.path],
        blocking: false,
      });
    }
    if (winner.toolsOff.length > 0) {
      push({
        kind: 'tools-off',
        serverId: id,
        message: 'Server is enabled but its tools are disabled by the "tools" section; the model cannot call them',
        paths: [winner.path],
        blocking: false,
      });
    }

    const invalid = winner.info.errors.length > 0;
    const state: ServerState = duplicate ? 'conflict' : invalid ? 'invalid' : winner.info.enabled ? 'enabled' : 'disabled';
    const advertised = state === 'enabled' && winner.toolsOff.length === 0;
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
      conflicts,
      warnings: Array.from(
        new Set([...winner.info.warnings, ...conflicts.filter((item) => !item.blocking).map((item) => item.message)]),
      ),
      failure: failures.get(id) ?? null,
      contentHash: winner.hash,
    });
  }

  servers.sort((left, right) => left.id.localeCompare(right.id));
  const conflicts = [...configConflicts, ...servers.flatMap((server) => server.conflicts)];
  const blocking = conflicts.filter((item) => item.blocking);
  const summary: Summary = {
    total: servers.length,
    advertised: servers.filter((server) => server.advertised).length,
    enabled: servers.filter((server) => server.state === 'enabled').length,
    disabled: servers.filter((server) => server.state === 'disabled').length,
    invalid: servers.filter((server) => server.state === 'invalid' || server.state === 'conflict').length,
    legacy: servers.filter((server) => server.container === 'legacy').length,
    blockingConflicts: blocking.length,
    warnings: conflicts.length - blocking.length,
  };

  const view = (config: LoadedConfig): ConfigView => ({
    path: config.path,
    exists: config.exists,
    error: config.error ?? config.parseError,
  });
  const primary = configs[0];
  return {
    servers,
    conflicts,
    summary,
    config: primary ? view(primary) : { path: primaryConfigPath(''), exists: false, error: null },
    scanned: configs.map(view),
    scannedAt: Date.now(),
  };
};

export const scanServers = async (home: string): Promise<ServersResponse> => buildResponse(home, await loadConfigs(home));

const entriesOf = async (home: string): Promise<{ configs: LoadedConfig[]; entries: Entry[] }> => {
  const configs = await loadConfigs(home);
  return { configs, entries: collect(configs).entries };
};

const entriesFor = (entries: Entry[], id: string): Entry[] => entries.filter((entry) => entry.id === id);

const assertKnown = (entries: Entry[], id: string): Entry[] => {
  if (!id) throw new McpError('invalid-request', 400, 'Missing id');
  if (id.length > 128) throw new McpError('invalid-request', 400, 'id is too long');
  const found = entriesFor(entries, id);
  if (found.length === 0) throw new McpError('not-found', 404, `MCP server ${id} not found`);
  if (found.length > 1) {
    throw new McpError('conflict', 409, `MCP server ${id} is defined in ${found.length} places; resolve the duplicate first`);
  }
  return found;
};

const containerWrite = (
  config: LoadedConfig,
  container: ContainerKind,
  id: string,
  definition: Record<string, unknown> | null,
): Record<string, unknown> => {
  const mcp: Record<string, unknown> = { ...(config.mcp ?? {}) };
  if (container === 'servers') {
    const servers: Record<string, unknown> = isPlainObject(mcp.servers) ? { ...mcp.servers } : {};
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

const withFlag = (
  definition: Record<string, unknown>,
  container: ContainerKind,
  enabled: boolean,
): Record<string, unknown> => {
  const key = container === 'servers' ? 'disabled' : 'enabled';
  const other = container === 'servers' ? 'enabled' : 'disabled';
  const value = container === 'servers' ? !enabled : enabled;
  const next: Record<string, unknown> = {};
  for (const [name, item] of Object.entries(definition)) {
    if (name === other) continue;
    next[name] = name === key ? value : item;
  }
  if (!(key in next)) next[key] = value;
  return next;
};

const writeToggle = async (
  configs: LoadedConfig[],
  entries: Entry[],
  id: string,
  enabled: boolean,
): Promise<void> => {
  const [entry] = assertKnown(entries, id);
  if (!entry) return;
  const config = configs.find((item) => item.path === entry.path);
  if (!config) throw new McpError('not-found', 404, `Config for ${id} not found`);
  if (!entry.definition) throw new McpError('invalid-definition', 409, `MCP server ${id} is not a JSON object; edit its definition first`);
  await writeMcpBlock(entry.path, containerWrite(config, entry.container, id, withFlag(entry.definition, entry.container, enabled)));
};

export const setServerEnabled = async (home: string, id: string, enabled: boolean): Promise<ServersResponse> => {
  const { configs, entries } = await entriesOf(home);
  await writeToggle(configs, entries, id, enabled);
  return scanServers(home);
};

export const batchSetEnabled = async (home: string, enable: string[], disable: string[]): Promise<BatchResponse> => {
  const { configs, entries } = await entriesOf(home);
  const enableIds = Array.from(new Set(enable));
  const disableIds = Array.from(new Set(disable));
  if (enableIds.some((id) => disableIds.includes(id))) {
    throw new McpError('invalid-request', 400, 'The same server cannot be enabled and disabled at once');
  }
  if (enableIds.length + disableIds.length > 200) {
    throw new McpError('invalid-request', 400, 'Too many servers in one request');
  }
  if (enableIds.length + disableIds.length === 0) return { ...(await buildResponse(home, configs)), changed: [] };

  const writes = new Map<string, Record<string, unknown>>();
  const stage = (id: string, enabled: boolean): void => {
    const [entry] = assertKnown(entries, id);
    if (!entry) return;
    const config = configs.find((item) => item.path === entry.path);
    if (!config) throw new McpError('invalid-definition', 409, `Config for ${id} not found`);
    if (!entry.definition) throw new McpError('invalid-definition', 409, `MCP server ${id} cannot be read`);
    const next = { ...(writes.get(entry.path) ?? config.mcp ?? {}) };
    const definition = withFlag(entry.definition, entry.container, enabled);
    if (entry.container === 'servers') {
      next.servers = { ...(isPlainObject(next.servers) ? next.servers : {}), [id]: definition };
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

export const bulkSetEnabled = async (home: string, enabled: boolean): Promise<BulkResponse> => {
  const { configs, entries } = await entriesOf(home);
  const before = await buildResponse(home, configs);
  const blocking = before.conflicts.filter((conflict) => conflict.blocking);
  if (blocking.length > 0) {
    throw new McpError('conflict', 409, 'Config problems remain; bulk changes are blocked', blocking);
  }
  const ids = before.servers.filter((server) => server.enabled !== enabled).map((server) => server.id);
  if (ids.length === 0) return { ...before, changed: [] };
  return { ...(await batchSetEnabled(home, enabled ? ids : [], enabled ? [] : ids)), changed: ids };
};

type SaveInput = {
  id?: string;
  previousId?: string;
  definition: unknown;
  enabled?: boolean;
};

const preserveSecrets = (next: Record<string, unknown>, previous: Record<string, unknown> | undefined): void => {
  if (!previous) return;
  for (const field of ['environment', 'headers'] as const) {
    const source = previous[field];
    const target = next[field];
    if (!isPlainObject(source) || !isPlainObject(target)) continue;
    const merged: Record<string, unknown> = { ...target };
    for (const [key, value] of Object.entries(target)) {
      if (value !== '') continue;
      const prior = source[key];
      if (typeof prior === 'string' && prior.length > 0) merged[key] = prior;
      else delete merged[key];
    }
    next[field] = merged;
  }
  const oauth = next.oauth;
  const priorOauth = previous.oauth;
  if (isPlainObject(oauth) && isPlainObject(priorOauth)) {
    const secret = oauth.client_secret ?? oauth.clientSecret;
    const prior = priorOauth.client_secret ?? priorOauth.clientSecret;
    if (!secret && typeof prior === 'string' && prior.length > 0) {
      next.oauth = { ...oauth, ...('client_secret' in priorOauth ? { client_secret: prior } : { clientSecret: prior }) };
    }
  }
};

export const saveServer = async (home: string, input: SaveInput): Promise<SaveResponse> => {
  if (!isPlainObject(input.definition)) throw new McpError('invalid-request', 400, 'definition must be a JSON object');
  const id = (input.id ?? input.previousId ?? '').trim();
  if (!id) throw new McpError('invalid-request', 400, 'Missing id');
  if (!ID_PATTERN.test(id)) {
    throw new McpError('invalid-request', 400, 'id must start with a letter or digit and use only letters, digits, dot, dash or underscore');
  }
  const previousId = input.previousId?.trim() ?? id;
  const { configs, entries } = await entriesOf(home);
  const broken = configs.find((config) => config.parseError);
  if (broken?.parseError) {
    throw new McpError('invalid-config', 409, `${broken.parseError}. Fix the file before saving servers.`);
  }

  const previousEntries = entriesFor(entries, previousId);
  if (previousEntries.length > 1) {
    throw new McpError('conflict', 409, `MCP server ${previousId} is defined in ${previousEntries.length} places; resolve the duplicate first`);
  }
  const previousEntry = previousEntries[0];
  const enabled = input.enabled !== false;
  const container: ContainerKind = previousEntry?.container ?? 'servers';
  const targetPath =
    previousEntry?.path ?? configs.find((config) => config.exists)?.path ?? configs[0]?.path ?? primaryConfigPath(home);

  let definition: Record<string, unknown> = { ...input.definition };
  delete definition.enabled;
  delete definition.disabled;
  preserveSecrets(definition, previousEntry?.definition ?? undefined);
  definition = withFlag(definition, container, enabled);

  const info = analyzeDefinition(definition, container);
  if (info.errors.length > 0) {
    throw new McpError('invalid-definition', 400, `Definition is invalid: ${info.errors.join('; ')}`);
  }

  const targetConfig = configs.find((config) => config.path === targetPath);
  if (!targetConfig) throw new McpError('write-error', 500, 'No OpenCode config path available');

  let mcp = containerWrite(targetConfig, container, id, definition);
  if (previousEntry && previousEntry.container === 'servers' && previousId !== id) {
    const servers = isPlainObject(mcp.servers) ? { ...mcp.servers } : {};
    delete servers[previousId];
    mcp = { ...mcp, servers };
  }
  if (previousEntry && previousEntry.container === 'legacy' && previousId !== id) delete mcp[previousId];

  const backupPath = await writeMcpBlock(targetPath, mcp);

  for (const other of previousEntries) {
    if (other.path === targetPath) continue;
    const otherConfig = configs.find((config) => config.path === other.path);
    if (!otherConfig) continue;
    await writeMcpBlock(other.path, containerWrite(otherConfig, other.container, previousId, null));
  }

  return { ...(await scanServers(home)), id, backupPath };
};

export const readDefinition = async (home: string, id: string): Promise<DetailResponse> => {
  const { entries } = await entriesOf(home);
  const [entry] = assertKnown(entries, id);
  if (!entry) throw new McpError('not-found', 404, `MCP server ${id} not found`);
  if (!entry.definition) {
    throw new McpError('invalid-definition', 409, `MCP server ${id} is not a JSON object; edit the config by hand`);
  }
  const definition = JSON.parse(JSON.stringify(entry.definition)) as Record<string, unknown>;
  const masked: string[] = [];
  for (const field of ['environment', 'headers'] as const) {
    const block = definition[field];
    if (!isPlainObject(block)) continue;
    for (const key of Object.keys(block)) {
      block[key] = '';
      masked.push(`${field}.${key}`);
    }
  }
  const oauth = definition.oauth;
  if (isPlainObject(oauth)) {
    for (const key of ['client_secret', 'clientSecret']) {
      if (typeof oauth[key] === 'string' && oauth[key]) {
        oauth[key] = '';
        masked.push(`oauth.${key}`);
      }
    }
  }
  return { id, container: entry.container, definition, paths: [entry.path], maskedPaths: masked };
};

export const removeServer = async (home: string, id: string): Promise<RemoveResponse> => {
  const { configs, entries } = await entriesOf(home);
  const owners = entriesFor(entries, id);
  if (owners.length === 0) throw new McpError('not-found', 404, `MCP server ${id} not found`);
  const removedPaths: string[] = [];
  for (const owner of owners) {
    const config = configs.find((item) => item.path === owner.path);
    if (!config) continue;
    await writeMcpBlock(owner.path, containerWrite(config, owner.container, id, null));
    removedPaths.push(owner.path);
  }
  return { ...(await scanServers(home)), id, removedPaths: Array.from(new Set(removedPaths)) };
};

export const resolveDuplicate = async (home: string, id: string, keepTarget: string): Promise<ResolveResponse> => {
  const { configs, entries } = await entriesOf(home);
  const owners = entriesFor(entries, id);
  if (owners.length < 2) throw new McpError('not-found', 404, `MCP server ${id} is not defined twice`);
  const parsed = splitTarget(keepTarget);
  const keep = owners.find((entry) => entry.path === parsed?.path && entry.container === parsed.container);
  if (!keep) throw new McpError('invalid-request', 400, 'keep must be one of the definitions reported for this server');
  let backupPath = `${keep.path}.mcp-manager.bak`;
  for (const owner of owners) {
    if (owner.path === keep.path && owner.container === keep.container) continue;
    const config = configs.find((item) => item.path === owner.path);
    if (!config) continue;
    backupPath = (await writeMcpBlock(owner.path, containerWrite(config, owner.container, id, null))) ?? backupPath;
  }
  return { ...(await scanServers(home)), backupPath };
};

const readImportText = async (kind: string, value: string): Promise<{ text: string; source: string }> => {
  if (kind === 'paste') {
    if (!value.trim()) throw new McpError('invalid-request', 400, 'Paste a manifest first');
    return { text: value, source: 'pasted manifest' };
  }
  if (kind === 'url') {
    let url: URL;
    try {
      url = new URL(value.trim());
    } catch {
      throw new McpError('invalid-request', 400, 'Enter a valid manifest URL');
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new McpError('invalid-request', 400, 'Manifest URL must use http or https');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
      if (!response.ok) throw new McpError('import-failed', 400, `Manifest download failed: HTTP ${response.status}`);
      const text = await response.text();
      if (text.length > MAX_IMPORT_BYTES) throw new McpError('import-failed', 400, 'Manifest is larger than 512 KB');
      return { text, source: url.toString() };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const message = error instanceof Error && error.name === 'AbortError' ? 'download timed out' : describeFs(error);
      throw new McpError('import-failed', 400, `Manifest download failed: ${message}`);
    } finally {
      clearTimeout(timer);
    }
  }
  if (kind === 'path') {
    const target = path.resolve(value.trim());
    let text: string;
    try {
      const info = await fs.stat(target);
      if (info.isDirectory()) {
        const candidates = ['mcp.json', '.mcp.json', 'opencode.json', 'opencode.jsonc'];
        let found: string | null = null;
        for (const candidate of candidates) {
          const file = path.join(target, candidate);
          try {
            await fs.access(file);
            found = file;
            break;
          } catch {
          }
        }
        if (!found) throw new McpError('import-failed', 404, `No mcp.json, .mcp.json or opencode.json in ${target}`);
        text = await fs.readFile(found, 'utf8');
        return { text, source: found };
      }
      text = await fs.readFile(target, 'utf8');
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError('import-failed', 400, `Cannot read ${target}: ${describeFs(error)}`);
    }
    if (text.length > MAX_IMPORT_BYTES) throw new McpError('import-failed', 400, 'Manifest is larger than 512 KB');
    return { text, source: target };
  }
  throw new McpError('invalid-request', 400, 'kind must be paste, url or path');
};

/** Imported servers always land in `mcp.servers`; old flat entries are normalized on the way in. */
const normalizeForImport = (definition: Record<string, unknown>): Record<string, unknown> => {
  const next = { ...definition };
  delete next.enabled;
  delete next.disabled;
  if (typeof next.timeout === 'number') next.timeout = { execution: next.timeout };
  return next;
};

export const importManifest = async (home: string, kind: string, value: string): Promise<ImportResponse> => {
  const { text, source } = await readImportText(kind, value);
  let parsed: unknown;
  try {
    parsed = parseJsonc(text);
  } catch (error) {
    throw new McpError('invalid-manifest', 400, `Manifest is not valid JSON(C): ${error instanceof Error ? error.message : 'parse error'}`);
  }
  if (!isPlainObject(parsed)) throw new McpError('invalid-manifest', 400, 'Manifest must be a JSON object');

  const candidates: Array<[string, unknown]> = [];
  if (isPlainObject(parsed.mcp)) {
    const block = parsed.mcp;
    if (isPlainObject(block.servers)) {
      for (const [id, definition] of Object.entries(block.servers)) candidates.push([id, definition]);
    }
    for (const [id, definition] of Object.entries(block)) {
      if (RESERVED_KEYS.has(id) && (id === 'servers' || !looksLikeDefinition(definition))) continue;
      candidates.push([id, definition]);
    }
  } else if (looksLikeDefinition(parsed)) {
    const name = typeof parsed.name === 'string' ? parsed.name : typeof parsed.id === 'string' ? parsed.id : '';
    if (!name) {
      throw new McpError('invalid-manifest', 400, 'A single server definition needs a "name" field, or wrap it in an "mcp" block');
    }
    const { name: _name, id: _id, ...definition } = parsed;
    candidates.push([name, definition]);
  } else {
    throw new McpError('invalid-manifest', 400, 'Manifest has no "mcp" block and is not a single server definition');
  }
  if (candidates.length === 0) throw new McpError('invalid-manifest', 400, 'Manifest contains no servers');
  if (candidates.length > MAX_ENTRIES) throw new McpError('invalid-manifest', 400, `Manifest has more than ${MAX_ENTRIES} servers`);

  const drafts: DefinedServer[] = [];
  const invalid: string[] = [];
  for (const [id, raw] of candidates) {
    if (!ID_PATTERN.test(id)) {
      invalid.push(`${id} (invalid id)`);
      continue;
    }
    if (!isPlainObject(raw)) {
      invalid.push(`${id} (not an object)`);
      continue;
    }
    const definition = normalizeForImport(raw);
    const info = analyzeDefinition(definition, 'servers');
    const enabled = raw.enabled !== false && raw.disabled !== true;
    if (info.errors.length > 0) invalid.push(`${id} (${info.errors[0]})`);
    else drafts.push({ id, definition, enabled });
  }
  if (invalid.length > 0) {
    throw new McpError('invalid-manifest', 400, `Manifest contains invalid servers: ${invalid.join(', ')}`);
  }

  const current = await buildResponse(home, await loadConfigs(home));
  const existing = drafts.map((draft) => draft.id).filter((id) => current.servers.some((server) => server.id === id));
  return { drafts, existing, source };
};
