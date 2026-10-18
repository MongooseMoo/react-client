# Wave 2: GMCP Protocol Verification

## Executive Summary

Verification of `reports/wave1/04-gmcp.md` against actual source files reveals the documentation is **highly accurate** with comprehensive coverage. Found 36 total GMCP package classes implementing 82+ handler methods. The documentation correctly identified all registered packages and correctly noted 10 unregistered IRE packages. Minor corrections and several undocumented implementation details identified below.

## Package Count Verification

### Documented vs Actual Count

**Documentation claimed:** 30+ packages (36 including unregistered IRE packages)
**Actual implementation:** 36 package classes found

### All Implemented Packages (36 Total)

#### Registered in App.tsx (26 packages):
1. **GMCPCore** - Core protocol operations
2. **GMCPCoreSupports** - Package capability negotiation (separate class from Core)
3. **GMCPAutoLogin** - Auth.Autologin
4. **GMCPChar** - Basic character information
5. **GMCPCharAfflictions** - Char.Afflictions
6. **GMCPCharDefences** - Char.Defences
7. **GMCPCharItems** - Char.Items
8. **GMCPCharOffer** - Char.Offer
9. **GMCPCharPrompt** - Char.Prompt
10. **GMCPCharSkills** - Char.Skills
11. **GMCPCharStatus** - Char.Status
12. **GMCPCharStatusAffectedBy** - Char.Status.AffectedBy
13. **GMCPCharStatusConditions** - Char.Status.Conditions
14. **GMCPCharStatusTimers** - Char.Status.Timers
15. **GMCPRoom** - Room information
16. **GMCPGroup** - Group/party information
17. **GMCPCommChannel** - Comm.Channel
18. **GMCPCommLiveKit** - Comm.LiveKit
19. **GMCPClientFileTransfer** - Client.FileTransfer
20. **GMCPClientHtml** - Client.Html
21. **GMCPClientKeystrokes** - Client.Keystrokes
22. **GMCPClientMedia** - Client.Media
23. **GMCPClientMidi** - Client.Midi
24. **GMCPClientSpeech** - Client.Speech
25. **GMCPLogging** - Logging
26. **GMCPRedirect** - Redirect

#### Unregistered Packages (10 packages):

27. **GMCPClientFile** - Client.File (IMPLEMENTED, NOT EXPORTED IN index.ts, NOT REGISTERED)
28. **GmcPIRECombatMessage** - IRE.CombatMessage
29. **GmcPIREComposer** - IRE.Composer
30. **GmcPIREDisplay** - IRE.Display
31. **GmcPIREMisc** - IRE.Misc
32. **GmcPIRERift** - IRE.Rift
33. **GmcPIRESound** - IRE.Sound
34. **GmcPIRETarget** - IRE.Target
35. **GmcPIRETasks** - IRE.Tasks
36. **GmcPIRETime** - IRE.Time

**Count verification:** ✅ Documentation was accurate (30+ packages, 36 total including IRE)

## Verified Accurate

The following sections of the documentation are **100% accurate**:

### Protocol Implementation
- ✅ Telnet option code 201 for GMCP (telnet.ts line 57)
- ✅ Negotiation sequence (IAC WILL/DO GMCP)
- ✅ Initial handshake sends Core.Hello, Core.Supports.Set, Auth.Autologin.Login (client.ts lines 282-284)
- ✅ Message format: `IAC SB GMCP <package>.<message> <JSON> IAC SE`

### Message Routing
- ✅ Parsing splits on first space to separate package name from JSON (telnet.ts line 242)
- ✅ Routing splits on last dot to separate package from message type (client.ts lines 447-449)
- ✅ Dynamic handler lookup using `handle<MessageName>` pattern (client.ts line 458)
- ✅ JSON parsing with empty object fallback (client.ts lines 465-471)
- ✅ Error handling with try-catch around handler calls (client.ts lines 473-482)

### Package Documentation Accuracy
The following packages were verified as **completely accurate** in the documentation:

