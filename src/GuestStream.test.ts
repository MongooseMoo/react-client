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
  it('round-trips Unicode and BOMs through native byte-array views', () => {
    const connection = createConnection();
    const stream = new GuestStream(connection as unknown as DataConnection);
    const receive = vi.fn();
    stream.on('data', receive);
    const onData = connection.on.mock.calls.find(([name]) => name === 'data')?.[1];
    expect(onData).toBeTypeOf('function');
    onData?.({ type: 'output', data: '\uFEFFcafé 🎵' });
    const bytes = new TextEncoder().encode('\uFEFFcafé 🎵\r\n');
    expect(receive).toHaveBeenCalledWith(bytes);
    const padded = new Uint8Array([0, ...bytes, 0]);
    stream.write(padded.subarray(1, padded.length - 1));
    expect(connection.send).toHaveBeenCalledWith({ type: 'input', data: '\uFEFFcafé 🎵' });
  });

  it('closes its underlying data connection', () => {
    const connection = createConnection();
    const stream = new GuestStream(connection as unknown as DataConnection);

    stream.close();

    expect(connection.close).toHaveBeenCalledTimes(1);
  });
});
