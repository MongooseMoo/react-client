import WebAudioTinySynth from '@xrnavigation/webaudio-tinysynth';
import type { SequenceOutput } from './midi/SequenceOutput';

/** Where the synth renders: an AudioContext and a node on that context. */
export interface SynthAudioOutput {
  context: BaseAudioContext;
  destination: AudioNode;
}

export interface MidiPlaybackSource {
  readonly paused: boolean;
  subscribePlayback(listener: () => void): () => void;
}

/**
 * A MIDI output the MidiService can drive. Hardware JZZ ports satisfy the
 * `send`/`close` part; the virtual synth also schedules on its audio clock.
 */
export interface MidiOutputSink {
  send(data: number[]): void;
  /** Send `data` `secondsFromNow` later on the sink's own clock. */
  sendAt?(data: number[], secondsFromNow: number): void;
  close(): void;
  getSequenceOutput?(): SequenceOutput;
}

export class VirtualMidiService {
  private static instance: VirtualMidiService;
  private synth: WebAudioTinySynth | null = null;
  private output: SynthAudioOutput | null = null;
  private playbackSource: MidiPlaybackSource | null = null;
  private playbackPaused = false;
  private unsubscribePlayback: (() => void) | null = null;
  private readonly playbackWaiters = new Set<() => void>();
  private readonly audioOutputListeners = new Set<() => void>();

  subscribeAudioOutput = (listener: () => void): (() => void) => {
    this.audioOutputListeners.add(listener);
    return () => {
      this.audioOutputListeners.delete(listener);
    };
  };
  private initialization: Promise<boolean> | null = null;
  private continuation: Promise<void> | null = null;
  private generation = 0;
  private outputPending = false;
  private pendingMessages: Array<{
    port: object;
    synth: WebAudioTinySynth;
    data: number[];
    time: number;
  }> = [];
  private readonly portName = 'Virtual Synthesizer';

  private constructor() {}

  setPlaybackSource(source: MidiPlaybackSource | null): () => void {
    this.unsubscribePlayback?.();
    this.playbackSource = source;
    if (source) this.playbackPaused = source.paused;
    const update = () => {
      if (this.playbackSource !== source || !source) return;
      this.playbackPaused = source.paused;
      if (!this.paused) {
        void this.continuePlayback().catch((error) =>
          console.error('Failed to resume virtual MIDI:', error),
        );
      }
    };
    const unsubscribe = source?.subscribePlayback(update) ?? (() => {});
    this.unsubscribePlayback = unsubscribe;
    // App attaches the matching client output immediately after binding. Drain
    // only after that attachment, never into a previous paused client's graph.
    void Promise.resolve().then(update);
    return () => {
      unsubscribe();
      if (this.unsubscribePlayback === unsubscribe) {
        this.playbackPaused = this.paused;
        this.playbackSource = null;
        this.unsubscribePlayback = null;
        for (const listener of this.audioOutputListeners) listener();
      }
    };
  }

  static getInstance(): VirtualMidiService {
    if (!VirtualMidiService.instance) {
      VirtualMidiService.instance = new VirtualMidiService();
    }
    return VirtualMidiService.instance;
  }

  initialize(): Promise<boolean> {
    if (this.synth) {
      return Promise.resolve(true);
    }
    if (this.initialization) return this.initialization;
    const initialization = this.initializeWhenActive(this.generation);
    this.initialization = initialization;
    void initialization.finally(() => {
      if (this.initialization === initialization) this.initialization = null;
    });
    return initialization;
  }

