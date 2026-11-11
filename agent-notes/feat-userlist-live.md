# Players list that stays true

## Goal

Q, 2026-11-11: the players list and its idle marks were always out of date; fix it (server, client or both), make it look better while staying accessible, and clean it up.

## State

Server half is live on Mongoose (`$userlist` #1075): the idle check had stopped running on 2026-11-10 and is re-armed every 10 s; entries now carry an `Idle` field (seconds idle when sent); a player going idle is sent fresh (`*`) before `<`; the login list and the connect `+` now agree on who is listed; the friends line is one quoted literal; menu entries fixed and Page added (`page $(1) `); icon labels are Guest/Player/Programmer/Schooled/President/Builder/Wizard. Hub note: `~/projects/mongoose/agent-notes/userlist-idle.md`.

This branch:
- `src/mcp/packages/userlist.ts`: players kept in a Map by id. `*` keeps idle/away (it used to reset both); `+` replaces instead of adding a duplicate; `(` removes, `)` is a no-op (the server sends `+` first); `Idle` -> `lastActive`; `LastConnectTime` -> `connectedAt`, ignoring guests' 2147483647 placeholder; `-menu` and `-you` go to the store.
- `UserlistPlayer` is `{id, name, role, rank, idle, away, lastActive, connectedAt}`; FileTransfer moved to it.
- `src/components/userlist.tsx`: heading "Players: N online, M active"; options read "Name (you), Role, idle 12 min"; active, then idle, then away, then by name; a minute clock keeps idle times current; the selected player's card has the server's menu actions through `performItemAction` (trailing space = put in the input to finish).
- Sidebar tab renamed Users -> Players (sidebar test, `scripts/check-accessibility.mjs`).

Tests: `src/mcp/packages/userlist.test.ts` replays the real guest login capture; `src/components/userlist.test.tsx` covers order, wording, the clock and actions.

## Decisions and why

- Idle duration comes from the server's `Idle` seconds, converted with this browser's clock on arrival, so server and browser clocks never need to agree.
- Status is text in every option (not only color); the dot also changes shape (filled, ring, square) and has a forced-colors style.
- Your own entry has no actions.

## Surprises

- First CI run (PR #231): my two new test files passed; `src/fileTransferPeers.test.ts` and `src/mcp.test.ts` still built the old `{Object, Name, Icon}` shape. My search for old fields matched `.Object` but not `Object:` literals. Fixed; `mcp.test.ts` now checks the store after reset instead of the package's private fields.
- Local `npm ci` in this worktree fails (`--allow-scripts is not allowed in project-scoped installs`); CI is the test run.

## Next step

CI on the PR, merge, check the deployed client in a browser.
