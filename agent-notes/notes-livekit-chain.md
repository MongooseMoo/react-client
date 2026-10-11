# LiveKit voice through the room effect chain — investigation notes

Goal (Q, 2026-10-04): LiveKit voice chat does not go through the room signal path. Decide whether it should, make it specific, and produce a full plan. No code changes yet.

## Verified facts (primary source in parentheses)

- Voice graph: source -> (mono downmix) -> HRTF panner -> outputGain -> `cacophony.globalGainNode` (`src/audio/LiveKitSpatialAudioBridge.ts:67-69`).
- `globalGainNode` IS the master bus input in cacophony 0.33.0 (`node_modules/cacophony/dist/cacophony.mjs:133`, `cacophony.d.ts:190`). So voice gets master volume/mute and a `"master"` overlay chain, never a named chain.
- Named chains are server-named buses; a sound joins one only via `chain`/`send` on `Client.Media.Play`/`Update` (`src/audio/MediaService.ts:898-1001`). Client has no "current room chain" concept.
- `Comm.LiveKit.room_token`/`room_leave` carry only `{token}`; decode is an unchecked cast (`src/gmcp/Comm/LiveKit.ts`, `src/gmcp/messages.ts`). `liveKitStore.tokens` is `string[]`; `addToken` ignores a token already held.
- There is no `client.livekit`. Pieces: `GMCPCommLiveKit`, `useLiveKitStore`, `LiveKitSpatialAudioBridge`, `components/audioChat.tsx` (one `<LiveKitRoom>` per token, one bridge per room).
- `Bus.destroy({drainTo})` moves only registered `BusRoutedSource`s (`bus.d.ts:200-238`). A raw AudioNode connected to a named bus input would go silent on chain destroy.
- `MediaEffects.applyChain`: redefining an existing chain calls `existing.replace` (same bus kept); only empty effects / `ChainStop` / `shutdown` destroy the bus (`src/audio/effects/MediaEffects.ts:119-180`).
- `MediaService.reset()` calls `effects.shutdown()` → every chain destroyed (`MediaService.ts:862-868`).
- cacophony `MediaStreamSound extends RoutableSource`: has `routeTo(bus|name, sendGain?)`, `_onBusDrained`, live rewiring, built-in muted-element priming (`mediaStream.d.ts`, `routableSource.d.ts`). Playback has `position`, `threeDOptions`, `panner` (`basePlayback.d.ts`).
- `notes/media-centralization-2026-06-07.md:58`: next slice is making `client.media.cacophony` private with narrower methods for LiveKit.
- Existing bridge test asserts exact node wiring incl. downmix, panner options, snap-then-ramp position, priming element (`LiveKitSpatialAudioBridge.test.ts`).

## Verified, second pass (cacophony 0.33.0 dist/*.mjs)

- `MediaStreamSound.preplay()` graph: source -> panner (`context.createPanner()`, then sound-level `threeDOptions` + `position` applied) -> gain -> `_resolveRouteTargetNode()`. No explicit mono downmix node.
- `routeTo` rewires LIVE playbacks: `_setPrimary` disconnects/reconnects each playback's output; `_addSend` creates or re-gains a per-playback send gain. Sends cannot be removed, only re-gained (0 silences).
- `routeTo('name')` throws `No bus registered with name '…'`; routing to a destroyed bus throws.
- `_onBusDrained` moves both a primary route and a send to the drain target, so `ChainStop` leaves voice audible on master.
- `stopTracksOnStop` defaults to TRUE — must pass `false` (LiveKit owns the track; existing test asserts the track is not stopped).
- Priming element is built in (`primeWithMediaElement` default true), played on `play()`, torn down on stop/cleanup.
- `position` setter on playback/panner snaps (`.value =`). Ramping needs `playback.panner.positionX` + `smoothParamTo`, as today.
- `MediaService.stopAllSounds()` only touches `this.sounds`; a voice sound not registered there survives `Client.Media.Stop`.
- `MediaService.reset()` is called from `GMCPClientMedia.reset()` (`src/gmcp/Client/Media.ts:376`) on `gmcp.reset()`; `GMCPCommLiveKit.reset()` clears tokens on the same event.
- Server side: `C:\Users\Q\code\MOO_code` working tree is empty; no LiveKit source found locally. `docs/GMCP/packages/char-room-comm.md` has no LiveKit section. LiveKit-room <-> MOO-room mapping is NOT determinable from this machine's checkouts.

