# feat/head-tracking

## Goal
Head-tracked spatial audio: on a device with an orientation sensor, the player can
turn on head tracking; turning the device rotates the whole sound scene so sounds
stay fixed in the world. Server facing = body; device yaw = local head offset on top.
Requested by Q on 2026-10-18 (via team lead). Worktree:
`C:\Users\Q\code\react-client-head-tracking`, branch `feat/head-tracking` off origin/master.
Do not push or open a PR.

## State
- Implemented and unit-tested:
  - `src/audio/headYaw.ts` - heading from alpha/beta/gamma + screen angle, wrap, One Euro
    filter, `turnAboutUp`.
  - `src/audio/HeadTracker.ts` - deviceorientation -> relative head yaw, recenter,
    0.05 degree step gate, zero yaw on stop.
  - `src/audio/headTracking.ts` - controller singleton + `useHeadTrackingStore`: sensor
    probe, iOS permission, follows `sound.headTracking` pref, announcements, Alt+Shift+O.
  - `MediaService.setHeadYaw` + body pose in `setListenerOrientation`.
  - `src/components/HeadTrackingControls.tsx` in the Sounds preferences tab;
    `src/hooks/useHeadTracking.ts` called once from App.tsx.
- tsc clean; full vitest 179 files / 2404 tests passed; biome: no new findings
  (3 App.tsx warnings exist on master).
- Browser (Playwright, synthetic events) check: see below once run.

## Decisions and why
- Seam: `MediaService.setListenerOrientation` keeps the server's forward/up as the
  body pose; a new `setHeadYaw(yaw)` composes body forward turned about body up by the
  head yaw, and writes the result to `cacophony.listenerForwardOrientation`. Every
  consumer already reads the cacophony listener: HRTF panners and LiveKit voices (they
  are cacophony panners in the shared AudioListener), FOA beds
  (`currentListenerYaw()` -> `setRotationMatrixFromYaw`), positional FOA
  (`updatePositionalSpatial` reads cacophony forward). So one seam covers all three.
- With head yaw 0, writes are exactly what the old code wrote (only the given fields),
  so turning tracking off restores server-driven behaviour.
- Heading from DeviceOrientation: full Z-X'-Y'' rotation matrix; heading of
  (screen-up + device-back) projected to horizontal. Works flat and upright; screen
  angle compensates by rotating the screen-up vector in device coordinates.
- Relative (`deviceorientation`, gyro-fused) not `deviceorientationabsolute` (magnetometer
  noise); recenter makes the zero.
- Smoothing: One Euro filter on unwrapped heading (low cutoff at rest kills jitter,
  rises with speed so fast turns have little lag).
- Recenter shortcut: Alt+Shift+O (free in reservedShortcuts; told voice-commands agent).

## Surprises
- `SpatialOverlayController` is not instantiated in production; its world yaw is not wired.
- cacophony `listenerSmoothingTau` is 0 in this app: listener writes are immediate.

- tsconfig excludes test files, so tsc does not check tests.
- The readout needed a trailing timer: once the head settles, the step gate stops
  yaw callbacks, so a purely throttled readout stuck at a stale value.

## Next step
- Playwright check in Chromium with synthetic deviceorientation events (dev server
  `npx vite --port 5202`), confirm the AudioListener forward changes.
