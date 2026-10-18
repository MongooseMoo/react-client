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

## Codex review of 7062014b (2026-10-18): changes requested
Report and harness in the session scratchpad
(codex-review-voice-commands-report.md, codex-voice-review-harness.cjs; run
the harness with node from this worktree). All of 1-5 and 7 reproduced
against 7062014b.
1. P1 Interim text sendable via Enter/Send (two commands for one utterance).
2. P1 Pending start (available() unresolved) not cancellable by Escape,
   preference-off, second toggle; recognizer starts even with enabled:false.
3. P1 install() completion for en-US overwrote fr-FR availability: false
   "on this device" text while session ran without processLocally.
4. P1 Session survived disconnect + owner change: sent "page Alice hello" as
   owner B and saved it in B's history.
5. P2 Interim/final/restore overwrote text the player typed during dictation.
6. P2 (inferred) client speech producers can speak during dictation.
7. P3 start() throwing -> onEnd read `session` before init (ReferenceError).
Cause: provisional text lived in the committed command store, and a session
had no identity/cancellation token; tests used synchronous fakes only.

## Rework for the review (tests written first; 22 failed before the fix)
- VoiceCommandButton: one `Dictation` object per press, held in `currentRef`;
  every callback checks it is still current. Phases idle/starting/listening
  (button `data-phase`, `aria-pressed` true while starting or listening).
  `cancel(dictation, "player" | "edit" | "quiet")` retires and aborts.
  After the availability await: recheck current, enabled, identity.
- inputStore `dictation: DictationHandle | null`; `handleSend` asks
  `interceptSend()` first. Starting: drop the start, send typed text.
  Listening: `session.stop()`, `sendOnFinal = true`, consume the send; the
  final result is then sent (review or send-at-once). Handle cleared at final.
- Session owns only `written` (the text it last set). An inputStore
  subscription cancels ("edit", keeps text) on any other change: typing,
  history recall, page/keystroke setText, personal-data clear. Restore of the
  draft happens only if the text is still `written`.
- Identity = [ownerKey, visitor, gameSessionId, connected], captured at press;
  personalData/connection store subscriptions cancel quietly on change.
- `src/clientSpeechSuspension.ts`: refcounted hold; `client.speak` (autoread
  and channel speech) and `Client.Speech.Speak` drop speech while held. Held
  from listen until end/error/abort/unmount. Preference preview not gated.
- Preferences: availability stored with its language plus a request counter;
  language field disabled during install; after install, recheck the language
  chosen now.

- Preference help now says Enter stops listening, typing stops it, the client
  does not speak while listening, and (send at once) use headphones because
  screen-reader speech from speakers can be heard and sent.

## Surprises (rework)
- In Playwright, a dictation started right after page load was cancelled at
  ~1.2s: it began while "Not connected" and auto-login connected. That is the
  identity binding working (cancel-probe.mjs in scratchpad: click at 0ms ->
  aborted; click at 5000ms -> stays listening). The browser check now waits
  for the status bar to show the login before dictating.
- `TaskStop` on the backgrounded `npx vite` left the vite node process
  running on :5203; it had to be killed by PID.
- These Playwright runs sent "look at fountain", "inventory", "drop all",
  "north" to the live MOO as an auto-logged-in guest.

## Verification (rework, 2026-10-18)
- tsc exit 0; vitest 178 files / 2415 tests passed.
- biome on all branch-changed src files + clientSpeechSuspension.ts:
  7 warnings, all pre-existing on master (6 noUnusedImports in
  client.test.ts:169-174, input.tsx:83).
- Codex harness: interim Enter -> sends ["drop all"] only; typing keeps
  "inventory"; no recognizer after Escape / pref off / second toggle during a
  pending start; disconnect aborts, no send, no history for owner B; start
  throws -> no rejection; fr-FR text stays the cloud text after the en-US
  install completes.
- Playwright (after login): review mode, Enter sends; history recall works;
  Escape restores; Enter during interim sends nothing then ["drop all"];
  typing "x" during dictation aborts and keeps "lookx"; send at once sends
  ["north"] only at final.

## Next step
Committed; not pushed. Fresh Codex review follows (team lead).
