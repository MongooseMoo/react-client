import type { Cacophony, Playback } from "cacophony";
import Omnitone, { type FOARenderer } from "omnitone/build/omnitone.min.esm.js";

const IDENTITY_ROTATION = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

export class AmbisonicRenderer {
  private constructor(
    private readonly cacophony: Cacophony,
    private readonly renderer: FOARenderer,
    private readonly splitter: AudioNode,
    private readonly encoder: AudioNode,
  ) {}

  static async create(cacophony: Cacophony): Promise<AmbisonicRenderer> {
    const renderer = Omnitone.createFOARenderer(cacophony.context as unknown as BaseAudioContext);
    await renderer.initialize();
    renderer.setRenderingMode("ambisonic");
    const splitter = cacophony.createSplitter(2);
    const encoder = await cacophony.createStereoToBFormatNode();
    return new AmbisonicRenderer(cacophony, renderer, splitter as unknown as AudioNode, encoder as AudioNode);
  }

  attachPlayback(playback: Playback): void {
    playback.disconnect();
    playback.connect(this.splitter);
    this.splitter.connect(this.encoder);
    this.encoder.connect(this.renderer.input);
    this.renderer.output.connect(this.cacophony.globalGainNode);
  }

  cleanup(): void {
    this.renderer.output.disconnect();
    this.encoder.disconnect();
    this.splitter.disconnect();
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
