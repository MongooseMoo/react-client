import { duplex, identityCodec, outbound } from '../../protocol/messages';
import { gmcpJsonMessage } from '../messages';
import { GMCPMessage, GMCPPackage } from '../package';

export class FileTransferOffer extends GMCPMessage {
  sender: string = '';
  filename: string = '';
  filesize: number = 0;
  offerSdp: string = '';
  hash: string = '';
  resume: boolean = false;
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
  resume: boolean;
}

export interface FileTransferCancelRequest {
  recipient: string;
  hash: string;
}

export interface FileTransferCandidate {
  sender: string;
  hash: string;
  candidate: string;
}

export interface FileTransferCandidateRequest {
  recipient: string;
  hash: string;
  candidate: string;
}

/** A file in a share, as Share, List and Result describe it. */
export interface FileTransferSharedFile {
  hash: string;
  name: string;
  path: string;
  size: number;
}

export interface FileTransferShareRequest {
  sharing: boolean;
}

export interface FileTransferBrowse {
  sender: string;
}

export interface FileTransferBrowseRequest {
  recipient: string;
}

export interface FileTransferList {
  sender: string;
  files: FileTransferSharedFile[];
}

export interface FileTransferListRequest {
  recipient: string;
  files: FileTransferSharedFile[];
}

export interface FileTransferSearch {
  sender: string;
  id: string;
  query: string;
}

/** Names no recipient: the server delivers it to the sharers. */
export interface FileTransferSearchRequest {
  id: string;
  query: string;
}

export interface FileTransferResult {
  sender: string;
  id: string;
  files: FileTransferSharedFile[];
}

export interface FileTransferResultRequest {
  recipient: string;
  id: string;
  files: FileTransferSharedFile[];
}

export interface FileTransferRequest {
  sender: string;
  hash: string;
}

export interface FileTransferRequestRequest {
  recipient: string;
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
// Share is not relayed, so it never arrives.
const fileTransferShare = gmcpJsonMessage<'Share', never, FileTransferShareRequest>('Share');
const fileTransferBrowse = gmcpJsonMessage<
  'Browse',
  FileTransferBrowse,
  FileTransferBrowseRequest
>('Browse');
const fileTransferList = gmcpJsonMessage<'List', FileTransferList, FileTransferListRequest>(
  'List',
);
const fileTransferSearch = gmcpJsonMessage<
  'Search',
  FileTransferSearch,
  FileTransferSearchRequest
>('Search');
const fileTransferResult = gmcpJsonMessage<
  'Result',
  FileTransferResult,
  FileTransferResultRequest
>('Result');
const fileTransferRequest = gmcpJsonMessage<
  'Request',
  FileTransferRequest,
  FileTransferRequestRequest
>('Request');

/** The messages that arrive; each waits for the file transfer code to load. */
const INBOUND = [
  'Offer',
  'Accept',
  'Reject',
  'Cancel',
  'Candidate',
  'Browse',
  'List',
  'Search',
  'Result',
  'Request',
];

const GMCPClientFileTransferBase = GMCPPackage.with({
  packageName: 'Client.FileTransfer',
  messages: [
    duplex(fileTransferOffer),
    duplex(fileTransferAccept),
    duplex(fileTransferReject),
    duplex(fileTransferCancel),
    duplex(fileTransferCandidate),
    outbound(fileTransferShare),
    duplex(fileTransferBrowse),
    duplex(fileTransferList),
    duplex(fileTransferSearch),
    duplex(fileTransferResult),
    duplex(fileTransferRequest),
  ] as const,
});

export class GMCPClientFileTransfer extends GMCPClientFileTransferBase {
  private generation = 0;

  override receiveRegisteredMessage(wireName: string, payload: unknown): boolean {
    if (!INBOUND.includes(wireName)) return false;
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
