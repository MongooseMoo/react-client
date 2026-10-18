import { DataConnection } from "peerjs";

/**
 * Host-side relay between PeerJS data channels and the WASM Worker.
 *
 * Manages the mapping between WASM virtual connection IDs and PeerJS
 * DataConnections. Routes input from guests to the Worker and output
 * from the Worker back to the correct guest.
 */
export class MultiUserManager {
  private connMap: Map<number, DataConnection> = new Map();
  private worker: Worker;
  private disposed = false;
  private readonly pendingWorkerHandlers = new Map<
    (event: MessageEvent) => void,
    (error: Error) => void
  >();
  private readonly handleWorkerMessage = (event: MessageEvent): void => {
    const msg = event.data;
    if (msg.type === "conn-output" && msg.connId !== undefined) {
      const conn = this.connMap.get(msg.connId);
      if (conn && conn.open) {
        conn.send({ type: "output", data: msg.data });
      }
    }
  };

  constructor(worker: Worker) {
    this.worker = worker;
    this.setupWorkerListener();
  }

  /**
   * Listen for worker messages and route guest output to the correct DataConnection.
   */
  private setupWorkerListener(): void {
    // We need to add our listener alongside any existing ones.
    // The worker posts { type: "conn-output", connId, data } for guest connections.
    this.worker.addEventListener("message", this.handleWorkerMessage);
  }

  private addPendingWorkerHandler(
    handler: (event: MessageEvent) => void,
    reject: (error: Error) => void
  ): void {
    this.pendingWorkerHandlers.set(handler, reject);
    this.worker.addEventListener("message", handler);
  }

  private removePendingWorkerHandler(handler: (event: MessageEvent) => void): void {
    this.pendingWorkerHandlers.delete(handler);
    this.worker.removeEventListener("message", handler);
  }

  /**
   * Create a host connection (connId 0) in the WASM server.
   * Returns a promise that resolves with the connId.
   */
  connectHost(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.disposed) {
        reject(new Error("MultiUserManager destroyed"));
        return;
      }
      const handler = (event: MessageEvent) => {
        const msg = event.data;
        if (msg.type === "remote-connected") {
          this.removePendingWorkerHandler(handler);
          resolve(msg.connId);
        } else if (msg.type === "error") {
          this.removePendingWorkerHandler(handler);
          reject(new Error(msg.message));
        }
      };
      this.addPendingWorkerHandler(handler, reject);
      this.worker.postMessage({ type: "remote-connect" });
    });
  }

  /**
   * Add a guest: create a WASM connection, wire up the DataConnection
   * to relay input/output through the Worker.
   * Returns a promise that resolves with the guest's connId.
   */
  addGuest(dataConnection: DataConnection): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.disposed) {
        reject(new Error("MultiUserManager destroyed"));
        return;
      }
      const handler = (event: MessageEvent) => {
        const msg = event.data;
        if (msg.type === "remote-connected") {
          this.removePendingWorkerHandler(handler);
          const connId = msg.connId;
          this.connMap.set(connId, dataConnection);

          // Set the connection name to the peer ID
          this.worker.postMessage({
            type: "remote-set-name",
            connId,
            name: dataConnection.peer,
          });

          // Forward input from guest to worker
          dataConnection.on("data", (raw: unknown) => {
            const guestMsg = raw as { type: string; data?: string };
            if (guestMsg.type === "input" && guestMsg.data !== undefined) {
              this.worker.postMessage({
                type: "remote-input",
                connId,
                data: guestMsg.data,
              });
            }
          });

          // Handle guest disconnect
          dataConnection.on("close", () => {
            this.removeGuest(connId);
          });

          resolve(connId);
        } else if (msg.type === "error") {
          this.removePendingWorkerHandler(handler);
          reject(new Error(msg.message));
        }
      };
      this.addPendingWorkerHandler(handler, reject);
      this.worker.postMessage({ type: "remote-connect" });
    });
  }

  /**
   * Remove a guest connection.
   */
  removeGuest(connId: number): void {
    const conn = this.connMap.get(connId);
    if (conn) {
      try {
        conn.close();
      } catch (e) {
        /* ignore */
      }
      this.connMap.delete(connId);
    }
    this.worker.postMessage({ type: "remote-disconnect", connId });
  }

  /**
   * Get the number of active guest connections.
   */
  getGuestCount(): number {
    return this.connMap.size;
  }

  /**
   * Clean up all guest connections.
   */
  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.removeEventListener("message", this.handleWorkerMessage);
    this.pendingWorkerHandlers.forEach((reject, handler) => {
      this.worker.removeEventListener("message", handler);
      reject(new Error("MultiUserManager destroyed"));
    });
    this.pendingWorkerHandlers.clear();
    this.connMap.forEach((conn, connId) => {
      try {
        conn.close();
      } catch (e) {
        /* ignore */
      }
      this.worker.postMessage({ type: "remote-disconnect", connId });
    });
    this.connMap.clear();
  }
}
