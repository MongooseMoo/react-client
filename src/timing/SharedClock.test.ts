import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedClock, type TimeRequest } from './SharedClock';

describe('leased connection clock', () => {
  let now: number;
  let sent: TimeRequest[];
  let clock: SharedClock;
  const advance = (ms: number) => {
    now += ms;
    vi.advanceTimersByTime(ms);
  };
  const respond = (offset = 5000, clockId = 'runtime-a') => {
    const request = sent.at(-1);
    if (!request) throw new Error('Expected a clock request');
    advance(20);
    return clock.receive({
      ...request,
      clockId,
      s2Ms: request.c1Ms + offset + 10,
      s3Ms: request.c1Ms + offset + 10,
    });
  };
  beforeEach(() => {
    vi.useFakeTimers();
    now = 0;
    sent = [];
    clock = new SharedClock(
      (request) => sent.push(request),
      () => now,
    );
  });
  afterEach(() => {
    clock.shutdown();
    vi.useRealTimers();
  });

  it('probes only when both ready and leased, with eight startup and three refresh requests', () => {
    clock.setNetworkReady(true);
    advance(1000);
    expect(sent).toHaveLength(0);
    const releaseA = clock.acquire('score-a');
    clock.acquire('score-b');
    advance(0);
    for (let i = 0; i < 8; i++) {
      expect(sent).toHaveLength(i + 1);
      expect(respond()).toBe(true);
      if (i < 7) advance(130);
    }
    expect(clock.estimate()).toMatchObject({ status: 'current', offsetMs: 5000 });
    expect(clock.getServerNow()).toBe(now + 5000);
    expect(clock.targetServerToPerformance(now + 5100)).toBe(now + 100);
    advance(14999);
    expect(sent).toHaveLength(8);
    advance(2);
    expect(sent).toHaveLength(9);
    for (let i = 0; i < 3; i++) {
      respond();
      if (i < 2) advance(130);
    }
    expect(sent).toHaveLength(11);
    releaseA();
    releaseA();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
  });

  it('cancels all timers after the final independent lease and ignores late replies', () => {
    const first = clock.acquire('same-name');
    const second = clock.acquire('same-name');
    clock.setNetworkReady(true);
    advance(0);
    first();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    second();
    expect(vi.getTimerCount()).toBe(0);
    expect(respond()).toBe(false);
    advance(60000);
    expect(sent).toHaveLength(1);
  });

  it('matches request ID and echoed c1, keeps one outstanding and retries safely after timeout', () => {
    clock.acquire('music');
    clock.setNetworkReady(true);
    advance(0);
    const first = sent[0];
    expect(clock.receive({ ...first, id: 'forged', clockId: 'x', s2Ms: 1, s3Ms: 1 })).toBe(false);
    expect(clock.receive({ ...first, c1Ms: 1, clockId: 'x', s2Ms: 1, s3Ms: 1 })).toBe(false);
    advance(1999);
    expect(sent).toHaveLength(1);
    advance(2);
    expect(sent).toHaveLength(2);
    expect(clock.receive({ ...first, clockId: 'runtime-a', s2Ms: 10, s3Ms: 10 })).toBe(false);
    expect(respond()).toBe(true);
  });

  it('invalidates mappings on runtime change and page/audio restoration, reacquiring leased consumers', () => {
    const listener = vi.fn();
    clock.subscribe(listener);
    clock.acquire('music');
    clock.setNetworkReady(true);
    advance(0);
    for (let i = 0; i < 3; i++) {
      respond();
      advance(130);
    }
    expect(clock.estimate().status).toBe('current');
    respond(7000, 'runtime-b');
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({
        reason: 'runtime',
        correction: 'rejoin',
        estimate: expect.objectContaining({ clockId: 'runtime-b', status: 'provisional' }),
      }),
    );
    expect(clock.getServerNow()).toBeUndefined();
    clock.invalidate();
    expect(clock.estimate().status).toBe('unavailable');
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ reason: 'restored', correction: 'rejoin' }),
    );
    const count = sent.length;
    advance(0);
    expect(sent).toHaveLength(count + 1);
    clock.setNetworkReady(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('expires support even when no further response arrives', () => {
    const listener = vi.fn();
    clock.subscribe(listener);
    clock.acquire('deadline');
    clock.setNetworkReady(true);
    advance(0);
    for (let i = 0; i < 3; i++) {
      respond();
      if (i < 2) advance(130);
    }
    now = 30500;
    vi.advanceTimersByTime(30180);
    expect(clock.estimate().status).toBe('stale');
    expect(
      listener.mock.calls.some(
        ([change]) => change.reason === 'stale' && change.estimate.status !== 'current',
      ),
    ).toBe(true);
  });

  it('rejects a frozen-tab reply before its throttled timeout fires', () => {
    clock.acquire('score');
    clock.setNetworkReady(true);
    advance(0);
    now = 60000;
    expect(clock.receive({ ...sent[0], clockId: 'runtime-a', s2Ms: 10, s3Ms: 10 })).toBe(false);
    expect(clock.estimate().status).toBe('unavailable');
  });

  it('uses only an explicit local origin and starts no network or freshness timers', () => {
    clock.acquire('local-score');
    expect(clock.getServerNow()).toBeUndefined();
    expect(
      clock.setLocalMapping({ clockId: 'wasm-runtime', serverNowMs: 8000, performanceNowMs: 1000 }),
    ).toBe(true);
    now = 1100;
    expect(clock.getServerNow()).toBe(8100);
    expect(clock.targetServerToPerformance(8200)).toBe(1200);
    expect(vi.getTimerCount()).toBe(0);
    clock.invalidate();
    expect(clock.getServerNow()).toBeUndefined();
    expect(sent).toHaveLength(0);
  });

  it('does not send a request after a subscriber releases the last lease during notification', () => {
    const release = clock.acquire('brief');
    clock.subscribe((change) => {
      if (change.reason === 'sample') release();
    });
    clock.setNetworkReady(true);
    advance(0);
    expect(sent).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
