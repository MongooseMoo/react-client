# GMCP Implementation Report

## Executive Summary

This React MUD client implements a comprehensive GMCP (Generic MUD Communication Protocol) system with 30+ packages covering character data, room information, communication channels, media playback, MIDI support, file transfers, and IRE-specific extensions. The implementation uses a modular architecture where each GMCP package is a class that handles incoming server messages and can send client messages.

## 1. GMCP Negotiation and Enablement

### Telnet Negotiation

**File:** `src/telnet.ts`

GMCP is negotiated using Telnet IAC (Interpret As Command) sequences:

- **Telnet Option Code:** `201` (TelnetOption.GMCP) - Line 57
- **Negotiation Flow:**
  1. Server sends: `IAC WILL GMCP` (255 251 201)
  2. Client responds: `IAC DO GMCP` (255 253 201)
  3. Client sends initial GMCP messages

**Implementation in client.ts (lines 278-284):**
```typescript
if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
  console.log("GMCP Negotiation");
  this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
  (this.gmcpHandlers["Core"] as GMCPCore).sendHello();
  (this.gmcpHandlers["Core.Supports"] as GMCPCoreSupports).sendSet();
  (this.gmcpHandlers["Auth.Autologin"] as GMCPAutoLogin).sendLogin();
}
```

### Initial GMCP Handshake

After negotiation, the client immediately sends:
1. **Core.Hello** - Identifies client name and version
2. **Core.Supports.Set** - Lists all supported GMCP packages
3. **Auth.Autologin.Login** - Attempts automatic login if token exists

## 2. GMCP Message Format and Parsing

### Wire Format

GMCP messages are sent as Telnet subnegotiations:
```
IAC SB GMCP <package>.<message> <JSON data> IAC SE
```

**Example:**
```
IAC SB GMCP Char.Vitals {"hp": 1000, "maxhp": 1500} IAC SE
```

### Parsing Implementation

**File:** `src/telnet.ts` (lines 240-244)

```typescript
private handleGmcp(data: Buffer) {
  const gmcpString = data.toString();
  const [gmcpPackage, dataString] = gmcpString.split(/ +(.+?)$/, 2);
  this.emit("gmcp", gmcpPackage, dataString);
}
```

### Message Routing

**File:** `src/client.ts` (lines 445-487)

The client routes GMCP messages to appropriate handlers:

1. **Split package name:** "Char.Vitals" → package: "Char", message: "Vitals"
2. **Find handler:** Lookup in `gmcpHandlers` dictionary
3. **Call handler method:** Dynamically invoke `handle<MessageName>` method
4. **Parse JSON:** Convert message data string to JSON object
5. **Invoke with data:** Call handler method with parsed data

```typescript
private handleGmcpData(gmcpPackage: string, gmcpMessage: string) {
  const lastDot = gmcpPackage.lastIndexOf(".");
  const packageName = gmcpPackage.substring(0, lastDot);
  const messageType = gmcpPackage.substring(lastDot + 1);

  const handler = this.gmcpHandlers[packageName];
  const messageHandler = (handler as any)["handle" + messageType];

  if (messageHandler) {
    const parsedData = JSON.parse(gmcpMessage || '{}');
    messageHandler.call(handler, parsedData);
  }
}
```

### Sending GMCP Messages

**File:** `src/telnet.ts` (lines 250-260)

```typescript
sendGmcp(gmcpPackage: string, data: string) {
  const gmcpString = gmcpPackage + " " + data;
  const gmcpBuffer = Buffer.from(gmcpString);
  const buffer = Buffer.concat([
    Buffer.from([TelnetCommand.IAC, TelnetCommand.SB]),
    Buffer.from([TelnetOption.GMCP]),
    gmcpBuffer,
    this.iacSEBuffer,
  ]);
  this.stream!.write(buffer);
}
```

## 3. ALL Implemented GMCP Packages

### Registered Packages (30 total)

**File:** `src/App.tsx` (lines 89-115)

The following packages are registered and active:

#### Core Packages (2)
1. **Core** - Basic protocol operations
2. **Core.Supports** - Package capability negotiation

#### Authentication (1)
3. **Auth.Autologin** - Automatic login with stored tokens

#### Character Data (11)
4. **Char** - Basic character information
5. **Char.Afflictions** - Character afflictions/debuffs
6. **Char.Defences** - Character defenses/buffs
7. **Char.Items** - Inventory and item management
8. **Char.Offer** - Shop/merchant offers
9. **Char.Prompt** - Prompt data
10. **Char.Skills** - Skill information
11. **Char.Status** - Character status
12. **Char.Status.AffectedBy** - Status effects
13. **Char.Status.Conditions** - Status conditions
14. **Char.Status.Timers** - Status timers

#### Room/World (2)
15. **Room** - Room information and player tracking
16. **Group** - Group/party information

#### Communication (2)
17. **Comm.Channel** - Communication channels
18. **Comm.LiveKit** - LiveKit voice chat integration

#### Client Capabilities (7)
19. **Client.File** - File download support (DEFINED BUT NOT REGISTERED)
20. **Client.FileTransfer** - WebRTC file transfers
21. **Client.Html** - HTML/Markdown rendering
22. **Client.Keystrokes** - Server-side key bindings
23. **Client.Media** - Sound/music playback
24. **Client.Midi** - MIDI input/output
25. **Client.Speech** - Text-to-speech

#### Utility (2)
26. **Logging** - Server error logging
27. **Redirect** - Output window redirection

### IRE Packages (9 - DEFINED BUT NOT REGISTERED)

The following IRE-specific packages are implemented but NOT registered in App.tsx:

28. **IRE.CombatMessage** - Combat skill messages
29. **IRE.Composer** - Text editor interface
30. **IRE.Display** - Display mode control
31. **IRE.Misc** - Miscellaneous IRE features
32. **IRE.Rift** - Rift storage management
33. **IRE.Sound** - IRE sound protocol
34. **IRE.Target** - Target tracking
35. **IRE.Tasks** - Quest/task management
36. **IRE.Time** - Game time information

**Files:** `src/gmcp/IRE/*.ts` - All IRE packages exist but are never registered.

## 4. Detailed Package Documentation

### Core

**File:** `src/gmcp/Core.ts`

**Package Name:** "Core"

**Server → Client Messages:**
- `Ping` - Server ping response
  - Handler: `handlePing()` (line 31)
  - Data: None or average ping
  - Emits: "corePing" event

- `Goodbye` - Server disconnection notice
  - Handler: `handleGoodbye(reason: string)` (line 37)
  - Data: `{ reason: string }`
  - Emits: "coreGoodbye" event

**Client → Server Messages:**
- `Hello` - Initial client identification
  - Method: `sendHello()` (line 19)
  - Data: `{ client: "Mongoose Client", version: "0.1" }`

- `KeepAlive` - Connection keepalive
  - Method: `sendKeepAlive()` (line 23)
  - Data: None

- `Ping` - Client ping request
  - Method: `sendPing(avgPing?: number)` (line 27)
  - Data: Optional average ping value

### Core.Supports

**File:** `src/gmcp/Core.ts`

**Package Name:** "Core.Supports"

**Client → Server Messages:**
- `Set` - Send full list of supported packages
  - Method: `sendSet()` (line 54)
  - Data: Array of "PackageName Version" strings
  - Example: `["Char.Vitals 1", "Room.Info 1"]`

- `Add` - Add packages to support list
  - Method: `sendAdd(packagesToAdd)` (line 62)
  - Data: Array of package/version objects

- `Remove` - Remove packages from support list
  - Method: `sendRemove(packagesToRemove)` (line 68)
  - Data: Array of package names

