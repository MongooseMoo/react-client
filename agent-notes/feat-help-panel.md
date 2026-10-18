# feat/help-panel

## Goal

A Help tab in the sidebar that reads the server's GMCP `Help` package: send `Help.Get {"topic"}`,
show `Help.Topic` (topic, query, db, audience, status ok/none/ambiguous/shown/broken, lines, choices).
Contract read from the live server 2026-10-18 (given in the assignment, not rechecked here).

## State

- Worktree `C:/Users/Q/code/react-client-help-panel`, off origin/master 52c64408. `npm ci` done.
- Done: `src/gmcp/Help.ts` (GMCPHelp, `helpTitle`, `describeHelpTopic`), `src/stores/helpStore.ts`,
  registration in createConfiguredClient, index.ts, types.ts. Tests pass, typecheck clean.
- Done: `src/components/helpLinks.ts` (`splitHelpLine`): one-word topic after `help `, trailing
  punctuation dropped; `help search ...` takes words up to a comma; a known choice wins whole.
- Done: `src/components/HelpPanel.tsx` + `.css`, 13 tests.
- Next: the sidebar tab, then full suite.

## Decisions and why

- Announcements use `announce` from `@react-aria/live-announcer`, the same path as Keystrokes.ts,
  made in the package when Help.Topic arrives ("polite": it answers the user's own request).
- Back is local: the store keeps earlier results and Back shows the previous one without asking the
  server again.
- Help state is not cleared on disconnect: help text stays readable offline.
- `client.gmcp.send` throws with no transport attached, so the panel sends only when
  `useConnectionStore.sessionReady` (set after Char.Name, so Core.Supports with `Help 1` has gone);
  lookup buttons are disabled otherwise. The first-open front-page fetch waits for that too.
- The store has a `serial` so the panel can remount the result block on every new result; a focused
  link that disappears then falls to the result heading through the existing `useFocusRecovery`.

## Surprises

- The sidebar numbers shortcuts by position; Map is already the 10th tab (Ctrl+Shift+0), so the
  11th tab would be labelled `Control+Shift+11`, a shortcut that does not exist.

- Preact: a controlled input's `onChange` listens to `input`, so tests use `fireEvent.input`.

## Next step

Write `src/stores/helpStore.test.ts` and `src/gmcp/Help.test.ts`.
