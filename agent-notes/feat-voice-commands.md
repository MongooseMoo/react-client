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

## Codex round 2 on b8595957: changes requested
Report: scratchpad codex-rereview-voice-commands-report.md; harness
codex-rereview-voice-harness.cjs (run from this worktree). All reproduced.
1. P1 Speech hold unbounded: final without onend, or stop without final/end,
   leaves suspended:true, phase listening, mic press does nothing. Constructor
   throw strands the hold + unhandled rejection. suspendClientSpeech calls
   external cancel() before the caller holds the release (re-entry hazard).
2. P1 Quiet cancel (pref off, disconnect) leaves interim "drop" as plain
   sendable text.
3. P2 Held send ending with no final says only "Stopped listening";
   auto-login cancellation is silent.
4. P2 Preferences Preview Voice speaks during dictation (also the delayed
   voiceschanged path).
Cause: many partial terminal paths; "quiet" conflated silence with text
disposal; release depended on onend.

## Rework for round 2 (tests first; 16 failed + 1 unhandled rejection before)
- `terminate(dictation, ending)` is the only terminal path: invalidates,
  clears the timer and send handle, releases speech, aborts the recognizer,
  then handles text by `ending.text`: final (leave), discard (restore the
  draft if the input is still dictation's; empty it if the player changed),
  keep (foreign edit). Then announces if the ending says to.
- Lifetime: 15 s after listening starts -> requestStop (stop + 2 s grace);
  any stop (press, Enter/Send, limit) gets 2 s for a final or end, then
  terminate(discard, "Nothing was sent. Say it again." if a send was held,
  else "Stopped listening"). Worst case 17 s. A press while stopping, or
  while starting, terminates at once; after a final the dictation is already
  over, so the next press starts a new one.
- Speech released at the final itself (terminate "final" before send).
- startVoiceSession: construction + configuration inside its try.
- suspendClientSpeech no longer cancels; the button stores the release, then
  calls speechSynthesis.cancel(), then rechecks current + identity. A
  session that comes back for a retired dictation is aborted.
- Announcements: identity -> "Dictation stopped: connected / disconnected /
  player changed / new game session"; preference off -> "Dictation stopped";
  unmount silent; held send without final -> "Nothing was sent. Say it again."
- Preview Voice: refuses while suspended at click and again in speakText
  (covers the delayed voiceschanged path); announces why.
- Decision: on an identity change, the draft is restored only when the
  player (owner + visitor) is the same (a connection or game-session change);
  for another player the dictation's text is removed and nothing restored.

## Verification (round 2, 2026-10-18)
- tsc exit 0; vitest 178 files / 2434 tests passed.
- biome on branch-changed src files: 7 warnings, all on master.
- Round-2 harness: every case ends idle/unsuspended; partial after pref off
  or disconnect -> text "" and Enter sends "" (the empty draft), not "drop".
  Its PreviewButton case embeds a literal copy of the OLD PreviewButton
  source (harness lines 45-122), so it still speaks; the real component is
  covered by preferences.test.tsx. Its re-entry case throws "No recognizer
  was created" at line 204 (FakeRecognition.latest() with zero instances):
  the intended outcome; covered by a committed test.
- Round-1 harness: all cases still correct.
- Playwright after login: all earlier checks pass; stalled recognizer (Enter
  during interim, no final, no end) -> after 2.5 s idle, aborted, input "",
  nothing sent, "Nothing was sent. Say it again." announced.

## Codex round 3 on 58889e69: changes requested (all reproduced)
Report: scratchpad codex-rereview3-voice-commands-report.md; harnesses
codex-rereview3-voice-{harness,lifecycle,browser}.cjs.
1. P2 Preference-off cancel ran in a passive useEffect; in Chromium a final
   0-1 ms after unchecking sent "drop all" with enabled=false.
2. P2 15 s deadline reused requestStop, so a grace-period final auto-sent a
   cut-off command. Lead's decision: LISTEN_LIMIT_MS = 60 s; a deadline stop
   never sends (final stays for review, even with send at once); announce
   "Time limit reached. Check the command box, then press Enter." or
   "Time limit reached. Nothing was heard."; state 60 s in help.
3. P3 available() never settling left Starting forever; give Starting a
   10 s timeout: "Speech recognition did not start. Try again."
Cause of 1: the same mistake as round 1's identity bug, authority checked
lazily in a React effect instead of synchronously at the store.

## Rework for round 3 (tests first: 6 failed; interim test rewritten to
## assert inside the act, then confirmed failing on the old component)
- `usePreferences.subscribe(s => s.voiceInput.enabled, ...)` terminates
  (discard, "Dictation stopped") synchronously on true->false; the passive
  enabled effect is gone. Recognizer callbacks' isCurrent() also checks the
  preference and terminates if off; toggle refuses to start when off.
- LISTEN_LIMIT_MS 60000; deadline calls requestStop(d, true) -> d.timeLimit.
  A final with timeLimit is never sent (even send at once or a held Enter):
  placed in the input, focused, "Time limit reached. Check the command box,
  then press Enter." No final -> "Time limit reached. Nothing was heard."
  Help text states the 60 s limit.
- START_LIMIT_MS 10000 timer set when Starting begins, replaced by the
  listen timer: "Speech recognition did not start. Try again." (assertive).
- Test fixes Codex asked for: zero-instance assertion in the re-entry test;
  pending typed send with "inventory" sent exactly once; old "no final
  follows Enter" renamed to its error path.

## Verification (round 3, 2026-10-18)
- tsc exit 0; vitest 178 files / 2441 tests passed; biome 7 warnings, all
  on master.
- Round-3 browser harness (real Chromium, real preferences checkbox):
  final at 0/1/5/20 ms after unchecking -> sends [] in every case.
- Round-3 lifecycle harness: timer cleanup cases all timers []; final after
  disable (same task / microtask / next task) sends nothing. Its "limit at
  15s", "cutoff final" and "unresolved availability after 17s" cases are
  artifacts: line 51 virtualizes only 15000/2000 ms timers, so the 60000
  and 10000 ms timers never fire in its virtual time; covered by fake-timer
  unit tests instead.
- Round-3, round-2, round-1 harnesses otherwise all correct (round-2's
  pasted PreviewButton copy still speaks, as before; round-3's imported one
  does not).
- Playwright after login: all checks pass, including the 2 s stall.

## Codex round 4 on 123a6060 (report: scratchpad codex-rereview4-voice-commands-report.md)
1. P2 Enter held across a time-limit final: first keydown intercepted, final
   left for review, then the autorepeat keydown (repeat:true) sent it.
   Reproduced in Chromium (codex-rereview4-voice-held-enter-browser.cjs).
   Fix (narrow): inputStore `needsFreshEnter`, set only when a time-limit
   final is left for review; input.tsx ignores Enter keydowns with
   e.repeat while it is set; cleared on Enter keyup, by any text change
   (setText with different text), and by clear(). No other repeat
   behaviour changed (guard tests: repeat Enter still sends after an
   ordinary final and after an edit).
2. P3 interim words but no final at the limit said "Nothing was heard".
   Now `heardWords` picks "Time limit reached. No final words came back;
   nothing was sent. Say it again."; "Nothing was heard." only for silence.
   Help text: "Listening stops after 60 seconds; if the browser returns your
   words by then they wait in the command box and are never sent on their own."

## Verification (round 4, 2026-10-18)
- Tests first: 2 failed (held-repeat send, interim-only timeout); 2 guard
  tests passed before and after.
- tsc exit 0; vitest 178 files / 2445 tests passed; biome 7 warnings, all
  on master.
- Codex held-Enter Chromium harness: repeat keydown -> sends [] (its case
  label still names the old behaviour).
- Playwright after login: all checks pass.

## Next step
Committed; not pushed. Fresh Codex review follows (team lead).
