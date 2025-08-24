import { GMCPMessage, GMCPPackage } from "../package";
import { midiService, MidiNote, MidiMessage } from "../../MidiService";

export class GMCPMessageClientMidiNote extends GMCPMessage {
  public readonly note!: number;
  public readonly velocity!: number;
  public readonly on!: boolean;
  public readonly channel?: number;
  public readonly duration?: number;
}

export class GMCPMessageClientMidiControlChange extends GMCPMessage {
  public readonly controller!: number;
  public readonly value!: number;
  public readonly channel!: number;
}

export class GMCPMessageClientMidiProgramChange extends GMCPMessage {
  public readonly program!: number;
  public readonly channel!: number;
}

export class GMCPMessageClientMidiSystemMessage extends GMCPMessage {
  public readonly type!: string;
  public readonly data!: number[];
}

export class GMCPMessageClientMidiRawMessage extends GMCPMessage {
  public readonly hex!: string;
  public readonly data!: number[];
  public readonly type!: string;
}

export class GMCPMessageClientMidiEnable extends GMCPMessage {
  public readonly enabled!: boolean;
}

export class GMCPClientMidi extends GMCPPackage {
  public packageName: string = "Client.Midi";
  public packageVersion?: number = undefined; // Don't advertise by default
  private activeNotes: Map<number, NodeJS.Timeout> = new Map();
  private isAdvertised: boolean = false;
  private debugCallback?: (hex: string, type: string, gmcpMessage: string) => void;

  constructor(client: any) {
    super(client);
    // Don't initialize MIDI automatically - wait for user to enable it
  }

  async ensureInitialized(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (!midiService.isSupported) {
      console.log("MIDI not supported in this browser");
      return false;
    }

    const success = await midiService.initialize();
    if (success) {
      console.log("MIDI service initialized");
    }
    return success;
  }

  get isInitialized(): boolean {
    return midiService.isInitialized;
  }

  public async connectInputDevice(deviceId: string): Promise<boolean> {
    const initialized = await this.ensureInitialized();
    if (!initialized) return false;

    return midiService.connectInputDevice(deviceId, (message: MidiMessage) => {
      // Route different message types to appropriate handlers
      this.handleInputMessage(message);
    });
  }

  public async connectOutputDevice(deviceId: string): Promise<boolean> {
    const initialized = await this.ensureInitialized();
    if (!initialized) return false;

    return await midiService.connectOutputDevice(deviceId);
  }

  private handleInputMessage(message: MidiMessage): void {
    let gmcpMessage = "";
    
    // Always have raw data for debugging
    const hex = message.rawData.hex;
    const type = message.rawData.type;
    
    if (message.note) {
      // Send note message
      const noteData = {
        note: message.note.note,
        velocity: message.note.velocity,
        on: message.note.on,
        channel: message.note.channel
      };
      this.sendData("Note", noteData);
      gmcpMessage = `Client.Midi.Note ${JSON.stringify(noteData)}`;
    } else if (message.controlChange) {
      // Send control change message
      const ccData = {
        controller: message.controlChange.controller,
        value: message.controlChange.value,
        channel: message.controlChange.channel
      };
      this.sendData("ControlChange", ccData);
      gmcpMessage = `Client.Midi.ControlChange ${JSON.stringify(ccData)}`;
    } else if (message.programChange) {
      // Send program change message
      const pcData = {
        program: message.programChange.program,
        channel: message.programChange.channel
      };
      this.sendData("ProgramChange", pcData);
      gmcpMessage = `Client.Midi.ProgramChange ${JSON.stringify(pcData)}`;
    } else if (message.systemMessage) {
      // Send system message
      const sysData = {
        type: message.systemMessage.type,
        data: message.systemMessage.data
      };
      this.sendData("SystemMessage", sysData);
      gmcpMessage = `Client.Midi.SystemMessage ${JSON.stringify(sysData)}`;
    } else if (message.raw) {
      // Send raw message for uncategorized types
      const rawData = {
        hex: message.raw.hex,
        data: Array.from(message.raw.data),
        type: message.raw.type
      };
      this.sendData("RawMessage", rawData);
      gmcpMessage = `Client.Midi.RawMessage ${JSON.stringify(rawData)}`;
    }
    
    // Call debug callback with raw hex and GMCP message info
    if (this.debugCallback && gmcpMessage) {
      this.debugCallback(hex, type, gmcpMessage);
    }
  }

