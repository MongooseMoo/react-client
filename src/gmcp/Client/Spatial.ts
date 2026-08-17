import { useSessionStore } from '../../stores/sessionStore';
import { useSpatialStore } from '../../stores/spatialStore';
import { mongooseToWebAudioVector } from '../../audio/mongooseCoordinates';
import { VectorTweener } from '../../audio/vectorTween';
import { inbound } from '../../protocol/messages';
import { gmcpJsonMessage } from '../messages';
import { GMCPMessage, GMCPPackage } from '../package';

export type SpatialVector = [number, number, number];

const DEFAULT_LISTENER_FORWARD: SpatialVector = [0, 0, -1];
const DEFAULT_LISTENER_UP: SpatialVector = [0, 1, 0];

/** Duration of an orientation glide. Turns are at most 90° server-side, so a
 *  short fixed window reads as a head turn rather than a swap of sides. */
const ORIENTATION_TWEEN_MS = 150;

const LISTENER_POSITION_KEY = 'listener:position';
const LISTENER_FORWARD_KEY = 'listener:forward';
const LISTENER_UP_KEY = 'listener:up';

function entityPositionKey(entityId: string): string {
  return `entity:${entityId}:position`;
}

function entityForwardKey(entityId: string): string {
  return `entity:${entityId}:forward`;
}

function magnitude(vector: SpatialVector | null | undefined): number | undefined {
  if (!vector || vector.length < 3) {
    return undefined;
  }
  const length = Math.hypot(vector[0], vector[1], vector[2]);
  return Number.isFinite(length) && length > 0 ? length : undefined;
}

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

function transformEntity(entity: SpatialEntity): SpatialEntity {
  return {
    ...entity,
    position: mongooseToWebAudioVector(entity.position) ?? [0, 0, 0],
    velocity: mongooseToWebAudioVector(entity.velocity) ?? undefined,
    forward: mongooseToWebAudioVector(entity.forward) ?? undefined,
    up: mongooseToWebAudioVector(entity.up) ?? undefined,
  };
}

function transformEmitter(emitter: SpatialEmitter): SpatialEmitter {
  return {
    ...emitter,
    position: mongooseToWebAudioVector(emitter.position) ?? undefined,
    velocity: mongooseToWebAudioVector(emitter.velocity) ?? undefined,
    offset: mongooseToWebAudioVector(emitter.offset) ?? undefined,
  };
}

export class GMCPClientSpatial extends GMCPClientSpatialBase {
  /** Interpolates GMCP position/orientation steps into per-frame glides. */
  readonly motion: VectorTweener;

