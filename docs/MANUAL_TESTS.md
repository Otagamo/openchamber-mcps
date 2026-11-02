# Manual test checklist

Automated coverage: `npm test` (JSONC splicing, scan/conflict classification, enable/disable,
save/rename, secret preservation, remove, duplicate resolve, import, group store). Everything
below needs a human, a real OpenChamber, and a real OpenCode config.

## Install and wiring

- [ ] `npm ci && npm run typecheck && npm run test` passes on a clean checkout.
- [ ] `npm run build` produces `panel/main.js` and `service/main.js`, and both are committed.
- [ ] Add extension → Folder → this directory; panel appears with the "server" icon titled **MCP**.
- [ ] Service runs only after allowing it in Settings → Extensions; denying it shows the
      "Allow MCP Manager to run its local service…" sentence, not a raw error.
- [ ] Panel renders in a narrow sidebar (<380 px): group tabs collapse into the dropdown,
      no horizontal scroll.

## Read path

- [ ] With no `opencode.json`, the panel shows the empty state and the config path.
- [ ] With servers defined under `mcp.servers`, rows match `opencode.json` (id, type, command/url, env/header counts).
- [ ] A server with `"disabled": true` shows as Disabled and is not counted as advertised.
- [ ] A deprecated top-level `mcp.<id>` entry is listed with the `deprecated entry` stat.
- [ ] `mcp.timeout` (global) is not listed as a server.
- [ ] A server with `"tools": { "id_*": false }` at the top level is not counted as advertised
      and shows the `tools-off` warning.
- [ ] A `timeout` object is summarized (`timeout startup 5s · execution 30s`); a bare number is
      reported as invalid.
- [ ] **Rescan** picks up an edit made in another editor without restarting OpenChamber.

## Load failures

- [ ] Enable a server that starts fine → row reads **Starting…**, then
      **Connected · N tools** within the 15 s window (OpenCode reloads the config).
- [ ] Enable a server whose command does not exist → row reads **Failed to load** with the cause,
      without pressing Rescan (same window).
- [ ] Enable with no reload happening → after ~15 s it settles on **Enabled · not loaded yet**;
      **Rescan** later picks up the real outcome.
- [ ] A remote server with a bad `Authorization` header → disclosure shows the HTTP status and the
      endpoint, not a stack trace.
- [ ] Fix the cause and let it connect → after **Rescan** the badge is gone (a later
      `mcp connected` clears it).
- [ ] Disable a failing server → the disclosure is not shown while it is disabled.
- [ ] A server that only produced `mcp transport error` lines (tool/cancel noise) has no badge.
- [ ] With no log directory, every row renders exactly as before (no badge, no disclosure).

## Write path

- [ ] Toggle off → `"disabled": true` appears on that one line; the rest of the file is unchanged
      (`git diff` or a manual diff against the `.bak`).
- [ ] Comments and key order **outside** `mcp` survive a write; line endings and indentation
      style are unchanged.
- [ ] Toggling a deprecated entry writes `"enabled"`, not `"disabled"`.
- [ ] `opencode.json.mcp-manager.bak` contains the exact previous file.
- [ ] Restart OpenCode: a disabled server is not started, an enabled one is.
- [ ] File mode after write is unchanged from before (`0600` typical on Linux/macOS).
- [ ] **Enable all** / **Disable all** ask first, then flip everything in one request.
- [ ] Bulk is refused while a blocking conflict exists, and the conflict list is shown.

## Editor

- [ ] **Edit** on a local server whose command has a quoted argument containing a space; save
      without changes → file unchanged.
- [ ] Empty the command → inline error, nothing written.
- [ ] Change the id to one with a space → rejected before the request.
- [ ] Edit a server's env: existing token field is blank with the "kept" placeholder; saving
      without touching it keeps the token in the file.
- [ ] Remove the token row and save → the key is gone from the file.
- [ ] Rename an id → the old key disappears, the new one appears, nothing else changes.
- [ ] Delete a server → key removed, `.bak` holds the previous file, toast confirms.
- [ ] Editing a server defined in `opencode.jsonc` writes back to `opencode.jsonc`.
- [ ] There is no **Add server** button and no **Install from source** panel; the header shows
      `MCP Manager - <enabled> / <total> enabled` and no summary lines.

## Import (service API, no panel UI)

- [ ] `POST /servers/import` with `{"kind":"paste","value":"…"}` returns drafts and writes nothing.
- [ ] A deprecated flat `mcp` block with `enabled` and a numeric `timeout` comes back as
      `disabled` and `{ "execution": n }`.
- [ ] A single definition with `name` is returned without the `name` field.
- [ ] A whole `opencode.json` yields only its `mcp` servers.
- [ ] A manifest with one invalid server → 400 naming the offending id.
- [ ] URL and path kinds work; unreachable host and missing file both return a clear message.

## Conflicts

- [ ] Same id in `opencode.json` and `opencode.jsonc`, or in `mcp.servers` and as a deprecated
      entry → blocking, toggling refused with the conflict payload; **Keep …** removes the
      losing definition and backs the file up.
- [ ] Same key twice inside one container → duplicate warning naming the key.
- [ ] Deprecated stub (`{ "enabled": false }` only) → warning, toggle still works.
- [ ] `timeout`, `codemode`, `protocol` and `oauth` survive an edit unchanged.
- [ ] Invalid definition (e.g. `{"type":"local"}`) → row is Invalid, switch disabled,
      **Edit definition** opens the form with what could be read.
- [ ] Unparsable config → blocking card with the parser message; every write refused;
      fixing the file and **Rescan** clears it.
- [ ] Read-only config file → write fails with a permission sentence, config untouched.

## Groups

- [ ] First open with no groups file → empty group list, **Edit groups** works.
- [ ] Create, rename, delete, and reorder members; order sets the step numbers in the list.
- [ ] Group with a member that no longer exists → shown as missing, group actions blocked,
      chip removes it.
- [ ] Corrupt `groups.json` → panel keeps working for servers, group editing disabled with a
      message; the original file is not overwritten.
- [ ] **Only this group** disables everything outside it after confirmation.

## Security and scope

- [ ] No request reaches the service without the Bearer token (curl without the header → 401).
- [ ] Service listens on `127.0.0.1` only (`netstat`/`lsof`).
- [ ] Panel responses never contain an env or header value (inspect `/servers/detail`).
- [ ] Project `opencode.json` in a test repo is not read or written.
- [ ] `OPENCODE_CONFIG` pointing elsewhere does not change what the extension edits.
- [ ] Outbound traffic happens only during an explicit URL import.
