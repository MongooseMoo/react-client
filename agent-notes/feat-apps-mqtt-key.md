# MQTT password on the Apps tab

## Goal

Q, 2026-11-03: MQTT keys "the same way we do for webdav with custom keys ... on the apps tab". The MOO's broker (`$mqttd`) now requires an `mqtt` app password and confines each client to `players/<number>`; this branch lets a player get that password on the Apps tab.

## State

`Client.Apps.Drive` carries `app` both ways (`drive` or `mqtt`); the store keeps one password per app; the Apps tab has an MQTT section (host, port, user name, password, topics, shown once with copy buttons). The MOO side is live (`$gmcp_apps:handle_drive`/`drive_message`, `.app_addresses`). Hub task note: `agent-notes/mqtt-tls.md` in the Mongoose hub.

Later renamed: the message is now `Client.Apps.Password` (`sendPassword`, `on("password")`); see `agent-notes/feat-apps-password-mcp.md`.

## Decisions and why

- One message for both apps, not a second message: the MOO has one path (`drive_message(who, app)`).
- MQTT fields are named "MQTT user name"/"MQTT password" so they are distinct from the drive's when both are shown.
- The host and port are split from `mqtts://host:port` because MQTT apps ask for them separately.

## Next step

PR, CI on the PR, merge, deploy, then live acceptance from the hub.
