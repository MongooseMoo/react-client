# `Client.Haptics`

`Client.Haptics` is a Mongoose protocol for haptic device control and sensor
reporting. It is implemented in `src/gmcp/Client/Haptics.ts`.

## Package

- Name: `Client.Haptics`
- Version: `1`
- Source: Mongoose
- Direction: bidirectional
- Support advertisement: dynamic, based on the user's haptics preference.

## Server to Client Messages

### `Client.Haptics.Actuate`

```json
{
  "source": "room-effect",
  "commands": [
    {
      "actuator": 0,
      "type": "vibrate",
      "intensity": 0.75,
      "duration": 500,
      "clockwise": true
    }
  ]
}
```

`actuator` may be `null` for all actuators when the underlying command supports
that.

### `Client.Haptics.Stop`

```json
{
  "source": "room-effect",
  "actuator": null
}
```

Stops the specified actuator, or all actuators when `actuator` is `null` or
omitted.

### `Client.Haptics.Status`

```json
{
  "enabled": true,
  "maxCommandRate": 20,
  "maxSensorRate": 10,
  "serverVersion": 1
}
```

The client stores this server status, applies `maxCommandRate` to the haptics
service when it is positive, and stops devices if the server disables haptics.

### `Client.Haptics.SensorSubscribe`

```json
{
  "sensors": [0, 1],
  "rate": 10
}
```

Subscribes to sensor readings at the requested rate.

### `Client.Haptics.SensorUnsubscribe`

```json
{
  "sensors": [0, 1]
}
```

## Client to Server Messages

### `Client.Haptics.Capabilities`

Sent when device capabilities change or when support is advertised.

```json
{
  "devices": []
}
```

The exact payload is returned by `hapticsService.getCapabilities()`.

### `Client.Haptics.Sensor`

```json
{
  "readings": [
    {
      "sensor": 0,
      "type": "Pressure",
      "value": 0.75
    }
  ]
}
```

### `Client.Haptics.Stopped`

```json
{
  "reason": "user_stop"
}
```

## Runtime Behavior

- The package is enabled only when `preferences.haptics.enabled` is true.
- It listens to haptics service capability, stopped, and sensor-reading events.
- `shutdown()` removes service listeners, unsubscribes sensors, and stops all
  haptics devices.

