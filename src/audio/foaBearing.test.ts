import { describe, expect, it } from 'vitest';

import { sourceBearing } from './foaBearing';

const DEG = Math.PI / 180;
const FORWARD_NORTH = [0, 0, -1]; // default Web Audio listener forward (faces -z)
const ORIGIN = [0, 0, 0];

describe('sourceBearing', () => {
  it('puts a source straight ahead at azimuth 0', () => {
    const b = sourceBearing(ORIGIN, FORWARD_NORTH, [0, 0, -5]);
    expect(b.azimuth).toBeCloseTo(0, 9);
    expect(b.elevation).toBeCloseTo(0, 9);
  });

  it('puts a source to world +x (right of a -z-facing listener) at azimuth -90° (right)', () => {
    // +az = left, so a source on the right is negative.
    const b = sourceBearing(ORIGIN, FORWARD_NORTH, [5, 0, 0]);
    expect(b.azimuth).toBeCloseTo(-90 * DEG, 9);
    expect(b.elevation).toBeCloseTo(0, 9);
  });

  it('puts a source to world -x (left) at azimuth +90° (left)', () => {
    const b = sourceBearing(ORIGIN, FORWARD_NORTH, [-5, 0, 0]);
    expect(b.azimuth).toBeCloseTo(90 * DEG, 9);
  });

  it('puts a source directly behind at azimuth ±180°', () => {
    const b = sourceBearing(ORIGIN, FORWARD_NORTH, [0, 0, 5]);
    expect(Math.abs(b.azimuth)).toBeCloseTo(Math.PI, 9);
  });

  it('reads elevation from world +y, ignoring heading', () => {
    const up = sourceBearing(ORIGIN, FORWARD_NORTH, [0, 5, 0]);
    expect(up.elevation).toBeCloseTo(90 * DEG, 9);
    const down = sourceBearing(ORIGIN, FORWARD_NORTH, [0, -5, 0]);
    expect(down.elevation).toBeCloseTo(-90 * DEG, 9);
    // 45° up-and-ahead
    const diag = sourceBearing(ORIGIN, FORWARD_NORTH, [0, 5, -5]);
    expect(diag.elevation).toBeCloseTo(45 * DEG, 9);
  });

  it('rotates the bearing with the listener heading (turning toward a source brings it to front)', () => {
    // Source to world +x. Facing -z it is on the right (az -90°).
    // Turn to face +x (forward = (1,0,0)) and the same source is now dead ahead.
    const facingEast = [1, 0, 0];
    const b = sourceBearing(ORIGIN, facingEast, [5, 0, 0]);
    expect(b.azimuth).toBeCloseTo(0, 9);
  });

  it('walking past a source flips it from front to behind', () => {
    // Source at world +x=0, -z=-5 (north). Listener facing north.
    const ahead = sourceBearing([0, 0, 0], FORWARD_NORTH, [0, 0, -5]);
    expect(ahead.azimuth).toBeCloseTo(0, 9);
    // Walk north past it (now listener north of the source): source is behind.
    const behind = sourceBearing([0, 0, -10], FORWARD_NORTH, [0, 0, -5]);
    expect(Math.abs(behind.azimuth)).toBeCloseTo(Math.PI, 9);
  });

  it('moving sideways relative to a forward source swings its azimuth', () => {
    // Source ahead-north; step to world +x (east). Source now ahead-and-left.
    const b = sourceBearing([5, 0, 0], FORWARD_NORTH, [0, 0, -5]);
    expect(b.azimuth).toBeGreaterThan(0); // left
    expect(b.azimuth).toBeLessThan(Math.PI / 2);
  });

  it('returns front for missing or co-located inputs', () => {
    expect(sourceBearing(undefined, FORWARD_NORTH, [1, 2, 3])).toEqual({ azimuth: 0, elevation: 0 });
    expect(sourceBearing(ORIGIN, FORWARD_NORTH, null)).toEqual({ azimuth: 0, elevation: 0 });
    expect(sourceBearing([1, 2], FORWARD_NORTH, [1, 2, 3])).toEqual({ azimuth: 0, elevation: 0 });
    expect(sourceBearing(ORIGIN, FORWARD_NORTH, ORIGIN)).toEqual({ azimuth: 0, elevation: 0 });
  });

  it('defaults heading to facing -z when the forward vector is missing', () => {
    const b = sourceBearing(ORIGIN, null, [5, 0, 0]);
    expect(b.azimuth).toBeCloseTo(-90 * DEG, 9);
  });
});
