/**
 * Performance watchdog.
 *
 * Detects sustained main-thread work while the client is idle and records what
 * was running at the time, so a runaway loop leaves evidence instead of a
 * three-day archaeology dig.
 *
 * Three cheap signals, no per-event instrumentation in the steady state:
 *
 * - a `longtask` PerformanceObserver (browser-native, free when nothing is slow),
 * - a 500 ms interval that measures its own scheduling delay (event-loop lag),
 * - a `requestAnimationFrame` wrapper that counts *callers*.
 *
 * The rAF wrapper never schedules a frame of its own. Installing a rAF loop to
 * measure frame rate pins the page at 60 fps and manufactures the very load it
 * claims to observe — that mistake produced a false positive during the
 * investigation this module comes from.
 */

import { useChannelHistoryStore } from "../stores/channelHistoryStore";
import { useConnectionStore } from "../stores/connectionStore";
import { useLiveKitStore } from "../stores/liveKitStore";
import { useOutputStore } from "../stores/outputStore";
import type {
  LongTaskObserverFactory,
  PerfWatchdogHandle,
  PerfWatchdogOptions,
  WatchdogContributor,
  WatchdogCounters,
  WatchdogRates,
  WatchdogRecord,
  WatchdogSink,
  WatchdogSubsystems,
  WatchdogTripReason,
} from "./watchdogTypes";

/** How often the sampler wakes up. Coarse on purpose. */
const SAMPLE_INTERVAL_MS = 500;
/** Rolling window the trip conditions are evaluated over. */
const WINDOW_MS = 10_000;
/** First sample is the baseline, so one extra slot covers a full window. */
const MAX_SAMPLES = WINDOW_MS / SAMPLE_INTERVAL_MS + 1;
/** No keydown or pointer activity for this long counts as idle. */
const IDLE_THRESHOLD_MS = 10_000;
/** Share of the window inside long tasks that counts as busy. */
const LONG_TASK_BUSY_RATIO = 0.2;
/** Long tasks must land in this many samples, so one stall cannot trip it. */
const LONG_TASK_SPREAD_SAMPLES = 4;
/** Average scheduling lag over the window that counts as sustained. */
const LAG_TRIP_AVERAGE_MS = 25;
/** A single sample counts as laggy above this. */
const LAG_ELEVATED_MS = 10;
/** Most of the window has to be laggy, not one spike. */
const LAG_SPREAD_SAMPLES = 12;
/** An episode ends after the condition stays clear this long. */
const EPISODE_COOLDOWN_MS = 60_000;
/** Cap on the default in-memory record array. */
const MAX_RECORDS = 20;

const INTERACTION_EVENTS = ["keydown", "pointerdown", "pointermove"] as const;

interface WatchdogSample {
  at: number;
  lagMs: number;
  longTaskMs: number;
  longTaskCount: number;
  longTaskMaxMs: number;
  rafCalls: number;
  counters: WatchdogCounters;
}

interface WindowMetrics {
  spanMs: number;
  longTaskCount: number;
  longTaskTotalMs: number;
  longTaskMaxMs: number;
  busyPercent: number;
  lagAverageMs: number;
  lagMaxMs: number;
  rafCallsPerSecond: number;
  samplesWithLongTasks: number;
  samplesWithElevatedLag: number;
}

const recentRecords: WatchdogRecord[] = [];

/** Default sink: a small bounded array, readable via `getWatchdogRecords`. */
export const defaultWatchdogSink: WatchdogSink = (record) => {
  recentRecords.push(record);
  if (recentRecords.length > MAX_RECORDS) {
    recentRecords.splice(0, recentRecords.length - MAX_RECORDS);
  }
};

/** Records held by the default sink, oldest first. */
export function getWatchdogRecords(): WatchdogRecord[] {
  return [...recentRecords];
}

export function clearWatchdogRecords(): void {
  recentRecords.length = 0;
}

function roundTo(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function perSecond(delta: number, spanMs: number): number {
  if (spanMs <= 0 || delta <= 0) {
    return 0;
  }
  return roundTo((delta * 1000) / spanMs, 2);
}

function lastEntryId(entries: ReadonlyArray<{ id: number }>): number {
  return entries.length > 0 ? entries[entries.length - 1].id : 0;
}

/**
 * The bits of `window.mudClient` the watchdog reads. Structural rather than an
 * import of `MudClient`, so diagnostics stay decoupled from the client graph.
 */
interface ProbeClientShape {
  media?: { cacophony?: { context?: { state?: string } } };
  editors?: { openEditorCount?: number };
}

function getProbeClient(): ProbeClientShape | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as unknown as { mudClient?: ProbeClientShape }).mudClient;
}

