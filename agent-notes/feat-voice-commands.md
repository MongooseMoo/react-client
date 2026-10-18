# feat/voice-commands

## Goal
Speech-to-command: push-to-talk dictation into the command input with the Web
Speech API (Chrome, Edge, Safari; hidden where absent, e.g. Firefox). Requested
by Q on 2026-10-18 via team lead. Agents do not push or open the PR; the team
lead takes the branch to PR.

## State (2026-10-18)
Done. Codex reviewed five rounds; round 5 approved 28f011ab with no P2 or
worse. Commits on the branch: 7062014b (feature), b8595957 (round 1),
58889e69 (round 2), 123a6060 (round 3), 28f011ab (round 4), b3fc117b
(round-5 P3s), 3a6d8293 (language names), then this note update.

Files:
- `src/voiceInput.ts`: recognizer typings (TS DOM lib lacks the constructor),
  `getRecognitionConstructor`, `recognitionLanguage`, `checkAvailability`
  (on-device / downloadable / cloud / unknown / unsupported-language),
  `startVoiceSession` (one utterance, interim results, final at most once;
  construction, configuration and start inside one try), `voiceErrorMessage`.
- `src/voiceInputTestHelpers.ts`: `FakeRecognition`, `fakeRecognizer`.
- `src/components/VoiceCommandButton.tsx/.css`: the mic toggle by the command
  input, Alt+Shift+D and Escape, the whole dictation lifecycle (below).
- `src/components/VoiceCommandPreferences.tsx/.css`: fieldset in the Speech tab:
  privacy line, on-device download, enable, send at once, language, help.
- `src/clientSpeechSuspension.ts`: refcounted hold; `client.speak` (autoread,
  channel speech), `Client.Speech.Speak` and the Preview Voice button stay
  silent while held.
- `src/stores/inputStore.ts`: `dictation` (DictationHandle the send path asks
  first) and `needsFreshEnter` (time-limit review guard).
- `src/stores/preferencesStore.ts`: `voiceInput { enabled, sendImmediately, language }`.
- `src/reservedShortcuts.ts`: `VOICE_COMMAND_CHORD`, `isVoiceCommandToggle`.
- `src/components/input.tsx`: renders the button; `handleSend` asks the
  dictation handle, then reads text from the store; Enter repeat ignored while
  `needsFreshEnter`; Enter keyup clears it.
- `src/components/preferences.tsx`: fieldset in Speech tab, shortcut line in
  Keyboard tab, Preview Voice gated.

## How a dictation works (VoiceCommandButton)
- One `Dictation` object per press in `currentRef`; phases idle / starting /
  listening (`data-phase`, `aria-pressed` true unless idle). Every callback
  checks it is still current and that voice commands are still on.
- `terminate(dictation, ending)` is the only way one ends: invalidate, clear
  timer and send handle, release speech, abort recognizer, then text by
  ending (final: leave; discard: restore draft if the input still holds what
  dictation wrote, empty it if the player changed; keep: foreign edit), then
  announce.
- Timers: Starting 10 s ("Speech recognition did not start. Try again.");
  listening 60 s, then stop with a 2 s grace; any stop gets 2 s for a final
  or end. A press while starting or stopping ends it at once.
- Enter/Send while listening: stop, send only the final; no final -> "Nothing
  was sent. Say it again." Interim text is never sendable.
- Time-limit stop: a final is never sent (even send at once or held Enter);
  left for review, focused, "Time limit reached. Check the command box, then
  press Enter."; Enter repeat ignored until keyup or an edit. Interim words but
  no final -> "Time limit reached. No final words came back; nothing was sent.
  Say it again."; silence -> "Time limit reached. Nothing was heard."
- Ends at once on: Escape, typing/history/any foreign input change (keeps the
  text), preference off (synchronous store subscription), disconnect/connect,
  player change, new game session ("Dictation stopped: <reason>"), unmount
  (silent).
- Speech hold taken before `speechSynthesis.cancel()`, released at the final
  and on every terminate.

## Decisions and why
- Toggle, not hold: holding a chord is unreliable with screen readers (keyup
  lost on focus change, autorepeat) and hard for some players; recognition is
  single-utterance so it stops by itself on a pause.
- Alt+Shift+D: Alt+Shift+letter passes NVDA/JAWS browse mode; no known browser
  binding; matched by `event.code`; reserved from server key layers.
- Transcript goes through `CommandInput.handleSend` like Enter (history,
  `client.sendCommand`).
- On-device preferred via `available({langs, processLocally:true})`; where the
  browser can't be asked, "unknown" (assume the maker's service). Availability
  is stored with its language; the language field is locked during download.