**Notes:** Server does not send Core.Supports messages to client (line 72)

### Auth.Autologin

**File:** `src/gmcp/Auth.ts`

**Package Name:** "Auth.Autologin"

**Server → Client Messages:**
- `Token` - Server provides refresh token
  - Handler: `handleToken(data: string)` (line 7)
  - Data: String token
  - Action: Stores in localStorage as "LoginRefreshToken"

**Client → Server Messages:**
- `Login` - Send stored token for auto-login
  - Method: `sendLogin()` (line 11)
  - Data: String token from localStorage
  - Sent automatically after GMCP negotiation

### Char

**File:** `src/gmcp/Char.ts`

**Package Name:** "Char"

**Server → Client Messages:**
- `Name` - Character name information
  - Handler: `handleName(data)` (line 11)
  - Data: `{ name: string, fullname: string }`
  - Action: Updates worldData.playerId and worldData.playerName
  - Emits: "statustext" event with login message

- `Vitals` - Character vitals (HP, MP, etc.)
  - Handler: `handleVitals(data)` (line 17)
  - Data: Any structure (game-specific)
  - Emits: "vitals" event

- `StatusVars` - Status variable definitions
  - Handler: `handleStatusVars(data)` (line 24)
  - Data: `{ [key: string]: string }`
  - Emits: "statusVars" event

- `Status` - Character status update
  - Handler: `handleStatus(data)` (line 31)
  - Data: `{ [key: string]: string }`
  - Emits: "statusUpdate" event

**Client → Server Messages:**
- `Login` - Character login credentials
  - Method: `sendLogin(name, password)` (line 38)
  - Data: `{ name: string, password: string }`

### Char.Afflictions

**File:** `src/gmcp/Char/Afflictions.ts`

**Package Name:** "Char.Afflictions"

**Data Structures:**
```typescript
interface Affliction {
  name: string;
  cure: string;
  desc: string;
}
```

**Server → Client Messages:**
- `List` - Full affliction list
  - Handler: `handleList(data: Affliction[])` (line 28)
  - Emits: "afflictionsList" event

- `Add` - Add single affliction
  - Handler: `handleAdd(data: Affliction)` (line 35)
  - Emits: "afflictionAdd" event

- `Remove` - Remove afflictions by name
  - Handler: `handleRemove(data: string[])` (line 42)
  - Data: Array of affliction names
  - Emits: "afflictionRemove" event

**Client → Server Messages:** None defined

### Char.Defences

**File:** `src/gmcp/Char/Defences.ts`

**Package Name:** "Char.Defences"

**Data Structures:**
```typescript
interface Defence {
  name: string;
  desc: string;
}
```

**Server → Client Messages:**
- `List` - Full defence list
  - Handler: `handleList(data: Defence[])` (line 25)
  - Emits: "defencesList" event

- `Add` - Add single defence
  - Handler: `handleAdd(data: Defence)` (line 32)
  - Emits: "defenceAdd" event

- `Remove` - Remove defences by name
  - Handler: `handleRemove(data: string[])` (line 39)
  - Data: Array of defence names
  - Emits: "defenceRemove" event

**Client → Server Messages:** None defined

### Char.Items

**File:** `src/gmcp/Char/Items.ts`

**Package Name:** "Char.Items"

**Data Structures:**
```typescript
interface Item {
  id: string;
  name: string;
  icon?: string;
  Attrib?: string; // wWlgctmdx
  location?: ItemLocation;
}

type ItemLocation = "inv" | "room" | string; // "repNUMBER" for containers
```

**Server → Client Messages:**
- `List` - Full item list for location
  - Handler: `handleList(data)` (line 42)
  - Data: `{ location: ItemLocation, items: Item[] }`
  - Action: Adds location to each item
  - Emits: "itemsList" event

- `Add` - Add item to location
  - Handler: `handleAdd(data)` (line 48)
  - Data: `{ location: ItemLocation, item: Item }`
  - Emits: "itemAdd" event

- `Remove` - Remove item from location
  - Handler: `handleRemove(data)` (line 54)
  - Data: `{ location: ItemLocation, item: Item }`
  - Emits: "itemRemove" event

- `Update` - Update inventory item
  - Handler: `handleUpdate(data)` (line 60)
  - Data: `{ location: "inv", item: Item }`
  - Note: Only for inventory items
  - Emits: "itemUpdate" event

**Client → Server Messages:**
- `Contents` - Request container contents
  - Method: `sendContentsRequest(itemId: string)` (line 68)
  - Data: String item ID

- `Inv` - Request inventory list
  - Method: `sendInventoryRequest()` (line 73)
  - Data: Empty string

- `Room` - Request room items list
  - Method: `sendRoomRequest()` (line 77)
  - Data: Empty string

### Char.Offer

**File:** `src/gmcp/Char/Offer.ts`

**Package Name:** "Char.Offer"

**Data Structures:**
```typescript
interface OfferItem {
  name: string;
  weight: number;
  rent: number;
}
```

**Server → Client Messages:**
- `Offer` - Merchant/shop offer
  - Handler: `handleOffer(data)` (line 21)
  - Data: `{ items: OfferItem[], total_count: number, total_weight: number, total_rent: number }`
  - Emits: "offer" event

**Client → Server Messages:**
- `Offer` - Request offer data
  - Method: `sendOfferRequest()` (line 28)
  - Data: Empty object

### Char.Prompt

**File:** `src/gmcp/Char/Prompt.ts`

**Package Name:** "Char.Prompt"

**Server → Client Messages:**
- `Prompt` - Prompt data broadcast
  - Handler: `handlePrompt(data)` (line 12)
  - Data: `{ [key: string]: any }` - Game-specific prompt values
  - Emits: "prompt" event

**Client → Server Messages:**
- `Prompt` - Request prompt data
  - Method: `sendPromptRequest()` (line 19)
  - Data: Empty object

### Char.Skills

**File:** `src/gmcp/Char/Skills.ts`

**Package Name:** "Char.Skills"

**Data Structures:**
```typescript
interface SkillGroupInfo {
  name: string;
  rank: string;
}

interface SkillsList {
  group: string;
  list: string[];
  descs?: string[];
}

interface SkillInfo {
  group: string;
  skill: string;
  info: string;
}
```

**Server → Client Messages:**
- `Groups` - List of skill groups
  - Handler: `handleGroups(data: SkillGroupInfo[])` (line 29)
  - Emits: "skillGroups" event

- `List` - Skills in a group
  - Handler: `handleList(data: SkillsList)` (line 35)
  - Emits: "skillList" event

- `Info` - Detailed skill information
  - Handler: `handleInfo(data: SkillInfo)` (line 41)
  - Emits: "skillInfo" event

**Client → Server Messages:**
- `Get` - Request skill information
  - Method: `sendGetRequest(group?, name?)` (line 49)
  - Data: `{ group?: string, name?: string }`

### Char.Status

**File:** `src/gmcp/Char/Status.ts`

**Package Name:** "Char.Status"

**Server → Client Messages:**
- `Status` - Status information
  - Handler: `handleStatus(data)` (line 13)
  - Data: `{ [key: string]: any }` - Game-specific status data
  - Emits: "status" event

**Client → Server Messages:**
- `Status` - Request status data
  - Method: `sendStatusRequest()` (line 20)
  - Data: Empty object

### Char.Status.AffectedBy

**File:** `src/gmcp/Char/Status/AffectedBy.ts`

**Package Name:** "Char.Status.AffectedBy"

**Server → Client Messages:**
- `AffectedBy` - Status affects information
  - Handler: `handleAffectedBy(data)` (line 12)
  - Data: `{ [key: string]: any }` - Game-specific affects data
  - Emits: "statusAffectedBy" event

