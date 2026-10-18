# File-sharing v2

## Goal

Revise the spec at 63062e06 on feat/file-sharing-v2 after the independent Claude
review. Work only in C:/Users/Q/code/react-client-file-sharing; commit the four
contracts and this note. Do not push, implement client/server code, or contact
or modify the MOO. Original tasks/review are in
C:/Users/Q/AppData/Local/Temp/claude/C--Users-Q-code-react-client/4e69018f-42c3-4d90-a8d7-58e7d41e35bd/scratchpad/:
codex-dcpp-spec-task.md, codex-dcpp-spec-revise.md and
claude-spec-review-report.md. This note and the linked contracts stand alone.

## State

All high, medium and low findings have specified resolutions below; no finding
is rejected or left for an implementer to choose. This remains SPECIFICATION
ONLY: no implementation, deployment, browser acceptance or author-run live MOO
probe is claimed. Source baseline is 03a193ba2add2cb0d40bd9b21b508006f7512c96.
Task-owned files:

- [Client.Peer](../docs/GMCP/packages/client-peer.md): common types, exact raw
  ingress, endpoint epochs/leases/capabilities, pair reservation, SDP/ICE,
  state-creating reply cache and input/record limits.
- [Client.Files](../docs/GMCP/packages/client-files.md): private offer consent,
  receipt-only hub completion, sharing/presence/search and revocation.
- [Data protocol](../docs/file-sharing/peer-protocol.md): ctl and channel binding,
  binary layouts, manifests, provisional resume, ranges, receipt recovery,
  cancellation, paths and bounded client resources.
- [Architecture](../docs/file-sharing/architecture.md): owner/content/storage
  boundaries, tab election, OPFS/export, v1 choice/observer, exact MOO phase
  inventory, bucket timers and direct-send acceptance matrix.

The coordinator supplied live production evidence: generate_json emits E_NONE
as a string, parse_json maps null to E_NONE, and duplicate/case-differing keys
merge first-wins. The supplied server checkout is
C:/Users/Q/src/toaststunt-prod-6d6d2ef; its json.cc was inspected for the parser
signature/config and null/bool handling. The existing parse_json builtin calls
strict=0 and exposes only the common-subset/embedded-types option, not strict
mode. The revised spec does not require a server-native change or Unicode MOO
implementation. Phase 0 relay repairs remain a separately assigned dependency;
their deployment is not verified here.

## Decisions and why

- Every settled product requirement remains: off-by-default public online
  sharing, symmetric gag per coordinator, explicit IP warning/direct ICE,
  non-sharing guests, usable-root login resume, Firefox/Safari re-pick,
  multi-GB streamed receive/export in required Phase 5, retained v1, and direct
  send with both shares off at the end of EVERY phase.
- First hub reserver initiates SDP. There is one pair session, no Restart or
  mutable session generation; Close releases it before a fresh Reserve/Id.
  Transfer a remains a writer/channel fence and stable t retains partial bytes.
- Offer sender initiates Reserve on accepted OfferState. Session and upload
  partitions preserve capacity for direct send when public shares are busy.
  Terminal offers are separate evictable LRU entries, never admission load.
- Hub validates byte shapes/structural state, uses first retained parsed values
  consistently and reconstructs outgoing messages. Clients own Unicode and
  text matching. Null is absent everywhere. Errors can omit untrusted req.
- New Hello/new endpoint on the same connection replaces the old epoch without
  logging the game player out. canShare comes from hub guest classification.
  File overload invalidates file authority, never the game connection.
- v1 fallback follows explicit current packages: Client.FileTransfer 1 present,
  Client.Files absent, reported by the hub. Query unknown capability, fail on
  unanswered query, and never infer it from a build string or timeout. The
  former exact-build allowlist has been removed. Historical clients reusing v1
  for incompatible wire may still fail visibly; build lists do not decide this.
