import { create } from "zustand";

export interface VitalsData {
  hp?: string;
  maxhp?: string;
  mp?: string;
  maxmp?: string;
  ep?: string;
  maxep?: string;
  wp?: string;
  maxwp?: string;
  nl?: string;
  [key: string]: unknown;
}

interface CharacterStatusState {
  vitals: VitalsData | null;
  setVitals: (vitals: VitalsData) => void;
  reset: () => void;
}

export const useCharacterStatusStore = create<CharacterStatusState>((set) => ({
  vitals: null,
  setVitals: (vitals) => set({ vitals }),
  reset: () => set({ vitals: null }),
}));
