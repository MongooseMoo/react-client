# Win32 GMCP Implementation Report

## Executive Summary

The Win32 React MUD client implements a comprehensive GMCP (Generic MUD Communication Protocol) system with 27 registered packages covering character data, room information, communication channels, media playback, MIDI support, file transfers, and authentication. Additionally, 9 IRE-specific packages are implemented but not registered. The implementation uses a modular class-based architecture where each GMCP package handles incoming server messages via dynamic handler routing and can send client messages through a base class method.

**Total Packages:** 36 implemented (27 registered + 9 IRE unregistered)
**Total Message Handlers:** 82+ handler methods across all packages
**Total Events Emitted:** 57+ distinct event types for UI integration

## 1. GMCP Negotiation and Protocol

### 1.1 Telnet Negotiation

**File:** `C:\Users\Q\code\react-client\src\telnet.ts`

GMCP is negotiated using Telnet IAC (Interpret As Command) sequences:

**Telnet Option Code:** `201` (TelnetOption.GMCP) - Line 57

**Negotiation Flow:**
1. Server sends: `IAC WILL GMCP` (255 251 201)
2. Client responds: `IAC DO GMCP` (255 253 201)
3. Client sends initial GMCP messages

**Implementation in client.ts (lines 282-287):**
```typescript
if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
  console.log("GMCP Negotiation");
  this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
  (this.gmcpHandlers["Core"] as GMCPCore).sendHello();
  (this.gmcpHandlers["Core.Supports"] as GMCPCoreSupports).sendSet();
  (this.gmcpHandlers["Auth.Autologin"] as GMCPAutoLogin).sendLogin();
}
```

### 1.2 Initial GMCP Handshake

After negotiation completes, the client immediately sends three messages in sequence:

1. **Core.Hello** - Identifies client: `{ client: "Mongoose Client", version: "0.1" }`
2. **Core.Supports.Set** - Lists all supported packages with versions
3. **Auth.Autologin.Login** - Attempts automatic login if refresh token exists in localStorage

### 1.3 GMCP Message Format

**Wire Format:**
```
IAC SB GMCP <package>.<message> <JSON data> IAC SE
```

**Example:**
```
IAC SB GMCP Char.Vitals {"hp": 1000, "maxhp": 1500} IAC SE
```

### 1.4 Message Parsing

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 240-244)

```typescript
private handleGmcp(data: Buffer) {
  const gmcpString = data.toString();
  const [gmcpPackage, dataString] = gmcpString.split(/ +(.+?)$/, 2);
  this.emit("gmcp", gmcpPackage, dataString);
}
```

**Parsing Steps:**
1. Convert buffer to string
2. Split on first space: `"Char.Vitals {"hp":100}"` → `["Char.Vitals", "{"hp":100}"]`
3. Emit to client layer for routing

### 1.5 Message Routing

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 448-490)

**Routing Algorithm:**
1. Split package name on **last dot** to separate package from message type
   - `"Char.Vitals"` → package: `"Char"`, message: `"Vitals"`
   - `"Char.Status.Timers"` → package: `"Char.Status"`, message: `"Timers"`
2. Look up handler in `gmcpHandlers` dictionary by package name
3. Construct handler method name: `"handle" + messageType`
4. Parse JSON data (with empty object fallback for missing data)
5. Dynamically invoke handler method with parsed data

**Implementation:**
```typescript
private handleGmcpData(gmcpPackage: string, gmcpMessage: string) {
  const lastDot = gmcpPackage.lastIndexOf(".");
  const packageName = gmcpPackage.substring(0, lastDot);
  const messageType = gmcpPackage.substring(lastDot + 1);

  const handler = this.gmcpHandlers[packageName];
  if (!handler) {
    console.log("No handler for GMCP package:", packageName);
    return;
  }

  const messageHandler = (handler as any)["handle" + messageType];

  if (messageHandler) {
    let jsonStringToParse: string;
    if (typeof gmcpMessage === 'string' && gmcpMessage.trim() !== '') {
      jsonStringToParse = gmcpMessage;
    } else {
      console.warn(`GMCP message data for ${packageName}.${messageType} is missing or empty. Defaulting to {}.`);
      jsonStringToParse = '{}';
    }

    try {
      const parsedData = JSON.parse(jsonStringToParse);
      messageHandler.call(handler, parsedData);
    } catch (e) {
      console.error(`Error parsing GMCP JSON for ${packageName}.${messageType}:`, e);
    }
  }
}
```

### 1.6 Sending GMCP Messages

**Base Package Method (package.ts lines 19-24):**
```typescript
sendData(messageName: string, data?: any): void {
  this.client.sendGmcp(
    this.packageName + "." + messageName,
    JSON.stringify(data)
  );
}
```

**Client Layer (client.ts lines 503-506):**
```typescript
sendGmcp(packageName: string, data?: any) {
  console.log("Sending GMCP:", packageName, data);
  this.telnet.sendGmcp(packageName, data);
}
```

**Telnet Layer (telnet.ts lines 250-260):**
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

## 2. ALL Implemented GMCP Packages

### 2.1 Registered Packages (27 total)

**File:** `C:\Users\Q\code\react-client\src\App.tsx` (lines 90-117)

#### Core Packages (2)
1. **GMCPCore** - "Core" - Basic protocol operations
2. **GMCPCoreSupports** - "Core.Supports" - Package capability negotiation

#### Authentication (1)
3. **GMCPAutoLogin** - "Auth.Autologin" - Automatic login with stored tokens

#### Character Data (11)
4. **GMCPChar** - "Char" - Basic character information
5. **GMCPCharAfflictions** - "Char.Afflictions" - Character afflictions/debuffs
6. **GMCPCharDefences** - "Char.Defences" - Character defenses/buffs
7. **GMCPCharItems** - "Char.Items" - Inventory and item management
8. **GMCPCharOffer** - "Char.Offer" - Shop/merchant offers
9. **GMCPCharPrompt** - "Char.Prompt" - Prompt data
10. **GMCPCharSkills** - "Char.Skills" - Skill information
11. **GMCPCharStatus** - "Char.Status" - Character status
12. **GMCPCharStatusAffectedBy** - "Char.Status.AffectedBy" - Status effects
13. **GMCPCharStatusConditions** - "Char.Status.Conditions" - Status conditions
14. **GMCPCharStatusTimers** - "Char.Status.Timers" - Status timers

#### Room/World (2)
15. **GMCPRoom** - "Room" - Room information and player tracking
16. **GMCPGroup** - "Group" - Group/party information

#### Communication (2)
17. **GMCPCommChannel** - "Comm.Channel" - Communication channels
18. **GMCPCommLiveKit** - "Comm.LiveKit" - LiveKit voice chat integration

#### Client Capabilities (7)
19. **GMCPClientFile** - "Client.File" - File download support
20. **GMCPClientFileTransfer** - "Client.FileTransfer" - WebRTC file transfers
21. **GMCPClientHtml** - "Client.Html" - HTML/Markdown rendering
22. **GMCPClientKeystrokes** - "Client.Keystrokes" - Server-side key bindings
23. **GMCPClientMedia** - "Client.Media" - Sound/music playback
24. **GMCPClientMidi** - "Client.Midi" - MIDI input/output
25. **GMCPClientSpeech** - "Client.Speech" - Text-to-speech

#### Utility (2)
26. **GMCPLogging** - "Logging" - Server error logging
27. **GMCPRedirect** - "Redirect" - Output window redirection

### 2.2 Unregistered IRE Packages (9 total)

**Status:** IMPLEMENTED BUT NOT REGISTERED IN APP.TSX

