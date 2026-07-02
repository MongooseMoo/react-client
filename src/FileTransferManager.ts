import EventEmitter from 'eventemitter3';
import type { WebRTCService } from './WebRTCService';
import type {
  FileTransferAccept,
  FileTransferCancel,
  FileTransferCandidate,
  GMCPClientFileTransfer,
  FileTransferOffer,
  FileTransferReject,
} from './gmcp/Client/FileTransfer';
import { FileTransferStore } from './FileTransferStore';
import { useSessionStore } from './stores/sessionStore';

export class FileTransferError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'FileTransferError';
  }
}

export const FileTransferErrorCodes = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TRANSFER_TIMEOUT: 'TRANSFER_TIMEOUT',
  INVALID_FILE: 'INVALID_FILE',
  DATA_CHANNEL_ERROR: 'DATA_CHANNEL_ERROR',
};

interface FileTransferProgress {
  hash: string;
  filename: string;
  totalSize: number;
  receivedSize: number;
  chunks: ArrayBuffer[];
  lastActivityTimestamp: number;
  sender: string;
}

interface FileTransferTask {
  file: File;
  filename: string;
  hash: string;
  lastActivityTimestamp: number;
  recipient: string;
}

export default class FileTransferManager extends EventEmitter {
  private webRTCService: WebRTCService;
  private gmcpFileTransfer: GMCPClientFileTransfer;
  private chunkSize: number = 16384; // 16 KB chunks
  private transferTimeoutInterval?: number;
  private incomingTransfers: Map<string, FileTransferProgress> = new Map(); // keyed by hash
  private outgoingTransfers: Map<string, FileTransferTask> = new Map(); // keyed by hash
  private maxFileSize: number = 100 * 1024 * 1024; // 100 MB
  private transferTimeout: number = 30000; // 30 seconds
  public pendingOffers: Map<string, FileTransferOffer> = new Map(); // keyed by hash
  // Durable record of offers the user explicitly accepted, keyed by hash. This is the
  // consent record the byte path gates on: pendingOffers is deleted on accept (before
  // bytes arrive), so it cannot be used to authorize incoming chunks.
  private acceptedOffers: Map<string, { filename: string; hash: string; sender: string; filesize: number }> =
    new Map();
  private store: FileTransferStore;
  private storeInitialized: boolean = false;
  private readonly handleDataChannelMessage = (data: ArrayBuffer): void => {
    void this.handleIncomingChunk(data);
  };
  private readonly handleFileTransferAccepted = (transfer: FileTransferAccept): void => {
    void this.handleAcceptedTransfer(transfer);
  };
  private readonly handleFileTransferOffer = (offer: FileTransferOffer): void => {
    this.pendingOffers.set(offer.hash, offer);
    this.emit('fileTransferOffer', offer);
  };
  private readonly handleFileTransferRejected = (transfer: FileTransferReject): void => {
    const activeTransfer = this.outgoingTransfers.get(transfer.hash);
    const filename = activeTransfer?.filename ?? 'unknown';
    this.cleanupTransfer(transfer.hash);
    this.emit('fileTransferRejected', {
      sender: transfer.sender,
      hash: transfer.hash,
      filename,
    });
  };
  private readonly handleFileTransferCancelled = (transfer: FileTransferCancel): void => {
    this.emitCancellation(transfer.sender, transfer.hash);
  };
  private readonly handleRemoteIceCandidate = (data: FileTransferCandidate): void => {
    void this.webRTCService.handleIceCandidate(JSON.parse(data.candidate));
  };
  private readonly handleLocalIceCandidate = (candidate: RTCIceCandidate): void => {
    if (this.webRTCService.recipient) {
      this.gmcpFileTransfer.sendCandidate({
        recipient: this.webRTCService.recipient,
        candidate: JSON.stringify(candidate),
      });
    }
  };

  constructor(webRTCService: WebRTCService, gmcpFileTransfer: GMCPClientFileTransfer) {
    super();
    this.gmcpFileTransfer = gmcpFileTransfer;
    this.webRTCService = webRTCService;
    this.store = new FileTransferStore();
    this.initializeStore();
    this.setupListeners();
  }

