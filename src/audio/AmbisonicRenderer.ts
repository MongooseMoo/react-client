import type { Cacophony, AudioNode as CacophonyAudioNode, Playback } from 'cacophony';
import type { FOARenderer } from 'omnitone/build/omnitone.min.esm.js';

import { smoothParamTo } from './audioParamSmoothing';
import { FoaYawRotator } from './FoaYawRotator';

const IDENTITY_ROTATION = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
type AmbisonicInputMode = 'stereo-upmix' | 'foa-passthrough';

export class AmbisonicRenderer {
  private attachedPlayback?: Playback;
  /** Pre-encoder gain that attenuates the source by listener distance (ambisonic has no panner). */
  private distanceGain?: GainNode;
  /** Ramp yaw changes (head tracking) instead of stepping them (the server's turns). */
  private smoothRotation = false;

  /**
   * The field turns in `rotator`, ahead of the renderer, whose own matrix
   * stays at identity: Omnitone's rotator can only step its coefficients.
   */
  private constructor(
    private readonly cacophony: Cacophony,
    private readonly renderer: FOARenderer,
    private readonly rotator: FoaYawRotator,
    private readonly mode: AmbisonicInputMode,
    private readonly encoder?: CacophonyAudioNode,
  ) {
    (rotator.output as unknown as CacophonyAudioNode).connect(
      renderer.input as unknown as CacophonyAudioNode,
    );
  }

  static async create(cacophony: Cacophony, inputChannels: number): Promise<AmbisonicRenderer> {
    const { default: Omnitone } = await import('omnitone/build/omnitone.min.esm.js');
    const context = cacophony.context as unknown as BaseAudioContext;
    const renderer = Omnitone.createFOARenderer(context);
    await renderer.initialize();
    renderer.setRenderingMode('ambisonic');
    if (inputChannels === 2) {
      await cacophony.loadStereoToBFormatWorklet();
      const encoder = await cacophony.createStereoToBFormatNode();
      return new AmbisonicRenderer(cacophony, renderer, new FoaYawRotator(context), 'stereo-upmix', encoder);
    }
    if (inputChannels === 4) {
      return new AmbisonicRenderer(cacophony, renderer, new FoaYawRotator(context), 'foa-passthrough');
    }
    throw new Error(`Unsupported ambisonic input channel count: ${inputChannels}`);
  }

  /**
   * Wire the playback through the FOA decode and route the binaural output to
   * `outputTarget` (the input node of an effect bus), or to master when omitted.
   * Letting the caller choose the output target is what makes effects on
   * ambisonic sounds possible — the output is no longer hard-wired to master
   * (V11).
   */
  attachPlayback(playback: Playback, outputTarget?: CacophonyAudioNode): void {
    this.attachedPlayback = playback;
    playback.disconnect();
    const distanceGain = (this.cacophony.context as unknown as BaseAudioContext).createGain();
    this.distanceGain = distanceGain;
    const distanceNode = distanceGain as unknown as CacophonyAudioNode;
    playback.connect(distanceNode);
    if (this.mode === 'stereo-upmix') {
      if (!this.encoder) {
        throw new Error('Stereo ambisonic upmix requires an encoder node');
      }
      distanceNode.connect(this.encoder);
      this.encoder.connect(this.rotator.input as unknown as CacophonyAudioNode);
    } else {
      distanceNode.connect(this.rotator.input as unknown as CacophonyAudioNode);
    }
    (this.renderer.output as unknown as CacophonyAudioNode).connect(
      outputTarget ?? this.cacophony.globalGainNode,
    );
  }

  /**
   * Set the pre-encoder distance attenuation (0..1). Lets a positioned ambisonic
   * source fall off with listener distance the way an HRTF-panned source does,
   * while the renderer still rotates the soundfield with head yaw.
   */
  setDistanceGain(gain: number): void {
    if (!this.distanceGain) {
      return;
    }
    const clamped = Number.isFinite(gain) ? Math.min(1, Math.max(0, gain)) : 1;
    const currentTime = (this.cacophony.context as unknown as BaseAudioContext).currentTime;
    smoothParamTo(this.distanceGain.gain, clamped, currentTime);
  }

  cleanup(): void {
    this.renderer.output.disconnect();
    this.rotator.disconnect();
    this.distanceGain?.disconnect();
    this.distanceGain = undefined;
    if (!this.attachedPlayback) {
      this.encoder?.disconnect();
      return;
    }
    if (this.mode === 'stereo-upmix') {
      this.encoder?.disconnect();
    }
    this.attachedPlayback.disconnect();
    this.attachedPlayback.connect(this.cacophony.globalGainNode);
    this.attachedPlayback = undefined;
  }

  /** Turn the field to the listener yaw: the rotation `rotationMatrixFromYaw` describes. */
  setRotationMatrixFromYaw(yaw: number): void {
    this.rotator.setYaw(yaw, this.smoothRotation);
  }

  /** Ramp later yaw changes (true, while head tracking) or step them (false). */
  setRotationSmoothing(smooth: boolean): void {
    this.smoothRotation = smooth;
  }

  /** The 3x3 yaw matrix in Omnitone's convention, which FoaYawRotator reproduces. */
  static rotationMatrixFromYaw(yaw: number): Float32Array {
    if (!Number.isFinite(yaw)) {
      return new Float32Array(IDENTITY_ROTATION);
    }
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    return new Float32Array([cos, 0, -sin, 0, 1, 0, sin, 0, cos]);
  }
}
