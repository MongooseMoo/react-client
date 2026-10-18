import { IncomingTransfer } from './incomingTransfer';
import { OutgoingTransfer } from './outgoingTransfer';
import { isFinished, type Transfer, type TransferContext, type TransferLimits } from './transfer';
import {
  DEFAULT_MAX_FILE_SIZE,
  FileTransferError,
  type FileOffer,
  type FileTransferEvents,
  type FileTransfers,
  type OfferAttempt,
  type PeerAddress,
  type ReceivedFile,
  type TransferId,
  type TransferLinkFactory,
  type TransferSignaling,
  type TransferSnapshot,
  type TransferStorage,
} from './types';

export interface FileTransferEngineOptions {
  signaling: TransferSignaling;
  storage: TransferStorage;
  createLink: TransferLinkFactory;
  /** Receives each verified file. */
  deliver(file: ReceivedFile): void | Promise<void>;
  /** The shared file with this content id, sent when a peer requests it. */
  sharedFile?(id: TransferId): File | undefined;
  /** Largest file sent or accepted. Default 100 MiB. */
  maxFileSize?: number;
  /**
   * How long an offer may go unanswered: by the peer for an outgoing one, by the user for
   * an incoming one. Default 5 minutes.
   */
  offerTimeoutMs?: number;
  /**
   * How long a link may show no progress before it counts as down. It applies while a
   * link is being established ('connecting' with a link) and while pieces move
   * ('transferring'), on both sides: progress is the link opening, `ready`, a piece sent
   * or stored, or a `stored` report. It does not apply while a sender waits for an
   * answer ('offered'), while a receiver waits for the sender to offer again, or in
   * 'verifying'. It is also how long a link is kept after the last word was said on it.
   * Default 30 s.
   */
  idleTimeoutMs?: number;
  /**
   * How long a sender waits in 'verifying' for the receiver to check and save the file
   * before it counts the link as down. Default 5 minutes.
   */
  verificationTimeoutMs?: number;
  /** How long a receiver waits for the sender to offer again after its link went down. Default 60 s. */
  reconnectWaitMs?: number;
  /**
   * How often in a row a sender replaces a failed link; the failure after that ends the
   * transfer. A receiver takes one more repeated offer than that without progress, then
   * ends the transfer. Default 3.
   */
  maxReconnects?: number;
  /** Undecided incoming offers kept per peer; further ones from that peer are rejected unseen. Default 4. */
  maxPendingOffersPerPeer?: number;
  /** Undecided incoming offers kept from all peers together. Default 64. */
  maxPendingOffersOverall?: number;
  /** Stored pieces of transfers untouched for this long are purged at start. Default 7 days. */
  partialRetentionMs?: number;
}

const DEFAULT_LIMITS: TransferLimits = {
  maxFileSize: DEFAULT_MAX_FILE_SIZE,
  offerTimeoutMs: 5 * 60 * 1000,
  idleTimeoutMs: 30 * 1000,
  verificationTimeoutMs: 5 * 60 * 1000,
  reconnectWaitMs: 60 * 1000,
  maxReconnects: 3,
  maxPendingOffersPerPeer: 4,
  maxPendingOffersOverall: 64,
  partialRetentionMs: 7 * 24 * 60 * 60 * 1000,
};

const FINISHED_TRANSFERS_KEPT = 50;

/**
 * Moves files between this client and its peers. It owns the table of transfers and
 * routes each signal to the one it is about; what a transfer then does is in
 * `OutgoingTransfer` and `IncomingTransfer`.
 *
 * Among live transfers a peer and a content id name at most one, whatever its direction.
 * Answers, candidates, rejections and cancellations carry nothing else to go by.
 *
 * A finished transfer stays listed until `FINISHED_TRANSFERS_KEPT` later ones have
 * finished. An incoming offer the user never accepted is not kept once it is over: its
 * end is published and that is all, so offers nobody wanted cannot crowd out the rest.
 *
 * After `dispose()` the engine knows no transfers: `send` rejects, and `accept`,
 * `reject` and `cancel` fail with 'unknown-transfer' like for any other unknown key.
 */
export class FileTransferEngine implements FileTransfers {
  private readonly context: TransferContext;
  private readonly listeners: { [E in keyof FileTransferEvents]: Set<FileTransferEvents[E]> } = {
    change: new Set(),
  };
  /** Oldest first. */
  private readonly all: Transfer[] = [];
  /** The finished ones among them, in the order they finished. */
  private readonly finished: Transfer[] = [];
  private readonly unsubscribe: () => void;
  private keysIssued = 0;
  private disposed = false;

