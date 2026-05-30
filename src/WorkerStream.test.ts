import { Buffer } from "buffer";
import { describe, expect, it, vi } from "vitest";

import { WorkerStream } from "./WorkerStream";

class MockWorker {
  readonly addEventListener = vi.fn((type: string, listener: EventListener) => {
    this.listeners.get(type)?.add(listener);
  });
  readonly removeEventListener = vi.fn(
    (type: string, listener: EventListener) => {
      this.listeners.get(type)?.delete(listener);
    }
  );
  readonly postMessage = vi.fn();
  private readonly listeners = new Map<string, Set<EventListener>>([
    ["message", new Set()],
  ]);

  dispatchMessage(data: unknown): void {
    this.listeners
      .get("message")
      ?.forEach((listener) => listener({ data } as MessageEvent));
  }
}

describe("WorkerStream lifecycle", () => {
  it("removes its worker message listener and clears callbacks on dispose", () => {
    const worker = new MockWorker();
    const stream = new WorkerStream(worker as unknown as Worker);
    const onData = vi.fn();
    const onClose = vi.fn();

    stream.on("data", onData);
    stream.on("close", onClose);
    worker.dispatchMessage({ type: "output", data: "look" });
    worker.dispatchMessage({ type: "disconnect" });

    expect(onData).toHaveBeenCalledWith(Buffer.from("look\r\n"));
    expect(onClose).toHaveBeenCalledTimes(1);

    stream.dispose();
    stream.dispose();
    worker.dispatchMessage({ type: "output", data: "after" });
    worker.dispatchMessage({ type: "disconnect" });

    expect(worker.removeEventListener).toHaveBeenCalledTimes(1);
    expect(worker.removeEventListener).toHaveBeenCalledWith(
      "message",
      worker.addEventListener.mock.calls[0][1]
    );
    expect(onData).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("writes input to the worker without the line terminator", () => {
    const worker = new MockWorker();
    const stream = new WorkerStream(worker as unknown as Worker);

    stream.write(Buffer.from("north\r\n"));

    expect(worker.postMessage).toHaveBeenCalledWith({
      type: "input",
      data: "north",
    });
  });
});
