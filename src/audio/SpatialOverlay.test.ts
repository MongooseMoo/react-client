import type { Cacophony } from 'cacophony';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AmbisonicRenderer } from './AmbisonicRenderer';
import { SpatialOverlay } from './SpatialOverlay';

// Mock the omnitone-backed renderer so the overlay's rotation POLICY can be
// tested without a real FOARenderer / Web Audio context.
vi.mock('./AmbisonicRenderer', () => ({
  AmbisonicRenderer: { create: vi.fn() },
}));

type MockBus = {
  name: string | null;
  input: Record<string, unknown>;
  destroy: ReturnType<typeof vi.fn>;
  destroyed: boolean;
  gain: number;
  output: {
    gain: {
      value: number;
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
  };
};

function makeBus(name: string | null): MockBus {
  return {
    name,
    input: { __input: name },
    destroy: vi.fn(),
    destroyed: false,
    gain: 1,
    output: { gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } },
  };
}

function makeCacophony() {
  const created: MockBus[] = [];
  const cacophony = {
    context: { sampleRate: 48000, currentTime: 0 },
    createBus: vi.fn((name?: string) => {
      const b = makeBus(name ?? null);
      created.push(b);
      return b;
    }),
  };
  return { cacophony: cacophony as unknown as Cacophony, created };
}

function makeRenderer() {
  return { setRotationMatrixFromYaw: vi.fn(), attachPlayback: vi.fn(), cleanup: vi.fn() };
}

describe('SpatialOverlay', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a named overlay bus and exposes it', () => {
    const { cacophony, created } = makeCacophony();
    const overlay = SpatialOverlay.create(cacophony, { name: 'sensor-sphere' });
    expect(cacophony.createBus).toHaveBeenCalledWith('sensor-sphere');
    expect(overlay.bus).toBe(created[0] as unknown);
  });

  it('applies an initial gain to the bus', () => {
    const { cacophony, created } = makeCacophony();
    SpatialOverlay.create(cacophony, { gain: 0.5 });
    expect(created[0].gain).toBe(0.5);
  });

  it('head-stable overlay ignores world yaw but honors instrument yaw', async () => {
    const { cacophony } = makeCacophony();
    const renderer = makeRenderer();
    vi.mocked(AmbisonicRenderer.create).mockResolvedValue(renderer as unknown as AmbisonicRenderer);
    const overlay = SpatialOverlay.create(cacophony, { headStable: true });
    await overlay.attachRenderer(4);

    overlay.setWorldYaw(1.2);
    expect(renderer.setRotationMatrixFromYaw).not.toHaveBeenCalled();

    overlay.setInstrumentYaw(0.7);
    expect(renderer.setRotationMatrixFromYaw).toHaveBeenCalledWith(0.7);
  });

  it('world-tracking overlay rotates with world yaw', async () => {
    const { cacophony } = makeCacophony();
    const renderer = makeRenderer();
    vi.mocked(AmbisonicRenderer.create).mockResolvedValue(renderer as unknown as AmbisonicRenderer);
    const overlay = SpatialOverlay.create(cacophony, { headStable: false });
    await overlay.attachRenderer(4);

    overlay.setWorldYaw(1.2);
    expect(renderer.setRotationMatrixFromYaw).toHaveBeenCalledWith(1.2);
  });

  it('routes a member playback through the renderer into the overlay bus', async () => {
    const { cacophony, created } = makeCacophony();
    const renderer = makeRenderer();
    vi.mocked(AmbisonicRenderer.create).mockResolvedValue(renderer as unknown as AmbisonicRenderer);
    const overlay = SpatialOverlay.create(cacophony, { name: 'ov' });
    await overlay.attachRenderer(4);

    const playback = { disconnect: vi.fn(), connect: vi.fn() };
    overlay.addMember(playback as never);
    expect(renderer.attachPlayback).toHaveBeenCalledWith(playback, created[0].input);
  });

  it('rampGain ramps the bus output gain over time, or sets instantly', () => {
    const { cacophony, created } = makeCacophony();
    const overlay = SpatialOverlay.create(cacophony);

    overlay.rampGain(0.2, 500);
    expect(created[0].output.gain.setValueAtTime).toHaveBeenCalled();
    expect(created[0].output.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.2, 0.5);

    overlay.rampGain(0.8);
    expect(created[0].gain).toBe(0.8);
  });

  it('destroy cleans up the renderer and destroys the bus, idempotently', async () => {
    const { cacophony, created } = makeCacophony();
    const renderer = makeRenderer();
    vi.mocked(AmbisonicRenderer.create).mockResolvedValue(renderer as unknown as AmbisonicRenderer);
    const overlay = SpatialOverlay.create(cacophony, { name: 'x' });
    await overlay.attachRenderer(4);

    overlay.destroy();
    expect(renderer.cleanup).toHaveBeenCalledTimes(1);
    expect(created[0].destroy).toHaveBeenCalledTimes(1);

    overlay.destroy();
    expect(created[0].destroy).toHaveBeenCalledTimes(1);
  });
});
