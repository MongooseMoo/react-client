import { describe, expect, it } from 'vitest';
import { outputDelaySeconds } from './outputClock';

describe('observed render and output clock comparison', () => {
  it('projects an aged output timestamp to the observation instant', () => {
    expect(
      outputDelaySeconds({
        running: true,
        currentTime: 10,
        performanceNowMs: 10000,
        outputTimestamp: { contextTime: 9.55, performanceTime: 9900 },
      }),
    ).toBeCloseTo(0.35);
  });
  it('uses zero measured delay when the output timestamp is unavailable or stale', () => {
    const snapshot = { running: true, currentTime: 10, performanceNowMs: 10000 };
    expect(outputDelaySeconds(snapshot)).toBe(0);
    expect(
      outputDelaySeconds({
        ...snapshot,
        outputTimestamp: { contextTime: 5, performanceTime: 5000 },
      }),
    ).toBe(0);
  });
});
