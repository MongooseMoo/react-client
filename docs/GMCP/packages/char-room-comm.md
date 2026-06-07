# Character, Room, Comm, Group, Logging, and Redirect

These packages cover the conventional MUD state surface plus several Mongoose
status extensions.

## `Char`

Source: IRE/public GMCP with Mongoose `Name` handling.

### Server to Client

- `Char.Name`: `{ "name": "Player" }`; stores the character name, emits
  `characterName`, and marks the session ready.
- `Char.Vitals`: object of vitals; stores `worldData.charVitals` and emits
  `char_vitals`.
- `Char.StatusVars`: object mapping status variable names to labels; stores
  `worldData.charStatusVars` and emits `char_statusvars`.
- `Char.Status`: partial status values; merges into `worldData.charStatus` and
  emits `char_status`.

### Client to Server

- `Char.Login`: `{ "name": "...", "password": "..." }`

## `Char.Items`

Source: IRE/public GMCP.

Server messages:

- `Char.Items.List`: `{ "location": "inv", "items": [...] }`
- `Char.Items.Add`: `{ "location": "inv", "item": {...} }`
- `Char.Items.Remove`: `{ "location": "inv", "item": {...} }`
- `Char.Items.Update`: `{ "location": "inv", "item": {...} }`

Client messages:

- `Char.Items.Contents`: item id
- `Char.Items.Inv`: empty string
- `Char.Items.Room`: empty string

## `Char.Skills`

Source: IRE/public GMCP.

Server messages:

- `Char.Skills.Groups`: list of skill groups
- `Char.Skills.List`: `{ "group": "...", "list": [...] }`
- `Char.Skills.Info`: `{ "group": "...", "skill": "...", "info": "..." }`

Client message:

- `Char.Skills.Get`: `{ "group": "...", "name": "..." }`, with either field
  optional depending on the request scope.

## `Char.Afflictions` and `Char.Defences`

Source: MUD Standards.

Both packages support:

- `List`: full list
- `Add`: one item
- `Remove`: array of item names

Affliction fields are `name`, optional `cure`, and optional `desc`. Defence
fields are `name` and optional `desc`.

## Mongoose Character Status Subpackages

These packages are Mongoose extensions. Each stores the received data on
`worldData` and emits a matching client event.

- `Char.Offer.Offer`
- `Char.Prompt.Prompt`
- `Char.Status.AffectedBy.AffectedBy`
- `Char.Status.Conditions.Conditions`
- `Char.Status.Timers.Timers`

Each package also has a client request helper that sends an empty object with
the same suffix.

## `Room`

Source: IRE/public GMCP.

Server messages:

- `Room.Info`: room metadata. The implementation expects at least `num`, `name`,
  `area`, `environment`, `coords`, `exits`, and optional `details`.
- `Room.WrongDir`: string direction.
- `Room.Players`: current room player list.
- `Room.AddPlayer`: one player object.
- `Room.RemovePlayer`: player name string.

`Room.Info` updates `worldData.roomInfo` and emits `room_info`.

## `Comm.Channel`

Source: IRE/public GMCP with a Mongoose `Enable` sender.

Server messages:

- `Comm.Channel.List`
- `Comm.Channel.Text`: `{ "channel": "...", "talker": "...", "text": "..." }`
- `Comm.Channel.Players`
- `Comm.Channel.Start`
- `Comm.Channel.End`

Client messages:

- `Comm.Channel.List`
- `Comm.Channel.Players`
- `Comm.Channel.Enable`: channel name string. This is a Mongoose addition.

When `Text` arrives, the client emits `channel_text` and may send a browser
notification for `say_to_you` while the document is unfocused.

## `Group`

Source: MUD Standards/IRE-adjacent.

- Server to client: `Group.Info`
- Client to server: `Group.Info` request with empty object

The handler stores group info and emits `group_info`.

## `Logging`

Source: Mongoose.

- Server to client: `Logging.Error`

The payload is `{ "message": "..." }`. The handler logs the message to the
browser console.

## `Redirect`

Source: IRE GMCP.

- Server to client: `Redirect.Window`

The payload is a window name string. The current handler logs the target window;
it does not yet implement a redirected output UI.

