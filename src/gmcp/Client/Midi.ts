import type { MidiMessage, MidiNote } from '../../MidiService';
import { usePreferences } from '../../stores/preferencesStore';
import { duplex, inbound } from '../../protocol/messages';
import { decodeMidiRoute, type MidiRoute } from '../../audio/MidiAudioRoute';
import {
  decodeLiveNote,
  decodeLiveControl,
  decodeLiveProgram,
  decodeLiveReleaseAll,
  type LiveNote,
  type LiveControl,
  type LiveProgram,
} from '../../midi/LiveOriginProtocol';
import type { LiveOriginRenderer } from '../../midi/LiveOriginRenderer';
import { gmcpJsonMessage } from '../messages';
import { GMCPMessage, GMCPPackage } from '../package';
import { WorldMusicClient } from '../../composition/world/WorldMusicClient';
import { object } from '../../composition/world/protocol';

export class GMCPMessageClientMidiNote extends GMCPMessage {
  readonly note!: number;
  readonly velocity!: number;
  readonly on!: boolean;
  readonly channel?: number;
  readonly duration?: number;
  readonly originId?: string;
  readonly eventId?: number;
}
export class GMCPMessageClientMidiControlChange extends GMCPMessage {
  readonly controller!: number;
  readonly value!: number;
  readonly channel!: number;
  readonly originId?: string;
}
export class GMCPMessageClientMidiProgramChange extends GMCPMessage {
  readonly program!: number;
  readonly channel!: number;
  readonly originId?: string;
}
export class GMCPMessageClientMidiEnable extends GMCPMessage {
  readonly enabled!: boolean;
}
type MidiService = typeof import('../../MidiService').midiService;
const midiNote = gmcpJsonMessage<'Note', LiveNote, GMCPMessageClientMidiNote>('Note', {
  decode: decodeLiveNote,
  encode: decodeLiveNote,
});
const midiControl = gmcpJsonMessage<
  'ControlChange',
  LiveControl,
  GMCPMessageClientMidiControlChange
>('ControlChange', { decode: decodeLiveControl, encode: decodeLiveControl });
const midiProgram = gmcpJsonMessage<
  'ProgramChange',
  LiveProgram,
  GMCPMessageClientMidiProgramChange
>('ProgramChange', { decode: decodeLiveProgram, encode: decodeLiveProgram });
const midiEnable = gmcpJsonMessage<'Enable', GMCPMessageClientMidiEnable>('Enable', {
  decode: (value: unknown) => {
    if (
      !value ||
      typeof value !== 'object' ||
      !('enabled' in value) ||
      (typeof value.enabled !== 'boolean' && value.enabled !== 0 && value.enabled !== 1)
    )
      throw new TypeError('Invalid MIDI enable message');
    return { enabled: value.enabled === true || value.enabled === 1 };
  },
  encode: (value) => value,
});
const midiRoute = gmcpJsonMessage<'Route', MidiRoute>('Route', {
  decode: decodeMidiRoute,
  encode: (value) => value,
});
const midiReleaseAll = gmcpJsonMessage<'NoteReleaseAll', { originId: string }>('NoteReleaseAll', {
  decode: decodeLiveReleaseAll,
  encode: (value) => value,
});
const midiEditorReply = gmcpJsonMessage<
  'EditorReply',
  Record<string, unknown> & { requestId: string }
>('EditorReply', {
  decode: (value: unknown) => {
    const reply = object(value);
    if (typeof reply.requestId !== 'string') throw new TypeError('Invalid editor reply identity');
    return { ...reply, requestId: reply.requestId };
  },
  encode: (value) => value,
});
const GMCPClientMidiBase = GMCPPackage.with({
  packageName: 'Client.Midi',
  messages: [
    duplex(midiNote),
    duplex(midiControl),
    duplex(midiProgram),
    duplex(midiEnable),
    inbound(midiRoute),
    inbound(midiReleaseAll),
    inbound(midiEditorReply),
  ] as const,
});

