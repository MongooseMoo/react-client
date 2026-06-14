import { useSessionStore } from '../../stores/sessionStore';
import { useSpatialStore } from '../../stores/spatialStore';
import { inbound } from '../../protocol/messages';
import { gmcpJsonMessage } from '../messages';
import { GMCPMessage, GMCPPackage } from '../package';

export type SpatialVector = [number, number, number];

const DEFAULT_LISTENER_FORWARD: SpatialVector = [0, 0, -1];
const DEFAULT_LISTENER_UP: SpatialVector = [0, 1, 0];

export interface SpatialEntity {
  id: string;
  position: SpatialVector;
  velocity?: SpatialVector;
  forward?: SpatialVector;
  up?: SpatialVector;
  name?: string;
  kind?: string;
  flags?: string[];
}

export interface SpatialEmitter {
  id: string;
  binding: 'entity' | 'world';
  sourceEntity?: string;
  position?: SpatialVector;
  velocity?: SpatialVector;
  offset?: SpatialVector;
  mediaKey?: string;
  mediaType?: string;
  tag?: string;
  loops?: number;
  volume?: number;
  sourceKind?: string;
  // P5 overlay fields (all optional → absent = the world scene, today's behavior).
  /** Overlay id this emitter belongs to. Absent = world (PannerNode) scene. */
  overlay?: string;
  /** Overlay reference frame; "head" = a head-stable instrument (sensor sphere). */
  frame?: 'head' | 'world';
  /** 0..1 — how much of the world shows through under this overlay (transparency duck). */
  transparency?: number;
  /** Overlay stack order (higher = on top). */
  priority?: number;
}

export interface SpatialListenerOrientation {
  forward: SpatialVector | null;
  up: SpatialVector | null;
}

export class GMCPMessageClientSpatialScene extends GMCPMessage {
  roomId: string = '';
  listenerId: string = '';
  listenerPosition?: SpatialVector;
  listenerOrientation?: SpatialListenerOrientation;
  entities: SpatialEntity[] = [];
  emitters: SpatialEmitter[] = [];
}

export class GMCPMessageClientSpatialEntityEnter extends GMCPMessage {
  entity!: SpatialEntity;
}

export class GMCPMessageClientSpatialEntityLeave extends GMCPMessage {
  entityId: string = '';
}

export class GMCPMessageClientSpatialEntityMove extends GMCPMessage {
  entityId: string = '';
  position!: SpatialVector;
  velocity?: SpatialVector;
  forward?: SpatialVector;
  up?: SpatialVector;
}

export class GMCPMessageClientSpatialListenerPosition extends GMCPMessage {
  listenerId?: string;
  position!: SpatialVector;
}

export class GMCPMessageClientSpatialListenerOrientation extends GMCPMessage {
  listenerId?: string;
  forward: SpatialVector | null = null;
  up: SpatialVector | null = null;
}

export class GMCPMessageClientSpatialEmitterStart extends GMCPMessage {
  emitter!: SpatialEmitter;
}

export class GMCPMessageClientSpatialEmitterStop extends GMCPMessage {
  emitterId: string = '';
}

const spatialScene = gmcpJsonMessage<'Scene', GMCPMessageClientSpatialScene>('Scene');
const spatialEntityEnter = gmcpJsonMessage<
  'EntityEnter',
  GMCPMessageClientSpatialEntityEnter
>('EntityEnter');
const spatialEntityLeave = gmcpJsonMessage<
  'EntityLeave',
  GMCPMessageClientSpatialEntityLeave
>('EntityLeave');
const spatialEntityMove = gmcpJsonMessage<
  'EntityMove',
  GMCPMessageClientSpatialEntityMove
>('EntityMove');
const spatialListenerPosition = gmcpJsonMessage<
  'ListenerPosition',
  GMCPMessageClientSpatialListenerPosition
>('ListenerPosition');
const spatialListenerOrientation = gmcpJsonMessage<
  'ListenerOrientation',
  GMCPMessageClientSpatialListenerOrientation
