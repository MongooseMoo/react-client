import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WasmHost from "./WasmHost";

const mocks = vi.hoisted(() => ({
  createConfiguredClient: vi.fn(),
  saveCheckpoint: vi.fn().mockResolvedValue(undefined),
  loadCheckpoint: vi.fn().mockResolvedValue(null),
  deleteCheckpoint: vi.fn().mockResolvedValue(undefined),
  hashDbBytes: vi.fn().mockResolvedValue("db-key"),
  workerStreamDispose: vi.fn(),
  workers: [] as MockWasmWorker[],
}));

class MockWasmWorker {
  readonly addEventListener = vi.fn((type: string, listener: EventListener) => {
    this.listeners.get(type)?.add(listener);
  });
  readonly removeEventListener = vi.fn(
    (type: string, listener: EventListener) => {
      this.listeners.get(type)?.delete(listener);
    }
  );
  readonly postMessage = vi.fn();
  readonly terminate = vi.fn();
  private readonly listeners = new Map<string, Set<EventListener>>([
    ["message", new Set()],
  ]);

  dispatchMessage(data: unknown): void {
    this.listeners
      .get("message")
      ?.forEach((listener) => {
        listener({ data } as MessageEvent);
      });
  }
}

vi.mock("../createConfiguredClient", () => ({
  createConfiguredClient: mocks.createConfiguredClient,
}));

vi.mock("../dbStorage", () => ({
  saveCheckpoint: mocks.saveCheckpoint,
  loadCheckpoint: mocks.loadCheckpoint,
  deleteCheckpoint: mocks.deleteCheckpoint,
  hashDbBytes: mocks.hashDbBytes,
}));

vi.mock("../WorkerStream", () => ({
  WorkerStream: vi.fn().mockImplementation(() => ({
    dispose: mocks.workerStreamDispose,
    on: vi.fn(),
    write: vi.fn(),
  })),
}));

function createClient() {
  return {
    connectLocal: vi.fn(),
    shutdown: vi.fn(),
  };
}

describe("WasmHost lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.workers.length = 0;
    mocks.loadCheckpoint.mockResolvedValue(null);
    mocks.hashDbBytes.mockResolvedValue("db-key");
    mocks.createConfiguredClient.mockReturnValue(createClient());
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    }) as unknown as typeof fetch;
    global.Worker = vi.fn().mockImplementation(() => {
      const worker = new MockWasmWorker();
      mocks.workers.push(worker);
      return worker;
    }) as unknown as typeof Worker;
  });

  afterEach(() => {
    cleanup();
    delete (window as any).wasmWorker;
    delete (window as any).__wasmAutoSaveInterval;
    delete (window as any).wasmDbKey;
  });

  it("cleans up autosave, stream, client services, worker listener, worker, and globals on unmount", async () => {
    const onClientReady = vi.fn();
    const client = createClient();
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    mocks.createConfiguredClient.mockReturnValue(client);

    const { unmount } = render(
      <WasmHost
        clientReady={false}
        dbUrl="/db"
        isHostMode={false}
        onClientReady={onClientReady}
      />
    );

    await waitFor(() => expect(mocks.workers).toHaveLength(1));
    const worker = mocks.workers[0];
    expect(onClientReady).not.toHaveBeenCalled();

    act(() => {
      worker.dispatchMessage({ type: "ready" });
    });
    expect(onClientReady).toHaveBeenCalledWith(client);
    const interval = (window as any).__wasmAutoSaveInterval;
    expect(interval).toBeDefined();

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledWith(interval);
    expect(client.shutdown).toHaveBeenCalledTimes(1);
    expect(mocks.workerStreamDispose).toHaveBeenCalledTimes(1);
    expect(worker.removeEventListener).toHaveBeenCalledWith(
      "message",
      worker.addEventListener.mock.calls[0][1]
    );
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect((window as any).wasmWorker).toBeUndefined();
    expect((window as any).__wasmAutoSaveInterval).toBeUndefined();
    expect((window as any).wasmDbKey).toBeUndefined();
  });

  it('reports a failed boot and lets a host choose another database', async () => {
    const { screen, fireEvent } = await import('@testing-library/react');
    render(<WasmHost dbUrl={null} isHostMode onClientReady={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Use default database/ }));
    await waitFor(() => expect(mocks.workers).toHaveLength(1));
    act(() => mocks.workers[0].dispatchMessage({ type: 'error', message: 'Database parse failed.' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Database parse failed'));
    fireEvent.click(screen.getByRole('button', { name: /Use default database/ }));
    await waitFor(() => expect(mocks.workers).toHaveLength(2));
  });
});
