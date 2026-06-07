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
  "url": "https://example.invalid/media/"
}
```

Preloads a sound at `(url || defaultUrl) + name`.

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
- `start` and `finish` are MCMP positions in milliseconds. When `finish` is
  present, playback is stopped after `finish - start` milliseconds.
- `loops: -1` loops indefinitely. Other loop counts are converted to the
  underlying Cacophony loop count.
- `priority` stops lower-priority active sounds.
- `key` is the active sound identity. If absent, the resolved media URL is used.
- `music` URLs are routed through the configured CORS proxy before playback.
- `end` is accepted as a deprecated Mongoose compatibility alias for a local
  stop delay in milliseconds when `finish` is absent.

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
- Playback state: `volume`, `fadein`, `fadeout`, `start`, `loops`, `priority`,
  `continue`
- Spatial state: `is3d`, `pan`, `position`
- Ambisonic state: `upmix`, `channels`
- Effects: `chain`, `send`, `effects`

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
`src/audio/effects/MediaEffects.ts`.
