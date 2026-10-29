import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { McpError } from '../src/core/errors.ts';
import { configPaths } from '../src/core/config.ts';
import { readGroups, writeGroups } from '../src/core/groups.ts';
import { parseJsonc } from '../src/core/jsonc.ts';
import {
  analyzeDefinition,
  importManifest,
  readDefinition,
  removeServer,
  resolveDuplicate,
  saveServer,
  scanServers,
  setServerEnabled,
} from '../src/core/servers.ts';

let home = '';

const writeConfig = async (value: unknown, alternate = false): Promise<string> => {
  const file = configPaths(home)[alternate ? 1 : 0];
  if (!file) throw new Error('missing config path');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
  return file;
};

const writeText = async (text: string, alternate = false): Promise<string> => {
  const file = configPaths(home)[alternate ? 1 : 0];
  if (!file) throw new Error('missing config path');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text, 'utf8');
  return file;
};

const readText = async (file: string): Promise<string> => fs.readFile(file, 'utf8');
const primary = (): string => configPaths(home)[0] ?? '';

beforeEach(async () => {
  home = await fs.mkdtemp(path.join(os.tmpdir(), 'mcps-test-'));
});

afterEach(async () => {
  await fs.rm(home, { recursive: true, force: true });
});

test('scanServers reads the mcp.servers block', async () => {
  await writeConfig({
    $schema: 'https://opencode.ai/config.json',
    mcp: {
      servers: {
        local1: { type: 'local', command: ['npx', '-y', 'server'], environment: { API_KEY: 'x' } },
        remote1: { type: 'remote', url: 'https://example.test/mcp', disabled: true },
      },
    },
  });
  const scan = await scanServers(home);
  assert.equal(scan.servers.length, 2);
  const local = scan.servers.find((server) => server.id === 'local1');
  const remote = scan.servers.find((server) => server.id === 'remote1');
  assert.equal(local?.container, 'servers');
  assert.equal(local?.transport, 'local');
  assert.deepEqual(local?.command, ['npx', '-y', 'server']);
  assert.deepEqual(local?.environmentKeys, ['API_KEY']);
  assert.equal(local?.state, 'enabled');
  assert.equal(local?.advertised, true);
  assert.equal(remote?.state, 'disabled');
  assert.equal(remote?.advertised, false);
});

test('scanServers still lists deprecated top-level entries', async () => {
  await writeConfig({
    mcp: {
      servers: { modern: { type: 'local', command: ['a'] } },
      legacy: { type: 'remote', url: 'https://example.test/mcp', enabled: false },
    },
  });
  const scan = await scanServers(home);
  const legacy = scan.servers.find((server) => server.id === 'legacy');
  assert.equal(legacy?.container, 'legacy');
  assert.equal(legacy?.state, 'disabled');
  assert.equal(scan.summary.legacy, 1);
  assert.ok(legacy?.warnings.some((warning) => warning.includes('deprecated entry')) === false);
});

test('mcp.timeout is a global setting, not a server', async () => {
  await writeConfig({ mcp: { timeout: { startup: 5000 }, servers: { a: { type: 'local', command: ['a'] } } } });
  const scan = await scanServers(home);
  assert.deepEqual(scan.servers.map((server) => server.id), ['a']);
});

test('scanServers flags an invalid definition without blocking', async () => {
  await writeConfig({ mcp: { servers: { broken: { type: 'local' } } } });
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.state, 'invalid');
  assert.equal(scan.servers[0]?.advertised, false);
  assert.ok(scan.conflicts.some((conflict) => conflict.kind === 'invalid' && !conflict.blocking));
});

test('a bare number timeout is invalid inside mcp.servers', async () => {
  await writeConfig({ mcp: { servers: { slow: { type: 'local', command: ['a'], timeout: 5000 } } } });
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.state, 'invalid');
  assert.ok(scan.servers[0]?.warnings.some((warning) => warning.includes('deprecated shape')));
});

test('a timeout object is summarized for display', async () => {
  await writeConfig({ mcp: { servers: { slow: { type: 'local', command: ['a'], timeout: { startup: 5000, execution: 30000 } } } } });
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.state, 'enabled');
  assert.equal(scan.servers[0]?.timeout, 'startup 5s · execution 30s');
});

test('scanServers reports tools turned off and unencrypted remote urls', async () => {
  await writeConfig({
    mcp: { servers: { gh: { type: 'remote', url: 'http://example.test/mcp' } } },
    tools: { 'gh_*': false },
  });
  const scan = await scanServers(home);
  const server = scan.servers[0];
  assert.equal(server?.advertised, false);
  assert.deepEqual(server?.toolsOff, ['gh_*']);
  assert.ok(server?.warnings.some((warning) => warning.includes('plain http')));
});

test('scanServers reports a blocking read-error for unparsable config', async () => {
  await writeText('{ "mcp": { ');
  const scan = await scanServers(home);
  assert.equal(scan.summary.blockingConflicts, 1);
  assert.equal(scan.conflicts[0]?.kind, 'read-error');
});

