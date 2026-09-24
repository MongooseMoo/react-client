import WebAudioTinySynth from '@xrnavigation/webaudio-tinysynth';

/** Where the synth renders: an AudioContext and a node on that context. */
export interface SynthAudioOutput {
  context: BaseAudioContext;
  destination: AudioNode;
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
}

export class VirtualMidiService {
  private static instance: VirtualMidiService;
  private synth: WebAudioTinySynth | null = null;
  private output: SynthAudioOutput | null = null;
  private readonly portName = 'Virtual Synthesizer';

  private constructor() {}

  static getInstance(): VirtualMidiService {
    if (!VirtualMidiService.instance) {
      VirtualMidiService.instance = new VirtualMidiService();
    }
    return VirtualMidiService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.synth) {
      return true;
    }

    try {
      // Without an attached output the synth owns a private AudioContext
      // until setAudioOutput moves it onto the client's graph.
      const synth = this.output
        ? new WebAudioTinySynth({
            audioContext: this.output.context,
            destination: this.output.destination,
          })
        : new WebAudioTinySynth();
      await synth.ready();
      this.synth = synth;
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
    if (this.synth) {
      await this.synth.setAudioContext(output.context, output.destination);
    }
  }

  async getVirtualPort(): Promise<MidiOutputSink | null> {
    if (!(await this.initialize())) return null;
    const synth = this.synth;
    if (!synth) return null;

    return {
      send: (data) => synth.send(data),
      sendAt: (data, secondsFromNow) => {
        const now = synth.getAudioContext()?.currentTime ?? 0;
        synth.send(data, now + Math.max(0, secondsFromNow));
      },
      close: () => {
        for (let channel = 0; channel < 16; channel++) {
          synth.allSoundOff(channel);
        }
      },
    };
  }

  getPortName(): string {
    return this.portName;
  }

  get initialized(): boolean {
    return this.synth !== null;
  }

  async dispose(): Promise<void> {
    const synth = this.synth;
    this.synth = null;
    await synth?.dispose();
  }
}

export const virtualMidiService = VirtualMidiService.getInstance();
