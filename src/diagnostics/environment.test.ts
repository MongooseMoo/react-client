import { afterEach, describe, expect, it } from "vitest";
import packageJson from "../../package.json";
import { useConnectionStore } from "../stores/connectionStore";
import { usePreferences } from "../stores/preferencesStore";
import { buildEnvironmentSnapshot } from "./environment";

describe("buildEnvironmentSnapshot", () => {
  afterEach(() => {
    useConnectionStore.getState().reset();
    usePreferences.getState().setMidi({ enabled: false });
  });

  it("reads environment/browser fields", () => {
    const snapshot = buildEnvironmentSnapshot(null);

    expect(snapshot.userAgent).toBe(navigator.userAgent);
    expect(snapshot.platform).toBe(navigator.platform);
    expect(snapshot.appVersion).toBe(packageJson.version);
    expect(typeof snapshot.pageUptimeMs).toBe("number");
    expect(snapshot.windowWidth).toBe(window.innerWidth);
    expect(snapshot.windowHeight).toBe(window.innerHeight);
  });

  it("reflects connection store state", () => {
    useConnectionStore.getState().setConnected(true);
    useConnectionStore.getState().setSessionReady(true);

    const snapshot = buildEnvironmentSnapshot(null);

    expect(snapshot.connection).toEqual({
      status: "Connected",
      connected: true,
      sessionReady: true,
    });
  });

  it("reflects the MIDI preference", () => {
    usePreferences.getState().setMidi({ enabled: true });

    const snapshot = buildEnvironmentSnapshot(null);

    expect(snapshot.subsystems.midi.enabled).toBe(true);
  });

  it("reports subsystems as inactive when no client is available", () => {
    const snapshot = buildEnvironmentSnapshot(null);

    expect(snapshot.subsystems.audio).toEqual({ live: false, audioContextState: null });
    expect(snapshot.subsystems.editors.openCount).toBe(0);
    expect(snapshot.subsystems.fileTransfers.activeCount).toBe(0);
  });

  it("reads live subsystem state off a provided client", () => {
    const fakeClient = {
      media: { cacophony: { context: { state: "running" } } },
      editors: { openEditorCount: 2 },
      fileTransferManager: { activeTransferCount: 3 },
      // biome-ignore lint/suspicious/noExplicitAny: minimal test double, not a real MudClient
    } as any;

    const snapshot = buildEnvironmentSnapshot(fakeClient);

    expect(snapshot.subsystems.audio).toEqual({ live: true, audioContextState: "running" });
    expect(snapshot.subsystems.editors.openCount).toBe(2);
    expect(snapshot.subsystems.fileTransfers.activeCount).toBe(3);
  });
});
