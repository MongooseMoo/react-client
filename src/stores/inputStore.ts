import { create } from "zustand";

interface InputStoreState {
  /** Current text in the command input. */
  text: string;
  setText: (text: string) => void;
  clear: () => void;
}

/**
 * Reactive state for the command input box. Holds only the text; imperative DOM
 * focus lives in `inputFocus.ts`. Usable outside React via `useInputStore.getState()`.
 */
export const useInputStore = create<InputStoreState>((set) => ({
  text: "",
  setText: (text) => set({ text }),
  clear: () => set({ text: "" }),
}));
