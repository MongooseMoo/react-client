# feat/local-log-folder

## Goal

Q asked (2026-10-18, "make it beautiful"): auto-logs saved to a real folder on
the player's computer via the File System Access API (`showDirectoryPicker`).
Where the API is missing (Firefox, Safari) the client keeps today's
IndexedDB-only behaviour exactly, with no new storage access. Worktree:
`C:\Users\Q\code\react-client-local-logs`, branch `feat/local-log-folder`,
started off `origin/master` 03a193ba, rebased 2026-10-18 onto b9864e3d (PR #190,
the output.test act() flake fix; also head tracking and app integration).
Do not push or open a PR; report to team-lead.

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
  the live tab's next render would remove anyway). Without Web Locks there
  is no recovery at all (round 4): only the page's own live sessions are
  written; orphans wait for a page that has Web Locks.
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
- Ownership (rounds 6-7): every part opens with title / `Session: <id>` /
  `Character: …`; only a file with exactly that opening and this session's
  id is ever written. Header fields are one line each and bounded.
- Mongoose never removes a file (rounds 8-9): zone repair claims a fresh
  name and leaves old files as they are; a failed claim placeholder leaves
  whatever is at that path and the retry claims another name.
- Accepted limitation (round 9, lead's decision): the File System Access API
  has no conditional or exclusive write. Mongoose writers are serialised by
  Web Locks and a file with any other header is never written, but a
  replacement committed by a program outside Mongoose between the ownership
  read and createWritable can be overwritten. Moving the check only moves
  the window, so no machinery is added; the comment at `writeFile` states
  the guarantee, and the preferences help tells players the newest file of
  a session is rewritten as lines arrive.

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

Codex round 9 approved (head 5880fe00 after team-lead rebased the branch onto
origin/master 3cd0ff55). Last changes: the writeFile comment now qualifies
the serialisation claim for the no-Web-Locks fallback (per-page queue, no
recovery, but name claims not serialised across tabs, so one tab's
placeholder can replace another's and that session re-renders under a new
name); PR description written to the session scratchpad
(`pr-local-logs.md`). Gate on ac095080, full output kept: typecheck exit 0;
`npm test` 191 files / 2743 tests; test:audio-cache first run exit 1,
`locator.waitFor` timeout for `input[type="file"]` at
scripts/check-audio-cache.mjs:137 (the Files tab after a reconnect). That is
the flake fixed on master by PR #192 (c574bfd2, keeps the mocked socket
open), which this branch's base 3cd0ff55 lacks. The rerun passed (4 PASS).
editor-ownership 1 passed on 5193 serving this build's `index-DU2tmgtf.js`;
check-browser-sessions, check-client-recovery, test:a11y exit 0. Not
rebased onto c455f855 (team-lead said to work on the branch as it is).
Ready for team-lead to open the PR; do not push from here.

Round 9 (Codex review 8 of 930b2ad8) committed and reported: the claim
placeholder rollback no longer removes anything (an empty or foreign file
at that path stays and the retry claims " (2)"); the continuation-write
race is documented as accepted (see Decisions). Tests: a foreign commit
landing before the placeholder write fails is preserved and the session
goes to " (2)"; "keeps the header when the very first write fails" now
expects the empty leftover and " (2)". Both failed on 930b2ad8. CI, all 7
steps, full output kept, none failed: typecheck exit 0; `npm test` 188
files / 2634 tests; test:audio-cache exit 0 (4 PASS); editor-ownership 1
passed on 5193 serving this build's `index-DBJ8lbn5.js`; check-browser-
sessions, check-client-recovery, test:a11y exit 0. Codex reviews again.

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

## Round 7 (Codex review 6 was cut off; lead confirmed one defect from its probes)

`partOwner` took the first line starting with "Session: " anywhere in the
first 512 bytes, so another file quoting our Session line in its body
counted as ours and could be overwritten or removed by rebuild cleanup
(Codex native probe: "foreignPreserved": false). Also found while fixing:
header fields were not newline-normalised, so a title with a newline could
have injected a line; and the claim placeholder (`Session: <id>` alone) had
the Session line first.

