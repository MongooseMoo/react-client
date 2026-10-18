import type { MidiOutputSink, SynthAudioOutput } from '../VirtualMidiService';
import { programs } from './programs';
import { getSoundfont, type SoundfontId } from './soundfonts';

const MAX_FILE_BYTES = 16 * 1024 * 1024;
const MAX_CACHE_BYTES = 32 * 1024 * 1024;
const MAX_VOICES = 64;
type Samples = Record<string, string>;
type Voice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  pan: StereoPannerNode;
  velocity: number;
  channel: number;
  note: number;
  held: boolean;
  released: boolean;
  releaseTime?: number;
};

/** Parse the data assignment without executing the downloaded JavaScript. */
export function parseSoundfont(text: string): Samples {
  if (text.length > MAX_FILE_BYTES) throw new Error('Soundfont file is too large.');
  const start = text.indexOf('= {', text.indexOf('MIDI.Soundfont.'));
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Invalid soundfont data.');
  const value: unknown = JSON.parse(text.slice(start + 2, end + 1).replace(/,\s*}/g, '}'));
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid soundfont samples.');
  const entries = Object.entries(value);
  if (
    !entries.length ||
    entries.length > 128 ||
    entries.some(
      ([key, sample]) =>
        noteNumber(key) === null ||
        typeof sample !== 'string' ||
        sample.length > 2 * 1024 * 1024 ||
        !/^data:audio\/(?:mp3|mpeg|ogg);base64,[A-Za-z0-9+/=]+$/.test(sample),
    )
  ) {
    throw new Error('Invalid soundfont samples.');
  }
  return Object.fromEntries(entries);
}

