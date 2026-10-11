# File transfer core refactor

Branch `refactor/file-transfer-core`, worktree `C:\Users\Q\code\react-client-file-transfer`, off master @ 9ca76048.

## Goal

Q (2026-10-10): pull the peer-to-peer file transfer into a clean, self-contained core, internal to this repo for
now (a package later, maybe), using subagents where possible. "Make it beautiful." GMCP is only signalling; the
target is the transfer manager, WebRTC service and store. Concretely: bounded memory (streaming hash and writes),
several transfers at once, real resume, a signalling interface, no app coupling in the core, and the receive-side
trust checks of the old manager kept.

## State (2026-10-10, end of session)

The code is written, reviewed once independently, revised, and passes every automated check. It is NOT committed
(only this note is), not pushed, no PR. Q has not asked for any of those. It has NOT been run in a real browser:
every test uses fake links and fake or in-memory storage, so real WebRTC, real IndexedDB timing and the MOO relay
are unexercised.

What exists:
- `src/fileTransfer/`: `types.ts` (contract), `wire.ts` (frames, `SEND_WINDOW`), `contentId.ts`, `storage.ts`,
  `rtcLink.ts`, `transfer.ts` (shared base), `outgoingTransfer.ts`, `incomingTransfer.ts`, `FileTransferEngine.ts`,
  `gmcpSignaling.ts`, `createFileTransfers.ts` (browser assembly: GMCP signalling, IndexedDB, WebRTC, download),
  `testHarness.ts` (in-memory signalling hub + fake links, used by engine and panel tests), and tests.
- Deleted: `src/FileTransferManager.ts`, `src/WebRTCService.ts`, `src/FileTransferStore.ts` and their tests.
- `src/client.ts`: `getFileTransfers()` (lazy dynamic import), `onFileTransferOffer()`; `gmcp_fileTransfer` private.
  `src/gmcp/Client/FileTransfer.ts`: `RequestResend` removed; load failure and handler failure logged separately.
- Panel `src/components/FileTransfer/`: renders from snapshots (`useTransfers`, `useTransferHistory`), one progress
  row per transfer, Cancel buttons, size shown on the pending-offer row. Notifications and sidebar use
  `client.onFileTransferOffer`.
- Docs: `docs/GMCP/packages/client-file-transfer.md` (content id, tagged candidates, resume key, data-channel
  protocol incl. flow control), plus two inventory docs.

Last verification, run by me after the final edits:
- `npx tsc --noEmit`: exit 0.
- `npx biome lint` over every new or changed ts/tsx file: 0 errors, 6 warnings (2 in untouched lines of
  `sidebar.tsx`, 4 non-null assertions in tests).
- Full `npx vitest run`: 135 files, 2048 tests, two consecutive clean runs (21-23 s). Master: 130 files, 1576 tests.
- `npm run build`: OK; transfer code is its own chunk, `assets/createFileTransfers-*.js`, 28.73 kB (9.28 kB gzip).
- The reviewer's probes (`<session scratchpad>/ftprobe/probe.test.ts`) re-run against the fixed code: the defects
  for findings 1-7 no longer reproduce. PROBE8 prints unchanged numbers because its file is exactly one window;
  the bound is shown by the engine test "keeps a fast sender within the window while the receiver stores slowly".

## Decisions and why

- **One link (RTCPeerConnection + data channel) per transfer**, not per peer: each file Offer/Accept already carries
  one SDP offer/answer, so no glare and no multiplexing. ICE candidates carry the transfer id inside the opaque GMCP
  `candidate` string (`{transfer, candidate}`) so they can be routed.
- **Content id** = hex SHA-256 over the concatenated SHA-256 digests of 16 KiB pieces. Streams with WebCrypto in
  bounded memory, no new dependency. The GMCP doc already called `hash` opaque.
- **Frames carry no transfer id**. Piece = type byte + u32 BE index + payload; control frames are small. The engine,
  not the codec, bound-checks indices, lengths and ranges.
- **Single `change` event with immutable snapshots**; the UI renders from `transfers()`. The engine has its own
  listener set (`on`/`off`) so listener errors are contained (handed to `reportError`).
- **Resume**: sender re-offers the same id marked `'resume'` (extra `resume: true` key in the offerSdp JSON); a
  receiver that already accepted re-links without prompting and says what it holds in `ready`. Reload resumes the
  same way because `ready` is built from storage. `RequestResend` dropped: the MOO side is not in this repo and I
  could not verify what it does with it.
