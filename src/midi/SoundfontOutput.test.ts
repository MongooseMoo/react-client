import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseSoundfont, SoundfontOutput } from './SoundfontOutput';

const data = 'MIDI.Soundfont.acoustic_grand_piano = {"C4":"data:audio/mp3;base64,AQID",}';
const response = () => new Response(data);
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function fixture() {
  const sources: Array<ReturnType<typeof source>> = [];
  const gains: Array<ReturnType<typeof gain>> = [];
  const pans: Array<{
    pan: ReturnType<typeof param>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  });
  const source = () => ({
    buffer: null,
    playbackRate: param(),
    detune: param(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  });
  const gain = () => ({ gain: param(), connect: vi.fn(), disconnect: vi.fn() });
  const context = {
    currentTime: 10,
    resume: vi.fn(),
    decodeAudioData: vi.fn(async () => ({ length: 100, duration: 1, numberOfChannels: 1 })),
    createBufferSource: vi.fn(() => {
      const node = source();
      sources.push(node);
      return node;
    }),
    createGain: vi.fn(() => {
      const node = gain();
      gains.push(node);
      return node;
    }),
    createStereoPanner: vi.fn(() => {
      const node = { pan: param(), connect: vi.fn(), disconnect: vi.fn() };
      pans.push(node);
      return node;
    }),
  };
  const output = { context: context as unknown as BaseAudioContext, destination: {} as AudioNode };
  const fallback = { send: vi.fn(), sendAt: vi.fn(), close: vi.fn() };
  const notify = vi.fn();
  const synth = new SoundfontOutput('MusyngKite', () => output, fallback, notify);
  return { synth, context, fallback, sources, gains, pans, notify };
}

describe('SoundfontOutput', () => {
  beforeEach(() =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response()),
    ),
  );
  afterEach(() => vi.unstubAllGlobals());

  it('reads sample data without executing arbitrary script and rejects malformed or excessive samples', () => {
    expect(parseSoundfont(data)).toEqual({ C4: 'data:audio/mp3;base64,AQID' });
    expect(() => parseSoundfont('alert(1)')).toThrow();
    expect(() =>
      parseSoundfont('MIDI.Soundfont.piano = {"C4":"https://example.com/sample"}'),
    ).toThrow();
    expect(() =>
      parseSoundfont('MIDI.Soundfont.piano = {"C99":"data:audio/mp3;base64,AQID"}'),
    ).toThrow();
  });

  it('downloads only on connection, uses the shared graph and schedules release on its frozen audio clock', async () => {
    const { synth, context, sources, gains } = fixture();
    expect(fetch).not.toHaveBeenCalled();
    await synth.ready();
    expect(fetch).toHaveBeenCalledTimes(1);
    synth.send([0x90, 60, 100]);
    synth.sendAt([0x80, 60, 0], 0.25);
    expect(sources[0].start).toHaveBeenCalledWith(10);
    expect(gains[0].gain.setTargetAtTime).toHaveBeenCalledWith(0, 10.25, 0.03);
    expect(sources[0].stop).toHaveBeenCalledWith(10.45);
    expect(context.resume).not.toHaveBeenCalled();
    synth.close();
  });

  it('routes drums to the built-in synth and keeps controls and panic effective', async () => {
    const { synth, fallback, sources, gains, pans } = fixture();
    await synth.ready();
    synth.send([0x99, 35, 100]);
    expect(fallback.send).toHaveBeenCalledWith([0x99, 35, 100]);
    synth.send([0x90, 60, 100]);
    synth.send([0xb0, 7, 0]);
    expect(gains[0].gain.setTargetAtTime).toHaveBeenCalledWith(0, 10, 0.01);
    synth.send([0xb0, 10, 0]);
    expect(pans[0].pan.setValueAtTime).toHaveBeenCalledWith(-1, 10);
    synth.send([0xb0, 120, 0]);
    expect(sources[0].stop).toHaveBeenCalled();
    synth.close();
    expect(fallback.close).toHaveBeenCalledOnce();
  });

  it('holds notes under sustain and releases them when the pedal lifts', async () => {
    const { synth, sources } = fixture();
    await synth.ready();
    synth.send([0x90, 60, 100]);
    synth.send([0xb0, 64, 127]);
    synth.send([0x80, 60, 0]);
    expect(sources[0].stop).not.toHaveBeenCalled();
    synth.send([0xb0, 64, 0]);
    expect(sources[0].stop).toHaveBeenCalledWith(10.2);
    synth.close();
  });

  it('cancels a future duration release when the pedal is pressed and preserves the note-off time', async () => {
    const { synth, sources } = fixture();
    await synth.ready();
    synth.send([0x90, 60, 100]);
    synth.sendAt([0x80, 60, 0], 0.25);
    synth.send([0xb0, 64, 127]);
    expect(sources[0].stop).toHaveBeenLastCalledWith(40);
    synth.send([0xb0, 64, 0]);
    expect(sources[0].stop).toHaveBeenLastCalledWith(10.45);
    synth.close();
  });

  it('uses built-in voices while a new program loads and never replays old notes after loading', async () => {
    const { synth, fallback, sources } = fixture();
    await synth.ready();
    const pending = deferred<Response>();
    vi.mocked(fetch).mockReturnValueOnce(pending.promise);
    synth.send([0xc0, 40]);
    synth.send([0x90, 65, 100]);
    synth.send([0x80, 65, 0]);
    expect(fallback.send).toHaveBeenCalledWith([0x90, 65, 100]);
    pending.resolve(response());
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sources).toHaveLength(0);
    synth.send([0xc0, 0]);
    synth.send([0x90, 60, 100]);
    expect(sources).toHaveLength(1);
    synth.close();
  });

  it('silences and releases every voice on close, ignoring late downloads', async () => {
    const { synth, sources, fallback, notify } = fixture();
    await synth.ready();
    synth.send([0x90, 60, 100]);
    const pending = deferred<Response>();
    vi.mocked(fetch).mockReturnValueOnce(pending.promise);
    synth.send([0xc0, 40]);
    synth.close();
    const count = notify.mock.calls.length;
    pending.resolve(response());
    await new Promise((resolve) => setTimeout(resolve, 20));
    synth.send([0x90, 62, 100]);
    expect(sources).toHaveLength(1);
    expect(sources[0].stop).toHaveBeenCalled();
    expect(notify).toHaveBeenCalledTimes(count);
    expect(fallback.close).toHaveBeenCalledOnce();
  });

  it('caps simultaneous voices and concurrent instrument downloads during program floods', async () => {
    const { synth, sources } = fixture();
    await synth.ready();
    for (let note = 0; note < 100; note++) synth.send([0x90, note, 100]);
    expect(sources[0].stop).toHaveBeenCalled();
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    for (let program = 1; program < 128; program++) synth.send([0xc0, program]);
    expect(fetch).toHaveBeenCalledTimes(3); // Piano + at most two in flight.
    synth.close();
  });
});
