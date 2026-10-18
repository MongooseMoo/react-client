import { create } from "zustand";
import type { GMCPMessageHelpTopic } from "../gmcp/Help";

/** The help result on show in the Help tab, and the ones before it for Back. */
interface HelpState {
  current: GMCPMessageHelpTopic | null;
  history: GMCPMessageHelpTopic[];
  /** Goes up whenever `current` changes, even to an equal result. */
  serial: number;
  show: (topic: GMCPMessageHelpTopic) => void;
  /** Returns to the previous result, if there is one, and returns it. */
  back: () => GMCPMessageHelpTopic | undefined;
  reset: () => void;
}

export const useHelpStore = create<HelpState>((set, get) => ({
  current: null,
  history: [],
  serial: 0,
  show: (topic) =>
    set((state) => ({
      current: topic,
      history: state.current ? [...state.history, state.current] : state.history,
      serial: state.serial + 1,
    })),
  back: () => {
    const { history, serial } = get();
    const previous = history.at(-1);
    if (!previous) return undefined;
    set({ current: previous, history: history.slice(0, -1), serial: serial + 1 });
    return previous;
  },
  reset: () => set((state) => ({ current: null, history: [], serial: state.serial + 1 })),
}));
