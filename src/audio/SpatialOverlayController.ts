import type { Cacophony } from 'cacophony';

import type { SpatialEmitter } from '../gmcp/Client/Spatial';
import { SpatialOverlayManager } from './SpatialOverlayManager';
import { SpatialOverlayScene, type OverlayMemberFactory } from './SpatialOverlayScene';
import { TransparencyDuck, type DuckSink } from './TransparencyDuck';

export interface SpatialOverlayControllerOptions {
  /** What the transparency duck dips (the world submix bus, or master). */
  worldSink: DuckSink;
  /**
   * Turns one overlay-bound emitter into a routed {@link OverlayMember}. This is
   * the single point that couples to Client.Media (correlate `emitter.mediaKey`
   * to the live sound and route it into the overlay's bus/renderer); injected so
   * the orchestration here stays testable and engine-agnostic.
   */
  memberFactory: OverlayMemberFactory;
  /** Duck ramp time (ms). */
  duckRampMs?: number;
}

/**
 * The single client-side entry point for the overlay system. Owns the
 * {@link SpatialOverlayManager}, {@link TransparencyDuck}, and
 * {@link SpatialOverlayScene}, and exposes the four drives the GMCP client wires
 * to live events:
 *
 * - `handleScene(emitters)` ← Client.Spatial `spatialScene` / emitter start+stop
 * - `handleWorldYaw(yaw)`   ← world listener orientation updates
 * - `setInstrumentYaw(...)` ← ship heading / contact bearing for a sensor sphere
 * - `clear()`               ← disconnect / scene reset
 *
 * Everything below is composed from already-tested units; this class is the thin
 * wiring that keeps the live hookup (in the GMCP client) a few line calls.
 */
export class SpatialOverlayController {
  readonly manager: SpatialOverlayManager;
  readonly duck: TransparencyDuck;
  readonly scene: SpatialOverlayScene;

  constructor(cacophony: Cacophony, options: SpatialOverlayControllerOptions) {
    this.manager = new SpatialOverlayManager(cacophony);
    this.duck = new TransparencyDuck(options.worldSink, options.duckRampMs);
    this.scene = new SpatialOverlayScene(this.manager, this.duck, options.memberFactory);
  }

  /** Reconcile overlays + members + duck against a full scene snapshot. */
  handleScene(emitters: SpatialEmitter[]): void {
    this.scene.syncScene(emitters);
  }

  /** Rotate world-tracking overlays to the world listener yaw (head-stable opt out). */
  handleWorldYaw(yaw: number): void {
    this.manager.setWorldYaw(yaw);
  }

  /** Rotate one overlay by an instrument-driven yaw (ship heading / contact bearing). */
  setInstrumentYaw(overlayId: string, yaw: number): void {
    this.manager.setInstrumentYaw(overlayId, yaw);
  }

  /** Tear down every overlay, member, and duck state (disconnect / reset). */
  clear(): void {
    this.scene.clear();
    this.manager.destroyAll();
    this.duck.clear();
  }
}
