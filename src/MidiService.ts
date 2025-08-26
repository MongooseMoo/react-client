import { virtualMidiService } from './VirtualMidiService';
import JZZ from 'jzz';
import { preferencesStore } from './PreferencesStore';

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
export type DeviceChangeCallback = (info: { inputs: { added: MidiDevice[], removed: MidiDevice[] }, outputs: { added: MidiDevice[], removed: MidiDevice[] } }) => void;

class MidiService {
  private jzz: any = null;
  private inputDevice: any = null;
  private outputDevice: any = null;
  private inputCallback: MidiInputCallback | null = null;
  private deviceChangeCallbacks: Set<DeviceChangeCallback> = new Set();
  private deviceWatcher: any = null;
  private connectionState: {
    inputConnected: boolean;
    outputConnected: boolean;
    inputDeviceId?: string;
    outputDeviceId?: string;
    inputDeviceName?: string;
    outputDeviceName?: string;
  } = {
    inputConnected: false,
    outputConnected: false
  };

  async initialize(): Promise<boolean> {
    try {
      this.jzz = await JZZ();
      console.log("JZZ MIDI engine initialized");
      
      // Set up device change monitoring
      this.deviceWatcher = this.jzz.onChange((info: any) => {
        const changeInfo = this.processDeviceChanges(info);
        this.deviceChangeCallbacks.forEach(callback => callback(changeInfo));
        
        // Check if connected devices were removed
        this.handleDeviceDisconnections(changeInfo);
      });
      
      // Try to auto-reconnect to last used devices
      await this.attemptAutoReconnect();
      
      return true;
    } catch (error) {
      console.error("Failed to initialize JZZ MIDI engine:", error);
      return false;
    }
  }

  getInputDevices(): MidiDevice[] {
    if (!this.jzz) return [];
    
    const devices: MidiDevice[] = [];
    const info = this.jzz.info();
    
    if (info && info.inputs) {
      info.inputs.forEach((input: any) => {
        devices.push({
          id: input.id || input.name,
          name: input.name || "Unknown Input Device"
        });
      });
    }
    
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
    if (this.jzz) {
      const info = this.jzz.info();
      if (info && info.outputs) {
        info.outputs.forEach((output: any) => {
          devices.push({
            id: output.id || output.name,
            name: output.name || "Unknown Output Device"
          });
        });
      }
    }
    
    return devices;
  }

