# Browser/player protocol v2

V2 is negotiated explicitly. Legacy login remains available; v2 browser delivery
is enabled only after the paired MOO and worker implementation is accepted.
Identifiers never confer authority. All times on the wire are Unix seconds.

## Identity

`serverKey` is the canonical HTTPS API origin. Local/WASM/snapshot runtimes use
separate keys. `installationId` is a random UUID created in one IndexedDB
read/write transaction, shared by pages and the worker. `sessionId` identifies
one tab owner; a copied tab must acquire different ownership before resuming.
Transport/identity changes increment a document-local generation, cancelling
old work. `Char.Name` retains `name` (object reference), `fullname` (title), and
`uuid` (opaque player identity). A changed player is a new identity transition.

The identity invariant is an own nonempty player UUID, unique among current
players. Creation/recycling gets a new ID. Rename/reinitialization preserves
an existing own unique ID. Historical unique short IDs remain opaque valid IDs.
Inherited/missing/ambiguous IDs require migration before v2 enrollment.

## Login

V2 `Auth.Autologin.Login` carries `{version:2, token, sessionId, playerUuid}`.
The server validates the grant's account, selected player's current membership,
stored object reference and UUID. A resume does not use RECENT/ROLLOVER.
`Auth.Autologin.Token` v2 carries `{version:2, token, sessionId, playerUuid,
expires_at}` after confirmed selection. Each session has its own rotating token.
A new tab chooses an account explicitly; legacy browser-wide tokens do not
become authority for an arbitrary player. A conflicting connected session
requires explicit takeover instead of automatic reconnect loops.

## Enrollment and grants

V2 `Client.WebPush.Request` carries `{version:2, installationId, sessionId}`.
Its reply carries `{version:2, token, expires_at, serverKey, playerUuid,
playerRef, installationId, sessionId}` from trusted session identity.
Subscription POST includes that metadata, the subscription, `mode` (`primary`
or explicitly `retained`), and the expected binding revision when updating.
The server returns its authoritative `{bindingId, revision}`.

One installation owns one subscription destination and explicit player bindings.
Confirmed selection changes the primary binding; historical visits do not retain
alerts. Separate active sessions and explicit retention can preserve other
characters. Account change suspends prior-account enrollment unless retaining
both is explicit and authorized. Installation possession must be verified from
existing owned grants and subscription material; a claimed UUID alone is unsafe.
Endpoint updates and binding revisions reconcile atomically. Revocation wins
over stale callbacks. Commands stay pinned to the authenticated player.

Browser grants carry audience `browser-away` and narrow operations; operational
grants use audience `ops`. Legacy Ops authority remains usable. Browser grants
never authorize the Ops API. Every use validates expiration, revocation, current
membership, stored object identity and binding revision.

## Away envelopes

HTTP and push data retain `{version:2, serverKey, playerUuid, playerRef,
bindingId, revision, streamId, streamOrder, firstAvailable, from, to, lines}`.
`lines` is an array of `[sequence,text]`; sequence is monotonic within a stream.
`streamId` is unique; `streamOrder` determines which stream is current without
depending on arrival order or wall-clock seconds. Payloads fit the complete
serialized UTF-8 sender budget. Grants are never included in push or click URLs.

Storage keys include server/player/binding/stream. Credentials also include
session ownership. Rendered cursors belong to individual tabs. The worker routes
only to matching owners; unmatched pages never get message text. Missing legacy
identity is never guessed from the current player. Delivery, storage receipt,
rendering, notification closure and reading are distinct; server acknowledgments
advance only their authorized binding and stream, monotonically.

Tags and Stop/close operations include server/player/binding. A click focuses the
matching authenticated session or opens the normal selector. Stop affects that
browser/player/kind. Tab sign-out revokes its authority/membership; Forget removes
that player's browser authority, enrollment and personal state. Global @notify
preferences continue to restrict all destinations.

## Activation

Server capabilities precede client activation. Ambiguous legacy shared endpoints
are suspended until authenticated reconciliation; historical players are not an
implicit retained list. Old push data cannot render under a new player. Bound
provider TTL and old-page/new-worker behavior before activation. Rollback disables
v2 delivery while retaining normal login; it cannot restore unsafe shared stores.
Temporary visitor mode also requires personal history/log isolation and is a
separate milestone. Real Safari visible-push behavior needs device acceptance.
