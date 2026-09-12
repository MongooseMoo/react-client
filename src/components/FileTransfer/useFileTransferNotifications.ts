import { useEffect } from 'react';
import type MudClient from '../../client';
import type { FileTransferOffer } from '../../gmcp/Client/FileTransfer';

const FILE_TRANSFER_NOTIFICATION_TITLE = 'File Transfer Offer';

type FileTransferOfferNotification = Pick<FileTransferOffer, 'sender' | 'filename' | 'filesize'>;

export function getFileTransferOfferNotificationBody(offer: FileTransferOfferNotification): string {
  return `${offer.sender} wants to send you ${offer.filename} (${Math.round(
    offer.filesize / 1024,
  )} KB)`;
}

export function useFileTransferNotifications(client: MudClient | null): void {
  useEffect(() => {
    if (!client) return;

    const handleFileTransferOffer = (offer: FileTransferOffer) => {
      client.sendNotification(
        FILE_TRANSFER_NOTIFICATION_TITLE,
        getFileTransferOfferNotificationBody(offer),
      );
    };

    client.gmcp_fileTransfer.on('offer', handleFileTransferOffer);
    return () => {
      client.gmcp_fileTransfer.off('offer', handleFileTransferOffer);
    };
  }, [client]);
}