function noteNumber(name: string): number | null {
  const match = /^([A-G])([b#]?)(-?\d)$/.exec(name);
  if (!match) return null;
  const pitch = 'C D EF G A B'.indexOf(match[1]);
  const result =
    12 * (Number(match[3]) + 1) + pitch + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
  return result >= 0 && result <= 127 ? result : null;
}

async function fetchSamples(url: string, signal: AbortSignal): Promise<Samples> {
  const response = await fetch(url, { signal, credentials: 'omit' });
  if (!response.ok || !response.body)
    throw new Error(`Soundfont download failed (${response.status}).`);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_FILE_BYTES) throw new Error('Soundfont file is too large.');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return parseSoundfont(new TextDecoder().decode(bytes));
}

/** One connection owns its downloads, voices and caches. Closing cancels all work. */
export class SoundfontOutput implements MidiOutputSink {
  private readonly font;
  private readonly abort = new AbortController();
  private readonly channels = Array.from({ length: 16 }, () => ({
    program: 0,
    volume: 100,
    expression: 127,
    pan: 64,
    bend: 8192,
    sustain: false,
  }));
  private readonly voices = new Set<Voice>();
  private readonly samples = new Map<number, Samples>();
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly loading = new Set<number>();
  private readonly decoding = new Set<string>();
  private readonly failedSamples = new Set<string>();
  private readonly failed = new Set<number>();
  private readonly queue: number[] = [];
  private graph: SynthAudioOutput | null = null;
  private sampleBytes = 0;
  private bufferBytes = 0;
  private closed = false;
  private releaseOutput: (() => void) | undefined;

  constructor(
    font: SoundfontId,
    private readonly getOutput: () => SynthAudioOutput | null,
    private readonly fallback: MidiOutputSink,
    private readonly notify: (message: string) => void,
    subscribeOutput?: (listener: () => void) => () => void,
    private readonly onInvalidated: () => void = () => {},
  ) {
    this.font = getSoundfont(font);
    this.releaseOutput = subscribeOutput?.(() => {
      this.close();
      this.onInvalidated();
    });
  }

  async ready(): Promise<void> {
    if (!this.getOutput()) throw new Error('Client audio is not ready. Try connecting again.');
    // Only piano is needed to accept a connection; other programs stay deferred.
    await this.load(0);
    if (this.closed) throw new Error('Soundfont connection was cancelled.');
  }

  private async load(program: number): Promise<void> {
    if (
      this.closed ||
      this.samples.has(program) ||
      this.loading.has(program) ||
      this.failed.has(program)
    )
      return;
    this.loading.add(program);
    this.notify(`Loading ${programs[program].replaceAll('_', ' ')}… Built-in synth available.`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const cancel = () => controller.abort();
    this.abort.signal.addEventListener('abort', cancel, { once: true });
    try {
      const samples = await fetchSamples(
        `https://gleitz.github.io/midi-js-soundfonts/${this.font.directory}/${programs[program]}-mp3.js`,
        controller.signal,
      );
      if (this.closed) return;
      const size = Object.values(samples).reduce((sum, sample) => sum + sample.length, 0);
      while (this.samples.size >= 4 || this.sampleBytes + size > MAX_CACHE_BYTES) {
        const oldest = this.samples.entries().next().value;
        if (!oldest) break;
        this.sampleBytes -= Object.values(oldest[1]).reduce(
          (sum, sample) => sum + sample.length,
          0,
        );
        this.samples.delete(oldest[0]);
        for (const key of this.buffers.keys())
          if (key.startsWith(`${oldest[0]}:`)) this.evictBuffer(key);
      }
      this.samples.set(program, samples);
      this.sampleBytes += size;
      const reference = this.nearestSample(samples, 60);
      if (reference) await this.decode(program, reference, samples[reference]);
      if (!this.closed && !this.buffers.has(`${program}:${reference}`))
        throw new Error('The reference sample could not decode.');
      // Seed each register so a first note does not transpose a middle-C
      // recording by several octaves while its exact sample decodes.
      for (const note of [36, 48, 72, 84]) {
        const name = this.nearestSample(samples, note);
        if (name) await this.decode(program, name, samples[name]);
      }
      if (!this.closed) this.notify(`${this.font.name} ready. Instruments load as needed.`);
    } catch (error) {
      if (this.closed) return;
      this.failed.add(program);
      this.notify(
        'An instrument could not load. Using the built-in synth; reconnect the output to retry.',
      );
      if (program === 0) throw error;
    } finally {
      clearTimeout(timeout);
      this.abort.signal.removeEventListener('abort', cancel);
      this.loading.delete(program);
      this.pump();
    }
  }

  private pump(): void {
    while (!this.closed && this.loading.size < 2 && this.queue.length) {
      const program = this.queue.shift();
      if (program !== undefined) void this.load(program).catch(() => {});
    }
  }

  private request(program: number): void {
    if (
      this.samples.has(program) ||
      this.loading.has(program) ||
      this.failed.has(program) ||
      this.queue.includes(program)
    )
      return;
    // Only retain requests for programs currently assigned to a channel.
    for (let i = this.queue.length - 1; i >= 0; i--) {
      if (!this.channels.some((channel) => channel.program === this.queue[i]))
        this.queue.splice(i, 1);
    }
    if (this.queue.length < 16) this.queue.push(program);
    this.pump();
  }

  private nearestSample(samples: Samples, note: number): string | undefined {
    return Object.keys(samples).sort(
      (a, b) => Math.abs((noteNumber(a) ?? 0) - note) - Math.abs((noteNumber(b) ?? 0) - note),
    )[0];
  }

  private async decode(program: number, name: string, sample: string): Promise<void> {
    const key = `${program}:${name}`;
    const graph = this.getOutput();
    if (
      !graph ||
      this.closed ||
      this.failedSamples.has(key) ||
      this.decoding.has(key) ||
      this.buffers.has(key) ||
      this.decoding.size >= 4
    )
      return;
    this.decoding.add(key);
    try {
      const binary = atob(sample.slice(sample.indexOf(',') + 1));
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const buffer = await graph.context.decodeAudioData(bytes.buffer);
      if (this.closed || this.getOutput()?.context !== graph.context || !this.samples.has(program))
        return;
      const size = buffer.length * buffer.numberOfChannels * 4;
      if (size > MAX_CACHE_BYTES || buffer.duration > 30)
        throw new Error('Soundfont sample is too large.');
      while (this.bufferBytes + size > MAX_CACHE_BYTES) {
        const oldest = this.buffers.keys().next().value;
        if (!oldest) break;
        this.evictBuffer(oldest);
      }
      this.buffers.set(key, buffer);
      this.bufferBytes += size;
    } catch {
      this.failedSamples.add(key);
      if (!this.closed) this.notify('A sample could not decode. Built-in synth remains available.');
    } finally {
      this.decoding.delete(key);
    }
  }

  private evictBuffer(key: string): void {
    const buffer = this.buffers.get(key);
    if (buffer) this.bufferBytes -= buffer.length * buffer.numberOfChannels * 4;
    this.buffers.delete(key);
  }

  send(data: number[]): void {
    this.dispatch(data, 0);
  }
  sendAt(data: number[], seconds: number): void {
    this.dispatch(data, Math.max(0, seconds));
  }

  private dispatch(data: number[], seconds: number): void {
    if (
      this.closed ||
      !data.length ||
      data.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
    )
      return;
    const kind = data[0] & 240;
    if (
      data[0] < 0xf0 &&
      (data[0] < 0x80 ||
        data.length < (kind === 0xc0 || kind === 0xd0 ? 2 : 3) ||
        data.slice(1).some((value) => value > 127))
    )
      return;
    const graph = this.getOutput();
    if (!graph) return;
    if (
      this.graph &&
      (graph.context !== this.graph.context || graph.destination !== this.graph.destination)
    )
      this.silence();
    this.graph = graph;
    const channel = data[0] & 15;
    const type = data[0] & 240;
    const state = this.channels[channel];
    const time = graph.context.currentTime + seconds;
    const a = data[1];
    const b = data[2];
    if (type === 0x90 && b > 0 && channel !== 9) {
      this.release(channel, a, time);
      this.request(state.program);
      const samples = this.samples.get(state.program);
      if (samples) {
        this.samples.delete(state.program);
        this.samples.set(state.program, samples);
      }
      const name = samples && this.nearestSample(samples, a);
      if (samples && name) void this.decode(state.program, name, samples[name]);
      const candidates = [...this.buffers.keys()].filter((key) =>
        key.startsWith(`${state.program}:`),
      );
      const key = candidates.sort(
        (x, y) =>
          Math.abs((noteNumber(x.split(':')[1]) ?? 0) - a) -
          Math.abs((noteNumber(y.split(':')[1]) ?? 0) - a),
      )[0];
      const buffer = this.buffers.get(key);
      if (buffer) {
        // Touch the entry so recently played samples survive eviction.
        this.buffers.delete(key);
        this.buffers.set(key, buffer);
        if (this.voices.size >= MAX_VOICES) {
          const oldest = this.voices.values().next().value;
          if (oldest) this.stop(oldest);
        }
        const source = graph.context.createBufferSource();
        const gain = graph.context.createGain();
        const pan = graph.context.createStereoPanner();
        source.buffer = buffer;
        source.playbackRate.value = 2 ** ((a - (noteNumber(key.split(':')[1]) ?? a)) / 12);
        source.detune.value = ((state.bend - 8192) / 8192) * 200;
        gain.gain.value = ((((b / 127) ** 2 * state.volume) / 127) * state.expression) / 127;
        pan.pan.value = (state.pan - 64) / 64;
        source.connect(gain);
        gain.connect(pan);
        pan.connect(graph.destination);
        const voice = {
          source,
          gain,
          pan,
          velocity: b,
          channel,
          note: a,
          held: false,
          released: false,
        };
        this.voices.add(voice);
        source.onended = () => {
          this.voices.delete(voice);
          source.disconnect();
          gain.disconnect();
          pan.disconnect();
        };
        // A previous strike may have used fallback while this sample loaded.
        this.fallback.send([0x80 | channel, a, 0]);
        source.start(time);
        return;
      }
    } else if (type === 0x80 || (type === 0x90 && b === 0)) this.release(channel, a, time);
    else if (type === 0xc0 && a < 128) {
      state.program = a;
      if (channel !== 9) this.request(a);
    } else if (type === 0xe0) {
      state.bend = a + b * 128;
      for (const voice of this.voices)
        if (voice.channel === channel)
          voice.source.detune.setValueAtTime(((state.bend - 8192) / 8192) * 200, time);
    } else if (type === 0xb0) {
      if (a === 7) state.volume = b;
      if (a === 11) state.expression = b;
      if (a === 10) state.pan = b;
      if (a === 7 || a === 11)
        for (const voice of this.voices)
          if (voice.channel === channel && !voice.released) {
            voice.gain.gain.setTargetAtTime(
              ((((voice.velocity / 127) ** 2 * state.volume) / 127) * state.expression) / 127,
              time,
              0.01,
            );
          }
      if (a === 10)
        for (const voice of this.voices)
          if (voice.channel === channel) voice.pan.pan.setValueAtTime((b - 64) / 64, time);
      if (a === 64) {
        state.sustain = b >= 64;
        for (const voice of this.voices)
          if (voice.channel === channel) {
            if (state.sustain && voice.released && (voice.releaseTime ?? 0) > time) {
              // A duration note-off was scheduled before the pedal was pressed.
              // Replace its future stop on the audio clock; do not use wall timers.
              voice.gain.gain.cancelScheduledValues(time);
              voice.gain.gain.setValueAtTime(
                ((((voice.velocity / 127) ** 2 * state.volume) / 127) * state.expression) / 127,
                time,
              );
              voice.source.stop(time + 30);
              voice.released = false;
              voice.held = true;
            } else if (!state.sustain && voice.held)
              this.releaseVoice(voice, Math.max(time, voice.releaseTime ?? time));
          }
      }
      if (a === 120 || a === 123) {
        for (const voice of this.voices) if (voice.channel === channel) this.stop(voice);
      }
      if (a === 121) {
        state.expression = 127;
        state.bend = 8192;
        state.sustain = false;
        for (const voice of this.voices)
          if (voice.channel === channel && voice.held) this.releaseVoice(voice, time);
        for (const voice of this.voices)
          if (voice.channel === channel) {
            voice.source.detune.setValueAtTime(0, time);
            if (!voice.released)
              voice.gain.gain.setTargetAtTime(
                ((voice.velocity / 127) ** 2 * state.volume) / 127,
                time,
                0.01,
              );
          }
      }
    } else if (data[0] === 0xff || (data[0] === 0xf0 && data[1] === 0x7e && data[3] === 9)) {
      this.silence();
      for (const channelState of this.channels)
        Object.assign(channelState, {
          program: 0,
          volume: 100,
          expression: 127,
          pan: 64,
          bend: 8192,
          sustain: false,
        });
    }
    if (seconds && this.fallback.sendAt) this.fallback.sendAt(data, seconds);
    else this.fallback.send(data);
  }

  private release(channel: number, note: number, time: number): void {
    for (const voice of this.voices)
      if (
        voice.channel === channel &&
        voice.note === note &&
        (!voice.released || (voice.releaseTime ?? 0) > time)
      ) {
        if (this.channels[channel].sustain) {
          voice.held = true;
          voice.releaseTime = time;
        } else this.releaseVoice(voice, time);
      }
  }

  private releaseVoice(voice: Voice, time: number): void {
    if (voice.released && time >= (voice.releaseTime ?? 0)) return;
    voice.released = true;
    voice.held = false;
    voice.releaseTime = time;
    voice.gain.gain.cancelScheduledValues(time);
    voice.gain.gain.setTargetAtTime(0, time, 0.03);
    voice.source.stop(time + 0.2);
  }

  private stop(voice: Voice): void {
    voice.source.stop();
    voice.source.disconnect();
    voice.gain.disconnect();
    voice.pan.disconnect();
    this.voices.delete(voice);
  }
  private silence(): void {
    for (const voice of this.voices) this.stop(voice);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.releaseOutput?.();
    this.abort.abort();
    this.silence();
    this.fallback.close();
    this.samples.clear();
    this.buffers.clear();
    this.queue.length = 0;
  }
}
