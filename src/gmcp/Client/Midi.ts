import type { MidiMessage, MidiNote } from "../../MidiService";
import { preferencesStore } from "../../PreferencesStore";
import { GMCPMessage, GMCPPackage } from "../package";

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

type MidiService = typeof import("../../MidiService").midiService;

export class GMCPClientMidi extends GMCPPackage {
  public packageName: string = "Client.Midi";
  public packageVersion?: number = 1;
  private activeNotes: Map<string, NodeJS.Timeout> = new Map();
  private isAdvertised: boolean = false;
  private debugCallback?: (hex: string, type: string, gmcpMessage: string) => void;
  private midiServicePromise: Promise<MidiService> | null = null;
  private serviceInitialized = false;
  private hasInputDeviceConnected = false;
  private hasOutputDeviceConnected = false;

  get enabled(): boolean {
    return preferencesStore.getState().midi.enabled;
  }

  constructor(client: any) {
    super(client);
  }

  private loadMidiService(): Promise<MidiService> {
    if (!this.midiServicePromise) {
      this.midiServicePromise = import("../../MidiService").then(({ midiService }) => midiService);
    }
    return this.midiServicePromise;
  }

  private syncConnectionState(midiService: MidiService): void {
    const status = midiService.connectionStatus;
    this.hasInputDeviceConnected = status.inputConnected;
    this.hasOutputDeviceConnected = status.outputConnected;
  }

  async ensureInitialized(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    if (this.serviceInitialized) {
      return true;
    }

    const midiService = await this.loadMidiService();
    if (!midiService.isSupported) {
      console.log("MIDI not supported in this browser");
      return false;
    }

    const success = await midiService.initialize();
    this.serviceInitialized = midiService.isInitialized;
    this.syncConnectionState(midiService);
    if (success) {
      console.log("MIDI service initialized");

      await midiService.attemptAutoReconnectInput((message) => {
        this.handleInputMessage(message);
      });
    }
    return success;
  }

  get isInitialized(): boolean {
    return this.serviceInitialized;
  }

  public async connectInputDevice(deviceId: string): Promise<boolean> {
    const initialized = await this.ensureInitialized();
    if (!initialized) return false;

    const midiService = await this.loadMidiService();
    const connected = await midiService.connectInputDevice(deviceId, (message: MidiMessage) => {
      this.handleInputMessage(message);
    });
    this.syncConnectionState(midiService);
    return connected;
  }

  public async connectOutputDevice(deviceId: string): Promise<boolean> {
    const initialized = await this.ensureInitialized();
    if (!initialized) return false;

    const midiService = await this.loadMidiService();
    const connected = await midiService.connectOutputDevice(deviceId);
    this.syncConnectionState(midiService);
    return connected;
  }

  private handleInputMessage(message: MidiMessage): void {
    let gmcpMessage = "";

    const hex = message.rawData.hex;
    const type = message.rawData.type;

    if (message.note) {
      const noteData = {
        note: message.note.note,
        velocity: message.note.velocity,
        on: message.note.on,
        channel: message.note.channel,
      };
      this.sendData("Note", noteData);
      gmcpMessage = `Client.Midi.Note ${JSON.stringify(noteData)}`;
    } else if (message.controlChange) {
      const ccData = {
        controller: message.controlChange.controller,
        value: message.controlChange.value,
        channel: message.controlChange.channel,
      };
      this.sendData("ControlChange", ccData);
      gmcpMessage = `Client.Midi.ControlChange ${JSON.stringify(ccData)}`;
    } else if (message.programChange) {
      const pcData = {
        program: message.programChange.program,
        channel: message.programChange.channel,
      };
      this.sendData("ProgramChange", pcData);
      gmcpMessage = `Client.Midi.ProgramChange ${JSON.stringify(pcData)}`;
    } else if (message.systemMessage) {
      const sysData = {
        type: message.systemMessage.type,
        data: message.systemMessage.data,
      };
      this.sendData("SystemMessage", sysData);
      gmcpMessage = `Client.Midi.SystemMessage ${JSON.stringify(sysData)}`;
    } else if (message.raw) {
      const rawData = {
        hex: message.raw.hex,
        data: Array.from(message.raw.data),
        type: message.raw.type,
      };
      this.sendData("RawMessage", rawData);
      gmcpMessage = `Client.Midi.RawMessage ${JSON.stringify(rawData)}`;
    }

    if (this.debugCallback && gmcpMessage) {
      this.debugCallback(hex, type, gmcpMessage);
    }
  }

