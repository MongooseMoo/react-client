# File transfer core refactor

Branch `refactor/file-transfer-core`, worktree `C:\Users\Q\code\react-client-file-transfer`, off master @ 9ca76048.

## Goal

Q (2026-10-10): pull the peer-to-peer file transfer into a clean, self-contained core, internal to this repo for
now (a package later, maybe), using subagents where possible. "Make it beautiful." GMCP is only signalling; the
target is the transfer manager, WebRTC service and store. Concretely: bounded memory (streaming hash and writes),
several transfers at once, real resume, a signalling interface, no app coupling in the core, and the receive-side
trust checks of the old manager kept.

## State (2026-10-10)

Nothing is committed except this note. Q has not asked for commits of the code, a push or a PR.

Done and checked by me (read the code, ran the tests):
- `src/fileTransfer/` is the new core: `types.ts` (contract, written by me), `wire.ts`, `contentId.ts`, `storage.ts`,
  `rtcLink.ts`, `transfer.ts`, `outgoingTransfer.ts`, `incomingTransfer.ts`, `FileTransferEngine.ts`,
  `gmcpSignaling.ts`, `createFileTransfers.ts`, `testHarness.ts`, plus tests.
- Old `src/FileTransferManager.ts`, `src/WebRTCService.ts`, `src/FileTransferStore.ts` and their tests are deleted.
- `src/client.ts`: `getFileTransfers()` (lazy dynamic import of `createFileTransfers`), `onFileTransferOffer()`.
  `gmcp_fileTransfer` is now private. `RequestResend` removed from `src/gmcp/Client/FileTransfer.ts`.
- Panel (`src/components/FileTransfer/`) renders from snapshots: one row per transfer, Cancel buttons, history from
  state transitions. Notifications and the sidebar listen to `client.onFileTransferOffer`, not raw GMCP offers.
- Docs updated: `docs/GMCP/packages/client-file-transfer.md` and two inventory docs.
- Checks on the branch: `npx tsc --noEmit` exit 0; `npm run build` OK, transfer code is its own chunk
  (`assets/createFileTransfers-*.js`, 26.29 kB); `src/fileTransfer` tests all pass.
- Full `npx vitest run`: master is 130 files / 1576 tests; branch is 134 files / 1987 tests. See Surprises for flakes.

Open: the independent review (analyst agent) found real defects. I confirmed each by reading the code and by running
its probes myself (`<scratchpad>/ftprobe/probe.test.ts`). They are being fixed in a revision round (see Next step):
1. History eviction is by creation order and runs in the same publish as completion, closing the link that carries
   `complete`; 50 offer/cancel pairs from a third peer evict a just-completed transfer → sender resumes → re-prompt.
   (`FileTransferEngine.ts` `forgetOldestFinished`.)
2. The cap on undecided offers (16) is global and undecided offers never expire: one peer can block everyone's offers.
3. A sender in 'verifying' keeps its 30 s idle timer; a receiver verifying for > ~120 s leaves the sender 'failed'
   'timeout' while the receiver delivers. The timing on real IndexedDB is not measured.
4. Repeat offers (live transfer, or 'resume' after completion) each make a new peer connection, unbounded.
5. A cancel landing after `deliver` but before the storage discard finishes leaves both sides 'cancelled' with the
   file saved.
6. `safeName` keeps bidi/format characters (U+202E etc.) and has no length cap.
7. Candidates for an unanswered outgoing offer pile up in `rtcLink`'s held list without a cap.
8. Received frames queue on the heap when storage is slower than the network: no receive-side flow control, so
   "memory does not grow with the file" is not actually guaranteed.
9. Three comments/docs claim more than the code does (`client.ts` onFileTransferOffer doc, `types.ts` OfferAttempt
   doc, `gmcpSignaling.ts` "not swallowed" vs the mislabelled `.catch` in `gmcp/Client/FileTransfer.ts`).

## Decisions and why

- **One link (RTCPeerConnection + data channel) per transfer**, not per peer: each file Offer/Accept already carries
  one SDP offer/answer, so no glare and no multiplexing. ICE candidates carry the transfer id inside the opaque GMCP
  `candidate` string (`{transfer, candidate}`) so they can be routed.