**Client → Server Messages:**
- `AffectedBy` - Request affected by data
  - Method: `sendAffectedByRequest()` (line 19)
  - Data: Empty object

### Char.Status.Conditions

**File:** `src/gmcp/Char/Status/Conditions.ts`

**Package Name:** "Char.Status.Conditions"

**Server → Client Messages:**
- `Conditions` - Status conditions
  - Handler: `handleConditions(data)` (line 13)
  - Data: `{ [key: string]: any }` - Game-specific conditions data
  - Emits: "statusConditions" event

**Client → Server Messages:**
- `Conditions` - Request conditions data
  - Method: `sendConditionsRequest()` (line 20)
  - Data: Empty object

### Char.Status.Timers

**File:** `src/gmcp/Char/Status/Timers.ts`

**Package Name:** "Char.Status.Timers"

**Server → Client Messages:**
- `Timers` - Status timers
  - Handler: `handleTimers(data)` (line 12)
  - Data: `{ [key: string]: any }` - Game-specific timers data
  - Emits: "statusTimers" event

**Client → Server Messages:**
- `Timers` - Request timers data
  - Method: `sendTimersRequest()` (line 18)
  - Data: Empty object

### Room

**File:** `src/gmcp/Room.ts`

**Package Name:** "Room"

**Data Structures:**
```typescript
interface RoomInfo {
  num: number;
  name: string;
  area: string;
  environment?: string;
  coords?: string; // "area,X,Y,Z,building"
  map?: string; // "url X Y"
  details?: string[]; // ["shop", "bank"]
  exits?: { [key: string]: number }; // {"n": 12344, "se": 12336}
}

interface RoomPlayer {
  name: string;
  fullname: string;
}
```

**Server → Client Messages:**
- `Info` - Room information
  - Handler: `handleInfo(data: RoomInfo)` (line 27)
  - Action: Updates worldData.roomId and currentRoomInfo
  - Clears player list
  - Emits: "roomInfo" event

- `WrongDir` - Invalid movement direction
  - Handler: `handleWrongDir(direction: string)` (line 38)
  - Emits: "roomWrongDir" event

- `Players` - Full player list in room
  - Handler: `handlePlayers(players: RoomPlayer[])` (line 44)
  - Action: Replaces worldData.roomPlayers, sorted by fullname
  - Emits: "roomPlayers" event

- `AddPlayer` - Player entered room
  - Handler: `handleAddPlayer(player: RoomPlayer)` (line 53)
  - Action: Adds to worldData.roomPlayers if not present, re-sorts
  - Emits: "roomAddPlayer" event

- `RemovePlayer` - Player left room
  - Handler: `handleRemovePlayer(playerName: string)` (line 68)
  - Data: Player name/ID string
  - Action: Removes from worldData.roomPlayers
  - Emits: "roomRemovePlayer" event

**Client → Server Messages:** None defined

### Group

**File:** `src/gmcp/Group.ts`

**Package Name:** "Group"

**Server → Client Messages:**
- `Info` - Group information
  - Handler: `handleInfo(data)` (line 13)
  - Data: `{ [key: string]: any }` - Game-specific group data
  - Emits: "groupInfo" event

**Client → Server Messages:**
- `Info` - Request group info
  - Method: `sendInfoRequest()` (line 20)
  - Data: Empty object

### Comm.Channel

**File:** `src/gmcp/Comm/Channel.ts`

**Package Name:** "Comm.Channel"

**Data Structures:**
```typescript
interface ChannelText {
  channel: string;
  talker: string;
  text: string;
}

interface ChannelPlayer {
  name: string;
  channels?: string[];
}
```

**Server → Client Messages:**
- `List` - Available channels
  - Handler: `handleList(data: string[])` (line 12)
  - Action: Stores in channels array

- `Text` - Channel message
  - Handler: `handleText(data: ChannelText)` (line 21)
  - Special: Sends desktop notification for "say_to_you" if window unfocused
  - Emits: "channelText" event

- `Players` - Players on channels
  - Handler: `handlePlayers(data: ChannelPlayer[])` (line 32)
  - Emits: "channelPlayers" event

- `Start` - Channel text block start
  - Handler: `handleStart(channelName: string)` (line 48)
  - Emits: "channelStart" event

- `End` - Channel text block end
  - Handler: `handleEnd(channelName: string)` (line 54)
  - Emits: "channelEnd" event

**Client → Server Messages:**
- `List` - Request channel list
  - Method: `sendList()` (line 17)
  - Data: None

- `Players` - Request players on channels
  - Method: `sendPlayersRequest()` (line 38)
  - Data: Empty string

- `Enable` - Enable a channel
  - Method: `sendEnable(channelName: string)` (line 43)
  - Data: Channel name string

### Comm.LiveKit

**File:** `src/gmcp/Comm/LiveKit.ts`

**Package Name:** "Comm.LiveKit"

**Server → Client Messages:**
- `room_token` - LiveKit room access token
  - Handler: `handleroom_token(data)` (line 10)
  - Data: `{ token: string }`
  - Action: Adds to worldData.liveKitTokens array
  - Emits: "livekitToken" event

- `room_leave` - Leave LiveKit room
  - Handler: `handleroom_leave(data)` (line 15)
  - Data: `{ token: string }`
  - Action: Removes from worldData.liveKitTokens array
  - Emits: "livekitLeave" event

**Client → Server Messages:** None defined

**Note:** Handler names use lowercase "room_token" and "room_leave" (underscores, not camelCase)

### Client.File

**File:** `src/gmcp/Client/File.ts`

**Package Name:** "Client.File"

**Status:** IMPLEMENTED BUT NOT REGISTERED IN APP.TSX

**Server → Client Messages:**
- `Download` - Request file download
  - Handler: `handleDownload(data)` (line 15)
  - Data: `{ url: string }`
  - Action: Opens URL in new browser tab

**Client → Server Messages:** None defined

### Client.FileTransfer

**File:** `src/gmcp/Client/FileTransfer.ts`

**Package Name:** "Client.FileTransfer"

**Data Structures:**
```typescript
interface FileTransferOffer {
  sender: string;
  filename: string;
  filesize: number;
  offerSdp: string;
  hash: string;
}

interface FileTransferAccept {
  sender: string;
  hash: string;
  filename: string;
  answerSdp: string;
}
```

**Server → Client Messages:**
- `Offer` - File transfer offer via WebRTC
  - Handler: `handleOffer(data: FileTransferOffer)` (line 70)
  - Action: Stores in pendingOffers, calls onFileTransferOffer

- `Accept` - File transfer accepted
  - Handler: `handleAccept(data: FileTransferAccept)` (line 82)
  - Action: Calls onFileTransferAccept

- `Reject` - File transfer rejected
  - Handler: `handleReject(data)` (line 91)
  - Data: `{ sender: string, hash: string }`
  - Action: Calls onFileTransferReject

- `Cancel` - File transfer cancelled
  - Handler: `handleCancel(data)` (line 95)
  - Data: `{ sender: string, hash: string }`
  - Action: Calls onFileTransferCancel

- `Candidate` - WebRTC ICE candidate
  - Handler: `handleCandidate(data)` (line 65)
  - Data: `{ sender: string, candidate: string }` (JSON string)
  - Action: Parses and forwards to WebRTC service

**Client → Server Messages:**
- `Offer` - Send file transfer offer
  - Method: `sendOffer(...)` (line 99)
  - Data: `{ recipient, filename, filesize, offerSdp, hash }`

