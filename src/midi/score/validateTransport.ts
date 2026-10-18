import type { MediaTransport, ScoreTransport, TransportState } from './types';

type Validation =
  | { ok: true; transport: ScoreTransport | MediaTransport }
  | { ok: false; error: string };
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= Number.MAX_SAFE_INTEGER;
const tick = (value: unknown): value is number => finite(value) && Number.isSafeInteger(value);
const id = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 128;
const state = (value: unknown): value is TransportState =>
  value === 'preparing' || value === 'playing' || value === 'paused' || value === 'stopped';

export function validateTransport(input: unknown): Validation {
  if (
    !object(input) ||
    input.version !== 1 ||
    !id(input.clockId) ||
    !id(input.sourceId) ||
    !tick(input.revision) ||
    !state(input.state) ||
    !finite(input.anchorServerMs)
  )
    return { ok: false, error: 'Invalid transport identity or anchor' };
  const common = {
    version: 1 as const,
    clockId: input.clockId,
    sourceId: input.sourceId,
    revision: input.revision,
    state: input.state,
    anchorServerMs: input.anchorServerMs,
  };
  if (input.kind === 'score') {
    if (
      'rate' in input ||
      !tick(input.anchorTick) ||
      (input.durationTicks !== undefined && !tick(input.durationTicks))
    )
      return { ok: false, error: 'Invalid score transport' };
    let loop: ScoreTransport['loop'];
    if (input.loop !== undefined) {
      const value = input.loop;
      if (
        !object(value) ||
        !tick(value.startTick) ||
        !tick(value.endTick) ||
        value.endTick <= value.startTick ||
        (value.plays !== -1 && (!tick(value.plays) || value.plays < 1)) ||
        (input.durationTicks !== undefined && value.endTick > input.durationTicks) ||
        (value.plays !== -1 &&
          !Number.isSafeInteger(value.startTick + value.plays * (value.endTick - value.startTick)))
      )
        return { ok: false, error: 'Invalid score loop' };
      loop = Object.freeze({
        startTick: value.startTick,
        endTick: value.endTick,
        plays: value.plays,
      });
    } else if (input.durationTicks !== undefined && input.anchorTick > input.durationTicks)
      return { ok: false, error: 'Score anchor exceeds duration' };
    return {
      ok: true,
      transport: Object.freeze({
        ...common,
        kind: 'score',
        anchorTick: input.anchorTick,
        ...(input.durationTicks === undefined ? {} : { durationTicks: input.durationTicks }),
        ...(loop ? { loop } : {}),
      }),
    };
  }
  if (input.kind === 'media') {
    if (
      !finite(input.positionMs) ||
      !finite(input.rate) ||
      input.rate <= 0 ||
      (input.mode !== 'finite' && input.mode !== 'live') ||
      (input.durationMs !== undefined && !finite(input.durationMs))
    )
      return { ok: false, error: 'Invalid media transport' };
    let loop: MediaTransport['loop'];
    if (input.loop !== undefined) {
      const value = input.loop;
      if (
        input.mode === 'live' ||
        !object(value) ||
        !finite(value.startMs) ||
        !finite(value.endMs) ||
        value.endMs <= value.startMs ||
        (value.plays !== -1 && (!tick(value.plays) || value.plays < 1)) ||
        (input.durationMs !== undefined && value.endMs > input.durationMs) ||
        (value.plays !== -1 && !finite(value.startMs + value.plays * (value.endMs - value.startMs)))
      )
        return { ok: false, error: 'Invalid media loop' };
      loop = Object.freeze({ startMs: value.startMs, endMs: value.endMs, plays: value.plays });
    } else if (input.durationMs !== undefined && input.positionMs > input.durationMs)
      return { ok: false, error: 'Media position exceeds duration' };
    return {
      ok: true,
      transport: Object.freeze({
        ...common,
        kind: 'media',
        positionMs: input.positionMs,
        rate: input.rate,
        mode: input.mode,
        ...(input.durationMs === undefined ? {} : { durationMs: input.durationMs }),
        ...(loop ? { loop } : {}),
      }),
    };
  }
  return { ok: false, error: 'Unknown transport kind' };
}
