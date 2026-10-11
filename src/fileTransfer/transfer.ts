/**
 * What the two directions of a transfer have in common: a published snapshot, at most
 * one link, at most one timer, and the rule that work begun on a link stops mattering
 * the moment that link is no longer the transfer's.
 */
import { pieceLength } from './contentId';
import {
  FileTransferError,
  type FileOffer,
  type FileTransferErrorCode,
  type ReceivedFile,
  type TransferLink,
  type TransferLinkFactory,
  type TransferSignaling,
  type TransferSnapshot,
  type TransferState,
  type TransferStorage,
} from './types';
import { decodeFrame, encodeFrame, isPieceFrame, SEND_WINDOW, type Frame } from './wire';

export interface TransferLimits {
  maxFileSize: number;
  offerTimeoutMs: number;
  idleTimeoutMs: number;
  verificationTimeoutMs: number;
  reconnectWaitMs: number;
  maxReconnects: number;
  maxPendingOffersPerPeer: number;
  maxPendingOffersOverall: number;
  partialRetentionMs: number;
}

/** What a transfer needs from the engine that owns it. */
export interface TransferContext {
  signaling: TransferSignaling;
  storage: TransferStorage;
  createLink: TransferLinkFactory;
  deliver(file: ReceivedFile): void | Promise<void>;
  limits: TransferLimits;
  publish(snapshot: TransferSnapshot): void;
}

export type FinishedState = 'complete' | 'rejected' | 'cancelled' | 'failed';
export type LinkFailure = 'connection-failed' | 'timeout';

type Identity = Pick<TransferSnapshot, 'key' | 'id' | 'peer' | 'direction' | 'name' | 'size'>;
/** The parts of a snapshot that change over a transfer's life. */
type Change = Partial<Pick<TransferSnapshot, 'id' | 'state' | 'transferredBytes' | 'error'>>;

const FINISHED_STATES: readonly TransferState[] = ['complete', 'rejected', 'cancelled', 'failed'];

/** The reasons an abort frame may give that the far side takes over as its own error code. */
const ABORT_REASONS: readonly FileTransferErrorCode[] = [
  'integrity',
  'storage',
  'protocol',
  'delivery',
  'unreadable',
];

export function isFinished(state: TransferState): state is FinishedState {
  return FINISHED_STATES.includes(state);
}

export function reasonOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** Runs `action`; whatever it throws or rejects with becomes a transfer error with `code`. */
export async function failing<T>(
  code: FileTransferErrorCode,
  action: () => T | Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (cause) {
    throw new FileTransferError(code, reasonOf(cause));
  }
}

/** What was thrown, as a transfer error: itself if it is one, else one with `code`. */
export function asTransferError(cause: unknown, code: FileTransferErrorCode): FileTransferError {
  return cause instanceof FileTransferError ? cause : new FileTransferError(code, reasonOf(cause));
}

/** Total size of the given pieces of a file of `size` bytes. */
export function bytesIn(size: number, pieces: Iterable<number>): number {
  let bytes = 0;
  for (const index of pieces) bytes += pieceLength(size, index);
  return bytes;
}

export abstract class Transfer {
  /**
   * The transfer's one link. Asynchronous work remembers the link it started on and
   * gives up without effect once this is a different one: finishing, cancelling,
   * reconnecting and halting all replace it.
   */
  protected link: TransferLink | null = null;
  /**
   * A link that outlives its use only so that the last word said on it can arrive.
   * Closing a link may lose what was just sent, so the far side closes it on hearing the
   * word; this side stops waiting for that after the idle time.
   */
  protected parting: TransferLink | null = null;
  /** The last word, while `parting` has yet to open and carry it. */
  private unsaid: Frame | null = null;
  private readonly open = new WeakSet<TransferLink>();

  private current: TransferSnapshot;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private linkEvents: Promise<void> = Promise.resolve();
  private halted = false;

  protected constructor(
    protected readonly context: TransferContext,
    identity: Identity,
    state: TransferState,
  ) {
    this.current = Object.freeze({ ...identity, transferredBytes: 0, state });
  }

  get snapshot(): TransferSnapshot {
    return this.current;
  }

  get isLive(): boolean {
    return !isFinished(this.current.state);
  }

  get holdsLink(): boolean {
    return this.link !== null || this.parting !== null;
  }

  /** Publishes the transfer as it stands, for the first time. */
  announce(): void {
    this.context.publish(this.current);
  }

  /** The user's own cancellation. */
  abstract cancel(): void;

  cancelledByPeer(): void {
    this.finish('cancelled');
    this.abandon();
  }

  /** A candidate the peer signalled. A link may find it unusable; that costs nothing. */
  addCandidate(candidate: RTCIceCandidateInit): void {
    (this.link ?? this.parting)?.addCandidate(candidate).catch(() => undefined);
  }

  /** Stops where it stands and tells nobody: the engine is going away. */
  halt(): void {
    this.halted = true;
    this.release();
  }

  protected abstract linkOpened(link: TransferLink): void | Promise<void>;
  protected abstract frameArrived(link: TransferLink, frame: Frame): void | Promise<void>;
  /** The link is of no more use, whether it said so itself or just went quiet. */
  protected abstract linkLost(cause: LinkFailure): void;

  /** Called when the transfer ends in a way that makes what it gathered worthless. */
  protected abandon(): void {}

