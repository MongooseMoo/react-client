# GMCP Package: `Client.Keystrokes`

The server gives the player keys for what they are doing right now: a cursor and "place tile" while
seated at a Scrabble board, "scan" and "status" while manning a helm console. Each key sends an
ordinary command, the same one a player without this package would type.

Keys come in **layers**. A layer belongs to one thing in the world (a game, a console) and lives only
while the player is using it. The server sends the layer when the player starts and removes it when
they stop. The client keeps the player in charge: it says when keys arrive and leave, lists them,
lets the player change them, and never lets a layer stop them typing.

## Messages from the server

### `Client.Keystrokes.Layer`

Adds a layer, or replaces the layer with the same `id`.

```json
{
  "id": "#4936",
  "label": "Scrabble",
  "modal": true,
  "bindings": [
    {"key": "ArrowLeft", "modifiers": [], "command": "press left on #4936", "label": "Cursor left"},
    {"key": "p", "modifiers": [], "command": "press p on #4936", "label": "Place the selected tile"},
    {"key": "s", "modifiers": ["ctrl"], "command": "status", "label": "Ship status", "autosend": false}
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | Any string; the server uses the object number. Unique per layer. |
| `label` | What the layer is, for announcements and the key list. |
| `modal` | `true` when the layer uses keys that normally type text. See "Keys mode". Default `false`. |
| `bindings[].key` | A [`KeyboardEvent.key`](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_key_values) value (`a`, `7`, `ArrowLeft`, `F2`, `Enter`). Case-insensitive. Aliases: `left`, `right`, `up`, `down`, `esc`, `space`, `del`. |
| `bindings[].modifiers` | Any of `shift`, `ctrl` (alias `control`), `alt` (alias `option`), `meta` (alias `cmd`). Must match exactly. |
| `bindings[].command` | The command to send. `%1`…`%9` and `%*` take words from the input box, as below. |
| `bindings[].label` | What the key does, in a few words. Required. |
| `bindings[].autosend` | `true` (default) sends at once; `false` puts the command in the input box for the player to finish. |

### `Client.Keystrokes.RemoveLayer`

`{"id": "#4936"}`. Removes that layer. Removing a layer that is not there does nothing.

### Older messages

`Bind`, `Unbind`, `Bind_all` (spelled so on the wire), `UnbindAll` and `ListBindings` keep working.
They act on a layer with id `""` and label "Server keys", which is not modal. `UnbindAll` removes every
layer. `ListBindings` is answered with `Client.Keystrokes.BindingsList`: an array of every binding in
every layer, each with its layer's `id` added.

## Matching a key

- Letters and digits match the character typed (`event.key`), and also the physical key
  (`event.code`, such as `KeyP` or `Digit7`). Otherwise Alt on a Mac, which types a different
  character, could never match.
- Modifiers must match exactly. A binding of `p` does not fire on Ctrl+P.
- Auto-repeat (`event.repeat`) never fires a binding.
- When two layers bind the same key, the layer that arrived last wins.

## Where keys work

A binding fires only when focus is in the command input, in the output, or on nothing (the page
body). It never fires in the code editor, a dialog, the preferences, or any other text field.

## Keys mode

A binding with no Ctrl, Alt or Meta modifier would take away a key the player types with. Such
bindings fire only in **keys mode**. Every other binding fires whenever focus allows.

- **Alt+Shift+H** turns keys mode on and off. It belongs to the client and no layer can bind it.
  (Not K: Firefox fires page access keys on Alt+Shift, and the player card's "Look" is K. Chrome keeps
  Alt+Shift with A, I, N and T.)
- Turning it on says "Keys mode on: Scrabble" (the labels of the modal layers). Turning it off says
  "Keys mode off".
- When a modal layer arrives, the client says "Scrabble keys available. Alt+Shift+H for keys mode."
  It does not switch keys mode on by itself.
- When the last modal layer goes away, keys mode switches off and the client says so.
- In keys mode, keys that no layer binds still type as usual, and Enter still sends.
- In keys mode, a key without Ctrl, Alt or Meta fires only while the command input is empty. Once it
  has text (a staged `score `, or anything the player started typing), keys type, so the command can
  be finished. Sending clears the input and the keys work again.

A non-modal layer is announced on arrival as "Helm console keys: 6". A layer leaving is announced as
"Helm console keys removed".

## Keys the client keeps

A binding that would take one of the client's own shortcuts, or a key the browser does not let a page
take (Ctrl+W, Ctrl+T, Ctrl+N, Ctrl+Tab and their Shift forms), is not installed. The key list shows it
as unavailable with the reason.

## The key list and changing keys

The player can open a list of every layer and its keys (label, key, command), including unavailable
ones. From that list they can give any binding a different key. The client remembers that choice per
layer id and binding command, applies it whenever the layer arrives again, and refuses a new key that
is already taken.
