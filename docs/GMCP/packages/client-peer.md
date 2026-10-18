# Client.Peer 1

Status: normative v2 file-sharing contract; specification only. Implement together
with [Client.Files 1](client-files.md), the [data protocol](../../file-sharing/peer-protocol.md),
and the [architecture and rollout](../../file-sharing/architecture.md). This does
not change `Client.FileTransfer 1`.

The hub authenticates endpoints and reserves one session per unordered endpoint
pair. It relays SDP and ICE, never file lists, piece requests, manifests or bytes.
Only `purpose:"files"` is supported. This version has no media tracks or generic
application-purpose escape hatch.

## Types and validation shared by both packages

The words MUST, SHOULD and MAY express requirements. A schema written
`{a:T,b?:U}` is a JSON object with exactly those fields; `?` means omission is
allowed, not null. All other fields are forbidden. Numbers are finite safe
integers, never numeric strings. JSON duplicate keys, invalid UTF-8, lone
surrogates and trailing data are invalid. Measure limits on UTF-8 serialized
payload bytes before parsing, excluding GMCP address and Telnet framing. Encoders
use ordinary compact JSON; decoders also accept insignificant whitespace within
the byte cap. Limits apply to actual encodings, including JSON escapes.
Unicode normalization/category/whitespace and search folding use Unicode 15.1
tables as pinned in Client.Files, so client and hub validators agree.

| Type | Exact definition |
| --- | --- |
| `Id` | Cryptographically random 128 bits, 32 lowercase hexadecimal characters. Never reuse for a different operation. |
| `Hash` | 64 lowercase hexadecimal characters; `sha256-leaves-16384` as defined in the data protocol. |
| `Player` | Canonical string matching `^#(0|[1-9][0-9]{0,9})$`, value at most 2147483647, resolving to the authenticated online player. Never a display name or serialized MOO OBJ. |
| `Endpoint` | `{player:Player,endpoint:Id,epoch:Id}`. Full tuple equality is required. |
| `Generation` | Integer 1..2147483647. |
| `Size` | Integer 0..10737418240 (10 GiB). Phase and endpoint ceilings can be lower. |
| `Revision` | Integer 0..2147483647, monotonic in one endpoint epoch. Zero means no published share. |
| `Features` | Sorted unique subset of `["base","leaves","lists","ranges","search"]`, at most five strings. `base` required; `ranges` requires `leaves`; `search` requires `lists`. |
| `Legacy` | `"sha256-leaves-16384-core1"` or null. This is a compatibility assertion, not the package version. |

Every client command has a fresh `req:Id`, scoped to the authenticated source
endpoint (Hello is scoped to its underlying connection). Retrying the identical
command with the same req is idempotent. Reusing it with different content yields
`conflict`. Keep replies for 120 seconds, at most 512 per endpoint, and reject new
mutations with `busy` rather than evict an unexpired reply. Offer/session/search
records independently prevent replay after that window. An exact replay does not
repeat forwarding or notification. Replay traffic still consumes rate tokens.

Hub responses to the requester echo `req`. Forwarded commands echo the source
req, replace the client routing fields with `from:Endpoint`, and contain only
whitelisted fields. A req received from a peer is scoped to that peer; it is not
a reply to one's own request. Hub-generated unsolicited events carry `event:Id`
instead. Reject client-supplied `from`, `self`, `event`, `epoch` or other hub-owned
top-level fields, then construct forwarded payloads afresh. No client identity is
taken from SDP, candidate strings or a data-channel message.

Every targeted client command uses `to:Player` and `target:Endpoint`; their player
fields must agree. No implicit retargeting after lookup, login or reconnect. A
discovery query is the sole command that uses only `to`.

## Endpoint registration and capability discovery

Existing advertisement selects enabled, versioned packages
(`src/gmcp/Core.ts:85-102`), and startup sends that list with Core.Supports.Set
(`src/gmcp/session.ts:75-81`). The following explicit exchange is new; advertising
a package alone is insufficient evidence for this contract.

