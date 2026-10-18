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
- Settling fix (second commit): HeadTracker re-feeds the last heading every 1/60 s
  until the filter settles, because readings stop when the device holds still.
- tsc clean; full vitest 179 files / 2406 tests passed; biome: no new findings
  (3 App.tsx warnings exist on master).
- Browser check done (Chromium 147 via Playwright `channel: 'chromium'`, CDP
  `Emulation.setSensorOverrideReadings` type `relative-orientation`, which drives real
  deviceorientation events). Script: scratchpad `head-tracking-check.mjs` (not committed).
  Observed: sensor detected; with a server facing of 37.48 deg, turning +30 gave the
  AudioListener (raw forwardX/Z AudioParams) 67.46 deg; Alt+Shift+O back to 37.48;
  -45 across the alpha wrap gave -7.47; turning off restored exactly 37.48 and later
  readings did nothing.
- Not exercised in a browser: FOA/positional FOA renderers (no such sounds playing as
  guest; unit-tested), iOS permission, screen.orientation changes, real sensor noise,
  audible result.

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

- Playwright's default headless shell sends only null deviceorientation readings, even
  with overrides; full Chromium (`channel: 'chromium'`) with the sensor override set
  before navigation works. The legacy `DeviceOrientation.setDeviceOrientationOverride`
  also gave nulls.
- Chromium dispatches deviceorientation only when the reading changes, which is what
  exposed the settling defect.
- Editing a module under a running Vite server gives a dynamic `import('/src/...')`
  from the page a separate module instance (HMR timestamp), so its store reads stale.
- Merge note: feat/voice-commands (7062014b) uses Alt+Shift+D and adds to the same
  spots in src/reservedShortcuts.ts (chord + matcher above DIGITS, entry after keys
  mode) and the KeyboardTab list in src/components/preferences.tsx. Both sides only add
  lines; resolve by keeping both.

## Next step
- Team lead / Q: review; on a phone with headphones, check feel (jitter, lag, any
  zipper noise from 60 Hz listener writes) and iOS permission flow. Not pushed, no PR.
