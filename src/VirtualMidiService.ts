import JZZ from 'jzz';
import { Tiny } from 'jzz-synth-tiny';

type JzzEngine = Awaited<ReturnType<typeof JZZ>>;
type JzzPort = Awaited<ReturnType<JzzEngine["openMidiOut"]>>;

type TinySynthFactory = {
  (name?: string): unknown;
  register(name?: string): void;
  version(): string;
};

type JzzWithTinySynth = typeof JZZ & {
  synth: {
    Tiny: TinySynthFactory;
  };
};

export class VirtualMidiService {
  private static instance: VirtualMidiService;
  private isInitialized = false;
  private virtualPort: JzzPort | null = null;
  private readonly portName = 'Virtual Synthesizer';

  private constructor() {}

  static getInstance(): VirtualMidiService {
    if (!VirtualMidiService.instance) {
      VirtualMidiService.instance = new VirtualMidiService();
    }
    return VirtualMidiService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Wait for JZZ to be ready first
      const jzz = await JZZ();
      
      // Initialize JZZ with Tiny synthesizer
      Tiny(JZZ);
      
      // Register the virtual synthesizer as a MIDI port
      const jzzWithTinySynth = JZZ as JzzWithTinySynth;
      jzzWithTinySynth.synth.Tiny.register(this.portName);
      
      // Refresh JZZ to update the device list
      jzz.refresh();
      
      console.log(`Virtual MIDI synthesizer registered as: ${this.portName}`);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize virtual MIDI synthesizer:', error);
      return false;
    }
  }

  async getVirtualPort(): Promise<JzzPort | null> {
    if (!this.isInitialized) {
      const success = await this.initialize();
      if (!success) return null;
    }

    try {
      // Get the virtual port through JZZ
      this.virtualPort = await JZZ().openMidiOut(this.portName);
      return this.virtualPort;
    } catch (error) {
      console.error('Failed to open virtual MIDI port:', error);
      return null;
    }
  }

  getPortName(): string {
    return this.portName;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  close(): void {
    if (this.virtualPort) {
      this.virtualPort.close();
      this.virtualPort = null;
    }
  }
}

export const virtualMidiService = VirtualMidiService.getInstance();
