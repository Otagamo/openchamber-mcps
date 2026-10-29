import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { McpError } from "../src/core/errors.ts";
import { configPaths } from "../src/core/config.ts";
import { readGroups, writeGroups } from "../src/core/groups.ts";
import {
  analyzeDefinition,
  importManifest,
  readDefinition,
  removeServer,
  resolveDuplicate,
  saveServer,
  scanServers,
  setServerEnabled,
} from "../src/core/servers.ts";
import { parseJsonc } from "../src/core/jsonc.ts";

let home = "";

const writeConfig = async (
  text: string,
  alternate = false,
): Promise<string> => {
  const file = configPaths(home)[alternate ? 1 : 0];
  if (!file) throw new Error("missing config path");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text, "utf8");
  return file;
};

const readText = async (file: string): Promise<string> =>
  fs.readFile(file, "utf8");

beforeEach(async () => {
  home = await fs.mkdtemp(path.join(os.tmpdir(), "mcps-test-"));
});

afterEach(async () => {
  await fs.rm(home, { recursive: true, force: true });
});

test("scanServers reads local and remote servers from opencode.json", async () => {
  await writeConfig(
    JSON.stringify(
      {
        theme: "dark",
        mcp: {
          local1: {
            type: "local",
            command: ["npx", "-y", "server"],
            environment: { API_KEY: "x" },
          },
          remote1: {
            type: "remote",
            url: "https://example.test/mcp",
            enabled: false,
          },
        },
      },
      null,
      2,
    ),
  );
  const scan = await scanServers(home);
  assert.equal(scan.servers.length, 2);
  const local = scan.servers.find((server) => server.id === "local1");
  const remote = scan.servers.find((server) => server.id === "remote1");
  assert.equal(local?.transport, "local");
  assert.deepEqual(local?.command, ["npx", "-y", "server"]);
  assert.deepEqual(local?.environmentKeys, ["API_KEY"]);
  assert.equal(local?.advertised, true);
  assert.equal(remote?.transport, "remote");
  assert.equal(remote?.state, "disabled");
  assert.equal(scan.summary.total, 2);
});

test("scanServers flags an invalid definition without blocking", async () => {
  await writeConfig(JSON.stringify({ mcp: { broken: { type: "local" } } }));
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.state, "invalid");
  assert.equal(scan.servers[0]?.advertised, false);
  assert.ok(
    scan.conflicts.some(
      (conflict) => conflict.kind === "invalid" && !conflict.blocking,
    ),
  );
});

test("scanServers reports tools turned off and unencrypted remote urls", async () => {
  await writeConfig(
    JSON.stringify({
      mcp: { gh: { type: "remote", url: "http://example.test/mcp" } },
      tools: { "gh_*": false },
    }),
  );
  const scan = await scanServers(home);
  const server = scan.servers[0];
  assert.equal(server?.advertised, false);
  assert.deepEqual(server?.toolsOff, ["gh_*"]);
  assert.ok(server?.warnings.some((warning) => warning.includes("plain http")));
});

test("scanServers reports a blocking read-error for unparsable config", async () => {
  await writeConfig('{ "mcp": { ');
  const scan = await scanServers(home);
  assert.equal(scan.summary.blockingConflicts, 1);
  assert.equal(scan.conflicts[0]?.kind, "read-error");
});

test("scanServers reports duplicate keys inside the mcp block", async () => {
  await writeConfig(
    '{\n  "mcp": {\n    "dup": { "type": "local", "command": ["a"] },\n    "dup": { "type": "local", "command": ["b"] }\n  }\n}',
  );
  const scan = await scanServers(home);
  assert.ok(
    scan.conflicts.some(
      (conflict) =>
        conflict.kind === "duplicate" && conflict.serverId === "dup",
    ),
  );
});

test("setServerEnabled keeps comments and unrelated keys", async () => {
  const file = await writeConfig(
    '{\n  // my config\n  "theme": "dark",\n  "mcp": {\n    "a": { "type": "local", "command": ["x"] }\n  }\n}\n',
  );
  const scan = await setServerEnabled(home, "a", false);
  assert.equal(scan.servers[0]?.state, "disabled");
  const text = await readText(file);
  assert.ok(text.includes("// my config"));
  assert.ok(text.includes('"theme": "dark"'));
  assert.equal(
    (parseJsonc(text) as { mcp: { a: { enabled: boolean } } }).mcp.a.enabled,
    false,
  );
  const backup = await readText(`${file}.mcp-manager.bak`);
  assert.ok(backup.includes('"command": ["x"]'));
});

test("setServerEnabled refuses an unknown server", async () => {
  await writeConfig(JSON.stringify({ mcp: {} }));
  await assert.rejects(
    () => setServerEnabled(home, "nope", true),
    (error: unknown) => error instanceof McpError && error.status === 404,
  );
});

test("saveServer creates opencode.json when it does not exist yet", async () => {
  const result = await saveServer(home, {
    id: "new-one",
    definition: {
      type: "local",
      command: ["npx", "-y", "pkg"],
      environment: { TOKEN: "secret" },
    },
  });
  assert.equal(result.id, "new-one");
  const file = configPaths(home)[0];
  if (!file) throw new Error("missing config path");
  const parsed = JSON.parse(await readText(file));
  assert.deepEqual(parsed.mcp["new-one"].command, ["npx", "-y", "pkg"]);
  assert.equal(parsed.mcp["new-one"].enabled, true);
});

