# Legacy Client Event Inventory

This inventories app-level `client.emit(...)` and `MudClient` `this.emit(...)`
events in `src`, excluding test-only use. The goal is to remove the legacy
client event bus where state already has, or should have, a real owner.

Hard rule: `MudClient` will no longer be an `EventEmitter`. Every production
`client.emit(...)`, `client.on(...)`, `client.off(...)`, `client.once(...)`,
`client.removeListener(...)`, and `useClientEvent(client, ...)` call must be
removed or moved to a non-client owner. The behavior may remain, but the client
bus may not.

## Disposition Key

- **Move to store**: replace `client.emit(...)` bridge and `client.on(...)`
  consumers with a Zustand store. Use an existing store only if it already owns
  the domain; otherwise add a focused store.
- **Use package directly**: consumer should call or subscribe to the typed
  MCP/GMCP package instead of a renamed app event.
- **Delete bridge**: no production consumer was found; remove the relay unless
  a real current consumer appears during the slice.
- **Move to service owner**: behavior remains event-like, but the owner cannot
  be `MudClient`; move it to a focused service/store/module.

## Existing Store Inventory

These stores exist today and should be reused only for their current domain,
not treated as a generic dumping ground.

| Store | Current owner/domain | Already covers | Does not cover |
| --- | --- | --- | --- |
| `useSessionStore` | Current session identity/location | `playerId`, `playerName`, `roomId` | connection state, GMCP readiness, status text, vitals |
| `useRoomStore` | Current room and room players | `roomInfo`, `roomPlayers` | inventory/items, wrong-direction feedback, channel users |
| `useSpatialStore` | Spatial scene state | entities, emitters, listener id/position/orientation | imperative Web Audio sync notifications |
| `useInputStore` | Command input state | current input text, visible command completions | autosay, command history buffers |
| `useWorldMapStore` | AWNS visual/map data | location id, self id, map users, topology rooms | room details outside AWNS visual payloads |
| `useServerLinksStore` | Server links | home/help URLs, recent display URLs | generic status text |
| `useLiveKitStore` | LiveKit room tokens | active token list | connection/audio participant state |
| `usePreferences` | Persisted user preferences | local echo, speech, sound, channels, editor, keyboard, midi, haptics, autologging | live runtime connection/session state |

Missing store families implied by the event inventory: connection/session
lifecycle, output/log history, character status/vitals, items/inventory, skills,
channels/history, userlist/people, and possibly target state.

## Execution Workstream

Commit policy: do not make one commit per individual event removal. Make one
commit per coherent owner/slice, where each commit leaves the tree coherent and
tested. Examples: duplicate LiveKit relay cleanup, item/inventory store
migration, output/log owner migration, spatial/audio sync migration.

When this document says a bridge has "none found" for production consumers, it
means no current production `client.on(...)` consumer of the legacy client-bus
relay was found. It does not mean the typed MCP/GMCP package or protocol message
is useless. The typed package handling remains the protocol owner unless a slice
explicitly proves that package itself is dead.

Default action for a no-consumer bridge:

1. Keep the typed MCP/GMCP package and message handling.
2. Delete only the legacy `client.emit(...)` compatibility relay.
3. If the payload should become app state, write it to the correct store in the
   same owner slice.
4. Do not invent a fake consumer just to justify keeping a bridge.

Recommended order:

1. Remove duplicate/dead bridges whose state is already store-owned or directly
   package-owned: LiveKit, AWNS visual/server links/input relays, haptics relays,
   and no-consumer protocol relays.
2. Add missing owners where current consumers exist: lifecycle/session readiness,
   output/log history, character vitals/status, items/inventory, skills,
   channel history, and userlist/people.
3. Move consumers from `client.on(...)` / `useClientEvent(client, ...)` to those
   owners.
4. Replace spatial/audio client-bus sync with `spatialStore` plus a non-client
   imperative sync owner.
5. Delete `useClientEvent`, then remove `MudClient extends EventEmitter` and the
   final client event API surface.

## Lifecycle And Output

