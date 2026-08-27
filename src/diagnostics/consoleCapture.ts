import { type DiagnosticsRingBuffer, diagnosticsBuffer } from "./ringBuffer";

const MAX_MESSAGE_LENGTH = 500;

function formatConsoleArg(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Caps a string to `maxLength`, appending an ellipsis when truncated. */
export function capMessage(value: string, maxLength: number = MAX_MESSAGE_LENGTH): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

function formatConsoleArgs(args: unknown[]): string {
  return capMessage(args.map(formatConsoleArg).join(" "));
}

/**
 * Wraps `console.warn` and `console.error` exactly once, forwarding to the
 * original implementation first (so DevTools behavior is unchanged) and
 * then recording a capped copy of the message into the diagnostics buffer.
 * The buffer itself no-ops while disabled, so this wrapper stays cheap even
 * when diagnostics capture is off.
 *
 * Returns a function that restores the original console methods, primarily
 * for tests.
 */
export function installConsoleCapture(
  buffer: DiagnosticsRingBuffer = diagnosticsBuffer,
): () => void {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: unknown[]) => {
    originalWarn.apply(console, args);
    buffer.record("console.warn", { message: formatConsoleArgs(args) });
  };

  console.error = (...args: unknown[]) => {
    originalError.apply(console, args);
    buffer.record("console.error", { message: formatConsoleArgs(args) });
  };

  return () => {
    console.warn = originalWarn;
    console.error = originalError;
  };
}
