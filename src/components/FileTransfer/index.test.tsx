import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EventEmitter from 'eventemitter3';
import { expect, it, vi } from 'vitest';
import type MudClient from '../../client';
import FileTransferPanel from './index';

it('shows offers received before opening the panel and uses the initialized transfer owner', async () => {
  const offer = { sender: 'Alice', filename: 'notes.txt', filesize: 12, hash: 'hash-1', offerSdp: '{}' };
  const manager = Object.assign(new EventEmitter(), {
    pendingOffers: new Map([[offer.hash, offer]]),
    acceptTransfer: vi.fn(async () => {}),
  });
  const client = { getFileTransferManager: vi.fn(async () => manager) } as unknown as MudClient;
  const view = render(<FileTransferPanel client={client} expanded users={[]} />);
  await screen.findByText('Incoming file: notes.txt from Alice');
  fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
  await waitFor(() => expect(manager.acceptTransfer).toHaveBeenCalledWith('Alice', 'hash-1'));
  view.unmount();
  expect(manager.listenerCount('fileTransferOffer')).toBe(0);
});
