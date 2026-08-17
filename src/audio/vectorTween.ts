/**
 * Frame-driven interpolation for spatial vectors (positions and orientation
 * axes). The MOO teleports things in whole-step increments — one EntityMove
 * per metre — so applying its coordinates directly makes sources leap around
 * the listener's head. Everything that moves smoothly on screen and in the
 * mix funnels through here instead: callers hand the tweener a target (and
 * the mover's speed, when the server sent one) and receive per-frame
 * interpolated values until arrival.
 *
 * One tweener instance runs at most one animation-frame loop no matter how
 * many keys are in flight. Retargeting a key mid-tween continues from the
 * last applied value, so a burst of EntityMoves chains into one continuous
 * glide instead of restarting from stale coordinates.
 */

export type TweenableVector = readonly number[];

/** Per-frame consumer of an in-flight tween. `done` marks the final frame. */
export type TweenApply = (value: [number, number, number], done: boolean) => void;

export interface TweenOptions {
  /**
   * Mover speed in world units/second — normally the magnitude of the GMCP
   * velocity. Duration becomes distance/speed, clamped to the range below.
   */
  speed?: number;
  /** Explicit duration override (used for orientation turns). */
  durationMs?: number;
  /**
   * Renormalize each interpolated value to unit length — nlerp, for
   * orientation axes. Falls back to the target when the lerp collapses
   * (opposite vectors), which cannot happen for the ≤90° turns the MOO sends.
   */
  normalize?: boolean;
}

export interface TweenScheduler {
  /** Schedule `callback` for the next animation frame (or equivalent). */
  schedule(callback: () => void): unknown;
  cancel(handle: unknown): void;
}

/** Server default walk speed (m/s); used when a move carries no velocity. */
export const DEFAULT_TWEEN_SPEED = 2;
/** Clamp: fast enough that short hops never feel laggy… */
export const MIN_TWEEN_DURATION_MS = 80;
/** …slow enough that a long glide never turns into minutes of drift. */
export const MAX_TWEEN_DURATION_MS = 600;
/** Deltas below this are inaudible — apply them without animating. */
const SNAP_DISTANCE = 1e-3;
/** setTimeout fallback cadence when requestAnimationFrame is unavailable. */
const FALLBACK_FRAME_MS = 16;

function defaultScheduler(): TweenScheduler {
  if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
    return {
      schedule: (callback) => requestAnimationFrame(() => callback()),
      cancel: (handle) => cancelAnimationFrame(handle as number),
    };
  }
  return {
    schedule: (callback) => setTimeout(callback, FALLBACK_FRAME_MS),
    cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  };
}

function isVector(value: TweenableVector | null | undefined): value is TweenableVector {
  return (
    !!value &&
    value.length >= 3 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]) &&
    Number.isFinite(value[2])
  );
}

function toTriple(value: TweenableVector): [number, number, number] {
  return [value[0], value[1], value[2]];
}

function distanceBetween(a: TweenableVector, b: TweenableVector): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}

interface ActiveTween {
  from: [number, number, number];
  to: [number, number, number];
  startMs: number;
  durationMs: number;
  normalize: boolean;
  apply: TweenApply;
  last: [number, number, number];
}

export class VectorTweener {
  private readonly active = new Map<unknown, ActiveTween>();
  private readonly scheduler: TweenScheduler;
  private readonly now: () => number;
  private frameHandle: unknown;

  constructor(options?: { scheduler?: TweenScheduler; now?: () => number }) {
    this.scheduler = options?.scheduler ?? defaultScheduler();
    this.now = options?.now ?? (() => performance.now());
  }

  /**
   * Glide `key` from `from` (or its in-flight value) to `to`, feeding `apply`
   * each frame. Snaps — one immediate `apply(to, true)` — when there is no
   * starting point or the delta is negligible.
   */
  tween(
    key: unknown,
    from: TweenableVector | null | undefined,
    to: TweenableVector,
    apply: TweenApply,
    options?: TweenOptions,
  ): void {
    const inFlight = this.active.get(key);
    const origin = inFlight?.last ?? (isVector(from) ? toTriple(from) : null);
    if (!origin || !isVector(to)) {
      this.snap(key, to, apply);
      return;
    }
    const target = toTriple(to);
    const distance = distanceBetween(origin, target);
    if (distance <= SNAP_DISTANCE) {
      this.snap(key, target, apply);
      return;
    }
    const durationMs = this.durationFor(distance, options);
    this.active.set(key, {
      from: origin,
      to: target,
      startMs: this.now(),
      durationMs,
      normalize: options?.normalize ?? false,
      apply,
      last: origin,
    });
    this.ensureFrame();
  }

  /** Apply `to` immediately, cancelling any tween in flight for `key`. */
  snap(key: unknown, to: TweenableVector, apply: TweenApply): void {
    this.active.delete(key);
    apply(toTriple(to), true);
  }

  cancel(key: unknown): void {
    this.active.delete(key);
  }

  cancelAll(): void {
    this.active.clear();
    if (this.frameHandle !== undefined) {
      this.scheduler.cancel(this.frameHandle);
      this.frameHandle = undefined;
    }
  }

  private durationFor(distance: number, options?: TweenOptions): number {
    if (options?.durationMs !== undefined && Number.isFinite(options.durationMs)) {
      return Math.max(0, options.durationMs);
    }
    const speed =
      options?.speed !== undefined && Number.isFinite(options.speed) && options.speed > 0
        ? options.speed
        : DEFAULT_TWEEN_SPEED;
    const durationMs = (distance / speed) * 1000;
    return Math.min(MAX_TWEEN_DURATION_MS, Math.max(MIN_TWEEN_DURATION_MS, durationMs));
  }

  private ensureFrame(): void {
    if (this.frameHandle !== undefined) {
      return;
    }
    this.frameHandle = this.scheduler.schedule(() => {
      this.frameHandle = undefined;
      this.step();
    });
  }

  private step(): void {
    const nowMs = this.now();
    for (const [key, tween] of Array.from(this.active.entries())) {
      const elapsed = nowMs - tween.startMs;
      const t = tween.durationMs <= 0 ? 1 : Math.min(1, elapsed / tween.durationMs);
      const value = this.interpolate(tween, t);
      tween.last = value;
      const done = t >= 1;
      if (done) {
        this.active.delete(key);
      }
      tween.apply(value, done);
    }
    if (this.active.size > 0) {
      this.ensureFrame();
    }
  }

  private interpolate(tween: ActiveTween, t: number): [number, number, number] {
    const { from, to } = tween;
    const value: [number, number, number] = [
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t,
    ];
    if (!tween.normalize) {
      return value;
    }
    const length = Math.hypot(value[0], value[1], value[2]);
    if (length < 1e-6) {
      return [...to];
    }
    return [value[0] / length, value[1] / length, value[2] / length];
  }
}
