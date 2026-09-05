/**
 * Types for the performance watchdog (see `perfWatchdog.ts`).
 *
 * Every shape here is plain JSON so a record can be dropped straight into a
 * diagnostics buffer, stringified, and pasted into an issue.
 */

/** Which detector tripped. */
export type WatchdogTripReason = "long-tasks" | "event-loop-lag";

/** Subsystems that are live at the moment of the trip. */
export interface WatchdogSubsystems {
  /** `AudioContext.state`, or null when no audio graph exists yet. */
  audioContextState: string | null;
  /** Whether the MUD connection is up. */
  connected: boolean;
  /** Editor windows the client believes are open. */
  editorsOpen: number;
  /** Voice chat (LiveKit) has at least one live token. */
  voiceChatActive: boolean;
}

/** Coarse traffic rates, derived from store entry-id deltas over the window. */
export interface WatchdogRates {
  /** Channel/comm messages arriving per second. */
  inboundMessagesPerSecond: number;
  /** Output entries appended per second. */
  outputLinesPerSecond: number;
  /** `requestAnimationFrame` scheduling calls per second, by caller count. */
  animationFrameCallsPerSecond: number;
}

/** A named suspect, ranked so the warning can lead with the loudest one. */
export interface WatchdogContributor {
  name: string;
  detail: string;
  score: number;
}

/** One episode of sustained main-thread work while the client was idle. */
export interface WatchdogRecord {
  kind: "perf-watchdog";
  reason: WatchdogTripReason;
  /** Wall-clock time of the trip (`Date.now()`). */
  at: number;
  /** Span the measurements cover, in milliseconds. */
  windowMs: number;
  /** How long the user had been idle when the watchdog tripped. */
  idleForMs: number;
  longTaskCount: number;
  longTaskTotalMs: number;
  longTaskMaxMs: number;
  /** Share of the window spent inside long tasks, 0-100. */
  busyPercent: number;
  lagAverageMs: number;
  lagMaxMs: number;
  rates: WatchdogRates;
  subsystems: WatchdogSubsystems;
  /** Highest-scoring suspects, most significant first. */
  topContributors: WatchdogContributor[];
  /** Human-readable one-liner; the same text used for the console warning. */
  summary: string;
}

/**
 * Where records go. Defaults to a small bounded in-memory array; the
 * diagnostics buffer can be passed in instead.
 */
export type WatchdogSink = (record: WatchdogRecord) => void;

/** Cheap per-tick counters. Must stay O(1) — this runs twice a second. */
export interface WatchdogCounters {
  /** Latest id in the output store, monotonic until reset. */
  outputEntryId: number;
  /** Latest id in the channel history store, monotonic until reset. */
  inboundEntryId: number;
}

/** Attribution probes, split so the expensive half only runs on a trip. */
export interface WatchdogProbes {
  readCounters: () => WatchdogCounters;
  readSubsystems: () => WatchdogSubsystems;
}

/** A long task, reduced to the two fields the watchdog needs. */
export interface WatchdogLongTask {
  duration: number;
}

/**
 * Installs a long-task source and returns a disposer, or undefined when the
 * platform has no `longtask` support (Firefox and Safari, at time of writing).
 */
export type LongTaskObserverFactory = (
  onLongTasks: (tasks: WatchdogLongTask[]) => void,
) => (() => void) | undefined;

export interface PerfWatchdogOptions {
  /** Record destination. Defaults to the bounded in-memory array. */
  sink?: WatchdogSink;
  /** Warning emitter. Defaults to `console.warn`. */
  warn?: (summary: string, record: WatchdogRecord) => void;
  /** Monotonic clock, in milliseconds. Defaults to `performance.now()`. */
  now?: () => number;
  /** Overrides for attribution probes; unspecified probes use the defaults. */
  probes?: Partial<WatchdogProbes>;
  /** Long-task source. Defaults to a `longtask` PerformanceObserver. */
  observeLongTasks?: LongTaskObserverFactory;
}

export interface PerfWatchdogHandle {
  /** Removes every listener, timer, observer, and the rAF wrapper. */
  stop: () => void;
}
