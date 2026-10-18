import { create } from "zustand";
import { loadStoredValue, saveStoredValue, type LocalStorageSchema } from "../persistence";
import { emptyMap, recordRoom, type MapData, type RoomInfoInput } from "../map/mapGraph";

/**
 * The automap: rooms this character has visited, where they stand now, and a
 * walk in progress. Room.Info feeds it; the Map tab reads it. Each character
 * keeps its own map in localStorage, so a map is never shown to anyone who
 * has not walked it.
 */
export interface MapWalk {
  targetId: number;
  /** Exit keys still to take, the next one first. */
  steps: string[];
  /** The room the step just sent should arrive in. */
  expectedRoomId: number;
}

interface MapState {
  /** Whose map this is ("" until Char.Name says). */
  owner: string;
  map: MapData;
  currentRoomId: number | null;
  walk: MapWalk | null;
  setOwner: (owner: string) => void;
  recordVisit: (info: RoomInfoInput) => void;
  setWalk: (walk: MapWalk | null) => void;
  reset: () => void;
}

const STORAGE_PREFIX = "mongoose.map.";

function isMapData(value: unknown): value is MapData {
  return typeof value === "object" && value !== null &&
    typeof (value as Partial<MapData>).rooms === "object" && (value as Partial<MapData>).rooms !== null;
}

function schemaFor(owner: string): LocalStorageSchema<MapData> {
  return {
    key: STORAGE_PREFIX + owner.toLowerCase(),
    version: 1,
    migrate: (data, storedVersion) => (storedVersion === 1 && isMapData(data) ? data : undefined),
  };
}

function save(owner: string, map: MapData): void {
  if (owner) saveStoredValue(schemaFor(owner), map);
}

export const useMapStore = create<MapState>((set, get) => ({
  owner: "",
  map: emptyMap(),
  currentRoomId: null,
  walk: null,
  setOwner: (owner) => {
    const state = get();
    if (owner === state.owner) return;
    let map = owner ? loadStoredValue(schemaFor(owner), emptyMap()) : emptyMap();
    // Rooms seen before the character was known (Room.Info can come before Char.Name) belong to it.
    if (!state.owner) {
      for (const room of Object.values(state.map.rooms)) {
        map = recordRoom(map, { num: room.id, ...room });
      }
      save(owner, map);
    }
    set({ owner, map, walk: null });
  },
  recordVisit: (info) => {
    const state = get();
    const map = recordRoom(state.map, info);
    if (map !== state.map) save(state.owner, map);
    set({ map, currentRoomId: info.num });
  },
  setWalk: (walk) => set({ walk }),
  reset: () => set({ currentRoomId: null, walk: null }),
}));
