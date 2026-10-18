/** Browser counters are observations, not a measurement of whole-machine CPU usage. */
export interface AudioPerformanceReading {
  time: number;
  contextState: string;
  audioTime: number | null;
  sampleRate: number | null;
  baseLatencyMs: number | null;
  outputLatencyMs: number | null;
  underrunEvents: number | null;
  underrunSeconds: number | null;
  totalSeconds: number | null;
  mediaSounds: number;
  playingMediaSounds: number;
  mediaPlaybacks: number;
}

export interface AudioPerformanceSample extends AudioPerformanceReading {
  visible: boolean;
  timerDelayMs: number | null;
  longTasks: number | null;
  longestTaskMs: number | null;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function milliseconds(value: unknown): number | null {
  const seconds = number(value);
  return seconds === null ? null : seconds * 1000;
}

export function readAudioPerformance(
  context: unknown,
  sounds: readonly { isPlaying: boolean; playbacks: readonly unknown[] }[],
): AudioPerformanceReading {
  const ctx = record(context);
  const stats = record(ctx.playbackStats);
  return {
    time: performance.now(),
    contextState: typeof ctx.state === 'string' ? ctx.state : 'unavailable',
    audioTime: number(ctx.currentTime),
    sampleRate: number(ctx.sampleRate),
    baseLatencyMs: milliseconds(ctx.baseLatency),
    outputLatencyMs: milliseconds(ctx.outputLatency),
    underrunEvents: number(stats.underrunEvents),
    underrunSeconds: number(stats.underrunDuration),
    totalSeconds: number(stats.totalDuration),
    mediaSounds: sounds.length,
    playingMediaSounds: sounds.filter((sound) => sound.isPlaying).length,
    mediaPlaybacks: sounds.reduce((sum, sound) => sum + sound.playbacks.length, 0),
  };
}

/** Nothing runs until explicitly started; stop releases the timer and observer. */
export function captureAudioPerformance(
  read: () => AudioPerformanceReading,
  receive: (sample: AudioPerformanceSample) => void,
): () => void {
  let active = true;
  let longTasks = 0;
  let longestTaskMs = 0;
  const supportsLongTasks =
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes('longtask');
  const observer = supportsLongTasks
    ? new PerformanceObserver((list) => {
        if (!active) return;
        for (const entry of list.getEntries()) {
          longTasks += 1;
          longestTaskMs = Math.max(longestTaskMs, entry.duration);
        }
      })
    : null;
  observer?.observe({ type: 'longtask' });
  let expected = performance.now() + 1000;
  let previouslyVisible = !document.hidden;
  const visibilityChanged = () => {
    if (document.hidden) previouslyVisible = false;
  };
  document.addEventListener('visibilitychange', visibilityChanged);
  const sample = (initial = false) => {
    const reading = read();
    const visible = !document.hidden;
    receive({
      ...reading,
      visible,
      timerDelayMs:
        initial || !visible || !previouslyVisible ? null : Math.max(0, reading.time - expected),
      longTasks: supportsLongTasks ? longTasks : null,
      longestTaskMs: supportsLongTasks ? longestTaskMs : null,
    });
    expected = reading.time + 1000;
    previouslyVisible = visible;
    longTasks = 0;
    longestTaskMs = 0;
  };
  sample(true);
  const timer = setInterval(sample, 1000);
  return () => {
    active = false;
    clearInterval(timer);
    observer?.disconnect();
    document.removeEventListener('visibilitychange', visibilityChanged);
  };
}
