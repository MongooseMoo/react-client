import { DataConnection } from "peerjs";
import { Stream } from "./telnet";

/**
 * Implements Stream interface over a PeerJS DataConnection.
 * Used by guest clients to communicate with the host's WASM server
 * via WebRTC data channels.
 *
 * Protocol: JSON messages over the data channel
 * - Host->Guest: { type: "output", data: string }
 * - Guest->Host: { type: "input", data: string }
 */
export class GuestStream implements Stream {
  private dataCallback: ((data: Uint8Array) => void) | null = null;
  private closeCallback: (() => void) | null = null;

  constructor(private conn: DataConnection) {
    this.conn.on("data", (raw: unknown) => {
      const msg = raw as { type: string; data?: string };
      if (
        msg.type === "output" &&
        msg.data !== undefined &&
        this.dataCallback
      ) {
        this.dataCallback(new TextEncoder().encode(msg.data + "\r\n"));
      }
    });

    this.conn.on("close", () => {
      if (this.closeCallback) {
        this.closeCallback();
      }
    });
  }

  on(event: "data", cb: (data: Uint8Array) => void): void;
  on(event: "close", cb: () => void): void;
  on(event: string, cb: (...args: any[]) => void): void {
    if (event === "data") {
      this.dataCallback = cb as (data: Uint8Array) => void;
    } else if (event === "close") {
      this.closeCallback = cb as () => void;
    }
  }

  write(data: Uint8Array): void {
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(data).replace(/\r?\n$/, "");
    this.conn.send({ type: "input", data: text });
  }

  close(): void {
    this.conn.close();
  }
}
