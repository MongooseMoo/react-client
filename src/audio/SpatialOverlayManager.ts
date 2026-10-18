import type { Cacophony } from 'cacophony';

import { SpatialOverlay, type SpatialOverlayOptions } from './SpatialOverlay';

/**
 * Owns the live set of {@link SpatialOverlay}s by id and is the single place the
 * world listener yaw is applied to them.
 *
 * This replaces the old `syncAmbisonicRendererYaw` "rotate EVERY sound's renderer
 * to world yaw" loop, which had no way to keep an instrument head-stable. Here a
 * head-stable overlay simply ignores `setWorldYaw` (the opt-out lives in
 * {@link SpatialOverlay}), so one call rotates the world-tracking overlays and
 * leaves the sensor sphere put.
 */
export class SpatialOverlayManager {
  private readonly overlays = new Map<string, SpatialOverlay>();
  private worldYaw = 0;

  constructor(private readonly cacophony: Cacophony) {}

  /** Add an overlay by id. Re-adding an existing id destroys the previous one first. */
  addOverlay(id: string, options: SpatialOverlayOptions = {}): SpatialOverlay {
    this.removeOverlay(id);
    const overlay = SpatialOverlay.create(this.cacophony, { name: id, ...options });
    this.overlays.set(id, overlay);
    // A world-tracking overlay should adopt the current world yaw immediately so
    // it does not start at identity until the next listener update.
    overlay.setWorldYaw(this.worldYaw);
    return overlay;
  }

  get(id: string): SpatialOverlay | undefined {
    return this.overlays.get(id);
  }

  has(id: string): boolean {
    return this.overlays.has(id);
  }

  removeOverlay(id: string): void {
    const existing = this.overlays.get(id);
    if (existing) {
      existing.destroy();
      this.overlays.delete(id);
    }
  }

  /**
   * Apply the world listener yaw to every overlay. Head-stable overlays ignore it
   * internally; world-tracking overlays rotate to match. Idempotent per yaw value
   * is not assumed — callers drive this from listener-orientation updates.
   */
  setWorldYaw(yaw: number): void {
    this.worldYaw = yaw;
    for (const overlay of this.overlays.values()) {
      overlay.setWorldYaw(yaw);
    }
  }

  /** Rotate one overlay by an instrument-driven yaw (ship heading / contact bearing). */
  setInstrumentYaw(id: string, yaw: number): void {
    this.overlays.get(id)?.setInstrumentYaw(yaw);
  }

  /** Number of live overlays. */
  get size(): number {
    return this.overlays.size;
  }

  /** Destroy every overlay (scene teardown / disconnect). */
  destroyAll(): void {
    for (const overlay of this.overlays.values()) {
      overlay.destroy();
    }
    this.overlays.clear();
  }
}
