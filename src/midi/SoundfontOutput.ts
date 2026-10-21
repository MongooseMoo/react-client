import { WorkletSynthesizer } from 'spessasynth_lib';
import processorUrl from 'spessasynth_lib/dist/spessasynth_processor.min.js?url';
import type { MidiOutputSink, SynthAudioOutput } from '../VirtualMidiService';
import { SOUNDFONT_NAME } from './soundfonts';

/** Built by scripts/build-soundbank.mjs from MuseScore_General.sf2 (MIT). */
export const SOUNDFONT_URL = 'https://mongoose.world/sounds/soundfonts/MuseScore_General.sf3';

/**
 * A SoundFont synthesizer (spessasynth) rendering into the client's audio output.
 * Until the bank has loaded, messages go to the built-in synth instead.
 */
export class SoundfontOutput implements MidiOutputSink {
  private readonly abort = new AbortController();
  private synth: WorkletSynthesizer | null = null;
  private loaded = false;
  private closed = false;
  /** Latest program, controller and pitch bend per channel, replayed when the bank loads. */
  private readonly settings = new Map<number, number[]>();
  private readonly releaseOutput: (() => void) | undefined;

  constructor(
    private readonly getOutput: () => SynthAudioOutput | null,
    private readonly fallback: MidiOutputSink,
    private readonly notify: (message: string) => void,
    subscribeOutput?: (listener: () => void) => () => void,
    private readonly onInvalidated: () => void = () => {},
  ) {
    this.releaseOutput = subscribeOutput?.(() => {
      this.close();
      this.onInvalidated();
    });
  }

  /** Resolves once the synthesizer exists; the bank keeps loading in the background. */
  async ready(): Promise<void> {
    const output = this.getOutput();
    if (!output) throw new Error('Client audio is not ready. Try connecting again.');
    await output.context.audioWorklet.addModule(processorUrl);
    if (this.closed) throw new Error('Soundfont connection was cancelled.');
    this.synth = new WorkletSynthesizer(output.context);
    this.synth.connect(output.destination);
    this.notify(`Loading ${SOUNDFONT_NAME}… The built-in synth plays until it is ready.`);
    void this.load(this.synth);
  }

  private async load(synth: WorkletSynthesizer): Promise<void> {
    try {
      const response = await fetch(SOUNDFONT_URL, { signal: this.abort.signal, credentials: 'omit' });
      if (!response.ok) throw new Error(`Soundfont download failed (${response.status}).`);
      const bank = await response.arrayBuffer();
      if (this.closed) return;
      await synth.isReady;
      await new Promise<void>((resolve, reject) => {
        synth.eventHandler.addEvent('soundBankError', 'mongoose', reject);
        synth.soundBankManager.addSoundBank(bank, 'main').then(resolve, reject);
      });
      if (this.closed) return;
      for (const data of this.settings.values()) synth.sendMessage(data);
      this.settings.clear();
      this.loaded = true;
      this.notify(`${SOUNDFONT_NAME} ready.`);
    } catch {
      if (!this.closed)
        this.notify(
          `${SOUNDFONT_NAME} could not load. Using the built-in synth; reconnect the output to retry.`,
        );
    }
  }

  send(data: number[]): void {
    this.dispatch(data);
  }

  sendAt(data: number[], seconds: number): void {
    this.dispatch(data, Math.max(0, seconds));
  }

  private dispatch(data: number[], seconds?: number): void {
    if (
      this.closed ||
      !data.length ||
      data.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
    )
      return;
    const synth = this.synth;
    if (!this.loaded || !synth) {
      this.remember(data);
      this.toFallback(data, seconds);
      return;
    }
    // Notes the built-in synth started while the bank loaded still need their release.
    if (isRelease(data)) this.toFallback(data, seconds);
    if (seconds === undefined) synth.sendMessage(data);
    else synth.sendMessage(data, 0, { time: synth.context.currentTime + seconds });
  }

  private remember(data: number[]): void {
    const kind = kindOf(data);
    // Keyed by status byte, or status and controller number for control changes.
    if (kind === 0xc0 || kind === 0xe0) this.settings.set(data[0], [...data]);
    else if (kind === 0xb0) this.settings.set(data[0] * 128 + data[1], [...data]);
  }

  private toFallback(data: number[], seconds?: number): void {
    if (seconds !== undefined && this.fallback.sendAt) this.fallback.sendAt(data, seconds);
    else this.fallback.send(data);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.releaseOutput?.();
    this.abort.abort();
    this.synth?.destroy();
    this.synth = null;
    this.fallback.close();
  }
}

const kindOf = (data: number[]) => data[0] & 0xf0;

/** Note-offs, sustain changes and all-sound/notes-off. */
function isRelease(data: number[]): boolean {
  const kind = kindOf(data);
  return (
    kind === 0x80 ||
    (kind === 0x90 && data[2] === 0) ||
    (kind === 0xb0 && (data[1] === 64 || data[1] === 120 || data[1] === 123))
  );
}
