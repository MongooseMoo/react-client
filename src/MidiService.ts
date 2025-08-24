import { virtualMidiService } from './VirtualMidiService';

export interface MidiDevice {
  id: string;
  name: string;
}

export interface MidiNote {
  note: number;
  velocity: number;
  on: boolean;
  channel?: number;
}

export interface MidiControlChange {
  controller: number;
  value: number;
  channel: number;
}

export interface MidiProgramChange {
  program: number;
  channel: number;
}

export interface MidiSystemMessage {
  type: string;
  data: number[];
}

export interface RawMidiMessage {
  hex: string;
  data: Uint8Array;
  type: string;
}

export interface MidiMessage {
  note?: MidiNote;
  controlChange?: MidiControlChange;
  programChange?: MidiProgramChange;
  systemMessage?: MidiSystemMessage;
  raw?: RawMidiMessage;
  // Always include raw data for debugging
  rawData: RawMidiMessage;
}

export type MidiInputCallback = (message: MidiMessage) => void;

class MidiService {
  private midiAccess: WebMidi.MIDIAccess | null = null;
  private inputDevice: WebMidi.MIDIInput | null = null;
  private outputDevice: WebMidi.MIDIOutput | null = null;
  private inputCallback: MidiInputCallback | null = null;

  async initialize(): Promise<boolean> {
    // Don't request MIDI access during initialization
    // This will be called when MIDI is enabled in settings
    try {
      if (navigator.requestMIDIAccess) {
        this.midiAccess = await navigator.requestMIDIAccess();
        console.log("MIDI access granted");
        return true;
      } else {
        console.log("Web MIDI API not supported");
        return false;
      }
    } catch (error) {
      console.error("Failed to get MIDI access:", error);
      return false;
    }
  }

  getInputDevices(): MidiDevice[] {
    if (!this.midiAccess) return [];
    
    const devices: MidiDevice[] = [];
    this.midiAccess.inputs.forEach((input) => {
      devices.push({
        id: input.id,
        name: input.name || "Unknown Input Device"
      });
    });
    return devices;
  }

  getOutputDevices(): MidiDevice[] {
    const devices: MidiDevice[] = [];
    
    // Add virtual synthesizer if initialized
    if (virtualMidiService.initialized) {
      devices.push({
        id: 'virtual-synth',
        name: virtualMidiService.getPortName()
      });
    }
    
    // Add hardware MIDI devices if available
    if (this.midiAccess) {
      this.midiAccess.outputs.forEach((output) => {
        devices.push({
          id: output.id,
          name: output.name || "Unknown Output Device"
        });
      });
    }
    
    return devices;
  }

  connectInputDevice(deviceId: string, callback: MidiInputCallback): boolean {
    if (!this.midiAccess) return false;

    const input = this.midiAccess.inputs.get(deviceId);
    if (!input) return false;

    // Disconnect previous device
    if (this.inputDevice) {
      this.inputDevice.onmidimessage = null;
    }

    this.inputDevice = input;
    this.inputCallback = callback;

    input.onmidimessage = (event) => {
      const rawData = event.data;
      const status = rawData[0];
      
      // SUPPRESS Active Sensing (0xFE) - floods data every ~300ms
      if (status === 0xFE) {
        return;
      }
      
      const messageType = status & 0xf0;
      const channel = status & 0x0f;
      
      // Create raw message for debugging
      const rawMessage: RawMidiMessage = {
        hex: Array.from(rawData).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
        data: rawData,
        type: this.getMidiMessageType(status)
      };
      
      const message: MidiMessage = {
        rawData: rawMessage // Always include raw data for debugging
      };
      
      // Categorize messages
      if (messageType === 0x90 || messageType === 0x80) {
        // Note On/Off
        const note = rawData[1];
        const velocity = rawData[2];
        const isNoteOn = messageType === 0x90 && velocity > 0;
        message.note = { note, velocity, on: isNoteOn, channel };
      } else if (messageType === 0xB0) {
        // Control Change
        const controller = rawData[1];
        const value = rawData[2];
        message.controlChange = { controller, value, channel };
      } else if (messageType === 0xC0) {
        // Program Change
        const program = rawData[1];
        message.programChange = { program, channel };
      } else if ((status & 0xF0) === 0xF0) {
        // System Messages
        message.systemMessage = {
          type: this.getSystemMessageType(status),
          data: Array.from(rawData)
        };
      } else {
        // Unknown/uncategorized - use raw
        message.raw = rawMessage;
      }
      
      this.inputCallback?.(message);
    };

    console.log(`Connected to MIDI input: ${input.name}`);
    return true;
  }

