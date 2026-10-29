# Concept mapping: skills → MCP servers

`openchamber-mcps` keeps the architecture of `openchamber-skills` (panel + local service +
shared contract) and swaps the domain. Nothing about the extension model changes.

The MCP shape follows the schema at `https://opencode.ai/config.json`, which is the authority:

- current: `mcp.servers.<id>` with `disabled?: boolean`, `codemode?`, `protocol?`,
  `timeout?: {startup, catalog, execution}`;
- deprecated but still accepted: `mcp.<id>` with `enabled?: boolean`, integer `timeout`.

## 1. Model

| Skills project | MCP project |
| --- | --- |
| Skill entry (`SKILL.md`, `<id>.md`) | Entry `"<id>": { … }` under `mcp.servers` |
| Skill id = file/directory name | Server id = key under `mcp.servers` |
| `SKILL.md` ↔ `SKILL.md.disabled` rename | `"disabled": true` ↔ `false` in the entry |
| `~/.config/opencode/skills` | `~/.config/opencode/opencode.json` (and `opencode.jsonc`) |
| Recursive directory scan | Parse + tokenise the config, read `mcp.servers` and deprecated entries |
| Frontmatter `name` / `description` | `type`, `command[]`, `url`, `environment`, `headers`, `cwd` |
| Entry conflicts (`both`, `duplicate`, …) | Config conflicts (`both`, `duplicate`, `read-error`, `invalid`, `stub`, `tools-off`) |
| "Advertised" = visible to the model | Enabled **and** valid **and** not disabled by the `tools` section |
| Groups of skills | Groups of servers (same file, same limits, same UI) |
| Install = put a file in the directory | Install = import a manifest (paste / URL / path) then save it |

## 2. Concept by concept

### skill → mcp server

A skill is a file the OpenCode scanner discovers. An MCP server is a declarative entry the
OpenCode runtime connects to. Both are addressed by a stable id and both are enabled or
disabled without deleting anything: the skill by renaming the file, the server by flipping
`disabled`.

### skill manifest → server definition

| Field | Meaning |
| --- | --- |
| `type` | `"local"` or `"remote"` (required by the schema) |
| `command` | array: executable + arguments, local only |
| `cwd` | working directory, local only |
| `environment` | env vars passed to the spawned process, local only |
| `url` | endpoint, remote only |
| `headers` | HTTP headers (API keys usually live here), remote only |
| `oauth` | `false` disables OAuth detection; an object pre-registers a client |
| `disabled` | whether OpenCode skips it on load (deprecated entries use `enabled`) |
| `timeout` | `{startup, catalog, execution}` in ms — an object, not a number |
| `codemode` | whether the server is used as a code-mode tool provider |
| `protocol` | `"legacy"`, `"auto"` or `"2026-07-28"` |

Validation lives in `analyzeDefinition` (`src/core/servers.ts`): same role as the frontmatter
parser, but it can also return *errors* (unusable definition), not only warnings, and it
validates against the container the entry lives in.

### installation of a skill → registration of a server

Skills are installed by copying files. There is no installation step for an MCP server: there
is a **registration** step. `POST /servers/import` accepts:

- a manifest with an `mcp.servers` block,
- a deprecated flat `mcp` block,
- a single server definition carrying a `name`,
- a whole `opencode.json`.

`kind: "path"` reads a file, or looks for `mcp.json` / `.mcp.json` / `opencode.json` /
`opencode.jsonc` inside a directory; `kind: "url"` fetches a manifest over http(s);
`kind: "paste"` takes text from the panel. Import **validates but does not write**: the panel
shows the drafts and saves them one by one, so a bad manifest cannot half-apply. Everything
imported lands in `mcp.servers`, with `enabled` → `disabled` and a bare-number timeout →
`{execution: n}`. There is no invented registry protocol: a "registry" is any URL that serves
one of the shapes above.

### enable/disable skill → start/stop server

The MCP equivalent of the rename toggle is `disabled`. The extension writes the flag and lets
OpenCode start or skip the process. It does not spawn, supervise, health-check or stop
processes itself (see `DECISOES.md`, decision 1).

`mixed` (some entries on, some off) has no MCP counterpart: one id has one definition per
container. Two definitions for one id — same file's two containers, or the two config files —
are a blocking `conflict`.

### skill config → transport config

| Skills | MCP |
| --- | --- |
| nothing to configure | `environment` (KEY=VALUE) and `headers` (Name: value) edited as textareas |
| nothing | `command` split into argv respecting double quotes |
| nothing | transport choice `local` (stdio) vs `remote` (http endpoint) |
| nothing | `timeout`, `codemode`, `protocol`, `oauth`: preserved, not edited |

Secret values are never returned to the panel: the detail endpoint blanks them, and saving
re-attaches the stored value for keys left blank.

### MCP-specific work with no skills counterpart

| Concern | How this extension handles it |
| --- | --- |
| Process lifecycle | Owned by OpenCode. We only write config. |
| Health check | Not performed. A failing server surfaces in OpenCode, not here; the panel reports definition validity only. |
| Tools / resources listing | Not available without a live MCP handshake. Counts are not shown. |
| Context cost of tools | Not estimated (see `DECISOES.md`, decision 3). |
| `tools` section globals | Detected: a pattern that disables a server's tools marks it as not visible to the model (`tools-off`). |
| Deprecated entries | Listed and toggled in place; new or imported servers go to `mcp.servers`. |

## 3. Surface mapping

| Skills | MCP |
| --- | --- |
| `GET /skills` | `GET /servers` |
| `POST /skills/toggle` | `POST /servers/toggle` |
| `POST /skills/batch` | `POST /servers/batch` |
| `POST /skills/bulk` | `POST /servers/bulk` |
| `POST /skills/resolve` (both entries) | `POST /servers/resolve` (same id, two definitions) |
| — | `GET /servers/detail` (redacted definition) |
| — | `POST /servers/save` (create / edit / rename) |
| — | `POST /servers/remove` |
| — | `POST /servers/import` |
| `GET/POST /groups` | `GET/POST /groups` (members are server ids) |

Panel: same layout, same interactions, `mc-` class prefix instead of `sk-`. Extra UI: the
Add/Edit form, the Install-from-source panel, Delete with inline confirmation.

## 4. What is intentionally *not* equivalent

See `DECISOES.md` for the reasoning behind each:

1. No process supervision, start/stop, or health check.
2. No tools/resources listing or token estimate.
3. No `mixed` state; no `manual` / `no-description` conflicts (no such metadata).
4. No preset groups (skill presets named that author's skills; server ids are user-specific).
5. Advanced fields (`timeout`, `codemode`, `protocol`, `oauth`) are preserved, not edited.
6. The `mcp` block is rewritten as a whole on every write (comments inside it are lost).
