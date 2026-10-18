# `Client.Midi`

The single current package advertises exactly `Client.Midi 1` when MIDI is
enabled. Enabling publishes the complete current `Core.Supports.Set`, followed
by `Client.Media.PlaybackSupport`. Disabling removes the package and releases
owned notes and pedals. There is no separate MIDI enable message.

## Input and playback

The same message names have distinct strict schemas in each direction. All
fields shown are required; additional fields are rejected. Channels are 0–15,
notes/programs/values 0–127. An active note needs positive velocity and `on` must
be boolean.

Client to server `Client.Midi.Note`:

```json
{ "channel": 0, "note": 60, "velocity": 100, "on": true }
```

Server to client `Client.Midi.Note`:

```json
{ "originId": "performer-a", "eventId": 1, "channel": 0, "note": 60, "velocity": 100, "on": true }
```

The matching release has the same origin, event, channel and note, with
`"on":false`. A delayed release cannot stop a newer strike. Server identity is
mandatory; client input cannot supply it. No duration travels on the wire.
Manual duration is local, bounded 1–600000ms, and emits a real matching Note-off.
Retrigger, manual release, disable, reset and shutdown cancel that timer.

`Client.Midi.ControlChange` accepts controllers 7,10,11,64 only:

```json
{ "channel": 0, "controller": 64, "value": 127 }
```

`Client.Midi.ProgramChange`:

```json
{ "channel": 0, "program": 0 }
```

Server control/program playback additionally requires `originId`. Its program,
pedal and mix state belong only to that origin. Server `Client.Midi.NoteReleaseAll`
is exactly `{"originId":"performer-a"}` and releases only that performer.
Raw device and system messages are not sent over this protocol.

## Selected output and capability

Physical MIDI input and output remain available in the MIDI tab. Server live
playback uses a browser output with independently owned voices; selecting a
hardware output reports `liveMidi:false`.

The sole `Client.Media.PlaybackSupport` report has no report-level format
selector. It contains `modules`, `liveMidi`, `sharedTransport`, `mediaLoops`,
`presentationCues`, `midiSequences`, and optional correlated `requestId`.
Supported live output reports:

```json
{ "maxHeldNotes": 128, "controllers": [7, 10, 11, 64], "percussion": true }
```

Live readiness does not require a shared network clock. Synchronized scores,
files and cues still require `sharedTransport`. A performer may own 128 live
voices, while live and score playback share the hard 256-voice ceiling. Exhaustion
is reported without stealing unrelated voices. Channel 9 percussion supports
notes 35–81. Local pause/interruption clears live voices; resume does not replay
them.

`Client.Media.SupportRequest` is exactly `{requestId,reason?}`, where requestId
is a lowercase UUIDv4 and reason is `missing` or `stale`. The original payload
is limited to 256 ASCII characters. Each request receives one correlated report
after the full Set, before clock rearm. The last 64 IDs are deduplicated per
physical transport across identity/readiness resets; a replacement transport
may answer again. Every valid current-transport Char.Name refreshes the current
inventory and report, including guest and unchanged identity notifications.

## Browser soundfonts and routing

Choose a soundfont collection, then connect **Soundfont Synthesizer**. Musyng
Kite, FluidR3 and FatBoy load instruments from MIDI.js Soundfonts. Sampled
melodic instruments and the built-in percussion renderer provide their actual
programs; hardware devices retain their own sound and audio controls.

Sample loading is bounded to four encoded instruments totaling 32 MiB, 32 MiB of
decoded cache, four concurrent decodes and two instrument downloads. Downloads
are limited to 16 MiB each and time out after 20 seconds. Raw device preview has
its own 64-sample voice bound; independent live/score voices use the shared
limits above. Closest decoded samples can be pitch-shifted while an exact note
decodes. Reconnect to apply a changed collection or retry a failed instrument.

Both browser synths share client volume, mute, Escape/Resume and master effects.
`Client.Midi.Route` is a complete route description:

```json
{ "chain": "room", "send": 0.4 }
```

Omit send to route directly through the chain. With send 0–1, retain dry output
and add an auxiliary feed. `{}` or `{"chain":""}` restores dry output. A
missing chain plays dry until it exists. Removal/reset clears the route without
changing hardware output, user preference or instrument loading.

World editor/library messages retain their existing direct authoring owner,
request correlation, access checks and revision checks. Private capture keeps
timestamp subscribers attached while suppressing room input relay.