## 2026-10-04 evening — Q: "go", one PR, and get an in-MOO agent to do the MOO side (hub: `c:\users\q\projects\mongoose`)

- Worktree `C:/Users/Q/code/react-client-livekit-chain`, branch `feat/livekit-room-chain` off origin/master `664f3dcd` (local master was 11 behind). `npm ci` running in background.
- origin/master is on cacophony **0.34.0** (PR 158): `removeSend` exists; `clearNamedRoute` uses it. My 0.33.0 reading of "sends cannot be removed" is stale. RE-VERIFY cacophony facts against 0.34 in the worktree's node_modules before coding.
- Hub facts (read, `notes-room-reverb-routing.md`, `sounds-todo/in-moo/next-2026-10-03.md`):
  - Room reverb = ONE named chain `"room"` per listener (FDN, mix 1). Every Play gets `chain:"room"` + `send`. `#2700:156 acoustics` returns chain+send (indoor send 0.2..0.8); `#2585:83 ensure_room_chain` (re)defines it; `#2200:10 listen` defines the chain first on room entry.
  - So the MOO side is: put `chain: "room"`, `send: <acoustics send>` on `Comm.LiveKit.room_token`, re-sent when the listener's room changes.
  - Chain redefinition on room change is `existing.replace` on the client (same bus), so a voice send stays connected; only the send level needs the re-sent token.
