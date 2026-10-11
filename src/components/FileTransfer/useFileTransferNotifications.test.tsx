import { announce } from '@react-aria/live-announcer';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../../client';
import type { TransferSnapshot } from '../../fileTransfer/types';
import { useUserlistStore } from '../../stores/userlistStore';
import {
  getFileTransferOfferNotificationBody,
  useFileTransferNotifications,
} from './useFileTransferNotifications';

vi.mock('@react-aria/live-announcer', () => ({ announce: vi.fn() }));

function TestHook({ client }: { client: MudClient | null }) {
  useFileTransferNotifications(client);
  return null;
}

/** A client whose desktop notifications are shown, or are not. */
function clientWith(notificationsShown: boolean) {
  let offerListener: ((offer: TransferSnapshot) => void) | undefined;
  const stopListening = vi.fn();
  const sendNotification = vi.fn(() => notificationsShown);
  const client = {
    onFileTransferOffer: vi.fn((listener: (offer: TransferSnapshot) => void) => {
      offerListener = listener;
      return stopListening;
    }),
    sendNotification,
  } as unknown as MudClient;
  const offer = (snapshot: Pick<TransferSnapshot, 'peer' | 'name' | 'size'>) =>
    offerListener?.(snapshot as TransferSnapshot);
  return { client, offer, sendNotification, stopListening };
}

afterEach(() => {
  vi.mocked(announce).mockClear();
  useUserlistStore.setState({ players: [] });
});

describe('useFileTransferNotifications', () => {
  it('formats incoming file transfer offers for notifications', () => {
    expect(
      getFileTransferOfferNotificationBody({ peer: '#7', name: 'notes.txt', size: 1536 }, 'Quinn'),
    ).toBe('Quinn wants to send you notes.txt (1.5 KB)');
  });

  it('notifies of each new offer the client reports and stops listening on cleanup', () => {
    const { client, offer, sendNotification, stopListening } = clientWith(true);
    const view = render(<TestHook client={client} />);

    offer({ peer: 'Riley', name: 'map.bin', size: 2048 });

    expect(sendNotification).toHaveBeenCalledWith(
      'File Transfer Offer',
      'Riley wants to send you map.bin (2.0 KB)',
    );
    // A screen reader reads the notification; saying it as well would say it twice.
    expect(announce).not.toHaveBeenCalled();
    expect(stopListening).not.toHaveBeenCalled();

    view.unmount();

    expect(stopListening).toHaveBeenCalledOnce();
  });

  it('speaks the offer when no desktop notification could be shown', () => {
    const { client, offer } = clientWith(false);
    render(<TestHook client={client} />);

    offer({ peer: 'Riley', name: 'map.bin', size: 2048 });

    expect(announce).toHaveBeenCalledWith('Riley wants to send you map.bin (2.0 KB)', 'polite');
  });

  it('names the sender as the user list does, not by address', () => {
    useUserlistStore.setState({
      players: [{ Object: '#200', Name: 'Riley', Icon: 0, away: false, idle: false }],
    });
    const { client, offer, sendNotification } = clientWith(true);
    render(<TestHook client={client} />);

    offer({ peer: '#200', name: 'map.bin', size: 10 });

    expect(sendNotification).toHaveBeenCalledWith(
      'File Transfer Offer',
      'Riley wants to send you map.bin (10 B)',
    );
  });
});
