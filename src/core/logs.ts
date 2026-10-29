import fs from 'node:fs/promises';
import path from 'node:path';
import type { ServerFailureView } from '../shared/types.ts';

/** OpenCode writes one `key=value` line per event under its data directory. */
const logDir = (home: string): string => path.join(home, '.local', 'share', 'opencode', 'log');

/** Only the tail matters: the newest run is at the end of the file. */
const TAIL_BYTES = 4 * 1024 * 1024;

/** Messages that mean the server did not load; anything else is runtime noise. */
const FAILED_MESSAGES = new Set([
  'mcp connect failed',
  'mcp http authentication rejected',
  'mcp oauth authorization failed',
]);
const CONNECTED_MESSAGE = 'mcp connected';

type RawEvent = {
  ok: boolean;
  message: string;
  detail: string | null;
  at: number;
  atText: string;
  directory: string | null;
};

const unquote = (value: string): string =>
  value.replace(/\\(["\\])/g, '$1').replace(/\\n/g, '\n').replace(/\\r/g, '');

/** Field value at `key=`, handling a quoted, escaped value. */
const field = (line: string, key: string): string | null => {
  const quoted = new RegExp(`(?:^|\\s)${key}="((?:[^"\\\\]|\\\\.)*)"`).exec(line);
  if (quoted?.[1] !== undefined) return unquote(quoted[1]);
  const bare = new RegExp(`(?:^|\\s)${key}=([^\\s]+)`).exec(line);
  return bare?.[1] ?? null;
};

const describeDetail = (line: string, message: string): string | null => {
  const error = field(line, 'error') ?? field(line, 'status.error');
  if (error) return error;
  if (message === 'mcp http authentication rejected') {
    const code = field(line, 'status');
    const origin = field(line, 'origin');
    if (code || origin) return [code ? `HTTP ${code}` : null, origin].filter(Boolean).join(' from ');
  }
  return null;
};

const parseLine = (line: string): { id: string; event: RawEvent } | null => {
  const message = field(line, 'message');
  if (!message) return null;
  const failed = FAILED_MESSAGES.has(message);
  if (!failed && message !== CONNECTED_MESSAGE) return null;
  const id = field(line, 'server');
  if (!id) return null;
  const atText = field(line, 'timestamp') ?? '';
  const at = Number.isNaN(Date.parse(atText)) ? 0 : Date.parse(atText);
  return {
    id,
    event: {
      ok: !failed,
      message,
      detail: failed ? describeDetail(line, message) : null,
      at,
      atText,
      directory: field(line, 'directory'),
    },
  };
};

const readTail = async (file: string): Promise<string[]> => {
  let handle: fs.FileHandle | null = null;
  try {
    handle = await fs.open(file, 'r');
    const { size } = await handle.stat();
    const length = Math.min(size, TAIL_BYTES);
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, size - length);
    const text = buffer.toString('utf8');
    const lines = text.split('\n');
    // A tail read can start mid-line; drop that fragment unless it began the file.
    if (length < size) lines.shift();
    return lines;
  } catch {
    return [];
  } finally {
    await handle?.close().catch(() => undefined);
  }
};

const pickLogFiles = async (home: string): Promise<string[]> => {
  const dir = logDir(home);
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }
  if (names.includes('opencode.log')) return [path.join(dir, 'opencode.log')];
  const candidates = await Promise.all(
    names
      .filter((name) => name.endsWith('.log'))
      .map(async (name) => {
        const file = path.join(dir, name);
        const stat = await fs.stat(file).catch(() => null);
        return stat ? { file, mtime: stat.mtimeMs } : null;
      }),
  );
  const newest = candidates
    .filter((item): item is { file: string; mtime: number } => item !== null)
    .sort((left, right) => right.mtime - left.mtime)[0];
  return newest ? [newest.file] : [];
};

/**
 * Last load outcome per server, from OpenCode's own log. A later `mcp connected`
 * clears an earlier failure, so the panel only reports what is still true at the end
 * of the log.
 */
export const readServerOutcomes = async (home: string): Promise<Map<string, ServerFailureView>> => {
  const latest = new Map<string, RawEvent>();
  for (const file of await pickLogFiles(home)) {
    for (const line of await readTail(file)) {
      if (!line.includes('mcp ')) continue;
      const parsed = parseLine(line);
      if (!parsed) continue;
      const previous = latest.get(parsed.id);
      if (!previous || parsed.event.at >= previous.at) latest.set(parsed.id, parsed.event);
    }
  }
  const failures = new Map<string, ServerFailureView>();
  for (const [id, event] of latest) {
    if (event.ok) continue;
    failures.set(id, {
      message: event.message,
      detail: event.detail,
      at: event.atText,
      directory: event.directory,
    });
  }
  return failures;
};
