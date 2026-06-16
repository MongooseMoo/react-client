import { create } from "zustand";

export interface ChannelTextEntry {
  id: number;
  channel: string;
  talker: string;
  text: string;
}

interface ChannelHistoryState {
  entries: ChannelTextEntry[];
  addChannelText: (message: Omit<ChannelTextEntry, "id">) => void;
  reset: () => void;
}

let nextChannelEntryId = 1;

export const useChannelHistoryStore = create<ChannelHistoryState>((set) => ({
  entries: [],
  addChannelText: (message) =>
    set((state) => ({
      entries: [...state.entries, { ...message, id: nextChannelEntryId++ }].slice(-1000),
    })),
  reset: () => {
    nextChannelEntryId = 1;
    set({ entries: [] });
  },
}));
