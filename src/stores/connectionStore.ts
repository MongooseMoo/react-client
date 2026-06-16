import { create } from "zustand";

interface ConnectionState {
  connected: boolean;
  statusText: string;
  sessionReady: boolean;
  setConnected: (connected: boolean) => void;
  setStatusText: (statusText: string) => void;
  setSessionReady: (sessionReady: boolean) => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  connected: false,
  statusText: "Not connected",
  sessionReady: false,
  setConnected: (connected) =>
    set(
      connected
        ? { connected: true, statusText: "Connected" }
        : { connected: false, statusText: "Disconnected", sessionReady: false },
    ),
  setStatusText: (statusText) => set({ statusText }),
  setSessionReady: (sessionReady) => set({ sessionReady }),
  reset: () => set({ connected: false, statusText: "Not connected", sessionReady: false }),
}));
