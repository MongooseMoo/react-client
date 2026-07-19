import type { DataConnection } from 'peerjs';
import { describe, expect, it, vi } from 'vitest';

import { GuestStream } from './GuestStream';

function createConnection() {
  return {
    close: vi.fn(),
    on: vi.fn(),
    send: vi.fn(),
  };
}

describe('GuestStream', () => {
  it('closes its underlying data connection', () => {
    const connection = createConnection();
    const stream = new GuestStream(connection as unknown as DataConnection);

    stream.close();

    expect(connection.close).toHaveBeenCalledTimes(1);
  });
});
