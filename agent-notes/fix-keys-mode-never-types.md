# fix/keys-mode-never-types

## Goal
Q (2026-10-24): "Hotkey mode should never ever input the keys into the input field here or in mudlet fix and pr and fix everywhere."
Then: "we're probably gonna want some sort of help mode? for hotkey mode?" and "maybe alt shift f1". Q said "make it so".
Keys mode (Alt+Shift+H) never puts a typed character into the command input, in the web client and in the Mudlet
package (MongooseMoo/mudlet-package, same branch name, worktree `C:/Users/Q/code/mudlet-package-keys-mode`), plus key
help on Alt+Shift+F1, and the spec (`docs/keystrokes.md`) says so.

## State
Code written in both worktrees, not yet committed.
- Client: `src/gmcp/Client/Keystrokes.ts` (never-type, staging pause, key help), `src/stores/keystrokesStore.ts`
  (`resumeOnSend`, `pauseKeysMode`, `commandSent`), `src/components/input.tsx` (handleSend calls `commandSent`,
  announces "Keys mode on"), `src/reservedShortcuts.ts` (Alt+Shift+F1 reserved), `KeystrokePreferences.tsx` text,
  `docs/keystrokes.md`. `npx vitest run src/gmcp/Client/Keystrokes.test.ts`: 33 passed.
- Mudlet: `keys/keys.lua`, `tests/test_keys.lua`, `README.md`. `lua tests/test_keys.lua`: all passed.
Chrome check (2026-10-24, dev server :5179 from this worktree, live MOO, guest Tangra_Guest): the Yahtzee layer
was injected through `mudClient.gmcp.packageHandlers["Client.Keystrokes"]` (payload recorded from the live MOO
2026-10-18), keys pressed through the extension (CDP key events, not OS-level). Keys mode on: `x`, `s`, Space left the
input "" and `s` sent `sheet`. Shift+S then "chance" gave "score chance"; Enter sent it and said "Keys mode on"; `x`
then did not type. Alt+Shift+F1 reached the page; help said "S: Scorecards", "X: not bound"; Escape said "Key help
off". Found "Alt+Shift+H: Alt+Shift+H turns..." doubled the key; reserved keys now say the reason alone.
NVDA and a real OS-level Alt+Shift+F1 not tried.

## Decisions and why
Before: client `handleKeydown` let unbound keys type and let every typing key type once the input had text
(acdc46f5, so a staged `score ` could be finished). Mudlet `install` installed only bound keys; `fire` typed the
letter itself when the line had text.

Q's answers:
- Staged command (autosend false) in keys mode: fills the input, keys mode off ("Keys mode off"); when the player
  sends, back on ("Keys mode on"). Cleared if the last modal layer leaves, or on a manual toggle.
- Mudlet Space: package-only fix; spec + README say plain Space still types in Mudlet. No upstream PR.
- Key help: NVDA+1 style on Alt+Shift+F1. Each key says "S: Scorecards", "X: not bound", or the client's reserved
  reason; sends nothing. Escape (web) or Alt+Shift+F1 ends it.
- MOO changelog post #2667 says keys type once the box has text; it's a past post, left alone. A new changelog entry
  when this ships is MOO-side and Q's call.

Client never-type rule: in keys mode a keydown with a one-character `event.key` and no Ctrl/Alt/Meta is always
preventDefault'ed. Mudlet: in keys mode, no-op tempKeys on every mudlet.key code 0x21..0xff, plain and Shift, below the
real bindings (a matched binding is accepted, not typed: TCommandLine.cpp:682-689).

## Surprises
Mudlet source (Mudlet/Mudlet master via gh api):
- `TCommandLine.cpp:327-335`: plain/Shift Space never reaches key bindings; always types.
- `TCommandLine.cpp:575-586`: plain Escape never reaches key bindings (selects the line). Mudlet key help ends on
  Alt+Shift+F1 only.
- `TCommandLine.cpp:693-696`: dead-key/IME input bypasses key bindings. Web client also returns early on
  `isComposing`, so IME composition can still type in keys mode in both. Not handled.
- `ctelnet.cpp:1833-1840`: sysDataSendRequest fires for every send, the package's own too; `K.sending` guards it.
- Mudlet key help covers only bound keys and character keys; other unbound keys act as normal.

## Unverified
Whether Chrome, Firefox, NVDA or Mudlet's own shortcuts take Alt+Shift+F1.

## Next step
PRs open: react-client #205 (commit ae36c6a7), mudlet-package #1 (commit 0eed11d; that repo has no CI). Read #205's
CI result: "Tests and production build" passed in 4m18s on ae36c6a7 (run 40135762922); Deploy skipped, as on every
PR. Merge and the Mudlet release (v4, `$client_gui` url) are Q's.
