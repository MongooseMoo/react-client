import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearWatchdogRecords,
  getWatchdogRecords,
  startPerfWatchdog,
} from "./perfWatchdog";
import type {
  PerfWatchdogHandle,
  PerfWatchdogOptions,
  WatchdogLongTask,
  WatchdogRecord,
  WatchdogSubsystems,
} from "./watchdogTypes";

const SAMPLE_INTERVAL_MS = 500;
/** Ticks before the idle threshold (10s) is satisfied. */
const IDLE_TICKS = 20;
/** Baseline tick plus a full 21-sample window. */
const WINDOW_TICKS = 22;
const TICKS_TO_FIRST_TRIP = IDLE_TICKS + WINDOW_TICKS;

interface StepOptions {
  lagMs?: number;
  longTaskMs?: number;
  rafCalls?: number;
  outputLines?: number;
  inboundMessages?: number;
}

function createHarness(overrides: PerfWatchdogOptions = {}) {
  let clock = 0;
  let outputEntryId = 0;
  let inboundEntryId = 0;
  let emitLongTasks: ((tasks: WatchdogLongTask[]) => void) | undefined;

  const sink = vi.fn<[WatchdogRecord], void>();
  const warn = vi.fn<[string, WatchdogRecord], void>();
  const subsystems: WatchdogSubsystems = {
    audioContextState: "running",
    connected: true,
    editorsOpen: 2,
    voiceChatActive: true,
  };

  const handle = startPerfWatchdog({
    now: () => clock,
    sink,
    warn,
    probes: {
      readCounters: () => ({ outputEntryId, inboundEntryId }),
      readSubsystems: () => ({ ...subsystems }),
    },
    observeLongTasks: (onLongTasks) => {
      emitLongTasks = onLongTasks;
      return () => {
        emitLongTasks = undefined;
      };
    },
    ...overrides,
  });

  const step = (count: number, options: StepOptions = {}) => {
    for (let index = 0; index < count; index += 1) {
      if (options.longTaskMs) {
        emitLongTasks?.([{ duration: options.longTaskMs }]);
      }
      for (let call = 0; call < (options.rafCalls ?? 0); call += 1) {
        window.requestAnimationFrame(() => undefined);
      }
      outputEntryId += options.outputLines ?? 0;
      inboundEntryId += options.inboundMessages ?? 0;
      clock += SAMPLE_INTERVAL_MS + (options.lagMs ?? 0);
      vi.advanceTimersByTime(SAMPLE_INTERVAL_MS);
    }
  };

  return {
    handle,
    sink,
    subsystems,
    step,
    warn,
    interact: () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    },
  };
}

function setVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
}