| Event | Producer | Current production consumers | Disposition | Todo |
| --- | --- | --- | --- | --- |
| `connect` | `MudClient.connect()`, `connectToStream()` | `App`, `Output`, `statusbar` | Move to new lifecycle store/service | Add a focused connection/session-lifecycle owner; replace `App`, `Output`, and `statusbar` client subscriptions. |
| `disconnect` | `MudClient.cleanupConnection()` | `App`, `Output`, `statusbar` | Move to new lifecycle store/service | Same lifecycle owner as `connect`; remove client subscription API. |
| `connectionChange` | `MudClient.connect()`, `connectToStream()`, `cleanupConnection()` | `toolbar` via `useClientEvent` | Move to new lifecycle store | `useSessionStore` is identity/location only today. Add a focused connection/session-lifecycle store or deliberately extend `useSessionStore` before replacing toolbar subscription. |
| `autosayChanged` | `MudClient.autosay` setter | `toolbar` via `useClientEvent` | Move to existing preference/input domain | Decide whether autosay is persisted preference (`usePreferences`) or transient command-input mode (`useInputStore` extension), then remove EventEmitter bridge. |
| `gmcpReady` | GMCP negotiation in `MudClient` | none found | Delete bridge | Remove after confirming no tests encode public behavior that should remain. |
| `sessionReady` | `Char.Name` bridge in `createConfiguredClient()` | `App` web-push subscription effect | Move to new lifecycle store | `useSessionStore` currently stores player/room identity only. Add readiness to a lifecycle store or explicitly broaden `useSessionStore`; `App` should subscribe to state instead of `once()`. |
| `error` | `MudClient.connect()` catch path | `Output` | Move to output/logging store | Route connection errors into the output/logging owner with `message`, `command`, and `html`; remove client event subscription. |
| `command` | `MudClient.sendCommand()` | `Output` | Move to output/logging store | Output history owns this; move together with `message`, `html`, and output persistence. |
| `message` | `MudClient.handleData()` | `Output`; `useChannelHistory` explicitly does not consume generic message traffic | Move to output/logging store | Output history owns this; move together with `command`, `html`, and output persistence. |
| `html` | `Client.Html` bridge in `createConfiguredClient()` | `Output` | Move to output/logging store | Output history owns this; move together with `message` and `command`. |
| `statustext` | `Char.Name`, AWNS DisplayUrl, AWNS Status bridge | `statusbar` | Move to new status/lifecycle store | No existing store owns generic status text. Add a small status/lifecycle store or fold into a deliberate output/status owner; then remove all `statustext` emits. |
| `vitals` | `Char.Vitals` bridge | `statusbar` | Move to new character/status store | No existing store owns vitals. Add character/status state, then remove relay. |

## Character And Inventory

| Event | Producer | Current production consumers | Disposition | Todo |
| --- | --- | --- | --- | --- |
| `statusVars` | `Char.StatusVars` bridge | none found | Delete bridge | Remove unless a real UI state owner is added in the same slice. |
| `statusUpdate` | `Char.Status` bridge | none found | Delete bridge | Supersede with new character/status store if status UI is implemented. |
| `status` | `Char.Status.Status` bridge | none found (`statusbar` listens to `vitals`, not `status`) | Delete bridge | Remove or fold into new character/status store. |
| `offer` | `Char.Offer` bridge | none found | Delete bridge | Remove until an offer UI exists. |
| `prompt` | `Char.Prompt` bridge | none found | Delete bridge | Remove until prompt state is actually consumed. |
| `statusAffectedBy` | `Char.Status.AffectedBy` bridge | none found | Delete bridge | Future owner should be new character/status store. |
| `statusConditions` | `Char.Status.Conditions` bridge | none found | Delete bridge | Future owner should be new character/status store. |
| `statusTimers` | `Char.Status.Timers` bridge | none found | Delete bridge | Future owner should be new character/status store. |
| `afflictionsList` / `afflictionAdd` / `afflictionRemove` | `Char.Afflictions` bridge | none found | Delete bridge | Future owner should be new character/status store if UI is added. |
| `defencesList` / `defenceAdd` / `defenceRemove` | `Char.Defences` bridge | none found | Delete bridge | Future owner should be new character/status store if UI is added. |
| `skillGroups` / `skillList` | `Char.Skills` bridge | `SkillsDisplay` | Move to new skills store | No existing store owns skills. Create a skills store or let `GMCPCharSkills` own state; remove `SkillsDisplay` event subscriptions. |
| `skillInfo` | `Char.Skills` bridge | none found | Move to new skills store or delete | If a skills store is added for `skillGroups` / `skillList`, store it there; otherwise delete the unused bridge. |
| `skillsDataReceived` | `SkillsDisplay` | none found | Delete bridge | Sidebar no longer consumes it; remove component-originated emit. |
| `itemsList` / `itemAdd` / `itemRemove` / `itemUpdate` | `Char.Items` bridge | `inventory`, `RoomInfoDisplay`, `sidebar` inventory activity, `Output` userlist-adjacent display does not consume item events | Move to new item/inventory store | `useRoomStore` owns room info/players, not room items. Create an item/inventory store with location-indexed items. `inventory`, `RoomInfoDisplay`, and sidebar should subscribe to that store. |
| `inventoryDataReceived` | `inventory` | none found | Delete bridge | Sidebar uses `itemsList`, not this event; remove component-originated emit. |

