import { contentIdFromDigests, digestPiece, pieceCount, pieceLength } from './contentId';
import { asTransferError, bytesIn, failing, reasonOf, Transfer, type TransferContext } from './transfer';
import {
  FileTransferError,
  MAX_HELD_CANDIDATES,
  type FileOffer,
  type PeerAddress,
  type StoredTransferKey,
  type TransferLink,
} from './types';
import { encodeFrame, STORED_REPORT_INTERVAL, toRanges, type Frame } from './wire';

/**
 * A file a peer offered. No link exists before the user accepts, so nothing can arrive
 * for an offer nobody agreed to; what does arrive is checked against the accepted offer.
 */
export class IncomingTransfer extends Transfer {
  private accepted = false;
  /** Candidates signalled before the user decided, for the link that accepting creates. */
  private readonly earlyCandidates: RTCIceCandidateInit[] = [];
  /** Indices of the pieces in storage, as of the last time the link opened. */
  private held = new Set<number>();
  /** Pieces dealt with on the current link: stored, or ignored as already held. */
  private dealtWith = 0;
  /**
   * Links made because the sender offered the file again, since a piece was last stored.
   * A sender gives up after a few link failures in a row, so more than that is not one.
   */
  private relinks = 0;

  /** `offer` must already be validated and carry the sanitised name. */
  constructor(
    context: TransferContext,
    key: string,
    peer: PeerAddress,
    offer: FileOffer,
    private description: RTCSessionDescriptionInit,
  ) {
    super(context, { key, peer, direction: 'receive', ...offer }, 'offered');
  }

  get isUndecided(): boolean {
    return this.is('offered');
  }

  /** Whether the user ever agreed to receive it. */
  get wasAccepted(): boolean {
    return this.accepted;
  }

  /** Whether it ended for want of a link and nothing else, so that a new link can mend it. */
  get lostItsLink(): boolean {
    const code = this.snapshot.error?.code;
    return code === 'connection-failed' || code === 'timeout';
  }

  describes(offer: FileOffer): boolean {
    return offer.name === this.snapshot.name && offer.size === this.snapshot.size;
  }

  /** Shows the offer to the user, who has a limited time to decide. */
  announce(): void {
    super.announce();
    this.setTimer(this.context.limits.offerTimeoutMs, () => {
      this.fail('timeout', 'The offer was not answered in time');
      this.signalReject();
    });
  }

  /** The peer offered this file again while the transfer is live. */
  offeredAgain(offer: FileOffer, description: RTCSessionDescriptionInit): void {
    if (this.is('offered')) {
      this.description = description;
      // Those were for the link the earlier description came from.
      this.earlyCandidates.length = 0;
      return;
    }
    // Once the user has accepted, only the very same file may take the transfer's place.
    if (!this.describes(offer)) return;
    if (!this.mayRelink()) {
      // Not 'connection-failed': that would let the next resume offer reach the user again.
      this.fail('protocol', 'The sender kept offering the file without sending any of it');
      this.abandon();
      this.signalReject();
      return;
    }
    // The sender's link failed and this is its new one. The user already said yes, and a
    // file being verified goes on being verified.
    const link = this.connect();
    if (!this.is('verifying')) {
      this.update({ state: 'connecting' });
      this.watchLink();
    }
    void this.guarded(link, () =>
      failing('connection-failed', () => this.answerOver(link, description)),
    );
  }

  /** The user's consent. Rejects if the offer cannot be answered. */
  async accept(): Promise<void> {
    this.accepted = true;
    this.update({ state: 'connecting' });
    const link = this.connect();
    this.watchLink();
    try {
      await this.answerOver(link, this.description);
    } catch (cause) {
      if (this.link === link) {
        throw this.fail('connection-failed', `Could not answer the offer: ${reasonOf(cause)}`);
      }
    }
  }

  reject(): void {
    this.finish('rejected');
    this.signalReject();
  }

  cancel(): void {
    if (this.is('offered')) {
      this.reject();
      return;
    }
    this.finish('cancelled');
    this.abandon();
    this.context.signaling.sendCancel(this.snapshot.peer, this.snapshot.id);
  }

  addCandidate(candidate: RTCIceCandidateInit): void {
    if (!this.is('offered')) {
      super.addCandidate(candidate);
    } else if (this.earlyCandidates.length < MAX_HELD_CANDIDATES) {
      this.earlyCandidates.push(candidate);
    }
  }

  /**
   * The sender of this delivered file is resuming it, so it never heard `complete`.
   * Takes its link only to say so.
   */
  confirm(description: RTCSessionDescriptionInit): void {
    if (!this.mayRelink()) {
      this.signalReject();
      return;
    }
    const link = this.connectToSay({ type: 'complete' });
    this.answerOver(link, description).catch(() => this.partedWith(link));
  }

  protected async linkOpened(link: TransferLink): Promise<void> {
    const { size } = this.snapshot;
    const stored = await failing('storage', () => this.context.storage.heldPieces(this.storageKey));
    if (this.link !== link) return;
    const held = stored.filter((index) => index < pieceCount(size));
    this.held = new Set(held);
    this.dealtWith = 0;
    await failing('connection-failed', () =>
      link.send(encodeFrame({ type: 'ready', have: toRanges(held) })),
    );
    // A file already being verified needed the link only to tell the sender so.
    if (this.link !== link || this.is('verifying')) return;
    this.update({ state: 'transferring', transferredBytes: bytesIn(size, held) });
    this.watchLink();
    this.verifyOnceWhole();
  }