/** Version 2 relays only validated notes, whitelisted controls and programs. */
export class GMCPClientMidi extends GMCPClientMidiBase {
  public packageVersion = 2;
  readonly world: WorldMusicClient;
  private isAdvertised = false;
  private debugCallback?: (hex: string, type: string, gmcpMessage: string) => void;
  private midiServicePromise?: Promise<MidiService>;
  private serviceInitialized = false;
  private hasInputDeviceConnected = false;
  private hasOutputDeviceConnected = false;
  private renderer?: LiveOriginRenderer;
  private rendererPromise?: Promise<LiveOriginRenderer>;
  private rendererGeneration = 0;
  private closed = false;
  private releases: Array<() => void> = [];
  private readonly outgoing = new Map<string, MidiNote>();
  private readonly outgoingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly pedals = new Set<number>();
  private readonly relaySuspensions = new Set<symbol>();
  private readonly panicListeners = new Set<() => void>();
  private readonly statusListeners = new Set<() => void>();
  private status = '';
  get enabled(): boolean {
    return usePreferences.getState().midi.enabled;
  }
  constructor(
    client: ConstructorParameters<typeof GMCPClientMidiBase>[0],
    private readonly rendererFactory?: () => Promise<LiveOriginRenderer>,
  ) {
    super(client);
    this.world = new WorldMusicClient(
      (name, payload) => this.client.gmcp.send(name, payload),
      () => this.client.connected && this.client.gmcp.ready,
    );
    this.on('editorReply', (reply) => this.world.receive(reply));
    this.on('note', (data) => this.handleNote(data));
    this.on('controlChange', (data) => this.handleControlChange(data));
    this.on('programChange', (data) => this.handleProgramChange(data));
    this.on('enable', (data) => this.handleEnable(data));
    this.on('noteReleaseAll', (data) => {
      const generation = this.rendererGeneration;
      void this.rendererPromise
        ?.then((renderer) => {
          if (generation === this.rendererGeneration) renderer.releaseAll(data.originId);
        })
        .catch((error) => this.report(String(error)));
    });
    this.on('route', (data) => {
      if (this.enabled) this.client.media.setMidiRoute(data);
    });
    if (client.media?.subscribePlayback)
      this.releases.push(
        client.media.subscribePlayback(() => {
          if (client.media.paused) this.clearLive();
        }),
      );
    this.releases.push(
      usePreferences.subscribe((state, previous) => {
        if (previous.midi.enabled && !state.midi.enabled) {
          this.releaseOutgoing();
          this.clearLive();
        }
      }),
    );
  }
  getLiveStatus = () => this.status;
  subscribeLiveStatus = (listener: () => void) => {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  };
  private report(message: string): void {
    if (message === this.status) return;
    this.status = message;
    for (const listener of this.statusListeners) listener();
  }
  private clearLive(): void {
    this.rendererGeneration++;
    this.renderer?.reset();
    this.renderer = undefined;
    this.rendererPromise = undefined;
  }
  private loadMidiService(): Promise<MidiService> {
    if (!this.midiServicePromise)
      this.midiServicePromise = import('../../MidiService').then(({ midiService }) => {
        if (!this.closed && midiService.subscribeOutput)
          this.releases.push(
            midiService.subscribeOutput(() => {
              this.clearLive();
              this.syncConnectionState(midiService);
            }),
          );
        return midiService;
      });
    return this.midiServicePromise;
  }
  private loadRenderer(): Promise<LiveOriginRenderer> {
    if (this.rendererPromise) return this.rendererPromise;
    const generation = this.rendererGeneration;
    this.rendererPromise = (
      this.rendererFactory
        ? this.rendererFactory()
        : import('../../midi/LiveOriginRenderer').then(
            ({ LiveOriginRenderer }) =>
              new LiveOriginRenderer({
                getOutput: async () => {
                  const service = await this.loadMidiService();
                  if (!this.enabled || this.closed || this.client.media.paused) return null;
                  const output = await service.getSequenceOutput();
                  if (!output)
                    this.report('Choose a browser MIDI output that supports independent voices.');
                  return output;
                },
                getDestination: (context) => {
                  const output = this.client.media.getMidiAudioOutput();
                  if (context !== output.context)
                    throw new Error('MIDI output belongs to a different audio context');
                  return output.destination;
                },
                error: (message) => this.report(message),
              }),
          )
    ).then((renderer) => {
      if (generation !== this.rendererGeneration || this.closed) renderer.reset();
      else this.renderer = renderer;
      return renderer;
    });
    return this.rendererPromise;
  }
  private syncConnectionState(service: MidiService): void {
    this.hasInputDeviceConnected = service.connectionStatus.inputConnected;
    this.hasOutputDeviceConnected = service.connectionStatus.outputConnected;
  }
  async ensureInitialized(): Promise<boolean> {
    if (!this.enabled || this.closed) return false;
    if (this.serviceInitialized) return true;
    const service = await this.loadMidiService();
    if (!service.isSupported) return false;
    const success = await service.initialize();
    this.serviceInitialized = service.isInitialized;
    this.syncConnectionState(service);
    if (success && !this.closed)
      await service.attemptAutoReconnectInput((message) => this.handleInputMessage(message));
    return success;
  }
  get isInitialized(): boolean {
    return this.serviceInitialized;
  }
  async connectInputDevice(deviceId: string): Promise<boolean> {
    if (!(await this.ensureInitialized())) return false;
    this.releaseOutgoing();
    const service = await this.loadMidiService();
    const connected = await service.connectInputDevice(deviceId, (message) =>
      this.handleInputMessage(message),
    );
    this.syncConnectionState(service);
    return connected;
  }
  async connectOutputDevice(deviceId: string): Promise<boolean> {
    if (!(await this.ensureInitialized())) return false;
    const service = await this.loadMidiService();
    const connected = await service.connectOutputDevice(deviceId);
    this.syncConnectionState(service);
    return connected;
  }
  /** Suppress new room onsets during private capture; timestamp subscribers stay attached. */
  suspendInputRelay(): () => void {
    const lease = Symbol('private MIDI recording');
    if (!this.relaySuspensions.size) this.releaseOutgoing();
    this.relaySuspensions.add(lease);
    return () => {
      this.relaySuspensions.delete(lease);
    };
  }
  private trackOutgoing(data: MidiNote, duration?: number): void {
    const key = `${data.channel ?? 0}:${data.note}`;
    const timer = this.outgoingTimers.get(key);
    if (timer !== undefined) clearTimeout(timer);
    this.outgoingTimers.delete(key);
    if (!data.on) {
      this.outgoing.delete(key);
      return;
    }
    this.outgoing.set(key, data);
    if (duration !== undefined)
      this.outgoingTimers.set(
        key,
        setTimeout(() => {
          if (this.outgoing.get(key) === data) this.outgoing.delete(key);
          this.outgoingTimers.delete(key);
        }, duration),
      );
  }
  private releaseOutgoing(): void {
    for (const note of this.outgoing.values()) this.sendNote({ ...note, on: false, velocity: 0 });
    for (const channel of this.pedals)
      this.sendControlChange({ channel, controller: 64, value: 0 });
    for (const timer of this.outgoingTimers.values()) clearTimeout(timer);
    this.outgoingTimers.clear();
    this.outgoing.clear();
    this.pedals.clear();
  }
  private handleInputMessage(message: MidiMessage): void {
    if (!this.enabled || this.closed) return;
    let frame = '';
    if (message.note) {
      const data = decodeLiveNote({ ...message.note, channel: message.note.channel ?? 0 });
      const key = `${data.channel}:${data.note}`;
      if (data.on) {
        if (this.relaySuspensions.size || (!this.outgoing.has(key) && this.outgoing.size >= 128))
          return;
      } else if (!this.outgoing.has(key)) return;
      this.trackOutgoing(data);
      this.sendNote(data);
      frame = `Client.Midi.Note ${JSON.stringify(data)}`;
    } else if (message.controlChange) {
      const raw = message.controlChange;
      if (![7, 10, 11, 64].includes(raw.controller)) return;
      const data = decodeLiveControl(raw);
      if (
        this.relaySuspensions.size &&
        !(data.controller === 64 && data.value < 64 && this.pedals.has(data.channel))
      )
        return;
      if (data.controller === 64) {
        if (data.value >= 64) this.pedals.add(data.channel);
        else this.pedals.delete(data.channel);
      }
      this.sendControlChange(data);
      frame = `Client.Midi.ControlChange ${JSON.stringify(data)}`;
    } else if (message.programChange && !this.relaySuspensions.size) {
      const data = decodeLiveProgram(message.programChange);
      this.sendProgramChange(data);
      frame = `Client.Midi.ProgramChange ${JSON.stringify(data)}`;
    }
    if (frame) this.debugCallback?.(message.rawData.hex, message.rawData.type, frame);
  }
  handleNote(data: GMCPMessageClientMidiNote): void {
    const note = decodeLiveNote(data);
    if (!this.enabled || (this.client.media?.paused && note.on)) return;
    const generation = this.rendererGeneration;
    void this.loadRenderer()
      .then((renderer) => {
        if (generation === this.rendererGeneration && this.enabled) return renderer.note(note);
      })
      .catch((error) => this.report(error instanceof Error ? error.message : String(error)));
  }
  handleControlChange(data: GMCPMessageClientMidiControlChange): void {
    const control = decodeLiveControl(data);
    if (!this.enabled) return;
    const generation = this.rendererGeneration;
    void this.loadRenderer()
      .then((renderer) => {
        if (generation === this.rendererGeneration && this.enabled) renderer.control(control);
      })
      .catch((error) => this.report(String(error)));
  }
  handleProgramChange(data: GMCPMessageClientMidiProgramChange): void {
    const program = decodeLiveProgram(data);
    if (!this.enabled) return;
    const generation = this.rendererGeneration;
    void this.loadRenderer()
      .then((renderer) => {
        if (generation === this.rendererGeneration && this.enabled) renderer.program(program);
      })
      .catch((error) => this.report(String(error)));
  }
  handleEnable(_data: GMCPMessageClientMidiEnable): void {}
  advertiseMidiSupport(): void {
    const supports = this.client.gmcp.handlers['Core.Supports'];
    if (!this.isAdvertised && supports) {
      supports.sendSet(supports.advertisedModules());
      this.isAdvertised = true;
    }
  }
  unadvertiseMidiSupport(): void {
    this.releaseOutgoing();
    this.clearLive();
    const supports = this.client.gmcp.handlers['Core.Supports'];
    if (this.isAdvertised && supports) {
      supports.sendRemove(['Client.Midi']);
      this.isAdvertised = false;
    }
  }
  sendMidiCapability(): void {
    if (!this.enabled) {
      this.sendEnable({ enabled: false });
      return;
    }
    void this.loadMidiService()
      .then((service) =>
        this.sendEnable({
          enabled: this.enabled && !this.closed && service.isSupported && service.isInitialized,
        }),
      )
      .catch((error) => this.report(String(error)));
  }
  sendManualNote(
    note: number,
    velocity: number,
    on: boolean,
    channel = 0,
    duration?: number,
  ): void {
    const data = decodeLiveNote({
      note,
      velocity,
      on,
      channel,
      ...(duration === undefined ? {} : { duration }),
    });
    if (!this.enabled) return;
    if (this.relaySuspensions.size) return;
    if (!on && !this.outgoing.has(`${channel}:${note}`)) return;
    if (on && !this.outgoing.has(`${channel}:${note}`) && this.outgoing.size >= 128)
      throw new RangeError('Too many outstanding MIDI notes');
    this.trackOutgoing(data, duration);
    this.sendNote(data);
  }
  subscribePanic(listener: () => void): () => void {
    this.panicListeners.add(listener);
    return () => {
      this.panicListeners.delete(listener);
    };
  }
  /** Explicit user panic owns the selected MIDI port and all client MIDI sources. */
  sendAllNotesOff(): void {
    this.releaseOutgoing();
    this.clearLive();
    this.client.media?.panicSequences?.();
    for (const listener of this.panicListeners) listener();
    if (this.enabled)
      void this.loadMidiService()
        .then((service) => service.sendAllNotesOff())
        .catch((error) => this.report(String(error)));
  }
  async getInputDevices() {
    return (await this.ensureInitialized()) ? (await this.loadMidiService()).getInputDevices() : [];
  }
  async getOutputDevices() {
    return (await this.ensureInitialized())
      ? (await this.loadMidiService()).getOutputDevices()
      : [];
  }
  get hasInputDevice(): boolean {
    return this.hasInputDeviceConnected;
  }
  get hasOutputDevice(): boolean {
    return this.hasOutputDeviceConnected;
  }
  setDebugCallback(callback: (hex: string, type: string, message: string) => void): void {
    this.debugCallback = callback;
  }
  override reset(): void {
    this.world.reset();
    this.clearLive();
    for (const timer of this.outgoingTimers.values()) clearTimeout(timer);
    this.outgoingTimers.clear();
    this.outgoing.clear();
    this.pedals.clear();
    this.isAdvertised = false;
  }
  shutdown(): void {
    this.closed = true;
    this.reset();
    this.relaySuspensions.clear();
    for (const release of this.releases.splice(0)) release();
    this.panicListeners.clear();
    this.statusListeners.clear();
    if (this.midiServicePromise)
      void this.midiServicePromise
        .then((service) => {
          service.disconnect();
          this.syncConnectionState(service);
        })
        .catch((error) => this.report(String(error)));
  }
}
