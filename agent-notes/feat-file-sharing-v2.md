# File-sharing v2

## Goal

Revise the spec at c52b0fe8 on feat/file-sharing-v2 after the second independent
Claude review. Work only in C:/Users/Q/code/react-client-file-sharing; commit the four
contracts and this note. Do not push, implement client/server code, or contact
or modify the MOO. Original tasks/review are in
C:/Users/Q/AppData/Local/Temp/claude/C--Users-Q-code-react-client/4e69018f-42c3-4d90-a8d7-58e7d41e35bd/scratchpad/:
codex-dcpp-spec-task.md, codex-dcpp-spec-revise.md, codex-dcpp-spec-revise2.md,
claude-spec-review-report.md and claude-spec-rereview-report.md.
This note and the linked contracts stand alone.

## State

All original high, medium and low findings plus B1-B7 and L-new-1..6 from the
re-review have specified resolutions below; no finding
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
- v1 fallback follows explicit current capability: Client.FileTransfer 1 present
  and NO ready v2 endpoint, reported by the hub, including new clients still
  advertising Files during endpoint recovery. Query unknown capability, fail on
  unanswered query, and never infer it from a build string or timeout. The
  former exact-build allowlist has been removed. Historical clients reusing v1
  for incompatible wire may still fail visibly; build lists do not decide this.
- Receipt, verified content and export stay separate. Hub records received only;
  ctl/local receipts describe export outcome. Saved payload can be released
  immediately without losing the receipt needed to avoid automatic second save.
- Shared get stays authorized while its pinned id/size is readable in the
  current approved index; list/search retain exact revision. New unrelated files
  do not abort active downloads. Gag, share off, removal or unreadable data do.
- Tabs elect only the Files endpoint with a queued Web Lock request; every tab's
  game auto-login/reconnect stays unchanged. Followers wait and take over when
  the holder releases. Without Web Locks every tab may register memory-only;
  the hub's last Hello wins and superseded tabs park. The elected service holds
  the storage lock for its dedicated worker from Phase 1. IndexedDB needs no
  sync handle; Phase 5 OPFS does, otherwise bounded memory fallback.
- Endpoint loss uses fresh Hello ids with 1-second exponential backoff capped
  at 60 seconds plus bounded jitter; only a continuous 30-second outage produces
  a player notice. Restore the idle v1 receiver during v2 recovery for the same
  confirmed owner, never old operation authority.
- Phase 1 database version 1 creates owner/attempts/offers/exports plus payload
  pieces/transfers, not later share/content/queue stores. Sender/id/index partials
  survive reload for seven days in Phases 1-3; a fresh accepted same-sender/id/size
  offer adopts them under a new t, then verifies the full root before receipt.
- Timer work uses bounded due buckets, not full registry scans. Input/cache/
  fanout/record bounds replace application output pacing. Leases remain.

## Review resolution

