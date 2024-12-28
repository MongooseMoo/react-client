import MudClient from "./client";
import EventEmitter from "eventemitter3";

export class WebRTCService  extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private client: MudClient;
  private connectionTimeout: number = 300000; // 5 minutes timeout
  public recipient: string = "";
  public pendingCandidates: RTCIceCandidateInit[] = [];

  constructor(client: MudClient) {
    super()
    this.client = client;
  }

  isDataChannelOpen(): boolean {
    return this.dataChannel !== null && this.dataChannel.readyState === "open";
  }

  async createPeerConnection(): Promise<void> {
    try {
      const configuration: RTCConfiguration = {
        iceServers: [
          {
            urls: ["turn:mongoose.world:3478", "stun:mongoose.world:3478"],
            username: "p2p",
            credential: "p2p",
          },
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      };

      this.peerConnection = new RTCPeerConnection(configuration);

      // Add better logging to debug the connection process
      // Monitor all connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        console.log("[WebRTCService] Connection state changed to:", state);
        this.emit("webRTCStateChange", `Connection: ${state}`);

        switch (state) {
          case "connected":
            console.log(
              "[WebRTCService] Peer connection established successfully"
            );
            this.emit("webRTCConnected");
            break;
          case "disconnected":
            console.log("[WebRTCService] Connection temporarily disconnected");
            this.emit("webRTCDisconnected");
            // Give it a moment to auto-recover before attempting full recovery
            setTimeout(() => {
              if (this.peerConnection?.connectionState === "disconnected") {
                this.attemptRecovery();
              }
            }, 5000);
            break;
          case "failed":
            console.log(
              "[WebRTCService] Connection failed - attempting immediate recovery"
            );
            this.attemptRecovery();
            break;
        }
      };

      // Monitor ICE connection state changes
      this.peerConnection.oniceconnectionstatechange = () => {
        const state = this.peerConnection?.iceConnectionState;
        console.log("[WebRTCService] ICE connection state changed to:", state);
        this.emit("webRTCStateChange", `ICE: ${state}`);

        if (state === "failed") {
          console.log("[WebRTCService] ICE connection failed");
          this.attemptRecovery();
        }
      };

      // Monitor signaling state changes
      this.peerConnection.onsignalingstatechange = () => {
        const state = this.peerConnection?.signalingState;
        console.log("[WebRTCService] Signaling state changed to:", state);
        this.emit("webRTCStateChange", `Signaling: ${state}`);

        if (state === "stable") {
          console.log("[WebRTCService] Signaling completed successfully");
        }
      };

      // Monitor ICE gathering state
      this.peerConnection.onicegatheringstatechange = () => {
        const state = this.peerConnection?.iceGatheringState;
        console.log("[WebRTCService] ICE gathering state changed to:", state);
        this.emit("webRTCStateChange", `ICE Gathering: ${state}`);

        if (state === "complete") {
          console.log("[WebRTCService] ICE gathering completed");
          this.emit("iceGatheringComplete");
        }
      };

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.debug("[WebRTCService] New ICE candidate:", {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address,
            port: event.candidate.port,
          });

          if (this.recipient) {
            this.client.gmcp_fileTransfer.sendCandidate(
              this.recipient,
              event.candidate
            );
          }
        } else {
          console.log("[WebRTCService] ICE gathering complete");
        }
      };

      this.peerConnection.ondatachannel = (event) => {
        console.log("[WebRTCService] Received data channel");
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };

      // Create data channel if we're the offering peer
      if (!this.dataChannel) {
        console.log("[WebRTCService] Creating data channel");
        this.dataChannel = this.peerConnection.createDataChannel(
          "fileTransfer",
          {
            ordered: true
          }
        );
        this.setupDataChannel();
      }
    } catch (error) {
      console.error("Error creating peer connection:", error);
      throw error;
    }
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log(
        "[WebRTCService] Data channel opened with state:",
        this.dataChannel?.readyState
      );
      this.emit("dataChannelOpen");
    };

    this.dataChannel.onclose = () => {
      console.log("[WebRTCService] Data channel closed");
      this.emit("dataChannelClose");
    };

    this.dataChannel.onerror = (error) => {
      console.error("[WebRTCService] Data channel error:", error);
      this.emit("dataChannelError", error);
    };

    this.dataChannel.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.emit("dataChannelMessage", event.data);
      }
    };
  }

  private async attemptRecovery(): Promise<void> {
    try {
      console.log("[WebRTCService] Attempting connection recovery");
      // Close existing connection
      this.close();

      // Wait a moment before reconnecting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Try to establish a new connection
      await this.createPeerConnection();

      console.log("[WebRTCService] Recovery attempt completed");
    } catch (error) {
      console.error("[WebRTCService] Recovery attempt failed:", error);
    }
  }

  private async attemptChannelRecovery(): Promise<void> {
    try {
      this.dataChannel =
        this.peerConnection?.createDataChannel("fileTransfer") ?? null;
      this.setupDataChannel();
    } catch (error) {
      console.error("Failed to recover data channel:", error);
      this.emit("dataChannelRecoveryFailed", error);
    }
  }
  async sendData(data: ArrayBuffer): Promise<void> {
    if (!this.dataChannel) throw new Error("Data channel not initialized");
    if (this.dataChannel.readyState !== "open") throw new Error("Data channel is not open");

    try {
      // Implement flow control - wait if buffer is getting full
      const maxBufferSize = 1048576; // 1MB threshold
      while (this.dataChannel.bufferedAmount > maxBufferSize) {
        await new Promise<void>((resolve) => {
          const onBufferedAmountLow = () => {
            this.dataChannel?.removeEventListener("bufferedamountlow", onBufferedAmountLow);
            resolve();
          };
          this.dataChannel?.addEventListener("bufferedamountlow", onBufferedAmountLow);
          this.dataChannel!.bufferedAmountLowThreshold = maxBufferSize / 2;
        });
      }

      this.dataChannel.send(data);
    } catch (error) {
      console.error("[WebRTCService] Error sending data:", error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection)
      throw new Error("Peer connection not initialized");
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection)
      throw new Error("Peer connection not initialized");
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection)
      throw new Error("Peer connection not initialized");
    try {
      console.log("[WebRTCService] Received WebRTC answer:", answer);
      console.log(
        "[WebRTCService] Current connection state:",
        this.peerConnection.connectionState
      );
      console.log(
        "[WebRTCService] Current signaling state:",
        this.peerConnection.signalingState
      );

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log("[WebRTCService] Remote description set successfully");
      console.log(
        "[WebRTCService] Updated connection state:",
        this.peerConnection.connectionState
      );
      console.log(
        "[WebRTCService] Updated signaling state:",
        this.peerConnection.signalingState
      );

      // Add any pending candidates now that we have the remote description
      if (this.pendingCandidates.length > 0) {
        console.log(
          `[WebRTCService] Adding ${this.pendingCandidates.length} pending ICE candidates`
        );
        await Promise.all(
          this.pendingCandidates.map(async (candidate, index) => {
            console.log(
              `[WebRTCService] Adding ICE candidate ${index + 1}/${
                this.pendingCandidates.length
              }`
            );
            await this.peerConnection!.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          })
        );
        console.log(
          "[WebRTCService] All pending ICE candidates added successfully"
        );
        this.pendingCandidates = []; // Clear pending candidates
      } else {
        console.log("[WebRTCService] No pending ICE candidates to add");
      }
    } catch (error) {
      console.error("Error handling answer:", error);
      throw error;
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      console.log(
        "[WebRTCService] Storing ICE candidate until peer connection is ready"
      );
      this.pendingCandidates.push(candidate);
      return;
    }

    try {
      console.log("[WebRTCService] Adding ICE candidate immediately");
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
      throw error;
    }
  }

  async reconnect(): Promise<void> {
    this.close();
    await this.createPeerConnection();
    // Reinitiate the connection process...
    this.emit("webRTCReconnecting");
  }

  close(): void {
    this.pendingCandidates = []; // Clear pending candidates
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.emit("webRTCClosed");
  }

  async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Connection timeout"));
      }, this.connectionTimeout);

      // If the channel is already open, resolve immediately
      if (this.isDataChannelOpen()) {
        clearTimeout(timeoutId);
        return resolve();
      }

      // Listen for the data channel opening
      const handleOpen = () => {
        clearTimeout(timeoutId);
        cleanup();
        resolve();
      };

      // Listen for connection failure
      const handleFailure = () => {
        if (this.peerConnection?.connectionState === "failed") {
          clearTimeout(timeoutId);
          cleanup();
          reject(new Error("Connection failed"));
        }
      };

      const cleanup = () => {
        if (this.dataChannel) {
          this.dataChannel.removeEventListener("open", handleOpen);
        }
        if (this.peerConnection) {
          this.peerConnection.removeEventListener(
            "connectionstatechange",
            handleFailure
          );
        }
      };

      // Add event listeners
      if (this.dataChannel) {
        this.dataChannel.addEventListener("open", handleOpen);
      }
      if (this.peerConnection) {
        this.peerConnection.addEventListener(
          "connectionstatechange",
          handleFailure
        );
      }
    });
  }

  private remoteOfferReceived: boolean = false;

  isPeerConnectionInitialized(): boolean {
    console.log(
      "[WebRTCService] Peer connection state:",
      this.peerConnection?.connectionState
    );
    return (
      this.peerConnection !== null &&
      this.peerConnection.connectionState !== "closed"
    );
  }

  hasRemoteOffer(): boolean {
    return this.remoteOfferReceived;
  }

  async waitForRemoteOffer(timeout: number = 30000): Promise<void> {
    console.log("[WebRTCService] Waiting for remote offer...");
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        console.log("[WebRTCService] Timeout waiting for remote offer");
        reject(new Error("Timeout waiting for remote offer"));
      }, timeout);

      const handleRemoteOffer = () => {
        console.log("[WebRTCService] Remote offer received");
        clearTimeout(timeoutId);
        cleanup();
        resolve();
      };

      const cleanup = () => {
        this.client.off("remoteOfferReceived", handleRemoteOffer);
      };

      // If we already have a remote offer, resolve immediately
      if (this.remoteOfferReceived) {
        console.log("[WebRTCService] Remote offer already received");
        clearTimeout(timeoutId);
        resolve();
        return;
      }

      // Wait for the event to fire
      this.client.on("remoteOfferReceived", handleRemoteOffer);
    });
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    console.log("[WebRTCService] Handling WebRTC offer:", offer);
    if (!this.peerConnection) {
      console.log("[WebRTCService] Creating new peer connection for offer");
      await this.createPeerConnection();
    }
    try {
      await this.peerConnection!.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      this.remoteOfferReceived = true;
      this.client.emit("remoteOfferReceived");
      console.log("[WebRTCService] Remote offer set successfully");

      // Process any pending candidates
      if (this.pendingCandidates.length > 0) {
        console.log(
          `[WebRTCService] Processing ${this.pendingCandidates.length} pending ICE candidates`
        );
        const candidates = [...this.pendingCandidates]; // Create a copy
        this.pendingCandidates = []; // Clear the array before processing

        for (const candidate of candidates) {
          try {
            await this.peerConnection!.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
            console.log(
              "[WebRTCService] Successfully added pending ICE candidate"
            );
          } catch (error) {
            console.warn(
              "[WebRTCService] Failed to add pending ICE candidate:",
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("[WebRTCService] Error handling offer:", error);
      throw error;
    }
  }
}
