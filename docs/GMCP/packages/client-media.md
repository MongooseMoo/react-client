# `Client.Media`

`Client.Media` starts from the Mudlet MUD Client Media Protocol (MCMP) and is
extended by Mongoose for 3D audio, ambisonics, effect chains, and browser media
session integration. It is implemented in `src/gmcp/Client/Media.ts`.

## Package

- Name: `Client.Media`
- Version: `1`
- Source: Mudlet MCMP plus Mongoose extensions
- Direction: mostly server to client, with `EffectsSupport` sent client to
  server.

## Upstream MCMP Messages

### `Client.Media.Default`

Payload: a string URL in this implementation.

Sets the default media URL prefix used by `Load` and `Play`.

### `Client.Media.Load`

```json
{
  "name": "weather/rain.ogg",
  "url": "https://example.invalid/media/",
  "type": "music"
}
```

Preloads media at `(url || defaultUrl) + name`. Set `type` to `"music"` to use
the same proxied URL as music playback. The client retains at most 32 preloaded
entries and evicts the oldest preload when the limit is reached.

### `Client.Media.Play`

Baseline public fields:

```json
{
  "name": "weather/rain.ogg",
  "url": "https://example.invalid/media/",
  "type": "sound",
  "tag": "weather",
  "volume": 50,
  "fadein": 1000,
  "fadeout": 1000,
  "start": 0,
  "finish": 10000,
  "loops": -1,
  "priority": 10,
  "continue": true,
  "key": "rain-loop"
}
```

Implementation notes:

- `type` is `sound`, `music`, or `video`.
- `volume` is interpreted as 0 to 100 and converted to local gain.
- `start` and `finish` are absolute MCMP positions in milliseconds that define
  the play segment `[start, finish)`. `finish` defaults to the end of the file
  and is clamped to it; a `finish` at or before `start` is ignored.
- `loops` is how many times the segment plays: `1` (default) plays it once,
  `N` repeats it `N` times, and `-1` repeats it until stopped. Only the
  segment repeats, never the whole file.
- Buffered sounds realize the segment as a Cacophony sprite region, so the
  loop is sample-accurate and gapless and the sound ends by itself after its
  last pass. Streamed `music` cannot use regions: it seeks back to `start`
  every `finish - start` milliseconds and stops after `N × (finish - start)`
  (never, for `loops: -1`).
- `priority` stops lower-priority active sounds.
- `key` is the active sound identity. If absent, the resolved media URL is used.
- `music` URLs are routed through the configured CORS proxy before playback.
- `end` is accepted as a deprecated alias for `finish` (a position, not a
  delay) when `finish` is absent.
- Replaying a `Play` for a key that is still playing the same segment keeps it
  playing; it does not restart it or arm a second stop.

### `Client.Media.Stop`

```json
{
  "name": "weather/rain.ogg",
  "type": "sound",
  "tag": "weather",
  "key": "rain-loop",
  "priority": 10
}
```

Stops matching sounds by `name`, `type`, `tag`, or `key`. An empty object stops
all sounds.

## Mongoose Message Extensions

### `Client.Media.Update`

Updates active sounds selected by `key` or `name`.

Supported update fields include:

- Identity and selectors: `name`, `url`, `type`, `tag`, `key`
- Playback state: `volume`, `fadein`, `fadeout`, `start`, `finish`, `loops`,
  `priority`, `continue`

`start` alone seeks to that absolute position (clamped into the current
segment). `finish` (or legacy `end`) moves the segment: the sound's original
`Play` is replayed with the update merged over it, which restarts playback at
the new segment's `start`.
- Spatial state: `is3d`, `pan`, `position`
- Ambisonic state: `upmix`, `channels`
- Effects: `chain`, `send`, `effects`
- Occlusion: `occlusion`

### `Client.Media.Chain`

Defines, replaces, or removes a named effect chain. Empty or omitted `effects`
is treated by `MediaEffects.setChain` as a chain update/removal according to
that manager's rules.

```json
{
  "id": "cave",
  "preset": "large-cave",
  "gain": 0.8,
  "fadein": 250,
  "effects": [
    {
      "id": "verb",
      "type": "reverb",
      "params": {
        "mix": 0.45
      }
    }
  ]
}
```

### `Client.Media.ChainStop`

Removes a named effect chain.

```json
{
  "id": "cave"
}
```

### `Client.Media.Automate`

Ramps effect parameters or toggles bypass on a named chain or on an inline chain
attached to a playing sound.

```json
{
  "chain": "cave",
  "target": "verb",
  "params": {
    "mix": 0.2
  },
  "ramp": 1000,
  "curve": "linear"
}
```

Use `key` instead of `chain` to target the inline effect chain on the sound with
that key.

```json
{
  "key": "rain-loop",
  "target": 0,
  "bypass": true
}
```

## Mongoose Fields on `Play` and `Update`

### 3D Audio

- `is3d`: enables HRTF panning.
- `pan`: stereo pan, interpreted as a percentage-like value and divided by 100.
- `position`: `[x, y, z]` sound position.

### Ambisonics

- `upmix: "ambisonic"` routes playback through `AmbisonicRenderer`.
- `channels` sets the input channel count. If omitted, the client tries the
  active sound metadata, then the decoded buffer channel count, then falls back
  to 2.

Named effect chains are not supported for ambisonic sounds. Use inline
`effects` instead.

### Effects

- `chain`: route the sound through a named chain.
- `send`: aux-send level into the named chain while keeping dry output.
- `effects`: inline per-sound effect chain torn down with the sound.

### Occlusion

- `occlusion`: how obstructed this voice's direct path is, a number from 0
  (clear) to 1 (fully occluded: about -18 dB and an 800 Hz low-pass). A value
  outside 0..1, or not a number, rejects the whole message.

Cacophony renders it per voice (`Playback.setOcclusion`), ahead of the panner
and independently of `volume`, fades, distance gain, `send` and effect routing,
on the stereo, HRTF and ambisonic routes alike.

- A `Play` is full state: without the field the amount is 0 (clear), whether
  the voice is new or kept.
- A `Play` that starts a new voice applies the amount before the first sample.
- A `Play` that keeps the playing voice (same key and source) glides to its
  amount over 150 ms. So a voice heard at 0.3 and re-`Play`ed without the field
  glides to clear.
- An `Update` with the field glides to the new amount over 150 ms. Without the
  field the amount is unchanged.

Send the field only to a client whose `EffectsSupport` has `occlusion: true`.

### Media Session Metadata

For `type: "music"`, Mongoose can publish now-playing metadata and local
transport controls to the browser Media Session API:

- `title`
- `artist`
- `album`
- `artwork`

Transport controls pause, resume, stop, and seek the local Cacophony sound only.
MCMP has no client to server transport-control verb.

## Client to Server: `Client.Media.EffectsSupport`

Sent after GMCP startup to advertise the supported effect vocabulary:

```json
{
  "version": 1
}
```

The exact payload is built by `buildEffectsSupport()` in
`src/audio/effects/MediaEffects.ts`. Its boolean `occlusion` is true when the
audio engine can render the per-voice `occlusion` field of `Play` and `Update`.
