import { useSpatialStore } from "../../stores/spatialStore";
import { GMCPMessage, GMCPPackage } from "../package";

export type SpatialVector = [number, number, number];

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
  binding: "entity" | "world";
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
  frame?: "head" | "world";
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
  roomId: string = "";
  listenerId: string = "";
  listenerPosition?: SpatialVector;
  listenerOrientation?: SpatialListenerOrientation;
  entities: SpatialEntity[] = [];
  emitters: SpatialEmitter[] = [];
}

export class GMCPMessageClientSpatialEntityEnter extends GMCPMessage {
  entity!: SpatialEntity;
}

export class GMCPMessageClientSpatialEntityLeave extends GMCPMessage {
  entityId: string = "";
}

export class GMCPMessageClientSpatialEntityMove extends GMCPMessage {
  entityId: string = "";
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
  emitterId: string = "";
}

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

export class GMCPClientSpatial extends GMCPPackage {
  public packageName: string = "Client.Spatial";

  private syncCacophonyListenerPosition(position: SpatialVector | null | undefined): void {
    this.client.cacophony.listenerPosition = position ?? [0, 0, 0];
  }

  private syncCacophonyListenerOrientation(
    orientation: SpatialListenerOrientation | null | undefined,
  ): void {
    this.client.cacophony.listenerForwardOrientation =
      orientation?.forward ?? [0, 0, -1];
    this.client.cacophony.listenerUpOrientation = orientation?.up ?? [0, 1, 0];
  }

  handleScene(data: GMCPMessageClientSpatialScene): void {
    // roomId still lives on worldData (moves to the session store in a later slice).
    this.client.worldData.roomId = data.roomId;
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
    this.client.emit("spatialScene", data);
  }

  handleEntityEnter(data: GMCPMessageClientSpatialEntityEnter): void {
    useSpatialStore.getState().enterEntity(data.entity);
    this.client.emit("spatialEntityEnter", data.entity);
  }

  handleEntityLeave(data: GMCPMessageClientSpatialEntityLeave): void {
    useSpatialStore.getState().leaveEntity(data.entityId);
    this.client.emit("spatialEntityLeave", data.entityId);
  }

  handleEntityMove(data: GMCPMessageClientSpatialEntityMove): void {
    useSpatialStore.getState().moveEntity(data);
    this.client.emit(
      "spatialEntityMove",
      useSpatialStore.getState().spatialEntities[data.entityId]
    );
  }

  handleListenerPosition(data: GMCPMessageClientSpatialListenerPosition): void {
    useSpatialStore.getState().setListenerPosition(data.position, data.listenerId);
    this.syncCacophonyListenerPosition(data.position);
    this.client.emit("spatialListenerPosition", data);
  }

  handleListenerOrientation(
    data: GMCPMessageClientSpatialListenerOrientation,
  ): void {
    const orientation = { forward: data.forward, up: data.up };
    useSpatialStore.getState().setListenerOrientation(orientation, data.listenerId);
    this.syncCacophonyListenerOrientation(orientation);
    this.client.emit("spatialListenerOrientation", data);
  }

  handleEmitterStart(data: GMCPMessageClientSpatialEmitterStart): void {
    useSpatialStore.getState().startEmitter(data.emitter);
    this.client.emit("spatialEmitterStart", data.emitter);
  }

  handleEmitterStop(data: GMCPMessageClientSpatialEmitterStop): void {
    useSpatialStore.getState().stopEmitter(data.emitterId);
    this.client.emit("spatialEmitterStop", data.emitterId);
  }
}