- **Deliver, then confirm; delivered means complete**: receiver verifies, hands the file to the app, is 'complete'
  at once, then says `complete`; the sender is 'complete' only on that frame.
- **Last word, then wait**: the side that sends the final frame keeps the link until the peer closes it or the idle
  time passes. I have NOT verified whether browsers flush a data channel on `RTCPeerConnection.close()`; the design
  avoids depending on it.
- **Verification is independent of the link**; a receiver verifying answers a re-offer at once with `ready`
  (everything held); the sender waits `verificationTimeoutMs` (5 min) in 'verifying' instead of the idle timer.
- **Flow control**: receiver reports pieces dealt with (`stored` frame, every 16); sender keeps at most
  `SEND_WINDOW` (64 pieces, 1 MiB) outstanding; a receiver with more than that queued aborts. This is what makes
  "memory does not grow with the file" true on the receive path.
- **Abuse bounds** (from the independent review): undecided offers capped per peer (4) and overall (64) and expire
  after `offerTimeoutMs`; never-accepted offers are not kept in history; history evicts in finish order and never a
  transfer still holding a link; re-links per transfer and confirmations per completed transfer are bounded by
  `maxReconnects + 1`, and exceeding it is a 'protocol' failure (not resumable); held ICE candidates capped at 64;
  names lose control and format characters and are cut to 255.
- **Default max file size stays 100 MiB** (option); not changing product behaviour unasked.
- **Old and new builds cannot exchange files** (wire format, candidate tagging, content id all differ).

## Surprises

- The engine agent found eight flaws in my first design brief (confirm before deliver, last frame lost on close,
  "handed over" ≠ "received", …). The independent review then found nine more defects, two of them high (history
  eviction by a third peer; one peer blocking everyone's offers). All were reproduced before being fixed.
- `tsconfig.json` excludes `*.test.ts(x)`, so `npm run typecheck` does not cover tests. An agent reports 22 type
  errors in existing test files under a scratch tsconfig, 23 on master (pre-existing; I did not re-run that).
- Load-sensitive test flakes in files this work does not touch. Branch, 13 full runs in total: 7 clean; 3 with 2
  failures in `components/BlockquoteCopyButton.test.tsx`; 1 with 6 failures in `components/output.test.tsx`; 2 with
  all tests passing plus an unhandled `window is not defined` from `stores/preferencesStore.ts:212`. Master, 6 runs:
  5 clean; 1 with the same 6 `output.test.tsx` failures. All failing runs were slow ones (machine busy with other
  agents). NOT established: that the `BlockquoteCopyButton` and `preferencesStore` flakes occur on master.
- The sidebar's `fileTransferExpanded` starts true and is never set false, so its offer effect is a no-op
  (agent-reported; I read only the diff).
- `useSessionStore` has no reader left outside tests (agent-reported, unchecked).
- The notification text shows the raw peer address (MOO object id), as before.
- Pre-existing lint errors in `components/FileTransfer/Controls.tsx` / `Controls.test.tsx` (untouched files).

Known limits, accepted for now:
- Identical content offered both ways at the same instant ends both 'rejected'.
- A receiver-side failure the sender never heard is answered on resume with a reject, so the sender shows 'rejected'.
- A cancel landing during `deliver` itself ends 'cancelled' though the app may have the file (ours is synchronous).
- Offer+cancel floods still fire one notification each, as on master.
- A sender's progress counts bytes queued on the link, so it can lead the receiver by up to the window.
- Final assembly builds a Blob from stored pieces: JS heap is bounded, Blob memory is the browser's. The storage
  interface leaves room for an OPFS implementation.
- Receiver verification that outlasts ~25 minutes fails at the receiver (re-link bound).

## Next step

For Q to decide; nothing here has been started:
1. A live two-browser test (two guests through the dev server, which proxies to the real MOO): send a file each way,
   then drop a link mid-transfer to see resume. This is the only way to learn whether real WebRTC, IndexedDB timing
   and the server relay behave as the fakes assume. Earlier notes say the server-side `toobj()` recipient fix on
   object #5897 was never confirmed live; if offers vanish, check that first.
2. Commit the work on this branch and open a PR, if wanted.
3. If the core is to become a package: the only imports from outside `src/fileTransfer/` are in `gmcpSignaling.ts`
   and `createFileTransfers.ts` (GMCP package type) and `storage.ts` (`../persistence` IndexedDB helpers).
