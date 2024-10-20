import { WebRTCService } from "./WebRTCService";
import MudClient from "./client";
import * as CryptoJS from "crypto-js";
import { GMCPClientFileTransfer } from "./gmcp/Client/FileTransfer";

export class FileTransferError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "FileTransferError";
  }
}

export const FileTransferErrorCodes = {
  CONNECTION_FAILED: "CONNECTION_FAILED",
  TRANSFER_TIMEOUT: "TRANSFER_TIMEOUT",
  ENCRYPTION_FAILED: "ENCRYPTION_FAILED",
  INVALID_FILE: "INVALID_FILE",
  DATA_CHANNEL_ERROR: "DATA_CHANNEL_ERROR",
};

interface FileTransferProgress {
  filename: string;
  totalSize: number;
  receivedSize: number;
  chunks: ArrayBuffer[];
  lastActivityTimestamp: number;
  encryptionKey?: CryptoJS.lib.WordArray;
  isEncrypted: boolean;
}

export default class FileTransferManager {
  private webRTCService: WebRTCService;
  private client: MudClient;
  private gmcpFileTransfer: GMCPClientFileTransfer;
  private chunkSize: number = 16384; // 16 KB chunks
  private incomingTransfers: Map<string, FileTransferProgress> = new Map();
  private outgoingTransfers: Map<
    string,
    { file: File; timeout: NodeJS.Timeout }
  > = new Map();
  private maxFileSize: number = 100 * 1024 * 1024; // 100 MB
  private transferTimeout: number = 30000; // 30 seconds

  constructor(client: MudClient, gmcpFileTransfer: GMCPClientFileTransfer) {
    this.client = client;
    this.gmcpFileTransfer = gmcpFileTransfer;
    this.webRTCService = client.webRTCService;
    this.setupListeners();
  }

  private isDataChannelReady(): boolean {
    return this.webRTCService.isDataChannelOpen();
  }

  private setupListeners(): void {
    this.client.on("dataChannelMessage", this.handleIncomingChunk.bind(this));
    setInterval(() => this.checkTransferTimeouts(), 5000);
  }

  async sendFile(
    file: File,
    recipient: string,
    encryptionKey?: CryptoJS.lib.WordArray
  ): Promise<void> {
    if (file.size > this.maxFileSize) {
      throw new FileTransferError(
        FileTransferErrorCodes.INVALID_FILE,
        `File size exceeds the maximum allowed size of ${
          this.maxFileSize / (1024 * 1024)
        } MB`
      );
    }

    try {
      await this.client.initializeWebRTC();
      const offer = await this.webRTCService.createOffer();

      await this.gmcpFileTransfer.sendOffer(
        recipient,
        file.name,
        file.size,
        JSON.stringify(offer)
      );

      const transferTimeout = setTimeout(() => {
        this.handleTransferError(
          file.name,
          "send",
          new FileTransferError(
            FileTransferErrorCodes.TRANSFER_TIMEOUT,
            "Transfer timeout"
          )
        );
      }, this.transferTimeout);

      this.outgoingTransfers.set(file.name, { file, timeout: transferTimeout });

      // Generate a random encryption key
      const encryptionKey = CryptoJS.lib.WordArray.random(256 / 8);

      await this.startFileTransfer(file, encryptionKey);

      clearTimeout(transferTimeout);
      this.outgoingTransfers.delete(file.name);
      this.client.onFileSendComplete(file.name);
    } catch (error) {
      if (error instanceof FileTransferError) {
        this.handleTransferError(file.name, "send", error);
      } else {
        this.handleTransferError(
          file.name,
          "send",
          new FileTransferError(
            FileTransferErrorCodes.CONNECTION_FAILED,
            "Failed to establish connection"
          )
        );
      }
      this.cleanupTransfer(file.name);
    }
  }