- **Content id** = hex SHA-256 over the concatenated SHA-256 digests of 16 KiB pieces. Streams with WebCrypto in
  bounded memory, no new dependency. The GMCP doc already called `hash` opaque.
- **Frames carry no transfer id** (one link per transfer). Piece = type byte + u32 BE index + payload; control frames
  are type byte + JSON. The engine, not the codec, bound-checks indices, lengths and ranges.
- **Single `change` event with immutable snapshots**; the UI renders from `transfers()`.
- **Resume**: sender re-offers the same id marked `'resume'` (an extra `resume: true` key in the offerSdp JSON);
  a receiver that already accepted re-links without prompting and reports what it holds in `ready`. Page reload
  resumes through the same path because `ready` is built from storage. `RequestResend` dropped: the MOO side is not
  in this repo and I could not verify what it does with it.
- **Deliver, then confirm**: receiver verifies, hands the file to the app, then sends `complete`; the sender is
  'complete' only on that frame.
- **Last word, then wait**: the side that sends the final frame keeps the link until the peer closes it or the idle
  time passes. I have NOT verified whether browsers flush a data channel on `RTCPeerConnection.close()`; the design
  avoids depending on it.
- **Engine has its own listener set** (`on`/`off` only) instead of eventemitter3, so listener errors can be contained
  (handed to `reportError`) without breaking `once`.
- **Default max file size stays 100 MiB** (option); not changing product behaviour unasked.
- **Old and new builds cannot exchange files** (wire format, candidate tagging, content id all differ). Fails with a
  protocol error or a dropped candidate, not silently.

## Surprises

- `tsconfig.json` excludes `*.test.ts(x)`, so `npm run typecheck` does not cover tests. Integration agent reports 22
  type errors in existing test files under a scratch tsconfig, 23 on master (pre-existing; I have not re-run this).
- Load-sensitive test flakes, in files this work does not touch. Branch, 7 full runs: 3 clean; 3 with the same 2
  failures in `src/components/BlockquoteCopyButton.test.tsx` (waitFor timeouts, all slow ~74 s runs); 1 with an
  unhandled `window is not defined` from `preferencesStore.ts:212` (attributed to `logging/AutoLogService.test.ts`).
  Master, 6 full runs: 5 clean; 1 slow run (61 s) failed 6 tests in `src/components/output.test.tsx`.
  NOT established: that `BlockquoteCopyButton` flakes on master too. To do on a quiet machine.
- The sidebar's `fileTransferExpanded` starts true and is never set false, so its offer effect is a no-op
  (agent-reported; I read the diff, not the whole file).
- `useSessionStore` has no reader left outside tests (agent-reported, unchecked).
- The notification text shows the raw peer address (MOO object id), as before.
- Known limits accepted for now: identical content offered both ways at the same instant ends both 'rejected';
  a receiver-side failure the sender never heard is answered on resume with a reject, so the sender shows
  'rejected'; offer+cancel floods still fire one notification each (as on master).

## Next step

Revision round on the review findings (same engine coder agent, it has the context), then I re-read the changed
files, re-run the reviewer's probes (they must now fail to reproduce), the full suite on a quiet machine, typecheck
and build, and report to Q. Planned fixes:
1. Evict finished transfers in finish order, never one that still holds a link; an incoming offer that ends without
   ever being accepted is not kept in the table at all.
2. Per-peer cap on undecided offers; undecided incoming offers expire after `offerTimeoutMs`.
3. Receiver in 'verifying' answers a re-offer at once and says `ready` with everything held; sender in 'verifying'
   waits on a separate, longer `verificationTimeoutMs` instead of the idle timer.
4. Bound re-links per transfer and confirmations per completed transfer.
5. Receiver is 'complete' as soon as `deliver` succeeds; storage discard happens after.
6. `safeName` strips format characters and caps the length.
7. Cap held candidates in `rtcLink`.
8. Flow control: receiver reports stored pieces (`stored` frame), sender keeps a bounded window, receiver treats a
   queue beyond the window as a protocol violation.
9. Fix the three comments; show the file size on the pending-offer row (the size is part of what the user consents to).
