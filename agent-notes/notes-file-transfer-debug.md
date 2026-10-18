# File transfer bug: two-guest browser test

## Task
User asked: log in as two guest characters in Chrome, send README.md between them
both ways using the real "browse for file" button in the File Transfer panel.

## Environment setup (done)
- Dev server needed `npm install` first — recent Preact migration commit left
  `@preact/preset-vite` missing from node_modules. Fixed; `npx vite` now serves
  localhost:5173 fine.
- `vite.config.ts` proxies to a REAL live MOO server: `mongoose.moo.mud.org:7780`.
  This is not a local mock — all testing here touches a live shared game world.

## Browser test (done)
- Two Chrome tabs, guest/guest login, created two distinct characters:
  "Filebot Tester" (tab 429272131) and used existing default guest
  "Tangra_Guest" (tab 429272132).
- Found the real File Transfer panel (folder icon in sidebar) with a genuine
  `<input type="file">` Choose File control.
- Used file_upload tool to attach README.md, picked "Tangra Guest" from the
  recipient autocomplete, clicked Send File.

## Bug found
- Sender stuck forever on "Waiting for Tangra Guest to accept README.md".
- Sender console: genuinely sends `Client.FileTransfer.Offer` GMCP message with
  `"recipient":"Tangra Guest"` (display name, with space) plus ICE candidates.
- Receiver console: never receives any Offer/GMCP file-transfer message at all,
  no error either — offer just vanishes.
- User then pasted the actual MOO server verb code (object #5897,
  `Client.FileTransfer` GMCP package): `handle_offer`/`handle_accept`/
  `handle_candidate` all resolve the recipient via
  `$string_utils:match_player(metadata["recipient"])` — a fuzzy NAME match.
  The real player object is named `Tangra_Guest` (underscore, per the
  "has connected" broadcast), but the client sends the display name
  `"Tangra Guest"` (space). match_player() almost certainly fails to resolve
  this mismatch, returns an invalid object, and `this:send(recipient, ...)`
  silently no-ops on an invalid recipient — no error surfaced anywhere.

## Fix decided
User chose the "correct" fix over a normalization hack: route by MOO object
reference (`#2271`-style) instead of fuzzy name matching, since the client
already has the real object id from GMCP userlist (`player.Object`).

- **Client-side (done, this repo):** `src/fileTransferPeers.ts` —
  `transferAddress` now set to `String(player.Object)` instead of `player.Name`.
  Updated `src/fileTransferPeers.test.ts` fixtures to match
  (`transferAddress: "#100"/"#200"` instead of names). Ran the file-transfer
  test suite (`fileTransferPeers.test.ts`, `Controls.test.tsx`,
  `FileTransfer/index.test.tsx`) — all 5 tests pass. Verified `recipientAddress`
  is never rendered to the user (UI shows `recipientLabel`, the name, instead),
  so this change is invisible to users.
- **Server-side (user's responsibility, MOO db, not in this repo):** user said
  they'll change `handle_offer`/`handle_accept`/`handle_reject`/
  `handle_candidate` on object #5897 to resolve via `toobj(metadata["..."])`
  + `valid(...) && is_player(...)` instead of `$string_utils:match_player`.
  Not yet confirmed done by user.

## Next step
Once the user confirms the server-side verb change is live, re-run the live
two-tab browser test (offer → accept → transfer) in both directions to confirm
the fix actually closes the loop end-to-end. Tabs from this session
(429272131 "Filebot Tester", 429272132 "Tangra_Guest") may have gone stale —
check `tabs_context_mcp` first; recreate login flow if needed
(`?username=guest&password=guest`, use [C]reate character for a second guest
if the default character is already connected elsewhere).

Vite dev server was left running in background (task id bijpb33tg / see prior
background task ids in this session) — check it's still up before retesting,
restart with `npx vite --port 5173` if not.
