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
  beforeEach(() => {
    vi.useFakeTimers();
    now = 10000;
    cursor = 0;
    correction = 0;
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
    };
    voice = {
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
    expect(cursor).toBe(12);
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
    expect(cursor).toBe(30);
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
    expect(voice.start).toHaveBeenLastCalledWith({ at: 6, rate: 1, offsetSeconds: 5 });
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
    expect(cursor).toBe(30);
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
    expect(cursor).toBe(12.05);
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
      expect(cursor).toBe(value < 0 ? 10.5 : 10);
      expect(voice.start).toHaveBeenLastCalledWith({
        at: value < 0 ? 5 : 5.5,
        rate: 1,
        offsetSeconds: value < 0 ? 10.5 : 10,
      });
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
    expect(cursor).toBe(30);
    expect(voice.start).toHaveBeenCalledTimes(2);
  });
});
