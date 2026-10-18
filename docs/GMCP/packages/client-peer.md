# Client.Peer 1

Status: normative v2 file-sharing contract; specification only. Implement with
[Client.Files 1](client-files.md), the [data protocol](../../file-sharing/peer-protocol.md)
and [architecture and rollout](../../file-sharing/architecture.md).
`Client.FileTransfer 1` remains in service.

The hub authenticates endpoints and reserves one session per unordered endpoint
pair. It relays SDP and ICE, never lists, manifests, piece requests or file bytes.
Only `purpose:"files"` is supported; no media tracks or generic-purpose channel.

## Types and validation shared by both packages

MUST, SHOULD and MAY express requirements. `{a:T,b?:U}` has exactly those fields;
`?` permits omission, never null. All other fields are forbidden. Numbers are
finite safe integers, never numeric strings. Encoders use compact standard JSON.
Clients reject duplicate keys, invalid UTF-8, lone surrogates, comments and
trailing data. Client parsers enforce the depth/value limits below.

The hub validates only byte-level and structural rules: string byte lengths,
ASCII/hex shapes, integer ranges, exact allowed key sets, counts, and forbidden
bytes/components. It performs NO Unicode normalization, category lookup, case
folding or text matching. Clients enforce Unicode 15.1 rules in Client.Files.
For names/paths the hub rejects NUL, C0 bytes 0..31, DEL 127, backslash and colon;
slash is forbidden in Name and allowed only as Path's component separator.
It checks component counts/byte lengths and exact `.`/`..` components as well.

The supplied fork merges duplicate/case-differing map keys first-wins
(`C:/Users/Q/src/toaststunt-prod-6d6d2ef/src/json.cc:369`;
`C:/Users/Q/src/toaststunt-prod-6d6d2ef/src/map.cc:344-348`), confirmed by the
coordinator's production probe. Hub validation, replay comparison and whitelist-forwarding
MUST use that SAME parsed value, never raw fragments or a second parse. Require
retained keys to have exact canonical spelling, comparing bytes with `equal()`
or `strcmp()`; never rely on MOO's case-insensitive `==`, `in` or map lookup for
key spelling, lowercase hex validation or path uniqueness. Build new outgoing
maps with literal canonical keys. A merged-away field can neither change a role
nor introduce an unchecked forwarded value. The hub cannot reject duplicates;
clients must not assume that it did. Reject embedded-type mode and any parsed
ERR (including null/E_NONE), OBJ or other non-schema type. Null parses as ERR E_NONE but generate_json emits ERR as a string
(`C:/Users/Q/src/toaststunt-prod-6d6d2ef/src/json.cc:219-225,491-496`). Never emit JSON null;
absent values are omitted, including candidate optionals and error correlation.

### Raw ingress on #3838

In `#3838:parse_gmcp_message`, immediately AFTER splitting the GMCP address from
raw `data`, recognize the ASCII package boundaries `Client.Peer.` and
`Client.Files.` (also their exact package roots). Select this capped path using
ASCII CASE-INSENSITIVE address comparison so alternate casing cannot bypass it;
after the raw cap reject noncanonical address spelling before decoding. For
these addresses only:

1. `#3838:handle_message` captures the underlying transport's connection_key and
   server ctx BEFORE calling this parser or doing deferred work. Charge admission
   using that context even if the payload is invalid.
2. BEFORE the existing `try ... except (ANY)` in `parse_gmcp_message`, test
   `length(data) <= 65536`; MOO length is bytes
   (`C:/Users/Q/src/toaststunt-prod-6d6d2ef/src/list.cc:666-668`). Above this bound do NOT
   call parse_json, forward, allocate a record or echo input. Return a rejection
   reason with `about` the recognized suffix (or Unknown), `code:"too-large"`,
   empty refs and NO req, because the payload was not decoded.
