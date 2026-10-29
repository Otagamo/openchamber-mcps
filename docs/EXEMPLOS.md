# Examples

All examples assume the default global config at `~/.config/opencode/opencode.json` and the
current OpenCode schema: servers live under `mcp.servers` and are switched with `disabled`.
The panel edits and toggles what is already there; nothing is created from the UI. Every write
keeps the previous content in `opencode.json.mcp-manager.bak`.

## 1. A local (stdio) server

```json
{
  "mcp": {
    "servers": {
      "everything": {
        "type": "local",
        "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
        "disabled": false
      }
    }
  }
}
```

Add it by hand, then **Rescan**. The row shows `local` and the command; the switch flips
`disabled`.

## 2. A remote server with a header token

```json
{
  "mcp": {
    "servers": {
      "docs": {
        "type": "remote",
        "url": "https://mcp.example.com/mcp",
        "headers": { "Authorization": "Bearer sk-…" },
        "disabled": false
      }
    }
  }
}
```

Open **Edit**: the header value shows as an empty field with the placeholder *kept from
opencode.json*. Change the URL and save, and the token stays; retype the field to replace it.

## 3. Edit a local server's environment

**Edit** → Environment, one `KEY=VALUE` per line:

```
DATABASE_URL=postgres://localhost/app
LOG_LEVEL=debug
```

Blank lines are ignored; a line without `=` is rejected before the request is sent. The command
field is split on whitespace but respects double quotes, so
`node "/Users/me/My Servers/index.js" --port 3000` is three argv entries.

## 4. A request timeout, set by hand

`timeout` is not in the form on purpose (see `DECISOES.md`, decision 16) because it is an object:

```json
{
  "mcp": {
    "servers": {
      "slow": {
        "type": "local",
        "command": ["slow-mcp"],
        "timeout": { "startup": 5000, "execution": 30000 },
        "disabled": false
      }
    }
  }
}
```

The row shows `timeout startup 5s · execution 30s`. A bare `"timeout": 5000` inside `mcp.servers`
is reported as invalid — that is the deprecated shape.

## 5. Turn one server off for a while

Flip the row's switch. The definition stays, only the flag changes:

```json
{ "mcp": { "servers": { "docs": { "type": "remote", "url": "https://mcp.example.com/mcp", "disabled": true } } } }
```

The title count follows: `MCP Manager - 7 / 42 enabled`. Use **Disable all** before uninstalling
the extension if you want a clean config; uninstalling stops the service but leaves your servers
as they are.

## 6. Group servers for a workflow

**Edit groups** → name `frontend` → tick `playwright` and `figma` → **Save**.

- **Enable group** enables exactly those two.
- **Disable group** disables exactly those two.
- **Only this group** enables those two and disables every other server, after an inline
  confirmation — the closest thing to "give this session a small context".

Groups are stored in `~/.config/openchamber/mcp-manager/groups.json` and never affect the
config until you run one of the group actions.

## 7. Delete a server

**Delete** on the row → confirm. The key is removed from every file and container that defined
it, and `opencode.json.mcp-manager.bak` holds the file as it was before the removal.

## 8. Recover from a broken config

If `opencode.json` does not parse, every write path is refused and the conflict card names the
file and the parser message. Reproduce:

```sh
printf '{ "mcp": { ' >> ~/.config/opencode/opencode.json
```

Fix the file (or copy `opencode.json.mcp-manager.bak` back over it), then **Rescan**.

## 9. Same id in two places

`mcp.servers.twin` plus a deprecated `mcp.twin`, or `twin` in both `opencode.json` and
`opencode.jsonc`: the row shows **Conflict** and blocking appears in the conflict card. Press
**Keep … · mcp.servers** or **Keep … · legacy entry** next to the definition you want; the other
one is removed and the file is backed up.

## 10. Migrate a deprecated entry

Open **Edit** on a row marked `deprecated entry`, change nothing, save. The panel writes it back
in place, still deprecated — it does not migrate silently. To move it to the current shape, add
it under `mcp.servers` by hand and resolve the resulting conflict in favour of `mcp.servers`.

## 11. Import a manifest (service API)

The panel has no import button. The service endpoint is still there for scripted use:

```sh
curl -s -X POST "http://127.0.0.1:$OPENCHAMBER_SERVICE_PORT/servers/import" \
  -H "Authorization: Bearer $OPENCHAMBER_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"kind":"paste","value":"{\"mcp\":{\"servers\":{\"solo\":{\"type\":\"local\",\"command\":[\"bunx\",\"some-mcp\"]}}}}"}'
```

It returns drafts and writes nothing; `POST /servers/save` with one draft is the write step.
`kind` is `paste`, `url` or `path`; a deprecated flat `mcp` block is normalised on the way in
(`enabled` → `disabled`, numeric `timeout` → `{ "execution": n }`).
