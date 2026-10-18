import { create } from "zustand";

/** A voice command in progress, which the send path must ask before sending. */
export interface DictationHandle {
  /** True when dictation takes over this send; false when the send should go ahead. */
  interceptSend: () => boolean;
}

interface InputStoreState {
  /** Current text in the command input. */
  text: string;
  /** Whether outgoing plain commands are rewritten as say commands. */
  autosay: boolean;
  /** Commands currently visible to the player, used by command input completion. */
  visibleCommands: string[];
  /** Set while a voice command is starting or listening; its text is not yet the player's. */
  dictation: DictationHandle | null;
  /**
   * A voice command cut off by its time limit was left for review while Enter
   * may still be held: Enter's key repeat must not send it. Cleared by
   * releasing Enter or by any change to the text.
   */
  needsFreshEnter: boolean;
  setText: (text: string) => void;
  setDictation: (dictation: DictationHandle | null) => void;
  setNeedsFreshEnter: (needsFreshEnter: boolean) => void;
  setAutosay: (autosay: boolean) => void;
  setVisibleCommands: (commands: string[]) => void;
  addVisibleCommands: (commands: string[]) => void;
  removeVisibleCommands: (commands: string[]) => void;
  clear: () => void;
  /** Counts `discardForNewOwner` calls, so a watcher can tell them from the player emptying the input. */
  ownerResets: number;
  /** Empties the input for a connection starting or the first sign-in (personalDataStore). */
  discardForNewOwner: () => void;
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
  dictation: null,
  needsFreshEnter: false,
  setText: (text) =>
    set((state) => ({ text, needsFreshEnter: state.needsFreshEnter && text === state.text })),
  setDictation: (dictation) => set({ dictation }),
  setNeedsFreshEnter: (needsFreshEnter) => set({ needsFreshEnter }),
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
  clear: () => set({ text: "", needsFreshEnter: false }),
  ownerResets: 0,
  discardForNewOwner: () =>
    set((state) => ({ text: "", needsFreshEnter: false, ownerResets: state.ownerResets + 1 })),
  resetCommands: () => set({ visibleCommands: [] }),
}));

function sortedUnique(commands: string[]): string[] {
  return [...new Set(commands.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}