- MOO LiveKit code (db snapshot `db/mongoose.db.new.2026-10-04T2312`, text grep): a verb does `gmcp_livekit = $gmcp_registry:match_package("Comm.LiveKit")` … `$livekit:try_remove_participant(this, player)` … `if (player.audio_active && valid(gmcp_livekit)) gmcp_livekit:send_room_token(player, this);` (db lines 919-931) — looks like a room-enter hook, i.e. token is sent per MOO room. Object/verb numbers NOT yet identified. `$livekit` = #4252.
- In-MOO agents: `ops/moo-agent launch <backend> [model] -f FILE` (ssh to mongoose@mongoose.world, logs in as Claude #13505). Handoffs live in `sounds-todo/in-moo/NN-*.md`, standalone, with ground rules + report format (`sounds-todo/working-agreement.md`). No push/merge/deploy authority for agents.
- CONFLICT RISK: another session dispatched `codex24` (handoff 21, surfaces + acoustics) ~00:00 UTC 10-05; it edits `#2700:acoustics`. `claude5` modified `$livekit` #4252 at 23:08 UTC 10-04. Rule: one writer per shared verb. Run `ops/moo-agent list` before dispatching; my handoff must only READ `#2700:acoustics`.

## MOO side, verified in checkpoint 2026-10-04T2312 (via `uv run moodb`)

- `$gmcp_livekit` = #4495, verbs `send_room_token` [0] and `send_room_left` [1] (the latter sends wire name `room_leave`, matching the client). Parent #1695 generic GMCP package.
- `#4495:send_room_token(who, room_name)` mints a token for `tostr(room_name)` and sends `["token" -> token]`. Callers: `#2700:confunc:24` (passes the room), `#4578:add` (`$voice_call`, passes `this.room_id`), reached from `#2700:enterfunc` and `#410:@voice join`.
- LiveKit room == MOO room id (1:1). Entering a room with `audio_active` sends a FRESH token for that room; `exitfunc` sends `room_leave`. So chain/send can ride on each token; no separate update message is needed for room changes.
- Room reverb: `#2700:acoustics` → `["chain" -> def(id "room"), "send" -> wet]`; `$sh:ensure_room_chain(listener, room)` #2585:83; `$sh:project` #2585:72 sets `chain "room"` + send on Plays; `$mcmp:play` #1811:0 filters per listener with `filter_media_effects(base, caps, chains)` (`media_state(x)` → `{caps, chains}`).
- Client `send` validation range is 0..1 (`mediaPayloads.ts:295`).
- Running agents at ~00:10 UTC 10-05 (`ops/moo-agent list`): `codex24` (pid 733087, editing #2700:acoustics / $surfaces #72006 / #10576 for handoff 21) and `claude5` (pid 710784; modified `$livekit` #4252 `confirmed_by_api` at 23:08 UTC; current task unknown).
- Handoff WRITTEN: `c:\users\q\projects\mongoose\sounds-todo\in-moo\22-voice-room-reverb.md`. Scope: edit only `#4495:send_room_token` + tests; read-only on everything else. NOT YET DISPATCHED.

## Dispatched + client design (00:20 UTC 10-05)

- Handoff 22 DISPATCHED: `codex25`, pid 736955, prompt 5235 b, first attempt. Check with `ops/moo-agent transcript codex25 40` (from `c:\users\q\projects\mongoose`). Detect finish by its `say` report.
- Verified in cacophony 0.34.0 dist: `_onBusDrained` moves an aux SEND onto the drain target (master), i.e. after ChainStop a source with a send plays dry + send-level dry. So voices must leave a chain BEFORE it is destroyed (hook), not rely on drain. (Same thing happens to ordinary sounds with sends on ChainStop today — existing behaviour, not touched; tell Q.)
- Sound-level `threeDOptions` setter only copies known keys; `position` setter validates; `preplay` applies both to the playback.
- Client design being written in the worktree:
  - NEW `src/audio/namedRoute.ts`: `NamedRouteState`, `clearNamedRoute`, `routeNamedChain` (moved out of MediaService so sounds and voices share them). WRITTEN.
  - NEW `src/audio/MediaVoices.ts`: `attach(track, position)` → `{setPosition, setRoute, detach}` on `createMediaStreamSound(..., {panType:'HRTF', stopTracksOnStop:false})`; `chainCreated(id)` / `chainDestroying(id)`. WRITTEN.
  - `MediaEffects`: optional `ChainObserver` ctor arg; call `chainCreated` after `chains.set`, `chainDestroying` at the top of `destroyChain`. TODO (edits failed: worktree files need a Read first).
  - `MediaService`: use namedRoute helpers in `routeNamedChain`/`clearNamedRoute`; `ExtendedSound` extends `NamedRouteState`; `attachVoice`. TODO.
  - Bridge → participant map over `media.attachVoice`, plus `setRoute`. TODO.
  - `Comm/LiveKit.ts` validated decoder `{token, chain?, send?}` (send needs chain; 0..1); store `rooms: {token, chain?, send?}[]` with `setRoom` upsert; `audioChat.tsx`, `AudioChatBoundary.tsx`. TODO.
  - Tests: namedRoute via existing Media tests, MediaVoices.test, MediaEffects observer, bridge test rewrite, store, LiveKit decoder, createConfiguredClient.test line 305, AudioChatBoundary.test. TODO.
  - Docs: `docs/GMCP/packages/char-room-comm.md`, `mongoose-additions.md`, legacy inventory wording. TODO.

- 00:35 UTC: DONE in worktree (untested, not typechecked): `namedRoute.ts`, `MediaVoices.ts`, `MediaEffects` observer (4 edits), `MediaService` (imports, `ExtendedSound extends Sound, NamedRouteState`, `voices` field + ctor wiring, `attachVoice`, `routeNamedChain`/`clearNamedRoute` now call the helpers). STILL TODO: bridge, `Comm/LiveKit.ts`, store, audioChat, AudioChatBoundary, all tests, docs, typecheck, vitest.

- 00:50 UTC: implementation complete in worktree and `npx tsc --noEmit` is clean (tsconfig seems to skip tests): bridge rewritten over `media.attachVoice`; `Comm/LiveKit.ts` has `decodeRoomToken`; store is `rooms` / `setRoom` / `removeToken`; `audioChat.tsx` passes chain/send to the bridge; `AudioChatBoundary` uses `rooms`. Tests: `MediaVoices.test.ts` WRITTEN (not run). STILL TO WRITE: bridge test (full rewrite), store test (rewrite), `LiveKit.test.ts` (tokens→rooms + decoder cases), `AudioChatBoundary.test.tsx` (addToken→setRoom), `createConfiguredClient.test.ts:305` (.tokens→.rooms), MediaEffects observer tests. Then vitest, docs, commit, PR.

- 01:03 UTC (18:02 local): all tests written. Worktree: `npx tsc --noEmit` exit 0; `npx vitest run` → 128 files, 1429 tests passed. New test files: `MediaVoices.test.ts` (8), `MediaService.voices.test.ts` (3); rewritten: bridge test (6), store test (6); extended: `LiveKit.test.ts` (15), `MediaEffects.test.ts` (+2 observer). NOT YET DONE: mutation check that the "leave before destroy" test fails without the hook; docs; biome lint; commit; push; PR; check on codex25.

- 01:10 UTC: mutation check DONE (removing `observer.chainDestroying` call → 3 tests red; restored; green). Docs written (`char-room-comm.md` new `Comm.LiveKit` section, `mongoose-additions.md`). All 19 files staged (`git add -A` in worktree), NOT committed. biome: 9 `noNonNullAssertion` warnings in `MediaEffects.test.ts`, 7 pre-existing + 2 mine in the same style; no errors. REMAINING: read cacophony `_validateSpatialOptions` (mocks cannot catch a runtime throw from my `threeDOptions`); real-browser check with a synthetic MediaStream if feasible; `vite build`; commit; push; PR; check codex25.

- 01:20 UTC: cacophony 0.34 has its own spatial smoothing (`spatialSmoothingTau`; pose set before play is immediate, later writes ramp; `SpatialAutomation` tracks targets). Writing panner params directly would fight that bookkeeping, so `MediaVoices` now sets `sound.spatialSmoothingTau = SPATIAL_PARAM_TAU_S` before `play()` and moves with `sound.position = next`; the `snap` option is gone. Validator read: my `threeDOptions` values are within its ranges (channelCount 1..2). Tests updated. NEXT: re-run tests, try a real-browser wiring check (vite dev on a spare port + synthetic MediaStream), `vite build`, commit, push, PR, check codex25.

- 01:30 UTC: COMMITTED `18be6e7b` on `feat/livekit-room-chain` (precommit typecheck + biome ran; 9 warnings, no errors). `vite build` exit 0. Full vitest earlier: 128 files / 1429 passed (before the smoothing change; affected dirs re-run after: 24 files / 277 passed).
- REAL-ENGINE CHECK (Chrome, vite dev :5199 from the worktree, real cacophony 0.34, AudioContext SUSPENDED so this is graph wiring, NOT audible proof): synthetic oscillator MediaStream track → `attachVoice` → panner HRTF, channelCount 1 explicit, inverse, rolloff 1, x=1, tau 0.03, 1 playback. `setRoute({chain:'room',send:0.4})` before chain: unrouted, wants room, 0 sends. After `setChain(room fdn)`: bus exists with 1 filter, routed, 1 send at gain 0.4. `removeChain`: unrouted, still wants room, 0 sends, NO send on master. Redefine: routed again. Primary route: routeTarget "room". `reset()`: routeTarget null, playback kept. `detach()`: 0 playbacks, track still "live".
- Dev server task `bxr4i20ad` still running: STOP IT. Then push, PR, check codex25.

- 01:40 UTC: branch PUSHED (`origin/feat/livekit-room-chain`), PR not yet opened. Dev server stopped, Chrome tab closed.
- codex25 REPORTED DONE and quit (its report, NOT all verified): only `#4495:send_room_token` changed; fixture `#72302` (child of #4495, owner Claude #13505) with before-image and `;return #72302:restore();`; its 8 cases PASS; #11202 55/55; #12462 2/2; captured payload `{"token":"<redacted>","chain":"room","send":0.285866666666667}`.
- VERIFIED BY ME live (`ops/moo-agent moo '@list #4495:send_room_token'`, last modified 23:55:22 UTC by codex25): lines 11-22 build `payload`, resolve `room`, and when `token && is_player(who) && valid(room) && isa(room,$room)`: `$sh:ensure_room_chain`, `acoustics = room:acoustics()`, bare `acoustics["chain"];`, set chain "room" + send, then `payload = $mcmp:filter_media_effects(payload, caps, chains)`; then `this:send(who, "room_token", payload)`.
- DEFECT I see in it: if `ensure_room_chain` / `acoustics` / `filter_media_effects` raises, the token is never sent, so a reverb failure blocks joining voice (callers only log "WebRTC Relay failure"). Needs a follow-up: decoration failure must still send the bare token. Not fixed yet.
- ALARM, unexplained: the same live query returned `$mcmp == #11203` (the fixture spy), not #1811, a few minutes AFTER codex25 logged its own check showing #1811. `$livekit` was #4252 (correct). Could be codex24 mid-test-run (tests swap `$mcmp` inside try/finally) — NOT established. Re-check blocked: `moo-agent` now fails with "the account's default character is already connected" (Claude #13505 in use by someone else). MUST re-check and tell Q.
- Added decoder test for the captured MOO payload (uncommitted).

- CORRECTION: the "UTC" clock times in my earlier entries were estimates and are wrong. Real times (server `date -u`): codex25 launched ~23:50 UTC 10-04, edited the verb 23:55:22, quit 23:58:12. Local 18:07 = 00:07 UTC 10-05.
- PR OPENED: https://github.com/MongooseMoo/react-client/pull/161 (commits `18be6e7b`, `3a485484` = captured-payload decoder test). CI not yet checked.
- `$mcmp` alarm RESOLVED: at 00:03 another session was logged in as Claude running `electric-mud-send --until '=> {"SUITES"…'` (a suite run; tests swap `$mcmp`). Re-read at 00:11:06 UTC: `{$mcmp, $livekit, $test_runner.running_task}` = `{#1811, #4252, 0}`. codex24 quit 23:49, codex25 quit 23:58; no agent bridges were running at 00:07.
- Follow-up handoff WRITTEN: `sounds-todo/in-moo/22b-voice-room-reverb-followup.md` (decoration failure must still send the bare token; explicit key check instead of bare `acoustics["chain"];`; one new test in `#72302`). NOT YET DISPATCHED.

- 00:15 UTC 10-05: handoff 22b DISPATCHED → `codex26`, pid 743674, prompt 3143 b. PR 161 CI: "Tests and production build" PASS (2m12s), Deploy skipped. WAITING on codex26's `say` report; then verify live: `@list #4495:send_room_token`, `{$mcmp,$livekit,$test_runner.running_task}`, confirm no agent left. Then final report to Q: merge PR 161 when Q has done a two-person listening check (or accepts without); MOO side already live.

- 00:18 UTC 10-05: codex26 DONE and quit. VERIFIED LIVE by me: `#4495:send_room_token` lines 13-28 now wrap the decoration in `try … except e (ANY)` → `payload = ["token" -> token]; $logger:exception(e, "Voice room reverb failed")`, with an explicit MAP/"chain"/"send" check; success path unchanged. Globals `{$mcmp,$livekit,$logger,$test_runner.running_task}` = `{#1811,#4252,#2478,0}`. `ops/moo-agent list`: no agents running. Fixture `#72302` has verbs `restore` (pre-22 original), `restore_handoff22`, `test_token_contract`, `test_reverb_failure`. Agent-reported, not re-run by me: #11202 55/55, #12462 2/2, #72302 both tests pass.
- STATE: client PR 161 open, CI green, not merged. MOO side live. Nobody has listened to a real call. Worktree `react-client-livekit-chain` + branch to remove after merge.
- Found, not fixed (tell Q): (1) on ChainStop an ordinary sound's aux send is moved onto master by cacophony's drain (dry + send-level dry until the sound ends); (2) the MOO sends `token: ""` for a non-player and the client would still add a room for it.

## Next steps (updated)

1. Dispatch handoff 22 with `ops/moo-agent launch` (record agent name + pid here).
2. Client work in the worktree (see below), then PR.
3. When the agent reports: checkpoint, pull snapshot, read `#4495:send_room_token` myself, check its captured payload against the client decoder test.

## Earlier next steps

1. Identify the MOO objects/verbs: the Comm.LiveKit GMCP package object, `send_room_token`, its callers (use `uv run moodb` from `C:/Users/Q/src/lambdamoo-db-py`, `MOODB` env).
2. Check running agents; write handoff `sounds-todo/in-moo/22-voice-room-reverb.md`; dispatch when no writer conflict.
3. Client: tests first, then MediaService.attachVoice + route reconcile, bridge, store, decoder, audioChat, docs. Run vitest + typecheck. One PR.

## Not verified

- That a PannerNode with `channelCount: 1, channelCountMode: "explicit"` downmixes a stereo WebRTC track identically to the bridge's splitter (spec says 0.5*(L+R); not listened to).

## Still to check (done unless noted)

- cacophony implementation (mjs): does MediaStreamSound downmix to mono? panner channelCount? does `position` setter snap or ramp? does routeTo rewire a live playback? what does routeTo throw on unknown name?
- Server side: does a LiveKit room map 1:1 to a MOO room? (look in `C:\Users\Q\code\MOO_code`, `MongooseClient`, `QMoo`)
- How Client.Media payload decoders validate (`src/audio/mediaPayloads.ts`) — reuse for room_token.
- GMCP docs to update: `docs/GMCP/mongoose-additions.md`, `package-inventory.md`, any `packages/` page for Comm.LiveKit.

## Blocker

None yet.
