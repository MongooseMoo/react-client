import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectionLatency } from './ConnectionLatency';

describe('connection latency', () => {
  let clock = 0;
  const send = vi.fn();
  const publish = vi.fn();
  let latency: ConnectionLatency;
  beforeEach(() => {
    vi.useFakeTimers();
    clock = 0;
    send.mockClear();
    publish.mockClear();
    latency = new ConnectionLatency(send, publish, () => clock);
  });
  afterEach(() => {
    latency.stop();
    vi.useRealTimers();
  });
  it('measures monotonic RTT and reports the previous rolling average', () => {
    latency.start();
    expect(send).toHaveBeenLastCalledWith(undefined);
    clock = 120;
    latency.receive();
    expect(publish).toHaveBeenLastCalledWith({ status: 'current', rttMs: 120, averageMs: 120 });
    clock = 5000;
    vi.advanceTimersByTime(5000);
    expect(send).toHaveBeenLastCalledWith(120);
    clock = 5240;
    latency.receive();
    expect(publish).toHaveBeenLastCalledWith({ status: 'current', rttMs: 240, averageMs: 180 });
  });
  it('never overlaps uncorrelated requests, including resume probes', () => {
    latency.start();
    latency.start();
    latency.probe();
    vi.advanceTimersByTime(10000);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('expires a lost reply and drains a late reply without misattributing it', () => {
    latency.start();
    clock = 15000;
    vi.advanceTimersByTime(15000);
    expect(publish).toHaveBeenLastCalledWith({ status: 'stale', rttMs: null, averageMs: null });
    latency.probe();
    expect(send).toHaveBeenCalledTimes(1);
    latency.receive();
    expect(publish).toHaveBeenLastCalledWith({ status: 'stale', rttMs: null, averageMs: null });
    clock = 20000;
    vi.advanceTimersByTime(5000);
    expect(send).toHaveBeenLastCalledWith(undefined);
    clock = 20080;
    latency.receive();
    expect(publish).toHaveBeenLastCalledWith({ status: 'current', rttMs: 80, averageMs: 80 });
  });
  it('rejects frozen-tab timing even when its timeout has not fired', () => {
    latency.start();
    clock = 60000;
    latency.receive();
    expect(publish).toHaveBeenLastCalledWith({ status: 'stale', rttMs: null, averageMs: null });
  });
  it('ignores unsolicited replies and clears timers and samples on disconnect', () => {
    latency.receive();
    expect(publish).not.toHaveBeenCalled();
    latency.start();
    clock = 100;
    latency.receive();
    latency.stop();
    vi.advanceTimersByTime(60000);
    expect(send).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenLastCalledWith({ status: 'unavailable', rttMs: null, averageMs: null });
    latency.start();
    expect(send).toHaveBeenLastCalledWith(undefined);
  });
  it('averages only the five most recent samples', () => {
    latency.start();
    for (const sample of [10, 20, 30, 40, 50, 60]) {
      clock += sample;
      latency.receive();
      clock += 5000;
      vi.advanceTimersByTime(5000);
    }
    expect(send).toHaveBeenLastCalledWith(40);
  });
});
