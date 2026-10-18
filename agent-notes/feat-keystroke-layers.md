# feat/keystroke-layers

## Goal

Implement `docs/keystrokes.md` (GMCP `Client.Keystrokes` layers) in the web client: layers,
RemoveLayer, legacy messages on the `""` layer, BindingsList with layer ids, key matching per spec,
focus zones, keys mode (Alt+Shift+K), reserved shortcuts, per-binding rebinding remembered in
preferences, a Keys tab in Preferences. No push, no PR.

## State

- Done and committed: spec doc; `src/keystrokeChords.ts` (aliases, exact modifiers, event.code for
  letters/digits, formatting); `src/reservedShortcuts.ts` (one list of client and browser keys);
  `keystrokes` overrides in `preferencesStore`; `src/stores/keystrokesStore.ts` (layers, keys mode,
  resolve/find/keyTakenBy); `src/gmcp/Client/Keystrokes.ts` rewritten (layers, legacy messages,
  BindingsList with ids, focus zones, keys mode, announcements).
- Keys tab (`src/components/KeystrokePreferences.tsx`, a table per layer, a key button per
  binding: Enter starts listening, next key is taken or refused with the reason, Escape cancels,
  blur cancels) and Alt+Shift+K in the Keyboard tab's shortcut list: written, tests pass, being
  committed.
- Baseline before work: `npx vitest run` 159 files / 2191 tests passed; typecheck clean.

## Decisions and why

- Reserved = shortcuts with Ctrl/Alt/Meta that the client handles, plus Escape (pauses sounds),
  Ctrl alone (stops speech), plain Enter ("Enter still sends"), Tab and Shift+Tab (completion,
  focus), browser access keys. Plain arrows, Home/End, Up/Down history are typing keys that keys
  mode is meant to hand to a layer, so they are not reserved.
- Plain bindings fire only in keys mode, literally as the spec says, even in a non-modal layer
  (F2 with no modifiers needs keys mode). Keys mode can be turned on with no modal layer.
- Layer replaced by the same id moves to the end (it "arrived last") and is not announced again.
- The legacy `""` layer is not announced (each Bind would speak).

## Surprises

- `node_modules` was missing in the worktree; ran `npm ci`.
- Firefox uses Alt+Shift for access keys; PlayerCard has accessKey "k" (Look), which collides with
  Alt+Shift+K for keys mode. Not changed; reported.

## Next step

Refactor pass done (Alt+Shift+K defined once in reservedShortcuts.ts; store `updateLayer` for the
legacy layer). Run the full suite, typecheck, lint; report to the parent. Not pushed, no PR.
