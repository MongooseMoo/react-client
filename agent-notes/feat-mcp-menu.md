# Server menus as a list in place of the input (world.mongoose.menu)

## Goal

Q, 2026-10-25: the MOO's `$command_utils:menu` should pop up in the client in
place of the input, keyboard accessible, Escape leaves it without stopping
sounds, looking good. Over our own MCP package (Q chose a new
`world.mongoose.menu` over the 2008 `dns-net-rustytelephone-interface`).
The full log, MOO side included, is the Mongoose hub's
`agent-notes/client-menu.md`.

## State

- MOO side live: `$mcp_menu` #283688 sends `world.mongoose.menu` with
  `prompt`, `options*`, `responses*` (empty response = a text line) from
  `$command_utils:_menu` and `$menu_utils:menu`, only to clients that
  negotiated the package.
- Client: `src/mcp/packages/menu.ts` -> `stores/menuStore.ts` ->
  `components/MenuPrompt.tsx` rendered by App in the input section; the input
  is hidden (not unmounted) and gets focus back. Answers go through
  `client.sendCommand(line, { answer: true })` so autosay never wraps them.
  Escape/Cancel send `@abort`; App's Escape sound pause skips `.menu-prompt`.
- New tests pass locally (7/7, the two new files only).

## Next step

PR CI, merge, gh-pages deploy, live try.