/** O(1): the stores keep entries in insertion order with monotonic ids. */
function defaultReadCounters(): WatchdogCounters {
  return {
    outputEntryId: lastEntryId(useOutputStore.getState().entries),
    inboundEntryId: lastEntryId(useChannelHistoryStore.getState().entries),
  };
}

function defaultReadSubsystems(): WatchdogSubsystems {
  const client = getProbeClient();
  return {
    audioContextState: client?.media?.cacophony?.context?.state ?? null,
    connected: useConnectionStore.getState().connected,
    editorsOpen: client?.editors?.openEditorCount ?? 0,
    voiceChatActive: useLiveKitStore.getState().tokens.length > 0,
  };
}

const defaultObserveLongTasks: LongTaskObserverFactory = (onLongTasks) => {
  if (typeof PerformanceObserver === "undefined") {
    return undefined;
  }
  try {
    const observer = new PerformanceObserver((list) => {
      onLongTasks(list.getEntries().map((entry) => ({ duration: entry.duration })));
    });
    observer.observe({ type: "longtask", buffered: false });
    return () => observer.disconnect();
  } catch {
    // Firefox and Safari have no `longtask` entry type; lag sampling covers us.
    return undefined;
  }
};

const wrappedAnimationFrameSchedulers = new WeakSet<object>();

/**
 * Counts `requestAnimationFrame` callers by wrapping the scheduler. The
 * callback is passed through untouched and the native id is returned, so
 * `cancelAnimationFrame` keeps working.
 */
function installAnimationFrameCounter(onSchedule: () => void): (() => void) | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const original = window.requestAnimationFrame;
  if (typeof original !== "function" || wrappedAnimationFrameSchedulers.has(original)) {
    return undefined;
  }

  const wrapped: typeof window.requestAnimationFrame = (callback) => {
    onSchedule();
    return original.call(window, callback);
  };
  wrappedAnimationFrameSchedulers.add(wrapped);
  window.requestAnimationFrame = wrapped;

  return () => {
    if (window.requestAnimationFrame === wrapped) {
      window.requestAnimationFrame = original;
    }
  };
}