## Room, Channels, People

| Event | Producer | Current production consumers | Disposition | Todo |
| --- | --- | --- | --- | --- |
| `roomWrongDir` | `Room.WrongDir` bridge | none found | Delete bridge | Keep only if a UI owner is added. |
| `channelText` | `Comm.Channel.Text` bridge | `useChannelHistory` | Move to new channel/history store | Channel history already acts like a store but is hook-local. Promote it to a channel/history store and remove the client subscription. |
| `channelPlayers` / `channelStart` / `channelEnd` | `Comm.Channel` bridge | none found | Move to new channel store or delete | If channel UI is in scope, make a channel store; otherwise delete unused relays. |
| `userlist` | MCP VMOO userlist bridge | `sidebar`, `Output` | Move to new userlist/people store | No existing store owns userlist people. Create a userlist/people store; sidebar and output should subscribe to it. |
| `groupInfo` | `Group.Info` bridge | none found | Delete bridge | Future owner would be group store if UI appears. |
| `corePing` / `coreGoodbye` | `Core` bridge | none found | Delete bridge | Handle goodbye as connection/session state only if needed. |
| `gmcpError` | `Logging.Error` bridge | none found | Delete bridge or move to output/logging store | If user-visible errors are needed, route to output/logging store; otherwise delete the relay. |
| `redirectWindow` | `Redirect.Window` bridge | none found | Delete bridge | Future owner would be output/window routing. |

## Media, LiveKit, Haptics, Web Push

| Event | Producer | Current production consumers | Disposition | Todo |
| --- | --- | --- | --- | --- |
| `livekitToken` | `Comm.LiveKit.RoomToken` bridge | none found; `audioChat` reads `liveKitStore`; `GMCPCommLiveKit` already writes `liveKitStore` | Delete bridge | Remove duplicate relay; keep package-owned `liveKitStore.addToken()`. |
| `livekitLeave` | `Comm.LiveKit.RoomLeave` bridge and `audioChat` disconnect callback | none found; `audioChat` already mutates `liveKitStore`; `GMCPCommLiveKit` already removes tokens | Delete bridge | Remove duplicate bridge emit and component emit; keep store-owned token removal. |
| `webpushToken` | `Client.WebPush.Token` bridge | none found | Delete bridge or move to webpush store | `ensurePushSubscription()` awaits package token directly; remove relay unless UI needs token state. |
| `hapticsActuate` / `hapticsStop` / `hapticsStatus` / `hapticsSensorSubscribe` / `hapticsSensorUnsubscribe` | `Client.Haptics` bridge | none found | Delete bridge | Haptics package already talks to `hapticsService`; remove unused app events. |

## Spatial And World Map

