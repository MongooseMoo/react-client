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

/**
 * Something Client.Spatial says entered after the room's Room.Layout was
 * sent (the server sends Room.Layout only with Room.Info). It has no shapes;
 * it is drawn as a marker at its Client.Spatial position.
 */
export interface LayoutArrival {
  id: string;
  name: string;
  kind: string;
}

interface RoomState {
  roomInfo: GMCPMessageRoomInfo | null;
  roomPlayers: RoomPlayer[];
  /** The current spatial room's Room.Layout; null outside spatial rooms. */
  roomLayout: RoomLayout | null;
  /** What entered the room since its Room.Layout arrived. */
  layoutArrivals: LayoutArrival[];
  /** A new Room.Info means a new room — replace info, clear the player list, and keep the layout only if it is this room's. */
  setRoomInfo: (info: GMCPMessageRoomInfo) => void;
  setRoomLayout: (layout: RoomLayout) => void;
  /** Client.Spatial EntityEnter: record it unless there is no layout or the layout already has it. */
  addLayoutArrival: (arrival: LayoutArrival) => void;
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
  layoutArrivals: [],
  setRoomInfo: (info) =>
    set((state) =>
      state.roomLayout?.num === info.num
        ? { roomInfo: info, roomPlayers: [] }
        : { roomInfo: info, roomPlayers: [], roomLayout: null, layoutArrivals: [] }
    ),
  setRoomLayout: (layout) => set({ roomLayout: layout, layoutArrivals: [] }),
  addLayoutArrival: (arrival) =>
    set((state) =>
      !state.roomLayout ||
      state.roomLayout.things.some((thing) => thing.id === arrival.id) ||
      state.layoutArrivals.some((a) => a.id === arrival.id)
        ? state
        : { layoutArrivals: [...state.layoutArrivals, arrival] }
    ),
  removeLayoutThing: (id) =>
    set((state) => ({
      roomLayout:
        state.roomLayout && state.roomLayout.things.some((thing) => thing.id === id)
          ? { ...state.roomLayout, things: state.roomLayout.things.filter((thing) => thing.id !== id) }
          : state.roomLayout,
      layoutArrivals: state.layoutArrivals.some((a) => a.id === id)
        ? state.layoutArrivals.filter((a) => a.id !== id)
        : state.layoutArrivals,
    })),
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
  reset: () => set({ roomInfo: null, roomPlayers: [], roomLayout: null, layoutArrivals: [] }),
}));