  protected frameArrived(link: TransferLink, frame: Frame): void | Promise<void> {
    // Every piece is here; nothing the sender says now changes what the file is.
    if (this.is('verifying')) return;
    switch (frame.type) {
      case 'piece':
        return this.pieceArrived(link, frame.index, frame.bytes);
      case 'abort':
        return this.abortedByPeer(frame.reason);
      default:
        throw new FileTransferError('protocol', `The sender sent a ${frame.type} frame`);
    }
  }

  /**
   * Keeps what is stored. Verification goes on without a link; anything earlier waits
   * for the sender to offer again.
   */
  protected linkLost(): void {
    this.release();
    if (this.is('verifying')) return;
    this.update({ state: 'connecting' });
    this.setTimer(this.context.limits.reconnectWaitMs, () =>
      this.fail('connection-failed', 'The connection was lost and the sender did not come back'),
    );
  }

  protected abandon(): void {
    // Best effort: what stays behind is purged by age.
    this.context.storage.discard(this.storageKey).catch(() => undefined);
  }

  private get storageKey(): StoredTransferKey {
    return { from: this.snapshot.peer, id: this.snapshot.id };
  }

  private signalReject(): void {
    this.context.signaling.sendReject(this.snapshot.peer, this.snapshot.id);
  }

  /** Counts one more link made at the sender's asking, and says whether that is still plausible. */
  private mayRelink(): boolean {
    this.relinks += 1;
    return this.relinks <= this.context.limits.maxReconnects + 1;
  }

  /** Answers `description` over `link`, which must be new. */
  private async answerOver(link: TransferLink, description: RTCSessionDescriptionInit): Promise<void> {
    const answering = link.acceptOffer(description);
    for (const candidate of this.earlyCandidates.splice(0)) super.addCandidate(candidate);
    const answer = await answering;
    if (this.holds(link)) {
      this.context.signaling.sendAnswer(this.snapshot.peer, this.offer, answer);
    }
  }

  private async pieceArrived(link: TransferLink, index: number, bytes: ArrayBuffer): Promise<void> {
    const { size } = this.snapshot;
    if (!this.is('transferring')) {
      throw new FileTransferError('protocol', 'A piece arrived before it was asked for');
    }
    if (index >= pieceCount(size) || bytes.byteLength !== pieceLength(size, index)) {
      throw new FileTransferError('protocol', `Piece ${index} does not fit the offered file`);
    }
    if (!this.held.has(index)) {
      await failing('storage', () => this.context.storage.putPiece(this.storageKey, index, bytes));
      if (this.link !== link) return;
      this.held.add(index);
      this.relinks = 0;
      this.update({ transferredBytes: this.snapshot.transferredBytes + bytes.byteLength });
      this.watchLink();
    }
    this.reportDealtWith(link);
    this.verifyOnceWhole();
  }

  /** Lets the sender's window move on, every few pieces. */
  private reportDealtWith(link: TransferLink): void {
    this.dealtWith += 1;
    if (this.dealtWith % STORED_REPORT_INTERVAL === 0) {
      link.send(encodeFrame({ type: 'stored', count: this.dealtWith })).catch(() => undefined);
    }
  }

  private verifyOnceWhole(): void {
    if (this.held.size === pieceCount(this.snapshot.size)) void this.verify();
  }

  /**
   * Checks the stored file and hands it to the application; with that the transfer is
   * complete. None of it needs the link: the outcome is the last word on whatever link
   * there is at the end, and if there is none the sender hears it when it offers again.
   */
  private async verify(): Promise<void> {
    this.clearTimer();
    this.update({ state: 'verifying' });
    try {
      const blob = await this.assembleVerified();
      if (!this.is('verifying')) return;
      const { peer: from, id, name } = this.snapshot;
      await failing('delivery', () => this.context.deliver({ from, id, name, blob }));
      if (!this.is('verifying')) return;
      this.finish('complete', {}, { type: 'complete' });
      this.abandon();
    } catch (cause) {
      if (this.is('verifying')) this.abort(asTransferError(cause, 'integrity'));
    }
  }

  /**
   * Reads the file back from storage and checks it against the id the user accepted.
   * Built from one Blob per piece, so the whole file is never one buffer on the heap.
   */
  private async assembleVerified(): Promise<Blob> {
    const { size, id } = this.snapshot;
    const pieces: Blob[] = [];
    const digests: ArrayBuffer[] = [];
    for (let index = 0; index < pieceCount(size) && this.is('verifying'); index++) {
      const bytes = await failing('storage', () =>
        this.context.storage.readPiece(this.storageKey, index),
      );
      if (bytes?.byteLength !== pieceLength(size, index)) {
        throw new FileTransferError('integrity', `Piece ${index} is missing from storage or damaged`);
      }
      digests.push(await digestPiece(bytes));
      pieces.push(new Blob([bytes]));
    }
    if (this.is('verifying') && (await contentIdFromDigests(digests)) !== id) {
      throw new FileTransferError('integrity', 'The received file is not the one that was offered');
    }
    return new Blob(pieces);
  }
}