3. Within the cap keep ONLY `parse_json(data,"common-subset")` inside that
   existing try. On failure return the rejection marker with `code:"malformed"`,
   no req and empty refs from its existing except arm for v2 only. Require a map
   root outside the try. Add NO new try/except or backtick catch. Keep the existing
   raw-string fallback in that except arm only for other GMCP packages.
4. Walk the parsed structure, stopping at depth >8 or >2048 total values
   (root and each map value/array item count; keys do not). Reject malformed
   before dispatch. A valid canonical top-level req may be echoed in errors
   after successful parse, otherwise omit it. Drop decoded values after failure
   and return the rejection marker. Noncanonical v2 addresses use that marker too.
5. Continue through the ctx-bound v2 dispatch only after these checks. Other
   GMCP packages retain their existing parsing and routing behavior.

The rejection marker is the MOO list `{0, reason}`, returned ONLY by this v2
rejection path; it is not wire data or a parsed message map. `reason` is a
server-only map containing the recognized canonical package, bounded about,
code, empty refs and optional validated req as above. Noncanonical addresses
and invalid root/depth/value shapes use code malformed. The parser returns
reasons and NEVER sends output. `#3838:handle_message` recognizes this list,
sends the bounded package Error using its captured ctx, and returns BEFORE
writing `message["connection"]` or calling `$gmcp_registry:route_message`.
The Error send and all other new output code run outside any try/except or
backtick catch; output failures propagate normally. On a valid v2 message it
retains the existing
`message["connection"] = player`, adds `message["ctx"]` with the previously
captured ctx (including connection_key), and routes through `#2729:route_message`
to the ctx-aware v2 package dispatcher. Other packages keep the existing message
shape and routing. Never recover a rejected v2 payload as a raw string.

The raw cap precedes allocation by parse_json; depth/value checks are POST-parse.
The parser's global `json_max_parse_depth` still protects native recursion; no
per-package native depth limit or strict mode is claimed. In the supplied fork,
`bf_parse_json` calls `json_parse_string(...,strict=0)`; strict mode's config
`{strict ? 0U : 1U,1}` is not exposed by this builtin
(`C:/Users/Q/src/toaststunt-prod-6d6d2ef/src/json.cc:570-573,685-713`). Do not
silently request a nonexistent strict argument or change the server's global
policy. Hub ingress accepts the builtin's first parsed value, including its
permissive syntax, and never forwards the raw encoding. Clients emit strict
JSON and validate the reconstructed strict hub messages. This acceptance cannot
bypass schema/identity checks on the retained parsed value.

| Type | Exact definition |
| --- | --- |
| `Id` | Cryptographically random 128 bits, 32 lowercase hexadecimal characters. Never reuse for a different operation. |
| `Hash` | 64 lowercase hexadecimal characters; sha256-leaves-16384 as in the data protocol. |
| `Player` | Canonical string matching `^#(0|[1-9][0-9]{0,9})$`, numeric value <=2147483647, resolving to the authenticated online player. No display name or serialized MOO OBJ. |
| `Endpoint` | `{player:Player,endpoint:Id,epoch:Id}`; compare the entire tuple exactly. |
| `Generation` | Integer 1..2147483647; used for transfer attempt a and Lease seq, not session negotiation. |
| `Size` | Integer 0..10737418240 (10 GiB); phase/endpoint ceilings may be lower. |
| `Revision` | Integer 0..2147483647, monotonic in an endpoint epoch; zero means no published share. |
| `Features` | Sorted unique subset of `["base","leaves","lists","ranges","search"]`; base required, ranges requires leaves, search requires lists. |
| `FeaturesWithoutBaseRequirement` | Same allowed set/order/dependencies; may be empty for a target with no ready v2 bundle. |

