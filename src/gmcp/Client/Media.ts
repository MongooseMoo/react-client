import type { Position } from 'cacophony';

import type {
  ClientMediaAutomatePayload,
  ClientMediaChainPayload,
  ClientMediaChainStopPayload,
  ClientMediaListenerOrientationPayload,
  ClientMediaListenerPositionPayload,
  ClientMediaLoadPayload,
  ClientMediaPlayPayload,
  ClientMediaStopPayload,
  ClientMediaUpdatePayload,
  ExtendedSound,
  MediaType,
} from '../../audio/MediaService';
import { buildEffectsSupport } from '../../audio/effects/MediaEffects';
import {
  type ClientMediaDefaultPayload,
  decodeMediaAutomate,
  decodeMediaChain,
  decodeMediaChainStop,
  decodeMediaDefault,
  decodeMediaLoad,
  decodeMediaPlay,
  decodeMediaStop,
  decodeMediaUpdate,
  MediaPayloadError,
} from '../../audio/mediaPayloads';
import { errorMessage } from '../../audio/audioDiagnostics';
import {
  mongooseToWebAudioVector,
  mongooseToWebAudioOrientation,
} from '../../audio/mongooseCoordinates';
import type { EffectSpec } from '../../audio/effects/types';
import { midiService } from '../../MidiService';
import { SEQUENCE_SUPPORT } from '../../midi/SequenceOutput';
import { usePreferences } from '../../stores/preferencesStore';
import { duplex, inbound, outbound } from '../../protocol/messages';
import { useSpatialStore } from '../../stores/spatialStore';
import { gmcpJsonMessage } from '../messages';
import { GMCPMessage, GMCPPackage } from '../package';
import {
  decodeMediaSync,
  type MediaSyncReply,
  type MediaSyncRequest,
  type MediaSourceError,
} from '../../audio/SharedMediaPayload';

export class GMCPMessageClientMediaLoad extends GMCPMessage implements ClientMediaLoadPayload {
  public readonly url?: string;
  public readonly name!: string;
  public readonly type?: MediaType = 'sound';
}

export type { ExtendedSound, MediaType };

export class GMCPMessageClientMediaPlay extends GMCPMessage implements ClientMediaPlayPayload {
  public readonly name!: string;
  public readonly url?: string;
  public readonly type?: MediaType = 'sound';
  public readonly tag?: string;
  public readonly volume: number = 50;
  public readonly fadein?: number = 0;
  public readonly fadeout?: number = 0;
  public readonly start: number = 0;
  public readonly loopStart?: number;
  public readonly finish?: number;
  public readonly loops?: number = 0;
  public readonly priority?: number = 0;
  public continue?: boolean = true;
  public key?: string;
  public readonly end?: number = 0;
  public is3d: boolean = false;
  public pan: number = 0;
  public position: number[] = [0, 0, 0];
  public readonly upmix?: string;
  public readonly channels?: number;
  public readonly chain?: string;
  public readonly send?: number;
  public readonly effects?: EffectSpec[];
  public readonly title?: string;
  public readonly artist?: string;
  public readonly album?: string;
  public readonly artwork?: MediaImage[];
}

export class GMCPMessageClientMediaStop extends GMCPMessage implements ClientMediaStopPayload {
  public readonly name?: string;
  public readonly type?: MediaType;
  public readonly tag?: string;
  public readonly priority?: number = 0;
  public readonly key?: string;
}

export class GMCPMessageClientMediaUpdate extends GMCPMessage implements ClientMediaUpdatePayload {
  public readonly name?: string;
  public readonly url?: string;
  public readonly type?: MediaType = 'sound';
  public readonly tag?: string;
  public readonly volume?: number;
  public readonly fadein?: number = 0;
  public readonly fadeout?: number = 0;
  public readonly start?: number = 0;
  public readonly loopStart?: number;
  public readonly finish?: number;
  public readonly loops?: number = 0;
  public readonly priority?: number = 0;
  public continue?: boolean = true;
  public key?: string;
  public readonly end?: number = 0;
  public is3d?: boolean = false;
  public pan?: number = 0;
  public position?: number[] = [0, 0, 0];
  public upmix?: string;
  public channels?: number;
  public readonly chain?: string;
  public readonly send?: number;
  public readonly effects?: EffectSpec[];
}