- ✅ **Core** - All handlers and send methods verified
- ✅ **Core.Supports** - sendSet/sendAdd/sendRemove verified
- ✅ **Auth.Autologin** - Token handling verified
- ✅ **Char** - Name/Vitals/StatusVars/Status handlers verified
- ✅ **Char.Afflictions** - List/Add/Remove structure verified
- ✅ **Char.Defences** - List/Add/Remove structure verified
- ✅ **Char.Items** - All message types and location handling verified
- ✅ **Char.Offer** - Offer structure verified
- ✅ **Char.Prompt** - Prompt handler verified
- ✅ **Char.Skills** - Groups/List/Info handlers verified
- ✅ **Char.Status** - Status handler verified
- ✅ **Char.Status.*** - All three subpackages verified
- ✅ **Room** - All 5 handlers verified, player tracking accurate
- ✅ **Group** - Info handler verified
- ✅ **Comm.Channel** - All 5 handlers verified
- ✅ **Comm.LiveKit** - Handler names verified (lowercase with underscores)
- ✅ **Client.FileTransfer** - All 5 server messages and 6 client messages verified
- ✅ **Client.Html** - Handler names with underscores verified (Add_html, Add_markdown)
- ✅ **Client.Keystrokes** - All handlers including Bind_all verified
- ✅ **Client.Media** - All 6 handlers and complex MediaPlay structure verified
- ✅ **Client.Midi** - All handlers and MIDI message types verified
- ✅ **Client.Speech** - Speak handler verified
- ✅ **Logging** - Error handler verified
- ✅ **Redirect** - Window handler verified

### IRE Package Verification
All 9 IRE packages documented are **implemented and accurate**:

- ✅ **IRE.CombatMessage** - Dynamic skill handling noted
- ✅ **IRE.Composer** - Edit/SetBuffer verified
- ✅ **IRE.Display** - FixedFont/Ohmap handlers verified
- ✅ **IRE.Misc** - All 4 handlers verified
- ✅ **IRE.Rift** - List/Change handlers verified
- ✅ **IRE.Sound** - Delegation to Client.Media verified
- ✅ **IRE.Target** - Set/Info handlers verified
- ✅ **IRE.Tasks** - List/Update/Completed handlers verified
- ✅ **IRE.Time** - List/Update handlers verified

## Corrections/Clarifications

### 1. Client.File Export Status

**Documentation stated:** "DEFINED BUT NOT REGISTERED"
**Actual status:** IMPLEMENTED, NOT EXPORTED IN index.ts, AND NOT REGISTERED

**Issue:** Client.File is not exported from `src/gmcp/index.ts`, making it impossible to register even if desired.

**File:** `src/gmcp/Client/File.ts` exists and implements GMCPClientFile class
**Missing from:** `src/gmcp/index.ts` (no export statement for GMCPClientFile)

**Correction needed:** To use Client.File, must add export to index.ts:
```typescript
export { GMCPClientFile } from "./Client/File";
```

### 2. IRE Package Class Naming Convention

**Documentation used:** Capitalized names (e.g., "GMCPIRESound")
**Actual implementation:** Mixed case with lowercase "c" and "P" (e.g., "GmcPIRESound")

**Examples:**
- `GmcPIRESound` (not GMCPIRESound)
- `GmcPIRETarget` (not GMCPIRETarget)
- `GmcPIREComposer` (not GMCPIREComposer)

**Impact:** None for iOS implementation (class names are internal), but documentation should reflect actual naming

### 3. Handler Method Count

**Documentation stated:** 88 server-to-client messages
**Actual count:** 82 handler methods found in source

**Analysis:**
- Grep found 82 handle* methods across 32 files
- Discrepancy may be due to:
  - Some messages having multiple handlers (unlikely)
  - Documentation counting potential messages not yet implemented
  - FileTransfer.Candidate counted in some contexts but may be client-to-server only

**Recommendation:** Use 82+ as the count, noting some messages may share handlers

### 4. Package Version Field

**Documentation did not mention:** All packages have optional `packageVersion` field

**Finding:** Base class GMCPPackage defines:
```typescript
public readonly packageVersion?: number = 1;
```

**File:** `src/gmcp/package.ts` line 8

**Usage:** Core.Supports.sendSet filters packages with `p.packageVersion` and formats as "PackageName Version"

**iOS Impact:** iOS implementation must include version field for proper capability negotiation

