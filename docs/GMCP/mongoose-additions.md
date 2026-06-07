# Mongoose Additions

Mongoose additions fall into two groups:

1. Extensions to public packages such as `Client.Media` and `Comm.Channel`.
2. New Mongoose packages under `Client.*`, `Comm.*`, `Char.*`, `Logging`, and
   `Auth.Autologin`.

## Extended Public Packages

### `Client.Media`

Mongoose implements the Mudlet MCMP baseline: `Default`, `Load`, `Play`, and
`Stop`. It adds:

- `Update` for changing active sounds.
- 3D fields: `is3d`, `pan`, and `position`.
- Ambisonic playback fields: `upmix` and `channels`.
- Effect chain fields: `chain`, `send`, and inline `effects`.
- Effect management messages: `Chain`, `ChainStop`, and `Automate`.
- Client to server capability advertisement: `EffectsSupport`.
- Media Session metadata fields: `title`, `artist`, `album`, and `artwork`.
- `end` as a deprecated compatibility alias for a local stop timer. Public
  `Client.Media.Play` messages should use the MCMP `finish` field.

### `Comm.Channel`

The public IRE protocol defines list, players, start, end, and text messages.
Mongoose adds `Comm.Channel.Enable` as a client to server request with the
channel name payload.

## New Mongoose Packages

- `Auth.Autologin`: token-based login.
- `Client.File`: browser download/open request.
- `Client.FileTransfer`: WebRTC file-transfer signaling over GMCP.
- `Client.Haptics`: server-driven haptic actuation and client sensor reports.
- `Client.Html`: server-sent HTML and Markdown blocks.
- `Client.Keystrokes`: server-defined browser keybindings.
- `Client.Midi`: bidirectional Web MIDI bridge.
- `Client.Spatial`: room scene, entity, listener, and emitter state for spatial
  rendering.
- `Client.Speech`: browser speech synthesis.
- `Client.WebPush`: bearer token negotiation for Web Push registration.
- `Comm.LiveKit`: LiveKit room token delivery and leave notification.
- `Logging`: server-side logging/error messages surfaced in the client.
- `Char.Offer`, `Char.Prompt`, `Char.Status.AffectedBy`,
  `Char.Status.Conditions`, and `Char.Status.Timers`: Mongoose character and
  status subpackages.

## Compatibility Rules

- Servers should keep public MCMP fields when targeting non-Mongoose clients.
- Mongoose-only packages must be gated on `Core.Supports`.
- Optional packages whose support depends on user preferences, such as MIDI and
  haptics, may be advertised dynamically after startup.
- The client does not perform runtime schema validation, so servers should send
  complete payloads with the documented field names and types.