  private sendNoteToServer(note: MidiNote, duration?: number): void {
    const noteData: any = {
      note: note.note,
      velocity: note.velocity,
      on: note.on,
      channel: note.channel
    };

    // Include duration if provided
    if (duration !== undefined) {
      noteData.duration = duration;
    }

    this.sendData("Note", noteData);
  }

  // Handle incoming MIDI messages from server
  handleNote(data: GMCPMessageClientMidiNote): void {
    const note: MidiNote = {
      note: data.note,
      velocity: data.velocity,
      on: data.on,
      channel: data.channel
    };

    // Clear any existing timeout for this note
    if (this.activeNotes.has(data.note)) {
      clearTimeout(this.activeNotes.get(data.note)!);
      this.activeNotes.delete(data.note);
    }

    // Send the note
    midiService.sendNote(note);

    // If it's a note on with duration, schedule note off
    if (data.on && data.duration) {
      const timeout = setTimeout(() => {
        midiService.sendNote({
          ...note,
          on: false,
          velocity: 0
        });
        this.activeNotes.delete(data.note);
      }, data.duration);
      
      this.activeNotes.set(data.note, timeout);
    }
  }

  // Handle incoming control change from server
  handleControlChange(data: GMCPMessageClientMidiControlChange): void {
    if (midiService.hasOutputDevice) {
      const status = 0xB0 | data.channel;
      midiService.sendRawMessage([status, data.controller, data.value]);
    }
  }

  // Handle incoming program change from server
  handleProgramChange(data: GMCPMessageClientMidiProgramChange): void {
    if (midiService.hasOutputDevice) {
      const status = 0xC0 | data.channel;
      midiService.sendRawMessage([status, data.program]);
    }
  }

  // Handle incoming system message from server
  handleSystemMessage(data: GMCPMessageClientMidiSystemMessage): void {
    if (midiService.hasOutputDevice) {
      midiService.sendRawMessage(data.data);
    }
  }

  // Handle incoming raw message from server
  handleRawMessage(data: GMCPMessageClientMidiRawMessage): void {
    if (midiService.hasOutputDevice) {
      midiService.sendRawMessage(data.data);
    }
  }

  // Handle MIDI capability announcement
  handleEnable(data: GMCPMessageClientMidiEnable): void {
    // Server is asking about MIDI capability or confirming support
    console.log("Server MIDI enable status:", data.enabled);
  }

  // Advertise MIDI support to server
  advertiseMidiSupport(): void {
    if (!this.isAdvertised) {
      const coreSupports = this.client.gmcpHandlers["Core.Supports"];
      if (coreSupports) {
        coreSupports.sendAdd([{ name: "Client.Midi", version: this.packageVersion || 1 }]);
        this.isAdvertised = true;
        console.log("Advertised MIDI support to server");
      }
    }
  }

  // Remove MIDI support advertisement from server
  unadvertiseMidiSupport(): void {
    if (this.isAdvertised) {
      const coreSupports = this.client.gmcpHandlers["Core.Supports"];
      if (coreSupports) {
        coreSupports.sendRemove(["Client.Midi"]);
        this.isAdvertised = false;
        console.log("Removed MIDI support advertisement from server");
      }
    }
  }

  // Send MIDI capability to server
  sendMidiCapability(): void {
    this.sendData("Enable", {
      enabled: midiService.isSupported && midiService.isInitialized
    });
  }

  // Send manual note with optional duration to server
  sendManualNote(note: number, velocity: number, on: boolean, channel?: number, duration?: number): void {
    const noteData = {
      note,
      velocity,
      on,
      channel: channel || 0
    };
    
    this.sendNoteToServer(noteData, duration);
  }

  // Send all notes off
  sendAllNotesOff(): void {
    midiService.sendAllNotesOff();
    
    // Clear all active note timers
    this.activeNotes.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.activeNotes.clear();
  }

  // Get available devices
  async getInputDevices() {
    const initialized = await this.ensureInitialized();
    if (!initialized) return [];
    return midiService.getInputDevices();
  }

  async getOutputDevices() {
    const initialized = await this.ensureInitialized();
    if (!initialized) return [];
    return midiService.getOutputDevices();
  }

  // Connection status
  get hasInputDevice(): boolean {
    return midiService.hasInputDevice;
  }

  get hasOutputDevice(): boolean {
    return midiService.hasOutputDevice;
  }

  // Set debug callback for UI display
  setDebugCallback(callback: (hex: string, type: string, gmcpMessage: string) => void): void {
    this.debugCallback = callback;
  }

  shutdown(): void {
    midiService.disconnect();
    this.activeNotes.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.activeNotes.clear();
  }
}