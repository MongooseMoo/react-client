# Interact mode earcons

## Goal

Q, 2026-11-01: an `earcon_snd` on #1 sent with each item in Char.Items, played when interact mode lands on it; exits get a different one; spatialized. Q said "make it so".

## State

MOO side is live: `#1.earcon_snd` (catalog 46582) and `$exitwaif.:earcon_snd` (46559); `$sh:earcon(owner, ?place, ?coordinates)` builds a Client.Media.Play payload (with `name`, placed at the object's acoustic origin or an exit's doorway, [] when there is none); `#519:items_for` adds `earcon`; `$gmcp_room:info_data` adds `earcons`. Hub note: `agent-notes/client-futures.md` in the Mongoose hub.

This branch: `GMCPClientMedia.playEarcon(raw)` decodes and plays the payload like a Play under the one key `earcon` with `continue: false`; interact mode calls it on landing (`Keystrokes.ts` `landOn`); `Item.earcon` and `GMCPMessageRoomInfo.earcons` typed; tests in `Keystrokes.test.ts` and new `Media.earcon.test.ts`; `docs/keystrokes.md`.

## Decisions and why

- One key for all earcons so moving on replaces the last instead of overlapping.
- The playing logic lives in the media package (one owner of Play decoding and spatial conversion); interact mode only says when.

## Next step

PR, CI, merge per Q, live check (an earcon plays and comes from the object's direction), changelog, cleanup.
