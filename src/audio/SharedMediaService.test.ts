import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedClock } from '../timing/SharedClock';
import type { MediaTransport } from '../midi/score';
import {
  SharedMediaService,
  type SharedMediaPresentation,
  type SharedMediaVoice,
} from './SharedMediaService';
import type { MediaSyncRequest } from './SharedMediaPayload';

describe('shared file transport', () => {
  let now: number, clock: SharedClock, service: SharedMediaService, transport: MediaTransport;
  let requests: MediaSyncRequest[],
    presentations: (SharedMediaPresentation | { key: string; removed: true })[];
  let voice: SharedMediaVoice, cursor: number;
  let correction: number;
  let errors: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.useFakeTimers();
    now = 10000;
    cursor = 0;
    correction = 0;
    errors = vi.fn();
    requests = [];
    presentations = [];
    clock = new SharedClock(
      () => {},
      () => now,
    );
    clock.setLocalMapping({ clockId: 'runtime', performanceNowMs: 0, serverNowMs: 0 });
    transport = {
      version: 1,
      kind: 'media',
      clockId: 'runtime',
      sourceId: 'source',
      revision: 1,
      state: 'playing',
      anchorServerMs: 0,
      positionMs: 0,
      durationMs: 600000,
      rate: 1,
      mode: 'finite',
      discontinuity: 0,
    };
    voice = {
      supportsClipLoop: true,
      prepareSeek: vi.fn(async (seconds) => {
        cursor = seconds;
      }),
      currentTime: () => cursor,
      start: vi.fn(),
      pause: vi.fn(),
      dispose: vi.fn(),
    };
    service = new SharedMediaService({
      clock,
      context: { state: 'running', currentTime: 5 } as BaseAudioContext,
      now: () => now,
      correctionMs: () => correction,
      sendSync: (r) => requests.push(r),
      present: (p) => presentations.push(p),
      error: errors,
    });
  });
  afterEach(() => {
    service.shutdown();
    clock.shutdown();
    vi.useRealTimers();
  });
  const flush = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve();
  };
  const grant = () => ({ key: 'tv', name: 'movie.mp4', type: 'music', transport });
  async function join() {
    const pending = service.attach(grant(), () => voice);
    await flush();
    expect(requests).toHaveLength(1);
    service.receiveSync({ ...requests[0], transport });
    await pending;
  }
  it('loads silently, then seeks to a fresh snapshot after preparation time', async () => {
    const pending = service.attach(grant(), () => voice);
    await flush();
    expect(voice.start).not.toHaveBeenCalled();
    expect(cursor).toBe(10);
    now = 12000;
    service.receiveSync({ ...requests[0], transport });
    await pending;
    expect(cursor).toBe(12.25);
    expect(voice.start).toHaveBeenCalledOnce();
  });
  it('paused entry remains silent and displays only the current caption', async () => {
    transport = { ...transport, state: 'paused', positionMs: 5000 };
    const pending = service.attach(
      {
        ...grant(),
        cueWindows: [
          {
            seq: 0,
            fromMs: 0,
            toMs: 10000,
            cues: [
              { id: 'ended', startMs: 0, endMs: 5000, text: 'old' },
              { id: 'current', startMs: 5000, endMs: 6000, text: 'current' },
            ],
          },
        ],
      },
      () => voice,
    );
    await flush();
    service.receiveSync({ ...requests[0], transport });
    await pending;
    expect(voice.start).not.toHaveBeenCalled();
    expect(cursor).toBe(5);
    expect(presentations.at(-1)).toMatchObject({ state: 'paused', cues: [{ id: 'current' }] });
  });
  it('repeated Play and same-revision cue replenishment never reattack', async () => {
    await join();
    const factory = vi.fn(() => voice);
    await service.attach(grant(), factory);
    service.update({
      key: 'tv',
      transport,
      cueWindows: [
        {
          seq: 1,
          fromMs: 10000,
          toMs: 20000,
          cues: [{ id: 'one', startMs: 10000, endMs: 11000, text: 'hello' }],
        },
      ],
    });
    expect(factory).not.toHaveBeenCalled();
    expect(voice.start).toHaveBeenCalledOnce();
    expect(presentations.at(-1)).toMatchObject({ cues: [{ id: 'one' }] });
  });
  it('Stop cancels a preparation and ignores a later snapshot', async () => {
    const pending = service.attach(grant(), () => voice);
    await flush();
    const request = requests[0];
    service.stop({ key: 'tv' });
    await pending;
    expect(service.receiveSync({ ...request, transport })).toBe(false);
    expect(voice.start).not.toHaveBeenCalled();
    expect(voice.dispose).toHaveBeenCalledOnce();
  });
  it('old Sync cannot undo an authoritative seek or grant another source', async () => {
    const pending = service.attach(grant(), () => voice);
    await flush();
    const request = requests[0];
    const seek = { ...transport, revision: 2, state: 'paused' as const, positionMs: 90000 };
    service.update({ key: 'tv', transport: seek });
    await flush();
    await pending;
    expect(service.receiveSync({ ...request, transport })).toBe(false);
    expect(cursor).toBe(90);
    service.update({ key: 'tv', transport: { ...seek, sourceId: 'other', revision: 3 } });
    expect(service.has('other')).toBe(false);
    expect(cursor).toBe(90);
  });
  it('local pause retains ownership and resume requests the current cursor', async () => {
    await join();
    service.localPause('tv');
    now = 30000;
    const resume = service.localResume('tv');
    await flush();
    expect(requests).toHaveLength(2);
    service.receiveSync({ ...requests[1], transport });
    await resume;
    expect(cursor).toBe(30.25);
    expect(voice.start).toHaveBeenCalledTimes(2);
  });
  it('new runtime revokes old source instead of reinterpreting monotonic time', async () => {
    await join();
    clock.setLocalMapping({ clockId: 'new-runtime', performanceNowMs: 0, serverNowMs: 200 });
    expect(service.has('tv')).toBe(false);
    expect(voice.dispose).toHaveBeenCalledOnce();
  });
  it('live joins never seek and future finite starts carry absolute audio time', async () => {
    transport = { ...transport, mode: 'live', durationMs: undefined };
    await join();
    expect(voice.prepareSeek).not.toHaveBeenCalled();
    service.reset();
    requests = [];
    now = 11000;
    transport = {
      ...transport,
      sourceId: 'future',
      mode: 'finite',
      durationMs: 600000,
      anchorServerMs: 12000,
      positionMs: 5000,
    };
    await join();
    expect(cursor).toBe(5);
    expect(voice.start).toHaveBeenLastCalledWith(
      expect.objectContaining({ at: 6, rate: 1, offsetSeconds: 5 }),
    );
  });
  it('loop captions use unwrapped positions and no caption appears before a future anchor', async () => {
    transport = {
      ...transport,
      positionMs: 3500,
      anchorServerMs: 20000,
      loop: { startMs: 1000, endMs: 3000, plays: -1 },
    };
    const pending = service.attach(
      {
        ...grant(),
        cueWindows: [
          {
            seq: 0,
            fromMs: 3000,
            toMs: 6000,
            cues: [{ id: 'occurrence2', startMs: 3500, endMs: 4000, text: 'second pass' }],
          },
        ],
      },
      () => voice,
    );
    await flush();
    service.receiveSync({ ...requests[0], transport });
    await pending;
    expect(presentations.at(-1)).toMatchObject({ cues: [] });
    now = 20000;
    await vi.advanceTimersByTimeAsync(100);
    expect(presentations.at(-1)).toMatchObject({ cues: [{ id: 'occurrence2' }] });
  });
  it('autoplay unlock reacquires a snapshot and never starts from the denied cursor', async () => {
    vi.mocked(voice.start).mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'));
    await join();
    expect(presentations.at(-1)).toMatchObject({ state: 'unavailable' });
    now = 30000;
    const resume = service.localResume('tv');
    await flush();
    service.receiveSync({ ...requests[1], transport });
    await resume;
    expect(cursor).toBe(30.25);
    expect(presentations.at(-1)).toMatchObject({ state: 'playing' });
  });
  it('a clock jump cancels queued work and seeks against a fresh snapshot in the same runtime', async () => {
    await join();
    now = 12000;
    clock.setLocalMapping({ clockId: 'runtime', performanceNowMs: 0, serverNowMs: 50 });
    await flush();
    expect(voice.pause).toHaveBeenCalled();
    expect(requests).toHaveLength(2);
    service.receiveSync({ ...requests[1], transport });
    await flush();
    expect(cursor).toBe(12.3);
    expect(voice.start).toHaveBeenCalledTimes(2);
  });
  it('voice replacement retains its grant but stops and disposes only the replaced sink', async () => {
    await join();
    now = 12000;
    const replacement = {
      ...voice,
      prepareSeek: vi.fn(async (seconds: number) => {
        cursor = seconds;
      }),
      start: vi.fn(),
      dispose: vi.fn(),
    };
    const pending = service.attach(grant(), () => replacement, true);
    await flush();
    service.receiveSync({ ...requests[1], transport });
    await pending;
    expect(service.has('tv')).toBe(true);
    expect(voice.dispose).toHaveBeenCalledOnce();
    expect(replacement.start).toHaveBeenCalledOnce();
  });
  it.each([-500, 500])(
    'applies signed local correction %sms once at a late entry',
    async (value) => {
      correction = value;
      await join();
      expect(cursor).toBe(value < 0 ? 10.75 : 10.25);
      expect(voice.start).toHaveBeenLastCalledWith(
        expect.objectContaining({
          at: value < 0 ? 5.25 : 5.75,
          rate: 1,
          offsetSeconds: value < 0 ? 10.75 : 10.25,
        }),
      );
    },
  );
  it('suspension cancels owned work and restoration rejoins the continuing cursor', async () => {
    await join();
    service.setSuspended(true);
    expect(voice.pause).toHaveBeenCalled();
    now = 30000;
    service.setSuspended(false);
    await flush();
    service.receiveSync({ ...requests[1], transport });
    await flush();
    expect(cursor).toBe(30.25);
    expect(voice.start).toHaveBeenCalledTimes(2);
  });
  it('recovers a missing cue-window baseline through one bounded correlated Sync', async () => {
    const initial = { seq: 0, fromMs: 0, toMs: 11000, cues: [] };
    const pending = service.attach({ ...grant(), cueWindows: [initial] }, () => voice);
    await flush();
    service.receiveSync({ ...requests[0], transport, cueWindows: [initial] });
    await pending;
    now = 22000;
    const current = {
      seq: 2,
      fromMs: 20000,
      toMs: 30000,
      cues: [{ id: 'current', startMs: 22000, endMs: 23000, text: 'Current line' }],
    };
    service.update({ key: 'tv', transport, cueWindows: [current] });
    service.update({ key: 'tv', transport, cueWindows: [current] });
    await flush();
    expect(requests).toHaveLength(2);
    expect(presentations.at(-1)).not.toMatchObject({ cues: [{ id: 'current' }] });
    service.receiveSync({ ...requests[1], transport, cueWindows: [current] });
    await flush();
    expect(presentations.at(-1)).toMatchObject({ cues: [{ id: 'current' }] });
    expect(voice.start).toHaveBeenCalledOnce();
  });
  it('pause revisions carry cue windows; a seek replaces windows under a new discontinuity', async () => {
    transport = { ...transport, state: 'paused', positionMs: 5000 };
    const cue = { id: 'current', startMs: 4000, endMs: 6000, text: 'Current line' };
    const initial = { seq: 0, fromMs: 0, toMs: 10000, cues: [cue] };
    const pending = service.attach({ ...grant(), cueWindows: [initial] }, () => voice);
    await flush();
    service.receiveSync({ ...requests[0], transport });
    await pending;
    service.update({ key: 'tv', transport: { ...transport, revision: 2 } });
    await flush();
    expect(presentations.at(-1)).toMatchObject({
      discontinuity: 0,
      cues: [cue],
      retainedCueIds: ['current'],
    });
    service.update({
      key: 'tv',
      transport: { ...transport, revision: 3, discontinuity: 1 },
      cueWindows: [{ ...initial, seq: 1 }],
    });
    await flush();
    expect(presentations.at(-1)).toMatchObject({ discontinuity: 1, cues: [cue] });
    service.update({ key: 'tv', transport, cueWindows: [initial] });
    await flush();
    expect(presentations.at(-1)).toMatchObject({ discontinuity: 1 });
  });
  it('a seek without cue windows hides cached captions until Sync covers the new cursor', async () => {
    transport = { ...transport, state: 'paused', positionMs: 5000 };
    const cue = { id: 'current', startMs: 4000, endMs: 6000, text: 'Cached line' };
    const initial = { seq: 0, fromMs: 0, toMs: 10000, cues: [cue] };
    const pending = service.attach({ ...grant(), cueWindows: [initial] }, () => voice);
    await flush();
    service.receiveSync({ ...requests[0], transport });
    await pending;
    expect(presentations.at(-1)).toMatchObject({ cues: [cue] });
    now = 12000;
    const seek = { ...transport, revision: 2, discontinuity: 1 };
    service.update({ key: 'tv', transport: seek });
    await flush();
    expect(presentations.at(-1)).toMatchObject({ discontinuity: 1, cues: [] });
    expect(requests).toHaveLength(2);
    service.receiveSync({ ...requests[1], transport: seek, cueWindows: [{ ...initial, seq: 1 }] });
    await flush();
    expect(presentations.at(-1)).toMatchObject({ discontinuity: 1, cues: [cue] });
  });
  it('preparation ticks neither erase preparing status nor publish captions early', async () => {
    let prepared!: () => void;
    voice.prepareSeek = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          prepared = resolve;
        }),
    );
    const pending = service.attach(
      {
        ...grant(),
        cueWindows: [
          {
            seq: 0,
            fromMs: 0,
            toMs: 30000,
            cues: [{ id: 'now', startMs: 0, endMs: 30000, text: 'Do not read before ready' }],
          },
        ],
      },
      () => voice,
    );
    await flush();
    await vi.advanceTimersByTimeAsync(500);
    expect(presentations.at(-1)).toMatchObject({ state: 'preparing', cues: [] });
    service.stop({ key: 'tv' });
    prepared();
    await pending;
  });
  it('a paused preparation error survives display ticks', async () => {
    transport = { ...transport, state: 'paused' };
    voice.prepareSeek = vi.fn(async () => {
      throw new Error('Seek unavailable');
    });
    await service.attach(grant(), () => voice);
    await vi.advanceTimersByTimeAsync(500);
    expect(presentations.at(-1)).toMatchObject({
      state: 'unavailable',
      message: 'Seek unavailable',
    });
  });
  it('retries a lost snapshot without classifying it as a seek failure', async () => {
    const pending = service.attach(grant(), () => voice);
    await flush();
    now = 12000;
    await vi.advanceTimersByTimeAsync(2000);
    expect(requests).toHaveLength(2);
    service.receiveSync({ ...requests[1], transport });
    await pending;
    expect(errors).not.toHaveBeenCalled();
    expect(voice.start).toHaveBeenCalledOnce();
  });
  it('future anchors do not consume the preparation/start deadline', async () => {
    let started!: () => void;
    voice.start = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          started = resolve;
        }),
    );
    transport = { ...transport, anchorServerMs: 40000 };
    const pending = service.attach(grant(), () => voice);
    await flush();
    service.receiveSync({ ...requests[0], transport });
    await flush();
    now = 26000;
    await vi.advanceTimersByTimeAsync(16000);
    expect(presentations.at(-1)).toMatchObject({ state: 'preparing' });
    expect(voice.pause).not.toHaveBeenCalled();
    now = 40000;
    started();
    await pending;
    expect(presentations.at(-1)).toMatchObject({ state: 'playing' });
  });
  it('retains an audible sink during replacement preparation and retires it after acceptance', async () => {
    await join();
    now = 12000;
    let accept!: () => void;
    const retirement = vi.fn(async () => {});
    voice.retire = retirement;
    const replacement = {
      ...voice,
      start: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            accept = resolve;
          }),
      ),
      dispose: vi.fn(),
    };
    const pending = service.attach(grant(), () => replacement, true);
    await flush();
    expect(voice.pause).not.toHaveBeenCalled();
    expect(voice.dispose).not.toHaveBeenCalled();
    service.receiveSync({ ...requests[1], transport });
    await flush();
    expect(voice.dispose).not.toHaveBeenCalled();
    accept();
    await pending;
    await flush();
    expect(retirement).toHaveBeenCalledWith(5.25);
    expect(voice.dispose).toHaveBeenCalledOnce();
  });
  it('failed replacement restores the still-audible sink without pausing it', async () => {
    await join();
    now = 12000;
    const replacement = {
      ...voice,
      prepareSeek: vi.fn(async () => {
        throw new Error('Replacement unavailable');
      }),
      pause: vi.fn(),
      dispose: vi.fn(),
    };
    await service.attach(grant(), () => replacement, true);
    expect(voice.pause).not.toHaveBeenCalled();
    expect(voice.dispose).not.toHaveBeenCalled();
    expect(replacement.dispose).toHaveBeenCalledOnce();
    expect(presentations.at(-1)).toMatchObject({ state: 'playing' });
  });
  it('native loop boundaries and terminal stop are scheduled once rather than polled', async () => {
    transport = {
      ...transport,
      anchorServerMs: now,
      positionMs: 1500,
      loop: { startMs: 1000, endMs: 3000, plays: 2 },
    };
    await join();
    expect(voice.start).toHaveBeenCalledWith(
      expect.objectContaining({
        loopRegion: { startSeconds: 1, endSeconds: 3 },
        stopAt: 8.5,
      }),
    );
    now += 2100;
    await vi.advanceTimersByTimeAsync(2100);
    expect(voice.start).toHaveBeenCalledOnce();
    expect(voice.pause).not.toHaveBeenCalled();
  });
  it('explicitly refuses HTML clip loops before preparing or playing', async () => {
    voice = { ...voice, supportsClipLoop: false };
    transport = { ...transport, loop: { startMs: 1000, endMs: 3000, plays: -1 } };
    await service.attach(grant(), () => voice);
    expect(voice.prepareSeek).not.toHaveBeenCalled();
    expect(voice.start).not.toHaveBeenCalled();
    expect(errors).toHaveBeenCalledWith(
      'tv',
      expect.any(String),
      transport,
      'CAPABILITY_UNAVAILABLE',
    );
  });
  it('resamples the output mapping after a slow seek and grows the future preparation lead', async () => {
    service.shutdown();
    const context = Object.assign(new EventTarget(), {
      state: 'running',
      currentTime: 5,
    });
    Object.defineProperty(context, 'currentTime', { get: () => 5 + (now - 10000) / 1000 });
    service = new SharedMediaService({
      clock,
      context: context as unknown as BaseAudioContext,
      now: () => now,
      sendSync: (request) => requests.push(request),
    });
    voice.prepareSeek = vi.fn(async (seconds) => {
      cursor = seconds;
      now += 400;
    });
    await join();
    expect(voice.prepareSeek).toHaveBeenCalledTimes(3);
    expect(cursor).toBe(11.3);
    expect(voice.start).toHaveBeenCalledWith(
      expect.objectContaining({ at: 6.3, offsetSeconds: 11.3 }),
    );
    expect(6.3 - context.currentTime).toBeGreaterThan(0.02);
  });
  it('prepares a fresh snapshot loop topology before seeking beyond the previous clip', async () => {
    transport = {
      ...transport,
      state: 'paused',
      positionMs: 1500,
      loop: { startMs: 1000, endMs: 3000, plays: -1 },
    };
    let clipEnd = Infinity;
    voice.prepareTransport = vi.fn((next) => {
      clipEnd = next.loop?.endMs ?? Infinity;
    });
    voice.prepareSeek = vi.fn(async (seconds) => {
      if (seconds * 1000 >= clipEnd) throw new Error('Old clip bounds');
      cursor = seconds;
    });
    const pending = service.attach(grant(), () => voice);
    await flush();
    const fresh = {
      ...transport,
      revision: 2,
      positionMs: 4500,
      loop: { startMs: 4000, endMs: 5000, plays: -1 },
    };
    service.receiveSync({ ...requests[0], transport: fresh });
    await pending;
    expect(cursor).toBe(4.5);
    expect(errors).not.toHaveBeenCalled();
    expect(presentations.at(-1)).toMatchObject({ state: 'paused' });
  });
  it.each([1, 2])(
    'accepts350ms output latency at rate%s while correcting a genuine stall',
    async (rate) => {
      service.shutdown();
      const context = Object.assign(new EventTarget(), {
        state: 'running',
        currentTime: 5,
        getOutputTimestamp: () => ({
          contextTime: 5 + (now - 10000) / 1000 - 0.35,
          performanceTime: now,
        }),
      });
      Object.defineProperty(context, 'currentTime', { get: () => 5 + (now - 10000) / 1000 });
      service = new SharedMediaService({
        clock,
        context: context as unknown as BaseAudioContext,
        now: () => now,
        sendSync: (request) => requests.push(request),
      });
      transport = { ...transport, rate };
      await join();
      now = 20000;
      cursor = 20.35 * rate;
      await vi.advanceTimersByTimeAsync(100);
      service.receiveSync({ ...requests[1], transport });
      await flush();
      expect(voice.start).toHaveBeenCalledOnce();
      now = 30000;
      cursor = 29.35 * rate;
      await vi.advanceTimersByTimeAsync(100);
      service.receiveSync({ ...requests[2], transport });
      await flush();
      expect(voice.start).toHaveBeenCalledTimes(2);
    },
  );
  it('rejects discontinuity and immutable cue edits before changing a retiring audible mix', async () => {
    const initial = {
      seq: 0,
      fromMs: 0,
      toMs: 30000,
      cues: [{ id: 'line', startMs: 0, endMs: 30000, text: 'Original' }],
    };
    const joined = service.attach({ ...grant(), cueWindows: [initial] }, () => voice);
    await flush();
    service.receiveSync({ ...requests[0], transport });
    await joined;
    voice.updateMix = vi.fn();
    now = 12000;
    const candidate = { ...voice, updateMix: vi.fn(), pause: vi.fn(), dispose: vi.fn() };
    const pending = service.attach(grant(), () => candidate, true);
    await flush();
    expect(() =>
      service.update({ key: 'tv', transport: { ...transport, discontinuity: 1 } }),
    ).toThrow();
    expect(() =>
      service.update({
        key: 'tv',
        transport,
        cueWindows: [{ ...initial, cues: [{ ...initial.cues[0], text: 'Edited' }] }],
      }),
    ).toThrow();
    expect(voice.updateMix).not.toHaveBeenCalled();
    service.stop({ key: 'tv' });
    await pending;
  });
});
