import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockAmbisonicRendererCreate, mockCreateSound } = vi.hoisted(() => ({
  mockAmbisonicRendererCreate: vi.fn(),
  mockCreateSound: vi.fn(),
}));

vi.mock('../../audio/AmbisonicRenderer', () => ({
  AmbisonicRenderer: { create: mockAmbisonicRendererCreate },
}));

import { GMCPClientMedia, type GMCPMessageClientMediaPlay } from './Media';
import { MediaService } from '../../audio/MediaService';

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
  const playback = {
    currentTime: 0,
    duration: 180,
    play: vi.fn(() => {
      sound.isPlaying = true;
      return [playback];
    }),
    seek: vi.fn(),
  };
  const sound = {
    cleanup: vi.fn(),
    duration: 180,
    isPlaying: false,
    key: undefined as string | undefined,
    loop: vi.fn(),
    mediaType: undefined as string | undefined,
    panType: 'stereo',
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
    preplay: vi.fn(() => [playback]),
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
  const cacophony = {
    context: { currentTime: 0, sampleRate: 48000 },
    createSound: mockCreateSound,
    getBus: vi.fn((name: string) => (name === 'master' ? master : undefined)),
    listenerForwardOrientation: [0, 0, -1],
    listenerPosition: [0, 0, 0],
    listenerUpOrientation: [0, 1, 0],
    muted: false,
    pause: vi.fn(async () => {}),
    resume: vi.fn(async () => {}),
    setGlobalVolume: vi.fn(),
  };

  return {
    media: new MediaService(cacophony as never, { manageFocus: false }),
    gmcp: {
      send: vi.fn(),
    },
    off: vi.fn(),
    on: vi.fn(),
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
  let mockClient: ReturnType<typeof createMockClient>;
  let session: ReturnType<typeof installMockSession>['session'];
  let handlers: ActionHandlers;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ session, handlers } = installMockSession());
    mockClient = createMockClient();
    handler = new GMCPClientMedia(mockClient as never);
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

  it('pauses all sounds without releasing them and resumes from the same playhead', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});
    sound.playbacks[0].currentTime = 42;
    await mockClient.media.pauseAllSounds();
    await mockClient.media.pauseAllSounds();
    expect(sound.pause).toHaveBeenCalledOnce();
    expect(sound.cleanup).not.toHaveBeenCalled();
    expect(mockClient.media.allSounds).toContain(sound);
    expect(mockClient.media.paused).toBe(true);
    expect(session.playbackState).toBe('paused');
    await mockClient.media.resumeAllSounds();
    expect(sound.resume).toHaveBeenCalledOnce();
    expect(sound.playbacks[0].currentTime).toBe(42);
    expect(mockClient.media.paused).toBe(false);
    expect(session.playbackState).toBe('playing');
  });

  it('keeps incoming sounds and repeated Play requests silent until explicitly resumed', async () => {
    await mockClient.media.pauseAllSounds();
    const sound = createMockMusicSound(mockClient.media.mediaUrl({ name: 'theme.ogg', type: 'music' }));
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});
    await playMusic(handler, {});
    expect(sound.playbacks[0].play).not.toHaveBeenCalled();
    expect(sound.preplay).toHaveBeenCalledOnce();
    await mockClient.media.resumeAllSounds();
    expect(sound.playbacks[0].play).toHaveBeenCalledOnce();
  });

  it('does not restart stopped sounds or independently paused music on resume', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});
    handlers.pause?.({ action: 'pause' });
    await mockClient.media.pauseAllSounds();
    await mockClient.media.resumeAllSounds();
    expect(sound.resume).not.toHaveBeenCalled();
    handlers.play?.({ action: 'play' });
    await mockClient.media.pauseAllSounds();
    mockClient.media.stopAllSounds();
    await mockClient.media.resumeAllSounds();
    expect(sound.resume).toHaveBeenCalledOnce();
    expect(sound.cleanup).toHaveBeenCalledOnce();
  });

  it('parks segment finish timers while paused and preserves remaining loop passes', async () => {
    vi.useFakeTimers();
    try {
      const sound = createMockMusicSound('proxy/theme.ogg');
      mockCreateSound.mockResolvedValue(sound);
      await playMusic(handler, { start: 1000, finish: 3000, loopStart: 1000, loops: 2 });
      await vi.advanceTimersByTimeAsync(2500); // First pass finished; second has 1500 ms left.
      await mockClient.media.pauseAllSounds();
      await vi.advanceTimersByTimeAsync(10000);
      expect(sound.cleanup).not.toHaveBeenCalled();
      await mockClient.media.resumeAllSounds();
      await vi.advanceTimersByTimeAsync(1499);
      expect(sound.cleanup).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(sound.cleanup).toHaveBeenCalledOnce();
    } finally { vi.useRealTimers(); }
  });

  it('keeps paused sounds available when resuming the audio context fails', async () => {
    const sound = createMockMusicSound('proxy/theme.ogg');
    mockCreateSound.mockResolvedValue(sound);
    await playMusic(handler, {});
    await mockClient.media.pauseAllSounds();
    vi.mocked(mockClient.media.cacophony.resume).mockRejectedValueOnce(new Error('Audio unavailable'));
    await expect(mockClient.media.resumeAllSounds()).rejects.toThrow('Audio unavailable');
    expect(mockClient.media.paused).toBe(true);
    expect(sound.resume).not.toHaveBeenCalled();
    await mockClient.media.resumeAllSounds();
    expect(sound.resume).toHaveBeenCalledOnce();
  });

  it('rolls a source pause failure back to a retryable playing state', async () => {
    const first = createMockMusicSound('first.ogg');
    const second = createMockMusicSound('second.ogg');
    mockCreateSound.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    await playMusic(handler, { name: 'first.ogg', key: 'first' });
    await playMusic(handler, { name: 'second.ogg', key: 'second' });
    const states: boolean[] = [];
    mockClient.media.subscribePlayback(() => states.push(mockClient.media.paused));
    second.pause.mockImplementationOnce(() => { throw new Error('Source pause failed'); });
    await expect(mockClient.media.pauseAllSounds()).rejects.toThrow('Source pause failed');
    expect(first.isPlaying).toBe(true);
    expect(second.isPlaying).toBe(true);
    expect(mockClient.media.paused).toBe(false);
    expect(states.at(-1)).toBe(false);
    expect(first.cleanup).not.toHaveBeenCalled();
    await mockClient.media.pauseAllSounds();
    expect(first.isPlaying).toBe(false);
    expect(second.isPlaying).toBe(false);
    expect(mockClient.media.paused).toBe(true);
  });

  it('repauses a partial source resume and retries without resuming independently paused music', async () => {
    const first = createMockMusicSound('first.ogg');
    const second = createMockMusicSound('second.ogg');
    const independent = createMockMusicSound('independent.ogg');
    mockCreateSound.mockResolvedValueOnce(first).mockResolvedValueOnce(second).mockResolvedValueOnce(independent);
    await playMusic(handler, { name: 'first.ogg', key: 'first' });
    await playMusic(handler, { name: 'second.ogg', key: 'second' });
    await playMusic(handler, { name: 'independent.ogg', key: 'independent' });
    handlers.pause?.({ action: 'pause' });
    await mockClient.media.pauseAllSounds();
    const states: boolean[] = [];
    mockClient.media.subscribePlayback(() => states.push(mockClient.media.paused));
    second.resume.mockImplementationOnce(() => { throw new Error('Source resume failed'); });
    await expect(mockClient.media.resumeAllSounds()).rejects.toThrow('Source resume failed');
    expect(first.isPlaying).toBe(false);
    expect(second.isPlaying).toBe(false);
    expect(mockClient.media.paused).toBe(true);
    expect(states.at(-1)).toBe(true);
    expect(mockClient.media.cacophony.pause).toHaveBeenCalledTimes(2);
    expect(independent.resume).not.toHaveBeenCalled();
    await mockClient.media.resumeAllSounds();
    expect(first.isPlaying).toBe(true);
    expect(second.isPlaying).toBe(true);
    expect(independent.isPlaying).toBe(false);
    expect(independent.resume).not.toHaveBeenCalled();
    expect(mockClient.media.paused).toBe(false);
  });

  it('retains a pending incoming start through failure and resumes it on retry', async () => {
    const existing = createMockMusicSound('existing.ogg');
    const incoming = createMockMusicSound('incoming.ogg');
    mockCreateSound.mockResolvedValueOnce(existing).mockResolvedValueOnce(incoming);
    await playMusic(handler, { name: 'existing.ogg', key: 'existing' });
    await mockClient.media.pauseAllSounds();
    await playMusic(handler, { name: 'incoming.ogg', key: 'incoming' });
    incoming.playbacks[0].play.mockImplementationOnce(() => { throw new Error('Start failed'); });
    await expect(mockClient.media.resumeAllSounds()).rejects.toThrow('Start failed');
    expect(existing.isPlaying).toBe(false);
    expect(mockClient.media.paused).toBe(true);
    expect(incoming.cleanup).not.toHaveBeenCalled();
    await mockClient.media.resumeAllSounds();
    expect(incoming.playbacks[0].play).toHaveBeenCalledTimes(2);
    expect(incoming.isPlaying).toBe(true);
    expect(existing.isPlaying).toBe(true);
    expect(mockClient.media.paused).toBe(false);
  });

  it('suspends all surviving sources if rolling back a partial pause cannot resume the context', async () => {
    const first = createMockMusicSound('first.ogg');
    const second = createMockMusicSound('second.ogg');
    const third = createMockMusicSound('third.ogg');
    mockCreateSound.mockResolvedValueOnce(first).mockResolvedValueOnce(second).mockResolvedValueOnce(third);
    await playMusic(handler, { name: 'first.ogg', key: 'first' });
    await playMusic(handler, { name: 'second.ogg', key: 'second' });
    await playMusic(handler, { name: 'third.ogg', key: 'third' });
    second.pause.mockImplementationOnce(() => { throw new Error('Source pause failed'); });
    vi.mocked(mockClient.media.cacophony.resume).mockRejectedValueOnce(new Error('Context unavailable'));
    await expect(mockClient.media.pauseAllSounds()).rejects.toThrow('Source pause failed');
    expect(mockClient.media.paused).toBe(true);
    expect(mockClient.media.cacophony.pause).toHaveBeenCalledOnce();
    expect(third.isPlaying).toBe(false);
    await mockClient.media.resumeAllSounds();
    expect(first.isPlaying).toBe(true);
    expect(second.isPlaying).toBe(true);
    expect(third.isPlaying).toBe(true);
    expect(mockClient.media.paused).toBe(false);
  });

  it('retries an incoming source that started before a later failure from its paused cursor', async () => {
    const first = createMockMusicSound('first.ogg');
    const second = createMockMusicSound('second.ogg');
    mockCreateSound.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    await mockClient.media.pauseAllSounds();
    await playMusic(handler, { name: 'first.ogg', key: 'first' });
    await playMusic(handler, { name: 'second.ogg', key: 'second' });
    second.playbacks[0].play.mockImplementationOnce(() => { throw new Error('Start failed'); });
    await expect(mockClient.media.resumeAllSounds()).rejects.toThrow('Start failed');
    expect(first.isPlaying).toBe(false);
    await mockClient.media.resumeAllSounds();
    expect(first.playbacks[0].play).toHaveBeenCalledOnce();
    expect(first.resume).toHaveBeenCalledOnce();
    expect(first.isPlaying).toBe(true);
    expect(second.isPlaying).toBe(true);
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

  it('clears the session on media service shutdown (disconnect)', async () => {
    mockCreateSound.mockResolvedValue(createMockMusicSound('proxy/theme.ogg'));
    await playMusic(handler, {});

    mockClient.media.shutdown();
    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe('none');
  });
});
