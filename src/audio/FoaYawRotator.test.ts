import { describe, expect, it, vi } from 'vitest';

import { AmbisonicRenderer } from './AmbisonicRenderer';
import { SPATIAL_PARAM_TAU_S } from './audioParamSmoothing';
import { FoaYawRotator } from './FoaYawRotator';

/** A node in a recorded graph: what it is, its gain, and where it connects. */
interface GraphNode {
  kind: 'splitter' | 'merger' | 'gain';
  gain: { value: number };
  links: Array<{ to: GraphNode; output: number; input: number }>;
  connect(to: GraphNode, output?: number, input?: number): void;
  disconnect(): void;
}

/** A context whose nodes record their connections and gains, nothing more. */
function graphContext() {
  const make = (kind: GraphNode['kind']): GraphNode => {
    const node: GraphNode = {
      kind,
      gain: { value: 1 },
      links: [],
      connect(to, output = 0, input = 0) {
        node.links.push({ to, output, input });
      },
      disconnect() {
        node.links = [];
      },
    };
    return node;
  };
  return {
    currentTime: 0,
    createChannelSplitter: () => make('splitter'),
    createChannelMerger: () => make('merger'),
    createGain: () => make('gain'),
  };
}

/** Feed four channel values in at `input` and add up what reaches each channel of `output`. */
function trace(input: GraphNode, output: GraphNode, channels: number[]): number[] {
  const result = [0, 0, 0, 0];
  const deliver = (node: GraphNode, inputIndex: number, value: number) => {
    if (node === output) {
      result[inputIndex] += value;
      return;
    }
    if (node.kind !== 'gain') throw new Error(`unexpected ${node.kind} inside the rotator`);
    for (const link of node.links) deliver(link.to, link.input, value * node.gain.value);
  };
  for (const link of input.links) deliver(link.to, link.input, channels[link.output]);
  return result;
}