  async connectOutputDevice(deviceId: string): Promise<boolean> {
    // Handle virtual synthesizer connection
    if (deviceId === 'virtual-synth') {
      try {
        const virtualPort = await virtualMidiService.getVirtualPort();
        if (virtualPort) {
          this.outputDevice = virtualPort;
          console.log(`Connected to virtual MIDI synthesizer: ${virtualMidiService.getPortName()}`);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to connect to virtual synthesizer:', error);
        return false;
      }
    }

    // Handle hardware MIDI device connection
    if (!this.midiAccess) return false;

    const output = this.midiAccess.outputs.get(deviceId);
    if (!output) return false;

    this.outputDevice = output;
    console.log(`Connected to MIDI output: ${output.name}`);
    return true;
  }

  sendNote(note: MidiNote): void {
    if (!this.outputDevice) return;

    const channel = note.channel || 0;
    const status = note.on ? 0x90 | channel : 0x80 | channel;
    const velocity = note.on ? Math.max(1, Math.min(127, note.velocity)) : 0;

    this.outputDevice.send([status, note.note, velocity]);
  }

  sendRawMessage(data: number[]): void {
    if (!this.outputDevice) return;
    this.outputDevice.send(data);
  }

  sendAllNotesOff(): void {
    if (!this.outputDevice) return;

    // Send all notes off for all channels (0-15)
    for (let channel = 0; channel < 16; channel++) {
      // All notes off (CC 123)
      this.outputDevice.send([0xb0 | channel, 123, 0]);
      // All sound off (CC 120)
      this.outputDevice.send([0xb0 | channel, 120, 0]);
    }
  }

  disconnect(): void {
    if (this.inputDevice) {
      this.inputDevice.onmidimessage = null;
      this.inputDevice = null;
    }
    this.outputDevice = null;
    this.inputCallback = null;
  }

  get isSupported(): boolean {
    return !!navigator.requestMIDIAccess;
  }

  get isInitialized(): boolean {
    return !!this.midiAccess;
  }

  get hasInputDevice(): boolean {
    return !!this.inputDevice;
  }

  get hasOutputDevice(): boolean {
    return !!this.outputDevice;
  }

  private getMidiMessageType(status: number): string {
    const messageType = status & 0xF0;
    const channel = (status & 0x0F) + 1;
    
    switch (messageType) {
      case 0x80: return `Note Off Ch.${channel}`;
      case 0x90: return `Note On Ch.${channel}`;
      case 0xA0: return `Polyphonic Aftertouch Ch.${channel}`;
      case 0xB0: return `Control Change Ch.${channel}`;
      case 0xC0: return `Program Change Ch.${channel}`;
      case 0xD0: return `Channel Aftertouch Ch.${channel}`;
      case 0xE0: return `Pitch Bend Ch.${channel}`;
      case 0xF0: return this.getSystemMessageType(status);
      default: return `Unknown (${status.toString(16).toUpperCase()})`;
    }
  }
  
  private getSystemMessageType(status: number): string {
    switch (status) {
      case 0xF0: return 'System Exclusive';
      case 0xF1: return 'MIDI Time Code Quarter Frame';
      case 0xF2: return 'Song Position Pointer';
      case 0xF3: return 'Song Select';
      case 0xF6: return 'Tune Request';
      case 0xF7: return 'End of Exclusive';
      case 0xF8: return 'Timing Clock';
      case 0xFA: return 'Start';
      case 0xFB: return 'Continue';
      case 0xFC: return 'Stop';
      case 0xFE: return 'Active Sensing';
      case 0xFF: return 'Reset';
      default: return `System (${status.toString(16).toUpperCase()})`;
    }
  }
}

export const midiService = new MidiService();