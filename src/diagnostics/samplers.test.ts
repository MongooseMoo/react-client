import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChannelHistoryStore } from "../stores/channelHistoryStore";
import { useOutputStore } from "../stores/outputStore";
import { DiagnosticsRingBuffer } from "./ringBuffer";
import { startCounterSampling, startLongTaskObserver } from "./samplers";

describe("startCounterSampling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useOutputStore.getState().reset();
    useChannelHistoryStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
    useOutputStore.getState().reset();
    useChannelHistoryStore.getState().reset();
  });

  it("records a zero-rate sample when nothing happened", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startCounterSampling(buffer, 5000);

    vi.advanceTimersByTime(5000);

    const [record] = buffer.snapshot();
    expect(record).toMatchObject({
      category: "counters",
      data: { outputLinesPerSec: 0, inboundMessagesPerSec: 0 },
    });

    stop();
  });

  it("computes rates from entry-id deltas between samples", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startCounterSampling(buffer, 5000);

    for (let i = 0; i < 10; i++) {
      useOutputStore.getState().addMessage(`line ${i}`);
    }
    for (let i = 0; i < 5; i++) {
      useChannelHistoryStore.getState().addChannelText({ channel: "sayto", talker: "a", text: "hi" });
    }

    vi.advanceTimersByTime(5000);

    const [record] = buffer.snapshot();
    expect(record.data.outputLinesPerSec).toBe(2); // 10 lines / 5s
    expect(record.data.inboundMessagesPerSec).toBe(1); // 5 messages / 5s

    stop();
  });

  it("stops sampling once stopped", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startCounterSampling(buffer, 5000);
    stop();

    vi.advanceTimersByTime(20000);

    expect(buffer.snapshot()).toHaveLength(0);
  });
});

describe("startLongTaskObserver", () => {
  const originalPerformanceObserver = globalThis.PerformanceObserver;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalPerformanceObserver) {
      globalThis.PerformanceObserver = originalPerformanceObserver;
    } else {
      // @ts-expect-error - cleaning up a test-only global
      delete globalThis.PerformanceObserver;
    }
  });

  it("does nothing when PerformanceObserver is unavailable", () => {
    // @ts-expect-error - simulating an environment without PerformanceObserver
    delete globalThis.PerformanceObserver;
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);

    const stop = startLongTaskObserver(buffer, 5000);
    vi.advanceTimersByTime(5000);

    expect(buffer.snapshot()).toHaveLength(0);
    stop();
  });

  it("aggregates observed long tasks and flushes them on the sample interval", () => {
    let callback: (list: { getEntries: () => { duration: number }[] }) => void = () => {};
    const disconnect = vi.fn();

    class FakePerformanceObserver {
      constructor(cb: typeof callback) {
        callback = cb;
      }
      observe() {}
      disconnect = disconnect;
    }

    // @ts-expect-error - test double
    globalThis.PerformanceObserver = FakePerformanceObserver;

    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startLongTaskObserver(buffer, 5000);

    callback({ getEntries: () => [{ duration: 60 }, { duration: 90 }] });
    vi.advanceTimersByTime(5000);

    const [record] = buffer.snapshot();
    expect(record).toMatchObject({
      category: "longtask",
      data: { count: 2, totalDurationMs: 150 },
    });

    stop();
    expect(disconnect).toHaveBeenCalled();
  });

  it("does not emit a record for a sample window with no long tasks", () => {
    class FakePerformanceObserver {
      observe() {}
      disconnect() {}
    }

    // @ts-expect-error - test double
    globalThis.PerformanceObserver = FakePerformanceObserver;

    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startLongTaskObserver(buffer, 5000);

    vi.advanceTimersByTime(5000);

    expect(buffer.snapshot()).toHaveLength(0);
    stop();
  });
});
