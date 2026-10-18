import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodeMidiNotePlayback,
  decodeMidiNoteInput,
  decodeMidiControlInput,
  decodeMidiProgramInput,
  decodeMidiControlPlayback,
  decodeMidiProgramPlayback,
  decodeLiveReleaseAll,
} from './LiveOriginProtocol';
import { LiveOriginRenderer } from './LiveOriginRenderer';
import { SequenceBudget } from './SequenceService';
const graphs = vi.hoisted(
  () =>
    [] as Array<{
      control: ReturnType<typeof vi.fn>;
      dispose: ReturnType<typeof vi.fn>;
      input: object;
    }>,
);
vi.mock('./SequenceGraph', () => ({
  SequencePartGraph: class {
    input = {};
    control = vi.fn();
    dispose = vi.fn();
    constructor() {
      graphs.push(this);
    }
  },
}));
const renderers: LiveOriginRenderer[] = [];
afterEach(() => {
  for (const renderer of renderers.splice(0)) renderer.reset();
  graphs.length = 0;
  vi.useRealTimers();
});
function setup(prepare = async (_: unknown, _signal: AbortSignal) => {}) {
  const voices: Array<{
    stop: ReturnType<typeof vi.fn>;
    release: ReturnType<typeof vi.fn>;
    note: number;
    program: number;
  }> = [];
  const context = Object.assign(new EventTarget(), {
    currentTime: 1,
    state: 'running',
  }) as unknown as BaseAudioContext;
  const output = {
    context,
    prepare: vi.fn(prepare),
    playNote: vi.fn((data: { note: number; program: number }) => {
      const voice = {
        ...data,
        stop: vi.fn(),
        release: vi.fn(),
        state: 'playing' as const,
        ended: new Promise<void>(() => {}),
      };
      voices.push(voice);
      return voice;
    }),
    dispose: vi.fn(),
  };
  const error = vi.fn();
  const renderer = new LiveOriginRenderer({
    getOutput: async () => output,
    getDestination: () => ({}) as AudioNode,
    budget: new SequenceBudget(),
    error,
  });
  renderers.push(renderer);
  return { renderer, output, voices, error };
}
const note = { note: 60, velocity: 100, on: true, channel: 0, originId: 'origin-a', eventId: 1 };

