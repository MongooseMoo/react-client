# `Client.Midi`

## Browser soundfonts and effects

Enable MIDI in Preferences, then connect **Soundfont Synthesizer** in the MIDI
tab. It is a SoundFont synthesizer ([spessasynth](https://github.com/spessasus/spessasynth_lib))
playing one bank, MuseScore General (MIT), downloaded from
`https://mongoose.world/sounds/soundfonts/MuseScore_General.sf3`. That file is
built by `scripts/build-soundbank.mjs`. The synthesizer and the bank load only when
this output is connected; opening Preferences or the MIDI tab downloads nothing.
The built-in synth plays everything, percussion included, until the bank has
loaded, and stays in use if it cannot load. Reconnect to retry.

Both browser synths share the client's volume, mute, Escape/Resume, and master
effects. External hardware outputs are controlled by their own audio devices.

### `Client.Midi.Route` (server to client)

Route the entire browser MIDI output through a named `Client.Media.Chain`:

```json
{ "chain": "room" }
```

Use `send` to retain dry output and add an auxiliary feed at a level from 0 to 1:

```json
{ "chain": "room", "send": 0.4 }
```

This is a full route description: `{}` or `{"chain":""}` restores dry output.
`send` requires a nonempty chain. The route applies to soundfont notes, built-in
fallback notes, and percussion together. A missing chain plays dry and joins
automatically when the chain is defined. Removing a chain restores dry output;
recreating it restores the requested route. Chain presets, replacement,
`Client.Media.Automate`, and bypass work through the existing effects system.
Server disconnect/reset clears the route. Route does not enable MIDI, load a
soundfont, or alter external hardware outputs.

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