describe("perfWatchdog", () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  let handles: PerfWatchdogHandle[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    clearWatchdogRecords();
    setVisibility("visible");
    window.requestAnimationFrame = vi.fn(
      () => 1,
    ) as unknown as typeof window.requestAnimationFrame;
    handles = [];
  });

  afterEach(() => {
    for (const handle of handles) {
      handle.stop();
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
    setVisibility("visible");
    window.requestAnimationFrame = originalRequestAnimationFrame;
    clearWatchdogRecords();
  });

  const track = <T extends { handle: PerfWatchdogHandle }>(harness: T): T => {
    handles.push(harness.handle);
    return harness;
  };

  it("warns exactly once per episode of sustained long-task work", () => {
    const { sink, step, warn } = track(createHarness());

    step(TICKS_TO_FIRST_TRIP + 40, { longTaskMs: 200 });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink.mock.calls[0][0].reason).toBe("long-tasks");
  });

  it("opens a new episode only after the condition clears for the cooldown", () => {
    const { step, warn } = track(createHarness());

    step(TICKS_TO_FIRST_TRIP + 10, { longTaskMs: 200 });
    expect(warn).toHaveBeenCalledTimes(1);

    // 60s cooldown at 500ms per tick, plus slack to refill the window.
    step(140);
    expect(warn).toHaveBeenCalledTimes(1);

    step(WINDOW_TICKS + 2, { longTaskMs: 200 });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("stays silent while the user is interacting", () => {
    const { step, warn, interact } = track(createHarness());

    for (let round = 0; round < 12; round += 1) {
      interact();
      step(10, { longTaskMs: 400 });
    }

    expect(warn).not.toHaveBeenCalled();
  });

  it("stays silent while the tab is hidden", () => {
    const { step, warn } = track(createHarness());
    setVisibility("hidden");

    step(TICKS_TO_FIRST_TRIP + 40, { longTaskMs: 400, lagMs: 900 });

    expect(warn).not.toHaveBeenCalled();
  });

  it("trips on sustained event-loop lag with no long tasks at all", () => {
    const { sink, step } = track(createHarness());

    step(TICKS_TO_FIRST_TRIP + 2, { lagMs: 40 });

    expect(sink).toHaveBeenCalledTimes(1);
    const record = sink.mock.calls[0][0];
    expect(record.reason).toBe("event-loop-lag");
    expect(record.longTaskCount).toBe(0);
    expect(record.lagAverageMs).toBeCloseTo(40, 1);
  });

  it("records attribution naming the top contributors", () => {
    const { sink, step, warn } = track(createHarness());

    step(TICKS_TO_FIRST_TRIP + 2, {
      longTaskMs: 200,
      rafCalls: 30,
      outputLines: 10,
      inboundMessages: 3,
    });

    expect(sink).toHaveBeenCalledTimes(1);
    const record = sink.mock.calls[0][0];

    expect(record.kind).toBe("perf-watchdog");
    expect(record.busyPercent).toBeCloseTo(40, 0);
    expect(record.idleForMs).toBeGreaterThanOrEqual(10_000);
    expect(record.longTaskCount).toBeGreaterThan(0);
    expect(record.subsystems).toEqual({
      audioContextState: "running",
      connected: true,
      editorsOpen: 2,
      voiceChatActive: true,
    });
    // 30 rAF calls, 10 output lines and 3 inbound messages every 500ms.
    expect(record.rates.animationFrameCallsPerSecond).toBeCloseTo(60, 0);
    expect(record.rates.outputLinesPerSecond).toBeCloseTo(20, 0);
    expect(record.rates.inboundMessagesPerSecond).toBeCloseTo(6, 0);

    const names = record.topContributors.map((contributor) => contributor.name);
    expect(names[0]).toBe("animation frames");
    expect(names).toContain("output");
    expect(record.summary).toContain("animation frames");
    expect(warn).toHaveBeenCalledWith(record.summary, record);

    // Records must survive a trip through the diagnostics buffer as JSON.
    expect(JSON.parse(JSON.stringify(record))).toEqual(record);
  });

  it("falls back to the bounded array sink and console.warn", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { step } = track(createHarness({ sink: undefined, warn: undefined }));

    step(TICKS_TO_FIRST_TRIP + 2, { longTaskMs: 200 });

    const records = getWatchdogRecords();
    expect(records).toHaveLength(1);
    expect(records[0].kind).toBe("perf-watchdog");
    expect(consoleWarn).toHaveBeenCalledTimes(1);
    expect(consoleWarn.mock.calls[0][0]).toContain("[perf-watchdog]");
  });

  describe("requestAnimationFrame wrapper", () => {
    it("counts callers, passes through, and never schedules a frame itself", () => {
      const native = vi.fn(() => 42) as unknown as typeof window.requestAnimationFrame;
      window.requestAnimationFrame = native;

      const { sink, step } = track(createHarness());
      expect(window.requestAnimationFrame).not.toBe(native);

      const callback = () => undefined;
      expect(window.requestAnimationFrame(callback)).toBe(42);
      expect(native).toHaveBeenCalledWith(callback);

      // 20 callers per second for the whole window; the watchdog adds none.
      step(TICKS_TO_FIRST_TRIP + 2, { longTaskMs: 200, rafCalls: 10 });
      expect(native).toHaveBeenCalledTimes(1 + (TICKS_TO_FIRST_TRIP + 2) * 10);
      expect(sink.mock.calls[0][0].rates.animationFrameCallsPerSecond).toBeCloseTo(20, 0);
    });

    it("restores the original scheduler on stop", () => {
      const native = vi.fn(() => 7) as unknown as typeof window.requestAnimationFrame;
      window.requestAnimationFrame = native;

      const { handle } = createHarness();
      expect(window.requestAnimationFrame).not.toBe(native);

      handle.stop();
      expect(window.requestAnimationFrame).toBe(native);

      // Stopping twice must not reinstall or throw.
      handle.stop();
      expect(window.requestAnimationFrame).toBe(native);
    });

    it("stops sampling once torn down", () => {
      const { handle, sink, step } = track(createHarness());
      handle.stop();

      step(TICKS_TO_FIRST_TRIP + 20, { longTaskMs: 400 });

      expect(sink).not.toHaveBeenCalled();
    });
  });
});
