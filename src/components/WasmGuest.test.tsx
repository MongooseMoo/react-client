import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import WasmGuest from './WasmGuest';

const mocks = vi.hoisted(() => ({
  createConfiguredClient: vi.fn(),
  destroyPeerService: vi.fn(),
  joinSession: vi.fn(),
}));

vi.mock('../createConfiguredClient', () => ({
  createConfiguredClient: mocks.createConfiguredClient,
}));

vi.mock('../PeerService', () => ({
  PeerService: vi.fn().mockImplementation(() => ({
    destroy: mocks.destroyPeerService,
    joinSession: mocks.joinSession,
  })),
}));

vi.mock('../GuestStream', () => ({
  GuestStream: vi.fn().mockImplementation((connection) => ({ connection })),
}));

function createClient() {
  const cleanupCallbacks: Array<() => void> = [];

  return {
    cleanupCallbacks,
    connectLocal: vi.fn(),
    registerCleanup: vi.fn((callback: () => void) => {
      cleanupCallbacks.push(callback);
    }),
  };
}

describe('WasmGuest PeerService lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.joinSession.mockResolvedValue({ peer: 'host-peer' });
  });

  afterEach(() => {
    cleanup();
  });

  it('transfers successful PeerService cleanup to the configured client', async () => {
    const client = createClient();
    const onClientReady = vi.fn();
    mocks.createConfiguredClient.mockReturnValue(client);

    render(<WasmGuest roomId="room-1" onClientReady={onClientReady} />);

    await waitFor(() => expect(onClientReady).toHaveBeenCalledWith(client));
    expect(client.registerCleanup).toHaveBeenCalledTimes(1);

    client.cleanupCallbacks[0]();
    expect(mocks.destroyPeerService).toHaveBeenCalledTimes(1);
  });

  it('destroys PeerService when joining fails', async () => {
    const error = new Error('join failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.joinSession.mockRejectedValue(error);
    mocks.createConfiguredClient.mockReturnValue(createClient());

    render(<WasmGuest roomId="room-1" onClientReady={vi.fn()} />);

    await waitFor(() => expect(mocks.destroyPeerService).toHaveBeenCalledTimes(1));
    expect(consoleError).toHaveBeenCalledWith('[WebRTC] Failed to join session:', error);

    consoleError.mockRestore();
  });
});
