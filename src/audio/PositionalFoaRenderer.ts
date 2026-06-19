import type { Cacophony, AudioNode as CacophonyAudioNode, Playback } from 'cacophony';
import { encodeMonoToFoaSN3D, type FoaDecoder } from 'cacophony';

import { sourceBearing, type Vec3 } from './foaBearing';

/**
 * Positional first-order-ambisonic renderer — the physically-correct,
 * constant-gain path cacophony's own docs prescribe:
 *
 *   playback → mono downmix → [gW,gY,gZ,gX] encode gains → merge(4) →
 *   FoaDecoder (SN3D/ACN → binaural) → level gain → output
 *
 * The encode gains come from {@link encodeMonoToFoaSN3D} (W=1,
 * Y=cosφ·sinθ, Z=sinφ, X=cosφ·cosθ) for the source's bearing **relative to the
 * listener's head**, so the source sits at a real spot: turn and it swings
 * around you, walk and it changes bearing + level. This replaces the dormant
 * perceptual `StereoToFoaUpmixer` (`createStereoToBFormatNode`), whose
 * frequency-banded, coherence-gated, non-constant-gain mix is the documented
 * source of the level loss + crackle on a plain stereo stream.
 *
 * v1 collapses a stereo source to mono — a positioned object is a point emitter,
 * and a point has one direction. Preserving stereo *width* (encode L/R at
 * azimuth ± a spread) is a clean later extension over this same graph.
 */
export class PositionalFoaRenderer {
  private attachedPlayback?: Playback;
  /** Mono downmix feeding the four encode gains. */
  private monoGain?: GainNode;
  /** Encode gains in ACN order [W, Y, Z, X]. */
  private encodeGains: GainNode[] = [];
  /** Post-decode level = makeup × distance attenuation. */
  private levelGain?: GainNode;
  private makeup = 1;
  private distanceAttenuation = 1;

  private constructor(
    private readonly cacophony: Cacophony,
    private readonly decoder: FoaDecoder,
  ) {}

  static async create(cacophony: Cacophony, makeup = 1): Promise<PositionalFoaRenderer> {
    const decoder = await cacophony.createFoaDecoder();
    const renderer = new PositionalFoaRenderer(cacophony, decoder);
    renderer.makeup = Number.isFinite(makeup) && makeup > 0 ? makeup : 1;
    return renderer;
  }

  private get context(): BaseAudioContext {
    return this.cacophony.context as unknown as BaseAudioContext;
  }

  /**
   * Wire the playback through the encode → decode graph, routing binaural output
   * to `outputTarget` (an effect bus input) or master when omitted. Mirrors
   * AmbisonicRenderer.attachPlayback's contract so the two are interchangeable
   * in MediaService.
   */
  attachPlayback(playback: Playback, outputTarget?: CacophonyAudioNode): void {
    this.attachedPlayback = playback;
    playback.disconnect();

    const ctx = this.context;

    // Force a mono downmix: a positioned point source has a single direction.
    const monoGain = ctx.createGain();
    monoGain.channelCount = 1;
    monoGain.channelCountMode = 'explicit';
    monoGain.channelInterpretation = 'speakers';
    this.monoGain = monoGain;

    const merger = ctx.createChannelMerger(4);
    this.encodeGains = [];
    for (let i = 0; i < 4; i++) {
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 1 : 0; // start front-ish (W=1), updated by setBearing
      (monoGain as unknown as CacophonyAudioNode).connect(g as unknown as CacophonyAudioNode);
      (g as unknown as CacophonyAudioNode).connect(merger as unknown as CacophonyAudioNode, 0, i);
      this.encodeGains.push(g);
    }

    const levelGain = ctx.createGain();
    levelGain.gain.value = this.makeup;
    this.levelGain = levelGain;

    playback.connect(monoGain as unknown as CacophonyAudioNode);
    (merger as unknown as CacophonyAudioNode).connect(this.decoder.input);
    this.decoder.output.connect(levelGain as unknown as CacophonyAudioNode);
    (levelGain as unknown as CacophonyAudioNode).connect(
      outputTarget ?? this.cacophony.globalGainNode,
    );
  }

  /**
   * Aim the source from the listener at `listenerPos`/`listenerForward` toward
   * `sourcePos`, updating the four encode gains. Safe before attach (no-op).
   */
  setBearingFromPositions(
    listenerPos: Vec3 | null | undefined,
    listenerForward: Vec3 | null | undefined,
    sourcePos: Vec3 | null | undefined,
  ): void {
    const { azimuth, elevation } = sourceBearing(listenerPos, listenerForward, sourcePos);
    this.setBearing(azimuth, elevation);
  }

  /** Set the encode gains directly from an azimuth (CCW, +left) and elevation (+up). */
  setBearing(azimuthRad: number, elevationRad: number): void {
    if (this.encodeGains.length !== 4) {
      return;
    }
    const coeffs = encodeMonoToFoaSN3D(1, azimuthRad, elevationRad); // [W, Y, Z, X]
    for (let i = 0; i < 4; i++) {
      const v = coeffs[i];
      this.encodeGains[i].gain.value = Number.isFinite(v) ? v : i === 0 ? 1 : 0;
    }
  }

  /** Distance attenuation (0..1); folded with the makeup gain into the output level. */
  setDistanceGain(gain: number): void {
    this.distanceAttenuation = Number.isFinite(gain) ? Math.min(1, Math.max(0, gain)) : 1;
    this.applyLevel();
  }

  /** Constant makeup gain restoring the clean decode to a useful level. */
  setMakeup(makeup: number): void {
    this.makeup = Number.isFinite(makeup) && makeup > 0 ? makeup : 1;
    this.applyLevel();
  }

  private applyLevel(): void {
    if (this.levelGain) {
      this.levelGain.gain.value = this.makeup * this.distanceAttenuation;
    }
  }

  cleanup(): void {
    this.decoder.output.disconnect();
    this.decoder.input.disconnect();
    this.levelGain?.disconnect();
    for (const g of this.encodeGains) {
      g.disconnect();
    }
    this.monoGain?.disconnect();
    this.encodeGains = [];
    this.monoGain = undefined;
    this.levelGain = undefined;
    if (this.attachedPlayback) {
      this.attachedPlayback.disconnect();
      this.attachedPlayback.connect(this.cacophony.globalGainNode);
      this.attachedPlayback = undefined;
    }
  }
}
