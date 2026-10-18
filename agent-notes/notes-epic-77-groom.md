# Grooming epic #77 (concurrency-sensitive paths not serialized)

Epic has no formal sub-issues; body links #56, #62, #53, #73. All four CLOSED (2026-07-30).

## Verified in current master code
- #56 fixed: `FileTransferStore.saveChunk` (src/FileTransferStore.ts:54-76) uses one readwrite tx over chunks+metadata, no in-place mutation.
- #62 fixed: `isNewChunk` guard at src/FileTransferManager.ts:523-527; test exists (FileTransferManager.test.ts:412).
- #53 fixed: `flushPromise = flushPromise.catch(() => {})` (AutoLogService.ts:149); endSession clears currentSession in finally (:161).
- #73 fixed: createPeerConnection closes existing pc/channel first (WebRTCService.ts:17-19).
- saveFileMetadata opens its tx synchronously when db exists -> ordered before later saveChunk; no metadata race.

## Open suspicion (epic's own "process serially per transfer" not done)
- handleDataChannelMessage does `void this.handleIncomingChunk(data)` (FileTransferManager.ts:67-69): no per-transfer queue.
- Completion check (:546) runs after `await saveChunk`; two back-to-back final chunks could both pass it -> double hash/download/fileReceiveComplete.
- CONFIRMED by scratch vitest (mocked store, storeInitialized=true): emitting chunk 0 and chunk 1 back to back
  -> completions=2, downloads=['f.txt','f.txt']. Scratch test deleted afterwards.

## Wider sweep (Q: "look for more")
- persistence.ts, dbStorage.ts, SessionRecorder.ts: clean (open/tx/close per call).
- CONFIRMED: AutoLogService.startSession check-then-act across await (AutoLogService.ts:91-98, ensureSession :176).
  Scratch test w/ real AutoLogStore+fake-indexeddb: 5 synchronous recordLine before session exists -> 5 sessions.
  Real path: App.tsx:281 startSession on connect + output.tsx:597 recordLine per line while createSession pending.
- CONFIRMED: AutoLogStore.open() double-open (AutoLogStore.ts:52-64): 2 concurrent first calls -> 2 indexedDB.open, first leaked.
- Dropped: FileTransferStore reopen-after-close — every caller checks storeInitialized synchronously before calling.
- Unchecked/low: AutoLogStore.endSession get+put in separate txs (lineCount lost if append interleaves).
- Scouts dispatched: audio/midi/haptics; client/rtc/ui/stores. Findings UNVERIFIED until I check.

## Scout 1 (audio/midi/haptics) — each checked by me reading code (NOT run)
- H1 Buttplug{,Wasm}Backend.disconnect re-reads this.client after awaits; connect() reassigns w/o closing (ButtplugBackend.ts:213-266, Wasm:247-310). confirmed-by-read.
- H2 Wasm actuate: clearActuatorStopTimer before await, set after (Wasm:382,416-428); callers fire-and-forget (HapticsService.ts:384, no catch; rate-limit narrows). confirmed-by-read.
- H3 GamepadBackend.disconnect: await stop() then gamepads.clear() w/o clearLoop -> actuate in window orphans interval (GamepadBackend.ts:72-85,148-170). confirmed-by-read.
- H4 Wasm scan: if(!client) await connect() — double scan leaks client (Wasm:318-326). confirmed-by-read.
- M1 MidiService.connectInputDevice/OutputDevice close-then-await-open-then-assign (MidiService.ts:184-190, 274-306). confirmed-by-read.
- M2 GMCPClientMidi.ensureInitialized check-then-act; MidiService.initialize reassigns deviceWatcher (Midi.ts:108-135, MidiService.ts:106-132); 6 call sites. confirmed-by-read.
- M3 VirtualMidiService.initialize check-then-act, 4 callers incl getVirtualPort (VirtualMidiService.ts:35-57). confirmed-by-read.
- A1 MediaService inline chain: Update effects:[] during build is no-op (effectChain undefined, generation not bumped) -> stale build installs (MediaService.ts:948-1032,1051-1062). confirmed-by-read.
- A2 configureAmbisonicPlayback/PositionalFoa: cleanupUpmix before await only; concurrent configure leaks renderer / later upmix:'stereo' lost (MediaService.ts:1222-1296, update 776-785). confirmed-by-read.
- Low: Buttplug sensor setInterval(async) no in-flight guard (ButtplugBackend.ts:390-411); SpatialOverlay.attachRenderer no callers in prod (latent); HapticsService fire-and-forget actuate/stop no catch.

## Scout 2 (client/rtc/ui/stores) — my checks
- C1 MudClient.connect: ws.onclose not tied to its socket (client.ts:134-210, close 329-346). RUN-CONFIRMED (scratch test, deleted):
  connect, open, close(), connect, ws2 open, late ws1.onclose -> client.connected=false while ws2 OPEN; +10s -> 3rd socket.
- C2 MultiUserManager.addGuest: every pending handler gets same remote-connected (MultiUserManager.ts:85-133, worker reply no req id public/wasm-worker.js:116).
  RUN-CONFIRMED: two pending -> connIds [7,7], guestCount 1, connId 8 orphaned. createHostConnection (:56-77) shares the message type.
- C3 FTM.attemptRecovery fire-and-forget, no cleanupComplete check, createPeerConnection closes current pc (FileTransferManager.ts:613-697). confirmed-by-read.
- C4 sendFile overlap: createOffer re-reads this.peerConnection after await (WebRTCService.ts:238-248); sendFile sets webRTCService.recipient shared. confirmed-by-read (initializeWebRTC body not yet read).
- C5 handleIncomingChunk no re-check of acceptedOffers after awaits (:510,532,554) -> cancelled file still downloads. confirmed-by-read.
- C6 treeSitter defaultServicePromise caches rejection forever (editor/moocode/treeSitter.ts:93,128-137). confirmed-by-read.
- C7 AutoLogService endSession/startSession interleave: finally nulls without identity check (AutoLogService.ts:153-165). confirmed-by-read.
- C8 AutoLogDialogContent.loadSessionEntries stale response (AutoLogDialogContent.tsx:66-77). confirmed-by-read.
- C9 WebRTC ondatachannel overwrites this.dataChannel w/o closing local one (WebRTCService.ts:119-132); waitForConnection shared connectionTimeoutId. confirmed-by-read.
- C10 WasmHost disposedRef set in cleanup, never reset; StrictMode in index.tsx -> dev boot blocked. confirmed-by-read; lifecycle, not concurrency (outside epic).
- Dupe check: #81 (open epic, recovery twice) covers concurrent recovery; C3 dispose part new. #59 reconnect backoff != C1. #70 != A2. #72 closed.

## Execution (Q said "go", 2026-09-30)
- Bodies written to scratchpad i1..i10 *.md. i1-i9 epic children; i10 WasmHost StrictMode standalone.
- Next: gh issue create each, add i1-i9 as sub-issues of #77, rewrite #77 body, comment on #81 linking i4.
- DONE: filed #145-#153 (epic children) + #154 (WasmHost, standalone). Sub-issues of #77: 56,62,53,73 (closed) + 145-153.
  #77 body rewritten (fixed/open checklist, checked-clean list). Comment on #81 linking #148.
- Proposal to Q (approved): file new child issue for this, edit epic body to list children w/ status, keep epic open until it's fixed.
