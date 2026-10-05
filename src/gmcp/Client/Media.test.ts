import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockAmbisonicRendererCreate,
  mockPositionalFoaRendererCreate,
  mockCreateSound,
  mockCreateSprite,
} = vi.hoisted(() => ({
  mockAmbisonicRendererCreate: vi.fn(),
  mockPositionalFoaRendererCreate: vi.fn(),
  mockCreateSound: vi.fn(),
  mockCreateSprite: vi.fn(),
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

import { MAX_SEND_DISTANCE_BOOST } from '../../audio/distanceModel';
import { MEDIA_SEEK_TOLERANCE_MS, MediaService } from '../../audio/MediaService';
import { MediaPayloadError } from '../../audio/mediaPayloads';
import { VectorTweener } from '../../audio/vectorTween';
import { useSpatialStore } from '../../stores/spatialStore';
import {
  GMCPClientMedia,
  type GMCPMessageClientMediaLoad,
  type GMCPMessageClientMediaListenerOrientation,
  type GMCPMessageClientMediaListenerPosition,
  type GMCPMessageClientMediaPlay,
  type GMCPMessageClientMediaStop,
  type GMCPMessageClientMediaUpdate,
} from './Media';
import { GMCPClientSpatial } from './Spatial';

type MockCacophony = ConstructorParameters<typeof MediaService>[0];

type MockPlayback = {
  connect: ReturnType<typeof vi.fn>;
  /** Playhead in seconds into the sound (its region, if it has one); unset = not reported. */
  currentTime?: number;
  disconnect: ReturnType<typeof vi.fn>;
  duration: number;
  /** The last requested amount, as Cacophony's `Playback.occlusion` reports it. */
  occlusion: number;
  play: ReturnType<typeof vi.fn>;
  seek: ReturnType<typeof vi.fn>;
  /** Optional so a test can remove it to model an engine without the occlusion stage. */
  setOcclusion?: ReturnType<typeof vi.fn>;
  stereoPan: number;
};

type MockSound = {
  buffer?: { duration: number };
  cleanup: ReturnType<typeof vi.fn>;
  region?: { start: number; duration: number };
  isPlaying: boolean;
  key?: string;
  loop: ReturnType<typeof vi.fn>;
  mediaType?: string;
  on: ReturnType<typeof vi.fn>;
  /** Fixed at creation, as in Cacophony; the client's mock createSound/createSprite set it. */
  panType: 'HRTF' | 'stereo';
  playbackRate: number;
  playbacks: MockPlayback[];
  position: number[];
  preplay: ReturnType<typeof vi.fn>;
  priority?: number;
  removeSend: ReturnType<typeof vi.fn>;
  routeTo: ReturnType<typeof vi.fn>;
  seek: ReturnType<typeof vi.fn>;
  stereoPan: number;
  tag?: string;
  threeDOptions?: Record<string, unknown>;
  trigger: (event: string) => void;
  url: string;
  /** The voice MediaService prepares with preplay() and starts with Playback.play(). */
  voice: MockPlayback;
  volume: number;
};

function createMockSound(url: string): MockSound {
  const soundListeners = new Map<string, Set<() => void>>();
  const playback: MockPlayback = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    duration: 5,
    occlusion: 0,
    play: vi.fn(() => {
      sound.isPlaying = true;
      return [playback];
    }),
    seek: vi.fn(),
    setOcclusion: vi.fn((amount: number) => {
      playback.occlusion = amount;
    }),
    stereoPan: 0,
  };
  let position = [0, 0, 0];
  let stereoPan = 0;
  let threeDOptions: Record<string, unknown> | undefined;

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
    panType: 'stereo',
    playbackRate: 1,
    preplay: vi.fn(() => [playback]),
    voice: playback,
    playbacks: [playback],
    // Cacophony's spatial setters reject the other panning mode (and throw the
    // same messages); the mock must too, or a test can pass on a call that
    // throws in the real library.
    get position() {
      return position;
    },
    set position(value: number[]) {
      if (sound.panType !== 'HRTF') {
        throw new Error('Position and threeDOptions require HRTF panning');
      }
      position = value;
    },
    priority: undefined,
    removeSend: vi.fn(),
    routeTo: vi.fn(),
    seek: vi.fn(),
    get stereoPan() {
      return stereoPan;
    },
    set stereoPan(value: number) {
      if (sound.panType !== 'stereo') {
        throw new Error('Stereo panning is not available when using HRTF.');
      }
      stereoPan = value;
    },
    tag: undefined,
    get threeDOptions() {
      return threeDOptions;
    },
    set threeDOptions(value: Record<string, unknown> | undefined) {
      if (sound.panType !== 'HRTF') {
        throw new Error('Position and threeDOptions require HRTF panning');
      }
      threeDOptions = value;
    },
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
    // A source's panning mode is whatever it was created with.
    createSound: async (...args: unknown[]) => {
      const sound = await mockCreateSound(...args);
      if (sound && (args[2] === 'HRTF' || args[2] === 'stereo')) {
        sound.panType = args[2];
      }
      return sound;
    },
    createSprite: async (...args: unknown[]) => {
      const sprite = await mockCreateSprite(...args);
      const panType = (args[2] as { panType?: 'HRTF' | 'stereo' } | undefined)?.panType;
      const segment = sprite?.get?.('segment');
      if (segment && panType) {
        segment.panType = panType;
      }
      return sprite;
    },
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
  // Manually-clocked tweener so tests can step sound-position glides.
  let motionNow = 0;
  let motionFrame: (() => void) | null = null;
  const motion = new VectorTweener({
    now: () => motionNow,
    scheduler: {
      schedule: (callback) => {
        motionFrame = callback;
        return callback;
      },
      cancel: (handle) => {
        if (motionFrame === handle) {
          motionFrame = null;
        }
      },
    },
  });
  const stepMotion = (ms: number) => {
    motionNow += ms;
    const frame = motionFrame;
    motionFrame = null;
    frame?.();
  };

  return {
    effectBuses: { master, created, anon },
    media: new MediaService(cacophony as unknown as MockCacophony, { manageFocus: false, motion }),
    stepMotion,
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
    handler.handleDefault({ url: 'https://media.example/' });
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
    expect(sound.voice.play).toHaveBeenCalledOnce();
    expect(handler.sounds['https://media.example/chime.ogg']).toBe(sound);
  });

  it('reuses a preloaded music sound under the proxied playback key', async () => {
    const mediaUrl = 'https://media.example/theme.ogg';
    const proxiedUrl = `https://mongoose.world:9080/?url=${encodeURIComponent(mediaUrl)}`;
    const sound = createMockSound(proxiedUrl);
    mockCreateSound.mockResolvedValue(sound);

    await handler.handleLoad({
      name: 'theme.ogg',
      url: 'https://media.example/',
      type: 'music',
    } as GMCPMessageClientMediaLoad);

    expect(handler.sounds[proxiedUrl]).toBe(sound);

    await handler.handlePlay({
      name: 'theme.ogg',
      url: 'https://media.example/',
      type: 'music',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(mockCreateSound).toHaveBeenCalledTimes(1);
    expect(sound.voice.play).toHaveBeenCalledOnce();
    expect(handler.sounds[proxiedUrl]).toBe(sound);
  });

  it('evicts the oldest preload when the preload cache reaches its limit', async () => {
    const sounds = Array.from({ length: 33 }, (_, index) =>
      createMockSound(`https://media.example/sound-${index}.ogg`),
    );
    mockCreateSound.mockImplementation(async () => sounds[mockCreateSound.mock.calls.length - 1]);

    for (let index = 0; index < sounds.length; index += 1) {
      await handler.handleLoad({
        name: `sound-${index}.ogg`,
        url: 'https://media.example/',
      });
    }

    expect(Object.keys(handler.sounds)).toHaveLength(32);
    expect(handler.sounds['https://media.example/sound-0.ogg']).toBeUndefined();
    expect(sounds[0].cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds['https://media.example/sound-32.ogg']).toBe(sounds[32]);
  });

  it('clears media session state without disposing lifetime ownership', async () => {
    handler.handleDefault({ url: 'https://media.example/' });
    const sound = createMockSound('https://media.example/chime.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await handler.handleLoad({ name: 'chime.ogg' });

    handler.reset();

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
    expect(client.media.defaultUrl).toBe('');
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
      expect(sound.voice.play).toHaveBeenCalledOnce(); // the sound still played
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

  it('preserves existing metadata when a repeated play omits optional fields', async () => {
    const sound = createMockSound('rain.ogg');
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'rain-loop',
      name: 'rain.ogg',
      tag: 'weather',
      type: 'sound',
      upmix: 'ambisonic',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    await handler.handlePlay({
      key: 'rain-loop',
      name: 'rain.ogg',
      volume: 25,
    } as GMCPMessageClientMediaPlay);

    expect(sound.key).toBe('rain-loop');
    expect(sound.tag).toBe('weather');
    expect(sound.mediaType).toBe('sound');
    expect(sound.upmix).toBe('ambisonic');

    handler.handleStop({ tag: 'weather' } as GMCPMessageClientMediaStop);
    expect(sound.cleanup).toHaveBeenCalledOnce();
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

  it('stops and releases all sounds when the media service shuts down', async () => {
    const firstSound = createMockSound('one.ogg');
    const secondSound = createMockSound('two.ogg');
    mockCreateSound.mockResolvedValueOnce(firstSound).mockResolvedValueOnce(secondSound);

    await handler.handlePlay({
      key: 'first',
      name: 'one.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);
    await handler.handlePlay({
      key: 'second',
      name: 'two.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    client.media.shutdown();

    expect(firstSound.cleanup).toHaveBeenCalledOnce();
    expect(secondSound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
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

  describe('MCMP start..finish segments', () => {
    function mockSegmentSound(url: string, start: number, duration: number) {
      const base = createMockSound(url);
      base.buffer = { duration: 10 };
      const region = createMockSound('');
      region.buffer = base.buffer;
      region.region = { start, duration };
      mockCreateSound.mockResolvedValue(base);
      mockCreateSprite.mockResolvedValue({ get: () => region });
      return { base, region };
    }

    it('loops the start..finish region, not the whole file', async () => {
      vi.useFakeTimers();
      const { base, region } = mockSegmentSound('rain.ogg', 2, 3);

      await handler.handlePlay({
        finish: 5000,
        key: 'rain',
        loops: -1,
        name: 'rain.ogg',
        start: 2000,
        type: 'sound',
        volume: 50,
      } as GMCPMessageClientMediaPlay);

      expect(mockCreateSprite).toHaveBeenCalledWith(
        base.buffer,
        { segment: { start: 2, duration: 3 } },
        { panType: 'stereo' },
      );
      expect(base.cleanup).toHaveBeenCalledOnce();
      expect(handler.sounds.rain).toBe(region);
      expect(region.voice.play).toHaveBeenCalledOnce();
      expect(region.loop).toHaveBeenCalledWith('infinite');
      // Positions are absolute in MCMP but region-relative in Cacophony: the
      // cursor sits at the region start, so the voice starts at 0 with no seek.
      expect(region.voice.seek).not.toHaveBeenCalled();
      expect(region.seek).not.toHaveBeenCalled();

      // No stop timer: an infinite segment keeps playing past one clip length.
      vi.advanceTimersByTime(60_000);
      expect(region.cleanup).not.toHaveBeenCalled();
    });

    it('lets a finite region end naturally after N passes', async () => {
      vi.useFakeTimers();
      const { region } = mockSegmentSound('drip.ogg', 1, 0.5);

      await handler.handlePlay({
        finish: 1500,
        key: 'drip',
        loops: 3,
        name: 'drip.ogg',
        start: 1000,
        type: 'sound',
        volume: 50,
      } as GMCPMessageClientMediaPlay);

      expect(region.loop).toHaveBeenCalledWith(2);
      vi.advanceTimersByTime(10_000);
      expect(region.cleanup).not.toHaveBeenCalled();

      region.trigger('ended');
      vi.advanceTimersByTime(0);
      expect(region.cleanup).toHaveBeenCalledOnce();
    });

    it('clamps finish to the end of the file', async () => {
      mockSegmentSound('tail.ogg', 8, 2);

      await handler.handlePlay({
        finish: 99_000,
        key: 'tail',
        name: 'tail.ogg',
        start: 8000,
        type: 'sound',
        volume: 50,
      } as GMCPMessageClientMediaPlay);

      expect(mockCreateSprite).toHaveBeenCalledWith(
        expect.anything(),
        { segment: { start: 8, duration: 2 } },
        expect.anything(),
      );
    });

    it('repeats a region-less segment by seeking back, then stops after N x (finish - start)', async () => {
      vi.useFakeTimers();
      const sound = createMockSound('theme.ogg');
      mockCreateSound.mockResolvedValue(sound);

      await handler.handlePlay({
        finish: 300,
        key: 'theme',
        loops: 3,
        name: 'theme.ogg',
        start: 100,
        type: 'music',
        volume: 50,
      } as GMCPMessageClientMediaPlay);

      expect(mockCreateSprite).not.toHaveBeenCalled();
      expect(sound.loop).not.toHaveBeenCalled();
      // The prepared voice is positioned before it starts.
      expect(sound.voice.seek).toHaveBeenCalledWith(0.1);
      sound.seek.mockClear();

      vi.advanceTimersByTime(200);
      expect(sound.seek).toHaveBeenCalledWith(0.1);
      vi.advanceTimersByTime(200);
      expect(sound.cleanup).not.toHaveBeenCalled();
      vi.advanceTimersByTime(199);
      expect(sound.cleanup).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(sound.cleanup).toHaveBeenCalledOnce();
    });

    it('never stops an infinite region-less segment', async () => {
      vi.useFakeTimers();
      const sound = createMockSound('theme.ogg');
      mockCreateSound.mockResolvedValue(sound);

      await handler.handlePlay({
        finish: 300,
        key: 'theme',
        loops: -1,
        name: 'theme.ogg',
        start: 100,
        type: 'music',
        volume: 50,
      } as GMCPMessageClientMediaPlay);

      vi.advanceTimersByTime(60_000);
      expect(sound.cleanup).not.toHaveBeenCalled();
    });

    it('does not stack a second stop timer when the same key is replayed', async () => {
      vi.useFakeTimers();
      const sound = createMockSound('bell.ogg');
      mockCreateSound.mockResolvedValue(sound);
      const play = {
        finish: 250,
        key: 'bell',
        loops: 2,
        name: 'bell.ogg',
        start: 50,
        type: 'sound',
        volume: 50,
      } as GMCPMessageClientMediaPlay;

      await handler.handlePlay(play);
      vi.advanceTimersByTime(100);
      await handler.handlePlay(play);

      // One timer from the first Play: passes end at 200ms and 400ms.
      vi.advanceTimersByTime(299);
      expect(sound.cleanup).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(sound.cleanup).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(1000);
      expect(sound.cleanup).toHaveBeenCalledOnce();
    });

    it('reads end as a finish position, not a delay', async () => {
      vi.useFakeTimers();
      const sound = createMockSound('bell.ogg');
      mockCreateSound.mockResolvedValue(sound);

      await handler.handlePlay({
        end: 300,
        key: 'bell',
        name: 'bell.ogg',
        start: 100,
        type: 'music',
        volume: 50,
      } as GMCPMessageClientMediaPlay);

      vi.advanceTimersByTime(199);
      expect(sound.cleanup).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(sound.cleanup).toHaveBeenCalledOnce();
    });

    it('moves the segment when an Update carries finish', async () => {
      const first = mockSegmentSound('rain.ogg', 2, 3);

      await handler.handlePlay({
        finish: 5000,
        key: 'rain',
        loops: -1,
        name: 'rain.ogg',
        start: 2000,
        type: 'sound',
        volume: 50,
      } as GMCPMessageClientMediaPlay);

      const second = mockSegmentSound('rain.ogg', 2, 4);
      handler.handleUpdate({ key: 'rain', finish: 6000 } as GMCPMessageClientMediaUpdate);
      await vi.waitFor(() => expect(second.region.voice.play).toHaveBeenCalledOnce());

      expect(first.region.cleanup).toHaveBeenCalledOnce();
      expect(mockCreateSprite).toHaveBeenLastCalledWith(
        second.base.buffer,
        { segment: { start: 2, duration: 4 } },
        { panType: 'stereo' },
      );
      expect(second.region.loop).toHaveBeenCalledWith('infinite');
      expect(handler.sounds.rain).toBe(second.region);
    });

    describe('loopStart (the repeat window start, #3010:45)', () => {
      it('plays start..finish once, then loopStart..finish for the remaining loops', async () => {
        const { region } = mockSegmentSound('bells.ogg', 0, 10);

        await handler.handlePlay({
          finish: 10000,
          key: 'bells',
          loopStart: 0,
          loops: 3,
          name: 'bells.ogg',
          start: 5000,
          type: 'sound',
          volume: 50,
        } as GMCPMessageClientMediaPlay);

        // The region is the repeat window 0..10 s, so Cacophony's later passes
        // restart at its start; the first pass joins it at the 5 s cursor.
        expect(mockCreateSprite).toHaveBeenCalledWith(
          expect.anything(),
          { segment: { start: 0, duration: 10 } },
          { panType: 'stereo' },
        );
        expect(region.voice.seek).toHaveBeenCalledWith(5);
        expect(region.voice.play).toHaveBeenCalledOnce();
        // loops counts plays from start: 5–10 once, then 0–10 twice.
        expect(region.loop).toHaveBeenCalledWith(2);
      });

      it('with loops -1, plays start..finish and then loops loopStart..finish forever', async () => {
        vi.useFakeTimers();
        const { region } = mockSegmentSound('hum.ogg', 1, 9);

        await handler.handlePlay({
          finish: 10000,
          key: 'hum',
          loopStart: 1000,
          loops: -1,
          name: 'hum.ogg',
          start: 5000,
          type: 'sound',
          volume: 50,
        } as GMCPMessageClientMediaPlay);

        expect(mockCreateSprite).toHaveBeenCalledWith(
          expect.anything(),
          { segment: { start: 1, duration: 9 } },
          { panType: 'stereo' },
        );
        expect(region.voice.seek).toHaveBeenCalledWith(4);
        expect(region.loop).toHaveBeenCalledWith('infinite');
        vi.advanceTimersByTime(60_000);
        expect(region.cleanup).not.toHaveBeenCalled();
      });

      it('repeats a region-less sound from loopStart after a first pass from start', async () => {
        vi.useFakeTimers();
        const sound = createMockSound('theme.ogg');
        mockCreateSound.mockResolvedValue(sound);

        await handler.handlePlay({
          finish: 300,
          key: 'theme',
          loopStart: 0,
          loops: 3,
          name: 'theme.ogg',
          start: 100,
          type: 'music',
          volume: 50,
        } as GMCPMessageClientMediaPlay);

        expect(sound.voice.seek).toHaveBeenCalledWith(0.1);
        // First pass 100..300 (200 ms), then two passes of 0..300 (300 ms each).
        vi.advanceTimersByTime(199);
        expect(sound.seek).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(sound.seek).toHaveBeenLastCalledWith(0);
        vi.advanceTimersByTime(300);
        expect(sound.seek).toHaveBeenCalledTimes(2);
        expect(sound.seek).toHaveBeenLastCalledWith(0);
        vi.advanceTimersByTime(299);
        expect(sound.cleanup).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(sound.cleanup).toHaveBeenCalledOnce();
      });

      it('loops a region-less sound from loopStart forever with loops -1', async () => {
        vi.useFakeTimers();
        const sound = createMockSound('theme.ogg');
        mockCreateSound.mockResolvedValue(sound);

        await handler.handlePlay({
          finish: 300,
          key: 'theme',
          loopStart: 50,
          loops: -1,
          name: 'theme.ogg',
          start: 100,
          type: 'music',
          volume: 50,
        } as GMCPMessageClientMediaPlay);

        vi.advanceTimersByTime(200);
        expect(sound.seek).toHaveBeenLastCalledWith(0.05);
        vi.advanceTimersByTime(250 * 10);
        expect(sound.seek).toHaveBeenCalledTimes(11);
        expect(sound.seek).toHaveBeenLastCalledWith(0.05);
        expect(sound.cleanup).not.toHaveBeenCalled();
      });

      it('moves the repeat window when an Update carries loopStart', async () => {
        const first = mockSegmentSound('rain.ogg', 2, 3);

        await handler.handlePlay({
          finish: 5000,
          key: 'rain',
          loops: -1,
          name: 'rain.ogg',
          start: 2000,
          type: 'sound',
          volume: 50,
        } as GMCPMessageClientMediaPlay);

        const second = mockSegmentSound('rain.ogg', 1, 4);
        handler.handleUpdate({
          key: 'rain',
          loopStart: 1000,
          start: 3000,
          finish: 5000,
          loops: -1,
        } as GMCPMessageClientMediaUpdate);
        await vi.waitFor(() => expect(second.region.voice.play).toHaveBeenCalledOnce());

        expect(first.region.cleanup).toHaveBeenCalledOnce();
        expect(mockCreateSprite).toHaveBeenLastCalledWith(
          second.base.buffer,
          { segment: { start: 1, duration: 4 } },
          { panType: 'stereo' },
        );
        expect(second.region.voice.seek).toHaveBeenCalledWith(2);
        expect(second.region.loop).toHaveBeenCalledWith('infinite');
      });
    });
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

  it('stops only the sound whose name exactly matches', async () => {
    const exactSound = createMockSound('https://media.example/beep.mp3');
    const suffixSound = createMockSound('https://media.example/loudbeep.mp3');
    mockCreateSound.mockResolvedValueOnce(exactSound).mockResolvedValueOnce(suffixSound);

    await handler.handlePlay({
      key: 'beep',
      name: 'beep.mp3',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);
    await handler.handlePlay({
      key: 'loud-beep',
      name: 'loudbeep.mp3',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    handler.handleStop({ name: 'beep.mp3' } as GMCPMessageClientMediaStop);

    expect(exactSound.cleanup).toHaveBeenCalledOnce();
    expect(suffixSound.cleanup).not.toHaveBeenCalled();
    expect(handler.sounds.beep).toBeUndefined();
    expect(handler.sounds['loud-beep']).toBe(suffixSound);
  });

  it('updates only the sound whose name exactly matches', async () => {
    const exactSound = createMockSound('https://media.example/beep.mp3');
    const suffixSound = createMockSound('https://media.example/loudbeep.mp3');
    mockCreateSound.mockResolvedValueOnce(exactSound).mockResolvedValueOnce(suffixSound);

    await handler.handlePlay({
      key: 'beep',
      name: 'beep.mp3',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);
    await handler.handlePlay({
      key: 'loud-beep',
      name: 'loudbeep.mp3',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    handler.handleUpdate({
      name: 'beep.mp3',
      volume: 25,
    } as GMCPMessageClientMediaUpdate);

    expect(exactSound.volume).toBe(0.25);
    expect(suffixSound.volume).toBe(0.5);
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

    expect(sound.voice.play).toHaveBeenCalledTimes(1);

    handler.handleUpdate({
      key: 'radio-1',
      volume: 25,
      pan: 50,
      start: 2000,
      is3d: true,
      position: [4, 5, 6],
    } as GMCPMessageClientMediaUpdate);

    expect(sound.voice.play).toHaveBeenCalledTimes(1);
    expect(sound.volume).toBe(0.25);
    // The MOO sends `pan` on every packet. A point source is HRTF-panned by
    // position, so the stereo pan is ignored instead of throwing.
    expect(sound.stereoPan).toBe(0);
    // The move glides rather than snapping; run the tween to completion.
    expect(sound.position).toEqual([0, 0, 0]);
    client.stepMotion(600);
    expect(sound.position).toEqual([-4, 6, 5]);
    expect(sound.seek).toHaveBeenCalledWith(2);
    // The panner only positions; distance falloff is applied once, at the
    // sound's gain (see the spatial profile tests), so its rolloff is 0.
    expect(sound.threeDOptions).toMatchObject({
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 1,
      distanceModel: 'inverse',
      maxDistance: 10000,
      panningModel: 'HRTF',
      refDistance: 1,
      rolloffFactor: 0,
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
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: 'show-1',
      name: 'show.ogg',
      position: [0, 0, 10],
      type: 'sound',
      upmix: 'ambisonic',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    // This source is not HRTF-panned, so its position goes to the renderer
    // (converted once to browser axes), never to the sound's own panner.
    expect(renderer.setBearingFromPositions).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      [0, 10, 0],
    );
    expect(sound.position).toEqual([0, 0, 0]);
    expect(renderer.setDistanceGain).toHaveBeenCalled();
    // Free-field inverse attenuation: pressure amplitude is 1 / distance.
    expect(renderer.setDistanceGain.mock.calls[0][0]).toBeCloseTo(1 / 10);
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

      // The later Play owns the key; the superseded load is released before it
      // can play, so there is no orphaned overlapping audio.
      expect(handler.sounds.race).toBe(soundB);
      expect(soundB.voice.play).toHaveBeenCalledOnce();
      expect(soundA.voice.play).not.toHaveBeenCalled();
      expect(soundA.cleanup).toHaveBeenCalledOnce();
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

  describe('live MOO wire shapes (chunk 01)', () => {
    const tonePlay = {
      key: 's4894767',
      name: 'fixture/tone.m4a',
      url: 'https://mongoose.world/sounds/',
      type: 'sound',
      volume: 50,
      pan: 0,
      loops: 1,
      start: 0,
    };

    it('accepts Default {url} (contract case "default") and still a bare string', () => {
      handler.receiveRegisteredMessage('Default', { url: 'https://mongoose.world/sounds/' });
      expect(client.media.defaultUrl).toBe('https://mongoose.world/sounds/');
      handler.receiveRegisteredMessage('Default', 'https://legacy.example/');
      expect(client.media.defaultUrl).toBe('https://legacy.example/');
      handler.receiveRegisteredMessage('Default', { url: '' });
      expect(client.media.defaultUrl).toBe('');
    });

    it('rejects a Default whose url is not a string, leaving the base untouched', () => {
      handler.receiveRegisteredMessage('Default', { url: 'https://mongoose.world/sounds/' });
      expect(() => handler.receiveRegisteredMessage('Default', { url: {} })).toThrow(
        MediaPayloadError,
      );
      expect(client.media.defaultUrl).toBe('https://mongoose.world/sounds/');
    });

    it('rejects a malformed Play before creating any audio node', () => {
      expect(() =>
        handler.receiveRegisteredMessage('Play', { ...tonePlay, loops: 1.5 }),
      ).toThrow(MediaPayloadError);
      expect(() =>
        handler.receiveRegisteredMessage('Play', { ...tonePlay, chain: ['world', 'sphere'] }),
      ).toThrow(MediaPayloadError);
      expect(mockCreateSound).not.toHaveBeenCalled();
      expect(mockCreateSprite).not.toHaveBeenCalled();
    });

    it('catches and logs a failed Play or Load instead of leaving an unhandled rejection', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCreateSound.mockRejectedValue(new Error('decode failed'));

      handler.receiveRegisteredMessage('Play', tonePlay);
      handler.receiveRegisteredMessage('Load', { name: 'fixture/tone.m4a', url: tonePlay.url });

      await vi.waitFor(() => expect(consoleError).toHaveBeenCalledTimes(2));
      const logged = consoleError.mock.calls.map(([line]) => String(line)).sort();
      expect(logged).toEqual([
        "Client.Media.Load failed for 'fixture/tone.m4a': decode failed",
        "Client.Media.Play failed for 's4894767': decode failed",
      ]);
      consoleError.mockRestore();
    });

    it('keeps send 0 as a real aux send (contract case "chain")', async () => {
      const sound = createMockSound('https://mongoose.world/sounds/ambience/buzz1.m4a');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        key: 'fixture:machine',
        name: 'ambience/buzz1.m4a',
        type: 'sound',
        loops: 1,
        chain: 'workshop',
        send: 0,
      } as GMCPMessageClientMediaPlay);
      expect(sound.routeTo).toHaveBeenCalledWith('workshop', 0);
    });

    it('chain "" on Update clears a primary named route back to master', async () => {
      const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({ ...tonePlay, chain: 'workshop' } as GMCPMessageClientMediaPlay);
      expect(sound.routeTo).toHaveBeenCalledWith('workshop');

      handler.handleUpdate({ key: tonePlay.key, chain: '' } as GMCPMessageClientMediaUpdate);
      expect(sound.routeTo).toHaveBeenLastCalledWith(client.effectBuses.master);

      // Clearing is idempotent: a second clear does not reroute again.
      sound.routeTo.mockClear();
      handler.handleUpdate({ key: tonePlay.key, chain: '' } as GMCPMessageClientMediaUpdate);
      expect(sound.routeTo).not.toHaveBeenCalled();
    });

    it('chain "" on Update removes an aux send', async () => {
      const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        ...tonePlay,
        chain: 'workshop',
        send: 0.25,
      } as GMCPMessageClientMediaPlay);
      expect(sound.routeTo).toHaveBeenCalledWith('workshop', 0.25);

      handler.handleUpdate({ key: tonePlay.key, chain: '' } as GMCPMessageClientMediaUpdate);
      expect(sound.removeSend).toHaveBeenCalledTimes(1);
      expect(sound.removeSend).toHaveBeenCalledWith('workshop');
      // The send is removed, not re-gained to 0, so no silent send is left behind.
      expect(sound.routeTo).not.toHaveBeenCalledWith('workshop', 0);
    });

    it('effects [] on Update tears down the inline chain and restores the named route', async () => {
      const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        ...tonePlay,
        effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
      } as GMCPMessageClientMediaPlay);
      const inline = client.effectBuses.anon[0];
      expect(sound.routeTo).toHaveBeenCalledWith(inline);

      handler.handleUpdate({
        key: tonePlay.key,
        effects: [],
        chain: 'workshop',
      } as GMCPMessageClientMediaUpdate);
      await vi.waitFor(() => expect(inline.destroy).toHaveBeenCalled());
      const routes = sound.routeTo.mock.calls.map(([target]) => target);
      expect(routes.slice(-2)).toEqual([client.effectBuses.master, 'workshop']);
      expect(sound.voice.play).toHaveBeenCalledOnce();
    });

    describe('inline effects with a named chain aux send', () => {
      const muffle = [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }];

      async function defineWorkshop() {
        await client.media.setChain({
          id: 'workshop',
          effects: [{ type: 'reverb' }],
        });
        return client.effectBuses.created.workshop;
      }

      it('Play: inline chain stays on master and feeds the chain at the send level', async () => {
        const workshop = await defineWorkshop();
        const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
        mockCreateSound.mockResolvedValue(sound);

        await handler.handlePlay({
          ...tonePlay,
          chain: 'workshop',
          send: 0.25,
          effects: muffle,
        } as GMCPMessageClientMediaPlay);

        const inline = client.effectBuses.anon[0];
        expect(sound.routeTo).toHaveBeenCalledWith(inline);
        // Dry path: the inline bus keeps its master output.
        expect(inline.disconnect).not.toHaveBeenCalledWith(client.effectBuses.master);
        // Aux path: a 25% feed into the named chain, never a full-level series route.
        expect(inline.connect).toHaveBeenCalledWith(workshop, 0.25);
        expect(inline.connect).not.toHaveBeenCalledWith(workshop);
      });

      it('Play without send still runs the inline chain in series into the named chain', async () => {
        const workshop = await defineWorkshop();
        const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
        mockCreateSound.mockResolvedValue(sound);

        await handler.handlePlay({
          ...tonePlay,
          chain: 'workshop',
          effects: muffle,
        } as GMCPMessageClientMediaPlay);

        const inline = client.effectBuses.anon[0];
        expect(inline.disconnect).toHaveBeenCalledWith(client.effectBuses.master);
        expect(inline.connect).toHaveBeenCalledWith(workshop);
      });

      it('Update adding effects to a 25% aux sound keeps it an aux feed, not a full-level route', async () => {
        const workshop = await defineWorkshop();
        const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
        mockCreateSound.mockResolvedValue(sound);
        await handler.handlePlay({
          ...tonePlay,
          chain: 'workshop',
          send: 0.25,
        } as GMCPMessageClientMediaPlay);
        expect(sound.routeTo).toHaveBeenCalledWith('workshop', 0.25);

        // A door's no-argument Update re-sends effects with the door lowpass appended.
        handler.handleUpdate({
          key: tonePlay.key,
          effects: [
            ...muffle,
            { id: 'door-lowpass:#62:north', type: 'lowpass', params: { frequency: 6000 } },
          ],
        } as GMCPMessageClientMediaUpdate);
        await vi.waitFor(() => expect(client.effectBuses.anon).toHaveLength(1));
        const inline = client.effectBuses.anon[0];
        await vi.waitFor(() => expect(sound.routeTo).toHaveBeenCalledWith(inline));

        expect(inline.disconnect).not.toHaveBeenCalledWith(client.effectBuses.master);
        expect(inline.connect).toHaveBeenCalledWith(workshop, 0.25);
        expect(inline.connect).not.toHaveBeenCalledWith(workshop);

        // A later send-only Update re-gains the aux feed on the inline bus.
        handler.handleUpdate({ key: tonePlay.key, send: 0.5 } as GMCPMessageClientMediaUpdate);
        await vi.waitFor(() => expect(inline.connect).toHaveBeenLastCalledWith(workshop, 0.5));
        expect(inline.connect).not.toHaveBeenCalledWith(workshop);
      });
    });

    it('an Update {key, volume} neither seeks, restarts nor reroutes', async () => {
      const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({ ...tonePlay, chain: 'workshop' } as GMCPMessageClientMediaPlay);
      sound.routeTo.mockClear();

      handler.receiveRegisteredMessage('Update', { key: tonePlay.key, volume: 25 });

      expect(sound.volume).toBe(0.25);
      expect(sound.seek).not.toHaveBeenCalled();
      expect(sound.voice.seek).not.toHaveBeenCalled();
      expect(sound.voice.play).toHaveBeenCalledOnce();
      expect(sound.routeTo).not.toHaveBeenCalled();
      expect(mockCreateSound).toHaveBeenCalledOnce();
    });

    it.each([
      ['open', 12.5, 6000],
      ['closed', 2, 800],
    ])('plays a door-projected copy (%s door: volume %s, lowpass %s Hz)', async (_door, volume, hz) => {
      const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
      mockCreateSound.mockResolvedValue(sound);
      handler.receiveRegisteredMessage('Play', {
        ...tonePlay,
        volume,
        is3d: true,
        position: [2, 2, 1],
        effects: [
          { id: 'door-lowpass:#62:north', type: 'lowpass', params: { frequency: hz } },
        ],
      });
      await vi.waitFor(() => expect(sound.voice.play).toHaveBeenCalledOnce());

      expect(client.media.cacophony.createBiquadFilter).toHaveBeenCalledWith({
        type: 'lowpass',
        frequency: hz,
      });
      expect(sound.routeTo).toHaveBeenCalledWith(client.effectBuses.anon[0]);
      // Fractional percent volume, then the default inverse curve at the doorway.
      const distance = Math.hypot(2, 2, 1);
      expect(sound.volume).toBeCloseTo((volume / 100) / distance, 9);
    });

    it('waits for a pending Chain definition before starting the voice (no dry burst)', async () => {
      let release: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const cacophony = client.media.cacophony as unknown as { createBus: ReturnType<typeof vi.fn> };
      cacophony.createBus.mockImplementationOnce((name?: string) => {
        const bus = makeEffectBus(name ?? null);
        bus.addFilter = vi.fn(async (arg: unknown) => {
          await gate;
          return arg;
        });
        client.effectBuses.created[name ?? ''] = bus;
        return bus;
      });
      handler.receiveRegisteredMessage('Chain', {
        id: 'workshop',
        effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
        gain: 1,
        fadein: 0,
      });

      const sound = createMockSound('https://mongoose.world/sounds/fixture/tone.m4a');
      mockCreateSound.mockResolvedValue(sound);
      const playing = handler.handlePlay({
        ...tonePlay,
        chain: 'workshop',
      } as GMCPMessageClientMediaPlay);
      await vi.waitFor(() => expect(client.effectBuses.created.workshop?.addFilter).toHaveBeenCalled());
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(sound.voice.play).not.toHaveBeenCalled();

      release();
      await playing;
      expect(sound.routeTo).toHaveBeenCalledWith('workshop');
      expect(sound.routeTo.mock.invocationCallOrder[0]).toBeLessThan(
        sound.voice.play.mock.invocationCallOrder[0],
      );
    });

    it('Automate applies both params and an explicit bypass: false', async () => {
      await client.media.setChain({
        id: 'workshop',
        effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
      });
      const bus = client.effectBuses.created.workshop;
      handler.receiveRegisteredMessage('Automate', {
        chain: 'workshop',
        target: 'muffle',
        params: { frequency: 1200 },
        ramp: 500,
        curve: 'exponential',
        bypass: false,
      });
      expect(bus.setFilterBypassed).toHaveBeenCalledWith(expect.anything(), false);
      expect(bus.rampFilterParam).toHaveBeenCalledWith(expect.anything(), 'frequency', 1200, {
        duration: 500,
        type: 'exponential',
      });
    });
  });

  describe('per-key generations (chunk 02)', () => {
    function deferred<T>() {
      let resolve: (value: T) => void = () => undefined;
      const promise = new Promise<T>((done) => {
        resolve = done;
      });
      return { promise, resolve };
    }

    it('a later Play for the key wins even when the earlier load resolves last', async () => {
      const a = deferred<MockSound>();
      const b = deferred<MockSound>();
      const soundA = createMockSound('https://media.example/a.ogg');
      const soundB = createMockSound('https://media.example/b.ogg');
      mockCreateSound.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);

      const playA = handler.handlePlay({ key: 'k', name: 'a.ogg', type: 'sound' } as GMCPMessageClientMediaPlay);
      const playB = handler.handlePlay({ key: 'k', name: 'b.ogg', type: 'sound' } as GMCPMessageClientMediaPlay);
      b.resolve(soundB);
      await playB;
      a.resolve(soundA);
      await playA;

      expect(handler.sounds.k).toBe(soundB);
      expect(soundB.voice.play).toHaveBeenCalledOnce();
      expect(soundA.voice.play).not.toHaveBeenCalled();
      expect(soundA.cleanup).toHaveBeenCalledOnce();
      expect(soundB.cleanup).not.toHaveBeenCalled();
    });

    it.each([
      ['key', { key: 'k' }],
      ['tag', { tag: 'tag-#1' }],
      ['name', { name: 'a.ogg' }],
      ['everything', {}],
    ])('Stop by %s cancels a pending load', async (_label, stop) => {
      const pending = deferred<MockSound>();
      const sound = createMockSound('https://media.example/a.ogg');
      mockCreateSound.mockReturnValueOnce(pending.promise);

      const playing = handler.handlePlay({
        key: 'k',
        name: 'a.ogg',
        tag: 'tag-#1',
        type: 'sound',
      } as GMCPMessageClientMediaPlay);
      handler.handleStop(stop as GMCPMessageClientMediaStop);
      pending.resolve(sound);
      await playing;

      expect(sound.voice.play).not.toHaveBeenCalled();
      expect(sound.cleanup).toHaveBeenCalledOnce();
      expect(handler.sounds).toEqual({});
    });

    it('reset invalidates a pending load', async () => {
      const pending = deferred<MockSound>();
      const sound = createMockSound('https://media.example/a.ogg');
      mockCreateSound.mockReturnValueOnce(pending.promise);

      const playing = handler.handlePlay({ key: 'k', name: 'a.ogg', type: 'sound' } as GMCPMessageClientMediaPlay);
      handler.reset();
      pending.resolve(sound);
      await playing;

      expect(sound.voice.play).not.toHaveBeenCalled();
      expect(handler.sounds).toEqual({});
    });

    it('an old segment timer after key reuse cannot kill the replacement', async () => {
      vi.useFakeTimers();
      const first = createMockSound('https://media.example/theme.ogg');
      const second = createMockSound('https://media.example/other.ogg');
      mockCreateSound.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

      await handler.handlePlay({
        key: 'theme',
        name: 'theme.ogg',
        type: 'music',
        start: 100,
        finish: 300,
      } as GMCPMessageClientMediaPlay);
      await handler.handlePlay({ key: 'theme', name: 'other.ogg', type: 'music' } as GMCPMessageClientMediaPlay);

      vi.advanceTimersByTime(10_000);
      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(second.cleanup).not.toHaveBeenCalled();
      expect(handler.sounds.theme).toBe(second);
    });
  });

  describe('clip offset, gain, pitch and spatial profile (chunks 04/05)', () => {
    it('plays catalog sound 56 as a sprite over its region (contract case "catalogOffset")', async () => {
      const base = createMockSound('https://mongoose.world/sounds/ambience/arcade.m4a');
      base.buffer = { duration: 60 };
      const region = createMockSound('');
      region.region = { start: 40.32731292517007, duration: 0.23289115646258507 };
      mockCreateSound.mockResolvedValue(base);
      mockCreateSprite.mockResolvedValue({ get: () => region });

      await handler.handlePlay({
        key: 's4894736',
        name: 'ambience/arcade.m4a',
        type: 'sound',
        loops: 1,
        start: 40327.31292517007,
        finish: 40560.204081632655,
      } as GMCPMessageClientMediaPlay);

      const [, spec] = mockCreateSprite.mock.calls[0];
      expect(spec.segment.start).toBeCloseTo(40.32731292517007, 9);
      expect(spec.segment.duration).toBeCloseTo(0.23289115646258507, 9);
      expect(region.voice.play).toHaveBeenCalledOnce();
      expect(region.voice.seek).not.toHaveBeenCalled();
    });

    it('starts a region-less voice at its offset before it plays, not play-then-seek', async () => {
      const sound = createMockSound('https://media.example/theme.ogg');
      mockCreateSound.mockResolvedValue(sound);

      await handler.handlePlay({
        key: 'theme',
        name: 'theme.ogg',
        type: 'music',
        start: 240000,
      } as GMCPMessageClientMediaPlay);

      expect(sound.voice.seek).toHaveBeenCalledWith(240);
      expect(sound.voice.seek.mock.invocationCallOrder[0]).toBeLessThan(
        sound.voice.play.mock.invocationCallOrder[0],
      );
      expect(sound.seek).not.toHaveBeenCalled();
    });

    it('applies gainDb as a gain multiplier and pitchSemitones as rate before the voice starts', async () => {
      const sound = createMockSound('https://media.example/bell.ogg');
      mockCreateSound.mockResolvedValue(sound);
      let rateAtStart = 0;
      sound.voice.play.mockImplementationOnce(() => {
        rateAtStart = sound.playbackRate;
        sound.isPlaying = true;
        return [sound.voice];
      });

      await handler.handlePlay({
        key: 'bell',
        name: 'bell.ogg',
        type: 'sound',
        volume: 50,
        gainDb: 6,
        pitchSemitones: 12,
      } as GMCPMessageClientMediaPlay);

      expect(rateAtStart).toBe(2);
      expect(sound.volume).toBeCloseTo(0.5 * 1.9952623149688795, 9);

      handler.handleUpdate({ key: 'bell', pitchSemitones: -12 } as GMCPMessageClientMediaUpdate);
      expect(sound.playbackRate).toBe(0.5);
      expect(sound.voice.play).toHaveBeenCalledOnce();
    });

    it('applies a spatial profile once, at the sound gain, with the panner rolloff at 0', async () => {
      const sound = createMockSound('https://media.example/fountain.ogg');
      mockCreateSound.mockResolvedValue(sound);

      await handler.handlePlay({
        key: 'fountain',
        name: 'fountain.ogg',
        type: 'sound',
        volume: 50,
        is3d: true,
        position: [0, 10, 0],
        spatial: {
          model: 'inverse',
          refDistance: 1,
          maxDistance: 50,
          rolloff: 1,
          coneInnerAngle: 360,
          coneOuterAngle: 360,
          coneOuterGain: 1,
        },
      } as GMCPMessageClientMediaPlay);

      expect(sound.threeDOptions).toMatchObject({
        refDistance: 1,
        maxDistance: 50,
        rolloffFactor: 0,
      });
      expect(sound.volume).toBeCloseTo(0.5 * 0.1, 9);

      // Listener moves to 2 m away; max distance is a clamp, not a cutoff.
      client.media.setListenerPosition([0, 0, 8]);
      expect(sound.volume).toBeCloseTo(0.5 * 0.5, 9);
      client.media.setListenerPosition([0, 0, -90]);
      expect(sound.volume).toBeCloseTo(0.5 * 0.02, 9);
      expect(sound.voice.play).toHaveBeenCalledOnce();
    });

    it('points a directional cone along the converted orientation', async () => {
      const sound = createMockSound('https://media.example/speaker.ogg');
      mockCreateSound.mockResolvedValue(sound);

      await handler.handlePlay({
        key: 'speaker',
        name: 'speaker.ogg',
        type: 'sound',
        is3d: true,
        position: [0, 0, 0],
        spatial: {
          model: 'inverse',
          refDistance: 1,
          maxDistance: 50,
          rolloff: 1,
          coneInnerAngle: 90,
          coneOuterAngle: 180,
          coneOuterGain: 0.25,
        },
        orientation: [1, 0, 0],
      } as GMCPMessageClientMediaPlay);

      // Mongoose east (+x) becomes Web Audio [-1, 0, 0].
      expect(sound.threeDOptions).toMatchObject({
        coneInnerAngle: 90,
        coneOuterAngle: 180,
        coneOuterGain: 0.25,
        orientationX: -1,
        orientationY: 0,
        orientationZ: 0,
      });
    });

    it('leaves distance to the FOA renderer for ambisonic sounds (no double falloff)', async () => {
      const sound = createMockSound('https://media.example/show.ogg');
      mockCreateSound.mockResolvedValue(sound);

      await handler.handlePlay({
        key: 'show',
        name: 'show.ogg',
        type: 'sound',
        upmix: 'ambisonic',
        volume: 50,
        is3d: true,
        position: [0, 10, 0],
        spatial: {
          model: 'inverse',
          refDistance: 1,
          maxDistance: 50,
          rolloff: 1,
          coneInnerAngle: 360,
          coneOuterAngle: 360,
          coneOuterGain: 1,
        },
      } as GMCPMessageClientMediaPlay);

      const renderer = await mockPositionalFoaRendererCreate.mock.results[0].value;
      expect(renderer.setDistanceGain).toHaveBeenLastCalledWith(0.1);
      expect(sound.volume).toBe(0.5);
      expect(sound.threeDOptions).toMatchObject({ rolloffFactor: 0 });
    });
  });

  describe('reverb send independent of distance', () => {
    // Mongoose north 4 m: distance 4 from a listener at the origin, so the
    // default inverse curve gives a distance gain of 0.25.
    const fire = {
      key: 'fire',
      name: 'fire.ogg',
      type: 'sound',
      volume: 50,
      is3d: true,
      position: [0, 4, 0],
      chain: 'room',
      send: 0.3,
    };

    async function playFire(extra: Record<string, unknown> = {}) {
      const sound = createMockSound('https://media.example/fire.ogg');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({ ...fire, ...extra } as GMCPMessageClientMediaPlay);
      return sound;
    }

    function lastSend(sound: MockSound): unknown[] {
      return sound.routeTo.mock.calls[sound.routeTo.mock.calls.length - 1];
    }

    it('sends a positional sound at send / distance gain, leaving the direct level alone', async () => {
      const sound = await playFire();

      expect(sound.routeTo).toHaveBeenCalledOnce();
      expect(lastSend(sound)).toEqual(['room', expect.closeTo(1.2, 9)]);
      // volume x distance gain x effective send = volume x send
      expect(sound.volume).toBeCloseTo(0.5 * 0.25, 9);
      expect(sound.volume * (lastSend(sound)[1] as number)).toBeCloseTo(0.5 * 0.3, 9);
    });

    it('re-gains the send in place when the listener moves', async () => {
      const sound = await playFire();

      // 2 m from the source: distance gain 0.5.
      client.media.setListenerPosition([0, 0, 2]);
      expect(lastSend(sound)).toEqual(['room', expect.closeTo(0.6, 9)]);
      expect(sound.volume).toBeCloseTo(0.5 * 0.5, 9);

      // On top of it: no attenuation, so the send is the wire send.
      client.media.setListenerPosition([0, 0, 4]);
      expect(lastSend(sound)).toEqual(['room', expect.closeTo(0.3, 9)]);

      expect(sound.removeSend).not.toHaveBeenCalled();
      expect(sound.voice.play).toHaveBeenCalledOnce();
    });

    it('does not call the engine again when the listener moves without changing the distance', async () => {
      const sound = await playFire();
      sound.routeTo.mockClear();

      // Still 4 m away, on the other side.
      client.media.setListenerPosition([0, 0, 8]);
      expect(sound.routeTo).not.toHaveBeenCalled();
    });

    it('follows the source as it glides', async () => {
      const sound = await playFire();

      handler.handleUpdate({ key: 'fire', position: [0, 2, 0] } as GMCPMessageClientMediaUpdate);
      client.stepMotion(10_000);

      expect(sound.volume).toBeCloseTo(0.5 * 0.5, 9);
      expect(lastSend(sound)).toEqual(['room', expect.closeTo(0.6, 9)]);
    });

    it('caps the boost for a very distant sound', async () => {
      const sound = await playFire();

      client.media.setListenerPosition([0, 0, 1004]);
      expect(sound.volume).toBeCloseTo(0.5 / 1000, 9);
      expect(lastSend(sound)).toEqual(['room', expect.closeTo(0.3 * MAX_SEND_DISTANCE_BOOST, 9)]);
    });

    it('stays finite where a linear profile reaches silence', async () => {
      const sound = await playFire({
        spatial: {
          model: 'linear',
          refDistance: 1,
          maxDistance: 4,
          rolloff: 1,
          coneInnerAngle: 360,
          coneOuterAngle: 360,
          coneOuterGain: 1,
        },
      });

      expect(sound.volume).toBe(0);
      expect(lastSend(sound)).toEqual(['room', expect.closeTo(0.3 * MAX_SEND_DISTANCE_BOOST, 9)]);
    });

    it('recomputes when an Update changes the send, without dropping the send', async () => {
      const sound = await playFire();

      handler.handleUpdate({ key: 'fire', send: 0.5 } as GMCPMessageClientMediaUpdate);

      expect(lastSend(sound)).toEqual(['room', expect.closeTo(2, 9)]);
      expect(sound.removeSend).not.toHaveBeenCalled();
    });

    it('recomputes when an Update changes the spatial profile', async () => {
      const sound = await playFire();

      handler.handleUpdate({
        key: 'fire',
        spatial: {
          model: 'inverse',
          refDistance: 2,
          maxDistance: 50,
          rolloff: 1,
          coneInnerAngle: 360,
          coneOuterAngle: 360,
          coneOuterGain: 1,
        },
      } as GMCPMessageClientMediaUpdate);

      // 2 / (2 + (4 - 2)) = 0.5
      expect(sound.volume).toBeCloseTo(0.5 * 0.5, 9);
      expect(lastSend(sound)).toEqual(['room', expect.closeTo(0.6, 9)]);
    });

    it('carries the compensated send to a new chain', async () => {
      const sound = await playFire();

      handler.handleUpdate({ key: 'fire', chain: 'hall' } as GMCPMessageClientMediaUpdate);

      expect(sound.removeSend).toHaveBeenCalledWith('room');
      expect(lastSend(sound)).toEqual(['hall', expect.closeTo(1.2, 9)]);
    });

    it('leaves a non-positional sound at its wire send, wherever the listener goes', async () => {
      const sound = await playFire({ is3d: false, position: undefined });

      expect(sound.routeTo).toHaveBeenCalledOnce();
      expect(sound.routeTo).toHaveBeenCalledWith('room', 0.3);

      client.media.setListenerPosition([0, 0, 50]);
      handler.handleUpdate({ key: 'fire', volume: 25 } as GMCPMessageClientMediaUpdate);
      expect(sound.routeTo).toHaveBeenCalledOnce();
      expect(sound.volume).toBe(0.25);
    });

    it('makes no send call for a sound with no chain', async () => {
      const sound = await playFire({ chain: undefined });

      client.media.setListenerPosition([0, 0, 2]);
      handler.handleUpdate({ key: 'fire', position: [0, 9, 0] } as GMCPMessageClientMediaUpdate);
      client.stepMotion(10_000);

      expect(sound.routeTo).not.toHaveBeenCalled();
      expect(sound.removeSend).not.toHaveBeenCalled();
    });

    it('leaves a primary (send-less) route alone', async () => {
      const sound = await playFire({ send: undefined });

      client.media.setListenerPosition([0, 0, 2]);

      expect(sound.routeTo).toHaveBeenCalledOnce();
      expect(sound.routeTo).toHaveBeenCalledWith('room');
    });

    it('does not retry a send the engine refused each time the listener moves', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const sound = createMockSound('https://media.example/fire.ogg');
      sound.routeTo.mockImplementation(() => {
        throw new Error("No bus registered with name 'room'");
      });
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay(fire as GMCPMessageClientMediaPlay);
      expect(sound.routeTo).toHaveBeenCalledOnce();

      client.media.setListenerPosition([0, 0, 2]);
      expect(sound.routeTo).toHaveBeenCalledOnce();
      consoleWarn.mockRestore();
    });

    it('compensates the aux feed of an inline effect chain the same way', async () => {
      await client.media.setChain({ id: 'room', effects: [{ type: 'reverb' }] });
      const room = client.effectBuses.created.room;
      const sound = await playFire({
        effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
      });
      const inline = client.effectBuses.anon[0];

      expect(sound.routeTo).toHaveBeenCalledWith(inline);
      expect(inline.connect).toHaveBeenLastCalledWith(room, expect.closeTo(1.2, 9));

      client.media.setListenerPosition([0, 0, 2]);
      expect(inline.connect).toHaveBeenLastCalledWith(room, expect.closeTo(0.6, 9));
      // The dry path stays on master throughout.
      expect(inline.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('per-voice occlusion', () => {
    const tone = {
      key: 's4894767',
      name: 'fixture/tone.m4a',
      url: 'https://mongoose.world/sounds/',
      type: 'sound',
      volume: 50,
      pan: 0,
      loops: 1,
    };
    const toneUrl = 'https://mongoose.world/sounds/fixture/tone.m4a';
    const lowpass = (id: string, frequency: number) => ({
      id,
      type: 'lowpass',
      params: { frequency },
    });

    async function playTone(extra: Record<string, unknown> = {}) {
      const sound = createMockSound(toneUrl);
      mockCreateSound.mockResolvedValue(sound);
      handler.receiveRegisteredMessage('Play', { ...tone, ...extra });
      await vi.waitFor(() => expect(sound.voice.play).toHaveBeenCalledOnce());
      return sound;
    }

    function occlusionCalls(sound: MockSound): unknown[][] {
      return sound.voice.setOcclusion?.mock.calls ?? [];
    }

    function expectOccludedBeforeStart(sound: MockSound): void {
      expect(sound.voice.setOcclusion?.mock.invocationCallOrder[0]).toBeLessThan(
        sound.voice.play.mock.invocationCallOrder[0],
      );
    }

    describe.each([
      ['stereo', {}],
      ['HRTF', { is3d: true, position: [2, 2, 1] }],
    ])('with %s panning', (panType, spatial) => {
      it('occludes a new voice from its first sample', async () => {
        const sound = await playTone({ ...spatial, occlusion: 0.8 });

        expect(sound.panType).toBe(panType);
        expect(occlusionCalls(sound)).toEqual([[0.8, 0]]);
        expect(sound.voice.occlusion).toBe(0.8);
        expectOccludedBeforeStart(sound);
      });

      it('glides to the amount an Update carries', async () => {
        const sound = await playTone({ ...spatial, occlusion: 0.8 });

        handler.receiveRegisteredMessage('Update', { key: tone.key, occlusion: 0.2 });

        expect(occlusionCalls(sound)).toEqual([
          [0.8, 0],
          [0.2, 150],
        ]);
        expect(sound.voice.play).toHaveBeenCalledOnce();
      });

      it('leaves the amount alone on an Update without the field', async () => {
        const sound = await playTone({ ...spatial, occlusion: 0.8 });

        handler.receiveRegisteredMessage('Update', { key: tone.key, volume: 25 });

        expect(occlusionCalls(sound)).toEqual([[0.8, 0]]);
        expect(sound.voice.occlusion).toBe(0.8);
      });

      it('glides, without restarting, on a Play that keeps the voice', async () => {
        const sound = await playTone({ ...spatial, occlusion: 0.8 });

        handler.receiveRegisteredMessage('Play', { ...tone, ...spatial, occlusion: 0.3 });
        await vi.waitFor(() => expect(occlusionCalls(sound)).toHaveLength(2));
        // A further Play naming the amount the voice already has makes no engine call.
        await client.media.play({
          ...tone,
          ...spatial,
          occlusion: 0.3,
        } as GMCPMessageClientMediaPlay);

        expect(occlusionCalls(sound)).toEqual([
          [0.8, 0],
          [0.3, 150],
        ]);
        expect(sound.voice.occlusion).toBe(0.3);
        expect(sound.voice.play).toHaveBeenCalledOnce();
        expect(sound.voice.seek).not.toHaveBeenCalled();
        expect(mockCreateSound).toHaveBeenCalledOnce();
        expect(handler.sounds[tone.key]).toBe(sound);
      });

      it('glides a kept voice to clear on a Play without the field (a Play is full state)', async () => {
        const sound = await playTone({ ...spatial, occlusion: 0.8 });

        // The listener walked through the door: the same key, re-Played direct.
        await client.media.play({ ...tone, ...spatial } as GMCPMessageClientMediaPlay);

        expect(occlusionCalls(sound)).toEqual([
          [0.8, 0],
          [0, 150],
        ]);
        expect(sound.voice.occlusion).toBe(0);
        expect(sound.voice.play).toHaveBeenCalledOnce();
        expect(sound.voice.seek).not.toHaveBeenCalled();
        expect(mockCreateSound).toHaveBeenCalledOnce();
      });

      it('makes no engine call when a clear kept voice is re-Played without the field', async () => {
        const sound = await playTone(spatial);

        await client.media.play({ ...tone, ...spatial } as GMCPMessageClientMediaPlay);

        expect(occlusionCalls(sound)).toEqual([]);
        expect(sound.voice.play).toHaveBeenCalledOnce();
        expect(mockCreateSound).toHaveBeenCalledOnce();
      });
    });

    it('starts clear when a Play without the field supersedes an occluded Play still waiting to start', async () => {
      let release: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const cacophony = client.media.cacophony as unknown as { createBus: ReturnType<typeof vi.fn> };
      cacophony.createBus.mockImplementationOnce((name?: string) => {
        const bus = makeEffectBus(name ?? null);
        bus.addFilter = vi.fn(async (arg: unknown) => {
          await gate;
          return arg;
        });
        client.effectBuses.created[name ?? ''] = bus;
        return bus;
      });
      const chain = client.media.setChain({ id: 'workshop', effects: [lowpass('muffle', 400)] });
      const sound = createMockSound(toneUrl);
      mockCreateSound.mockResolvedValue(sound);

      // The first Play creates the sound, then waits for its chain.
      const first = client.media.play({
        ...tone,
        chain: 'workshop',
        occlusion: 0.8,
      } as GMCPMessageClientMediaPlay);
      await vi.waitFor(() => expect(handler.sounds[tone.key]).toBe(sound));
      await client.media.play({ ...tone } as GMCPMessageClientMediaPlay);
      release();
      await Promise.all([first, chain]);

      expect(mockCreateSound).toHaveBeenCalledOnce();
      expect(sound.voice.play).toHaveBeenCalledOnce();
      expect(occlusionCalls(sound)).toEqual([]);
    });

    it('starts a new voice clear when the Play carries no amount', async () => {
      const sound = await playTone();

      expect(occlusionCalls(sound)).toEqual([]);
      expect(sound.voice.occlusion).toBe(0);
    });

    it('occludes a clear voice when an Update first names an amount, and clears it at 0', async () => {
      const sound = await playTone();

      handler.receiveRegisteredMessage('Update', { key: tone.key, occlusion: 1 });
      handler.receiveRegisteredMessage('Update', { key: tone.key, occlusion: 0 });

      expect(occlusionCalls(sound)).toEqual([
        [1, 150],
        [0, 150],
      ]);
    });

    it('starts a replacement voice for the same key clear unless its Play says otherwise', async () => {
      const first = await playTone({ occlusion: 0.8 });
      const second = createMockSound('https://mongoose.world/sounds/fixture/other.m4a');
      mockCreateSound.mockResolvedValue(second);

      handler.receiveRegisteredMessage('Play', { ...tone, name: 'fixture/other.m4a' });
      await vi.waitFor(() => expect(second.voice.play).toHaveBeenCalledOnce());

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(occlusionCalls(second)).toEqual([]);
    });

    it('keeps its amount through named-chain routing and a replaced chain', async () => {
      await client.media.setChain({ id: 'workshop', effects: [lowpass('muffle', 400)] });
      const sound = await playTone({ chain: 'workshop', occlusion: 0.6 });
      expect(sound.routeTo).toHaveBeenCalledWith('workshop');
      expectOccludedBeforeStart(sound);

      // The chain is redefined under the voice, then the voice is re-pointed
      // and given inline effects: none of it carries or implies an amount.
      await client.media.setChain({ id: 'workshop', effects: [lowpass('muffle', 2000)] });
      await client.media.setChain({ id: 'cave', effects: [lowpass('dark', 900)] });
      handler.receiveRegisteredMessage('Update', { key: tone.key, chain: 'cave', send: 0.3 });
      expect(sound.routeTo).toHaveBeenLastCalledWith('cave', 0.3);
      handler.receiveRegisteredMessage('Update', {
        key: tone.key,
        effects: [lowpass('door', 800)],
      });
      await vi.waitFor(() =>
        expect(sound.routeTo).toHaveBeenLastCalledWith(client.effectBuses.anon[0]),
      );
      client.media.removeChain('cave');

      expect(occlusionCalls(sound)).toEqual([[0.6, 0]]);
      expect(sound.voice.occlusion).toBe(0.6);

      handler.receiveRegisteredMessage('Update', { key: tone.key, occlusion: 0.1 });
      expect(occlusionCalls(sound)).toEqual([
        [0.6, 0],
        [0.1, 150],
      ]);
    });

    it('carries the current amount onto the voice a moved segment rebuilds', async () => {
      const segmentSound = (duration: number) => {
        const base = createMockSound('rain.ogg');
        base.buffer = { duration: 10 };
        const region = createMockSound('');
        region.buffer = base.buffer;
        region.region = { start: 2, duration };
        mockCreateSound.mockResolvedValue(base);
        mockCreateSprite.mockResolvedValue({ get: () => region });
        return region;
      };
      const first = segmentSound(3);
      await handler.handlePlay({
        finish: 5000,
        key: 'rain',
        loops: -1,
        name: 'rain.ogg',
        start: 2000,
        type: 'sound',
        volume: 50,
        occlusion: 0.8,
      } as GMCPMessageClientMediaPlay);
      // The door moved after the Play: 0.4 is the amount in effect now.
      handler.handleUpdate({ key: 'rain', occlusion: 0.4 } as GMCPMessageClientMediaUpdate);
      expect(occlusionCalls(first)).toEqual([
        [0.8, 0],
        [0.4, 150],
      ]);

      const second = segmentSound(4);
      handler.handleUpdate({ key: 'rain', finish: 6000 } as GMCPMessageClientMediaUpdate);
      await vi.waitFor(() => expect(second.voice.play).toHaveBeenCalledOnce());

      expect(handler.sounds.rain).toBe(second);
      expect(occlusionCalls(second)).toEqual([[0.4, 0]]);
      expectOccludedBeforeStart(second);
    });

    it('keeps its amount across timer-driven segment repeats', async () => {
      vi.useFakeTimers();
      const sound = createMockSound('https://mongoose.world:9080/?url=theme');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({
        finish: 300,
        key: 'theme',
        loops: -1,
        name: 'theme.ogg',
        type: 'music',
        volume: 50,
        occlusion: 0.5,
      } as GMCPMessageClientMediaPlay);

      vi.advanceTimersByTime(1000);

      expect(sound.seek).toHaveBeenCalled();
      expect(sound.preplay).toHaveBeenCalledOnce();
      expect(occlusionCalls(sound)).toEqual([[0.5, 0]]);
      expect(sound.voice.occlusion).toBe(0.5);
    });

    it.each([
      ['a positional FOA', 2, mockPositionalFoaRendererCreate],
      ['a 4-channel ambisonic', 4, mockAmbisonicRendererCreate],
    ])('occludes %s voice before it starts and glides it afterwards', async (_route, channels, create) => {
      const sound = await playTone({
        upmix: 'ambisonic',
        channels,
        is3d: true,
        position: [2, 2, 1],
        occlusion: 0.7,
      });
      await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());

      expect(occlusionCalls(sound)).toEqual([[0.7, 0]]);
      expectOccludedBeforeStart(sound);

      handler.receiveRegisteredMessage('Update', { key: tone.key, occlusion: 0.2 });
      expect(occlusionCalls(sound)).toEqual([
        [0.7, 0],
        [0.2, 150],
      ]);
    });

    it.each([
      ['Play', -0.1],
      ['Play', 1.5],
      ['Play', 'x'],
      ['Update', -0.1],
      ['Update', 1.5],
      ['Update', 'x'],
    ])('rejects %s occlusion %j and leaves the amount unchanged', async (wireName, occlusion) => {
      const sound = await playTone({ occlusion: 0.8 });

      expect(() => handler.receiveRegisteredMessage(wireName, { ...tone, occlusion })).toThrow(
        MediaPayloadError,
      );

      expect(occlusionCalls(sound)).toEqual([[0.8, 0]]);
      expect(sound.voice.occlusion).toBe(0.8);
      expect(mockCreateSound).toHaveBeenCalledOnce();
      expect(client.media.diagnostics.entries().at(-1)?.error).toMatchObject({
        code: 'INVALID_PAYLOAD',
      });
    });

    it('reports an engine without the occlusion stage instead of faking it', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const sound = createMockSound(toneUrl);
      sound.voice.setOcclusion = undefined;
      mockCreateSound.mockResolvedValue(sound);

      handler.receiveRegisteredMessage('Play', { ...tone, occlusion: 0.8 });
      await vi.waitFor(() => expect(sound.voice.play).toHaveBeenCalledOnce());
      handler.receiveRegisteredMessage('Update', { key: tone.key, occlusion: 0.2 });

      const unavailable = client.media.diagnostics
        .entries()
        .filter((entry) => entry.error?.code === 'CAPABILITY_UNAVAILABLE');
      expect(unavailable.map((entry) => [entry.stage, entry.key])).toEqual([
        ['routed', tone.key],
        ['routed', tone.key],
      ]);
      expect(unavailable[0].error?.message).toContain('occlusion');
      // Level and routing are untouched: the sound plays unoccluded, not approximated.
      expect(sound.volume).toBe(0.5);
      expect(sound.routeTo).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('a re-Play of a playing key at a moved cursor (the listener enters the room)', () => {
    const fire = {
      key: 'fire',
      name: 'fire.ogg',
      type: 'sound',
      volume: 50,
      loops: -1,
      loopStart: 0,
    };

    async function playFire(extra: Record<string, unknown> = {}) {
      const sound = createMockSound('fire.ogg');
      mockCreateSound.mockResolvedValue(sound);
      await handler.handlePlay({ ...fire, start: 0, ...extra } as GMCPMessageClientMediaPlay);
      expect(sound.voice.play).toHaveBeenCalledOnce();
      return sound;
    }

    function regionSound(start: number, duration: number) {
      const base = createMockSound('rain.ogg');
      base.buffer = { duration: 10 };
      const region = createMockSound('');
      region.buffer = base.buffer;
      region.region = { start, duration };
      mockCreateSound.mockResolvedValue(base);
      mockCreateSprite.mockResolvedValue({ get: () => region });
      return region;
    }

    function expectKept(sound: MockSound) {
      expect(handler.sounds[sound === handler.sounds.fire ? 'fire' : 'rain']).toBe(sound);
      expect(sound.cleanup).not.toHaveBeenCalled();
      expect(sound.preplay).toHaveBeenCalledOnce();
      expect(sound.voice.play).toHaveBeenCalledOnce();
    }

    it('keeps the voice, seamlessly, when the cursor is where the voice already is', async () => {
      const sound = await playFire();
      sound.voice.currentTime = 12;

      // The server re-Plays every audible sound at its current cursor.
      await handler.handlePlay({ ...fire, start: 12_050 } as GMCPMessageClientMediaPlay);

      expect(mockCreateSound).toHaveBeenCalledOnce();
      expectKept(sound);
      expect(sound.seek).not.toHaveBeenCalled();
      expect(sound.voice.seek).not.toHaveBeenCalled();
    });

    it('keeps the voice and seeks when the cursor is further away than the tolerance', async () => {
      const sound = await playFire();
      sound.voice.currentTime = 12;

      await handler.handlePlay({
        ...fire,
        start: 12_000 + MEDIA_SEEK_TOLERANCE_MS + 1,
      } as GMCPMessageClientMediaPlay);

      expect(mockCreateSound).toHaveBeenCalledOnce();
      expectKept(sound);
      expect(sound.seek).toHaveBeenCalledOnce();
      expect(sound.seek).toHaveBeenCalledWith((12_000 + MEDIA_SEEK_TOLERANCE_MS + 1) / 1000);
    });

    it('does not seek at exactly the tolerance, in either direction', async () => {
      const sound = await playFire();
      sound.voice.currentTime = 12;

      await handler.handlePlay({
        ...fire,
        start: 12_000 + MEDIA_SEEK_TOLERANCE_MS,
      } as GMCPMessageClientMediaPlay);
      await handler.handlePlay({
        ...fire,
        start: 12_000 - MEDIA_SEEK_TOLERANCE_MS,
      } as GMCPMessageClientMediaPlay);

      expectKept(sound);
      expect(sound.seek).not.toHaveBeenCalled();
    });

    it('names the tolerance: 150 ms', () => {
      expect(MEDIA_SEEK_TOLERANCE_MS).toBe(150);
    });

    it('seeks when the engine does not report a playhead', async () => {
      const sound = await playFire();

      await handler.handlePlay({ ...fire, start: 12_050 } as GMCPMessageClientMediaPlay);

      expectKept(sound);
      expect(sound.seek).toHaveBeenCalledWith(12.05);
    });

    it('keeps a region voice: the cursor is not part of the region', async () => {
      const region = regionSound(2, 3);
      const rain = { key: 'rain', name: 'rain.ogg', type: 'sound', volume: 50, loops: -1 };
      await handler.handlePlay({
        ...rain,
        start: 2000,
        loopStart: 2000,
        finish: 5000,
      } as GMCPMessageClientMediaPlay);
      // One second into the region: absolute source position 3000 ms.
      region.voice.currentTime = 1;

      await handler.handlePlay({
        ...rain,
        start: 3040,
        loopStart: 2000,
        finish: 5000,
      } as GMCPMessageClientMediaPlay);

      expect(mockCreateSound).toHaveBeenCalledOnce();
      expect(mockCreateSprite).toHaveBeenCalledOnce();
      expectKept(region);
      expect(region.seek).not.toHaveBeenCalled();

      // A cursor elsewhere in the same region seeks, region-relative.
      await handler.handlePlay({
        ...rain,
        start: 4500,
        loopStart: 2000,
        finish: 5000,
      } as GMCPMessageClientMediaPlay);

      expectKept(region);
      expect(region.seek).toHaveBeenCalledOnce();
      expect(region.seek).toHaveBeenCalledWith(2.5);
    });

    it('treats a looping playhead and a cursor either side of the loop point as close', async () => {
      const region = regionSound(2, 3);
      const rain = { key: 'rain', name: 'rain.ogg', type: 'sound', volume: 50, loops: -1 };
      const window = { loopStart: 2000, finish: 5000 };
      await handler.handlePlay({ ...rain, ...window, start: 2000 } as GMCPMessageClientMediaPlay);
      // 50 ms before the loop point; the server's cursor has just wrapped.
      region.voice.currentTime = 2.95;

      await handler.handlePlay({ ...rain, ...window, start: 2020 } as GMCPMessageClientMediaPlay);

      expectKept(region);
      expect(region.seek).not.toHaveBeenCalled();
    });

    it('keeps a single-pass voice, which is re-Played without loopStart', async () => {
      const sound = createMockSound('speech.ogg');
      mockCreateSound.mockResolvedValue(sound);
      const speech = { key: 'fire', name: 'speech.ogg', type: 'sound', volume: 50, loops: 1 };
      await handler.handlePlay({ ...speech, start: 0 } as GMCPMessageClientMediaPlay);
      sound.voice.currentTime = 7;

      await handler.handlePlay({ ...speech, start: 7100 } as GMCPMessageClientMediaPlay);

      expect(mockCreateSound).toHaveBeenCalledOnce();
      expectKept(sound);
      expect(sound.seek).not.toHaveBeenCalled();
    });

    it('replaces a single-pass region voice whose region starts after the new cursor', async () => {
      const first = regionSound(2, 3);
      const speech = { key: 'rain', name: 'rain.ogg', type: 'sound', volume: 50, loops: 1 };
      await handler.handlePlay({ ...speech, start: 2000, finish: 5000 } as GMCPMessageClientMediaPlay);
      first.voice.currentTime = 1;
      const second = regionSound(1, 4);

      // The kept region [2000, 5000) cannot play from 1000.
      await handler.handlePlay({ ...speech, start: 1000, finish: 5000 } as GMCPMessageClientMediaPlay);

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(handler.sounds.rain).toBe(second);
      expect(second.voice.play).toHaveBeenCalledOnce();
    });

    it('replaces the voice when continue is false, even at the same cursor', async () => {
      const first = await playFire();
      first.voice.currentTime = 12;
      const second = createMockSound('fire.ogg');
      mockCreateSound.mockResolvedValue(second);

      await handler.handlePlay({
        ...fire,
        start: 12_000,
        continue: false,
      } as GMCPMessageClientMediaPlay);

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(handler.sounds.fire).toBe(second);
      expect(second.voice.play).toHaveBeenCalledOnce();
      // A new voice starts at the cursor before it plays.
      expect(second.voice.seek).toHaveBeenCalledWith(12);
    });

    it.each([
      ['finish', { loopStart: 2000, finish: 6000 }],
      ['loopStart', { loopStart: 2500, finish: 5000 }],
    ])('replaces the voice when %s changes: that is a different region', async (_field, window) => {
      const first = regionSound(2, 3);
      const rain = { key: 'rain', name: 'rain.ogg', type: 'sound', volume: 50, loops: -1 };
      await handler.handlePlay({
        ...rain,
        start: 3000,
        loopStart: 2000,
        finish: 5000,
      } as GMCPMessageClientMediaPlay);
      const second = regionSound(window.loopStart / 1000, (window.finish - window.loopStart) / 1000);

      await handler.handlePlay({ ...rain, ...window, start: 3000 } as GMCPMessageClientMediaPlay);

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(handler.sounds.rain).toBe(second);
    });

    it('replaces a repeating voice re-Played without loopStart: its repeat window follows start', async () => {
      const first = regionSound(2, 3);
      const rain = { key: 'rain', name: 'rain.ogg', type: 'sound', volume: 50, loops: -1 };
      await handler.handlePlay({ ...rain, start: 2000, finish: 5000 } as GMCPMessageClientMediaPlay);
      const second = regionSound(3, 2);

      // Per the wire contract, with no loopStart later passes play start..finish.
      await handler.handlePlay({ ...rain, start: 3000, finish: 5000 } as GMCPMessageClientMediaPlay);

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(handler.sounds.rain).toBe(second);
    });
  });

  describe('a change of panning mode on a playing key', () => {
    const fire = {
      key: 'fire',
      name: 'fire.ogg',
      type: 'sound',
      volume: 50,
      pan: 0,
      loops: -1,
      loopStart: 0,
    };
    /** Heard through a doorway with no known point: no position, not 3D. */
    const throughDoor = { ...fire, is3d: false };
    /** Heard in its own room. MOO [2, 0, 0] is Web Audio [-2, 0, 0]. */
    const inRoom = { ...fire, is3d: true, position: [2, 0, 0] };

    beforeEach(() => {
      // These tests queue one sound per expected creation; never inherit a leftover.
      mockCreateSound.mockReset();
      mockCreateSprite.mockReset();
    });

    async function start(payload: Record<string, unknown>) {
      const sound = createMockSound('fire.ogg');
      mockCreateSound.mockResolvedValueOnce(sound);
      await handler.handlePlay({ start: 0, ...payload } as GMCPMessageClientMediaPlay);
      expect(sound.voice.play).toHaveBeenCalledOnce();
      return sound;
    }

    function nextSound() {
      const sound = createMockSound('fire.ogg');
      mockCreateSound.mockResolvedValueOnce(sound);
      return sound;
    }

    it('rebuilds a non-positional voice as a point source and continues from the playhead', async () => {
      const first = await start({ ...throughDoor, fadein: 500 });
      expect(first.panType).toBe('stereo');
      first.voice.currentTime = 8;
      const second = nextSound();

      // The listener walked into the sound's room: same key, now 3D with a position.
      await handler.handlePlay({ ...inRoom, fadein: 500, start: 8040 } as GMCPMessageClientMediaPlay);

      expect(mockCreateSound).toHaveBeenLastCalledWith('fire.ogg', 'buffer', 'HRTF');
      expect(second.panType).toBe('HRTF');
      expect(handler.sounds.fire).toBe(second);
      expect(first.cleanup).toHaveBeenCalledOnce();
      // It picks up where the old voice was, not at the beginning...
      expect(second.voice.seek).toHaveBeenCalledWith(8);
      expect(second.voice.seek.mock.invocationCallOrder[0]).toBeLessThan(
        second.voice.play.mock.invocationCallOrder[0],
      );
      // ...and does not fade in again: this is the same sound continuing.
      expect(second.voice.play).toHaveBeenCalledWith({ fadeIn: undefined, fadeOut: undefined });
      expect(second.position).toEqual([-2, 0, 0]);
      expect(second.threeDOptions).toMatchObject({ panningModel: 'HRTF', rolloffFactor: 0 });
      expect(second.loop).toHaveBeenCalledWith('infinite');
    });

    it('rebuilds a point source as a non-positional voice: no position, no distance attenuation', async () => {
      const first = await start({ ...inRoom, position: [8, 0, 0] });
      expect(first.panType).toBe('HRTF');
      // Eight metres away: the point source is attenuated at its gain.
      expect(first.volume).toBeLessThan(0.5);
      first.voice.currentTime = 3;
      const second = nextSound();

      // The listener stepped out: heard through a doorway that has no known point.
      await handler.handlePlay({ ...throughDoor, pan: 40, start: 3000 } as GMCPMessageClientMediaPlay);

      expect(mockCreateSound).toHaveBeenLastCalledWith('fire.ogg', 'buffer', 'stereo');
      expect(second.panType).toBe('stereo');
      expect(handler.sounds.fire).toBe(second);
      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(second.voice.seek).toHaveBeenCalledWith(3);
      expect(second.volume).toBe(0.5);
      expect(second.stereoPan).toBe(0.4);
      expect(second.threeDOptions).toBeUndefined();
      expect(handler.sounds.fire.pointSource).toBeFalsy();

      // The listener walking around no longer changes its level.
      client.media.setListenerPosition([50, 0, 0]);
      expect(second.volume).toBe(0.5);
    });

    it('keeps the old voice playing until its replacement is ready', async () => {
      const first = await start(throughDoor);
      first.voice.currentTime = 8;
      const second = createMockSound('fire.ogg');
      let deliver: (sound: MockSound) => void = () => undefined;
      mockCreateSound.mockReturnValueOnce(
        new Promise<MockSound>((resolve) => {
          deliver = resolve;
        }),
      );

      const replay = handler.handlePlay({ ...inRoom, start: 8000 } as GMCPMessageClientMediaPlay);
      await Promise.resolve();
      expect(first.cleanup).not.toHaveBeenCalled();
      expect(handler.sounds.fire).toBe(first);

      // The old voice played on while the new one loaded: continue from where it is now.
      first.voice.currentTime = 8.1;
      deliver(second);
      await replay;

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(second.voice.seek).toHaveBeenCalledWith(8.1);
      expect(first.cleanup.mock.invocationCallOrder[0]).toBeLessThan(
        second.voice.play.mock.invocationCallOrder[0],
      );
    });

    it('starts at the Play cursor when that is not where the old voice was', async () => {
      const first = await start(throughDoor);
      first.voice.currentTime = 8;
      const second = nextSound();

      await handler.handlePlay({ ...inRoom, start: 20_000 } as GMCPMessageClientMediaPlay);

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(second.voice.seek).toHaveBeenCalledWith(20);
    });

    it('rebuilds a region voice over the same region, at the region-relative playhead', async () => {
      const region = (panType: string) => {
        const base = createMockSound('rain.ogg');
        base.buffer = { duration: 10 };
        const sound = createMockSound('');
        sound.buffer = base.buffer;
        sound.region = { start: 2, duration: 3 };
        mockCreateSound.mockResolvedValueOnce(base);
        mockCreateSprite.mockResolvedValueOnce({ get: () => sound });
        return { sound, panType };
      };
      const rain = {
        key: 'rain',
        name: 'rain.ogg',
        type: 'sound',
        volume: 50,
        loops: -1,
        loopStart: 2000,
        finish: 5000,
      };
      const first = region('stereo').sound;
      await handler.handlePlay({ ...rain, start: 2000 } as GMCPMessageClientMediaPlay);
      first.voice.currentTime = 1.25;
      const second = region('HRTF').sound;

      await handler.handlePlay({
        ...rain,
        start: 3250,
        is3d: true,
        position: [2, 0, 0],
      } as GMCPMessageClientMediaPlay);

      expect(mockCreateSprite).toHaveBeenLastCalledWith(
        expect.anything(),
        { segment: { start: 2, duration: 3 } },
        { panType: 'HRTF' },
      );
      expect(handler.sounds.rain).toBe(second);
      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(second.voice.seek).toHaveBeenCalledWith(1.25);
    });

    it.each([
      ['to 3D', throughDoor, { is3d: true, position: [2, 0, 0] }, 'HRTF'],
      ['to non-positional', inRoom, { is3d: false }, 'stereo'],
    ])('rebuilds on an Update %s, carrying the state the voice has now', async (_way, play, update, mode) => {
      await client.media.setChain({
        id: 'workshop',
        effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
      });
      const first = await start({ ...play, fadein: 500, occlusion: 0.8, chain: 'workshop' });
      // Updates since the Play: these, not the Play's values, are the state in effect.
      handler.handleUpdate({ key: 'fire', volume: 20, occlusion: 0.4 } as GMCPMessageClientMediaUpdate);
      handler.handleUpdate({ key: 'fire', chain: 'workshop', send: 0.3 } as GMCPMessageClientMediaUpdate);
      first.voice.currentTime = 8;
      const second = nextSound();

      handler.handleUpdate({ key: 'fire', ...update } as GMCPMessageClientMediaUpdate);
      await vi.waitFor(() => expect(second.voice.play).toHaveBeenCalledOnce());

      expect(mockCreateSound).toHaveBeenLastCalledWith('fire.ogg', 'buffer', mode);
      expect(second.panType).toBe(mode);
      expect(handler.sounds.fire).toBe(second);
      expect(first.cleanup).toHaveBeenCalledOnce();
      // No restart from the beginning (or from the Play's start), and no second fade-in.
      expect(second.voice.seek).toHaveBeenCalledWith(8);
      expect(second.voice.play).toHaveBeenCalledWith({ fadeIn: undefined, fadeOut: undefined });
      // Occlusion from the first sample, the level and the route of the voice it replaces.
      expect(second.voice.setOcclusion?.mock.calls).toEqual([[0.4, 0]]);
      expect(second.voice.setOcclusion?.mock.invocationCallOrder[0]).toBeLessThan(
        second.voice.play.mock.invocationCallOrder[0],
      );
      expect(handler.sounds.fire.mediaVolume).toBe(0.2);
      expect(handler.sounds.fire.namedSend).toBe(0.3);
      expect(second.loop).toHaveBeenCalledWith('infinite');
      if (mode === 'HRTF') {
        expect(second.position).toEqual([-2, 0, 0]);
        // 2 m away: distance gain 0.5, which the send (tapped after it) undoes.
        expect(second.routeTo).toHaveBeenLastCalledWith('workshop', expect.closeTo(0.6, 9));
      } else {
        expect(second.volume).toBe(0.2);
        expect(second.routeTo).toHaveBeenLastCalledWith('workshop', 0.3);
      }
    });

    it('leaves the voice alone on an Update that names the mode it already has', async () => {
      const first = await start(inRoom);

      handler.handleUpdate({ key: 'fire', is3d: true, position: [3, 0, 0] } as GMCPMessageClientMediaUpdate);
      await Promise.resolve();

      expect(mockCreateSound).toHaveBeenCalledOnce();
      expect(first.cleanup).not.toHaveBeenCalled();
      expect(handler.sounds.fire).toBe(first);
    });

    it('applies an Update that arrives while the rebuild is loading', async () => {
      const first = await start(throughDoor);
      first.voice.currentTime = 8;
      const second = createMockSound('fire.ogg');
      let deliver: (sound: MockSound) => void = () => undefined;
      mockCreateSound.mockReturnValueOnce(
        new Promise<MockSound>((resolve) => {
          deliver = resolve;
        }),
      );

      handler.handleUpdate({
        key: 'fire',
        is3d: true,
        position: [2, 0, 0],
      } as GMCPMessageClientMediaUpdate);
      handler.handleUpdate({ key: 'fire', volume: 20 } as GMCPMessageClientMediaUpdate);
      deliver(second);
      await vi.waitFor(() => expect(second.voice.play).toHaveBeenCalledOnce());

      expect(handler.sounds.fire).toBe(second);
      expect(handler.sounds.fire.mediaVolume).toBe(0.2);
    });

    it('plays nothing when the key is stopped while the rebuild is loading', async () => {
      const first = await start(throughDoor);
      const second = createMockSound('fire.ogg');
      let deliver: (sound: MockSound) => void = () => undefined;
      mockCreateSound.mockReturnValueOnce(
        new Promise<MockSound>((resolve) => {
          deliver = resolve;
        }),
      );

      const replay = handler.handlePlay({ ...inRoom, start: 0 } as GMCPMessageClientMediaPlay);
      await Promise.resolve();
      handler.handleStop({ key: 'fire' });
      deliver(second);
      await replay;

      expect(first.cleanup).toHaveBeenCalledOnce();
      expect(second.cleanup).toHaveBeenCalledOnce();
      expect(second.voice.play).not.toHaveBeenCalled();
      expect(handler.sounds.fire).toBeUndefined();
    });

    it('does not rebuild an ambisonic sound (that path is out of scope here)', async () => {
      const first = await start({ ...inRoom, upmix: 'ambisonic', channels: 2 });
      await vi.waitFor(() => expect(mockPositionalFoaRendererCreate).toHaveBeenCalledOnce());

      handler.handleUpdate({ key: 'fire', is3d: false } as GMCPMessageClientMediaUpdate);
      await Promise.resolve();

      expect(mockCreateSound).toHaveBeenCalledOnce();
      expect(first.cleanup).not.toHaveBeenCalled();
    });
  });

  describe('a scene snapshot (room change)', () => {
    async function playRadio() {
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
      return sound;
    }

    it('ends a position glide in flight: no frame moves the sound afterwards', async () => {
      const sound = await playRadio();
      handler.handleUpdate({ key: 'radio-1', position: [4, 0, 0] } as GMCPMessageClientMediaUpdate);
      client.stepMotion(100);
      // Part-way along the glide, in the old room's coordinates.
      expect(sound.position[0]).toBeLessThan(0);
      expect(sound.position[0]).toBeGreaterThan(-4);

      client.media.sceneChanged();

      // The glide is over at once, on the last position the server gave.
      expect(sound.position).toEqual([-4, 0, 0]);
      client.stepMotion(100);
      client.stepMotion(600);
      expect(sound.position).toEqual([-4, 0, 0]);
    });

    it('snaps the first position a sound receives after the snapshot', async () => {
      const sound = await playRadio();
      handler.handleUpdate({ key: 'radio-1', position: [4, 0, 0] } as GMCPMessageClientMediaUpdate);
      client.stepMotion(600);
      expect(sound.position).toEqual([-4, 0, 0]);

      client.media.sceneChanged();
      // The new room has its own origin: [1, 0, 0] here is unrelated to [4, 0, 0] there.
      handler.handleUpdate({ key: 'radio-1', position: [1, 0, 0] } as GMCPMessageClientMediaUpdate);

      expect(sound.position).toEqual([-1, 0, 0]);
      expect(handler.sounds['radio-1'].mediaPosition).toEqual([-1, 0, 0]);

      // Within the new room, later moves glide again.
      handler.handleUpdate({ key: 'radio-1', position: [3, 0, 0] } as GMCPMessageClientMediaUpdate);
      expect(sound.position).toEqual([-1, 0, 0]);
      client.stepMotion(600);
      expect(sound.position).toEqual([-3, 0, 0]);
    });

    it('is driven by Client.Spatial.Scene, whose handler glides on a tweener of its own', async () => {
      const spatial = new GMCPClientSpatial(client as never);
      const sound = await playRadio();
      handler.handleUpdate({ key: 'radio-1', position: [4, 0, 0] } as GMCPMessageClientMediaUpdate);
      client.stepMotion(100);

      spatial.handleScene({
        roomId: 'next-room',
        listenerId: 'player-1',
        entities: [],
        emitters: [],
      });
      const landed = [...sound.position];
      client.stepMotion(600);

      expect(sound.position).toEqual(landed);
      handler.handleUpdate({ key: 'radio-1', position: [1, 0, 0] } as GMCPMessageClientMediaUpdate);
      expect(sound.position).toEqual([-1, 0, 0]);
      spatial.shutdown();
    });

    it('snaps a kept voice re-Played with its position in the new room', async () => {
      const sound = await playRadio();
      handler.handleUpdate({ key: 'radio-1', position: [4, 0, 0] } as GMCPMessageClientMediaUpdate);
      client.stepMotion(600);

      client.media.sceneChanged();
      await handler.handlePlay({
        key: 'radio-1',
        name: 'radio.ogg',
        type: 'sound',
        volume: 50,
        is3d: true,
        position: [0, 2, 0],
      } as GMCPMessageClientMediaPlay);

      expect(handler.sounds['radio-1']).toBe(sound);
      expect(sound.position).toEqual([0, 0, 2]);
    });
  });
});