  constructor(
    client: ConstructorParameters<typeof GMCPClientSpatialBase>[0],
    motion: VectorTweener = new VectorTweener(),
  ) {
    super(client);
    this.motion = motion;
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

  /** Listener walk speed for position glides: last-known velocity magnitude. */
  private listenerSpeed(): number | undefined {
    const state = useSpatialStore.getState();
    return magnitude(state.spatialEntities[state.listenerEntityId]?.velocity);
  }

  handleScene(data: GMCPMessageClientSpatialScene): void {
    // A scene snapshot is a hard cut (room change) — never glide across it.
    this.motion.cancelAll();
    useSessionStore.getState().setRoomId(data.roomId);
    const listenerPosition = mongooseToWebAudioVector(data.listenerPosition);
    const listenerOrientation = {
      forward: mongooseToWebAudioVector(data.listenerOrientation?.forward),
      up: mongooseToWebAudioVector(data.listenerOrientation?.up),
    };
    useSpatialStore.getState().setScene({
      listenerEntityId: data.listenerId,
      listenerPosition,
      listenerOrientation,
      spatialEntities: indexById(data.entities.map(transformEntity)),
      spatialEmitters: indexById(data.emitters.map(transformEmitter)),
    });
    this.syncCacophonyListenerPosition(listenerPosition);
    this.syncCacophonyListenerOrientation(listenerOrientation);
  }

  handleEntityEnter(data: GMCPMessageClientSpatialEntityEnter): void {
    // A fresh entity has no prior pose to glide from — place it directly.
    this.motion.cancel(entityPositionKey(data.entity.id));
    this.motion.cancel(entityForwardKey(data.entity.id));
    useSpatialStore.getState().enterEntity(transformEntity(data.entity));
  }

  handleEntityLeave(data: GMCPMessageClientSpatialEntityLeave): void {
    this.motion.cancel(entityPositionKey(data.entityId));
    this.motion.cancel(entityForwardKey(data.entityId));
    useSpatialStore.getState().leaveEntity(data.entityId);
  }

  handleEntityMove(data: GMCPMessageClientSpatialEntityMove): void {
    const entityId = data.entityId;
    const position = mongooseToWebAudioVector(data.position) ?? [0, 0, 0];
    const velocity = mongooseToWebAudioVector(data.velocity) ?? undefined;
    const forward = mongooseToWebAudioVector(data.forward) ?? undefined;
    const up = mongooseToWebAudioVector(data.up) ?? undefined;
    const store = useSpatialStore.getState();
    const current = store.spatialEntities[entityId];

    // Velocity and up land immediately; position and forward glide below.
    store.patchEntity(entityId, {
      velocity: velocity ?? current?.velocity,
      up: up ?? current?.up,
    });

    this.motion.tween(
      entityPositionKey(entityId),
      current?.position,
      position,
      (value, done) => {
        useSpatialStore.getState().patchEntity(entityId, { position: value });
        if (done && entityId === useSpatialStore.getState().listenerEntityId) {
          // The listener's own entity doubles as the cacophony listener.
          this.syncCacophonyListenerPosition(value);
        }
      },
      { speed: magnitude(velocity) },
    );

    if (forward) {
      this.motion.tween(
        entityForwardKey(entityId),
        current?.forward,
        forward,
        (value) => {
          useSpatialStore.getState().patchEntity(entityId, { forward: value });
        },
        { durationMs: ORIENTATION_TWEEN_MS, normalize: true },
      );
    }
  }

  handleListenerPosition(data: GMCPMessageClientSpatialListenerPosition): void {
    const position = mongooseToWebAudioVector(data.position);
    if (!position) {
      return;
    }
    this.motion.tween(
      LISTENER_POSITION_KEY,
      useSpatialStore.getState().listenerPosition,
      position,
      (value) => {
        useSpatialStore.getState().setListenerPosition(value, data.listenerId);
        this.syncCacophonyListenerPosition(value);
      },
      { speed: this.listenerSpeed() },
    );
  }

  handleListenerOrientation(data: GMCPMessageClientSpatialListenerOrientation): void {
    const forward = mongooseToWebAudioVector(data.forward);
    const up = mongooseToWebAudioVector(data.up);
    const applyAxis = (axis: 'forward' | 'up') => (value: SpatialVector | null) => {
      const state = useSpatialStore.getState();
      const orientation = { ...state.listenerOrientation, [axis]: value };
      state.setListenerOrientation(orientation, data.listenerId);
      this.syncCacophonyListenerOrientation(orientation);
    };
    this.tweenOrientationAxis(LISTENER_FORWARD_KEY, forward, applyAxis('forward'));
    this.tweenOrientationAxis(LISTENER_UP_KEY, up, applyAxis('up'));
  }

  /** Glide one orientation axis from its stored value; null clears directly. */
  private tweenOrientationAxis(
    key: string,
    target: SpatialVector | null,
    apply: (value: SpatialVector | null) => void,
  ): void {
    if (!target) {
      this.motion.cancel(key);
      apply(null);
      return;
    }
    const axis = key === LISTENER_UP_KEY ? 'up' : 'forward';
    const current = useSpatialStore.getState().listenerOrientation[axis];
    this.motion.tween(key, current, target, (value) => apply(value), {
      durationMs: ORIENTATION_TWEEN_MS,
      normalize: true,
    });
  }

  handleEmitterStart(data: GMCPMessageClientSpatialEmitterStart): void {
    useSpatialStore.getState().startEmitter(transformEmitter(data.emitter));
  }

  handleEmitterStop(data: GMCPMessageClientSpatialEmitterStop): void {
    useSpatialStore.getState().stopEmitter(data.emitterId);
  }

  override reset(): void {
    this.motion.cancelAll();
    useSpatialStore.getState().reset();
    this.syncCacophonyListenerPosition(null);
    this.syncCacophonyListenerOrientation(null);
  }
}
