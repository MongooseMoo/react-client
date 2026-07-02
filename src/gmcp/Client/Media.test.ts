import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockAmbisonicRendererCreate, mockPositionalFoaRendererCreate, mockCreateSound } =
  vi.hoisted(() => ({
    mockAmbisonicRendererCreate: vi.fn(),
    mockPositionalFoaRendererCreate: vi.fn(),
    mockCreateSound: vi.fn(),
  }));

vi.mock('../../audio/AmbisonicRenderer', () => ({
  AmbisonicRenderer: {
    create: mockAmbisonicRendererCreate,
  },
}));

vi.mock('../../audio/PositionalFoaRenderer', () => ({
  PositionalFoaRenderer: {
    create: mockPositionalFoaRendererCreate,
  },
}));

import { MediaService } from '../../audio/MediaService';
import { useSpatialStore } from '../../stores/spatialStore';
import {
  GMCPClientMedia,
  type GMCPMessageClientMediaListenerOrientation,
  type GMCPMessageClientMediaListenerPosition,
  type GMCPMessageClientMediaPlay,
  type GMCPMessageClientMediaStop,
  type GMCPMessageClientMediaUpdate,
} from './Media';

type MockCacophony = ConstructorParameters<typeof MediaService>[0];

type MockPlayback = {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  duration: number;
  stereoPan: number;
};

type MockSound = {
  cleanup: ReturnType<typeof vi.fn>;
  isPlaying: boolean;
  key?: string;
  loop: ReturnType<typeof vi.fn>;
  mediaType?: string;
  on: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  playbacks: MockPlayback[];
  position: number[];
  priority?: number;
  routeTo: ReturnType<typeof vi.fn>;
  seek: ReturnType<typeof vi.fn>;
  stereoPan: number;
  tag?: string;
  threeDOptions?: Record<string, unknown>;
  trigger: (event: string) => void;
  url: string;
  volume: number;
};

function createMockSound(url: string): MockSound {
  const soundListeners = new Map<string, Set<() => void>>();
  const playback: MockPlayback = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    duration: 5,
    stereoPan: 0,
  };

  const sound: MockSound = {
    cleanup: vi.fn(),
    isPlaying: false,
    loop: vi.fn(),
    mediaType: undefined,
    on: vi.fn((event: string, listener: () => void) => {
      if (!soundListeners.has(event)) {
        soundListeners.set(event, new Set());
      }
      soundListeners.get(event)?.add(listener);
      return () => soundListeners.get(event)?.delete(listener);
    }),
    play: vi.fn(() => {
      sound.isPlaying = true;
      return [playback];
    }),
    playbacks: [playback],
    position: [0, 0, 0],
    priority: undefined,
    routeTo: vi.fn(),
    seek: vi.fn(),
    stereoPan: 0,
    tag: undefined,
    threeDOptions: undefined,
    trigger(event: string) {
      for (const listener of soundListeners.get(event) ?? []) {
        listener();
      }
    },
    url,
    volume: 1,
  };

  return sound;
}

function makeEffectBus(name: string | null) {
  return {
    name,
    input: { __input: name },
    output: { gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } },
    addFilter: vi.fn(async (arg: unknown) => arg),
    removeFilter: vi.fn(),
    destroy: vi.fn(),
    drainTo: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    rampFilterParam: vi.fn(),
    setFilterBypassed: vi.fn(),
    destroyed: false,
    gain: 1,
  };
}

