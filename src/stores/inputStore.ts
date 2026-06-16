import { create } from "zustand";

interface InputStoreState {
  /** Current text in the command input. */
  text: string;
  /** Whether outgoing plain commands are rewritten as say commands. */
  autosay: boolean;
  /** Commands currently visible to the player, used by command input completion. */
  visibleCommands: string[];
  setText: (text: string) => void;
  setAutosay: (autosay: boolean) => void;
  setVisibleCommands: (commands: string[]) => void;
  addVisibleCommands: (commands: string[]) => void;
  removeVisibleCommands: (commands: string[]) => void;
  clear: () => void;
  resetCommands: () => void;
}

/**
 * Reactive state for the command input box. Holds only the text; imperative DOM
 * focus lives in `inputFocus.ts`. Usable outside React via `useInputStore.getState()`.
 */
export const useInputStore = create<InputStoreState>((set) => ({
  text: "",
  autosay: false,
  visibleCommands: [],
  setText: (text) => set({ text }),
  setAutosay: (autosay) => set({ autosay }),
  setVisibleCommands: (commands) => set({ visibleCommands: sortedUnique(commands) }),
  addVisibleCommands: (commands) =>
    set((state) => ({
      visibleCommands: sortedUnique([...state.visibleCommands, ...commands]),
    })),
  removeVisibleCommands: (commands) =>
    set((state) => {
      const removed = new Set(commands);
      return {
        visibleCommands: state.visibleCommands.filter((command) => !removed.has(command)),
      };
    }),
  clear: () => set({ text: "" }),
  resetCommands: () => set({ visibleCommands: [] }),
}));

function sortedUnique(commands: string[]): string[] {
  return [...new Set(commands.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}