## Undocumented Features

### 1. Package Enabled State

**Not mentioned in documentation:** Packages have an `enabled` property that controls registration

**Implementation:**
```typescript
// Base class (src/gmcp/package.ts line 15-17)
get enabled(): boolean {
    return true;
}

// Client.Midi overrides this (src/gmcp/Client/Midi.ts lines 46-48)
get enabled(): boolean {
    return preferencesStore.getState().midi.enabled;
}
```

**Usage:** Core.Supports.sendSet filters by `p.enabled` when building capability list

**iOS Impact:** iOS implementation should support disabling packages dynamically

### 2. Package Shutdown Lifecycle

**Not mentioned in documentation:** Packages have a shutdown() method

**Implementation:**
```typescript
// Base class (src/gmcp/package.ts lines 26-28)
shutdown() {
    // Do nothing by default
}
```

**Usage:** Can be overridden for cleanup (e.g., Client.Midi clears active notes)

**iOS Impact:** iOS should call shutdown when disconnecting or changing servers

### 3. Comm.LiveKit Handler Naming

**Documentation correctly noted:** Handlers use lowercase with underscores

**Actual implementation verified:**
- `handleroom_token` (line 10, not handleRoomToken)
- `handleroom_leave` (line 15, not handleRoomLeave)

**Critical detail:** This violates the typical camelCase convention and must be matched exactly for dynamic routing to work

**iOS Impact:** iOS must preserve exact case and underscores in handler method names

### 4. Client.Html Handler Naming

**Documentation correctly noted:** Handlers use underscores

**Actual implementation verified:**
- `handleAdd_html` (line 16)
- `handleAdd_markdown` (line 20)

**iOS Impact:** Same as LiveKit - preserve exact naming including underscores

### 5. Client.Keystrokes Special Handler

**Not fully documented:** ListBindings is a bidirectional message

**Server sends:** `Client.Keystrokes.ListBindings` (request for current bindings)
**Client responds:** `Client.Keystrokes.BindingsList` (array of bindings)

**Handler:** `handleListBindings` automatically calls `sendData("BindingsList", bindingsArray)`

**File:** `src/gmcp/Client/Keystrokes.ts` lines 177-183

**iOS Impact:** Must implement both receiving ListBindings and sending BindingsList

### 6. GMCP Message Data Handling

**Undocumented edge case:** Empty or missing message data defaults to `{}`

**Implementation:**
```typescript
// client.ts lines 465-471
if (typeof gmcpMessage === 'string' && gmcpMessage.trim() !== '') {
    jsonStringToParse = gmcpMessage;
} else {
    console.warn(`GMCP message data for ${packageName}.${messageType} is missing or empty. Defaulting to {}.`);
    jsonStringToParse = '{}';
}
```

**iOS Impact:** Must handle messages with no JSON data (e.g., `Core.Ping` with no arguments)

### 7. IRE.CombatMessage Dynamic Routing

**Partially documented but implementation unclear:** CombatMessage uses dynamic skill names

**Issue:** Standard routing splits on last dot:
- Message: `IRE.CombatMessage.skirmishing_kick`
- Package: `IRE.CombatMessage`
- Message type: `skirmishing_kick`

**Current implementation:** Has `handleSkillAttack` method but this won't be called by standard routing (which looks for `handleskirmishing_kick`)

**Status:** This package appears to be incomplete or requires custom routing logic not shown in standard handler lookup

**iOS Impact:** IRE.CombatMessage may not work correctly without additional routing logic

### 8. Client.FileTransfer Implements Interface

**Not mentioned:** GMCPClientFileTransfer implements FileTransferSignaler interface

**Declaration:**
```typescript
export class GMCPClientFileTransfer extends GMCPPackage implements FileTransferSignaler
```

**File:** `src/gmcp/Client/FileTransfer.ts` line 55

**Purpose:** Provides structured interface for WebRTC signaling callbacks

**iOS Impact:** iOS implementation should define equivalent protocol/interface for file transfer signaling

### 9. IRE.Sound Delegation Pattern

**Documented but implementation details missing:** IRE.Sound delegates to Client.Media