  private async startFileTransfer(
    file: File,
    encryptionKey?: CryptoJS.lib.WordArray
  ): Promise<void> {
    const fileReader = new FileReader();
    let offset = 0;

    const readNextChunk = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const slice = file.slice(offset, offset + this.chunkSize);
        fileReader.onload = (e) => {
          if (e.target?.result instanceof ArrayBuffer) {
            const chunkSize = e.target.result.byteLength;
            this.sendChunk(
              file.name,
              e.target.result,
              offset,
              file.size,
              encryptionKey
            )
              .then(() => {
                offset += chunkSize;
                this.client.onFileSendProgress({
                  filename: file.name,
                  sentBytes: offset,
                  totalBytes: file.size,
                });

                if (offset < file.size) {
                  resolve(readNextChunk());
                } else {
                  resolve();
                }
              })
              .catch(reject);
          } else {
            reject(
              new FileTransferError(
                FileTransferErrorCodes.INVALID_FILE,
                "Failed to read file chunk"
              )
            );
          }
        };
        fileReader.onerror = () =>
          reject(
            new FileTransferError(
              FileTransferErrorCodes.INVALID_FILE,
              "Error reading file"
            )
          );
        fileReader.readAsArrayBuffer(slice);
      });
    };

    await readNextChunk();
  }

  private async sendChunk(
    filename: string,
    chunk: ArrayBuffer,
    offset: number,
    totalSize: number,
    encryptionKey?: CryptoJS.lib.WordArray
  ): Promise<void> {
    try {
      let processedChunk: string;
      const isEncrypted = !!encryptionKey;

      if (isEncrypted) {
        processedChunk = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(chunk),
          encryptionKey
        ).toString();
      } else {
        processedChunk = new TextDecoder().decode(chunk);
      }

      const header = new TextEncoder().encode(
        JSON.stringify({
          filename,
          chunkIndex: offset / this.chunkSize,
          totalChunks: Math.ceil(totalSize / this.chunkSize),
          chunkSize: processedChunk.length,
          totalSize,
          encryptionKey: encryptionKey?.toString(),
          isEncrypted,
        })
      );

      const headerSize = new Uint32Array([header.byteLength]);
      const data = new Uint8Array(
        4 + header.byteLength + processedChunk.length
      );
      data.set(new Uint8Array(headerSize.buffer), 0);
      data.set(header, 4);
      data.set(new TextEncoder().encode(processedChunk), 4 + header.byteLength);

      await this.webRTCService.sendData(data.buffer);
    } catch (error) {
      throw new FileTransferError(
        FileTransferErrorCodes.DATA_CHANNEL_ERROR,
        "Failed to send chunk"
      );
    }
  }

  async handleAcceptedTransfer(
    filename: string,
    answerSdp: string
  ): Promise<void> {
    const outgoingTransfer = this.outgoingTransfers.get(filename);
    if (!outgoingTransfer) {
      this.client.onFileTransferError(
        filename,
        "send",
        "No outgoing transfer found for file"
      );
      return;
    }

    await this.client.webRTCService.handleAnswer(JSON.parse(answerSdp));
    
    // Wait for the data channel to open
    await this.waitForDataChannel();
    console.log("Data channel ready for outgoing transfer");

    if (outgoingTransfer) {
      await this.startFileTransfer(
        outgoingTransfer.file,
        CryptoJS.lib.WordArray.random(256 / 8)
      );
    }
  }

  private async waitForDataChannel(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.isDataChannelReady()) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (this.isDataChannelReady()) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });
  }

  // This function has been removed as it was a duplicate

  private handleIncomingChunk(data: ArrayBuffer): void {
    try {
      const headerSize = new Uint32Array(data.slice(0, 4))[0];
      const headerData = new TextDecoder().decode(
        data.slice(4, 4 + headerSize)
      );
      const header = JSON.parse(headerData);
      const encryptedChunk = new TextDecoder().decode(
        data.slice(4 + headerSize)
      );

      let transfer = this.incomingTransfers.get(header.filename);
      if (!transfer) {
        if (header.totalSize > this.maxFileSize) {
          this.client.onFileTransferError(
            header.filename,
            "receive",
            `Incoming file size exceeds the maximum allowed size of ${
              this.maxFileSize / (1024 * 1024)
            } MB`
          );
          return;
        }
        transfer = {
          filename: header.filename,
          totalSize: header.totalSize,
          receivedSize: 0,
          chunks: new Array(header.totalChunks),
          lastActivityTimestamp: Date.now(),
          encryptionKey: header.encryptionKey
            ? CryptoJS.enc.Hex.parse(header.encryptionKey)
            : undefined,
          isEncrypted: header.isEncrypted,
        };
        this.incomingTransfers.set(header.filename, transfer);
      }

      let chunkArrayBuffer: ArrayBuffer;
      if (header.isEncrypted) {
        const decryptedChunk = CryptoJS.AES.decrypt(
          encryptedChunk,
          transfer.encryptionKey as CryptoJS.lib.WordArray
        ).toString(CryptoJS.enc.Utf8);
        chunkArrayBuffer = new TextEncoder().encode(decryptedChunk).buffer;
      } else {
        chunkArrayBuffer = new TextEncoder().encode(encryptedChunk).buffer;
      }

      transfer.chunks[header.chunkIndex] = chunkArrayBuffer;
      transfer.receivedSize += chunkArrayBuffer.byteLength;
      transfer.lastActivityTimestamp = Date.now();

      this.client.onFileReceiveProgress({
        filename: header.filename,
        receivedBytes: transfer.receivedSize,
        totalBytes: transfer.totalSize,
      });

      if (transfer.receivedSize === transfer.totalSize) {
        const completeFile = new Blob(transfer.chunks);
        this.client.onFileReceiveComplete({
          filename: header.filename,
          file: completeFile,
        });
        this.incomingTransfers.delete(header.filename);
      }
    } catch (error) {
      this.handleTransferError(
        error instanceof Error ? error.message : "Unknown error",
        "receive",
        new FileTransferError("UNKNOWN_ERROR", "An unknown error occurred")
      );
    }
  }

  private handleTransferError(
    filename: string,
    direction: "send" | "receive",
    error: FileTransferError | Error | unknown
  ): void {
    console.error(`Error ${direction}ing file ${filename}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    this.client.onFileTransferError(filename, direction, errorMessage);
    this.cleanupTransfer(filename);
    this.attemptRecovery(filename, direction);
  }

  private cleanupTransfer(filename: string): void {
    const transfer = this.outgoingTransfers.get(filename);
    if (transfer) {
      clearTimeout(transfer.timeout);
      this.outgoingTransfers.delete(filename);
    }
    this.incomingTransfers.delete(filename);
  }

  private async attemptRecovery(
    filename: string,
    direction: "send" | "receive"
  ): Promise<void> {
    try {
      await this.webRTCService.createPeerConnection();
      this.client.onConnectionRecovered({ filename, direction });

      if (direction === "send") {
        const transfer = this.outgoingTransfers.get(filename);
        if (transfer) {
          await this.startFileTransfer(
            transfer.file,
            CryptoJS.lib.WordArray.random(256 / 8)
          );
        }
      }
    } catch (error) {
      console.error("Failed to recover connection:", error);
      this.client.onRecoveryFailed({
        filename,
        direction,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private checkTransferTimeouts(): void {
    const now = Date.now();
    this.incomingTransfers.forEach((transfer, filename) => {
      if (now - transfer.lastActivityTimestamp > this.transferTimeout) {
        this.handleTransferError(
          filename,
          "receive",
          new FileTransferError(
            FileTransferErrorCodes.TRANSFER_TIMEOUT,
            "Transfer timeout"
          )
        );
      }
    });
  }

  cancelTransfer(filename: string): void {
    const outgoingTransfer = this.outgoingTransfers.get(filename);
    if (outgoingTransfer) {
      this.cleanupTransfer(filename);
      this.client.onFileTransferCancel(
        this.client.worldData.playerId,
        filename
      );
      this.gmcpFileTransfer.sendCancel(
        this.client.worldData.playerId,
        filename
      );
    }

    if (this.incomingTransfers.has(filename)) {
      this.cleanupTransfer(filename);
      this.client.onFileTransferCancel(
        this.client.worldData.playerId,
        filename
      );
      this.gmcpFileTransfer.sendCancel(
        this.client.worldData.playerId,
        filename
      );
    }
  }

  async acceptTransfer(sender: string, filename: string): Promise<void> {
    console.log("Accepting transfer", sender, filename);
    try {
      // First, ensure we have a peer connection
      if (!this.webRTCService.isPeerConnectionInitialized()) {
        console.log('[FileTransferManager] Creating new peer connection');
        await this.webRTCService.createPeerConnection();
      }

      // Check if we have a remote offer
      if (!this.webRTCService.hasRemoteOffer()) {
        console.log('[FileTransferManager] Waiting for remote offer');
        await this.webRTCService.waitForRemoteOffer();
      }

      // Now create the answer
      console.log('[FileTransferManager] Creating WebRTC answer');
      const answer = await this.webRTCService.createAnswer();
      console.log('[FileTransferManager] WebRTC answer created successfully');

      // Send the accept message with the answer
      await this.gmcpFileTransfer.sendAccept(
        sender,
        filename,
        JSON.stringify(answer)
      );
      this.client.onFileTransferAccept(
        sender,
        filename,
        JSON.stringify(answer)
      );
      
      // Wait for the data channel to open
      await this.waitForDataChannel();
      console.log("Data channel ready for incoming transfer");
    } catch (error) {
      console.error("Failed to accept transfer:", error);
      this.handleTransferError(
        filename,
        "receive",
        new FileTransferError(
          FileTransferErrorCodes.CONNECTION_FAILED,
          `Failed to accept transfer: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  }
}
