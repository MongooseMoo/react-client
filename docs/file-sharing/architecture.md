# File-sharing v2 architecture and delivery plan

Status: normative target architecture and acceptance plan; specification only.
The wire contracts are [Client.Peer 1](../GMCP/packages/client-peer.md),
[Client.Files 1](../GMCP/packages/client-files.md) and
[data protocol 1](peer-protocol.md). Those files define exact schemas and limits;
the implementation must satisfy all four documents together. `Client.FileTransfer 1`
remains in service. No implementation, deployment or live acceptance is claimed.

## Requirements and evidence boundary

Sharing is public to online players once enabled, off by default, with gag
enforced on discovery, signaling AND established sessions. Share setup must say:
**“Anyone online can browse and download your shared files. Connecting lets the
other player see your IP address.”** Browsing/downloading and direct acceptance
also disclose a peer address; disclose that at those actions. Search UI also
says that the query text and requester identity go to online sharers. Use direct-capable
ICE (`iceTransportPolicy:"all"`), with no forced TURN. A direct connection may
fail; do not promise successful NAT traversal. Folder selection is an explicit
user action. Firefox/Safari users re-pick each visit. Guests can consume shares
and use direct send, but cannot share. Once configured, remembered sharing intent
resumes at login only after handles/permissions/index are usable; a browser
permission gesture or re-pick may be necessary. Never announce unavailable roots.
The MOO sees offer metadata, share counts, search queries/results and signaling;
lists, manifests, ranges and file bytes go only over RTC.

Multi-GB support is REQUIRED in Phase 5, with a bounded 10 GiB file ceiling and
streamed Chromium disk export. The initial ceiling remains 100 MiB until that
phase passes. Outside the feature-detected streamed-disk path, the receiving
ceiling is 100 MiB, displayed before acceptance/download. No automatic giant Blob
fallback. v1 retirement, partial-source uploads, moderation, room/allow-list
sharing, voice and Merkle-tree redesign are outside this task.

The following baseline observations were checked at source commit
`03a193ba2add2cb0d40bd9b21b508006f7512c96`. Citations identify existing code;
everything following the table is a proposed requirement unless explicitly
called baseline. The coordinator supplied production JSON probes during review: null parses as
E_NONE but generates as the string "E_NONE", and duplicate/case-differing keys
merge first-wins. These are coordinator evidence, not a live test by this author;
this task must not contact or modify the MOO. Phase 0 is a separately
assigned dependency, not evidence of a live repair.

| Existing behavior / constraint | Source evidence |
| --- | --- |
| Interfaces separate signaling, storage, transport and public operations. UI calls send/accept/reject/cancel and renders per-operation snapshots. | `src/fileTransfer/types.ts:43-56,81-90,99-118,173-214`; `src/components/FileTransfer/index.tsx:76-100,116-142`. |
| A transfer owns one PC and one ordered channel, not a pair session. | `src/fileTransfer/rtcLink.ts:74-99,244-248`. |
| Live identity is peer plus content id; the baseline does not allow two same-content operations between a pair. | `src/fileTransfer/FileTransferEngine.ts:77-90,117-123`. |
| Defaults include 100 MiB files, five-minute offers, 30-second inactivity, five-minute verification, 60-second reconnect wait, 3 reconnects, 4/64 pending offers and seven-day partial retention. | `src/fileTransfer/FileTransferEngine.ts:63-73`. |
| Content root hashes ordered raw 16 KiB piece digests; an empty file has no leaves. The implementation collects/concatenates digests. | `src/fileTransfer/contentId.ts:7-10,25-31,35-65`; `src/fileTransfer/wire.ts:16`. |
| Sender expands missing pieces to an array; range decoding expands a Set. | `src/fileTransfer/outgoingTransfer.ts:173-193`; `src/fileTransfer/wire.ts:190-219`. |
| Arrival checks index/length; final verification rereads all pieces and builds a Blob before delivery. Completion/cancellation can discard the transfer's peer-keyed data. | `src/fileTransfer/incomingTransfer.ts:119-126,193-199,222-239,259-297`. |
| A received file can confirm a missed complete without another save; an unknown resume after reload requires a fresh decision. | `src/fileTransfer/incomingTransfer.ts:137-147`; `src/fileTransfer/types.ts:30-38`. |
| IndexedDB piece keys include from/id/index, INSIDE an owner-specific database. Owner includes runtime, player UUID and object reference. | `src/fileTransfer/storage.ts:28-35,50-56`; `src/stores/personalDataStore.ts:5-13`. |
| Memory storage is used without ready persistent-owner policy or during a visitor session; delayed delivery checks captured ownership. | `src/fileTransfer/createFileTransfers.ts:31-42`. |
| Application creates a Blob URL and invokes an anchor download; ICE allows direct paths and configured TURN/STUN. | `src/fileTransfer/createFileTransfers.ts:15-29,45-56`. |
| Client resets/disposes transfer service on disconnect and identity changes; lazy package callbacks carry a generation guard. | `src/client.ts:153-184`; `src/gmcp/Client/FileTransfer.ts:94-122`. |
| Signaling writes target in sender for Accept/Reject, reads sender as origin, and tags ICE with content id. | `src/fileTransfer/gmcpSignaling.ts:35-61,145-175`. |
| Advertisement includes enabled versioned packages and is sent at startup. Userlist routing uses object references. | `src/gmcp/Core.ts:85-102`; `src/gmcp/session.ts:75-81`; `src/fileTransferPeers.ts:11-27`. |
| Notifications subscribe independently of the transfer panel. Older incompatible builds already share the v1 package name. | `src/components/FileTransfer/useFileTransferNotifications.ts:31-40`; `docs/GMCP/packages/client-file-transfer.md:238-240`. |

## Ownership and state model

One service captures an immutable owner plus local service generation. Persistent
owner key is exactly `JSON.stringify([runtime,playerUuid,playerRef])`; endpoint
epoch is a live authority boundary, not part of that persistent key. Never key
personal data by playerRef alone. A temporary visitor/guest gets a fresh
page-scoped ephemeral owner `JSON.stringify(["ephemeral",hub,self.epoch,nonce])`;
no lookup of remembered account roots, queues or handles. It may use temporary
OPFS for large direct/download operations if all receive/export checks pass;
it does not gain durable account consent or sharing privileges.

```text
OwnerService(owner, localGeneration, selfEndpoint, leaseDeadline)
  SessionPool[remote Endpoint] -> session Id, hub/client state, ctl, attempts
  OfferTable[(sender Endpoint, offer Id)] -> consent, metadata, t, receipt/export
  DownloadTable[content Hash] -> pinned size/manifest, verified bitmap,
                                 source attempts, consumers/leases, queue state
  ShareIndex[revision] -> approved roots, virtual paths, pinned Files/manifests
  StorageOwner -> exclusive writer, reservations, recovery/GC
  LegacyService -> unchanged v1 transfers, links, signaling and storage
```

A session is transport, not an offer or content cache. The offer table separates
distinct decisions for identical bytes. One download record merges verified
content for all local consumers under this owner; size is immutable and checked
against every source, not a second conflicting content slot. A direct offer,
an explicit saved-map/file download, an export and a source attempt each hold
separate leases. A local queue item has its own Id and desired filename, id/size,
source hints, state and export choice. It is user intent, never remote consent.

