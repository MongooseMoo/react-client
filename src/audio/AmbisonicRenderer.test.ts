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

  it("builds the ambisonic playback graph against cacophony", async () => {
    const splitter = createNode();
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
      createSplitter: vi.fn(() => splitter),
      createStereoToBFormatNode: vi.fn().mockResolvedValue(encoder),
      globalGainNode: createNode(),
    };
    const playback = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    const ambisonicRenderer = await AmbisonicRenderer.create(cacophony as any);
    ambisonicRenderer.attachPlayback(playback as any);

    expect(renderer.initialize).toHaveBeenCalledOnce();
    expect(renderer.setRenderingMode).toHaveBeenCalledWith("ambisonic");
    expect(cacophony.createSplitter).toHaveBeenCalledWith(2);
    expect(cacophony.createStereoToBFormatNode).toHaveBeenCalledOnce();
    expect(playback.disconnect).toHaveBeenCalledOnce();
    expect(playback.connect).toHaveBeenCalledWith(splitter);
    expect(splitter.connect).toHaveBeenCalledWith(encoder);
    expect(encoder.connect).toHaveBeenCalledWith(input);
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
