# feat/local-log-folder

## Goal

Q asked (2026-10-18, "make it beautiful"): auto-logs saved to a real folder on
the player's computer via the File System Access API (`showDirectoryPicker`).
Where the API is missing (Firefox, Safari) the client keeps today's
IndexedDB-only behaviour exactly. Worktree: `C:\Users\Q\code\react-client-local-logs`,
branch `feat/local-log-folder` off `origin/master` (03a193ba). Do not push or
open a PR; report to team-lead.

## State

- Worktree created, `npm ci` done.
- Read: AutoLogService/Store/Types/Export, AutoLogDialogContent owner check,
  App.tsx session configuration (lines ~290-330), preferences Logging tab.
- Done with tests: `src/logging/AutoLogFolder.ts` (sink + IndexedDB handle
  store + zustand status store), `src/@types/file-system-access.d.ts`,
  `AutoLogSink` in AutoLogTypes; AutoLogService takes an optional sink,
  calls `append` after the IndexedDB append succeeds and `sessionEnded`
  after endSession. UI: `src/components/LogFolderPreferences.tsx` + `.css`,
  mounted at the end of the Logging tab in `preferences.tsx`.
- Tests: `AutoLogFolder.test.ts` (17), one new AutoLogService test,
  `LogFolderPreferences.test.tsx` (7).

## Decisions and why

- IndexedDB stays the always-on store; the folder is an extra sink fed from
  `AutoLogService.flush` after the IndexedDB write succeeds. Folder failures
  never reject the flush, so IndexedDB behaviour is unchanged.
- Folder handle is stored per owner (keyed by `ownerKey`) in its own small
  IndexedDB database, not by bumping the autolog DB version: no migration of
  existing logs, and one character's folder is never fed by another
  character's lines on a shared browser.
- Owner check mirrors `AutoLogDialogContent.permitted`: session must have an
  owner, policy ready, not a visitor, and the owner must match the folder's
  owner. App only creates sessions with an owner, so visitors never log.
- Session title is `Mongoose Client - <room>` (App.tsx `setWindowSubtitle`),
  so it is a poor folder name. Layout: `<folder>/<character name>/<YYYY-MM-DD HH-MM-SS>.txt`
  with the character name from `useSessionStore.playerName` when its
  playerUuid matches the owner, else the playerRef.

- Lines missed while the folder was disconnected or failing are read back
  from IndexedDB on the next successful write (gap detection by sequence),
  so the file ends up complete for the active session.
- Choosing a different folder mid-session writes the whole session so far
  into a fresh file there; the old folder's file is left as it was.
- Status changes are announced by the sink (it runs while Preferences is
  closed); the UI section has no live region so nothing is spoken twice.
  The "needs permission" notice is spoken once per page load, only when a
  line is actually skipped.
- Buttons are never disabled while an action runs (a ref guards re-entry):
  disabling the focused button drops focus. After an action, focus moves
  to the first button in the group if the focused one disappeared.
- When a session ends: footer line `Ended: ...` in the .txt. No HTML copy:
  it was built and then removed after the Chromium run showed a reload
  leaving a 0-byte `.html` (file created, page unloaded before the write
  closed). Closing or reloading the tab is how most sessions end, so the
  copy would mostly be missing or empty. The viewer's HTML export remains.
  Text appends are safe across unload: Chromium writes to a swap file and
  swaps it in on close, so an append lands whole or not at all.

## Surprises

- `createWritable({keepExistingData: true})` in Chromium copies the existing
  file into a swap file before each write, so per-flush appends are an
  O(file size) disk copy at the OS level even though JS never re-sends old
  lines. Accepted for now; a session is usually a few MB at most.
- jsdom's DOMException is not an `Error`; `errorMessage` checks both.
- `syncOwner` first returned early while the constructor's load was still
  pending (status stuck on "loading"); now it always awaits the load.

## Verification so far

Chromium via Playwright (scratchpad script, not committed), with
`showDirectoryPicker` replaced by an OPFS folder (a real
FileSystemDirectoryHandle; the OS picker and the permission prompt cannot be
driven headlessly). Seen: Choose, live file `Tangra_Guest/<stamp>.txt` with
header + redacted URL + timestamped lines, appends across flushes, status
"Writing" with current file, handle remembered after reload (new session
file), `Ended:` footer, Stop using folder leaves focus on "Choose folder…".
Not exercised in a browser: the real picker, `prompt` permission after
reload and Reconnect (OPFS handles are always granted), revoked permission,
write errors. Those paths are covered only by unit tests with fake handles.

Final checks after the HTML removal: `npx tsc --noEmit` exit 0; `npx vitest run`
177 files / 2380 tests passed; `npx biome lint` on the 10 changed source files
clean. Chromium rerun: only `.txt` files, focus after Stop on "Choose folder…".
Feature committed as faed57ca.

## Next step

Reported to team-lead; not pushed, no PR (as instructed). Open follow-ups:
the per-flush keepExistingData copy cost on large sessions, and the
browser paths that only unit tests cover (listed above).
