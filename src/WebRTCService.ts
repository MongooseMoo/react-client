import MudClient from './client';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private client: MudClient;

  constructor(client: MudClient) {
    this.client = client;
  }

  isDataChannelOpen(): boolean {
    return this.dataChannel !== null && this.dataChannel.readyState === 'open';
  }

  async createPeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.client.emit('iceCandidate', event.candidate);
      }
    };

    this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
    this.setupDataChannel();
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.client.emit('dataChannelOpen');
    };

    this.dataChannel.onmessage = (event) => {
      this.client.emit('dataChannelMessage', event.data);
    };
  }

  sendData(data: ArrayBuffer): void {
    if (!this.dataChannel) throw new Error('Data channel not initialized');
    this.dataChannel.send(data);
  }

  // Additional methods will be implemented in future steps
}
