import { WebRTCService } from './WebRTCService';
import MudClient from './client';
import * as CryptoJS from 'crypto-js';
import { GMCPFileTransfer } from './gmcp/FileTransfer';

interface FileTransferProgress {
  filename: string;
  totalSize: number;
  receivedSize: number;
  chunks: ArrayBuffer[];
  lastActivityTimestamp: number;
}

export default class FileTransferManager {
  private webRTCService: WebRTCService;
  private client: MudClient;
  private chunkSize: number = 16384; // 16 KB chunks
  private incomingTransfers: Map<string, FileTransferProgress> = new Map();
  private outgoingTransfers: Map<string, { file: File, timeout: NodeJS.Timeout }> = new Map();
  private maxFileSize: number = 100 * 1024 * 1024; // 100 MB
  private transferTimeout: number = 30000; // 30 seconds
  private pendingOffers: Map<string, { sender: string, offerSdp: string, timestamp: number }> = new Map();

  constructor(client: MudClient, webRTCService: WebRTCService) {
    this.client = client;
    this.webRTCService = webRTCService;
    this.setupListeners();
    setInterval(() => this.cleanupOldOffers(), 60 * 1000); // Clean up old offers every minute
  }

  private isDataChannelReady(): boolean {
    return this.webRTCService.isDataChannelOpen();
  }

  private setupListeners(): void {
    this.client.on('dataChannelMessage', this.handleIncomingChunk.bind(this));
    setInterval(() => this.checkTransferTimeouts(), 5000);
  }