Source attempts contain peer endpoint, t, a, session Id, mode, assigned
ranges, credits, deadlines and cancellation fence. Completion of a range closes
only that request; only the DownloadTable knows when all pieces are verified.
Offer delivery is recorded independently for every accepted offer. Reusing
cached verified content can avoid network bytes, but cannot bypass a new direct
decision or invoke an earlier destination/save action without authorization.

Logical states:

| Owner object | States / transitions |
| --- | --- |
| Session | reserved -> offering -> answering -> established -> closed, identical to Peer hub states; retry closes/fences the old PC then Reserves a new session Id. |
| Offer | preparing (local hashing), pending, accepted, then rejected/withdrawn/cancelled/expired/revoked/received as in Files. Received has a separate (local) export substate; the hub stores no export substate. |
| Content download | queued -> reserving -> manifest -> receiving -> verifying -> verified; paused/failed/cancelled releases consumer references but does not erase others' data. |
| Export | none -> awaiting-user -> exporting -> saved/browser-download; errors retain verified content; crash while exporting -> export-uncertain. |
| Share | disabled -> needs-handles/permission -> scanning -> ready/published; a new revision invalidates lists/search; recheck current id/size for active gets and retain unaffected files. Permission loss stops affected uploads immediately, before rebuilding/disabling. |

Every async callback captures owner, localGeneration, endpoint epoch, session
Id and attempt fence as applicable. Recheck before starting a read,
publishing a bit/receipt, signaling, exporting or announcing. Identity switch,
visitor change, logout, local hub loss, lease expiry and gag stop relevant work
before UI reset. A worker receives cancellation, and its old output cannot commit
after the fence. Persist resumable bytes; never transfer live authority to a new
account or endpoint. Rehydrating a queue performs fresh capability/policy checks.

## Owner-scoped storage and leases

Use IndexedDB database `file-sharing-v2:<ownerKey>` (new namespace, independent
of v1). The table describes the eventual logical stores; the exact Phase 1
database version and physical stores are specified below, not all created up front.
Stores and primary keys:

| Store | Key and required fields |
| --- | --- |
| owner | singleton: full ownerKey, schemaVersion matching the installed database version (1 in Phase 1), writerGeneration, next-GC time, reserved/committed byte accounting. |
| content | id: immutable size/algorithm, manifest-root status, manifest coverage, bitmap, payload presence, touchedAt, recovery state. |
| attempts | t: owner/id/size, immutable source Endpoint/offer/kind binding, provisional location/bitmap, bytes/reservation, current writer a and fence. New a reuses held bytes; never mixes unrelated sources. Before Phase 4 the location references the sender/id partial store below. |
| leases | lease Id: content id, consumer kind/id, writerGeneration, expiresAt; immutable owner. |
| queue | local queue Id: id/size/name, source hints (player only, refreshed before use), state, explicit intent and retry timestamps. |
| offers | `(sender endpoint serialized tuple,offer)` plus metadata, received/cancelled tombstone, t, export attempt/outcome; no persisted active grant. |
| roots | local root Id: user-chosen alias, directory handle where supported, enabled intent and permission/index fingerprint; never a remote path. |
| index | virtual Path: local root Id + local relative locator + size/mtime hint, pinned content hash and digest reference, published revision. |
| exports | export Id: consumer Id, id/size, attempt state, chosen handle if persistable, outcome; never silently reuse after reload. |

Elect only the Files endpoint role BEFORE Hello with an exclusive Web Lock
`file-sharing-v2:endpoint:<ownerDigest>`, held while that file service is active.
ownerDigest is full lowercase SHA256 of UTF-8 ownerKey. EVERY tab continues
the existing game auto-login/reconnect behavior unchanged. Once authenticated
and policyReady, each same-owner tab queues ONE `navigator.locks.request` with
mode exclusive and an AbortSignal for identity/logout cleanup; omit ifAvailable
(never use ifAvailable:true or polling). Only its granted callback starts the
Files service and sends Peer.Hello. Hold the callback promise until disposal.
Other tabs register NO Files endpoint and show “File transfers are active in
another tab”; there is no BroadcastChannel proxy. When the holder closes or
releases, the next queued eligible tab acquires the lock, rechecks its current
identity/connection/policy, acquires storage ownership and sends a fresh Hello.
Abort obsolete queued requests on logout/identity change. Fence and drain old
file work, release storage, then release election on logout, identity change,
transport loss or supersession. After disposal for reasons OTHER THAN End
superseded, a still-eligible tab may queue again at the tail. After End superseded,
EVERY tab kind, including visitors, stays parked and NEVER automatically queues
for the endpoint lock or retries Hello, even after login/reconnect. Only a player
action, such as choosing “Use this tab for file sharing” in the Files panel,
re-queues that tab. This never changes the game's reconnect behavior.
Visitor owners use their page nonce, not remembered account data; the hub's
single-endpoint rule still arbitrates distinct explicit visitor logins.

The elected tab creates one dedicated storage worker and additionally holds
exclusive Web Lock `file-sharing-v2:<ownerDigest>` during payload access.
Increment writerGeneration transactionally on writer acquisition; every metadata
write and lease requires it. If the elected tab cannot acquire storage ownership,
stop/diagnose rather than registering a competing writer. Takeover occurs only
after old locks release and all old callbacks are fenced. Without Web Locks,
EVERY authenticated policyReady tab may register once in 100 MiB total memory
mode, with no persistent storage/queue or OPFS. The hub still admits one endpoint
per player: the last valid Hello supersedes its predecessor. A superseded tab
parks until an explicit player Files action permits one fresh registration;
login/reconnect alone never unparks it, so tabs cannot fight. Other recoverable endpoint loss
uses Peer's backoff. This is the chosen no-lock fallback, not an election that
blocks game login. Display the lack of durable reload resume before acceptance.

Leases are explicit records, renewed every ten seconds with 30-second lifetime
by the current writer. Before Phase 4 these operation references/expiry fields
are embedded in attempts/offers/exports, not a premature leases store; expiry
after reload restores no authority. Persistent queue/receipt metadata is a separate durable
reference while it exists, not an indefinitely renewed abandoned process lease.
GC checks references AND live leases in the writer's serialized transaction.
One cancelled offer releases only its own lease. Source attempts cannot call a
global `discard(id)`. Verified pieces cannot be overwritten by provisional bytes;
deduplicate only after exact length/digest checks. Serialize a content's writes,
and do not give the same missing piece to multiple active sources. Atomic
attempt fencing prevents late writes after reassignment, even when an old
storage promise resolves later.

Before a large receive call navigator.storage.persist() from the setup/accept
flow; denial is reported as eviction risk, not a claim of durability. Reserve
the operation's worst-case payload bytes plus manifest,
bitmap and bounded journal/temporary staging. Count provisional duplicate bytes
too. Default persistent owner budget is the lesser of 20 GiB and 80% of the
origin quota estimate; an unavailable/insufficient estimate denies a new large
operation, with a visible storage error. Also require reported free quota after
reservation of at least max(64 MiB,10% of the reservation). Origin-wide
reservations are serialized under an additional short-lived Web Lock
`file-sharing-v2:quota`; otherwise two owners could both reserve the same free
space. Persist totals in a small origin quota registry containing owner digests
and byte counts, never filenames/consent; reconcile against owner metadata on
startup before granting reservations. Re-query actual usage, account for other
origin features and handle QuotaExceededError at every write. Defaults before
Phase 5 are 100 MiB/file and 1 GiB/owner. Quota policy can LOWER advertised receive
limits, never exceed protocol caps. Never promise destination disk space based
on origin quota.