  private async initializeStore(): Promise<void> {
    try {
      await this.store.initialize();
      this.storeInitialized = true;
      console.log('[FileTransferManager] Store initialized successfully');
    } catch (error) {
      console.error('[FileTransferManager] Failed to initialize store:', error);
    }
  }

  private isDataChannelReady(): boolean {
    return this.webRTCService.isDataChannelOpen();
  }

  private setupListeners(): void {
    this.webRTCService.on('dataChannelMessage', this.handleDataChannelMessage);
    this.webRTCService.on('iceCandidate', this.handleLocalIceCandidate);
    this.gmcpFileTransfer.on('offer', this.handleFileTransferOffer);
    this.gmcpFileTransfer.on('accept', this.handleFileTransferAccepted);
    this.gmcpFileTransfer.on('reject', this.handleFileTransferRejected);
    this.gmcpFileTransfer.on('cancel', this.handleFileTransferCancelled);
    this.gmcpFileTransfer.on('candidate', this.handleRemoteIceCandidate);
    this.transferTimeoutInterval = window.setInterval(() => this.checkTransferTimeouts(), 5000);
  }

  async initializeWebRTC(): Promise<void> {
    if (!this.webRTCService.isDataChannelOpen()) {
      await this.webRTCService.createPeerConnection();
    }
  }

  async sendFile(file: File, recipient: string): Promise<void> {
    if (file.size > this.maxFileSize) {
      throw new FileTransferError(
        FileTransferErrorCodes.INVALID_FILE,
        `File size exceeds the maximum allowed size of ${this.maxFileSize / (1024 * 1024)} MB`,
      );
    }

    // Compute file hash before starting transfer
    const fileHash = await this.computeFileHash(file);
    console.log(`[FileTransferManager] Computed hash for ${file.name}: ${fileHash}`);

    // Register the outgoing transfer before initiating WebRTC
    console.log(`[FileTransferManager] Registering outgoing transfer for file: ${file.name}`);
    this.outgoingTransfers.set(fileHash, {
      file,
      filename: file.name,
      hash: fileHash,
      lastActivityTimestamp: Date.now(),
      recipient,
    });

    try {
      await this.initializeWebRTC();
      this.webRTCService.recipient = recipient;
      const offer = await this.webRTCService.createOffer();

      console.log(`[FileTransferManager] Sending offer for file: ${file.name}`);
      await this.gmcpFileTransfer.sendOffer({
        recipient,
        filename: file.name,
        filesize: file.size,
        offerSdp: JSON.stringify(offer),
        hash: fileHash,
      });

      // Wait for connection to be established
      await this.webRTCService.waitForConnection();
    } catch (error) {
      console.error(`[FileTransferManager] Failed to send file ${file.name}:`, error);
      this.handleTransferError(
        fileHash,
        file.name,
        'send',
        error instanceof FileTransferError
          ? error
          : new FileTransferError(
              FileTransferErrorCodes.CONNECTION_FAILED,
              'Failed to establish connection',
            ),
      );
      this.cleanupTransfer(fileHash);
    }
  }

