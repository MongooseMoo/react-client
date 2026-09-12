import { duplex, identityCodec, outbound } from '../../protocol/messages';
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

export interface FileTransferRequestResend {
  sender: string;
  hash: string;
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
const fileTransferRequestResend = gmcpJsonMessage(
  'RequestResend',
  identityCodec<FileTransferRequestResend>(),
);

const GMCPClientFileTransferBase = GMCPPackage.with({
  packageName: 'Client.FileTransfer',
  messages: [
    duplex(fileTransferOffer),
    duplex(fileTransferAccept),
    duplex(fileTransferReject),
    duplex(fileTransferCancel),
    duplex(fileTransferCandidate),
    outbound(fileTransferRequestResend),
  ] as const,
});

export class GMCPClientFileTransfer extends GMCPClientFileTransferBase {
  private generation = 0;

  override receiveRegisteredMessage(wireName: string, payload: unknown): boolean {
    if (!['Offer', 'Accept', 'Reject', 'Cancel', 'Candidate'].includes(wireName)) return false;
    const generation = this.generation;
    // Install the transfer owner's listeners before delivering the first message.
    // Promise callbacks retain wire order while the feature code is loading.
    void this.client.getFileTransferManager().then(() => {
      if (generation === this.generation) super.receiveRegisteredMessage(wireName, payload);
    }).catch((error) => {
      if (generation === this.generation) console.error('Failed to initialize file transfer:', error);
    });
    return true;
  }

  override reset(): void {
    this.generation++;
  }
}