The following IRE-specific packages exist in `C:\Users\Q\code\react-client\src\gmcp\IRE\` but are **never instantiated or registered**:

28. **GmcPIRECombatMessage** - "IRE.CombatMessage" - Combat skill messages
29. **GmcPIREComposer** - "IRE.Composer" - Text editor interface
30. **GmcPIREDisplay** - "IRE.Display" - Display mode control
31. **GmcPIREMisc** - "IRE.Misc" - Miscellaneous IRE features
32. **GmcPIRERift** - "IRE.Rift" - Rift storage management
33. **GmcPIRESound** - "IRE.Sound" - IRE sound protocol
34. **GmcPIRETarget** - "IRE.Target" - Target tracking
35. **GmcPIRETasks** - "IRE.Tasks" - Quest/task management
36. **GmcPIRETime** - "IRE.Time" - Game time information

**Note:** IRE packages are NOT exported from `src/gmcp/index.ts` and are NOT registered in App.tsx, so they are currently inactive.

## 3. Package Details and Data Structures

### 3.1 Core

**File:** `C:\Users\Q\code\react-client\src\gmcp\Core.ts`
**Package Name:** "Core"
**Version:** 1

#### Server → Client Messages

**Core.Ping**
- Handler: `handlePing()` (line 31)
- Data: None or average ping value
- Action: Emits "corePing" event
- Purpose: Server ping response for latency measurement

**Core.Goodbye**
- Handler: `handleGoodbye(reason: string)` (line 37)
- Data: `{ reason: string }`
- Action: Emits "coreGoodbye" event
- Purpose: Server disconnection notice

#### Client → Server Messages

**Core.Hello**
- Method: `sendHello()` (line 19)
- Data: `{ client: "Mongoose Client", version: "0.1" }`
- Purpose: Initial client identification

**Core.KeepAlive**
- Method: `sendKeepAlive()` (line 23)
- Data: None
- Purpose: Connection keepalive

**Core.Ping**
- Method: `sendPing(avgPing?: number)` (line 27)
- Data: Optional average ping number
- Purpose: Client-initiated ping request

### 3.2 Core.Supports

**File:** `C:\Users\Q\code\react-client\src\gmcp\Core.ts`
**Package Name:** "Core.Supports"
**Version:** 1

#### Client → Server Messages

**Core.Supports.Set**
- Method: `sendSet()` (line 54)
- Data: Array of "PackageName Version" strings
- Example: `["Char.Vitals 1", "Room.Info 1"]`
- Implementation:
  ```typescript
  sendSet(): void {
    const packages = Object.values(this.client.gmcpHandlers)
      .filter(p => p.packageName && p.packageVersion && p.enabled)
      .map(p => `${p.packageName} ${p.packageVersion!.toString()}`);
    this.sendData("Set", packages);
  }
  ```
- Purpose: Send full list of supported packages to server

**Core.Supports.Add**
- Method: `sendAdd(packagesToAdd)` (line 62)
- Data: Array of `{ name: string; version: number }` objects
- Purpose: Dynamically add packages to support list

**Core.Supports.Remove**
- Method: `sendRemove(packagesToRemove)` (line 68)
- Data: Array of package name strings
- Purpose: Dynamically remove packages from support list

**Note:** Server does not send Core.Supports messages to client (line 72)

### 3.3 Auth.Autologin

**File:** `C:\Users\Q\code\react-client\src\gmcp\Auth.ts`
**Package Name:** "Auth.Autologin"
**Version:** 1

#### Server → Client Messages

**Auth.Autologin.Token**
- Handler: `handleToken(data: string)` (line 7)
- Data: String token
- Action: Stores in localStorage as "LoginRefreshToken"
- Purpose: Server provides refresh token for future auto-login

#### Client → Server Messages

**Auth.Autologin.Login**
- Method: `sendLogin()` (line 11)
- Data: String token from localStorage
- Purpose: Send stored token for auto-login
- Called automatically after GMCP negotiation

### 3.4 Char

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char.ts`
**Package Name:** "Char"
**Version:** 1

#### Data Structures

```typescript
class GmcpMessageCharName extends GMCPMessage {
  public name!: string;
  public fullname: string = "";
}
```

#### Server → Client Messages

**Char.Name**
- Handler: `handleName(data: GmcpMessageCharName)` (line 11)
- Data: `{ name: string, fullname: string }`
- Actions:
  - Updates `worldData.playerId = data.name`
  - Updates `worldData.playerName = data.fullname`
  - Emits "statustext" event with login message
- Purpose: Character name and ID information

**Char.Vitals**
- Handler: `handleVitals(data: any)` (line 17)
- Data: Any structure (game-specific)
- Action: Emits "vitals" event
- Purpose: Character vitals (HP, MP, etc.)

**Char.StatusVars**
- Handler: `handleStatusVars(data: { [key: string]: string })` (line 24)
- Data: Dictionary of variable name to description
- Action: Emits "statusVars" event
- Purpose: Defines available status variables

**Char.Status**
- Handler: `handleStatus(data: { [key: string]: string })` (line 31)
- Data: Dictionary of variable name to value
- Action: Emits "statusUpdate" event
- Purpose: Character status updates

#### Client → Server Messages

**Char.Login**
- Method: `sendLogin(name: string, password: string)` (line 38)
- Data: `{ name: string, password: string }`
- Purpose: Manual character login (alternative to autologin)

### 3.5 Char.Afflictions

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Afflictions.ts`
**Package Name:** "Char.Afflictions"
**Version:** 1

#### Data Structures

```typescript
interface Affliction {
  name: string;
  cure: string;
  desc: string;
}
```

#### Server → Client Messages

**Char.Afflictions.List**
- Handler: `handleList(data: Affliction[])`
- Data: Array of Affliction objects
- Action: Emits "afflictionsList" event
- Purpose: Full affliction list

**Char.Afflictions.Add**
- Handler: `handleAdd(data: Affliction)`
- Data: Single Affliction object
- Action: Emits "afflictionAdd" event
- Purpose: Add single affliction

**Char.Afflictions.Remove**
- Handler: `handleRemove(data: string[])`
- Data: Array of affliction names
- Action: Emits "afflictionRemove" event
- Purpose: Remove afflictions by name

### 3.6 Char.Defences

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Defences.ts`
**Package Name:** "Char.Defences"
**Version:** 1

#### Data Structures

```typescript
interface Defence {
  name: string;
  desc: string;
}
```

#### Server → Client Messages

**Char.Defences.List**
- Handler: `handleList(data: Defence[])`
- Data: Array of Defence objects
- Action: Emits "defencesList" event
- Purpose: Full defence list

**Char.Defences.Add**
- Handler: `handleAdd(data: Defence)`
- Data: Single Defence object
- Action: Emits "defenceAdd" event
- Purpose: Add single defence

**Char.Defences.Remove**
- Handler: `handleRemove(data: string[])`
- Data: Array of defence names
- Action: Emits "defenceRemove" event
- Purpose: Remove defences by name

### 3.7 Char.Items

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Items.ts`
**Package Name:** "Char.Items"
**Version:** 1

#### Data Structures

```typescript
export interface Item {
  id: string;
  name: string;
  icon?: string;
  Attrib?: string; // wWlgctmdx
  location?: ItemLocation;
}

export type ItemLocation = "inv" | "room" | string; // "repNUMBER" for containers

export class GMCPMessageCharItemsList extends GMCPMessage {
  location: ItemLocation = "room";
  items: Item[] = [];
}

export class GMCPMessageCharItemsAdd extends GMCPMessage {
  location: ItemLocation = "room";
  item: Item = { id: "", name: "" };
}

export class GMCPMessageCharItemsRemove extends GMCPMessage {
  location: ItemLocation = "room";
  item: Item = { id: "", name: "" };
}

export class GMCPMessageCharItemsUpdate extends GMCPMessage {
  location: ItemLocation = "inv"; // Only for inventory items
  item: Item = { id: "", name: "" };
}
```

#### Server → Client Messages

**Char.Items.List**
- Handler: `handleList(data: GMCPMessageCharItemsList)` (line 42)
- Data: `{ location: ItemLocation, items: Item[] }`
- Action: Adds location to each item, emits "itemsList" event
- Purpose: Full item list for location (inv, room, or container)

**Char.Items.Add**
- Handler: `handleAdd(data: GMCPMessageCharItemsAdd)` (line 48)
- Data: `{ location: ItemLocation, item: Item }`
- Action: Adds location to item, emits "itemAdd" event
- Purpose: Item added to location

**Char.Items.Remove**
- Handler: `handleRemove(data: GMCPMessageCharItemsRemove)` (line 54)
- Data: `{ location: ItemLocation, item: Item }`
- Action: Adds location to item, emits "itemRemove" event
- Purpose: Item removed from location

**Char.Items.Update**
- Handler: `handleUpdate(data: GMCPMessageCharItemsUpdate)` (line 60)
- Data: `{ location: "inv", item: Item }`
- Action: Adds location to item, emits "itemUpdate" event
- Purpose: Update inventory item (inventory only)

#### Client → Server Messages

**Char.Items.Contents**
- Method: `sendContentsRequest(itemId: string)` (line 68)
- Data: String item ID
- Purpose: Request container contents

**Char.Items.Inv**
- Method: `sendInventoryRequest()` (line 73)
- Data: Empty string
- Purpose: Request inventory list

**Char.Items.Room**
- Method: `sendRoomRequest()` (line 77)
- Data: Empty string
- Purpose: Request room items list

### 3.8 Char.Offer

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Offer.ts`
**Package Name:** "Char.Offer"
**Version:** 1

