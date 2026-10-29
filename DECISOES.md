# Decisions

Every place where MCP does not map one-to-one onto a skill is listed here with the reason.
Anything not listed here was ported as-is.

The MCP shape follows `https://opencode.ai/config.json`: `mcp.servers.<id>` is current, flat
`mcp.<id>` with `enabled` is deprecated but still accepted by OpenCode.

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
- "Stop this server" in OpenCode terms is `disabled: true`. There is no separate runtime state
  that survives a config reload, so a start/stop button would be a lie after restart.

## 2. No tools/resources discovery

**Decision.** The extension does not list a server's tools, resources or prompts.

**Why.** That information only exists after an MCP handshake (`initialize` → `tools/list`),
which needs the real process or endpoint. Doing it from the service would duplicate OpenCode's
client, execute user commands on panel render, and hit remote servers with the user's
credentials on every rescan.

**Partial substitute.** `advertised` means "OpenCode will load this and its tools are not
disabled by the `tools` section" — a static, honest prediction. When a load actually failed, the
panel shows what OpenCode itself logged (decision 20) instead of guessing.

## 3. No token estimate

**Decision.** The skills panel shows `~N tokens/step`. The MCP panel shows no number.

**Why.** Skill token cost is a function of text the extension already reads. MCP token cost
depends on the server's tool schemas, which are unknown until connected. Any number would be
invented.

## 4. No `mixed` state

**Decision.** States are `enabled`, `disabled`, `invalid`, `conflict`.

**Why.** In skills, one id can resolve to several files, so "mixed" exists. In MCP, one id is one
key in one container; `disabled` is a single boolean. The equivalent problem — the same id in
two places — is `conflict`, and it is blocking.

## 5. The `mcp` block is rewritten as a whole

**Decision.** Every write re-serialises the `mcp` object and splices it into the file.
Everything **outside** the `mcp` block keeps its bytes, including comments, key order,
indentation style and line endings — those last two are read from the file, not assumed.

**Why.** Splicing a single nested server member in place is possible but fragile: insertion
points, comma handling, nested objects and arrays each need their own case, and a mistake
silently corrupts a config the whole tool depends on. Whole-block replacement is verifiable:
the result is parsed again and compared with the intended object, and the previous file is kept
as `opencode.json.mcp-manager.bak`.

**Cost, measured.** Toggling one server in a real 13 KB config changed exactly one line
(`"disabled": false` → `true`) plus one hand-written single-line object that was reflowed.
Comments and formatting **inside** the `mcp` block do not survive a write; nothing else moves.

## 6. `disabled` is written explicitly

**Decision.** Inside `mcp.servers`, enable writes `"disabled": false` and disable writes
`"disabled": true`; the key stays and keeps its position in the entry. Deprecated entries get
`enabled` instead, in the same way.

**Why.** Deleting the key would mean the same thing but make "was this ever disabled, or never
touched?" indistinguishable, and toggling twice would produce a different file each time.
Writing the flag in place also keeps the diff to one line.

## 7. Two definitions for one id is a blocking conflict

**Decision.** The same server id in `opencode.json` and `opencode.jsonc`, or in `mcp.servers`
and as a deprecated entry of the same file, is `both` → blocking. Toggling is refused until you
choose which definition to keep. Writing new servers targets the file that already exists (or
`opencode.json`), always into `mcp.servers`.

**Why.** OpenCode loads one definition per id; which one wins is not something the extension
can observe reliably. Guessing would edit a definition that has no effect while the user
believes the change applied.

## 8. Secrets are never returned

**Decision.** `GET /servers/detail` blanks every `environment.*`, `headers.*` and
`oauth.client_secret` value, and lists what it blanked in `maskedPaths`. Saving re-attaches the
stored value for any key whose submitted value is an empty string.

**Why.** The panel lives in a sandboxed iframe and the response crosses the host bridge; API
keys do not belong in that payload. Empty string is the only signal that survives the form
round-trip without inventing a placeholder that could be written back as a literal.

**Consequence.** You cannot *clear* a secret by emptying the field; remove the row instead.

## 9. Different conflict kinds

| Skills kind | MCP replacement | Why |
| --- | --- | --- |
| `both` (file and `.disabled` in one dir) | `both` (same id in two containers or two files) | the only "two candidates for one id" case |
| `invalid` frontmatter | `invalid` (definition fails schema validation) | same role |
| `empty` | — | no empty-file concept |
| `duplicate` (same id, several files) | `duplicate` (same key twice in one container) | `JSON.parse` keeps the last one silently, exactly the trap worth reporting |
| `read-error` | `read-error` (unreadable/unparsable config) | same, blocking |
| `manual` (disable-model-invocation) | `tools-off` | both mean "enabled but the model cannot use it" |
| `no-description` | `insecure-url`, `stub` | no description field exists; an `http://` remote or a deprecated entry that only carries the flag are the closest "you probably did not mean this" |

## 10. Import exists in the service, not in the panel

