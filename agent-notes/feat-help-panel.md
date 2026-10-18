# feat/help-panel

## Goal

A Help tab in the sidebar that reads the server's GMCP `Help` package: send `Help.Get {"topic"}`,
show `Help.Topic` (topic, query, db, audience, status ok/none/ambiguous/shown/broken, lines, choices).
Contract read from the live server 2026-10-18 (given in the assignment, not rechecked here).

## State

- Worktree `C:/Users/Q/code/react-client-help-panel`, off origin/master 52c64408. `npm ci` done.
- Done: `src/gmcp/Help.ts` (GMCPHelp, `helpTitle`, `describeHelpTopic`), `src/stores/helpStore.ts`,
  registration in createConfiguredClient, index.ts, types.ts. Tests pass, typecheck clean.
- Next: link parsing (`help <topic>` phrases), the panel, the tab.

## Decisions and why

- Announcements use `announce` from `@react-aria/live-announcer`, the same path as Keystrokes.ts,
  made in the package when Help.Topic arrives ("polite": it answers the user's own request).
- Back is local: the store keeps earlier results and Back shows the previous one without asking the
  server again.
- Help state is not cleared on disconnect: help text stays readable offline.

## Surprises

- The sidebar numbers shortcuts by position; Map is already the 10th tab (Ctrl+Shift+0), so the
  11th tab would be labelled `Control+Shift+11`, a shortcut that does not exist.

## Next step

Write `src/stores/helpStore.test.ts` and `src/gmcp/Help.test.ts`.
