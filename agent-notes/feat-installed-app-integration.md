# feat/installed-app-integration

## Goal
Make the installed PWA a first-class OS citizen: `web+mongoose:` protocol handler,
file handlers for MOO `.db` files, share target (text -> command input, files ->
file transfer panel), app badge for missed notifications, `launch_handler`
focus-existing, and a complete manifest (name, icons, id, start_url, shortcuts).
Nothing a launch carries may ever be sent to the MOO without the player acting.

## State
- Worktree `C:\Users\Q\code\react-client-app-integration`, branch
  `feat/installed-app-integration` from origin/master 03a193ba.
- c11225d7: the whole feature (see Decisions). Verified then: tsc clean;
  vitest 180 files / 2400 tests (master 175 / 2355); biome +1 warning
  (sidebar useImperativeHandle deps, same pattern as its neighbours); build ok;
  Playwright against `npx vite preview --port 5204` (scripts in the session
  scratchpad, not committed) passed share POST, protocol URL, and launchQueue
  stand-in checks.
- Codex review round 1 (scratchpad codex-review-app-integration-report.md),
  six findings, fixed in the second commit. Verified after: tsc clean; vitest
  181 files / 2429 tests; biome 19 warnings (unchanged from c11225d7); build
  ok; Playwright check-launch.mjs 18/18 (adds: 7 uncollected POSTs leave 5 in
  `meta`, the rest redirect to `?share=inbox-full`), check-launch-queue.mjs
  17/17 (adds: Local shortcut in a live window asks, Open starts
  `/?mode=local` in a new window which boots, live window not reloaded).
  Codex probes for findings 2 and 5 now fail (the bugs are gone); the probe for
  3 still passes because its `queryByText(...) === null` wait is met during
  the panel's loading state, so it cannot tell; own test covers the remount.
  Fixes:
  1. Inbox bounds: per file 100 MiB (`DEFAULT_MAX_FILE_SIZE`, now exported from
     fileTransfer/types.ts and used by the engine), per share 200 MiB, inbox
     <= 5 items and <= 200 MiB enforced in the put transaction. DB v2 splits
     `payloads` / `meta` (index `created`); prune walks the index (on page
     start, put, take). Content-Length checked before parsing; text fields
     sliced before sanitizing. Refusals reach the page as
     `?share=too-large|inbox-full|too-many|failed`, announced.
  2. LaunchDatabaseDialog: per-attempt token ended by close/Escape, a new
     offer, unmount; checked after the await; an abandoned entry is discarded.
  3. Staged shared file lives in `launchStore.stagedShare`, survives remount.
  4. Shortcuts: a launchQueue URL whose `mode` differs from this window's sets
     `modeRequest`; LaunchModeDialog opens it in a new window on click.
  5. `inputStore.discardForNewOwner()` + `ownerResets` counter (used by
     personalDataStore.clearTransientData) tells lifecycle resets from player
     edits; any player edit, emptying included, retires the kept draft.
  6. watchAppBadge clears at once when focused or the pref is off.
- Codex round 2 on 452fb2d2 (scratchpad codex-rereview-app-integration-report.md),
  fixed in the third commit. Verified after: tsc clean; vitest 181 files /
  2445 tests; biome 19 warnings on the 40 changed files (same pre-existing set;
  the two new dialog reset effects carry biome-ignore with a reason); build ok;
  check-launch.mjs 18/18, check-launch-queue.mjs 17/17; Codex
  rereview-browser.cjs: native Cancel race 0/30 opens, mode close race keeps
  the newer request 3/3, unstated-length 202 MiB stream cancelled after
  210,763,776 bytes with `?share=too-large`, cross-origin long-name flood 5
  rows / 1275 name chars / 7910 counted bytes. Also added: one share body read
  at a time (`?share=busy`). Fixes:
  1. Dialog dismissal decided synchronously (`useOfferDialog`: Cancel and the
     `cancel` event revoke before close; a late `close` from an earlier
     showing is ignored; `modeRequest` is an object so an old dismissal can't
     match a new one). setupTests' dialog.close() shim now fires `close` in a
     later task, as browsers do; 3 dialog tests failed first, and the 4 new
     database-dialog tests fail on the 452fb2d2 dialog.
  2. Share body read through a byte counter, stream cancelled past
     MAX_SHARE_BYTES + 1 MiB, then parsed from the buffered bytes.
  3. File name capped at 255, type at 127, both counted in the budget.
  4. `personalDataStore.clear()` is the privacy clear (sign-out): plain input
     clear, which retires a kept launch draft. New `clearForConnect()` for
     client.connect/connectLocal keeps the restorable reset. `confirm()` is
     restorable only with no previous owner; `setVisitor` discards.
  5. v1 inbox comment: never shipped, discarded on purpose.
