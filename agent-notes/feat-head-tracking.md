# feat/head-tracking

## Goal
Head-tracked spatial audio: on a device with an orientation sensor, the player can
turn on head tracking; turning the device rotates the whole sound scene so sounds
stay fixed in the world. Server facing = body; device yaw = local head offset on top.
Requested by Q on 2026-10-18 (via team lead). Worktree:
`C:\Users\Q\code\react-client-head-tracking`, branch `feat/head-tracking` off origin/master.
Do not push or open a PR.

## State
- CURRENT (2026-10-18): Codex round 5 APPROVED the branch at 9549c61e (no P2 or worse);
  its one P3 (prove a pending pause timer is cancelled by recenter) is fixed in the
  commit after it, with two tests that fail when the cancel in HeadTracker.recenter is
  removed (checked by mutation). Waiting on the team lead's browser check, then PR.
- Files as they stand:
  - `src/audio/headYaw.ts` - devicePose (quaternion from alpha/beta/gamma + screen
    angle), yawFrom -> { yaw, conditioning } (twist from the reference pose), wrap, One
    Euro HeadingFilter, turnAboutUp.
  - `src/audio/HeadTracker.ts` - deviceorientation -> relative head yaw; 60 Hz output
    frame; settles when readings stop; hold/pause near the flipped-over pose
    (ILL_ENTER 0.5 / ILL_LEAVE 0.61, pause after 2 s, resume within 20 degrees);
    recenter always wins; screen-angle changes recomputed; hasAllAngles.
  - `src/audio/headTracking.ts` - controller singleton + `useHeadTrackingStore`: bounded
    sensor probe + Check again, iOS permission, follows `sound.headTracking` pref,
    announcements, Alt+Shift+O, pause/resume status.
  - `src/audio/FoaYawRotator.ts` - our rampable FOA yaw rotator ahead of Omnitone.
  - `MediaService.setHeadYaw` + `setHeadTracking` (listener tau 0.03 while on, exact
    restore when off) + body pose in `setListenerOrientation`.
  - `src/components/HeadTrackingControls.tsx` in the Sounds preferences tab;
    `src/hooks/useHeadTracking.ts` called once from App.tsx.
- History of the first build (the items below are kept as a record; the design has
  changed since - see Decisions):
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
- Codex round 2 (at c52b659b): round-1 fixes confirmed; new findings fixed (uncommitted
  until the next commit): 1. closed-cycle drift -> reference-relative twist yaw (above).
  2. probe retry: sensor 'none' shows "No motion sensor found." + "Check again"
  (checkSensorAgain: announced bounded probe, state 'checking'; focus moves to the
  checkbox if a sensor turns up). Desktops now show that small section. Test gaps:
  FoaYawRotator vs real Omnitone FOARotator by tracing both recorded graphs; ramp-then-
  step cancel test; Media restore tests split (tau 0 snaps; nonzero tau put back).
- Round 2 verification: tsc exit 0; vitest 180 files / 2434 tests; biome on 14 changed
  files: 0 errors, 0 warnings. Chromium CDP run: closed cycle (alpha 15, gamma 20, beta
  0 -> 85 -> 0, three times) start -44.998, ends -45.009 / -45.009 / -45.010 (no
  accumulation; the 0.011 start/end gap is unexplained, possibly sensor angle conversion
  or unsettled start). Turn/recenter/wrap/off values as round 1. Rotator offline check
  unchanged (max diff 0).
- Codex round 3 (at 38229dd4): round-2 fixes confirmed. Team lead decided to KEEP the
  twist method; fixed in the next commit:
  1. Claim narrowed: a turn about an earth-horizontal axis adds no yaw; a roll while
     tipped couples into yaw (documented test: tipped 30, rolled 30 -> -15.26, or
     -8.21 recentered upright). Help text line added.
  2. Ill-conditioned region with hysteresis, HeadTracker ILL_ENTER 0.5 / ILL_LEAVE 0.61
     (conditioning = cos(swing/2)). First tried the suggested 0.15 / 0.25: the Chromium
     run showed a flip of a phone recentered with a 20 degree roll swinging the scene to
     131 degrees at conditioning ~0.26 (twist coupling grows like tan(swing/2)), so the
     thresholds moved to a 120 degree tilt in / ~105 out. Held readings keep the last
     yaw; 2 s inside, or leaving more than 20 degrees from the held yaw, pauses
     (announced once); resumes when back within 20 degrees or on recenter (recenter and
     stop end a pause without a "resumed" announcement).
  3. hasAllAngles shared by discovery and tracking; partial-reading tests.
  Test renames: FoaYawRotator call-order test, Media requested-values test.
- Round 3 verification: tsc exit 0; vitest 180 files / 2450 tests; biome on changed
  files clean. Chromium run (server facing 37.48): +30 -> 67.47; recenter 37.48; -45
  across wrap -7.51; cycles -7.53 x3; flip of rolled phone held at 37.48 with status
  "Paused..."; back near start 42.47 and "Tracking"; off 37.48.
- Codex round 4 (at 49ea6775): round-3 fixes confirmed. Fixed in the next commit:
  recenter always wins (HeadTracker.recenter returns false when the latest reading has no
  complete pose; the hold and pause end at once and the next complete reading is
  straight ahead at 0, bypassing the 20 degree gate; the controller then says
  "Recentering on the next reading."); pause text, spoken and visible, is now "Head
  tracking paused. Recenter to resume, or turn back to where you were facing." (recovery
  is within 20 degrees of where the player was facing, not of the start); this note's
  design section corrected; the "resumes smoothly" test renamed.

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
- Yaw (third design, after review round 2): `devicePose` turns alpha/beta/gamma
  (W3C Z-X'-Y'') plus the screen angle into a quaternion; `yawFrom(reference, pose)` is
  the twist about the earth's up axis of pose x reference^-1 (swing-twist). The
  reference is the pose at the first reading / recenter. Pure function of pose +
  reference: same pose, same yaw, whatever path (the round-2 bug was path state).
  What it ignores, exactly: a turn about an EARTH-HORIZONTAL axis (nodding or rolling
  while level) adds no yaw, however the device is held or mounted. What it does not: a
  roll about an axis that is not horizontal (rolling sideways while tipped forward)
  couples partly into yaw - tipped 30 and rolled 30 reads -15.26 (recentered tipped) or
  -8.21 (recentered upright); pinned by a documented-behaviour test, kept by the team
  lead's decision (a fixed facing axis brings back rounds 1-2's singularities and
  switching), and stated in the preference help.
  yawFrom returns { yaw, conditioning }; conditioning = cos(swing / 2), 0 when the device
  is flipped over from the reference (yaw undefined there). HeadTracker holds readings
  below conditioning 0.5 until above 0.61 (see ILL_ENTER), pauses after 2 s held or on
  leaving more than 20 degrees from the held yaw, and resumes within 20 degrees or on
  recenter. Recenter always wins: with no complete latest reading it clears the hold and
  pause and the next complete reading becomes straight ahead at 0.
  History: v1 summed screen-up + back (roll leaked into yaw, 27 deg for 30 deg roll).
  v2 picked one axis with hysteresis and carried an offset across switches; the offset
  depended on the switch pose, so closed pitch cycles accumulated -25.78 deg each.
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
- Team lead's browser check, then PR (team lead's call; this agent does not push).
- Still unverified and worth doing on a phone with headphones: feel (jitter, lag incl.
  the 0.03 s glide), audible zipper on HRTF sources, whether real sensor noise near the
  0.5 / 0.61 thresholds pauses too readily, iOS permission, FOA beds in the live app, and
  the Check again path in a real browser.
