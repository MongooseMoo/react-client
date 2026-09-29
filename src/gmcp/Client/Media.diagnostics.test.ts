import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateSound, mockCreateSprite } = vi.hoisted(() => ({
  mockCreateSound: vi.fn(),
  mockCreateSprite: vi.fn(),
}));

vi.mock('../../audio/AmbisonicRenderer', () => ({
  AmbisonicRenderer: { create: vi.fn() },
}));

import type { AudioDiagnosticEntry } from '../../audio/audioDiagnostics';
import { MediaService } from '../../audio/MediaService';
import { MediaPayloadError } from '../../audio/mediaPayloads';
import { GMCPClientMedia } from './Media';

function createMockSound(url: string) {
  const listeners = new Map<string, Set<() => void>>();
  const playback = {
    play: vi.fn(() => {
      sound.isPlaying = true;
      return [playback];
    }),
    seek: vi.fn(),
  };
  const sound = {
    buffer: undefined as { duration: number; sampleRate: number } | undefined,
    cleanup: vi.fn(),
    isPlaying: false,
    loop: vi.fn(),
    on: vi.fn((event: string, listener: () => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)?.add(listener);
      return () => listeners.get(event)?.delete(listener);
    }),
    playbackRate: 1,
    playbacks: [playback],
    position: [0, 0, 0],
    preplay: vi.fn(() => [playback]),
    routeTo: vi.fn(),
    seek: vi.fn(),
    stereoPan: 0,
    url,
    voice: playback,
    volume: 1,
  };
  return sound;
}

function createMockClient() {
  const master = { destroy: vi.fn(), input: {}, destroyed: false };
  const cacophony = {
    context: { currentTime: 0, sampleRate: 48000 },
    createSound: mockCreateSound,
    createSprite: mockCreateSprite,
    getBus: vi.fn((name: string) => (name === 'master' ? master : undefined)),
    listenerForwardOrientation: [0, 0, -1],
    listenerPosition: [0, 0, 0],
    listenerUpOrientation: [0, 1, 0],
    muted: false,
    setGlobalVolume: vi.fn(),
  };
  return {
    media: new MediaService(cacophony as never, { manageFocus: false }),
    gmcp: { send: vi.fn() },
    off: vi.fn(),
    on: vi.fn(),
  };
}

const tonePlay = {
  key: 'fixture:tone',
  name: 'tone.ogg',
  url: 'https://cdn.example/sounds/',
  type: 'sound',
  volume: 50,
};

