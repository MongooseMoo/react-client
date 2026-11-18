# fix/keystroke-bugs

## Goal

Daiverd (2026-11-17) asked for three key-binding bugs to be fixed in one client PR, plus two rules:
- **Gate:** keys mode can't be entered unless some bound key needs it.
- **Feedback:** in keys mode, an unbound key says it isn't bound.

The three bugs:
1. A player's key change was stored by layer and command, so when two keys did the same command (Scrabble's `a` and ArrowLeft both send "press left"), changing one key moved both.
2. Escape that ended interact mode or key help also reached App.tsx's Escape handler, which paused every client sound.
3. Alt+Shift+H turned keys mode on with nothing bound, and every letter was then silently swallowed.

## State

Done and tested:
- **Key changes:** stored under `bindingId` (`key:` plus the server's chord, e.g. `key:ctrl+s`).
- **Escape:** handled keys use `stopImmediatePropagation`.
- **Gate:** keys mode needs `keysModeLayers()` to be non-empty.
- **Feedback:** an unbound character key in keys mode says "X: not bound".
- **Spec:** `docs/keystrokes.md` is updated to match.

Tests:
- Typecheck is clean and biome lint is clean on the changed files.
- The keystroke test files pass: 157 tests across 8 files.
- The full suite was run before opening the PR (result in the PR body).

## Decisions and why

- **The id is the key the server sent, not the command.** A layer can give one command several keys, but a server key is unique within a layer (only the last of two identical keys fires anyway).
- **Old choices still work where they can.** Choices saved before this change were keyed by command. One still applies when exactly one binding in the layer has that command. When several do, it's ignored, because it can't say which key it meant.
- **Keys mode is gated on resolved keys, not the server's `modal` flag.** "Needs keys mode" means an installed binding on a typing chord after the player's own changes. A player who moved every typing key onto Ctrl doesn't need keys mode, and the server's flag can't know that. The same test decides when keys mode switches off as layers leave.
- **Interact mode (Alt+backtick) isn't gated.** It works on carried items, the room and exits, with no layer at all. An unbound character key there also says "not bound".
- **"Not bound" only covers keys that keys mode swallows** (one character, no Ctrl, Alt or Meta). Other unbound combinations (Ctrl+Q, F5) still go to the browser or the client's own shortcuts. Saying "not bound" for them would be wrong, because they do something.
- **Escape uses `stopImmediatePropagation`, with no change to App.tsx.** This package's listener is added when the client is created. App's capture listener is re-added after that whenever `client` changes, so it runs later and is stopped. VoiceCommandButton's comment wants Escape to keep pausing sounds there, so App doesn't skip defaultPrevented events.

## Surprises

- `docs/GMCP/packages/client-keystrokes.md` still describes the pre-layer model. I left it alone; it's out of scope.

## Next step

Q reviews and merges. The Mudlet package (MongooseMoo/mudlet-package) follows the same spec and still allows keys mode with nothing bound and swallows silently. That needs its own change if wanted.
