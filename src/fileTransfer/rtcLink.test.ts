import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRtcTransferLinkFactory } from './rtcLink';
import { MAX_HELD_CANDIDATES } from './types';
import type { TransferLink, TransferLinkHandlers } from './types';

const HIGH_WATER_MARK = 1024 * 1024;
const GRACE_MS = 5000;

const CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.example.test:3478' }],
};
const OFFER: RTCSessionDescriptionInit = { type: 'offer', sdp: 'offer-sdp' };
const ANSWER: RTCSessionDescriptionInit = { type: 'answer', sdp: 'answer-sdp' };

/** An EventTarget that knows how many listeners it holds, however they were removed. */
class CountingTarget extends EventTarget {
  private listeners = 0;

  get listenerCount(): number {
    return this.listeners;
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, listener, options);
    this.listeners += 1;
    if (typeof options === 'object' && options.signal) {
      options.signal.addEventListener('abort', () => {
        this.listeners -= 1;
      });
    }
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener, options);
    this.listeners -= 1;
  }

  emit(type: string, properties: object = {}): void {
    this.dispatchEvent(Object.assign(new Event(type), properties));
  }
}

class FakeDataChannel extends CountingTarget {
  binaryType = 'blob';
  readyState: RTCDataChannelState = 'connecting';
  bufferedAmount = 0;
  bufferedAmountLowThreshold = 0;
  sent: ArrayBuffer[] = [];
  sendError: Error | null = null;
  close = vi.fn(() => {
    this.readyState = 'closed';
  });

  constructor(
    readonly label: string,
    readonly options?: RTCDataChannelInit,
  ) {
    super();
  }

  send(data: ArrayBuffer): void {
    if (this.sendError) throw this.sendError;
    this.sent.push(data);
    this.bufferedAmount += data.byteLength;
  }

  open(): void {
    this.readyState = 'open';
    this.emit('open');
  }

  drain(): void {
    this.bufferedAmount = 0;
    this.emit('bufferedamountlow');
  }
}

class FakePeerConnection extends CountingTarget {
  static instances: FakePeerConnection[] = [];

  connectionState: RTCPeerConnectionState = 'new';
  localDescription: RTCSessionDescriptionInit | null = null;
  remoteDescription: RTCSessionDescriptionInit | null = null;
  channels: FakeDataChannel[] = [];
  /** Every negotiation call in the order it was made. */
  calls: string[] = [];
  failingCandidates = new Set<string>();
  close = vi.fn(() => {
    this.connectionState = 'closed';
  });

  constructor(readonly configuration?: RTCConfiguration) {
    super();
    FakePeerConnection.instances.push(this);
  }

  createDataChannel(label: string, options?: RTCDataChannelInit): FakeDataChannel {
    const channel = new FakeDataChannel(label, options);
    this.channels.push(channel);
    return channel;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.calls.push('createOffer');
    return OFFER;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    this.calls.push('createAnswer');
    return ANSWER;
  }

  async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.calls.push(`setLocalDescription:${description.type}`);
    this.localDescription = description;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.calls.push(`setRemoteDescription:${description.type}`);
    this.remoteDescription = description;
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    this.calls.push(`addIceCandidate:${candidate.candidate}`);
    if (this.failingCandidates.has(candidate.candidate ?? '')) {
      throw new Error(`bad candidate ${candidate.candidate}`);
    }
  }

  setConnectionState(state: RTCPeerConnectionState): void {
    this.connectionState = state;
    this.emit('connectionstatechange');
  }

  emitLocalCandidate(candidate: RTCIceCandidateInit | null): void {
    this.emit('icecandidate', {
      candidate: candidate && { ...candidate, toJSON: () => candidate },
    });
  }

  /** The far side's data channel arriving on the answering side. */
  announceChannel(): FakeDataChannel {
    const channel = new FakeDataChannel('fileTransfer');
    this.channels.push(channel);
    this.emit('datachannel', { channel });
    return channel;
  }
}

type MockHandlers = { [K in keyof TransferLinkHandlers]: ReturnType<typeof vi.fn> };

interface Harness {
  link: TransferLink;
  handlers: MockHandlers;
}

interface StartedHarness extends Harness {
  connection: FakePeerConnection;
  channel: FakeDataChannel;
}

