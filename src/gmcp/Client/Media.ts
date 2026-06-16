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
import type { EffectSpec } from '../../audio/effects/types';
import { inbound, outbound } from '../../protocol/messages';
import { useSpatialStore } from '../../stores/spatialStore';
import { gmcpJsonMessage } from '../messages';
import { GMCPMessage, GMCPPackage } from '../package';

export class GMCPMessageClientMediaLoad extends GMCPMessage implements ClientMediaLoadPayload {
  public readonly url?: string;
  public readonly name!: string;
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

const mediaChain = gmcpJsonMessage<'Chain', GMCPMessageClientMediaChain>('Chain');
const mediaChainStop = gmcpJsonMessage<
  'ChainStop',
  GMCPMessageClientMediaChainStop
>('ChainStop');
const mediaAutomate = gmcpJsonMessage<
  'Automate',
  GMCPMessageClientMediaAutomate
>('Automate');
const mediaDefault = gmcpJsonMessage<'Default', string>('Default');
const mediaLoad = gmcpJsonMessage<'Load', GMCPMessageClientMediaLoad>('Load');
const mediaPlay = gmcpJsonMessage<'Play', GMCPMessageClientMediaPlay>('Play');
const mediaUpdate = gmcpJsonMessage<'Update', GMCPMessageClientMediaUpdate>('Update');
const mediaStop = gmcpJsonMessage<'Stop', GMCPMessageClientMediaStop>('Stop');
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
    inbound(mediaListenerPosition),
    inbound(mediaListenerOrientation),
    outbound(mediaEffectsSupport),
  ] as const,
});

export class GMCPClientMedia extends GMCPClientMediaBase {
  private unsubscribeSpatialStore: (() => void) | undefined;

  constructor(client: ConstructorParameters<typeof GMCPClientMediaBase>[0]) {
    super(client);
    this.on('chain', (data) => this.handleChain(data));
    this.on('chainStop', (data) => this.handleChainStop(data));
    this.on('automate', (data) => this.handleAutomate(data));
    this.on('default', (data) => this.handleDefault(data));
    this.on('load', (data) => {
      void this.handleLoad(data);
    });
    this.on('play', (data) => {
      void this.handlePlay(data);
    });
    this.on('update', (data) => this.handleUpdate(data));
    this.on('stop', (data) => this.handleStop(data));
    this.on('listenerPosition', (data) => this.handleListenerPosition(data));
    this.on('listenerOrientation', (data) => this.handleListenerOrientation(data));
    this.unsubscribeSpatialStore = useSpatialStore.subscribe(this.handleSpatialStoreChange);
  }

  get sounds(): Record<string, ExtendedSound> {
    return this.client.media.sounds;
  }

  publishEffectsSupport(): void {
    this.sendEffectsSupport(buildEffectsSupport());
  }

  handleChain(data: GMCPMessageClientMediaChain): void {
    this.client.media
      .setChain(data)
      .catch((error) => console.error(`Client.Media.Chain '${data.id}' failed`, error));
  }

  handleChainStop(data: GMCPMessageClientMediaChainStop): void {
    if (data.id) {
      this.client.media.removeChain(data.id);
    }
  }

  handleAutomate(data: GMCPMessageClientMediaAutomate): void {
    this.client.media.automate(data);
  }

  handleDefault(url: string): void {
    this.client.media.handleDefault(url);
  }

  handleLoad(data: GMCPMessageClientMediaLoad): Promise<void> {
    return this.client.media.load(data);
  }

  mediaUrl(data: GMCPMessageClientMediaPlay): string {
    return this.client.media.mediaUrl(data);
  }

  handlePlay(data: GMCPMessageClientMediaPlay): Promise<void> {
    return this.client.media.play(data);
  }

  handleUpdate(data: GMCPMessageClientMediaUpdate): void {
    this.client.media.update(data);
  }

  handleStop(data: GMCPMessageClientMediaStop): void {
    this.client.media.stop(data);
  }

  handleListenerPosition(data: GMCPMessageClientMediaListenerPosition): void {
    this.client.media.setListenerPosition(data.position);
  }

  handleListenerOrientation(data: GMCPMessageClientMediaListenerOrientation): void {
    this.client.media.setListenerOrientation(data);
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

  override shutdown(): void {
    this.unsubscribeSpatialStore?.();
  }

  private readonly handleSpatialStoreChange = (): void => {
    this.client.media.syncAmbisonicRendererYaw();
  };
}