  private sendNoteToServer(note: MidiNote, duration?: number): void {
    const noteData: any = {
      note: note.note,
      velocity: note.velocity,
      on: note.on,
      channel: note.channel,
    };

    if (duration !== undefined) {
      noteData.duration = duration;
    }

    this.sendData("Note", noteData);
  }

  handleNote(data: GMCPMessageClientMidiNote): void {
    if (!this.enabled) return;
    void this.handleNoteAsync(data);
  }

  private async handleNoteAsync(data: GMCPMessageClientMidiNote): Promise<void> {
    const midiService = await this.loadMidiService();
    const note: MidiNote = {
      note: data.note,
      velocity: data.velocity,
      on: data.on,
      channel: data.channel,
    };

    const noteKey = `${data.note}_${data.channel || 0}`;
    if (this.activeNotes.has(noteKey)) {
      clearTimeout(this.activeNotes.get(noteKey)!);
      this.activeNotes.delete(noteKey);
    }

    midiService.sendNote(note);

    if (data.on && data.duration) {
      const timeout = setTimeout(() => {
        midiService.sendNote({
          ...note,
          on: false,
          velocity: 0,
        });
        this.activeNotes.delete(noteKey);
      }, data.duration);

      this.activeNotes.set(noteKey, timeout);
    }
  }

  handleControlChange(data: GMCPMessageClientMidiControlChange): void {
    if (!this.enabled) return;
    void this.sendRawIfOutputConnected([0xB0 | data.channel, data.controller, data.value]);
  }

  handleProgramChange(data: GMCPMessageClientMidiProgramChange): void {
    if (!this.enabled) return;
    void this.sendRawIfOutputConnected([0xC0 | data.channel, data.program]);
  }

  handleSystemMessage(data: GMCPMessageClientMidiSystemMessage): void {
    if (!this.enabled) return;
    void this.sendRawIfOutputConnected(data.data);
  }

  handleRawMessage(data: GMCPMessageClientMidiRawMessage): void {
    if (!this.enabled) return;
    void this.sendRawIfOutputConnected(data.data);
  }

  private async sendRawIfOutputConnected(data: number[]): Promise<void> {
    const midiService = await this.loadMidiService();
    this.syncConnectionState(midiService);
    if (midiService.hasOutputDevice) {
      midiService.sendRawMessage(data);
    }
  }

  handleEnable(data: GMCPMessageClientMidiEnable): void {
    console.log("Server MIDI enable status:", data.enabled);
  }

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

  sendMidiCapability(): void {
    if (!this.enabled) {
      this.sendData("Enable", { enabled: false });
      return;
    }

    void this.loadMidiService().then((midiService) => {
      this.sendData("Enable", {
        enabled: midiService.isSupported && midiService.isInitialized,
      });
    });
  }

  sendManualNote(note: number, velocity: number, on: boolean, channel?: number, duration?: number): void {
    const noteData = {
      note,
      velocity,
      on,
      channel: channel || 0,
    };

    this.sendNoteToServer(noteData, duration);
  }

  sendAllNotesOff(): void {
    if (this.enabled) {
      void this.loadMidiService().then((midiService) => {
        midiService.sendAllNotesOff();
      });
    }

    this.activeNotes.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.activeNotes.clear();
  }

  async getInputDevices() {
    const initialized = await this.ensureInitialized();
    if (!initialized) return [];

    const midiService = await this.loadMidiService();
    return midiService.getInputDevices();
  }

  async getOutputDevices() {
    const initialized = await this.ensureInitialized();
    if (!initialized) return [];

    const midiService = await this.loadMidiService();
    return midiService.getOutputDevices();
  }

  get hasInputDevice(): boolean {
    return this.hasInputDeviceConnected;
  }

  get hasOutputDevice(): boolean {
    return this.hasOutputDeviceConnected;
  }

  setDebugCallback(callback: (hex: string, type: string, gmcpMessage: string) => void): void {
    this.debugCallback = callback;
  }

  shutdown(): void {
    if (this.midiServicePromise) {
      void this.midiServicePromise.then((midiService) => {
        midiService.disconnect();
        this.syncConnectionState(midiService);
      });
    }
    this.activeNotes.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.activeNotes.clear();
  }
}
