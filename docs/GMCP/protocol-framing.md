# Protocol Framing

## Telnet Negotiation

GMCP uses telnet option `201`. The public protocol expects the server to offer
GMCP with `IAC WILL GMCP`; the client accepts with `IAC DO GMCP`. After that,
both sides exchange subnegotiations:

```text
IAC SB GMCP <package.command> <json-payload> IAC SE
```

The Mongoose parser follows that framing in `src/telnet.ts`. Incoming
subnegotiations whose first byte is option `201` are decoded as GMCP; all other
subnegotiations are emitted separately.

## Data Format

The wire format is:

```text
<package.command> <json-payload>
```

The payload is optional in the public protocol. In this client, incoming empty
or missing payloads are normalized to `{}` before `JSON.parse`. Outbound
messages are sent through `GMCPPackage.sendData`, which serializes package data
with `JSON.stringify`.

## Registry Dispatch

Incoming package names are split at the last dot:

```text
Client.Media.Play -> package Client.Media, message Play
Room.Info -> package Room, message Info
```

`GmcpSession` looks up the registered package instance by package name, then
delivers the message suffix to that package's class-local message registry.
The registry defines the wire suffix, direction, payload codec, default
package-local event name, and generated outbound `sendX` method.

Examples:

- `Core.Ping` is delivered to the `Core` package's `Ping` registry entry and
  emits the package-local `ping` event.
- `Room.AddPlayer` is delivered to `Room` and emits `addPlayer`.
- `Client.Keystrokes.Bind_all` is delivered to `Client.Keystrokes` and emits
  `bindAll`.
- `Comm.LiveKit.room_token` is delivered to `Comm.LiveKit` and emits
  `roomToken`.

Package constructors may listen to their own package-local events for protocol
translation or local state updates. Application events and UI/service wiring
are attached outside protocol packages, primarily in `createConfiguredClient`.

## Service Integration Boundary

Protocol packages do not emit global application events. Some packages still
call concrete client-owned services because package-local I/O is not sufficient
for those behaviors:

- `GMCPPackage.sendData` uses the GMCP session transport to write outbound wire
  messages.
- `Core`, `Client.Midi`, and `Client.Haptics` inspect `Core.Supports` for
  support advertisement.
- `Client.Media`, `Client.Spatial`, and `IRE.Sound` drive the shared media
  service.
- `Client.Keystrokes` and `IRE.Composer` send ordinary text commands.

Those are service integrations, not package output events. Moving them behind
smaller service-specific dependencies is a separate service-boundary refactor.

## Startup Negotiation

When GMCP becomes ready, `MudClient` sends:

- `Core.Hello`
- `Core.Supports.Set`
- `Auth.Autologin.Login`, if a saved token exists
- `Client.Media.EffectsSupport`

`Core.Supports.Set` is built from the registered handler instances whose
`enabled` getter is true and whose `packageVersion` is present. Some optional
packages, such as `Client.Midi` and `Client.Haptics`, also dynamically add or
remove their support with `Core.Supports.Add` and `Core.Supports.Remove`.

## Known Implementation Constraints

- Payload classes are TypeScript shapes, not runtime validators.
- Unknown packages and unknown message suffixes are logged and ignored.
- Invalid JSON is logged and not delivered to the handler.
- `sendGmcp` always writes a space before the payload argument, so callers
  should pass a serialized value when a body is required.