| Event | Producer | Current production consumers | Disposition | Todo |
| --- | --- | --- | --- | --- |
| `spatialScene` | `Client.Spatial.Scene` bridge | `audioChat`, `GMCPClientMedia` | Move to existing `spatialStore` plus non-client sync owner | `audioChat` should subscribe/read `spatialStore`. `GMCPClientMedia` needs a direct spatial-store subscription or focused spatial-audio sync service; it cannot listen on `client`. |
| `spatialEntityEnter` / `spatialEntityMove` / `spatialEntityLeave` | `Client.Spatial` bridge | `audioChat` | Move to existing `spatialStore` | Remove relays after audio spatial bridge subscribes to `spatialStore`. |
| `spatialListenerPosition` | `Client.Spatial.ListenerPosition` bridge | none found | Delete bridge | Existing `spatialStore` already has listener position. |
| `spatialListenerOrientation` | `Client.Spatial.ListenerOrientation` bridge | `GMCPClientMedia` | Move to existing `spatialStore` plus non-client sync owner | Media should read listener orientation from `spatialStore` or receive it through a typed spatial/audio owner, not `client.on(...)`. |
| `spatialEmitterStart` / `spatialEmitterStop` | `Client.Spatial` bridge | none found | Delete bridge | Existing `spatialStore` already has emitter state. |
| `worldLocation` / `worldSelf` / `worldUsers` / `worldTopology` | AWNS Visual bridge | none found; `WorldMapPanel` reads `worldMapStore` | Delete bridge | Keep only `worldMapStore` writes. |
| `displayUrl` | AWNS DisplayUrl bridge | none found; `serverLinksStore` already records URLs | Delete bridge | Keep `serverLinksStore.addRecentUrl()` and status update, remove event. |
| `serverInfo` | AWNS ServerInfo bridge | none found; `ServerLinksPanel` reads `serverLinksStore` | Delete bridge | Keep `serverLinksStore.setServerInfo()`, remove event. |
| `visibleCommands` | AWNS Rehash bridge | none found; command input reads `inputStore` | Delete bridge | Keep `inputStore` writes, remove event. |
| `getset` | AWNS GetSet bridge | none found | Delete bridge | Remove until a consumer exists. |

## Orphan Client Listeners

These are production `client.on(...)` listeners with no matching production
`client.emit(...)` producer in the current tree.

| Event | Listener | Likely owner | Todo |
| --- | --- | --- | --- |
| `targetInfo` | `TargetInfo` | `IRE.Target` package or target store | Replace with direct typed package/store wiring, or delete the dead listener if the feature is not live. |
| `targetSet` | `TargetInfo` | `IRE.Target` package or target store | Same as `targetInfo`. |

## Hard-Rule Checklist

This is the current production checklist for making `MudClient` stop being an
emitter. A checkbox may cover multiple source lines only when those lines are
the same event family and must move/delete together.

Non-client emitters are outside this checklist: `FileTransferManager`,
`WebRTCService`, `HapticsService`, haptics backends, and `TelnetParser` still use
events internally. The hard rule here is specifically that `MudClient` is not an
emitter and no code uses `client` as an event bus.

### `src/client.ts`

- [ ] Remove `MudClient extends EventEmitter` at `src/client.ts:43`.
- [x] Replace `autosayChanged` emit at original `src/client.ts:76` with the input owner.
- [x] Replace `connect` emits at original `src/client.ts:124` and `src/client.ts:239` with lifecycle owner writes.
- [x] Replace `connectionChange` emits at original `src/client.ts:125`, `src/client.ts:240`, and `src/client.ts:271` with lifecycle owner writes.
- [x] Delete `gmcpReady` emits at original `src/client.ts:138`, `src/client.ts:205`, and `src/client.ts:242`.
- [x] Route connection `error` at original `src/client.ts:175` to output/logging owner.
- [x] Replace `disconnect` emit at original `src/client.ts:270` with lifecycle owner writes.
- [x] Route command echo at original `src/client.ts:294` to output/logging owner.
- [x] Route server text at original `src/client.ts:347` to output/logging owner.

### `src/createConfiguredClient.ts`

