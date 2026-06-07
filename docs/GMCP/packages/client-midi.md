# `Client.Midi`

`Client.Midi` is a Mongoose bidirectional Web MIDI bridge implemented in
`src/gmcp/Client/Midi.ts`.

## Package

- Name: `Client.Midi`
- Version: `1`
- Source: Mongoose
- Direction: server to client for MIDI output; client to server for MIDI input
  and capability state.
- Support advertisement: dynamic. The package can add or remove itself from
  `Core.Supports` as the user enables or disables MIDI support.

## Messages

### `Client.Midi.Note`

Server to client: send a note to the selected MIDI output.

Client to server: report a note received from the selected MIDI input.

```json
{
  "note": 60,
  "velocity": 100,
  "on": true,
  "channel": 0,
  "duration": 250
}
```

`duration` is meaningful on server to client note-on messages. The client sends
the matching note-off locally after that many milliseconds.

### `Client.Midi.ControlChange`

```json
{
  "controller": 64,
  "value": 127,
  "channel": 0
}
```

### `Client.Midi.ProgramChange`

```json
{
  "program": 10,
  "channel": 0
}
```

### `Client.Midi.SystemMessage`

```json
{
  "type": "clock",
  "data": [248]
}
```

### `Client.Midi.RawMessage`

```json
{
  "hex": "90 3c 64",
  "data": [144, 60, 100],
  "type": "noteOn"
}
```

### `Client.Midi.Enable`

Server to client: logs the server MIDI enable state.

Client to server: reports whether MIDI is enabled and initialized.

```json
{
  "enabled": true
}
```

## Runtime Behavior

- The MIDI service is loaded lazily with dynamic import.
- Handlers do nothing when the user's MIDI preference is disabled.
- Output messages are sent only when an output device is connected.
- Input messages are converted into GMCP messages and sent to the server.
- `shutdown()` disconnects the MIDI service and clears pending note timers.

