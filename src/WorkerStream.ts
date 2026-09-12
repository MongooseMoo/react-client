import { Stream } from "./telnet";

/**
 * WorkerStream implements the Stream interface from telnet.ts,
 * routing data through a Web Worker instead of a WebSocket.
 *
 * The WASM MOO server sends plain text (no telnet IAC framing).
 * The TelnetParser handles this fine — it passes through non-IAC bytes as data.
 */
export class WorkerStream implements Stream {
  private worker: Worker;
  private dataCallback?: (data: Uint8Array) => void;
  private closeCallback?: () => void;
  private disposed = false;
  private readonly handleWorkerMessage = (e: MessageEvent): void => {
    const msg = e.data;
    if (msg.type === "output") {
      // Convert text line to bytes (as if from a telnet connection).
      // The WASM server sends plain text lines via Module.print().
      // Append \r\n so the client's line-splitting logic works the same
      // as it does for real telnet data.
      const text = msg.data + "\r\n";
      this.dataCallback?.(new TextEncoder().encode(text));
    } else if (msg.type === "disconnect") {
      this.closeCallback?.();
    }
  };

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.addEventListener("message", this.handleWorkerMessage);
  }

  on(event: "data", cb: (data: Uint8Array) => void): void;
  on(event: "close", cb: () => void): void;
  on(event: string, cb: (...args: any[]) => void) {
    if (event === "data") this.dataCallback = cb as (data: Uint8Array) => void;
    if (event === "close") this.closeCallback = cb as () => void;
  }

  write(data: Uint8Array): void {
    // Convert bytes to text and send to worker.
    // The client sends commands as text + "\r\n". Strip the trailing
    // \r\n since wasm_inject_input() expects a bare line.
    let text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(data);
    text = text.replace(/\r?\n$/, "");
    this.worker.postMessage({ type: "input", data: text });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.removeEventListener("message", this.handleWorkerMessage);
    this.dataCallback = undefined;
    this.closeCallback = undefined;
  }
}
