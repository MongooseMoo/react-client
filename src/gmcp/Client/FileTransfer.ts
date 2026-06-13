import { duplex, identityCodec, messageEnvelope, outbound } from '../../protocol/messages';
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

function gmcpJson<InboundPayload, OutboundPayload = InboundPayload>() {
  return {
    encode(payload: OutboundPayload): unknown {
      return payload;
    },
    decode(payload: unknown): InboundPayload {
      return payload as InboundPayload;
    },
  };
}

const fileTransferOffer = messageEnvelope(
  'Offer',
  gmcpJson<FileTransferOffer, FileTransferOfferRequest>(),
);
const fileTransferAccept = messageEnvelope(
  'Accept',
  identityCodec<FileTransferAccept>(),
);
const fileTransferReject = messageEnvelope(
  'Reject',
  identityCodec<FileTransferReject>(),
);
const fileTransferCancel = messageEnvelope(
  'Cancel',
  gmcpJson<FileTransferCancel, FileTransferCancelRequest>(),
);
const fileTransferCandidate = messageEnvelope(
  'Candidate',
  gmcpJson<FileTransferCandidate, FileTransferCandidateRequest>(),
);
const fileTransferRequestResend = messageEnvelope(
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

export class GMCPClientFileTransfer extends GMCPClientFileTransferBase {}
