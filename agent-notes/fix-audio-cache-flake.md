# fix/audio-cache-flake

## Goal
`npm run test:audio-cache` (scripts/check-audio-cache.mjs) sometimes times out in
locator.waitFor at line 125 (Preferences "Local Echo"), 132 (Autologs "Refresh") or 137
(Files tab `input[type="file"]`). Find the cause without raising timeouts, and settle
whether feat/voice-commands (4d26a7c2) makes 137 likelier through a real regression.

## State
Fix committed on this branch (off origin/master b9864e3d, after PR #190 merged). Not pushed.

Evidence, from a temporary probe that replayed lines 113-137 under CDP
`Emulation.setCPUThrottlingRate`, logging every routed WebSocket and dumping the page on
timeout. The probe was never committed.
- Master build (2aec1c80), socket closed as in the script: 1x 5/6, 2x 5/6, 3x 5/6, 6x 0/8 and
  0/3. Every failure at 132. The Autologs dialog was open and read "Sign in to a character to
  view saved logs." The client had reconnected about 0.7 s after the script set the owner.
- Voice build (4d26a7c2), socket closed: 1x 6/6, 3x 2/6, 6x 0/6. Every failure at 132,
  same dialog text.
- Socket left open (the fix), 8 runs each: master 6x 8/8, 12x 8/8; voice 6x 8/8, 12x 8/8.
- Journey duration with the socket open, 3x, 8 runs: master median 1868 ms, voice
  median 2263 ms.

## Decisions and why
- Cause: the UI context routed every WebSocket to `socket.close()`. The client then
  reconnects after 1, 2, 5 and 10 s (src/reconnectBackoff.ts, client.ts:307-317).
  - Every `connect()` runs `usePersonalDataStore.getState().clearForConnect()`
    (client.ts:226), which drops the owner the script set with Char.Name. Autologs without
    an owner renders the sign-in text and no Refresh (AutoLogDialogContent.tsx:264-269).
  - Every disconnect bumps the file-transfer generation (client.ts:156-162), so a load in
    flight rejects "File transfer initialization cancelled" (client.ts:174-175), and the
    Files panel reloads on every `connected` change (FileTransfer/index.tsx:196-208).
  Which step a reconnect lands in depends on machine speed, so the failure moves around.
  The app is right to forget the owner on a new connection; the harness race is the bug.
- Fix: route the UI context's sockets to a no-op handler so they stay open, as
  scripts/check-accessibility.mjs already does. The startup context (line 104) still closes
  its socket: that check only inspects startup requests and is not part of the race.
- Voice branch: same mechanism and same failing step in the probe. It fails more often
  under throttle because its journey runs about 20% longer, so more runs cross the ~2 s
  reconnect. With the socket open it passes like master. No evidence of a functional
  regression in the Files tab.

- Line 137 shown with a second temporary probe (never committed). It held the
  createFileTransfers chunk for 3 s after the Files tab click, so a reconnect landed during
  the load. Socket closed: 0/5 had a file input. The panel read "File transfer
  initialization cancelled" and stayed that way through later reconnects. Socket open: 5/5
  had the file input.
- Verification on this branch's build: `npm run test:audio-cache` 10 consecutive runs,
  10 exit 0. Each printed the Monaco PASS line, which comes after lines 132 and 137.
- Scratch worktrees for master and voice builds were removed after the runs.

## Surprises
- Line 125 ("Local Echo") was not this flake. Per the team lead it was PR #187's
  deterministic renderer crash: VoiceCommandPreferences probed
  SpeechRecognition.available({processLocally:true}) on mount, which crashes headless
  Chromium 147. That was fixed on the voice branch, so it isn't chased here.
- test:audio-cache also runs a soundfont check, which prints its own fourth PASS line.

## Next step
None. Push / PR only if asked.
