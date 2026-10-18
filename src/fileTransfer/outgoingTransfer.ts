import { computeContentId, pieceCount, pieceLength } from './contentId';
import { bytesIn, failing, reasonOf, Transfer, type LinkFailure, type TransferContext } from './transfer';
import {
  FileTransferError,
  type OfferAttempt,
  type PeerAddress,
  type TransferId,
  type TransferLink,
  type TransferSnapshot,
} from './types';
import {
  encodeFrame,
  indicesInRanges,
  PIECE_SIZE,
  SEND_WINDOW,
  type Frame,
  type PieceRange,
} from './wire';

const LINK_FAILURE_MESSAGES: Record<LinkFailure, string> = {
  'connection-failed': 'The connection to the peer was lost',
  timeout: 'The peer stopped responding',
};

/** A file on its way to a peer. */
export class OutgoingTransfer extends Transfer {
  /** Link failures since the receiver last said it was ready. */
  private consecutiveFailures = 0;
  /** True from signalling an offer until its answer arrives: each offer takes one answer. */
  private awaitingAnswer = false;
  /** Pieces sent on the current link, and how many of them the receiver reported as dealt with. */
  private sent = 0;
  private reported = 0;
  /** Wakes the sending of pieces when it waits for the window to move. */
  private windowMoved: () => void = () => undefined;

  constructor(
    context: TransferContext,
    key: string,
    peer: PeerAddress,
    private readonly file: File,
    /** Whether a live transfer with this peer already has the content id. */
    private readonly idIsTaken: (id: TransferId) => boolean,
  ) {
    super(
      context,
      { key, peer, direction: 'send', id: '', name: file.name, size: file.size },
      'preparing',
    );
  }

  /**
   * Works out the content id and offers the file. Resolves with the transfer once it is
   * offered, or as it stands if it was cancelled or halted first; rejects if it failed.
   */
  async start(): Promise<TransferSnapshot> {
    this.announce();
    await this.prepare();
    if (this.snapshot.error) throw this.snapshot.error;
    return this.snapshot;
  }

  answered(description: RTCSessionDescriptionInit): void {
    const link = this.link;
    if (!link || !this.awaitingAnswer) return;
    this.awaitingAnswer = false;
    this.update({ state: 'connecting' });
    this.watchLink();
    void this.guarded(link, () =>
      failing('connection-failed', () => link.acceptAnswer(description)),
    );
  }

  rejectedByPeer(): void {
    this.finish('rejected');
  }

  cancel(): void {
    const peerKnowsOfIt = !this.is('preparing');
    this.finish('cancelled');
    if (peerKnowsOfIt) this.context.signaling.sendCancel(this.snapshot.peer, this.snapshot.id);
  }

  protected linkOpened(): void {
    this.watchLink();
  }

  protected frameArrived(link: TransferLink, frame: Frame): void {
    switch (frame.type) {
      case 'ready':
        this.receiverReady(link, frame.have);
        break;
      case 'complete':
        this.finish('complete', { transferredBytes: this.snapshot.size });
        break;
      case 'abort':
        this.abortedByPeer(frame.reason);
        break;
      case 'stored':
        this.receiverStored(frame.count);
        break;
      case 'piece':
        throw new FileTransferError('protocol', 'The receiver sent a piece');
    }
  }