Client sends after its player identity is confirmed:

```text
Client.Peer.Hello {
  req:Id, endpoint:Id, peer:1, files:1, data:1, features:Features,
  maxReceiveSize:Size, legacy:Legacy
}
```

The client chooses endpoint once per page service lifetime, not from a player
name. The hub requires both package versions 1 in the connection's current
Core.Supports list, both implemented hub packages, and supported data version 1.
It assigns a fresh epoch; the same Hello replay returns the same epoch. Another
Hello from the same connection with different endpoint is `conflict`. Maximum
receive size reflects storage AND export capabilities, not a wish to allocate.
Same connection/endpoint/advertisement with a new req returns its current Ready
without changing epoch. Changing any advertisement field is conflict; reconnect
with a new endpoint to change capabilities or re-register after counter exhaustion.

```text
Client.Peer.Ready {
  req:Id, hub:Id, self:Endpoint, peer:1, files:1, data:1,
  features:Features, maxReceiveSize:Size,
  leaseMs:30000, heartbeatMs:10000
}
```

`hub` is regenerated on hub process start or loss of the in-memory registry.
Ready.features is the intersection with hub deployment features. Phase 1 has
only base; later phases enable features according to the architecture. A client
must not advertise disabled product features. A version mismatch is `unsupported`.
Wait at most 10 seconds for Ready; silence is a deployment/connection error and
does not authorize fallback. Deploy the hub first.

There is exactly one active file endpoint per player. Registering a new
connection supersedes the previous endpoint: revoke its offers, close its
sessions, withdraw its presence/search state, send `Client.Peer.End`, then
activate the new epoch. Multi-tab coordination must prevent background tabs from
continually registering. A legacy-only player has no v2 endpoint. Removing either
package from Core.Supports is equivalent to endpoint disconnect. Player object
reuse, principal change, logout, disconnect and hub reset invalidate the epoch.

```text
Client.Peer.Capabilities {req:Id,to:Player}
Client.Peer.Capabilities {
  req:Id,to:Player,online:boolean,target:Endpoint|null,
  peer:0|1,files:0|1,data:0|1,features:FeaturesWithoutBaseRequirement,
  maxReceiveSize:Size,legacy:Legacy
}
```

This response is hub-originated. `target` is non-null only for a ready v2 bundle;
then all versions are 1 and features contains base. Otherwise versions are zero,
features empty and maxReceiveSize zero. `legacy` may still identify a tested
legacy-only connection. Offline yields online false and legacy null. For a
gagged pair return the identical unavailable representation (online false,
target null, zero versions/size, empty features, legacy null). Capabilities do
not disclose an endpoint behind a gag or promise future authorization. Recheck
target epoch on every mutation. Refresh a cached result before a new offer if it
is older than 10 seconds; any stale-endpoint error invalidates it immediately.

For legacy-only connections, legacy is non-null ONLY when both
Client.FileTransfer 1 is advertised and Core.Hello.version exactly matches a
hub-maintained tested-build allowlist. Entries match the EXACT Core.Hello.version
string, not merely a commit substring. Initial baseline commit is
`03a193ba2add2cb0d40bd9b21b508006f7512c96`; the clean local describe candidate is
`v0.8.0-591-g03a193ba2add2cb0d40bd9b21b508006f7512c96`. The client imports that
build string (`src/gmcp/session.ts:1,75-78`; `vite.config.ts:10-12`); the pinned
plugin uses URI-encoded git describe (`node_modules/vite-plugin-commit-hash/dist/index.mjs:6-10`).
Phase 0 must record the actual tested browser's exact string and enable only
that entry (a build that reports the full hash alone needs its own exact entry).
Never accept arbitrary tag/dirty suffixes by extracting a hash. New clients may
assert the same legacy label in Hello
only while shipping the intact compatible legacy engine. Hash ordering, missing
packages and timeout are not compatibility evidence. See the fallback rule in
architecture.md. Store capability/connection association on the hub, not a
browser-wide name cache.

