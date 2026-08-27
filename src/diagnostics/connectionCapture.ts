import { useConnectionStore } from "../stores/connectionStore";
import { type DiagnosticsRingBuffer, diagnosticsBuffer } from "./ringBuffer";

/**
 * Records connection lifecycle transitions (connect / disconnect / status
 * text updates) into the diagnostics buffer, and tracks a running reconnect
 * count (the number of times the client reconnected after an initial
 * connection was lost).
 *
 * Returns an unsubscribe function.
 */
export function startConnectionCapture(
  buffer: DiagnosticsRingBuffer = diagnosticsBuffer,
): () => void {
  let everConnected = useConnectionStore.getState().connected;
  let reconnectCount = 0;

  return useConnectionStore.subscribe((state, previousState) => {
    if (state.connected !== previousState.connected) {
      if (state.connected) {
        if (everConnected) {
          reconnectCount += 1;
        }
        everConnected = true;
        buffer.record("connection", { event: "connected", reconnectCount });
      } else {
        buffer.record("connection", {
          event: "disconnected",
          statusText: state.statusText,
          reconnectCount,
        });
      }
      return;
    }

    if (state.statusText !== previousState.statusText) {
      buffer.record("connection", { event: "status", statusText: state.statusText });
    }
  });
}
