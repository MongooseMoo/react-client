# MCP/GMCP Typed I/O Registry Workstream

## Target Architecture

Protocol packages declare their wire I/O in a typed message registry on the class.
The registry is the single source of truth for:

- protocol message name;
- direction: inbound, outbound, or duplex;
- payload codec/envelope;
- generated outbound command methods such as `sendOffer`;
- package-local typed events for inbound messages.

The package class remains the visible owner. The session remains protocol
mechanics. App wiring stays in the composition root.

```ts
class GMCPClientFileTransfer extends GMCPPackage.with({
  packageName: "Client.FileTransfer",
  messages: [
    inbound(FileTransferOffer),
    inbound(FileTransferAccept),
    duplex(FileTransferCancel),
    outbound(FileTransferRequestResend),
  ],
}) {}

fileTransfer.on("offer", (offer) => {
  fileTransferManager.handleOffer(offer);
});

fileTransfer.sendRequestResend({ sender, hash });
```

For MCP:

```ts
class McpSimpleEdit extends MCPPackage.with({
  packageName: "dns-org-mud-moo-simpleedit",
  messages: [
    inbound(simpleEditContent).asEvent("openSession"),
    outbound(simpleEditSet),
  ],
}) {}

simpleEdit.on("openSession", (session) => {
  editors.openEditorWindow(session);
});

simpleEdit.sendSet(session);
```

## Hard Rules

- Do not add `EditorSessionSaver`, `McpPackageSender`, generic protocol emitters,
  sender bags, compatibility interfaces, or other wrappers.
- Do not make `McpSimpleEdit` special. It stays in `DEFAULT_MCP_PACKAGES`.
- Do not make MCP/GMCP sessions app event buses.
- Do not put global app `emit` or app callbacks into package context.
- Do not preserve old and new paths in parallel after a slice completes.
- When a slice says deletion-first, delete the old surface before repairing
  callers.

## Ownership Boundaries

`McpSession` / `GmcpSession` own:

- connection to the lower protocol framing layer;
- registry of package instances;
- package lookup by constructor/name;
- inbound dispatch to package message registries;
- outbound wire framing.

`MCPPackage` / `GMCPPackage` own:

- package identity;
- class-level typed message registry;
- package-local typed event emitter derived from inbound/duplex registry entries;
- generated outbound methods derived from outbound/duplex registry entries.

Concrete packages own:

- message envelope values used by their registry;
- any genuinely semantic methods that are not just generated wire commands;
- package-specific policy only when that policy is protocol translation.

Composition root owns:

- wiring package events to application services/stores/components;
- passing concrete package instances to consumers that need outbound commands;
- default package registration.

## Message Envelopes

An envelope is a value-level protocol message definition. It is not the payload
interface alone.

GMCP JSON message envelope:

```ts
const FileTransferOffer = gmcpJsonMessage("Offer", fileTransferOfferCodec);
```

The envelope carries:

- wire suffix: `Offer`;
- runtime codec;
- TypeScript payload type from the codec;
- default event name: `offer`;
- default outbound method name: `sendOffer`.

MCP multiline message envelope:

```ts
const simpleEditContent = mcpMultilineMessage("content", {
  header: editorSessionHeader,
  bodyKey: "content",
  toDomain: ({ header, lines }): EditorSession => ({
    ...header,
    contents: lines,
  }),
});
```

MCP envelopes carry more mechanics:

- wire suffix;
- key/value header codec;
- multiline body key;
- multiline domain conversion;
- outbound key/value and line encoders where applicable.

Direction is not part of the payload envelope. Direction is assigned in the
package registry:

```ts
messages: [
  inbound(simpleEditContent).asEvent("openSession"),
  outbound(simpleEditSet),
]
```

## Type Strategy

Use class factories/mixins rather than codegen.

Reason: runtime codegen can add `sendOffer`, but source typing only stays
natural if the class extends a generic constructor derived from the registry
value in the same source file.

Required type behavior:

- inbound `Offer` produces `on("offer", listener: (payload: OfferPayload) => void)`;
- outbound `Offer` produces `sendOffer(payload: OfferPayload): void`;
- duplex `Cancel` produces both `on("cancel", ...)` and `sendCancel(...)`;
- MCP override `asEvent("openSession")` changes only the event name, not the
  payload type.

Collision handling must be explicit:

- duplicate wire names fail package construction;
- duplicate generated event names fail package construction;
- duplicate generated send method names fail package construction;
- generated method cannot silently overwrite a concrete class method.

## Work Slices

### Slice 1: Registry Kernel, No Package Migration

Goal: add the typed registry machinery behind existing packages without changing
package behavior.

Create:

- `src/protocol/messages.ts` or protocol-local equivalents if the existing
  layout makes that cleaner;
- direction wrappers: `inbound`, `outbound`, `duplex`;
- name derivation helpers: wire name to event name and send method name;
- typed package-local emitter base;
- `MCPPackage.with(...)` and/or `GMCPPackage.with(...)` factory for one protocol
  first.

Do not migrate production packages in this slice.

Search gates:

- no production package uses the new registry yet unless the slice explicitly
  migrates it;
- no `EditorSessionSaver`;
- no `McpPackageSender`.

Runtime gates:

- focused unit tests for name derivation, event typing/runtime dispatch, command
  method generation, and collision errors;
- `npm run typecheck`;
- Biome lint on touched files.

Commit when gates pass.

### Slice 2: MCP SimpleEdit Vertical Slice

Goal: prove MCP multiline inbound/outbound through the registry.

Actions:

- define top-level `simpleEditContent` and `simpleEditSet` envelopes;
- migrate `McpSimpleEdit` to `MCPPackage.with(...)`;
- keep `McpSimpleEdit` in `DEFAULT_MCP_PACKAGES`;
- add package lookup if needed so composition can obtain the default registered
  package instance;
- wire `simpleEdit.on("openSession", ...)` in the composition root;
- update `EditorManager` to take concrete `McpSimpleEdit` and call
  `sendSet(session)`;
- delete old `context.openEditorSession`, `context.sendMcp`, and
  `context.sendMcpMultiline` surfaces if this slice fully removes their MCP use.

Search gates:

- `rg -n "EditorSessionSaver|McpPackageSender|context\\.send|sendMcp|sendMcpMultiline|context\\.openEditorSession" src/mcp src/EditorManager.ts src/client.ts src/createConfiguredClient.ts`
  has zero production hits;
- `rg -n "McpSimpleEdit" src/mcp/packages/index.ts` still shows default
  registration;
- `rg -n "new EditorManager\\(this\\)|client\\.mcpSession\\.sendMultiline" src`
  has zero production hits.

Runtime gates:

- `npm test -- --run src/mcp.test.ts src/EditorManager.test.ts src/client.test.ts`;
- `npm run typecheck`;
- Biome lint on touched files.

Commit when gates pass.

### Slice 3: Remaining MCP Packages

Goal: remove remaining global app emit/context behavior from MCP.

Actions:

- migrate `McpAwnsStatus`, `McpAwnsGetSet`, and `McpVmooUserlist` to package
  registries and package-local typed events;
- wire their events in the composition root or current client owner;
- update outbound get/set commands to generated methods.

Search gates:

- zero production hits for `context.emit`, `context.send`, `sendMcp`,
  `sendMcpMultiline`, and `openEditorSession` under `src/mcp`;
- no session-wide typed app event bus introduced.

Runtime gates:

- MCP focused tests;
- client tests that cover emitted status/getset/userlist behavior;
- `npm run typecheck`;
- Biome lint on touched files.

Commit when gates pass.

### Slice 4: GMCP FileTransfer Vertical Slice

Goal: prove GMCP JSON registry on a package with meaningful inbound and outbound
I/O.

Actions:

- define GMCP JSON envelopes for `Client.FileTransfer` messages;
- migrate `GMCPClientFileTransfer` to `GMCPPackage.with(...)`;
- generated methods replace handwritten `sendOffer`, `sendCancel`,
  `sendRequestResend`, etc., unless a semantic wrapper is still genuinely more
  readable;
- replace package-local manual emitter boilerplate with registry-derived events;
- keep `FileTransferManager` depending on the concrete package instance.

Search gates:

- no `(handler as any)["handle" + ...]` path for migrated package;
- no duplicated file-transfer event emitter boilerplate in the package;
- no broad `MudClient` dependency added to replace removed behavior.

Runtime gates:

- `npm test -- --run src/gmcp/session.test.ts src/FileTransferManager.test.ts src/client.test.ts`;
- `npm run typecheck`;
- Biome lint on touched files.

Commit when gates pass.

### Slice 5: GMCP Session Dispatch Migration

Goal: make GMCP dispatch table-driven from message registries.

Actions:

- session dispatch consults package registry metadata first;
- fallback reflection dispatch is deleted once all registered GMCP packages in
  scope have registries;
- dynamic/legacy reflection is not preserved unless an explicit external
  compatibility constraint is named.

Search gates:

- zero production hits for `resolveGmcpMessageHandler` if fully replaced;
- zero production hits for `(handler as any)`;
- no `any`-based handler lookup introduced under another name.

Runtime gates:

- all GMCP focused tests;
- `npm test -- --run src/gmcp src/client.test.ts`;
- `npm run typecheck`;
- Biome lint on touched files.

Commit when gates pass.

### Slice 6: Broad Protocol Cleanup

Goal: converge both protocols on the same I/O contract.

Actions:

- eliminate remaining protocol package dependencies on `MudClient` unless they
  are explicitly outside the current workstream and documented;
- move app side effects to composition wiring;
- update protocol docs to describe registry-based I/O.

Search gates:

- no global app `emit` in protocol packages;
- no broad client context in protocol packages where package-local I/O suffices;
- no duplicate default registration path.

Runtime gates:

- `npm test -- --run src`;
- `npm run typecheck`;
- Biome lint on touched files;
- `git diff --check`.

Commit when gates pass.

## Definition Of Done

The workstream is complete only when:

- MCP and GMCP package I/O use class-local typed registries;
- inbound messages produce package-local typed events by default;
- outbound/duplex messages produce typed `sendX` methods by default;
- event and method names are derived from message names unless explicitly
  overridden for a semantic reason;
- `McpSimpleEdit` remains a default MCP package;
- sessions are not app event buses;
- package contexts do not smuggle app powers or send helpers;
- old reflection/stringly dispatch is gone for the migrated protocol surface;
- all listed search gates are zero-hit or documented as intentionally deferred;
- runtime gates pass;
- each completed slice has its own commit.

## Anti-Loopholes

- A new interface that only hides the old dependency is a shim and is forbidden.
- A sender object is a renamed context send helper and is forbidden.
- A session-level typed event bus is a centralized app event bus and is
  forbidden for package outputs.
- Moving `McpSimpleEdit` out of default registration is special-casing and is
  forbidden.
- Green tests do not complete a slice while forbidden search gates still hit.
- Do not continue to the next slice before committing the current verified
  slice.