## Online lease

```text
Client.Peer.Lease {event:Id,hub:Id,self:Endpoint,seq:Generation,leaseMs:30000}
Client.Peer.End {event:Id,self:Endpoint,reason:"superseded"|"identity"|"shutdown"}
```

Send Lease every 10 seconds, starting immediately after Ready. It renews only
the addressed self epoch, for 30 seconds from local monotonic receipt time. No
peer-supplied heartbeat renews authority. On GMCP transport loss, End, hub change
or lease expiration the client immediately stops all peer work and closes RTC;
it cannot keep sharing over a surviving connection. No Pong is required: the
hub must invalidate endpoints on its connection-disconnect hook. Lease events
are small dedicated priority traffic. At seq exhaustion end/re-register instead
of wrapping. The hub must not renew a logically disconnected connection.

## Session reservation and arbitration

An unordered key consists of the sorted complete Endpoint tuples. Comparison is
lexicographic on their compact JSON arrays `[player,endpoint,epoch]`; comparison
does not assign negotiation roles. A reservation transaction has no suspension
between checking and storing. It is authoritative for all requests in both
directions, including simultaneous opposite-direction direct sends.

```text
Auth = {kind:"offer",offer:Id} | {kind:"share",uploader:Player,revision:Revision}
Client.Peer.Reserve {req:Id,to:Player,target:Endpoint,purpose:"files",auth:Auth}
Client.Peer.Reserved {
  req?:Id,event:Id,peer:Endpoint,session:Id,generation:Generation,
  initiator:Endpoint,authorization:Auth,
  capabilities:{data:1,features:Features,maxReceiveSize:Size},negotiationMs:30000
}
```

Files.authorize_session must check current online epochs, both package bundles,
no gag in either direction, and either an accepted, unexpired offer binding
these exact endpoints or a currently sharing uploader at the supplied revision.
For Reserve with share auth, uploader MUST be the TARGET: only the downloader
may initiate a sharing connection. A sharer cannot initiate a new unsolicited
connection to a non-sharing downloader. The downloader's Reserve must result
from an explicit browse/download action or its persisted user-created queue.
The hub can verify the sharer's policy, not the downloader's UI action. Both
clients enforce the operation rules too. Each reservation records the share
directions explicitly requested by their downloader (at most two); an offer
grant need not make either endpoint sharing.

If no record exists, choose a hub session Id and generation 1, with the first
requester as initiator. Notify both endpoints; only the requester gets req. If a
record exists and is authorized for this request, return it to the requester,
without renegotiating or changing initiator. Reuse it even when originally
authorized for a different operation. Session existence grants no list/get/push
rights. Each endpoint knows its accepted offers from Files events and its
partner's sharing policy from Files.Policy, which the hub sends before Reserved
on that endpoint's ordered GMCP transport. No SDP is sent before reservation.
Reserved.capabilities describes its peer's registered effective capabilities,
so an unsolicited reservation recipient can validate ctl hello without guessing.
authorization is the auth which admitted this reservation/restart response;
it does not extend authority to unrelated operations.

State is `reserved -> offering -> answering -> established -> closed`; failed
negotiation may instead enter the next generation. The initiator alone sends
Connect; the other endpoint alone sends Answer:

```text
SignalRef = {req:Id,to:Player,target:Endpoint,session:Id,generation:Generation}
Client.Peer.Connect SignalRef + {sdp:string}
Client.Peer.Answer SignalRef + {sdp:string}
Client.Peer.Candidate SignalRef + {
  candidate:null|{candidate:string,sdpMid:string|null,sdpMLineIndex:integer|null,usernameFragment:string|null}
}
Client.Peer.Connected SignalRef
Client.Peer.Close SignalRef + {reason:"done"|"cancelled"|"failed"|"protocol"}
```

