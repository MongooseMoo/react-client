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

`Auth.Autologin.Resume` carries `{version:2, token, sessionId, installationId, playerUuid, requestId}`.
The server validates the grant's account, selected player's current membership,
stored object reference and UUID. A resume does not use RECENT/ROLLOVER.
`Auth.Autologin.Session` requests `{version:2, purpose, sessionId, installationId, requestId}` after confirmed selection. Owners include existing subscription material when available, proving installation possession before asynchronous HTTP enrollment completes. `SessionToken` carries `{version:2, purpose, token, sessionId, installationId, playerUuid, playerRef, requestId, selectionOrder, expires_at}`. Purpose is `owner` or `visitor` and remains immutable across resume. Replies must match the pending request and selected player. Each session has its own rotating token.
`SessionStatus` reports an expired grant or connected-player conflict; `SessionLogout` revokes the addressed grant. Legacy string Login/Token messages remain distinct and cannot consume v2 grants.
The server assigns selectionOrder when it confirms a new session/player selection. Refreshes and automatic resumes retain that order. Enrollment compares this order, so delayed HTTP registrations cannot replace a more recent confirmed primary choice.
A new tab chooses an account explicitly; legacy browser-wide tokens do not
become authority for an arbitrary player. A conflicting connected session
requires explicit takeover instead of automatic reconnect loops.

## Enrollment and grants

V2 `Client.WebPush.SessionRequest` carries `{version:2, installationId, sessionId, requestId}`.
Its reply carries `{version:2, token, expires_at, serverKey, playerUuid,
playerRef, installationId, sessionId, requestId}` from trusted session identity.
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

Preference revisions allow a scoped replacement of an unexpired reader grant
through `POST /api/away/browser_refresh`. Replacement preserves its original
deadline and operations. A separate credential epoch invalidates replacements
after Forget, endpoint rotation, password changes or player recycling.

The staged HTTP surface is `/api/webpush/browser_key`, `browser_profile`,
`bindings`, and `browser_control`, plus `/api/away/browser_lines`, `browser_ack`,
`browser_command`, and `browser_refresh`. Enrollment uses a five-minute grant
whose authority follows the pinned native session; away operations use a
distinct recipient/session grant. Identifiers and profile reads confer no authority.
`POST /api/webpush/browser_logout` uses the pinned native tab grant, rather than
an installation credential, to revoke the tab even when its socket is disconnected.
It removes automatic membership while preserving explicit retention. A network
failure clears local authority and reports that server revocation was not confirmed.

## Temporary visits

Canonical IndexedDB policy has `owner`, `visitor`, and `owner-paused` phases.
Transitions compare revisions; BroadcastChannel signals cause each window to
read canonical state. Native tab locks prevent copied session credentials from
becoming shared resume authority. New tabs choose a character manually.

Begin temporary visit pauses this installation's notifications before signing
out the owner tab. Other owner windows and editors hide their contents; dirty
editors keep their work with Save disabled after the owning connection ends.
Visitor session grants carry purpose `visitor`, expire within one hour, and
cannot enroll durable notifications. Visitor commands, output, logs and file
pieces do not enter owner archives. End leaves owners paused. Resume owner
requires an authenticated previously saved character and an explicit choice.
Policy/storage failures keep personal archives paused while ordinary login
remains available. Other devices retain their own enrollment and preferences.

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
