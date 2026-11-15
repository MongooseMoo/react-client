import { create } from "zustand";
import type { GMCPMessageRoomInfo, RoomLayout, RoomPlayer } from "../gmcp/Room";

/**
 * Single source of truth for the player's current room: its info and the
 * other players present. Previously split between `client.currentRoomInfo`
 * and `client.worldData.roomPlayers` (two places that could disagree) plus
 * per-component local state fed by events. The GMCP Room handler writes here
 * via getState(); React components subscribe with selector hooks; non-React
 * readers (tab-completion) read via getState().
 */
const sortByFullname = (players: RoomPlayer[]): RoomPlayer[] =>
  [...players].sort((a, b) => a.fullname.localeCompare(b.fullname));

interface RoomState {
  roomInfo: GMCPMessageRoomInfo | null;
  roomPlayers: RoomPlayer[];
  /** The current spatial room's Room.Layout; null outside spatial rooms. */
  roomLayout: RoomLayout | null;
  /** A new Room.Info means a new room — replace info, clear the player list, and keep the layout only if it is this room's. */
  setRoomInfo: (info: GMCPMessageRoomInfo) => void;
  setRoomLayout: (layout: RoomLayout) => void;
  /** A thing left the room (Client.Spatial EntityLeave): stop drawing it. */
  removeLayoutThing: (id: string) => void;
  setRoomPlayers: (players: RoomPlayer[]) => void;
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (name: string) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomInfo: null,
  roomPlayers: [],
  roomLayout: null,
  setRoomInfo: (info) =>
    set((state) => ({
      roomInfo: info,
      roomPlayers: [],
      roomLayout: state.roomLayout?.num === info.num ? state.roomLayout : null,
    })),
  setRoomLayout: (layout) => set({ roomLayout: layout }),
  removeLayoutThing: (id) =>
    set((state) =>
      state.roomLayout?.things.some((thing) => thing.id === id)
        ? { roomLayout: { ...state.roomLayout, things: state.roomLayout.things.filter((thing) => thing.id !== id) } }
        : state
    ),
  setRoomPlayers: (players) => set({ roomPlayers: sortByFullname(players) }),
  addPlayer: (player) =>
    set((state) =>
      state.roomPlayers.some((p) => p.name === player.name)
        ? state
        : { roomPlayers: sortByFullname([...state.roomPlayers, player]) }
    ),
  removePlayer: (name) =>
    set((state) => ({
      roomPlayers: state.roomPlayers.filter((p) => p.name !== name),
    })),
  reset: () => set({ roomInfo: null, roomPlayers: [], roomLayout: null }),
}));