- `Accept` - Accept file transfer
  - Method: `sendAccept(...)` (line 109)
  - Data: `{ sender, hash, filename, answerSdp }`

- `Reject` - Reject file transfer
  - Method: `sendReject(sender, hash)` (line 118)

- `Cancel` - Cancel file transfer
  - Method: `sendCancel(recipient, hash)` (line 122)

- `RequestResend` - Request file resend
  - Method: `sendRequestResend(sender, hash)` (line 126)

- `Candidate` - Send WebRTC ICE candidate
  - Method: `sendCandidate(recipient, candidate)` (line 58)
  - Data: `{ recipient, candidate: JSON.stringify(candidate) }`

### Client.Html

**File:** `src/gmcp/Client/Html.ts`

**Package Name:** "Client.Html"

**Server → Client Messages:**
- `Add_html` - Add HTML content
  - Handler: `handleAdd_html(data)` (line 16)
  - Data: `{ data: string[] }` - Array of HTML lines
  - Action: Joins lines with newline
  - Emits: "html" event

- `Add_markdown` - Add Markdown content
  - Handler: `handleAdd_markdown(data)` (line 20)
  - Data: `{ data: string[] }` - Array of Markdown lines
  - Action: Joins lines, converts to HTML using marked library
  - Emits: "html" event

**Client → Server Messages:** None defined

**Note:** Handler names use underscores (Add_html, Add_markdown)

### Client.Keystrokes

**File:** `src/gmcp/Client/Keystrokes.ts`

**Package Name:** "Client.Keystrokes"

**Data Structures:**
```typescript
interface KeyBinding {
  key: string;
  modifiers: string[]; // ["alt", "control", "shift", "meta"]
  command: string;
  autosend: boolean;
}
```

**Server → Client Messages:**
- `Bind` - Bind a key combination
  - Handler: `handleBind(data: KeyBinding)` (line 157)
  - Action: Adds to bindings array
  - Special: Bindings intercept keyboard events globally

- `Unbind` - Unbind a key combination
  - Handler: `handleUnbind(data)` (line 160)
  - Data: `{ key: string, modifiers: string[] }`
  - Action: Removes matching binding

- `Bind_all` - Replace all bindings
  - Handler: `handleBind_all(data)` (line 165)
  - Data: `{ bindings: KeyBinding[] }`
  - Action: Replaces entire bindings array

- `UnbindAll` - Clear all bindings
  - Handler: `handleUnbindAll(data)` (line 169)
  - Action: Clears bindings array

- `ListBindings` - Request current bindings
  - Handler: `handleListBindings(data)` (line 177)
  - Action: Sends BindingsList response

**Client → Server Messages:**
- `BindingsList` - Send current bindings
  - Method: Called automatically by handleListBindings (line 182)
  - Data: Array of KeyBinding objects

**Special Features:**
- Command substitution: `%1`, `%2`, etc. for command input words, `%*` for full input
- Autosend: Commands can be sent immediately or placed in input field
- Case-insensitive key matching
- Event listener registered on construction, removed on shutdown

### Client.Media

**File:** `src/gmcp/Client/Media.ts`

**Package Name:** "Client.Media"

**Data Structures:**
```typescript
type MediaType = "sound" | "music" | "video";

interface MediaPlay {
  name: string;
  url?: string;
  type?: MediaType;
  tag?: string;
  volume: number; // 0-100
  fadein?: number; // milliseconds
  fadeout?: number;
  start: number; // milliseconds
  loops?: number; // -1 for infinite
  priority?: number;
  continue?: boolean;
  key?: string;
  // Mongoose extensions:
  end?: number; // milliseconds
  is3d: boolean;
  pan: number; // -1 to 1
  position: number[]; // [x, y, z]
}

interface MediaStop {
  name?: string;
  type?: MediaType;
  tag?: string;
  priority?: number;
  key?: string;
}
```

**Server → Client Messages:**
- `Default` - Set default media URL
  - Handler: `handleDefault(url: string)` (line 63)
  - Action: Stores default URL for relative paths

- `Load` - Preload media file
  - Handler: `handleLoad(data)` (line 67)
  - Data: `{ url?: string, name: string }`
  - Action: Creates and caches Sound object

- `Play` - Play media
  - Handler: `handlePlay(data: MediaPlay)` (line 86)
  - Features:
    - Sound/music/video support
    - Volume control (0-100)
    - Looping (including infinite)
    - Start position
    - Fade in/out (partially implemented)
    - 3D spatial audio (HRTF panning)
    - Priority-based stopping
    - Key-based replacement
  - Special: Music uses CORS proxy

- `Stop` - Stop media
  - Handler: `handleStop(data: MediaStop)` (line 168)
  - Can filter by: name, type, tag, key
  - Empty data stops all sounds

- `ListenerPosition` - Set 3D audio listener position
  - Handler: `handleListenerPosition(data)` (line 192)
  - Data: `{ position: [x, y, z] }`

- `ListenerOrientation` - Set 3D audio listener orientation
  - Handler: `handleListenerOrientation(data)` (line 198)
  - Data: `{ up?: [x, y, z], forward?: [x, y, z] }`

**Client → Server Messages:** None defined

**Implementation:** Uses Cacophony audio library for playback

### Client.Midi

**File:** `src/gmcp/Client/Midi.ts`

**Package Name:** "Client.Midi"

**Version:** 1

**Special:** Conditionally enabled based on user preferences (line 46-48)

**Data Structures:**
```typescript
interface MidiNote {
  note: number; // 0-127
  velocity: number; // 0-127
  on: boolean;
  channel?: number; // 0-15
  duration?: number; // milliseconds
}

interface MidiControlChange {
  controller: number;
  value: number;
  channel: number;
}

interface MidiProgramChange {
  program: number;
  channel: number;
}

interface MidiSystemMessage {
  type: string;
  data: number[];
}

interface MidiRawMessage {
  hex: string;
  data: number[];
  type: string;
}
```

**Server → Client Messages:**
- `Note` - Play MIDI note
  - Handler: `handleNote(data: MidiNote)` (line 174)
  - Features: Automatic note-off scheduling with duration
  - Tracks active notes to prevent conflicts

- `ControlChange` - MIDI control change
  - Handler: `handleControlChange(data)` (line 208)
  - Sends to connected MIDI output device

- `ProgramChange` - MIDI program change
  - Handler: `handleProgramChange(data)` (line 216)
  - Sends to connected MIDI output device

- `SystemMessage` - MIDI system message
  - Handler: `handleSystemMessage(data)` (line 224)
  - Sends raw MIDI data to output device

- `RawMessage` - Raw MIDI message
  - Handler: `handleRawMessage(data)` (line 231)
  - Sends raw MIDI data to output device

- `Enable` - MIDI capability query
  - Handler: `handleEnable(data)` (line 238)
  - Server asks about MIDI support

**Client → Server Messages:**
- `Note` - Send MIDI note from input device
  - Sent automatically when MIDI input received (line 106-114)
  - Includes note, velocity, on/off, channel

- `ControlChange` - Send MIDI CC from input device
  - Sent automatically when MIDI CC received (line 115-122)

- `ProgramChange` - Send MIDI program change from input
  - Sent automatically when MIDI PC received (line 124-130)

- `SystemMessage` - Send MIDI system message from input
  - Sent automatically when system message received (line 132-138)

- `RawMessage` - Send raw MIDI from input
  - Sent automatically for uncategorized messages (line 140-148)

- `Enable` - Advertise MIDI capability
  - Method: `sendMidiCapability()` (line 268)
  - Data: `{ enabled: boolean }`

