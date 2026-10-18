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
- Codex review (team lead, at ec287fb2) round 1 - all six fixed in one commit after
  ec287fb2:
  1. roll -> yaw: FacingHeading (one axis per pose, hysteresis, offset across switches).
  2. recenter drift: recenter snaps the filter to the latest raw heading.
  3. clicks: FoaYawRotator (ours, rampable) ahead of Omnitone; MediaService.setHeadTracking
     sets listener tau 0.03 while on, restores the previous tau + exact body pose when off.
  4. late screen rotation: raw angles kept; screen.orientation 'change' and
     'orientationchange' recompute; listeners removed on stop.
  5. pacing: one 60 Hz output frame loop (first reading / recenter / stop immediate).
  6. probe: bounded to 3 s; none on permission browsers; stopped on refusal and disable.
- Round 1 verification: tsc exit 0; vitest 180 files / 2427 tests; biome on the 12
  changed files: 0 errors, 10 warnings, all pre-existing `as any` in
  AmbisonicRenderer.test.ts (master has the same 10).
  OfflineAudioContext in Chromium (scratchpad rotator-check.mjs): FoaYawRotator vs
  Omnitone FOARotator, 4 distinct channels, yaw 0 / 0.7 / -1.9 / pi: max sample diff 0.
  90 degree turn on a constant Y input: stepped max sample step 1.0, smoothed 0.00069.
  CDP run (AUTOPLAY=1, context running): raw AudioListener yaw +29.99 after a 30
  degree turn, 0 after Alt+Shift+O, -44.99 after 45 left across the wrap, 0 after off;
  listener tau 0.03 while on, 0 after.

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
- Heading from DeviceOrientation (revised after review): full Z-X'-Y'' rotation; the
  heading is the azimuth of ONE device axis - the back when upright (back horizontal
  length > 0.6), screen-up when flat (< 0.4), hysteresis between. Roll about the axis in
  use cannot move it. The axes are perpendicular, so the one in use is never near
  vertical (no singularity). An offset carries the heading across an axis switch so the
  output never jumps. The first version summed screen-up + back, which turned
  sideways roll into yaw (27 degrees for a 30 degree roll).
- The original tests only exercised poses and event orders I thought of (pitch with no
  roll, screen angle changing before readings, recenter after settling); the review
  cases were outside them. Tests now cover pure roll, recenter mid-glide, a screen change
  after the last reading, and 120 Hz input.
- Output pacing: readings feed the filter on arrival; a 60 Hz frame sends at most one yaw
  (first reading, recenter and stop are immediate). Once settled the frame sends any
  change, so the yaw lands exactly instead of within the 0.05 degree gate.
- De-zipper: FOA beds turn in our own FoaYawRotator (four GainNodes, ramped with
  SPATIAL_PARAM_TAU_S = 0.03 s while tracking) ahead of Omnitone, whose matrix stays
  identity - Omnitone writes gain.value. Listener tau = the same 0.03 s while tracking so
  HRTF, FOA beds and positional FOA (already 0.03) glide alike.
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
- With listener smoothing on, AudioListener params move only while the AudioContext
  runs. A browser check must keep the context running: launch with
  `--autoplay-policy=no-user-gesture-required`, and do not press Escape (it pauses
  client sounds, which suspends the context).
- Listener smoothing in cacophony is one tau for all listener pose setters, so listener
  POSITION also glides (0.03 s) while head tracking is on. Accepted; documented in
  MediaService.setHeadTracking.
- Merge note: feat/voice-commands (7062014b) uses Alt+Shift+D and adds to the same
  spots in src/reservedShortcuts.ts (chord + matcher above DIGITS, entry after keys
  mode) and the KeyboardTab list in src/components/preferences.tsx. Both sides only add
  lines; resolve by keeping both.

## Next step
- Fresh Codex review of the round 1 commit (team lead). Then on a phone with headphones:
  feel (jitter, lag incl. the 0.03 s glide), any audible zipper on HRTF sources, iOS
  permission flow. Not pushed, no PR.
