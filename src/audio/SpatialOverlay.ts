import type { Bus, Cacophony } from 'cacophony';

import { AmbisonicRenderer } from './AmbisonicRenderer';

export interface SpatialOverlayOptions {
  /** Stable name for the overlay's bus (registry lookup), or undefined for anonymous. */
  name?: string;
  /**
   * Head-stable overlay (e.g. a sensor-sphere instrument on a headset with NO
   * head tracking): its FOA rotation does NOT follow the world listener yaw, so
   * the field stays put when the operator turns (chair spin). `setWorldYaw()` is
   * ignored; only `setInstrumentYaw()` (ship heading / contact bearing) rotates
   * it. A non-head-stable overlay tracks the world yaw like the world scene.
   *
   * This is the corrected sensor-sphere anchor model (design §13): a head-stable
   * heading-up instrument, NOT head-tracked AR — no "subtract head orientation".
   */
  headStable?: boolean;
  /** Initial bus output gain (0..1). Default leaves the bus at its own default. */
  gain?: number;
}

/**
 * One overlay submix: a cacophony {@link Bus} that member sounds sum into,
 * optionally decoded through its OWN omnitone FOA renderer with an independent
 * rotation.
 *
 * This is the "overlay = bus + own FOA renderer + members + own rotation" object
 * the sound-scene design (P5) needs and the engine does not provide — a
 * composition of existing cacophony/omnitone primitives, not an engine change.
 *
 * Rotation independence is the enabler for the sensor sphere: omnitone's FOA
 * rotation is set directly on the renderer (`setRotationMatrix3`), decoupled from
 * the Web Audio AudioListener that the world's PannerNode sounds follow. A
 * head-stable overlay therefore stays put when the operator turns; only ship
 * maneuvering / a contact moving rotates its field.
 */
export class SpatialOverlay {
  readonly bus: Bus;
  readonly headStable: boolean;
  private renderer?: AmbisonicRenderer;
  private destroyed = false;

  private constructor(private readonly cacophony: Cacophony, bus: Bus, headStable: boolean) {
    this.bus = bus;
    this.headStable = headStable;
  }

  /** Create an overlay submix bus (named or anonymous), auto-connected to master. */
  static create(cacophony: Cacophony, options: SpatialOverlayOptions = {}): SpatialOverlay {
    const bus = cacophony.createBus(options.name);
    const overlay = new SpatialOverlay(cacophony, bus, options.headStable ?? false);
    if (options.gain !== undefined) {
      bus.gain = options.gain;
    }
    return overlay;
  }

  /**
   * Attach an omnitone FOA renderer to this overlay. Member ambisonic playbacks
   * decode through it and its binaural output feeds THIS overlay's bus (not
   * master), so the overlay can be ducked/occluded as a unit. The renderer's
   * rotation is this overlay's own — independent of the world listener.
   */
  async attachRenderer(inputChannels: number): Promise<AmbisonicRenderer> {
    this.renderer = await AmbisonicRenderer.create(this.cacophony, inputChannels);
    return this.renderer;
  }

  /**
   * Route a decoded member playback into this overlay: through the FOA renderer
   * (if attached) whose output feeds the overlay bus, or straight to the bus
   * input. Member sounds sum on the overlay bus, so they share its rotation,
   * gain, and any occlusion filter.
   */
  addMember(playback: Parameters<AmbisonicRenderer['attachPlayback']>[0]): void {
    if (this.destroyed) {
      return;
    }
    if (this.renderer) {
      this.renderer.attachPlayback(playback, this.bus.input);
    } else {
      playback.disconnect();
      playback.connect(this.bus.input);
    }
  }

  /**
   * Apply the world listener yaw. A head-stable overlay IGNORES it (stays at its
   * instrument-driven rotation); a world-tracking overlay rotates its renderer to
   * match. The global `syncAmbisonicRendererYaw` loop routes world yaw HERE, and
   * a head-stable overlay drops it — the opt-out the feasibility survey flagged.
   */
  setWorldYaw(yaw: number): void {
    if (this.headStable || !this.renderer) {
      return;
    }
    this.renderer.setRotationMatrixFromYaw(yaw);
  }

  /**
   * Rotate the overlay's field by an instrument-driven yaw (ship heading /
   * contact bearing for the sensor sphere). Applies regardless of head-stable —
   * this is the ONLY rotation source for a head-stable overlay.
   */
  setInstrumentYaw(yaw: number): void {
    this.renderer?.setRotationMatrixFromYaw(yaw);
  }

  /**
   * Ramp the overlay bus output gain to `gain` over `rampMs` (0 = instant). Used
   * to fade an overlay in/out and as the transparency duck handle (dipping this
   * overlay, or — applied to the world bus — dipping the world under this
   * overlay).
   */
  rampGain(gain: number, rampMs = 0): void {
    if (this.destroyed) {
      return;
    }
    if (rampMs > 0) {
      const param = this.bus.output.gain;
      const now = this.cacophony.context.currentTime;
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(gain, now + rampMs / 1000);
    } else {
      this.bus.gain = gain;
    }
  }

  /** Tear down the overlay: clean up its renderer and destroy its bus. Idempotent. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.renderer?.cleanup();
    this.renderer = undefined;
    if (!this.bus.destroyed) {
      this.bus.destroy();
    }
  }
}
