# File-sharing v2

## Goal

Implement client-only Phase 1 from final specification commit 37b5bbca. The task
is codex-dcpp-phase1-client.md in the scratchpad below. Commit coherent steps;
do not push. Keep v2 disabled by default and preserve the v1 engine/storage.

The prior documentation task applied three independent reviews. Original
tasks/review are in
C:/Users/Q/AppData/Local/Temp/claude/C--Users-Q-code-react-client/4e69018f-42c3-4d90-a8d7-58e7d41e35bd/scratchpad/:
codex-dcpp-spec-task.md, codex-dcpp-spec-revise.md, codex-dcpp-spec-revise2.md,
codex-dcpp-spec-revise3.md, claude-spec-review-report.md,
claude-spec-rereview-report.md and claude-spec-rereview2-report.md.
This note and the linked contracts stand alone.

## State

Phase 1 client implemented and locally verified (2026-10-18): strict packages/parser and
full-mode frames, endpoint election/lease/recovery, one multiplexed session per
pair, consent and bind/ready, credits/cancellation/retries, durable receipts and
explicit save, six-store worker persistence and origin quota registry, retained
partial adoption after fresh consent, integrity purge, and complete isolated v1
transport selection. Runtime head e499bfc3 passes typecheck, 181 Vitest files /
2386 tests, lint on all 37 changed TS/TSX files (0 errors; existing telnet warnings),
and production build. Evidence and every pending acceptance item are recorded in
reports/file-sharing-phase1-validation.md. v2 remains OFF by default through
general.fileSharingV2. No hub code was changed or deployed and nothing was pushed.
The rollout flag is sampled when MudClient is created; preference edits require
reload. This preserves active v1 transfers rather than hot-swapping their engine.

Implementation decisions: v1 source files remain untouched. Phase 1 creates
only the specified six native version-1 stores. Ctl and frame validators reject
later-phase operations. Workers own v2 database connections. End superseded
parks the endpoint, including no-lock tabs, until a player action.

Chromium flag-off live guest sends passed both directions after identifying each
page from its own look me output. A separate local reference-hub browser fixture
passed real WebRTC, dedicated workers/native IndexedDB, exact bytes, receipt and
explicit download handoff. This is not live-v2 hub acceptance or AT speech proof.

All original high, medium and low findings plus B1-B7 and L-new-1..6 from the
re-review, plus C1-C3 and the final L1-L3, have specified resolutions below; no finding
is rejected or left for an implementer to choose. The prior task was SPECIFICATION
ONLY: no deployment, browser acceptance or author-run live MOO
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

Implementation decisions: the rollout flag is fixed per MudClient lifetime,
requires reload to change, and never hot-swaps an active legacy engine. Browser
handoff is an explicit user Save action after a durable verified receipt; it is
reported as browser-download, never proof of an OS save. Persistent storage is
worker-owned under the storage lock; no-lock sessions remain memory-only.

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
  the hub's last Hello wins. Every superseded tab, including a visitor, parks
  until an explicit player Files action; login/reconnect never re-queues it.
  The elected service holds the storage lock for its dedicated worker from
  Phase 1. IndexedDB needs no
  sync handle; Phase 5 OPFS does, otherwise bounded memory fallback.
- Endpoint loss uses fresh Hello ids with 1-second exponential backoff capped
  at 60 seconds plus bounded jitter; only a continuous 30-second outage produces
  a player notice. Restore the idle v1 receiver during v2 recovery for the same
  confirmed owner, never old operation authority.
- Phase 1 database version 1 creates owner/attempts/offers/exports plus payload
  pieces/transfers, not later share/content/queue stores. Sender/id/index partials
  survive reload for seven days in Phases 1-3; a fresh accepted same-sender/id/size
  offer adopts them under a new t, then verifies the full root before receipt.
  A whole-file mismatch fences all referencing attempts, atomically purges the
  sender/id pieces and transfer record, then reports integrity failure; the
  next fresh accepted offer starts from zero.
- Timer work uses bounded due buckets, not full registry scans. Input/cache/
  fanout/record bounds replace application output pacing. Leases remain.

## Review resolution

