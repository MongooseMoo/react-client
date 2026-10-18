import { create } from "zustand";

/** A voice room the server has let us into, and the effect chain its voices play through. */
export interface LiveKitRoom {
  token: string;
  chain?: string;
  send?: number;
}

export interface LiveKitState {
  rooms: LiveKitRoom[];
  /** Add the room, or replace the chain and send of a token already held. */
  setRoom: (room: LiveKitRoom) => void;
  removeToken: (token: string) => void;
  reset: () => void;
}

export const useLiveKitStore = create<LiveKitState>((set) => ({
  rooms: [],
  setRoom: (room) =>
    set((state) => {
      const held = state.rooms.find((prev) => prev.token === room.token);
      if (!held) {
        return { rooms: [...state.rooms, room] };
      }
      if (held.chain === room.chain && held.send === room.send) {
        return state;
      }
      return { rooms: state.rooms.map((prev) => (prev === held ? room : prev)) };
    }),
  removeToken: (token) =>
    set((state) => ({ rooms: state.rooms.filter((prev) => prev.token !== token) })),
  reset: () => set({ rooms: [] }),
}));
