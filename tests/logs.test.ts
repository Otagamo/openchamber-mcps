import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { readServerOutcomes } from '../src/core/logs.ts';

let home = '';

const writeLog = async (lines: string[]): Promise<void> => {
  const dir = path.join(home, '.local', 'share', 'opencode', 'log');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'opencode.log'), `${lines.join('\n')}\n`, 'utf8');
};

const failed = (server: string, at: string, error: string): string =>
  `timestamp=${at} level=WARN run=abc message="mcp connect failed" server=${server} status.status=failed status.error="${error}" http.span=7 role=server server=${server} directory="C:\\\\work" connectionID=x`;

const connected = (server: string, at: string): string =>
  `timestamp=${at} level=INFO run=abc message="mcp connected" server=${server} tools=3 http.span=12 role=server server=${server} directory="C:\\\\work" connectionID=x`;

beforeEach(async () => {
  home = await fs.mkdtemp(path.join(os.tmpdir(), 'mcps-log-'));
});

afterEach(async () => {
  await fs.rm(home, { recursive: true, force: true });
});

test('reports the cause of a failed connect', async () => {
  await writeLog([failed('docs', '2026-10-29T10:00:00.000Z', 'Connection closed: MCP server process exited')]);
  const outcomes = await readServerOutcomes(home);
  const outcome = outcomes.get('docs');
  assert.equal(outcome?.message, 'mcp connect failed');
  assert.equal(outcome?.detail, 'Connection closed: MCP server process exited');
  assert.equal(outcome?.at, '2026-10-29T10:00:00.000Z');
  assert.equal(outcome?.directory, 'C:\\work');
});

test('a later connect clears an earlier failure', async () => {
  await writeLog([
    failed('docs', '2026-10-29T10:00:00.000Z', 'boom'),
    connected('docs', '2026-10-29T10:05:00.000Z'),
  ]);
  const outcome = (await readServerOutcomes(home)).get('docs');
  assert.equal(outcome?.ok, true);
  assert.equal(outcome?.detail, null);
  assert.equal(outcome?.tools, 3);
});

test('a failure after a connect is reported', async () => {
  await writeLog([
    connected('docs', '2026-10-29T10:00:00.000Z'),
    failed('docs', '2026-10-29T10:05:00.000Z', 'spawn ENOENT'),
  ]);
  assert.equal((await readServerOutcomes(home)).get('docs')?.detail, 'spawn ENOENT');
});

test('authentication rejection becomes an HTTP detail', async () => {
  await writeLog([
    'timestamp=2026-10-29T15:16:52.618Z level=WARN message="mcp http authentication rejected" status=401 durationMs=131 http.span=134 role=server server=gitlab directory="C:\\\\work" connectionID=1 requestID=2 origin=https://gitlab.example.com method=POST',
  ]);
  const outcome = (await readServerOutcomes(home)).get('gitlab');
  assert.equal(outcome?.detail, 'HTTP 401 from https://gitlab.example.com');
});

test('runtime transport noise and unrelated lines are ignored', async () => {
  await writeLog([
    'timestamp=2026-10-29T16:18:58.793Z level=WARN message="mcp transport error" server=docker error="unknown message id" http.span=1 role=server server=docker',
    'timestamp=2026-10-29T16:19:00.000Z level=INFO message="config loaded" directory="C:\\\\work"',
    'garbage without structure',
    failed('docker', '2026-10-29T16:20:00.000Z', 'startup timeout'),
  ]);
  const outcomes = await readServerOutcomes(home);
  assert.equal(outcomes.size, 1);
  assert.equal(outcomes.get('docker')?.detail, 'startup timeout');
});

test('escaped quotes inside the error survive', async () => {
  await writeLog([
    'timestamp=2026-10-29T10:00:00.000Z level=WARN message="mcp connect failed" server=x status.error="Download failed: \\"not found\\"" role=server server=x',
  ]);
  assert.equal((await readServerOutcomes(home)).get('x')?.detail, 'Download failed: "not found"');
});

test('events split across read chunks are still parsed', async () => {
  const padding = Array.from({ length: 900 }, (_, index) =>
    `timestamp=2026-10-29T09:00:00.000Z level=INFO message="mcp connected" server=filler${index} tools=1 role=server server=filler${index}`,
  );
  const hop = `timestamp=2026-10-29T11:00:00.000Z level=WARN message="mcp connect failed" server=late status.error="boom late" role=server server=late`;
  const filler = 'x'.repeat(600) + ' level=INFO message="config loaded"';
  await writeLog([failed('early', '2026-10-29T08:00:00.000Z', 'boom early'), filler, ...padding, hop]);
  const outcomes = await readServerOutcomes(home);
  assert.equal(outcomes.size, 900 + 2);
  assert.equal(outcomes.get('early')?.detail, 'boom early');
  assert.equal(outcomes.get('late')?.detail, 'boom late');
});

test('with an id list it stops early but still finds the newest event', async () => {
  await writeLog([
    failed('wanted', '2026-10-29T09:00:00.000Z', 'first'),
    connected('wanted', '2026-10-29T10:00:00.000Z'),
    failed('ignored', '2026-10-29T10:30:00.000Z', 'not for us'),
  ]);
  const outcomes = await readServerOutcomes(home, ['wanted']);
  assert.equal(outcomes.size, 1);
  assert.equal(outcomes.get('wanted')?.ok, true);
});

test('no log directory means no outcomes', async () => {
  assert.equal((await readServerOutcomes(home)).size, 0);
});