#### Data Structures

```typescript
interface OfferItem {
  name: string;
  weight: number;
  rent: number;
}

interface OfferData {
  items: OfferItem[];
  total_count: number;
  total_weight: number;
  total_rent: number;
}
```

#### Server → Client Messages

**Char.Offer.Offer**
- Handler: `handleOffer(data: OfferData)`
- Data: `{ items: OfferItem[], total_count, total_weight, total_rent }`
- Action: Emits "offer" event
- Purpose: Merchant/shop offer

#### Client → Server Messages

**Char.Offer.Offer**
- Method: `sendOfferRequest()`
- Data: Empty object
- Purpose: Request offer data

### 3.9 Char.Prompt

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Prompt.ts`
**Package Name:** "Char.Prompt"
**Version:** 1

#### Server → Client Messages

**Char.Prompt.Prompt**
- Handler: `handlePrompt(data: any)`
- Data: `{ [key: string]: any }` - Game-specific prompt values
- Action: Emits "prompt" event
- Purpose: Prompt data broadcast

#### Client → Server Messages

**Char.Prompt.Prompt**
- Method: `sendPromptRequest()`
- Data: Empty object
- Purpose: Request prompt data

### 3.10 Char.Skills

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Skills.ts`
**Package Name:** "Char.Skills"
**Version:** 1

#### Data Structures

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

#### Server → Client Messages

**Char.Skills.Groups**
- Handler: `handleGroups(data: SkillGroupInfo[])`
- Data: Array of skill group info
- Action: Emits "skillGroups" event
- Purpose: List of skill groups

**Char.Skills.List**
- Handler: `handleList(data: SkillsList)`
- Data: `{ group, list[], descs?[] }`
- Action: Emits "skillList" event
- Purpose: Skills in a group

**Char.Skills.Info**
- Handler: `handleInfo(data: SkillInfo)`
- Data: `{ group, skill, info }`
- Action: Emits "skillInfo" event
- Purpose: Detailed skill information

#### Client → Server Messages

**Char.Skills.Get**
- Method: `sendGetRequest(group?, name?)`
- Data: `{ group?: string, name?: string }`
- Purpose: Request skill information

### 3.11 Char.Status

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Status.ts`
**Package Name:** "Char.Status"
**Version:** 1

#### Server → Client Messages

**Char.Status.Status**
- Handler: `handleStatus(data: any)`
- Data: `{ [key: string]: any }` - Game-specific status data
- Action: Emits "status" event
- Purpose: Status information

#### Client → Server Messages

**Char.Status.Status**
- Method: `sendStatusRequest()`
- Data: Empty object
- Purpose: Request status data

### 3.12 Char.Status.AffectedBy

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Status\AffectedBy.ts`
**Package Name:** "Char.Status.AffectedBy"
**Version:** 1

#### Server → Client Messages

**Char.Status.AffectedBy.AffectedBy**
- Handler: `handleAffectedBy(data: any)`
- Data: `{ [key: string]: any }` - Game-specific affects data
- Action: Emits "statusAffectedBy" event
- Purpose: Status affects information

#### Client → Server Messages

**Char.Status.AffectedBy.AffectedBy**
- Method: `sendAffectedByRequest()`
- Data: Empty object
- Purpose: Request affected by data

### 3.13 Char.Status.Conditions

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Status\Conditions.ts`
**Package Name:** "Char.Status.Conditions"
**Version:** 1

#### Server → Client Messages

**Char.Status.Conditions.Conditions**
- Handler: `handleConditions(data: any)`
- Data: `{ [key: string]: any }` - Game-specific conditions data
- Action: Emits "statusConditions" event
- Purpose: Status conditions

#### Client → Server Messages

**Char.Status.Conditions.Conditions**
- Method: `sendConditionsRequest()`
- Data: Empty object
- Purpose: Request conditions data

### 3.14 Char.Status.Timers

**File:** `C:\Users\Q\code\react-client\src\gmcp\Char\Status\Timers.ts`
**Package Name:** "Char.Status.Timers"
**Version:** 1

#### Server → Client Messages

**Char.Status.Timers.Timers**
- Handler: `handleTimers(data: any)`
- Data: `{ [key: string]: any }` - Game-specific timers data
- Action: Emits "statusTimers" event
- Purpose: Status timers

#### Client → Server Messages

**Char.Status.Timers.Timers**
- Method: `sendTimersRequest()`
- Data: Empty object
- Purpose: Request timers data

### 3.15 Room

**File:** `C:\Users\Q\code\react-client\src\gmcp\Room.ts`
**Package Name:** "Room"
**Version:** 1

#### Data Structures

```typescript
export class GMCPMessageRoomInfo extends GMCPMessage {
  num: number = 0;
  name: string = "";
  area: string = "";
  environment?: string;
  coords?: string; // "area,X,Y,Z,building"
  map?: string; // "url X Y"
  details?: string[]; // ["shop", "bank"]
  exits?: { [key: string]: number }; // {"n": 12344, "se": 12336}
}

export interface RoomPlayer {
  name: string;
  fullname: string;
}
```

#### Server → Client Messages

**Room.Info**
- Handler: `handleInfo(data: GMCPMessageRoomInfo)` (line 27)
- Data: RoomInfo object
- Actions:
  - Clears `worldData.roomPlayers`
  - Updates `worldData.roomId`
  - Stores in `client.currentRoomInfo`
  - Emits "roomInfo" event
- Purpose: Room information and navigation

**Room.WrongDir**
- Handler: `handleWrongDir(direction: string)` (line 38)
- Data: String direction
- Action: Emits "roomWrongDir" event
- Purpose: Invalid movement direction

**Room.Players**
- Handler: `handlePlayers(players: RoomPlayer[])` (line 44)
- Data: Array of RoomPlayer objects
- Actions:
  - Replaces `worldData.roomPlayers`
  - Sorts by fullname
  - Emits "roomPlayers" event
- Purpose: Full player list in room

**Room.AddPlayer**
- Handler: `handleAddPlayer(player: RoomPlayer)` (line 53)
- Data: RoomPlayer object
- Actions:
  - Adds to `worldData.roomPlayers` if not present
  - Re-sorts by fullname
  - Emits "roomAddPlayer" event
- Purpose: Player entered room

**Room.RemovePlayer**
- Handler: `handleRemovePlayer(playerName: string)` (line 68)
- Data: Player name/ID string
- Actions:
  - Removes from `worldData.roomPlayers`
  - Emits "roomRemovePlayer" event
- Purpose: Player left room

### 3.16 Group

**File:** `C:\Users\Q\code\react-client\src\gmcp\Group.ts`
**Package Name:** "Group"
**Version:** 1

#### Server → Client Messages

**Group.Info**
- Handler: `handleInfo(data: any)`
- Data: `{ [key: string]: any }` - Game-specific group data
- Action: Emits "groupInfo" event
- Purpose: Group information

#### Client → Server Messages

**Group.Info**
- Method: `sendInfoRequest()`
- Data: Empty object
- Purpose: Request group info

### 3.17 Comm.Channel

**File:** `C:\Users\Q\code\react-client\src\gmcp\Comm\Channel.ts`
**Package Name:** "Comm.Channel"
**Version:** 1

#### Data Structures

```typescript
export class GMCPMessageCommChannelText extends GMCPMessage {
  public readonly channel!: string;
  public readonly talker!: string;
  public readonly text!: string;
}

