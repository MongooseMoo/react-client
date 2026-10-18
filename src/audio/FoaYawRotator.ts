import { SPATIAL_PARAM_TAU_S, smoothParamTo } from './audioParamSmoothing';

/**
 * Turns a first-order ambisonic field (ACN channel order W, Y, Z, X) about the
 * vertical axis, with four GainNodes this class owns so the coefficients can
 * ramp. Omnitone's own rotator writes `gain.value`, which steps every
 * coefficient at once: fine for the server's occasional turns, a zipper for a
 * head turning sixty times a second.
 *
 * The rotation is the one Omnitone applies for
 * `AmbisonicRenderer.rotationMatrixFromYaw(yaw)` (its rotator negates Y and X
 * on the way in and out): Y' = cos·Y + sin·X, X' = −sin·Y + cos·X; W and Z
 * pass through.
 */
export class FoaYawRotator {
  readonly input: ChannelSplitterNode;
  readonly output: ChannelMergerNode;
  private readonly context: BaseAudioContext;
  private readonly yToY: GainNode;
  private readonly xToY: GainNode;
  private readonly yToX: GainNode;
  private readonly xToX: GainNode;

  constructor(context: BaseAudioContext) {
    this.context = context;
    this.input = context.createChannelSplitter(4);
    this.output = context.createChannelMerger(4);
    this.yToY = context.createGain();
    this.xToY = context.createGain();
    this.yToX = context.createGain();
    this.xToX = context.createGain();
    this.input.connect(this.output, 0, 0);
    this.input.connect(this.output, 2, 2);
    this.input.connect(this.yToY, 1);
    this.input.connect(this.xToY, 3);
    this.input.connect(this.yToX, 1);
    this.input.connect(this.xToX, 3);
    this.yToY.connect(this.output, 0, 1);
    this.xToY.connect(this.output, 0, 1);
    this.yToX.connect(this.output, 0, 3);
    this.xToX.connect(this.output, 0, 3);
    this.setYaw(0, false);
  }

  /** Turn the field to `yaw` radians: ramped with the spatial time constant, or at once. */
  setYaw(yaw: number, smooth: boolean): void {
    const angle = Number.isFinite(yaw) ? yaw : 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const now = this.context.currentTime;
    const write = (node: GainNode, value: number) => {
      if (smooth) {
        smoothParamTo(node.gain, value, now, SPATIAL_PARAM_TAU_S);
        return;
      }
      node.gain.cancelScheduledValues?.(now);
      node.gain.value = value;
    };
    write(this.yToY, cos);
    write(this.xToY, sin);
    write(this.yToX, 0 - sin); // not -sin: no -0 at yaw 0
    write(this.xToX, cos);
  }

  disconnect(): void {
    this.input.disconnect();
    this.yToY.disconnect();
    this.xToY.disconnect();
    this.yToX.disconnect();
    this.xToX.disconnect();
    this.output.disconnect();
  }
}
