import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockCreateFOARenderer } = vi.hoisted(() => ({
  mockCreateFOARenderer: vi.fn(),
}));

vi.mock("omnitone/build/omnitone.min.esm.js", () => ({
  default: {
    createFOARenderer: mockCreateFOARenderer,
  },
}));

import { AmbisonicRenderer } from "./AmbisonicRenderer";

function createNode() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

describe("AmbisonicRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the stereo-upmix ambisonic playback graph against cacophony", async () => {
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

    const cacophony = {
      context: {},
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

    expect(renderer.initialize).toHaveBeenCalledOnce();
    expect(renderer.setRenderingMode).toHaveBeenCalledWith("ambisonic");
    expect(cacophony.loadStereoToBFormatWorklet).toHaveBeenCalledOnce();
    expect(cacophony.createStereoToBFormatNode).toHaveBeenCalledOnce();
    expect(playback.disconnect).toHaveBeenCalledOnce();
    expect(playback.connect).toHaveBeenCalledWith(encoder);
    expect(encoder.connect).toHaveBeenCalledWith(input);
    expect(output.connect).toHaveBeenCalledWith(cacophony.globalGainNode);
  });

  it("builds the FOA passthrough graph without a stereo encoder", async () => {
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

    const gainNode = createNode();
    const source = createNode();
    const panner = createNode();
    const cacophony = {
      context: {},
      loadStereoToBFormatWorklet: vi.fn().mockResolvedValue(undefined),
      createStereoToBFormatNode: vi.fn(),
      globalGainNode: createNode(),
    };
    const playback = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gainNode,
      panner,
      source,
    };

    const ambisonicRenderer = await AmbisonicRenderer.create(cacophony as any, 4);
    ambisonicRenderer.attachPlayback(playback as any);

    expect(renderer.initialize).toHaveBeenCalledOnce();
    expect(renderer.setRenderingMode).toHaveBeenCalledWith("ambisonic");
    expect(cacophony.loadStereoToBFormatWorklet).not.toHaveBeenCalled();
    expect(cacophony.createStereoToBFormatNode).not.toHaveBeenCalled();
    expect(playback.disconnect).toHaveBeenCalledOnce();
    expect(source.disconnect).toHaveBeenCalledOnce();
    expect(source.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(input);
    expect(output.connect).toHaveBeenCalledWith(cacophony.globalGainNode);
  });

  it("computes the expected yaw rotation matrix", () => {
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
