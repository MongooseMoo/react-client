### GMCP Package: `Client.Keystrokes` Specification

**Overview:**
`Client.Keystrokes` empowers MUD worlds to enhance user interaction through customizable keystroke bindings. This package allows for dynamic command execution, providing an efficient and responsive gaming experience.

#### Commands:

1. **`Client.Keystroke.Bind`**
   - **Format**: `{"key": "<key>", "modifiers": ["<modifier1>", "<modifier2>", ...], "command": "<command>", "autosend": <boolean>}`
   - `autosend`: If `true`, the command is sent immediately on keyup; if `false`, the command is placed in the input field for user review or modification.

2. **`Client.Keystroke.Unbind`**
   - **Format**: `{"key": "<key>", "modifiers": ["<modifier1>", "<modifier2>", ...]}`

3. **`Client.Keystroke.UnbindAll`**

4. **`Client.Keystroke.BindAll`**
   - **Format**: `{"bindings": [{"key": "<key>", "modifiers": ["<modifier1>", ...], "command": "<command>", "autosend": <boolean>}, ...]}`

5. **`Client.Keystroke.ListBindings`**
   - **Response Format**: JSON array of current bindings.

#### Modifiers:
1. `shift`
2. `ctrl`
3. `alt`
4. `meta`

#### Placeholders in Commands:
- `%1`, `%2`, ... `%n`: Correspond to the first, second, ... nth word in the command input.
- `%*`: Represents the entire command input.

#### Key Event:
- The package uses the `Keyup` event for triggering commands to ensure a single execution per key press.

#### Command Execution:
- Direct Execution (`autosend: true`): The command is sent immediately upon keyup.
- Input Field Placement (`autosend: false`): The command is placed into the input field, allowing user review or modification.