  async sendFile(file: File, recipient: string): Promise<void> {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds the maximum allowed size of ${this.maxFileSize / (1024 * 1024)} MB`);
    }

    await this.client.initializeWebRTC();
    const offer = await this.client.webRTCService.createOffer();
    
    await this.client.gmcp_fileTransfer.sendOffer(recipient, file.name, file.size, JSON.stringify(offer));

    const transferTimeout = setTimeout(() => {
      this.handleTransferError(file.name, 'send', new Error('Transfer timeout'));
    }, this.transferTimeout);

    this.outgoingTransfers.set(file.name, { file, timeout: transferTimeout });
  }

  private async startTransfer(filename: string): Promise<void> {
    const transfer = this.outgoingTransfers.get(filename);
    if (!transfer) {
      throw new Error(`No outgoing transfer found for file: ${filename}`);
    }

    if (!this.isDataChannelReady()) {
      await this.webRTCService.createPeerConnection();
    }

    const { file } = transfer;
    const fileReader = new FileReader();
    let offset = 0;

    // Generate a random encryption key
    const encryptionKey = CryptoJS.lib.WordArray.random(256 / 8);

    const readNextChunk = () => {
      const slice = file.slice(offset, offset + this.chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };

    fileReader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        const chunk = e.target.result;
        
        // Encrypt the chunk
        const encryptedChunk = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(chunk),
          encryptionKey
        ).toString();

        const header = new TextEncoder().encode(JSON.stringify({
          filename: file.name,
          chunkIndex: offset / this.chunkSize,
          totalChunks: Math.ceil(file.size / this.chunkSize),
          chunkSize: encryptedChunk.length,
          totalSize: file.size,
          encryptionKey: encryptionKey.toString()
        }));

        const headerSize = new Uint32Array([header.byteLength]);
        const data = new Uint8Array(4 + header.byteLength + encryptedChunk.length);
        data.set(new Uint8Array(headerSize.buffer), 0);
        data.set(header, 4);
        data.set(new TextEncoder().encode(encryptedChunk), 4 + header.byteLength);

        try {
          this.webRTCService.sendData(data.buffer);
        } catch (error) {
          this.handleTransferError(file.name, 'send', error);
          return;
        }

        offset += chunk.byteLength;
        this.client.emit('fileSendProgress', {
          filename: file.name,
          sentBytes: offset,
          totalBytes: file.size
        });

        if (offset < file.size) {
          readNextChunk();
        } else {
          this.client.emit('fileSendComplete', file.name);
          this.outgoingTransfers.delete(file.name);
        }
      }
    };

    fileReader.onerror = (error) => {
      this.handleTransferError(file.name, 'send', error);
    };

    readNextChunk();
  }

  private handleIncomingChunk(data: ArrayBuffer): void {
    try {
      const headerSize = new Uint32Array(data.slice(0, 4))[0];
      const headerData = new TextDecoder().decode(data.slice(4, 4 + headerSize));
      const header = JSON.parse(headerData);
      const chunk = data.slice(4 + headerSize);

      let transfer = this.incomingTransfers.get(header.filename);
      if (!transfer) {
        if (header.totalSize > this.maxFileSize) {
          throw new Error(`Incoming file size exceeds the maximum allowed size of ${this.maxFileSize / (1024 * 1024)} MB`);
        }
        transfer = {
          filename: header.filename,
          totalSize: header.totalSize,
          receivedSize: 0,
          chunks: new Array(header.totalChunks),
          lastActivityTimestamp: Date.now()
        };
        this.incomingTransfers.set(header.filename, transfer);
      }

      transfer.chunks[header.chunkIndex] = chunk;
      transfer.receivedSize += chunk.byteLength;
      transfer.lastActivityTimestamp = Date.now();

      this.client.emit('fileReceiveProgress', {
        filename: header.filename,
        receivedBytes: transfer.receivedSize,
        totalBytes: transfer.totalSize
      });

      if (transfer.receivedSize === transfer.totalSize) {
        const completeFile = new Blob(transfer.chunks);
        this.client.emit('fileReceiveComplete', {
          filename: header.filename,
          file: completeFile
        });
        this.incomingTransfers.delete(header.filename);
      }
    } catch (error) {
      this.handleTransferError(error.message, 'receive', error);
    }
  }

  private handleTransferError(filename: string, direction: 'send' | 'receive', error: any): void {
    console.error(`Error ${direction}ing file ${filename}:`, error);
    this.client.emit('fileTransferError', { filename, direction, error: error.message });

    if (direction === 'send') {
      const transfer = this.outgoingTransfers.get(filename);
      if (transfer) {
        clearTimeout(transfer.timeout);
        this.outgoingTransfers.delete(filename);
      }
    } else {
      this.incomingTransfers.delete(filename);
    }

    // Attempt to recover the connection
    this.attemptRecovery(filename, direction);
  }

  private async attemptRecovery(filename: string, direction: 'send' | 'receive'): Promise<void> {
    try {
      await this.webRTCService.createPeerConnection();
      this.client.emit('connectionRecovered', { filename, direction });
      
      if (direction === 'send') {
        const transfer = this.outgoingTransfers.get(filename);
        if (transfer) {
          this.startTransfer(filename);
        }
      }
    } catch (error) {
      console.error('Failed to recover connection:', error);
      this.client.emit('recoveryFailed', { filename, direction, error: error.message });
    }
  }

  private checkTransferTimeouts(): void {
    const now = Date.now();
    this.incomingTransfers.forEach((transfer, filename) => {
      if (now - transfer.lastActivityTimestamp > this.transferTimeout) {
        this.handleTransferError(filename, 'receive', new Error('Transfer timeout'));
      }
    });
  }

  cancelTransfer(filename: string): void {
    const outgoingTransfer = this.outgoingTransfers.get(filename);
    if (outgoingTransfer) {
      clearTimeout(outgoingTransfer.timeout);
      this.outgoingTransfers.delete(filename);
      this.client.emit('fileTransferCancelled', { filename, direction: 'send' });
      this.client.gmcp_fileTransfer.sendCancel(this.client.worldData.playerId, filename);
    }

    if (this.incomingTransfers.has(filename)) {
      this.incomingTransfers.delete(filename);
      this.client.emit('fileTransferCancelled', { filename, direction: 'receive' });
      this.client.gmcp_fileTransfer.sendCancel(this.client.worldData.playerId, filename);
    }
  }

  async handleGMCPOffer(sender: string, filename: string, filesize: number, offerSdp: string): Promise<void> {
    console.log(`[FileTransferManager] Received GMCP offer: sender=${sender}, filename=${filename}, filesize=${filesize}`);
    const offerKey = `${sender}-${filename}-${Date.now()}`;
    this.pendingOffers.set(offerKey, { sender, offerSdp, timestamp: Date.now() });
    this.client.emit('fileTransferOffer', { sender, filename, filesize, offerKey });
    console.log('[FileTransferManager] Emitted fileTransferOffer event');
  }

  async acceptTransfer(offerKey: string): Promise<void> {
    const pendingOffer = this.pendingOffers.get(offerKey);
    if (!pendingOffer) {
      throw new Error('No pending offer found for this file');
    }

    const { sender, offerSdp } = pendingOffer;
    await this.client.initializeWebRTC();
    await this.client.webRTCService.handleOffer(JSON.parse(offerSdp));
    const answer = await this.client.webRTCService.createAnswer();
    await this.client.gmcp_fileTransfer.sendAccept(sender, offerKey.split('-')[1], JSON.stringify(answer));
    
    this.pendingOffers.delete(offerKey);
  }

  private cleanupOldOffers(): void {
    const now = Date.now();
    for (const [key, offer] of this.pendingOffers.entries()) {
      if (now - offer.timestamp > 5 * 60 * 1000) { // 5 minutes
        this.pendingOffers.delete(key);
      }
    }
  }

  rejectTransfer(sender: string, filename: string): void {
    this.client.gmcp_fileTransfer.sendReject(sender, filename);
  }

  async handleGMCPAccept(sender: string, filename: string, answerSdp: string): Promise<void> {
    await this.client.webRTCService.handleAnswer(JSON.parse(answerSdp));
    await this.waitForDataChannel();
    const transfer = this.outgoingTransfers.get(filename);
    if (transfer) {
      this.startTransfer(filename);
    }
  }

  private async waitForDataChannel(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.client.webRTCService.isDataChannelOpen()) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (this.client.webRTCService.isDataChannelOpen()) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });
  }

  handleGMCPReject(sender: string, filename: string): void {
    this.cancelTransfer(filename);
    this.client.emit('fileTransferRejected', { sender, filename });
  }

  handleGMCPCancel(sender: string, filename: string): void {
    this.cancelTransfer(filename);
  }
}