  async connectInputDevice(deviceId: string, callback: MidiInputCallback): Promise<boolean> {
    if (!this.jzz) return false;

    try {
      // Disconnect previous device
      if (this.inputDevice) {
        this.inputDevice.close();
      }

      // Connect to new device using JZZ
      this.inputDevice = await this.jzz.openMidiIn(deviceId);
      this.inputCallback = callback;

      // Set up message handler
      this.inputDevice.connect((message: any) => {
        const rawData = message.data || message;
        const status = rawData[0];
        
        // SUPPRESS Active Sensing (0xFE) - floods data every ~300ms
        if (status === 0xFE) {
          return;
        }
        
        const messageType = status & 0xf0;
        const channel = status & 0x0f;
        
        // Create raw message for debugging
        const rawMessage: RawMidiMessage = {
          hex: Array.from(rawData).map((b: number) => b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
          data: new Uint8Array(rawData),
          type: this.getMidiMessageType(status)
        };
        
        const midiMessage: MidiMessage = {
          rawData: rawMessage // Always include raw data for debugging
        };
        
        // Categorize messages
        if (messageType === 0x90 || messageType === 0x80) {
          // Note On/Off
          const note = rawData[1];
          const velocity = rawData[2];
          const isNoteOn = messageType === 0x90 && velocity > 0;
          midiMessage.note = { note, velocity, on: isNoteOn, channel };
        } else if (messageType === 0xB0) {
          // Control Change
          const controller = rawData[1];
          const value = rawData[2];
          midiMessage.controlChange = { controller, value, channel };
        } else if (messageType === 0xC0) {
          // Program Change
          const program = rawData[1];
          midiMessage.programChange = { program, channel };
        } else if ((status & 0xF0) === 0xF0) {
          // System Messages
          midiMessage.systemMessage = {
            type: this.getSystemMessageType(status),
            data: Array.from(rawData)
          };
        } else {
          // Unknown/uncategorized - use raw
          midiMessage.raw = rawMessage;
        }
        
        this.inputCallback?.(midiMessage);
      });

      // Update connection state
      this.connectionState.inputConnected = true;
      this.connectionState.inputDeviceId = deviceId;
      
      // Find device name
      const devices = this.getInputDevices();
      const device = devices.find(d => d.id === deviceId);
      this.connectionState.inputDeviceName = device?.name || "Unknown Device";
      
      // Save to preferences for auto-reconnect
      preferencesStore.dispatch({
        type: 'SET_MIDI',
        data: { 
          ...preferencesStore.getState().midi,
          lastInputDeviceId: deviceId
        }
      });

      console.log(`Connected to MIDI input: ${this.connectionState.inputDeviceName}`);
      return true;
    } catch (error) {
      console.error("Failed to connect to MIDI input:", error);
      return false;
    }
  }

  async connectOutputDevice(deviceId: string): Promise<boolean> {
    try {
      // Disconnect previous device
      if (this.outputDevice) {
        this.outputDevice.close?.();
      }

      // Handle virtual synthesizer connection
      if (deviceId === 'virtual-synth') {
        const virtualPort = await virtualMidiService.getVirtualPort();
        if (virtualPort) {
          this.outputDevice = virtualPort;
          this.connectionState.outputConnected = true;
          this.connectionState.outputDeviceId = deviceId;
          this.connectionState.outputDeviceName = virtualMidiService.getPortName();
          
          // Save to preferences for auto-reconnect
          preferencesStore.dispatch({
            type: 'SET_MIDI',
            data: { 
              ...preferencesStore.getState().midi,
              lastOutputDeviceId: deviceId
            }
          });
          
          console.log(`Connected to virtual MIDI synthesizer: ${virtualMidiService.getPortName()}`);
          return true;
        }
        return false;
      }

      // Handle hardware MIDI device connection using JZZ
      if (!this.jzz) return false;

      this.outputDevice = await this.jzz.openMidiOut(deviceId);
      
      // Update connection state
      this.connectionState.outputConnected = true;
      this.connectionState.outputDeviceId = deviceId;
      
      // Find device name
      const devices = this.getOutputDevices();
      const device = devices.find(d => d.id === deviceId);
      this.connectionState.outputDeviceName = device?.name || "Unknown Device";
      
      // Save to preferences for auto-reconnect
      preferencesStore.dispatch({
        type: 'SET_MIDI',
        data: { 
          ...preferencesStore.getState().midi,
          lastOutputDeviceId: deviceId
        }
      });

      console.log(`Connected to MIDI output: ${this.connectionState.outputDeviceName}`);
      return true;
    } catch (error) {
      console.error("Failed to connect to MIDI output:", error);
      return false;
    }
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
      this.inputDevice.close?.();
      this.inputDevice = null;
    }
    if (this.outputDevice) {
      this.outputDevice.close?.();
      this.outputDevice = null;
    }
    this.inputCallback = null;
    
    // Update connection state
    this.connectionState.inputConnected = false;
    this.connectionState.outputConnected = false;
    this.connectionState.inputDeviceId = undefined;
    this.connectionState.outputDeviceId = undefined;
    this.connectionState.inputDeviceName = undefined;
    this.connectionState.outputDeviceName = undefined;
  }

  get isSupported(): boolean {
    return true; // JZZ handles browser compatibility
  }

  get isInitialized(): boolean {
    return !!this.jzz;
  }

  get hasInputDevice(): boolean {
    return this.connectionState.inputConnected;
  }

  get hasOutputDevice(): boolean {
    return this.connectionState.outputConnected;
  }

  get connectionStatus() {
    return { ...this.connectionState };
  }

  // Device change monitoring
  onDeviceChange(callback: DeviceChangeCallback): () => void {
    this.deviceChangeCallbacks.add(callback);
    return () => this.deviceChangeCallbacks.delete(callback);
  }

  // Refresh device list
  refresh(): void {
    if (this.jzz) {
      this.jzz.refresh();
    }
  }