interface ChannelPlayer {
  name: string;
  channels?: string[];
}
```

#### Server → Client Messages

**Comm.Channel.List**
- Handler: `handleList(data: string[])` (line 12)
- Data: Array of channel names
- Action: Stores in `channels` array
- Purpose: Available channels

**Comm.Channel.Text**
- Handler: `handleText(data: GMCPMessageCommChannelText)` (line 21)
- Data: `{ channel, talker, text }`
- Actions:
  - Emits "channelText" event
  - Sends desktop notification for "say_to_you" if window unfocused
- Purpose: Channel message
- Special: Desktop notifications for tells

**Comm.Channel.Players**
- Handler: `handlePlayers(data: ChannelPlayer[])` (line 32)
- Data: Array of `{ name, channels?[] }`
- Action: Emits "channelPlayers" event
- Purpose: Players on channels

**Comm.Channel.Start**
- Handler: `handleStart(channelName: string)` (line 48)
- Data: String channel name
- Action: Emits "channelStart" event
- Purpose: Channel text block start

**Comm.Channel.End**
- Handler: `handleEnd(channelName: string)` (line 54)
- Data: String channel name
- Action: Emits "channelEnd" event
- Purpose: Channel text block end

#### Client → Server Messages

**Comm.Channel.List**
- Method: `sendList()` (line 17)
- Data: None
- Purpose: Request channel list

**Comm.Channel.Players**
- Method: `sendPlayersRequest()` (line 38)
- Data: Empty string
- Purpose: Request players on channels

**Comm.Channel.Enable**
- Method: `sendEnable(channelName: string)` (line 43)
- Data: Channel name string
- Purpose: Enable a channel

### 3.18 Comm.LiveKit

**File:** `C:\Users\Q\code\react-client\src\gmcp\Comm\LiveKit.ts`
**Package Name:** "Comm.LiveKit"
**Version:** 1

#### Server → Client Messages

**Comm.LiveKit.room_token**
- Handler: `handleroom_token(data: { token: string })`
- Data: `{ token: string }`
- Actions:
  - Adds to `worldData.liveKitTokens` array
  - Emits "livekitToken" event
- Purpose: LiveKit room access token
- **Note:** Handler name uses lowercase with underscore (not camelCase)

**Comm.LiveKit.room_leave**
- Handler: `handleroom_leave(data: { token: string })`
- Data: `{ token: string }`
- Actions:
  - Removes from `worldData.liveKitTokens` array
  - Emits "livekitLeave" event
- Purpose: Leave LiveKit room
- **Note:** Handler name uses lowercase with underscore (not camelCase)

### 3.19 Client.File

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\File.ts`
**Package Name:** "Client.File"
**Version:** 1
**Status:** REGISTERED (line 100 of App.tsx)

#### Server → Client Messages

**Client.File.Download**
- Handler: `handleDownload(data: { url: string })`
- Data: `{ url: string }`
- Action: Opens URL in new browser tab
- Purpose: Request file download

### 3.20 Client.FileTransfer

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\FileTransfer.ts`
**Package Name:** "Client.FileTransfer"
**Version:** 1

#### Data Structures

```typescript
export class FileTransferOffer extends GMCPMessage {
  sender: string = "";
  filename: string = "";
  filesize: number = 0;
  offerSdp: string = "";
  hash: string = "";
}

export class FileTransferAccept extends GMCPMessage {
  sender: string = "";
  hash: string = "";
  filename: string = "";
  answerSdp: string = "";
}

export class FileTransferReject extends GMCPMessage {
  sender: string = "";
  hash: string = "";
}

export class FileTransferCancel extends GMCPMessage {
  sender: string = "";
  hash: string = "";
}

export interface FileTransferSignaler {
  handleAccept(data: FileTransferAccept): void;
  handleCancel(data: FileTransferCancel): void;
  handleCandidate(data: { sender: string; candidate: string }): void;
  handleOffer(data: FileTransferOffer): void;
  handleReject(data: FileTransferReject): void;
  sendAccept(...): void;
  sendCancel(...): void;
  sendCandidate(...): void;
  sendOffer(...): void;
  sendReject(...): void;
  sendRequestResend(...): void;
}
```

#### Server → Client Messages

**Client.FileTransfer.Offer**
- Handler: `handleOffer(data: FileTransferOffer)`
- Data: `{ sender, filename, filesize, offerSdp, hash }`
- Actions:
  - Stores in `pendingOffers`
  - Calls `client.onFileTransferOffer()`
- Purpose: File transfer offer via WebRTC

**Client.FileTransfer.Accept**
- Handler: `handleAccept(data: FileTransferAccept)`
- Data: `{ sender, hash, filename, answerSdp }`
- Action: Calls `client.onFileTransferAccept()`
- Purpose: File transfer accepted

**Client.FileTransfer.Reject**
- Handler: `handleReject(data: FileTransferReject)`
- Data: `{ sender, hash }`
- Action: Calls `client.onFileTransferReject()`
- Purpose: File transfer rejected

**Client.FileTransfer.Cancel**
- Handler: `handleCancel(data: FileTransferCancel)`
- Data: `{ sender, hash }`
- Action: Calls `client.onFileTransferCancel()`
- Purpose: File transfer cancelled

**Client.FileTransfer.Candidate**
- Handler: `handleCandidate(data: { sender, candidate })`
- Data: `{ sender: string, candidate: string }` (JSON string)
- Actions:
  - Parses JSON candidate
  - Forwards to `webRTCService.handleIceCandidate()`
- Purpose: WebRTC ICE candidate

#### Client → Server Messages

**Client.FileTransfer.Offer**
- Method: `sendOffer(recipient, filename, filesize, offerSdp, hash)`
- Data: `{ recipient, filename, filesize, offerSdp, hash }`
- Purpose: Send file transfer offer

**Client.FileTransfer.Accept**
- Method: `sendAccept(sender, hash, filename, answerSdp)`
- Data: `{ sender, hash, filename, answerSdp }`
- Purpose: Accept file transfer

**Client.FileTransfer.Reject**
- Method: `sendReject(sender, hash)`
- Data: `{ sender, hash }`
- Purpose: Reject file transfer

**Client.FileTransfer.Cancel**
- Method: `sendCancel(recipient, hash)`
- Data: `{ recipient, hash }`
- Purpose: Cancel file transfer

**Client.FileTransfer.RequestResend**
- Method: `sendRequestResend(sender, hash)`
- Data: `{ sender, hash }`
- Purpose: Request file resend

**Client.FileTransfer.Candidate**
- Method: `sendCandidate(recipient, candidate)`
- Data: `{ recipient, candidate: JSON.stringify(candidate) }`
- Purpose: Send WebRTC ICE candidate

**Note:** FileTransfer uses WebRTC for peer-to-peer file transfer. GMCP used only for signaling (SDP offers/answers, ICE candidates). Actual file data transmitted via WebRTC DataChannel.

### 3.21 Client.Html

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Html.ts`
**Package Name:** "Client.Html"
**Version:** 1

#### Server → Client Messages

**Client.Html.Add_html**
- Handler: `handleAdd_html(data: { data: string[] })`
- Data: `{ data: string[] }` - Array of HTML lines
- Actions:
  - Joins lines with newline
  - Emits "html" event
- Purpose: Add HTML content
- **Note:** Handler name uses underscore (not camelCase)

**Client.Html.Add_markdown**
- Handler: `handleAdd_markdown(data: { data: string[] })`
- Data: `{ data: string[] }` - Array of Markdown lines
- Actions:
  - Joins lines
  - Converts to HTML using marked library
  - Emits "html" event
- Purpose: Add Markdown content
- **Note:** Handler name uses underscore (not camelCase)
- **Dependency:** Uses 'marked' library for Markdown parsing