test('scanServers reports duplicate keys inside the mcp block', async () => {
  await writeText('{\n  "mcp": {\n    "servers": {\n      "dup": { "type": "local", "command": ["a"] },\n      "dup": { "type": "local", "command": ["b"] }\n    }\n  }\n}');
  const scan = await scanServers(home);
  assert.ok(scan.conflicts.some((conflict) => conflict.kind === 'duplicate' && conflict.serverId === 'dup'));
});

test('setServerEnabled writes disabled and keeps comments and unrelated keys', async () => {
  const file = await writeText(
    '{\n  // my config\n  "theme": "dark",\n  "mcp": {\n    "servers": {\n      "a": { "type": "local", "command": ["x"] }\n    }\n  }\n}\n',
  );
  const scan = await setServerEnabled(home, 'a', false);
  assert.equal(scan.servers[0]?.state, 'disabled');
  const text = await readText(file);
  assert.ok(text.includes('// my config'));
  assert.ok(text.includes('"theme": "dark"'));
  const parsed = parseJsonc(text) as { mcp: { servers: Record<string, Record<string, unknown>> } };
  assert.equal(parsed.mcp.servers.a.disabled, true);
  const backup = await readText(`${file}.mcp-manager.bak`);
  assert.ok(backup.includes('"command": ["x"]'));
});

test('setServerEnabled on a deprecated entry writes enabled', async () => {
  await writeConfig({ mcp: { legacy: { type: 'local', command: ['a'] } } });
  const scan = await setServerEnabled(home, 'legacy', false);
  assert.equal(scan.servers[0]?.state, 'disabled');
  const parsed = parseJsonc(await readText(primary())) as { mcp: Record<string, Record<string, unknown>> };
  assert.equal(parsed.mcp.legacy.enabled, false);
});

test('setServerEnabled refuses an unknown server', async () => {
  await writeConfig({ mcp: { servers: {} } });
  await assert.rejects(() => setServerEnabled(home, 'nope', true), (error: unknown) => error instanceof McpError && error.status === 404);
});

test('saveServer creates opencode.json with an mcp.servers block', async () => {
  const result = await saveServer(home, {
    id: 'new-one',
    definition: { type: 'local', command: ['npx', '-y', 'pkg'], environment: { TOKEN: 'secret' } },
  });
  assert.equal(result.id, 'new-one');
  const parsed = parseJsonc(await readText(primary())) as {
    mcp: { servers: Record<string, Record<string, unknown>> };
  };
  assert.deepEqual(parsed.mcp.servers['new-one'].command, ['npx', '-y', 'pkg']);
  assert.equal(parsed.mcp.servers['new-one'].disabled, false);
});

test('saveServer keeps stored secrets when a value comes back blank', async () => {
  await writeConfig({
    mcp: {
      servers: {
        srv: {
          type: 'local',
          command: ['a'],
          environment: { TOKEN: 'keep-me' },
          headers: { Auth: 'bearer x' },
        },
      },
    },
  });
  const detail = await readDefinition(home, 'srv');
  assert.equal(detail.container, 'servers');
  assert.equal((detail.definition.environment as Record<string, string>).TOKEN, '');
  assert.deepEqual(detail.maskedPaths, ['environment.TOKEN', 'headers.Auth']);

  const definition = detail.definition as Record<string, unknown>;
  definition.command = ['b'];
  await saveServer(home, { id: 'srv', definition });
  const saved = parseJsonc(await readText(primary())) as {
    mcp: { servers: Record<string, Record<string, unknown>> };
  };
  assert.deepEqual(saved.mcp.servers.srv.command, ['b']);
  assert.equal((saved.mcp.servers.srv.environment as Record<string, string>).TOKEN, 'keep-me');
  assert.equal((saved.mcp.servers.srv.headers as Record<string, string>).Auth, 'bearer x');
});

test('saveServer rejects an invalid definition', async () => {
  await assert.rejects(
    () => saveServer(home, { id: 'bad', definition: { type: 'local' } }),
    (error: unknown) => error instanceof McpError && error.status === 400,
  );
});

test('saveServer renames a server inside mcp.servers', async () => {
  await writeConfig({ mcp: { servers: { before: { type: 'local', command: ['a'] } } } });
  await saveServer(home, { id: 'after', previousId: 'before', definition: { type: 'local', command: ['a'] } });
  const parsed = parseJsonc(await readText(primary())) as {
    mcp: { servers: Record<string, unknown> };
  };
  assert.deepEqual(Object.keys(parsed.mcp.servers), ['after']);
});

test('removeServer deletes the definition from every place that has it', async () => {
  await writeConfig({ mcp: { servers: { gone: { type: 'local', command: ['a'] } } } });
  const result = await removeServer(home, 'gone');
  assert.equal(result.removedPaths.length, 1);
  assert.equal((await scanServers(home)).servers.length, 0);
});

