import type { Cacophony, AudioNode as CacophonyAudioNode, Playback } from 'cacophony';
import { encodeMonoToFoaSN3D, type FoaDecoder } from 'cacophony';

import { sourceBearing, type Vec3 } from './foaBearing';

/** One encoder bank: four ACN [W,Y,Z,X] gains fed by one signal, aimed at the
 *  source bearing plus a fixed azimuth offset (0 for mono; ±half-width for the
 *  two stereo channels). */
interface EncoderBank {
  readonly gains: GainNode[];
  readonly azOffset: number;
}

/**
 * Positional first-order-ambisonic renderer — the physically-correct,
 * constant-gain path cacophony's own docs prescribe:
 *
 *   playback → [mono downmix | L/R split] → per-channel [W,Y,Z,X] encode gains
 *            → merge(4) → FoaDecoder (SN3D/ACN → binaural) → level → output
 *
 * The encode gains come from {@link encodeMonoToFoaSN3D} (W=1, Y=cosφ·sinθ,
 * Z=sinφ, X=cosφ·cosθ) for the source's bearing **relative to the listener's
 * head**, so the source sits at a real spot: turn and it swings around you, walk
 * and it changes bearing + level. This replaces the dormant perceptual
 * `StereoToFoaUpmixer`, whose non-constant-gain mix is the documented source of
 * the level loss + crackle on a plain stereo stream.
 *
 * Two modes, selected by `stereoWidthRad`:
 *  - **0 (mono point):** the stream is downmixed to one signal encoded at the
 *    bearing — a crisp point source.
 *  - **>0 (stereo field):** the stream's left/right channels are encoded as two
 *    sources at `bearing ± stereoWidthRad/2`, so the program's stereo width
 *    survives *and* the whole image is anchored at a spot in the world (the
 *    "stereo signal in the 3D HRTF world" goal). Ambisonics is linear, so the
 *    two encoded fields sum cleanly at the FOA merger.
 */
export class PositionalFoaRenderer {
  private attachedPlayback?: Playback;
  /** Mono downmix gain or stereo channel splitter feeding the encoder banks. */
  private inputNode?: AudioNode;
  private banks: EncoderBank[] = [];
  /** Post-decode level = makeup × distance attenuation. */
  private levelGain?: GainNode;
  private makeup = 1;
  private distanceAttenuation = 1;

  private constructor(
    private readonly cacophony: Cacophony,
    private readonly decoder: FoaDecoder,
    private readonly stereoWidthRad: number,
  ) {}

  static async create(
    cacophony: Cacophony,
    makeup = 1,
    stereoWidthRad = 0,
  ): Promise<PositionalFoaRenderer> {
    const decoder = await cacophony.createFoaDecoder();
    const width = Number.isFinite(stereoWidthRad) && stereoWidthRad > 0 ? stereoWidthRad : 0;
    const renderer = new PositionalFoaRenderer(cacophony, decoder, width);
    renderer.makeup = Number.isFinite(makeup) && makeup > 0 ? makeup : 1;
    return renderer;
  }

  private get context(): BaseAudioContext {
    return this.cacophony.context as unknown as BaseAudioContext;
  }

  private node(n: unknown): CacophonyAudioNode {
    return n as unknown as CacophonyAudioNode;
  }

  /** Create one bank of four encode gains feeding `merger` at ACN indices 0..3. */
  private buildBank(ctx: BaseAudioContext, merger: ChannelMergerNode, azOffset: number): EncoderBank {
    const gains: GainNode[] = [];
    for (let i = 0; i < 4; i++) {
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 1 : 0; // W=1 until setBearing runs
      this.node(g).connect(this.node(merger), 0, i);
      gains.push(g);
    }
    return { gains, azOffset };
  }

  /**
   * Wire the playback through the encode → decode graph, routing binaural output
   * to `outputTarget` (an effect bus input) or master when omitted. Mirrors
   * AmbisonicRenderer.attachPlayback's contract.
   */
  attachPlayback(playback: Playback, outputTarget?: CacophonyAudioNode): void {
    this.attachedPlayback = playback;
    playback.disconnect();

    const ctx = this.context;
    const merger = ctx.createChannelMerger(4);
    this.banks = [];

    if (this.stereoWidthRad > 0) {
      // Stereo field: split L/R, encode each at ± half the angular width.
      const splitter = ctx.createChannelSplitter(2);
      this.node(playback).connect(this.node(splitter));
      const half = this.stereoWidthRad / 2;
      for (const [channel, sign] of [
        [0, 1],
        [1, -1],
      ] as const) {
        const bank = this.buildBank(ctx, merger, sign * half);
        for (const g of bank.gains) {
          this.node(splitter).connect(this.node(g), channel);
        }
        this.banks.push(bank);
      }
      this.inputNode = splitter;
    } else {
      // Mono point: force a single-channel downmix, encode at the bearing.
      const monoGain = ctx.createGain();
      monoGain.channelCount = 1;
      monoGain.channelCountMode = 'explicit';
      monoGain.channelInterpretation = 'speakers';
      this.node(playback).connect(this.node(monoGain));
      const bank = this.buildBank(ctx, merger, 0);
      for (const g of bank.gains) {
        this.node(monoGain).connect(this.node(g));
      }
      this.banks.push(bank);
      this.inputNode = monoGain;
    }

    const levelGain = ctx.createGain();
    levelGain.gain.value = this.makeup;
    this.levelGain = levelGain;

    this.node(merger).connect(this.decoder.input);
    this.decoder.output.connect(this.node(levelGain));
    this.node(levelGain).connect(outputTarget ?? this.cacophony.globalGainNode);
  }

  /**
   * Aim the source from the listener at `listenerPos`/`listenerForward` toward
   * `sourcePos`, updating every encoder bank. Safe before attach (no-op).
   */
  setBearingFromPositions(
    listenerPos: Vec3 | null | undefined,
    listenerForward: Vec3 | null | undefined,
    sourcePos: Vec3 | null | undefined,
  ): void {
    const { azimuth, elevation } = sourceBearing(listenerPos, listenerForward, sourcePos);
    this.setBearing(azimuth, elevation);
  }

  /** Set every bank's encode gains from an azimuth (CCW, +left) and elevation (+up). */
  setBearing(azimuthRad: number, elevationRad: number): void {
    for (const bank of this.banks) {
      const coeffs = encodeMonoToFoaSN3D(1, azimuthRad + bank.azOffset, elevationRad); // [W,Y,Z,X]
      for (let i = 0; i < 4; i++) {
        const v = coeffs[i];
        bank.gains[i].gain.value = Number.isFinite(v) ? v : i === 0 ? 1 : 0;
      }
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
    for (const bank of this.banks) {
      for (const g of bank.gains) {
        g.disconnect();
      }
    }
    this.inputNode?.disconnect();
    this.banks = [];
    this.inputNode = undefined;
    this.levelGain = undefined;
    if (this.attachedPlayback) {
      this.attachedPlayback.disconnect();
      this.attachedPlayback.connect(this.cacophony.globalGainNode);
      this.attachedPlayback = undefined;
    }
  }
}
