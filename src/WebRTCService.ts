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
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.client.gmcp_fileTransfer.sendAccept(this.client.worldData.playerId, "", JSON.stringify(event.candidate));
        }
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        this.client.emit('iceConnectionStateChange', this.peerConnection?.iceConnectionState);
      };

      this.peerConnection.onconnectionstatechange = () => {
        this.client.emit('connectionStateChange', this.peerConnection?.connectionState);
      };

      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
      this.setupDataChannel();
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.client.emit('dataChannelOpen');
    };

    this.dataChannel.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.client.emit('dataChannelMessage', event.data);
      } else {
        console.warn('Received non-ArrayBuffer data:', event.data);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.client.emit('dataChannelError', error);
    };

    this.dataChannel.onclose = () => {
      this.client.emit('dataChannelClose');
    };
  }

  sendData(data: ArrayBuffer): void {
    if (!this.dataChannel) throw new Error('Data channel not initialized');
    if (this.dataChannel.readyState !== 'open') throw new Error('Data channel is not open');
    this.dataChannel.send(data);
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      throw error;
    }
  }

  async reconnect(): Promise<void> {
    this.close();
    await this.createPeerConnection();
    // Reinitiate the connection process...
    this.client.emit('webRTCReconnecting');
  }

  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.client.emit('webRTCClosed');
  }
}
