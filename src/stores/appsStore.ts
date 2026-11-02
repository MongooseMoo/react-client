import { create } from "zustand";
import type {
  GMCPMessageClientAppsApp,
  GMCPMessageClientAppsDrive,
  GMCPMessageClientAppsResult,
} from "../gmcp/Client/Apps";

/** What the Apps tab shows: the player's apps, the last answer, and a drive password once asked for. */
interface AppsState {
  apps: GMCPMessageClientAppsApp[] | null;
  result: GMCPMessageClientAppsResult | null;
  drive: GMCPMessageClientAppsDrive | null;
  setApps: (apps: GMCPMessageClientAppsApp[]) => void;
  setResult: (result: GMCPMessageClientAppsResult) => void;
  setDrive: (drive: GMCPMessageClientAppsDrive) => void;
  reset: () => void;
}

export const useAppsStore = create<AppsState>((set) => ({
  apps: null,
  result: null,
  drive: null,
  setApps: (apps) => set({ apps }),
  setResult: (result) => set({ result }),
  setDrive: (drive) => set({ drive }),
  reset: () => set({ apps: null, result: null, drive: null }),
}));
