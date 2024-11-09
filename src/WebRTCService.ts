import MudClient from './client';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private client: MudClient;
  private connectionTimeout: number = 60000; // Increased timeout
  private recipient: string = "";

  constructor(client: MudClient) {
    this.client = client;
  }

  isDataChannelOpen(): boolean {
    return this.dataChannel !== null && this.dataChannel.readyState === 'open';
  }

  async createPeerConnection(): Promise<void> {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      });

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.recipient) {
          this.client.gmcp_fileTransfer.sendCandidate(
            this.recipient,
            event.candidate
          );
        }
      };

      // Add connection state logging
      this.peerConnection.onconnectionstatechange = () => {
        console.log("[WebRTCService] Connection state:", this.peerConnection?.connectionState);
        this.client.emit('webRTCStateChange', this.peerConnection?.connectionState);
      };

      this.peerConnection.ondatachannel = (event) => {
        console.log("[WebRTCService] Received data channel");
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };

      // Create data channel if we're the offering peer
      if (!this.dataChannel) {
        console.log("[WebRTCService] Creating data channel");
        this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
          ordered: true
        });
        this.setupDataChannel();
      }
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log("[WebRTCService] Data channel opened");
      this.client.emit('dataChannelOpen');
    };

    this.dataChannel.onclose = () => {
      console.log("[WebRTCService] Data channel closed");
      this.client.emit('dataChannelClose');
    };

    this.dataChannel.onerror = (error) => {
      console.error("[WebRTCService] Data channel error:", error);
      this.client.emit('dataChannelError', error);
    };

    this.dataChannel.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.client.emit('dataChannelMessage', event.data);
      }
    };
  }

  private async attemptChannelRecovery(): Promise<void> {
    try {
      this.dataChannel = this.peerConnection?.createDataChannel('fileTransfer') ?? null;
      this.setupDataChannel();
    } catch (error) {
      console.error('Failed to recover data channel:', error);
      this.client.emit('dataChannelRecoveryFailed', error);
    }
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

  async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.connectionTimeout);

      const checkConnection = () => {
        if (this.isDataChannelOpen()) {
          clearTimeout(timeout);
          resolve();
        } else if (this.peerConnection?.connectionState === 'failed') {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  private remoteOfferReceived: boolean = false;

  isPeerConnectionInitialized(): boolean {
    console.log('[WebRTCService] Peer connection state:', this.peerConnection?.connectionState);
    return this.peerConnection !== null && this.peerConnection.connectionState !== 'closed';
  }

  hasRemoteOffer(): boolean {
    return this.remoteOfferReceived;
  }

  async waitForRemoteOffer(timeout: number = 30000): Promise<void> {
    console.log('[WebRTCService] Waiting for remote offer...');
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.log('[WebRTCService] Timeout waiting for remote offer');
        reject(new Error('Timeout waiting for remote offer'));
      }, timeout);

      const checkInterval = setInterval(() => {
        console.log('[WebRTCService] Checking for remote offer...');
        if (this.remoteOfferReceived) {
          console.log('[WebRTCService] Remote offer received');
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 1000);
    });
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    console.log('[WebRTCService] Handling WebRTC offer:', offer);
    if (!this.peerConnection) {
      console.log('[WebRTCService] Creating new peer connection for offer');
      await this.createPeerConnection();
    }
    try {
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      this.remoteOfferReceived = true;
      console.log('[WebRTCService] Remote offer set successfully');
    } catch (error) {
      console.error('[WebRTCService] Error handling offer:', error);
      throw error;
    }
  }
}