| Finding | Resolution and contract location |
| --- | --- |
| H1 | Peer validation explicitly limits hub to bytes/structure. Files Name/Search and data Path rules assign NFC, categories, scalar/token counts, folding and matching only to clients. |
| H2 | Peer Raw ingress caps bytes before the existing try and keeps only parse_json inside it. The parser returns a server-only {0, reason} list; handle_message sends the bounded package Error using captured ctx outside catches, then stops before mutation/dispatch. No new catch or raw v2 fallback; retained first-wins values and bounded post-parse checks remain required. |
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
| M9 | Architecture defines Files-only queued Web Lock election, waiting followers, automatic handoff and worker storage lock. End superseded parks EVERY tab kind, including visitors and no-lock tabs, until an explicit player Files action; login/reconnect never re-queues it. Game login remains unchanged. |
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
| B1 | Final coordinator decision supersedes the earlier cap-inside-try wording: Peer Raw ingress and Architecture put the cap before the existing try, with ONLY parse_json inside. The existing except returns a v2 rejection reason; no new catch and no parser output. |
| B2 | Peer Raw ingress and Architecture name #3838:handle_message: capture ctx/key before parsing, recognize {0, reason}, send its bounded package Error using that ctx outside catches and return before mutation/dispatch. Add ctx only to successful v2 maps; #2729 passes ctx to v2 dispatch. |
| B3 | Peer capability discovery and Architecture name #4004:handle_set / handle_remove handle_add and existing session.gmcp_data["supported_packages"]. Set establishes known-complete; Add/Remove update it, removing a required package invalidates endpoint. Scope all updates/query replies to transport key. |
| B4 | Files and Architecture use symmetric PLAYER .gaglist membership only; .sgaglist is excluded as a sound gag. #6:set_gaglist, #6:gc_gaglist and all direct .gaglist writers notify old/new affected player pairs after mutation. gag_p and object/location/caller gags are excluded; same predicate for v1. |
| B5 | Architecture keeps game login unchanged and queues one navigator.locks.request without ifAvailable. Waiting eligible followers take over on release. Every End superseded recipient stays parked until a player Files action, including visitors; no-lock memory-only tabs follow the same rule. |
| B6 | Peer Endpoint recovery specifies fresh-id Hello, nominal 1-second doubling to 60 seconds with bounded jitter, rate/busy minimums, stable-Ready reset and one delayed 30-second unavailable notice. legacyV1 uses explicit FileTransfer 1 plus no ready v2 target. Architecture restores idle v1 reception during recovery and adds acceptance rows. |
| B7 | Architecture Exact Phase 1 client build inventory names package/service/endpoint/transport/session/ctl/frame/offer/storage/worker/export/legacy/UI modules. Database version 1 creates six stores: owner, attempts, offers, exports, pieces, transfers. Worker/lock start in Phase 1; no OPFS until Phase 5. Types 1-5/11 only; later stores/features listed as out of scope. |
| L-new-1 | Rejected the suggested Phase 1-3 reload regression per coordinator; fixed it instead. Architecture and Data retain same-owner/sender/id/size partials for seven days, fresh Offer/acceptance/new t after reload, provisional have then complete-root verification. Phase 4 replaces peer keys with verified owner/id content. v1 remains isolated. |
| L-new-2 | Peer registration waits for no live operation before capability re-Hello; enforce a lower limit locally immediately at accept/get, cancelling unsafe work explicitly first. Acceptance matrix covers limit changes without needless live consent revocation. |
| L-new-3 | Architecture Phase 1 row calls Revoke an outbound helper, never an inbound hub handler. Client Files receives it. |
| L-new-4 | Peer documents Supports.Get as a new extension, reuses saved complete Sets, checks gag before probing, coalesces targets, limits target probes to one per five seconds across requesters, caps pending/cooldown records at 256 and handles unsupported-query silence as unavailable. |
| L-new-5 | Architecture ctx uses the player object's own uuid for principal_uuid. Capture incarnation at Hello and compare only through $object_utils:incarnation(player) (#52 verb 54), never a direct property read; hub needs control/wizard permissions. connection_key remains fresh per transport. |
| L-new-6 | Architecture Offer state now labels received export substate (local) and explicitly says none is stored by the hub. |
| C1 | Architecture reload resume, storage inventory and Data full-mode rules require fencing/draining all from/id attempts, then atomic deletion of every retained piece and the transfers record, clearing bitmaps/references/accounting before reporting whole-file integrity failure. No receipt/export; next fresh accepted offer starts from zero, matching v1 discard-on-failure. |
| C2 | Peer Raw ingress and Architecture #3838 integration keep only parse_json in the existing try. Parser returns {0, reason} without output; handle_message has ctx and sends the package Error outside all catches before returning. Output failures propagate. |
| C3 | Files and Architecture explicitly exclude .sgaglist: $mcmp:play (#1811 verb 0) checks sgag_p for sounds. Only .gaglist blocks files, in v1 and v2. |
| Final L1 (visitor tabs) | Architecture election, Peer recovery and acceptance matrix park every superseded tab kind, including visitor/page-nonce and no-lock tabs. No automatic re-queue/Hello, even on login/reconnect; only a player action such as Files “Use this tab for file sharing” re-queues it. |
| Final L2 (incarnation) | Architecture ctx reads incarnation only through $object_utils:incarnation(player) (#52 verb 54), at Hello and subsequent checks, with required control/wizard permissions. Its lazy initialization prevents a missing-property read. |
| Final L3 (guest) | Architecture ctx and Peer canShare define guest exactly as $object_utils:isa(player, $guest). Coordinator live evidence: $guest is #31; #2271/#2272 have parent #31. |

The review's small-Phase-1 cuts are applied: no Restart/session generations,
export hub substate, ctl progress, nine independent rate buckets, MOO output
pacing/reserve, hub Unicode work, or premature list/search/presence/Policy/share
handlers. Base leases, consent, revocation and direct-send parity remain required.

## Surprises and practical limits

- A received RTC channel can already be open when installed and subsequently
  fire its open callback; hello needs an idempotence guard. The real browser
  fixture caught this; fake RTC alone did not.
- Hub receipt events can outrun final data-channel ready/credit/complete frames,
  especially for zero bytes; terminal handling must allow this ordering.
- Guest character names from look me use underscores, while the userlist's
  selectable display labels use spaces. Browser acceptance selects the actual
  option only after identifying both characters independently.
- Origin reservations live in a separate minimal quota registry; the owner
  database still has exactly the specified six version-1 stores. No later-phase
  stores, OPFS, list/get/search/presence/Policy or range frames were introduced.
- Real screen-reader speech, cross-browser/device runs and live-v2 hub acceptance
  remain unverified. See the validation report for the complete pending matrix.

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

Keep the preference off. Integrate the actual Phase 1 hub and run every applicable
architecture acceptance row with the browser/client/hub revisions recorded before
considering production v2 activation. The independent reference hub tests client
contracts; it does not validate native MOO parsing, output pressure, server rate
buckets or the deployed legacy observer. Later phases remain out of this task.