- Not verifiable here: real OS install, OS protocol/file/share/shortcut
  launches, whether Chromium honours focus-existing for these, badge on a real
  icon. Not pushed, no PR.

## Decisions and why
- Scheme `web+mongoose`. Checked against the WHATWG HTML spec (system-state,
  fetched 2026-10-18): safelist is bitcoin ftp ftps geo im irc ircs magnet mailto
  matrix mms news nntp openpgp4fpr sftp sip sms smsto ssh tel urn webcal wtai xmpp;
  custom schemes must be `web+` + one or more ASCII lower alpha. `telnet` is not
  allowed.
- URL grammar: `web+mongoose:` [`//`] percent-encoded text. Handler URL
  `/?protocol=%s`. Text is decoded, every run of control chars (incl. CR/LF/TAB,
  U+2028/9) becomes one space, trimmed, capped at 1000 chars. Newlines matter
  because `client.sendCommand` writes the draft as one chunk; an embedded LF
  would be a second, hidden MOO command.
- Never send: every launch path only drafts text, stages a file, or asks.
  Nothing in src/launch calls `sendCommand`.
- Personal-data resets (`client.connect()`, sign-in, visitor change) empty the
  input via `discardForNewOwner`. A launch placed while no owner is signed in is
  "kept": put back after each such reset, until the player edits it (emptying
  included), sends anything (`noteCommandSent()` from App.handleCommand), or an
  owner is signed in.
- Share target: POST multipart to `/share-target`, handled in the SW (workbox
  `registerRoute(..., 'POST')`), stored in IndexedDB `mongoose-launch`, 303 to
  `/?share=<id>`. Any site can post there with no gesture, hence the bounds.
  Chromium's 2022 launch_handler Intent to Ship says share_target launches
  ignore launch_handler on initial launch, so a share opens its own window. Not
  re-verified live.
- `launch_handler: focus-existing`: protocol, file and shortcut launches arrive
  through `launchQueue` in the existing window, no reload.
- Badge counts each `client.sendNotification` call made while
  `document.hasFocus()` is false (notifying channel messages, file offers),
  even without Notification permission. Cleared on focus, at start when
  focused, and when the pref is off. SW push does not touch it (the SW cannot
  read the localStorage pref).
- `.db` file launch: confirm dialog. Host here if this window's WasmHost waits
  for a database; otherwise stash the File and open
  `/?mode=host&hostDatabase=<id>` in a new window (the click is the activation).

## Surprises
- index.html linked THREE manifests: `/site.webmanifest` (empty name), the CRA
  `/manifest.json` (missing icons), then the generated one. Browsers use the
  first. Both stale ones removed.
- The Write/Edit tools turned a typed backslash-u 2028/2029 escape into the raw
  characters, which broke a regex literal. That regex is built from a string.
- File objects do not round-trip through fake-indexeddb under vitest (jsdom
  File -> plain object, Node File -> nameless Blob). Unit tests check counts;
  whole-file round trip is checked by Playwright on the preview build.
- Chromium defines `window.launchQueue` as a prototype getter; a test page must
  shadow it with Object.defineProperty.
- After Cancel in a freshly opened host window, focus returns to `<body>`
  because nothing had focus before the dialog. Native restore; not improved.
- Stopping a backgrounded `npx vite preview` with TaskStop killed the shell but
  left the node server running (pid found via Win32_Process). Check the port
  and stop the node process by pid.

## Next step
Fresh Codex review of the branch. Then a real installed-app test on Windows
Chrome/Edge: install, `web+mongoose:` link, "Open with" a .db, the Host/Local
shortcuts with a window open, a share from another app, the badge.