function createMockClient() {
  const master = makeEffectBus('master');
  const created: Record<string, ReturnType<typeof makeEffectBus>> = {};
  const anon: Array<ReturnType<typeof makeEffectBus>> = [];
  const effectFactory = () => vi.fn((opts: unknown) => ({ __effect: opts }));
  const cacophony = {
    context: {
      currentTime: 100,
      sampleRate: 48000,
    },
    createSound: mockCreateSound,
    createBus: vi.fn((name?: string) => {
      const bus = makeEffectBus(name ?? null);
      if (name) {
        created[name] = bus;
      } else {
        anon.push(bus);
      }
      return bus;
    }),
    getBus: vi.fn((name: string) => (name === 'master' ? master : created[name])),
    createFdnReverb: effectFactory(),
    createReverb: effectFactory(),
    createDelay: effectFactory(),
    createChorus: effectFactory(),
    createFlanger: effectFactory(),
    createVibrato: effectFactory(),
    createDoubling: effectFactory(),
    createPhaser: effectFactory(),
    createTremolo: effectFactory(),
    createAutoPan: effectFactory(),
    createDistortion: effectFactory(),
    createCompressor: effectFactory(),
    createLimiter: effectFactory(),
    createGate: effectFactory(),
    createBiquadFilter: vi.fn((opts: unknown) => ({ __biquad: opts })),
    listenerForwardOrientation: [0, 0, -1],
    listenerUpOrientation: [0, 1, 0],
    listenerPosition: [0, 0, 0],
    muted: false,
    setGlobalVolume: vi.fn(),
  };
  return {
    effectBuses: { master, created, anon },
    media: new MediaService(cacophony as unknown as MockCacophony, { manageFocus: false }),
    gmcp: {
      send: vi.fn(),
    },
  };
}