- Receipt, verified content and export stay separate. Hub records received only;
  ctl/local receipts describe export outcome. Saved payload can be released
  immediately without losing the receipt needed to avoid automatic second save.
- Shared get stays authorized while its pinned id/size is readable in the
  current approved index; list/search retain exact revision. New unrelated files
  do not abort active downloads. Gag, share off, removal or unreadable data do.
- Tabs elect one endpoint owner before Hello/automatic reconnect; losers show
  another-tab status without a proxy. Dedicated storage worker owns a second
  exclusive lock and actual sync access handle. No sync handle means bounded
  memory fallback, never a swap-file imitation of per-piece flush durability.
- Timer work uses bounded due buckets, not full registry scans. Input/cache/
  fanout/record bounds replace application output pacing. Leases remain.

## Review resolution

| Finding | Resolution and contract location |
| --- | --- |
| H1 | Peer validation explicitly limits hub to bytes/structure. Files Name/Search and data Path rules assign NFC, categories, scalar/token counts, folding and matching only to clients. |
| H2 | Peer Raw ingress names #3838:parse_gmcp_message immediately after address/data split and before parse_json: reject >65536 bytes without decoding, trapped common-subset parse, no raw fallback, post-parse depth/value walk. First-wins duplicates cannot change validation vs forwarding/replay; canonical retained key spelling is checked. Oversize/parse failure omits untrusted req. Current builtin strict-mode limitation is explicit. |
| H3 | No null fields: optional target/req/cursor/next/ICE properties; end:true with candidate omitted. Hub never serializes E_NONE as a missing value. Legacy label removed for explicit legacyV1 boolean. |
| H4 | Files terminal offer LRU is separate from live pending/accepted caps and freely evicted; unknown push cannot revive consent. Legacy observer drops pending tracking under pressure and never rejects an Offer for tombstone/pending load; accepted cancellation records remain live and bounded separately. |
| H5 | Peer/Data reserve 2 total and 1 not-established session slots/endpoint for offer auth; share-only <=6 total/1 not-established, <=4/downloader player hub-wide. Global offer partition and classification changes are defined. |
| H6 | Data manifest/ready/reconnect and Architecture attempts/OPFS key provisional bytes by logical t, pin source/offer/id/size, fence writes by current a, and reuse earlier-a held pieces before Phase 4. |
| H7 | New Hello with new endpoint/req on the SAME game connection supersedes old authority and returns a new epoch. No logout needed to lower/refresh advertised receive capability. |
| H8 | Removed exact-build allowlist. Peer Capabilities legacyV1 and Architecture fallback use explicit FileTransfer 1 and absent Client.Files; unknown list triggers a bounded capability query, silence never fallback. |
| M1 | Files accepted event and Peer reservation require offer SENDER to send Reserve; receiver waits. |
| M2 | Every local session teardown sends Close if GMCP usable; idle timeout and unretried RTC failure release hub state. Authoritative Closed/End does not provoke another Close. |
| M3 | Overload/error flood stops only the v2 endpoint/leases, optionally End overload; no boot_player, transport close or game logout. No promise of a one-second delivery acknowledgment. |
| M4 | Cache only Hello/Reserve/Offer/Respond/enabling Status/Search/Sharers; relay/Ack-only/state-idempotent commands are uncached. Bound cache records/bytes globally and cached admissions/player to fit the 120-second 512-entry window. |
| M5 | Architecture timer index uses cancellable per-record expiry nodes, 128-node slices and separate ten-second lease buckets; no per-second full walk. |
| M6 | OPFS requires an actual createSyncAccessHandle in the dedicated worker and flush before bitmap commit. Otherwise <=100 MiB memory mode. No createWritable durability substitute. |
| M7 | Get has no exact-revision field; uploader checks pinned id/size against current approved readable index. Revision Revoke includes sharing, stops stale lists/search, retains unaffected gets while still on. |
| M8 | Ready.canShare boolean reflects authenticated guest eligibility; client hides publishing for false. |
| M9 | Architecture defines endpoint Web Lock election, status-only followers, pre-reconnect ownership, transport-loss release, storage lock and explicit takeover fallback; no unspecified tab proxy. |
| M10 | Coordinator explicitly settled symmetric gag. Both directions blocked for offers, discovery/search, sessions and established transfers; ungag does not resurrect old consent. |
| M11 | Binary abort reason 9 is limit, matching hard-cap error/abort wording. |
| L1 | Peer and Architecture use the same reserved/offering/answering/established/closed session states. |
| L2 | Defined FeaturesWithoutBaseRequirement, including empty no-bundle capability result. |
| L3 | Reject SDP with zero fingerprint lines or multiple differing values; a new session may legitimately have a different fingerprint. |
| L4 | Browser empty candidate strings and null candidate notifications coalesce to one end:true marker after candidates; no wire null. |
| L5 | Peer requires byte-exact equal/strcmp for canonical keys, lowercase hex, identity/path equality and uniqueness; no implicit case-insensitive MOO comparisons. |
| L6 | Manifest root uses one bounded <=20 MiB raw digest buffer with worker WebCrypto; no incremental WebCrypto claim. |
| L7 | Legacy observer captures each destination's EXACT peer-key string from actual Offer forwarding and uses it in policy Cancel; compact per-pair routing survives pending-detail pressure, never assumes canonical #ref equality. |
| L8 | Files state table explicitly makes pending sender Cancel a state error; use Withdraw. |
| L9 | Files Search and Architecture require a UI statement that query text and requester identity are sent to online sharers. |
| L10 | Call storage.persist before large receive; explain temporary roughly 2x disk need. Release saved payload immediately if no other consumer/queue/lease holds it, retaining receipt/tombstone. |
| L11 | Peer names authenticated player plus personalDataStore.policyReady and confirmed owner/visitor as registration trigger, after both packages are advertised and election held. Startup Supports alone is not login confirmation. |

