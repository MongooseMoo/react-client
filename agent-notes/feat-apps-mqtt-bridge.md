# Mosquitto bridge snippet on the Apps tab

## Goal

Q, 2026-11-03: an "easy button" on the Apps tab for a home Mosquitto bridge, like the Windows `net use` command for the drive; Q said "Make it so".

## State

`mosquittoBridgeConfig(url, user, password, topics)` in AppsPanel.tsx; the MQTT section shows it in a read-only multi-line field ("Mosquitto bridge") with a copy button once an MQTT password arrives. Test and docs/GMCP/client-apps.md updated. No MOO change: the `mqtt` answer already carries url, user, password and topics. Hub task note: `agent-notes/mqtt-tls.md` in the Mongoose hub.

## Decisions and why

- The lines are the ones a stock Mosquitto 2.0.21 bridge needed against `$mqttd` on 2026-11-03 (address, bridge_capath, user, password, client id, notification_topic, topic). `notification_topic` is required: the default `$SYS/...` state topic and Will are refused as not authorised.
- Local prefix `mongoose/`: local `mongoose/foo` is `players/<n>/foo` in the game, both ways.

## Next step

PR, CI, merge, deploy, live check with a real bridge.