| Finding | Resolution and contract location |
| --- | --- |
| H1 | Peer validation explicitly limits hub to bytes/structure. Files Name/Search and data Path rules assign NFC, categories, scalar/token counts, folding and matching only to clients. |
| H2 | Peer Raw ingress names #3838:parse_gmcp_message after address/data split: cap and common-subset parse INSIDE its existing try, cap before parse, integer-0 rejection marker and no new catch/raw v2 fallback, then bounded depth/value walk. handle_message stops on rejection before mutation/dispatch. Retained first-wins values alone control validation/forwarding/replay; canonical keys checked; raw failures omit untrusted req. |
| H3 | No null fields: optional target/req/cursor/next/ICE properties; end:true with candidate omitted. Hub never serializes E_NONE as a missing value. Legacy label removed for explicit legacyV1 boolean. |
| H4 | Files terminal offer LRU is separate from live pending/accepted caps and freely evicted; unknown push cannot revive consent. Legacy observer drops pending tracking under pressure and never rejects an Offer for tombstone/pending load; accepted cancellation records remain live and bounded separately. |
| H5 | Peer/Data reserve 2 total and 1 not-established session slots/endpoint for offer auth; share-only <=6 total/1 not-established, <=4/downloader player hub-wide. Global offer partition and classification changes are defined. |
| H6 | Data manifest/ready/reconnect and Architecture attempts key logical bindings/bitmaps by t and fence writes by a. Pre-Phase-4 physical pieces remain sender/id/index keyed for reload parity; adoption under new t requires fresh same-sender/id/size consent. Phase-5 OPFS provisional layout is t-keyed. |
| H7 | New Hello with new endpoint/req on the SAME game connection supersedes old authority and returns a new epoch. No logout needed to lower/refresh advertised receive capability. |
| H8 | Removed exact-build allowlist. Peer Capabilities legacyV1 and Architecture fallback use explicit FileTransfer 1 and NO ready v2 endpoint, even when Files advertised; unknown list triggers bounded query, silence never fallback. |
| M1 | Files accepted event and Peer reservation require offer SENDER to send Reserve; receiver waits. |
| M2 | Every local session teardown sends Close if GMCP usable; idle timeout and unretried RTC failure release hub state. Authoritative Closed/End does not provoke another Close. |
| M3 | Overload/error flood stops only the v2 endpoint/leases, optionally End overload; no boot_player, transport close or game logout. No promise of a one-second delivery acknowledgment. |
| M4 | Cache only Hello/Reserve/Offer/Respond/enabling Status/Search/Sharers; relay/Ack-only/state-idempotent commands are uncached. Bound cache records/bytes globally and cached admissions/player to fit the 120-second 512-entry window. |
| M5 | Architecture timer index uses cancellable per-record expiry nodes, 128-node slices and separate ten-second lease buckets; no per-second full walk. |
| M6 | OPFS requires an actual createSyncAccessHandle in the dedicated worker and flush before bitmap commit. Otherwise <=100 MiB memory mode. No createWritable durability substitute. |
| M7 | Get has no exact-revision field; uploader checks pinned id/size against current approved readable index. Revision Revoke includes sharing, stops stale lists/search, retains unaffected gets while still on. |
| M8 | Ready.canShare boolean reflects authenticated guest eligibility; client hides publishing for false. |
| M9 | Architecture defines Files-only queued Web Lock election, status-only waiting followers, automatic lock handoff, transport-loss release and worker storage lock. Game auto-login/reconnect stays unchanged. No-lock fallback permits memory-only registration, parking superseded tabs without retry contests. |
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
| B1 | Peer Raw ingress and Architecture #3838 row put cap AND common-subset parse inside the existing try, cap before decoding. Existing except returns the v2 rejection marker; no new try/except/backtick catch. This follows the coordinator's explicit correction to the review's suggested cap location. |
| B2 | Peer Raw ingress and Architecture name #3838:handle_message: capture ctx/key before parsing, stop on integer-0 rejection before message mutation/route_message, add ctx only for v2, retain other-package message shape; #2729 passes ctx to v2 dispatch. |
| B3 | Peer capability discovery and Architecture name #4004:handle_set / handle_remove handle_add and existing session.gmcp_data["supported_packages"]. Set establishes known-complete; Add/Remove update it, removing a required package invalidates endpoint. Scope all updates/query replies to transport key. |
| B4 | Files revocation and Architecture define blocked(a,b) as symmetric PLAYER gaglist membership. #6:set_gaglist, #6:gc_gaglist and every direct writer call file_gag_changed after mutation for old/new affected entries; gag_p and object/location/caller gags are excluded. Apply same predicate to v1. |
| B5 | Architecture election never changes game login/reconnect. Queue one navigator.locks.request without ifAvailable; next eligible waiting tab gets Files role and sends Hello. No locks: all eligible tabs may register memory-only, last valid Hello wins, superseded tabs park. |
| B6 | Peer Endpoint recovery specifies fresh-id Hello, nominal 1-second doubling to 60 seconds with bounded jitter, rate/busy minimums, stable-Ready reset and one delayed 30-second unavailable notice. legacyV1 uses explicit FileTransfer 1 plus no ready v2 target. Architecture restores idle v1 reception during recovery and adds acceptance rows. |
| B7 | Architecture Exact Phase 1 client build inventory names package/service/endpoint/transport/session/ctl/frame/offer/storage/worker/export/legacy/UI modules. Database version 1 creates six stores: owner, attempts, offers, exports, pieces, transfers. Worker/lock start in Phase 1; no OPFS until Phase 5. Types 1-5/11 only; later stores/features listed as out of scope. |
| L-new-1 | Rejected the suggested Phase 1-3 reload regression per coordinator; fixed it instead. Architecture and Data retain same-owner/sender/id/size partials for seven days, fresh Offer/acceptance/new t after reload, provisional have then complete-root verification. Phase 4 replaces peer keys with verified owner/id content. v1 remains isolated. |
| L-new-2 | Peer registration waits for no live operation before capability re-Hello; enforce a lower limit locally immediately at accept/get, cancelling unsafe work explicitly first. Acceptance matrix covers limit changes without needless live consent revocation. |
| L-new-3 | Architecture Phase 1 row calls Revoke an outbound helper, never an inbound hub handler. Client Files receives it. |
| L-new-4 | Peer documents Supports.Get as a new extension, reuses saved complete Sets, checks gag before probing, coalesces targets, limits target probes to one per five seconds across requesters, caps pending/cooldown records at 256 and handles unsupported-query silence as unavailable. |
| L-new-5 | Architecture ctx names player.uuid as principal_uuid's server source, verified against #3476:0 Char.Name in supplied local snapshot. Capture/check own UUID and incarnation_id against object reuse; connection_key is fresh per transport, not the persistent player UUID. |
| L-new-6 | Architecture Offer state now labels received export substate (local) and explicitly says none is stored by the hub. |

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

The coordinator can review this second spec-only revision, obtain Phase 0 browser/live
baseline evidence, then implement server-first Phase 1 and its complete direct
send slice. Do not prebuild later-phase hub handlers. Phase exits must run the
Architecture acceptance matrix; its rows are future requirements, not tests
claimed by this documentation task. Both supplied independent Claude reports
informed the revisions; no independent review of THIS resulting revision is claimed.

Documentation validation passed for this revision: all five Markdown files
parsed with installed marked; 16 local links and 42 source-citation path/range
groups checked; the six Phase 1 stores/version/frame gate and all original 30
plus 13 re-review finding IDs checked; obsolete fallback/election/parse/reload
wording absent. git diff --check passed. The required commit hook runs typecheck
and staged lint; successful commit requires both. No client runtime tests, live
MOO probe or browser acceptance are claimed for this documentation-only task.