  constructor(options: FileTransferEngineOptions) {
    const { signaling, storage, createLink, deliver, sharedFile, ...limits } = options;
    this.context = {
      signaling,
      storage,
      createLink,
      deliver,
      limits: { ...DEFAULT_LIMITS, ...limits },
      publish: (snapshot) => this.publish(snapshot),
    };
    const stale = Date.now() - this.context.limits.partialRetentionMs;
    storage.discardUntouchedSince(stale).catch(() => undefined);
    this.unsubscribe = signaling.subscribe({
      offer: (from, offer, description, attempt) =>
        this.offered(from, offer, description, attempt),
      answer: (from, id, description) => this.outgoing(from, id)?.answered(description),
      candidate: (from, id, candidate) => this.linked(from, id)?.addCandidate(candidate),
      reject: (from, id) => this.outgoing(from, id)?.rejectedByPeer(),
      cancel: (from, id) => this.addressed(from, id)?.cancelledByPeer(),
      request: (from, id) => {
        const file = sharedFile?.(id);
        if (file) this.send(file, from).catch(() => undefined);
        else signaling.sendReject(from, id);
      },
    });
  }

  /**
   * Resolves with the transfer once it is offered. A send cancelled while still
   * 'preparing' resolves too, with the cancelled transfer; one that fails rejects.
   */
  async send(file: File, to: PeerAddress): Promise<TransferSnapshot> {
    if (this.disposed) throw new Error('The file transfer engine has been disposed');
    const { maxFileSize } = this.context.limits;
    if (file.size > maxFileSize) {
      throw new FileTransferError('too-large', `The file is larger than ${maxFileSize} bytes`);
    }
    const transfer = new OutgoingTransfer(
      this.context,
      this.nextKey(),
      to,
      file,
      (id) => this.live(to, id) !== undefined,
    );
    this.all.push(transfer);
    return transfer.start();
  }

  async accept(key: string): Promise<void> {
    await this.undecided(key).accept();
  }

  /** Does nothing for a transfer that has already finished. */
  reject(key: string): void {
    if (this.known(key).isLive) this.undecided(key).reject();
  }

  /** Does nothing for a transfer that has already finished. */
  cancel(key: string): void {
    const transfer = this.known(key);
    if (transfer.isLive) transfer.cancel();
  }

  transfers(): TransferSnapshot[] {
    return this.all.map((transfer) => transfer.snapshot);
  }

  on<E extends keyof FileTransferEvents>(event: E, listener: FileTransferEvents[E]): this {
    this.listeners[event].add(listener);
    return this;
  }

  off<E extends keyof FileTransferEvents>(event: E, listener: FileTransferEvents[E]): this {
    this.listeners[event].delete(listener);
    return this;
  }

  /**
   * Stops everything where it stands. Nothing is signalled and nothing stored is
   * discarded: the far side sees its link drop and can resume later.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe();
    for (const transfer of this.all.splice(0)) transfer.halt();
    this.finished.length = 0;
    this.context.storage.close();
  }

  private publish(snapshot: TransferSnapshot): void {
    if (this.disposed) return;
    if (isFinished(snapshot.state)) this.settle(snapshot.key);
    // Called one by one: a listener that throws must not stop the rest, nor the transfer.
    for (const listener of [...this.listeners.change]) {
      try {
        listener(snapshot);
      } catch (error) {
        reportListenerError(error);
      }
    }
  }

  /** Gives a transfer that has just finished its place in the history, or none. */
  private settle(key: string): void {
    const transfer = this.known(key);
    if (transfer instanceof IncomingTransfer && !transfer.wasAccepted) {
      this.forget(transfer);
      return;
    }
    this.finished.push(transfer);
    // A link still held is carrying a last word; its transfer goes when the link has.
    const spare = this.finished.filter((old) => !old.holdsLink);
    const excess = this.finished.length - FINISHED_TRANSFERS_KEPT;
    for (const old of spare.slice(0, Math.max(0, excess))) this.forget(old);
  }

  private forget(transfer: Transfer): void {
    transfer.halt();
    for (const list of [this.all, this.finished]) {
      const at = list.indexOf(transfer);
      if (at >= 0) list.splice(at, 1);
    }
  }

  private nextKey(): string {
    this.keysIssued += 1;
    return String(this.keysIssued);
  }

  private known(key: string): Transfer {
    const transfer = this.all.find((candidate) => candidate.snapshot.key === key);
    if (!transfer) throw new FileTransferError('unknown-transfer', `There is no transfer "${key}"`);
    return transfer;
  }

  private undecided(key: string): IncomingTransfer {
    const transfer = this.known(key);
    if (!(transfer instanceof IncomingTransfer) || !transfer.isUndecided) {
      throw new FileTransferError('unknown-transfer', `Transfer "${key}" is not an offer awaiting a decision`);
    }
    return transfer;
  }

  /** The live transfer that holds this content id with this peer, if any. */
  private live(peer: PeerAddress, id: TransferId): Transfer | undefined {
    return this.all.find(
      ({ isLive, snapshot }) => isLive && snapshot.peer === peer && snapshot.id === id,
    );
  }

  /** The live transfer a signal from `peer` about `id` can be meant for. */
  private addressed(peer: PeerAddress, id: TransferId): Transfer | undefined {
    const transfer = this.live(peer, id);
    // Nothing has been signalled about a transfer still preparing, so nothing can be about it.
    return transfer?.snapshot.state === 'preparing' ? undefined : transfer;
  }