test("saveServer keeps stored secrets when a value comes back blank", async () => {
  await writeConfig(
    JSON.stringify({
      mcp: {
        srv: {
          type: "local",
          command: ["a"],
          environment: { TOKEN: "keep-me" },
          headers: { Auth: "bearer x" },
        },
      },
    }),
  );
  const detail = await readDefinition(home, "srv");
  assert.equal(
    (detail.definition.environment as Record<string, string>).TOKEN,
    "",
  );
  assert.deepEqual(detail.maskedPaths, ["environment.TOKEN", "headers.Auth"]);

  const definition = detail.definition as Record<string, unknown>;
  definition.command = ["b"];
  await saveServer(home, { id: "srv", definition });
  const file = configPaths(home)[0];
  if (!file) throw new Error("missing config path");
  const saved = JSON.parse(await readText(file));
  assert.deepEqual(saved.mcp.srv.command, ["b"]);
  assert.equal(saved.mcp.srv.environment.TOKEN, "keep-me");
  assert.equal(saved.mcp.srv.headers.Auth, "bearer x");
});

test("saveServer rejects an invalid definition", async () => {
  await assert.rejects(
    () => saveServer(home, { id: "bad", definition: { type: "local" } }),
    (error: unknown) => error instanceof McpError && error.status === 400,
  );
});

test("saveServer renames a server when the id changes", async () => {
  await writeConfig(
    JSON.stringify({ mcp: { before: { type: "local", command: ["a"] } } }),
  );
  await saveServer(home, {
    id: "after",
    previousId: "before",
    definition: { type: "local", command: ["a"] },
  });
  const scan = await scanServers(home);
  assert.deepEqual(
    scan.servers.map((server) => server.id),
    ["after"],
  );
});

test("removeServer deletes the definition from every config file that has it", async () => {
  await writeConfig(
    JSON.stringify({ mcp: { gone: { type: "local", command: ["a"] } } }),
  );
  const result = await removeServer(home, "gone");
  assert.equal(result.removedPaths.length, 1);
  assert.equal((await scanServers(home)).servers.length, 0);
});

test("a server defined in both config files is a blocking conflict until resolved", async () => {
  await writeConfig(
    JSON.stringify({ mcp: { twin: { type: "local", command: ["a"] } } }),
  );
  const alternate = await writeConfig(
    JSON.stringify({
      mcp: { twin: { type: "remote", url: "https://example.test/mcp" } },
    }),
    true,
  );
  const scan = await scanServers(home);
  assert.equal(scan.servers[0]?.state, "conflict");
  assert.ok(
    scan.conflicts.some(
      (conflict) => conflict.kind === "both" && conflict.blocking,
    ),
  );
  await assert.rejects(
    () => setServerEnabled(home, "twin", false),
    (error: unknown) => error instanceof McpError && error.status === 409,
  );

  const resolved = await resolveDuplicate(home, "twin", alternate);
  assert.equal(resolved.servers.length, 1);
  assert.equal(resolved.servers[0]?.transport, "remote");
});

test("importManifest reads an mcp block and reports existing ids", async () => {
  await writeConfig(
    JSON.stringify({ mcp: { existing: { type: "local", command: ["a"] } } }),
  );
  const manifest = JSON.stringify({
    mcp: {
      existing: { type: "local", command: ["b"] },
      fresh: { type: "remote", url: "https://example.test/mcp" },
    },
  });
  const result = await importManifest(home, "paste", manifest);
  assert.deepEqual(
    result.drafts.map((draft) => draft.id),
    ["existing", "fresh"],
  );
  assert.deepEqual(result.existing, ["existing"]);
});

test("importManifest accepts a single definition with a name", async () => {
  const result = await importManifest(
    home,
    "paste",
    JSON.stringify({ name: "solo", type: "local", command: ["a"] }),
  );
  assert.equal(result.drafts[0]?.id, "solo");
  assert.equal(result.drafts[0]?.definition.command instanceof Array, true);
  assert.equal("name" in (result.drafts[0]?.definition ?? {}), false);
});

test("importManifest rejects a manifest with an invalid server", async () => {
  await assert.rejects(
    () =>
      importManifest(
        home,
        "paste",
        JSON.stringify({ mcp: { bad: { type: "local" } } }),
      ),
    (error: unknown) => error instanceof McpError && error.status === 400,
  );
});

test("analyzeDefinition warns instead of failing on non-string env values", () => {
  const info = analyzeDefinition({
    type: "local",
    command: ["a"],
    environment: { PORT: 1234 },
  });
  assert.equal(info.errors.length, 0);
  assert.ok(info.warnings.some((warning) => warning.includes("PORT")));
});

test("group config round-trips through mcp-manager/groups.json", async () => {
  const initial = await readGroups(home);
  assert.deepEqual(initial.groups, []);
  const saved = await writeGroups(home, {
    version: 1,
    groups: [{ id: "daily", name: "Daily", serverIds: ["a"] }],
  });
  assert.equal(saved.groups[0]?.serverIds[0], "a");
  const file = path.join(
    home,
    ".config",
    "openchamber",
    "mcp-manager",
    "groups.json",
  );
  assert.ok((await readText(file)).includes('"daily"'));
});
