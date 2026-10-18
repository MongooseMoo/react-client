# File-sharing v2

## Goal

Author a complete implementable v2 wire/storage/migration contract, commit it on
`feat/file-sharing-v2` in `C:\Users\Q\code\react-client-file-sharing`, and do not
push, implement client code or contact/change the MOO. A non-Codex reviewer will
review the result. Original task and inputs are under
`C:\Users\Q\AppData\Local\Temp\claude\C--Users-Q-code-react-client\4e69018f-42c3-4d90-a8d7-58e7d41e35bd\scratchpad\`:
`codex-dcpp-spec-task.md`, `dcpp-design.md` (revision 2), and
`codex-dcpp-design-report.md`. This note and the four linked contracts are enough
to continue without those temporary files.

## State

Specification written against baseline
`03a193ba2add2cb0d40bd9b21b508006f7512c96`; no implementation or live acceptance.
Task-owned files:

- [Client.Peer](../docs/GMCP/packages/client-peer.md): strict common types,
  endpoint epochs/capabilities/leases, hub reservation and signaling generations,
  correlated errors, validation and admission/output limits.
- [Client.Files](../docs/GMCP/packages/client-files.md): offer consent/state,
  operation authority, presence, bounded search, established-session revocation.
- [Data protocol](../docs/file-sharing/peer-protocol.md): ctl request/response,
  kind envelope, bind/bound/ready ordering, exact binary layouts, authenticated
  digest manifests, finite ranges, credits, cancellation and receipt recovery.
- [Architecture](../docs/file-sharing/architecture.md): owner/session/offer/
  content model, leases/OPFS/export, v1 choice, exact proposed MOO verbs per
  phase and direct-send acceptance matrix.

Phase 0 relay repairs are assigned separately to an in-MOO agent; their live
deployment/result was not inspected here. All MOO verbs in architecture.md are
required target work or the explicitly supplied Phase 0 dependency, not claims
that they exist in production. Do not enable a compatible-build allowlist entry
until its Phase 0 two-browser direct-send baseline passes.

## Decisions and why

- One hub reservation per unordered complete endpoint pair. First reserver
  initiates SDP; Restart atomically advances generation. No dual opposite
  sessions, unsolicited renegotiation or ambiguous glare behavior.
- One active file endpoint/player, bound to an authenticated underlying
  connection key and fresh hub epoch. This prevents multiple tabs answering
  one offer/session and fences delayed old-login work. Persistent owner remains
  runtime + player UUID + object ref; an epoch is not a cache owner.
- Separate private offer consent, shared transport, source transfer attempts,
  verified content and export outcome. An accepted push grants no browse/get;
  a cached hash never grants upload authority. Every distinct private offer
  still asks, even with sharing on or an open connection.
- Sharing is off by default, public to online ungagged players when enabled.
  Guests consume/direct-send but cannot share. Standing sharing intent resumes
  after login only once handles/permissions/index are ready. Firefox/Safari
  re-pick each visit. Warn plainly about IP exposure and permit direct ICE.
- Revocation is authoritative GMCP push; either-direction gag closes the pair,
  share revision invalidates shared operations only, direct-offer cancellation
  stops only its push. Hub disconnect/lease expiry ends online authority.
  Legacy relay observation and hub-synthesized canonical Cancel reach old
  compatible established transfers on gag; those Phase 1 hooks are additional
  to the separate Phase 0 repair, and do not change the v1 wire.
- Requester creates a transfer channel after accepted; responder checks bind
  and returns bound on that same channel before ready. This removes dependency
  on ordering across ctl and independently ordered transfer channels.
- Keep SHA256 of raw ordered 16 KiB piece digests. Authenticate the COMPLETE
  manifest before trusting pieces; chunks are not Merkle proofs. Binary leaves
  are <=16391 bytes, range requests finite with explicit batch acknowledgements.
- Owner/id cache has one writer, serialized writes, verified bitmap, per-consumer
  leases and reservations. Old attempts cannot overwrite verified bytes or
  erase another offer/download's data. Retain v1 storage separately; any import
  requires verification and grants no consent.
- Verified download, closed destination stream and browser handoff are different
  outcomes. Persist receipt before sending complete. Crash during export is
  export-uncertain and needs user retry; a replay never automatically saves twice.
- v1 choice requires explicit tested capability evidence BEFORE remote offer.
  No downgrade on timeout, rejection, denied/gag, ICE failure or unknown receipt.
  Keep the full v1 engine/storage/RTC owner. Retirement is out of scope.
- Public sharing ships with resource limits. Sequence is 0 baseline repair,
  1 v2 direct-send parity, 2 bounded share/list/get, 3 bounded hub search,
  4 owner/id cache + manifest verification, 5 REQUIRED OPFS/streamed multi-GB
  export/recovery, 6 multi-source. Keep 100 MiB until Phase 5; then 10 GiB maximum
  on capable v2 receivers and 100 MiB bounded fallback elsewhere.

## Surprises

- Baseline storage already preserves runtime/account ownership; only its
  within-owner peer dimension should disappear (`src/fileTransfer/storage.ts:28-35,50-56`;
  `src/stores/personalDataStore.ts:5-13`). Blind id-only browser storage regresses
  that boundary.
- The legacy version number does not uniquely identify compatible encodings
  (`docs/GMCP/packages/client-file-transfer.md:238-240`). Initial compatibility
  evidence identifies a tested baseline build, not package presence or hash ordering.
  More precisely the allowlist matches the exact advertised version string:
  startup imports the virtual build string (`src/gmcp/session.ts:1,75-78`), and
  the pinned plugin uses encoded git describe
  (`node_modules/vite-plugin-commit-hash/dist/index.mjs:6-10`). A commit substring
  alone must not admit arbitrary tag/dirty versions.
- Existing full-mode sender/verifier assumes whole-file completion
  (`src/fileTransfer/outgoingTransfer.ts:173-193,205-230`;
  `src/fileTransfer/incomingTransfer.ts:250-297`). Adding want alone cannot finish
  subset-source work; the new rangeAck/stream completion is separate.
- Existing code explicitly confirms a missed complete without redelivery
  (`src/fileTransfer/incomingTransfer.ts:137-147`). The replacement must preserve
  that receipt behavior and explicitly handle browser export's crash window.
- Raising the size cap requires more than OPFS: baseline digest concatenation,
  missing-index arrays and range Set expansion also need bounded replacements
  (`src/fileTransfer/contentId.ts:25-31,59-65`;
  `src/fileTransfer/outgoingTransfer.ts:178-181`;
  `src/fileTransfer/wire.ts:190-219`).

## Next step

Have the designated non-Codex reviewer review all four documents together against
the task's settled decisions and P1 review list. Incorporate any corrections as
spec-only changes before implementation. Then obtain Phase 0 baseline evidence,
implement the Phase 1 server contracts first, and build the complete v2
direct-send vertical slice while keeping compatible v1 operational. Exact verb
inventory and connection/gag integration are in architecture.md. Its acceptance
matrix is a required future gate, not a record of tests run by this task.

Validation completed while drafting: Markdown parsed with the installed marked
renderer, all local links resolved, source citation paths/ranges checked, and
frame vectors/10 GiB digest/bitmap/boundary arithmetic checked in Node. Manual
cross-document review corrected share initiation consent, exact build-string
matching, range slot release and established-v1 gag cancellation. Before commit
also run git diff checks and the repository commit hook. Final chat reports the
resulting commit and checks;
do not edit this note just to embed its own commit hash. No unresolved product
choice is intentionally left to the implementer.