**Special Features:**
- Dynamic support advertisement via Core.Supports.Add/Remove
- Lazy initialization (ensureInitialized)
- Auto-reconnect to last used input device
- Active note tracking with timeout management
- Debug callback for UI display
- Device enumeration and connection management
- Shutdown cleans up all active notes and connections

### Client.Speech

**File:** `src/gmcp/Client/Speech.ts`

**Package Name:** "Client.Speech"

**Data Structures:**
```typescript
interface SpeechSpeak {
  text: string;
  rate: number; // Default 1
  pitch: number; // Default 1
  volume: number; // 0-1, default 0.5
}
```

**Server → Client Messages:**
- `Speak` - Text-to-speech request
  - Handler: `handleSpeak(data: SpeechSpeak)` (line 13)
  - Action: Uses browser SpeechSynthesis API
  - Parameters: rate, pitch, volume

**Client → Server Messages:** None defined

### Logging

**File:** `src/gmcp/Logging.ts`

**Package Name:** "Logging"

**Server → Client Messages:**
- `Error` - Server error message
  - Handler: `handleError(data)` (line 12)
  - Data: `{ [key: string]: any }` - Error information
  - Action: Logs to console.error
  - Emits: "gmcpError" event

**Client → Server Messages:** None defined

### Redirect

**File:** `src/gmcp/Redirect.ts`

**Package Name:** "Redirect"

**Server → Client Messages:**
- `Window` - Redirect output to window
  - Handler: `handleWindow(windowName: string)` (line 7)
  - Data: Window name string (defaults to "main" if empty)
  - Emits: "redirectWindow" event

**Client → Server Messages:** None defined

### IRE.CombatMessage

**File:** `src/gmcp/IRE/CombatMessage.ts`

**Package Name:** "IRE.CombatMessage"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface CombatMessageData {
  target: string;
  message: string;
  caster: string;
}
```

**Server → Client Messages:**
- `<skill_name>` - Dynamic combat messages
  - Handler: `handleSkillAttack(skillName, data)` (line 21)
  - Note: Skill name is part of message name (e.g., "IRE.CombatMessage.skirmishing_kick")
  - Emits: "combatMessage" event with skill name

**Client → Server Messages:** None defined

**Note:** May require custom routing logic for dynamic skill names

### IRE.Composer

**File:** `src/gmcp/IRE/Composer.ts`

**Package Name:** "IRE.Composer"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface ComposerEdit {
  title: string;
  text: string;
}
```

**Server → Client Messages:**
- `Edit` - Open editor interface
  - Handler: `handleEdit(data: ComposerEdit)` (line 16)
  - Emits: "composerEdit" event

**Client → Server Messages:**
- `SetBuffer` - Send edited text
  - Method: `sendSetBuffer(text: string)` (line 23)
  - Data: Text string (not object)

**Special:** Use regular commands for ***save, ***quit (line 30-32)

### IRE.Display

**File:** `src/gmcp/IRE/Display.ts`

**Package Name:** "IRE.Display"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Server → Client Messages:**
- `FixedFont` - Toggle fixed-width font
  - Handler: `handleFixedFont(state: "start" | "stop")` (line 6)
  - Emits: "displayFixedFont" event

- `Ohmap` - Toggle overhead map mode
  - Handler: `handleOhmap(state: "start" | "stop")` (line 12)
  - Emits: "displayOhmap" event

**Client → Server Messages:** None defined

### IRE.Misc

**File:** `src/gmcp/IRE/Misc.ts`

**Package Name:** "IRE.Misc"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface Achievement {
  name: string;
  value: string;
}

interface UrlInfo {
  url: string;
  window: string;
}
```

**Server → Client Messages:**
- `RemindVote` - Voting reminder
  - Handler: `handleRemindVote(url: string)` (line 17)
  - Emits: "miscRemindVote" event

- `Achievement` - Achievement notification
  - Handler: `handleAchievement(achievements: Achievement[])` (line 23)
  - Emits: "miscAchievement" event

- `URL` - Clickable URLs
  - Handler: `handleURL(urls: UrlInfo[])` (line 29)
  - Emits: "miscURL" event

- `Tip` - Game tip
  - Handler: `handleTip(tip: string)` (line 35)
  - Emits: "miscTip" event

**Client → Server Messages:**
- `Voted` - Confirm vote completed
  - Method: `sendVoted()` (line 42)
  - Data: Empty string

### IRE.Rift

**File:** `src/gmcp/IRE/Rift.ts`

**Package Name:** "IRE.Rift"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface RiftItem {
  name: string;
  amount: number;
  desc: string;
}
```

**Server → Client Messages:**
- `List` - Full rift item list
  - Handler: `handleList(items: RiftItem[])` (line 13)
  - Emits: "riftList" event

- `Change` - Rift item changed
  - Handler: `handleChange(item: RiftItem)` (line 19)
  - Emits: "riftChange" event

**Client → Server Messages:**
- `Request` - Request rift list
  - Method: `sendRequest()` (line 26)
  - Data: None

### IRE.Sound

**File:** `src/gmcp/IRE/Sound.ts`

**Package Name:** "IRE.Sound"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface IREPlayPayload {
  name: string;
  fadein_csec?: number; // centiseconds
  fadeout_csec?: number;
  loop?: boolean;
  volume?: number;
}

interface IREStopPayload {
  name: string;
  fadeout_csec?: number;
}

interface IREStopAllPayload {
  fadeout_csec?: number;
}

interface IREPreloadPayload {
  name: string;
}
```

**Server → Client Messages:**
- `Play` - Play IRE sound
  - Handler: `handlePlay(data: IREPlayPayload)` (line 49)
  - Action: Translates to Client.Media.Play format
  - Conversion: centiseconds → milliseconds, boolean loop → -1/0
  - Emits: "ireSoundPlay" event

- `Stop` - Stop IRE sound
  - Handler: `handleStop(data: IREStopPayload)` (line 78)
  - Action: Delegates to Client.Media.Stop
  - Emits: "ireSoundStop" event

- `Stopall` - Stop all sounds
  - Handler: `handleStopall(data: IREStopAllPayload)` (line 93)
  - Action: Delegates to Client.Media.Stop with no filters
  - Emits: "ireSoundStopall" event

- `Preload` - Preload IRE sound
  - Handler: `handlePreload(data: IREPreloadPayload)` (line 108)
  - Action: Delegates to Client.Media.Load
  - Emits: "ireSoundPreload" event

**Client → Server Messages:** None defined

**Implementation:** Delegates to Client.Media package after parameter translation

### IRE.Target

**File:** `src/gmcp/IRE/Target.ts`

**Package Name:** "IRE.Target"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface TargetInfo {
  id: string;
  short_desc: string;
  hpperc: string; // Percentage as string
}
```

**Server → Client Messages:**
- `Set` - Server sets target (e.g., via tab cycling)
  - Handler: `handleSet(targetId: string)` (line 13)
  - Emits: "targetSet" event

- `Info` - Detailed target information
  - Handler: `handleInfo(data: TargetInfo)` (line 20)
  - Emits: "targetInfo" event

**Client → Server Messages:**
- `Set` - Client sets target manually
  - Method: `sendSet(targetId: string)` (line 28)
  - Data: Target ID string

- `RequestInfo` - Request target info (HYPOTHETICAL)
  - Method: `sendRequestInfo()` (line 34)
  - Warning: This may not be a real IRE message (line 32)

### IRE.Tasks

**File:** `src/gmcp/IRE/Tasks.ts`

