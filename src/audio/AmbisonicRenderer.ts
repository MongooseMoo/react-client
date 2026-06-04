import type { Cacophony, AudioNode as CacophonyAudioNode, Playback } from 'cacophony';
import Omnitone, { type FOARenderer } from 'omnitone/build/omnitone.min.esm.js';

const IDENTITY_ROTATION = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
type AmbisonicInputMode = 'stereo-upmix' | 'foa-passthrough';

export class AmbisonicRenderer {
  private attachedPlayback?: Playback;

  private constructor(
    private readonly cacophony: Cacophony,
    private readonly renderer: FOARenderer,
    private readonly mode: AmbisonicInputMode,
    private readonly encoder?: CacophonyAudioNode,
  ) {}

  static async create(cacophony: Cacophony, inputChannels: number): Promise<AmbisonicRenderer> {
    const renderer = Omnitone.createFOARenderer(cacophony.context as unknown as BaseAudioContext);
    await renderer.initialize();
    renderer.setRenderingMode('ambisonic');
    if (inputChannels === 2) {
      await cacophony.loadStereoToBFormatWorklet();
      const encoder = await cacophony.createStereoToBFormatNode();
      return new AmbisonicRenderer(cacophony, renderer, 'stereo-upmix', encoder);
    }
    if (inputChannels === 4) {
      return new AmbisonicRenderer(cacophony, renderer, 'foa-passthrough');
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
    if (this.mode === 'stereo-upmix') {
      if (!this.encoder) {
        throw new Error('Stereo ambisonic upmix requires an encoder node');
      }
      playback.connect(this.encoder);
      this.encoder.connect(this.renderer.input as unknown as CacophonyAudioNode);
    } else {
      playback.connect(this.renderer.input as unknown as CacophonyAudioNode);
    }
    (this.renderer.output as unknown as CacophonyAudioNode).connect(
      outputTarget ?? this.cacophony.globalGainNode,
    );
  }

  cleanup(): void {
    this.renderer.output.disconnect();
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

  setRotationMatrixFromYaw(yaw: number): void {
    this.renderer.setRotationMatrix3(AmbisonicRenderer.rotationMatrixFromYaw(yaw));
  }

  static rotationMatrixFromYaw(yaw: number): Float32Array {
    if (!Number.isFinite(yaw)) {
      return new Float32Array(IDENTITY_ROTATION);
    }
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    return new Float32Array([cos, 0, -sin, 0, 1, 0, sin, 0, cos]);
  }
}
