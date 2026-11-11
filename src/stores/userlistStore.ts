import { create } from "zustand";

import type { UserlistPlayer } from "../mcp/packages/userlist";

/** One action the server offers on a player; $(1) is their object number and $(2) their name. */
export interface UserlistMenuItem {
  label: string;
  command: string;
}

interface UserlistState {
  players: UserlistPlayer[];
  /** The object number of the player this client is logged in as. */
  you: string | null;
  menu: UserlistMenuItem[];
  hasReceivedList: boolean;
  setPlayers: (players: UserlistPlayer[]) => void;
  setYou: (you: string | null) => void;
  setMenu: (menu: UserlistMenuItem[]) => void;
  reset: () => void;
}

export const useUserlistStore = create<UserlistState>((set) => ({
  players: [],
  you: null,
  menu: [],
  hasReceivedList: false,
  setPlayers: (players) => set({ players, hasReceivedList: true }),
  setYou: (you) => set({ you }),
  setMenu: (menu) => set({ menu }),
  reset: () => set({ players: [], you: null, menu: [], hasReceivedList: false }),
}));
