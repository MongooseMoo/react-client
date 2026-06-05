import type { SpatialEmitter } from '../gmcp/Client/Spatial';

import type { SpatialOverlayManager } from './SpatialOverlayManager';
import type { TransparencyDuck } from './TransparencyDuck';

/** A live overlay member playback the scene can stop when its emitter leaves. */
export interface OverlayMember {
  stop(): void;
}

/**
 * Builds (and routes into the overlay) a playback for one overlay-bound emitter.
 * Returns undefined if a playback cannot be created yet (e.g. the correlated
 * Media sound — keyed by `emitter.mediaKey` — has not arrived); the scene retries
 * on the next sync. Injected so the reconciler stays independent of the actual
 * cacophony/Media wiring (and unit-testable).
 */
export type OverlayMemberFactory = (
  emitter: SpatialEmitter,
  overlayId: string,
) => OverlayMember | undefined;

interface OverlayBucket {
  transparency: number;
  members: Map<string, OverlayMember>;
}

/**
 * Reconciles the server's overlay-bound emitters into live {@link SpatialOverlay}s
 * (via {@link SpatialOverlayManager}), their member playbacks, and the
 * {@link TransparencyDuck}. World (non-overlay) emitters are ignored here — they
 * stay on the existing PannerNode/Media path.
 *
 * Idempotent: call {@link syncScene} with the full emitter list on every scene
 * snapshot. Overlays/members absent from the new snapshot are torn down; new ones
 * are created; surviving members are left playing untouched (no restart) so a
 * scene refresh does not stutter a continuing contact tone.
 */
export class SpatialOverlayScene {
  private readonly overlays = new Map<string, OverlayBucket>();

  constructor(
    private readonly manager: SpatialOverlayManager,
    private readonly duck: TransparencyDuck,
    private readonly memberFactory: OverlayMemberFactory,
  ) {}

  syncScene(emitters: SpatialEmitter[]): void {
    const grouped = new Map<string, SpatialEmitter[]>();
    for (const emitter of emitters) {
      if (!emitter.overlay) {
        continue;
      }
      const list = grouped.get(emitter.overlay);
      if (list) {
        list.push(emitter);
      } else {
        grouped.set(emitter.overlay, [emitter]);
      }
    }

    for (const id of [...this.overlays.keys()]) {
      if (!grouped.has(id)) {
        this.teardownOverlay(id);
      }
    }

    for (const [id, members] of grouped) {
      this.reconcileOverlay(id, members);
    }
  }

  /** Tear down every overlay (scene teardown / disconnect). */
  clear(): void {
    for (const id of [...this.overlays.keys()]) {
      this.teardownOverlay(id);
    }
  }

  /** Number of live overlays the scene is tracking. */
  get size(): number {
    return this.overlays.size;
  }

  private reconcileOverlay(id: string, emitters: SpatialEmitter[]): void {
    let bucket = this.overlays.get(id);
    if (!bucket) {
      const headStable = emitters.some((e) => e.frame === 'head');
      this.manager.addOverlay(id, { headStable });
      bucket = { transparency: 1, members: new Map() };
      this.overlays.set(id, bucket);
    }

    const present = new Set(emitters.map((e) => e.id));
    for (const [emitterId, member] of [...bucket.members]) {
      if (!present.has(emitterId)) {
        member.stop();
        bucket.members.delete(emitterId);
      }
    }

    // Retry-safe: only create a member for an emitter not already live.
    for (const emitter of emitters) {
      if (bucket.members.has(emitter.id)) {
        continue;
      }
      const member = this.memberFactory(emitter, id);
      if (member) {
        bucket.members.set(emitter.id, member);
      }
    }

    // Most-opaque declared transparency wins (mirrors the duck's own min rule).
    const transparency = emitters.reduce(
      (min, e) => (e.transparency !== undefined ? Math.min(min, e.transparency) : min),
      1,
    );
    bucket.transparency = transparency;
    this.duck.activate(id, transparency);
  }

  private teardownOverlay(id: string): void {
    const bucket = this.overlays.get(id);
    if (!bucket) {
      return;
    }
    for (const member of bucket.members.values()) {
      member.stop();
    }
    bucket.members.clear();
    this.overlays.delete(id);
    this.manager.removeOverlay(id);
    this.duck.deactivate(id);
  }
}
