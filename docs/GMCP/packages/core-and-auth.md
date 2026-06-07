# `Core`, `Core.Supports`, and `Auth.Autologin`

## `Core`

`Core` is the base public GMCP package. It is implemented in
`src/gmcp/Core.ts`.

### Client to Server

#### `Core.Hello`

Sent during GMCP startup.

```json
{
  "client": "Mongoose Client",
  "version": "0.1"
}
```

#### `Core.KeepAlive`

```json
{}
```

#### `Core.Ping`

```json
120
```

The payload is optional and can carry the average ping value.

### Server to Client

#### `Core.Ping`

The client immediately responds with `Core.Ping`.

#### `Core.Goodbye`

```json
"Goodbye, adventurer"
```

The client emits the reason as `gmcp_goodbye`.

## `Core.Supports`

`Core.Supports` is the public GMCP support-list package.

### `Core.Supports.Set`

Sent during startup. The payload is generated from enabled registered packages:

```json
[
  "Core 1",
  "Client.Media 1"
]
```

### `Core.Supports.Add`

Used by optional packages such as MIDI and haptics when support becomes
available after startup.

```json
[
  "Client.Midi 1"
]
```

### `Core.Supports.Remove`

Used when optional support is withdrawn.

```json
[
  "Client.Midi"
]
```

## `Auth.Autologin`

`Auth.Autologin` is a Mongoose package for token login. It is implemented in
`src/gmcp/Auth.ts`.

### Server to Client: `Auth.Autologin.Token`

```json
"opaque-token"
```

The client stores this token in `localStorage` under `auth_token`.

### Client to Server: `Auth.Autologin.Login`

```json
"opaque-token"
```

Sent during startup if `localStorage.auth_token` exists.

