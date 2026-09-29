import { describe, expect, it, vi } from 'vitest';

import {
  AUDIO_DIAGNOSTIC_CAPACITY,
  AUDIO_ERROR_CODES,
  AUDIO_STAGES,
  AudioDiagnosticsRing,
  classifyLoadError,
  formatAudioDiagnostics,
  sanitizeMediaText,
  sanitizeMediaUrl,
} from './audioDiagnostics';

describe('audio diagnostics vocabulary', () => {
  it('names the chunk 10 stages and error codes in order', () => {
    expect(AUDIO_STAGES).toEqual([
      'received',
      'validated',
      'loading',
      'decoded',
      'routed',
      'started',
      'stopped',
      'released',
    ]);
    expect(AUDIO_ERROR_CODES).toEqual([
      'INVALID_PAYLOAD',
      'CAPABILITY_UNAVAILABLE',
      'FETCH_FAILED',
      'DECODE_FAILED',
      'REGION_OUT_OF_RANGE',
      'SEEK_UNAVAILABLE',
      'STALE_GENERATION',
      'CAPACITY',
    ]);
  });
});

describe('AudioDiagnosticsRing', () => {
  it('holds at most 500 entries, dropping the oldest first', () => {
    expect(AUDIO_DIAGNOSTIC_CAPACITY).toBe(500);
    const ring = new AudioDiagnosticsRing({ now: () => 1 });
    for (let i = 0; i < 510; i += 1) {
      ring.record({ stage: 'received', key: `k${i}` });
    }
    const entries = ring.entries();
    expect(entries).toHaveLength(500);
    expect(entries[0].key).toBe('k10');
    expect(entries[499].key).toBe('k509');
    expect(entries[0].seq).toBe(11);
    expect(entries[499].seq).toBe(510);
  });

  it('stamps entries with monotonic time and a rising sequence number', () => {
    let clock = 100;
    const ring = new AudioDiagnosticsRing({ now: () => clock });
    ring.record({ stage: 'loading', key: 'a', generation: 2, category: 'effects' });
    clock = 105.5;
    ring.record({ stage: 'decoded', key: 'a', generation: 2, category: 'effects' });
    const [first, second] = ring.entries();
    expect(first).toMatchObject({ seq: 1, time: 100, stage: 'loading', generation: 2 });
    expect(second).toMatchObject({ seq: 2, time: 105.5, stage: 'decoded' });
  });

  it('keeps catalog ids, the error code, and shared-media timing', () => {
    const ring = new AudioDiagnosticsRing({ now: () => 0 });
    ring.record({
      stage: 'started',
      key: 'tv',
      catalog: { soundId: 's1', assetId: 'a2', segmentId: 'g3' },
      shared: {
        revision: 4,
        rttMs: 80,
        targetCursorMs: 242000,
        actualCursorMs: 241900,
        driftMs: -100,
        phase: 'seeked',
      },
    });
    ring.record({ stage: 'loading', key: 'tv', error: { code: 'FETCH_FAILED', message: 'boom' } });
    const [started, failed] = ring.entries();
    expect(started.catalog).toEqual({ soundId: 's1', assetId: 'a2', segmentId: 'g3' });
    expect(started.shared?.phase).toBe('seeked');
    expect(failed.error).toEqual({ code: 'FETCH_FAILED', message: 'boom' });
  });

  it('strips credentials, queries and fragments from keys, names and messages', () => {
    const ring = new AudioDiagnosticsRing({ now: () => 0 });
    ring.record({
      stage: 'loading',
      key: 'https://user:secret@cdn.example/a.ogg?sig=abc#t=3',
      name: 'a.ogg?token=xyz',
      error: {
        code: 'FETCH_FAILED',
        message: "Failed to fetch 'https://u:p@cdn.example/a.ogg?sig=abc' (403)",
      },
    });
    const [entry] = ring.entries();
    expect(entry.key).toBe('https://cdn.example/a.ogg');
    expect(entry.name).toBe('a.ogg');
    expect(entry.error?.message).toBe("Failed to fetch 'https://cdn.example/a.ogg' (403)");
    expect(JSON.stringify(entry)).not.toMatch(/secret|sig=|token|u:p@/);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const ring = new AudioDiagnosticsRing({ now: () => 0 });
    const listener = vi.fn();
    const unsubscribe = ring.subscribe(listener);
    ring.record({ stage: 'received' });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    ring.record({ stage: 'received' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('clears entries but keeps counting sequence numbers', () => {
    const ring = new AudioDiagnosticsRing({ now: () => 0 });
    const listener = vi.fn();
    ring.subscribe(listener);
    ring.record({ stage: 'received' });
    ring.clear();
    expect(ring.entries()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
    ring.record({ stage: 'received' });
    expect(ring.entries()[0].seq).toBe(2);
  });

  it('returns a stable snapshot until the next change', () => {
    const ring = new AudioDiagnosticsRing({ now: () => 0 });
    ring.record({ stage: 'received' });
    const snapshot = ring.entries();
    expect(ring.entries()).toBe(snapshot);
    ring.record({ stage: 'validated' });
    expect(ring.entries()).not.toBe(snapshot);
    expect(snapshot).toHaveLength(1);
  });
});

describe('sanitizeMediaUrl', () => {
  it('keeps the proxied asset path but drops its query', () => {
    const inner = 'https://u:p@media.example/theme.ogg?sig=1#x';
    const proxied = `https://mongoose.world:9080/?url=${encodeURIComponent(inner)}`;
    expect(sanitizeMediaUrl(proxied)).toBe(
      'https://mongoose.world:9080/?url=https://media.example/theme.ogg',
    );
  });

  it('strips a query or fragment from a relative name', () => {
    expect(sanitizeMediaUrl('ambience/buzz1.m4a?x=1')).toBe('ambience/buzz1.m4a');
    expect(sanitizeMediaUrl('ambience/buzz1.m4a#frag')).toBe('ambience/buzz1.m4a');
  });

  it('bounds very long text', () => {
    expect(sanitizeMediaText('x'.repeat(1000)).length).toBeLessThanOrEqual(300);
  });
});

describe('classifyLoadError', () => {
  it('maps a decodeAudioData EncodingError to DECODE_FAILED', () => {
    expect(classifyLoadError(new DOMException('bad data', 'EncodingError'))).toBe('DECODE_FAILED');
  });

  it('maps a network or HTTP failure to FETCH_FAILED', () => {
    expect(classifyLoadError(new TypeError('Failed to fetch'))).toBe('FETCH_FAILED');
    expect(classifyLoadError(new Error('Failed to fetch resource: 404 Not Found'))).toBe(
      'FETCH_FAILED',
    );
  });
});

describe('formatAudioDiagnostics', () => {
  it('writes one JSON line per entry for copying', () => {
    const ring = new AudioDiagnosticsRing({ now: () => 12.34567 });
    ring.record({ stage: 'received', key: 'a' });
    ring.record({ stage: 'released', key: 'a' });
    const lines = formatAudioDiagnostics(ring.entries()).split('\n');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toMatchObject({ seq: 1, stage: 'received', key: 'a' });
  });
});
