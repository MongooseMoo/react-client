import { describe, expect, it } from "vitest";
import type { EnvironmentSnapshot } from "./environment";
import { serializeDiagnosticsMarkdown } from "./markdown";
import type { DiagnosticRecord } from "./ringBuffer";

const environment: EnvironmentSnapshot = {
  userAgent: "TestAgent/1.0",
  platform: "TestOS",
  hardwareConcurrency: 8,
  deviceMemoryGb: 8,
  windowWidth: 1280,
  windowHeight: 800,
  devicePixelRatio: 1,
  pageUptimeMs: 12345,
  appVersion: "0.7.0",
  connection: { status: "Connected", connected: true, sessionReady: true },
  subsystems: {
    audio: { live: true, audioContextState: "running" },
    midi: { enabled: false },
    editors: { openCount: 0 },
    fileTransfers: { activeCount: 0 },
  },
};

describe("serializeDiagnosticsMarkdown", () => {
  it("produces a markdown document with expected section headers", () => {
    const markdown = serializeDiagnosticsMarkdown([], environment, {
      redactMessageText: false,
    });

    expect(markdown).toContain("# Mongoose Client Diagnostics");
    expect(markdown).toContain("## Environment");
    expect(markdown).toContain("## Session");
    expect(markdown).toContain("## Recent events (0)");
    expect(markdown).toContain("_No diagnostics recorded yet._");
    expect(markdown).toContain("User agent: TestAgent/1.0");
    expect(markdown).toContain("App version: 0.7.0");
    expect(markdown).toContain("Connection status: Connected");
  });

  it("renders a markdown table row per record", () => {
    const records: DiagnosticRecord[] = [
      { ts: 1710000000000, category: "connection", data: { event: "connected", reconnectCount: 0 } },
      { ts: 1710000005000, category: "counters", data: { outputLinesPerSec: 1.2 } },
    ];

    const markdown = serializeDiagnosticsMarkdown(records, environment, {
      redactMessageText: false,
    });

    expect(markdown).toContain("| Time | Category | Data |");
    expect(markdown).toContain("| --- | --- | --- |");
    expect(markdown).toContain("connection");
    expect(markdown).toContain('"event":"connected"');
    expect(markdown).toContain("counters");
    expect(markdown).toContain('"outputLinesPerSec":1.2');
    expect(markdown).toContain("## Recent events (2)");
  });

  it("leaves message text intact when redaction is off", () => {
    const records: DiagnosticRecord[] = [
      { ts: 1710000000000, category: "console.error", data: { message: "you say hello to Bob" } },
    ];

    const markdown = serializeDiagnosticsMarkdown(records, environment, {
      redactMessageText: false,
    });

    expect(markdown).toContain("you say hello to Bob");
    expect(markdown).toContain("Message text redaction: **off**");
  });

  it("redacts fields that look like message/chat text when redaction is on", () => {
    const records: DiagnosticRecord[] = [
      {
        ts: 1710000000000,
        category: "console.error",
        data: { message: "you say hello to Bob", code: "ERR_1" },
      },
    ];

    const markdown = serializeDiagnosticsMarkdown(records, environment, {
      redactMessageText: true,
    });

    expect(markdown).not.toContain("you say hello to Bob");
    expect(markdown).toContain("[redacted]");
    // Non-text fields are left alone.
    expect(markdown).toContain("ERR_1");
    expect(markdown).toContain("Message text redaction: **on**");
  });

  it("escapes pipe characters so records can't break the table", () => {
    const records: DiagnosticRecord[] = [
      { ts: 1710000000000, category: "console.warn", data: { message: "a | b" } },
    ];

    const markdown = serializeDiagnosticsMarkdown(records, environment, {
      redactMessageText: false,
    });

    const tableLine = markdown.split("\n").find((line) => line.includes("console.warn"));
    // The row should still have exactly 3 unescaped column-delimiting pipes
    // (leading, between, trailing) plus the escaped one from the data.
    expect(tableLine).toContain("a \\| b");
  });
});
