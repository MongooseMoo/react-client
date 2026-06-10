import { create } from "zustand";

export interface LiveKitState {
  tokens: string[];
  addToken: (token: string) => void;
  removeToken: (token: string) => void;
  reset: () => void;
}

export const useLiveKitStore = create<LiveKitState>((set) => ({
  tokens: [],
  addToken: (token) =>
    set((state) => (state.tokens.includes(token) ? state : { tokens: [...state.tokens, token] })),
  removeToken: (token) =>
    set((state) => ({ tokens: state.tokens.filter((prevToken) => prevToken !== token) })),
  reset: () => set({ tokens: [] }),
}));
