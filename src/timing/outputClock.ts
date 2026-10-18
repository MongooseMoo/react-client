export interface OutputClockSnapshot {
  running: boolean;
  currentTime: number;
  performanceNowMs: number;
  outputTimestamp?: { contextTime: number; performanceTime: number };
}

export interface AudioTimeMapping {
  audioTime: number;
  clock: 'output' | 'render';
  acousticOffsetKnown: boolean;
}

/** Rendered samples lead heard output; an unavailable output clock implies no measurable lead. */
export function outputDelaySeconds(snapshot: OutputClockSnapshot): number {
  const heard = performanceToAudioTime(snapshot.performanceNowMs, snapshot);
  return heard?.clock === 'output' ? Math.max(0, snapshot.currentTime - heard.audioTime) : 0;
}

/** Read a new snapshot on every scheduler wake; apply the user's correction once. */
export function performanceToAudioTime(
  targetPerformanceMs: number,
  snapshot: OutputClockSnapshot,
  correctionMs = 0,
): AudioTimeMapping | undefined {
  if (
    !snapshot.running ||
    !Number.isFinite(snapshot.currentTime) ||
    snapshot.currentTime < 0 ||
    !Number.isFinite(snapshot.performanceNowMs) ||
    snapshot.performanceNowMs < 0 ||
    !Number.isFinite(targetPerformanceMs) ||
    !Number.isFinite(correctionMs) ||
    Math.abs(correctionMs) > 500
  )
    return undefined;
  const timestamp = snapshot.outputTimestamp;
  const usable =
    timestamp !== undefined &&
    Number.isFinite(timestamp.contextTime) &&
    timestamp.contextTime > 0 &&
    Number.isFinite(timestamp.performanceTime) &&
    timestamp.performanceTime >= 0 &&
    Math.abs(timestamp.performanceTime - snapshot.performanceNowMs) <= 1000;
  const anchorAudio = usable ? timestamp.contextTime : snapshot.currentTime;
  const anchorPerformance = usable ? timestamp.performanceTime : snapshot.performanceNowMs;
  return {
    audioTime: anchorAudio + (targetPerformanceMs + correctionMs - anchorPerformance) / 1000,
    clock: usable ? 'output' : 'render',
    acousticOffsetKnown: usable,
  };
}
