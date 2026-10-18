# File-sharing data protocol 1

Status: normative protocol for sessions reserved by [Client.Peer 1](../GMCP/packages/client-peer.md)
and operations authorized by [Client.Files 1](../GMCP/packages/client-files.md).
Specification only. See [architecture](architecture.md) for storage, export,
phases and acceptance. Types Id/Hash/Size/Endpoint/Revision/Name/Features retain
the exact definitions from those packages. This is a new data protocol, not an
extension that can be sent on a legacy `fileTransfer` channel.

The content formula and 16 KiB pieces intentionally match existing
`src/fileTransfer/contentId.ts:7-10,35-47,50-65` and
`src/fileTransfer/wire.ts:16`. Existing frames have only piece/ready/complete/
abort/stored (`src/fileTransfer/wire.ts:30-48`); the bindings and additional
frames below are new requirements.

Phase 1 implements ONLY binary types 1-5 and 11, full-mode direct push with
base feature. ready.mode is 0 and complete outcome 0 is forbidden until ranges.
Types 6-10, list/get, leaves/ranges and shared discovery are disabled until their
architecture phases. Phase 1 already includes the storage worker, IndexedDB
partial retention and same-sender/id reload resume specified in architecture.md.

## Sessions, ctl and feature negotiation

One current RTCPeerConnection per reserved endpoint pair/session Id, carrying
only reliable ordered data channels (`ordered:true`, neither maxRetransmits nor
maxPacketLifeTime set, `negotiated:false`). Session initiator creates `ctl` before
its SDP offer; other endpoint receives it. Exactly one ctl is permitted. Set
binaryType to arraybuffer. Control is text; transfer payload frames are binary.
Do not parse a binary frame as JSON or vice versa. Unsupported channel labels or
duplicate ctl cause session protocol closure.

Both sides send this as their first ctl message within five seconds of open:

```text
{op:"hello",v:1,session:Id,self:Endpoint,peer:Endpoint,
 features:Features,maxFrame:integer,slots:Slots}
```