  private outgoing(peer: PeerAddress, id: TransferId): OutgoingTransfer | undefined {
    const transfer = this.addressed(peer, id);
    return transfer instanceof OutgoingTransfer ? transfer : undefined;
  }

  /**
   * The transfer whose link a candidate from `peer` about `id` is for: the latest that
   * is live or still holds a link, as one kept only for its last word.
   */
  private linked(peer: PeerAddress, id: TransferId): Transfer | undefined {
    return this.all.findLast(
      (transfer) =>
        transfer.snapshot.peer === peer &&
        transfer.snapshot.id === id &&
        transfer.snapshot.state !== 'preparing' &&
        (transfer.isLive || transfer.holdsLink),
    );
  }

  private incoming(): IncomingTransfer[] {
    return this.all.filter((transfer) => transfer instanceof IncomingTransfer);
  }

  /** The latest finished attempt to receive this very file from this peer. */
  private lastFinished(peer: PeerAddress, offer: FileOffer): IncomingTransfer | undefined {
    return this.incoming().findLast(
      (transfer) =>
        !transfer.isLive &&
        transfer.snapshot.peer === peer &&
        transfer.snapshot.id === offer.id &&
        transfer.describes(offer),
    );
  }

  /** Everything in an offer is the peer's word and nothing more. */
  private offered(
    from: PeerAddress,
    claimed: FileOffer,
    description: RTCSessionDescriptionInit,
    attempt: OfferAttempt,
  ): void {
    if (!isWellFormed(claimed)) return;
    const offer: FileOffer = { id: claimed.id, name: safeName(claimed.name), size: claimed.size };

    const live = this.live(from, offer.id);
    if (live instanceof IncomingTransfer) {
      live.offeredAgain(offer, description);
      return;
    }
    // A sender resuming a transfer that is over here has missed how it ended.
    const earlier = attempt === 'resume' ? this.lastFinished(from, offer) : undefined;
    if (!live && earlier?.snapshot.state === 'complete') {
      earlier.confirm(description);
      return;
    }
    // Refused unseen: content already on its way to that peer, a transfer that ended for
    // good, and whatever there is no room for.
    if (live || (earlier && !earlier.lostItsLink) || !this.hasRoomFor(from, offer)) {
      this.context.signaling.sendReject(from, offer.id);
      return;
    }
    const transfer = new IncomingTransfer(this.context, this.nextKey(), from, offer, description);
    this.all.push(transfer);
    transfer.announce();
  }

  /** No peer may fill the list of offers awaiting a decision, its own share aside. */
  private hasRoomFor(from: PeerAddress, offer: FileOffer): boolean {
    const { maxFileSize, maxPendingOffersPerPeer, maxPendingOffersOverall } = this.context.limits;
    const undecided = this.incoming().filter((transfer) => transfer.isUndecided);
    const fromThisPeer = undecided.filter((transfer) => transfer.snapshot.peer === from);
    return (
      offer.size <= maxFileSize &&
      fromThisPeer.length < maxPendingOffersPerPeer &&
      undecided.length < maxPendingOffersOverall
    );
  }
}

/** A listener's failure is the listener's: reported where errors go, kept out of the transfers. */
function reportListenerError(error: unknown): void {
  if (typeof globalThis.reportError === 'function') {
    globalThis.reportError(error);
  } else {
    queueMicrotask(() => {
      throw error;
    });
  }
}

const CONTENT_ID = /^[0-9a-f]{64}$/;

function isWellFormed(offer: FileOffer): boolean {
  return (
    typeof offer.id === 'string' &&
    CONTENT_ID.test(offer.id) &&
    typeof offer.name === 'string' &&
    Number.isSafeInteger(offer.size) &&
    offer.size >= 0
  );
}

const MAX_NAME_LENGTH = 255;
/** An extension longer than this is not kept when a name is cut short. */
const MAX_EXTENSION_LENGTH = 16;

/**
 * The name to show, store and deliver under: the last path component of what the peer
 * claimed, without control characters, without format characters (the ones that reorder
 * or hide text, such as bidirectional overrides and zero-width joiners), without leading
 * dots, and at most 255 characters long. It cannot name another directory and cannot
 * show its characters in a different order than they have. It can still look like
 * another name in other ways, for example with letters from another script.
 */
function safeName(claimed: string): string {
  const name = claimed
    .replace(/^.*[\\/]/s, '')
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .replace(/^\.+/, '');
  return shortened(name) || 'download';
}

/** Cuts a name that is too long, keeping its extension, which says what opens the file. */
function shortened(name: string): string {
  const characters = [...name];
  if (characters.length <= MAX_NAME_LENGTH) return name;
  const dot = characters.lastIndexOf('.');
  const extension = dot > 0 ? characters.slice(dot) : [];
  const kept = extension.length <= MAX_EXTENSION_LENGTH ? extension : [];
  return [...characters.slice(0, MAX_NAME_LENGTH - kept.length), ...kept].join('');
}