### 3.22 Client.Keystrokes

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Keystrokes.ts`
**Package Name:** "Client.Keystrokes"
**Version:** 1

#### Data Structures

```typescript
interface KeyBinding {
  key: string;
  modifiers: string[]; // ["alt", "control", "shift", "meta"]
  command: string;
  autosend: boolean;
}
```

#### Server → Client Messages

**Client.Keystrokes.Bind**
- Handler: `handleBind(data: KeyBinding)`
- Data: KeyBinding object
- Actions:
  - Adds to bindings array
  - Bindings intercept keyboard events globally
- Purpose: Bind a key combination

**Client.Keystrokes.Unbind**
- Handler: `handleUnbind(data: { key, modifiers })`
- Data: `{ key: string, modifiers: string[] }`
- Action: Removes matching binding
- Purpose: Unbind a key combination

**Client.Keystrokes.Bind_all**
- Handler: `handleBind_all(data: { bindings: KeyBinding[] })`
- Data: `{ bindings: KeyBinding[] }`
- Action: Replaces entire bindings array
- Purpose: Replace all bindings
- **Note:** Handler name uses underscore

**Client.Keystrokes.UnbindAll**
- Handler: `handleUnbindAll(data: any)`
- Data: None
- Action: Clears bindings array
- Purpose: Clear all bindings

**Client.Keystrokes.ListBindings**
- Handler: `handleListBindings(data: any)`
- Data: None
- Action: Automatically sends BindingsList response
- Purpose: Server requests current bindings

#### Client → Server Messages

**Client.Keystrokes.BindingsList**
- Method: Called automatically by handleListBindings
- Data: Array of KeyBinding objects
- Purpose: Send current bindings to server

#### Special Features
- Command substitution: `%1`, `%2`, etc. for command input words, `%*` for full input
- Autosend: Commands can be sent immediately or placed in input field
- Case-insensitive key matching
- Event listener registered on construction, removed on shutdown

### 3.23 Client.Media

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Media.ts`
**Package Name:** "Client.Media"
**Version:** 1

#### Data Structures

```typescript
export type MediaType = "sound" | "music" | "video";

export class GMCPMessageClientMediaPlay extends GMCPMessage {
  public readonly name!: string;
  public readonly url?: string;
  public readonly type?: MediaType = "sound";
  public readonly tag?: string;
  public readonly volume: number = 50;
  public readonly fadein?: number = 0;
  public readonly fadeout?: number = 0;
  public readonly start: number = 0;
  public readonly loops?: number = 0; // -1 for infinite
  public readonly priority?: number = 0;
  public continue?: boolean = true;
  public key?: string;
  // Mongoose extensions:
  public readonly end?: number = 0;
  public is3d: boolean = false;
  public pan: number = 0; // -1 to 1
  public position: number[] = [0, 0, 0]; // x, y, z
}

export class GMCPMessageClientMediaStop extends GMCPMessage {
  public readonly name?: string;
  public readonly type?: MediaType;
  public readonly tag?: string;
  public readonly priority?: number = 0;
  public readonly key?: string;
}

export interface ExtendedSound extends Sound {
  priority?: number;
  tag?: string;
  key?: string;
  mediaType?: MediaType;
}
```

#### Server → Client Messages

**Client.Media.Default**
- Handler: `handleDefault(url: string)`
- Data: String URL
- Action: Stores default URL for relative paths
- Purpose: Set default media URL

**Client.Media.Load**
- Handler: `handleLoad(data: { url?, name })`
- Data: `{ url?: string, name: string }`
- Actions:
  - Creates and caches Sound object
  - Resolves URL using default if needed
- Purpose: Preload media file

**Client.Media.Play**
- Handler: `handlePlay(data: GMCPMessageClientMediaPlay)`
- Data: MediaPlay object (see structure above)
- Features:
  - Sound/music/video support
  - Volume control (0-100)
  - Looping (including infinite with -1)
  - Start position
  - Fade in/out
  - 3D spatial audio (HRTF panning)
  - Priority-based stopping
  - Key-based replacement
- Special: Music uses CORS proxy
- Purpose: Play media

**Client.Media.Stop**
- Handler: `handleStop(data: GMCPMessageClientMediaStop)`
- Data: MediaStop object (see structure above)
- Filters: Can filter by name, type, tag, key
- Action: Empty data stops all sounds
- Purpose: Stop media

**Client.Media.ListenerPosition**
- Handler: `handleListenerPosition(data: { position })`
- Data: `{ position: [x, y, z] }`
- Purpose: Set 3D audio listener position

**Client.Media.ListenerOrientation**
- Handler: `handleListenerOrientation(data: { up?, forward? })`
- Data: `{ up?: [x, y, z], forward?: [x, y, z] }`
- Purpose: Set 3D audio listener orientation

**Implementation:** Uses Cacophony audio library for playback

### 3.24 Client.Midi

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Midi.ts`
**Package Name:** "Client.Midi"
**Version:** 1

#### Data Structures

```typescript
export class GMCPMessageClientMidiNote extends GMCPMessage {
  public readonly note!: number; // 0-127
  public readonly velocity!: number; // 0-127
  public readonly on!: boolean;
  public readonly channel?: number; // 0-15
  public readonly duration?: number; // milliseconds
}

export class GMCPMessageClientMidiControlChange extends GMCPMessage {
  public readonly controller!: number;
  public readonly value!: number;
  public readonly channel!: number;
}

export class GMCPMessageClientMidiProgramChange extends GMCPMessage {
  public readonly program!: number;
  public readonly channel!: number;
}

export class GMCPMessageClientMidiSystemMessage extends GMCPMessage {
  public readonly type!: string;
  public readonly data!: number[];
}

export class GMCPMessageClientMidiRawMessage extends GMCPMessage {
  public readonly hex!: string;
  public readonly data!: number[];
  public readonly type!: string;
}

export class GMCPMessageClientMidiEnable extends GMCPMessage {
  public readonly enabled!: boolean;
}
```

#### Special Features

**Dynamic Registration:**
- Not included in initial Core.Supports.Set
- Added via Core.Supports.Add when user enables MIDI
- Removed via Core.Supports.Remove when user disables MIDI
- Enabled state controlled by `preferencesStore.getState().midi.enabled`

**Lazy Initialization:**
- `ensureInitialized()` method for on-demand setup
- Auto-reconnect to last used input device
- Active note tracking with timeout management

#### Server → Client Messages

**Client.Midi.Note**
- Handler: `handleNote(data: GMCPMessageClientMidiNote)`
- Data: `{ note, velocity, on, channel?, duration? }`
- Features:
  - Automatic note-off scheduling with duration
  - Tracks active notes to prevent conflicts
- Purpose: Play MIDI note

**Client.Midi.ControlChange**
- Handler: `handleControlChange(data)`
- Data: `{ controller, value, channel }`
- Action: Sends to connected MIDI output device
- Purpose: MIDI control change

**Client.Midi.ProgramChange**
- Handler: `handleProgramChange(data)`
- Data: `{ program, channel }`
- Action: Sends to connected MIDI output device
- Purpose: MIDI program change

**Client.Midi.SystemMessage**
- Handler: `handleSystemMessage(data)`
- Data: `{ type, data[] }`
- Action: Sends raw MIDI data to output device
- Purpose: MIDI system message

**Client.Midi.RawMessage**
- Handler: `handleRawMessage(data)`
- Data: `{ hex, data[], type }`
- Action: Sends raw MIDI data to output device
- Purpose: Raw MIDI message

**Client.Midi.Enable**
- Handler: `handleEnable(data)`
- Data: None
- Purpose: Server asks about MIDI support

#### Client → Server Messages

**Client.Midi.Note**
- Sent automatically when MIDI input received
- Data: `{ note, velocity, on, channel }`
- Purpose: Send MIDI note from input device

**Client.Midi.ControlChange**
- Sent automatically when MIDI CC received
- Data: `{ controller, value, channel }`
- Purpose: Send MIDI CC from input device

**Client.Midi.ProgramChange**
- Sent automatically when MIDI PC received
- Data: `{ program, channel }`
- Purpose: Send MIDI program change from input

**Client.Midi.SystemMessage**
- Sent automatically when system message received
- Data: `{ type, data[] }`
- Purpose: Send MIDI system message from input

**Client.Midi.RawMessage**
- Sent automatically for uncategorized messages
- Data: `{ hex, data[], type }`
- Purpose: Send raw MIDI from input

**Client.Midi.Enable**
- Method: `sendMidiCapability()`
- Data: `{ enabled: boolean }`
- Purpose: Advertise MIDI capability

### 3.25 Client.Speech

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Speech.ts`
**Package Name:** "Client.Speech"
**Version:** 1

