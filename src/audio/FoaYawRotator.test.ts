import { describe, expect, it, vi } from 'vitest';

import { SPATIAL_PARAM_TAU_S } from './audioParamSmoothing';
import { FoaYawRotator } from './FoaYawRotator';

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

  it('writes the same rotation as Omnitone for the renderer yaw matrix', () => {
    const { ctx, gains } = context();
    const rotator = new FoaYawRotator(ctx as unknown as BaseAudioContext);
    const yaw = 0.7;
    rotator.setYaw(yaw, false);
    // Omnitone with [c,0,-s, 0,1,0, s,0,c] gives Y' = cY + sX and X' = -sY + cX.
    const [yToY, xToY, yToX, xToX] = gains.map((gain) => gain.gain.value);
    expect(yToY).toBeCloseTo(Math.cos(yaw), 12);
    expect(xToY).toBeCloseTo(Math.sin(yaw), 12);
    expect(yToX).toBeCloseTo(-Math.sin(yaw), 12);
    expect(xToX).toBeCloseTo(Math.cos(yaw), 12);
  });

  it('jumps without smoothing, cancelling any ramp in flight', () => {
    const { ctx, gains } = context();
    const rotator = new FoaYawRotator(ctx as unknown as BaseAudioContext);
    rotator.setYaw(1, false);
    for (const gain of gains) {
      expect(gain.gain.cancelScheduledValues).toHaveBeenCalledWith(12);
      expect(gain.gain.setTargetAtTime).not.toHaveBeenCalled();
    }
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