describe('GMCPClientMedia', () => {
  let handler: GMCPClientMedia;
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    useSpatialStore.getState().reset();
    mockAmbisonicRendererCreate.mockResolvedValue({
      attachPlayback: vi.fn(),
      cleanup: vi.fn(),
      setRotationMatrixFromYaw: vi.fn(),
      setDistanceGain: vi.fn(),
    });
    mockPositionalFoaRendererCreate.mockResolvedValue({
      attachPlayback: vi.fn(),
      cleanup: vi.fn(),
      setBearingFromPositions: vi.fn(),
      setDistanceGain: vi.fn(),
      setMakeup: vi.fn(),
    });
    client = createMockClient();
    handler = new GMCPClientMedia(client as never);
  });

  afterEach(() => {
    handler.shutdown();
    useSpatialStore.getState().reset();
    vi.useRealTimers();
  });

  it('uses the resolved URL as the load and play key when data.url is missing', async () => {
    handler.handleDefault('https://media.example/');
    const sound = createMockSound('https://media.example/chime.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handleLoad({
      name: 'chime.ogg',
    });

    expect(handler.sounds['https://media.example/chime.ogg']).toBe(sound);

    await handler.handlePlay({
      name: 'chime.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(mockCreateSound).toHaveBeenCalledTimes(1);
    expect(sound.play).toHaveBeenCalledOnce();
    expect(handler.sounds['https://media.example/chime.ogg']).toBe(sound);
  });

  it('passes string sound types to Cacophony', async () => {
    mockCreateSound.mockResolvedValue(createMockSound('https://media.example/theme.ogg'));

    await handler.handlePlay({
      name: 'theme.ogg',
      type: 'music',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(mockCreateSound).toHaveBeenCalledWith(
      'https://mongoose.world:9080/?url=theme.ogg',
      'html',
      'stereo',
    );
  });

  describe('effect chain routing', () => {
    it('routes a played sound through a named chain', async () => {
      const sound = createMockSound('https://media.example/spell.ogg');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        name: 'spell.ogg',
        type: 'sound',
        volume: 50,
        chain: 'cave',
      } as unknown as GMCPMessageClientMediaPlay);
      expect(sound.routeTo).toHaveBeenCalledWith('cave');
    });

    it('uses an aux send when `send` is provided (sound stays dry on master)', async () => {
      const sound = createMockSound('https://media.example/spell.ogg');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        name: 'spell.ogg',
        type: 'sound',
        volume: 50,
        chain: 'cave',
        send: 0.3,
      } as unknown as GMCPMessageClientMediaPlay);
      expect(sound.routeTo).toHaveBeenCalledWith('cave', 0.3);
    });

    it('does not route ambisonic sounds through a chain (out of scope for P0)', async () => {
      const sound = createMockSound('https://media.example/amb.ogg');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        name: 'amb.ogg',
        type: 'sound',
        volume: 50,
        chain: 'cave',
        upmix: 'ambisonic',
      } as unknown as GMCPMessageClientMediaPlay);
      expect(sound.routeTo).not.toHaveBeenCalled();
    });

    it('plays dry (and never crashes) when the chain is unavailable', async () => {
      const sound = createMockSound('https://media.example/spell.ogg');
      sound.routeTo.mockImplementation(() => {
        throw new Error("No bus registered with name 'ghost'");
      });
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        name: 'spell.ogg',
        type: 'sound',
        volume: 50,
        chain: 'ghost',
      } as unknown as GMCPMessageClientMediaPlay);
      expect(sound.play).toHaveBeenCalledOnce(); // the sound still played
    });

    it('advertises EffectsSupport to the server', () => {
      handler.publishEffectsSupport();
      expect(client.gmcp.send).toHaveBeenCalledWith(
        'Client.Media.EffectsSupport',
        expect.stringContaining('reverb'),
      );
    });
  });

  describe('inline effects and automation', () => {
    async function playWithInline(key: string, effects: unknown[]) {
      const sound = createMockSound(`https://media.example/${key}.ogg`);
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        name: `${key}.ogg`,
        type: 'sound',
        volume: 50,
        key,
        effects,
      } as unknown as GMCPMessageClientMediaPlay);
      return sound;
    }

    it('builds an inline chain and routes the sound through its anonymous bus', async () => {
      const sound = await playWithInline('k1', [{ type: 'reverb' }]);
      const anonBus = client.effectBuses.anon[0];
      expect(anonBus).toBeDefined();
      expect(anonBus.addFilter).toHaveBeenCalledTimes(1);
      expect(sound.routeTo).toHaveBeenCalledWith(anonBus);
    });

    it('tears down inline effect buses on stop-all (single release funnel, V4)', async () => {
      await playWithInline('k1', [{ type: 'reverb' }]);
      const anonBus = client.effectBuses.anon[0];
      handler.handleStop({} as GMCPMessageClientMediaStop);
      expect(anonBus.destroy).toHaveBeenCalled();
    });

    it('automates an inline effect addressed by media key', async () => {
      await playWithInline('k1', [{ type: 'reverb', id: 'env' }]);
      const anonBus = client.effectBuses.anon[0];
      handler.handleAutomate({
        key: 'k1',
        target: 'env',
        params: { mix: 0.8 },
        ramp: 1000,
      } as never);
      expect(anonBus.rampFilterParam).toHaveBeenCalledWith(expect.anything(), 'mix', 0.8, {
        duration: 1000,
        type: 'linear',
      });
    });

    it('toggles inline effect bypass addressed by media key', async () => {
      await playWithInline('k1', [{ type: 'reverb', id: 'env' }]);
      const anonBus = client.effectBuses.anon[0];
      handler.handleAutomate({ key: 'k1', target: 'env', bypass: true } as never);
      expect(anonBus.setFilterBypassed).toHaveBeenCalledWith(expect.anything(), true);
    });

    it("routes an ambisonic sound's binaural output through its inline effect bus (V11)", async () => {
      const renderer = {
        attachPlayback: vi.fn(),
        cleanup: vi.fn(),
        setRotationMatrixFromYaw: vi.fn(),
        setDistanceGain: vi.fn(),
      };
      mockAmbisonicRendererCreate.mockResolvedValue(renderer);
      const sound = createMockSound('https://media.example/amb.ogg');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        name: 'amb.ogg',
        type: 'sound',
        volume: 50,
        key: 'amb',
        upmix: 'ambisonic',
        channels: 4,
        effects: [{ type: 'reverb' }],
      } as unknown as GMCPMessageClientMediaPlay);

      const anonBus = client.effectBuses.anon[0];
      expect(anonBus).toBeDefined();
      // The renderer's binaural output is targeted at the inline bus input, NOT master.
      expect(renderer.attachPlayback).toHaveBeenCalledWith(expect.anything(), anonBus.input);
      // An ambisonic sound's playback is not routeTo'd (it feeds the FOA decoder).
      expect(sound.routeTo).not.toHaveBeenCalled();
    });
  });

  it('stores tag and type so stop-by-tag and stop-by-type work', async () => {
    const sound = createMockSound('https://media.example/ambience/rain.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'rain-loop',
      name: 'ambience/rain.ogg',
      tag: 'weather',
      type: 'music',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(sound.tag).toBe('weather');
    expect(sound.mediaType).toBe('music');

    handler.handleStop({ tag: 'weather' } as GMCPMessageClientMediaStop);
    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it('cleans up the replaced sound and stores only the replacement', async () => {
    const oldSound = createMockSound('one.ogg');
    const newSound = createMockSound('two.ogg');
    mockCreateSound.mockResolvedValueOnce(oldSound).mockResolvedValueOnce(newSound);

    await handler.handlePlay({
      key: 'effect',
      name: 'one.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    await handler.handlePlay({
      key: 'effect',
      name: 'two.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(oldSound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds.effect).toBe(newSound);
  });

  it('cleans up a sound when its MCMP finish endpoint is reached', async () => {
    vi.useFakeTimers();
    const sound = createMockSound('bell.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      finish: 250,
      key: 'bell',
      name: 'bell.ogg',
      start: 100,
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    vi.advanceTimersByTime(149);
    expect(sound.cleanup).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it('keeps end as a compatibility stop delay alias', async () => {
    vi.useFakeTimers();
    const sound = createMockSound('bell.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      end: 100,
      key: 'bell',
      name: 'bell.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    vi.advanceTimersByTime(100);

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it('cleans up a finite sound after natural playback completion', async () => {
    const sound = createMockSound('pop.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'pop',
      name: 'pop.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    sound.trigger('ended');

    // Cleanup is deferred one macrotask so cacophony's own end-of-playback
    // teardown runs before we free the sound; let that tick elapse.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it('stops sounds by full name suffix instead of last-character matching', async () => {
    const sound = createMockSound('https://media.example/birds/chirp.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'bird-1',
      name: 'birds/chirp.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    handler.handleStop({ name: 'birds/chirp.ogg' } as GMCPMessageClientMediaStop);

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it('updates an existing sound in place without replaying it', async () => {
    const sound = createMockSound('https://media.example/radio.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'radio-1',
      name: 'radio.ogg',
      type: 'sound',
      volume: 50,
      is3d: true,
      position: [0, 0, 0],
    } as GMCPMessageClientMediaPlay);

    expect(sound.play).toHaveBeenCalledTimes(1);

    handler.handleUpdate({
      key: 'radio-1',
      volume: 25,
      pan: 50,
      start: 2000,
      is3d: true,
      position: [4, 5, 6],
    } as GMCPMessageClientMediaUpdate);

    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(sound.volume).toBe(0.25);
    expect(sound.stereoPan).toBe(0.5);
    expect(sound.position).toEqual([-4, 6, 5]);
    expect(sound.seek).toHaveBeenCalledWith(2);
    expect(sound.threeDOptions).toMatchObject({
      distanceModel: 'inverse',
      panningModel: 'HRTF',
    });
  });

  it('routes 2-channel ambisonic upmix through the positional FOA renderer', async () => {
    const sound = createMockSound('https://media.example/show.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'show-1',
      name: 'show.ogg',
      type: 'music',
      upmix: 'ambisonic',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    // 2 channels (default) -> positional FOA path (makeup 3, stereo width 0.6),
    // NOT the AmbisonicRenderer stereo-upmix path.
    const renderer = await mockPositionalFoaRendererCreate.mock.results[0].value;
    expect(mockPositionalFoaRendererCreate).toHaveBeenCalledWith(client.media.cacophony, 3, 0.6);
    expect(mockAmbisonicRendererCreate).not.toHaveBeenCalled();
    expect(renderer.attachPlayback).toHaveBeenCalledWith(sound.playbacks[0], undefined);
    expect(renderer.setBearingFromPositions).toHaveBeenCalled();

    const bearingCalls = renderer.setBearingFromPositions.mock.calls.length;
    handler.handleListenerOrientation({
      forward: [1, 0, 0],
    } as GMCPMessageClientMediaListenerOrientation);

    // Orientation re-aims the source — positional FOA bakes head-rotation into the bearing.
    expect(renderer.setBearingFromPositions.mock.calls.length).toBeGreaterThan(bearingCalls);

    handler.handleStop({ key: 'show-1' } as GMCPMessageClientMediaStop);
    expect(renderer.cleanup).toHaveBeenCalledOnce();
  });

  it('attenuates a positioned 2-channel ambisonic source via the positional renderer', async () => {
    const renderer = {
      attachPlayback: vi.fn(),
      cleanup: vi.fn(),
      setBearingFromPositions: vi.fn(),
      setDistanceGain: vi.fn(),
      setMakeup: vi.fn(),
    };
    mockPositionalFoaRendererCreate.mockResolvedValue(renderer);
    const sound = createMockSound('https://media.example/show.ogg');
    const setPosition = vi.fn();
    Object.defineProperty(sound, 'position', {
      configurable: true,
      get: () => [0, 0, 0],
      set: setPosition,
    });
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'show-1',
      name: 'show.ogg',
      position: [0, 0, 10],
      type: 'sound',
      upmix: 'ambisonic',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(setPosition).toHaveBeenCalledWith([0, 10, 0]);
    expect(renderer.setDistanceGain).toHaveBeenCalled();
    // refDistance 1, rolloff 0.5 → 1 / (1 + 0.5 * (10 - 1)) = 1 / 5.5 = 2 / 11.
    expect(renderer.setDistanceGain.mock.calls[0][0]).toBeCloseTo(2 / 11);
  });

  it('preserves omitted listener position and orientation fields', () => {
    client.media.cacophony.listenerPosition = [9, 8, 7];
    client.media.cacophony.listenerForwardOrientation = [0, 0, -1];
    client.media.cacophony.listenerUpOrientation = [0, 0, 1];

    handler.handleListenerPosition({} as GMCPMessageClientMediaListenerPosition);
    expect(client.media.cacophony.listenerPosition).toEqual([9, 8, 7]);

    handler.handleListenerOrientation({
      forward: [1, 0, 0],
    } as GMCPMessageClientMediaListenerOrientation);
    expect(client.media.cacophony.listenerForwardOrientation).toEqual([-1, 0, 0]);
    expect(client.media.cacophony.listenerUpOrientation).toEqual([0, 0, 1]);

    handler.handleListenerOrientation({
      up: [0, 1, 0],
    } as GMCPMessageClientMediaListenerOrientation);
    expect(client.media.cacophony.listenerForwardOrientation).toEqual([-1, 0, 0]);
    expect(client.media.cacophony.listenerUpOrientation).toEqual([0, 0, 1]);
  });

  it('routes declared four-channel ambisonic playback through FOA passthrough', async () => {
    const sound = createMockSound('https://media.example/foa.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      channels: 4,
      key: 'foa-1',
      name: 'foa.ogg',
      type: 'music',
      upmix: 'ambisonic',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    const renderer = await mockAmbisonicRendererCreate.mock.results[0].value;
    expect(mockAmbisonicRendererCreate).toHaveBeenCalledWith(client.media.cacophony, 4);
    expect(renderer.attachPlayback).toHaveBeenCalledWith(sound.playbacks[0], undefined);
    expect(sound.inputChannels).toBe(4);
  });

  describe('async staleness races (H1/H2)', () => {
    it('plays exactly one sound when two rapid plays race for the same key (H1)', async () => {
      const soundA = createMockSound('https://media.example/race.ogg');
      const soundB = createMockSound('https://media.example/race.ogg');
      mockCreateSound.mockResolvedValueOnce(soundA).mockResolvedValueOnce(soundB);

      const p1 = handler.handlePlay({
        key: 'race',
        name: 'race.ogg',
        type: 'sound',
        volume: 50,
      } as GMCPMessageClientMediaPlay);
      const p2 = handler.handlePlay({
        key: 'race',
        name: 'race.ogg',
        type: 'sound',
        volume: 50,
      } as GMCPMessageClientMediaPlay);
      await Promise.all([p1, p2]);

      // The first play to resolve createSound claims the slot and plays; the
      // loser is released before it can play, so no orphaned overlapping audio.
      expect(handler.sounds.race).toBe(soundA);
      expect(soundA.play).toHaveBeenCalledOnce();
      expect(soundB.play).not.toHaveBeenCalled();
      expect(soundB.cleanup).toHaveBeenCalledOnce();
    });

    it('does not attach the positional FOA renderer to a sound released mid-create (H2)', async () => {
      const sound = createMockSound('https://media.example/show.ogg');
      mockCreateSound.mockResolvedValue(sound);

      const renderer = {
        attachPlayback: vi.fn(),
        cleanup: vi.fn(),
        setBearingFromPositions: vi.fn(),
        setDistanceGain: vi.fn(),
        setMakeup: vi.fn(),
      };
      let resolveRenderer!: (value: typeof renderer) => void;
      let signalCreateStarted!: () => void;
      const createStarted = new Promise<void>((res) => {
        signalCreateStarted = res;
      });
      mockPositionalFoaRendererCreate.mockImplementation(() => {
        signalCreateStarted();
        return new Promise((res) => {
          resolveRenderer = res;
        });
      });

      const play = handler.handlePlay({
        key: 'race',
        name: 'show.ogg',
        type: 'sound',
        upmix: 'ambisonic',
        volume: 50,
      } as unknown as GMCPMessageClientMediaPlay);

      // Wait until play() is parked awaiting the renderer worklet init (the sound
      // is registered by now), then release it before the renderer resolves.
      await createStarted;
      handler.handleStop({ key: 'race' } as GMCPMessageClientMediaStop);
      resolveRenderer(renderer);
      await play;

      expect(renderer.attachPlayback).not.toHaveBeenCalled();
      expect(renderer.cleanup).toHaveBeenCalledOnce();
    });

    it('does not attach the ambisonic renderer to a sound released mid-create (H2)', async () => {
      const sound = createMockSound('https://media.example/foa.ogg');
      mockCreateSound.mockResolvedValue(sound);

      const renderer = {
        attachPlayback: vi.fn(),
        cleanup: vi.fn(),
        setRotationMatrixFromYaw: vi.fn(),
        setDistanceGain: vi.fn(),
      };
      let resolveRenderer!: (value: typeof renderer) => void;
      let signalCreateStarted!: () => void;
      const createStarted = new Promise<void>((res) => {
        signalCreateStarted = res;
      });
      mockAmbisonicRendererCreate.mockImplementation(() => {
        signalCreateStarted();
        return new Promise((res) => {
          resolveRenderer = res;
        });
      });

      const play = handler.handlePlay({
        channels: 4,
        key: 'race',
        name: 'foa.ogg',
        type: 'sound',
        upmix: 'ambisonic',
        volume: 50,
      } as unknown as GMCPMessageClientMediaPlay);

      await createStarted;
      handler.handleStop({ key: 'race' } as GMCPMessageClientMediaStop);
      resolveRenderer(renderer);
      await play;

      expect(renderer.attachPlayback).not.toHaveBeenCalled();
      expect(renderer.cleanup).toHaveBeenCalledOnce();
    });
  });

  it('updates ambisonic renderer rotation on Client.Spatial orientation events', async () => {
    const sound = createMockSound('https://media.example/show.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      channels: 4,
      key: 'show-1',
      name: 'show.ogg',
      type: 'music',
      upmix: 'ambisonic',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    const renderer = await mockAmbisonicRendererCreate.mock.results[0].value;

    client.media.cacophony.listenerForwardOrientation = [-1, 0, 0];
    useSpatialStore.getState().setListenerOrientation(
      {
        forward: [-1, 0, 0],
        up: [0, 1, 0],
      },
      'player-1',
    );

    expect(renderer.setRotationMatrixFromYaw).toHaveBeenLastCalledWith(-Math.PI / 2);
  });
});
