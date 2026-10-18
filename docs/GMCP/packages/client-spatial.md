# `Client.Spatial`

`Client.Spatial` is a Mongoose protocol for room-scale spatial state. It is
implemented in `src/gmcp/Client/Spatial.ts` and feeds `spatialStore`,
`sessionStore`, Cacophony listener state, and client events.

## Package

- Name: `Client.Spatial`
- Version: `1`
- Source: Mongoose
- Direction: server to client

## Types

```ts
type SpatialVector = [number, number, number];
```

### Entity

```json
{
  "id": "player-1",
  "position": [0, 0, 0],
  "velocity": [0, 0, 0],
  "forward": [0, 0, -1],
  "up": [0, 1, 0],
  "name": "Glorp",
  "kind": "player",
  "flags": ["self"]
}
```

### Emitter

```json
{
  "id": "fountain-loop",
  "binding": "world",
  "position": [3, 0, -8],
  "mediaKey": "fountain",
  "mediaType": "sound",
  "tag": "ambient",
  "loops": -1,
  "volume": 40,
  "sourceKind": "water"
}
```

`binding` is `entity` or `world`. Entity-bound emitters may specify
`sourceEntity` and `offset`; world-bound emitters use `position`.

Overlay fields are optional Mongoose additions:

- `overlay`: overlay id. Absent means the normal world scene.
- `frame`: `head` or `world`.
- `transparency`: 0 to 1 world ducking/visibility value.
- `priority`: overlay stack order.

## Messages

### `Client.Spatial.Scene`

Replaces the complete spatial scene.

```json
{
  "roomId": "room-123",
  "listenerId": "player-1",
  "listenerPosition": [0, 0, 0],
  "listenerOrientation": {
    "forward": [0, 0, -1],
    "up": [0, 1, 0]
  },
  "entities": [],
  "emitters": []
}
```

### `Client.Spatial.EntityEnter`

Adds or replaces one entity.

```json
{
  "entity": {
    "id": "mob-1",
    "position": [1, 0, -2]
  }
}
```

### `Client.Spatial.EntityLeave`

Removes one entity.

```json
{
  "entityId": "mob-1"
}
```

### `Client.Spatial.EntityMove`

Updates an entity's position and optional orientation.

```json
{
  "entityId": "mob-1",
  "position": [2, 0, -2],
  "velocity": [1, 0, 0],
  "forward": [1, 0, 0],
  "up": [0, 1, 0]
}
```

### `Client.Spatial.ListenerPosition`

Updates the listener position and optional listener entity id.

```json
{
  "listenerId": "player-1",
  "position": [0, 0, 0]
}
```

### `Client.Spatial.ListenerOrientation`

Updates the listener orientation and optional listener entity id.

```json
{
  "listenerId": "player-1",
  "forward": [0, 0, -1],
  "up": [0, 1, 0]
}
```

### `Client.Spatial.EmitterStart`

Starts or replaces one emitter.

```json
{
  "emitter": {
    "id": "sensor-overlay",
    "binding": "entity",
    "sourceEntity": "player-1",
    "mediaKey": "sensor",
    "overlay": "sensor-sphere",
    "frame": "head",
    "transparency": 0.35,
    "priority": 10
  }
}
```

### `Client.Spatial.EmitterStop`

Stops one emitter.

```json
{
  "emitterId": "sensor-overlay"
}
```

