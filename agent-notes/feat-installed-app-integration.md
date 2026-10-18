# feat/installed-app-integration

## Goal
Make the installed PWA a first-class OS citizen: `web+mongoose:` protocol handler,
file handlers for MOO `.db` files, share target (text -> command input, files ->
file transfer panel), app badge for missed notifications, `launch_handler`
focus-existing, and a complete manifest (name, icons, id, start_url, shortcuts).
Nothing a launch carries may ever be sent to the MOO without the player acting.

## State
- Worktree `C:\Users\Q\code\react-client-app-integration`, branch
  `feat/installed-app-integration` from origin/master 03a193ba. `npm ci` done.
- Done: `src/launch/launchText.ts`, `launchInbox.ts` (IndexedDB
  `mongoose-launch`), `shareTarget.ts` (SW POST handler), tests 16 pass.
- Done: sw.ts POST route (+ sw.test), `launchStore.ts`, `placeLaunchText.ts`,
  `launchHandling.ts` (initial URL + launchQueue), `appBadge.ts` (called from
  `client.sendNotification`), `general.appBadge` pref (default true).
- Done: LaunchDatabaseDialog (+test), WasmHost `hostWaiting`/`confirmedDatabase`
  (+2 tests), FileTransfer shared-file intake (+2 tests), sidebar `indexOfTab`,
  App wiring (startLaunchHandling, watchAppBadge, filesRequest -> Files tab,
  dialog), `AppIntegrationPreferences` in General tab.
- Done: manifest in `src/build/webAppManifest.ts` (URLs from
  `src/launch/launchUrls.ts`), vite.config uses it; index.html's two stale
  manifest links removed, `public/manifest.json` + `public/site.webmanifest`
  deleted.
- Verified 2026-10-18: `npx tsc --noEmit` clean; `npx vitest run` 180 files /
  2400 tests pass (baseline master 175 / 2355); biome on changed files 19
  warnings vs 18 baseline (+1 sidebar useExhaustiveDependencies for
  `indexOfTab`, same pattern as hasTab/switchToTab); `npm run build` ok,
  dist/manifest.webmanifest has every member, dist/index.html has one manifest
  link, dist/sw.js contains the share route.
- Playwright vs `npx vite preview --port 5204` (scripts kept in the session
  scratchpad, not committed): share POST answered by SW 303 -> `/?share=<uuid>`,
  text drafted with newline flattened, 3000-byte file arrived as "map.png,
  2.9 KB" in Files panel; protocol URL drafted "look at fountain @quit", params
  stripped, no WebSocket frame contained it. launchQueue stand-in (Chromium's
  real queue shadowed): link drafts in open window without reload; .db in live
  window asks, Host opens `/?mode=host&hostDatabase=<id>` which boots; .db in
  waiting host window asks, boots after Host, Cancel boots nothing.
- Not verifiable here: real OS install, OS protocol/file/share launches,
  whether Chromium honours focus-existing for these, badge on a real icon.
- Committed on the branch; not pushed, no PR.

## Decisions and why
- Scheme `web+mongoose`. Checked against the WHATWG HTML spec (system-state,
  fetched 2026-10-18): safelist is bitcoin ftp ftps geo im irc ircs magnet mailto
  matrix mms news nntp openpgp4fpr sftp sip sms smsto ssh tel urn webcal wtai xmpp;
  custom schemes must be `web+` + one or more ASCII lower alpha. `telnet` is not
  allowed.
- URL grammar: `web+mongoose:` [`//`] percent-encoded text. Handler URL
  `/?protocol=%s`. Text is decoded, every run of control chars (incl. CR/LF/TAB)
  becomes one space, trimmed, capped at 1000 chars. Newlines matter because
  `client.sendCommand` writes the draft as one chunk; an embedded LF would be a
  second, hidden MOO command.
- Never send: every launch path only calls `useInputStore.setText` / file
  transfer selection / a confirm dialog. Nothing calls `sendCommand`.
- Input is cleared by `personalDataStore.clear/confirm/setVisitor`, and
  `client.connect()`/`connectLocal()` call `clear()` on every connect. A launch
  placed while no owner is signed in is "kept": after each personal-data change
  that leaves the input empty it is put back, until the player types over it,
  sends anything (`noteCommandSent()` from App.handleCommand), or an owner is
  signed in. Found by Playwright: a protocol launch on a fresh page was wiped
  by `connect()` (App's launch effect runs before the connect effect); the share
  path survived only because its IndexedDB read finished after connect.
- Share target is POST multipart to `/share-target`, handled in the SW (workbox
  `registerRoute(..., 'POST')`), stored in IndexedDB, 303 to `/?share=<id>`.
  Chromium's launch_handler Intent to Ship says share_target launches ignore
  launch_handler on initial launch (it "may drop in-transit user data"), so a
  share opens its own window. This is from the 2022 I2S, not re-verified live.
- `launch_handler: focus-existing`: protocol and file launches arrive through
  `launchQueue` in the existing window, no reload, so the live connection stays.
- Badge counts each `client.sendNotification` call made while
  `document.hasFocus()` is false: channel messages whose channel has notify on
  (Comm.Channel.Text) and file transfer offers. Counted even when Notification
  permission is not granted. Cleared on window focus / visible+focused, and when
  the pref is turned off. SW push (browser-away) does not touch the badge: the
  SW cannot read the localStorage preference.
- `.db` file launch: confirm dialog. If this window's WasmHost is waiting for a
  database, host here; otherwise stash the File in IndexedDB and open
  `/?mode=host&hostDatabase=<id>` in a new window (the click is the activation).

## Surprises
- index.html links THREE manifests: `/site.webmanifest` (empty name/short_name),
  `/manifest.json` (CRA leftover, icons point at missing logo192/512.png), and at
  build vite-plugin-pwa injects `/manifest.webmanifest` (only `theme_color`).
- The Write/Edit tools turned a typed ` `/` ` escape into the raw
  characters, which broke a regex literal (esbuild: unterminated regex). Build
  such regexes from a string with doubled backslashes.
- `personalDataStore.confirm/clear/setVisitor` clear the command input on owner
  change, so a draft placed before login would vanish at login.
- File objects do not round-trip through fake-indexeddb under vitest: jsdom's
  File comes back a plain object, Node's `structuredClone(File)` gives a nameless
  Blob. Unit tests check counts only; whole-file round trip must be checked in a
  real browser (Playwright against the preview build).

- Chromium defines `window.launchQueue` as a prototype getter; plain assignment
  in a test page silently does nothing. Shadow it with Object.defineProperty.
- After Cancel in a freshly opened host window, focus returns to `<body>`
  because nothing had focus before the dialog. Native restore; not improved.

## Next step
Team lead review. Then a real installed-app test on Windows Chrome/Edge:
install, open a `web+mongoose:` link, "Open with" a .db, share from another
app, and watch the badge while unfocused.
