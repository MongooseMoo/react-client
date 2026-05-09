import type { Cacophony, Playback } from "cacophony";
import Omnitone, { type FOARenderer } from "omnitone/build/omnitone.min.esm.js";

const IDENTITY_ROTATION = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
type AmbisonicInputMode = "stereo-upmix" | "foa-passthrough";

export class AmbisonicRenderer {
  private attachedPlayback?: Playback;

  private constructor(
    private readonly cacophony: Cacophony,
    private readonly renderer: FOARenderer,
    private readonly mode: AmbisonicInputMode,
    private readonly encoder?: AudioNode,
  ) {}

  static async create(cacophony: Cacophony, inputChannels: number): Promise<AmbisonicRenderer> {
    const renderer = Omnitone.createFOARenderer(cacophony.context as unknown as BaseAudioContext);
    await renderer.initialize();
    renderer.setRenderingMode("ambisonic");
    if (inputChannels === 2) {
      await cacophony.loadStereoToBFormatWorklet();
      const encoder = await cacophony.createStereoToBFormatNode();
      return new AmbisonicRenderer(cacophony, renderer, "stereo-upmix", encoder as AudioNode);
    }
    if (inputChannels === 4) {
      return new AmbisonicRenderer(cacophony, renderer, "foa-passthrough");
    }
    throw new Error(`Unsupported ambisonic input channel count: ${inputChannels}`);
  }

  attachPlayback(playback: Playback): void {
    this.attachedPlayback = playback;
    playback.disconnect();
    if (this.mode === "stereo-upmix") {
      if (!this.encoder) {
        throw new Error("Stereo ambisonic upmix requires an encoder node");
      }
      playback.connect(this.encoder);
      this.encoder.connect(this.renderer.input);
    } else {
      if (!playback.source || !playback.gainNode || !playback.panner) {
        throw new Error("FOA passthrough requires source, panner, and gain nodes");
      }
      playback.source.disconnect();
      playback.source.connect(playback.gainNode);
      playback.gainNode.connect(this.renderer.input);
    }
    this.renderer.output.connect(this.cacophony.globalGainNode);
  }

  cleanup(): void {
    this.renderer.output.disconnect();
    if (!this.attachedPlayback) {
      this.encoder?.disconnect();
      return;
    }
    if (this.mode === "stereo-upmix") {
      this.encoder?.disconnect();
      this.attachedPlayback.disconnect();
      this.attachedPlayback.connect(this.cacophony.globalGainNode);
    } else {
      this.attachedPlayback.gainNode?.disconnect();
      this.attachedPlayback.source?.disconnect();
      if (this.attachedPlayback.source && this.attachedPlayback.panner) {
        this.attachedPlayback.source.connect(this.attachedPlayback.panner);
      }
      if (this.attachedPlayback.gainNode) {
        this.attachedPlayback.gainNode.connect(this.cacophony.globalGainNode);
      }
    }
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
