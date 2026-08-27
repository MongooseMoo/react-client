import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useConnectionStore } from "../stores/connectionStore";
import { usePreferences } from "../stores/preferencesStore";
import {
  copyDiagnosticsToClipboard,
  diagnosticsBuffer,
  getDiagnosticsMarkdown,
} from "./index";

describe("diagnostics service wiring", () => {
  beforeEach(() => {
    usePreferences.getState().setDiagnostics({ enabled: false, redactMessageText: false });
    diagnosticsBuffer.clear();
    useConnectionStore.getState().reset();
  });

  afterEach(() => {
    usePreferences.getState().setDiagnostics({ enabled: false, redactMessageText: false });
    diagnosticsBuffer.clear();
    useConnectionStore.getState().reset();
    vi.restoreAllMocks();
  });

  it("keeps the ring buffer disabled until the preference is turned on", () => {
    expect(diagnosticsBuffer.isEnabled()).toBe(false);

    useConnectionStore.getState().setConnected(true);
    expect(diagnosticsBuffer.snapshot()).toHaveLength(0);
  });

  it("starts capturing (e.g. connection lifecycle) once the preference is enabled", () => {
    usePreferences.getState().setDiagnostics({ enabled: true, redactMessageText: false });
    expect(diagnosticsBuffer.isEnabled()).toBe(true);

    useConnectionStore.getState().setConnected(true);

    const snapshot = diagnosticsBuffer.snapshot();
    expect(snapshot.some((r) => r.category === "connection")).toBe(true);
  });

  it("stops capturing once the preference is disabled again", () => {
    usePreferences.getState().setDiagnostics({ enabled: true, redactMessageText: false });
    usePreferences.getState().setDiagnostics({ enabled: false, redactMessageText: false });

    useConnectionStore.getState().setConnected(true);
    expect(diagnosticsBuffer.snapshot()).toHaveLength(0);
  });

  it("getDiagnosticsMarkdown returns a full export even with an empty buffer", () => {
    const markdown = getDiagnosticsMarkdown(false);
    expect(markdown).toContain("# Mongoose Client Diagnostics");
    expect(markdown).toContain("## Recent events (0)");
  });

  it("copyDiagnosticsToClipboard writes the markdown export to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await copyDiagnosticsToClipboard(false);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("# Mongoose Client Diagnostics");
  });
});
