import { describe, expect, it, vi } from "vitest";
import { DiagnosticsRingBuffer } from "./ringBuffer";

describe("DiagnosticsRingBuffer", () => {
  it("is disabled by default and record() is a no-op", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.record("console.warn", { message: "hi" });
    expect(buffer.snapshot()).toEqual([]);
  });

  it("does not allocate or serialize when disabled", () => {
    const buffer = new DiagnosticsRingBuffer();
    const stringifySpy = vi.spyOn(JSON, "stringify");

    buffer.record("console.warn", { message: "hi" });

    expect(stringifySpy).not.toHaveBeenCalled();
    stringifySpy.mockRestore();
  });

  it("records entries once enabled", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    buffer.record("connection", { event: "connected" });

    const snapshot = buffer.snapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).toMatchObject({
      category: "connection",
      data: { event: "connected" },
    });
    expect(typeof snapshot[0].ts).toBe("number");
  });

  it("stops recording once disabled again, without clearing prior records", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    buffer.record("connection", { event: "connected" });
    buffer.setEnabled(false);
    buffer.record("connection", { event: "disconnected" });

    const snapshot = buffer.snapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].data).toEqual({ event: "connected" });
  });

  it("bounds by record count, evicting oldest first", () => {
    const buffer = new DiagnosticsRingBuffer(5, 1024 * 1024);
    buffer.setEnabled(true);

    for (let i = 0; i < 10; i++) {
      buffer.record("counters", { i });
    }

    const snapshot = buffer.snapshot();
    expect(snapshot).toHaveLength(5);
    expect(snapshot.map((r) => r.data.i)).toEqual([5, 6, 7, 8, 9]);
  });

  it("bounds by rough byte estimate, evicting oldest first", () => {
    const buffer = new DiagnosticsRingBuffer(1000, 200);
    buffer.setEnabled(true);

    const bigString = "x".repeat(100);
    for (let i = 0; i < 5; i++) {
      buffer.record("console.error", { message: bigString, i });
    }

    const snapshot = buffer.snapshot();
    // Each record is well over 100 bytes serialized, so a 200-byte cap
    // should only ever keep the most recent one or two.
    expect(snapshot.length).toBeLessThan(5);
    expect(snapshot.at(-1)?.data.i).toBe(4);
  });

  it("clear() empties the buffer", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    buffer.record("connection", { event: "connected" });
    buffer.clear();

    expect(buffer.snapshot()).toEqual([]);
  });

  it("isEnabled() reflects the current state", () => {
    const buffer = new DiagnosticsRingBuffer();
    expect(buffer.isEnabled()).toBe(false);
    buffer.setEnabled(true);
    expect(buffer.isEnabled()).toBe(true);
  });
});
