import { WebRTCService } from './WebRTCService';
import MudClient from './client';
import * as CryptoJS from 'crypto-js';

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

  constructor(client: MudClient) {
    this.client = client;
    this.webRTCService = client.webRTCService;
    this.setupListeners();
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
      this.client.onFileTransferError(file.name, 'send', `File size exceeds the maximum allowed size of ${this.maxFileSize / (1024 * 1024)} MB`);
      return;
    }

    await this.client.initializeWebRTC();
    const offer = await this.client.webRTCService.createOffer();
    
    await this.client.sendFileTransferOffer(recipient, file.name, file.size, JSON.stringify(offer));

    const transferTimeout = setTimeout(() => {
      this.handleTransferError(file.name, 'send', new Error('Transfer timeout'));
    }, this.transferTimeout);

    this.outgoingTransfers.set(file.name, { file, timeout: transferTimeout });
  }

  private async startTransfer(filename: string): Promise<void> {
    const transfer = this.outgoingTransfers.get(filename);
    if (!transfer) {
      this.client.onFileTransferError(filename, 'send', 'No outgoing transfer found for file');
      return;
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
        this.client.onFileSendProgress({
          filename: file.name,
          sentBytes: offset,
          totalBytes: file.size
        });

        if (offset < file.size) {
          readNextChunk();
        } else {
          this.client.onFileSendComplete(file.name);
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
          this.client.onFileTransferError(header.filename, 'receive', `Incoming file size exceeds the maximum allowed size of ${this.maxFileSize / (1024 * 1024)} MB`);
          return;
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

      this.client.onFileReceiveProgress({
        filename: header.filename,
        receivedBytes: transfer.receivedSize,
        totalBytes: transfer.totalSize
      });

      if (transfer.receivedSize === transfer.totalSize) {
        const completeFile = new Blob(transfer.chunks);
        this.client.onFileReceiveComplete({
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
    this.client.onFileTransferError(filename, direction, error.message);

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
      this.client.onConnectionRecovered({ filename, direction });
      
      if (direction === 'send') {
        const transfer = this.outgoingTransfers.get(filename);
        if (transfer) {
          this.startTransfer(filename);
        }
      }
    } catch (error) {
      console.error('Failed to recover connection:', error);
      this.client.onRecoveryFailed({ filename, direction, error: error.message });
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
      this.client.onFileTransferCancelled({ filename, direction: 'send' });
      this.client.sendFileTransferCancel(this.client.worldData.playerId, filename);
    }

    if (this.incomingTransfers.has(filename)) {
      this.incomingTransfers.delete(filename);
      this.client.onFileTransferCancelled({ filename, direction: 'receive' });
      this.client.sendFileTransferCancel(this.client.worldData.playerId, filename);
    }
  }

  async acceptTransfer(sender: string, filename: string): Promise<void> {
    await this.waitForDataChannel();
    this.client.onFileTransferAccepted({ sender, filename });
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
}