- Ownership now requires the exact opening layout: line 1 a non-empty title
  not starting with "Session: ", line 2 exactly `Session: <id>`, line 3
  starting "Character: ". Anything else is foreign.
- boundField collapses CR/LF/U+2028/U+2029 runs to a space, so no field can
  add or move a header line; a title starting with "Session: " is rendered
  as "Title: …"; an empty or whitespace title becomes "Mongoose Client".
- The claim placeholder is the real part-1 header.
- Surprise: writing ` ` through the Edit tool put the raw U+2028 and
  U+2029 characters into the regex, which TypeScript reads as line breaks
  ("Unterminated regular expression literal"). The regex now uses
  `\p{Zl}\p{Zp}` with the u flag; a byte scan shows no raw separators left.
- Tests: four foreign shapes (another session's; our Session line in the
  body at line 4; our Session line second with a different line 3; our
  Session line first), each both as a leftover in a shrinking rebuild (kept,
  never removed) and at part 1 mid-session (never written, session goes to
  " (2)"); plus a header-mimicking title whose first and continuation parts
  are recognised as ours. 7 failed on 412c06f8 before the fix.
- CI, all 7 steps on the round 7 tree: typecheck exit 0; `npm test` first
  run 6 failures, all in src/components/output.test.tsx (frozen history,
  line markup, provisional away lines); I filtered the output again and lost
  the error text, so the cause is unknown. output.test.tsx alone: 36/36; two
  full reruns: no failures, then 177 files / 2426 tests. test:audio-cache
  exit 0 first try (4 PASS); editor-ownership 1 passed on 5183 serving this
  build's `index-lQtquXuo.js`; check-browser-sessions, check-client-recovery
  and test:a11y exit 0. From now on each step keeps its full output and
  prints it on failure.
- team-lead: those 6 output.test.tsx failures are a known flake (a timed-out
  test leaves a Preact act() scope open), fixed on master by PR #190.

## Rebase onto origin/master b9864e3d

`git rebase origin/master`: all 11 commits applied with no conflicts.
preferences.tsx keeps master's AppIntegrationPreferences (General) and
HeadTrackingControls (Sounds) next to LogFolderPreferences (Logging). All 7 CI
steps on the rebased tree, full output kept: typecheck exit 0; `npm test` 188
files / 2637 tests; test:audio-cache exit 0 (4 PASS); editor-ownership 1 passed
on 5193 serving this build's `index-BhNaXO1s.js` (matches dist/index.html);
check-browser-sessions, check-client-recovery, test:a11y exit 0.

## Round 8 (Codex review 7 of 5acf2046: one P2, lead's decision)

The rebuild cleanup checked a part's ownership and then called
`removeEntry(name)`, which removes whatever is at that path; a writer outside
Mongoose replacing the file between the two loses its data (Codex reproduced
it in native OPFS). The folder API offers no exclusion against outside
writers, so any check-then-remove keeps the race.

- Zone repair is non-destructive: a binding with a missing or invalid zone
  gets this browser's zone, `nameChecked: false` and `avoidBase: <old base>`,
  and the whole session renders under a freshly claimed name (under the
  destination lock). The old part files are never opened or removed.
- `avoidBase` keeps the fresh claim off the old name even when the old first
  part is gone (otherwise the claim could take the old name back and write
  over old parts 2..N, which carry this session's header). The claim drops it.
- `rebuildFrom` and the surplus-part removal are deleted, with their tests.
  The only `removeEntry` left is the claim placeholder's rollback (a file this
  page created moments earlier under the name lock), as decided.
- Tests: no zone, an invalid zone, and an invalid zone with the old first part
  gone: old files byte-identical with no new writes, `removed` empty, "base (2)"
  holds exactly the fresh render with one footer, no binding left. All three
  failed on 5acf2046.
- CI, all 7 steps, full output kept (none failed): typecheck exit 0;
  `npm test` 188 files / 2633 tests (fewer than 2637: the 5 removed cleanup
  tests, 1 added variant); test:audio-cache exit 0 (4 PASS; build 20.11 s);
  editor-ownership 1 passed on 5193 serving this build's `index-BBgaIr1Z.js`;
  check-browser-sessions, check-client-recovery, test:a11y exit 0. Biome clean.
