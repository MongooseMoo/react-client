import { describe, expect, it } from 'vitest';
import {
  CLOCK_POLICY,
  ClockEstimator,
  clockCorrection,
  clockSample,
  serverToPerformanceMs,
} from './clock';
import { performanceToAudioTime } from './outputClock';

function exchange(c1Ms: number, offsetMs = 5000, delayMs = 40, clockId = 'runtime-a') {
  return {
    clockId,
    c1Ms,
    s2Ms: c1Ms + offsetMs + delayMs / 2,
    s3Ms: c1Ms + offsetMs + delayMs / 2 + 2,
    c4Ms: c1Ms + delayMs + 2,
  };
}

describe('shared clock estimation', () => {
  it('subtracts server processing from RTT and does not claim to remove path asymmetry', () => {
    expect(
      clockSample({ clockId: 'a', c1Ms: 1000, s2Ms: 6020, s3Ms: 6022, c4Ms: 1042 }),
    ).toMatchObject({ offsetMs: 5000, delayMs: 40 });
    expect(
      clockSample({ clockId: 'a', c1Ms: 1000, s2Ms: 6010, s3Ms: 6012, c4Ms: 1042 }),
    ).toMatchObject({ offsetMs: 4990, delayMs: 40 });
  });

  it('uses the median of the three lowest delays with their oldest actual receipt', () => {
    const estimator = new ClockEstimator();
    estimator.add(exchange(1000, 5000, 20));
    estimator.add(exchange(1200, 5002, 30));
    estimator.add(exchange(1400, 4999, 10));
    estimator.add(exchange(2000, 8000, 200));
    expect(estimator.estimate(2500)).toEqual({
      clockId: 'runtime-a',
      status: 'current',
      offsetMs: 5000,
      uncertaintyMs: 15,
      supportingSamples: 3,
      oldestSupportingMs: 1022,
      ageMs: 1478,
    });
    expect(serverToPerformanceMs(7500, estimator.estimate(2500))).toBe(2500);
    expect(estimator.estimate(32000).status).toBe('provisional');
    expect(serverToPerformanceMs(7500, estimator.estimate(32000))).toBeUndefined();
    expect(estimator.estimate(32203).status).toBe('stale');
  });

  it('does not refresh freshness with an unrelated high-delay reply', () => {
    const estimator = new ClockEstimator();
    for (const time of [0, 150, 300]) estimator.add(exchange(time, 5000, 10));
    estimator.add(exchange(29000, 9999, 1000));
    expect(estimator.estimate(30000).oldestSupportingMs).toBe(12);
    expect(estimator.estimate(30163).status).toBe('provisional');
  });

  it('bounds history and resets on runtime change, disconnect and client monotonic rewind', () => {
    const estimator = new ClockEstimator();
    for (let i = 0; i < CLOCK_POLICY.maximumSamples; i++) estimator.add(exchange(i * 150, 5000, 1));
    for (let i = 0; i < CLOCK_POLICY.maximumSamples; i++)
      estimator.add(exchange(5000 + i * 150, 6000, 30));
    expect(estimator.estimate(7500).offsetMs).toBe(6000);
    expect(estimator.add(exchange(8000, 9000, 10, 'runtime-b'))).toEqual({
      accepted: true,
      clockChanged: true,
    });
    expect(estimator.estimate(8100)).toMatchObject({
      clockId: 'runtime-b',
      status: 'provisional',
      supportingSamples: 1,
    });
    estimator.add(exchange(1, 9000, 10, 'runtime-b'));
    expect(estimator.estimate(100).supportingSamples).toBe(1);
    estimator.reset();
    expect(estimator.estimate(100).status).toBe('unavailable');
  });

  it('rejects invalid timing without replacing a valid clock', () => {
    const estimator = new ClockEstimator();
    estimator.add(exchange(100));
    for (const sample of [
      exchange(-1),
      exchange(100, 5000, 2001),
      { ...exchange(100), s3Ms: 1 },
      { ...exchange(100), s2Ms: Number.NaN },
      { ...exchange(100), s3Ms: 9000 },
    ])
      expect(estimator.add(sample).accepted).toBe(false);
    expect(estimator.estimate(200).clockId).toBe('runtime-a');
    expect(clockCorrection(100, 104.99)).toBe('ignore');
    expect(clockCorrection(100, 130)).toBe('unsubmitted');
    expect(clockCorrection(100, 130.01)).toBe('rejoin');
  });
});

describe('audio clock mapping', () => {
  it('uses measured output position and applies signed correction exactly once', () => {
    const snapshot = {
      running: true,
      currentTime: 12.2,
      performanceNowMs: 10000,
      outputTimestamp: { contextTime: 12, performanceTime: 10000 },
    };
    expect(performanceToAudioTime(10500, snapshot, 100)).toEqual({
      audioTime: 12.6,
      clock: 'output',
      acousticOffsetKnown: true,
    });
    expect(performanceToAudioTime(10500, snapshot, -100)?.audioTime).toBe(12.4);
  });

  it('uses paired render time when output time is absent, zero or stale, with unknown acoustic offset', () => {
    for (const outputTimestamp of [
      undefined,
      { contextTime: 0, performanceTime: 10000 },
      { contextTime: 12, performanceTime: 8999 },
    ]) {
      expect(
        performanceToAudioTime(10500, {
          running: true,
          currentTime: 12.2,
          performanceNowMs: 10000,
          outputTimestamp,
        }),
      ).toEqual({ audioTime: 12.7, clock: 'render', acousticOffsetKnown: false });
    }
    expect(
      performanceToAudioTime(10, { running: false, currentTime: 0, performanceNowMs: 0 }),
    ).toBeUndefined();
    expect(
      performanceToAudioTime(10, { running: true, currentTime: 0, performanceNowMs: 0 }, 501),
    ).toBeUndefined();
  });
});
