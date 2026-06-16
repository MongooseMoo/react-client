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

let nextOutputEntryId = 1;

export const useOutputStore = create<OutputState>((set) => ({
  entries: [],
  addMessage: (message) => addOutputEntry(set, { type: "message", message }),
  addHtml: (html) => addOutputEntry(set, { type: "html", html }),
  addError: (error) => addOutputEntry(set, { type: "error", error }),
  addCommand: (command) => addOutputEntry(set, { type: "command", command }),
  reset: () => {
    nextOutputEntryId = 1;
    set({ entries: [] });
  },
}));

function addOutputEntry(
  set: typeof useOutputStore.setState,
  entry: NewOutputEntry,
): void {
  const outputEntry = { ...entry, id: nextOutputEntryId++ } as OutputEntry;
  set((state) => ({ entries: [...state.entries, outputEntry].slice(-500) }));
}
