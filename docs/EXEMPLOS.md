# Examples

All examples assume the default global config at `~/.config/opencode/opencode.json` and the
current OpenCode schema: servers live under `mcp.servers` and are switched with `disabled`.
Nothing here requires editing that file by hand: the panel writes it, and the previous content is
always kept in `opencode.json.mcp-manager.bak`.

## 1. Add a local (stdio) server

Panel → **Add server**:

| Field | Value |
| --- | --- |
| ID | `everything` |
| Type | `local` |
| Command | `npx -y @modelcontextprotocol/server-everything` |
| Enabled | checked |

Resulting config:

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

The command is split on whitespace but respects double quotes, so
`node "/Users/me/My Servers/index.js" --port 3000` becomes three argv entries, not five.

## 2. Add a remote server with a header token

| Field | Value |
| --- | --- |
| ID | `docs` |
| Type | `remote` |
| URL | `https://mcp.example.com/mcp` |
| Headers | `Authorization: Bearer sk-…` |

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

Reopening **Edit** shows `Authorization` as an empty field with the placeholder *kept from
opencode.json*: the value never leaves the config. Save without touching it and the token stays.

## 3. Edit a local server's environment

| Field | Value |
| --- | --- |
| Environment | `DATABASE_URL=postgres://localhost/app`<br>`LOG_LEVEL=debug` |

One `KEY=VALUE` per line. Blank lines are ignored; a line without `=` is rejected before the
request is sent.

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

## 5. Import a manifest by URL

Panel → **Install from source** → paste a URL that returns one of:

```json
{ "mcp": { "servers": { "solo": { "type": "local", "command": ["bunx", "some-mcp"] } } } }
```

```json
{ "mcp": { "solo": { "type": "local", "command": ["bunx", "some-mcp"], "enabled": true } } }
```

```json
{ "name": "solo", "type": "local", "command": ["bunx", "some-mcp"] }
```

The deprecated flat block is accepted and normalised: `enabled` becomes `disabled`, and an
integer `timeout` becomes `{ "execution": n }`. Nothing is written until you press **Add**;
ids that already exist are listed first so you know they will be replaced.

## 6. Import from a local project

**Install from source** → path → `C:\work\my-server`. The service looks for, in order:
`mcp.json`, `.mcp.json`, `opencode.json`, `opencode.jsonc` inside that directory, or reads the
file directly when the path is a file.

## 7. Turn one server off for a while

Flip the row's switch. The definition stays, only the flag changes:

```json
{ "mcp": { "servers": { "docs": { "type": "remote", "url": "https://mcp.example.com/mcp", "disabled": true } } } }
```

Use **Disable all** before uninstalling the extension if you want a clean config; uninstalling
stops the service but leaves your servers as they are.

## 8. Group servers for a workflow

**Edit groups** → name `frontend` → tick `playwright` and `figma` → **Save**.

- **Enable group** enables exactly those two.
- **Disable group** disables exactly those two.
- **Only this group** enables those two and disables every other server, after an inline
  confirmation — the closest thing to "give this session a small context".

Groups are stored in `~/.config/openchamber/mcp-manager/groups.json` and never affect the
config until you run one of the group actions.

## 9. Delete a server

**Delete** on the row → confirm. The key is removed from every file and container that defined
it, and `opencode.json.mcp-manager.bak` holds the file as it was before the removal.

## 10. Recover from a broken config

If `opencode.json` does not parse, every write path is refused and the conflict card names the
file and the parser message. Reproduce:

```sh
printf '{ "mcp": { ' >> ~/.config/opencode/opencode.json
```

Fix the file (or copy `opencode.json.mcp-manager.bak` back over it), then **Rescan**.

## 11. Same id in two places

`mcp.servers.twin` plus a deprecated `mcp.twin`, or `twin` in both `opencode.json` and
`opencode.jsonc`: the row shows **Conflict** and blocking appears in the conflict card. Press
**Keep … · mcp.servers** or **Keep … · legacy entry** next to the definition you want; the other
one is removed and the file is backed up.

## 12. Migrate a deprecated entry

Open **Edit** on a row marked `deprecated entry`, change nothing, save. The panel writes it back
in place, still deprecated — it does not migrate silently. To move it to the current shape, add
it again with the same id in `mcp.servers` (or import it) and resolve the resulting conflict in
favour of `mcp.servers`.
