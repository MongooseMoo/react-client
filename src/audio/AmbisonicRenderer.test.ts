import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateFOARenderer } = vi.hoisted(() => ({
  mockCreateFOARenderer: vi.fn(),
}));

vi.mock('omnitone/build/omnitone.min.esm.js', () => ({
  default: {
    createFOARenderer: mockCreateFOARenderer,
  },
}));

import { AmbisonicRenderer } from './AmbisonicRenderer';

function createNode() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createGainNode() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { value: 1 },
  };
}

/** A context whose createGain hands back a single, inspectable gain node. */
function createContext(gainNode = createGainNode()) {
  return { createGain: vi.fn(() => gainNode) };
}

describe('AmbisonicRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes the stereo-upmix graph through a pre-encoder distance gain', async () => {
    const encoder = createNode();
    const input = createNode();
    const output = createNode();
    const renderer = {
      initialize: vi.fn().mockResolvedValue(undefined),
      input,
      output,
      setRenderingMode: vi.fn(),
      setRotationMatrix3: vi.fn(),
      setRotationMatrix4: vi.fn(),
    };
    mockCreateFOARenderer.mockReturnValue(renderer);

    const gainNode = createGainNode();
    const cacophony = {
      context: createContext(gainNode),
      loadStereoToBFormatWorklet: vi.fn().mockResolvedValue(undefined),
      createStereoToBFormatNode: vi.fn().mockResolvedValue(encoder),
      globalGainNode: createNode(),
    };
    const playback = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    const ambisonicRenderer = await AmbisonicRenderer.create(cacophony as any, 2);
    ambisonicRenderer.attachPlayback(playback as any);

    expect(cacophony.context.createGain).toHaveBeenCalledOnce();
    expect(playback.disconnect).toHaveBeenCalledOnce();
    // playback → distanceGain → encoder → renderer.input
    expect(playback.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(encoder);
    expect(encoder.connect).toHaveBeenCalledWith(input);
    expect(output.connect).toHaveBeenCalledWith(cacophony.globalGainNode);
  });

  it('routes the FOA passthrough graph through the distance gain without an encoder', async () => {
    const input = createNode();
    const output = createNode();
    const renderer = {
      initialize: vi.fn().mockResolvedValue(undefined),
      input,
      output,
      setRenderingMode: vi.fn(),
      setRotationMatrix3: vi.fn(),
      setRotationMatrix4: vi.fn(),
    };
    mockCreateFOARenderer.mockReturnValue(renderer);

    const gainNode = createGainNode();
    const cacophony = {
      context: createContext(gainNode),
      loadStereoToBFormatWorklet: vi.fn().mockResolvedValue(undefined),
      createStereoToBFormatNode: vi.fn(),
      globalGainNode: createNode(),
    };
    const playback = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    const ambisonicRenderer = await AmbisonicRenderer.create(cacophony as any, 4);
    ambisonicRenderer.attachPlayback(playback as any);

    expect(cacophony.createStereoToBFormatNode).not.toHaveBeenCalled();
    expect(playback.disconnect).toHaveBeenCalledOnce();
    // playback → distanceGain → renderer.input
    expect(playback.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(input);
    expect(output.connect).toHaveBeenCalledWith(cacophony.globalGainNode);
  });

  it('routes the binaural output to an explicit target instead of master (V11)', async () => {
    const input = createNode();
    const output = createNode();
    const renderer = {
      initialize: vi.fn().mockResolvedValue(undefined),
      input,
      output,
      setRenderingMode: vi.fn(),
      setRotationMatrix3: vi.fn(),
      setRotationMatrix4: vi.fn(),
    };
    mockCreateFOARenderer.mockReturnValue(renderer);

    const cacophony = {
      context: createContext(),
      loadStereoToBFormatWorklet: vi.fn().mockResolvedValue(undefined),
      createStereoToBFormatNode: vi.fn(),
      globalGainNode: createNode(),
    };
    const playback = { connect: vi.fn(), disconnect: vi.fn() };
    const effectBusInput = createNode();

    const ambisonicRenderer = await AmbisonicRenderer.create(cacophony as any, 4);
    ambisonicRenderer.attachPlayback(playback as any, effectBusInput as any);

    expect(output.connect).toHaveBeenCalledWith(effectBusInput);
    expect(output.connect).not.toHaveBeenCalledWith(cacophony.globalGainNode);
  });

  it('sets and clamps the distance gain on the pre-encoder node', async () => {
    const renderer = {
      initialize: vi.fn().mockResolvedValue(undefined),
      input: createNode(),
      output: createNode(),
      setRenderingMode: vi.fn(),
      setRotationMatrix3: vi.fn(),
      setRotationMatrix4: vi.fn(),
    };
    mockCreateFOARenderer.mockReturnValue(renderer);

    const gainNode = createGainNode();
    const cacophony = {
      context: createContext(gainNode),
      loadStereoToBFormatWorklet: vi.fn().mockResolvedValue(undefined),
      createStereoToBFormatNode: vi.fn(),
      globalGainNode: createNode(),
    };
    const playback = { connect: vi.fn(), disconnect: vi.fn() };

    const ambisonicRenderer = await AmbisonicRenderer.create(cacophony as any, 4);
    ambisonicRenderer.attachPlayback(playback as any);

    ambisonicRenderer.setDistanceGain(0.3);
    expect(gainNode.gain.value).toBeCloseTo(0.3, 9);

    ambisonicRenderer.setDistanceGain(5);
    expect(gainNode.gain.value).toBe(1);

    ambisonicRenderer.setDistanceGain(-2);
    expect(gainNode.gain.value).toBe(0);

    ambisonicRenderer.setDistanceGain(Number.NaN);
    expect(gainNode.gain.value).toBe(1);
  });

  it('is a no-op when setting distance gain before a playback is attached', async () => {
    const renderer = {
      initialize: vi.fn().mockResolvedValue(undefined),
      input: createNode(),
      output: createNode(),
      setRenderingMode: vi.fn(),
      setRotationMatrix3: vi.fn(),
      setRotationMatrix4: vi.fn(),
    };
    mockCreateFOARenderer.mockReturnValue(renderer);
    const cacophony = {
      context: createContext(),
      loadStereoToBFormatWorklet: vi.fn().mockResolvedValue(undefined),
      createStereoToBFormatNode: vi.fn(),
      globalGainNode: createNode(),
    };

    const ambisonicRenderer = await AmbisonicRenderer.create(cacophony as any, 4);
    expect(() => ambisonicRenderer.setDistanceGain(0.5)).not.toThrow();
  });

  it('computes the expected yaw rotation matrix', () => {
    const matrix = AmbisonicRenderer.rotationMatrixFromYaw(Math.PI / 2);

    expect(Array.from(matrix)).toEqual([
      expect.closeTo(0, 6),
      0,
      -1,
      0,
      1,
      0,
      1,
      0,
      expect.closeTo(0, 6),
    ]);
  });
});
