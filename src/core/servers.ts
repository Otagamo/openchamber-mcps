import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type {
  BatchResponse,
  BulkResponse,
  ConfigView,
  ConflictView,
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
import {
  describeFs,
  loadConfigs,
  primaryConfigPath,
  writeMcpBlock,
  type LoadedConfig,
} from './config.ts';
import { parseJsonc } from './jsonc.ts';

export const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const MAX_COMMAND_ITEMS = 64;
const MAX_STRING = 4096;
const MAX_ENTRIES = 500;
const MAX_TIMEOUT = 600_000;
const MAX_IMPORT_BYTES = 512 * 1024;
const IMPORT_TIMEOUT_MS = 15_000;

export type DefInfo = {
  transport: TransportKind;
  command: string[];
  url: string | null;
  cwd: string | null;
  environmentKeys: string[];
  headerKeys: string[];
  timeout: number | null;
  oauth: 'auto' | 'disabled' | 'configured' | 'none';
  errors: string[];
  warnings: string[];
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

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

/** Validates one `mcp` entry. Errors make the entry unusable; warnings do not block a toggle. */
export const analyzeDefinition = (value: unknown): DefInfo => {
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
    oauth: 'none',
    errors,
    warnings,
  };
  if (!isPlainObject(value)) {
    errors.push('Definition must be a JSON object');
    return info;
  }

  const declaredType = value.type;
  if (declaredType !== undefined && declaredType !== 'local' && declaredType !== 'remote') {
    errors.push('type must be "local" or "remote"');
  }
  const hasCommand = value.command !== undefined;
  const hasUrl = value.url !== undefined;
  const type =
    declaredType === 'local' || declaredType === 'remote'
      ? declaredType
      : hasCommand && !hasUrl
        ? 'local'
        : hasUrl && !hasCommand
          ? 'remote'
          : null;
  if (!type) {
    if (declaredType === undefined) errors.push('type is required, or a command (local) or url (remote) must be given');
    return info;
  }
  info.transport = type;

  if (type === 'local') {
    info.command = stringList(value.command, 'command', errors);
    if (value.cwd !== undefined) {
      if (typeof value.cwd !== 'string' || value.cwd.length === 0 || value.cwd.length > MAX_STRING) {
        errors.push('cwd must be a non-empty string');
      } else {
        info.cwd = value.cwd;
      }
    }
    if (value.url !== undefined) warnings.push('url is ignored for a local server');
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
  }

  info.environmentKeys = objectKeys(value.environment, 'environment', errors, warnings);
  info.headerKeys = objectKeys(value.headers, 'headers', errors, warnings);

  if (value.timeout !== undefined) {
    if (typeof value.timeout !== 'number' || !Number.isFinite(value.timeout) || value.timeout <= 0) {
      errors.push('timeout must be a positive number of milliseconds');
    } else if (value.timeout > MAX_TIMEOUT) {
      errors.push(`timeout cannot exceed ${MAX_TIMEOUT} ms`);
    } else {
      info.timeout = value.timeout;
    }
  }

  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (value.oauth === false) info.oauth = 'disabled';
  else if (isPlainObject(value.oauth)) info.oauth = 'configured';
  else if (value.oauth === undefined) info.oauth = type === 'remote' ? 'auto' : 'none';
  else if (value.oauth !== true) errors.push('oauth must be an object or false');

  return info;
};

type Entry = {
  id: string;
  path: string;
  definition: Record<string, unknown> | null;
  info: DefInfo;
  enabled: boolean;
  hash: string;
  toolsOff: string[];
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

const collect = (configs: LoadedConfig[]): { entries: Entry[]; configConflicts: ConflictView[] } => {
  const entries: Entry[] = [];
  const configConflicts: ConflictView[] = [];
  for (const config of configs) {
    if (config.error) {
      configConflicts.push({
        kind: 'read-error',
        serverId: '',
        message: `Cannot read ${config.path}: ${config.error}`,
        paths: [config.path],
        blocking: true,
      });
      continue;
    }
    if (config.parseError) {
      configConflicts.push({
        kind: 'read-error',
        serverId: '',
        message: `${config.parseError} (${config.path})`,
        paths: [config.path],
        blocking: true,
      });
      continue;
    }
    if (config.data && config.data.mcp !== undefined && !isPlainObject(config.data.mcp)) {
      configConflicts.push({
        kind: 'invalid',
        serverId: '',
        message: `"mcp" in ${config.name} must be an object of servers; the block is ignored`,
        paths: [config.path],
        blocking: true,
      });
      continue;
    }
    for (const key of config.duplicateKeys) {
      configConflicts.push({
        kind: 'duplicate',
        serverId: key,
        message: `"${key}" is defined more than once in ${config.name}; OpenCode keeps only the last one`,
        paths: [config.path],
        blocking: false,
      });
    }
    if (!config.mcp) continue;
    const patterns = toolsDisabledPatterns(config);
    for (const [id, value] of Object.entries(config.mcp)) {
      const definition = isPlainObject(value) ? value : null;
      const info = analyzeDefinition(value);
      const off = patterns.filter((pattern) => patternCovers(pattern, id));
      if (off.length > 0) info.warnings.push(`tools disabled by ${off.map((item) => `"${item}"`).join(', ')}`);
      entries.push({
        id,
        path: config.path,
        definition,
        info,
        enabled: definition?.enabled !== false,
        hash: hashOf(definition),
        toolsOff: off,
      });
    }
  }
  return { entries, configConflicts };
};

const buildResponse = (configs: LoadedConfig[]): ServersResponse => {
  const { entries, configConflicts } = collect(configs);
  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const group = groups.get(entry.id);
    if (group) group.push(entry);
    else groups.set(entry.id, [entry]);
  }

  const servers: ServerView[] = [];
  for (const [id, group] of groups) {
    group.sort((left, right) => left.path.localeCompare(right.path));
    const winner = group.at(-1) ?? group[0];
    if (!winner) continue;
    const paths = Array.from(new Set(group.map((entry) => entry.path)));
    const both = paths.length > 1;
    const conflicts: ConflictView[] = [];
    const push = (conflict: ConflictView): void => {
      const duplicate = conflicts.some(
        (item) => item.kind === conflict.kind && item.message === conflict.message && item.paths.join() === conflict.paths.join(),
      );
      if (!duplicate) conflicts.push(conflict);
    };

    if (both) {
      push({
        kind: 'both',
        serverId: id,
        message: `"${id}" is defined in ${paths.length} config files; OpenCode loads only one of them`,
        paths,
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
    if (winner.toolsOff) {
      push({
        kind: 'tools-off',
        serverId: id,
        message: 'Server is enabled but its tools are disabled by the "tools" section; the model cannot call them',
        paths: [winner.path],
        blocking: false,
      });
    }
    const state: ServerState = both
      ? 'conflict'
      : winner.info.errors.length > 0
        ? 'invalid'
        : winner.enabled
          ? 'enabled'
          : 'disabled';
    const advertised = state === 'enabled' && winner.toolsOff.length === 0;
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
      conflicts,
      warnings: Array.from(new Set([...winner.info.warnings, ...conflicts.filter((item) => !item.blocking).map((item) => item.message)])),
      contentHash: winner.hash,
    });
  }

  servers.sort((left, right) => left.id.localeCompare(right.id));
  const conflicts = [...configConflicts, ...servers.flatMap((server) => server.conflicts)];
  const blocking = conflicts.filter((item) => item.blocking);
  const summary: Summary = {
    total: servers.length,
    advertised: servers.filter((server) => server.advertised).length,
    enabled: servers.filter((server) => server.enabled && server.state !== 'conflict').length,
    disabled: servers.filter((server) => server.state === 'disabled').length,
    invalid: servers.filter((server) => server.state === 'invalid' || server.state === 'conflict').length,
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

export const scanServers = async (home: string): Promise<ServersResponse> => buildResponse(await loadConfigs(home));

const ownersOf = (configs: LoadedConfig[], id: string): LoadedConfig[] =>
  configs.filter((config) => config.mcp && Object.prototype.hasOwnProperty.call(config.mcp, id));

const failList = (title: string, ids: string[]): never => {
  throw new McpError('invalid-manifest', 400, `${title}: ${ids.join(', ')}`);
};

const assertIdKnown = (configs: LoadedConfig[], id: string): LoadedConfig[] => {
  if (!id) throw new McpError('invalid-request', 400, 'Missing id');
  if (id.length > 128) throw new McpError('invalid-request', 400, 'id is too long');
  const owners = ownersOf(configs, id);
  if (owners.length === 0) throw new McpError('not-found', 404, `MCP server ${id} not found`);
  return owners;
};

const definitionOf = (config: LoadedConfig, id: string): Record<string, unknown> => {
  const value = config.mcp?.[id];
  if (!isPlainObject(value)) {
    throw new McpError('invalid-definition', 409, `MCP server ${id} is not a JSON object; edit its definition first`);
  }
  return value;
};

const applyEnabled = (configs: LoadedConfig[], id: string, enabled: boolean): { path: string; mcp: Record<string, unknown> } => {
  const owners = assertIdKnown(configs, id);
  if (owners.length > 1) {
    throw new McpError('conflict', 409, `MCP server ${id} is defined in ${owners.length} config files; resolve the duplicate first`);
  }
  const config = owners[0];
  if (!config || !config.mcp) throw new McpError('not-found', 404, `MCP server ${id} not found`);
  const mcp = { ...config.mcp };
  mcp[id] = { ...definitionOf(config, id), enabled };
  return { path: config.path, mcp };
};

export const setServerEnabled = async (home: string, id: string, enabled: boolean): Promise<ServersResponse> => {
  const configs = await loadConfigs(home);
  const write = applyEnabled(configs, id, enabled);
  await writeMcpBlock(write.path, write.mcp);
  return scanServers(home);
};

const collectBatch = (
  configs: LoadedConfig[],
  enable: string[],
  disable: string[],
): Map<string, Record<string, unknown>> => {
  const writes = new Map<string, Record<string, unknown>>();
  for (const [enabled, ids] of [
    [true, enable],
    [false, disable],
  ] as const) {
    for (const id of ids) {
      const write = applyEnabled(configs, id, enabled);
      writes.set(write.path, write.mcp);
    }
  }
  return writes;
};

export const batchSetEnabled = async (
  home: string,
  enable: string[],
  disable: string[],
): Promise<BatchResponse> => {
  const configs = await loadConfigs(home);
  const enableIds = Array.from(new Set(enable));
  const disableIds = Array.from(new Set(disable));
  if (enableIds.some((id) => disableIds.includes(id))) {
    throw new McpError('invalid-request', 400, 'The same server cannot be enabled and disabled at once');
  }
  if (enableIds.length + disableIds.length > 200) {
    throw new McpError('invalid-request', 400, 'Too many servers in one request');
  }
  if (enableIds.length + disableIds.length === 0) {
    return { ...buildResponse(configs), changed: [] };
  }
  const writes = collectBatch(configs, enableIds, disableIds);
  for (const [file, mcp] of writes) await writeMcpBlock(file, mcp);
  const after = await scanServers(home);
  return { ...after, changed: [...enableIds, ...disableIds] };
};

export const bulkSetEnabled = async (home: string, enabled: boolean): Promise<BulkResponse> => {
  const configs = await loadConfigs(home);
  const before = buildResponse(configs);
  const blocking = before.conflicts.filter((conflict) => conflict.blocking);
  if (blocking.length > 0) {
    throw new McpError('conflict', 409, 'Config problems remain; bulk changes are blocked', blocking);
  }
  const ids = before.servers.filter((server) => server.enabled !== enabled).map((server) => server.id);
  const writable = ids.filter((id) => ownersOf(configs, id).length === 1);
  if (writable.length !== ids.length) {
    throw new McpError('conflict', 409, 'Some servers are defined in two config files; resolve the duplicates first');
  }
  if (writable.length === 0) return { ...before, changed: [] };
  const writes = collectBatch(configs, enabled ? writable : [], enabled ? [] : writable);
  for (const [file, mcp] of writes) await writeMcpBlock(file, mcp);
  const after = await scanServers(home);
  return { ...after, changed: writable };
};

type SaveInput = {
  id?: string;
  previousId?: string;
  definition: unknown;
  enabled?: boolean;
};

const preserveSecrets = (
  next: Record<string, unknown>,
  previous: Record<string, unknown> | undefined,
): void => {
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
  if (isPlainObject(oauth) && isPlainObject(priorOauth) && !oauth.clientSecret && priorOauth.clientSecret) {
    next.oauth = { ...oauth, clientSecret: priorOauth.clientSecret };
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
  if (previousId && !previousId.trim()) throw new McpError('invalid-request', 400, 'previousId is invalid');

  const definition: Record<string, unknown> = { ...input.definition };
  definition.enabled = input.enabled !== false;
  const info = analyzeDefinition(definition);
  if (info.errors.length > 0) {
    throw new McpError('invalid-definition', 400, `Definition is invalid: ${info.errors.join('; ')}`);
  }

  const configs = await loadConfigs(home);
  const broken = configs.find((config) => config.parseError);
  if (broken?.parseError) {
    throw new McpError('invalid-config', 409, `${broken.parseError}. Fix the file before adding servers.`);
  }

  const previousOwners = ownersOf(configs, previousId);
  const target =
    previousOwners[0] ?? configs.find((config) => config.exists) ?? configs[0];
  if (!target) throw new McpError('write-error', 500, 'No OpenCode config path available');

  const previousDefinition = target.mcp?.[previousId];
  preserveSecrets(definition, isPlainObject(previousDefinition) ? previousDefinition : undefined);

  const mcp = { ...(target.mcp ?? {}) };
  if (previousOwners.length > 0 && previousId !== id) delete mcp[previousId];
  mcp[id] = definition;
  if (Object.keys(mcp).length > MAX_ENTRIES) {
    throw new McpError('invalid-request', 400, `Cannot have more than ${MAX_ENTRIES} MCP servers`);
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

export const readDefinition = async (home: string, id: string): Promise<DetailResponse> => {
  const configs = await loadConfigs(home);
  const owners = assertIdKnown(configs, id);
  if (owners.length > 1) {
    throw new McpError('conflict', 409, `MCP server ${id} is defined in ${owners.length} config files; resolve the duplicate first`);
  }
  const config = owners[0];
  if (!config) throw new McpError('not-found', 404, `MCP server ${id} not found`);
  const definition = JSON.parse(JSON.stringify(definitionOf(config, id))) as Record<string, unknown>;
  const masked: string[] = [];
  for (const field of ['environment', 'headers'] as const) {
    const block = definition[field];
    if (!isPlainObject(block)) continue;
    for (const key of Object.keys(block)) {
      block[key] = '';
      masked.push(`${field}.${key}`);
    }
  }
  if (isPlainObject(definition.oauth) && typeof definition.oauth.clientSecret === 'string' && definition.oauth.clientSecret) {
    definition.oauth = { ...definition.oauth, clientSecret: '' };
    masked.push('oauth.clientSecret');
  }
  return { id, definition, paths: [config.path], maskedPaths: masked };
};

export const removeServer = async (home: string, id: string): Promise<RemoveResponse> => {
  const configs = await loadConfigs(home);
  const owners = assertIdKnown(configs, id);
  const removedPaths: string[] = [];
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

export const resolveDuplicate = async (home: string, id: string, keepPath: string): Promise<ResolveResponse> => {
  const configs = await loadConfigs(home);
  const owners = assertIdKnown(configs, id);
  if (owners.length < 2) throw new McpError('not-found', 404, `MCP server ${id} is not defined twice`);
  const keep = owners.find((owner) => owner.path === keepPath);
  if (!keep) throw new McpError('invalid-request', 400, 'keep must be one of the config paths that define this server');
  let backupPath = `${keepPath}.mcp-manager.bak`;
  for (const owner of owners) {
    if (owner.path === keepPath || !owner.mcp) continue;
    const mcp = { ...owner.mcp };
    delete mcp[id];
    backupPath = (await writeMcpBlock(owner.path, mcp)) ?? backupPath;
  }
  return { ...(await scanServers(home)), backupPath };
};

const looksLikeDefinition = (value: Record<string, unknown>): boolean =>
  value.type === 'local' || value.type === 'remote' || value.command !== undefined || value.url !== undefined;

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
        if (!found) {
          throw new McpError('import-failed', 404, `No mcp.json, .mcp.json or opencode.json in ${target}`);
        }
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

export const importManifest = async (home: string, kind: string, value: string): Promise<ImportResponse> => {
  const { text, source } = await readImportText(kind, value);
  let parsed: unknown;
  try {
    parsed = parseJsonc(text);
  } catch (error) {
    throw new McpError('invalid-manifest', 400, `Manifest is not valid JSON(C): ${error instanceof Error ? error.message : 'parse error'}`);
  }
  if (!isPlainObject(parsed)) throw new McpError('invalid-manifest', 400, 'Manifest must be a JSON object');

  const drafts: DefinedServer[] = [];
  const candidates: Array<[string, unknown]> = [];
  if (isPlainObject(parsed.mcp)) {
    for (const [id, definition] of Object.entries(parsed.mcp)) candidates.push([id, definition]);
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

  const invalid: string[] = [];
  for (const [id, definition] of candidates) {
    if (!ID_PATTERN.test(id)) {
      invalid.push(`${id} (invalid id)`);
      continue;
    }
    if (!isPlainObject(definition)) {
      invalid.push(`${id} (not an object)`);
      continue;
    }
    const info = analyzeDefinition(definition);
    if (info.errors.length > 0) invalid.push(`${id} (${info.errors[0]})`);
    else drafts.push({ id, definition, enabled: definition.enabled !== false });
  }
  if (invalid.length > 0) failList('Manifest contains invalid servers', invalid);

  const current = buildResponse(await loadConfigs(home));
  const existing = drafts.map((draft) => draft.id).filter((id) => current.servers.some((server) => server.id === id));
  return { drafts, existing, source };
};
