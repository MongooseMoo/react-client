2026-09-23 checkpoint
- User authorizes memory fixes in react-client and owned dependencies including Cacophony; no publication requested.
- Live tab: ~27 MB JS, 2915 DOM elements, ~11 MB decoded audio cache, no active sounds. Heap snapshot tool denies workspace writes.
- Isolated production benchmark reproduces 227 MB private working set after 40 silent six-second sounds; startup 24 MB, 3000-line history 57 MB. Cache retains 67 MB PCM.
- Added scripts/measure-memory.mjs; baseline reports/memory-before.json and heap snapshot. Existing untracked notes preserved in both repositories.
- Next: fix decoded buffer retention/budget in owning Cacophony code, bound client preload retention, test and rerun identical production workload.

2026-09-23 investigation-only checkpoint
- User paused implementation: investigate, do not change code. No product files changed; executing diagnostic variants in memory and saving JSON reports.
- Prior 227 MB benchmark was inflated by network debugging: raw CDP reproduction drops 145.7 to 83.8 MB immediately when Network.disable releases captured response bodies (~62 MB).
- Native stop is missing from MediaService stop -> Sound.cleanup -> Playback.cleanup. Instrumented run: 40 sources still alive after stop, native stop calls 0; they finish after six seconds. Explicit Sound.stop gives 40 stops and immediate source collection.
- Raw no-network-debug run: history 63 MB, sounds 165 MB, settled 140 MB, cache-cleared 72 MB. Cache accounts for 67 MB; pending sources explain ~25 MB beyond its cap.
- Next: verify long/native-loop lifetime and source-level ownership; distinguish these proven defects from the still-unattributed live 250 MB tab.

2026-09-23 live-heap checkpoint
- Live renderer PID 115092 identified via Chrome Task Manager UIA; footprint ~274 MB PrivateBytes versus ~146 MB WorkingSetPrivate. Earlier benchmark headline used the wrong metric for that comparison.
- Native infinite-loop probe confirms leak: 40 sources survive cleanup, wait and cache clear; closing context releases ~93 MB. Existing Sound.stop before cleanup prevents retention. App Infinity looping differs from library literal infinite.
- Opened diagnostic Task Manager (HWND 1903988) and DevTools (12848796); close these task-owned windows when finished. User browser HWND 109188172 must stay open.
- Live DevTools heap snapshot acquired via toolbar Group InvokePattern (button uses TogglePattern); Snapshot 1: 80.4 MB / 1,346,921 objects, roughly 146k Preact vnodes, while saved output has 1042 entries / 146 KB and visible output 3600 elements.
- Next: follow Preact retainer paths and reproduce incremental-output retention locally. No product code changed.

2026-09-24 confirmed findings (implementation remains paused)
- Output retention reproduced WITHOUT audio or Network-domain instrumentation: 1000 messages delivered individually through MudClient.handleTextLine, followed by settling and explicit GC, retain 43,703,460 JS bytes and 168,714,240 process PrivateBytes. Reloading the EXACT same 1000 saved source strings gives 3,041,484 JS bytes and 74,973,184 PrivateBytes. Evidence: reports/memory-output-reload.json.
- Same-page diagnostic reconstruction of history JSX also reduces JS from 43,750,692 to 3,044,456 bytes, without deleting source history (reports/memory-output-reconstructed.json). Merely nulling stored content fields does NOT release the graph: current mounted nodes still share references into it. Do not prescribe a frozen-content-only fix.
- Retainer path in reports/memory-output.heapsnapshot: document -> output DOM listener -> Output component -> allLines -> entry.content -> Preact __ parent -> prior list render. Local heap has ~560k Object instances and ~193k Arrays. Live tab's latest 200 entries point at 134 different prior 200-slot list parents, retaining 26,800 list slots; reachable history graph ~127k vnodes. Owning code: src/components/output.tsx:34,119,635,1074 (persisted mutable JSX reused across renders).
- Proposed client fix, NOT implemented: keep history as source records; render through keyed, memoized live row components rather than retaining mounted JSX in history. Preserve history capacity, scrolling, announcements, review/copy, links and frozen HTML behavior. Validate with incremental delivery, not just a loaded history fixture.
- Separate Cacophony defect: MediaService.releaseSound calls Sound.cleanup -> Playback.cleanup, which disconnects and drops AudioBufferSourceNode without native stop. Normal sources live until natural end; suspended contexts keep them pending. Literal library infinite loops survive wait and cache clear: 40 sources / ~92 MB remain until context closes. Existing Sound.stop before cleanup yields 40 native stops and no surviving sources. Evidence: reports/memory-native-loop-loop-cleanup.json versus memory-native-loop-loop-stop.json; current cacophony/src/playback.ts:553 still has the defect. Client loops:-1 maps numeric Infinity, not library literal infinite; do not conflate those cases.
- Measurement corrections: Chrome Task Manager's observed footprint matches Windows PrivateBytes, not WorkingSetPrivate. Network debugging retained ~62 MB of response bodies in the synthetic WAV run; disabling Network released them. Heap capture itself also inflates process memory, so later live footprint (~374 MB after capture) is NOT a clean baseline. Do not add cache and active-source PCM totals when they reference the same buffers.
- Live diagnosis: rendering retention directly observed; audio cleanup is independently confirmed but is not established as the cause of the entire live 250 MB. Diagnostic DevTools/Task Manager windows closed; user tab/session preserved. git diff --stat is empty in both repositories. No product code, dependencies, commits or publication changed. Original measurement script, JSON/heapsnapshot reports and these notes remain uncommitted.

