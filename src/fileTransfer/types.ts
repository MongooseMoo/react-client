/**
 * The contract for peer-to-peer file transfer.
 *
 * The engine moves a file between two browsers over a WebRTC data channel. It knows
 * nothing about how the two sides find each other: that is `TransferSignaling`. It
 * knows nothing about where received bytes are kept: that is `TransferStorage`. It
 * knows nothing about WebRTC itself: that is `TransferLink`.
 *
 * One transfer owns one link. A link exists on the receiving side only after the user
 * accepted the offer, so bytes can never arrive for a transfer nobody agreed to.
 */

/** The largest file the engine sends or accepts unless told otherwise. */
export const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Address of a remote peer, opaque to the engine and meaningful to the signalling channel. */
export type PeerAddress = string;

/**
 * Identity of a file's content: lower-case hex, 64 characters. See `contentId.ts`.
 * The receiver agrees to this value when accepting an offer and verifies the
 * assembled file against it before delivering anything.
 */
export type TransferId = string;

export interface FileOffer {
  id: TransferId;
  name: string;
  size: number;
}

/**
 * Whether an offer opens a transfer or repeats one whose link was lost.
 *
 * A receiver that still knows the transfer answers a 'resume' without asking its user:
 * it continues a live one, confirms one whose file it has delivered, and rejects one
 * that ended any other way. A receiver that no longer knows the transfer, or that gave
 * up waiting for the sender to come back, treats a 'resume' as a new offer and does ask.
 * That happens after a page reload, or once the transfer has left its history.
 *
 * A 'first' offer is always a new transfer, also for a file already delivered.
 */
export type OfferAttempt = 'first' | 'resume';

/** What the engine needs from whatever carries messages between peers. */
export interface TransferSignaling {
  sendOffer(
    to: PeerAddress,
    offer: FileOffer,
    description: RTCSessionDescriptionInit,
    attempt: OfferAttempt,
  ): void;
  sendAnswer(to: PeerAddress, offer: FileOffer, description: RTCSessionDescriptionInit): void;
  sendCandidate(to: PeerAddress, id: TransferId, candidate: RTCIceCandidateInit): void;
  sendReject(to: PeerAddress, id: TransferId): void;
  sendCancel(to: PeerAddress, id: TransferId): void;
  /** Asks a sharer to offer one of their shared files. */
  sendRequest(to: PeerAddress, id: TransferId): void;
  /** Returns the function that removes the handlers again. */
  subscribe(handlers: SignalHandlers): () => void;
}

export interface SignalHandlers {
  offer(
    from: PeerAddress,
    offer: FileOffer,
    description: RTCSessionDescriptionInit,
    attempt: OfferAttempt,
  ): void;
  answer(from: PeerAddress, id: TransferId, description: RTCSessionDescriptionInit): void;
  candidate(from: PeerAddress, id: TransferId, candidate: RTCIceCandidateInit): void;
  reject(from: PeerAddress, id: TransferId): void;
  cancel(from: PeerAddress, id: TransferId): void;
  request(from: PeerAddress, id: TransferId): void;
}

/**
 * A file in a share. `path` is its folder inside the share with `/` separators, and
 * `''` for the share's top level.
 */
export interface SharedFile {
  hash: TransferId;
  name: string;
  path: string;
  size: number;
}

/** The sharing messages: everything but the transfers themselves. */
export interface SharingSignaling {
  /** Tells the server whether this player shares. */
  sendShare(sharing: boolean): void;
  sendBrowse(to: PeerAddress): void;
  sendList(to: PeerAddress, files: SharedFile[]): void;
  /** Goes to every sharer the server relays it to; `id` matches their results to it. */
  sendSearch(id: string, query: string): void;
  sendResult(to: PeerAddress, id: string, files: SharedFile[]): void;
  /** Returns the function that removes the handlers again. */
  subscribe(handlers: SharingHandlers): () => void;
}

export interface SharingHandlers {
  browse(from: PeerAddress): void;
  list(from: PeerAddress, files: SharedFile[]): void;
  search(from: PeerAddress, id: string, query: string): void;
  result(from: PeerAddress, id: string, files: SharedFile[]): void;
}

/** A partially or fully received file is stored under the peer it came from and its id. */
export interface StoredTransferKey {
  from: PeerAddress;
  id: TransferId;
}

/**
 * Where received pieces live until the file is complete. Deliberately dumb: it stores
 * and returns bytes, and the engine does all verification.
 */
