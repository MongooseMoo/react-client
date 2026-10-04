const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000];

/**
 * Delay before reconnect attempt number `attempt` (0-based): 1s, 2s, 5s, then
 * 10s for every later attempt.
 */
export function reconnectDelay(attempt: number): number {
  return RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)];
}