- [x] Replace `statustext` relays at original `src/createConfiguredClient.ts:106`, `src/createConfiguredClient.ts:228`, and `src/createConfiguredClient.ts:289`.
- [x] Replace `sessionReady` relay at original `src/createConfiguredClient.ts:108`.
- [x] Replace `vitals` relay at original `src/createConfiguredClient.ts:111`.
- [x] Delete unused character/status relays at original `src/createConfiguredClient.ts:112`-`src/createConfiguredClient.ts:119`.
- [x] Delete unused affliction/defence relays at original `src/createConfiguredClient.ts:120`-`src/createConfiguredClient.ts:125`.
- [x] Move `skillGroups` / `skillList` relays at original `src/createConfiguredClient.ts:126`-`src/createConfiguredClient.ts:127` to the skills owner.
- [x] Delete unused `skillInfo` relay at original `src/createConfiguredClient.ts:128`.
- [x] Move item relays at original `src/createConfiguredClient.ts:131`, `src/createConfiguredClient.ts:134`, `src/createConfiguredClient.ts:137`, and `src/createConfiguredClient.ts:140` to the item/inventory owner.
- [x] Delete unused core relays at original `src/createConfiguredClient.ts:142`-`src/createConfiguredClient.ts:143`.
- [x] Move `channelText` relay at original `src/createConfiguredClient.ts:145` to the channel/history owner.
- [x] Delete unused channel metadata relays at original `src/createConfiguredClient.ts:150`, `src/createConfiguredClient.ts:152`, and `src/createConfiguredClient.ts:154`.
- [x] Delete duplicate LiveKit relays at original `src/createConfiguredClient.ts:155`-`src/createConfiguredClient.ts:156`.
- [x] Delete unused `groupInfo`, `gmcpError`, `redirectWindow`, and `roomWrongDir` relays at original `src/createConfiguredClient.ts:157`-`src/createConfiguredClient.ts:162`.
- [x] Route `html` relays at original `src/createConfiguredClient.ts:163` and `src/createConfiguredClient.ts:166` to the output/logging owner.
- [x] Delete unused `webpushToken` relay at original `src/createConfiguredClient.ts:169`.
- [x] Delete unused haptics relays at original `src/createConfiguredClient.ts:174`-`src/createConfiguredClient.ts:181`.
- [ ] Move spatial relays at `src/createConfiguredClient.ts:183`-`src/createConfiguredClient.ts:206` to `spatialStore` plus the non-client spatial/audio sync owner.
- [x] Delete `displayUrl` relay at original `src/createConfiguredClient.ts:227` after keeping `serverLinksStore.addRecentUrl()`.
- [x] Delete `serverInfo` relay at original `src/createConfiguredClient.ts:235` after keeping `serverLinksStore.setServerInfo()`.
- [x] Delete AWNS visual relays at original `src/createConfiguredClient.ts:242`, `src/createConfiguredClient.ts:246`, `src/createConfiguredClient.ts:257`, and `src/createConfiguredClient.ts:267` after keeping `worldMapStore` writes.
- [x] Delete `visibleCommands` relays at original `src/createConfiguredClient.ts:274`, `src/createConfiguredClient.ts:278`, and `src/createConfiguredClient.ts:282` after keeping `inputStore` writes.
- [x] Delete unused `getset` relay at original `src/createConfiguredClient.ts:293`.
- [x] Move `userlist` relay at original `src/createConfiguredClient.ts:297` to the userlist/people owner.

### Current Consumers And Component-Originated Emits

- [x] Replace `App` lifecycle listeners at original `src/App.tsx:240`-`src/App.tsx:245`.
- [x] Replace `App` `sessionReady` listener cleanup at original `src/App.tsx:266` and `src/App.tsx:296`.
- [x] Replace `App` auto-login `connect` listener at original `src/App.tsx:274`.
- [x] Replace `useChannelHistory` `channelText` subscription at original `src/hooks/useChannelHistory.tsx:215` and cleanup at original `src/hooks/useChannelHistory.tsx:218`.
- [ ] Delete `src/hooks/useClientEvent.ts` after replacing all `useClientEvent(client, ...)` callers.
- [ ] Replace `GMCPClientMedia` spatial client listeners at `src/gmcp/Client/Media.ts:196`-`src/gmcp/Client/Media.ts:197` and cleanup at `src/gmcp/Client/Media.ts:281`-`src/gmcp/Client/Media.ts:282`.
- [ ] Replace `audioChat` spatial client listeners at `src/components/audioChat.tsx:77`-`src/components/audioChat.tsx:86`.
- [x] Delete `audioChat` component-originated `livekitLeave` emit at original `src/components/audioChat.tsx:141`.
- [x] Delete `inventoryDataReceived` emits at original `src/components/inventory.tsx:33`, `src/components/inventory.tsx:42`, `src/components/inventory.tsx:53`, and `src/components/inventory.tsx:69`.
- [x] Replace `inventory` item subscriptions at original `src/components/inventory.tsx:79`-`src/components/inventory.tsx:90`.
- [x] Replace `RoomInfoDisplay` item subscriptions at original `src/components/RoomInfoDisplay.tsx:76`-`src/components/RoomInfoDisplay.tsx:83`.
- [x] Replace `Output` output/logging subscriptions for `message`, `html`, `error`, and `command` at original `src/components/output.tsx:384`-`src/components/output.tsx:389` and cleanup at original `src/components/output.tsx:402`-`src/components/output.tsx:407`.
- [x] Replace `Output` `connect` / `disconnect` subscriptions at original `src/components/output.tsx:386`-`src/components/output.tsx:387` and cleanup at original `src/components/output.tsx:404`-`src/components/output.tsx:405`.
- [x] Replace `Output` `userlist` subscription at original `src/components/output.tsx:390` and cleanup at original `src/components/output.tsx:408`.
- [x] Replace `sidebar` `userlist` `useClientEvent` at original `src/components/sidebar.tsx:37`.
- [x] Replace `sidebar` inventory activity subscription at original `src/components/sidebar.tsx:88`-`src/components/sidebar.tsx:90`.
- [x] Delete `skillsDataReceived` emit at original `src/components/SkillsDisplay.tsx:25`.
- [x] Replace `SkillsDisplay` subscriptions at original `src/components/SkillsDisplay.tsx:52`-`src/components/SkillsDisplay.tsx:65`.
- [x] Replace `statusbar` subscriptions at original `src/components/statusbar.tsx:42`-`src/components/statusbar.tsx:55`.
- [x] Remove stale commented `statusbar` client event references at original `src/components/statusbar.tsx:46`-`src/components/statusbar.tsx:57`.
- [x] Delete orphan `TargetInfo` listeners at original `src/components/TargetInfo.tsx:28`-`src/components/TargetInfo.tsx:39`.
- [x] Replace `toolbar` `useClientEvent` calls at original `src/components/toolbar.tsx:40` and `src/components/toolbar.tsx:42`.