Queue at most 128 content items/owner and 16 source hints/item; at most 8 active
source downloads and 3/content in Phase 6, one/content earlier. Pause new work
when reservations fail. In-memory mode has a 100 MiB total payload budget, with
bytes reserved up front; it must not accept several 100 MiB files concurrently.
Keep at most 8 MiB queued payload buffers, two hashing/verification jobs, one
directory scan and one file-list parse/tree worker at a time. Hash reads are
<=1 MiB, at most four digest operations in flight per job, cancellable between
reads; no unbounded promise fanout. Bound index at 100000 files/1 TiB total and
current file/list caps. Size/mtime is a rescan optimization, not verification:
pin File bytes/manifests for an upload, compare/read consistency, invalidate and
reindex changed/unreadable sources. Do not knowingly serve changed data under
an old id. Refuse a root scan that cannot produce a complete bounded snapshot.

Unreferenced partial/provisional data expires after seven days untouched;
unreferenced verified cache after 24 hours. Under quota pressure delete
unreferenced expired data first, then unreferenced least-recently-used verified
cache, then unreferenced partials; never delete a live consumer/queue/export's
bytes automatically. Offer tombstones last at least 24 hours, bounded at 1024;
export receipts last with their queue/offer history reference. On exhaustion
pause/reject new work rather than erase an outcome needed for safe recovery.
Ephemeral owner data is removed on orderly shutdown and stale ephemeral roots
older than 24 hours are removed on next startup under the quota lock; it is
never imported into a remembered account. Cleanup checks full ownerKey/digest
and writer lock before deleting any owner subtree.

### OPFS layout and crash consistency (required Phase 5)

```text
file-sharing-v2/
  owners/<ownerDigest>/
    owner.json                         # full ownerKey + schema version only
    contents/<id>/payload              # one offset-addressed file, not one file/piece
    contents/<id>/manifest             # N raw consecutive 32-byte leaves
    provisional/<t>/payload            # logical operation, current a is a writer fence
    provisional/<t>/manifest
    lists/<snapshot>/encoded          # bounded temporary gzip/list artifacts
```

Only fixed literals and lowercase validated ids become filesystem components; no Name/Path/root alias is used in storage paths.
Validate owner.json against the captured full ownerKey before opening content.
IDs deduplicate only inside this owner root. Keep bitmap/coverage and at most
1 MiB pending write journal per owner in IndexedDB; do not create 655360 OPFS
files/objects for a 10 GiB payload. OPFS persistence REQUIRES
createSyncAccessHandle in that dedicated worker, offset writes and flush().
Without it use the <=100 MiB total in-memory mode; do not emulate durability
with createWritable swap files. Feature-detect by opening an actual temporary
handle and clean it up; API property presence alone is insufficient. Use compact
bitmaps and range iterators. Hash manifest roots using WebCrypto over one bounded
<=20 MiB raw digest buffer in a worker, never an entire multi-GB payload; do not
claim incremental WebCrypto SHA256. The small root buffer does not change the
content algorithm.

Commit sequence per verified piece/bounded group: check fence and digest ->
write exact payload offset -> flush payload -> transactionally set durable
bitmap bits and update accounting/touch -> only then acknowledge stored.
An uncommitted write is provisional; after a crash it can be rehashed, never
assumed durable. On startup validate manifest root/coverage, check payload
existence/length, and rehash every claimed held piece before advertising it as
verified/resumable. Missing/truncated/evicted/invalid data clears corresponding
bits and creates missing ranges; never export silently corrupted data. Rebuild
reservations/journals and expire stale leases under the writer lock. UI can show
“Checking saved partial download” while this bounded streaming recovery runs.
Crash between payload flush and bitmap commit merely loses a resumable bit;
crash after commit is still checked on recovery. Never trust metadata alone
after eviction. Storage errors pause the consumer, retain valid referenced data
when possible and release abandoned reservations.

Phases 1-3 use IndexedDB with bounded 100 MiB files; they do not require OPFS
or a sync access handle. The dedicated storage worker and storage lock ARE
required from Phase 1 for persistent owners. Full-mode data is provisional
until a full root check. Each t keeps immutable source/offer metadata and a
writer fence; reconnecting a+1 under unchanged authority reuses its held bitmap
only after fencing/draining old writes.

Direct-send reload resume MUST also work in Phases 1-3. Inside the SAME
persistent owner database keep pieces keyed by `(from,id,index)` and a touch/
size record keyed by `(from,id)`, matching v1's peer/content keys and seven-day
untouched retention (`src/fileTransfer/storage.ts:28-35`;
`src/fileTransfer/FileTransferEngine.ts:63-73`). Here from is the authenticated
sender's canonical Player, never a display name or untrusted ctl identity.
After reload/epoch change a fresh Offer, fresh acceptance and NEW t bind to
current source authority; only then may that t adopt stored pieces for the
same from/id AND size. Rehash held pieces/check lengths on recovery, advertise
them as provisional have, and verify the COMPLETE root against the new offer's
id before receipt/export. No earlier grant, t, destination or save action is
restored. Different senders cannot contribute provisional pieces to this cache.

The t-specific bitmap references committed peer/id pieces rather than requiring
a t-specific physical payload copy. Serialize writes per from/id under the
storage owner; each commit checks current owner/writerGeneration/t/a. Shared
cache records hold bounded active-t references in attempts; never overwrite a
committed piece with conflicting bytes (fail that attempt). Two freshly accepted
same-content offers may reference held same-sender bytes but retain independent
consent, cancellation and receipts. One cancellation releases only its references;
it cannot erase another operation's held bytes. Reuse after a new epoch is this
explicit same-sender/id exception, not permission to mix unrelated sources or
resurrect revoked work. Storage/quota limits may evict unreferenced partials as
specified above; memory-only sessions cannot promise reload durability.

On a whole-file root mismatch for this direct-send cache, the storage owner
first fences and drains EVERY attempt referencing `(from,id)`, then atomically
deletes EVERY stored piece and the transfers record for that key, clearing its
attempt bitmaps/references and adjusting byte accounting in the same transaction.
Only after the purge does it report the integrity error; no receipt/export is
allowed. A later fresh accepted offer starts from zero. This integrity purge
applies even when multiple attempts reference the corrupt cache; cancellation
alone still releases only its own references. It matches v1's discard-on-failure
behavior (`src/fileTransfer/incomingTransfer.ts:193-196,271`).

Phase 4 replaces the peer-keyed partial store with owner/id verified content
and leases. Authenticate the complete manifest and verify imported pieces before
promotion; keep unverified bytes isolated until checked. Promotion reserves any
temporary duplicate capacity and cannot clobber verified content. Retire old
partial records only after successful migration or ordinary retention/GC, never
erase resumable bytes merely to upgrade a schema.

### Legacy partials

Keep the v1 database and active v1 engine untouched throughout this plan. v2
content identity matching v1 does not import consent, active links or receipts.
An optional explicit/lazy import can read the SAME owner's legacy peer/id
pieces after obtaining expected size and hash from a current authorized
operation. With an authenticated manifest, check each exact piece before
copying into verified content; without one copy into provisional space and
verify the full root later. Do not simply remove `from` from a database key.
Do not delete v1 data/links while legacy operations run, or claim prior delivered
payload is still cached. v2 uses copied/promoted bytes under its own leases;
old engine cleanup cannot erase them. Migration is optional; safe isolated
retention of old partials is the initial rule.

