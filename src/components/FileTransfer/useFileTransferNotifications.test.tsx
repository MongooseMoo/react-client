import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type MudClient from '../../client';
import type { FileTransferOffer } from '../../gmcp/Client/FileTransfer';
import {
  getFileTransferOfferNotificationBody,
  useFileTransferNotifications,
} from './useFileTransferNotifications';

function TestHook({ client }: { client: MudClient | null }) {
  useFileTransferNotifications(client);
  return null;
}

describe('useFileTransferNotifications', () => {
  it('formats incoming file transfer offers for notifications', () => {
    expect(
      getFileTransferOfferNotificationBody({
        sender: 'Quinn',
        filename: 'notes.txt',
        filesize: 1536,
      }),
    ).toBe('Quinn wants to send you notes.txt (2 KB)');
  });

  it('subscribes to file transfer offers and removes the listener on cleanup', () => {
    let offerHandler: ((offer: FileTransferOffer) => void) | undefined;
    const sendNotification = vi.fn();
    const fileTransferManager = {
      on: vi.fn((event: string, handler: (offer: FileTransferOffer) => void) => {
        if (event === 'fileTransferOffer') {
          offerHandler = handler;
        }
      }),
      off: vi.fn(),
    };
    const client = {
      fileTransferManager,
      sendNotification,
    } as unknown as MudClient;

    const view = render(<TestHook client={client} />);

    expect(fileTransferManager.on).toHaveBeenCalledWith('fileTransferOffer', expect.any(Function));

    offerHandler?.({
      sender: 'Riley',
      filename: 'map.bin',
      filesize: 2048,
    } as FileTransferOffer);

    expect(sendNotification).toHaveBeenCalledWith(
      'File Transfer Offer',
      'Riley wants to send you map.bin (2 KB)',
    );

    view.unmount();

    expect(fileTransferManager.off).toHaveBeenCalledWith('fileTransferOffer', offerHandler);
  });
});
