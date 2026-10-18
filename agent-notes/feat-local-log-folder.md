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

## Round 4 (Codex review 3 of c0adc02a: six edge cases, lead's decisions)

I reran `codex-rereview3-local-logs-repro.cjs` against c0adc02a first; the
time-zone, header-hang, dispose, both no-lock and 12-digit cases all
reproduced as reported. Against the round 4 code the time-zone cases give
equal bytes (565 = 565) and the disposed writer no longer overwrites; the
script then stalls at its no-lock two-recoverer case, which waits for a
no-lock recovery that no longer exists (decision 4/5), so its later cases
did not run there; my own tests cover them.

- Time zone: the binding stores the IANA zone at bind time and every render
  formats in it (Intl.DateTimeFormat with that timeZone), so a zone change
  can no longer move date lines and shift saved offsets. Node in vitest does
  not reliably switch its ambient zone when process.env.TZ changes mid-run
  (got hour 18 for an LA expectation of 17), so the test renders in UTC and
  Pacific/Kiritimati and checks both dates and the resumed render.
- Headers: title, character and URL are bounded to 256 UTF-8 bytes with an
  ellipsis at a code-point boundary. renderLogParts throws if a part cannot
  hold its header + footer reserve + one 4-byte code point; utf8Prefix no
  longer forces a code point, and the split branch throws rather than loop
  without consuming input.
- dispose() is async: it refuses new work, makes every write under way fail
  its next liveness check, waits for the queue, then releases the session
  locks and waits until the browser has let them go.
- No Web Locks: no automatic recovery at all; only the page's own live
  sessions are written, orphans wait for a page with Web Locks. The
  conditional no-lock recovery path is deleted.
- Names are claimed under the Web Lock `mongoose-log-name:<owner>/<char>/<base>`,
  held across the existence check, saving the claim and creating the first
  file. 12 hex digits kept. The first version of its test held the wrong
  step (before the check) and passed on the old code; it now holds the
  create, and fails on the old code with one shared file.
- Checks: `npx tsc --noEmit` exit 0; `npx vitest run` 177 files / 2410 tests
  passed; `npx biome lint` on the two changed files clean.

- Chromium (OPFS folder, live server, guest): crash via CDP Page.crash then
  a new page as the same guest (Solaris_Guest): the crashed session's file
  gained `Ended: not recorded (the page closed)`, its binding was removed and
  only the new live session's binding remained. Reload as the same guest
  (Morava_Guest): folder remembered, new session file, old file ends
  `Ended: 2026-10-18 03:32:53`; after Stop focus is on the heading.

## Local run of every CI step (.github/workflows/build-test.yml) on aa9247be

All passed: `npm run typecheck` exit 0; `npm test` 177 files / 2410 tests;
`npm run test:audio-cache` exit 0 (production build + 4 PASS lines);
editor-ownership spec 1 passed; `check-browser-sessions.mjs` exit 0;
`check-client-recovery.mjs` exit 0; `npm run test:a11y` exit 0.

