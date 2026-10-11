/**
 * In-memory stand-ins for the two things a transfer engine talks to the outside world
 * through: the signalling channel and the links. Nothing here knows about a test runner.
 */
import {
  FileTransferError,
  MAX_HELD_CANDIDATES,
  type FileOffer,
  type OfferAttempt,
  type PeerAddress,
  type SignalHandlers,
  type StoredTransferKey,
  type TransferId,
  type TransferLink,
  type TransferLinkFactory,
  type TransferLinkHandlers,
  type TransferSignaling,
  type TransferStorage,
} from './types';
import { decodeFrame, type Frame } from './wire';

/** jsdom's Blob does not implement `arrayBuffer()`, which the engine reads files with. */
export function polyfillBlobArrayBuffer(): void {
  if (typeof Blob.prototype.arrayBuffer === 'function') return;
  Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

interface Route {
  from: PeerAddress;
  to: PeerAddress;
}

export type Signal = Route &
  (
    | {
        kind: 'offer';
        id: TransferId;
        offer: FileOffer;
        description: RTCSessionDescriptionInit;
        attempt: OfferAttempt;
      }
    | { kind: 'answer'; id: TransferId; description: RTCSessionDescriptionInit }
    | { kind: 'candidate'; id: TransferId; candidate: RTCIceCandidateInit }
    | { kind: 'reject'; id: TransferId }
    | { kind: 'cancel'; id: TransferId }
  );

/** Carries signals between named peers, asynchronously and in the order they were sent. */
export class SignalingHub {
  /** Every signal any peer sent, dropped ones included. */
  readonly sent: Signal[] = [];
  /** Return true to lose a signal on the way. */
  drop: (signal: Signal) => boolean = () => false;

  private readonly subscribers = new Map<PeerAddress, Set<SignalHandlers>>();

  peer(name: PeerAddress): TransferSignaling {
    const post = (signal: Signal) => this.post(signal);
    return {
      sendOffer: (to, offer, description, attempt) =>
        post({ kind: 'offer', from: name, to, id: offer.id, offer, description, attempt }),
      sendAnswer: (to, offer, description) =>
        post({ kind: 'answer', from: name, to, id: offer.id, description }),
      sendCandidate: (to, id, candidate) =>
        post({ kind: 'candidate', from: name, to, id, candidate }),
      sendReject: (to, id) => post({ kind: 'reject', from: name, to, id }),
      sendCancel: (to, id) => post({ kind: 'cancel', from: name, to, id }),
      subscribe: (handlers) => {
        const subscribers = this.subscribers.get(name) ?? new Set();
        this.subscribers.set(name, subscribers.add(handlers));
        return () => {
          subscribers.delete(handlers);
        };
      },
    };
  }

  sentOf(kind: Signal['kind']): Signal[] {
    return this.sent.filter((signal) => signal.kind === kind);
  }

  private post(signal: Signal): void {
    this.sent.push(signal);
    if (this.drop(signal)) return;
    queueMicrotask(() => {
      for (const handlers of this.subscribers.get(signal.to) ?? []) {
        deliverSignal(handlers, signal);
      }
    });
  }
}

function deliverSignal(handlers: SignalHandlers, signal: Signal): void {
  switch (signal.kind) {
    case 'offer':
      handlers.offer(signal.from, signal.offer, signal.description, signal.attempt);
      break;
    case 'answer':
      handlers.answer(signal.from, signal.id, signal.description);
      break;
    case 'candidate':
      handlers.candidate(signal.from, signal.id, signal.candidate);
      break;
    case 'reject':
      handlers.reject(signal.from, signal.id);
      break;
    case 'cancel':
      handlers.cancel(signal.from, signal.id);
      break;
  }
}

export type FrameType = Frame['type'] | 'undecodable';
export type Negotiation = 'createOffer' | 'acceptOffer' | 'acceptAnswer';

/**
 * What happens to a frame a link was asked to send:
 * - 'pass': it travels;
 * - 'hold': the send succeeds, but this frame and everything behind it on the link waits
 *   for `release()`;
 * - 'stall': the send itself does not resolve until `release()`, as under backpressure,
 *   and rejects if the link closes or goes down first;
 * - 'drop': the send succeeds and the frame is lost;
 * - an ArrayBuffer: that travels instead.
 */
export type Verdict = 'pass' | 'hold' | 'stall' | 'drop' | ArrayBuffer;

function frameType(data: ArrayBuffer): FrameType {
  try {
    return decodeFrame(data).type;
  } catch {
    return 'undecodable';
  }
}

function linkError(message: string): FileTransferError {
  return new FileTransferError('connection-failed', message);
}

/** The links of every peer in a test, and the controls to make them misbehave. */
export class LinkNetwork {
  /** Every link ever made, oldest first. */
  readonly links: FakeLink[] = [];
  /** Decides the fate of each frame a link is asked to send. */
  tap: (link: FakeLink, type: FrameType, data: ArrayBuffer) => Verdict = () => 'pass';
  /** Return true to make that negotiation step reject. The link stays up, as a real one does. */
  failing: (link: FakeLink, step: Negotiation) => boolean = () => false;
  /**
   * A frame takes a turn of the event loop to cross a link. While this is true, a link
   * closed before then takes its frames in flight with it, as a real one may.
   */
  closeLosesFramesInFlight = true;

  private negotiationGate: Promise<void> = Promise.resolve();

  factory(owner: PeerAddress): TransferLinkFactory {
    return (handlers) => {
      const link = new FakeLink(this, owner, this.links.length, handlers);
      this.links.push(link);
      return link;
    };
  }

  linksOf(owner: PeerAddress): FakeLink[] {
    return this.links.filter((link) => link.owner === owner);
  }

  /** Makes every negotiation step wait until the returned function is called. */
  holdNegotiation(): () => void {
    let open!: () => void;
    this.negotiationGate = new Promise((resolve) => {
      open = resolve;
    });
    return open;
  }

  /** @internal */
  negotiationMayProceed(): Promise<void> {
    return this.negotiationGate;
  }
}

type Parcel = ArrayBuffer | 'closed';

const DESCRIPTION_PREFIX = 'fake-link:';

export class FakeLink implements TransferLink {
  /** Candidates the engine handed to `addCandidate`, in order. */
  readonly candidates: RTCIceCandidateInit[] = [];
  /** Types of the frames the engine sent on this link, in order, whatever became of them. */
  readonly sentTypes: FrameType[] = [];
  /** Types of the frames this link handed to the engine, in order. */
  readonly receivedTypes: FrameType[] = [];
  /** The link at the other end, once the offer was accepted. */
  peer: FakeLink | null = null;
  closed = false;
  down = false;
  opened = false;

  private started = false;
  private holding = false;
  private readonly waiting: Parcel[] = [];
  private readonly stalled: Array<{ resume(): void; abort(error: Error): void }> = [];

  constructor(
    private readonly network: LinkNetwork,
    readonly owner: PeerAddress,
    private readonly serial: number,
    readonly handlers: TransferLinkHandlers,
  ) {}

  createOffer(): Promise<RTCSessionDescriptionInit> {
    this.claimStart();
    return this.negotiate('createOffer', () => ({ type: 'offer', sdp: this.address }));
  }

  acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this.claimStart();
    return this.negotiate('acceptOffer', () => {
      this.peer = this.network.links[this.serialIn(offer)] ?? null;
      if (!this.peer) throw new Error('the offer does not describe a link');
      return { type: 'answer', sdp: this.address };
    });
  }

  acceptAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    return this.negotiate('acceptAnswer', () => {
      const peer = this.network.links[this.serialIn(answer)];
      if (!peer || peer.peer !== this) throw new Error('the answer is not for this link');
      this.peer = peer;
      for (const end of [this, peer]) {
        queueMicrotask(() => end.open());
      }
    });
  }

  async addCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    this.assertUp();
    if (candidate.candidate === 'unusable') throw new Error('unusable candidate');
    // As the contract has it: until the far end is known, only so many are held.
    if (!this.peer && this.candidates.length >= MAX_HELD_CANDIDATES) return;
    this.candidates.push(candidate);
  }

  async send(frame: ArrayBuffer): Promise<void> {
    if (!this.opened) throw linkError('data channel is not open');
    this.assertUp();
    const type = frameType(frame);
    this.sentTypes.push(type);
    let verdict = this.network.tap(this, type, frame);
    if (verdict === 'stall') {
      await new Promise<void>((resume, abort) => this.stalled.push({ resume, abort }));
      verdict = 'pass';
    }
    if (verdict === 'drop') return;
    if (verdict === 'hold') this.holding = true;
    this.post(typeof verdict === 'string' ? frame : verdict);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.down) return;
    this.abortStalled('link closed');
    // The far side learns of it after whatever is still on its way or held.
    this.post('closed');
  }

  /** Lets held frames travel and stalled sends go through. */
  release(): void {
    this.holding = false;
    for (const parcel of this.waiting.splice(0)) this.dispatch(parcel);
    for (const send of this.stalled.splice(0)) send.resume();
  }

  /** Makes stalled sends reject while the link itself reports nothing. */
  failStalledSends(): void {
    this.abortStalled('send failed');
  }

  /** Cuts the link: both ends go down and whatever was in flight is lost. */
  sever(): void {
    for (const end of [this, this.peer]) end?.goDown('severed');
  }

  /** Has the link produce a local ICE candidate. */
  emitCandidate(candidate: RTCIceCandidateInit): void {
    this.handlers.onCandidate(candidate);
  }

  count(type: FrameType): number {
    return this.sentTypes.filter((sent) => sent === type).length;
  }

  countReceived(type: FrameType): number {
    return this.receivedTypes.filter((received) => received === type).length;
  }

  /** Hands the engine a frame as if the far end had sent it, whatever the far end is doing. */
  inject(frame: ArrayBuffer): void {
    this.receive(frame);
  }

  private get address(): string {
    return `${DESCRIPTION_PREFIX}${this.serial}`;
  }

  private serialIn(description: RTCSessionDescriptionInit): number {
    const sdp = description.sdp ?? '';
    return sdp.startsWith(DESCRIPTION_PREFIX) ? Number(sdp.slice(DESCRIPTION_PREFIX.length)) : NaN;
  }

  private claimStart(): void {
    if (this.started) throw new Error('link already started');
    this.started = true;
  }

  private async negotiate<T>(step: Negotiation, work: () => T): Promise<T> {
    await this.network.negotiationMayProceed();
    this.assertUp();
    if (this.network.failing(this, step)) throw new Error(`${step} failed`);
    return work();
  }

  private assertUp(): void {
    if (this.closed) throw linkError('link closed');
    if (this.down) throw linkError('link down');
  }

  private open(): void {
    if (this.closed || this.down) return;
    this.opened = true;
    this.handlers.onOpen();
  }

  private post(parcel: Parcel): void {
    if (this.holding) {
      this.waiting.push(parcel);
    } else {
      this.dispatch(parcel);
    }
  }

  private dispatch(parcel: Parcel): void {
    const peer = this.peer;
    setImmediate(() => {
      const lost = parcel !== 'closed' && this.closed && this.network.closeLosesFramesInFlight;
      if (!lost) peer?.receive(parcel);
    });
  }

  private receive(parcel: Parcel): void {
    if (this.closed || this.down) return;
    if (parcel === 'closed') {
      this.goDown('closed by the far side');
    } else {
      this.receivedTypes.push(frameType(parcel));
      this.handlers.onFrame(parcel);
    }
  }

  private goDown(reason: string): void {
    if (this.closed || this.down) return;
    this.down = true;
    this.waiting.length = 0;
    this.abortStalled(reason);
    this.handlers.onDown(reason);
  }

  private abortStalled(reason: string): void {
    for (const send of this.stalled.splice(0)) send.abort(linkError(reason));
  }
}

