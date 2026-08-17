import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_TWEEN_SPEED,
  MAX_TWEEN_DURATION_MS,
  MIN_TWEEN_DURATION_MS,
  VectorTweener,
  type TweenScheduler,
} from './vectorTween';

/** Manual clock + frame queue so tests drive the tweener deterministically. */
function harness() {
  let now = 0;
  let queued: (() => void) | null = null;
  const scheduler: TweenScheduler = {
    schedule: (callback) => {
      queued = callback;
      return callback;
    },
    cancel: (handle) => {
      if (queued === handle) {
        queued = null;
      }
    },
  };
  const tweener = new VectorTweener({ scheduler, now: () => now });
  const step = (ms: number) => {
    now += ms;
    const frame = queued;
    queued = null;
    frame?.();
  };
  return { tweener, step, hasFrame: () => queued !== null };
}

describe('VectorTweener', () => {
  it('snaps immediately when there is no starting position', () => {
    const { tweener, hasFrame } = harness();
    const apply = vi.fn();

    tweener.tween('k', null, [1, 2, 3], apply);

    expect(apply).toHaveBeenCalledOnce();
    expect(apply).toHaveBeenCalledWith([1, 2, 3], true);
    expect(hasFrame()).toBe(false);
  });

  it('snaps when the delta is negligible', () => {
    const { tweener, hasFrame } = harness();
    const apply = vi.fn();

    tweener.tween('k', [1, 2, 3], [1, 2, 3.0000001], apply);

    expect(apply).toHaveBeenCalledOnce();
    expect(apply).toHaveBeenCalledWith([1, 2, 3.0000001], true);
    expect(hasFrame()).toBe(false);
  });

  it('interpolates linearly at the speed-derived duration', () => {
    const { tweener, step } = harness();
    const apply = vi.fn();

    // 1m at the 2 m/s default = 500ms (inside the clamp window).
    tweener.tween('k', [0, 0, 0], [1, 0, 0], apply, { speed: DEFAULT_TWEEN_SPEED });

    step(250);
    expect(apply).toHaveBeenLastCalledWith([0.5, 0, 0], false);
    step(250);
    expect(apply).toHaveBeenLastCalledWith([1, 0, 0], true);
    expect(apply).toHaveBeenCalledTimes(2);
  });

  it('clamps very short and very long glides', () => {
    const { tweener, step } = harness();
    const shortApply = vi.fn();
    const longApply = vi.fn();

    tweener.tween('short', [0, 0, 0], [0.01, 0, 0], shortApply, { speed: 100 });
    tweener.tween('long', [0, 0, 0], [100, 0, 0], longApply, { speed: 0.001 });

    step(MIN_TWEEN_DURATION_MS);
    expect(shortApply).toHaveBeenLastCalledWith([0.01, 0, 0], true);
    expect(longApply).toHaveBeenLastCalledWith(
      [expect.closeTo((MIN_TWEEN_DURATION_MS / MAX_TWEEN_DURATION_MS) * 100, 5), 0, 0],
      false,
    );

    step(MAX_TWEEN_DURATION_MS - MIN_TWEEN_DURATION_MS);
    expect(longApply).toHaveBeenLastCalledWith([100, 0, 0], true);
  });

  it('retargets mid-flight from the last applied value', () => {
    const { tweener, step } = harness();
    const apply = vi.fn();

    tweener.tween('k', [0, 0, 0], [2, 0, 0], apply, { durationMs: 400 });
    step(200); // halfway: [1, 0, 0]

    // New target; the stale "from" argument must be ignored.
    tweener.tween('k', [999, 999, 999], [1, 4, 0], apply, { durationMs: 300 });
    step(150);
    expect(apply).toHaveBeenLastCalledWith([1, 2, 0], false);
    step(150);
    expect(apply).toHaveBeenLastCalledWith([1, 4, 0], true);
  });

  it('renormalizes interpolated orientation axes (nlerp)', () => {
    const { tweener, step } = harness();
    const apply = vi.fn();

    tweener.tween('fwd', [1, 0, 0], [0, 0, 1], apply, { durationMs: 100, normalize: true });

    step(50);
    const [value, done] = apply.mock.lastCall!;
    expect(done).toBe(false);
    expect(Math.hypot(value[0], value[1], value[2])).toBeCloseTo(1, 10);
    expect(value[0]).toBeCloseTo(Math.SQRT1_2, 10);
    expect(value[2]).toBeCloseTo(Math.SQRT1_2, 10);
  });

  it('runs independent keys through one shared frame loop', () => {
    const { tweener, step } = harness();
    const a = vi.fn();
    const b = vi.fn();

    tweener.tween('a', [0, 0, 0], [1, 0, 0], a, { durationMs: 100 });
    tweener.tween('b', [0, 0, 0], [0, 2, 0], b, { durationMs: 200 });

    step(100);
    expect(a).toHaveBeenLastCalledWith([1, 0, 0], true);
    expect(b).toHaveBeenLastCalledWith([0, 1, 0], false);
    step(100);
    expect(b).toHaveBeenLastCalledWith([0, 2, 0], true);
  });

  it('cancel and cancelAll stop delivery without a final apply', () => {
    const { tweener, step, hasFrame } = harness();
    const a = vi.fn();
    const b = vi.fn();

    tweener.tween('a', [0, 0, 0], [1, 0, 0], a, { durationMs: 100 });
    tweener.tween('b', [0, 0, 0], [0, 1, 0], b, { durationMs: 100 });
    tweener.cancel('a');
    step(100);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledOnce();

    tweener.tween('b', [0, 1, 0], [0, 2, 0], b, { durationMs: 100 });
    tweener.cancelAll();
    expect(hasFrame()).toBe(false);
    step(100);
    expect(b).toHaveBeenCalledOnce();
  });

  it('snap cancels an in-flight tween for the same key', () => {
    const { tweener, step } = harness();
    const apply = vi.fn();

    tweener.tween('k', [0, 0, 0], [10, 0, 0], apply, { durationMs: 100 });
    tweener.snap('k', [5, 5, 5], apply);
    expect(apply).toHaveBeenCalledOnce();
    expect(apply).toHaveBeenCalledWith([5, 5, 5], true);

    step(100);
    expect(apply).toHaveBeenCalledOnce();
  });
});