function isVisible(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

function summarizeWindow(samples: WatchdogSample[]): WindowMetrics | undefined {
  if (samples.length < 2) {
    return undefined;
  }
  const first = samples[0];
  const last = samples[samples.length - 1];
  const spanMs = last.at - first.at;
  if (spanMs <= 0) {
    return undefined;
  }

  let longTaskCount = 0;
  let longTaskTotalMs = 0;
  let longTaskMaxMs = 0;
  let rafCalls = 0;
  let lagTotalMs = 0;
  let lagMaxMs = 0;
  let samplesWithLongTasks = 0;
  let samplesWithElevatedLag = 0;

  // The first sample only supplies the baseline: its accumulators belong to the
  // interval before the window opened.
  for (let index = 1; index < samples.length; index += 1) {
    const sample = samples[index];
    longTaskCount += sample.longTaskCount;
    longTaskTotalMs += sample.longTaskMs;
    longTaskMaxMs = Math.max(longTaskMaxMs, sample.longTaskMaxMs);
    rafCalls += sample.rafCalls;
    lagTotalMs += sample.lagMs;
    lagMaxMs = Math.max(lagMaxMs, sample.lagMs);
    if (sample.longTaskMs > 0) {
      samplesWithLongTasks += 1;
    }
    if (sample.lagMs >= LAG_ELEVATED_MS) {
      samplesWithElevatedLag += 1;
    }
  }

  const measuredSamples = samples.length - 1;
  return {
    spanMs,
    longTaskCount,
    longTaskTotalMs: roundTo(longTaskTotalMs, 1),
    longTaskMaxMs: roundTo(longTaskMaxMs, 1),
    busyPercent: roundTo((longTaskTotalMs / spanMs) * 100, 1),
    lagAverageMs: roundTo(lagTotalMs / measuredSamples, 1),
    lagMaxMs: roundTo(lagMaxMs, 1),
    rafCallsPerSecond: perSecond(rafCalls, spanMs),
    samplesWithLongTasks,
    samplesWithElevatedLag,
  };
}

function evaluateTrip(metrics: WindowMetrics): WatchdogTripReason | undefined {
  if (
    metrics.busyPercent >= LONG_TASK_BUSY_RATIO * 100 &&
    metrics.samplesWithLongTasks >= LONG_TASK_SPREAD_SAMPLES
  ) {
    return "long-tasks";
  }
  if (
    metrics.lagAverageMs >= LAG_TRIP_AVERAGE_MS &&
    metrics.samplesWithElevatedLag >= LAG_SPREAD_SAMPLES
  ) {
    return "event-loop-lag";
  }
  return undefined;
}

function rankContributors(
  metrics: WindowMetrics,
  rates: WatchdogRates,
  subsystems: WatchdogSubsystems,
): WatchdogContributor[] {
  const contributors: WatchdogContributor[] = [];

  if (rates.animationFrameCallsPerSecond >= 1) {
    contributors.push({
      name: "animation frames",
      detail: `${rates.animationFrameCallsPerSecond} requestAnimationFrame calls/s`,
      score: rates.animationFrameCallsPerSecond,
    });
  }
  if (rates.outputLinesPerSecond >= 0.5) {
    contributors.push({
      name: "output",
      detail: `${rates.outputLinesPerSecond} output lines/s`,
      score: rates.outputLinesPerSecond * 2,
    });
  }
  if (rates.inboundMessagesPerSecond >= 0.5) {
    contributors.push({
      name: "inbound messages",
      detail: `${rates.inboundMessagesPerSecond} channel messages/s`,
      score: rates.inboundMessagesPerSecond * 2,
    });
  }
  if (metrics.longTaskCount > 0) {
    contributors.push({
      name: "long tasks",
      detail: `${metrics.longTaskCount} tasks, ${metrics.longTaskTotalMs}ms total, longest ${metrics.longTaskMaxMs}ms`,
      score: metrics.busyPercent,
    });
  }
  if (metrics.lagAverageMs >= LAG_ELEVATED_MS) {
    contributors.push({
      name: "event loop",
      detail: `${metrics.lagAverageMs}ms average scheduling lag, peak ${metrics.lagMaxMs}ms`,
      score: metrics.lagAverageMs,
    });
  }
  if (subsystems.voiceChatActive) {
    contributors.push({ name: "voice chat", detail: "LiveKit session active", score: 8 });
  }
  if (subsystems.audioContextState === "running") {
    contributors.push({ name: "audio", detail: "AudioContext running", score: 5 });
  }
  if (subsystems.editorsOpen > 0) {
    contributors.push({
      name: "editors",
      detail: `${subsystems.editorsOpen} editor window(s) open`,
      score: subsystems.editorsOpen * 3,
    });
  }

  if (contributors.length === 0) {
    return [{ name: "unattributed", detail: "no active subsystem stood out", score: 0 }];
  }

  return contributors.sort((left, right) => right.score - left.score).slice(0, 3);
}

function buildSummary(record: WatchdogRecord): string {
  const contributors = record.topContributors
    .map((contributor) => `${contributor.name} (${contributor.detail})`)
    .join("; ");
  return (
    `[perf-watchdog] Sustained main-thread work while idle: ` +
    `${record.busyPercent}% of the last ${roundTo(record.windowMs / 1000, 1)}s in long tasks, ` +
    `${record.lagAverageMs}ms average event-loop lag, idle for ${Math.round(record.idleForMs / 1000)}s. ` +
    `Top contributors: ${contributors}.`
  );
}

/**
 * Starts the watchdog. Cheap to stop: one interval, one observer, three passive
 * listeners, and the rAF wrapper, all released by the returned handle.
 */
export function startPerfWatchdog(options: PerfWatchdogOptions = {}): PerfWatchdogHandle {
  const clock = options.now ?? (() => performance.now());
  const sink = options.sink ?? defaultWatchdogSink;
  const warn =
    options.warn ??
    ((summary: string, record: WatchdogRecord) => {
      console.warn(summary, record);
    });
  const readCounters = options.probes?.readCounters ?? defaultReadCounters;
  const readSubsystems = options.probes?.readSubsystems ?? defaultReadSubsystems;
  const observeLongTasks = options.observeLongTasks ?? defaultObserveLongTasks;

  const samples: WatchdogSample[] = [];
  let lastInteractionAt = clock();
  let lastTickAt = clock();
  let pendingLongTaskMs = 0;
  let pendingLongTaskCount = 0;
  let pendingLongTaskMaxMs = 0;
  let pendingRafCalls = 0;
  let previousTickSkipped = true;
  let episodeActive = false;
  let clearSince: number | null = null;
  let stopped = false;

  const noteInteraction = () => {
    lastInteractionAt = clock();
  };
  const noteAnimationFrameSchedule = () => {
    pendingRafCalls += 1;
  };

  const noteClear = (now: number) => {
    if (!episodeActive) {
      return;
    }
    if (clearSince === null) {
      clearSince = now;
      return;
    }
    if (now - clearSince >= EPISODE_COOLDOWN_MS) {
      episodeActive = false;
      clearSince = null;
    }
  };

  const emitRecord = (
    reason: WatchdogTripReason,
    metrics: WindowMetrics,
    samplesInWindow: WatchdogSample[],
    idleForMs: number,
  ) => {
    const first = samplesInWindow[0];
    const last = samplesInWindow[samplesInWindow.length - 1];
    const subsystems = readSubsystems();
    const rates: WatchdogRates = {
      inboundMessagesPerSecond: perSecond(
        last.counters.inboundEntryId - first.counters.inboundEntryId,
        metrics.spanMs,
      ),
      outputLinesPerSecond: perSecond(
        last.counters.outputEntryId - first.counters.outputEntryId,
        metrics.spanMs,
      ),
      animationFrameCallsPerSecond: metrics.rafCallsPerSecond,
    };

    const record: WatchdogRecord = {
      kind: "perf-watchdog",
      reason,
      at: Date.now(),
      windowMs: Math.round(metrics.spanMs),
      idleForMs: Math.round(idleForMs),
      longTaskCount: metrics.longTaskCount,
      longTaskTotalMs: metrics.longTaskTotalMs,
      longTaskMaxMs: metrics.longTaskMaxMs,
      busyPercent: metrics.busyPercent,
      lagAverageMs: metrics.lagAverageMs,
      lagMaxMs: metrics.lagMaxMs,
      rates,
      subsystems,
      topContributors: rankContributors(metrics, rates, subsystems),
      summary: "",
    };
    record.summary = buildSummary(record);

    sink(record);
    warn(record.summary, record);
  };

  const tick = () => {
    if (stopped) {
      return;
    }
    const now = clock();
    const lagMs = Math.max(0, now - (lastTickAt + SAMPLE_INTERVAL_MS));
    lastTickAt = now;

    const longTaskMs = pendingLongTaskMs;
    const longTaskCount = pendingLongTaskCount;
    const longTaskMaxMs = pendingLongTaskMaxMs;
    const rafCalls = pendingRafCalls;
    pendingLongTaskMs = 0;
    pendingLongTaskCount = 0;
    pendingLongTaskMaxMs = 0;
    pendingRafCalls = 0;

    const idleForMs = now - lastInteractionAt;
    // Background tabs throttle timers to roughly 1 Hz, which reads as lag that
    // is not there, so a hidden tab never contributes samples.
    if (idleForMs < IDLE_THRESHOLD_MS || !isVisible()) {
      samples.length = 0;
      previousTickSkipped = true;
      noteClear(now);
      return;
    }
    if (previousTickSkipped) {
      // Re-baseline after a gap: this tick's lag reflects the gap, not the page.
      previousTickSkipped = false;
      return;
    }

    samples.push({
      at: now,
      lagMs,
      longTaskMs,
      longTaskCount,
      longTaskMaxMs,
      rafCalls,
      counters: readCounters(),
    });
    if (samples.length > MAX_SAMPLES) {
      samples.splice(0, samples.length - MAX_SAMPLES);
    }
    if (samples.length < MAX_SAMPLES) {
      noteClear(now);
      return;
    }

    const metrics = summarizeWindow(samples);
    const reason = metrics ? evaluateTrip(metrics) : undefined;
    if (!metrics || !reason) {
      noteClear(now);
      return;
    }

    clearSince = null;
    if (episodeActive) {
      // One warning per episode, not a stream.
      return;
    }
    episodeActive = true;
    emitRecord(reason, metrics, samples, idleForMs);
  };

  const disposeLongTasks = observeLongTasks((tasks) => {
    for (const task of tasks) {
      pendingLongTaskMs += task.duration;
      pendingLongTaskCount += 1;
      pendingLongTaskMaxMs = Math.max(pendingLongTaskMaxMs, task.duration);
    }
  });
  const disposeAnimationFrameCounter = installAnimationFrameCounter(noteAnimationFrameSchedule);

  if (typeof window !== "undefined") {
    for (const eventName of INTERACTION_EVENTS) {
      window.addEventListener(eventName, noteInteraction, { passive: true, capture: true });
    }
  }
  const interval = setInterval(tick, SAMPLE_INTERVAL_MS);

  return {
    stop: () => {
      if (stopped) {
        return;
      }
      stopped = true;
      clearInterval(interval);
      disposeLongTasks?.();
      disposeAnimationFrameCounter?.();
      if (typeof window !== "undefined") {
        for (const eventName of INTERACTION_EVENTS) {
          window.removeEventListener(eventName, noteInteraction, { capture: true });
        }
      }
      samples.length = 0;
    },
  };
}

let activeWatchdog: PerfWatchdogHandle | null = null;
let watchdogHolders = 0;

/**
 * Starts the watchdog once for the whole app and hands back a release
 * function. Extra callers share the running instance; the last release stops
 * it. Survives reconnects because it is tied to the app, not the connection.
 */
export function ensurePerfWatchdog(options?: PerfWatchdogOptions): () => void {
  watchdogHolders += 1;
  if (!activeWatchdog) {
    activeWatchdog = startPerfWatchdog(options);
  }

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    watchdogHolders -= 1;
    if (watchdogHolders <= 0) {
      watchdogHolders = 0;
      activeWatchdog?.stop();
      activeWatchdog = null;
    }
  };
}