2026-09-24 Sound versus Playback design clarification
- Current Cacophony source explicitly distinguishes reusable Sound assets from individual Playback voices. Concurrent voices share the AudioBuffer; references are not separate PCM copies.
- Playback.stop and natural completion preserve replay state. Sound.preplay reaps stopped voices by detaching routes/listeners, without cleanup; externally held voices can play again and be readmitted. Covered by src/sound-replay.test.ts and src/playback.test.ts (#212).
- Sound.stop is different: container stop calls stop plus cleanup on currently owned voices, then clears the collection; the Sound asset remains available for future play calls.
- Playback.cleanup is terminal (source becomes undefined and subsequent play rejects). Native buffer-source shutdown belongs here, before disconnect/drop, without changing stop/reap replay semantics or clearing the shared Sound buffer/cache.
- Withdraw blanket buffer-reference clearing as the established fix: Playback.origin still retains Sound and its buffer, and duration reads the private buffer. Clearing one field neither guarantees reclamation nor establishes compatible observable behavior. The demonstrated defect is a native source continuing after terminal cleanup.
- No product code changed. A future fix must verify active and scheduled sources, unstarted/already-stopped voices, native loops, repeated cleanup, and preservation of sibling voices and replay contracts.

2026-09-24 implementation checkpoint
- User authorized TDD implementation, PR, and normal merge after green CI; isolated Cacophony worktree: ../cacophony-cleanup-stop, branch fix/playback-cleanup-stop.
- Unit regressions failed because native stop was never called; Chromium regressions independently failed because immediate and scheduled infinite sources never emitted native ended after Sound.cleanup.
- Five-line Playback.cleanup change detaches onended then stops playing native sources; Chromium regressions now pass. Unit ordering assertion needs to permit existing repeated disconnect from effect-chain teardown.
- Next: finish tests, full build/checks, native retention probe, PR and exact-head CI/merge. Client product code remains unchanged; existing notes preserved.

2026-09-24 PR checkpoint
- PR https://github.com/ctoth/cacophony/pull/239, commit 44b7bbf4; four scoped files (Playback source/tests and native browser fixture/spec), no client product changes.
- TDD red captured unit missing stop and native Chromium missing ended; green full suite (1300 tests), build, Biome, Chromium and Firefox. Windows WebKit skips for absent AudioContext; Linux CI pending.
- Controlled 40-source probe: old cleanup retains 40 sources / 92,160,000 PCM bytes, fixed cleanup retains zero; renderer PrivateBytes ~130 MB versus ~33 MB. No context close required for fixed reclamation.
- Diagnostic script/results remain uncommitted in worktree. Next: verify exact-head CI and normal merge, then record merge evidence.

2026-09-24 browser CI correction
- First CI passed unit matrix, lint/typecheck and Chromium; WebKit native ended assertions failed, cancelling Firefox. Merge withheld.
- Linux native probe showed offline WebKit does not process disconnected sources. Revised regression uses OfflineAudioContext and reconnects the silent source after cleanup to prove it cannot revive, independent of audio hardware.
- Revised fixture passes Chromium/Firefox and actual Linux WebKit; same fixture against unchanged master yields terminated:false for immediate and scheduled loops, confirming the regression still catches the defect.
- Production fix unchanged. Next: commit browser-test correction, push, await fresh exact-head CI, normal merge; stop temporary Vite servers on ports 4174/4175.

2026-09-24 delivery complete
- PR #239 merged normally: dd59bd89f4aed4d866b9840b14c2d0639ad19a4b, after all nine CI checks passed on exact head 9bb784f7d8449d54e9ad0f0d65738515b33227d0 (run 35967309246).
- Final change remains five production lines in Playback.cleanup plus lifecycle and cross-browser regressions. Replay, shared buffers and sibling voices preserved; no cache-policy changes.
- Chromium memory probe demonstrated elimination of 40 surviving native sources / 92.16 MB retained PCM in the synthetic workload. This does not claim the whole original live-tab footprint is fixed.
- Temporary probe servers stopped. Worktree diagnostics and these notes remain uncommitted; client dependency upgrade/output-rendering fix and npm release were not part of this Cacophony PR.