`+` denotes object field union, not a nested object. For Connect/Answer/Candidate,
hub forwards the same suffix and signal fields, replacing `to,target` by
`from:Endpoint`. SDP is the literal offer/answer string, UTF-8 1..32768 bytes,
not JSON inside JSON. Only data-channel SDP is accepted by clients; reject any
audio/video track or inconsistent remote fingerprint; never rewrite a supplied
fingerprint. Candidate string is 1..2048 bytes, sdpMid null or 1..32 ASCII bytes,
index null or 0..15, usernameFragment null or 1..256 ASCII bytes. At least one of
mid/index must be non-null for a non-null candidate. Null marks end-of-candidates
and occurs at most once per endpoint/generation; no candidates follow it.

The initiator creates only the reliable ordered `ctl` data channel before
createOffer. Additional negotiated transfer channels use the same SCTP
association and do not trigger new SDP. Neither endpoint sends unsolicited
renegotiation. The hub admits one Connect and one Answer per generation (exact
req replays aside); Answer requires a forwarded Connect. It accepts candidates
from an endpoint only after that endpoint's own SDP was admitted. The client
buffers early local ICE until its SDP Ack and early remote ICE until
setRemoteDescription, at most 64 candidates/128 KiB, then fails that generation.
The hub forwards at most 128 candidates/256 KiB per endpoint/generation.

Each endpoint sends Connected after ctl hello negotiation succeeds. Hub Acks
each independently and marks established after both. All these commands check
the authenticated source is one of the exact two endpoints and target is the
other; generation equals current; and pair authorization is still live.
Connected requires Answer admitted. Close is permitted for a participant even
after operation authority expires, and closes the ENTIRE session and all its
channels; cancelling one transfer must use Files.Cancel/data cancellation.

```text
Client.Peer.Restart SignalRef + {auth:Auth}
Client.Peer.Closed {
  event:Id,peer:Endpoint,session:Id,generation:Generation,
  reason:"done"|"cancelled"|"failed"|"protocol"|"timeout"|"revoked"|"offline"
}
```

On a failed RTC generation with remaining authorized operations, either endpoint
may request Restart with the old current generation and renewed Files
authorization. A share-based Restart may come from the uploader ONLY if this
session already records the opposite endpoint's downloader-initiated share
direction and that same revision is still live; it cannot invent a new
direction. An offer-based Restart requires its still-accepted record. Atomically
increment generation and make that requester the new
initiator; send Reserved for the new generation to both (req only to requester).
Both close the old PC and fence its asynchronous callbacks BEFORE creating the
new PC. Concurrent Restart with the prior generation returns `stale-generation`
and current generation/session; it never creates another session. A future or
old candidate/answer cannot mutate the current PC. A request for an already
closed session returns closed/stale; reserve a new session Id if still allowed.
No in-place ICE restart or SDP glare algorithm is used in this version.

Negotiation must finish in 30 seconds from Reserved. On timeout hub sends Closed
and releases the record. Restart resets that deadline. Clients retry at most
three generations without a newly stored piece or completed list, with delays
1, 3, 9 seconds plus independently sampled 0..500 ms jitter. After that pause
the logical operation for user retry. Do not keep restarting merely because
the peer accepts SDP. Idle established sessions with no open requests/channels
close after 60 seconds locally. The hub expires a session after 24 hours or
endpoint loss, regardless of RTC activity. Session Ids are never recycled.
The downloader can observe newly durable pieces directly; its uploader may use
valid stored-count advancement as the remote progress proxy. Neither SDP nor
repeated equal stored counts qualify. The data protocol's absolute 20-attempt
cap applies even when progress resets the consecutive-three counter.

## Replies, errors and hub limits

```text
Refs = {offer?:Id,search?:Id,session?:Id,generation?:Generation}
Client.Peer.Ack {req:Id,about:string,refs:Refs}
Client.Peer.Error {
  req:Id|null,about:string,code:ErrorCode,refs:Refs,retryAfterMs?:integer
}
```