- Identity = owner+visitor, gameSessionId, connected, captured at press. A
  connection or game-session change restores the same player's draft; a
  player change does not.
- 60 s limit and "deadline never sends" were the team lead's decision (round 3).
- LiveKit untouched; "Listening. Voice chat can hear you." when a room is held.
- Help text tells send-at-once users to use headphones: screen-reader speech
  from speakers can be heard and sent.

## Surprises
- Vitest here is 1.6: no `toHaveBeenCalledExactlyOnceWith`.
- `fireEvent.change` on text inputs did not update state in these jsdom tests
  (cause not investigated); `fireEvent.input` works and is what other tests use.
- Playwright's Chromium (1.59.1) has native unprefixed `SpeechRecognition`;
  stubbing only the prefixed name left the native one in use and crashed the
  headless renderer. Stub both names. Not tested outside headless.
- Command history records only with a personal-data owner; a fresh guest
  before login has none.
- A dictation started before auto-login connects is cancelled when it
  connects (identity binding), announced "Dictation stopped: connected".
- `TaskStop` on a backgrounded `npx vite` leaves the vite node process on
  :5203; kill it by PID after checking its command line.
- Stubbing the whole `Intl` global in a test (`vi.stubGlobal("Intl",
  {...Intl, DisplayNames: undefined})`, which also drops every other Intl
  member because they are non-enumerable) made 6 tests in output.test.tsx fail
  in two full runs (a 5000 ms timeout, then empty output), while that file
  passed alone and the suite passed with the change stashed. Replacing only
  `Intl.DisplayNames` and restoring it in `finally` gave two clean full runs.
  How the stub reached another file under default isolation was not worked out.
- Intl.DisplayNames' default `languageDisplay: "dialect"` names en-US
  "American English"; "standard" gives "English (United States)".
- PR #187 CI: `npm run test:audio-cache` timed out waiting for the
  Preferences dialog. Cause, reproduced on a bare page with no app code
  (scratchpad available-probe.mjs): in Playwright's headless Chromium 147,
  `SpeechRecognition.available({langs:["en"], processLocally:true})` crashes
  the renderer ("Target crashed"); `processLocally:false` and the constructor
  are fine. The preferences fieldset probed on mount, and every tab mounts
  when the dialog opens, so opening Preferences crashed the page. A crash is
  not catchable, and scripts/check-accessibility.mjs:220 opens the Speech tab,
  so probing "when the Speech tab is shown" would crash test:a11y too.
  Fix: never probe on render. Probe only on player intent: "Check this
  browser" button, voice commands turned on (or already on), or a mic press.
  Before that the privacy line says where speech may go and invites the
  check. A check that throws is "unknown"; no answer in 10 s is "unknown".
- Codex harness artifacts seen while verifying: round 2's PreviewButton case
  pasted the old source; round 3's lifecycle harness virtualizes only 15000 and
  2000 ms timers; round 4's held-Enter case label names the old behaviour.

## Verification (final, 2026-10-18)
- Team lead's real Chrome 155 check: real available() returned
  "downloadable" and the text matched; button label, shortcut and
  aria-pressed correct; no console errors. It showed the raw tag ("en"), so
  3a6d8293 names the language with Intl.DisplayNames ("English (United
  States)"), falling back to the tag, in every availability and download sentence.
- All seven .github/workflows/build-test.yml steps run locally after the
  lazy-check fix (the team lead's gate from now on): typecheck exit 0;
  npm test 178 files / 2458 tests passed; test:audio-cache exit 0 (4 PASS
  lines); editor-ownership spec 1 passed; check-browser-sessions passed;
  check-client-recovery passed; test:a11y PASS (it opens the Speech tab).
- `npx tsc --noEmit`: exit 0.
- `npx biome lint` on all branch-changed src files: 7 warnings, all on master
  (client.test.ts:169-174 noUnusedImports, input.tsx:83).
- Codex harnesses for rounds 1-4 all show the fixed behaviour (last run at
  28f011ab; round-5 changes are a help sentence and a test assertion).
- Playwright (scratchpad voice-check.mjs, real Chromium, dev server :5203,
  both recognizer names stubbed, after auto-login): interim in input; review
  and send-at-once; Enter during interim sends only the final; typing stops
  dictation; Escape restores; 2 s stall gives up; history recall. These runs
  sent guest commands ("look at fountain", "inventory", "drop all", "north")
  to the live MOO.
- Not exercised: real microphone or recognition, native event timing, real
  model install, Safari, Edge, LiveKit at the same time, screen-reader output.

## Next step
Team lead opens the PR from feat/voice-commands. After that, a real-microphone
check in Chrome (on-device and cloud) and Safari.
