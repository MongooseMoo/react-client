You are worker: react-client WASM host, worker streams, multi-user, and file transfer cleanup.

Parallel swarm warning: other agents may be editing unrelated leak families. Do not modify files outside the owned paths below. No oneliners.

Task:
Fix lifecycle leaks around Web Worker listeners, worker termination, global worker references, multi-user manager listeners, and file-transfer event listeners.

Owned paths:
- src/components/WasmHost.tsx
- src/WorkerStream.ts
- src/MultiUserManager.ts
- src/FileTransferManager.ts
- direct tests for those lifecycle surfaces

Evidence to gather:
- Current anonymous worker message listener registrations.
- Current autosave interval cleanup.
- Current PeerService and MultiUserManager destroy behavior.
- Current FileTransferManager listener registration and cleanup behavior.

Required outcome:
- WorkerStream and MultiUserManager expose deterministic disposal for their worker listeners.
- WasmHost cleanup clears autosave, disposes streams/managers/services, terminates the worker, and clears owned globals.
- FileTransferManager cleanup unsubscribes the event listeners it registered.

Report:
- Files changed.
- Exact tests or type checks run.
- Any runtime path not verified.