**Decision.** `POST /servers/import` accepts a manifest by paste, URL or local path, validates
it, and returns drafts; it never writes. The panel has no button for it: servers are added to
`mcp.servers` by hand and then loaded with **Rescan**.

**Why.** Skills install = drop a file, which the OS can do. MCP install = add a key to a config
that also holds unrelated settings, and this panel is a manager for what is already configured,
not a marketplace. The endpoint stays because it is the only sane way to script a bulk
registration, and accepting only the shapes OpenCode already defines avoids inventing a
registry format.

## 11. No preset groups

**Decision.** The groups file starts empty.

**Why.** The skills project shipped six presets that named that author's skills. Server ids
are arbitrary per user (`github`, `context7`, `my-db`), so a preset list would be noise. The
editor therefore has no "restore presets" button: there is nothing to restore.

## 12. Scope stays global-only

**Decision.** Only `~/.config/opencode/opencode.json` and `opencode.jsonc`. Project
`opencode.json`, `OPENCODE_CONFIG`, `.opencode/`, remote/managed configs: never read, never
written.

**Why.** Same boundary as the skills extension; a project file is usually in version control
and shared, so a panel that silently edits it is a different, riskier product.

## 13. No background watcher

**Decision.** Reads happen on panel load and on **Rescan**.

**Why.** Parity with the skills extension, and it keeps the service free of file-watch handles
for a file other tools also edit.

## 14. `id` validation on create, not on read

**Decision.** New or renamed ids must match `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`. Existing ids
outside that shape are still listed, toggled and removed.

**Why.** Refusing to display a server that OpenCode already loads would hide a real problem;
refusing to create a weird one prevents it.

## 15. New servers go to `mcp.servers`; deprecated ones stay where they are

**Decision.** Create, import and bulk operations write `mcp.servers`. A deprecated `mcp.<id>`
entry that you toggle or edit is written back as a deprecated entry.

**Why.** Migrating on write would be an unrequested, silent rewrite of a structure the user
built (and OpenCode still honours), and it would break the "one line changed" property of a
toggle. The panel marks deprecated rows so the choice to migrate is visible.

## 16. Advanced fields are preserved, not edited

**Decision.** `timeout`, `codemode`, `protocol` and `oauth` are read for display and carried
through every save, but the form does not edit them.

**Why.** `timeout` became an object (`{startup, catalog, execution}`) while the deprecated shape
kept a number; one input cannot mean both. `oauth` has six fields across camelCase and
snake_case variants depending on the container, and a wrong guess there locks a user out of
their own server. Editing them by hand in the config is one line; modelling them correctly in
the panel is a large surface for a rare change.

## 17. Import normalises the deprecated shape

**Decision.** Drafts from a deprecated flat `mcp` block are converted on the way in:
`enabled` → `disabled`, and an integer `timeout` → `{execution: n}`. The draft list shows the
ids, and saving writes the current shape.

**Why.** The schema rejects a bare-number `timeout` inside `mcp.servers` (`additionalProperties:
false`), so importing a legacy manifest verbatim would write a config OpenCode refuses. Silent
value loss is worse than a documented conversion.

## 18. A bare-number timeout inside `mcp.servers` is reported as invalid

**Decision.** `mcp.servers.<id>.timeout = 5000` is an error (row shows Invalid, toggle
refused); `{"execution": 5000}` is accepted.

**Why.** The two shapes are not equivalent — the object distinguishes startup, catalog and
execution timeouts — and the schema rejects the number. Reporting it is more useful than
pretending the server is fine.

## 19. The panel does not create servers

**Decision.** There is no **Add server** button. Creating a server means adding an entry to
`mcp.servers` in the config; the panel then edits, toggles, groups and deletes what exists.
The title carries the count (`MCP Manager - 8 / 42 enabled`), not a summary block.

**Why.** Adding a server is a naming and transport decision made once, with the upstream
documentation open; a form that guesses `command`/`url`/`environment` adds a failure mode
without removing work. `POST /servers/save` still creates and renames (used by **Edit** and by
scripts), so nothing is lost on the service side.

## 20. The failure cause comes from OpenCode's log, not from a probe

**Decision.** After scanning the config, the service reads the tail (4 MB) of
`~/.local/share/opencode/log/opencode.log`, keeps the latest `mcp` event per server id, and
reports a failure only when that last event is one: `mcp connect failed`,
`mcp http authentication rejected` or `mcp oauth authorization failed`. `mcp transport error`
(runtime noise: cancelled requests, tool errors) is ignored. The panel shows a disclosure only
when a failure exists.

**Why.** The user asked for "the cause when the MCP fails to load". The only source of that
information without breaking decision 1 is the log OpenCode already writes, which contains the
`status.error` string, HTTP status, origin and the directory of the attempt. Late-binding to a
later `mcp connected` line means the badge disappears as soon as the server recovers, instead of
relying on a timestamp heuristic.

**Cost.** One 4 MB tail read per scan (~30 ms on a 37 MB log), read-only, no new permission.
**Known limit.** If the log is rotated or emptied, failures vanish from the panel; the data is
only as fresh as the file.

