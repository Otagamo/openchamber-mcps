# Examples

All examples assume the default global config at `~/.config/opencode/opencode.json`.
Nothing here requires editing that file by hand: the panel writes it, and the previous content
is always kept in `opencode.json.mcp-manager.bak`.

## 1. Add a local (stdio) server

Panel → **Add server**:

| Field | Value |
| --- | --- |
| id | `everything` |
| type | `local` |
| command | `npx -y @modelcontextprotocol/server-everything` |
| environment | *(empty)* |
| enabled | checked |

Resulting config:

```json
{
  "mcp": {
    "everything": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
      "enabled": true
    }
  }
}
```

The command is split on whitespace but respects double quotes, so
`node "/Users/me/My Servers/index.js" --port 3000` becomes three argv entries, not five.

## 2. Add a remote server with a header token

| Field | Value |
| --- | --- |
| id | `docs` |
| type | `remote` |
| url | `https://mcp.example.com/mcp` |
| headers | `Authorization: Bearer sk-…` |
| timeout | `45000` |

```json
{
  "mcp": {
    "docs": {
      "type": "remote",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer sk-…" },
      "timeout": 45000,
      "enabled": true
    }
  }
}
```

Reopening **Edit** shows `Authorization` as an empty field with the placeholder *kept from
opencode.json*: the value never leaves the config. Save without touching it and the token stays.

## 3. Edit a local server's environment

| Field | Value |
| --- | --- |
| environment | `DATABASE_URL=postgres://localhost/app`<br>`LOG_LEVEL=debug` |

One `KEY=VALUE` per line. Blank lines are ignored; a line without `=` is rejected before the
request is sent.

## 4. Import a manifest by URL

Panel → **Install from source** → paste a URL that returns one of:

```json
{ "mcp": { "solo": { "type": "local", "command": ["bunx", "some-mcp"] } } }
```

```json
{ "name": "solo", "type": "local", "command": ["bunx", "some-mcp"] }
```

```json
{ "$schema": "https://opencode.ai/config.json", "theme": "dark",
  "mcp": { "solo": { "type": "local", "command": ["bunx", "some-mcp"] } } }
```

A whole `opencode.json` works because only the `mcp` block is read. Nothing is written until
you press **Add**; ids that already exist are listed first so you know they will be replaced.

## 5. Import from a local project

**Install from source** → path → `C:\work\my-server`. The service looks for, in order:
`mcp.json`, `.mcp.json`, `opencode.json`, `opencode.jsonc` inside that directory, or reads the
file directly when the path is a file.

## 6. Turn one server off for a while

Flip the row's switch. The definition stays, only the flag changes:

```json
{ "mcp": { "docs": { "type": "remote", "url": "https://mcp.example.com/mcp", "enabled": false } } }
```

Use **Disable all** before uninstalling the extension if you want a clean config; uninstalling
stops the service but leaves your servers as they are.

## 7. Group servers for a workflow

**Edit groups** → name `frontend` → tick `playwright` and `figma` → **Save**.

- **Enable group** enables exactly those two.
- **Disable group** disables exactly those two.
- **Only this group** enables those two and disables every other server, after an inline
  confirmation — the closest thing to "give this session a small context".

Groups are stored in `~/.config/openchamber/mcp-manager/groups.json` and never affect the
config until you run one of the group actions.

## 8. Delete a server

**Delete** on the row → confirm. The key is removed from every config file that defined it and
`opencode.json.mcp-manager.bak` holds the file as it was before the removal.

## 9. Recover from a broken config

If `opencode.json` does not parse, every write path is refused and the conflict card names the
file and the parser message. Reproduce:

```sh
printf '{ "mcp": { ' >> ~/.config/opencode/opencode.json
```

Fix the file (or copy `opencode.json.mcp-manager.bak` back over it), then **Rescan**.

## 10. Same id in `opencode.json` and `opencode.jsonc`

The row shows **Conflict** and blocking appears in the conflict card. Press **Keep this file**
next to the definition you want; the other file loses that key and is backed up.
