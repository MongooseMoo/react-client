# Keep the screen on disconnect

## Goal
Q: everything on screen disappeared on disconnect; nobody asked for that. Q chose: text stays through disconnect and reconnect, and clears only when a different player's sign-in is confirmed (or Clear Log, sign-out, visitor change). Q said "make it so".

## State
Branch `fix/keep-screen-on-disconnect` off origin/master, worktree `C:\Users\Q\code\react-client-keep-screen` (node_modules is a junction to the main checkout's; package files identical). personalDataOwnership.test.tsx: 14/14 pass locally. Other suites go to the PR's CI.

## Cause
Commit "Partition personal histories and deferred work by confirmed player" (PR #179, Oct 14): `client.connect()` calls `clearForConnect()`, which set `owner: undefined` and reset output/input; Output's owner subscription then reloaded from an undefined storage key, giving `[]`. PR #201 only restored the lines after the same player's sign-in, so the screen still blanked meanwhile.

## Decisions and why
- `clearForConnect` now only moves `owner` to `reconnectingOwner`; it no longer resets output or input.
- `confirm` clears only when the new owner differs from the current or reconnecting owner. Clear uses `forNewOwner = !current`, so a launch draft still survives the first sign-in after a connect.
- Output's owner subscription returns early while `!owner && reconnectingOwner`; the same player's confirm then matches the existing key/identity check and changes nothing.
- Deleted PR #201's `reconnectingOutput` snapshot: nothing is taken away any more, so there is nothing to restore.
- Tests: flipped the two assertions that pinned blanking; the persisted-clear test now advances the save debounce before checking storage (the old code saved as a side effect of blanking).

## Surprises
VoiceCommandButton's dictation now stops on connect via its identity check rather than via `ownerResets`; its tests run in CI, not checked locally.

## Next step
Commit, push, open PR, read its CI.
