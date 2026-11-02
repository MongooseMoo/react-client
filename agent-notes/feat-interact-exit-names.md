# Interact mode: say exits by name

## Goal

Q, 2026-11-01: interact mode should say an exit's full name (`:name()`), not its Room.Info key ("n exit").

## State

MOO side live: `$gmcp_room:info_data` sends `exit_names` (same keys as `exits`, the exit's own name from `exit:title()`, which equals `:name()` for waif exits, e.g. `{"s":"south","u":"up","w":"west"}` in the Parlor). `@test $gmcp_room` 1/1; ticks 8,745 → 8,753.

Client (this branch): `Room.ts` types `exit_names`; `Keystrokes.ts` says `${exit_names[key] ?? key} exit`; the command stays `interact <key>`, which `#410:interact` matches as an exact exit alias first. Test in `Keystrokes.test.ts`; `docs/keystrokes.md` updated.

## Decisions and why

- A new map beside `earcons` keeps `exits` (read by the mapper) unchanged.
- Kept the " exit" suffix so an exit is still told apart from a thing of the same name.

## Next step

PR CI, then Q's merge decision; after merge, check live in Chrome and remove this worktree and branch.