  // Process device changes from JZZ onChange event
  private processDeviceChanges(info: any): { inputs: { added: MidiDevice[], removed: MidiDevice[] }, outputs: { added: MidiDevice[], removed: MidiDevice[] } } {
    const result = {
      inputs: { added: [] as MidiDevice[], removed: [] as MidiDevice[] },
      outputs: { added: [] as MidiDevice[], removed: [] as MidiDevice[] }
    };

    if (info.inputs?.added) {
      info.inputs.added.forEach((input: any) => {
        result.inputs.added.push({
          id: input.id || input.name,
          name: input.name || "Unknown Input Device"
        });
      });
    }

    if (info.inputs?.removed) {
      info.inputs.removed.forEach((input: any) => {
        result.inputs.removed.push({
          id: input.id || input.name,
          name: input.name || "Unknown Input Device"
        });
      });
    }

    if (info.outputs?.added) {
      info.outputs.added.forEach((output: any) => {
        result.outputs.added.push({
          id: output.id || output.name,
          name: output.name || "Unknown Output Device"
        });
      });
    }

    if (info.outputs?.removed) {
      info.outputs.removed.forEach((output: any) => {
        result.outputs.removed.push({
          id: output.id || output.name,
          name: output.name || "Unknown Output Device"
        });
      });
    }

    return result;
  }

  // Handle device disconnections
  private handleDeviceDisconnections(changeInfo: { inputs: { added: MidiDevice[], removed: MidiDevice[] }, outputs: { added: MidiDevice[], removed: MidiDevice[] } }): void {
    // Check if connected input device was removed
    if (this.connectionState.inputConnected && this.connectionState.inputDeviceId) {
      const inputRemoved = changeInfo.inputs.removed.some(device => device.id === this.connectionState.inputDeviceId);
      if (inputRemoved) {
        console.log(`Input device ${this.connectionState.inputDeviceName} was disconnected`);
        this.connectionState.inputConnected = false;
        this.inputDevice = null;
      }
    }

    // Check if connected output device was removed
    if (this.connectionState.outputConnected && this.connectionState.outputDeviceId) {
      const outputRemoved = changeInfo.outputs.removed.some(device => device.id === this.connectionState.outputDeviceId);
      if (outputRemoved) {
        console.log(`Output device ${this.connectionState.outputDeviceName} was disconnected`);
        this.connectionState.outputConnected = false;
        this.outputDevice = null;
      }
    }
  }

  // Attempt auto-reconnection to last used devices
  private async attemptAutoReconnect(): Promise<void> {
    const preferences = preferencesStore.getState().midi;
    
    // For input devices, we need a callback, so we'll defer this until someone actually tries to connect
    // Just log what we would try to reconnect to
    if (preferences.lastInputDeviceId) {
      const inputDevices = this.getInputDevices();
      const lastInputDevice = inputDevices.find(d => d.id === preferences.lastInputDeviceId);
      if (lastInputDevice) {
        console.log(`Input device available for auto-reconnect: ${lastInputDevice.name}`);
      }
    }

    // For output devices, we can attempt reconnection immediately
    if (preferences.lastOutputDeviceId) {
      const outputDevices = this.getOutputDevices();
      const lastOutputDevice = outputDevices.find(d => d.id === preferences.lastOutputDeviceId);
      if (lastOutputDevice) {
        console.log(`Attempting to auto-reconnect to output device: ${lastOutputDevice.name}`);
        await this.connectOutputDevice(preferences.lastOutputDeviceId);
      }
    }
  }

  // Public method to attempt auto-reconnection when callback is available
  async attemptAutoReconnectInput(callback: MidiInputCallback): Promise<boolean> {
    const preferences = preferencesStore.getState().midi;
    
    if (preferences.lastInputDeviceId) {
      const inputDevices = this.getInputDevices();
      const lastInputDevice = inputDevices.find(d => d.id === preferences.lastInputDeviceId);
      if (lastInputDevice) {
        console.log(`Attempting to auto-reconnect to input device: ${lastInputDevice.name}`);
        return await this.connectInputDevice(preferences.lastInputDeviceId, callback);
      }
    }
    
    return false;
  }

  // Check if a device is available for reconnection
  canReconnectToDevice(deviceId: string, type: 'input' | 'output'): boolean {
    const devices = type === 'input' ? this.getInputDevices() : this.getOutputDevices();
    return devices.some(d => d.id === deviceId);
  }

  // Attempt to reconnect to a specific device
  async attemptReconnect(deviceId: string, type: 'input' | 'output'): Promise<boolean> {
    if (type === 'input' && this.inputCallback) {
      return await this.connectInputDevice(deviceId, this.inputCallback);
    } else if (type === 'output') {
      return await this.connectOutputDevice(deviceId);
    }
    return false;
  }

  // Shutdown and cleanup
  shutdown(): void {
    this.disconnect();
    if (this.deviceWatcher) {
      this.deviceWatcher.disconnect();
      this.deviceWatcher = null;
    }
    if (this.jzz) {
      this.jzz.close();
      this.jzz = null;
    }
    this.deviceChangeCallbacks.clear();
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