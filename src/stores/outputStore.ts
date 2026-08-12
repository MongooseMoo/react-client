import { create } from "zustand";

export type OutputEntry =
  | { id: number; type: "message"; message: string }
  | { id: number; type: "html"; html: string }
  | { id: number; type: "error"; error: Error }
  | { id: number; type: "command"; command: string };

type NewOutputEntry =
  | { type: "message"; message: string }
  | { type: "html"; html: string }
  | { type: "error"; error: Error }
  | { type: "command"; command: string };

interface OutputState {
  entries: OutputEntry[];
  addMessage: (message: string) => void;
  addHtml: (html: string) => void;
  addError: (error: Error) => void;
  addCommand: (command: string) => void;
  reset: () => void;
}

const MAX_ENTRIES = 500;

let nextOutputEntryId = 1;

// Appends within the same tick are queued here (with ids already assigned, so
// ordering is stable) and flushed in a single set() on the next microtask.
// This coalesces bursts of server output into one array allocation and one
// store notification instead of one of each per message.
let pendingEntries: OutputEntry[] = [];
let flushScheduled = false;

export const useOutputStore = create<OutputState>((set) => ({
  entries: [],
  addMessage: (message) => addOutputEntry(set, { type: "message", message }),
  addHtml: (html) => addOutputEntry(set, { type: "html", html }),
  addError: (error) => addOutputEntry(set, { type: "error", error }),
  addCommand: (command) => addOutputEntry(set, { type: "command", command }),
  reset: () => {
    nextOutputEntryId = 1;
    pendingEntries = [];
    flushScheduled = false;
    set({ entries: [] });
  },
}));

function flushPendingEntries(set: typeof useOutputStore.setState): void {
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

function addOutputEntry(
  set: typeof useOutputStore.setState,
  entry: NewOutputEntry,
): void {
  const outputEntry = { ...entry, id: nextOutputEntryId++ } as OutputEntry;
  pendingEntries.push(outputEntry);

  if (!flushScheduled) {
    flushScheduled = true;
    queueMicrotask(() => flushPendingEntries(set));
  }
}
