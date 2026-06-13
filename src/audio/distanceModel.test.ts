import { describe, expect, it } from 'vitest';

import { distanceBetween, inverseDistanceGain, SPATIAL_DISTANCE_MODEL } from './distanceModel';

describe('inverseDistanceGain', () => {
  it('is full volume at or inside the reference distance', () => {
    expect(inverseDistanceGain(0)).toBe(1);
    expect(inverseDistanceGain(SPATIAL_DISTANCE_MODEL.refDistance)).toBe(1);
    expect(inverseDistanceGain(SPATIAL_DISTANCE_MODEL.refDistance - 0.5)).toBe(1);
  });

  it('matches the Web Audio inverse model beyond the reference distance', () => {
    // refDistance 4, rolloff 0.5 → 4 / (4 + 0.5 * (58 - 4)) = 4 / 31 ≈ 0.129 (~ -18 dB),
    // the value the panner-tuning commit cites for a ~58 m source.
    expect(inverseDistanceGain(58)).toBeCloseTo(4 / 31, 6);
    expect(inverseDistanceGain(8)).toBeCloseTo(4 / 6, 6);
  });

  it('falls off monotonically with distance', () => {
    const a = inverseDistanceGain(10);
    const b = inverseDistanceGain(40);
    const c = inverseDistanceGain(120);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(c).toBeGreaterThan(0);
  });

  it('clamps distance at maxDistance so far sources settle to a floor', () => {
    const atMax = inverseDistanceGain(SPATIAL_DISTANCE_MODEL.maxDistance);
    expect(inverseDistanceGain(SPATIAL_DISTANCE_MODEL.maxDistance + 500)).toBeCloseTo(atMax, 9);
    expect(inverseDistanceGain(99999)).toBeCloseTo(atMax, 9);
  });

  it('treats non-finite distance as full volume', () => {
    expect(inverseDistanceGain(NaN)).toBe(1);
    expect(inverseDistanceGain(Infinity)).toBe(1);
  });

  it('honours a custom model', () => {
    const model = { refDistance: 1, rolloffFactor: 1, maxDistance: 10000 };
    expect(inverseDistanceGain(2, model)).toBeCloseTo(1 / 2, 6);
    expect(inverseDistanceGain(10, model)).toBeCloseTo(1 / 10, 6);
  });
});

describe('distanceBetween', () => {
  it('computes Euclidean distance', () => {
    expect(distanceBetween([0, 0, 0], [3, 4, 0])).toBeCloseTo(5, 9);
    expect(distanceBetween([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(distanceBetween([-5, -5, 0], [-88, -29, 0])).toBeCloseTo(
      Math.sqrt(83 * 83 + 24 * 24),
      6,
    );
  });

  it('returns 0 for missing or short vectors', () => {
    expect(distanceBetween(undefined, [1, 2, 3])).toBe(0);
    expect(distanceBetween([1, 2, 3], null)).toBe(0);
    expect(distanceBetween([1, 2], [1, 2, 3])).toBe(0);
  });
});
