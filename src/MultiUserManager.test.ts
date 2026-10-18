import { describe, expect, it, vi } from "vitest";

import { MultiUserManager } from "./MultiUserManager";

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

function createConnection() {
  return {
    open: true,
    peer: "guest-1",
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
  };
}

describe("MultiUserManager lifecycle", () => {
  it("removes its persistent worker router on destroy", async () => {
    const worker = new MockWorker();
    const manager = new MultiUserManager(worker as unknown as Worker);
    const conn = createConnection();

    const addGuest = manager.addGuest(conn as any);
    worker.dispatchMessage({ type: "remote-connected", connId: 3 });
    await expect(addGuest).resolves.toBe(3);

    worker.dispatchMessage({ type: "conn-output", connId: 3, data: "hello" });
    expect(conn.send).toHaveBeenCalledWith({
      type: "output",
      data: "hello",
    });

    manager.destroy();
    worker.dispatchMessage({ type: "conn-output", connId: 3, data: "after" });

    expect(worker.removeEventListener).toHaveBeenCalledWith(
      "message",
      worker.addEventListener.mock.calls[0][1]
    );
    expect(conn.send).toHaveBeenCalledTimes(1);
  });

  it("removes and rejects pending worker request handlers on destroy", async () => {
    const worker = new MockWorker();
    const manager = new MultiUserManager(worker as unknown as Worker);

    const connectHost = manager.connectHost();
    expect(worker.addEventListener).toHaveBeenCalledTimes(2);

    manager.destroy();

    await expect(connectHost).rejects.toThrow("MultiUserManager destroyed");
    expect(worker.removeEventListener).toHaveBeenCalledWith(
      "message",
      worker.addEventListener.mock.calls[1][1]
    );
  });
});
