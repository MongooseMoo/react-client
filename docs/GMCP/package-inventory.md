# Package Inventory

This inventory is based on `src/createConfiguredClient.ts`, `src/gmcp/index.ts`,
and `src/gmcp/types.ts`. `createConfiguredClient()` is the default runtime
registration path and wires package-local events to application events.

## Registered Packages

| Package | Source | Direction | Status |
| --- | --- | --- | --- |
| `Core` | Public GMCP | Client and server | Implemented |
| `Core.Supports` | Public GMCP | Client to server | Implemented |
| `Auth.Autologin` | Mongoose | Client and server | Implemented |
| `Char` | IRE/public GMCP | Client and server | Implemented |
| `Char.Items` | IRE/public GMCP | Client and server | Implemented |
| `Char.Status` | IRE/public GMCP | Server to client | Implemented |
| `Char.Offer` | Mongoose | Client and server | Implemented |
| `Char.Prompt` | Mongoose | Client and server | Implemented |
| `Char.Status.AffectedBy` | Mongoose | Client and server | Implemented |
| `Char.Status.Conditions` | Mongoose | Client and server | Implemented |
| `Char.Status.Timers` | Mongoose | Client and server | Implemented |
| `Char.Afflictions` | MUD Standards | Server to client | Implemented |
| `Char.Defences` | MUD Standards | Server to client | Implemented |
| `Char.Skills` | IRE/public GMCP | Client and server | Implemented |
| `Comm.Channel` | IRE/public GMCP | Client and server | Implemented with extension |
| `Comm.LiveKit` | Mongoose | Server to client | Implemented |
| `Group` | MUD Standards/IRE-adjacent | Client and server | Implemented |
| `Logging` | Mongoose | Server to client | Implemented |
| `Redirect` | IRE GMCP | Server to client | Stub implementation |
| `Room` | IRE/public GMCP | Server to client | Implemented |
| `Client.Media` | Mudlet MCMP | Client and server | Implemented with major extensions |
| `Client.Spatial` | Mongoose | Server to client | Implemented |
| `Client.Midi` | Mongoose | Client and server | Implemented |
| `Client.Speech` | Mongoose | Server to client | Implemented |
| `Client.WebPush` | Mongoose | Client and server | Implemented |
| `Client.Keystrokes` | Mongoose | Server to client, plus list reply | Implemented |
| `Client.Html` | Mongoose | Server to client | Implemented |
| `Client.File` | Mongoose | Server to client | Implemented |
| `Client.FileTransfer` | Mongoose | Client and server | Implemented |
| `Client.Haptics` | Mongoose | Client and server | Implemented |

## Implemented IRE Files Not Registered

`src/gmcp/IRE/*` contains additional IRE handlers that are represented in
`KnownGMCPPackageMap`, but they are not currently registered by
`createConfiguredClient`:

- `IRE.CombatMessage`
- `IRE.Composer`
- `IRE.Display`
- `IRE.Misc`
- `IRE.Rift`
- `IRE.Sound`
- `IRE.Target`
- `IRE.Tasks`
- `IRE.Time`

These are documented in [IRE and utility packages](packages/ire-and-utility.md)
because they are part of the codebase and may be registered by future clients or
tests, but they are not sent in the current `Core.Supports.Set`.

## Public Specs Downloaded But Not Implemented

The upstream archive also contains package families that this client does not
currently implement, including `beip`, `config`, `external.discord`,
`gmcp.overland`, `loci.hotkey`, `loci.menu`, `MSDP`, `mudstandards.*`,
`tilemap`, and `webview`.
