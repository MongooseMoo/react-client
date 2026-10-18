# feat/file-sharing

## Goal

Implement the client side of file sharing as specified in
`docs/GMCP/packages/client-file-transfer.md` (spec commit d7548bcb), extending the
one `Client.FileTransfer` protocol in place. Six steps, one commit each:
GMCP messages; wire frames 6/7/8 and piece-hash checks; OPFS content-addressed
storage; requests and multi-source; sharing index; Files panel UI.

## State

Baseline (before any change, after `npm ci` in this worktree): 31 test files,
982 tests green in `src/fileTransfer src/gmcp/Client src/components/FileTransfer src/launch`.

Step 1 done: GMCP messages (Share outbound only; Browse, List, Search, Result,
Request duplex), top-level `resume`/`hash`, old-build readers deleted,
`createGmcpSharingSignaling`, engine rejects every Request (nothing shared yet).

## Decisions and why

- Addresses: every `#5897` handler sets `data["sender"] = sender` the same way
  (read in `db/mongoose.db.new.2026-10-18T160640`, `#5897:0..6`), and the client
  addresses players as `String(player.Object)` (`src/fileTransferPeers.ts`). So the
  auto-accept compares the Offer's `sender` with the address the Request went to,
  which itself came from the `sender` of a List/Result. Plain string equality.
- `resume` on Offer and `hash` on Candidate are required: a message without them
  does not have the spec's shape and is dropped (spec: "A message that does not
  have the shape described here is dropped").
- Request lives in `TransferSignaling` (the engine sends it for downloads and
  answers it with an Offer or Reject). Share/Browse/List/Search/Result live in a
  separate `SharingSignaling`.

## Surprises

- The worktree had no `node_modules`; ran `npm ci`.

## Next step

Step 1: GMCP messages and `gmcpSignaling.ts`.