export class GMCPMessageClientMediaChain extends GMCPMessage implements ClientMediaChainPayload {
  public readonly id!: string;
  public readonly effects?: EffectSpec[];
  public readonly preset?: string;
  public readonly gain?: number;
  public readonly fadein?: number;
}

export class GMCPMessageClientMediaChainStop
  extends GMCPMessage
  implements ClientMediaChainStopPayload
{
  public readonly id!: string;
}

export class GMCPMessageClientMediaAutomate
  extends GMCPMessage
  implements ClientMediaAutomatePayload
{
  public readonly chain?: string;
  public readonly key?: string;
  public readonly target!: string | number;
  public readonly params?: Record<string, number | string>;
  public readonly ramp?: number;
  public readonly curve?: 'linear' | 'exponential';
  public readonly bypass?: boolean;
}

export class GMCPMessageClientMediaListenerOrientation
  extends GMCPMessage
  implements ClientMediaListenerOrientationPayload
{
  public readonly up?: Position;
  public readonly forward?: Position;
}

export class GMCPMessageClientMediaListenerPosition
  extends GMCPMessage
  implements ClientMediaListenerPositionPayload
{
  public readonly position?: Position;
}

/** An inbound-only codec whose decoder validates the wire payload. */
function inboundCodec<Payload>(decode: (raw: unknown) => Payload) {
  return {
    decode,
    encode(payload: Payload): unknown {
      return payload;
    },
  };
}

const mediaChain = gmcpJsonMessage<'Chain', ClientMediaChainPayload>(
  'Chain',
  inboundCodec(decodeMediaChain),
);
const mediaChainStop = gmcpJsonMessage<'ChainStop', ClientMediaChainStopPayload>(
  'ChainStop',
  inboundCodec(decodeMediaChainStop),
);
const mediaAutomate = gmcpJsonMessage<'Automate', ClientMediaAutomatePayload>(
  'Automate',
  inboundCodec(decodeMediaAutomate),
);
const mediaDefault = gmcpJsonMessage<'Default', ClientMediaDefaultPayload>(
  'Default',
  inboundCodec(decodeMediaDefault),
);
const mediaLoad = gmcpJsonMessage<'Load', ClientMediaLoadPayload>(
  'Load',
  inboundCodec(decodeMediaLoad),
);
const mediaPlay = gmcpJsonMessage<'Play', ClientMediaPlayPayload>(
  'Play',
  inboundCodec(decodeMediaPlay),
);
const mediaUpdate = gmcpJsonMessage<'Update', ClientMediaUpdatePayload>(
  'Update',
  inboundCodec(decodeMediaUpdate),
);
const mediaStop = gmcpJsonMessage<'Stop', ClientMediaStopPayload>(
  'Stop',
  inboundCodec(decodeMediaStop),
);
const mediaSync = gmcpJsonMessage<'Sync', MediaSyncReply, MediaSyncRequest>('Sync', {
  decode: decodeMediaSync,
  encode: (value) => value,
});
const mediaSourceError = gmcpJsonMessage<'SourceError', never, MediaSourceError>('SourceError');

/** Log an async Client.Media failure as one bounded line (never an unhandled rejection). */
function logMediaFailure(
  message: string,
  data: { key?: string; name?: string },
  error: unknown,
): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(
    `Client.Media.${message} failed for '${data.key ?? data.name ?? '?'}': ${detail.slice(0, 200)}`,
  );
}
const mediaListenerPosition = gmcpJsonMessage<
  'ListenerPosition',
  GMCPMessageClientMediaListenerPosition
>('ListenerPosition');
const mediaListenerOrientation = gmcpJsonMessage<
  'ListenerOrientation',
  GMCPMessageClientMediaListenerOrientation
>('ListenerOrientation');
const mediaEffectsSupport = gmcpJsonMessage<
  'EffectsSupport',
  never,
  ReturnType<typeof buildEffectsSupport>
