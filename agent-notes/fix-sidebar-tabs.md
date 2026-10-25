# Sidebar: order, numbers, no Server tab (2026-10-25)

## Goal

Q, 2026-10-25: "We kinda have a problem with the sidebar. several problems. what even is the server tab for?
missing number? logic?" Then, after the findings, Q chose (AskUserQuestion) and said "make it so".

## Findings it fixes

- `shortcutForTab(index)` numbered tabs by their place in the full list before hidden ones were filtered,
  so with MIDI/Haptics off the visible numbers were 1,2,3,4,7,8,9,0 and Help had none.
- Tab order was the order tabs were added (comments said "so earlier tabs keep their numbers").
- The Server tab showed MCP packages Mongoose does not have: the 2026-10-24 dump has only
  `dns-com-awns-rehash` #6578 of serverinfo/jtext/visual/displayurl/rehash (`moodb find dns-com-awns`,
  `find displayurl`). Only its command list ever filled.
- "Audio" was the voice chat tab (`AudioChatBoundary`).

## Decisions (Q)

- Ctrl+Shift+number = visible position, no gaps.
- Delete the Server tab and the serverinfo/jtext/visual/displayurl client packages, panels and stores;
  rehash stays (it drives completion) and its command list moves into the Help tab.
- Audio diagnostics moves to Preferences.
- Order Room, Map, Inventory, Users, Help, Voice chat, Files, MIDI, Haptics: proposed, Q did not object.
- Q: "we can always find the original moo packages if useful, or write them". Only displayurl has a use of its
  own (a verb handing the player a URL); not built until something needs it.

## State

Branch `fix/sidebar-tabs` from master `3eb62b11`. Changed: `sidebar.tsx` (order, label, numbering by visible
position; SidebarRef indexes visible tabs), `preferences.tsx` (Audio diagnostics section; keyboard help
text), `PreferencesDialog.tsx`/`App.tsx` (pass `client.media`), `HelpPanel.tsx` + `CommandList.tsx`
(list in Help, clearer heading/button names), `createConfiguredClient.ts`, `mcp/` (packages removed),
tests, `scripts/check-accessibility.mjs` (sidebar journey renumbered; diagnostics journey via Preferences).
Not run locally (no node_modules in this worktree); CI on the PR is the check.

## Next step

Push, open PR, read CI.
