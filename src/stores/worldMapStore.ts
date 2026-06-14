import { create } from 'zustand';

export interface WorldMapUser {
  id: string;
  name: string;
  locationId: string;
  idleSeconds: number | null;
}

export interface WorldMapRoom {
  id: string;
  name: string;
  exits: string;
}

interface WorldMapState {
  locationId: string;
  selfId: string;
  users: WorldMapUser[];
  rooms: WorldMapRoom[];
  setLocation: (locationId: string) => void;
  setSelf: (selfId: string) => void;
  setUsers: (users: WorldMapUser[]) => void;
  setRooms: (rooms: WorldMapRoom[]) => void;
  reset: () => void;
}

export const useWorldMapStore = create<WorldMapState>((set) => ({
  locationId: '',
  selfId: '',
  users: [],
  rooms: [],
  setLocation: (locationId) => set({ locationId }),
  setSelf: (selfId) => set({ selfId }),
  setUsers: (users) =>
    set({
      users: [...users].sort((left, right) => left.name.localeCompare(right.name)),
    }),
  setRooms: (rooms) =>
    set({
      rooms: [...rooms].sort((left, right) => left.name.localeCompare(right.name)),
    }),
  reset: () => set({ locationId: '', selfId: '', users: [], rooms: [] }),
}));
