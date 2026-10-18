# `Client.Midi`

## Browser soundfonts and effects

Enable MIDI in Preferences, choose a soundfont collection, then connect
**Soundfont Synthesizer** in the MIDI tab. Musyng Kite, FluidR3, and FatBoy
download from [MIDI.js Soundfonts](https://github.com/gleitz/midi-js-soundfonts).
The renderer loads only when this output is connected; opening Preferences or
the MIDI tab does not download samples. Piano loads on connection. Other
programs load as requested, with the built-in synth providing immediate
playback while they load. Channel 10 percussion always uses the built-in synth.
Reconnect to apply a different collection or retry failed instruments.

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

Sample memory is bounded: four encoded instruments (32 MiB total), 32 MiB of
decoded cache, four concurrent decodes, two instrument downloads, and 64 active
sample voices. Closest decoded samples are pitch-shifted while an exact note
decodes. Files are capped at 16 MiB and downloads time out after 20 seconds.

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
