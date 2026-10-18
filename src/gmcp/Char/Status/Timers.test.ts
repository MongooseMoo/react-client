import { afterEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../../../client';
import { parseTimerUpdate } from '../../../timing/deadlines';
import { SharedClock } from '../../../timing/SharedClock';
import { GMCPCharStatusTimers } from './Timers';

const update = {
  clockId: 'runtime',
  revision: 0,
  timers: [{ id: 'quest:one', label: 'Bring a parcel', deadlineServerMs: 10000 }],
};
const active: { handler: GMCPCharStatusTimers; clock: SharedClock }[] = [];
function setup() {
  const send = vi.fn();
  const clock = new SharedClock(vi.fn());
  const client = {
    gmcp: { ready: true, sessionReady: true, generation: 2, send },
    sharedClock: clock,
  } as unknown as MudClient;
  const handler = new GMCPCharStatusTimers(client);
  active.push({ handler, clock });
  return { handler, clock, client, send };
}
afterEach(() => {
  for (const { handler, clock } of active.splice(0)) {
    handler.shutdown();
    clock.shutdown();
  }
  vi.restoreAllMocks();
});

describe('authenticated connection deadline projection', () => {
  it('asks only for the current character, rate limits requests and correlates replies', () => {
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const { handler, send } = setup();
    expect(handler.requestSnapshot()).toBe(true);
    expect(send).toHaveBeenLastCalledWith(
      'Char.Status.Timers.Request',
      '{"requestId":"timers:2:1"}',
    );
    expect(handler.requestSnapshot()).toBe(false);
    expect(handler.handleUpdate({ ...update, requestId: 'another-request' })).toBe(false);
    expect(handler.handleUpdate({ ...update, requestId: 'timers:2:1' })).toBe(true);
    now += 1000;
    expect(handler.requestSnapshot()).toBe(true);
    expect(handler.handleUpdate({ ...update, revision: 1, requestId: 'timers:2:1' })).toBe(false);
  });

  it('replaces full snapshots, rejects stale revisions and clears ownership on reset', () => {
    const { handler, clock } = setup();
    const acquire = vi.spyOn(clock, 'acquire');
    expect(handler.handleUpdate(update)).toBe(true);
    expect(handler.snapshot.timers).toHaveLength(1);
    expect(acquire).toHaveBeenCalledOnce();
    expect(handler.handleUpdate({ ...update, timers: [] })).toBe(false);
    expect(handler.handleUpdate({ ...update, revision: 1, timers: [] })).toBe(true);
    expect(handler.snapshot.timers).toHaveLength(0);
    handler.reset();
    expect(handler.snapshot).toMatchObject({ received: false, timers: [], revision: -1 });
  });

  it('clears stale runtime data and rejects old-domain updates after a fresh mapping', () => {
    const { handler, clock } = setup();
    clock.setLocalMapping({
      clockId: 'runtime',
      serverNowMs: 1000,
      performanceNowMs: performance.now(),
    });
    handler.handleUpdate(update);
    clock.setLocalMapping({
      clockId: 'replacement',
      serverNowMs: 1000,
      performanceNowMs: performance.now(),
    });
    expect(handler.snapshot.received).toBe(false);
    expect(handler.handleUpdate(update)).toBe(false);
    expect(handler.handleUpdate({ ...update, clockId: 'replacement', revision: 0 })).toBe(true);
  });

  it('never asks before GMCP and character readiness', () => {
    const { handler, client, send } = setup();
    Object.defineProperty(client.gmcp, 'sessionReady', { value: false });
    expect(handler.requestSnapshot()).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it('reacquires a snapshot after restoration or clock capability return without exceeding request rate', () => {
    vi.useFakeTimers();
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    try {
      const { handler, clock, send } = setup();
      clock.setNetworkReady(true);
      expect(send).toHaveBeenCalledTimes(1);
      handler.handleUpdate(update);
      clock.invalidate();
      expect(handler.snapshot.received).toBe(false);
      expect(send).toHaveBeenCalledTimes(1);
      now = 2000;
      vi.advanceTimersByTime(1000);
      expect(send).toHaveBeenCalledTimes(2);
      clock.setNetworkReady(false);
      clock.setNetworkReady(true);
      expect(send).toHaveBeenCalledTimes(2);
      now = 3000;
      vi.advanceTimersByTime(1000);
      expect(send).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('bounds every snapshot and copies immutable labels without optional target selectors', () => {
    expect(parseTimerUpdate(update)).toBeDefined();
    for (const input of [
      { ...update, timers: Array(65).fill(update.timers[0]) },
      { ...update, timers: [update.timers[0], update.timers[0]] },
      { ...update, revision: Number.MAX_SAFE_INTEGER + 1 },
      { ...update, timers: [{ ...update.timers[0], label: 'a'.repeat(257) }] },
      { ...update, timers: [{ ...update.timers[0], deadlineServerMs: Number.POSITIVE_INFINITY }] },
    ])
      expect(parseTimerUpdate(input)).toBeUndefined();
    const input = { ...update, timers: [{ ...update.timers[0] }] };
    const parsed = parseTimerUpdate(input);
    input.timers[0].label = 'Changed';
    expect(parsed?.timers[0].label).toBe('Bring a parcel');
    expect(Object.isFrozen(parsed?.timers[0])).toBe(true);
  });
});
