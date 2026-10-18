import { compareDirections, directionStep, normalizeDirection } from "./directions";

/**
 * The rooms one character has visited, learned from GMCP Room.Info. Nothing
 * here comes from anywhere else: a room is known once the player has stood
 * in it, and its exits are known from that visit.
 */
export interface MapRoom {
  id: number;
  name: string;
  area: string;
  environment?: string;
  /** Short exit key ("n", "in", "hatch") to destination room number. */
  exits: Record<string, number>;
}

export interface MapData {
  rooms: Record<string, MapRoom>;
}

/** What recordRoom needs from a Room.Info message. */
export interface RoomInfoInput {
  num: number;
  name: string;
  area: string;
  environment?: string;
  exits?: Record<string, number>;
}

export function emptyMap(): MapData {
  return { rooms: {} };
}

function sameRoom(a: MapRoom, b: MapRoom): boolean {
  if (a.name !== b.name || a.area !== b.area || a.environment !== b.environment) return false;
  const aKeys = Object.keys(a.exits);
  const bKeys = Object.keys(b.exits);
  return aKeys.length === bKeys.length && aKeys.every((key) => b.exits[key] === a.exits[key]);
}

/** Adds or updates one visited room. Returns the same map object when nothing changed. */
export function recordRoom(map: MapData, info: RoomInfoInput): MapData {
  if (!Number.isInteger(info.num) || info.num < 0) return map;
  const exits: Record<string, number> = {};
  for (const [key, destination] of Object.entries(info.exits ?? {})) {
    if (Number.isInteger(destination) && destination >= 0) {
      exits[normalizeDirection(key)] = destination;
    }
  }
  const room: MapRoom = { id: info.num, name: info.name, area: info.area, exits };
  if (info.environment) room.environment = info.environment;
  const previous = map.rooms[String(info.num)];
  if (previous && sameRoom(previous, room)) return map;
  return { rooms: { ...map.rooms, [String(info.num)]: room } };
}

export interface PlacedRoom {
  room: MapRoom;
  x: number;
  y: number;
  z: number;
}

const cellKey = (x: number, y: number, z: number) => `${x},${y},${z}`;

/** The free cell on level z closest to (x, y), searching outward ring by ring. */
function nearestFree(occupied: Set<string>, x: number, y: number, z: number): { x: number; y: number } {
  if (!occupied.has(cellKey(x, y, z))) return { x, y };
  for (let radius = 1; ; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        if (!occupied.has(cellKey(x + dx, y + dy, z))) return { x: x + dx, y: y + dy };
      }
    }
  }
}

/**
 * Grid positions for every known room of one area, worked out from exit
 * directions alone (Mongoose rooms carry no map coordinates). The lowest
 * numbered room anchors each connected group, so the picture stays put as
 * more rooms are learned. A room that a direction would put on top of
 * another goes to the nearest free cell instead; rooms reached by in, out or
 * a named exit go next to the room they were reached from.
 */
export function layoutArea(map: MapData, area: string): Map<number, PlacedRoom> {
  const rooms = Object.values(map.rooms)
    .filter((room) => room.area === area)
    .sort((a, b) => a.id - b.id);
  const inArea = new Map(rooms.map((room) => [room.id, room]));

  // Exits both ways, so a room only reached by a one-way exit into it still joins its group.
  const links = new Map<number, Array<{ to: number; key: string; reverse: boolean }>>();
  const addLink = (from: number, to: number, key: string, reverse: boolean) => {
    const list = links.get(from) ?? [];
    list.push({ to, key, reverse });
    links.set(from, list);
  };
  for (const room of rooms) {
    for (const [key, to] of Object.entries(room.exits)) {
      if (!inArea.has(to) || to === room.id) continue;
      addLink(room.id, to, key, false);
      addLink(to, room.id, key, true);
    }
  }
  for (const list of links.values()) {
    list.sort((a, b) => Number(a.reverse) - Number(b.reverse) || compareDirections(a.key, b.key) || a.to - b.to);
  }

  const placed = new Map<number, PlacedRoom>();
  const occupied = new Set<string>();
  const place = (room: MapRoom, x: number, y: number, z: number) => {
    const cell = nearestFree(occupied, x, y, z);
    placed.set(room.id, { room, x: cell.x, y: cell.y, z });
    occupied.add(cellKey(cell.x, cell.y, z));
  };

  let nextGroupX = 0;
  for (const anchor of rooms) {
    if (placed.has(anchor.id)) continue;
    place(anchor, nextGroupX, 0, 0);
    const queue = [anchor.id];
    for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
      const current = placed.get(id);
      if (!current) continue;
      for (const link of links.get(id) ?? []) {
        const target = inArea.get(link.to);
        if (!target || placed.has(link.to)) continue;
        const step = directionStep(link.key);
        const sign = link.reverse ? -1 : 1;
        if (step) {
          place(target, current.x + sign * step.dx, current.y + sign * step.dy, current.z + sign * step.dz);
        } else {
          place(target, current.x + 1, current.y, current.z);
        }
        queue.push(link.to);
      }
    }
    let maxX = -Infinity;
    for (const p of placed.values()) maxX = Math.max(maxX, p.x);
    nextGroupX = maxX + 2;
  }
  return placed;
}

/**
 * The shortest list of exit keys from one known room to another, using only
 * exits seen on visits. Null when no known route exists; empty when already there.
 */
export function findPath(map: MapData, from: number, to: number): string[] | null {
  if (from === to) return [];
  const previous = new Map<number, { from: number; key: string }>();
  const queue = [from];
  const seen = new Set([from]);
  for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
    const room = map.rooms[String(id)];
    if (!room) continue;
    const keys = Object.keys(room.exits).sort(compareDirections);
    for (const key of keys) {
      const next = room.exits[key];
      if (seen.has(next)) continue;
      seen.add(next);
      previous.set(next, { from: id, key });
      if (next === to) {
        const path: string[] = [];
        for (let link = previous.get(to); link; link = previous.get(link.from)) {
          path.unshift(link.key);
        }
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}
