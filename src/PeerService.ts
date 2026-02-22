import Peer, { DataConnection } from "peerjs";

/**
 * PeerService wraps PeerJS for host/guest roles.
 *
 * Host mode: creates a Peer, listens for incoming guest connections.
 * Guest mode: creates a Peer, connects to a host by room ID.
 *
 * The host's peer ID serves as the "room code" that guests use to join.
 */
export class PeerService {
  private peer: Peer | null = null;
  private connections: DataConnection[] = [];
  private onGuestCallback: ((conn: DataConnection) => void) | null = null;

  /**
   * Host mode: create a new Peer, resolve with the assigned peer ID (room code).
   */
  hostSession(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer();
      this.peer.on("open", (id: string) => {
        resolve(id);
      });
      this.peer.on("error", (err: Error) => {
        reject(err);
      });
      this.peer.on("connection", (conn: DataConnection) => {
        this.connections.push(conn);
        conn.on("close", () => {
          this.connections = this.connections.filter((c) => c !== conn);
        });
        if (this.onGuestCallback) {
          this.onGuestCallback(conn);
        }
      });
    });
  }

  /**
   * Guest mode: connect to a host by room ID.
   * Resolves with the DataConnection once it's open.
   */
  joinSession(roomId: string): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer();
      this.peer.on("open", () => {
        const conn = this.peer!.connect(roomId, { reliable: true });
        conn.on("open", () => {
          this.connections.push(conn);
          resolve(conn);
        });
        conn.on("error", (err: Error) => {
          reject(err);
        });
      });
      this.peer.on("error", (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Host subscribes to guest connections.
   */
  onGuestConnected(callback: (conn: DataConnection) => void): void {
    this.onGuestCallback = callback;
  }

  /**
   * Get current connection count.
   */
  getConnectionCount(): number {
    return this.connections.length;
  }

  /**
   * Clean up peer connection and all data channels.
   */
  destroy(): void {
    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch (e) {
        /* ignore */
      }
    });
    this.connections = [];
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.onGuestCallback = null;
  }
}