>('EffectsSupport');
export function buildPlaybackSupport() {
  return {
    version: 1,
    sharedTransport: true,
    midiSequences: midiService.sequenceOutputAvailable ? SEQUENCE_SUPPORT : false,
  };
}
// Encoding reads the actual selected sink at publication time, including explicit false.
const mediaPlaybackSupport = gmcpJsonMessage<'PlaybackSupport', never, void>('PlaybackSupport', {
  encode: () => buildPlaybackSupport(),
  decode: () => {
    throw new TypeError('PlaybackSupport is outbound only');
  },
});

const GMCPClientMediaBase = GMCPPackage.with({
  packageName: 'Client.Media',
  messages: [
    inbound(mediaChain),
    inbound(mediaChainStop),
    inbound(mediaAutomate),
    inbound(mediaDefault),
    inbound(mediaLoad),
    inbound(mediaPlay),
    inbound(mediaUpdate),
    inbound(mediaStop),
    duplex(mediaSync),
    outbound(mediaSourceError),
    inbound(mediaListenerPosition),
    inbound(mediaListenerOrientation),
    outbound(mediaEffectsSupport),
    outbound(mediaPlaybackSupport),
  ] as const,
});

export class GMCPClientMedia extends GMCPClientMediaBase {
  private unsubscribeSpatialStore: (() => void) | undefined;
  private unsubscribeOutput: (() => void) | undefined;
  private unsubscribeMidiPreference: (() => void) | undefined;

  constructor(client: ConstructorParameters<typeof GMCPClientMediaBase>[0]) {
    super(client);
    this.on('chain', (data) => this.handleChain(data));
    this.on('chainStop', (data) => this.handleChainStop(data));
    this.on('automate', (data) => this.handleAutomate(data));
    this.on('default', (data) => this.handleDefault(data));
    this.on('load', (data) => {
      this.traceWire('validated', data);
      this.handleLoad(data).catch((error) => logMediaFailure('Load', data, error));
    });
    this.on('play', (data) => {
      this.traceWire('validated', data);
      this.handlePlay(data).catch((error) => logMediaFailure('Play', data, error));
    });
    this.on('update', (data) => this.handleUpdate(data));
    this.on('stop', (data) => this.handleStop(data));
    this.on('sync', (data) => this.client.media.receiveMediaSync(data));
    this.on('listenerPosition', (data) => this.handleListenerPosition(data));
    this.on('listenerOrientation', (data) => this.handleListenerOrientation(data));
    this.unsubscribeSpatialStore = useSpatialStore.subscribe(this.handleSpatialStoreChange);
    this.unsubscribeOutput = midiService.subscribeOutput(this.outputChanged);
    this.unsubscribeMidiPreference = usePreferences.subscribe(
      (state) => state.midi.enabled,
      this.outputChanged,
    );
    // Packages can be constructed before their client's media/clock properties.
    queueMicrotask(() => {
      if (this.client.sharedClock && this.client.media) {
        this.client.media.configureSequences(this.client.sharedClock, () =>
          midiService.getSequenceOutput(),
        );
        this.client.media.configureSharedMedia(
          this.client.sharedClock,
          (request) => this.sendSync(request),
          (report) => this.sendSourceError(report),
        );
      }
    });
    if (typeof document !== 'undefined')
      document.addEventListener('visibilitychange', this.visibilityChanged);
  }

  get sounds(): Record<string, ExtendedSound> {
    return this.client.media.sounds;
  }

  /**
   * Trace Load and Play frames as received, and any frame the decoder rejects
   * as INVALID_PAYLOAD. The rejection still propagates to the GMCP session.
   */
  override receiveRegisteredMessage(wireName: string, payload: unknown): boolean {
    const traced = wireName === 'Play' || wireName === 'Load';
    if (traced) {
      this.traceWire('received', payload);
    }
    try {
      return super.receiveRegisteredMessage(wireName, payload);
    } catch (error) {
      if (error instanceof MediaPayloadError) {
        this.traceWire('received', payload, `Client.Media.${wireName}: ${errorMessage(error)}`);
      }
      throw error;
    }
  }

