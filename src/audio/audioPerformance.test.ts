import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureAudioPerformance, readAudioPerformance } from './audioPerformance';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('audio performance capture', () => {
  it('reads native counters in seconds and labels missing measurements unavailable', () => {
    const reading = readAudioPerformance(
      {
        state: 'running',
        currentTime: 3,
        sampleRate: 48000,
        outputLatency: 0.02,
        playbackStats: { underrunEvents: 8, underrunDuration: 0.4, totalDuration: 20 },
      },
      [{ isPlaying: true, playbacks: [{}] }],
    );
    expect(reading).toMatchObject({
      contextState: 'running',
      outputLatencyMs: 20,
      baseLatencyMs: null,
      underrunEvents: 8,
      underrunSeconds: 0.4,
      totalSeconds: 20,
      playingMediaSounds: 1,
      mediaPlaybacks: 1,
    });
    expect(readAudioPerformance({ currentTime: NaN }, [])).toMatchObject({
      audioTime: null,
      underrunEvents: null,
    });
  });

  it('collects UI tasks only while recording and releases all observation on stop', () => {
    vi.useFakeTimers();
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    let deliver!: (list: { getEntries(): { duration: number }[] }) => void;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'PerformanceObserver',
      class {
        static supportedEntryTypes = ['longtask'];
        constructor(callback: typeof deliver) {
          deliver = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    const receive = vi.fn();
    const stop = captureAudioPerformance(() => readAudioPerformance({}, []), receive);
    deliver({ getEntries: () => [{ duration: 70 }, { duration: 100 }] });
    now = 1200;
    vi.advanceTimersByTime(1000);
    expect(receive.mock.calls.at(-1)?.[0]).toMatchObject({
      timerDelayMs: 200,
      longTasks: 2,
      longestTaskMs: 100,
    });
    stop();
    vi.advanceTimersByTime(3000);
    expect(receive).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('does not report background throttling as a UI stall', () => {
    vi.useFakeTimers();
    let now = 0;
    let hidden = false;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    const receive = vi.fn();
    const stop = captureAudioPerformance(() => readAudioPerformance({}, []), receive);
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    now = 10000;
    vi.advanceTimersByTime(1000);
    expect(receive.mock.calls.at(-1)?.[0].timerDelayMs).toBeNull();
    stop();
  });
});