## Fixed-Point Log

### Iteration 1 - `createConfiguredClient` no-consumer and store-owned relays

Slice read:
- `src/createConfiguredClient.ts`
- `src/createConfiguredClient.test.ts`

Surfaces:
- no-consumer GMCP/MCP compatibility relays for unused character/status,
  afflictions/defences, skill info, core, channel metadata, LiveKit, group,
  GMCP logging, redirect, room wrong-direction, web push, haptics, and get/set
  payloads.
  - Disposition: delete
  - Owner after cleanup: typed GMCP/MCP package registration remains; no client
    event bridge remains for these names.
  - Action: removed only legacy `client.emit(...)` listeners while retaining
    package registration.
- store-owned AWNS/server/input relays for display URL, server info, visual map
  data, and visible commands.
  - Disposition: delete bridge
  - Owner after cleanup: `useServerLinksStore`, `useWorldMapStore`, and
    `useInputStore`.
  - Action: kept existing store writes and removed duplicate client-bus emits.

Gate results:
- Pass: `rg -n "McpAwnsGetSet|client\.emit\(\"(statusVars|statusUpdate|status|offer|prompt|statusAffectedBy|statusConditions|statusTimers|afflictionsList|afflictionAdd|afflictionRemove|defencesList|defenceAdd|defenceRemove|skillInfo|corePing|coreGoodbye|channelPlayers|channelStart|channelEnd|livekitToken|livekitLeave|groupInfo|gmcpError|redirectWindow|roomWrongDir|webpushToken|hapticsActuate|hapticsStop|hapticsStatus|hapticsSensorSubscribe|hapticsSensorUnsubscribe|displayUrl|serverInfo|worldLocation|worldSelf|worldUsers|worldTopology|visibleCommands|getset)" src\createConfiguredClient.ts`
- Pass: `npm run typecheck`
- Pass: `npm test -- src/createConfiguredClient.test.ts`
- Pass: `git diff --check`

Commit:
- `a863e47 Remove unused client event relays`

Next slice:
- Add/move the first missing state owner for current production consumers.

### Iteration 2 - `audioChat` duplicate LiveKit leave emit

Slice read:
- `src/components/audioChat.tsx`
- `src/stores/liveKitStore.ts`
- `src/gmcp/Comm/LiveKit.ts`

Surfaces:
- `client.emit('livekitLeave', token)` from the LiveKit disconnect callback.
  - Disposition: delete
  - Owner after cleanup: `useLiveKitStore.removeToken()` for local disconnects;
    `GMCPCommLiveKit` for protocol room-leave messages.
  - Action: removed the duplicate component-originated client-bus emit after
    confirming the callback already removes the token from the store.

