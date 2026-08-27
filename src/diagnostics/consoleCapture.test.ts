import { afterEach, describe, expect, it, vi } from "vitest";
import { DiagnosticsRingBuffer } from "./ringBuffer";
import { capMessage, installConsoleCapture } from "./consoleCapture";

describe("capMessage", () => {
  it("returns short strings unchanged", () => {
    expect(capMessage("hello")).toBe("hello");
  });

  it("truncates long strings and appends an ellipsis", () => {
    const long = "x".repeat(600);
    const capped = capMessage(long, 500);
    expect(capped.length).toBe(501);
    expect(capped.endsWith("…")).toBe(true);
  });
});

describe("installConsoleCapture", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves original console.warn/error behavior", () => {
    const buffer = new DiagnosticsRingBuffer();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalWarn = console.warn;
    const uninstall = installConsoleCapture(buffer);

    console.warn("careful now");

    expect(warnSpy).toHaveBeenCalledWith("careful now");
    uninstall();
    expect(console.warn).toBe(originalWarn);
  });

  it("records warn/error calls only while the buffer is enabled", () => {
    const buffer = new DiagnosticsRingBuffer();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const uninstall = installConsoleCapture(buffer);

    console.warn("not captured yet");
    expect(buffer.snapshot()).toHaveLength(0);

    buffer.setEnabled(true);
    console.warn("captured");
    console.error("also captured");

    const snapshot = buffer.snapshot();
    expect(snapshot).toHaveLength(2);
    expect(snapshot[0]).toMatchObject({ category: "console.warn", data: { message: "captured" } });
    expect(snapshot[1]).toMatchObject({ category: "console.error", data: { message: "also captured" } });

    uninstall();
  });

  it("caps long messages and joins multiple arguments", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const uninstall = installConsoleCapture(buffer);

    console.error("prefix:", "x".repeat(600));

    const [record] = buffer.snapshot();
    const message = record.data.message as string;
    expect(message.startsWith("prefix:")).toBe(true);
    expect(message.length).toBeLessThanOrEqual(501);

    uninstall();
  });
});