Session Id and endpoint tuples must equal authenticated hub reservation
state in both directions. Do not adopt an identity asserted by hello. Features
must be a subset of that endpoint's latest hub-discovered features; use their
intersection for this session. base is mandatory. maxFrame is 16391..32768, and
effective frame maximum M is the minimum of both advertised maxima, 32768, and
local SCTP maxMessageSize (a WebRTC value zero means no implementation maximum).
Wait for SCTP negotiation before testing M. If M < 16391 fail protocol version 1
instead of silently fragmenting pieces. Each outgoing and incoming message,
including JSON, must fit M. This follows the
[WebRTC SCTP message-size contract](https://www.w3.org/TR/webrtc/#dom-rtcsctptransport-maxmessagesize).
Complete both hellos before requests or Peer.Connected. A receiver supports all
selected features it advertises; unknown future features require a new contract
version and are rejected here. Slots is advisory; it does not grant authority or
override hard admission limits.

ctl is an independent ordered stream; it has no ordering guarantee relative to
a transfer channel. The bind handshake below supplies that ordering. JSON is
strict as in Client.Peer, with at most 8192 UTF-8 bytes, depth 6 and 128 total
values per message. Every schema below lists all allowed fields. `a` is a
channel-attempt Generation; `q` is a fresh request Id scoped to sending endpoint
epoch and session; `t` is a logical source-transfer Id chosen by the requester.
No id itself grants read/write authority.

## Request, response, channel bind, ready

```text
{op:"list",q:Id,t:Id,a:Generation,revision:Revision}
{op:"get",q:Id,t:Id,a:Generation,id:Hash,size:Size,mode:"full"|"ranges"}
{op:"push",q:Id,t:Id,a:Generation,offer:Id,mode:"full"|"ranges"}
{op:"accepted",q:Id,t:Id,a:Generation,mode:"full"|"ranges",meta:Metadata}
{op:"error",q:Id,t:Id,a:Generation,
 code:"busy"|"denied"|"not-found"|"stale"|"limit"|"protocol"|"unreadable"|"expired",
 retryAfterMs?:integer}
{op:"outcome",q:Id,t:Id,a:Generation,meta:Metadata,
 outcome:"verified"|"saved"|"browser-download"|"export-uncertain"}
```

list needs lists feature, current uploader sharing at the requested nonzero
revision, no gag, live lease. The responder is uploader. get requires sharing
currently on, no gag and live lease; it resolves id AND size solely in the
uploader's approved CURRENT index, pinned to a readable local File. Its authority
is id/size still present, not an exact snapshot revision. On index changes
revalidate presence/readability before further reads; unaffected files continue.
Removing the last approved path for that content, changing/unreading the pinned
File or turning sharing off cancels that get. List/search remain exact-revision. It cannot read a private cache
entry just because its hash exists. A get never authorizes uploads in the other
direction. push requires an exact accepted, unexpired hub offer from requester
to responder; the responder is downloader and its accepted metadata supplies
the envelope. It works with both shares off. Any offer decline/cancel/receipt,
owner change or epoch fence invalidates this permission. Recheck at request,
channel bind and before sending bytes; do not rely on session-opening consent.

The responder either rejects immediately or reserves resources and responds
accepted within 10 seconds. busy includes retryAfterMs 1000..60000; other errors
omit it. No remote queue is created. A repeated identical q returns the same
response for 120 seconds without a new reservation/channel. Reusing q with
different content is protocol. At most 16 unanswered requests per session,
512 remembered q records per endpoint; reject busy before exhausting capacity.
For the same t, immutable operation kind/content/offer/peer bindings cannot
change, and a must increase on a new attempt. One active attempt per t; fence
the old attempt before accepting a larger a. Duplicate a with a different q is
stale unless it is a known completed push whose outcome can be returned.
Bind t to its original requester endpoint as well as immutable metadata. A
peer cannot take over a t already used by the opposite requester or another
operation; reject that collision as protocol even if its channel label matches.

Push replay after received returns outcome, with no transfer channel and no
second save. The receiver's own receipt is the authority for this response.
Unknown push after reload/epoch change is denied, never a substitute for a
fresh consent prompt. An uploader cannot assert that its downloader saved a
get: outcome response is valid only from a push receiver with its recorded
receipt. List/get recovery uses the requester's own queue/content state.

Once accepted arrives, the REQUESTER creates exactly one transfer channel,
regardless of which side uploads. Label is `t:<t>:<a>`, where a is canonical
unsigned decimal without leading zeros. Do not use a path or content hash as
the label. The requester's first channel message is text:

```text
{op:"bind",q:Id,t:Id,a:Generation,session:Id,meta:Metadata}
```

The responder already has the reservation made before sending accepted. It
compares the binding, full canonical metadata values and label with that
reservation, rechecks operation authority, installs handlers, and replies on
THAT channel with text `{op:"bound",q:Id,t:Id,a:Generation}`. A refusal uses
text `{op:"bind-error",q:Id,t:Id,a:Generation,code:"denied"|"stale"|"protocol"}`
then closes the channel. No binary data may precede successful binding. Bound
and subsequent data on this channel share its ordering. For push the responder
sends bound before its ready. For list/get the requester sends ready only after
receiving bound. Each side has a ten-second bind deadline from accepted/open,
whichever comes first. An unknown channel or mismatched binding is closed,
not parked waiting for metadata. Allow at most two unbound channel objects per
session and 8 KiB text per object. Three unsolicited/bad channels within 60
seconds closes that peer session.

### Metadata envelope

```text
FileMetadata = {
 kind:"file",id:Hash,size:Size,name:Name,encoding:"identity",
 hash:"sha256-leaves-16384",pieceSize:16384
}
FileListMetadata = {
 kind:"filelist",id:Hash,size:integer,name:"filelist.json.gz",encoding:"gzip",
 hash:"sha256-leaves-16384",pieceSize:16384,
 snapshot:Id,revision:Revision,decodedSize:integer,entries:integer
}
Metadata = FileMetadata | FileListMetadata
```

For push, file metadata MUST match accepted offer id/size/name exactly. For get,
id/size must match request, and the response name is validated before accepting
it. Name is the basename of the chosen indexed virtual path; if several paths
share content use the lexicographically first UTF-8 path. No MIME type is
trusted or needed. List size is compressed bytes, 1..8388608 (8 MiB), decodedSize
is 1..33554432 (32 MiB), entries is 0..100000, and revision equals request. Its id
is the content hash of those compressed bytes, not decoded JSON. Snapshot
identifies one immutable serialized list at that revision; do not mutate it
while sending. A list is always full mode. Only files allow ranges; both peers
must negotiate ranges AND leaves for that mode. An accepted mode must equal
the request's mode (list implicitly full); no silent mode switch.

Reserve advertised sizes and parser/output limits BEFORE ready. An envelope is
not authority to allocate arbitrary storage. The receiving owner can reject an
accepted response with channel/ctl cancellation if it cannot reserve capacity.

## Binary frame encoding

One ArrayBuffer message is exactly one frame; no concatenation, stream splitting
or application fragment reassembly. All multibyte integers are unsigned BIG
ENDIAN. Offsets and lengths below are bytes, counting the type at offset 0.
Unknown type, wrong direction/state, trailing bytes, count/length mismatch or
frame > M is protocol failure of this transfer. Text after bound is invalid.
These encodings explicitly supersede the v1 ready/complete/abort bodies; only
piece and stored retain the old byte shape.

| Type | Name and direction | Exact layout / length |
| --- | --- | --- |
| 1 | piece, uploader -> downloader | `[0]=1`, `[1..4]=index:u32`, `[5..]=payload`. Length `5 + pieceLength(size,index)`, at most 16389. |
| 2 | ready, downloader -> uploader | `[0]=2`, `[1]=mode:u8` (0 full, 1 ranges), `[2..3]=haveCount:u16`, followed by haveCount `(start:u32,end:u32)` pairs. Length `4+8*haveCount`, count 0..512. |
| 3 | complete, downloader -> uploader | `[0]=3`, `[1]=outcome:u8`: 0 range-stream-done, 1 verified, 2 saved, 3 browser-download, 4 export-uncertain. Exactly 2 bytes. |
| 4 | abort, either | `[0]=4`, `[1]=reason:u8`: 1 integrity, 2 storage, 3 protocol, 4 unreadable, 5 cancelled, 6 revoked, 7 timeout, 8 busy, 9 limit. Exactly 2 bytes. |
| 5 | stored, downloader -> uploader | `[0]=5`, `[1..4]=count:u32`. Exactly 5 bytes. |
| 6 | want, downloader -> uploader | `[0]=6`, `[1..4]=batch:u32`, `[5..6]=rangeCount:u16`, then rangeCount `(start:u32,end:u32)` pairs. Length `7+8*rangeCount`, count 1..512. |
| 7 | leavesRequest, downloader -> uploader | `[0]=7`, `[1..4]=start:u32`, `[5..6]=count:u16`. Exactly 7 bytes; count 1..512. |
| 8 | leaves, uploader -> downloader | `[0]=8`, `[1..4]=start:u32`, `[5..6]=count:u16`, then count consecutive raw 32-byte SHA-256 digests. Length `7+32*count`, count 1..512; maximum 16391. |
| 9 | batchEnd, uploader -> downloader | `[0]=9`, `[1..4]=batch:u32`, `[5..8]=sentCount:u32`. Exactly 9 bytes. |
| 10 | rangeAck, downloader -> uploader | `[0]=10`, `[1..4]=batch:u32`, `[5..8]=pieceCount:u32`. Exactly 9 bytes. |
| 11 | terminalAck, recipient of complete/abort -> its sender | `[0]=11`, `[1]=terminalType:u8` (3 or 4). Exactly 2 bytes. |

A range is half-open `[start,end)`, integer `0 <= start < end <= N`, where
`N=ceil(size/16384)`. Within any range array, require ascending, disjoint,
non-adjacent ranges; adjacent spans must be coalesced. Reject invalid ranges
before iteration. Never expand a range to an object/Set per piece. Example:
`want batch=1 ranges=[[0,2],[5,6]]` encodes hex
`06 00000001 0002 00000000 00000002 00000005 00000006` (23 bytes).
`leaves start=512 count=2` has header `08 00000200 0002` and exactly 64 digest
bytes (71 total), without hex/base64/JSON wrappers.

The last piece has `size - 16384*(N-1)` bytes; all other pieces have 16384.
There is no zero-length piece. A zero-byte file has N=0 and no piece, want or
leaves frames. Its required id is
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
At the 10 GiB ceiling N=655360, manifest is 20971520 bytes and verified bitmap
is 81920 bytes. Uint32 piece indices/counters suffice; file offsets use safe
integer arithmetic and are not truncated to 32 bits.

## Manifest authentication and piece admission

The algorithm is `hex(SHA256(digest[0] || ... || digest[N-1]))`, with each digest
the raw SHA256 of one exact piece. It is a two-level digest list, not a Merkle
tree. A leaves chunk has NO independent proof. With leaves negotiated, acquire
the entire manifest before accepting payload as verified or sending ready.
Request consecutive non-overlapping blocks, at most two leavesRequest frames
outstanding, each count <=512 and fitting `[start,start+count)` within N.
Uploader replies once per exact requested block. Unrequested/overlapping/short
or excess digests are protocol failure. Store manifest provisionally at bounded
offsets, check complete coverage, compute the root over raw ordered bytes, and
compare to the pinned expected id. Root mismatch rejects that source manifest;
it is not evidence that another source sent a corrupt piece. N=0 checks the
empty root immediately without a request. Manifest inactivity deadline is 30
seconds, total deadline 120 seconds. Header/receipt traffic cannot prolong it.

After manifest authentication, each received piece must match requested index,
exact length and pinned digest before the owner storage manager marks it
verified/durable. Preserve verified entries when a bad or duplicate piece
arrives. A valid duplicate can be discarded; an invalid duplicate is still an
integrity failure of its source. Hold one authenticated manifest per owner/id/
size, shared by consumers; inconsistent size or manifest is rejected. A cached
manifest must itself have a durable verified-root record or be reauthenticated
before use. Serving leaves is limited to that pinned authorized File/index,
never any arbitrary private cache entry.

Without leaves, only full mode is allowed, at most one source. Logical-operation
metadata/held bitmap is keyed by t, with immutable source Endpoint, offer (for
push), kind, id and size. In Phases 1-3 the physical provisional pieces are
peer/content-keyed `(from,id,index)` inside the captured owner's v2 database,
with seven-day untouched retention, not a physical directory per t. The current
a is the exclusive attempt writer fence, not a storage directory. Fence and finish old writes
before assigning the next a; no stale callback can publish or overwrite bytes. At the end re-read every exact
piece, compute all piece digests and the root, compare to expected id, and only
then promote content to verified. Resume have can describe provisional pieces
of that same still-authorized immutable operation, but does not assert they are
verified. A NEW t may adopt retained partials only after a fresh accepted direct
offer from the same authenticated sender Player with the same id AND size,
including after reload/new epoch. Check stored lengths and rehash held pieces
before have; still verify the complete root before receipt/export. Never reuse
old consent, receipts as permission, or a prior export destination/action. Use
the serialized peer/id writer and per-t references in architecture.md so a
cancelled/old attempt cannot overwrite or erase another operation's pieces.
Do not combine provisional bytes from unrelated sources or blame
other peers based on an unauthenticated manifest. Feature absence does not
authorize range mode or multi-source operation.

## Ready, full mode and range mode

Ready occurs exactly once after bound and, when selected, manifest validation.
Full mode ready has mode 0 and up to 512 coalesced have ranges for bytes already
held by this operation. If fragmentation exceeds that limit include any bounded
subset of held ranges; omitted ranges will be resent and safely deduplicated.
The uploader iterates all missing indices in ascending order, with flow control.
It does not allocate an array of every missing piece. If N=0 or have covers all
pieces, it sends no pieces and waits for the receiving outcome. With leaves,
have includes only durable verified pieces; otherwise it describes the current
t's durable provisional pieces: earlier a values under unchanged authority, or
same-sender/id/size retained pieces explicitly adopted after NEW consent as above.
Both same-epoch retry and reload partial resume are required in Phases 1-3,
before leaves exists. No batchEnd/rangeAck/want is valid in full mode.
The uploader's full-mode indices must be strictly ascending and absent from
ready.have; repeating an index on the same attempt is protocol failure. A valid
piece may nevertheless be deduplicated if another consumer made it durable
after ready was sent. Only newly durable bytes reset inactivity/retry budgets.

Ranges mode ready has mode 1 and haveCount zero. It grants NO payload credit or
implicit all-missing push. Only a want can request data. Each t/a starts batch
at 1, increases by exactly 1, and has one outstanding batch. want replaces no
prior request: it is admitted only after the previous rangeAck, and denotes a
new append-only finite batch. Maximum requested pieces per batch is 4096 and
maximum ranges is 512; frames cannot encode a larger operation. Downloader
assigns disjoint missing pieces among sources; no duplicate assignments unless
it first cancels/fences the earlier source attempt. Retrying a batch on a new
attempt resets batch to 1 and requests only remaining missing pieces.

Uploader sends exactly those indices, ascending, then batchEnd whose sentCount
equals the number of piece frames in this batch. It does NOT wait for whole-file
delivery or verification. Downloader processes all preceding frames on this
ordered channel, verifies/stores or deduplicates them, checks full expected
coverage, sends a final stored count, then rangeAck with pieceCount equal to
batch cardinality. Missing, duplicate-from-the-same-batch, unrequested or
out-of-order indices are protocol failure. A piece already durably supplied by
another attempt may still satisfy this batch if it was legitimately requested
and its exact digest matches; count it once for this stream's credits.

After rangeAck the downloader either sends the next want or complete outcome 0
to release this source channel. complete 0 is valid only with no outstanding
batch and no leaf requests; it means this source stream ended, not that the
file is downloaded or saved. If the whole file became verified on this batch,
complete 1 (or a stronger known export outcome) is allowed instead. Uploader
receipt of rangeAck finishes the RANGE REQUEST and frees batch resources and
its upload slot; a source must not wait for other sources' pieces. A subsequent
want must re-acquire a slot before reading/sending. If none is available send
ctl error busy using the original opening q, then abort 8; the requester can
retry a new attempt after retryAfterMs without losing verified pieces. Keep
the idle channel at most five seconds after rangeAck while waiting for the next
want/complete, then release it. The content-download manager owns whole-file
verification/export and can continue across separate source channels.

## Credits, buffering and scheduling

The upload window is 64 piece frames per channel beyond the last stored count;
stored starts at zero for EVERY t/a, counts all admitted piece frames durably
processed or safely deduplicated, never digest frames, and is cumulative across
all batches on that attempt. Report every 16 frames, at batchEnd, and before a
terminal outcome. The counter cannot decrease or exceed pieces actually sent.
No more than 64 unprocessed payload frames (at most 1 MiB) may queue per channel;
excess is protocol failure. RangeAck does not implicitly reset/extend credits.
No counter wrap: terminate/reopen before uint32 exhaustion.
For sender-side retry/inactivity tracking, a valid advancing stored count is
the observable proxy for remote durable progress. Downloader-side counters
reset only for newly durable data. The absolute attempt cap below remains in
force for both, so duplicates cannot create an unbounded retry cycle.

The data sender pauses at bufferedAmount >=256 KiB and resumes below 64 KiB;
total queued RTC bytes across an owner are <=8 MiB. Dispatch at most four piece
frames from a channel before considering another runnable channel. ctl,
terminal/credit frames and lease/revocation processing have priority. Default
owner upload token bucket is 8 MiB/s with 2 MiB burst, per-peer 4 MiB/s with
1 MiB burst; download owner limit 16 MiB/s with 2 MiB burst. User may LOWER
these defaults. Charge all payload and manifest bytes, not just credited pieces.
Over-limit senders pause; repeatedly excessive incoming traffic closes that
session. CPU/hash workers and storage queues are also bounded, not merely RTC
bufferedAmount. A page must yield to control/revocation between bounded jobs.

## Completion, cancellation and reconnect

After all bytes are verified, the receiver records an operation receipt BEFORE
sending complete 1 or the receipt-only Files.Outcome. It can then close this transfer
while exporting separately; do not hold an upload slot or idle RTC connection
open for a save picker. For push, send Files.Outcome even if the data connection
has failed, while the hub epoch still permits the record. Export updates stay
in local receipts and ctl outcome, never the hub. A push receiver may send ctl
outcome with the original opening q/t/current a and exact metadata while ctl
is live; repeated push requests recover the latest recorded outcome without
opening a channel. Do not retain an idle session merely to report a save. The UI must distinguish verified, saved and handed to the
browser; the exact crash/once-only rule is in architecture.md. An already
received push never causes automatic re-export on recovery.

The recipient of complete/abort sends terminalAck on the same channel, then
closes that channel after queued control drains (bufferedAmount zero, at most
five seconds). The terminal sender waits for terminalAck/close at most five
seconds, then closes locally. Receipt is recorded before acknowledgement, so
losing that final packet does not roll back completion. A simultaneous abort
race is idempotent; both record terminal and may Ack the other abort. Never close
the entire shared session because one transfer completed/failed/cancelled.

```text
{op:"cancel",q:Id,t:Id,a:Generation,reason:"cancelled"}
{op:"cancelled",q:Id,t:Id,a:Generation}
```

Either participant may cancel a pending opening or active source attempt with
ctl cancel; the response echoes that cancel q. If bound, also send abort 5 when
possible. Remember cancelled t/a for 120 seconds and reject its late bind/data;
an unknown cancel returns cancelled idempotently without creating a transfer.
For a direct offer, either side ALSO sends GMCP Files.Cancel (or Withdraw if
still pending), so consent cannot survive a broken ctl. Cancelling a queued
download locally cancels all its source attempts; stopping one source only
releases that source. Cancellation releases leases, never blindly deletes
owner/id content used by another consumer. User deletion is a separate explicit
action checked by the storage manager.

Session loss fences all old channel callbacks and writes. A stable t is reused
with fresh q and a+1 on a new authorized session Id; no old a can
write into the new attempt. Keep immutable kind/offer/id/size pinned. A push
resumes automatically only while both original hub endpoint epochs and accepted
offer grant remain live; a known received operation returns outcome even if its
payload was cleaned up. Cancelled/rejected/revoked records never resume. A get
is initiated again by the downloader queue only after current sharing/id/size
and online authority checks; revision need not equal its earlier snapshot. Persisting a queue grants local intent, not remote
upload rights. After a hub disconnect/reload, obtain a fresh endpoint; old
direct consent is gone and a new Offer asks the receiver again. Existing
verified content can satisfy that newly accepted operation without retransfer,
but it still requires its own user consent and export action. Before Phase 4,
same-sender/id/size provisional pieces retained for seven days can also satisfy
the new t's have after recovery checks; missing pieces are requested normally
and the complete root must pass before receipt. Reload must not force a complete
retransfer when these stored pieces are usable. Owner/visitor changes never
import another owner's retained partials; memory-only mode has no reload guarantee.

An uploader that loses the session after sending all bytes but before complete
shows `receipt unknown`, not saved/failed integrity. Recover using the same push
grant and t/a+1; received returns outcome. If the receiver is still verifying,
it may accept recovery and then ready with all held pieces; it continues its
single verification task and sends outcome when done. Wait at most five minutes
from the original verification start, without progress messages or a reset on
reconnect. If receipt/authority is unknown, return denied/expired; the sender
cannot infer delivery or automatically make a fresh offer. Its user may send a
new one. There is no ctl progress message in this version.

Manifest keeps its separate absolute 120-second deadline. Verifying
has an absolute five-minute deadline from starting verification; regular pieces
have a 30-second inactivity timeout reset only by a newly admitted piece or valid
stored advancement. Exhaustion pauses the logical download for user retry with
partial data retained; do not silently loop. Use the three-retry 1/3/9-second
backoff from Client.Peer; reset only on newly stored data/completed list, and
cap all automatic attempt creation at 20 per logical operation per ten minutes.

## File-list format and untrusted paths

Compressed list is one gzip member, no concatenated members/trailing bytes.
After content verification stream-decompress in a worker while counting actual
output. Abort before exceeding declared decodedSize or 32 MiB. On finish require
exact decodedSize, valid gzip checksum, strict UTF-8, one JSON value, no duplicate
keys and the following exact schema:

```text
{v:1,snapshot:Id,revision:Revision,files:[{p:Path,s:Size,h:Hash}]}
```

snapshot/revision match envelope; files length equals envelope.entries. Entries
are sorted by UTF-8 byte lexicographic order of p; no duplicate path. Directories
are implicit; no remote handles, URLs, MIME markup, symlink records or OS paths.
One current share snapshot per sharer/revision is served; compression must be
bounded before publishing Status. If it cannot fit caps, keep the previous
authorized snapshot only if it still exactly reflects local policy, otherwise
stop sharing and tell the owner to reduce the selection. Do not silently publish
a partial list.

Clients apply these complete Path rules to published indexes, remote lists and
search results. The hub applies ONLY Client.Peer's byte/component/count subset
to search results; it cannot perform NFC/category checks:

1. NFC Unicode, 1..1024 UTF-8 bytes, at most 16 slash-separated components,
   each 1..255 UTF-8 bytes; no empty, dot or dot-dot component.
2. Only `/` separates components. Reject leading/trailing slash, backslash,
   colon (including drive prefixes), NUL, Unicode Cc/Cf, unpaired surrogates,
   absolute/UNC paths. Do not percent-decode or URL-normalize paths.
3. Require already-normalized NFC; do not silently merge aliases. Equality is
   case-sensitive NFC UTF-8 bytes. `A/x` and `a/x` may coexist for display, but
   a file path cannot also be an implicit directory prefix (reject `a` plus
   `a/b`). Reject exact duplicates across roots; local root aliases must be
   unique under this rule. A save dialog handles destination OS constraints.
4. Treat all names, including `__proto__`, `constructor`, HTML and bidi-sensitive
   text, as plain data in Map/safe records and text rendering. No property-path
   evaluation, HTML insertion or remote-path filesystem resolution. Requests
   select pinned id/size at the uploader; only its approved index resolves a
   local handle. File export uses a user-picked destination, never remote p.

Decode, JSON-parse, validate and build the tree in a cancellable worker; 100000
entries, 32 MiB decoded, depth 16 and ten seconds wall time for parse/validation/
tree construction are hard limits. Terminate the worker on the deadline or
revocation; validate before materializing UI rows and virtualize large trees.
Apply the entry counter while parsing, not after unbounded tree allocation.
Decompression must enforce its output counter during streaming, even when the
envelope falsely declares a tiny length. A compressed input cap alone is not
a decoded-output bound. This protocol does not promise interop with DC++/ADC.

## Remaining hard resource limits

All limits apply before public sharing is enabled, in addition to hub limits.

| Resource | Bound / reaction |
| --- | --- |
| Session pool | 8 sessions/owner, 2 not-established, with share-only <=6 total/1 not-established and <=4 as downloader/player hub-wide; same offer-only partition as hub. Evict idle first, otherwise busy. |
| Transfer channels | 8 bound/opening per session, 32 per owner; unbound cap two/session; close/reject excess before allocating storage. |
| Active uploads | 4/owner: at most 3 shared files plus 1 reserved direct-send slot; any unused capacity may serve direct sends, never a fourth shared file. File-list uploads count as shared. |
| Active downloads | 8 source channels/owner, at most 3 sources/content after Phase 6; earlier one source/content. |
| Lists/manifests | 1 active file-list transfer per peer, 2 per owner; 1 manifest acquisition per content, 2 per owner; <=32 MiB provisional manifest storage/owner. |
| ctl ingress | Token bucket 100 messages/second, burst 200 per session; 32 KiB/s, burst 64 KiB; close on repeated excess (3 breaches/60 seconds). |
| Binary ingress | Token bucket 2048 frames/second, burst 4096 per session, in addition to byte/window limits; includes stored/terminal/manifest frames and duplicates. Close on 3 breaches/60 seconds. |
| Open requests | 16 unanswered/session, 64/owner; same hard channel/slot checks for direct pushes on existing sessions. |
| Repeated list/hash work | One new list per peer per 30 seconds; serve immutable snapshot cache. Manifest block may be requested once per attempt; at most 2 full-manifest equivalents per peer/content per ten minutes, counting reconnects. |
| Receiving payload queues | 1 MiB/channel, 8 MiB/owner, credit-window and persisted-write checks before promotion. |

Hard cap breaches produce error/abort limit/protocol at the smallest affected
scope. A violation that exhausts session/control limits closes the session;
gag/owner/lease changes always fence the whole applicable authority scope.
No partial-source uploads are supported: only approved complete local Files
are shared. Authenticated downloaded cache content alone never creates a share.
