import { useChannelHistoryStore } from "../stores/channelHistoryStore";
import { useOutputStore } from "../stores/outputStore";
import { type DiagnosticsRingBuffer, diagnosticsBuffer } from "./ringBuffer";

export const SAMPLE_INTERVAL_MS = 5000;

interface EntryWithId {
  id: number;
}

function lastEntryId(entries: EntryWithId[]): number {
  return entries.length > 0 ? entries[entries.length - 1].id : 0;
}

/**
 * Samples cheap counters every `intervalMs` instead of hooking every
 * message/output event: inbound messages/sec (from the channel history
 * store's monotonic entry ids) and output lines/sec (from the output
 * store's monotonic entry ids).
 *
 * Returns a function that stops sampling.
 */
export function startCounterSampling(
  buffer: DiagnosticsRingBuffer = diagnosticsBuffer,
  intervalMs: number = SAMPLE_INTERVAL_MS,
): () => void {
  let lastOutputId = lastEntryId(useOutputStore.getState().entries);
  let lastChannelId = lastEntryId(useChannelHistoryStore.getState().entries);
  let lastSampleTime = Date.now();

  const timer = window.setInterval(() => {
    const now = Date.now();
    const elapsedSec = Math.max((now - lastSampleTime) / 1000, 0.001);

    const outputId = lastEntryId(useOutputStore.getState().entries);
    const channelId = lastEntryId(useChannelHistoryStore.getState().entries);

    // Store resets (id counters restarting) can make a delta look negative;
    // clamp to zero rather than reporting a bogus negative rate.
    const outputDelta = Math.max(0, outputId - lastOutputId);
    const channelDelta = Math.max(0, channelId - lastChannelId);

    buffer.record("counters", {
      outputLinesPerSec: Number((outputDelta / elapsedSec).toFixed(2)),
      inboundMessagesPerSec: Number((channelDelta / elapsedSec).toFixed(2)),
    });

    lastOutputId = outputId;
    lastChannelId = channelId;
    lastSampleTime = now;
  }, intervalMs);

  return () => window.clearInterval(timer);
}

/**
 * Observes long tasks (PerformanceObserver, entryType "longtask") and
 * flushes an aggregated count/duration into the diagnostics buffer every
 * `intervalMs`, rather than recording one entry per long task. Silently
 * does nothing in environments without PerformanceObserver or without
 * "longtask" support (e.g. Firefox, jsdom under test).
 *
 * Returns a function that stops observing/sampling.
 */
export function startLongTaskObserver(
  buffer: DiagnosticsRingBuffer = diagnosticsBuffer,
  intervalMs: number = SAMPLE_INTERVAL_MS,
): () => void {
  if (typeof PerformanceObserver === "undefined") {
    return () => {};
  }

  let count = 0;
  let totalDurationMs = 0;
  let observer: PerformanceObserver;

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        count += 1;
        totalDurationMs += entry.duration;
      }
    });
    observer.observe({ type: "longtask", buffered: true });
  } catch {
    // "longtask" isn't a supported entry type in this environment.
    return () => {};
  }

  const timer = window.setInterval(() => {
    if (count > 0) {
      buffer.record("longtask", {
        count,
        totalDurationMs: Math.round(totalDurationMs),
      });
      count = 0;
      totalDurationMs = 0;
    }
  }, intervalMs);

  return () => {
    window.clearInterval(timer);
    observer.disconnect();
  };
}
