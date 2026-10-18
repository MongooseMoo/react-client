# feat/voice-commands

## Goal
Speech-to-command: push-to-talk dictation into the command input with the Web
Speech API (Chrome, Edge, Safari; hidden where absent, e.g. Firefox). Requested
by Q on 2026-10-18 via team lead. Do not push or open a PR.

## State
- `src/voiceInput.ts`: recognizer typings (TS DOM lib lacks the constructor),
  `getRecognitionConstructor`, `recognitionLanguage`, `checkAvailability`
  (on-device / downloadable / cloud / unsupported-language), `startVoiceSession`
  (one utterance, interim results, final once), `voiceErrorMessage`.
- `src/voiceInputTestHelpers.ts`: `FakeRecognition`, `fakeRecognizer`.
- `src/components/VoiceCommandButton.tsx/.css`: mic toggle button in the command
  input row, Alt+Shift+D and Escape handling, announcements.
- `src/components/VoiceCommandPreferences.tsx/.css`: fieldset in the Speech tab
  (privacy line, download on-device model, enable, send at once, language).
- `preferencesStore.ts`: `voiceInput { enabled, sendImmediately, language }`.
- `reservedShortcuts.ts`: `VOICE_COMMAND_CHORD`, `isVoiceCommandToggle`, reserved.
- `input.tsx`: renders the button; `handleSend` reads text from the store.
- Tests: voiceInput.test.ts, VoiceCommandButton.test.tsx, reservedShortcuts.test.ts.

## Decisions and why
- Toggle, not hold: holding a chord is unreliable with screen readers (keyup lost
  on focus change, autorepeat) and hard for some players; recognition is
  single-utterance (`continuous = false`) so it stops by itself on a pause.
  Press again = stop early (what was heard still arrives as final). Escape =
  abort and discard (Escape still pauses sounds via App.tsx).
- Alt+Shift+D: Alt+Shift+letter passes through NVDA/JAWS browse mode, no browser
  binds it, matched by `event.code` like Alt+Shift+H. Reserved so key layers
  cannot take it. Listener is document capture, only while the feature is on.
- Transcript goes through `CommandInput.handleSend` (same as Enter), so history
  and `client.sendCommand` are the typed path. `handleSend` now reads the store
  (was the render closure, which would be stale right after setText). Also
  added `owner` to its deps (it used `owner` without listing it).
- Dictation appends to an existing draft; on error/abort/no result the draft
  is restored.
- Review mode (default): final text placed in the input and focused, caret at end.
- On-device preferred: `available({langs, processLocally:true})`; if available,
  `recognition.processLocally = true`. Where the browser can't be asked (Safari,
  older Chrome) or asking throws, availability is "unknown": the text says the
  browser doesn't say and to assume the maker's service, and recognition runs
  without processLocally. "cloud" is only reported when available() says local
  is unavailable and cloud is available.
- Client speech: `speechSynthesis.cancel()` on start so it isn't transcribed.
- LiveKit: untouched. Announce "Listening. Voice chat can hear you." when a
  LiveKit room is held, since both hold the mic.

## Surprises
- Vitest here is 1.6: no `toHaveBeenCalledExactlyOnceWith`.
- `fireEvent.change` on the command textarea does not reach the store in these
  tests; `fireEvent.input` does (existing input tests use input).

- Playwright's Chromium (playwright 1.59.1) exposes unprefixed native
  `SpeechRecognition`. Stubbing only `webkitSpeechRecognition` leaves the native
  one in use (code prefers the unprefixed name); starting it in headless
  Chromium crashed the renderer ("Target crashed") on click and on Alt+Shift+D.
  Stub both names in browser checks. Whether the native start crashes outside
  headless was not tested (no real microphone here).
- `fireEvent.change` on text inputs did not update state in these jsdom tests;
  cause not investigated, `fireEvent.input` works and is what other tests use.

- Command history only records when a personal-data owner exists; a fresh
  guest session in Playwright had none, so neither typed nor voice commands
  recalled with ArrowUp there. The jsdom test covers history with an owner.

## Verification (2026-10-18)
- `npx tsc --noEmit`: exit 0.
- `npx vitest run`: 178 files, 2392 tests passed.
- `npx biome lint <changed files>`: 1 warning, input.tsx:83 useExhaustiveDependencies,
  pre-existing on master (master also had a second one at the old handleSend
  deps, now fixed).
- Playwright Chromium, dev server :5203, both recognizer names stubbed:
  interim lands in input; final stays in input focused; Enter sends it via
  window.mudClient.sendCommand; nothing sent on interim; send-at-once sends
  "north" once at final and clears input; Alt+Shift+D starts, Escape aborts and
  restores the empty draft; "Listening" and "Heard …" reach the announcer.
- Not exercised: a real microphone, real recognition, on-device install,
  Safari, Edge, LiveKit actually connected at the same time.

## Next step
Committed on feat/voice-commands, not pushed. Next: team lead review; then a
real-mic check in Chrome (on-device and cloud) and Safari.
