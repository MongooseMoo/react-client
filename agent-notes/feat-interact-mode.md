# Interact mode

## Goal

Q, 2026-11-01: a key turns on an interaction mode; Tab moves between things; a key runs `interact` on the current one and the server's menu comes up. Q chose: inside keys mode with a spoken current thing and no list; Alt+backtick; Ctrl+I sends `interact #id` (server menu, not a client-built one); exits included.

## State

Client side in this branch: `src/gmcp/Client/Keystrokes.ts` (interact mode), `src/reservedShortcuts.ts` (Alt+backtick reserved), tests in `src/gmcp/Client/Keystrokes.test.ts`, contract in `docs/keystrokes.md`. MOO side is live on `#410` (`interact` bare menu and exit names, `interact_targets`, `exit_choices`, `test_interact_targets`); hub note `agent-notes/client-futures.md` in the Mongoose hub has the MOO record.

## Decisions and why

- Targets are Char.Items `inv`, then `room`, then Room.Info exits: the same order as the MOO's bare `interact`.
- Items with an empty `verbs` list are skipped: the server would only say there is nothing to do.
- Escape ends interact mode (as it ends key help) instead of pausing sounds while the mode is on.
- Ending interact mode restores keys mode to what it was before.

## Surprises

- `npm ci` in this worktree fails ("--allow-scripts is not allowed in project-scoped installs"), with or without `--ignore-scripts`, so tests run only on the PR's CI.

## Next step

PR, read CI, fix anything red; then changelog entry and worktree cleanup after merge.
