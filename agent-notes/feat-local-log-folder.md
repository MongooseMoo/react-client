# feat/local-log-folder

## Goal

Q asked (2026-10-18, "make it beautiful"): auto-logs saved to a real folder on
the player's computer via the File System Access API (`showDirectoryPicker`).
Where the API is missing (Firefox, Safari) the client keeps today's
IndexedDB-only behaviour exactly, with no new storage access. Worktree:
`C:\Users\Q\code\react-client-local-logs`, branch `feat/local-log-folder` off
`origin/master` (03a193ba). Do not push or open a PR; report to team-lead.

## State

- Round 1 committed: faed57ca (feature), 163c2810 (note).
- Codex review of 163c2810 (report in the session scratchpad,
  `codex-review-local-logs-report.md`) found 8 problems. I reran its repro
  script against the worktree and reproduced 1, 2, 3, 4 and 8; 6 and 7 are
  visible in the code. Round 2 fixes all eight (in progress, see Next step).

## What round 1 got wrong (and why)

My tests only ever changed things after `whenIdle()` and only one tab, one
failure at a time, so every concurrency and partial-failure path went
untested and unthought:

1. Same-second sessions (two tabs) picked the same file name: check, then
   create, is not a reservation. One tab overwrote the other.
2. `sessionEnded` dropped the session even when the folder was
   disconnected or failing, so Reconnect said "ready" while lines were
   missing for good. Nothing survived a reload.
3. Stop returned while a write was mid-flight; that write then created and
   wrote a file in the folder the player had just stopped using.
4. Formatting state (header written, current day) advanced before the
   write committed, so a failed first write lost the header and a failed
   midnight write lost the date separator.
5. `keepExistingData` makes Chromium copy the whole file per flush.
6. The focus effect pulled focus back even when the player had moved it.
7. Stop and Choose announced success before, and regardless of, the
   IndexedDB delete/put.
8. Unsupported browsers still opened the handle database from `syncOwner`.

Also overstated in round 1's note: the sink never "mirrored" the viewer's
full owner/visitor predicate. What it enforces is narrower and is stated
below.

## Decisions and why (round 2 design)

- IndexedDB stays authoritative; the folder is a sink fed after IndexedDB
  accepts a batch. Folder failures never reach the IndexedDB flush.
- Owner scoping as actually enforced: a session's lines only go to the
  folder its own owner chose (owner key on the session). Sessions with no
  owner are never written. The sink does not re-check visitor/policy state
  itself; App.tsx only creates sessions for a confirmed, non-visitor owner,
  and AutoLogService's generation check drops late lines after a change.
- File names carry the session id: `<Character>/<YYYY-MM-DD HH-MM-SS> <id8>.txt`,
  then `... part 2.txt` and so on. Distinct sessions cannot collide.