Ack is sent after successful forwarding/mutation for Connect, Answer, Candidate,
Connected and Close. Reserve/Restart succeed with Reserved; Hello with Ready;
Capabilities with Capabilities. For Close, send Ack to requester and Closed to
both. `about` is the exact suffix (ASCII, at most 32 bytes), or `"Unknown"` when
unparseable. Refs contain only well-formed ids actually present in the request;
for stale-generation return the hub's current generation with the same session.
Never echo SDP, candidates, query text or arbitrary malformed values in errors.
Null req is allowed only when the incoming req cannot be validated; clients
display a connection-level diagnostic and never use it to select a transfer.

ErrorCode is `malformed`, `too-large`, `unsupported`, `unavailable`, `denied`,
`rate`, `busy`, `conflict`, `stale-endpoint`, `stale-generation`, `unknown`,
`expired`, or `closed`. A target which is offline, missing the bundle, or gagged
is `unavailable` on targeted mutations, to avoid disclosing a gag. The explicit
Capabilities response is the only fallback decision surface. `denied` is an
operation-policy denial without target discovery. `rate` and `busy` include
retryAfterMs 1000..60000; no automatic retry for other errors. Requests that
cannot fit byte/rate budgets are rejected before allocating records.

These limits apply from Phase 1. All token buckets start full, refill
continuously against monotonic time, and charge authenticated player across
connections (not just endpoint). A row is `capacity / refill period`; one token
per command unless specified. All applicable buckets must permit admission.
Do not refund for rejected/malformed/replayed commands.

| Surface | Hard bound |
| --- | --- |
| Any GMCP payload in either new package | 65536 encoded bytes; parser depth 8; at most 2048 total JSON values. Reject before decode above cap. |
| Hello/Capabilities | 10 commands / 10 seconds combined per player. |
| Reserve/Restart | 6 / 10 seconds per player, 60 / 10 seconds hub-wide. |
| Connect/Answer/Connected | Separate reserved bucket 12 / 10 seconds per player. |
| Candidate | 128 / 10 seconds per player plus per-generation count/byte limits above. |
| Close/Files.Cancel/Withdraw/Outcome/SearchCancel and disabling Status | Dedicated 32 / 10 seconds per player, independent of candidate/search buckets. |
| All commands combined | 256 / 10 seconds per player, except the dedicated control commands above use their separate bucket so bulk cannot exhaust it. |
| Active v2 endpoints | 1024 hub-wide, one per player. |
| Sessions including reservations | 8 per endpoint, at most 2 not established; 4096 hub-wide, at most 256 not established. |
| Output | 128 KiB/s per endpoint, burst 256 KiB; search/presence use at most half; 8 MiB/s hub-wide, burst 16 MiB. |

Close, revocation, End and Lease traffic has priority over discovery/search.
Reserve at least 16 KiB/s of each endpoint output allowance for these small
events. If that control reserve cannot deliver an authority update within one
second, invalidate the affected endpoint, cease leases and close its hub
transport. Do not silently drop a revocation while renewing its lease. Reject
new work with busy when the global record/output budgets are unavailable.

Validation order for every handler: raw size/parser bound; known suffix and
schema; source connection/epoch/package registration; rate budgets; target
canonicalization and exact endpoint check; pair gag/policy; record state/role;
bounded allocation; whitelist-forward; Ack. Rate accounting for invalid schemas
uses source connection/player when available. Errors are themselves limited to
10 per second per connection; above that disconnect rather than amplify.

Disconnect and policy hooks must invalidate records before notifying peers.
`Client.Files.Revoke{scope:"peer"}` precedes Peer.Closed on a pair-wide revocation.
See client-files.md for accepted-offer and share checks; see architecture.md for
the exact proposed MOO verb entry points. No claim here asserts that these new
MOO verbs are already deployed.
