import type { Bus, Cacophony } from 'cacophony';
import type { EffectChain } from '../audio/effects/EffectChain';
import type { EffectSpec } from '../audio/effects/types';
import {
  DEFAULT_SPATIAL_PROFILE,
  distanceBetween,
  profileDistanceGain,
  type SpatialProfile,
} from '../audio/distanceModel';

export interface SequenceMix {
  volume?: number;
  gainDb?: number;
  pan?: number;
  position?: number[];
  orientation?: number[];
  is3d?: boolean;
  spatial?: SpatialProfile;
  occlusion?: number;
  chain?: string;
  send?: number;
  effects?: EffectSpec[];
}

/** Owned AudioParam events can be recalled without touching another source. */
export class SequenceLane {
  private events: { time: number; value: number }[] = [];
  constructor(
    readonly parameter: AudioParam,
    private initial: number,
  ) {
    parameter.value = initial;
  }
  valueAt(time: number): number {
    let value = this.initial;
    for (const event of this.events) {
      if (event.time > time) break;
      value = event.value;
    }
    return value;
  }
  set(value: number, time: number): void {
    this.events.push({ time, value });
    this.events.sort((a, b) => a.time - b.time);
    this.parameter.setValueAtTime(value, time);
  }
  cancelFrom(time: number): void {
    let value = this.initial;
    for (const event of this.events) {
      if (event.time >= time) break;
      value = event.value;
    }
    this.events = this.events.filter((event) => event.time < time);
    this.parameter.cancelScheduledValues(time);
    this.parameter.setValueAtTime(value, time);
  }
  prune(time: number): void {
    this.initial = this.valueAt(time);
    this.events = this.events.filter((event) => event.time > time);
  }
}

export class SequencePartGraph {
  readonly input: GainNode;
  readonly volume: SequenceLane;
  readonly expression: SequenceLane;
  readonly pan: SequenceLane;
  private readonly expressionNode: GainNode;
  private readonly panNode: StereoPannerNode;
  constructor(context: BaseAudioContext, destination: AudioNode) {
    this.input = context.createGain();
    this.expressionNode = context.createGain();
    this.panNode = context.createStereoPanner();
    this.volume = new SequenceLane(this.input.gain, 100 / 127);
    this.expression = new SequenceLane(this.expressionNode.gain, 1);
    this.pan = new SequenceLane(this.panNode.pan, 0);
    this.input.connect(this.expressionNode);
    this.expressionNode.connect(this.panNode);
    this.panNode.connect(destination);
  }
  control(controller: number, value: number, time: number): void {
    if (controller === 7) this.volume.set(value / 127, time);
    if (controller === 11) this.expression.set(value / 127, time);
    if (controller === 10) this.pan.set(Math.max(-1, (value - 64) / 63), time);
  }
  cancelFrom(time: number): void {
    this.volume.cancelFrom(time);
    this.expression.cancelFrom(time);
    this.pan.cancelFrom(time);
  }
  prune(time: number): void {
    this.volume.prune(time);
    this.expression.prune(time);
    this.pan.prune(time);
  }
  dispose(): void {
    this.input.disconnect();
    this.expressionNode.disconnect();
    this.panNode.disconnect();
  }
}

