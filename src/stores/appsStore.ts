import { create } from "zustand";
import type {
  ClientAppsPasswordApp,
  GMCPMessageClientAppsApp,
  GMCPMessageClientAppsPassword,
  GMCPMessageClientAppsResult,
} from "../gmcp/Client/Apps";

/** What the Apps tab shows: the player's apps, the last answer, and each app's password once asked for. */
interface AppsState {
  apps: GMCPMessageClientAppsApp[] | null;
  result: GMCPMessageClientAppsResult | null;
  passwords: Partial<Record<ClientAppsPasswordApp, GMCPMessageClientAppsPassword>>;
  setApps: (apps: GMCPMessageClientAppsApp[]) => void;
  setResult: (result: GMCPMessageClientAppsResult) => void;
  setPassword: (password: GMCPMessageClientAppsPassword) => void;
  reset: () => void;
}

export const useAppsStore = create<AppsState>((set) => ({
  apps: null,
  result: null,
  passwords: {},
  setApps: (apps) => set({ apps }),
  setResult: (result) => set({ result }),
  setPassword: (password) => set((state) => ({ passwords: { ...state.passwords, [password.app]: password } })),
  reset: () => set({ apps: null, result: null, passwords: {} }),
}));