  private async computeFileHash(file: File): Promise<string> {
    const fileBytes = await file.arrayBuffer();
    const hashBytes = await crypto.subtle.digest('SHA-256', fileBytes);
    return Array.from(new Uint8Array(hashBytes))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private sanitizeFilename(filename: string): string {
    // Use the basename only: strip any directory components (/ or \) and leading dots so a
    // malicious offer or chunk header can neither traverse paths nor disguise the real name.
    const basename = filename.split(/[\\/]/).pop() ?? '';
    const cleaned = basename.replace(/^\.+/, '');
    return cleaned.length > 0 ? cleaned : 'download';
  }

  private discardAcceptedTransfer(hash: string): void {
    this.acceptedOffers.delete(hash);
    this.incomingTransfers.delete(hash);
    if (this.storeInitialized) {
      void this.store
        .deleteFile(hash)
        .catch((err) =>
          console.error('[FileTransferManager] Failed to delete file from store:', err),
        );
    }
  }

  private async startFileTransfer(file: File, hash: string): Promise<void> {
    let offset = 0;
    const fileReader = new FileReader();

    while (offset < file.size) {
      const slice = file.slice(offset, offset + this.chunkSize);

      const chunk = await new Promise<ArrayBuffer>((resolve, reject) => {
        fileReader.onload = () => {
          if (fileReader.result instanceof ArrayBuffer) {
            resolve(fileReader.result);
          } else {
            reject(
              new FileTransferError(
                FileTransferErrorCodes.INVALID_FILE,
                'Failed to read file chunk',
              ),
            );
          }
        };
        fileReader.onerror = () =>
          reject(new FileTransferError(FileTransferErrorCodes.INVALID_FILE, 'Error reading file'));
        fileReader.readAsArrayBuffer(slice);
      });

      await this.sendChunk(file.name, hash, chunk, offset, file.size);

      offset += chunk.byteLength;

      const fileTransferProgress = {
        hash: hash,
        filename: file.name,
        sentBytes: offset,
        totalBytes: file.size,
      };

      this.emit('fileSendProgress', fileTransferProgress);
    }
  }

  private async sendChunk(
    filename: string,
    hash: string,
    chunk: ArrayBuffer,
    offset: number,
    totalSize: number,
  ): Promise<void> {
    try {
      const header = {
        hash,
        filename,
        chunkIndex: Math.floor(offset / this.chunkSize),
        totalChunks: Math.ceil(totalSize / this.chunkSize),
        chunkSize: chunk.byteLength,
        totalSize,
      };

      const headerStr = JSON.stringify(header);
      const headerBuffer = new TextEncoder().encode(headerStr);
      const headerSizeBuffer = new ArrayBuffer(4);
      new DataView(headerSizeBuffer).setUint32(0, headerBuffer.byteLength, true); // Little-endian

      const dataBuffer = new Uint8Array(4 + headerBuffer.byteLength + chunk.byteLength);
      dataBuffer.set(new Uint8Array(headerSizeBuffer), 0);
      dataBuffer.set(headerBuffer, 4);
      dataBuffer.set(new Uint8Array(chunk), 4 + headerBuffer.byteLength);

      await this.webRTCService.sendData(dataBuffer.buffer);
    } catch {
      throw new FileTransferError(
        FileTransferErrorCodes.DATA_CHANNEL_ERROR,
        'Failed to send chunk',
      );
    }
  }

  async handleAcceptedTransfer(transfer: FileTransferAccept): Promise<void> {
    console.log(
      '[FileTransferManager] Handling accepted transfer for file transfer request ',
      transfer,
    );
    const { hash, filename, answerSdp } = transfer;
    const outgoingTransfer = this.outgoingTransfers.get(hash);
    if (!outgoingTransfer) {
      const error = `No outgoing transfer found for hash: ${hash} (${filename}). Active transfers: ${Array.from(
        this.outgoingTransfers.keys(),
      ).join(', ')}`;
      console.error(`[FileTransferManager] ${error}`);
      this.emit('fileTransferError', {
        hash,
        filename,
        direction: 'send',
        error,
      });
      return;
    }

    this.emit('fileTransferAccepted', {
      sender: transfer.sender,
      hash,
      filename,
    });

    try {
      console.log(`[FileTransferManager] Processing WebRTC answer for file: ${filename}`);
      const answerObj = JSON.parse(answerSdp);
      console.log(`[FileTransferManager] Answer object for file: ${filename}`, answerObj);
      await this.webRTCService.handleAnswer(answerObj);

      console.log(`[FileTransferManager] Waiting for data channel to open for file: ${filename}`);
      await this.waitForDataChannel(hash);
      console.log(`[FileTransferManager] Data channel ready for outgoing transfer of: ${filename}`);

      await this.startFileTransfer(outgoingTransfer.file, outgoingTransfer.hash);
      console.log(`[FileTransferManager] File transfer completed successfully: ${filename}`);
      this.emit('fileSendComplete', { hash, filename });
    } catch (error) {
      console.error(`[FileTransferManager] Error in accepted transfer for ${filename}:`, error);
      this.handleTransferError(hash, filename, 'send', error);
    } finally {
      console.log(`[FileTransferManager] Cleaning up successful transfer: ${filename} (${hash})`);
      this.outgoingTransfers.delete(hash);
    }
  }

  private async waitForDataChannel(hash: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.isDataChannelReady()) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 5 seconds total
      const checkInterval = setInterval(() => {
        attempts++;
        if (this.isDataChannelReady()) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(
            new FileTransferError(
              FileTransferErrorCodes.CONNECTION_FAILED,
              `Data channel failed to open for transfer ${hash} after ${attempts} attempts`,
            ),
          );
        }
      }, 100);
    });
  }

  private async handleIncomingChunk(data: ArrayBuffer): Promise<void> {
    let hash: string | undefined;
    try {
      if (data.byteLength < 4) {
        throw new Error('Received data is too short to contain header size');
      }

      const headerSizeArray = new Uint8Array(data.slice(0, 4));
      const headerSize = new DataView(headerSizeArray.buffer).getUint32(0, true);

      if (data.byteLength < 4 + headerSize) {
        throw new Error('Received data is too short to contain header');
      }

      const headerData = new TextDecoder().decode(data.slice(4, 4 + headerSize));
      const header = JSON.parse(headerData);
      hash = header.hash; // Capture hash for error handling

      if (data.byteLength < 4 + headerSize + header.chunkSize) {
        throw new Error('Received data is too short to contain chunk data');
      }

      // Validate header fields
      if (
        typeof header.chunkIndex !== 'number' ||
        header.chunkIndex < 0 ||
        header.chunkIndex >= header.totalChunks
      ) {
        throw new Error('Invalid chunk index in header');
      }

      if (typeof header.totalChunks !== 'number' || header.totalChunks <= 0) {
        throw new Error('Invalid total chunks in header');
      }

      // Consent gate (C1): only process bytes for an offer the user explicitly accepted.
      // Any other data-channel bytes are an unsolicited push and must be dropped.
      const accepted = this.acceptedOffers.get(header.hash);
      if (!accepted) {
        this.emit('fileTransferError', {
          hash: header.hash,
          filename: this.sanitizeFilename(header.filename ?? ''),
          direction: 'receive',
          error: 'Received data for a file transfer that was not accepted (unsolicited transfer rejected)',
        });
        return;
      }

      // The declared size must match what the user agreed to in the offer.
      if (header.totalSize !== accepted.filesize) {
        this.emit('fileTransferError', {
          hash: header.hash,
          filename: this.sanitizeFilename(accepted.filename),
          direction: 'receive',
          error: 'Incoming file size does not match the accepted offer',
        });
        this.discardAcceptedTransfer(header.hash);
        return;
      }

      // Trusted filename comes from the accepted offer, not the attacker-controlled header.
      const safeFilename = this.sanitizeFilename(accepted.filename);

      const chunkData = data.slice(4 + headerSize, 4 + headerSize + header.chunkSize);

      let transfer = this.incomingTransfers.get(header.hash);
      if (!transfer) {
        if (header.totalSize > this.maxFileSize) {
          this.emit('fileTransferError', {
            hash: header.hash,
            filename: safeFilename,
            direction: 'receive',
            error: `Incoming file size exceeds the maximum allowed size of ${
              this.maxFileSize / (1024 * 1024)
            } MB`,
          });
          this.discardAcceptedTransfer(header.hash);
          return;
        }
        transfer = {
          hash: header.hash,
          filename: safeFilename,
          totalSize: header.totalSize,
          receivedSize: 0,
          chunks: new Array(header.totalChunks),
          lastActivityTimestamp: Date.now(),
          sender: accepted.sender,
        };
        this.incomingTransfers.set(header.hash, transfer);

        // Persist metadata for resumable transfers
        if (this.storeInitialized) {
          await this.store.saveFileMetadata({
            hash: header.hash,
            filename: safeFilename,
            totalSize: header.totalSize,
            totalChunks: header.totalChunks,
            receivedChunks: [],
            direction: 'incoming',
            sender: accepted.sender,
            lastActivityTimestamp: Date.now(),
          });
        }
      }

      transfer.chunks[header.chunkIndex] = chunkData;
      transfer.receivedSize += chunkData.byteLength;
      transfer.lastActivityTimestamp = Date.now();

      // Persist chunk to IndexedDB for resumable transfers
      if (this.storeInitialized) {
        await this.store.saveChunk({
          hash: header.hash,
          index: header.chunkIndex,
          data: chunkData,
        });
      }
      const fileTransferProgress = {
        hash: header.hash,
        filename: safeFilename,
        receivedBytes: transfer.receivedSize,
        totalBytes: transfer.totalSize,
      };
      this.emit('fileReceiveProgress', fileTransferProgress);

      if (transfer.receivedSize === transfer.totalSize) {
        if (transfer.chunks.every((chunk) => chunk)) {
          const completeFile = new Blob(transfer.chunks);

          // Validate file hash
          const file = new File([completeFile], transfer.filename, {
            type: completeFile.type,
          });
          const computedHash = await this.computeFileHash(file);
          // Integrity (C2): compare against the hash the user AGREED to (the accepted
          // offer), not the sender's self-declared header/transfer hash.
          if (computedHash !== accepted.hash) {
            this.emit('fileTransferError', {
              hash: transfer.hash,
              filename: safeFilename,
              direction: 'receive',
              error: 'File integrity check failed - hash mismatch',
            });
            this.discardAcceptedTransfer(transfer.hash);
            return;
          }

          // Create a URL for the blob and trigger download
          const downloadUrl = window.URL.createObjectURL(completeFile);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          downloadLink.download = safeFilename;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadUrl);

          const completedFileData = {
            hash: transfer.hash,
            filename: safeFilename,
            file: completeFile,
          };
          this.emit('fileReceiveComplete', completedFileData);
          this.incomingTransfers.delete(transfer.hash);
          this.acceptedOffers.delete(transfer.hash);
          // Clean up persisted data after successful transfer
          if (this.storeInitialized) {
            await this.store.deleteFile(transfer.hash);
          }
        } else {
          this.emit('fileTransferError', {
            hash: transfer.hash,
            filename: safeFilename,
            direction: 'receive',
            error: 'Missing chunks in received file',
          });
        }
      }
    } catch (error) {
      // Use hash from parsed header if available, otherwise use error message
      const errorHash = hash || 'unknown';
      this.handleTransferError(
        errorHash,
        'unknown_file',
        'receive',
        new FileTransferError(
          'UNKNOWN_ERROR',
          error instanceof Error ? error.message : 'Unknown error',
        ),
      );
    }
  }

  private handleTransferError(
    hash: string,
    filename: string,
    direction: 'send' | 'receive',
    error: FileTransferError | Error | unknown,
  ): void {
    console.error(`Error ${direction}ing file ${filename} (${hash}):`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.emit('fileTransferError', { hash, filename, direction, error: errorMessage });

    // Save transfer data BEFORE cleanup so recovery can use it
    const outgoingTransfer = this.outgoingTransfers.get(hash);
    const incomingTransfer = this.incomingTransfers.get(hash);

    this.cleanupTransfer(hash);
    this.attemptRecovery(hash, filename, direction, outgoingTransfer, incomingTransfer);
  }

  private cleanupTransfer(hash: string): void {
    console.log(`[FileTransferManager] Starting cleanup for hash: ${hash}`);

    // Cleanup outgoing transfers
    const outgoingTransfer = this.outgoingTransfers.get(hash);
    if (outgoingTransfer) {
      console.log(
        `[FileTransferManager] Cleaning up outgoing transfer for: ${outgoingTransfer.filename} (${hash})`,
      );
      this.outgoingTransfers.delete(hash);
    }

    // Cleanup incoming transfers
    const incomingTransfer = this.incomingTransfers.get(hash);
    if (incomingTransfer) {
      console.log(
        `[FileTransferManager] Cleaning up incoming transfer for: ${incomingTransfer.filename} (${hash})`,
      );
      this.incomingTransfers.delete(hash);
    }

    // Cleanup pending offers
    if (this.pendingOffers.has(hash)) {
      const offer = this.pendingOffers.get(hash);
      console.log(`[FileTransferManager] Removing pending offer for: ${offer?.filename} (${hash})`);
      this.pendingOffers.delete(hash);
    }

    // Cleanup the accepted-offer consent record so it does not outlive the transfer.
    this.acceptedOffers.delete(hash);

    console.log(`[FileTransferManager] Cleanup complete for hash: ${hash}`);
  }

  private async attemptRecovery(
    hash: string,
    filename: string,
    direction: 'send' | 'receive',
    savedOutgoingTransfer?: FileTransferTask,
    savedIncomingTransfer?: FileTransferProgress,
  ): Promise<void> {
    try {
      await this.webRTCService.createPeerConnection();
      this.emit('connectionRecovered', { hash, filename, direction });

      if (direction === 'send' && savedOutgoingTransfer) {
        // Re-register the transfer and restart
        this.outgoingTransfers.set(hash, savedOutgoingTransfer);
        await this.startFileTransfer(savedOutgoingTransfer.file, savedOutgoingTransfer.hash);
      } else if (direction === 'receive' && savedIncomingTransfer) {
        // Notify the sender to resend the offer
        this.gmcpFileTransfer.sendRequestResend({
          sender: savedIncomingTransfer.sender,
          hash,
        });
      }
    } catch (error) {
      console.error('Failed to recover connection:', error);
      this.emit('recoveryFailed', {
        filename,
        direction,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private checkTransferTimeouts(): void {
    const now = Date.now();

    // Check incoming transfers
    this.incomingTransfers.forEach((transfer, hash) => {
      if (now - transfer.lastActivityTimestamp > this.transferTimeout) {
        this.handleTransferError(
          hash,
          transfer.filename,
          'receive',
          new FileTransferError(
            FileTransferErrorCodes.TRANSFER_TIMEOUT,
            'Transfer timeout - no data received',
          ),
        );
      }
    });

    // Check outgoing transfers
    this.outgoingTransfers.forEach((transfer, hash) => {
      if (now - transfer.lastActivityTimestamp > this.transferTimeout) {
        this.handleTransferError(
          hash,
          transfer.filename,
          'send',
          new FileTransferError(
            FileTransferErrorCodes.TRANSFER_TIMEOUT,
            'Transfer timeout - no activity',
          ),
        );
      }
    });
  }

  cleanup(): void {
    this.webRTCService.off('dataChannelMessage', this.handleDataChannelMessage);
    this.webRTCService.off('iceCandidate', this.handleLocalIceCandidate);
    this.gmcpFileTransfer.off('offer', this.handleFileTransferOffer);
    this.gmcpFileTransfer.off('accept', this.handleFileTransferAccepted);
    this.gmcpFileTransfer.off('reject', this.handleFileTransferRejected);
    this.gmcpFileTransfer.off('cancel', this.handleFileTransferCancelled);
    this.gmcpFileTransfer.off('candidate', this.handleRemoteIceCandidate);

    // Clear the interval
    if (this.transferTimeoutInterval) {
      clearInterval(this.transferTimeoutInterval);
      this.transferTimeoutInterval = undefined;
    }

    // Clean up any ongoing transfers
    [...this.outgoingTransfers.keys()].forEach((hash) => {
      this.cancelTransfer(hash);
    });
    [...this.incomingTransfers.keys()].forEach((hash) => {
      this.cancelTransfer(hash);
    });

    // Clear all maps
    this.incomingTransfers.clear();
    this.outgoingTransfers.clear();
    this.pendingOffers.clear();
    this.acceptedOffers.clear();

    // Clean up WebRTC service
    this.webRTCService.cleanup();

    // Close the store connection
    if (this.storeInitialized) {
      this.store.close();
      this.storeInitialized = false;
    }
  }

  cancelTransfer(hash: string): void {
    const transfer =
      this.outgoingTransfers.get(hash) ||
      this.incomingTransfers.get(hash) ||
      this.pendingOffers.get(hash);
    if (transfer) {
      console.log(
        `[FileTransferManager] Cancelling transfer for hash: ${hash} (${transfer.filename})`,
      );
      const recipient = this.getCancelRecipient(hash);
      // Clean up persisted data on user cancellation
      if (this.storeInitialized) {
        this.store
          .deleteFile(hash)
          .catch((err) =>
            console.error('[FileTransferManager] Failed to delete file from store:', err),
          );
      }
      this.emitCancellation(useSessionStore.getState().playerId, hash);
      this.gmcpFileTransfer.sendCancel({ recipient, hash });
    } else {
      console.log(`[FileTransferManager] No active transfer found for hash: ${hash}`);
    }
  }

  async acceptTransfer(sender: string, hash: string): Promise<void> {
    console.log('[FileTransferManager] Accepting transfer', sender, hash);

    // Check if we're already handling this transfer
    if (this.incomingTransfers.has(hash)) {
      throw new Error('Already receiving this file');
    }

    // Check if we have a valid offer
    const offer = this.pendingOffers.get(hash);
    console.log(
      '[FileTransferManager] Checking pending offers:',
      Array.from(this.pendingOffers.entries()),
    );
    if (!offer) {
      throw new FileTransferError(
        FileTransferErrorCodes.INVALID_FILE,
        `No pending offer found for transfer with hash: ${hash}`,
      );
    }
    console.log('[FileTransferManager] Found pending offer for transfer:', {
      sender,
      hash,
      filename: offer.filename,
      filesize: offer.filesize,
    });
    try {
      // Initialize WebRTC first
      await this.initializeWebRTC();
      this.webRTCService.recipient = sender;

      console.log('[FileTransferManager] Setting remote description with offer');
      await this.webRTCService.handleOffer(JSON.parse(offer.offerSdp));

      console.log('[FileTransferManager] Creating WebRTC answer');
      const answer = await this.webRTCService.createAnswer();
      console.log('[FileTransferManager] WebRTC answer created successfully');

      // Send accept only if we're still in a valid state
      if (this.pendingOffers.has(hash)) {
        await this.gmcpFileTransfer.sendAccept({
          sender,
          hash,
          filename: offer.filename,
          answerSdp: JSON.stringify(answer),
        });

        // Wait for the data channel to open
        await this.waitForDataChannel(hash);
        console.log('[FileTransferManager] Data channel ready for incoming transfer');

        // Record consent BEFORE deleting the offer: this is the only durable marker the
        // byte path can consult to know the user agreed to receive this exact file.
        this.acceptedOffers.set(hash, {
          filename: offer.filename,
          hash: offer.hash,
          sender: offer.sender,
          filesize: offer.filesize,
        });
        this.pendingOffers.delete(hash);
      } else {
        throw new Error('Transfer was cancelled during setup');
      }
    } catch (error) {
      console.error('Failed to accept transfer:', error);
      this.cleanupTransfer(hash);
      throw new FileTransferError(
        FileTransferErrorCodes.CONNECTION_FAILED,
        `Failed to accept transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  rejectTransfer(sender: string, hash: string): void {
    this.pendingOffers.delete(hash);
    this.acceptedOffers.delete(hash);
    this.gmcpFileTransfer.sendReject({ sender, hash });
  }

  private getCancelRecipient(hash: string): string {
    const outgoingTransfer = this.outgoingTransfers.get(hash);
    if (outgoingTransfer) return outgoingTransfer.recipient;

    const incomingTransfer = this.incomingTransfers.get(hash);
    if (incomingTransfer) return incomingTransfer.sender;

    const pendingOffer = this.pendingOffers.get(hash);
    return pendingOffer?.sender ?? useSessionStore.getState().playerId;
  }

  private emitCancellation(sender: string, hash: string): void {
    const outgoingTransfer = this.outgoingTransfers.get(hash);
    const incomingTransfer = this.incomingTransfers.get(hash);
    const pendingOffer = this.pendingOffers.get(hash);
    const filename =
      outgoingTransfer?.filename ??
      incomingTransfer?.filename ??
      pendingOffer?.filename ??
      'unknown';
    const direction: 'send' | 'receive' = outgoingTransfer ? 'send' : 'receive';

    this.cleanupTransfer(hash);
    this.emit('fileTransferCancelled', { sender, hash, filename, direction });
  }
}
