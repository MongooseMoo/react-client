import { create } from "zustand";

import type { WorldMongooseMenu } from "../mcp/packages/menu";

interface MenuState {
  /** The menu the server is waiting on, shown in place of the input line. */
  menu: WorldMongooseMenu | null;
  show: (menu: WorldMongooseMenu) => void;
  clear: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menu: null,
  show: (menu) => set({ menu }),
  clear: () => set({ menu: null }),
}));
