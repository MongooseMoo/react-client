import { create } from "zustand";
import type { GMCPMessageRoomInfo, RoomPlayer } from "../gmcp/Room";

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
  /** A new Room.Info means a new room — replace info and clear the player list. */
  setRoomInfo: (info: GMCPMessageRoomInfo) => void;
  setRoomPlayers: (players: RoomPlayer[]) => void;
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (name: string) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomInfo: null,
  roomPlayers: [],
  setRoomInfo: (info) => set({ roomInfo: info, roomPlayers: [] }),
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
  reset: () => set({ roomInfo: null, roomPlayers: [] }),
}));