>('ListenerOrientation');
const spatialEmitterStart = gmcpJsonMessage<
  'EmitterStart',
  GMCPMessageClientSpatialEmitterStart
>('EmitterStart');
const spatialEmitterStop = gmcpJsonMessage<
  'EmitterStop',
  GMCPMessageClientSpatialEmitterStop
>('EmitterStop');

const GMCPClientSpatialBase = GMCPPackage.with({
  packageName: 'Client.Spatial',
  messages: [
    inbound(spatialScene),
    inbound(spatialEntityEnter),
    inbound(spatialEntityLeave),
    inbound(spatialEntityMove),
    inbound(spatialListenerPosition),
    inbound(spatialListenerOrientation),
    inbound(spatialEmitterStart),
    inbound(spatialEmitterStop),
  ] as const,
});

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

export class GMCPClientSpatial extends GMCPClientSpatialBase {
  constructor(client: ConstructorParameters<typeof GMCPClientSpatialBase>[0]) {
    super(client);
    this.on('scene', (data) => this.handleScene(data));
    this.on('entityEnter', (data) => this.handleEntityEnter(data));
    this.on('entityLeave', (data) => this.handleEntityLeave(data));
    this.on('entityMove', (data) => this.handleEntityMove(data));
    this.on('listenerPosition', (data) => this.handleListenerPosition(data));
    this.on('listenerOrientation', (data) => this.handleListenerOrientation(data));
    this.on('emitterStart', (data) => this.handleEmitterStart(data));
    this.on('emitterStop', (data) => this.handleEmitterStop(data));
  }

  private syncCacophonyListenerPosition(position: SpatialVector | null | undefined): void {
    this.client.media.setListenerPosition(position ?? [0, 0, 0]);
  }

  private syncCacophonyListenerOrientation(
    orientation: SpatialListenerOrientation | null | undefined,
  ): void {
    this.client.media.setListenerOrientation({
      forward: orientation?.forward ?? DEFAULT_LISTENER_FORWARD,
      up: orientation?.up ?? DEFAULT_LISTENER_UP,
    });
  }

  handleScene(data: GMCPMessageClientSpatialScene): void {
    useSessionStore.getState().setRoomId(data.roomId);
    const listenerPosition = data.listenerPosition ?? null;
    const listenerOrientation = data.listenerOrientation ?? {
      forward: null,
      up: null,
    };
    useSpatialStore.getState().setScene({
      listenerEntityId: data.listenerId,
      listenerPosition,
      listenerOrientation,
      spatialEntities: indexById(data.entities),
      spatialEmitters: indexById(data.emitters),
    });
    this.syncCacophonyListenerPosition(listenerPosition);
    this.syncCacophonyListenerOrientation(listenerOrientation);
  }

  handleEntityEnter(data: GMCPMessageClientSpatialEntityEnter): void {
    useSpatialStore.getState().enterEntity(data.entity);
  }

  handleEntityLeave(data: GMCPMessageClientSpatialEntityLeave): void {
    useSpatialStore.getState().leaveEntity(data.entityId);
  }

  handleEntityMove(data: GMCPMessageClientSpatialEntityMove): void {
    useSpatialStore.getState().moveEntity(data);
  }

  handleListenerPosition(data: GMCPMessageClientSpatialListenerPosition): void {
    useSpatialStore.getState().setListenerPosition(data.position, data.listenerId);
    this.syncCacophonyListenerPosition(data.position);
  }

  handleListenerOrientation(data: GMCPMessageClientSpatialListenerOrientation): void {
    const orientation = { forward: data.forward, up: data.up };
    useSpatialStore.getState().setListenerOrientation(orientation, data.listenerId);
    this.syncCacophonyListenerOrientation(orientation);
  }

  handleEmitterStart(data: GMCPMessageClientSpatialEmitterStart): void {
    useSpatialStore.getState().startEmitter(data.emitter);
  }

  handleEmitterStop(data: GMCPMessageClientSpatialEmitterStop): void {
    useSpatialStore.getState().stopEmitter(data.emitterId);
  }
}