Every command has a fresh `req:Id`, scoped to source endpoint (Hello to the
underlying connection). Cache canonical parsed requests and replies ONLY for
Hello, Reserve, Offer, Respond, enabling Status, Search and Sharers, for 120 seconds;
512 entries/endpoint, at most 32768 hub-wide, maximum 8 MiB encoded request/reply
storage hub-wide. Check record AND byte capacity before any new cached mutation;
return busy rather than evict an unexpired entry. A replay returns the stored
reply/current authoritative state without forwarding again; changed canonical
content for that req is conflict. Enforce 32 cached-command admissions per
10 seconds/player in addition to general buckets, so one full two-minute
window admits at most 416 distinct records including an initial burst.
Store/replay checks for Hello precede supersession, so retrying an old Hello
can never roll an endpoint back. Cache may return closed/stale current state,
never revive authority in an old reply.

Other commands have NO reply cache. Capabilities is a fresh read; Candidate is
a relay (clients do not retry it), Connect/Answer are one-shot per session,
Connected/Close and file cancellation/receipt/disabling Status are state-idempotent.
Disabling Status is uncached so a full reply cache cannot postpone revocation. Repeated
Connect/Answer returns state/current Ack without forwarding; changed SDP is
conflict. Result admits only one reply per recorded target/search; duplicates
never forward again. Retransmit the same req only for cached commands. Other
lost-Ack recovery uses authoritative state or a new session, never another offer.
Offer/session/search records independently fence replay after cache expiry.
All requests, including replays and failures, consume rate tokens.

Replies echo req. Forwarded commands echo source req, replace routing with
`from:Endpoint`, and contain only whitelisted fields. Peer req is scoped to that
peer, not a reply to one's own request. Unsolicited hub events use `event:Id`.
Reject client-supplied `from`, `self`, `event`, `epoch` or other hub-owned fields.
No identity is taken from SDP, ICE or ctl. Targeted commands use `to:Player` and
`target:Endpoint` whose player fields agree; never retarget after a reconnect.
Capabilities alone uses only to.

## Endpoint registration and capability discovery

Enabled versioned packages are advertised by `src/gmcp/Core.ts:85-102`; startup
sends Core.Hello and Core.Supports.Set before login
(`src/gmcp/session.ts:74-81`). The NEW registration trigger is authenticated
current player identity AND personalDataStore.policyReady with either a confirmed
owner or confirmed visitor classification; these store fields are defined in
`src/stores/personalDataStore.ts:15-22`. A visitor still needs the hub-confirmed
current player, not a stale store owner. Core.Supports must already include both
packages. Acquire the endpoint-election lock in architecture.md before Hello.

```text
Client.Peer.Hello {
  req:Id,endpoint:Id,peer:1,files:1,data:1,features:Features,maxReceiveSize:Size
}
Client.Peer.Ready {
  req:Id,hub:Id,self:Endpoint,peer:1,files:1,data:1,
  features:Features,maxReceiveSize:Size,canShare:boolean,
  leaseMs:30000,heartbeatMs:10000
}
```

Use a fresh endpoint Id for each NEW Hello, including re-advertisement on the
SAME game connection. Retrying the identical req is the sole exception. The hub
requires both advertised packages, both implemented hub packages and data 1.
Ready.maxReceiveSize is min(Hello.maxReceiveSize,current deployment ceiling);
clients apply any stricter current quota/export ceiling before acceptance.
It assigns a new epoch. Atomically supersede any old endpoint: invalidate its
offers/sessions/search/presence, send End, then activate the new Ready. This
allows receive ceilings/capabilities to change without logging the player out.
A new req with an already used endpoint Id is conflict; never reuse old ids.
Capability re-advertisement waits until NO operation is live (pending/accepted
offers, sessions, channels, searches or exports). Do not supersede live consent
just to refresh a quota/feature ceiling. Stop new admissions while waiting;
enforce any lower current limit locally at accept/get immediately. An unsafe
active operation is cancelled explicitly before re-Hello, never silently moved.
Quota/export limits must be rechecked at accept/get even before a new Hello.

