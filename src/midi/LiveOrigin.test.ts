import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodeLiveNote,
  decodeLiveControl,
  decodeLiveProgram,
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
  const renderer = new LiveOriginRenderer({
    getOutput: async () => output,
    getDestination: () => ({}) as AudioNode,
    budget: new SequenceBudget(),
  });
  renderers.push(renderer);
  return { renderer, output, voices };
}
const note = { note: 60, velocity: 100, on: true, channel: 0, originId: 'origin-a', eventId: 1 };

describe('strict live protocol', () => {
  it('preserves program/channel zero and only normalizes legacy integer booleans', () => {
    expect(decodeLiveNote({ note: 60, velocity: 100, on: 1 })).toMatchObject({
      on: true,
      channel: 0,
    });
    expect(decodeLiveProgram({ channel: 0, program: 0 })).toEqual({
      channel: 0,
      program: 0,
      originId: undefined,
    });
    expect(() => decodeLiveNote({ ...note, on: 1 })).toThrow();
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
    expect(() => decodeLiveNote(data)).toThrow();
  });
  it('rejects reset/raw controllers and malformed release identity', () => {
    expect(() => decodeLiveControl({ channel: 0, controller: 120, value: 0 })).toThrow();
    expect(() => decodeLiveReleaseAll({})).toThrow();
    expect(
      decodeLiveControl({ channel: 0, controller: 64, value: 127, originId: 'a' }),
    ).toMatchObject({ controller: 64 });
  });
});

describe('origin-owned live voices', () => {
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
  it('old legacy duration callbacks cannot cut a newer immediate same-key note', async () => {
    vi.useFakeTimers();
    const { renderer, voices } = setup();
    const legacy = { note: 60, velocity: 100, on: true, channel: 0 };
    await renderer.note({ ...legacy, duration: 50 });
    await renderer.note(legacy);
    await vi.advanceTimersByTimeAsync(100);
    expect(voices[0].stop).toHaveBeenCalled();
    expect(voices[1].stop).not.toHaveBeenCalled();
    expect(voices[1].release).not.toHaveBeenCalled();
  });
  it('caps live voices per origin and shares total admission instead of stealing', async () => {
    const { renderer, voices } = setup();
    for (let i = 0; i < 65; i++) await renderer.note({ ...note, note: i, eventId: i + 1 });
    expect(voices).toHaveLength(64);
    expect(voices.every((voice) => !voice.stop.mock.calls.length)).toBe(true);
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
