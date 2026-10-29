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
- [ ] With servers defined, rows match `opencode.json` (id, type, command/url, env/header counts).
- [ ] A server with `"enabled": false` shows as Disabled and is not counted as advertised.
- [ ] A server with `"tools": { "id_*": false }` at the top level is not counted as advertised
      and shows the `tools-off` warning.
- [ ] **Rescan** picks up an edit made in another editor without restarting OpenChamber.

## Write path

- [ ] Toggle off → `"enabled": false` appears; the rest of the file is unchanged
      (`git diff` or a manual diff against the `.bak`).
- [ ] Comments and key order **outside** `mcp` survive a write.
- [ ] `opencode.json.mcp-manager.bak` contains the exact previous file.
- [ ] Restart OpenCode: a disabled server is not started, an enabled one is.
- [ ] File mode after write is unchanged from before (`0600` typical on Linux/macOS).
- [ ] **Enable all** / **Disable all** ask first, then flip everything in one request.
- [ ] Bulk is refused while a blocking conflict exists, and the conflict list is shown.

## Editor

- [ ] Add server, local type, command with quoted argument containing a space.
- [ ] Add server with an invalid command (empty) → inline error, nothing written.
- [ ] Add server with an id containing a space → rejected before the request.
- [ ] Edit a server's env: existing token field is blank with the "kept" placeholder; saving
      without touching it keeps the token in the file.
- [ ] Remove the token row and save → the key is gone from the file.
- [ ] Rename an id → the old key disappears, the new one appears, nothing else changes.
- [ ] Delete a server → key removed, `.bak` holds the previous file, toast confirms.
- [ ] Editing a server defined in `opencode.jsonc` writes back to `opencode.jsonc`.

## Import

- [ ] Paste an `mcp` block → drafts listed, **Add** writes them.
- [ ] Paste a single definition with `name` → imported without the `name` field.
- [ ] Paste a whole `opencode.json` → only the `mcp` block is used.
- [ ] Paste a manifest with one invalid server → whole import refused with the offending id.
- [ ] URL import of a reachable manifest works; unreachable host and non-200 both show a clear
      sentence (no stack trace).
- [ ] Path import of a directory with `mcp.json` works; a directory without one reports what it
      looked for.
- [ ] Importing an existing id lists it under "already present" and overwrites on **Add**.

## Conflicts

- [ ] Same id in `opencode.json` and `opencode.jsonc` → blocking, toggling refused with the
      conflict payload; **Keep this file** removes it from the other file and backs it up.
- [ ] Same key twice inside `mcp` → duplicate warning naming the key.
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