  private async initializeWhenActive(generation: number): Promise<boolean> {
    try {
      // Graph construction itself dispatches priming MIDI, which TinySynth
      // uses to unlock the context. Wait for the owner's explicit Resume.
      while (this.paused && generation === this.generation) {
        await new Promise<void>((resolve) => {
          this.playbackWaiters.add(resolve);
        });
      }
      if (generation !== this.generation) return false;
      // Without an attached output the synth owns a private AudioContext
      // until setAudioOutput moves it onto the client's graph.
      const output = this.output;
      const synth = output
        ? new WebAudioTinySynth({
            audioContext: output.context,
            destination: output.destination,
          })
        : new WebAudioTinySynth();
      await synth.ready();
      if (generation !== this.generation) {
        await synth.dispose();
        return false;
      }
      this.synth = synth;
      if (output !== this.output && this.output) {
        this.outputPending = true;
        if (!this.paused) await this.continuePlayback();
      }
      console.log(`Virtual MIDI synthesizer ready: ${this.portName}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize virtual MIDI synthesizer:', error);
      return false;
    }
  }

  /**
   * Render the synth into `output` (normally the client's Cacophony master
   * gain), so it shares the app's clock, volume, mute, and autoplay unlock.
   */
  async setAudioOutput(output: SynthAudioOutput): Promise<void> {
    if (this.output?.context === output.context && this.output.destination === output.destination) {
      return;
    }
    this.output = output;
    for (const listener of this.audioOutputListeners) listener();
    if (this.synth) {
      // setAudioContext also dispatches priming notes and unlocks the context.
      this.outputPending = true;
      if (!this.paused) await this.continuePlayback();
    }
  }

  async getVirtualPort(): Promise<MidiOutputSink | null> {
    if (!(await this.initialize())) return null;
    const synth = this.synth;
    if (!synth) return null;

    const port = {};
    let closed = false;
    const send = (data: number[], secondsFromNow?: number) => {
      if (closed || this.synth !== synth) return;
      const now = synth.getAudioContext()?.currentTime ?? 0;
      if (this.paused || this.outputPending) {
        // Keep events on the frozen audio clock, including note-offs and
        // controller changes. Copy caller-owned bytes until Resume dispatches.
        this.pendingMessages.push({
          port,
          synth,
          data: [...data],
          time: now + Math.max(0, secondsFromNow ?? 0),
        });
      } else if (secondsFromNow !== undefined) {
        synth.send(data, now + Math.max(0, secondsFromNow));
      } else {
        synth.send(data);
      }
    };
    return {
      send,
      sendAt: send,
      close: () => {
        closed = true;
        this.pendingMessages = this.pendingMessages.filter((message) => message.port !== port);
        for (let channel = 0; channel < 16; channel++) {
          synth.allSoundOff(channel);
        }
      },
    };
  }

  private get paused(): boolean {
    return this.playbackSource?.paused ?? this.playbackPaused;
  }

  private async attachOutput(synth: WebAudioTinySynth, output: SynthAudioOutput): Promise<void> {
    const previous = synth.getAudioContext();
    const retained = this.pendingMessages.filter((message) => message.synth === synth);
    const previousTime = previous?.currentTime ?? 0;
    const nextTime = output.context.currentTime ?? 0;
    await synth.setAudioContext(output.context, output.destination);
    if (previous !== output.context) {
      for (const message of retained) {
        message.time = nextTime + Math.max(0, message.time - previousTime);
      }
    }
  }

  private continuePlayback(): Promise<void> {
    // A new Resume may arrive before a previous notification settles. Run its
    // work afterwards so waiters/messages added in between are not stranded.
    if (this.continuation)
      return this.continuation.catch(() => {}).then(() => this.continuePlayback());
    const continuation = this.flushPlayback();
    this.continuation = continuation;
    void continuation.then(
      () => {
        if (this.continuation === continuation) this.continuation = null;
      },
      () => {
        if (this.continuation === continuation) this.continuation = null;
      },
    );
    return continuation;
  }

  private async flushPlayback(): Promise<void> {
    const generation = this.generation;
    if (this.paused) return;
    while (!this.paused && this.outputPending && this.synth && this.output) {
      const output = this.output;
      await this.attachOutput(this.synth, output);
      if (generation !== this.generation) return;
      if (this.output === output) this.outputPending = false;
    }
    if (this.paused || generation !== this.generation) return;
    for (const resolve of this.playbackWaiters) resolve();
    this.playbackWaiters.clear();
    while (!this.paused && !this.outputPending && this.pendingMessages.length) {
      const message = this.pendingMessages[0];
      if (this.synth === message.synth) message.synth.send(message.data, message.time);
      this.pendingMessages.shift();
    }
  }

  getPortName(): string {
    return this.portName;
  }

  get initialized(): boolean {
    return this.synth !== null;
  }

  /** Shared client graph for optional sample-based outputs. Never resumes it. */
  getAudioOutput(): SynthAudioOutput | null {
    return this.output;
  }

  /** Score voices use only the attached client context and independently owned handles. */
  async getSequenceOutput(): Promise<SequenceOutput | null> {
    if (!this.output || this.paused || !(await this.initialize()) || this.outputPending)
      return null;
    const synth = this.synth,
      output = this.output;
    if (!synth || synth.getAudioContext() !== output.context) return null;
    return {
      context: output.context,
      prepare: async (_parts, signal) => {
        if (signal.aborted || this.synth !== synth) throw new Error('Score output cancelled');
      },
      playNote: (note) => {
        if (this.synth !== synth || this.paused || this.outputPending)
          throw new Error('Score output unavailable');
        const common = {
          note: note.note,
          velocity: note.velocity,
          startTime: note.startTime,
          destination: note.destination,
        };
        return synth.playNote(
          note.percussion ? { ...common, percussion: true } : { ...common, program: note.program },
        );
      },
    };
  }

  async dispose(): Promise<void> {
    for (const listener of this.audioOutputListeners) listener();
    this.generation++;
    this.unsubscribePlayback?.();
    this.unsubscribePlayback = null;
    this.playbackSource = null;
    this.playbackPaused = false;
    this.pendingMessages = [];
    this.outputPending = false;
    this.output = null;
    this.initialization = null;
    this.continuation = null;
    for (const resolve of this.playbackWaiters) resolve();
    this.playbackWaiters.clear();
    const synth = this.synth;
    this.synth = null;
    await synth?.dispose();
  }
}

export const virtualMidiService = VirtualMidiService.getInstance();