Gate results:
- Pass: `rg -n "livekitLeave" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `git diff --check`

Commit:
- `c3fb49f Remove duplicate LiveKit leave emit`

Next slice:
- Add/move the first missing state owner for current production consumers.

### Iteration 3 - skills owner

Slice read:
- `src/gmcp/Char/Skills.ts`
- `src/components/SkillsDisplay.tsx`
- `src/createConfiguredClient.ts`
- `src/createConfiguredClient.test.ts`

Surfaces:
- `skillGroups` / `skillList` client relays and `SkillsDisplay` client
  subscriptions.
  - Disposition: move
  - Owner after cleanup: `GMCPCharSkills` writes `useSkillsStore`;
    `SkillsDisplay` reads `useSkillsStore` and uses `Char.Skills` only to send
    `Get` requests.
  - Action: added `useSkillsStore`, moved package handlers into the store,
    removed the client relays, and removed component client subscriptions.
- `skillsDataReceived` component-originated emit.
  - Disposition: delete
  - Owner after cleanup: none; no current production consumer.
  - Action: removed the emit without adding a replacement signal.

Gate results:
- Pass: `rg -n "skillGroups|skillList|skillsDataReceived|client\.emit\('skills|client\.(on|off)\('skill" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `npm test -- src/createConfiguredClient.test.ts`
- Pass: `git diff --check`

Commit:
- `6a3b4b3 Move skills events to store`

Next slice:
- Add/move the next missing state owner for current production consumers.

### Iteration 4 - item/inventory owner

Slice read:
- `src/gmcp/Char/Items.ts`
- `src/components/inventory.tsx`
- `src/components/RoomInfoDisplay.tsx`
- `src/components/sidebar.tsx`
- `src/createConfiguredClient.ts`
- `src/createConfiguredClient.test.ts`

Surfaces:
- `itemsList` / `itemAdd` / `itemRemove` / `itemUpdate` client relays and
  component subscriptions.
  - Disposition: move
  - Owner after cleanup: `GMCPCharItems` writes `useItemsStore`;
    inventory and room components read location-indexed item state.
  - Action: added `useItemsStore`, kept item `location` normalization in the
    store, removed relays, and removed component client subscriptions.
- `inventoryDataReceived` component-originated emits and sidebar inventory
  activity listener.
  - Disposition: delete/move
  - Owner after cleanup: `useItemsStore.hasReceivedList`.
  - Action: sidebar reads the item store instead of listening to `itemsList`.

Gate results:
- Pass: `rg -n "client\.(on|off)\('item|client\.emit\(\"items|client\.emit\(\"item|client\.emit\('inventory|inventoryDataReceived" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `npm test -- src/createConfiguredClient.test.ts`
- Pass: `git diff --check`

Commit:
- `87e6f85 Move item events to store`

Next slice:
- Add/move the next missing state owner for current production consumers.

### Iteration 5 - userlist/people owner

Slice read:
- `src/mcp/packages/userlist.ts`
- `src/components/sidebar.tsx`
- `src/components/output.tsx`
- `src/createConfiguredClient.ts`
- `src/createConfiguredClient.test.ts`

Surfaces:
- `userlist` client relay and `sidebar` / `Output` client subscriptions.
  - Disposition: move
  - Owner after cleanup: `McpVmooUserlist` writes `useUserlistStore`;
    sidebar reads players from the store; `Output` subscribes to the store's
    received-list flag for sidebar visibility.
  - Action: added `useUserlistStore`, moved MCP package updates into the store,
    removed the configured-client relay, and removed userlist client
    subscriptions.

Gate results:
- Pass: `rg -n "useClientEvent\(client, 'userlist'|client\.emit\(\"userlist|client\.(on|removeListener)\(\"userlist" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `npm test -- src/createConfiguredClient.test.ts`
- Pass: `git diff --check`

Commit:
- `b8b55c1 Move userlist events to store`

Next slice:
- Add/move the next missing state owner for current production consumers.

### Iteration 6 - orphan target UI

Slice read:
- `src/components/TargetInfo.tsx`
- `src/components/TargetInfo.css`
- `src/components/sidebar.tsx`
- `src/gmcp/IRE/Target.ts`

