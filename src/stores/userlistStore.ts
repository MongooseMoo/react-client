import { create } from "zustand";

import type { UserlistPlayer } from "../mcp/packages/userlist";

interface UserlistState {
  players: UserlistPlayer[];
  hasReceivedList: boolean;
  setPlayers: (players: UserlistPlayer[]) => void;
  reset: () => void;
}

export const useUserlistStore = create<UserlistState>((set) => ({
  players: [],
  hasReceivedList: false,
  setPlayers: (players) => set({ players: [...players], hasReceivedList: true }),
  reset: () => set({ players: [], hasReceivedList: false }),
}));