`hub` changes on process start or registry loss. Ready.features is the enabled
hub/client intersection (base only in Phase 1); no disabled feature may be
advertised. The hub classifies a player p as a guest exactly when
`$object_utils:isa(p, $guest)` is true. canShare is its authenticated non-guest
eligibility; false suppresses share setup/publishing but permits direct send,
browse and download.
Version mismatch is unsupported. Wait 10 seconds for Ready; silence is a
connection/deployment error, never fallback evidence. Use endpoint recovery below.
Deploy the hub first.

There is one active file endpoint/player. Another connection's valid Hello also
supersedes the previous endpoint. With Web Locks only the elected Files tab
sends Hello; without them use the memory-only registration rule in architecture.md. Removing
either package, logout, principal/object reuse, disconnect or hub reset ends the
epoch. Legacy-only players have no v2 endpoint.

```text
Client.Peer.Capabilities {req:Id,to:Player}
Client.Peer.Capabilities {
  req:Id,to:Player,online:boolean,target?:Endpoint,
  peer:0|1,files:0|1,data:0|1,features:FeaturesWithoutBaseRequirement,
  maxReceiveSize:Size,legacyV1:boolean
}
```

A ready target has target, versions 1 and base, and legacyV1 false. Otherwise
omit target, set versions/size zero and features empty. legacyV1 is true ONLY
for an online, ungagged target whose current connection explicitly advertises
`Client.FileTransfer 1` AND has NO ready v2 endpoint. Advertising Client.Files
does not prohibit v1 when its endpoint is absent, not yet Ready or invalidated.
No build hash/describe string/allowlist participates. If Core.Supports is not
known, the hub sends `Core.Supports.Get {}` (a NEW query) requesting the connection's complete
current package list, waits up to five seconds for `Core.Supports.Set ["Package N",...]`, and then
replies. Do not confuse an incomplete/unknown list with absence of Client.Files.
At most one pending query per requesting endpoint, 256 hub-wide; concurrent
requests get busy. This extension is not assumed on old/other clients. Coalesce
queries for the same target connection and send at most one Get per target per
five seconds, across ALL requesters; a cooldown miss returns unavailable rather
than issuing another probe. Bound combined pending/cooldown target records at
256 hub-wide; expire cooldown nodes after five seconds and reject excess with
busy instead of evicting an active cooldown. A saved complete Set avoids any
probe. New clients implement inbound Core.Supports.Get by resending their current
complete Supports.Set; baseline Supports has only outbound Set/Add/Remove
(`src/gmcp/Core.ts:70-81`), so no old-client query support is assumed. Use the
connection's already captured complete Set for old clients whenever available.
A timeout is Error unavailable, never legacyV1 true.
If no v2 endpoint is ready and the known list lacks FileTransfer 1, legacyV1
is false. Offline or a
gagged pair yields the identical unavailable representation: online false,
no target, zero versions/size, empty features and legacyV1 false. The hub checks
either-direction gag before querying, so blocked users cause no target probes.

`#4004:handle_set` owns the captured complete list: the existing telnet
`session.gmcp_data["supported_packages"]` package-to-version map, associated
with that transport's connection_key. Set marks it known-complete; Add/Remove
alone never establishes completeness. `#4004:handle_remove handle_add` keeps
that same map current without discarding a known-complete flag. After Set or
Remove, disappearance of either required v2 package invalidates the endpoint;
Add also checks the resulting map. Package-name keys may be case-insensitive.
Bind updates/query completion to the original connection_key, never a replacement
connection. `#3838:supported_packages_for` remains a reader, not the mutation hook.

Capabilities is the sole fallback decision surface. It promises no future
authorization; recheck target epoch on every mutation. Refresh results older
than 10 seconds before a new offer; stale-endpoint invalidates immediately.
Do not infer compatibility from build age, package silence or an RTC failure.

## Online lease

```text
Client.Peer.Lease {event:Id,hub:Id,self:Endpoint,seq:Generation,leaseMs:30000}
Client.Peer.End {
  event:Id,self:Endpoint,reason:"superseded"|"identity"|"shutdown"|"overload"
}
```

