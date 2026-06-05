import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockAmbisonicRendererCreate, mockCreateSound } = vi.hoisted(() => ({
  mockAmbisonicRendererCreate: vi.fn(),
  mockCreateSound: vi.fn(),
}));

vi.mock('../../audio/AmbisonicRenderer', () => ({
  AmbisonicRenderer: { create: mockAmbisonicRendererCreate },
}));

import { GMCPClientMedia, type GMCPMessageClientMediaPlay } from './Media';

type ActionHandlers = Record<string, MediaSessionActionHandler>;

function installMockSession() {
  const handlers: ActionHandlers = {};
  const session = {
    metadata: null as MediaMetadata | null,
    playbackState: 'none' as MediaSessionPlaybackState,
    setActionHandler: vi.fn((action: string, handler: MediaSessionActionHandler | null) => {
      if (handler) {
        handlers[action] = handler;
      } else {
        delete handlers[action];
      }
    }),
    setPositionState: vi.fn(),
  };
  Object.defineProperty(navigator, 'mediaSession', {
    value: session,
    configurable: true,
    writable: true,
  });
  (globalThis as unknown as { MediaMetadata: unknown }).MediaMetadata = class {
    title?: string;
    artist?: string;
    constructor(init: MediaMetadataInit = {}) {
      this.title = init.title;
      this.artist = init.artist;
    }
  };
  return { session, handlers };
}

function createMockMusicSound(url: string) {
  const listeners = new Map<string, Set<() => void>>();
  const playback = { currentTime: 0, duration: 180 };
  const sound = {
    cleanup: vi.fn(),
    duration: 180,
    isPlaying: false,
    key: undefined as string | undefined,
    loop: vi.fn(),
    mediaType: undefined as string | undefined,
    on: vi.fn((event: string, listener: () => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)?.add(listener);
      return () => listeners.get(event)?.delete(listener);
    }),
    pause: vi.fn(() => {
      sound.isPlaying = false;
    }),
    play: vi.fn(() => {
      sound.isPlaying = true;
      return [playback];
    }),
    playbacks: [playback],
    position: [0, 0, 0],
    priority: undefined,
    resume: vi.fn(() => {
      sound.isPlaying = true;
    }),
    routeTo: vi.fn(),
    seek: vi.fn((t: number) => {
      playback.currentTime = t;
    }),
    stereoPan: 0,
    tag: undefined,
    trigger(event: string) {
      for (const listener of listeners.get(event) ?? []) {
        listener();
      }
    },
    url,
    volume: 1,
  };
  return sound;
}

function createMockClient() {
  const master = { destroy: vi.fn(), input: {}, destroyed: false };
  return {
    cacophony: {
      context: { currentTime: 0, sampleRate: 48000 },
      createSound: mockCreateSound,
      getBus: vi.fn((name: string) => (name === 'master' ? master : undefined)),
      listenerForwardOrientation: [0, 0, -1],
    },
    off: vi.fn(),
    on: vi.fn(),
    sendGmcp: vi.fn(),
  };
}

async function playMusic(handler: GMCPClientMedia, overrides: Partial<GMCPMessageClientMediaPlay>) {
  return handler.handlePlay({
    name: 'theme.ogg',
    type: 'music',
    volume: 50,
    ...overrides,
  } as GMCPMessageClientMediaPlay);
}

describe('GMCPClientMedia ↔ Media Session', () => {
  let handler: GMCPClientMedia;
  let session: ReturnType<typeof installMockSession>['session'];
  let handlers: ActionHandlers;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ session, handlers } = installMockSession());
    handler = new GMCPClientMedia(createMockClient() as never);
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'mediaSession');
    Reflect.deleteProperty(globalThis as object, 'MediaMetadata');
  });

  it('publishes now-playing metadata when a music track starts', async () => {
    mockCreateSound.mockResolvedValue(createMockMusicSound('proxy/theme.ogg'));
    await playMusic(handler, { name: 'cantina/band.ogg' });

    expect(session.metadata?.title).toBe('band'); // filename basename, no ext
    expect(session.playbackState).toBe('playing');
    expect(session.setPositionState).toHaveBeenCalledWith({
      duration: 180,
      position: 0,
      playbackRate: 1,
    });
  });

  it('prefers explicit title/artist metadata from the server', async () => {
    mockCreateSound.mockResolvedValue(createMockMusicSound('proxy/theme.ogg'));
    await playMusic(handler, { title: 'Cantina Band', artist: 'Figrin D’an' });

    expect(session.metadata?.title).toBe('Cantina Band');
    expect(session.metadata?.artist).toBe('Figrin D’an');
  });

  it('does not touch the Media Session for non-music sounds', async () => {
    mockCreateSound.mockResolvedValue(createMockMusicSound('chime.ogg'));
    await handler.handlePlay({
      name: 'chime.ogg',
      type: 'sound',
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe('none');
  });

  it('pauses and resumes the track from OS transport controls', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});

    handlers.pause?.({ action: 'pause' });
    expect(sound.pause).toHaveBeenCalledOnce();
    expect(session.playbackState).toBe('paused');

    handlers.play?.({ action: 'play' });
    expect(sound.resume).toHaveBeenCalledOnce();
    expect(session.playbackState).toBe('playing');
  });

  it('seeks the track from the OS scrubber', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});

    handlers.seekto?.({ action: 'seekto', seekTime: 90 });
    expect(sound.seek).toHaveBeenCalledWith(90);
  });

  it('clamps OS seek-forward to the track duration', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    sound.playbacks[0].currentTime = 175;
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});

    handlers.seekforward?.({ action: 'seekforward' }); // +10 from 175 -> clamp 180
    expect(sound.seek).toHaveBeenCalledWith(180);
  });

  it('stops the track and clears the session from the OS stop control', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});

    handlers.stop?.({ action: 'stop' });
    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe('none');
  });

  it('clears the session when the track ends naturally', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});

    sound.trigger('ended');
    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe('none');
  });

  it('clears the session on package shutdown (disconnect)', async () => {
    mockCreateSound.mockResolvedValue(createMockMusicSound('proxy/theme.ogg'));
    await playMusic(handler, {});

    handler.shutdown();
    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe('none');
  });
});
