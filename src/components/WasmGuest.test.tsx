import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('retains the room ID after failure and retries without re-entry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.joinSession.mockRejectedValueOnce(new Error('unavailable')).mockResolvedValueOnce({ peer: 'host' });
    mocks.createConfiguredClient.mockReturnValue(createClient());
    const onClientReady = vi.fn();
    render(<WasmGuest roomId={null} onClientReady={onClientReady} />);
    const room = screen.getByRole('textbox', { name: 'Room ID' });
    await act(async () => fireEvent.input(room, { target: { value: 'room-to-retry' } }));
    fireEvent.submit(room.closest('form')!);
    await waitFor(() => expect(room).toHaveAttribute('aria-invalid', 'true'));
    expect(room).toHaveValue('room-to-retry');
    expect(room).toHaveFocus();
    expect(room).toHaveAccessibleDescription(/Could not join/);
    fireEvent.submit(room.closest('form')!);
    await waitFor(() => expect(onClientReady).toHaveBeenCalledOnce());
    expect(mocks.joinSession.mock.calls.map(call => call[0])).toEqual(['room-to-retry', 'room-to-retry']);
  });

  it('identifies whitespace submission and keeps correction on the labeled field', async () => {
    render(<WasmGuest roomId={null} onClientReady={vi.fn()} />);
    const room = screen.getByRole('textbox', { name: 'Room ID' });
    await act(async () => fireEvent.input(room, { target: { value: '  ' } }));
    fireEvent.submit(room.closest('form')!);
    expect(room).toHaveFocus();
    expect(room).toHaveAttribute('aria-invalid', 'true');
    expect(room).toHaveAccessibleDescription('Enter a room ID.');
    expect(mocks.joinSession).not.toHaveBeenCalled();
  });

  it('keeps the field mounted and prevents duplicate joins while connecting', async () => {
    mocks.joinSession.mockReturnValue(new Promise(() => {}));
    render(<WasmGuest roomId={null} onClientReady={vi.fn()} />);
    const room = screen.getByRole('textbox', { name: 'Room ID' });
    await act(async () => fireEvent.input(room, { target: { value: 'pending-room' } }));
    fireEvent.submit(room.closest('form')!);
    await waitFor(() => expect(mocks.joinSession).toHaveBeenCalledOnce());
    expect(room).toHaveValue('pending-room');
    expect(room).toHaveAttribute('readonly');
    expect(screen.getByRole('status')).toHaveTextContent('Connecting');
    fireEvent.submit(room.closest('form')!);
    expect(mocks.joinSession).toHaveBeenCalledOnce();
  });
});