- Parts are capped at 1 MiB (finding 5, lead's decision), so each
  keepExistingData copy is at most 1 MiB. Each part after the first opens
  with a short header naming the session and the previous part. Writes stay
  short closed-stream commits. Preferences shows the current part.
- A per-session cursor is stored next to the folder handle (same database,
  `cursors` store): file name, part, committed bytes, last committed
  sequence, current day, end time, and a write-ahead `pending` intent
  (size before/after, sequence, day) saved before each commit. Before every
  commit the actual file size is compared: equal to the cursor means
  nothing new; equal to `pending.sizeAfter` means the last commit landed
  but the cursor update did not, so adopt it; anything else means someone
  else changed the file, so never write into it and continue in a new
  part. That makes replay idempotent without parsing the file.
- Formatting state (header, day, sequence) lives in the cursor and is only
  replaced after `close()` succeeds (finding 4).
- Ended sessions stay tracked until their footer commits; Reconnect and
  Choose finish them (finding 2).
- After a reload, sessions a dead page left unfinished are finished from
  IndexedDB. Web Locks (`navigator.locks`) tell a dead page's session from
  one another tab is still writing: each tab holds a lock per live session,
  and a cursor is only recovered under `ifAvailable`. Without Web Locks,
  orphans are left alone rather than risk finishing another tab's session.
  No beforeunload work.
- Every folder change replaces or clears the in-memory folder record. A
  write holds the record it started with and checks it is still current
  after every await and before opening and before closing a writable;
  stale writes abort (finding 3). Persistence of the change (put/delete)
  goes through the same queue as writes, and Stop resolves only after it.
- Announcements say what really happened (finding 7): "stopped" only after
  the delete commits; a failed delete or put is announced as "this visit
  only" with what happens on reload.
- Focus: the UI uses the existing `useFocusRefuge` hook
  (src/components/FileTransfer/useFocusRefuge.ts) with the section heading
  as the refuge, so focus only moves when the focused button was removed
  and focus fell to the body (finding 6).
- No HTML copy at session end (round 1 Chromium run: a reload left a 0-byte
  `.html`). The viewer's HTML export remains.
- Session title is `Mongoose Client - <room>`, a poor folder name, so the
  character folder uses `useSessionStore.playerName` when its playerUuid
  matches the owner, else the playerRef.

## Surprises

- `createWritable({keepExistingData: true})` in Chromium copies the existing
  file into a swap file before each write (Mac may clone instead). Round 1's
  code comment implied appends avoid rewriting; only JS avoids re-sending.
- jsdom's DOMException is not an `Error`; `errorMessage` checks both.
- A commit (close) is atomic, but an outstanding append does not survive
  the tab closing; that is why recovery is cursor-based, not unload-based.

## Verification

Round 1 (before review): Chromium via Playwright with an OPFS folder
standing in for the picker.

Round 2 (after the rewrite):
- `npx tsc --noEmit` exit 0; `npx vitest run` 177 files / 2392 tests passed;
  `npx biome lint` on the changed files clean (9 checked; the .css is not
  linted by biome).
- Chromium, OPFS folder, live server as Solaris_Guest (scratchpad scripts
  `log-folder-e2e.mjs`, `log-folder-crash.mjs`, not committed): files named
  `Solaris_Guest/2026-10-18 02-08-21 f8f6f146.txt`; reload gives a new
  session file and the old one ends `Ended: 2026-10-18 02:08:30`; after Stop
  focus is on the "Save logs to a folder" heading. Renderer crash via CDP
  `Page.crash` (no unload work at all), then a new page: the crashed
  session's file gained `Ended: not recorded (the page closed)` and its
  cursor was deleted; the only cursor left was the new live session's.
- Not exercised in a browser: the OS picker, real `prompt` permission and
  Reconnect, revoked permission, disk-full, two real tabs at once, part
  rotation at the real 1 MiB size. Unit tests with fakes only.

## Round 2 progress

- Tests written first: `AutoLogFolder.test.ts` rewritten (27 tests) against a
  persistence port (folders + cursors), a Web Locks port (fake tabs that can
  "die"), and `maxPartBytes`. Ran red against the old code (API mismatch),
  then green after the rewrite.
- `AutoLogFolder.ts` rewritten to the design above. `IndexedDbLogFolderHandles`
  became `IndexedDbLogFolderPersistence`. The database `mongoose-autolog-folders`
  is version 2 (08abf38a): the upgrade adds the `cursors` store and wraps each
  version 1 value (a bare handle) as `{ handle, bindingId }`, so a round 1
  database keeps its remembered folders (test: "upgrades a version 1 database").
- UI: `useFocusRefuge(section, heading)` replaced my effect; heading has
  tabIndex -1. Error state gained "Try again" (calls `reconnect`, which
  retries without a permission prompt when permission is already granted):
  without it, a session that ended while writes failed had nothing left to
  trigger a retry.
- I did not rerun Codex's repro scripts after the rewrite: they construct
  the old API (`handles:`). Each scenario they reproduced has a unit test.

## Next step

Round 2 committed on the branch; reported to team-lead. A fresh Codex
review follows. Known limits left as they are: pruning is not coordinated
with recovery (a pruned session gets a footer saying the rest was removed
from browser storage); without Web Locks, orphans are never finished.