/** One source enters the existing Cacophony graph, master mute and effect buses. */
export class SequenceGraph {
  readonly context: BaseAudioContext;
  readonly input: GainNode;
  private readonly pan: StereoPannerNode;
  private readonly spatial: PannerNode;
  private readonly filter: BiquadFilterNode;
  private readonly parts = new Map<string, SequencePartGraph>();
  private mix: SequenceMix;
  private closed = false;
  private generation = 0;
  private positioned = false;
  private constructor(
    private readonly engine: Cacophony,
    private readonly chain: EffectChain,
    private readonly getChain: (id: string) => Bus | undefined,
    mix: SequenceMix,
  ) {
    this.context = engine.context as unknown as BaseAudioContext;
    this.mix = mix;
    this.input = this.context.createGain();
    this.pan = this.context.createStereoPanner();
    this.spatial = this.context.createPanner();
    this.filter = this.context.createBiquadFilter();
    this.spatial.panningModel = 'HRTF';
    this.spatial.rolloffFactor = 0;
    this.input.connect(this.filter);
    this.filter.connect(this.pan);
    this.pan.connect(chain.bus.input as unknown as AudioNode);
    this.spatial.connect(chain.bus.input as unknown as AudioNode);
    this.update(mix);
  }
  static async create(
    engine: Cacophony,
    getChain: (id: string) => Bus | undefined,
    mix: SequenceMix,
  ): Promise<SequenceGraph> {
    const { EffectChain } = await import('../audio/effects/EffectChain');
    const chain = await EffectChain.createAnonymous(engine, mix.effects ?? []);
    return new SequenceGraph(engine, chain, getChain, mix);
  }
  part(id: string): SequencePartGraph {
    let part = this.parts.get(id);
    if (!part) {
      part = new SequencePartGraph(this.context, this.input);
      this.parts.set(id, part);
    }
    return part;
  }
  update(update: SequenceMix): void {
    if (this.closed) return;
    const previous = this.mix;
    this.mix = { ...this.mix, ...update };
    const mix = this.mix,
      now = this.context.currentTime;
    const positioned = mix.is3d && mix.position?.length === 3;
    if (Boolean(positioned) !== this.positioned) {
      this.pan.disconnect();
      this.pan.connect(positioned ? this.spatial : (this.chain.bus.input as unknown as AudioNode));
      this.positioned = Boolean(positioned);
    }
    const profile = mix.spatial ?? DEFAULT_SPATIAL_PROFILE;
    const distance = positioned
      ? profileDistanceGain(distanceBetween(this.engine.listenerPosition, mix.position), profile)
      : 1;
    this.input.gain.setValueAtTime(
      ((mix.volume ?? 50) / 100) * 10 ** ((mix.gainDb ?? 0) / 20) * distance,
      now,
    );
    this.pan.pan.setValueAtTime((mix.pan ?? 0) / 100, now);
    const position = positioned ? mix.position : [0, 0, 0];
    this.spatial.positionX.setTargetAtTime(position?.[0] ?? 0, now, 0.02);
    this.spatial.positionY.setTargetAtTime(position?.[1] ?? 0, now, 0.02);
    this.spatial.positionZ.setTargetAtTime(position?.[2] ?? 0, now, 0.02);
    this.spatial.coneInnerAngle = positioned ? profile.coneInnerAngle : 360;
    this.spatial.coneOuterAngle = positioned ? profile.coneOuterAngle : 360;
    this.spatial.coneOuterGain = positioned ? profile.coneOuterGain : 1;
    if (mix.orientation) {
      this.spatial.orientationX.setValueAtTime(mix.orientation[0], now);
      this.spatial.orientationY.setValueAtTime(mix.orientation[1], now);
      this.spatial.orientationZ.setValueAtTime(mix.orientation[2], now);
    }
    this.filter.type = 'lowpass';
    this.filter.frequency.setTargetAtTime(22000 * 0.025 ** (mix.occlusion ?? 0), now, 0.02);
    this.route();
    if (update.effects !== undefined && update.effects !== previous.effects) {
      const generation = ++this.generation;
      void this.chain
        .replace(update.effects)
        .then(() => {
          if (!this.closed && generation === this.generation) this.route();
        })
        .catch((error) => console.warn('Score effects unavailable', error));
    }
  }
  route(destroying?: string): void {
    if (this.closed) return;
    const target =
      this.mix.chain && this.mix.chain !== destroying ? this.getChain(this.mix.chain) : undefined;
    this.chain.connectDownstream(this.mix.send === undefined ? (target ?? null) : null);
    this.chain.setSend(this.mix.send !== undefined ? (target ?? null) : null, this.mix.send ?? 1);
  }
  cancelFrom(time: number): void {
    for (const part of this.parts.values()) part.cancelFrom(time);
  }
  prune(): void {
    for (const part of this.parts.values()) part.prune(this.context.currentTime);
  }
  retainParts(ids: ReadonlySet<string>): void {
    for (const [id, part] of this.parts)
      if (!ids.has(id)) {
        part.dispose();
        this.parts.delete(id);
      }
  }
  fade(): void {
    const now = this.context.currentTime;
    this.input.gain.cancelScheduledValues(now);
    this.input.gain.setValueAtTime(this.input.gain.value, now);
    this.input.gain.linearRampToValueAtTime(0, now + 0.01);
  }
  dispose(): void {
    if (this.closed) return;
    this.closed = true;
    this.generation++;
    this.input.gain.cancelScheduledValues(this.context.currentTime);
    for (const part of this.parts.values()) part.dispose();
    this.parts.clear();
    this.input.disconnect();
    this.pan.disconnect();
    this.spatial.disconnect();
    this.filter.disconnect();
    const master = this.engine.getBus('master');
    if (master) this.chain.destroy(master);
    else this.chain.bus.destroy();
  }
}