#### Data Structures

```typescript
interface SpeechSpeak {
  text: string;
  rate: number; // Default 1
  pitch: number; // Default 1
  volume: number; // 0-1, default 0.5
}
```

#### Server → Client Messages

**Client.Speech.Speak**
- Handler: `handleSpeak(data: SpeechSpeak)`
- Data: `{ text, rate, pitch, volume }`
- Action: Uses browser SpeechSynthesis API
- Purpose: Text-to-speech request

**Implementation:** Uses browser SpeechSynthesis API (separate from Cacophony audio)

### 3.26 Logging

**File:** `C:\Users\Q\code\react-client\src\gmcp\Logging.ts`
**Package Name:** "Logging"
**Version:** 1

#### Server → Client Messages

**Logging.Error**
- Handler: `handleError(data: any)`
- Data: `{ [key: string]: any }` - Error information
- Actions:
  - Logs to console.error
  - Emits "gmcpError" event
- Purpose: Server error message

### 3.27 Redirect

**File:** `C:\Users\Q\code\react-client\src\gmcp\Redirect.ts`
**Package Name:** "Redirect"
**Version:** 1

#### Server → Client Messages

**Redirect.Window**
- Handler: `handleWindow(windowName: string)`
- Data: Window name string (defaults to "main" if empty)
- Action: Emits "redirectWindow" event
- Purpose: Redirect output to window

## 4. IRE Packages (Unregistered)

### 4.1 IRE.CombatMessage

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\CombatMessage.ts`
**Package Name:** "IRE.CombatMessage"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

```typescript
interface CombatMessageData {
  target: string;
  message: string;
  caster: string;
}
```

#### Server → Client Messages

**IRE.CombatMessage.<skill_name>**
- Handler: `handleSkillAttack(skillName, data)`
- Data: `{ target, message, caster }`
- Action: Emits "combatMessage" event with skill name
- Purpose: Dynamic combat messages
- **Note:** Skill name is part of message name (e.g., "IRE.CombatMessage.skirmishing_kick")
- **Warning:** May require custom routing logic for dynamic skill names

### 4.2 IRE.Composer

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Composer.ts`
**Package Name:** "IRE.Composer"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

```typescript
interface ComposerEdit {
  title: string;
  text: string;
}
```

#### Server → Client Messages

**IRE.Composer.Edit**
- Handler: `handleEdit(data: ComposerEdit)`
- Data: `{ title, text }`
- Action: Emits "composerEdit" event
- Purpose: Open editor interface

#### Client → Server Messages

**IRE.Composer.SetBuffer**
- Method: `sendSetBuffer(text: string)`
- Data: Text string (not object)
- Purpose: Send edited text
- **Note:** Use regular commands for ***save, ***quit

### 4.3 IRE.Display

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Display.ts`
**Package Name:** "IRE.Display"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Server → Client Messages

**IRE.Display.FixedFont**
- Handler: `handleFixedFont(state: "start" | "stop")`
- Data: "start" or "stop"
- Action: Emits "displayFixedFont" event
- Purpose: Toggle fixed-width font

**IRE.Display.Ohmap**
- Handler: `handleOhmap(state: "start" | "stop")`
- Data: "start" or "stop"
- Action: Emits "displayOhmap" event
- Purpose: Toggle overhead map mode

### 4.4 IRE.Misc

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Misc.ts`
**Package Name:** "IRE.Misc"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

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

#### Server → Client Messages

**IRE.Misc.RemindVote**
- Handler: `handleRemindVote(url: string)`
- Data: String URL
- Action: Emits "miscRemindVote" event
- Purpose: Voting reminder

**IRE.Misc.Achievement**
- Handler: `handleAchievement(achievements: Achievement[])`
- Data: Array of `{ name, value }`
- Action: Emits "miscAchievement" event
- Purpose: Achievement notification

**IRE.Misc.URL**
- Handler: `handleURL(urls: UrlInfo[])`
- Data: Array of `{ url, window }`
- Action: Emits "miscURL" event
- Purpose: Clickable URLs

**IRE.Misc.Tip**
- Handler: `handleTip(tip: string)`
- Data: String tip text
- Action: Emits "miscTip" event
- Purpose: Game tip

#### Client → Server Messages

**IRE.Misc.Voted**
- Method: `sendVoted()`
- Data: Empty string
- Purpose: Confirm vote completed

### 4.5 IRE.Rift

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Rift.ts`
**Package Name:** "IRE.Rift"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

```typescript
interface RiftItem {
  name: string;
  amount: number;
  desc: string;
}
```

#### Server → Client Messages

**IRE.Rift.List**
- Handler: `handleList(items: RiftItem[])`
- Data: Array of RiftItem objects
- Action: Emits "riftList" event
- Purpose: Full rift item list

**IRE.Rift.Change**
- Handler: `handleChange(item: RiftItem)`
- Data: RiftItem object
- Action: Emits "riftChange" event
- Purpose: Rift item changed

#### Client → Server Messages

**IRE.Rift.Request**
- Method: `sendRequest()`
- Data: None
- Purpose: Request rift list

### 4.6 IRE.Sound

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Sound.ts`
**Package Name:** "IRE.Sound"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

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

#### Server → Client Messages

**IRE.Sound.Play**
- Handler: `handlePlay(data: IREPlayPayload)`
- Data: `{ name, fadein_csec?, fadeout_csec?, loop?, volume? }`
- Actions:
  - Translates to Client.Media.Play format
  - Conversion: centiseconds → milliseconds (× 10)
  - Conversion: boolean loop → -1/0
  - Emits "ireSoundPlay" event
- Purpose: Play IRE sound
- **Dependency:** Requires Client.Media to be registered first

**IRE.Sound.Stop**
- Handler: `handleStop(data: IREStopPayload)`
- Data: `{ name, fadeout_csec? }`
- Actions:
  - Delegates to Client.Media.Stop
  - Emits "ireSoundStop" event
- Purpose: Stop IRE sound

**IRE.Sound.Stopall**
- Handler: `handleStopall(data: IREStopAllPayload)`
- Data: `{ fadeout_csec? }`
- Actions:
  - Delegates to Client.Media.Stop with no filters
  - Emits "ireSoundStopall" event
- Purpose: Stop all sounds

**IRE.Sound.Preload**
- Handler: `handlePreload(data: IREPreloadPayload)`
- Data: `{ name }`
- Actions:
  - Delegates to Client.Media.Load
  - Emits "ireSoundPreload" event
- Purpose: Preload IRE sound

**Implementation:** Delegates to Client.Media package after parameter translation

### 4.7 IRE.Target

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Target.ts`
**Package Name:** "IRE.Target"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

```typescript
interface TargetInfo {
  id: string;
  short_desc: string;
  hpperc: string; // Percentage as string
}
```

#### Server → Client Messages

**IRE.Target.Set**
- Handler: `handleSet(targetId: string)`
- Data: String target ID
- Action: Emits "targetSet" event
- Purpose: Server sets target (e.g., via tab cycling)

**IRE.Target.Info**
- Handler: `handleInfo(data: TargetInfo)`
- Data: `{ id, short_desc, hpperc }`
- Action: Emits "targetInfo" event
- Purpose: Detailed target information

#### Client → Server Messages

**IRE.Target.Set**
- Method: `sendSet(targetId: string)`
- Data: Target ID string
- Purpose: Client sets target manually

**IRE.Target.RequestInfo**
- Method: `sendRequestInfo()`
- Data: None
- Purpose: Request target info
- **Warning:** This may not be a real IRE message (hypothetical)

### 4.8 IRE.Tasks

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Tasks.ts`
**Package Name:** "IRE.Tasks"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

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

#### Server → Client Messages

**IRE.Tasks.List**
- Handler: `handleList(tasks: TaskItem[])`
- Data: Array of TaskItem objects
- Action: Emits "tasksList" event
- Purpose: Full task/quest list

**IRE.Tasks.Update**
- Handler: `handleUpdate(task: TaskItem)`
- Data: TaskItem object
- Action: Emits "taskUpdate" event
- Purpose: Task updated

**IRE.Tasks.Completed**
- Handler: `handleCompleted(task: TaskItem)`
- Data: TaskItem object
- Action: Emits "taskCompleted" event
- Purpose: Task completed