export interface TransferStorage {
  /** Indices of the pieces already held for this transfer, in ascending order. */
  heldPieces(key: StoredTransferKey): Promise<number[]>;
  putPiece(key: StoredTransferKey, index: number, bytes: ArrayBuffer): Promise<void>;
  readPiece(key: StoredTransferKey, index: number): Promise<ArrayBuffer | undefined>;
  discard(key: StoredTransferKey): Promise<void>;
  /** Drops every transfer that has not been written to since `timestamp` (epoch ms). */
  discardUntouchedSince(timestamp: number): Promise<void>;
  close(): void;
}

/**
 * How many of a peer's candidates are kept for a link that cannot take them yet. A peer
 * sends a handful; anything beyond this is dropped.
 */
export const MAX_HELD_CANDIDATES = 64;

/** One connection to one peer for one transfer. */
export interface TransferLink {
  /** Offering side: opens the data channel and returns the description to signal. */
  createOffer(): Promise<RTCSessionDescriptionInit>;
  /** Answering side: takes the remote offer and returns the answer to signal. */
  acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  acceptAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  /**
   * Candidates that arrive before the remote description are held until it is set, up to
   * `MAX_HELD_CANDIDATES` of them; further ones are dropped.
   */
  addCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  /** Resolves once the frame is queued without overfilling the channel's buffer. */
  send(frame: ArrayBuffer): Promise<void>;
  /**
   * Idempotent. Does not call `onDown`. Frames already passed to `send` may be lost, so
   * the side that sends the last frame of a transfer leaves closing to the side that
   * receives it.
   */
  close(): void;
}

export interface TransferLinkHandlers {
  onCandidate(candidate: RTCIceCandidateInit): void;
  onOpen(): void;
  onFrame(frame: ArrayBuffer): void;
  /** The link failed or the far side closed it. Called at most once. */
  onDown(reason: string): void;
}

export type TransferLinkFactory = (handlers: TransferLinkHandlers) => TransferLink;

export type TransferDirection = 'send' | 'receive';

export type TransferState =
  /** Sending side only: computing the content id before anything is offered. */
  | 'preparing'
  /** The offer is out (send) or awaiting the user's decision (receive). */
  | 'offered'
  /** Accepted; the link is being established or re-established. */
  | 'connecting'
  | 'transferring'
  /** All bytes are across; the receiver is checking them against the content id. */
  | 'verifying'
  | 'complete'
  | 'rejected'
  | 'cancelled'
  | 'failed';

export type FileTransferErrorCode =
  | 'too-large'
  | 'connection-failed'
  | 'timeout'
  | 'integrity'
  | 'protocol'
  | 'storage'
  /** The file being sent could not be read. */
  | 'unreadable'
  /** The verified file could not be handed to the application. */
  | 'delivery'
  /** The same content is already moving between the same two peers. */
  | 'duplicate'
  | 'unknown-transfer';

export class FileTransferError extends Error {
  constructor(
    public readonly code: FileTransferErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'FileTransferError';
  }
}

/** Immutable view of one transfer. A new object is published on every change. */
export interface TransferSnapshot {
  /** Unique among the engine's transfers; pass it back to accept, reject or cancel. */
  key: string;
  id: TransferId;
  peer: PeerAddress;
  direction: TransferDirection;
  name: string;
  size: number;
  transferredBytes: number;
  state: TransferState;
  /** Set when `state` is 'failed'. */
  error?: FileTransferError;
}

export interface ReceivedFile {
  from: PeerAddress;
  id: TransferId;
  name: string;
  blob: Blob;
}

export interface FileTransferEvents {
  change: (transfer: TransferSnapshot) => void;
}

/** The public face of the engine: everything the application calls. */
export interface FileTransfers {
  /** Resolves with the transfer once it has been offered to the peer. */
  send(file: File, to: PeerAddress): Promise<TransferSnapshot>;
  accept(key: string): Promise<void>;
  reject(key: string): void;
  cancel(key: string): void;
  /** Every transfer the engine knows about, oldest first, finished ones included. */
  transfers(): TransferSnapshot[];
  on<E extends keyof FileTransferEvents>(event: E, listener: FileTransferEvents[E]): this;
  off<E extends keyof FileTransferEvents>(event: E, listener: FileTransferEvents[E]): this;
  /**
   * Stops everything where it stands and closes every link and the storage. Nothing is
   * signalled and nothing stored is discarded, so the far side can resume later.
   */
  dispose(): void;
}