Surfaces:
- `TargetInfoDisplay` client listeners for `targetInfo` and `targetSet`.
  - Disposition: delete
  - Owner after cleanup: none in UI; `IRE.Target` typed package remains as the
    protocol owner.
  - Action: deleted the unused component and stylesheet, and removed stale
    commented sidebar references. No replacement store was added because no
    production UI renders the component and no client-bus producer exists.

Gate results:
- Pass: `rg -n "TargetInfo|TargetInfoDisplay|targetInfo|targetSet|TargetInfo.css|client\.(on|off)\(\"target" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `git diff --check`

Commit:
- `8e74d90 Delete orphan target client listeners`

Next slice:
- Add/move the next missing state owner for current production consumers.

### Iteration 7 - lifecycle, session readiness, status text, vitals, autosay

Slice read:
- `src/client.ts`
- `src/createConfiguredClient.ts`
- `src/App.tsx`
- `src/components/statusbar.tsx`
- `src/components/toolbar.tsx`
- `src/components/output.tsx`
- `src/stores/inputStore.ts`
- `src/createConfiguredClient.test.ts`
- `src/stores/inputStore.test.ts`

Surfaces:
- `connect`, `disconnect`, `connectionChange`, `sessionReady`, `statustext`,
  `vitals`, `gmcpReady`, and `autosayChanged` client events.
  - Disposition: move/delete
  - Owner after cleanup: `useConnectionStore` owns connection/session/status
    text; `useCharacterStatusStore` owns vitals; `useInputStore` owns autosay.
  - Action: added focused stores, moved client/configured-client writes to
    stores, moved App/statusbar/toolbar/Output connection consumers to stores,
    and deleted no-consumer `gmcpReady`.

Gate results:
- Pass: `rg -n "useClientEvent\(client, '(connectionChange|autosayChanged)'|client\.(on|off|once|removeListener)\(\"(connect|disconnect|sessionReady|statustext|vitals)|client\.emit\(\"(connect|disconnect|connectionChange|sessionReady|statustext|vitals)|this\.emit\(\"(connect|disconnect|connectionChange|gmcpReady|autosayChanged)" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `npm test -- src/createConfiguredClient.test.ts src/stores/inputStore.test.ts`
- Pass: `git diff --check`

Commit:
- `fc66534 Move lifecycle status events to stores`

Next slice:
- Move output/logging events or channel history, then spatial/audio sync.

### Iteration 8 - output/logging owner

Slice read:
- `src/client.ts`
- `src/createConfiguredClient.ts`
- `src/components/output.tsx`

Surfaces:
- `message`, `html`, `error`, and `command` client events.
  - Disposition: move
  - Owner after cleanup: `useOutputStore` receives output entries; `Output`
    subscribes to that store and keeps its existing rendering, persistence, and
    log management behavior.
  - Action: added `useOutputStore`, moved server text, HTML, command echo, and
    connection error writes to it, and removed Output's client subscriptions.

Gate results:
- Pass: `rg -n "client\.(on|removeListener)\(\"(message|html|error|command)|client\.emit\(\"html|this\.emit\(\"(message|error|command)" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `npm test -- src/createConfiguredClient.test.ts`
- Pass: `git diff --check`

Commit:
- `c9b32be Move output events to store`

Next slice:
- Move channel history, then spatial/audio sync.

### Iteration 9 - channel history owner

Slice read:
- `src/gmcp/Comm/Channel.ts`
- `src/hooks/useChannelHistory.tsx`
- `src/createConfiguredClient.ts`
- `src/App.tsx`
- `src/createConfiguredClient.test.ts`

Surfaces:
- `channelText` client relay and `useChannelHistory` client subscription.
  - Disposition: move
  - Owner after cleanup: `GMCPCommChannel` writes `useChannelHistoryStore`;
    `useChannelHistory` consumes that store and keeps its buffer/navigation
    behavior.
  - Action: added `useChannelHistoryStore`, moved channel text and notification
    behavior into the package handler, removed the configured-client relay, and
    removed the hook's client subscription.

Gate results:
- Pass: `rg -n "client\.emit\(\"channelText|client\.(on|removeListener)\(\"channelText" src --glob "!src/**/*.test.ts" --glob "!src/**/*.test.tsx"`
- Pass: `npm run typecheck`
- Pass: `npm test -- src/createConfiguredClient.test.ts`
- Pass: `git diff --check`

Commit:
- pending

Next slice:
- Move spatial/audio sync.
