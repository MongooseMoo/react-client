import type { EnvironmentSnapshot } from "./environment";
import type { DiagnosticRecord } from "./ringBuffer";

export interface MarkdownOptions {
  /** When true, string fields that look like they hold message/chat text
   * (key matches /message|text/i) are replaced with a placeholder. */
  redactMessageText: boolean;
}

const REDACTED_PLACEHOLDER = "[redacted]";
const TEXT_FIELD_PATTERN = /message|text/i;

function redactRecordData(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    redacted[key] =
      typeof value === "string" && TEXT_FIELD_PATTERN.test(key) ? REDACTED_PLACEHOLDER : value;
  }
  return redacted;
}

function formatRecordRow(record: DiagnosticRecord, redactMessageText: boolean): string {
  const data = redactMessageText ? redactRecordData(record.data) : record.data;
  const time = new Date(record.ts).toISOString();
  const json = JSON.stringify(data).replace(/\|/g, "\\|");
  return `| ${time} | ${record.category} | \`${json}\` |`;
}

/**
 * Serializes a diagnostics buffer snapshot + environment snapshot to
 * Markdown, ready to paste into a GitHub issue.
 */
export function serializeDiagnosticsMarkdown(
  records: DiagnosticRecord[],
  environment: EnvironmentSnapshot,
  options: MarkdownOptions,
): string {
  const lines: string[] = [];

  lines.push("# Mongoose Client Diagnostics");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(
    options.redactMessageText
      ? "Message text redaction: **on** (fields that look like message/chat text were replaced)"
      : "Message text redaction: **off** (message/chat text may be present below)",
  );
  lines.push("");

  lines.push("## Environment");
  lines.push("");
  lines.push(`- User agent: ${environment.userAgent}`);
  lines.push(`- Platform: ${environment.platform}`);
  lines.push(`- Hardware concurrency: ${environment.hardwareConcurrency ?? "unknown"}`);
  lines.push(
    `- Device memory: ${environment.deviceMemoryGb !== null ? `${environment.deviceMemoryGb} GB` : "unknown"}`,
  );
  lines.push(`- Window size: ${environment.windowWidth}x${environment.windowHeight}`);
  lines.push(`- Device pixel ratio: ${environment.devicePixelRatio}`);
  lines.push(`- Page uptime: ${(environment.pageUptimeMs / 1000).toFixed(1)}s`);
  lines.push(`- App version: ${environment.appVersion}`);
  lines.push("");

  lines.push("## Session");
  lines.push("");
  lines.push(`- Connection status: ${environment.connection.status}`);
  lines.push(`- Connected: ${environment.connection.connected}`);
  lines.push(`- Session ready: ${environment.connection.sessionReady}`);
  lines.push(
    `- Audio: live=${environment.subsystems.audio.live}, AudioContext.state=${environment.subsystems.audio.audioContextState ?? "n/a"}`,
  );
  lines.push(`- MIDI enabled: ${environment.subsystems.midi.enabled}`);
  lines.push(`- Editors open: ${environment.subsystems.editors.openCount}`);
  lines.push(`- Active file transfers: ${environment.subsystems.fileTransfers.activeCount}`);
  lines.push("");

  lines.push(`## Recent events (${records.length})`);
  lines.push("");
  if (records.length === 0) {
    lines.push("_No diagnostics recorded yet._");
  } else {
    lines.push("| Time | Category | Data |");
    lines.push("| --- | --- | --- |");
    for (const record of records) {
      lines.push(formatRecordRow(record, options.redactMessageText));
    }
  }
  lines.push("");

  return lines.join("\n");
}
