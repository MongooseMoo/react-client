# Client.Apps

The Apps tab lists the apps that can act as the player on the web, approves an
app's device-flow code, revokes an app, and gets a password for mounting the
MOO's WebDAV drive (`https://mongoose.world/dav/`). It advertises
`Client.Apps 1` through `Core.Supports`. The MOO acts for the logged-in
connection's player only (`$gmcp_apps`).

| Client sends | Server answers |
| --- | --- |
| `Client.Apps.List {}` | `Client.Apps.List {"apps": [{"name", "approved"}]}` (`approved` in Unix seconds) |
| `Client.Apps.Approve {"code"}` | `Client.Apps.Result {"ok", "message"}`, then `List`. Same as `@approve <code>` |
| `Client.Apps.Revoke {"name"}` | `Client.Apps.Result {"ok", "message"}`, then `List`. Same as `@apps revoke <name>` |
| `Client.Apps.Drive {}` | `Client.Apps.Drive {"url", "user", "password"}`, then `List` |

`Drive`'s password is a new app token named `drive`; asking again replaces it,
so the previous drive password stops working. It is sent only over GMCP and
never as game text. The client shows it once and keeps it only in memory.
