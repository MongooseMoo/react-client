# Investigation: Whole-app memory growth

## Facts (verified)
- `react-client` current branch is `master`; `../cacophony` current branch is `feat/buses-and-effects`.
- `react-client/src/client.ts` constructs one `Cacophony` instance per `MudClient`.
- `react-client/src/gmcp/Client/Media.ts` stores loaded/played media in `GMCPClientMedia.sounds`.
- `react-client/src/components/audioChat.tsx` routes LiveKit remote audio tracks through `LiveKitSpatialAudioBridge`.
- `../cacophony/src/mediaStream.ts` creates `MediaStreamAudioSourceNode` playback objects for `MediaStreamSound`.
- `../cacophony/src/sound.ts` creates a new `Playback` and pushes it into `Sound.playbacks` on every `Sound.play()`.
- `react-client/package-lock.json` installs `cacophony@0.21.0`; sibling `../cacophony/package.json` is `0.22.0`.
- `react-client/src/App.tsx` mounts `useChannelHistory(client)` at app level whenever a client exists.
- `react-client/src/hooks/useChannelHistory.tsx` keeps up to 100000 messages per buffer, stores an `all` buffer plus per-channel buffers, and serializes all buffers to localStorage on every state change.
- `react-client/src/components/output.tsx` currently caps the main output window at 3000 retained lines.
- `react-client` initial commit `d2b4e26` was the stock React template; `client.ts` and output were introduced later in commit `02aa264`.
- In `02aa264`, `src/components/output.tsx` appended every message to React state with no cap.
- In `38c971a`, the first `Client.Media` implementation retained every `Howl` in `GMCPClientMedia.sounds`.
- In `e905eba`, the first Cacophony-backed `Client.Media` module kept the same retained `sounds` map pattern, including a `handleLoad` key built from `data.url + data.name`.
- Current `react-client/src/gmcp/Client/Media.ts` still uses `const key = data.url + data.name` in `handleLoad`, while `handlePlay` defaults keys to the resolved media URL.
- Current `react-client/src/gmcp/Client/Media.ts` deletes sounds on explicit stop, all-stop, replacement, priority cleanup, or `end` timer; it does not prune ordinary non-looping sounds after natural end.
- Current `../cacophony/src/cache.ts` keeps decoded audio in a static LRU of 100 entries by count, not by decoded byte size.
- Current `react-client` never calls `client.cacophony.clearMemoryCache()` or `AudioCache.clearMemoryCache()`.
- Current `../cacophony/src/playback.ts` removes a playback from `origin.playbacks` on natural final end through `removeFromOrigin()`.
- `react-client/src/client.ts` installs anonymous window `focus` and `blur` listeners in the `MudClient` constructor and ignores the unsubscribe returned by `preferencesStore.subscribe`.
- `react-client/src/client.ts` `shutdown()` shuts down packages/managers but does not remove those constructor listeners, unsubscribe preferences, close the websocket/local stream, or close/suspend the Cacophony audio context.
- `react-client/src/FileTransferManager.ts` starts an interval and clears it in `cleanup()`, but the listeners registered with `.bind(this)` in `setupListeners()` are not removed.
- `react-client/src/WasmHost.tsx` starts a Worker and an autosave interval; cleanup only clears the interval, not worker listeners, the worker, peer service, or multi-user manager.

## Theories (plausible)
1. Finished audio playbacks remain retained in `Sound.playbacks`, growing with every sound play.
2. `GMCPClientMedia.sounds` retains every distinct media key and its decoded buffer or HTML media element indefinitely.
3. Client construction installs global listeners and subscriptions without corresponding shutdown removal, retaining old clients after reconnects/remounts.
4. WASM host/local mode leaves workers, worker listeners, or autosave intervals alive after unmount.
5. LiveKit token/session rendering accumulates rooms or media streams due to unstable keys or append-only token state.

## Tests Run

| Test | Hypothesis | Result | Rules Out | Supports |
|------|------------|--------|-----------|----------|
| Read current `../cacophony/src/playback.ts` final end path | Finished playbacks remain forever | Natural final end calls `stop()` and `removeFromOrigin()` | Natural-end-only playback retention in current `../cacophony` | Cleanup/stop edge cases still need caller cleanup |
| Read current and historical `GMCPClientMedia` | Media objects are retained | Current and historical code retain sounds in `sounds`; current code only deletes on explicit stop/replacement/priority/end | Sound map being a recent regression | Media retention as old/core bug |
| Read output and channel history | Text output retention | Main output is now capped at 3000; channel history is always mounted and capped at 100000 per buffer | Main output current unbounded growth | Channel history/current localStorage growth |
| Read client shutdown and constructor | Old clients retained | Constructor adds anonymous global listeners and preference subscription; shutdown does not remove them | Clean client teardown | Retained client graph on remount/HMR/mode lifecycle |
| Read WASM host/worker code | Worker leak in local/host mode | Worker and managers have no teardown; only autosave interval is cleared | Complete WASM cleanup | WASM mode leak |
| Inspect dependency identity | Running app uses sibling checkout | Lockfile installs `cacophony@0.21.0`; sibling is `0.22.0` | Sibling checkout is definitely what current app runs | Need fix package and app coherently |

## Current Best Theory
The app has multiple retained roots. The highest-confidence memory growth bugs are:
1. `Client.Media` retains every distinct sound key and decoded buffer/media element until an explicit stop/replacement/all-stop path runs.
2. Cacophony's decoded audio cache is item-count bounded, not byte bounded, and the app never clears it.
3. Channel history keeps very large duplicated message buffers and serializes them on each change.
4. `MudClient` and WASM-mode lifecycle cleanup is incomplete, so old client/worker/audio graphs can remain rooted.

## Open Questions
- How many distinct media URLs/keys does the live server send during a long memory-growth session?
- Is the reported 2+ GB session default telnet mode, local WASM mode, host mode, or LiveKit audio mode?
- Does the deployed app use the locked `cacophony@0.21.0` behavior, or a locally linked sibling checkout?

## Next Action
Fix the retained roots in priority order: media sound lifecycle/cache policy, channel-history bounds/persistence strategy, client shutdown, then WASM/PeerJS teardown.