The review's small-Phase-1 cuts are applied: no Restart/session generations,
export hub substate, ctl progress, nine independent rate buckets, MOO output
pacing/reserve, hub Unicode work, or premature list/search/presence/Policy/share
handlers. Base leases, consent, revocation and direct-send parity remain required.

## Surprises and practical limits

- The native strict JSON helper exists, but current parse_json cannot select it.
  Hub schema validation must never depend on rejecting duplicates/permissive
  encodings; forwarding only reconstructed retained values avoids ambiguity.
- Unchanged approved shared content need not inherit a list snapshot's lifetime.
  Uploader checks are the authority because the hub has no content index.
- v1 has neither revocation nor online leases. Directed exact-address Cancel
  reaches responsive compatible clients; if output cannot be queued, bounded
  retry reports unconfirmed cancellation, never claims proof a remote stream
  stopped. Installing the observer requires draining/reconnecting pre-observer
  streams before live acceptance. File overload must not boot game players.
- No protocol makes external save and IndexedDB atomic; export-uncertain after
  crash remains explicit. No automatic re-save for a known receipt.

## Next step

The coordinator can review this spec-only revision, obtain Phase 0 browser/live
baseline evidence, then implement server-first Phase 1 and its complete direct
send slice. Do not prebuild later-phase hub handlers. Phase exits must run the
Architecture acceptance matrix; its rows are future requirements, not tests
claimed by this documentation task. The independent Claude report informed this
revision; no second independent review is claimed.

Documentation validation passed: all five files parsed with installed marked;
16 local links and 39 source-citation path/range groups checked; all 30 finding
IDs accounted for; no stale session-generation/Restart or null wire schema;
frame vectors, 10 GiB piece/manifest/bitmap arithmetic, boundary sizes and reply
cache admission arithmetic checked in Node. git diff --check passed and edits
are limited to the four contracts and this note, with tracked LF endings. The
required repository commit hook runs typecheck and staged lint; a successful
commit must pass both. No client runtime tests are claimed for a docs-only task.
