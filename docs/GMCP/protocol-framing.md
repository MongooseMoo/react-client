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

## Dispatch

Incoming package names are split at the last dot:

```text
Client.Media.Play -> package Client.Media, message Play
Room.Info -> package Room, message Info
```

The handler method name is `handle` plus the exact message suffix. This makes
case and punctuation matter in the implementation even though public GMCP names
are generally treated as case-insensitive by servers and clients.

Examples:

- `Core.Ping` -> `GMCPCore.handlePing`
- `Room.AddPlayer` -> `GMCPRoom.handleAddPlayer`
- `Client.Media.ChainStop` -> `GMCPClientMedia.handleChainStop`
- `Client.Keystrokes.Bind_all` -> `GMCPClientKeystrokes.handleBind_all`
- `Comm.LiveKit.room_token` -> `GMCPCommLiveKit.handleroom_token`

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

