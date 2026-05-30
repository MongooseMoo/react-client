# Investigation: Whole-app memory growth

## Facts (verified)
- `react-client` current branch is `master`; `../cacophony` current branch is `feat/buses-and-effects`.
- `react-client/src/client.ts` constructs one `Cacophony` instance per `MudClient`.
- `react-client/src/gmcp/Client/Media.ts` stores loaded/played media in `GMCPClientMedia.sounds`.
- `react-client/src/components/audioChat.tsx` routes LiveKit remote audio tracks through `LiveKitSpatialAudioBridge`.
- `../cacophony/src/mediaStream.ts` creates `MediaStreamAudioSourceNode` playback objects for `MediaStreamSound`.
- `../cacophony/src/sound.ts` creates a new `Playback` and pushes it into `Sound.playbacks` on every `Sound.play()`.

## Theories (plausible)
1. Finished audio playbacks remain retained in `Sound.playbacks`, growing with every sound play.
2. `GMCPClientMedia.sounds` retains every distinct media key and its decoded buffer or HTML media element indefinitely.
3. Client construction installs global listeners and subscriptions without corresponding shutdown removal, retaining old clients after reconnects/remounts.
4. WASM host/local mode leaves workers, worker listeners, or autosave intervals alive after unmount.
5. LiveKit token/session rendering accumulates rooms or media streams due to unstable keys or append-only token state.

## Tests Run

| Test | Hypothesis | Result | Rules Out | Supports |
|------|------------|--------|-----------|----------|

## Current Best Theory
Open.

## Open Questions
- Does `Playback.cleanup()` remove itself from `Sound.playbacks`?
- Does `MudClient.shutdown()` remove constructor-level window listeners and preference subscriptions?
- Does the media GMCP package ever prune non-looping sounds after natural playback end?

## Next Action
Read lifecycle code around playback cleanup, media stop/update handlers, client shutdown, worker teardown, and event subscriptions.
