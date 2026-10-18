import { announce } from '@react-aria/live-announcer';
import { useEffect } from 'react';
import type MudClient from '../../client';
import { findTransferPeerByAddress, userlistPlayersToTransferPeers } from '../../fileTransferPeers';
import type { TransferSnapshot } from '../../fileTransfer/types';
import { useUserlistStore } from '../../stores/userlistStore';
import { formatFileSize } from './formatFileSize';

const FILE_TRANSFER_NOTIFICATION_TITLE = 'File Transfer Offer';

type FileTransferOfferNotification = Pick<TransferSnapshot, 'peer' | 'name' | 'size'>;

/** `senderLabel` is the sender as the user knows them, not their address. */
export function getFileTransferOfferNotificationBody(
  offer: FileTransferOfferNotification,
  senderLabel: string = offer.peer,
): string {
  return `${senderLabel} wants to send you ${offer.name} (${formatFileSize(offer.size)})`;
}

function labelOf(peer: string): string {
  const peers = userlistPlayersToTransferPeers(useUserlistStore.getState().players);
  return findTransferPeerByAddress(peers, peer)?.label ?? peer;
}

/**
 * Tells the user of each newly offered file, wherever in the client they are: as a
 * desktop notification, or spoken when notifications are not allowed. A screen reader
 * reads a desktop notification itself, so the offer is never said twice.
 */
export function useFileTransferNotifications(client: MudClient | null): void {
  useEffect(() => {
    if (!client) return;

    return client.onFileTransferOffer((offer) => {
      const body = getFileTransferOfferNotificationBody(offer, labelOf(offer.peer));
      if (!client.sendNotification(FILE_TRANSFER_NOTIFICATION_TITLE, body)) {
        announce(body, 'polite');
      }
    });
  }, [client]);
}
