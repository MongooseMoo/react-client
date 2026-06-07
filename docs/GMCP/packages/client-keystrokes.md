# `Client.Keystrokes`

`Client.Keystrokes` is a Mongoose protocol for server-defined browser key
bindings. It is implemented in `src/gmcp/Client/Keystrokes.ts`.

## Package

- Name: `Client.Keystrokes`
- Version: `1`
- Source: Mongoose
- Direction: server to client for binding management; client to server for
  binding list replies.

## Binding Model

```ts
interface KeyBinding {
  key: string;
  modifiers: string[];
  command: string;
  autosend: boolean;
}
```

`key` is compared case-insensitively against `KeyboardEvent.key`. Modifiers are
also compared case-insensitively. The implementation recognizes these modifier
names:

- `alt`
- `control`
- `shift`
- `meta`

The modifier set must match exactly. For example, a binding for `control+x`
does not fire if `shift+control+x` is pressed.

## Server to Client Messages

### `Client.Keystrokes.Bind`

Adds one binding.

```json
{
  "key": "F5",
  "modifiers": [],
  "command": "look",
  "autosend": true
}
```

### `Client.Keystrokes.Unbind`

Removes bindings with the same key and exact modifier set.

```json
{
  "key": "F5",
  "modifiers": []
}
```

### `Client.Keystrokes.Bind_all`

Replaces the complete binding list. The wire suffix is `Bind_all` because the
handler is `handleBind_all`.

```json
{
  "bindings": [
    {
      "key": "F5",
      "modifiers": [],
      "command": "look",
      "autosend": true
    }
  ]
}
```

### `Client.Keystrokes.UnbindAll`

Clears all bindings.

```json
{}
```

### `Client.Keystrokes.ListBindings`

Requests the current binding list.

```json
{}
```

## Client to Server Messages

### `Client.Keystrokes.BindingsList`

Sent in response to `ListBindings`.

```json
[
  {
    "key": "F5",
    "modifiers": [],
    "command": "look",
    "autosend": true
  }
]
```

## Command Expansion

Before execution, placeholders in `command` are expanded from the current input
field:

- `%1`, `%2`, ... use the first, second, and later whitespace-delimited words.
- `%*` uses the complete current input field.
- Missing numbered words leave the original placeholder unchanged.

If `autosend` is true, the expanded command is sent immediately with
`MudClient.sendCommand`. If false, the expanded command replaces the input
field text and waits for the user.

## Event Behavior

The live implementation listens to `document` `keydown`, prevents default
browser behavior when a binding matches, and removes the event listener on
package shutdown.