describe('strict live protocol', () => {
  it.each([
    'server:reserved',
    'server:other',
  ])('rejects reserved server origins across all relay messages: %s', (originId) => {
    expect(() => decodeMidiNotePlayback({ ...note, originId })).toThrow('origin');
    expect(() => decodeMidiControlPlayback({ originId, channel: 0, controller: 7, value: 100 })).toThrow(
      'origin',
    );
    expect(() => decodeMidiProgramPlayback({ originId, channel: 0, program: 0 })).toThrow('origin');
    expect(() => decodeLiveReleaseAll({ originId })).toThrow('origin');
  });
  it('preserves program/channel zero in distinct directions', () => {
    expect(decodeMidiNoteInput({ note: 60, velocity: 100, on: true, channel: 0 })).toEqual({ note: 60, velocity: 100, on: true, channel: 0 });
    expect(decodeMidiProgramInput({ channel: 0, program: 0 })).toEqual({ channel: 0, program: 0 });
    expect(decodeMidiProgramPlayback({ channel: 0, program: 0, originId: 'a' })).toEqual({ channel: 0, program: 0, originId: 'a' });
  });
  it('requires exact input fields and rejects client-supplied playback identity', () => {
    const input = { note: 60, velocity: 100, on: true, channel: 0 };
    for (const data of [{ ...input, on: 1 }, { ...input, channel: undefined },
      { ...input, duration: 50 }, { ...input, originId: 'a' }, { ...input, eventId: 1 },
      { ...input, extra: true }]) expect(() => decodeMidiNoteInput(data)).toThrow();
    expect(() => decodeMidiControlInput({ channel: 0, controller: 64, value: 1, originId: 'a' })).toThrow();
    expect(() => decodeMidiProgramInput({ channel: 0, program: 0, originId: 'a' })).toThrow();
    expect(decodeMidiControlInput({ channel: 0, controller: 64, value: 0 })).toEqual({ channel: 0, controller: 64, value: 0 });
  });
  it('requires owned playback identity and rejects additional fields in every message', () => {
    const input = { note: 60, velocity: 100, on: true, channel: 0 };
    for (const data of [input, { ...note, channel: undefined }, { ...note, on: 1 },
      { ...note, duration: 50 }, { ...note, extra: true }])
      expect(() => decodeMidiNotePlayback(data)).toThrow();
    expect(() => decodeMidiControlPlayback({ channel: 0, controller: 64, value: 0 })).toThrow();
    expect(() => decodeMidiProgramPlayback({ channel: 0, program: 0 })).toThrow();
    expect(() => decodeMidiControlPlayback({ channel: 0, controller: 64, value: 0, originId: 'a', eventId: 1 })).toThrow();
    expect(() => decodeMidiProgramPlayback({ channel: 0, program: 0, originId: 'a', extra: 1 })).toThrow();
    expect(() => decodeLiveReleaseAll({ originId: 'a', extra: 1 })).toThrow();
  });
  it.each([
    { ...note, note: -1 },
    { ...note, eventId: -1 },
    { ...note, originId: undefined },
    { ...note, on: 'yes' },
    { ...note, velocity: 0 },
    { ...note, channel: 16 },
    { ...note, duration: Infinity },
  ])('rejects malformed note before audio', (data) => {
    expect(() => decodeMidiNotePlayback(data)).toThrow();
  });
  it('rejects reset/raw controllers and malformed release identity', () => {
    expect(() => decodeMidiControlPlayback({ channel: 0, controller: 120, value: 0 })).toThrow();
    expect(() => decodeLiveReleaseAll({})).toThrow();
    expect(
      decodeMidiControlPlayback({ channel: 0, controller: 64, value: 127, originId: 'a' }),
    ).toMatchObject({ controller: 64 });
  });
});

