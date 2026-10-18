# c8 — Harden server-initiated TTS (Client.Speech)

## Summary
`GMCPClientSpeech.handleSpeak` piped server-supplied text straight into
`speechSynthesis.speak(...)` with rate/pitch/volume taken from the payload
unclamped, no length cap, and no way to cancel on teardown. Hardened all three,
plus an availability guard. No new preference invented.

## Files changed
- `src/gmcp/Client/Speech.ts` — clamp, length cap, shutdown cancel, availability guard.
- `src/gmcp/Client/Speech.test.ts` — new test file (7 tests).

## Clamp ranges + fallback
Server params are resolved by `resolveParam(serverValue, fallback, range)`:
use the server value only when it is a finite number, otherwise fall back to the
user's `preferencesStore.speech` value, then clamp into the valid Web Speech range.

| param  | range        | fallback (when omitted / non-finite) |
|--------|--------------|--------------------------------------|
| rate   | [0.1, 10]    | `preferencesStore.speech.rate`       |
| pitch  | [0, 2]       | `preferencesStore.speech.pitch`      |
| volume | [0, 1]       | `preferencesStore.speech.volume`     |

The fallback source matches `MudClient.speak` (src/client.ts:406), which reads
the same three prefs. Because the default GMCP JSON codec casts the raw payload
(it never instantiates `GMCPMessageClientSpeechSpeak`), an omitted field is
genuinely `undefined` at runtime, so `Number.isFinite` correctly detects omission
as well as `NaN`/`Infinity`. A server value can never escape the bounds because
the clamp is applied unconditionally after resolution.

## Length cap
`export const MAX_SPEECH_LENGTH = 1000;` — server text is truncated with
`(data.text ?? "").slice(0, MAX_SPEECH_LENGTH)` before constructing the utterance,
so a server cannot queue a multi-minute utterance.

## Shutdown hook
Used the existing lifecycle hook: `GMCPPackage.shutdown()` (src/gmcp/package.ts:56)
is a real teardown point — `GmcpSession.shutdown()` (src/gmcp/session.ts:120-124)
iterates every package handler and calls `shutdown()`, and that chains up through
`MudClient.shutdown()` (src/client.ts:370). `Media.ts:285` already overrides it, so
I followed the same pattern: `override shutdown()` calls `speechSynthesis.cancel()`
to stop pending/looping server speech. No new lifecycle was invented.

## Availability guard
Both `handleSpeak` and `shutdown` early-return when `!("speechSynthesis" in window)`,
matching `MudClient.speak` (src/client.ts:400). This was required: without it the new
`shutdown` override threw `ReferenceError: speechSynthesis is not defined` in
`createConfiguredClient.test.ts`, whose environment has no `speechSynthesis`. The
original base `shutdown()` was a no-op, so the guard preserves that safety.

## Preference gate — NOT added (follow-up for the user)
The `preferencesStore.speech` slice has `autoreadMode`, `voice`, `rate`, `pitch`,
`volume`. None of these governs whether *server-initiated* `Client.Speech.Speak`
is allowed — `autoreadMode` controls auto-reading of local channel/output, not
inbound Speak requests. Per the directive I did NOT invent a new preference.

FOLLOW-UP: consider a `speech.allowServerSpeech` (or similar) preference so users
can disable server-initiated TTS entirely; `handleSpeak` would early-return when
disabled. This is a product/UI decision left to the user.

## Tests (TDD — written failing first, 7 total)
- clamps params above the ranges → 10 / 2 / 1
- clamps params below the ranges → 0.1 / 0 / 0
- omitted params fall back to preference values (1.5 / 1.2 / 0.7)
- non-finite (`NaN`/`Infinity`) server values fall back to preferences
- text longer than the cap truncated to `MAX_SPEECH_LENGTH`
- short text left untouched
- `shutdown()` calls `speechSynthesis.cancel()`

`speechSynthesis` and `SpeechSynthesisUtterance` mocked via `vi.stubGlobal`.

## Results
- `npx vitest run` (full suite): 976 passed, 0 failed (97 files).
- `npm run precommit` (typecheck + biome lint:staged on the 2 staged files): exit 0.
- No biome unblock rule needed.