Surprise: port 5183 (the editor-ownership step's port) was already served by
another `vite preview` process, presumably another worktree's, so the first
editor-ownership pass ran against someone else's build. I did not stop that
process; I reran the spec against this worktree's build on 5193 after
confirming the served entry chunk (`index-sf82j40o.js`) was the one my build
produced. Check what owns a port before trusting a run against it. The
workflow-lint step (actionlint, zizmor) was not run; this branch does not
change `.github`.

## Next step

Round 6 committed and reported; Codex reviews again.

## Round 5 (Codex review 4 of aa9247be: 1 P2, 3 P3, lead's decisions)

Checked against the code before fixing: a binding from c0adc02a has no
`timeZone`, `zoned(time, undefined)` then formats in the ambient zone (and
caches that formatter under the key undefined) while the old byte offset
is reused (Codex: 18 bytes lost at the real cap). The other three were
plain in the code: the claim was saved before the first create with no
rollback; the name lock included the owner key; `choose` had no `active`
check after its awaits.

- renderBinding (always under the session lock) repairs a binding with a
  missing or invalid zone first: saves this browser's resolved zone, resets
  the mark to part 1, and renders the whole session again from sequence 0,
  overwriting the old parts. The binding stays until that render completes
  as usual. Tests: a pre-change binding (no zone, and "Not/A_Zone") whose
  parts were rendered in Pacific/Kiritimati with a mark splitting an entry;
  every part afterwards equals a fresh render in the machine's zone.
- claimName: if creating the first file fails after the claim was saved,
  the unclaimed binding (nameChecked false) is saved back before rethrowing.
- Name lock is `mongoose-log-name:<chosen folder name>/<character>/<base>`.
- choose() checks `active` after the picker, the permission request and the
  persist, and abandons the choice once disposed.
- All 5 new tests failed on aa9247be first, then passed.
- All 7 CI steps on the round 5 tree: typecheck exit 0; `npm test` 177 files /
  2415 tests; test:audio-cache exit 0 (4 PASS); editor-ownership 1 passed on
  5183 serving this build's entry `index-3F0GPXlQ.js` (5183 was free this
  time); check-browser-sessions exit 0; check-client-recovery exit 0;
  test:a11y exit 0. Biome clean on the two changed files.

## Round 6 (Codex review 5 of e16d4166: shrinking rebuild, rollback gap)

Both visible in the round 5 code: the zone-repair rebuild wrote parts 1..new
count and nothing removed higher old parts; the claim rollback's failure was
only logged, leaving a trusted claim with no file. Lead's root fix:

- Ownership mark: every part's second line is `Session: <session id>` (the
  only line before it is the title, bounded to 256 bytes, so it is always in
  the first 512 bytes). `partOwner()` reads those bytes: missing / ours /
  foreign. Nothing is ever written into an existing file that is not ours.
- The name claim's placeholder file now carries the Session line (written
  under the destination lock with the check and the claim). If creating or
  writing it fails, the file is removed and the claim rolled back.
- Every render checks part 1 of a claimed name first; missing or foreign
  means claim again (maybe " (2)") and render the whole session there. A
  foreign file at a later part does the same. So a failed rollback can never
  lead to writing over another session's file.
- Zone repair saves `rebuildFrom: {parts: N}` (old part count) with the reset
  mark. After the rebuild's parts are written, under the session lock, parts
  above the new count up to N are removed only if they are ours;
  `rebuildFrom` is cleared (and saved) only after every removal succeeded. A
  failure throws, leaving it owed for the next render.
- Consequence to know: files written by earlier builds of this branch carry
  no Session line, so they count as foreign; such a session moves to a new
  name and is rendered whole there. Nothing is lost, the old files stay.
- Cost: each render reads up to 512 bytes of part 1 (and of each part it
  writes) before writing.
- Tests: exact file set after a shrinking rebuild with bodies joined from
  the actual files and a foreign part in range left alone; a failed removal
  keeps `rebuildFrom` then the retry finishes; failed rollback, then a rival
  file at the name, then recovery writes " (2)" and never touches the rival;
  a foreign file replacing our part 1 mid-session is never written. All four
  failed on e16d4166 (plus five older tests updated for the new header).
- CI, all 7 steps on the round 6 tree: typecheck exit 0; `npm test` 177 files
  / 2419 tests; test:audio-cache: first run exit 1 with a `TimeoutError`
  (that run's build took 20.3 s against ~11 s normally; my filter dropped
  which check timed out, so its cause is unknown), then exit 0 on 4
  consecutive reruns (4 PASS lines each); editor-ownership 1 passed on 5183
  serving this build's `index-CKbJpyFf.js`; check-browser-sessions exit 0;
  check-client-recovery exit 0; test:a11y exit 0. Biome clean.
