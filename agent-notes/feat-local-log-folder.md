# feat/local-log-folder

## Goal

Q asked (2026-10-18, "make it beautiful"): auto-logs saved to a real folder on
the player's computer via the File System Access API (`showDirectoryPicker`).
Where the API is missing (Firefox, Safari) the client keeps today's
IndexedDB-only behaviour exactly, with no new storage access. Worktree:
`C:\Users\Q\code\react-client-local-logs`, branch `feat/local-log-folder` off
`origin/master` (03a193ba). Do not push or open a PR; report to team-lead.

## State

- Round 1: faed57ca, 163c2810. Round 2 (cursor design): 03220d7f, 08abf38a,
  134b4c86.
- Codex review 1 (`codex-review-local-logs-report.md` in the session
  scratchpad): 8 findings, all reproduced, fixed in round 2.
- Codex review 2 (`codex-rereview-local-logs-report.md`): 11 new findings,
  almost all in the cursor recovery machinery. I reran its repro script
  against 134b4c86; every NEW case reproduced as reported.
- Round 3 (in progress): replace the cursor design with an idempotent
  projection of IndexedDB (lead's decision, below).

## Why rounds 1 and 2 went wrong

Round 1 tested only one tab, one failure, and changes after `whenIdle()`.
Round 2 answered each finding with more machinery around an append-only
mirror: cursors, write-ahead intents, size checks. An append-only copy into
a filesystem that cannot be made transactional cannot be made exactly-once
by bookkeeping, and every new piece of bookkeeping had its own gap: an end
flag that overtook queued batches, a footer the cursor did not record, a
stale cursor replayed by a second recoverer, no record for sessions that
never reached a first write, a size check fooled by an equal-length edit.
The fix is a design where replaying is always safe, not more bookkeeping.

## Decisions and why (round 3 design)

- IndexedDB stays authoritative. The folder is a projection of it: every
  file's bytes are a pure function of the session's IndexedDB record plus
  a small binding (character name, base file name). Rendering twice gives
  identical bytes, so any write can be repeated, by any tab, at any time.
- Part boundaries are a pure function of the entries: parts are filled
  greedily up to maxPartBytes (1 MiB) counting the header, with a fixed
  footer reserve kept free in every part, so the footer never moves a
  boundary and never pushes a part over the cap. An entry too big for an
  empty part is split into UTF-8-safe chunks across parts.
- Each render reads the session and its entries from the start of the
  current part in one IndexedDB transaction (`getSessionSnapshot`) and
  writes the current part whole (createWritable without keepExistingData,
  write, close: at most 1 MiB, the same cost keepExistingData already had).
  Parts that close in that render are written once, completely.
- The footer is part of the render: `Ended: <time>` when the session record
  has endedAt; for a session recovered after its page died, `Ended: not
  recorded (the page closed)`. Session end is just another queued render
  after earlier ones, reading everything from IndexedDB.
- A binding per session (database store `bindings`) is saved the moment a
  session belongs to an owner who has a folder, before any permission or
  file work, so a session that never got a single write is still found
  after a reload. It holds the binding id of the folder choice, character
  folder/name, base file name, and a mark: where the current part starts
  (part, sequence, byte offset into that entry, previous day). The mark is
  only an optimisation; losing it re-renders from part 1 with the same bytes.
- Bindings are deleted when the session's footer is written, when its
  session is gone from IndexedDB (pruned: the files are left exactly as
  they are, no footer is invented), and on Stop.
- Recovery on load / Choose / Reconnect: render every binding of the owner
  that this page is not writing. With Web Locks, sessions another tab holds
  are skipped (avoids wasted work and a premature page-closed footer, which
  the live tab's next render would remove anyway). Without Web Locks only
  ended or pruned sessions are finished; others are left for a later page.
- Locks are only taken for sessions bound to a folder, released when the
  session completes, the folder is stopped, or the sink is disposed.
- File names use the last 12 hex characters of the session id; before the
  first write, an existing file of that name gets ` (2)` etc., and the
  chosen base name is saved in the binding.
- The client owns these files: the newest part is rewritten as lines
  arrive. The preferences help says so.
- The database (`mongoose-autolog-folders`) moves to version 3: drops the
  round 2 `cursors` store, adds `bindings`, still wraps v1 bare handles.
  Its connection closes itself on versionchange; a rejected or blocked open
  is not cached, so the next attempt retries; a late success after a block
  is closed. "Blocked by another tab" shows in preferences with Try again.
- Unchanged from round 2: owner scoping by the session's own owner key,
  folder records checked after every await (Stop/Choose races), truthful
  announcements, useFocusRefuge, no HTML copy, unsupported = no storage.

## Surprises

- `createWritable({keepExistingData: true})` in Chromium copies the whole
  existing file into a swap file before each write (Mac may clone instead).
- jsdom's DOMException is not an `Error`; `errorMessage` checks both.
- CDP `Page.crash` never resolves its send; race it with a timeout.

- A bug the new tests caught: a first render that claimed the file name and
  then failed to write left the live session holding the unclaimed binding,
  so the retry saw its own empty file as someone else's and wrote ` (2)`.
  renderBinding now reports the claimed binding to its caller at once.

## Verification (round 3)

- `npx tsc --noEmit` exit 0. `npx vitest run`: 177 files, 2405 tests passed.
  `npx biome lint` on the 6 changed source files: 3 warnings, all in lines
  this branch did not write (AutoLogStore.ts:1, AutoLogStore.test.ts:3 and
  the `!` in the existing prune test); the same 3 appear at HEAD.
- Codex scenarios as tests in AutoLogFolder.test.ts: real AutoLogService with
  a held folder (all three batches + one footer), footer once after a failed
  binding delete and a recovery, two recoverers interleaved (one copy),
  session that never got a write found after reload, pruned session left
  alone, blocked v1 upgrade then retry (real IndexedDbLogFolderPersistence),
  versionchange closes the connection, cap with a split entry and footer,
  no-locks lifecycle, no locks/bindings without a folder, dispose releases
  locks, 12-hex names and an existing name. Plus "re-rendering gives
  identical bytes".
- Chromium with an OPFS folder, live server, guest login:
  - `Tangra_Guest/2026-10-18 02-55-42 8c7d831d5ae5.txt` written; status
    "Writing" with the current file; reload with the same guest: folder
    remembered, new session file, old file ends `Ended: 2026-10-18 02:56:45`;
    after Stop focus is on the "Save logs to a folder" heading.
  - A reload can sign in as a different random guest; that guest correctly
    shows "No folder chosen" (folders are per character), seen once.
  - Crash (CDP Page.crash) then a new page, same guest (Anadolu_Guest): the
    crashed session's file gained `Ended: not recorded (the page closed)`,
    its binding was removed, only the new live session's binding remained.
- Not exercised in a browser: OS picker, real prompt/Reconnect, revoked
  permission, disk full, two real tabs, a real blocked upgrade, 1 MiB parts.

## Next step

Committed; report to team-lead; Codex reviews again.