/** A storage whose writes and reads wait for the test, and which records how they overlap. */
export interface GatedStorage {
  storage: TransferStorage;
  /** While true, each `putPiece` and `readPiece` waits for `releaseNext()` or `releaseAll()`. */
  gated: boolean;
  /** Piece indices in the order their writes began. */
  readonly putsStarted: number[];
  /** How many writes have ended, well or badly. */
  readonly putsFinished: number;
  /** The most writes that were ever in progress at once. */
  readonly mostConcurrentPuts: number;
  /** Operations currently waiting at the gate. */
  readonly waiting: number;
  releaseNext(): void;
  /** Opens the gate for good. */
  releaseAll(): void;
}

export function createGatedStorage(inner: TransferStorage): GatedStorage {
  const queue: Array<() => void> = [];
  const putsStarted: number[] = [];
  let gated = false;
  let putsInProgress = 0;
  let mostConcurrentPuts = 0;

  const pass = async (): Promise<void> => {
    if (gated) await new Promise<void>((open) => queue.push(open));
  };

  const storage: TransferStorage = {
    heldPieces: (key: StoredTransferKey) => inner.heldPieces(key),
    async putPiece(key, index, bytes) {
      putsStarted.push(index);
      putsInProgress += 1;
      mostConcurrentPuts = Math.max(mostConcurrentPuts, putsInProgress);
      try {
        await pass();
        await inner.putPiece(key, index, bytes);
      } finally {
        putsInProgress -= 1;
      }
    },
    async readPiece(key, index) {
      await pass();
      return inner.readPiece(key, index);
    },
    discard: (key) => inner.discard(key),
    discardUntouchedSince: (timestamp) => inner.discardUntouchedSince(timestamp),
    close: () => inner.close(),
  };

  return {
    storage,
    putsStarted,
    get gated() {
      return gated;
    },
    set gated(value: boolean) {
      gated = value;
    },
    get putsFinished() {
      return putsStarted.length - putsInProgress;
    },
    get mostConcurrentPuts() {
      return mostConcurrentPuts;
    },
    get waiting() {
      return queue.length;
    },
    releaseNext: () => queue.shift()?.(),
    releaseAll: () => {
      gated = false;
      for (const open of queue.splice(0)) open();
    },
  };
}
