import { usePreferences } from "../stores/preferencesStore";
import { installConsoleCapture } from "./consoleCapture";
import { startConnectionCapture } from "./connectionCapture";
import { buildEnvironmentSnapshot } from "./environment";
import { serializeDiagnosticsMarkdown } from "./markdown";
import { diagnosticsBuffer } from "./ringBuffer";
import { startCounterSampling, startLongTaskObserver } from "./samplers";

export { diagnosticsBuffer } from "./ringBuffer";
export type { DiagnosticRecord } from "./ringBuffer";
export type { EnvironmentSnapshot } from "./environment";

/**
 * Owns the diagnostics capture lifecycle: keeps the ring buffer's enabled
 * state in sync with the "Capture diagnostics" preference, and starts/stops
 * the sampling-based capture subsystems (connection lifecycle, counters,
 * long tasks) alongside it.
 *
 * Console capture is installed once, unconditionally, for the lifetime of
 * the app — it's cheap when disabled (the buffer no-ops), and installing it
 * only on first enable would miss warnings/errors logged before the user
 * ever opts in.
 */
class DiagnosticsService {
  private stopCaptureSubsystems: (() => void) | null = null;

  constructor() {
    installConsoleCapture();

    const applyEnabled = (enabled: boolean): void => {
      diagnosticsBuffer.setEnabled(enabled);
      if (enabled) {
        this.startCaptureSubsystems();
      } else {
        this.stopCaptureSubsystemsIfRunning();
      }
    };

    applyEnabled(usePreferences.getState().diagnostics.enabled);
    usePreferences.subscribe((state) => state.diagnostics.enabled, applyEnabled);
  }

  private startCaptureSubsystems(): void {
    if (this.stopCaptureSubsystems) return;

    const stopConnection = startConnectionCapture();
    const stopCounters = startCounterSampling();
    const stopLongTasks = startLongTaskObserver();

    this.stopCaptureSubsystems = () => {
      stopConnection();
      stopCounters();
      stopLongTasks();
    };
  }

  private stopCaptureSubsystemsIfRunning(): void {
    this.stopCaptureSubsystems?.();
    this.stopCaptureSubsystems = null;
  }
}

/** Side-effecting singleton — importing this module starts diagnostics
 * capture wiring. Import it once from app startup (see App.tsx). */
export const diagnosticsService = new DiagnosticsService();

/** Builds the full Markdown export (environment + session + recent events). */
export function getDiagnosticsMarkdown(redactMessageText: boolean): string {
  const environment = buildEnvironmentSnapshot();
  return serializeDiagnosticsMarkdown(diagnosticsBuffer.snapshot(), environment, {
    redactMessageText,
  });
}

/** Serializes the diagnostics export to Markdown and copies it to the clipboard. */
export async function copyDiagnosticsToClipboard(redactMessageText: boolean): Promise<void> {
  const markdown = getDiagnosticsMarkdown(redactMessageText);
  await navigator.clipboard.writeText(markdown);
}
