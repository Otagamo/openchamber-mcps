# Analysis of `openchamber-skills`

Reference project: `C:\Projetos\Outros\openchamber-skills` (v0.3.1, MIT).
Analysed on 2026-10-29 by reading the whole source tree; nothing in that project was modified.

## 1. What the extension is

An OpenChamber extension with two contributed surfaces:

| Surface | Entry | Role |
| --- | --- | --- |
| Panel | `panel/index.html` → `panel/main.js` | UI rendered in a host iframe |
| Service | `service/main.js` (runtime `host`) | Local HTTP server the panel talks to |

It toggles OpenCode **global skill** entries on and off by renaming files inside
`~/.config/opencode/skills`. It never edits skill bodies and never touches any other
skill directory.

## 2. File map

```text
package.json          extension manifest + scripts (esbuild, tsc, node --test)
panel/index.html      panel document, loads main.js, #root
panel/main.js         BUILD OUTPUT (iife, minified)
service/main.js       BUILD OUTPUT (esm, node22, packages external)
scripts/build.mjs     esbuild: panel → browser iife, service → node esm
scripts/preview.mjs   static server for the synthetic preview
scripts/preview.html  preview shell
scripts/preview.js    synthetic data + fake service for the preview
src/core/skills.ts    scan, frontmatter, conflicts, rename transactions, batch
src/core/groups.ts    group config read/write, atomic replace, 0600
src/service/main.ts   HTTP routing, Bearer check, serialised access
src/shared/types.ts   panel ↔ service contract
src/shared/groups.ts  preset groups, group validation
src/panel/main.ts     panel: summary, groups, conflicts, list, toggles
src/panel/style.css   panel styling, `sk-` class prefix
ui/native.css         host base styles, inlined at build time
tests/                node:test suites (scan, HTTP, groups)
```

## 3. Manifest and load contract

`package.json` → `openchamber`:

- `apiVersion: 1`, `engines.openchamber: ">=2.4.0"`.
- `contributes.panel`: `{ id: "skills-manager", name: "Skills", icon: "list-check-2", entry: "panel/index.html" }`.
- `contributes.service`: `{ entry: "service/main.js", runtime: "host", permissions: {} }`.
- `files`: `panel/`, `service/`, `README.md` — the host fetches the **prebuilt** files, so a
  release must contain build output, not sources.

The host starts the service and passes `OPENCHAMBER_SERVICE_PORT` and
`OPENCHAMBER_SERVICE_TOKEN` in the environment. The service binds `127.0.0.1` only and
rejects any request whose `Authorization` is not `Bearer <token>`.

The panel runs sandboxed with no Node access; it reaches the service only through
`@openchamber/sdk`'s `connectHost()` → `host.serviceRequest()`, and reports through
`host.toast()`. UI primitives (`mountButton`, `mountSelect`) come from `@openchamber/sdk/ui`.

## 4. Domain model

Root: `path.join(os.homedir(), '.config', 'opencode', 'skills')`.

Discovery (`scanSkills`):

- Directory entries containing `SKILL.md`.
- At depth 0 only, flat `<id>.md` entries.
- Directories are walked breadth-first up to depth 6, skipping `node_modules`, `.git`,
  `.svn`, `.hg`, dotfiles; symlink loops avoided via `realpath` bookkeeping.
- An entry is "disabled" when the file is named `SKILL.md.disabled` / `<id>.md.disabled`.

State per id: `enabled` | `disabled` | `mixed` (several entries, some on some off) |
`conflict` (one directory holds both the active and the disabled file).

Conflicts: `both` (blocking), `duplicate`, `invalid` frontmatter, `empty`, `read-error`,
`manual` (disable-model-invocation), `no-description`. Non-blocking conflicts become
warnings. "Advertised" = enabled, readable, valid, non-empty, has a description and is not
manual-only.

Token estimate: `ceil((name + id + description) / 4) + 8` when advertised — an estimate only.

## 5. Write path

- Toggle = `fs.rename(active → active.disabled)` or the reverse, validated up front
  (target must not exist, source must exist) and rolled back in reverse order if a rename
  fails; every rename is re-verified afterwards.
- Batch (`enable[]`, `disable[]`, max 200) and bulk (all on / all off) build one move list
  and reuse the same transactional `applyMoves`.
- Conflicts that would make the result ambiguous (`both`) block the write with HTTP 409 and
  the conflict list in the body.
- Resolving `both` renames the stale disabled file to `.conflict-<time>-<uuid>` and then
  either keeps the active file (enabled) or swaps it into place (disabled). No file is
  ever deleted.

## 6. Persistence

| Data | Location | Notes |
| --- | --- | --- |
| Enabled/disabled | the `.disabled` filename itself | no state file |
| Groups | `~/.config/openchamber/skills-manager/groups.json` | version 1, ≤50 groups, ≤40 chars per name, ≤200 members, atomic write with `0600` |

Group config is metadata only; it never changes skill files. A corrupt groups file is
reported and editing is disabled until it is fixed — the original file is never overwritten
silently.

## 7. Service API

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/health` | — | `{ok:true}` |
| GET | `/skills` | — | scan |
| POST | `/skills/toggle` | `{id, enabled}` | scan |
| POST | `/skills/bulk` | `{enabled}` | scan + `changed` |
| POST | `/skills/batch` | `{enable[], disable[]}` | scan + `changed` |
| POST | `/skills/resolve` | `{path, keep}` | scan + `backupPath` |
| GET | `/groups` | — | groups file |
| POST | `/groups` | groups file | groups file |

All mutating calls go through a promise queue so two requests never interleave. Bodies are
capped at 256 KB. Errors are `{error, code, conflicts?}` with 4xx/5xx status; unknown
internal failures become a generic 500 and are logged to stderr only.

## 8. Panel behaviour

Header (counts + token estimate), group chips with a dropdown under 380 px, group editor
(create/rename/delete/restore with inline confirmations, member checkboxes, missing-member
chips), conflict card (blocking list + collapsible warnings), search, one row per skill with
a switch, footer with scope notes, and inline notices for every destructive action
(`Enable all`, `Disable all`, `Only this group`).

Error mapping is explicit: `NO_SERVICE`, `SERVICE_FAILED`, `DISABLED`, `HOST_TIMEOUT`
produce user-facing sentences instead of raw codes.

## 9. Dependencies, scripts, tests

- Dev only: `@openchamber/sdk@2.5.0`, `esbuild`, `typescript`, `@types/node`. No runtime
  dependency; the service uses `node:http`, `node:fs`, `node:path`, `node:crypto` only.
- `npm run build` (esbuild), `watch`, `typecheck` (`tsc --noEmit`, strict, no emit),
  `preview` (synthetic data, never reads real skills), `test` (builds first, then
  `node --experimental-strip-types --test tests/*.test.*`).

## 10. Integration points to preserve in a port

1. `openchamber` manifest block (panel id/name/icon/entry, service entry/runtime/permissions).
2. Prebuilt `panel/main.js` + `service/main.js` shipped in the repo.
3. `connectHost` / `serviceRequest` / `toast` usage; no direct fetch, no Node in the panel.
4. Bearer-token check, loopback-only bind, serialised writes, body-size cap.
5. Typed contract in `src/shared/types.ts`, defensively re-parsed in the panel.
6. Atomic writes with restrictive permissions for anything the extension owns.
7. Explicit, user-facing error sentences; no silent fallbacks.