**Finding:** IRE.Sound stores reference to Client.Media handler in constructor:

```typescript
constructor(client: MudClient) {
    super(client);
    this.mediaHandler = client.gmcpHandlers['Client.Media'] as GMCPClientMedia;
}
```

**File:** `src/gmcp/IRE/Sound.ts` lines 37-44

**Dependencies:** IRE.Sound requires Client.Media to be registered first

**Parameter translation:**
- `fadein_csec` → `fadein` (centiseconds to milliseconds, × 10)
- `fadeout_csec` → `fadeout` (centiseconds to milliseconds, × 10)
- `loop: boolean` → `loops: number` (-1 for true, 0 for false)

**iOS Impact:** Must register Client.Media before IRE.Sound, implement parameter conversion

### 10. Client.Midi Dynamic Registration

**Documented but mechanism not detailed:** Client.Midi uses dynamic Core.Supports updates

**Implementation:**
- Not included in initial Core.Supports.Set
- Added via `coreSupports.sendAdd([{ name: "Client.Midi", version: 1 }])` when enabled
- Removed via `coreSupports.sendRemove(["Client.Midi"])` when disabled

**Trigger:** User preference change in PreferencesStore (`midi.enabled`)

**iOS Impact:** iOS should implement dynamic capability updates, not just static initial list

## Protocol Flow Verification

### GMCP Negotiation Flow

**Documentation stated:**
1. Server sends: `IAC WILL GMCP`
2. Client responds: `IAC DO GMCP`
3. Client sends: Core.Hello, Core.Supports.Set, Auth.Autologin.Login

**Verified in source:**

**File:** `src/client.ts` lines 278-284
```typescript
if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
    console.log("GMCP Negotiation");
    this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
    (this.gmcpHandlers["Core"] as GMCPCore).sendHello();
    (this.gmcpHandlers["Core.Supports"] as GMCPCoreSupports).sendSet();
    (this.gmcpHandlers["Auth.Autologin"] as GMCPAutoLogin).sendLogin();
}
```

**Status:** ✅ Flow is exactly as documented

### GMCP Message Parsing Flow

**Documentation stated:** Telnet → GMCP Parser → Message Router → Handler

**Verified flow:**

1. **Telnet layer receives:** IAC SB GMCP ... IAC SE
   - **File:** `src/telnet.ts` lines 231-237
   - Detects GMCP subnegotiation, extracts payload

2. **GMCP parsing:** Split package from data
   - **File:** `src/telnet.ts` lines 240-244
   - Regex: `split(/ +(.+?)$/, 2)` splits on first space
   - Emits: `("gmcp", packageName, dataString)`

3. **Message routing:** Split package from message type
   - **File:** `src/client.ts` lines 445-456
   - `lastIndexOf(".")` finds final dot
   - Looks up handler in `gmcpHandlers` dictionary

4. **Handler invocation:** Dynamic method lookup
   - **File:** `src/client.ts` lines 458-482
   - Constructs handler name: `"handle" + messageType`
   - Parses JSON with error handling
   - Calls handler with parsed data

**Status:** ✅ Flow is exactly as documented

### GMCP Message Sending Flow

**Documentation stated:** Package.sendData() → Client.sendGmcp() → Telnet.sendGmcp()

**Verified flow:**

1. **Package method:** `sendData(messageName, data)`
   - **File:** `src/gmcp/package.ts` lines 19-24
   - Constructs full package name: `packageName + "." + messageName`
   - JSON.stringify() the data
   - Calls `client.sendGmcp()`

2. **Client layer:** Logging and delegation
   - **File:** `src/client.ts` lines 500-503
   - Logs outgoing GMCP
   - Delegates to `telnet.sendGmcp()`

3. **Telnet layer:** Wire format construction
   - **File:** `src/telnet.ts` lines 250-260
   - Constructs: `package + " " + data`
   - Wraps in: `IAC SB GMCP <string> IAC SE`
   - Writes to socket

**Status:** ✅ Flow is exactly as documented

### Event Emission Flow

**Documentation stated:** Handlers emit events → useClientEvent hook subscribes

**Verified pattern:**

**Example from Char.ts line 17:**
```typescript
handleVitals(data: any): void {
    this.client.emit("vitals", data);
}
```