  protected linkLost(cause: LinkFailure): void {
    if (!this.is('connecting', 'transferring', 'verifying')) {
      this.fail('connection-failed', 'The connection failed before the peer answered');
      return;
    }
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures > this.context.limits.maxReconnects) {
      this.fail(cause, LINK_FAILURE_MESSAGES[cause]);
      return;
    }
    this.update({ state: 'connecting' });
    const link = this.connect();
    this.watchLink();
    void this.guarded(link, () =>
      failing('connection-failed', () => this.offerOver(link, 'resume')),
    );
  }

  private async prepare(): Promise<void> {
    let id: TransferId;
    try {
      id = await computeContentId(this.file);
    } catch (cause) {
      if (this.is('preparing')) {
        this.fail('unreadable', `Could not read the file: ${reasonOf(cause)}`);
      }
      return;
    }
    if (!this.is('preparing')) return;
    if (this.idIsTaken(id)) {
      const error = new FileTransferError(
        'duplicate',
        'The same content is already moving between you and this peer',
      );
      this.finish('failed', { id, error });
      return;
    }
    this.update({ id });

    const link = this.connect();
    try {
      await this.offerOver(link, 'first');
    } catch (cause) {
      if (this.link === link) {
        this.fail('connection-failed', `Could not offer the file: ${reasonOf(cause)}`);
      }
      return;
    }
    if (this.link !== link) return;
    this.update({ state: 'offered' });
    this.setTimer(this.context.limits.offerTimeoutMs, () => this.offerExpired());
  }

  private async offerOver(link: TransferLink, attempt: OfferAttempt): Promise<void> {
    this.awaitingAnswer = false;
    const description = await link.createOffer();
    if (this.link !== link) return;
    this.context.signaling.sendOffer(this.snapshot.peer, this.offer, description, attempt);
    this.awaitingAnswer = true;
  }

  private offerExpired(): void {
    this.fail('timeout', 'The peer did not answer the offer');
    this.context.signaling.sendCancel(this.snapshot.peer, this.snapshot.id);
  }

  private receiverReady(link: TransferLink, have: PieceRange[]): void {
    if (!this.is('connecting')) {
      throw new FileTransferError('protocol', 'The receiver said it was ready twice');
    }
    const { size } = this.snapshot;
    const held = indicesInRanges(have, pieceCount(size));
    const missing = Array.from({ length: pieceCount(size) }, (_, index) => index).filter(
      (index) => !held.has(index),
    );
    this.consecutiveFailures = 0;
    // The window starts afresh on this link; sending still waiting on the old one ends.
    this.sent = 0;
    this.reported = 0;
    this.windowMoved();
    if (missing.length === 0) {
      this.awaitOutcome();
      return;
    }
    this.update({ state: 'transferring', transferredBytes: bytesIn(size, held) });
    this.watchLink();
    void this.guarded(link, () => this.sendPieces(link, missing));
  }

  private receiverStored(count: number): void {
    if (count < this.reported || count > this.sent) {
      throw new FileTransferError('protocol', 'The receiver reported an impossible piece count');
    }
    this.reported = count;
    this.windowMoved();
    if (this.is('transferring')) this.watchLink();
  }

  private async sendPieces(link: TransferLink, missing: number[]): Promise<void> {
    for (const index of missing) {
      while (this.sent - this.reported >= SEND_WINDOW) {
        await new Promise<void>((moved) => {
          this.windowMoved = moved;
        });
        if (this.link !== link) return;
      }
      const bytes = await failing('unreadable', () => this.readPiece(index));
      if (this.link !== link) return;
      this.sent += 1;
      await failing('connection-failed', () => link.send(encodeFrame({ type: 'piece', index, bytes })));
      if (this.link !== link) return;
      this.update({ transferredBytes: this.snapshot.transferredBytes + bytes.byteLength });
      this.watchLink();
    }
    this.awaitOutcome();
  }

  /**
   * Everything is across. Checking and saving the file can take the receiver long, and it
   * says nothing meanwhile, so this wait has its own, longer limit.
   */
  private awaitOutcome(): void {
    this.update({ state: 'verifying', transferredBytes: this.snapshot.size });
    this.setTimer(this.context.limits.verificationTimeoutMs, () => this.linkLost('timeout'));
  }

  private async readPiece(index: number): Promise<ArrayBuffer> {
    const start = index * PIECE_SIZE;
    const length = pieceLength(this.snapshot.size, index);
    const bytes = await this.file.slice(start, start + length).arrayBuffer();
    if (bytes.byteLength !== length) throw new Error('The file changed while it was being sent');
    return bytes;
  }
}