**Package Name:** "IRE.Tasks"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface TaskItem {
  id: string;
  name: string;
  desc: string;
  type: "quests" | "tasks" | "achievements" | string;
  cmd: string;
  status: string; // "0" or "1"
  group: string;
}
```

**Server → Client Messages:**
- `List` - Full task/quest list
  - Handler: `handleList(tasks: TaskItem[])` (line 17)
  - Emits: "tasksList" event

- `Update` - Task updated
  - Handler: `handleUpdate(task: TaskItem)` (line 23)
  - Emits: "taskUpdate" event

- `Completed` - Task completed
  - Handler: `handleCompleted(task: TaskItem)` (line 30)
  - Emits: "taskCompleted" event

**Client → Server Messages:**
- `Request` - Request task list
  - Method: `sendRequest()` (line 38)
  - Data: None

### IRE.Time

**File:** `src/gmcp/IRE/Time.ts`

**Package Name:** "IRE.Time"

**Status:** IMPLEMENTED BUT NOT REGISTERED

**Data Structures:**
```typescript
interface TimeInfo {
  day: string;
  mon: string; // Month number
  month: string; // Month name
  year: string;
  hour: string; // Unclear unit from docs
  daynight: string; // Percentage or indicator
}
```

**Server → Client Messages:**
- `List` - Full time information
  - Handler: `handleList(timeInfo: TimeInfo)` (line 16)
  - Emits: "timeList" event

- `Update` - Time changed
  - Handler: `handleUpdate(timeUpdate: Partial<TimeInfo>)` (line 22)
  - Emits: "timeUpdate" event

**Client → Server Messages:**
- `Request` - Request time info
  - Method: `sendRequest()` (line 30)
  - Data: None

## 5. GMCP Data Flow to UI

### Event-Based Architecture

All GMCP data flows to the UI via EventEmitter events. The MudClient class extends EventEmitter and emits events for each GMCP message.

### Event Pattern

```typescript
// In GMCP handler:
this.client.emit("eventName", data);

// In UI component:
useClientEvent<"eventName">(client, "eventName", defaultValue);
```

### State Updates

Some GMCP packages directly update `client.worldData`:

**File:** `src/client.ts` (lines 37-43)
```typescript
interface WorldData {
  liveKitTokens: string[];
  playerId: string;
  playerName: string;
  roomId: string;
  roomPlayers: RoomPlayer[];
}
```

**Direct State Updates:**
- `Char.Name` → worldData.playerId, worldData.playerName (Char.ts line 12-13)
- `Room.Info` → worldData.roomId, currentRoomInfo (Room.ts line 31-32)
- `Room.Players/AddPlayer/RemovePlayer` → worldData.roomPlayers (Room.ts lines 47, 59, 73)
- `Comm.LiveKit.room_token/room_leave` → worldData.liveKitTokens (LiveKit.ts lines 11, 16)

### Example: Room Player Tracking

```typescript
// GMCP handler receives Room.Players
handlePlayers(players: RoomPlayer[]) {
  // 1. Update client state
  this.client.worldData.roomPlayers = players.sort((a, b) =>
    a.fullname.localeCompare(b.fullname)
  );

  // 2. Emit event for reactive UI
  this.client.emit("roomPlayers", players);
}