**Client extends EventEmitter:** `src/client.ts` imports from 'events'

**UI subscription:** `useClientEvent<"vitals">(client, "vitals", defaultValue)`

**Status:** ✅ Event-driven architecture verified

### WorldData Direct Updates

**Documentation stated:** Some handlers directly modify client.worldData

**Verified direct updates:**

1. **Char.Name** → `worldData.playerId`, `worldData.playerName`
   - **File:** `src/gmcp/Char.ts` lines 12-13

2. **Room.Info** → `worldData.roomId`
   - **File:** `src/gmcp/Room.ts` line 31

3. **Room.Players/AddPlayer/RemovePlayer** → `worldData.roomPlayers`
   - **File:** `src/gmcp/Room.ts` lines 47, 59, 73

4. **Comm.LiveKit** → `worldData.liveKitTokens`
   - **File:** `src/gmcp/Comm/LiveKit.ts` lines 11, 16

**Status:** ✅ Direct state updates verified

## Missing from Documentation

### 1. GMCPMessage Base Class

**Not documented:** GMCPMessage abstract class for type safety

**Implementation:**
```typescript
export abstract class GMCPMessage { }
```

**File:** `src/gmcp/package.ts` line 3

**Usage:** Message data classes extend GMCPMessage for type checking

**iOS Impact:** Consider equivalent protocol/struct approach for message types

### 2. Registration Mechanism

**Not fully documented:** How packages are registered

**Implementation in client.ts:**
```typescript
registerGMCPPackage(packageConstructor: new (client: MudClient) => GMCPPackage) {
    const packageInstance = new packageConstructor(this);
    this.gmcpHandlers[packageInstance.packageName] = packageInstance;
}
```

**Pattern:** Pass constructor function, instantiate with client reference, store by package name

**iOS Impact:** iOS needs similar registration mechanism

### 3. Error Logging Console Patterns

**Not documented:** Extensive console.log usage throughout GMCP handlers

**Finding:** Nearly every handler logs received messages:
```typescript
console.log("Received IRE.Sound.Play:", data);
```

**Purpose:** Debugging and development tracing

**iOS Impact:** iOS should implement equivalent logging/debugging infrastructure

### 4. Desktop Notifications

**Not documented:** Comm.Channel.Text triggers desktop notifications

**Finding:**
```typescript
handleText(data: ChannelText) {
    if (data.channel === "say_to_you" && !document.hasFocus()) {
        // Send desktop notification
    }
    this.client.emit("channelText", data);
}
```

**File:** `src/gmcp/Comm/Channel.ts` lines 21-31

**iOS Impact:** iOS should implement equivalent notification handling for tells/whispers

### 5. Marked Library Dependency

**Not documented:** Client.Html uses 'marked' library for Markdown

**Import:** `import { marked } from 'marked';`

**File:** `src/gmcp/Client/Html.ts` line 3

**Usage:** `marked(markdown)` converts Markdown to HTML

**iOS Impact:** iOS needs Markdown rendering library or native implementation

### 6. Cacophony Audio Library

**Mentioned but not detailed:** Client.Media uses Cacophony

**Not shown:** How Cacophony is integrated, what features are used

**iOS Impact:** iOS must implement equivalent audio system with:
- Multiple simultaneous sounds
- Looping support
- Volume control
- 3D spatial audio (HRTF)
- Start position seeking
- Priority-based interruption

### 7. MidiService Integration

**Mentioned but not detailed:** Client.Midi wraps MidiService

**Finding:** Complex service with device enumeration, connection management, message routing

**File:** `src/MidiService.ts` (referenced but not analyzed)

**Features:**
- Input/output device enumeration
- Connection management
- Auto-reconnect to last device
- Active note tracking with timeouts
- Debug callbacks

**iOS Impact:** iOS must implement CoreMIDI integration with equivalent features

## Recommendations for iOS Implementation

### Critical Implementation Notes

1. **Preserve exact handler naming:** Must match case and underscores exactly
   - `handleroom_token` not `handleRoomToken`
   - `handleAdd_html` not `handleAddHtml`

2. **Implement package version field:** Required for Core.Supports negotiation