Lease every ten seconds, starting immediately after Ready, renews only that
epoch for 30 seconds from local monotonic receipt. No peer heartbeat renews it.
On transport loss, End, hub change or lease expiry, stop all peer work and close
RTC. No Pong; the hub disconnect hook must invalidate authority. On seq
exhaustion re-register without wrapping. Never renew a disconnected/invalid
endpoint. File-sharing failure must NEVER boot/logout the MOO game connection.

### Endpoint recovery

On End (except superseded), endpoint invalidation/error flood, Hello rejection at the
endpoint cap, Ready timeout, hub change or lease expiry, fence/dispose BOTH file
transports and clear old authority. While still authenticated, policyReady and
elected, retry Hello with NEW req/endpoint ids after backoff: nominal 1 second,
doubling on each failure to 60 seconds; add uniform 0..25% jitter and clamp the
final wait to 60 seconds. Only one pending Hello/timer per tab. Reset backoff
after a Ready followed by 30 seconds of continuous valid lease. Respect any
longer rate/busy retryAfterMs before retrying. Retry registration, never an old
offer or consent; the retained partial cache grants no operation authority.
No retry until both advertised packages, confirmed identity and policyReady
return. Transport loss waits for the game's existing reconnect/login path;
Files never initiates or suppresses game login. End identity waits for a fresh
confirmed current identity/policy before retrying; End shutdown uses the same
backoff while the authenticated game connection remains valid, including a hub
registry restart on that connection. End superseded releases file ownership and
parks that tab for EVERY tab kind, including visitors and tabs without Web Locks.
It never automatically queues for the endpoint lock or retries Hello again,
including after login/reconnect. Only a player action, such as choosing “Use
this tab for file sharing” in the Files panel, re-queues it (or permits one fresh
registration without Web Locks), preventing a re-Hello contest.

Keep transient retries silent to the player. After 30 continuous seconds without
Ready, show/announce once “File transfers unavailable; retrying”; clear it on
Ready. Do not toast each failed Hello. A sender selecting a NEW offer may use
v1 only when the hub explicitly returns legacyV1 true for its target; neither
the sender's Ready timeout nor any operation failure is fallback evidence.

## Session reservation and arbitration

The unordered pair key sorts complete Endpoint tuples lexicographically by
compact JSON arrays `[player,endpoint,epoch]`. Reservation checking/storing is
atomic without suspension, including opposite-direction simultaneous offers.

```text
Auth = {kind:"offer",offer:Id} | {kind:"share",uploader:Player,revision:Revision}
Client.Peer.Reserve {req:Id,to:Player,target:Endpoint,purpose:"files",auth:Auth}
Client.Peer.Reserved {
  req?:Id,event:Id,peer:Endpoint,session:Id,initiator:Endpoint,authorization:Auth,
  capabilities:{data:1,features:Features,maxReceiveSize:Size},negotiationMs:30000
}
```

Files.authorize_session checks online current epochs, package bundles, symmetric
gag, and an accepted unexpired exact-endpoint offer OR a currently sharing
target uploader at the supplied revision. Only the downloader may Reserve with
share auth; explicit browse/download or its user-created queue initiates this.
The hub cannot prove UI intent. Record each explicitly requested sharing
direction (at most two); offer consent does not enable sharing.

If absent, choose a never-reused session Id and requester as initiator; notify
both, req only to requester. If an authorized pair session exists, return it
without renegotiation or changing initiator. The session grants no operation
rights. From Phase 2 send current Files.Policy to both before Reserved; Phase 1
has no shares/Policy dependency. Reserved.capabilities is that recipient's peer's
effective registration. authorization describes this admission, not unrelated
operations. On accepted OfferState the OFFER SENDER sends Reserve; the receiver
waits for Reserved. Joining an existing session also makes its offer eligibility
known to the hub even if transport already exists.

