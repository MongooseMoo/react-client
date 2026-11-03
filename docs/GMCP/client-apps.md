# Client.Apps

The Apps tab lists the apps that can act as the player on the web, approves an
app's device-flow code, revokes an app, and gets a password for mounting the
MOO's WebDAV drive (`https://mongoose.world/dav/`) or for its MQTT broker
(`mqtts://mongoose.world:8883`). It advertises
`Client.Apps 1` through `Core.Supports`. The MOO acts for the logged-in
connection's player only (`$gmcp_apps`).

| Client sends | Server answers |
| --- | --- |
| `Client.Apps.List {}` | `Client.Apps.List {"apps": [{"name", "approved"}]}` (`approved` in Unix seconds) |
| `Client.Apps.Approve {"code"}` | `Client.Apps.Result {"ok", "message"}`, then `List`. Same as `@approve <code>` |
| `Client.Apps.Revoke {"name"}` | `Client.Apps.Result {"ok", "message"}`, then `List`. Same as `@apps revoke <name>` |
| `Client.Apps.Drive {"app"}` | `Client.Apps.Drive {"app", "url", "user", "password"}` (and `"topics"` for `mqtt`), then `List` |

`app` is `drive` (the default when it is left out) or `mqtt`. The password is a
new app token named after the app; asking again replaces it, so that app's
previous password stops working. It is sent only over GMCP and never as game
text. The client shows it once and keeps it only in memory.

For `mqtt`, `url` is the broker (`mqtts://host:port`) and `topics` the player's
own filter, `players/<number>/#`. The broker (`$mqttd`) accepts a CONNECT only
with a live `mqtt` password (any user name) and lets the client publish and
subscribe only under `players/<number>`. Revoking `mqtt`, or getting a new
`mqtt` password, disconnects clients still using the old one.

The Apps tab also shows the `mqtt` answer as a Mosquitto bridge section to
paste into a home broker's configuration (`mosquittoBridgeConfig` in
`AppsPanel.tsx`): `address` and `bridge_capath` for TLS, the user name and
password, `remote_clientid <user>-bridge`, `notification_topic
players/<number>/bridge/state` (the default `$SYS/...` state topic, which is
also the bridge's Will, is outside the player's topics and is refused), and
`topic # both 0 mongoose/ players/<number>/`, so local `mongoose/...` topics
are the player's own topics in the game, both ways.