function setup(configuration: RTCConfiguration = CONFIGURATION): Harness {
  const handlers: MockHandlers = {
    onCandidate: vi.fn(),
    onOpen: vi.fn(),
    onFrame: vi.fn(),
    onDown: vi.fn(),
  };
  const link = createRtcTransferLinkFactory(configuration)(handlers as TransferLinkHandlers);
  return { link, handlers };
}

function onlyConnection(): FakePeerConnection {
  expect(FakePeerConnection.instances).toHaveLength(1);
  return FakePeerConnection.instances[0];
}

async function offering(): Promise<StartedHarness> {
  const harness = setup();
  await harness.link.createOffer();
  const connection = onlyConnection();
  return { ...harness, connection, channel: connection.channels[0] };
}

async function answering(): Promise<StartedHarness> {
  const harness = setup();
  await harness.link.acceptOffer(OFFER);
  const connection = onlyConnection();
  return { ...harness, connection, channel: connection.announceChannel() };
}

/** An offering link whose data channel is open. */
async function opened(): Promise<StartedHarness> {
  const harness = await offering();
  harness.channel.open();
  return harness;
}

function frame(size: number, fill = 0): ArrayBuffer {
  return new Uint8Array(size).fill(fill).buffer;
}

function candidate(name: string): RTCIceCandidateInit {
  return { candidate: name, sdpMid: '0', sdpMLineIndex: 0 };
}

function candidateCalls(connection: FakePeerConnection): string[] {
  return connection.calls.filter((call) => call.startsWith('addIceCandidate:'));
}

/** Lets every pending promise continuation run without moving the clock. */
function settle(): Promise<unknown> {
  return vi.advanceTimersByTimeAsync(0);
}

