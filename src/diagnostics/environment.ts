import packageJson from "../../package.json";
import type MudClient from "../client";
import { useConnectionStore } from "../stores/connectionStore";
import { usePreferences } from "../stores/preferencesStore";

export interface EnvironmentSnapshot {
  userAgent: string;
  platform: string;
  hardwareConcurrency: number | null;
  /** Approximate device memory in GB, per the (Chromium-only) Device Memory API. */
  deviceMemoryGb: number | null;
  windowWidth: number;
  windowHeight: number;
  devicePixelRatio: number;
  pageUptimeMs: number;
  appVersion: string;
  connection: {
    status: string;
    connected: boolean;
    sessionReady: boolean;
  };
  subsystems: {
    audio: { live: boolean; audioContextState: string | null };
    midi: { enabled: boolean };
    editors: { openCount: number };
    fileTransfers: { activeCount: number };
  };
}

/** Chrome/Edge-only; not part of the standard Navigator type. */
interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number;
}

function resolveClient(client: MudClient | null | undefined): MudClient | null {
  if (client !== undefined) return client;
  return typeof window !== "undefined" ? (window.mudClient ?? null) : null;
}

/**
 * Assembles the environment + session snapshot included in a diagnostics
 * export. Reads live globals/stores at call time rather than tracking them
 * continuously, since this only needs to run once per export.
 */
export function buildEnvironmentSnapshot(
  client?: MudClient | null,
): EnvironmentSnapshot {
  const resolvedClient = resolveClient(client);
  const nav = navigator as NavigatorWithDeviceMemory;
  const connection = useConnectionStore.getState();
  const midi = usePreferences.getState().midi;

  // `BaseContext` is a cacophony-defined subset of AudioContext that doesn't
  // declare `state`, but the real context is always a browser AudioContext.
  const audioContext = resolvedClient?.media?.cacophony?.context as
    | { state?: string }
    | undefined;
  const audioContextState = audioContext?.state ?? null;

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    deviceMemoryGb: nav.deviceMemory ?? null,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    pageUptimeMs: Math.round(performance.now()),
    appVersion: packageJson.version,
    connection: {
      status: connection.statusText,
      connected: connection.connected,
      sessionReady: connection.sessionReady,
    },
    subsystems: {
      audio: {
        live: audioContextState === "running",
        audioContextState,
      },
      midi: { enabled: midi.enabled },
      editors: { openCount: resolvedClient?.editors?.openEditorCount ?? 0 },
      fileTransfers: {
        activeCount: resolvedClient?.fileTransferManager?.activeTransferCount ?? 0,
      },
    },
  };
}
