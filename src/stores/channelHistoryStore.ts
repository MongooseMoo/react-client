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

const MAX_ENTRIES = 1000;

let nextChannelEntryId = 1;

// Appends within the same tick are queued here (with ids already assigned, so
// ordering is stable) and flushed in a single set() on the next microtask.
// This coalesces bursts of channel traffic into one array allocation and one
// store notification instead of one of each per message.
let pendingEntries: ChannelTextEntry[] = [];
let flushScheduled = false;

export const useChannelHistoryStore = create<ChannelHistoryState>((set) => ({
  entries: [],
  addChannelText: (message) => {
    pendingEntries.push({ ...message, id: nextChannelEntryId++ });

    if (!flushScheduled) {
      flushScheduled = true;
      queueMicrotask(() => flushPendingEntries(set));
    }
  },
  reset: () => {
    nextChannelEntryId = 1;
    pendingEntries = [];
    flushScheduled = false;
    set({ entries: [] });
  },
}));

function flushPendingEntries(set: typeof useChannelHistoryStore.setState): void {
  flushScheduled = false;
  if (pendingEntries.length === 0) return;

  const toFlush = pendingEntries;
  pendingEntries = [];

  set((state) => {
    const merged = state.entries.concat(toFlush);
    return {
      entries: merged.length > MAX_ENTRIES ? merged.slice(-MAX_ENTRIES) : merged,
    };
  });
}
