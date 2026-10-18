export interface DeadlineTimer {
  readonly id: string;
  readonly label: string;
  readonly deadlineServerMs: number;
}
export interface TimerUpdate {
  readonly requestId?: string;
  readonly clockId: string;
  readonly revision: number;
  readonly timers: readonly DeadlineTimer[];
}
export interface TimerSnapshot {
  readonly clockId: string | null;
  readonly revision: number;
  readonly timers: readonly DeadlineTimer[];
  readonly received: boolean;
}

export function parseTimerUpdate(input: unknown): TimerUpdate | undefined {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const value = input as Record<string, unknown>;
  const id = (item: unknown, maximum = 128): item is string =>
    typeof item === 'string' && item.length > 0 && item.length <= maximum;
  if (
    !id(value.clockId) ||
    typeof value.revision !== 'number' ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    (value.requestId !== undefined && !id(value.requestId, 64)) ||
    !Array.isArray(value.timers) ||
    value.timers.length > 64
  )
    return undefined;
  const ids = new Set<string>();
  const timers: DeadlineTimer[] = [];
  for (const item of value.timers) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) return undefined;
    const entry = item as Record<string, unknown>;
    if (
      !id(entry.id) ||
      !id(entry.label, 256) ||
      ids.has(entry.id) ||
      typeof entry.deadlineServerMs !== 'number' ||
      !Number.isFinite(entry.deadlineServerMs) ||
      entry.deadlineServerMs < 0
    )
      return undefined;
    ids.add(entry.id);
    timers.push(
      Object.freeze({ id: entry.id, label: entry.label, deadlineServerMs: entry.deadlineServerMs }),
    );
  }
  return Object.freeze({
    clockId: value.clockId,
    revision: value.revision,
    timers: Object.freeze(timers),
    ...(value.requestId === undefined ? {} : { requestId: value.requestId }),
  });
}

/** Zero is presentation only; the server owns completion, failure and rewards. */
export function timerRemainingMs(
  timer: DeadlineTimer,
  serverNowMs: number | undefined,
): number | undefined {
  if (serverNowMs === undefined || !Number.isFinite(serverNowMs)) return undefined;
  return Math.max(0, timer.deadlineServerMs - serverNowMs);
}

export function formatTimerRemaining(remainingMs: number | undefined): string {
  if (remainingMs === undefined) return 'Synchronizing time…';
  if (remainingMs <= 0) return 'Time elapsed; waiting for the server.';
  const seconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes} min ${seconds % 60} sec remaining` : `${seconds} sec remaining`;
}