describe('rtcLink', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakePeerConnection.instances = [];
    vi.stubGlobal('RTCPeerConnection', FakePeerConnection);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('factory', () => {
    it('creates no connection until the link is started', () => {
      setup();

      expect(FakePeerConnection.instances).toHaveLength(0);
    });

    it('passes its configuration to RTCPeerConnection', async () => {
      const { link } = setup(CONFIGURATION);

      await link.createOffer();

      expect(onlyConnection().configuration).toBe(CONFIGURATION);
    });

    it('gives every link its own connection and channel', async () => {
      const factory = createRtcTransferLinkFactory(CONFIGURATION);
      const first = setup().handlers as TransferLinkHandlers;
      const second = setup().handlers as TransferLinkHandlers;

      await factory(first).createOffer();
      await factory(second).createOffer();

      expect(FakePeerConnection.instances).toHaveLength(2);
      const [a, b] = FakePeerConnection.instances;
      expect(a.channels).toHaveLength(1);
      expect(b.channels).toHaveLength(1);
      expect(a.channels[0]).not.toBe(b.channels[0]);
    });
  });

  describe('createOffer', () => {
    it('opens an ordered binary data channel labelled fileTransfer', async () => {
      const { channel, connection } = await offering();

      expect(connection.channels).toHaveLength(1);
      expect(channel.label).toBe('fileTransfer');
      expect(channel.options).toEqual({ ordered: true });
      expect(channel.binaryType).toBe('arraybuffer');
    });

    it('sets the offer as local description and resolves with it', async () => {
      const { link } = setup();

      const offer = await link.createOffer();

      const connection = onlyConnection();
      expect(offer).toEqual(OFFER);
      expect(connection.calls).toEqual(['createOffer', 'setLocalDescription:offer']);
      expect(connection.localDescription).toEqual(OFFER);
    });

    it('rejects when the connection cannot produce an offer, without going down', async () => {
      const { link, handlers } = setup();
      const failure = new Error('no offer');
      vi.spyOn(FakePeerConnection.prototype, 'createOffer').mockRejectedValueOnce(failure);

      await expect(link.createOffer()).rejects.toBe(failure);
      expect(handlers.onDown).not.toHaveBeenCalled();
    });

    it('throws when the link was already started', async () => {
      const { link } = await offering();

      expect(() => link.createOffer()).toThrow(/already started/);
      expect(() => link.acceptOffer(OFFER)).toThrow(/already started/);
      expect(FakePeerConnection.instances).toHaveLength(1);
    });
  });

  describe('acceptOffer', () => {
    it('sets the offer as remote description, then answers', async () => {
      const { link } = setup();

      const answer = await link.acceptOffer(OFFER);

      const connection = onlyConnection();
      expect(answer).toEqual(ANSWER);
      expect(connection.calls).toEqual([
        'setRemoteDescription:offer',
        'createAnswer',
        'setLocalDescription:answer',
      ]);
      expect(connection.remoteDescription).toEqual(OFFER);
      expect(connection.localDescription).toEqual(ANSWER);
    });

    it('creates no data channel of its own', async () => {
      const { link } = setup();

      await link.acceptOffer(OFFER);

      expect(onlyConnection().channels).toHaveLength(0);
    });

    it('takes the data channel the offering side opened', async () => {
      const { channel, handlers, link } = await answering();

      expect(channel.binaryType).toBe('arraybuffer');

      channel.open();
      expect(handlers.onOpen).toHaveBeenCalledTimes(1);

      const received = frame(4, 7);
      channel.emit('message', { data: received });
      expect(handlers.onFrame).toHaveBeenCalledWith(received);

      const sent = frame(8);
      await link.send(sent);
      expect(channel.sent).toEqual([sent]);
    });

    it('throws when the link was already started', async () => {
      const { link } = await answering();

      expect(() => link.acceptOffer(OFFER)).toThrow(/already started/);
      expect(() => link.createOffer()).toThrow(/already started/);
      expect(FakePeerConnection.instances).toHaveLength(1);
    });
  });

  describe('acceptAnswer', () => {
    it('sets the answer as remote description', async () => {
      const { link, connection } = await offering();

      await link.acceptAnswer(ANSWER);

      expect(connection.remoteDescription).toEqual(ANSWER);
      expect(connection.calls).toContain('setRemoteDescription:answer');
    });

    it('rejects on a link that was never started', async () => {
      const { link } = setup();

      await expect(link.acceptAnswer(ANSWER)).rejects.toThrow(/not started/);
    });
  });

  describe('remote candidates', () => {
    it('are held on the offering side until the answer is set, then added in order', async () => {
      const { link, connection } = await offering();

      await link.addCandidate(candidate('a'));
      await link.addCandidate(candidate('b'));
      await link.addCandidate(candidate('c'));
      expect(candidateCalls(connection)).toEqual([]);

      await link.acceptAnswer(ANSWER);

      expect(connection.calls.slice(-4)).toEqual([
        'setRemoteDescription:answer',
        'addIceCandidate:a',
        'addIceCandidate:b',
        'addIceCandidate:c',
      ]);
    });

    it('are held only up to the limit, the excess being dropped', async () => {
      const { link, connection } = await offering();

      for (let n = 0; n < MAX_HELD_CANDIDATES + 10; n++) await link.addCandidate(candidate(`c${n}`));
      await link.acceptAnswer(ANSWER);

      const added = candidateCalls(connection);
      expect(added).toHaveLength(MAX_HELD_CANDIDATES);
      expect(added.at(-1)).toBe(`addIceCandidate:c${MAX_HELD_CANDIDATES - 1}`);
    });

    it('are not limited once they can be added straight away', async () => {
      const { link, connection } = await offering();
      await link.acceptAnswer(ANSWER);

      for (let n = 0; n < MAX_HELD_CANDIDATES + 10; n++) await link.addCandidate(candidate(`c${n}`));

      expect(candidateCalls(connection)).toHaveLength(MAX_HELD_CANDIDATES + 10);
    });

    it('are held on the answering side until the offer is set, then added in order before answering', async () => {
      const { link } = setup();

      await link.addCandidate(candidate('a'));
      await link.addCandidate(candidate('b'));
      expect(FakePeerConnection.instances).toHaveLength(0);

      await link.acceptOffer(OFFER);

      expect(onlyConnection().calls).toEqual([
        'setRemoteDescription:offer',
        'addIceCandidate:a',
        'addIceCandidate:b',
        'createAnswer',
        'setLocalDescription:answer',
      ]);
    });

    it('are held while the remote description is still being set', async () => {
      const { link } = setup();
      let openGate = () => {};
      const gate = new Promise<void>((resolve) => {
        openGate = resolve;
      });
      vi.spyOn(FakePeerConnection.prototype, 'setRemoteDescription').mockImplementationOnce(
        async function (this: FakePeerConnection, description: RTCSessionDescriptionInit) {
          this.calls.push(`setRemoteDescription:${description.type}`);
          await gate;
          this.remoteDescription = description;
        },
      );

      const answered = link.acceptOffer(OFFER);
      await settle();
      await link.addCandidate(candidate('early'));
      const connection = onlyConnection();
      expect(candidateCalls(connection)).toEqual([]);

      openGate();
      await answered;

      expect(connection.calls).toEqual([
        'setRemoteDescription:offer',
        'addIceCandidate:early',
        'createAnswer',
        'setLocalDescription:answer',
      ]);
    });

    it('are added immediately once the remote description is set', async () => {
      const { link, connection } = await answering();

      await link.addCandidate(candidate('late'));

      expect(candidateCalls(connection)).toEqual(['addIceCandidate:late']);
    });

    it('are each added exactly once', async () => {
      const { link, connection } = await offering();
      await link.addCandidate(candidate('a'));
      await link.acceptAnswer(ANSWER);

      await link.addCandidate(candidate('b'));

      expect(candidateCalls(connection)).toEqual(['addIceCandidate:a', 'addIceCandidate:b']);
    });

    it('reject when one fails to add, without taking the link down', async () => {
      const { link, connection, handlers } = await answering();
      connection.failingCandidates.add('bad');

      await expect(link.addCandidate(candidate('bad'))).rejects.toThrow('bad candidate bad');
      await link.addCandidate(candidate('good'));

      expect(handlers.onDown).not.toHaveBeenCalled();
      expect(connection.close).not.toHaveBeenCalled();
      expect(candidateCalls(connection)).toEqual(['addIceCandidate:bad', 'addIceCandidate:good']);
    });

    it('that fail while being flushed do not block the rest', async () => {
      const { link, connection, handlers } = await offering();
      connection.failingCandidates.add('bad');
      await link.addCandidate(candidate('a'));
      await link.addCandidate(candidate('bad'));
      await link.addCandidate(candidate('c'));

      await expect(link.acceptAnswer(ANSWER)).resolves.toBeUndefined();

      expect(candidateCalls(connection)).toEqual([
        'addIceCandidate:a',
        'addIceCandidate:bad',
        'addIceCandidate:c',
      ]);
      expect(handlers.onDown).not.toHaveBeenCalled();
    });
  });

  describe('local candidates', () => {
    it('are forwarded as plain JSON', async () => {
      const { connection, handlers } = await offering();
      const local = candidate('local');

      connection.emitLocalCandidate(local);

      expect(handlers.onCandidate).toHaveBeenCalledTimes(1);
      expect(handlers.onCandidate).toHaveBeenCalledWith(local);
      expect(handlers.onCandidate.mock.calls[0][0]).not.toHaveProperty('toJSON');
    });

    it('do not include the end-of-candidates marker', async () => {
      const { connection, handlers } = await offering();

      connection.emitLocalCandidate(null);

      expect(handlers.onCandidate).not.toHaveBeenCalled();
    });
  });

  describe('data channel', () => {
    it('reports when it opens', async () => {
      const { channel, handlers } = await offering();
      expect(handlers.onOpen).not.toHaveBeenCalled();

      channel.open();

      expect(handlers.onOpen).toHaveBeenCalledTimes(1);
    });

    it('delivers each ArrayBuffer message as a frame', async () => {
      const { channel, handlers } = await opened();
      const first = frame(3, 1);
      const second = frame(5, 2);

      channel.emit('message', { data: first });
      channel.emit('message', { data: second });

      expect(handlers.onFrame.mock.calls).toEqual([[first], [second]]);
      expect(handlers.onFrame.mock.calls[0][0]).toBe(first);
    });

    it('ignores messages that are not ArrayBuffers', async () => {
      const { channel, handlers } = await opened();

      channel.emit('message', { data: 'text' });
      channel.emit('message', { data: new Blob(['blob']) });
      channel.emit('message', { data: new Uint8Array(4) });

      expect(handlers.onFrame).not.toHaveBeenCalled();
    });
  });

  describe('send', () => {
    it('rejects on a link that has no channel yet', async () => {
      const { link } = setup();

      await expect(link.send(frame(1))).rejects.toThrow(/not open/);
    });

    it('rejects while the channel is still connecting', async () => {
      const { link, channel } = await offering();

      await expect(link.send(frame(1))).rejects.toThrow(/not open/);
      expect(channel.sent).toEqual([]);
    });

    it('sends straight away when the buffer is at or below the high-water mark', async () => {
      const { link, channel } = await opened();
      channel.bufferedAmount = HIGH_WATER_MARK;
      const data = frame(16);

      await link.send(data);

      expect(channel.sent).toEqual([data]);
      expect(channel.sent[0]).toBe(data);
    });

    it('waits for the buffer to drain when it is above the high-water mark', async () => {
      const { link, channel } = await opened();
      channel.bufferedAmount = HIGH_WATER_MARK + 1;
      const data = frame(16);
      const resolved = vi.fn();

      const sending = link.send(data).then(resolved);
      await settle();

      expect(channel.sent).toEqual([]);
      expect(resolved).not.toHaveBeenCalled();
      expect(channel.bufferedAmountLowThreshold).toBe(HIGH_WATER_MARK / 2);

      channel.drain();
      await sending;

      expect(channel.sent).toEqual([data]);
    });

    it('keeps waiting when the buffer is still too full after a drain signal', async () => {
      const { link, channel } = await opened();
      channel.bufferedAmount = HIGH_WATER_MARK * 3;
      const sending = link.send(frame(16));
      await settle();

      channel.bufferedAmount = HIGH_WATER_MARK * 2;
      channel.emit('bufferedamountlow');
      await settle();
      expect(channel.sent).toEqual([]);

      channel.drain();
      await sending;
      expect(channel.sent).toHaveLength(1);
    });

    it('leaves no listener behind once a waiting send has gone out', async () => {
      const { link, channel } = await opened();
      const idle = channel.listenerCount;
      channel.bufferedAmount = HIGH_WATER_MARK + 1;

      const sending = link.send(frame(16));
      await settle();
      expect(channel.listenerCount).toBeGreaterThan(idle);

      channel.drain();
      await sending;
      expect(channel.listenerCount).toBe(idle);
    });

    it('sends concurrent frames in call order while waiting on the buffer', async () => {
      const { link, channel } = await opened();
      channel.bufferedAmount = HIGH_WATER_MARK + 1;
      const frames = [frame(8, 1), frame(8, 2), frame(8, 3)];

      const sending = Promise.all(frames.map((data) => link.send(data)));
      await settle();
      expect(channel.sent).toEqual([]);

      channel.drain();
      await sending;

      expect(channel.sent.map((data) => new Uint8Array(data)[0])).toEqual([1, 2, 3]);
    });

    it('does not let a new frame overtake one that has just stopped waiting', async () => {
      const { link, channel } = await opened();
      channel.bufferedAmount = HIGH_WATER_MARK + 1;
      const first = link.send(frame(8, 1));
      await settle();

      // The buffer is empty again, but the waiting frame has not been handed over yet.
      channel.drain();
      const second = link.send(frame(8, 2));
      await Promise.all([first, second]);

      expect(channel.sent.map((data) => new Uint8Array(data)[0])).toEqual([1, 2]);
    });

    it('holds later frames back when an earlier one fills the buffer', async () => {
      const { link, channel } = await opened();
      const big = HIGH_WATER_MARK * 0.75;
      const frames = [frame(big, 1), frame(big, 2), frame(big, 3), frame(big, 4)];
      const order: number[] = [];

      const sending = Promise.all(
        frames.map((data, index) => link.send(data).then(() => order.push(index))),
      );
      await settle();

      // Two frames take the buffer past the mark; the third has to wait for it to drain.
      expect(channel.sent.map((data) => new Uint8Array(data)[0])).toEqual([1, 2]);

      channel.drain();
      await settle();
      expect(channel.sent.map((data) => new Uint8Array(data)[0])).toEqual([1, 2, 3, 4]);

      channel.drain();
      await sending;
      expect(order).toEqual([0, 1, 2, 3]);
    });

    it.each([
      ['close', 'data channel closed'],
      ['error', 'data channel error'],
    ])('rejects a waiting send when the channel emits %s', async (eventName, reason) => {
      const { link, channel, handlers } = await opened();
      channel.bufferedAmount = HIGH_WATER_MARK + 1;
      const waiting = link.send(frame(16));
      const queued = link.send(frame(16));
      const waitingRejected = expect(waiting).rejects.toThrow(reason);
      const queuedRejected = expect(queued).rejects.toThrow(/not open/);
      await settle();

      channel.emit(eventName);

      await waitingRejected;
      await queuedRejected;
      expect(channel.listenerCount).toBe(0);
      expect(handlers.onDown).toHaveBeenCalledTimes(1);

      channel.drain();
      await settle();
      expect(channel.sent).toEqual([]);
    });

    it('rejects a waiting send when the link is closed locally', async () => {
      const { link, channel } = await opened();
      channel.bufferedAmount = HIGH_WATER_MARK + 1;
      const waiting = expect(link.send(frame(16))).rejects.toThrow(/closed/);
      await settle();

      link.close();

      await waiting;
      expect(channel.listenerCount).toBe(0);
      expect(channel.sent).toEqual([]);
    });

    it('rejects when the channel refuses the frame, and still sends the next one', async () => {
      const { link, channel } = await opened();
      channel.sendError = new Error('frame too large');

      await expect(link.send(frame(16))).rejects.toThrow('frame too large');

      channel.sendError = null;
      const data = frame(8);
      await link.send(data);
      expect(channel.sent).toEqual([data]);
    });
  });

  describe('going down', () => {
    it('reports a failed connection and releases it', async () => {
      const { connection, channel, handlers } = await opened();

      connection.setConnectionState('failed');

      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('connection failed');
      expect(channel.close).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
      expect(channel.listenerCount).toBe(0);
      expect(connection.listenerCount).toBe(0);
    });

    it('reports a connection closed from outside', async () => {
      const { connection, handlers } = await opened();

      connection.setConnectionState('closed');

      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('connection closed');
    });

    it('reports the data channel closing', async () => {
      const { connection, channel, handlers } = await opened();

      channel.readyState = 'closed';
      channel.emit('close');

      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('data channel closed');
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    it('reports a data channel error with its message', async () => {
      const { connection, channel, handlers } = await opened();

      channel.emit('error', { error: new Error('sctp failure') });

      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('data channel error: sctp failure');
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    it('reports a data channel error that carries no detail', async () => {
      const { channel, handlers } = await opened();

      channel.emit('error');

      expect(handlers.onDown).toHaveBeenCalledWith('data channel error');
    });

    it('reports the channel the answering side was given going away', async () => {
      const { channel, handlers } = await answering();

      channel.emit('close');

      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('data channel closed');
    });

    it('reports a disconnection only after it has lasted five seconds', async () => {
      const { connection, handlers } = await opened();

      connection.setConnectionState('disconnected');
      await vi.advanceTimersByTimeAsync(GRACE_MS - 1);
      expect(handlers.onDown).not.toHaveBeenCalled();
      expect(connection.close).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('connection lost');
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    it('stays up when a disconnection recovers inside the grace period', async () => {
      const { link, connection, channel, handlers } = await opened();

      connection.setConnectionState('disconnected');
      await vi.advanceTimersByTimeAsync(GRACE_MS - 1);
      connection.setConnectionState('connected');
      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(GRACE_MS * 2);

      expect(handlers.onDown).not.toHaveBeenCalled();
      expect(connection.close).not.toHaveBeenCalled();
      await link.send(frame(4));
      expect(channel.sent).toHaveLength(1);
    });

    it('gives a second disconnection a full grace period of its own', async () => {
      const { connection, handlers } = await opened();

      connection.setConnectionState('disconnected');
      await vi.advanceTimersByTimeAsync(GRACE_MS - 1);
      connection.setConnectionState('connected');
      connection.setConnectionState('disconnected');
      await vi.advanceTimersByTimeAsync(GRACE_MS - 1);
      expect(handlers.onDown).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(handlers.onDown).toHaveBeenCalledTimes(1);
    });

    it('reports a failure during the grace period at once, and only once', async () => {
      const { connection, handlers } = await opened();

      connection.setConnectionState('disconnected');
      connection.setConnectionState('failed');
      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('connection failed');
      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(GRACE_MS * 2);
      expect(handlers.onDown).toHaveBeenCalledTimes(1);
    });

    it('reports once however many down signals arrive', async () => {
      const { connection, channel, handlers } = await opened();

      channel.emit('error', { error: new Error('boom') });
      channel.emit('close');
      connection.setConnectionState('disconnected');
      connection.setConnectionState('failed');
      connection.setConnectionState('closed');
      await vi.advanceTimersByTimeAsync(GRACE_MS * 2);

      expect(handlers.onDown).toHaveBeenCalledTimes(1);
      expect(handlers.onDown).toHaveBeenCalledWith('data channel error: boom');
      expect(channel.close).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    it('does not start a new connection by itself', async () => {
      const { connection } = await opened();

      connection.setConnectionState('failed');
      await vi.advanceTimersByTimeAsync(60_000);

      expect(FakePeerConnection.instances).toHaveLength(1);
    });

    it('rejects every method afterwards', async () => {
      const { link, connection } = await opened();
      connection.setConnectionState('failed');

      await expect(link.send(frame(1))).rejects.toThrow(/not open/);
      await expect(link.acceptAnswer(ANSWER)).rejects.toThrow(/closed/);
      await expect(link.addCandidate(candidate('a'))).rejects.toThrow(/closed/);
      await expect(link.createOffer()).rejects.toThrow(/closed/);
      await expect(link.acceptOffer(OFFER)).rejects.toThrow(/closed/);
      expect(() => link.close()).not.toThrow();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('close', () => {
    it('closes the channel and the connection', async () => {
      const { link, connection, channel } = await opened();

      link.close();

      expect(channel.close).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    it('removes every listener', async () => {
      const { link, connection, channel } = await opened();
      expect(channel.listenerCount).toBeGreaterThan(0);
      expect(connection.listenerCount).toBeGreaterThan(0);

      link.close();

      expect(channel.listenerCount).toBe(0);
      expect(connection.listenerCount).toBe(0);
    });

    it('is idempotent', async () => {
      const { link, connection, channel } = await opened();

      link.close();
      link.close();

      expect(channel.close).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    it('does nothing on a link that was never started', () => {
      const { link, handlers } = setup();

      expect(() => link.close()).not.toThrow();
      expect(handlers.onDown).not.toHaveBeenCalled();
      expect(FakePeerConnection.instances).toHaveLength(0);
    });

    it('never reports the link as down', async () => {
      const { link, connection, channel, handlers } = await opened();

      link.close();
      channel.emit('close');
      channel.emit('error');
      connection.setConnectionState('closed');
      connection.setConnectionState('failed');
      await vi.advanceTimersByTimeAsync(GRACE_MS * 2);

      expect(handlers.onDown).not.toHaveBeenCalled();
    });

    it('cancels a pending disconnection grace period', async () => {
      const { link, connection, handlers } = await opened();
      connection.setConnectionState('disconnected');
      expect(vi.getTimerCount()).toBe(1);

      link.close();

      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(GRACE_MS * 2);
      expect(handlers.onDown).not.toHaveBeenCalled();
    });

    it('stops every other handler too', async () => {
      const { link, connection, channel, handlers } = await offering();

      link.close();
      channel.open();
      channel.emit('message', { data: frame(4) });
      connection.emitLocalCandidate(candidate('local'));

      expect(handlers.onOpen).not.toHaveBeenCalled();
      expect(handlers.onFrame).not.toHaveBeenCalled();
      expect(handlers.onCandidate).not.toHaveBeenCalled();
    });

    it('rejects every method afterwards', async () => {
      const { link } = await opened();
      link.close();

      await expect(link.send(frame(1))).rejects.toThrow(/not open/);
      await expect(link.acceptAnswer(ANSWER)).rejects.toThrow(/closed/);
      await expect(link.addCandidate(candidate('a'))).rejects.toThrow(/closed/);
      await expect(link.createOffer()).rejects.toThrow(/closed/);
      await expect(link.acceptOffer(OFFER)).rejects.toThrow(/closed/);
    });

    it('rejects a start that is attempted after closing an unstarted link', async () => {
      const { link } = setup();
      link.close();

      await expect(link.createOffer()).rejects.toThrow(/closed/);
      await expect(link.acceptOffer(OFFER)).rejects.toThrow(/closed/);
      expect(FakePeerConnection.instances).toHaveLength(0);
    });

    it('makes a negotiation that is still in flight reject', async () => {
      const { link } = setup();
      let finishOffer: (offer: RTCSessionDescriptionInit) => void = () => {};
      vi.spyOn(FakePeerConnection.prototype, 'createOffer').mockReturnValueOnce(
        new Promise((resolve) => {
          finishOffer = resolve;
        }),
      );

      const offered = expect(link.createOffer()).rejects.toThrow(/closed/);
      await settle();
      link.close();
      finishOffer(OFFER);

      await offered;
      expect(onlyConnection().localDescription).toBeNull();
    });
  });
});
