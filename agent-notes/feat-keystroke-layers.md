# feat/keystroke-layers

## Goal

Implement `docs/keystrokes.md` (GMCP `Client.Keystrokes` layers) in the web client: layers,
RemoveLayer, legacy messages on the `""` layer, BindingsList with layer ids, key matching per spec,
focus zones, keys mode (Alt+Shift+H), reserved shortcuts, per-binding rebinding remembered in
preferences, a Keys tab in Preferences. The MOO side (`$keys` #6283, games, helm consoles) is live;
its record is the hub's `agent-notes/hotkeys.md`.

## State

- Built and committed: `src/keystrokeChords.ts`, `src/reservedShortcuts.ts` (the one list of client
  and browser keys), `keystrokes` overrides in `preferencesStore`, `src/stores/keystrokesStore.ts`,
  `src/gmcp/Client/Keystrokes.ts` rewritten, `src/components/KeystrokePreferences.tsx` (Keys tab).
- Full suite 2264/2264, typecheck clean. Once, under load, output.test.tsx failed 6 tests (error not
  captured); it passed alone and on the next full run.
- Tried in Chrome against the live MOO as a guest at Yahtzee: typing outside keys mode, Alt+Shift+H,
  `s` sending `sheet`, Shift+S staging `score `, finishing it with "chance", the Keys tab, F1 sending
  `rules`. Keys came through the extension's debugger, so Chrome's own handling of a real F1 is not shown.

## Decisions and why

- Toggle is Alt+Shift+H. Not K: Firefox fires access keys on Alt+Shift and the player card's "Look" is K.
  Chrome keeps Alt+Shift with A, I, N and T.
- Keys without Ctrl, Alt or Meta fire only in keys mode and only while the command input is empty, so a
  staged command can be finished (found in the browser: "score chance" sent `hand` on the `h`).
- Reserved = the client's Ctrl/Alt/Meta shortcuts, Escape, Ctrl alone, plain Enter, Tab, Shift+Tab,
  access keys. Plain arrows and Home/End are left to layers in keys mode.
- A layer sent again with the same id moves to the end and is not announced again. The legacy `""`
  layer is never announced.

## Surprises

- The client's existing Alt+Shift+T (timestamps) is also a Chrome shortcut. Not changed here.

## Next step

Open the PR; merge when hosted checks pass.
