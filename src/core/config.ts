import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { findMember, indentUnit, memberText, objectKeys, parseJsonc, spliceMember } from './jsonc.ts';
import { McpError } from './errors.ts';

export const CONFIG_DIR = ['.config', 'opencode'] as const;
export const PRIMARY_NAME = 'opencode.json';
export const ALTERNATE_NAME = 'opencode.jsonc';
export const BACKUP_SUFFIX = '.mcp-manager.bak';

export type LoadedConfig = {
  path: string;
  name: string;
  exists: boolean;
  text: string;
  data: Record<string, unknown> | null;
  parseError: string | null;
  mcp: Record<string, unknown> | null;
  /** Keys that appear more than once inside the mcp block (JSON.parse keeps only the last). */
  duplicateKeys: string[];
  error: string | null;
};

export const describeFs = (error: unknown): string => {
  const code = (error as NodeJS.ErrnoException).code;
  if (code === 'EACCES' || code === 'EPERM') return 'permission denied';
  if (code === 'ENOENT') return 'path does not exist';
  if (code === 'ENOTDIR') return 'not a directory';
  if (code === 'EISDIR') return 'is a directory';
  return error instanceof Error ? error.message : 'filesystem error';
};

export const configPaths = (home: string): string[] =>
  [PRIMARY_NAME, ALTERNATE_NAME].map((name) => path.join(home, ...CONFIG_DIR, name));
export const primaryConfigPath = (home: string): string => configPaths(home)[0] ?? '';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const duplicatesOf = (text: string): string[] => {
  const duplicates = new Set<string>();
  const countInto = (keys: string[]): void => {
    const counts = new Map<string, number>();
    for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
    for (const [key, count] of counts) if (count > 1) duplicates.add(key);
  };
  const mcpText = memberText(text, 'mcp');
  if (!mcpText) return [];
  try {
    countInto(objectKeys(mcpText).filter((key) => key !== 'servers' && key !== 'timeout'));
    const serversText = memberText(mcpText, 'servers');
    if (serversText) countInto(objectKeys(serversText));
  } catch {
    return [];
  }
  return [...duplicates];
};

const loadOne = async (file: string): Promise<LoadedConfig> => {
  const name = path.basename(file);
  const base: LoadedConfig = {
    path: file,
    name,
    exists: false,
    text: '',
    data: null,
    parseError: null,
    mcp: null,
    duplicateKeys: [],
    error: null,
  };
  try {
    const text = await fs.readFile(file, 'utf8');
    let parsed: unknown;
    try {
      parsed = parseJsonc(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid JSON';
      return { ...base, exists: true, text, parseError: `${name} is not valid JSON(C): ${message}` };
    }
    if (!isPlainObject(parsed)) {
      return { ...base, exists: true, text, parseError: `${name} must contain a JSON object at the top level` };
    }
    const mcpValue = parsed.mcp;
    const mcp = isPlainObject(mcpValue) ? mcpValue : null;
    const duplicateKeys = mcp && findMember(text, 'mcp').span ? duplicatesOf(text) : [];
    return { ...base, exists: true, text, data: parsed, mcp, duplicateKeys };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return base;
    return { ...base, error: describeFs(error) };
  }
};

export const loadConfigs = async (home: string): Promise<LoadedConfig[]> =>
  Promise.all(configPaths(home).map((file) => loadOne(file)));

/**
 * Rewrites the mcp member of one config file. Everything outside the mcp block keeps its
 * bytes; the previous file is copied to `<path>.mcp-manager.bak` first.
 */
export const writeMcpBlock = async (target: string, mcp: Record<string, unknown>): Promise<string | null> => {
  let previous = '';
  let exists = false;
  let mode = 0o600;
  try {
    previous = await fs.readFile(target, 'utf8');
    exists = true;
    try {
      mode = (await fs.stat(target)).mode & 0o777;
    } catch {
      mode = 0o600;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new McpError('read-error', 500, `Cannot read ${target}: ${describeFs(error)}`);
    }
  }
  if (exists) {
    try {
      parseJsonc(previous);
    } catch (error) {
      throw new McpError(
        'invalid-config',
        409,
        `Refusing to write ${target}: the file is not valid JSON(C) (${error instanceof Error ? error.message : 'parse error'}). Fix it first.`,
      );
    }
  }

  const eol = previous.includes('\r\n') ? '\r\n' : '\n';
  const serialized = JSON.stringify(mcp, null, indentUnit(previous)).replace(/\n/g, eol);
  const next = spliceMember(previous, 'mcp', serialized, eol);
  let verified: unknown;
  try {
    verified = parseJsonc(next);
  } catch (error) {
    throw new McpError(
      'write-error',
      500,
      `Refusing to write ${target}: the result would not parse (${error instanceof Error ? error.message : 'parse error'})`,
    );
  }
  const roundTrip = isPlainObject(verified) ? verified.mcp : undefined;
  if (JSON.stringify(roundTrip) !== JSON.stringify(mcp)) {
    throw new McpError('write-error', 500, `Refusing to write ${target}: the mcp block did not round-trip`);
  }

  const dir = path.dirname(target);
  const temporary = `${target}.${randomUUID()}.tmp`;
  let backupPath: string | null = null;
  try {
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    if (exists) {
      backupPath = `${target}${BACKUP_SUFFIX}`;
      await fs.writeFile(backupPath, previous, { encoding: 'utf8', mode });
    }
    await fs.writeFile(temporary, next, { encoding: 'utf8', mode });
    await fs.rename(temporary, target);
  } catch (error) {
    try {
      await fs.unlink(temporary);
    } catch {
    }
    throw new McpError('write-error', 500, `Failed to write ${target}: ${describeFs(error)}`);
  }
  return backupPath;
};
