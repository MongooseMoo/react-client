# Cleanup Refactor Fixed-Point Log - 2026-06-07

Target architecture:
- `src/audio/MediaService.ts` owns Cacophony, sound lifecycle, effects, Media Session, listener sync, mute, and volume.
- GMCP `Client.Media`, GMCP `Client.Spatial`, IRE `Sound`, toolbar, and LiveKit audio are adapters/callers of `client.media`.

Forbidden surfaces:
- Production callers reaching through `client.cacophony`.
- IRE sound reaching sideways through `client.gmcpHandlers["Client.Media"]`.
- Client-level media lifecycle state split across `MudClient` fields.

Search gates:
- `rg -n 'client\.cacophony|gmcpHandlers\[''Client\.Media''\]|gmcpHandlers\["Client\.Media"\]' -S src --glob '!**/*.test.ts' --glob '!**/*.test.tsx'`

Runtime gates:
- `npm run typecheck`
- `npm test -- --run src/client.test.ts src/gmcp/Client/Media.test.ts src/gmcp/Client/Spatial.test.ts src/gmcp/IRE/Sound.test.ts`

## Iteration 1 - `media owner`

Slice read:
- `src/client.ts`
- `src/gmcp/Client/Media.ts`
- `src/gmcp/Client/Spatial.ts`
- `src/gmcp/IRE/Sound.ts`
- `src/components/toolbar.tsx`
- `src/components/audioChat.tsx`
- `src/audio/*`

Surfaces:
- `MudClient.cacophony`
  - Disposition: move
  - Owner after cleanup: `MediaService`
  - Action: `MudClient` now constructs `MediaService`; toolbar, spatial, LiveKit, and stop-all call `client.media`.
  - Evidence: construction, volume, mute, listener vectors, and playback all belong to one audio owner.
- `GMCPClientMedia` playback/effects internals
  - Disposition: move
  - Owner after cleanup: `MediaService`
  - Action: playback, update, stop, effect chains, automation, ambisonic rendering, and Media Session state moved to `src/audio/MediaService.ts`.
  - Evidence: IRE.Sound and Client.Media both need the same media operations.
- `GmcPIRESound.mediaHandler`
  - Disposition: delete
  - Owner after cleanup: `MediaService`
  - Action: `IRE.Sound` translates directly to `client.media.load/play/stop`.
  - Evidence: sideways dependency through GMCP handler map is protocol coupling, not media ownership.

Gate results:
- Pass: `rg -n 'client\.cacophony|gmcpHandlers\[''Client\.Media''\]|gmcpHandlers\["Client\.Media"\]' -S src --glob '!**/*.test.ts' --glob '!**/*.test.tsx'`
- Pass: `npm test -- --run src/client.test.ts src/gmcp/Client/Media.test.ts src/gmcp/Client/Spatial.test.ts src/gmcp/IRE/Sound.test.ts`
- Pass: `git diff --check`
- Pass: `npx biome lint src/audio/MediaService.ts src/gmcp/Client/Media.ts src/gmcp/IRE/Sound.ts src/gmcp/IRE/Sound.test.ts`
- Blocked by unrelated dirty file: `npm run typecheck` fails in `src/gmcp/Client/FileTransfer.ts:71` and `src/gmcp/Client/FileTransfer.ts:79`.

Commit:
- Not committed.

Next slice:
- Decide whether to make `client.media.cacophony` private by adding narrower methods for LiveKit and future overlay wiring.