test('a server in mcp.servers and as a deprecated entry is a blocking conflict', async () => {
  await writeConfig({
    mcp: {
      servers: { twin: { type: 'local', command: ['a'] } },
      twin: { type: 'remote', url: 'https://example.test/mcp' },
    },
  });
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.state, 'conflict');
  assert.ok(scan.conflicts.some((conflict) => conflict.kind === 'both' && conflict.blocking));
  assert.deepEqual(scan.servers[0]?.targets.length, 2);
  await assert.rejects(() => setServerEnabled(home, 'twin', false), (error: unknown) => error instanceof McpError && error.status === 409);

  const keep = scan.servers[0]?.targets.find((target) => target.endsWith('#legacy'));
  assert.ok(keep);
  const resolved = await resolveDuplicate(home, 'twin', keep ?? '');
  assert.equal(resolved.servers.length, 1);
  assert.equal(resolved.servers[0]?.container, 'legacy');
});

test('the same id in both config files is a blocking conflict', async () => {
  await writeConfig({ mcp: { servers: { twin: { type: 'local', command: ['a'] } } } });
  await writeConfig({ mcp: { servers: { twin: { type: 'remote', url: 'https://example.test/mcp' } } } }, true);
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.state, 'conflict');
  assert.equal(scan.servers[0]?.targets.length, 2);
});

test('importManifest reads mcp.servers and reports existing ids', async () => {
  await writeConfig({ mcp: { servers: { existing: { type: 'local', command: ['a'] } } } });
  const manifest = JSON.stringify({
    mcp: {
      servers: {
        existing: { type: 'local', command: ['b'] },
        fresh: { type: 'remote', url: 'https://example.test/mcp' },
      },
    },
  });
  const result = await importManifest(home, 'paste', manifest);
  assert.deepEqual(result.drafts.map((draft) => draft.id), ['existing', 'fresh']);
  assert.deepEqual(result.existing, ['existing']);
});

test('importManifest normalizes a deprecated flat block', async () => {
  const manifest = JSON.stringify({
    mcp: { old: { type: 'local', command: ['a'], enabled: false, timeout: 20000 } },
  });
  const result = await importManifest(home, 'paste', manifest);
  const draft = result.drafts[0];
  assert.equal(draft?.enabled, false);
  assert.equal('enabled' in (draft?.definition ?? {}), false);
  assert.deepEqual(draft?.definition.timeout, { execution: 20000 });
});

test('importManifest accepts a single definition with a name', async () => {
  const result = await importManifest(home, 'paste', JSON.stringify({ name: 'solo', type: 'local', command: ['a'] }));
  assert.equal(result.drafts[0]?.id, 'solo');
  assert.equal('name' in (result.drafts[0]?.definition ?? {}), false);
});

test('importManifest rejects a manifest with an invalid server', async () => {
  await assert.rejects(
    () => importManifest(home, 'paste', JSON.stringify({ mcp: { servers: { bad: { type: 'local' } } } })),
    (error: unknown) => error instanceof McpError && error.status === 400,
  );
});

test('analyzeDefinition warns instead of failing on non-string env values', () => {
  const info = analyzeDefinition({ type: 'local', command: ['a'], environment: { PORT: 1234 } });
  assert.equal(info.errors.length, 0);
  assert.ok(info.warnings.some((warning) => warning.includes('PORT')));
});

test('a deprecated stub only carries the flag', () => {
  const info = analyzeDefinition({ enabled: false }, 'legacy');
  assert.equal(info.errors.length, 0);
  assert.equal(info.enabled, false);
  assert.ok(info.warnings.some((warning) => warning.includes('only sets')));
});

test('scanServers attaches the load failure OpenCode logged', async () => {
  await writeConfig({ mcp: { servers: { docs: { type: 'local', command: ['a'] } } } });
  const dir = path.join(home, '.local', 'share', 'opencode', 'log');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, 'opencode.log'),
    'timestamp=2026-10-29T10:00:00.000Z level=WARN message="mcp connect failed" server=docs status.error="spawn ENOENT" role=server server=docs\n',
    'utf8',
  );
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.failure?.detail, 'spawn ENOENT');
  assert.equal(scan.servers[0]?.failure?.message, 'mcp connect failed');
});

test('scanServers leaves failure null when the log has no entry', async () => {
  await writeConfig({ mcp: { servers: { docs: { type: 'local', command: ['a'] } } } });
  assert.equal((await scanServers(home)).servers[0]?.failure, null);
});

test('group config round-trips through mcp-manager/groups.json', async () => {
  const initial = await readGroups(home);
  assert.deepEqual(initial.groups, []);
  const saved = await writeGroups(home, { version: 1, groups: [{ id: 'daily', name: 'Daily', serverIds: ['a'] }] });
  assert.equal(saved.groups[0]?.serverIds[0], 'a');
  const file = path.join(home, '.config', 'openchamber', 'mcp-manager', 'groups.json');
  assert.ok((await readText(file)).includes('"daily"'));
});
