import { duplex, identityCodec } from '../../protocol/messages';
import { gmcpJsonMessage } from '../messages';
import { GMCPMessage, GMCPPackage } from '../package';

export class FileTransferOffer extends GMCPMessage {
  sender: string = '';
  filename: string = '';
  filesize: number = 0;
  offerSdp: string = '';
  hash: string = '';
}

export class FileTransferAccept extends GMCPMessage {
  sender: string = '';
  hash: string = '';
  filename: string = '';
  answerSdp: string = '';
}

export class FileTransferReject extends GMCPMessage {
  sender: string = '';
  hash: string = '';
}

export class FileTransferCancel extends GMCPMessage {
  sender: string = '';
  hash: string = '';
}

export interface FileTransferOfferRequest {
  recipient: string;
  filename: string;
  filesize: number;
  offerSdp: string;
  hash: string;
}

export interface FileTransferCancelRequest {
  recipient: string;
  hash: string;
}

export interface FileTransferCandidate {
  sender: string;
  candidate: string;
}

export interface FileTransferCandidateRequest {
  recipient: string;
  candidate: string;
}

const fileTransferOffer = gmcpJsonMessage<
  'Offer',
  FileTransferOffer,
  FileTransferOfferRequest
>(
  'Offer',
);
const fileTransferAccept = gmcpJsonMessage(
  'Accept',
  identityCodec<FileTransferAccept>(),
);
const fileTransferReject = gmcpJsonMessage(
  'Reject',
  identityCodec<FileTransferReject>(),
);
const fileTransferCancel = gmcpJsonMessage<
  'Cancel',
  FileTransferCancel,
  FileTransferCancelRequest
>(
  'Cancel',
);
const fileTransferCandidate = gmcpJsonMessage<
  'Candidate',
  FileTransferCandidate,
  FileTransferCandidateRequest
>(
  'Candidate',
);

const GMCPClientFileTransferBase = GMCPPackage.with({
  packageName: 'Client.FileTransfer',
  messages: [
    duplex(fileTransferOffer),
    duplex(fileTransferAccept),
    duplex(fileTransferReject),
    duplex(fileTransferCancel),
    duplex(fileTransferCandidate),
  ] as const,
});

export class GMCPClientFileTransfer extends GMCPClientFileTransferBase {
  private generation = 0;

  override receiveRegisteredMessage(wireName: string, payload: unknown): boolean {
    if (!['Offer', 'Accept', 'Reject', 'Cancel', 'Candidate'].includes(wireName)) return false;
    const generation = this.generation;
    const current = () => generation === this.generation;
    // The engine must be listening before the first message is delivered.
    // Promise callbacks retain wire order while its code is loading.
    void this.client
      .getFileTransfers()
      .then(
        () => {
          if (current()) super.receiveRegisteredMessage(wireName, payload);
        },
        (error) => {
          if (current()) console.error('Failed to load file transfer:', error);
        },
      )
      // Reached only from the delivery above: a handler of the message threw.
      .catch((error) => {
        console.error(`A handler of Client.FileTransfer.${wireName} failed:`, error);
      });
    return true;
  }

  override reset(): void {
    this.generation++;
  }
}
