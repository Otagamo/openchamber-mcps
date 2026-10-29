import fs from 'node:fs/promises';
import path from 'node:path';
import type { ServerRuntimeView } from '../shared/types.ts';

/** OpenCode writes one `key=value` line per event under its data directory. */
const logDir = (home: string): string => path.join(home, '.local', 'share', 'opencode', 'log');

/** Only the tail matters: the newest run is at the end of the file. */
const TAIL_BYTES = 4 * 1024 * 1024;
/** Read backwards in small chunks so a scan does not allocate the whole tail at once. */
const CHUNK_BYTES = 128 * 1024;

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
  tools: number;
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
      tools: Number.parseInt(field(line, 'tools') ?? '', 10),
    },
  };
};

const readTail = async (file: string, pending: Set<string> | null): Promise<Map<string, RawEvent>> => {
  const found = new Map<string, RawEvent>();
  const wanted = (id: string): boolean => !pending || pending.has(id);
  let handle: fs.FileHandle | null = null;
  try {
    handle = await fs.open(file, 'r');
    const { size } = await handle.stat();
    let position = size;
    let budget = TAIL_BYTES;
    let carry = '';
    while (position > 0 && budget > 0 && (!pending || pending.size > 0)) {
      const length = Math.min(CHUNK_BYTES, position, budget);
      const buffer = Buffer.allocUnsafe(length);
      await handle.read(buffer, 0, length, position - length);
      budget -= length;
      position -= length;
      // carry holds the head of the previous (later) chunk: that line was cut mid-way.
      const lines = (buffer.toString('utf8') + carry).split('\n');
      // A chunk that reaches byte 0 starts on a real line boundary; otherwise its first
      // line is a fragment that the next (earlier) chunk completes.
      carry = position === 0 ? '' : (lines.shift() ?? '');
      // Backwards: the first event seen for an id is the newest one, so never overwrite.
      for (let index = lines.length - 1; index >= 0; index -= 1) {
        const line = lines[index];
        if (!line || !line.includes('mcp ')) continue;
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
 * Last load outcome per server, from OpenCode's own log — both "connected" and the
 * failures. Read backwards so the first event per id is the newest, and stop as soon as
 * every id the caller cares about has one: the tail budget is a ceiling, not a target.
 */
export const readServerOutcomes = async (
  home: string,
  ids?: Iterable<string>,
): Promise<Map<string, ServerRuntimeView>> => {
  const pending = ids ? new Set(ids) : null;
  const latest = new Map<string, RawEvent>();
  for (const file of await pickLogFiles(home)) {
    if (pending && pending.size === 0) break;
    const events = await readTail(file, pending);
    for (const [id, event] of events) if (!latest.has(id)) latest.set(id, event);
  }
  const outcomes = new Map<string, ServerRuntimeView>();
  for (const [id, event] of latest) {
    outcomes.set(id, {
      ok: event.ok,
      message: event.message,
      detail: event.detail,
      at: event.atText,
      directory: event.directory,
      tools: Number.isFinite(event.tools) ? event.tools : null,
    });
  }
  return outcomes;
};