Admission protects direct sends: per endpoint at most 8 total sessions and 2
not-established, of which share-only sessions may consume at most 6 total and
1 not-established. At most 4 share-only sessions per downloader player hub-wide.
Reserve 2 total and 1 not-established slots per endpoint for offer-authorized
sessions; globally share-only may use at most 3072 total/128 not-established of
4096/256. Classify a record with any admitted live accepted offer as offer-class;
share-only cannot consume its reserved capacity. On its last offer grant ending,
retain as share-class only if ALL share caps fit, otherwise close it. Offer
replays/reservations joining a pair allocate no second record. Apply the same
partition in the client session pool, including unsolicited reservations.

Hub and client use `reserved -> offering -> answering -> established -> closed`;
established means both ctl hello handshakes reported Connected. The initiator
alone sends Connect, the other alone Answer:

```text
SignalRef = {req:Id,to:Player,target:Endpoint,session:Id}
Client.Peer.Connect SignalRef + {sdp:string}
Client.Peer.Answer SignalRef + {sdp:string}
Client.Peer.Candidate SignalRef + {
  candidate?:{candidate:string,sdpMid?:string,sdpMLineIndex?:integer,usernameFragment?:string},
  end?:true
}
Client.Peer.Connected SignalRef
Client.Peer.Close SignalRef + {reason:"done"|"cancelled"|"failed"|"protocol"}
Client.Peer.Closed {
  event:Id,peer:Endpoint,session:Id,
  reason:"done"|"cancelled"|"failed"|"protocol"|"timeout"|"revoked"|"offline"
}
```

`+` is field union. Connect/Answer/Candidate forwards the suffix and fields,
replacing to,target with from. SDP is a literal 1..32768 UTF-8 byte string.
Clients permit only data-channel SDP, reject audio/video and SDP with zero
`a=fingerprint` lines or multiple differing fingerprint values (identical
repetition is allowed). A new session PC may legitimately have a new fingerprint;
never rewrite it or compare it to an earlier session's fingerprint.

Candidate requires exactly one of candidate or end:true. Candidate string is
1..2048 bytes; optional sdpMid 1..32 ASCII bytes, index 0..15, usernameFragment
1..256 ASCII bytes. At least mid or index is present. Clients omit browser-null
optional properties. Browser null candidate OR candidate.candidate=="" maps to
end:true, with candidate omitted. Coalesce these notifications into at most one
end marker per endpoint/session, sent after all nonempty candidates; none follow
it. Never forward browser JSON null to the hub.

Create only reliable ordered ctl before createOffer; later transfer channels
use the same SCTP association, without new SDP. No unsolicited renegotiation.
Admit one Connect and one Answer/session; Answer requires forwarded Connect.
Candidates follow the endpoint's admitted SDP. Buffer local ICE until SDP Ack,
remote ICE until setRemoteDescription, at most 64/128 KiB; excess fails session.
Hub forwards at most 128/256 KiB per endpoint/session. Connected requires Answer
and successful ctl hello; Ack each, mark established after both. Check exact
source/target membership, current session and live pair authority on all signals.
Close remains allowed after operation authority ends; it closes every channel
in that session. Cancelling one transfer instead uses Files.Cancel/data cancel.

There is no Restart command or mutable session generation. Any local teardown
(idle, protocol failure, abandoned negotiation, RTC failure without retry, or
retry) fences callbacks, sends Close when GMCP is usable, and releases local
resources. Close is state-idempotent; hub Acks and emits Closed to both. Do not
send Close in response to an already authoritative Closed/End. On retry wait
for Closed (up to five seconds; after timeout pause and diagnose) before a NEW
Reserve with fresh req; require a NEW session Id. The offer sender re-reserves
pushes, the downloader re-reserves share operations. Opposite simultaneous
retries still join one atomic pair record. Stable logical t survives; a increases.
Delayed old-session signals never affect a new PC. No in-place ICE restart.