describe('origin-owned live voices', () => {
  it('evicts idle origins in least-recent-use order without stealing active notes', async () => {
    const { renderer, voices, error } = setup();
    for (let i = 0; i < 64; i++)
      renderer.program({ originId: `idle-${i}`, channel: 0, program: 40 });
    renderer.program({ originId: 'idle-0', channel: 0, program: 41 });
    await renderer.note({ ...note, originId: 'new' });
    await renderer.note({ ...note, originId: 'idle-0' });
    await renderer.note({ ...note, originId: 'idle-1' });
    expect(voices.map((v) => v.program)).toEqual([0, 41, 0]);
    expect(voices.every((v) => !v.stop.mock.calls.length)).toBe(true);
    expect(error).not.toHaveBeenCalled();
  });
  it('reports saturated active origin admission instead of silently refusing', async () => {
    const { renderer, voices, error } = setup();
    for (let i = 0; i < 65; i++) await renderer.note({ ...note, originId: `active-${i}` });
    expect(voices).toHaveLength(64);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('origin limit'));
    expect(voices.every((v) => !v.stop.mock.calls.length)).toBe(true);
  });
  it('replaces only the same origin key and stale releases cannot cut the new voice', async () => {
    const { renderer, voices } = setup();
    await renderer.note(note);
    await renderer.note({ ...note, originId: 'origin-b' });
    await renderer.note({ ...note, eventId: 2 });
    expect(voices[0].stop).toHaveBeenCalledOnce();
    expect(voices[1].stop).not.toHaveBeenCalled();
    await renderer.note({ ...note, on: false });
    expect(voices[2].release).not.toHaveBeenCalled();
    await renderer.note({ ...note, eventId: 2, on: false });
    expect(voices[2].release).toHaveBeenCalledOnce();
    renderer.releaseAll('origin-a');
    expect(voices[1].stop).not.toHaveBeenCalled();
  });
  it('duplicate/replayed note-on is idempotent, even across different keys', async () => {
    const { renderer, voices } = setup();
    await renderer.note(note);
    await renderer.note(note);
    await renderer.note({ ...note, note: 62 });
    expect(voices).toHaveLength(1);
  });
  it('captures program at receipt and cancels pending preparation on origin revocation', async () => {
    let ready = () => {};
    const { renderer, output, voices } = setup(
      (_parts, signal) =>
        new Promise<void>((resolve) => {
          ready = resolve;
          signal.addEventListener('abort', resolve, { once: true });
        }),
    );
    const pending = renderer.note(note);
    await vi.waitFor(() => expect(output.prepare).toHaveBeenCalledOnce());
    renderer.program({ originId: 'origin-a', channel: 0, program: 40 });
    renderer.releaseAll('origin-a');
    ready();
    await pending;
    expect(voices).toHaveLength(0);
    expect(output.prepare.mock.calls[0][1].aborted).toBe(true);
  });
  it('holds only its own pedal notes and controller state does not cross origins', async () => {
    const { renderer, voices } = setup();
    renderer.control({ originId: 'origin-a', channel: 0, controller: 64, value: 127 });
    renderer.program({ originId: 'origin-a', channel: 0, program: 40 });
    await renderer.note(note);
    await renderer.note({ ...note, originId: 'origin-b' });
    expect(voices.map((voice) => voice.program)).toEqual([40, 0]);
    await renderer.note({ ...note, on: false });
    expect(voices[0].release).not.toHaveBeenCalled();
    await renderer.note({ ...note, originId: 'origin-b', on: false });
    expect(voices[1].release).toHaveBeenCalled();
    renderer.control({ originId: 'origin-a', channel: 0, controller: 64, value: 0 });
    expect(voices[0].release).toHaveBeenCalled();
  });
  it('admits128 owned voices, refuses129 visibly, and releases only the targeted origin', async () => {
    const { renderer, voices, error } = setup();
    for (let i = 0; i < 129; i++) await renderer.note({ ...note, channel: Math.floor(i / 128), note: i % 128, eventId: i + 1 });
    expect(voices).toHaveLength(128);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('128'));
    await renderer.note({ ...note, originId: 'origin-b' });
    renderer.releaseAll('origin-a');
    expect(voices.slice(0, 128).every((voice) => voice.stop.mock.calls.length === 1)).toBe(true);
    expect(voices[128].stop).not.toHaveBeenCalled();
  });
  it('retains the global256 voice ceiling across origins and reclaims only retired ownership', async () => {
    const { renderer, voices, error } = setup();
    for (const originId of ['a', 'b'])
      for (let i = 0; i < 128; i++) await renderer.note({ ...note, originId, note: i, eventId: i + 1 });
    await renderer.note({ ...note, originId: 'c' });
    expect(voices).toHaveLength(256);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('256'));
    expect(voices.every((voice) => !voice.stop.mock.calls.length)).toBe(true);
    renderer.releaseAll('a');
    await renderer.note({ ...note, originId: 'c', eventId: 2 });
    expect(voices).toHaveLength(257);
    expect(voices.slice(128, 256).every((voice) => !voice.stop.mock.calls.length)).toBe(true);
  });
  it('clears playing and pending notes on interruption without replay on resume', async () => {
    let ready = () => {};
    const { renderer, output, voices } = setup(async (_parts, signal) => {
      if (voices.length)
        await new Promise<void>((resolve) => {
          ready = resolve;
          signal.addEventListener('abort', resolve, { once: true });
        });
    });
    await renderer.note(note);
    const pending = renderer.note({ ...note, note: 62, eventId: 2 });
    await vi.waitFor(() => expect(output.prepare).toHaveBeenCalledTimes(2));
    Object.assign(output.context, { state: 'suspended' });
    output.context.dispatchEvent(new Event('statechange'));
    ready();
    await pending;
    Object.assign(output.context, { state: 'running' });
    output.context.dispatchEvent(new Event('statechange'));
    expect(voices).toHaveLength(1);
    expect(voices[0].stop).toHaveBeenCalled();
  });
  it('does not retain a note received while the audio clock is suspended', async () => {
    const { renderer, output, voices } = setup();
    Object.assign(output.context, { state: 'suspended' });
    await renderer.note(note);
    Object.assign(output.context, { state: 'running' });
    expect(output.prepare).not.toHaveBeenCalled();
    expect(voices).toHaveLength(0);
  });
});