## Export and exactly-once boundaries

Verified OPFS content is a downloaded object, not a file saved in the user's
chosen folder. For the streamed-disk path, feature-detect showSaveFilePicker and
usable FileSystemWritableFileStream; acquire a handle from an explicit user
gesture at acceptance/start, or show a Save action after download. Permission
and picker calls must run with activation, not after an asynchronous download
ends. In an Accept/start click, invoke showSaveFilePicker BEFORE the first await;
only then await it, request persistent storage and run capacity/preflight work.
Never await storage.persist, hashing or a capability request before invoking
the picker from that click. Source: [File System Access permission rules](https://wicg.github.io/file-system-access/#permissions).
OPFS is origin storage through the [File System Standard](https://fs.spec.whatwg.org/).
The receiving ceiling announced in Hello is at most 10 GiB only when this path
and OPFS writer are available; otherwise at most 100 MiB. Revalidate feature,
permission, reservation and export expectations on every new accept/get.

Export pins a content lease, verifies owner/receipt/fence, records `exporting`
and a fresh export Id before the side effect, reads only verified content in
<=1 MiB chunks, awaits writable backpressure and successful close, then records
saved. After saved, release the export/receipt payload reference immediately;
retain the lightweight receipt/tombstone. Delete the payload when no other
consumer, explicit retained queue item or live lease holds it; do not apply the
24-hour cache retention default to this released saved payload. Failed
close/permission/disk-full/cancellation keeps content verified and
shows “Downloaded; save failed” with a user retry. Cancel/abort the destination
stream when possible; do not assert that a partial external file was removed.
Cancel of a save picker leaves awaiting-user, not failed download. Never hold
the uploader's channel open while waiting for a gesture. Explain before a large
receive that OPFS staging plus destination export can temporarily need about
twice the payload disk space; an origin quota estimate cannot guarantee external
destination space.

The fallback constructs a browser-download Blob/URL ONLY for <=100 MiB within
the reserved memory/payload budget. Record browser-download as a qualified
handoff, never disk-save confirmation. Release its URL after the browser has
been given the navigation/click, and retain receipt state so a replay cannot
repeat it. In all modes, a fresh user save action can explicitly export another
copy. A remote push replay cannot.

No protocol can make a browser side effect and IndexedDB transaction atomic.
If a crash occurs after recording exporting but before its final receipt,
rehydrate as export-uncertain and require an explicit user decision before
retrying; never auto-click or overwrite again. Record content receipt before
complete/receipt-only Files.Outcome, export receipt after successful close/handoff.
Report detailed export state only through local receipt/ctl outcome. A missed
complete returns the recorded operation outcome, not another delivery. Across
a new endpoint epoch an old accepted offer is not resurrected; a fresh offer
may reuse content but gets a fresh consent/export decision. “Exactly once” here
means no automatic repeated export for a known operation, with explicit
uncertainty after a crash, not a claim of atomic OS save.

## v1 compatibility and transport choice

Retain the complete legacy owner/engine/storage/RTC path alongside v2, not just
its GMCP sender. Each logical direct offer chooses a transport ONCE, before
sending any remote offer. Query current Peer.Capabilities after Ready:

1. Both endpoint bundle versions 1 plus data 1/base -> v2. Use accepted-offer
   authority, a pair session and transfer attempts from this contract.
2. The hub explicitly reports legacyV1 true: the target advertises
   Client.FileTransfer 1 and has NO ready v2 endpoint, even if it advertises
   Client.Files. This includes a new target recovering from endpoint loss.
   Choose v1 <=100 MiB. New clients keep the compatible legacy engine and accept
   inbound v1 with sharing off. No exact-build allowlist, tag/hash parsing or
   cached-build age restriction. If the hub lacks the target package list it
   queries capability as specified in Peer, never treats unknown as legacy.
3. Otherwise fail with an actionable unsupported/unavailable connection result.
   No downgrade on timeout, gag/denied, malformed, rejection, ICE failure,
   post-offer unsupported, or receipt uncertainty. Never send duplicate v1/v2
   offers hoping one succeeds. A capability race fails that operation; a user
   may retry a new operation after refreshing discovery.

An old hub that silently ignores Hello is a deployment error, not fallback
evidence. Hub-first rollout is required; existing v1 clients continue their
ordinary protocol while the new client is gated off. Baseline/browser testing
still exercises deployed/cached v1 builds, but their build strings do not control
admission. The settled explicit-package rule replaces the former tested-build
restriction; it cannot distinguish historical incompatible encodings that reused
the same package version. Such wire failures are visible, with no second offer
or automatic transport downgrade.
Do not opportunistically move active v1 operations onto v2. New v2 features do
not alter the legacy wire or make legacy private files shared.

### Gag safety while v1 remains

Supported compatible v1 endpoints must also stop established transfers on gag.
They cannot understand Files.Revoke. From Phase 1 the hub observes EVERY admitted
legacy Offer/Accept/Reject/Cancel in the existing relay, keyed by the two actual
connection keys and content hash. Keep accepted records for policy cancellation;
pending records expire after five minutes, accepted after 24 hours. Pending
tracking is best-effort (64/connection, 32768 hub-wide); on pressure drop the
oldest pending detail rather than rejecting or delaying a legacy Offer. No
terminal record counts toward admission; any diagnostic tombstones are a
separate 1024/connection, 32768 hub-wide LRU, freely evictable. Accepted live
tracking is bounded at 32/connection and 32768 hub-wide. Reserve tracking BEFORE
forwarding an Accept; if full, send policy cancellation for this new acceptance,
never evict an accepted stream and leave it untracked. Only real accepted work,
not rejected/expired offers or an attacker's pending offers, can consume this cap.

Capture EXACT address strings on actual forwarding: sender's peer key is its
original Offer recipient string; receiver's peer key is the relay-stamped Offer
sender string. Keep a separate compact directed route record for each live
connection pair even when pending offer details are dropped (up to 32768 pairs,
LRU for pairs without accepted transfers). This is not an assumption that both
strings are canonical #refs. If an untracked pending offer later gets Accept,
reconstruct the minimal accepted pair/hash record from those route strings and
authenticated Accept routing; no pending record means no v2 consent is inferred.
If route identity was evicted, cancel/refuse that acceptance rather than guess
a peer string; this is bounded-capacity failure, not failure caused by tombstones.
A connection pair cannot change its route strings while accepted transfers use
them: cancel those transfers with the old exact strings before admitting such
a change. Match hashes/addresses byte-exactly, not with case-insensitive map keys.

A same-pair/hash resume Offer requires its accepted live allowed record; never
extend the 24-hour grant. A fresh non-resume Offer still passes ordinary relay
checks and creates a new decision; blocked pairs are always rejected. Role-check
Accept/Reject using captured authenticated pair/routing and any retained pending
detail. Record Cancel before forwarding. Gag/disconnect/identity checks precede
all relay forwarding, including candidates/resume offers.

On either-direction gag, invalidate records, then synthesize directed
`Client.FileTransfer.Cancel {sender:<that destination's exact recorded peer string>,hash:<recorded hash>}`
to BOTH involved compatible connections, bypassing ordinary peer gag delivery
filters for this safety event only. The compatible core consumes sender/hash
cancellation (`src/fileTransfer/gmcpSignaling.ts:85-90,173-175`;
`src/fileTransfer/FileTransferEngine.ts:117-123`). Keep the per-transfer PC/engine
and wire unchanged. On disconnect, synthesize the cancellation to the remaining
connection and clear records. After the accepted-record 24-hour deadline,
synthesize cancellation too; do not drop tracking while allowing an untracked
stream to continue. Pending expiry likewise cancels both sides. These policy
cancels are queued immediately on directed safety output; never disconnect the
game for file-sharing load. Old v1 clients have no lease fail-safe. If a legacy
Cancel cannot be queued, retain a bounded pending safety event and retry it on
each output-drain/timer turn (up to ten seconds), block further relay activity
for the pair, and report unconfirmed cancellation; never claim an unreachable
old client stopped P2P. This transport limitation is not repaired by booting
the game connection either.
Terminal metadata may remain longer than actual P2P delivery
because the hub does not see complete; a late policy Cancel is harmless for an
already terminal core operation (`src/fileTransfer/FileTransferEngine.ts:244-255`).
Phase 1 acceptance must verify that behavior
against the tested baseline, including its established-session gag case.

Install the observer before opening the v2 gate. Pre-observer legacy operations
must drain, or their supported connections must reconnect, before that gate is
accepted; never claim established-v1 gag coverage for unrecorded old streams.
The endpoint registry also cancels any legacy transfers owned by a superseded
v2 connection. Peer.End/local identity reset must dispose both transports in a
new client, fencing existing work first. After a recoverable file-endpoint loss,
recreate the idle v1 receiver for the same still-confirmed policyReady owner
independently of v2 Ready; fresh v1 offers still require a new decision and the
relay's gag/connection checks. Otherwise the advertised v1 fallback during v2
recovery would have no receiver. Identity/visitor/logout changes require a new
owner service before either transport returns. These hooks retain v1; the
Phase 0 agent is not responsible for them.

## MOO interface and phase plan

These are exact REQUIRED TARGET verb names/signatures for the MOO implementer,
not claims about current deployed bodies. `$gmcp_peer` and `$gmcp_files` name
the two new children of `$gmcp_package`, registered as `Client.Peer` and
`Client.Files` version 1 in `$gmcp_registry`. Allocate object numbers on the MOO;
the aliases, schemas and call signatures below are the contract. Never hardcode
a new numeric object id into the client.

`ctx` is a SERVER-CONSTRUCTED map
`{player,principal_uuid,connection_key,guest}`: player is the authenticated MOO
object; principal_uuid is captured from that object's OWN nonempty `player.uuid`,
the same value sent as Char.Name.uuid by the Char package's `#3476:0`
(snapshot `mongoose.db.new.2026-10-18T080351`, `#3476:0`; client receiver
`src/gmcp/Char.ts:41-50`). It identifies the player principal, not a per-login token.
At Hello capture the incarnation through `$object_utils:incarnation(player)`
(`#52`, verb 54), which lazily initializes it; NEVER read the property directly.
Use that accessor for subsequent comparisons with the server connection record
to fence object reuse; the hub verbs need control or wizard permissions to call
it. Do not add it to wire schemas. Reject registration if
the UUID is missing/inherited or UUID/incarnation no longer matches. connection_key
is an opaque server-side identity for THIS underlying connected transport, and
guest is exactly `$object_utils:isa(player, $guest)` (`$guest == #31`; guests
`#2271` and `#2272` have parent `#31` in the coordinator's live evidence).
None are taken from incoming
JSON. At GMCP transport ingress bind each parsed message to that connection
before deferred routing; old connection messages must retain their old key.
`#3838:handle_message`/`#2729:route_message` must pass ctx for the two v2 packages;
the packages override `route_message(ctx, sub_address, data)` and dispatch only
the suffixes below. Keep the existing v1/other-package dispatch behavior intact.
Do not derive a source epoch from a player-only map if retired/multiple
transports can still deliver under that player. If the server permits only one
transport/player, still assign a fresh connection_key on every reconnect and
fence deferred work on that key. A transport integration unable to distinguish
old messages MUST fail registration rather than weaken epoch checks.

The source connection's complete Core.Supports.Set and subsequent Add/Remove
updates use the existing telnet session.gmcp_data["supported_packages"] map,
indexed by this connection_key for capability discovery. `#4004:handle_set`
marks the list known-complete; `#4004:handle_remove handle_add` updates it as
specified in Peer (Add/Remove alone cannot mark an unknown list complete). Retain
Core.Hello for ordinary diagnostics, not a file-compatibility decision. Replies and safety events use
`#3838:send_file_endpoint(connection_key,address,data)`, a new direct-to-current-
transport path that never broadcasts to all of a player's connections and never
applies the blocked peer as sender. It verifies the destination key remains
current. Store endpoint/session/offer/search/rate maps as ephemeral authority:
clear on startup, initialize a fresh hub Id and never restore grants from a
saved checkpoint. Persistent MOO properties may hold configuration,
not live permission after restart.

| Phase | Exact MOO work required | Client slice and exit gate |
| --- | --- | --- |
| 0 (separate agent) | On `#5897`, repair `handle_offer`, `handle_accept handle_reject`, `handle_candidate`, add `handle_cancel`: authenticated sender stamping, Accept/Reject recipient routing (legacy sender-as-target compatibility where needed), invalid-recipient guard. This row restates the supplied external dependency, not a performed change. | Compatible baseline direct send both directions through the repaired relay in two browsers; retain a fixed baseline for later comparison. |
| 1 | Register both packages but install only Peer base and Files offer/receipt handlers and outbound peer-or-offer Revoke helpers, plus lifecycle/legacy-observer helpers listed below. Revoke is hub-output-only, never an inbound handler. Enable `["base"]`. Add the byte cap before #3838's existing try, keep only parse_json inside it, return rejection reasons for handle_message to send with ctx outside catches, #4004 capability hooks, endpoint epochs/leases/recovery, reservation/Close and symmetric gag. No Restart, Unicode tables, hub export substate, ctl progress, output pacing, or list/search/presence/Policy/share-scope handlers. Unknown later suffixes return unsupported. | Exact module/storage/worker inventory below: v2 direct sends, multiplexed sessions, bind/ready, cancellation, reconnect/receipt AND reload-partial recovery, explicit v1 selection. Keep 100 MiB ceiling and isolated v1 storage. Do not enable production v2 until complete direct-send parity passes. |
| 2 | Enable lists; ADD Files.handle_status/handle_sharers plus Policy/Presence/share-scope Revoke, publishing/snapshot helpers and share authorization in authorize_session. Enforce offer-reserved session partition before enabling share Reserve. | Opt-in folders, bounded hashed index/list, browse and single-source full get. All upload/slot/channel/storage/parser caps already enforced. Sharing setting persists as owner intent. File removal/offline/gag tests pass. Direct send still passes sharing-off matrix. |
| 3 | Enable search in Ready; activate Files.handle_search/handle_result/handle_searchcancel plus search helpers and bounded fanout/record budgets. | Literal bounded hub search, grouped content results and fresh source discovery; does not imply all sharers were searched. Direct-send parity remains green. |
| 4 | Enable leaves in Ready; no new hub verbs. | Owner/id content manager, leases, authenticated complete manifests, persistent queue, per-piece verification and single-source verified resume. Keep 100 MiB until Phase 5; preserve separate export receipts and legacy data. |
| 5 REQUIRED | No new hub verbs; update deployment ceiling from 104857600 to 10737418240 only after client gate. Hub honors each endpoint's lower maxReceiveSize. | OPFS payloads/compact metadata, bounded workers/range iteration, streamed disk export and crash recovery, 2+ GiB/10 GiB tests, bounded non-stream fallback. Then permit multi-GB direct and shared files on capable v2 endpoints. |
| 6 | Enable ranges in Ready; no new hub verbs. | Multi-source receiver scheduling, at most three sources/content, finite want/batchEnd/rangeAck completion, reassignment/fencing and integrity isolation. Single-source and direct-send parity remain. |

Retirement is not a phase here. Do not remove `#5897`, Client.FileTransfer 1 or
its client implementation. A future explicit minimum-supported-version and
refresh policy plus acceptance evidence is required; online build snapshots
cannot prove that returning clients have upgraded.

### Exact Phase 1 client build inventory

All paths below are REQUIRED TARGET modules, not existing implementation claims.
Keep the current `src/fileTransfer/` legacy implementation and its database
unchanged. Phase 1 has no ShareIndex (Phase 2) or owner/id DownloadTable (Phase 4).

| Module / integration | Phase 1 responsibility |
| --- | --- |
| `src/gmcp/Client/Peer.ts`, `src/gmcp/Client/Files.ts` | Typed package definitions/version 1 registration, strict incoming schemas, canonical no-null outgoing messages, Peer base and Files offer/receipt/Revoke subset only. Files receives Revoke; only the hub emits it. |
| `src/gmcp/Core.ts` | Advertise both packages and handle inbound Supports.Get by sending the current complete Set. |
| `src/fileSharing/ownerService.ts` | Capture owner/generation, own SessionPool/OfferTable/StorageOwner/LegacyService, dispose both transports on endpoint/identity loss and fence callbacks. Gate v2 work on endpoint authority; restore only an idle v1 receiver for a still-confirmed owner during v2 recovery as specified above. |
| `src/fileSharing/endpoint.ts` | Files-only queued lock election, Hello/Ready/Lease/End, canShare, readiness deadline, silent recovery/backoff and delayed unavailable notice. |
| `src/fileSharing/transportChoice.ts` | Refresh Capabilities and choose v2 or explicitly eligible v1 once BEFORE each offer; no failure-based second offer. |
| `src/fileSharing/sessionPool.ts` | One PC/ctl per reserved pair, initiator-only SDP, bounded ICE, 8/2 offer-reserved partition, Connected/Close, idle close and bounded 1/3/9-second session retries. |
| `src/fileSharing/ctl.ts`, `src/fileSharing/frames.ts` | hello, push/accepted/error/outcome, cancel/cancelled, q replay and t/a binding; binary full-mode codec and flow control. |
| `src/fileSharing/offers.ts` | Sender/receiver decisions, immutable metadata/IP warning, t/a and offer state, receipt-before-Outcome, terminal tombstones and separate local export state. No restored active grant. |
| `src/fileSharing/storage.ts`, `src/fileSharing/storage.worker.ts` | StorageOwner facade and dedicated worker from Phase 1; serialized IndexedDB access, reservations, writer fences, same-sender/id retained partials, recovery/GC, bounded full-root hashing and atomic from/id purge on whole-file mismatch after fencing every referencing attempt. Worker owns database connections; elected service holds storage lock until worker drains/closes. Worker accepts owner/generation/fence-tagged commands, with bounded queues and cancellation. Memory-only mode uses bounded volatile records and grants no reload resume. |
| `src/fileSharing/export.ts`, `src/fileSharing/legacyService.ts` | <=100 MiB anchor handoff and export receipts; wrap the retained v1 engine as a complete transport, including incoming v1, without changing its wire/storage. |
| `src/client.ts`, `src/components/FileTransfer/` | Wire owner/endpoint lifetime beside configureFileTransfer, register packages and expose consent/progress/cancel/save/status. Preserve existing game login/reconnect behavior. |

Phase 1 persistent IndexedDB database is `file-sharing-v2:<ownerKey>`, native
database version **1**, with owner.schemaVersion=1. Create EXACTLY six stores:

| Store | Primary key / Phase 1 data |
| --- | --- |
| owner | Out-of-line singleton key `owner`; full ownerKey, schemaVersion, writerGeneration, reservation/committed accounting and next GC time. |
| attempts | keyPath `t`; immutable current source Endpoint/offer/kind/id/size, from/id cache reference, per-t held bitmap, reservation/reference accounting and current a/writer fence. On reload fence old attempts and restore no active grant. |
| offers | Out-of-line compound key `[JSON.stringify([sender.player,sender.endpoint,sender.epoch]),offer]`; immutable metadata, t and received/cancelled tombstones/local export outcome. |
| exports | keyPath `id` where id is the export Id; content hash in `contentId`, consumer/offer reference, exporting/final outcome and uncertainty state. |
| pieces | keyPath `["from","id","index"]`; immutable committed provisional bytes for authenticated sender Player/content Hash/piece index. Separate namespace from v1 despite matching key shape. |
| transfers | keyPath `["from","id"]`; pinned size/algorithm, touchedAt, retained-piece bitmap, full-root verification status and serialized cache-writer fence. Active-t references live in attempts and protect data from GC. |

The review's four-store suggestion omits payloads: pieces/transfers are necessary
for direct-send partial retention and reload parity. They stay peer/id-keyed
through Phase 3, with seven-day untouched retention and full-root verification.
Do NOT create content, leases, queue, roots or index in Phase 1. Later phases
increase the native database/schema version when adding their stores/migrations;
the nine-store logical target above does not authorize early creation. Phase 4
replaces peer/id partials with owner/id verified storage, verifying retained data
before retiring it. v1 stays `file-transfer-pieces-v2:<ownerKey>` version 1 with
its own pieces/transfers; v2 never opens that namespace for writes. Phase 1
needs no OPFS probe/access handle; sync-handle requirements start with Phase 5.

Phase 1 advertises ONLY `["base"]`. Implement binary types **1-5 and 11**,
full mode only (ready mode 0; complete outcome 0 is range-only and forbidden).
Types 6/9/10 (want/batchEnd/rangeAck) and 7/8 (leavesRequest/leaves) are gated
off and rejected; no list/get request, range mode, manifest exchange, shared
browse/search/presence/Policy, persistent queue, owner/id deduplication,
multi-source work, OPFS or streamed multi-GB export. The full-mode receiver
computes piece digests and the final root locally before receipt/export. The
existing anchor handoff is bounded to 100 MiB/file and the reserved total memory
budget. These cuts do not defer direct-send reload resume or the storage worker.

### Exact new handler and helper inventory

All `handle_*` receive `(ctx,data)` and dispatch only after bounded raw decoding.
Each enabled command has an explicit handler; unknown/disabled suffix ->
correlated unsupported, never silent drop. Client-sent outbound-only events are
malformed. Phase 1 installs only its listed base handlers. Add later-phase
handlers/helpers at that phase, and gate their enabled feature then.

| Owner | Verbs and required responsibility |
| --- | --- |
| `$gmcp_peer` | `route_message(ctx,sub_address,data)` whitelisted dispatch. `handle_hello`, `handle_capabilities`, `handle_reserve`, `handle_connect`, `handle_answer`, `handle_candidate`, `handle_connected`, `handle_close` implement the like-named wire commands. |
| `$gmcp_peer` | `admit(ctx,suffix,data)` shared schema/connection/rate/byte checks, returning registered source or a bounded error. `resolve_target(ctx,to,target)` exact online epoch lookup, no gag disclosure. `reserve_pair(source,target,auth,req)` atomic unordered reservation/join. `relay_signal(ctx,suffix,data)` role/state checks, whitelist construction and directed send. |
| `$gmcp_peer` | `reply(ctx,package,suffix,data)` directed current-connection reply; `error(ctx,package,req,about,code,refs,retry_ms)` bounded correlated failure; `close_session(session,reason)` invalidate then notify; `end_endpoint(endpoint,reason)` invalidate grants/sessions first, notify/withdraw via Files. `tick(now)` process due expiry buckets and lease buckets only, never scan all records; see timer algorithm below. `startup()` clear ephemeral registries/configure new hub Id/start tick loop. |
| `$gmcp_files` | `route_message(ctx,sub_address,data)`; `handle_offer`, `handle_respond`, `handle_withdraw`, `handle_cancel`, `handle_outcome`, `handle_status`, `handle_sharers`, `handle_search`, `handle_result`, `handle_searchcancel`. Phase 1 has only offer/respond/withdraw/cancel/outcome; add status/sharers at Phase 2 and search/result/searchcancel at Phase 3. Enabled handlers implement the wire checks exactly. |
| `$gmcp_files` | `authorize_session(source,target,auth,existing_session)` accepted-offer authority in Phase 1; add downloader-initiated current standing-share authority in Phase 2. existing_session is an optional MOO argument/map entry, never wire null. `transition_offer(record,action,actor)` atomic allowed-state transition, notifications and tombstones. `publish_policy(endpoint,status)` (Phase 2) validate revision/invalidate stale list/search authority, preserve current-index gets. `send_policy_pair(a,b)` (Phase 2) ordered Policy before Reserved. `revoke_pair(a,b,reason)` symmetric gag/offline, offers before Closed (search targets too from Phase 3). `revoke_share(endpoint,new_revision,sharing)` (Phase 2) send revision/sharing Revoke then Policy; no hub content index or blanket get cancellation. |
| `$gmcp_files` | `visible_sharers(viewer,cursor)` (Phase 2) bounded per-viewer snapshot/pages, recheck at delivery; `notify_presence(viewers)` coalesced changed event; `dispatch_search(record)` (Phase 3) bounded rotating actual targets; `deliver_result(ctx,data)` recorded-target/byte-structural/hash/size/result-budget checks (no Unicode matcher); `end_search(record,reason)` release targets and tombstone; `endpoint_lost(endpoint,reason)` offers/presence/search invalidation; `tick(now)` offer/search/cursor expiry and coalesced presence. |
| `$gmcp_files` and legacy relay `#5897` | Add Files `observe_v1(ctx,suffix,data,target_connection_key)`, `cancel_v1_pair(a_connection_key,b_connection_key)` and `expire_v1(now)`; hook `#5897:handle_offer`, `handle_accept handle_reject`, `handle_candidate`, `handle_cancel` through the observer/checks before forwarding. Add `#5897:send_policy_cancel(connection_key,exact_peer_string,hash)` using the directed transport output path, with exact legacy Cancel schema and per-direction recorded strings above. Files.revoke_pair/endpoint_lost and tick invoke these helpers, including legacy-only connections with no v2 Endpoint. |
| `$gmcp` (`#3838`, target integration) | In `parse_gmcp_message`, recognize v2 after address/data split; check the byte cap BEFORE the existing try and keep ONLY common-subset parse_json inside it. The parser returns the server-only list {0, reason} for v2 rejection, including parse failures from the existing except, retaining other-package raw fallback. Add NO catch and send NO output in the parser. Apply the bounded post-parse walk outside the try. Modify `handle_message` to capture connection ctx before parsing, recognize the rejection list and send its bounded package Error using that ctx outside any catch, then stop before map mutation/routing. Attach ctx only to successful v2 messages alongside existing connection. `#2729:route_message` passes ctx to v2 dispatch only. Add `query_file_capabilities(connection_key)`, `file_context(connection_key)` and `send_file_endpoint(connection_key,address,data)`. On `user_connected user_created user_reconnected` allocate/bind a fresh transport key; on `user_disconnected user_client_disconnected` call end_endpoint before clearing THAT transport ctx. Identity/UUID/incarnation replacement invalidates old authority. |
| Core.Supports `#4004` | `handle_set` writes session.gmcp_data["supported_packages"] and marks this connection's list known-complete. `handle_remove handle_add` updates the same map; Add alone never marks an unknown list complete. Set/Remove removing either required v2 package calls end_endpoint before further file routing; Add checks the resulting bundle too. A complete refresh retaining both packages only updates capabilities. Complete pending queries using the captured connection_key, not a current player-only lookup. |
| `$gmcp_files` / `$player` (`#6`) gag integration | Add plain `blocked(a,b) = (a in b.gaglist) || (b in a.gaglist)` for player objects and use it on every v2 authorization, capability probe/discovery and v1 relay/observer path. Do NOT call #6:gag_p: it depends on task-global player and callers(). Add `#6:file_gag_changed(other_player)` and call it from `#6:set_gaglist`, `#6:gc_gaglist` and EVERY other verb writing .gaglist (audit direct writers). For replacements/GC diff old/new player entries and notify each affected pair after mutation. If blocked, invoke Files.revoke_pair and legacy cancellation; ungag restores no records. Object/location/caller gags in gag_p do NOT count unless the other player object itself is a gaglist entry; this predicate is symmetric player gag membership only. Only .gaglist counts; .sgaglist is a sound gag and does NOT count ($mcmp:play, #1811 verb 0, checks sgag_p). |
| Startup `#0:server_started` | Call `$gmcp_peer:startup()` once from the server-start path after package registration; clear ephemeral authority, choose a fresh hub Id and start the single Peer/Files timer loop. This is required target wiring, not a claim of deployment. |

Use one Peer timer driving Files timers, never one repeating task per record.
Index deadlines in per-second buckets `expiry_second -> map(timer_id -> record_key)`:
negotiations, session TTL, offers, search/cursors, reply caches and legacy records.
Each record owns one cancellable indexed timer node, replaced/removed directly
by its bucket/key, not a new stale list node on every update. This requires no
linear registry scan or claim of constant-time native MOO map mutation. Live nodes are bounded by live record/cache caps;
empty buckets are removed. On a turn drain ONLY due buckets since the last
processed second, under a 128-node work slice with suspend(0) between slices.
After lag, keep draining overdue buckets before admitting work that depends on
their records; every handler independently checks its record's deadline anyway.

Lease scheduling uses a separate ten-second rotating bucket index, each endpoint
in exactly one bucket; process only that due bucket, at most 128 endpoints per
slice. Recheck current ctx/output before each Lease; reinsert for now+10 seconds,
never issue a burst of stale catch-up renewals. Presence coalescing and capability
query deadlines use the same due-node machinery. Rate refill is lazy on admission;
idle bucket cleanup is deadline-indexed. No one-second walk over all records or
all leases. All slices recheck authority before deferred sends. Direct safety
events bypass application gag only to revoke authority, never to deliver file
metadata/results. Endpoint overload stops v2 authority/leases, not the MOO game.

## Direct-send acceptance matrix and evidence

At EVERY phase exit run all applicable rows below with sharing OFF on both ends,
unless a row explicitly sets it on. “Old” means a legacy-only client explicitly advertising Client.FileTransfer 1
and not Client.Files. Exercise actual deployed/cached builds; build strings do
not gate fallback and incompatible historical wire behavior fails visibly. Test the
current phase's enabled feature intersection and a peer without later optional
features. A skipped Phase-5-sized test before Phase 5 is expected; it is not a
pass claim. Keep codec/state tests, real RTC/browser evidence and live-hub
acceptance separate. Fake links alone cannot prove multiplexing, quota, export
or MOO routing. Record client build hashes, hub revision, browsers, enabled
features, outcome and bounded failure evidence for each live acceptance run.

| Case | Required result / scope |
| --- | --- |
| Old -> old, new -> old, old -> new | Compatible v1 direct send succeeds after Phase 0, <=100 MiB. New chooses v1 only before remote offer based on explicit capability evidence. Unknown capabilities/incompatible wire fails visibly; test distinct cached-build strings without allowlisting. |
| New -> new, both shares off, file outside roots | v2 prompt, immutable metadata, accepted transfer, correct owner and one receipt/export. No accidental publication. |
| Reuse browsing session; sharing disabled mid-session | New direct offer still prompts; an independently accepted direct transfer survives share-only revocation; no new shared get/list succeeds after off. |
| Simultaneous opposite sends; same bytes in both directions | One reserved pair session; independent offer ids/decisions/channels, correct direction, no duplicate-PC glare. |
| Two offers of same bytes to one peer | Two prompts and receipts. Cached bytes may be reused after separate acceptance; rejecting/cancelling one preserves the other's leases and data. |
| Reject, Withdraw, Cancel/accept/receipt races | Hub transition order is deterministic; no late bind resurrects consent; one operation stops while unrelated transfer/browse survives. |
| v2 receiver rejects before acceptance | No new ICE/session or address exposure caused by the rejected offer. Existing unrelated session does not waive consent. |
| Loss before first byte, mid-file, during root verification | Bounded same-epoch reconnect attempts; new session Ids/increasing channel attempts, correct ranges/credits, no old writes; no second verification/export task. |
| Loss after receipt before complete; late terminalAck | Known outcome returned without another export; sender distinguishes receipt unknown from received/saved. |
| Loss/reload while exporting, failed close, cancelled picker | Verified bytes retained, export-uncertain when crash window is ambiguous; explicit retry; no claimed disk save on handoff/failure. |
| Reload; logout; owner/visitor/guest switch; recycled player ref | Old epochs stop, no persisted private consent/handles leak to new owner; fresh offer decision required, content reuse only inside same persistent owner. |
| Phase 1-3 direct-send reload with stored partials | Same owner and authenticated sender/id/size within seven days: fresh offer/acceptance/new t, recovered provisional have skips held pieces, complete root verified before one receipt/export. Different sender/id/size, expired/evicted bytes or memory-only mode cannot reuse those partials. |
| Whole-file root mismatch on retained direct-send partials | Fence/drain all attempts for from/id; atomically delete all pieces and the transfers record, clear attempt bitmaps/references and update accounting before reporting integrity failure. No receipt/export; a fresh accepted resend starts from zero, including when two attempts referenced the bad cache. |
| Gag after established ctl and active bytes | Immediate local/hub scope peer fence and session closure; pending/new offers, search/discovery and queued reconnect blocked both directions. |
| Sound gag only (.sgaglist), then player gag (.gaglist) | Sound gag leaves file authorization unchanged in v1/v2; adding either player's gaglist entry blocks both directions and revokes live work. |
| Gag during compatible-v1 direct send (old/old and mixed directions) | Recorded relay pair receives exact per-destination-address policy Cancel on both connections; legacy per-transfer links stop without requiring v2 support. No gag-blocked resume/candidates survive. |
| Multi-tab registration/takeover | Every tab retains existing game auto-login/reconnect. With Web Locks one Files holder and queued followers: close holder, next eligible tab automatically gets the lock and sends Hello. After End superseded, every tab kind (including visitor/page-nonce owners) stays parked without automatic lock re-queue or Hello, including after login/reconnect; only a player Files action re-queues it. Without locks each tab may register memory-only; last Hello wins and the same explicit-action parking rule applies, with no durable-resume promise. |
| Capability race or missing one package; old hub silence | Actionable error; no second transport/offer or timeout downgrade. Legacy large send remains bounded. |
| Public-share reservations/established slots saturated plus new direct offer | Share-only <=6 sessions/1 not-established per endpoint and <=4 per downloader globally; two total/one not-established slots remain for offer auth. Pending/expired/rejected offer tombstone saturation cannot block a new live direct offer; v1 observer pending pressure does not reject Offers. |
| New Hello/changed receive limit on same game connection | Old endpoint authority ends; new epoch/canShare/ceiling is accurate; game remains logged in. Test rapid Hello replay never reactivates a retired epoch. |
| Lower capability/quota ceiling during live work | Enforce the lower limit locally immediately; defer capability re-Hello until operations are quiescent. Existing safe consent is not revoked just to advertise a limit. |
| End overload/error flood, endpoint cap, Ready timeout or lease expiry | Fence old work, one recovery loop with 1-second doubling backoff capped at 60 seconds plus bounded jitter; fresh endpoint/req. No player notice until continuously down for 30 seconds. New send to a target with no ready endpoint and explicit FileTransfer 1 selects v1 once, including a new client still advertising Files; target's idle v1 receiver works during recovery. |
| Raw oversized/invalid/duplicate-case-key v2 ingress; overloaded output | Raw >64 KiB never reaches parse_json; only parse_json runs in the existing try. The parser returns a rejection reason and never sends output; handle_message sends the bounded Error using captured ctx outside catches, before mutation/dispatch. Malformed parse never passes raw strings. First retained parsed values alone control validation/forwarding/replay; no forged identity or null output. Endpoint load/errors stop file authority, preserve game connection. |
| Enabled share revision changes during active get | Added unrelated file keeps pinned id/size transfer running; removal/change/off stops only applicable shared work; exact-revision list/search goes stale. |
| Bad envelope/frame/manifest/list/path/count; changed source | Reject at defined scope without corrupting verified cache, crossing owner boundaries or growing queues; unrelated transfers survive. |
| Quota exhaustion/OPFS eviction/truncated piece/crash between flush and metadata | Correct pause/recovery/missing bits; never advertise unverified bytes as durable or erase another consumer's data. |
| Phase 5: 0, 1, 16383, 16384, 16385 bytes, 100 MiB, >2 GiB and 10 GiB | Exact roots/offsets/end pieces, bounded memory, successful stream close on capable endpoints; 10 GiB+1 rejected before offer/allocation. Real two-browser >2 GiB direct send and shared pull/export, plus deterministic storage tests at 10 GiB. |
| Phase 5: no streamed-save path (Firefox/Safari/fallback) | >100 MiB is refused before acceptance/download with visible limit; <=100 MiB bounded browser handoff, no false saved confirmation. Re-pick roots each visit. |
| Phase 6: two/three sources, one stalls/corrupts/disappears | Authenticated manifest first, finite range completion frees upload slots, fenced reassignment, no full-file completion wait at subset uploader. Private direct offer remains separately authorized. |

Completion of this specification task does not mark any of those implementation
gates passed. Next implementation is the server-first Phase 1 contract and full
direct-send slice after Phase 0 baseline evidence, with the non-Codex review of
these documents incorporated before enabling it.