function param() {
  return {
    value: 1,
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
}

function node(name: string) {
  return { name, connect: vi.fn(), disconnect: vi.fn() };
}

function context() {
  const gains: Array<ReturnType<typeof node> & { gain: ReturnType<typeof param> }> = [];
  const ctx = {
    currentTime: 12,
    createChannelSplitter: vi.fn(() => node('splitter')),
    createChannelMerger: vi.fn(() => node('merger')),
    createGain: vi.fn(() => {
      const gain = { ...node(`gain${gains.length}`), gain: param() };
      gains.push(gain);
      return gain;
    }),
  };
  return { ctx, gains };
}

describe('FoaYawRotator', () => {
  it('passes W and Z straight through and mixes Y and X through four gains', () => {
    const { ctx, gains } = context();
    const rotator = new FoaYawRotator(ctx as unknown as BaseAudioContext);
    const splitter = rotator.input as unknown as ReturnType<typeof node>;
    const merger = rotator.output as unknown as ReturnType<typeof node>;
    expect(ctx.createChannelSplitter).toHaveBeenCalledWith(4);
    expect(ctx.createChannelMerger).toHaveBeenCalledWith(4);
    expect(splitter.connect).toHaveBeenCalledWith(merger, 0, 0); // W
    expect(splitter.connect).toHaveBeenCalledWith(merger, 2, 2); // Z
    expect(gains).toHaveLength(4);
    const [yToY, xToY, yToX, xToX] = gains;
    expect(splitter.connect).toHaveBeenCalledWith(yToY, 1);
    expect(splitter.connect).toHaveBeenCalledWith(xToY, 3);
    expect(splitter.connect).toHaveBeenCalledWith(yToX, 1);
    expect(splitter.connect).toHaveBeenCalledWith(xToX, 3);
    expect(yToY.connect).toHaveBeenCalledWith(merger, 0, 1);
    expect(xToY.connect).toHaveBeenCalledWith(merger, 0, 1);
    expect(yToX.connect).toHaveBeenCalledWith(merger, 0, 3);
    expect(xToX.connect).toHaveBeenCalledWith(merger, 0, 3);
    // Identity until told otherwise.
    expect(gains.map((gain) => gain.gain.value)).toEqual([1, 0, 0, 1]);
  });

  it('maps every channel exactly as Omnitone’s own rotator does for the renderer yaw matrix', async () => {
    // Build both rotators on a context that records the graph, then follow every
    // path from each input channel to each output channel: the two linear maps
    // must match. (A real-audio render of the same comparison is a browser check:
    // jsdom has no OfflineAudioContext.)
    const { default: Omnitone } = await import('omnitone/build/omnitone.min.esm.js');
    for (const yaw of [0, 0.7, -1.9, Math.PI]) {
      const theirs = graphContext();
      const omnitone = Omnitone.createFOARotator(theirs as unknown as BaseAudioContext);
      omnitone.setRotationMatrix3(AmbisonicRenderer.rotationMatrixFromYaw(yaw));
      const ours = graphContext();
      const rotator = new FoaYawRotator(ours as unknown as BaseAudioContext);
      rotator.setYaw(yaw, false);
      for (let channel = 0; channel < 4; channel += 1) {
        const unit = [0, 0, 0, 0];
        unit[channel] = 1;
        const expected = trace(omnitone.input as unknown as GraphNode, omnitone.output as unknown as GraphNode, unit);
        const actual = trace(rotator.input as unknown as GraphNode, rotator.output as unknown as GraphNode, unit);
        // A rotation keeps each unit input at unit length: the trace really reached the output.
        expect(Math.hypot(...expected)).toBeCloseTo(1, 6);
        actual.forEach((value, index) => {
          expect(value).toBeCloseTo(expected[index], 6);
        });
      }
    }
  });

  it('a stepped write cancels a ramp still in flight, then lands at once', () => {
    const { ctx, gains } = context();
    const rotator = new FoaYawRotator(ctx as unknown as BaseAudioContext);
    rotator.setYaw(1, true); // a ramp starts
    rotator.setYaw(0.5, false); // tracking turned off part-way through it
    for (const gain of gains) {
      const ramped = gain.gain.setTargetAtTime.mock.invocationCallOrder[0];
      // (The constructor's identity write cancels too; the last cancel is the stepped write's.)
      const cancelled = gain.gain.cancelScheduledValues.mock.invocationCallOrder.at(-1) ?? 0;
      expect(gain.gain.cancelScheduledValues).toHaveBeenCalledWith(12);
      expect(cancelled).toBeGreaterThan(ramped);
      expect(gain.gain.setTargetAtTime).toHaveBeenCalledTimes(1);
    }
    expect(gains.map((gain) => gain.gain.value)).toEqual([
      Math.cos(0.5),
      Math.sin(0.5),
      0 - Math.sin(0.5),
      Math.cos(0.5),
    ]);
  });

  it('ramps every coefficient with the spatial time constant when smoothing', () => {
    const { ctx, gains } = context();
    const rotator = new FoaYawRotator(ctx as unknown as BaseAudioContext);
    rotator.setYaw(Math.PI / 2, true);
    const targets = gains.map((gain) => gain.gain.setTargetAtTime.mock.lastCall);
    expect(targets.map((call) => call?.[1])).toEqual([12, 12, 12, 12]);
    expect(targets.map((call) => call?.[2])).toEqual(Array(4).fill(SPATIAL_PARAM_TAU_S));
    expect(targets.map((call) => call?.[0])).toEqual([
      expect.closeTo(0, 12),
      expect.closeTo(1, 12),
      expect.closeTo(-1, 12),
      expect.closeTo(0, 12),
    ]);
  });

  it('treats a non-finite yaw as no rotation', () => {
    const { ctx, gains } = context();
    const rotator = new FoaYawRotator(ctx as unknown as BaseAudioContext);
    rotator.setYaw(Number.NaN, false);
    expect(gains.map((gain) => gain.gain.value)).toEqual([1, 0, 0, 1]);
  });

  it('disconnects its nodes', () => {
    const { ctx, gains } = context();
    const rotator = new FoaYawRotator(ctx as unknown as BaseAudioContext);
    rotator.disconnect();
    expect((rotator.input as unknown as ReturnType<typeof node>).disconnect).toHaveBeenCalled();
    expect((rotator.output as unknown as ReturnType<typeof node>).disconnect).toHaveBeenCalled();
    for (const gain of gains) expect(gain.disconnect).toHaveBeenCalled();
  });
});
