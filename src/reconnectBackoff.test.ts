import { describe, expect, it } from 'vitest';

import { reconnectDelay } from './reconnectBackoff';

describe('reconnectDelay', () => {
  it('steps through 1s, 2s and 5s, then stays at 10s', () => {
    expect([0, 1, 2, 3, 4, 50].map(reconnectDelay)).toEqual([
      1000, 2000, 5000, 10000, 10000, 10000,
    ]);
  });
});
