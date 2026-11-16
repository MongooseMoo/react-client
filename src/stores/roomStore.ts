import { create } from "zustand";
import type { GMCPMessageRoomInfo, RoomLayout, RoomLayoutUpdate, RoomPlayer } from "../gmcp/Room";

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
  /** Body updates change only existing identities in the matching room incarnation. */
  updateRoomLayout: (update: RoomLayoutUpdate) => void;
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
    set((state) =>
      state.roomLayout?.num === info.num
        ? { roomInfo: info, roomPlayers: [] }
        : { roomInfo: info, roomPlayers: [], roomLayout: null }
    ),
  setRoomLayout: (layout) => set((state) =>
    state.roomInfo && state.roomInfo.num !== layout.num ? state : { roomLayout: layout }),
  updateRoomLayout: (update) => set((state) => {
    const layout = state.roomLayout;
    if (!layout || layout.num !== update.num || layout.room_lifetime !== update.room_lifetime) return state;
    const bodies = new Map(update.bodies.map((body) => [body.id, body]));
    let changed = false;
    const things = layout.things.map((thing) => {
      const body = bodies.get(thing.id);
      if (!body || thing.lifetime !== body.lifetime) return thing;
      changed = true;
      return { ...thing, pose: body.pose, shapes: body.shapes, front: body.front, relation: body.relation };
    });
    return changed ? { roomLayout: { ...layout, things } } : state;
  }),
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
