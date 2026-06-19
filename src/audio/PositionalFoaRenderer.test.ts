import { beforeEach, describe, expect, it, vi } from 'vitest';

// Deterministic stand-in for cacophony's encoder: the documented SN3D/ACN closed
// form [W, Y, Z, X] = [s, s·cosφ·sinθ, s·sinφ, s·cosφ·cosθ].
vi.mock('cacophony', () => ({
  encodeMonoToFoaSN3D: (s: number, theta: number, phi: number) => [
    s,
    s * Math.cos(phi) * Math.sin(theta),
    s * Math.sin(phi),
    s * Math.cos(phi) * Math.cos(theta),
  ],
}));

import { PositionalFoaRenderer } from './PositionalFoaRenderer';

const DEG = Math.PI / 180;

function gainNode() {
  return {
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    channelCount: 2,
    channelCountMode: 'max',
    channelInterpretation: 'speakers',
  };
}

function plainNode() {
  return { connect: vi.fn(), disconnect: vi.fn() };
}

function makeHarness() {
  const gains: ReturnType<typeof gainNode>[] = [];
  const merger = plainNode();
  const decoder = { input: plainNode(), output: plainNode() };
  const globalGainNode = plainNode();
  const context = {
    createGain: vi.fn(() => {
      const g = gainNode();
      gains.push(g);
      return g;
    }),
    createChannelMerger: vi.fn(() => merger),
  };
  const cacophony = {
    context,
    globalGainNode,
    createFoaDecoder: vi.fn().mockResolvedValue(decoder),
  };
  const playback = plainNode();
  return { gains, merger, decoder, globalGainNode, context, cacophony, playback };
}

describe('PositionalFoaRenderer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('builds the encode → FoaDecoder → level graph and routes to master', async () => {
    const h = makeHarness();
    const r = await PositionalFoaRenderer.create(h.cacophony as any);
    r.attachPlayback(h.playback as any);

    expect(h.cacophony.createFoaDecoder).toHaveBeenCalledOnce();
    expect(h.playback.disconnect).toHaveBeenCalledOnce();

    // gains[0] = mono downmix, [1..4] = encode W,Y,Z,X, [5] = level
    const [mono, gW, gY, gZ, gX, level] = h.gains;
    expect(mono.channelCount).toBe(1);
    expect(mono.channelCountMode).toBe('explicit');

    expect(h.playback.connect).toHaveBeenCalledWith(mono);
    // mono fans out to each encode gain, each into the merger at its ACN index
    for (const [i, g] of [gW, gY, gZ, gX].entries()) {
      expect(mono.connect).toHaveBeenCalledWith(g);
      expect(g.connect).toHaveBeenCalledWith(h.merger, 0, i);
    }
    expect(h.merger.connect).toHaveBeenCalledWith(h.decoder.input);
    expect(h.decoder.output.connect).toHaveBeenCalledWith(level);
    expect(level.connect).toHaveBeenCalledWith(h.globalGainNode);
  });

  it('routes binaural output to an explicit target instead of master', async () => {
    const h = makeHarness();
    const target = plainNode();
    const r = await PositionalFoaRenderer.create(h.cacophony as any);
    r.attachPlayback(h.playback as any, target as any);

    const level = h.gains[5];
    expect(level.connect).toHaveBeenCalledWith(target);
    expect(level.connect).not.toHaveBeenCalledWith(h.globalGainNode);
  });

  it('sets the four encode gains from the bearing (front)', async () => {
    const h = makeHarness();
    const r = await PositionalFoaRenderer.create(h.cacophony as any);
    r.attachPlayback(h.playback as any);
    const [, gW, gY, gZ, gX] = h.gains;

    r.setBearing(0, 0); // straight ahead: [W,Y,Z,X] = [1,0,0,1]
    expect(gW.gain.value).toBeCloseTo(1, 9);
    expect(gY.gain.value).toBeCloseTo(0, 9);
    expect(gZ.gain.value).toBeCloseTo(0, 9);
    expect(gX.gain.value).toBeCloseTo(1, 9);
  });

  it('encodes a hard-right source with a negative Y and zero X', async () => {
    const h = makeHarness();
    const r = await PositionalFoaRenderer.create(h.cacophony as any);
    r.attachPlayback(h.playback as any);
    const [, gW, gY, gZ, gX] = h.gains;

    r.setBearing(-90 * DEG, 0); // right: [1, sin(-90)=-1, 0, cos(-90)=0]
    expect(gW.gain.value).toBeCloseTo(1, 9);
    expect(gY.gain.value).toBeCloseTo(-1, 9);
    expect(gZ.gain.value).toBeCloseTo(0, 9);
    expect(gX.gain.value).toBeCloseTo(0, 9);
  });

  it('derives the bearing from listener and source positions', async () => {
    const h = makeHarness();
    const r = await PositionalFoaRenderer.create(h.cacophony as any);
    r.attachPlayback(h.playback as any);
    const [, gW, gY, gX] = [h.gains[0], h.gains[1], h.gains[2], h.gains[4]];

    // listener at origin facing -z; source to world +x is on the right.
    r.setBearingFromPositions([0, 0, 0], [0, 0, -1], [5, 0, 0]);
    expect(gW.gain.value).toBeCloseTo(1, 9);
    expect(gY.gain.value).toBeCloseTo(-1, 9); // right → Y negative
    expect(gX.gain.value).toBeCloseTo(0, 9);
  });

  it('folds distance attenuation and makeup into the level gain', async () => {
    const h = makeHarness();
    const r = await PositionalFoaRenderer.create(h.cacophony as any, 2); // makeup 2
    r.attachPlayback(h.playback as any);
    const level = h.gains[5];

    expect(level.gain.value).toBeCloseTo(2, 9); // makeup at full distance
    r.setDistanceGain(0.25);
    expect(level.gain.value).toBeCloseTo(0.5, 9); // 2 × 0.25
    r.setDistanceGain(5); // clamps to 1
    expect(level.gain.value).toBeCloseTo(2, 9);
    r.setDistanceGain(-1); // clamps to 0
    expect(level.gain.value).toBeCloseTo(0, 9);
    r.setDistanceGain(Number.NaN); // → full
    expect(level.gain.value).toBeCloseTo(2, 9);
  });

  it('is a safe no-op when setting bearing before attach', async () => {
    const h = makeHarness();
    const r = await PositionalFoaRenderer.create(h.cacophony as any);
    expect(() => r.setBearing(1, 0.2)).not.toThrow();
    expect(() => r.setDistanceGain(0.5)).not.toThrow();
  });
});
