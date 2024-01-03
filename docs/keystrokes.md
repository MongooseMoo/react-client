### GMCP Package: `Client.Keystrokes` Specification

**Overview:**
`Client.Keystrokes` provides an advanced mechanism for MUD worlds to facilitate user interaction via customizable keystroke bindings. This package enables dynamic execution of commands, enhancing efficiency and responsiveness in gameplay.

#### Commands:

1. **`Client.Keystrokes.Bind`**
   - **Format**: `{"key": "<key>", "modifiers": ["<modifier1>", "<modifier2>", ...], "command": "<command>", "autosend": <boolean>}`
   - `autosend`: Determines if the command is sent immediately on keyup (`true`) or placed in the input field for user review/modification (`false`).

2. **`Client.Keystrokes.Unbind`**
   - **Format**: `{"key": "<key>", "modifiers": ["<modifier1>", "<modifier2>", ...]}`

3. **`Client.Keystrokes.UnbindAll`**

4. **`Client.Keystrokes.BindAll`**
   - **Format**: `{"bindings": [{"key": "<key>", "modifiers": ["<modifier1>", ...], "command": "<command>", "autosend": <boolean>}, ...]}`

5. **`Client.Keystrokes.ListBindings`**
   - When invoked, the client should respond by sending `Client.Keystrokes.bindings_list` containing a JSON array of the current bindings.

#### Modifiers:
1. `shift`
2. `ctrl`
3. `alt`
4. `meta`

#### Placeholders in Commands:
- `%1`, `%2`, ... `%n`: Substitute for the first, second, ... nth word in the command input.
- `%*`: Substitutes for the entire command input.

#### Key Event Handling:
- Commands are triggered using the `Keyup` event to ensure a single execution per keystroke.

#### Command Execution Modes:
- Direct Execution (`autosend: true`): Commands are sent immediately upon keyup.
- Input Field Placement (`autosend: false`): Commands are placed into the input field, allowing the user to review or modify them before sending.