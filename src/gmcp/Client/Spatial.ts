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

  handleScene(data: GMCPMessageClientSpatialScene): void {
    this.client.worldData.roomId = data.roomId;
    this.client.worldData.listenerEntityId = data.listenerId;
    this.client.worldData.listenerPosition = data.listenerPosition ?? null;
    this.client.worldData.listenerOrientation =
      data.listenerOrientation ?? { forward: null, up: null };
    this.client.worldData.spatialEntities = indexById(data.entities);
    this.client.worldData.spatialEmitters = indexById(data.emitters);
    this.client.emit("spatialScene", data);
  }

  handleEntityEnter(data: GMCPMessageClientSpatialEntityEnter): void {
    this.client.worldData.spatialEntities[data.entity.id] = data.entity;
    this.client.emit("spatialEntityEnter", data.entity);
  }

  handleEntityLeave(data: GMCPMessageClientSpatialEntityLeave): void {
    delete this.client.worldData.spatialEntities[data.entityId];
    for (const emitterId of Object.keys(this.client.worldData.spatialEmitters)) {
      const emitter = this.client.worldData.spatialEmitters[emitterId];
      if (emitter.sourceEntity === data.entityId) {
        delete this.client.worldData.spatialEmitters[emitterId];
      }
    }
    this.client.emit("spatialEntityLeave", data.entityId);
  }

  handleEntityMove(data: GMCPMessageClientSpatialEntityMove): void {
    const current = this.client.worldData.spatialEntities[data.entityId];
    this.client.worldData.spatialEntities[data.entityId] = {
      ...current,
      id: data.entityId,
      position: data.position,
      velocity: data.velocity ?? current?.velocity,
      forward: data.forward ?? current?.forward,
      up: data.up ?? current?.up,
    };
    this.client.emit("spatialEntityMove", this.client.worldData.spatialEntities[data.entityId]);
  }

  handleListenerPosition(data: GMCPMessageClientSpatialListenerPosition): void {
    if (data.listenerId !== undefined) {
      this.client.worldData.listenerEntityId = data.listenerId;
    }
    this.client.worldData.listenerPosition = data.position;
    this.client.emit("spatialListenerPosition", data);
  }

  handleListenerOrientation(
    data: GMCPMessageClientSpatialListenerOrientation,
  ): void {
    if (data.listenerId !== undefined) {
      this.client.worldData.listenerEntityId = data.listenerId;
    }
    this.client.worldData.listenerOrientation = {
      forward: data.forward,
      up: data.up,
    };
    this.client.emit("spatialListenerOrientation", data);
  }

  handleEmitterStart(data: GMCPMessageClientSpatialEmitterStart): void {
    this.client.worldData.spatialEmitters[data.emitter.id] = data.emitter;
    this.client.emit("spatialEmitterStart", data.emitter);
  }

  handleEmitterStop(data: GMCPMessageClientSpatialEmitterStop): void {
    delete this.client.worldData.spatialEmitters[data.emitterId];
    this.client.emit("spatialEmitterStop", data.emitterId);
  }
}