  private traceWire(stage: 'received' | 'validated', payload: unknown, invalid?: string): void {
    const fields =
      payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const text = (value: unknown) => (typeof value === 'string' ? value : undefined);
    this.client.media.diagnostics.record({
      stage,
      key: text(fields.key),
      name: text(fields.name),
      error: invalid === undefined ? undefined : { code: 'INVALID_PAYLOAD', message: invalid },
    });
  }

  publishEffectsSupport(): void {
    this.sendEffectsSupport(buildEffectsSupport());
  }

  handleChain(data: ClientMediaChainPayload): void {
    this.client.media
      .setChain(data)
      .catch((error) => logMediaFailure('Chain', { key: data.id }, error));
  }

  handleChainStop(data: ClientMediaChainStopPayload): void {
    if (data.id) {
      this.client.media.removeChain(data.id);
    }
  }

  handleAutomate(data: ClientMediaAutomatePayload): void {
    this.client.media.automate(data);
  }

  handleDefault(data: ClientMediaDefaultPayload): void {
    this.client.media.handleDefault(data.url);
  }

  async handleLoad(data: ClientMediaLoadPayload): Promise<void> {
    return this.client.media.load(data);
  }

  mediaUrl(data: ClientMediaPlayPayload): string {
    return this.client.media.mediaUrl(data);
  }

  async handlePlay(data: ClientMediaPlayPayload): Promise<void> {
    return this.client.media.play(this.transformSpatialPayload(data));
  }

  handleUpdate(data: ClientMediaUpdatePayload): void {
    this.client.media.update(this.transformSpatialPayload(data));
  }

  handleStop(data: ClientMediaStopPayload): void {
    this.client.media.stop(data);
  }

  handleListenerPosition(data: GMCPMessageClientMediaListenerPosition): void {
    this.client.media.setListenerPosition(mongooseToWebAudioVector(data.position));
  }

  handleListenerOrientation(data: GMCPMessageClientMediaListenerOrientation): void {
    this.client.media.setListenerOrientation(mongooseToWebAudioOrientation(data));
  }

  soundsByName(name: string): ExtendedSound[] {
    return this.client.media.soundsByName(name);
  }

  soundsByKey(key: string): ExtendedSound[] {
    return this.client.media.soundsByKey(key);
  }

  soundsByTag(tag: string): ExtendedSound[] {
    return this.client.media.soundsByTag(tag);
  }

  soundsByType(type: MediaType): ExtendedSound[] {
    return this.client.media.soundsByType(type);
  }

  get allSounds(): ExtendedSound[] {
    return this.client.media.allSounds;
  }

  stopAllSounds(): void {
    this.client.media.stopAllSounds();
  }

  override reset(): void {
    this.client.media.reset();
  }

  override shutdown(): void {
    this.reset();
    this.unsubscribeSpatialStore?.();
    this.unsubscribeOutput?.();
    this.unsubscribeMidiPreference?.();
    if (typeof document !== 'undefined')
      document.removeEventListener('visibilitychange', this.visibilityChanged);
  }
  private readonly outputChanged = (): void => {
    this.client.media?.sequenceOutputChanged();
    if (this.client.sharedClock?.ready) this.sendPlaybackSupport();
  };
  private readonly visibilityChanged = (): void => {
    this.client.media?.setSequencePageHidden(document.hidden);
  };

  private readonly handleSpatialStoreChange = (): void => {
    this.client.media.syncAmbisonicRendererYaw();
  };

  /** Convert MOO east/north/up vectors (position, cone orientation) to Web Audio axes, once. */
  private transformSpatialPayload<
    T extends { position?: number[] | Position; orientation?: number[] },
  >(data: T): T {
    const position = toWebAudio(data.position);
    const orientation = toWebAudio(data.orientation);
    if (!position && !orientation) {
      return data;
    }
    return {
      ...data,
      ...(position ? { position } : {}),
      ...(orientation ? { orientation } : {}),
    };
  }
}

function toWebAudio(vector: readonly number[] | undefined): Position | undefined {
  if (!vector || vector.length < 3) {
    return undefined;
  }
  return mongooseToWebAudioVector([vector[0], vector[1], vector[2]]) ?? undefined;
}
