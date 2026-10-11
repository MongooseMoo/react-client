import { FileTransferError, MAX_HELD_CANDIDATES } from './types';
import type { TransferLink, TransferLinkFactory, TransferLinkHandlers } from './types';

const CHANNEL_LABEL = 'fileTransfer';
const HIGH_WATER_MARK = 1024 * 1024;
const LOW_WATER_MARK = HIGH_WATER_MARK / 2;
const DISCONNECT_GRACE_MS = 5000;

function connectionError(message: string): FileTransferError {
  return new FileTransferError('connection-failed', message);
}

class RtcTransferLink implements TransferLink {
  private connection: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private started = false;
  /** Set by a local `close()` and by going down alike: either way the link is finished. */
  private closed = false;
  private remoteDescriptionSet = false;
  private heldCandidates: RTCIceCandidateInit[] = [];
  private disconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private sendQueue: Promise<void> = Promise.resolve();
  private abortDrainWait: ((error: Error) => void) | null = null;
  private readonly listeners = new AbortController();

  constructor(
    private readonly configuration: RTCConfiguration,
    private readonly handlers: TransferLinkHandlers,
  ) {}

  createOffer(): Promise<RTCSessionDescriptionInit> {
    this.claimStart();
    return this.offer();
  }

  acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this.claimStart();
    return this.answer(offer);
  }

  async acceptAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.setRemoteDescription(this.requireConnection(), answer);
  }

  async addCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    this.assertNotClosed();
    if (!this.connection || !this.remoteDescriptionSet) {
      // A peer sends a handful; whatever is beyond the limit is dropped, not kept.
      if (this.heldCandidates.length < MAX_HELD_CANDIDATES) this.heldCandidates.push(candidate);
      return;
    }
    await this.connection.addIceCandidate(candidate);
  }

  send(frame: ArrayBuffer): Promise<void> {
    // Chaining keeps frames in call order even when an earlier one is waiting on the buffer.
    const sent = this.sendQueue.then(() => this.transmit(frame));
    this.sendQueue = sent.catch(() => undefined);
    return sent;
  }

  close(): void {
    if (this.closed) return;
    this.release(connectionError('link closed'));
  }

  /** Throws for a second start; a closed link is left for the async part to reject. */
  private claimStart(): void {
    if (this.closed) return;
    if (this.started) throw new Error('link already started');
    this.started = true;
  }

  private async offer(): Promise<RTCSessionDescriptionInit> {
    const connection = this.connect();
    this.adoptChannel(connection.createDataChannel(CHANNEL_LABEL, { ordered: true }));
    const offer = await this.whileOpen(connection.createOffer());
    await this.whileOpen(connection.setLocalDescription(offer));
    return offer;
  }

  private async answer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const connection = this.connect();
    connection.addEventListener(
      'datachannel',
      (event) => {
        if (!this.channel) this.adoptChannel(event.channel);
      },
      { signal: this.listeners.signal },
    );
    await this.setRemoteDescription(connection, offer);
    const answer = await this.whileOpen(connection.createAnswer());
    await this.whileOpen(connection.setLocalDescription(answer));
    return answer;
  }

  private connect(): RTCPeerConnection {
    this.assertNotClosed();
    const connection = new RTCPeerConnection(this.configuration);
    const { signal } = this.listeners;
    connection.addEventListener(
      'icecandidate',
      (event) => {
        if (event.candidate) this.handlers.onCandidate(event.candidate.toJSON());
      },
      { signal },
    );
    connection.addEventListener(
      'connectionstatechange',
      () => this.handleConnectionState(connection.connectionState),
      { signal },
    );
    this.connection = connection;
    return connection;
  }

  private adoptChannel(channel: RTCDataChannel): void {
    const { signal } = this.listeners;
    channel.binaryType = 'arraybuffer';
    channel.addEventListener('open', () => this.handlers.onOpen(), { signal });
    channel.addEventListener(
      'message',
      (event) => {
        if (event.data instanceof ArrayBuffer) this.handlers.onFrame(event.data);
      },
      { signal },
    );
    channel.addEventListener('close', () => this.goDown('data channel closed'), { signal });
    channel.addEventListener(
      'error',
      (event) => {
        const detail = event.error?.message;
        this.goDown(detail ? `data channel error: ${detail}` : 'data channel error');
      },
      { signal },
    );
    this.channel = channel;
  }

  private async setRemoteDescription(
    connection: RTCPeerConnection,
    description: RTCSessionDescriptionInit,
  ): Promise<void> {
    await this.whileOpen(connection.setRemoteDescription(description));
    this.remoteDescriptionSet = true;
    const held = this.heldCandidates;
    this.heldCandidates = [];
    for (const candidate of held) {
      // One unusable candidate must not cost us the ones behind it.
      await this.whileOpen(connection.addIceCandidate(candidate).catch(() => undefined));
    }
  }

  private handleConnectionState(state: RTCPeerConnectionState): void {
    this.clearDisconnectTimer();
    switch (state) {
      case 'failed':
        this.goDown('connection failed');
        break;
      case 'closed':
        this.goDown('connection closed');
        break;
      case 'disconnected':
        // Browsers often recover from this state unaided, so it only counts once it lasts.
        this.disconnectTimer = setTimeout(
          () => this.goDown('connection lost'),
          DISCONNECT_GRACE_MS,
        );
        break;
    }
  }

  private async transmit(frame: ArrayBuffer): Promise<void> {
    const channel = this.channel;
    if (channel?.readyState !== 'open') throw connectionError('data channel is not open');
    while (channel.bufferedAmount > HIGH_WATER_MARK) {
      await this.waitForDrain(channel);
    }
    channel.send(frame);
  }

  /** Sends are serialised, so at most one of these waits exists at a time. */
  private waitForDrain(channel: RTCDataChannel): Promise<void> {
    return new Promise((resolve, reject) => {
      const stopWaiting = () => {
        channel.removeEventListener('bufferedamountlow', onDrained);
        this.abortDrainWait = null;
      };
      const onDrained = () => {
        stopWaiting();
        resolve();
      };
      this.abortDrainWait = (error) => {
        stopWaiting();
        reject(error);
      };
      channel.bufferedAmountLowThreshold = LOW_WATER_MARK;
      channel.addEventListener('bufferedamountlow', onDrained);
    });
  }

  private goDown(reason: string): void {
    if (this.closed) return;
    this.release(connectionError(reason));
    this.handlers.onDown(reason);
  }

  private release(error: Error): void {
    this.closed = true;
    this.clearDisconnectTimer();
    this.listeners.abort();
    this.heldCandidates = [];
    this.abortDrainWait?.(error);
    this.channel?.close();
    this.channel = null;
    this.connection?.close();
    this.connection = null;
  }

  private clearDisconnectTimer(): void {
    clearTimeout(this.disconnectTimer);
    this.disconnectTimer = undefined;
  }

  private requireConnection(): RTCPeerConnection {
    this.assertNotClosed();
    if (!this.connection) throw new Error('link not started');
    return this.connection;
  }

  private assertNotClosed(): void {
    if (this.closed) throw connectionError('link closed');
  }

  /** Awaits one negotiation step and refuses to go on if the link was closed meanwhile. */
  private async whileOpen<T>(step: Promise<T>): Promise<T> {
    const result = await step;
    this.assertNotClosed();
    return result;
  }
}

/**
 * Links made by the returned factory each own one `RTCPeerConnection` and one data
 * channel. A link never reconnects: when it goes down it reports that once and is done.
 */
export function createRtcTransferLinkFactory(configuration: RTCConfiguration): TransferLinkFactory {
  return (handlers) => new RtcTransferLink(configuration, handlers);
}