// UI component subscribes to event
const roomPlayers = useClientEvent<"roomPlayers">(client, "roomPlayers", []);
```

### Available Events

Full list of GMCP-emitted events (50+ events):

**Character Events:**
- "statustext" - Login status
- "vitals" - HP/MP/etc
- "statusVars" - Status variable definitions
- "statusUpdate" - Status changes
- "prompt" - Prompt data
- "status" - Status information
- "statusAffectedBy" - Status affects
- "statusConditions" - Status conditions
- "statusTimers" - Status timers
- "afflictionsList", "afflictionAdd", "afflictionRemove" - Affliction tracking
- "defencesList", "defenceAdd", "defenceRemove" - Defence tracking
- "itemsList", "itemAdd", "itemRemove", "itemUpdate" - Item tracking
- "offer" - Merchant offers
- "skillGroups", "skillList", "skillInfo" - Skill information

**Room Events:**
- "roomInfo" - Room data
- "roomWrongDir" - Invalid movement
- "roomPlayers", "roomAddPlayer", "roomRemovePlayer" - Player tracking

**Communication Events:**
- "channelText" - Channel messages
- "channelPlayers" - Channel players
- "channelStart", "channelEnd" - Channel text blocks
- "livekitToken", "livekitLeave" - Voice chat tokens

**Client Events:**
- "html" - HTML/Markdown content
- "corePing", "coreGoodbye" - Core protocol
- "gmcpError" - Server errors
- "groupInfo" - Group information
- "redirectWindow" - Output redirection

**IRE Events (if registered):**
- "combatMessage" - Combat messages
- "composerEdit" - Editor interface
- "displayFixedFont", "displayOhmap" - Display modes
- "miscRemindVote", "miscAchievement", "miscURL", "miscTip" - Misc features
- "riftList", "riftChange" - Rift storage
- "targetSet", "targetInfo" - Target tracking
- "tasksList", "taskUpdate", "taskCompleted" - Quest tracking
- "timeList", "timeUpdate" - Game time
- "ireSoundPlay", "ireSoundStop", "ireSoundStopall", "ireSoundPreload" - IRE sounds

## 6. GMCP-Related Stores and State

### PreferencesStore

**File:** `src/PreferencesStore.ts`

**GMCP-Related Settings:**
- `midi.enabled` - Used by Client.Midi to determine if package should be active
- `sound.volume` - Used by Client.Media for global volume
- `speech.autoreadMode` - Used for automatic speech output

**Usage in GMCP:**
```typescript
// Client.Midi.ts line 46-48
get enabled(): boolean {
  return preferencesStore.getState().midi.enabled;
}
```

### InputStore

**File:** `src/InputStore.ts`

**GMCP Usage:**
- Client.Keystrokes reads current input text for command substitution
- Client.Keystrokes can set input text when autosend is false

**Usage in GMCP:**
```typescript
// Client/Keystrokes.ts lines 55, 122
const commandInput = inputStore.getState().text;
setInputText(command);
```

### WorldData

**Built into MudClient (client.ts lines 37-43)**

GMCP packages directly modify worldData:
- `playerId` - Set by Char.Name
- `playerName` - Set by Char.Name
- `roomId` - Set by Room.Info
- `roomPlayers` - Set by Room.Players/AddPlayer/RemovePlayer
- `liveKitTokens` - Set by Comm.LiveKit

### FileTransferManager

**File:** `src/FileTransferManager.ts`

**GMCP Integration:**
- Uses Client.FileTransfer as signaling mechanism
- Stores pendingOffers from GMCP messages
- Coordinates WebRTC file transfers

### MidiService

**File:** `src/MidiService.ts`

**GMCP Integration:**
- Client.Midi wraps MidiService
- Handles browser MIDI access
- Routes MIDI messages to/from GMCP

### Cacophony

**Audio Library Integration:**
- Client.Media uses Cacophony for all audio playback
- Client.Speech uses browser SpeechSynthesis API (separate)
- IRE.Sound delegates to Client.Media which uses Cacophony

## 7. Client-to-Server GMCP Messages

### Message Sending Mechanism

**File:** `src/gmcp/package.ts` (lines 19-24)

All packages use base class method:
```typescript
sendData(messageName: string, data?: any): void {
  this.client.sendGmcp(
    this.packageName + "." + messageName,
    JSON.stringify(data)
  );
}
```

**File:** `src/client.ts` (lines 500-503)
```typescript
sendGmcp(packageName: string, data?: any) {
  console.log("Sending GMCP:", packageName, data);
  this.telnet.sendGmcp(packageName, data);
}
```

### Complete List of Client Messages

**Core Protocol:**
1. Core.Hello - `{ client: "Mongoose Client", version: "0.1" }`
2. Core.KeepAlive - No data
3. Core.Ping - Optional average ping number
4. Core.Supports.Set - Array of "PackageName Version" strings
5. Core.Supports.Add - Array of `{ name, version }`
6. Core.Supports.Remove - Array of package names

**Authentication:**
7. Auth.Autologin.Login - String token

**Character:**
8. Char.Login - `{ name: string, password: string }`

**Character Data Requests:**
9. Char.Items.Contents - String item ID
10. Char.Items.Inv - Empty string
11. Char.Items.Room - Empty string
12. Char.Offer.Offer - Empty object
13. Char.Prompt.Prompt - Empty object
14. Char.Skills.Get - `{ group?: string, name?: string }`
15. Char.Status.Status - Empty object
16. Char.Status.AffectedBy.AffectedBy - Empty object
17. Char.Status.Conditions.Conditions - Empty object
18. Char.Status.Timers.Timers - Empty object

**Group:**
19. Group.Info - Empty object

**Communication:**
20. Comm.Channel.List - No data
21. Comm.Channel.Players - Empty string
22. Comm.Channel.Enable - Channel name string

**Client Capabilities:**
23. Client.FileTransfer.Offer - `{ recipient, filename, filesize, offerSdp, hash }`
24. Client.FileTransfer.Accept - `{ sender, hash, filename, answerSdp }`
25. Client.FileTransfer.Reject - `{ sender, hash }`
26. Client.FileTransfer.Cancel - `{ recipient, hash }`
27. Client.FileTransfer.RequestResend - `{ sender, hash }`
28. Client.FileTransfer.Candidate - `{ recipient, candidate: JSON }`
29. Client.Keystrokes.BindingsList - Array of KeyBinding objects
30. Client.Midi.Note - `{ note, velocity, on, channel, duration? }`
31. Client.Midi.ControlChange - `{ controller, value, channel }`
32. Client.Midi.ProgramChange - `{ program, channel }`
33. Client.Midi.SystemMessage - `{ type, data }`
34. Client.Midi.RawMessage - `{ hex, data, type }`
35. Client.Midi.Enable - `{ enabled: boolean }`

**IRE (if registered):**
36. IRE.Composer.SetBuffer - String text
37. IRE.Misc.Voted - Empty string
38. IRE.Rift.Request - No data
39. IRE.Target.Set - String target ID
40. IRE.Target.RequestInfo - No data (hypothetical)
41. IRE.Tasks.Request - No data
42. IRE.Time.Request - No data

## 8. Server-to-Client GMCP Messages

### Complete List by Package

**Core (2):**
1. Core.Ping - No data or ping value
2. Core.Goodbye - `{ reason: string }`

**Auth (1):**
3. Auth.Autologin.Token - String token

**Char (4):**
4. Char.Name - `{ name: string, fullname: string }`
5. Char.Vitals - Any structure
6. Char.StatusVars - `{ [key: string]: string }`
7. Char.Status - `{ [key: string]: string }`

**Char.Afflictions (3):**
8. Char.Afflictions.List - Array of Affliction
9. Char.Afflictions.Add - Affliction object
10. Char.Afflictions.Remove - Array of names

**Char.Defences (3):**
11. Char.Defences.List - Array of Defence
12. Char.Defences.Add - Defence object
13. Char.Defences.Remove - Array of names

**Char.Items (4):**
14. Char.Items.List - `{ location, items[] }`
15. Char.Items.Add - `{ location, item }`
16. Char.Items.Remove - `{ location, item }`
17. Char.Items.Update - `{ location, item }`

**Char.Offer (1):**
18. Char.Offer.Offer - `{ items[], total_count, total_weight, total_rent }`

**Char.Prompt (1):**
19. Char.Prompt.Prompt - Any structure

**Char.Skills (3):**
20. Char.Skills.Groups - Array of SkillGroupInfo
21. Char.Skills.List - `{ group, list[], descs?[] }`
22. Char.Skills.Info - `{ group, skill, info }`

**Char.Status (1):**
23. Char.Status.Status - Any structure

**Char.Status.* (3):**
24. Char.Status.AffectedBy.AffectedBy - Any structure
25. Char.Status.Conditions.Conditions - Any structure
26. Char.Status.Timers.Timers - Any structure

**Room (5):**
27. Room.Info - RoomInfo object
28. Room.WrongDir - String direction
29. Room.Players - Array of RoomPlayer
30. Room.AddPlayer - RoomPlayer object
31. Room.RemovePlayer - String player name

**Group (1):**
32. Group.Info - Any structure

**Comm.Channel (5):**
33. Comm.Channel.List - Array of channel names
34. Comm.Channel.Text - `{ channel, talker, text }`
35. Comm.Channel.Players - Array of `{ name, channels?[] }`
36. Comm.Channel.Start - String channel name
37. Comm.Channel.End - String channel name

**Comm.LiveKit (2):**
38. Comm.LiveKit.room_token - `{ token: string }`
39. Comm.LiveKit.room_leave - `{ token: string }`

**Client.File (1):**
40. Client.File.Download - `{ url: string }`

**Client.FileTransfer (5):**
41. Client.FileTransfer.Offer - FileTransferOffer object
42. Client.FileTransfer.Accept - FileTransferAccept object
43. Client.FileTransfer.Reject - `{ sender, hash }`
44. Client.FileTransfer.Cancel - `{ sender, hash }`
45. Client.FileTransfer.Candidate - `{ sender, candidate: JSON string }`

**Client.Html (2):**
46. Client.Html.Add_html - `{ data: string[] }`
47. Client.Html.Add_markdown - `{ data: string[] }`

**Client.Keystrokes (5):**
48. Client.Keystrokes.Bind - KeyBinding object
49. Client.Keystrokes.Unbind - `{ key, modifiers[] }`
50. Client.Keystrokes.Bind_all - `{ bindings[] }`
51. Client.Keystrokes.UnbindAll - No data
52. Client.Keystrokes.ListBindings - No data

**Client.Media (5):**
53. Client.Media.Default - String URL
54. Client.Media.Load - `{ url?, name }`
55. Client.Media.Play - MediaPlay object
56. Client.Media.Stop - MediaStop object
57. Client.Media.ListenerPosition - `{ position: [x,y,z] }`
58. Client.Media.ListenerOrientation - `{ up?, forward? }`

**Client.Midi (6):**
59. Client.Midi.Note - MidiNote object
60. Client.Midi.ControlChange - `{ controller, value, channel }`
61. Client.Midi.ProgramChange - `{ program, channel }`
62. Client.Midi.SystemMessage - `{ type, data[] }`
63. Client.Midi.RawMessage - `{ hex, data[], type }`
64. Client.Midi.Enable - `{ enabled: boolean }`

**Client.Speech (1):**
65. Client.Speech.Speak - `{ text, rate, pitch, volume }`

**Logging (1):**
66. Logging.Error - Any error structure

**Redirect (1):**
67. Redirect.Window - String window name

**IRE.CombatMessage (1):**
68. IRE.CombatMessage.<skill_name> - `{ target, message, caster }`

**IRE.Composer (1):**
69. IRE.Composer.Edit - `{ title, text }`

**IRE.Display (2):**
70. IRE.Display.FixedFont - "start" | "stop"
71. IRE.Display.Ohmap - "start" | "stop"

**IRE.Misc (4):**
72. IRE.Misc.RemindVote - String URL
73. IRE.Misc.Achievement - Array of Achievement
74. IRE.Misc.URL - Array of UrlInfo
75. IRE.Misc.Tip - String tip text

**IRE.Rift (2):**
76. IRE.Rift.List - Array of RiftItem
77. IRE.Rift.Change - RiftItem object

**IRE.Sound (4):**
78. IRE.Sound.Play - IREPlayPayload
79. IRE.Sound.Stop - IREStopPayload
80. IRE.Sound.Stopall - IREStopAllPayload
81. IRE.Sound.Preload - IREPreloadPayload

**IRE.Target (2):**
82. IRE.Target.Set - String target ID
83. IRE.Target.Info - TargetInfo object

**IRE.Tasks (3):**
84. IRE.Tasks.List - Array of TaskItem
85. IRE.Tasks.Update - TaskItem object
86. IRE.Tasks.Completed - TaskItem object

**IRE.Time (2):**
87. IRE.Time.List - TimeInfo object
88. IRE.Time.Update - Partial TimeInfo

**Total: 88 server-to-client GMCP messages across 35 packages**

## Critical Implementation Notes

### 1. Unregistered Packages

**IMPORTANT:** The following packages are implemented but NOT registered in App.tsx:

- **Client.File** - File download support
- **IRE.CombatMessage** - Combat messages
- **IRE.Composer** - Text editor
- **IRE.Display** - Display modes
- **IRE.Misc** - Miscellaneous features
- **IRE.Rift** - Rift storage
- **IRE.Sound** - IRE sound protocol
- **IRE.Target** - Target tracking
- **IRE.Tasks** - Quest/task management
- **IRE.Time** - Game time

**To activate these for iOS:** You must instantiate these package classes.

### 2. Package Initialization Order

The registration order in App.tsx (lines 89-115) is:
1. Core packages first (Core, Core.Supports)
2. Client capabilities
3. Communication
4. Authentication
5. Character data

This order ensures Core.Supports.Set includes all packages when sent.

### 3. Dynamic Package Support (Client.Midi)

Client.Midi uses dynamic registration:
- Not included in initial Core.Supports.Set
- Added via Core.Supports.Add when user enables MIDI
- Removed via Core.Supports.Remove when user disables MIDI

**Implementation pattern for iOS:**
```typescript
// When enabling feature:
coreSupports.sendAdd([{ name: "Client.Midi", version: 1 }]);