describe('Client.Media audio diagnostics', () => {
  let handler: GMCPClientMedia;
  let client: ReturnType<typeof createMockClient>;

  const entries = (): readonly AudioDiagnosticEntry[] => client.media.diagnostics.entries();
  const stages = (key?: string) =>
    entries()
      .filter((entry) => key === undefined || entry.key === key)
      .map((entry) => entry.stage);
  const errors = () => entries().filter((entry) => entry.error);

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    handler = new GMCPClientMedia(client as never);
  });

  afterEach(() => {
    handler.shutdown();
  });

  it('traces a Play from received to started', async () => {
    mockCreateSound.mockImplementation(async (url: string) => createMockSound(url));

    handler.receiveRegisteredMessage('Play', tonePlay);

    await vi.waitFor(() => expect(stages('fixture:tone')).toContain('started'));
    expect(stages('fixture:tone')).toEqual([
      'received',
      'validated',
      'loading',
      'decoded',
      'routed',
      'started',
    ]);
    const started = entries().at(-1);
    expect(started).toMatchObject({
      key: 'fixture:tone',
      name: 'tone.ogg',
      generation: 1,
      category: 'effects',
    });
    expect(errors()).toEqual([]);
  });

  it('keeps catalog provenance and derives the music category', async () => {
    mockCreateSound.mockImplementation(async (url: string) => createMockSound(url));

    handler.receiveRegisteredMessage('Play', {
      ...tonePlay,
      key: 'radio',
      type: 'music',
      catalog: { soundId: 'snd-7', assetId: 'asset-3', segmentId: 'seg-1' },
    });

    await vi.waitFor(() => expect(stages('radio')).toContain('started'));
    const started = entries().find((entry) => entry.stage === 'started');
    expect(started?.category).toBe('music');
    expect(started?.catalog).toEqual({ soundId: 'snd-7', assetId: 'asset-3', segmentId: 'seg-1' });
  });

  it('records INVALID_PAYLOAD for a malformed frame and still rejects it', () => {
    expect(() => handler.receiveRegisteredMessage('Play', { ...tonePlay, loops: 1.5 })).toThrow(
      MediaPayloadError,
    );
    expect(() => handler.receiveRegisteredMessage('Play', { ...tonePlay, catalog: 'x' })).toThrow(
      MediaPayloadError,
    );
    expect(errors().map((entry) => entry.error?.code)).toEqual([
      'INVALID_PAYLOAD',
      'INVALID_PAYLOAD',
    ]);
    expect(errors()[0]).toMatchObject({ stage: 'received', key: 'fixture:tone' });
    expect(errors()[0].error?.message).toMatch(/loops/);
    expect(mockCreateSound).not.toHaveBeenCalled();
  });

  it('separates FETCH_FAILED from DECODE_FAILED', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateSound.mockRejectedValueOnce(new Error('Failed to fetch resource: 404 Not Found'));
    mockCreateSound.mockRejectedValueOnce(new DOMException('Unable to decode', 'EncodingError'));

    handler.receiveRegisteredMessage('Play', { ...tonePlay, key: 'missing' });
    handler.receiveRegisteredMessage('Play', { ...tonePlay, key: 'garbled' });

    await vi.waitFor(() => expect(errors()).toHaveLength(2));
    expect(errors().map((entry) => [entry.key, entry.stage, entry.error?.code])).toEqual([
      ['missing', 'loading', 'FETCH_FAILED'],
      ['garbled', 'loading', 'DECODE_FAILED'],
    ]);
  });

  it('marks a superseded load STALE_GENERATION with its own generation', async () => {
    let resolveFirst: (sound: unknown) => void = () => undefined;
    mockCreateSound
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementation(async (url: string) => createMockSound(url));

    const first = handler.handlePlay({ ...tonePlay, type: 'sound' });
    const second = handler.handlePlay({ ...tonePlay, type: 'sound' });
    await second;
    resolveFirst(createMockSound('https://cdn.example/sounds/tone.ogg'));
    await first;

    const stale = errors().filter((entry) => entry.error?.code === 'STALE_GENERATION');
    expect(stale).toHaveLength(1);
    expect(stale[0]).toMatchObject({ key: 'fixture:tone', generation: 1 });
    const started = entries().filter((entry) => entry.stage === 'started');
    expect(started.map((entry) => entry.generation)).toEqual([2]);
  });

  it('records stopped then released for an explicit Stop', async () => {
    mockCreateSound.mockImplementation(async (url: string) => createMockSound(url));
    await handler.handlePlay({ ...tonePlay, type: 'sound' });

    handler.receiveRegisteredMessage('Stop', { key: 'fixture:tone' });

    expect(stages('fixture:tone').slice(-2)).toEqual(['stopped', 'released']);
  });

  it('records SEEK_UNAVAILABLE when the start offset cannot be applied', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sound = createMockSound('https://cdn.example/sounds/tone.ogg');
    sound.voice.seek.mockImplementation(() => {
      throw new Error('not seekable');
    });
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({ ...tonePlay, type: 'sound', start: 2000 });

    expect(errors().map((entry) => [entry.stage, entry.error?.code])).toEqual([
      ['started', 'SEEK_UNAVAILABLE'],
    ]);
    expect(stages('fixture:tone')).toContain('started');
  });

  it('records REGION_OUT_OF_RANGE when a region ends past the decoded buffer', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const base = createMockSound('https://cdn.example/sounds/tone.ogg');
    base.buffer = { duration: 2, sampleRate: 48000 };
    mockCreateSound.mockResolvedValue(base);
    const region = createMockSound('https://cdn.example/sounds/tone.ogg');
    mockCreateSprite.mockResolvedValue({ get: () => region });

    await handler.handlePlay({ ...tonePlay, type: 'sound', start: 500, finish: 3000 });

    expect(errors().map((entry) => [entry.stage, entry.error?.code])).toEqual([
      ['decoded', 'REGION_OUT_OF_RANGE'],
    ]);
  });

  it('allows a region end within one decoded sample of the buffer', async () => {
    const base = createMockSound('https://cdn.example/sounds/tone.ogg');
    base.buffer = { duration: 2, sampleRate: 48000 };
    mockCreateSound.mockResolvedValue(base);
    const region = createMockSound('https://cdn.example/sounds/tone.ogg');
    mockCreateSprite.mockResolvedValue({ get: () => region });

    await handler.handlePlay({ ...tonePlay, type: 'sound', start: 500, finish: 2000.02 });

    expect(errors()).toEqual([]);
  });

  it('records CAPABILITY_UNAVAILABLE when a named chain cannot be routed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sound = createMockSound('https://cdn.example/sounds/tone.ogg');
    sound.routeTo.mockImplementation(() => {
      throw new Error('no such bus');
    });
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({ ...tonePlay, type: 'sound', chain: 'workshop' });

    expect(errors().map((entry) => [entry.stage, entry.error?.code])).toEqual([
      ['routed', 'CAPABILITY_UNAVAILABLE'],
    ]);
  });

  it('records CAPACITY when the preload cache evicts its oldest sound', async () => {
    mockCreateSound.mockImplementation(async (url: string) => createMockSound(url));
    for (let i = 0; i <= 32; i += 1) {
      await handler.handleLoad({ name: `p${i}.ogg`, url: 'https://cdn.example/' });
    }

    const evicted = errors();
    expect(evicted).toHaveLength(1);
    expect(evicted[0]).toMatchObject({
      stage: 'released',
      key: 'https://cdn.example/p0.ogg',
      error: { code: 'CAPACITY' },
    });
  });

  it('never stores URL credentials or query strings', async () => {
    mockCreateSound.mockImplementation(async (url: string) => createMockSound(url));

    handler.receiveRegisteredMessage('Play', {
      name: 'tone.ogg?sig=abc',
      url: 'https://user:pw@cdn.example/sounds/',
      type: 'sound',
    });

    await vi.waitFor(() => expect(stages()).toContain('started'));
    expect(JSON.stringify(entries())).not.toMatch(/user|pw@|sig=/);
  });
});
