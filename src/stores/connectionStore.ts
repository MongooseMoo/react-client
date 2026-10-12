import { create } from "zustand";
import type { LatencySnapshot } from "../ConnectionLatency";

const unavailableLatency: LatencySnapshot = { status: 'unavailable', rttMs: null, averageMs: null };

interface ConnectionState {
  connected: boolean;
  statusText: string;
  sessionReady: boolean;
  latency: LatencySnapshot;
  setLatency: (latency: LatencySnapshot) => void;
  setConnected: (connected: boolean) => void;
  setStatusText: (statusText: string) => void;
  setSessionReady: (sessionReady: boolean) => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  connected: false,
  statusText: "Not connected",
  sessionReady: false,
  latency: unavailableLatency,
  setLatency: (latency) => set({ latency }),
  setConnected: (connected) =>
    set(
      connected
        ? { connected: true, statusText: "Connected" }
        : { connected: false, statusText: "Disconnected", sessionReady: false, latency: unavailableLatency },
    ),
  setStatusText: (statusText) => set({ statusText }),
  setSessionReady: (sessionReady) => set({ sessionReady }),
  reset: () => set({ connected: false, statusText: "Not connected", sessionReady: false, latency: unavailableLatency }),
}));