#### Client → Server Messages

**IRE.Tasks.Request**
- Method: `sendRequest()`
- Data: None
- Purpose: Request task list

### 4.9 IRE.Time

**File:** `C:\Users\Q\code\react-client\src\gmcp\IRE\Time.ts`
**Package Name:** "IRE.Time"
**Status:** IMPLEMENTED BUT NOT REGISTERED

#### Data Structures

```typescript
interface TimeInfo {
  day: string;
  mon: string; // Month number
  month: string; // Month name
  year: string;
  hour: string;
  daynight: string; // Percentage or indicator
}
```

#### Server → Client Messages

**IRE.Time.List**
- Handler: `handleList(timeInfo: TimeInfo)`
- Data: TimeInfo object
- Action: Emits "timeList" event
- Purpose: Full time information

**IRE.Time.Update**
- Handler: `handleUpdate(timeUpdate: Partial<TimeInfo>)`
- Data: Partial TimeInfo object
- Action: Emits "timeUpdate" event
- Purpose: Time changed

#### Client → Server Messages

**IRE.Time.Request**
- Method: `sendRequest()`
- Data: None
- Purpose: Request time info

## 5. Event System and UI Integration

### 5.1 Event-Based Architecture

All GMCP data flows to the UI via EventEmitter events. The MudClient class extends EventEmitter and emits events for each GMCP message.

**Pattern:**
```typescript
// In GMCP handler:
this.client.emit("eventName", data);

// In UI component:
useClientEvent<"eventName">(client, "eventName", defaultValue);
```

### 5.2 All Emitted Events (57 total)

**Character Events (14):**
1. "statustext" - Login status message
2. "vitals" - HP/MP/etc vitals data
3. "statusVars" - Status variable definitions
4. "statusUpdate" - Status changes
5. "prompt" - Prompt data
6. "status" - Status information
7. "statusAffectedBy" - Status affects
8. "statusConditions" - Status conditions
9. "statusTimers" - Status timers
10. "afflictionsList" - Full affliction list
11. "afflictionAdd" - Affliction added
12. "afflictionRemove" - Afflictions removed
13. "defencesList" - Full defence list
14. "defenceAdd" - Defence added
15. "defenceRemove" - Defences removed

**Item Events (4):**
16. "itemsList" - Full item list for location
17. "itemAdd" - Item added
18. "itemRemove" - Item removed
19. "itemUpdate" - Item updated

**Skill Events (3):**
20. "skillGroups" - Skill groups
21. "skillList" - Skills in group
22. "skillInfo" - Skill details

**Offer Events (1):**
23. "offer" - Merchant offer

**Room Events (5):**
24. "roomInfo" - Room data
25. "roomWrongDir" - Invalid movement
26. "roomPlayers" - Player list
27. "roomAddPlayer" - Player entered
28. "roomRemovePlayer" - Player left

**Communication Events (5):**
29. "channelText" - Channel messages
30. "channelPlayers" - Channel players
31. "channelStart" - Channel text block start
32. "channelEnd" - Channel text block end
33. "livekitToken" - LiveKit token received
34. "livekitLeave" - LiveKit leave

**Client Events (5):**
35. "html" - HTML/Markdown content
36. "corePing" - Ping response
37. "coreGoodbye" - Server goodbye
38. "gmcpError" - Server error
39. "redirectWindow" - Output redirection

**Group Events (1):**
40. "groupInfo" - Group information

**IRE Events (17 - if registered):**
41. "combatMessage" - Combat skill message
42. "composerEdit" - Editor interface
43. "displayFixedFont" - Fixed font mode
44. "displayOhmap" - Overhead map mode
45. "miscRemindVote" - Vote reminder
46. "miscAchievement" - Achievement
47. "miscURL" - Clickable URLs
48. "miscTip" - Game tip
49. "riftList" - Rift storage list
50. "riftChange" - Rift item changed
51. "targetSet" - Target set
52. "targetInfo" - Target details
53. "tasksList" - Task list
54. "taskUpdate" - Task updated
55. "taskCompleted" - Task completed
56. "timeList" - Game time
57. "timeUpdate" - Time changed
58. "ireSoundPlay" - IRE sound play
59. "ireSoundStop" - IRE sound stop
60. "ireSoundStopall" - IRE sound stop all
61. "ireSoundPreload" - IRE sound preload

## 6. State Integration

### 6.1 WorldData Interface

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 37-43)

```typescript
export interface WorldData {
  liveKitTokens: string[];
  playerId: string;
  playerName: string;
  roomId: string;
  roomPlayers: RoomPlayer[];
}
```

### 6.2 Direct State Updates

Some GMCP packages directly modify `client.worldData`:

**Char.Name** → `worldData.playerId`, `worldData.playerName`
- File: `C:\Users\Q\code\react-client\src\gmcp\Char.ts` lines 12-13

**Room.Info** → `worldData.roomId`
- File: `C:\Users\Q\code\react-client\src\gmcp\Room.ts` line 31

**Room.Players/AddPlayer/RemovePlayer** → `worldData.roomPlayers`
- File: `C:\Users\Q\code\react-client\src\gmcp\Room.ts` lines 47, 59, 73

**Comm.LiveKit** → `worldData.liveKitTokens`
- File: `C:\Users\Q\code\react-client\src\gmcp\Comm\LiveKit.ts` lines 11, 16

### 6.3 Additional Client State

**Room Info Storage:**
```typescript
client.currentRoomInfo: GMCPMessageRoomInfo
```
- Set by Room.Info handler
- Contains full room data for current location

### 6.4 Integration with Stores

**PreferencesStore:**
- `midi.enabled` - Used by Client.Midi to determine if package should be active
- `sound.volume` - Used by Client.Media for global volume
- `speech.autoreadMode` - Used for automatic speech output

**Usage in GMCP:**
```typescript
// Client.Midi.ts line 46
get enabled(): boolean {
  return preferencesStore.getState().midi.enabled;
}
```

**InputStore:**
- Client.Keystrokes reads current input text for command substitution
- Client.Keystrokes can set input text when autosend is false

**Usage in GMCP:**
```typescript
// Client/Keystrokes.ts
const commandInput = inputStore.getState().text;
setInputText(command);
```

## 7. Package Registration and Lifecycle

### 7.1 Package Base Class

**File:** `C:\Users\Q\code\react-client\src\gmcp\package.ts`

```typescript
export abstract class GMCPMessage { }

export class GMCPPackage {
  public readonly packageName!: string;
  public readonly packageVersion?: number = 1;
  protected readonly client: MudClient;

  constructor(client: MudClient) {
    this.client = client;
  }

  get enabled(): boolean {
    return true;
  }

  sendData(messageName: string, data?: any): void {
    this.client.sendGmcp(
      this.packageName + "." + messageName,
      JSON.stringify(data)
    );
  }

  shutdown() {
    // Do nothing by default
  }
}
```

### 7.2 Registration Mechanism

**File:** `C:\Users\Q\code\react-client\src\client.ts`

```typescript
registerGMCPPackage(packageConstructor: new (client: MudClient) => GMCPPackage) {
  const packageInstance = new packageConstructor(this);
  this.gmcpHandlers[packageInstance.packageName] = packageInstance;
}
```

**Pattern:**
1. Pass constructor function to `registerGMCPPackage()`
2. Instantiate with client reference
3. Store by package name in `gmcpHandlers` dictionary

### 7.3 Registration Order

**File:** `C:\Users\Q\code\react-client\src\App.tsx` (lines 90-117)

**Order matters for dependencies:**
1. Core packages first (Core, Core.Supports)
2. Client capabilities (Media before IRE.Sound)
3. Communication
4. Authentication
5. Character data

This order ensures Core.Supports.Set includes all packages when sent.

### 7.4 Dynamic Package Management

**Client.Midi Example:**
- Not included in initial Core.Supports.Set
- Added via `Core.Supports.Add` when user enables MIDI
- Removed via `Core.Supports.Remove` when user disables MIDI
- Controlled by `enabled` property override

```typescript
// Client.Midi.ts
get enabled(): boolean {
  return preferencesStore.getState().midi.enabled;
}
```

### 7.5 Shutdown Lifecycle