Hub negotiation timeout is 30 seconds from Reserved; expire and send Closed.
Idle established sessions with no requests/channels close after 60 seconds
locally AND send Close. Hub expiry is 24 hours or endpoint loss. Retry at most
three times without newly durable data/completed list, delays 1,3,9 seconds plus
0..500 ms jitter, then pause for user retry. Advancing stored counts are the
uploader's progress proxy; SDP/equal counts do not reset retries. Absolute cap:
20 automatic attempts per logical operation per ten minutes, even with progress.

## Replies, errors and hub limits

```text
Refs = {offer?:Id,search?:Id,session?:Id}
Client.Peer.Ack {req:Id,about:string,refs:Refs}
Client.Peer.Error {
  req?:Id,about:string,code:ErrorCode,refs:Refs,retryAfterMs?:integer
}
```

Connect/Answer/Candidate/Connected/Close succeed with Ack; Reserve with Reserved,
Hello with Ready, Capabilities with Capabilities. about is exact ASCII suffix
<=32 bytes or Unknown. Reflect only validated ids in refs, never raw SDP, ICE,
query or malformed values. Omit req when it cannot safely be validated (including
pre-parse rejection); show a connection-level diagnostic, never choose a transfer.

ErrorCode is malformed, too-large, unsupported, unavailable, denied, rate, busy,
conflict, stale-endpoint, unknown, expired or closed. Offline/missing bundle/gag
is unavailable on targeted mutation without revealing gag. denied is operation
policy denial. rate/busy require retryAfterMs 1000..60000; no automatic command
retries for other errors. The endpoint-recovery loop above uses a fresh Hello
after recoverable endpoint loss; it never retries failed transfer commands.
Reject before record allocation when capacity is unavailable.

Buckets start full, refill continuously by monotonic time, and charge player
across all connections. One token/command; failures/replays consume it. Phase 1
has only general, Offer and control buckets, plus the bounded reply-cache
admission count above. Later phases add only the bounded search fanout budget.

| Surface | Hard bound |
| --- | --- |
| Either package payload | 65536 raw bytes before parse; depth 8/2048 values after hub parse and in client parser. |
| Ordinary client commands | 256 / 10 seconds/player. |
| Offer | Also 10 / 60 seconds/player. |
| Close/Files.Cancel/Withdraw/Outcome/SearchCancel and disabling Status | Separate 32 / 10 seconds/player; does not spend ordinary tokens. |
| Cached state-creating commands | Also <=32 admissions/10 seconds/player, excluding exact req replays. |
| Active endpoints | 1024 hub-wide, one/player. |
| Sessions/reservations | 8 total/2 not-established per endpoint, 4096/256 hub-wide; offer-only reserved partition and downloader share caps above. |

There is no application-level output pacing/priority reserve in the MOO. Send
bounded directed control events immediately; cap input/records/fanout instead.
Check current destination and `buffered_output_length` before emission. If its
queued transport output exceeds 262144 bytes, or a safety update cannot be
queued, invalidate that FILE endpoint, stop leases and all ordinary v2 output,
and revoke its partners; attempt one small End overload only if queueable. The
client fences on local loss/End or within its 30-second lease. Never keep
renewing authority while dropping safety events. This does not promise delivery
within one second. Do not call boot_player, close the transport or log out the
game player. A rejected Hello while output is overloaded creates no endpoint.

Validation: raw cap/parse; bounded post-parse structure; known suffix/schema;
source ctx/epoch/bundle; rate/cache admission; exact target; gag/policy; state/
role; bounded allocation; canonical forwarding; reply. Rate-account malformed
traffic by source connection/player. Emit at most 10 errors/second/connection;
above this suppress errors and invalidate that v2 endpoint, never disconnect
the game. Unknown suffixes return unsupported; outbound-only events from clients
are malformed. Phase 1 need not install later-phase handlers.

Disconnect/policy hooks invalidate before notifications. Files.Revoke peer
precedes Closed on pair revocation. See Client.Files and architecture.md for
operation checks and exact proposed MOO entry points; none are claimed deployed.