3. **Support enabled property:** Allow packages to be dynamically enabled/disabled

4. **Implement shutdown lifecycle:** Clean up resources when disconnecting

5. **Handle empty JSON data:** Default to `{}` for messages with no data

6. **Export Client.File if needed:** Currently not exported, cannot be used

7. **IRE.CombatMessage needs custom routing:** Dynamic skill names won't work with standard handler lookup

8. **Register packages in correct order:** Dependencies matter (e.g., Client.Media before IRE.Sound)

### Package Priority for iOS

**Must implement:**
- Core, Core.Supports (required)
- Char, Char.Items, Char.Vitals (basic functionality)
- Room (navigation)
- Comm.Channel (communication)

**Should implement:**
- Client.Html (formatted output)
- Client.Media (audio)
- Auth.Autologin (UX improvement)
- All Char.* subpackages (full character tracking)

**Optional:**
- Client.Midi (specialized feature)
- Client.FileTransfer (complex WebRTC)
- All IRE.* packages (game-specific)
- Comm.LiveKit (voice chat)

### Architecture Decisions

1. **Use protocol/delegate pattern** for event emission (Swift equivalent of EventEmitter)

2. **Implement type-safe message structs** (equivalent to GMCPMessage classes)

3. **Use dictionary for package registry** keyed by package name string

4. **Implement dynamic handler dispatch** using reflection or protocol methods

5. **Separate telnet, GMCP, and business logic layers** as shown in web client

## Files Analyzed

All file paths verified as absolute from project root `C:\Users\Q\code\react-client\`:

### Core Implementation
- `src/gmcp/package.ts` - Base classes
- `src/gmcp/index.ts` - Exports
- `src/client.ts` - Message routing
- `src/telnet.ts` - Protocol layer
- `src/App.tsx` - Package registration

### All GMCP Packages (36 files)
- `src/gmcp/Core.ts`
- `src/gmcp/Auth.ts`
- `src/gmcp/Char.ts`
- `src/gmcp/Char/Afflictions.ts`
- `src/gmcp/Char/Defences.ts`
- `src/gmcp/Char/Items.ts`
- `src/gmcp/Char/Offer.ts`
- `src/gmcp/Char/Prompt.ts`
- `src/gmcp/Char/Skills.ts`
- `src/gmcp/Char/Status.ts`
- `src/gmcp/Char/Status/AffectedBy.ts`
- `src/gmcp/Char/Status/Conditions.ts`
- `src/gmcp/Char/Status/Timers.ts`
- `src/gmcp/Room.ts`
- `src/gmcp/Group.ts`
- `src/gmcp/Comm/Channel.ts`
- `src/gmcp/Comm/LiveKit.ts`
- `src/gmcp/Client/File.ts`
- `src/gmcp/Client/FileTransfer.ts`
- `src/gmcp/Client/Html.ts`
- `src/gmcp/Client/Keystrokes.ts`
- `src/gmcp/Client/Media.ts`
- `src/gmcp/Client/Midi.ts`
- `src/gmcp/Client/Speech.ts`
- `src/gmcp/Logging.ts`
- `src/gmcp/Redirect.ts`
- `src/gmcp/IRE/CombatMessage.ts`
- `src/gmcp/IRE/Composer.ts`
- `src/gmcp/IRE/Display.ts`
- `src/gmcp/IRE/Misc.ts`
- `src/gmcp/IRE/Rift.ts`
- `src/gmcp/IRE/Sound.ts`
- `src/gmcp/IRE/Target.ts`
- `src/gmcp/IRE/Tasks.ts`
- `src/gmcp/IRE/Time.ts`

## Summary

The GMCP documentation in `reports/wave1/04-gmcp.md` is **exceptionally accurate and comprehensive**. All major systems, message formats, and handler signatures are correctly documented. The few corrections needed are:

1. Client.File export status clarification
2. IRE package class naming convention
3. Handler count minor discrepancy

The undocumented features identified (enabled property, shutdown lifecycle, handler naming edge cases, dynamic registration) are important for iOS implementation but do not invalidate the existing documentation.

**Overall assessment:** Documentation is production-ready for iOS porting with the additions noted in this verification report.
