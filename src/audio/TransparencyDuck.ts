/**
 * Anything whose level can be ramped — a {@link SpatialOverlay} or a bus wrapper.
 * The duck only needs to push a target gain; it does not own the world sink.
 */
export interface DuckSink {
  rampGain(gain: number, rampMs?: number): void;
}

/**
 * The transparency duck (design §10): while one or more overlays are audible, the
 * WORLD is dipped so the overlay reads clearly, by an amount each overlay
 * declares as its transparency.
 *
 * - transparency = 1 → fully transparent, world is NOT dipped under this overlay.
 * - transparency = 0 → opaque, world is fully ducked to silence under it.
 *
 * With several overlays active the most opaque one wins (the world target is the
 * MIN transparency across active overlays). When the last overlay deactivates the
 * world returns to unity. All changes are ramped to avoid clicks.
 *
 * The world sink is injected (structural {@link DuckSink}) so this controller is
 * independent of whether "the world" is the master bus, a dedicated world submix
 * bus, or a test double.
 */
export class TransparencyDuck {
  private readonly active = new Map<string, number>();

  constructor(
    private readonly worldSink: DuckSink,
    private readonly rampMs = 120,
  ) {}

  /** Mark overlay `id` audible with its `transparency` (0..1); re-applies the duck. */
  activate(id: string, transparency: number): void {
    this.active.set(id, clamp01(transparency));
    this.apply();
  }

  /** Mark overlay `id` no longer audible; re-applies the duck. No-op if absent. */
  deactivate(id: string): void {
    if (this.active.delete(id)) {
      this.apply();
    }
  }

  /** Drop all overlays (scene teardown) and restore the world to unity. */
  clear(): void {
    if (this.active.size === 0) {
      return;
    }
    this.active.clear();
    this.apply();
  }

  /** Current world target gain (min transparency across active overlays, else 1). */
  get worldGain(): number {
    let gain = 1;
    for (const transparency of this.active.values()) {
      gain = Math.min(gain, transparency);
    }
    return gain;
  }

  private apply(): void {
    this.worldSink.rampGain(this.worldGain, this.rampMs);
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(1, Math.max(0, value));
}
