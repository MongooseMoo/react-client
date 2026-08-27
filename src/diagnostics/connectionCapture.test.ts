import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useConnectionStore } from "../stores/connectionStore";
import { DiagnosticsRingBuffer } from "./ringBuffer";
import { startConnectionCapture } from "./connectionCapture";

describe("startConnectionCapture", () => {
  beforeEach(() => {
    useConnectionStore.getState().reset();
  });

  afterEach(() => {
    useConnectionStore.getState().reset();
  });

  it("records the first connection without counting it as a reconnect", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startConnectionCapture(buffer);

    useConnectionStore.getState().setConnected(true);

    const snapshot = buffer.snapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).toMatchObject({
      category: "connection",
      data: { event: "connected", reconnectCount: 0 },
    });

    stop();
  });

  it("increments reconnectCount on subsequent reconnects", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startConnectionCapture(buffer);

    useConnectionStore.getState().setConnected(true);
    useConnectionStore.getState().setConnected(false);
    useConnectionStore.getState().setConnected(true);

    const events = buffer.snapshot().map((r) => r.data);
    expect(events).toEqual([
      { event: "connected", reconnectCount: 0 },
      { event: "disconnected", statusText: "Disconnected", reconnectCount: 0 },
      { event: "connected", reconnectCount: 1 },
    ]);

    stop();
  });

  it("records status text changes that aren't connect/disconnect", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startConnectionCapture(buffer);

    useConnectionStore.getState().setStatusText("Reconnecting...");

    const snapshot = buffer.snapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).toMatchObject({
      category: "connection",
      data: { event: "status", statusText: "Reconnecting..." },
    });

    stop();
  });

  it("stops recording after the returned unsubscribe is called", () => {
    const buffer = new DiagnosticsRingBuffer();
    buffer.setEnabled(true);
    const stop = startConnectionCapture(buffer);
    stop();

    useConnectionStore.getState().setConnected(true);

    expect(buffer.snapshot()).toHaveLength(0);
  });
});