**Base shutdown() method:** Can be overridden for cleanup
- Client.Midi clears active notes
- Client.Keystrokes removes event listeners
- Called when disconnecting or changing servers

## 8. Critical Implementation Details

### 8.1 Handler Naming Convention

Handler methods **MUST** be named `handle<MessageName>` where MessageName matches the GMCP message name exactly:

**Standard (camelCase):**
- `Char.Vitals` → `handleVitals()`
- `Room.Info` → `handleInfo()`

**Special (preserve underscores and case):**
- `Client.Html.Add_html` → `handleAdd_html()` (underscore preserved)
- `Comm.LiveKit.room_token` → `handleroom_token()` (lowercase preserved)
- `Client.Keystrokes.Bind_all` → `handleBind_all()` (underscore preserved)

**Dynamic routing depends on exact naming (client.ts line 461):**
```typescript
const messageHandler = (handler as any)["handle" + messageType];
```

### 8.2 JSON Parsing Safety

Empty or missing GMCP data defaults to `{}`:

```typescript
if (typeof gmcpMessage === 'string' && gmcpMessage.trim() !== '') {
  jsonStringToParse = gmcpMessage;
} else {
  console.warn(`GMCP message data for ${packageName}.${messageType} is missing or empty. Defaulting to {}.`);
  jsonStringToParse = '{}';
}
```

### 8.3 Error Handling

All GMCP message handling is wrapped in try-catch:

```typescript
try {
  this.handleGmcpData(packageName, data);
} catch (e) {
  console.error("Calling GMCP:", e);
}
```

JSON parsing errors are caught separately with detailed logging.

### 8.4 Package Version Field

All packages have version field for capability negotiation:

```typescript
public readonly packageVersion?: number = 1;
```

Used by Core.Supports.sendSet():
```typescript
.filter(p => p.packageName && p.packageVersion && p.enabled)
.map(p => `${p.packageName} ${p.packageVersion!.toString()}`)
```

### 8.5 Desktop Notifications

**Comm.Channel.Text** triggers desktop notifications:

```typescript
if (data.channel === "say_to_you" && !document.hasFocus()) {
  this.client.sendNotification(`Message from ${data.talker}`, `${data.text}`);
}
```

### 8.6 External Dependencies

**Cacophony Audio Library:**
- Client.Media uses Cacophony for audio playback
- Features: Multiple sounds, looping, 3D audio, volume control

**Marked Library:**
- Client.Html uses 'marked' for Markdown rendering
- Import: `import { marked } from 'marked';`

**MidiService:**
- Client.Midi wraps MidiService
- Features: Device enumeration, connection management, message routing

**WebRTC Service:**
- Client.FileTransfer uses WebRTC for peer-to-peer file transfers
- GMCP used only for signaling

## 9. Complete Message Reference

### 9.1 Client → Server Messages (42 total)

**Core Protocol (6):**
1. Core.Hello - `{ client, version }`
2. Core.KeepAlive - No data
3. Core.Ping - Optional ping value
4. Core.Supports.Set - Array of "PackageName Version"
5. Core.Supports.Add - Array of `{ name, version }`
6. Core.Supports.Remove - Array of package names

**Authentication (1):**
7. Auth.Autologin.Login - String token

**Character (1):**
8. Char.Login - `{ name, password }`

**Character Data Requests (10):**
9. Char.Items.Contents - String item ID
10. Char.Items.Inv - Empty string
11. Char.Items.Room - Empty string
12. Char.Offer.Offer - Empty object
13. Char.Prompt.Prompt - Empty object
14. Char.Skills.Get - `{ group?, name? }`
15. Char.Status.Status - Empty object
16. Char.Status.AffectedBy.AffectedBy - Empty object
17. Char.Status.Conditions.Conditions - Empty object
18. Char.Status.Timers.Timers - Empty object

**Group (1):**
19. Group.Info - Empty object

**Communication (3):**
20. Comm.Channel.List - No data
21. Comm.Channel.Players - Empty string
22. Comm.Channel.Enable - Channel name string

**Client Capabilities (14):**
23. Client.FileTransfer.Offer - `{ recipient, filename, filesize, offerSdp, hash }`
24. Client.FileTransfer.Accept - `{ sender, hash, filename, answerSdp }`
25. Client.FileTransfer.Reject - `{ sender, hash }`
26. Client.FileTransfer.Cancel - `{ recipient, hash }`
27. Client.FileTransfer.RequestResend - `{ sender, hash }`
28. Client.FileTransfer.Candidate - `{ recipient, candidate: JSON }`
29. Client.Keystrokes.BindingsList - Array of KeyBinding
30. Client.Midi.Note - `{ note, velocity, on, channel, duration? }`
31. Client.Midi.ControlChange - `{ controller, value, channel }`
32. Client.Midi.ProgramChange - `{ program, channel }`
33. Client.Midi.SystemMessage - `{ type, data }`
34. Client.Midi.RawMessage - `{ hex, data, type }`
35. Client.Midi.Enable - `{ enabled }`

**IRE (if registered) (7):**
36. IRE.Composer.SetBuffer - String text
37. IRE.Misc.Voted - Empty string
38. IRE.Rift.Request - No data
39. IRE.Target.Set - String target ID
40. IRE.Target.RequestInfo - No data
41. IRE.Tasks.Request - No data
42. IRE.Time.Request - No data

### 9.2 Server → Client Messages (88 total)

**Core (2):**
1. Core.Ping - No data or ping value
2. Core.Goodbye - `{ reason }`

**Auth (1):**
3. Auth.Autologin.Token - String token

**Char (4):**
4. Char.Name - `{ name, fullname }`
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
38. Comm.LiveKit.room_token - `{ token }`
39. Comm.LiveKit.room_leave - `{ token }`

**Client.File (1):**
40. Client.File.Download - `{ url }`

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

**Client.Media (6):**
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
64. Client.Midi.Enable - `{ enabled }`

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

## 10. File Reference

All file paths are absolute from project root `C:\Users\Q\code\react-client\`:

**Core Implementation:**
- `src\gmcp\package.ts` - Base classes
- `src\gmcp\index.ts` - Exports
- `src\client.ts` - Message routing and registration
- `src\telnet.ts` - Protocol layer
- `src\App.tsx` - Package registration

**All GMCP Packages (36 files):**
- `src\gmcp\Core.ts`
- `src\gmcp\Auth.ts`
- `src\gmcp\Char.ts`
- `src\gmcp\Char\Afflictions.ts`
- `src\gmcp\Char\Defences.ts`
- `src\gmcp\Char\Items.ts`
- `src\gmcp\Char\Offer.ts`
- `src\gmcp\Char\Prompt.ts`
- `src\gmcp\Char\Skills.ts`
- `src\gmcp\Char\Status.ts`
- `src\gmcp\Char\Status\AffectedBy.ts`
- `src\gmcp\Char\Status\Conditions.ts`
- `src\gmcp\Char\Status\Timers.ts`
- `src\gmcp\Room.ts`
- `src\gmcp\Group.ts`
- `src\gmcp\Comm\Channel.ts`
- `src\gmcp\Comm\LiveKit.ts`
- `src\gmcp\Client\File.ts`
- `src\gmcp\Client\FileTransfer.ts`
- `src\gmcp\Client\Html.ts`
- `src\gmcp\Client\Keystrokes.ts`
- `src\gmcp\Client\Media.ts`
- `src\gmcp\Client\Midi.ts`
- `src\gmcp\Client\Speech.ts`
- `src\gmcp\Logging.ts`
- `src\gmcp\Redirect.ts`
- `src\gmcp\IRE\CombatMessage.ts`
- `src\gmcp\IRE\Composer.ts`
- `src\gmcp\IRE\Display.ts`
- `src\gmcp\IRE\Misc.ts`
- `src\gmcp\IRE\Rift.ts`
- `src\gmcp\IRE\Sound.ts`
- `src\gmcp\IRE\Target.ts`
- `src\gmcp\IRE\Tasks.ts`
- `src\gmcp\IRE\Time.ts`

---

**Report Complete:** This document provides comprehensive documentation of all GMCP packages, message formats, data structures, event emissions, state integration, and implementation details for the Win32 React MUD client.