// When disabling feature:
coreSupports.sendRemove(["Client.Midi"]);
```

### 4. Message Handler Naming Convention

Handler methods MUST be named `handle<MessageName>` where MessageName matches the GMCP message name exactly:

- `Char.Vitals` → `handleVitals()`
- `Room.Info` → `handleInfo()`
- `Client.Html.Add_html` → `handleAdd_html()` (underscore preserved)
- `Comm.LiveKit.room_token` → `handleroom_token()` (lowercase preserved)

**The dynamic routing (client.ts line 458) depends on this convention.**

### 5. JSON Parsing Safety

The implementation handles missing/empty GMCP data:

```typescript
if (typeof gmcpMessage === 'string' && gmcpMessage.trim() !== '') {
  jsonStringToParse = gmcpMessage;
} else {
  jsonStringToParse = '{}';
}
```

Empty GMCP messages default to `{}`.

### 6. Special Character Handling

- **Package names:** Case-sensitive, use exact capitalization
- **Message names:** Case-sensitive, preserve underscores
- **JSON data:** Standard JSON encoding, no special escaping needed

### 7. Event-Driven Architecture

All UI updates use EventEmitter pattern:
- GMCP handlers emit events
- UI components subscribe with useClientEvent hook
- No direct DOM manipulation from GMCP handlers

### 8. Error Handling

All GMCP message handling is wrapped in try-catch:
```typescript
try {
  this.handleGmcpData(packageName, data);
} catch (e) {
  console.error("Calling GMCP:", e);
}
```

JSON parsing errors are caught and logged separately.

### 9. File Transfer Architecture

Client.FileTransfer uses WebRTC for peer-to-peer file transfer:
- GMCP used only for signaling (SDP offers/answers, ICE candidates)
- Actual file data transmitted via WebRTC DataChannel
- FileTransferManager coordinates the process

### 10. Audio Architecture

Two separate audio systems:
- **Client.Media:** Complex audio with 3D support via Cacophony library
- **Client.Speech:** Simple TTS via browser SpeechSynthesis API
- **IRE.Sound:** Translates IRE protocol to Client.Media

## iOS Implementation Checklist

To implement GMCP in iOS:

### Required Components

1. **Telnet Parser**
   - Implement IAC sequence parsing
   - Handle GMCP option (201)
   - Parse subnegotiation blocks
   - Send GMCP via IAC SB GMCP ... IAC SE

2. **GMCP Base Classes**
   - GMCPPackage base class with sendData()
   - GMCPMessage base class for type safety
   - Package registry (dictionary of packageName → package instance)
   - Message router (split package.message, find handler)

3. **Core Protocol**
   - MUST implement Core and Core.Supports
   - Send Hello immediately after negotiation
   - Send Supports.Set with all enabled packages
   - Handle Ping and Goodbye

4. **Character Data**
   - Implement Char for basic character info
   - Implement Char.Items for inventory
   - Implement Char.Vitals for HP/MP (if used by game)
   - Consider Char.Afflictions and Char.Defences for combat

5. **Room Data**
   - Implement Room for navigation
   - Track room players for multiplayer features
   - Store currentRoomInfo for map/UI updates

6. **Communication**
   - Implement Comm.Channel for chat
   - Consider Comm.LiveKit for voice (complex)

7. **Client Features**
   - Client.Media for sound/music (use iOS audio APIs)
   - Client.Html for formatted text display
   - Client.FileTransfer if file sharing needed
   - Client.Speech for accessibility (iOS TTS)
   - Client.Midi if MIDI support desired (CoreMIDI)

8. **IRE Support (if connecting to IRE MUD)**
   - Register all IRE.* packages
   - Implement IRE.Sound, IRE.Target, IRE.Tasks at minimum

### State Management

Create equivalent of WorldData:
```swift
struct WorldData {
  var playerId: String
  var playerName: String
  var roomId: String
  var roomPlayers: [RoomPlayer]
  var liveKitTokens: [String]
}
```

### Event System

Implement equivalent of EventEmitter:
- Notification-based or delegate-based pattern
- Allow UI to subscribe to GMCP events
- Emit events from GMCP handlers

### Testing Strategy

1. Test Core.Hello and Core.Supports.Set first
2. Verify package registration and handler routing
3. Test JSON parsing with edge cases (empty data, malformed JSON)
4. Test each package individually with mock server data
5. Integration test with actual MUD server

### Performance Considerations

- GMCP messages can arrive rapidly during combat
- JSON parsing should be non-blocking
- State updates should batch to avoid excessive UI redraws
- Audio playback must not block GMCP processing

## File Reference Summary

All file paths are absolute from project root:

- Core Protocol: `src/gmcp/Core.ts`, `src/gmcp/package.ts`
- Character: `src/gmcp/Char.ts`, `src/gmcp/Char/*.ts`
- Room: `src/gmcp/Room.ts`
- Communication: `src/gmcp/Comm/*.ts`
- Client Features: `src/gmcp/Client/*.ts`
- IRE Extensions: `src/gmcp/IRE/*.ts`
- Telnet: `src/telnet.ts` (lines 50-58, 240-260)
- Main Client: `src/client.ts` (lines 278-284, 300-307, 445-487)
- Registration: `src/App.tsx` (lines 89-115)
- Exports: `src/gmcp/index.ts`

---

**Report Complete:** This document covers all GMCP packages, message formats, data structures, and implementation details necessary for iOS porting.