  /** The file as it is named in signalling. */
  protected get offer(): FileOffer {
    const { id, name, size } = this.current;
    return { id, name, size };
  }

  protected is(...states: TransferState[]): boolean {
    return !this.halted && states.includes(this.current.state);
  }

  protected update(change: Change): void {
    const keys = Object.keys(change) as Array<keyof Change>;
    if (keys.every((key) => change[key] === this.current[key])) return;
    this.current = Object.freeze({ ...this.current, ...change });
    this.context.publish(this.current);
  }

  /** Ends the transfer. With a `lastWord` its link stays for that to arrive; without, it closes. */
  protected finish(state: FinishedState, change: Change = {}, lastWord?: Frame): void {
    const link = this.link;
    this.link = null;
    this.release();
    if (link && lastWord) {
      this.partOver(link, lastWord);
    } else {
      link?.close();
    }
    this.update({ ...change, state });
  }

  /**
   * Says the last word on `link`, once it is open, and keeps it until the far side closes
   * it or goes quiet.
   */
  protected partOver(link: TransferLink, lastWord: Frame): void {
    this.parting = link;
    this.setTimer(this.context.limits.idleTimeoutMs, () => this.release());
    if (this.open.has(link)) {
      this.unsaid = null;
      link.send(encodeFrame(lastWord)).catch(() => undefined);
    } else {
      this.unsaid = lastWord;
    }
  }

  /** Makes a link that exists only to carry `lastWord`. */
  protected connectToSay(lastWord: Frame): TransferLink {
    const link = this.connect();
    this.link = null;
    this.partOver(link, lastWord);
    return link;
  }

  /** Whether `link` is one this transfer still has a use for. */
  protected holds(link: TransferLink): boolean {
    return link === this.link || link === this.parting;
  }

  protected fail(code: FileTransferErrorCode, message: string): FileTransferError {
    const error = new FileTransferError(code, message);
    this.finish('failed', { error });
    return error;
  }

  /** Fails over something the far side has to be told. */
  protected abort(error: FileTransferError): void {
    this.finish('failed', { error }, { type: 'abort', reason: error.code });
    this.abandon();
  }

  protected abortedByPeer(reason: string): void {
    const code = ABORT_REASONS.find((known) => known === reason) ?? 'protocol';
    this.fail(code, `The peer gave up on the transfer (${code})`);
    this.abandon();
  }

  /**
   * Replaces the transfer's link with a new one. What the link reports is handled one
   * event at a time, in the order it happened.
   */
  protected connect(): TransferLink {
    this.release();
    const inOrder = (react: () => void | Promise<void>) => {
      this.linkEvents = this.linkEvents.then(() => this.guarded(link, react));
    };
    let piecesWaiting = 0;
    const link: TransferLink = this.context.createLink({
      onCandidate: (candidate) => this.signalCandidate(link, candidate),
      onOpen: () => {
        this.open.add(link);
        if (this.parting === link && this.unsaid) this.partOver(link, this.unsaid);
        inOrder(() => this.linkOpened(link));
      },
      onFrame: (data) => {
        if (this.link !== link) return;
        const isPiece = isPieceFrame(data);
        if (isPiece && ++piecesWaiting > SEND_WINDOW) {
          // Checked as frames arrive: once queued they would already be held in memory.
          this.abort(new FileTransferError('protocol', 'The sender overran its window'));
          return;
        }
        inOrder(async () => {
          try {
            await this.frameArrived(link, decodeFrame(data));
          } finally {
            if (isPiece) piecesWaiting -= 1;
          }
        });
      },
      onDown: () => {
        this.partedWith(link);
        inOrder(() => this.linkLost('connection-failed'));
      },
    });
    this.link = link;
    return link;
  }

  /** Passes a candidate `link` produced on to the peer, as long as the link is of use. */
  protected signalCandidate(link: TransferLink, candidate: RTCIceCandidateInit): void {
    if (this.holds(link)) {
      this.context.signaling.sendCandidate(this.current.peer, this.current.id, candidate);
    }
  }

  /** The far side closed `link`: if it was kept for the last word, that wait is over. */
  protected partedWith(link: TransferLink): void {
    if (this.parting === link) this.release();
  }

  /** Closes whatever link there is and stops the timer. */
  protected release(): void {
    this.clearTimer();
    this.link?.close();
    this.parting?.close();
    this.link = null;
    this.parting = null;
    this.unsaid = null;
  }

  /**
   * Runs work that belongs to `link`. Nothing it throws escapes: while `link` is still
   * the transfer's, a failed connection becomes a lost link and anything else ends the
   * transfer; once it is not, the failure is of no interest.
   */
  protected async guarded(link: TransferLink, work: () => void | Promise<void>): Promise<void> {
    try {
      if (this.link === link) await work();
    } catch (cause) {
      if (this.link !== link) return;
      const error = asTransferError(cause, 'protocol');
      if (error.code === 'connection-failed') {
        this.linkLost('connection-failed');
      } else {
        this.abort(error);
      }
    }
  }

  /** The transfer has one timer; setting it replaces whatever it was waiting for. */
  protected setTimer(ms: number, elapsed: () => void): void {
    this.clearTimer();
    this.timer = setTimeout(elapsed, ms);
  }

  protected clearTimer(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  /** (Re)starts the wait after which a link that showed no progress counts as lost. */
  protected watchLink(): void {
    this.setTimer(this.context.limits.idleTimeoutMs, () => this.linkLost('timeout'));
  }
}
