# Issue 138 — MCMP start..finish segment looping

## Findings
- MediaService.play: start seeks, finish arms one-shot timer (finish-start), loops -> sound.loop(N-1) over whole file.
- Cacophony 0.31 has region-backed Sounds via `createSprite(buffer|url, {k:{start,duration,loopCount}})`.
  Playback sets source.loopStart/loopEnd to the region; seek() is region-relative; region sound ends naturally after its loops.
- createSprite throws if region exceeds buffer duration -> clamp finish to buffer duration.
- html (music) sounds can't use regions.
- Stop timer isn't tracked per sound: replay adds a second timer.
- Update payload lacks finish; `end` treated as local stop delay (documented as deprecated compat alias in docs/GMCP/packages/client-media.md).
- Tests: src/gmcp/Client/Media.test.ts (mock cacophony with createSound; lines ~569-600 cover finish/end).

## Plan
- Buffer sound + finish>start: build region Sound via createSprite(buffer) -> native segment loop, no stop timer.
- Track stop timer on sound; clear on replay/release.
- Seek converts absolute ms to region-relative.

## Progress (branch fix/mcmp-segment-loops)
- Implemented in MediaService: requestedSegment (end = finish alias), segmentSound via createSprite region,
  seekToPosition (region-relative), timer-based repeat for region-less sounds (scheduleSegmentTimer, cleared on release,
  armed only when playback starts), Update finish -> resegment via replay of stored playPayload.
- Next: typecheck, update tests (end test semantics changed), add region tests, docs.
- Tests added in Media.test.ts ("MCMP start..finish segments"); loops -1 now passes 'infinite' (Infinity = gappy onended restart).
- User asked to bump cacophony to 0.33 (just published; polling npm in background task blshfjtb1). Then recheck sprite API + rerun tests.
- Still TODO: docs/GMCP/packages/client-media.md, Media.ts Update finish field, PR.
