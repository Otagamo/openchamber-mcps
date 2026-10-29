# Decisions

Every place where MCP does not map one-to-one onto a skill is listed here with the reason.
Anything not listed here was ported as-is.

## 1. No process supervision, start/stop or health check

**Decision.** The extension only reads and writes declarative config. It never spawns an MCP
process, never probes an endpoint, never decides whether a server is "up".

**Why.**
- OpenCode already owns the lifecycle: it starts local servers, connects remote ones, handles
  OAuth and reconnects. A second supervisor would race with it, and the port the extension
  found healthy is not necessarily the one OpenCode uses.
- The service runs inside OpenChamber's host with `permissions: {}` — no exec, no network
  capability. Adding those permissions would widen the security surface of an extension whose
  whole job is editing one JSON file.
- "Stop this server" in OpenCode terms is `enabled: false`. There is no separate runtime
  state that survives a config reload, so a start/stop button would be a lie after restart.

**Consequence.** The panel's switch toggles `enabled` and says so. Whether the server actually
connects is OpenCode's business; the footer says changes apply on the next config load.

## 2. No tools/resources discovery

**Decision.** The extension does not list a server's tools, resources or prompts.

**Why.** That information only exists after an MCP handshake (`initialize` → `tools/list`),
which needs the real process or endpoint. Doing it from the service would duplicate OpenCode's
client, execute user commands on panel render, and hit remote servers with the user's
credentials on every rescan.

**Partial substitute.** `advertised` means "OpenCode will load this and its tools are not
disabled by the `tools` section" — a static, honest prediction.

## 3. No token estimate

**Decision.** The skills panel shows `~N tokens/step`. The MCP panel shows no number.

**Why.** Skill token cost is a function of text the extension already reads (name + id +
description). MCP token cost depends on the server's tool schemas, which are unknown until
connected. Any number would be invented.

## 4. No `mixed` state

**Decision.** States are `enabled`, `disabled`, `invalid`, `conflict`.

**Why.** In skills, one id can resolve to several files (a directory entry and a flat file),
so "mixed" exists. In MCP, one id is one key in one `mcp` object; `enabled` is a single
boolean. The equivalent problem — the same id in two config files — is `conflict`, and it is
blocking.

## 5. The `mcp` block is rewritten as a whole

**Decision.** Every write re-serialises the `mcp` object with 2-space indentation and splices
it into the file. Everything **outside** the `mcp` block keeps its bytes, including comments,
key order and unrelated settings.

**Why.** Splicing a single nested server member in place is possible but fragile: insertion
points, comma handling, nested objects and arrays each need their own case, and a mistake
silently corrupts a config the whole tool depends on. Whole-block replacement is verifiable:
the result is parsed again and compared with the intended object, and the previous file is
kept as `opencode.json.mcp-manager.bak`.

**Cost, stated plainly.** Comments and hand-formatting *inside* the `mcp` block are lost on
the first write. Nothing else is.

## 6. `enabled` is written explicitly

**Decision.** Enable writes `"enabled": true`; disable writes `"enabled": false`. The key is
never deleted.

**Why.** Deleting it would express the same thing but make "was this ever disabled, or never
touched?" indistinguishable, and toggling twice would produce a different file each time.

## 7. Two config files defining the same id is a blocking conflict

**Decision.** `opencode.json` and `opencode.jsonc` are both scanned. The same server id in
both is `both` → blocking; toggling is refused until you choose. Writing new servers targets
the file that already exists, or `opencode.json` when neither exists.

**Why.** OpenCode loads one config per scope; which of the two wins is not something the
extension can observe reliably. Guessing would edit a file that has no effect while the
user believes the change applied.

## 8. Secrets are never returned

**Decision.** `GET /servers/detail` blanks every `environment.*` and `headers.*` value and
`oauth.clientSecret`, and lists what it blanked in `maskedPaths`. Saving re-attaches the stored
value for any key whose submitted value is an empty string.

**Why.** The panel lives in a sandboxed iframe and the response crosses the host bridge; API
keys do not belong in that payload. Empty string is the only signal that survives the form
round-trip without inventing a placeholder that could be written back as a literal.

**Consequence.** You cannot *clear* a secret by emptying the field; remove the row instead.
Documented in the panel hint.

## 9. Different conflict kinds

| Skills kind | MCP replacement | Why |
| --- | --- | --- |
| `both` (file and `.disabled` in one dir) | `both` (same id in two config files) | the only "two candidates for one id" case |
| `invalid` frontmatter | `invalid` (definition fails validation) | same role |
| `empty` | — | no empty-file concept |
| `duplicate` (same id, several files) | `duplicate` (same key twice in one `mcp` block) | JSON.parse keeps the last one silently, exactly the trap worth reporting |
| `read-error` | `read-error` (unreadable/unparsable config) | same, blocking |
| `manual` (disable-model-invocation) | `tools-off` | both mean "enabled but the model cannot use it" |
| `no-description` | `insecure-url` (warning) | no description field exists; an `http://` remote is the closest "you probably did not mean this" |

## 10. Import instead of "install"

**Decision.** `POST /servers/import` accepts a manifest by paste, URL or local path, validates
it, and returns drafts. It never writes; the panel saves each draft through the normal
save path.

**Why.** Skills install = drop a file, which the OS can do. MCP install = add a key to a config
that also holds unrelated settings, so it must go through the same validated write. Accepting
only the shapes OpenCode already defines (an `mcp` block, a single definition with a `name`,
or a whole `opencode.json`) avoids inventing a registry format.

## 11. No preset groups

**Decision.** The groups file starts empty.

**Why.** The skills project shipped six presets that named that author's skills. Server ids
are arbitrary per user (`github`, `context7`, `my-db`), so a preset list would be noise.

## 12. Scope stays global-only

**Decision.** Only `~/.config/opencode/opencode.json` and `opencode.jsonc`. Project
`opencode.json`, `OPENCODE_CONFIG`, `.opencode/`, remote/managed configs: never read, never
written.

**Why.** Same boundary as the skills extension; a project file is usually in version control
and shared, so a panel that silently edits it is a different, riskier product.

## 13. No background watcher

**Decision.** Reads happen on panel load and on **Rescan**.

**Why.** Parity with the skills extension, and it keeps the service free of file-watch
handles for a file other tools also edit.

## 14. `id` validation on create, not on read

**Decision.** New or renamed ids must match `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`. Existing ids
outside that shape are still listed, toggled and removed.

**Why.** Refusing to display a server that OpenCode already loads would hide a real problem;
refusing to create a weird one prevents it.
