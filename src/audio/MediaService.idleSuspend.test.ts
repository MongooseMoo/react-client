import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaService } from './MediaService';

type MockCacophony = ConstructorParameters<typeof MediaService>[0];

const IDLE_SUSPEND_MS = 5 * 60 * 1000;

function makeMasterBus() {
  return {
    name: 'master',
    input: {},
    output: { gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } },
    addFilter: vi.fn(),
    removeFilter: vi.fn(),
    destroy: vi.fn(),
    destroyed: false,
    gain: 1,
  };
}

function createMockSound(url: string, order: string[]) {
  const playback = { connect: vi.fn(), disconnect: vi.fn(), duration: 5, stereoPan: 0 };
  const sound = {
    cleanup: vi.fn(),
    isPlaying: false,
    key: undefined as string | undefined,
    loop: vi.fn(),
    on: vi.fn(() => () => undefined),
    play: vi.fn(() => {
      order.push('play');
      sound.isPlaying = true;
      return [playback];
    }),
    playbacks: [playback],
    position: [0, 0, 0],
    routeTo: vi.fn(),
    seek: vi.fn(),
    stereoPan: 0,
    url,
    volume: 1,
  };
  return sound;
}

function createHarness() {
  const order: string[] = [];
  const master = makeMasterBus();
  const sounds: ReturnType<typeof createMockSound>[] = [];
  const cacophony = {
    context: { currentTime: 100, sampleRate: 48000 },
    createSound: vi.fn(async (url: string) => {
      order.push('createSound');
      const sound = createMockSound(url, order);
      sounds.push(sound);
      return sound;
    }),
    getBus: vi.fn(() => master),
    listenerForwardOrientation: [0, 0, -1],
    listenerUpOrientation: [0, 1, 0],
    listenerPosition: [0, 0, 0],
    locked: false,
    muted: false,
    setGlobalVolume: vi.fn(),
    pause: vi.fn(async () => {
      order.push('pause');
    }),
    resume: vi.fn(async () => {
      order.push('resume');
    }),
  };
  const media = new MediaService(cacophony as unknown as MockCacophony, { manageFocus: false });
  return { cacophony, media, order, sounds };
}

const playPayload = { name: 'ding.ogg', url: 'https://example.test/' };

describe('MediaService idle suspend', () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    harness = createHarness();
  });

  afterEach(() => {
    harness.media.shutdown();
    vi.useRealTimers();
  });

  it('suspends the context after the idle period with nothing playing', async () => {
    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS);

    expect(harness.cacophony.pause).toHaveBeenCalledOnce();
  });

  it('does not suspend while a sound is playing', async () => {
    await harness.media.play(playPayload);
    expect(harness.sounds[0].isPlaying).toBe(true);

    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS * 2);

    expect(harness.cacophony.pause).not.toHaveBeenCalled();
  });

  it('suspends once a finished sound is stopped', async () => {
    await harness.media.play(playPayload);
    harness.media.stop({ name: 'ding.ogg' });

    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS);

    expect(harness.cacophony.pause).toHaveBeenCalledOnce();
  });

  it('does not suspend while a wake hold is held, and suspends after it is released', async () => {
    harness.media.acquireWakeHold('livekit-voice');

    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS * 2);
    expect(harness.cacophony.pause).not.toHaveBeenCalled();

    harness.media.releaseWakeHold('livekit-voice');
    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS);

    expect(harness.cacophony.pause).toHaveBeenCalledOnce();
  });

  it('waits out a pending automation ramp before suspending', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Ramp outlives the idle period, so the suspend has to be deferred until it has run:
    // AudioContext.currentTime freezes while suspended and the ramp would never complete.
    harness.media.automate({ target: 'gain', params: { gain: 0.5 }, ramp: IDLE_SUSPEND_MS * 2 });

    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS);
    expect(harness.cacophony.pause).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS);
    expect(harness.cacophony.pause).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('resumes exactly once for concurrent ensureAwake callers', async () => {
    let releaseResume: (() => void) | undefined;
    harness.cacophony.resume.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          releaseResume = () => resolve();
        }),
    );
    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS);
    expect(harness.cacophony.pause).toHaveBeenCalledOnce();

    const awakened = Promise.all([harness.media.ensureAwake(), harness.media.ensureAwake()]);
    releaseResume?.();
    await awakened;

    expect(harness.cacophony.resume).toHaveBeenCalledOnce();
  });

  it('resumes a suspended context before playing', async () => {
    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS);
    expect(harness.order).toEqual(['pause']);

    await harness.media.play(playPayload);

    expect(harness.order).toEqual(['pause', 'resume', 'createSound', 'play']);
  });

  it('does not resume a context that is already running', async () => {
    await harness.media.play(playPayload);

    expect(harness.cacophony.resume).not.toHaveBeenCalled();
  });

  it('stops the idle timer on shutdown', async () => {
    harness.media.shutdown();

    await vi.advanceTimersByTimeAsync(IDLE_SUSPEND_MS * 2);

    expect(harness.cacophony.pause).not.toHaveBeenCalled();
  });
});
