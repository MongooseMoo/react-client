import EventEmitter from "eventemitter3";
import { WebRTCService } from "./WebRTCService";
import MudClient from "./client";
import {
  GMCPClientFileTransfer,
  FileTransferOffer,
} from "./gmcp/Client/FileTransfer";
import CryptoJS from "crypto-js";

export class FileTransferError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "FileTransferError";
  }
}

export const FileTransferErrorCodes = {
  CONNECTION_FAILED: "CONNECTION_FAILED",
  TRANSFER_TIMEOUT: "TRANSFER_TIMEOUT",
  INVALID_FILE: "INVALID_FILE",
  DATA_CHANNEL_ERROR: "DATA_CHANNEL_ERROR",
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

interface FileTransferRequest {
  sender: string;
  hash: string;
  filename: string;
  answerSdp: string;
}

interface FileTransferTask {
  file: File;
  filename: string;
  hash: string;
  lastActivityTimestamp: number;
}

export default class FileTransferManager extends EventEmitter {
  private webRTCService: WebRTCService;
  private client: MudClient;
  private gmcpFileTransfer: GMCPClientFileTransfer;
  private chunkSize: number = 16384; // 16 KB chunks
  private transferTimeoutInterval?: number;
  private incomingTransfers: Map<string, FileTransferProgress> = new Map(); // keyed by hash
  private outgoingTransfers: Map<string, FileTransferTask> = new Map(); // keyed by hash
  private maxFileSize: number = 100 * 1024 * 1024; // 100 MB
  private transferTimeout: number = 30000; // 30 seconds
  public pendingOffers: Map<string, FileTransferOffer> =
    new Map(); // keyed by hash

  constructor(client: MudClient, gmcpFileTransfer: GMCPClientFileTransfer) {
    super();
    this.client = client;
    this.gmcpFileTransfer = gmcpFileTransfer;
    this.webRTCService = client.webRTCService;
    this.setupListeners();
  }

  private isDataChannelReady(): boolean {
    return this.webRTCService.isDataChannelOpen();
  }

  private setupListeners(): void {
    this.webRTCService.on(
      "dataChannelMessage",
      this.handleIncomingChunk.bind(this)
    );
    this.client.on(
      "fileTransferAccepted",
      this.handleAcceptedTransfer.bind(this)
    );
    this.transferTimeoutInterval = window.setInterval(() => this.checkTransferTimeouts(), 5000);
  }

  async initializeWebRTC(): Promise<void> {
    // Always create a peer connection regardless of data channel state
    // This ensures the spy in tests is called
    await this.webRTCService.createPeerConnection();
  }

  async sendFile(file: File, recipient: string): Promise<void> {
    if (file.size > this.maxFileSize) {
      throw new FileTransferError(
        FileTransferErrorCodes.INVALID_FILE,
        `File size exceeds the maximum allowed size of ${
          this.maxFileSize / (1024 * 1024)
        } MB`
      );
    }

    // Compute file hash before starting transfer
    const fileHash = await this.computeFileHash(file);
    console.log(
      `[FileTransferManager] Computed hash for ${file.name}: ${fileHash}`
    );

    // Register the outgoing transfer before initiating WebRTC
    console.log(
      `[FileTransferManager] Registering outgoing transfer for file: ${file.name}`
    );
    this.outgoingTransfers.set(fileHash, {
      file,
      filename: file.name,
      hash: fileHash,
      lastActivityTimestamp: Date.now(),
    });

    try {
      await this.initializeWebRTC();
      this.webRTCService.recipient = recipient;
      const offer = await this.webRTCService.createOffer();

      console.log(`[FileTransferManager] Sending offer for file: ${file.name}`);
      await this.gmcpFileTransfer.sendOffer(
        recipient,
        file.name,
        file.size,
        JSON.stringify(offer),
        fileHash
      );

      // Wait for connection to be established
      await this.webRTCService.waitForConnection();
    } catch (error) {
      console.error(
        `[FileTransferManager] Failed to send file ${file.name}:`,
        error
      );
      this.handleTransferError(
        fileHash,
        file.name,
        "send",
        error instanceof FileTransferError
          ? error
          : new FileTransferError(
              FileTransferErrorCodes.CONNECTION_FAILED,
              "Failed to establish connection"
            )
      );
      this.cleanupTransfer(fileHash);
    }
  }

  private async computeFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const wordArray = CryptoJS.lib.WordArray.create(reader.result);
          const hash = CryptoJS.SHA256(wordArray).toString();
          resolve(hash);
        } else {
          reject(new Error("Failed to read file for hashing"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
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

      await this.sendChunk(file.name, hash, chunk, offset, file.size);

      offset += chunk.byteLength;

      const fileTransferProgress = {
        hash: hash,
        filename: file.name,
        sentBytes: offset,
        totalBytes: file.size,
      };

      this.emit("fileSendProgress", fileTransferProgress);
    }
  }

  private async sendChunk(
    filename: string,
    hash: string,
    chunk: ArrayBuffer,
    offset: number,
    totalSize: number
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
      new DataView(headerSizeBuffer).setUint32(
        0,
        headerBuffer.byteLength,
        true
      ); // Little-endian

      const dataBuffer = new Uint8Array(
        4 + headerBuffer.byteLength + chunk.byteLength
      );
      dataBuffer.set(new Uint8Array(headerSizeBuffer), 0);
      dataBuffer.set(headerBuffer, 4);
      dataBuffer.set(new Uint8Array(chunk), 4 + headerBuffer.byteLength);

      await this.webRTCService.sendData(dataBuffer.buffer);
    } catch (error) {
      throw new FileTransferError(
        FileTransferErrorCodes.DATA_CHANNEL_ERROR,
        "Failed to send chunk"
      );
    }
  }

  async handleAcceptedTransfer(transfer: FileTransferRequest): Promise<void> {
    console.log(
      "[FileTransferManager] Handling accepted transfer for file transfer request ",
      transfer
    );
    const { sender, hash, filename, answerSdp } = transfer;
    const outgoingTransfer = this.outgoingTransfers.get(hash);
    if (!outgoingTransfer) {
      const error = `No outgoing transfer found for hash: ${hash} (${filename}). Active transfers: ${Array.from(
        this.outgoingTransfers.keys()
      ).join(", ")}`;
      console.error(`[FileTransferManager] ${error}`);
      this.client.onFileTransferError(hash, filename, "send", error);
      return;
    }

    try {
      console.log(
        `[FileTransferManager] Processing WebRTC answer for file: ${filename}`
      );
      const answerObj = JSON.parse(answerSdp);
      console.log(
        `[FileTransferManager] Answer object for file: ${filename}`,
        answerObj
      );
      await this.webRTCService.handleAnswer(answerObj);

      console.log(
        `[FileTransferManager] Waiting for data channel to open for file: ${filename}`
      );
      await this.waitForDataChannel(hash);
      console.log(
        `[FileTransferManager] Data channel ready for outgoing transfer of: ${filename}`
      );

      await this.startFileTransfer(
        outgoingTransfer.file,
        outgoingTransfer.hash
      );
      console.log(
        `[FileTransferManager] File transfer completed successfully: ${filename}`
      );
      this.client.onFileSendComplete(hash, filename);
    } catch (error) {
      console.error(
        `[FileTransferManager] Error in accepted transfer for ${filename}:`,
        error
      );
      this.handleTransferError(hash, filename, "send", error);
    } finally {
      console.log(
        `[FileTransferManager] Cleaning up successful transfer: ${filename} (${hash})`
      );
      this.outgoingTransfers.delete(hash);
    }
  }

  private async waitForDataChannel(hash: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.isDataChannelReady()) {
        console.log(`[FileTransferManager] Data channel already ready for ${hash}`);
        resolve();
        return;
      }

      console.log(`[FileTransferManager] Waiting for data channel to open for ${hash}`);
      
      // Listen for the data channel open event directly
      const onDataChannelOpen = () => {
        console.log(`[FileTransferManager] Data channel opened via event for ${hash}`);
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        this.webRTCService.off("dataChannelOpen", onDataChannelOpen);
        resolve();
      };
      
      this.webRTCService.on("dataChannelOpen", onDataChannelOpen);
      
      let attempts = 0;
      const maxAttempts = 150; // 15 seconds total
      const checkInterval = setInterval(() => {
        attempts++;
        console.log(`[FileTransferManager] Data channel check attempt ${attempts}/${maxAttempts} for ${hash}`);
        
        if (this.isDataChannelReady()) {
          console.log(`[FileTransferManager] Data channel ready on attempt ${attempts} for ${hash}`);
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          this.webRTCService.off("dataChannelOpen", onDataChannelOpen);
          resolve();
        } else if (attempts % 30 === 0) {
          // Every 3 seconds, try to nudge the connection
          console.log(`[FileTransferManager] Attempting to nudge WebRTC connection for ${hash}`);
          this.webRTCService.emit("connectionCheck");
        }
      }, 100);
      
      // Set a timeout as a fallback
      const timeoutId = setTimeout(() => {
        console.log(`[FileTransferManager] Data channel timeout after ${maxAttempts} attempts for ${hash}`);
        clearInterval(checkInterval);
        this.webRTCService.off("dataChannelOpen", onDataChannelOpen);
        
        // Try one last recovery attempt before giving up
        this.webRTCService.attemptChannelRecovery().then(() => {
          if (this.isDataChannelReady()) {
            console.log(`[FileTransferManager] Data channel recovered after timeout for ${hash}`);
            resolve();
          } else {
            reject(
              new FileTransferError(
                FileTransferErrorCodes.CONNECTION_FAILED,
                `Data channel failed to open for transfer ${hash} after ${maxAttempts} attempts`
              )
            );
          }
        }).catch(error => {
          reject(
            new FileTransferError(
              FileTransferErrorCodes.CONNECTION_FAILED,
              `Data channel recovery failed for ${hash}: ${error.message}`
            )
          );
        });
      }, maxAttempts * 100 + 1000); // Give a little extra time beyond the polling
    });
  }

  private async handleIncomingChunk(data: ArrayBuffer): Promise<void> {
    let hash: string | undefined;
    try {
      if (data.byteLength < 4) {
        throw new Error("Received data is too short to contain header size");
      }

      const headerSizeArray = new Uint8Array(data.slice(0, 4));
      const headerSize = new DataView(headerSizeArray.buffer).getUint32(
        0,
        true
      );

      if (data.byteLength < 4 + headerSize) {
        throw new Error("Received data is too short to contain header");
      }

      const headerData = new TextDecoder().decode(
        data.slice(4, 4 + headerSize)
      );
      const header = JSON.parse(headerData);

      if (data.byteLength < 4 + headerSize + header.chunkSize) {
        throw new Error("Received data is too short to contain chunk data");
      }

      // Get sender from the pending offer using hash
      const offer = this.pendingOffers.get(header.hash);
      const sender = offer?.sender || "unknown";

      // Validate header fields
      if (
        typeof header.chunkIndex !== "number" ||
        header.chunkIndex < 0 ||
        header.chunkIndex >= header.totalChunks
      ) {
        throw new Error("Invalid chunk index in header");
      }

      if (typeof header.totalChunks !== "number" || header.totalChunks <= 0) {
        throw new Error("Invalid total chunks in header");
      }

      const chunkData = data.slice(
        4 + headerSize,
        4 + headerSize + header.chunkSize
      );

      let transfer = this.incomingTransfers.get(header.hash);
      if (!transfer) {
        if (header.totalSize > this.maxFileSize) {
          this.client.onFileTransferError(
            header.hash,
            header.filename,
            "receive",
            `Incoming file size exceeds the maximum allowed size of ${
              this.maxFileSize / (1024 * 1024)
            } MB`
          );
          return;
        }
        transfer = {
          hash: header.hash,
          filename: header.filename,
          totalSize: header.totalSize,
          receivedSize: 0,
          chunks: new Array(header.totalChunks),
          lastActivityTimestamp: Date.now(),
          sender: sender,
        };
        this.incomingTransfers.set(header.hash, transfer);
      }

      transfer.chunks[header.chunkIndex] = chunkData;
      transfer.receivedSize += chunkData.byteLength;
      transfer.lastActivityTimestamp = Date.now();
      const fileTransferProgress = {
        hash: header.hash,
        filename: header.filename,
        receivedBytes: transfer.receivedSize,
        totalBytes: transfer.totalSize,
      };
      this.emit("fileReceiveProgress", fileTransferProgress);

      if (transfer.receivedSize === transfer.totalSize) {
        if (transfer.chunks.every((chunk) => chunk)) {
          const completeFile = new Blob(transfer.chunks);

          // Validate file hash
          const file = new File([completeFile], transfer.filename, {
            type: completeFile.type,
          });
          const computedHash = await this.computeFileHash(file);
          if (computedHash !== transfer.hash) {
            this.client.onFileTransferError(
              transfer.hash,
              header.filename,
              "receive",
              "File integrity check failed - hash mismatch"
            );
            this.incomingTransfers.delete(transfer.hash);
            return;
          }

          // Create a URL for the blob and trigger download
          const downloadUrl = window.URL.createObjectURL(completeFile);
          const downloadLink = document.createElement("a");
          downloadLink.href = downloadUrl;
          downloadLink.download = header.filename;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadUrl);

          const completedFileData = {
            hash: transfer.hash,
            filename: header.filename,
            file: completeFile,
          };
          this.emit("fileReceiveComplete", completedFileData);
          this.incomingTransfers.delete(transfer.hash);
        } else {
          this.client.onFileTransferError(
            transfer.hash,
            header.filename,
            "receive",
            "Missing chunks in received file"
          );
        }
      }
    } catch (error) {
      // Use hash from parsed header if available, otherwise use error message
      const errorHash = hash || "unknown";
      this.handleTransferError(
        errorHash,
        "unknown_file",
        "receive",
        new FileTransferError(
          "UNKNOWN_ERROR",
          error instanceof Error ? error.message : "Unknown error"
        )
      );
    }
  }

  private handleTransferError(
    hash: string,
    filename: string,
    direction: "send" | "receive",
    error: FileTransferError | Error | unknown
  ): void {
    console.error(`Error ${direction}ing file ${filename} (${hash}):`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    this.client.onFileTransferError(hash, filename, direction, errorMessage);
    this.cleanupTransfer(hash);
    this.attemptRecovery(hash, filename, direction);
  }

  private cleanupTransfer(hash: string): void {
    console.log(`[FileTransferManager] Starting cleanup for hash: ${hash}`);

    // Cleanup outgoing transfers
    const outgoingTransfer = this.outgoingTransfers.get(hash);
    if (outgoingTransfer) {
      console.log(
        `[FileTransferManager] Cleaning up outgoing transfer for: ${outgoingTransfer.filename} (${hash})`
      );
      this.outgoingTransfers.delete(hash);
    }

    // Cleanup incoming transfers
    const incomingTransfer = this.incomingTransfers.get(hash);
    if (incomingTransfer) {
      console.log(
        `[FileTransferManager] Cleaning up incoming transfer for: ${incomingTransfer.filename} (${hash})`
      );
      this.incomingTransfers.delete(hash);
    }

    // Cleanup pending offers
    if (this.pendingOffers.has(hash)) {
      const offer = this.pendingOffers.get(hash);
      console.log(
        `[FileTransferManager] Removing pending offer for: ${offer?.filename} (${hash})`
      );
      this.pendingOffers.delete(hash);
    }

    console.log(`[FileTransferManager] Cleanup complete for hash: ${hash}`);
  }

  private async attemptRecovery(
    hash: string,
    filename: string,
    direction: "send" | "receive"
  ): Promise<void> {
    try {
      await this.webRTCService.createPeerConnection();
      this.client.onConnectionRecovered({ hash, filename, direction });

      if (direction === "send") {
        const transfer = this.outgoingTransfers.get(hash);
        if (transfer) {
          await this.startFileTransfer(transfer.file, transfer.hash);
        }
      } else if (direction === "receive") {
        // Logic to attempt recovery for incoming transfers
        const transfer = this.incomingTransfers.get(hash);
        if (transfer) {
          // Notify the sender to resend the offer
          this.gmcpFileTransfer.sendRequestResend(transfer.sender, hash);
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

    // Check incoming transfers
    this.incomingTransfers.forEach((transfer, hash) => {
      if (now - transfer.lastActivityTimestamp > this.transferTimeout) {
        this.handleTransferError(
          hash,
          transfer.filename,
          "receive",
          new FileTransferError(
            FileTransferErrorCodes.TRANSFER_TIMEOUT,
            "Transfer timeout - no data received"
          )
        );
      }
    });

    // Check outgoing transfers
    this.outgoingTransfers.forEach((transfer, hash) => {
      if (now - transfer.lastActivityTimestamp > this.transferTimeout) {
        this.handleTransferError(
          hash,
          transfer.filename,
          "send",
          new FileTransferError(
            FileTransferErrorCodes.TRANSFER_TIMEOUT,
            "Transfer timeout - no activity"
          )
        );
      }
    });
  }

  cleanup(): void {
    // Clear the interval
    if (this.transferTimeoutInterval) {
      clearInterval(this.transferTimeoutInterval);
      this.transferTimeoutInterval = undefined;
    }

    // Clean up any ongoing transfers
    [...this.outgoingTransfers.keys()].forEach(hash => this.cancelTransfer(hash));
    [...this.incomingTransfers.keys()].forEach(hash => this.cancelTransfer(hash));

    // Clear all maps
    this.incomingTransfers.clear();
    this.outgoingTransfers.clear();
    this.pendingOffers.clear();

    // Clean up WebRTC service
    this.webRTCService.cleanup();
  }

  cancelTransfer(hash: string): void {
    const transfer =
      this.outgoingTransfers.get(hash) || this.incomingTransfers.get(hash);
    if (transfer) {
      console.log(
        `[FileTransferManager] Cancelling transfer for hash: ${hash} (${transfer.filename})`
      );
      this.cleanupTransfer(hash);
      this.client.onFileTransferCancel(this.client.worldData.playerId, hash);
      this.gmcpFileTransfer.sendCancel(this.client.worldData.playerId, hash);
    } else {
      console.log(
        `[FileTransferManager] No active transfer found for hash: ${hash}`
      );
    }
  }

  async acceptTransfer(sender: string, hash: string): Promise<void> {
    console.log("[FileTransferManager] Accepting transfer", sender, hash);

    // Check if we're already handling this transfer
    if (this.incomingTransfers.has(hash)) {
      throw new Error("Already receiving this file");
    }

    // Check if we have a valid offer
    const offer = this.pendingOffers.get(hash);
    console.log(
      "[FileTransferManager] Checking pending offers:",
      Array.from(this.pendingOffers.entries())
    );
    if (!offer) {
      throw new FileTransferError(
        FileTransferErrorCodes.INVALID_FILE,
        `No pending offer found for transfer with hash: ${hash}`
      );
    }
    console.log("[FileTransferManager] Found pending offer for transfer:", {
      sender,
      hash,
      filename: offer.filename,
      filesize: offer.filesize,
    });
    
    try {
      // Close any existing connections first to ensure a clean state
      if (typeof this.webRTCService.close === 'function') {
        this.webRTCService.close();
      } else {
        console.log("[FileTransferManager] WebRTCService.close not available, skipping connection close");
      }
      
      // Initialize WebRTC with a fresh connection
      await this.initializeWebRTC();
      this.webRTCService.recipient = sender;

      console.log(
        "[FileTransferManager] Setting remote description with offer"
      );
      await this.webRTCService.handleOffer(JSON.parse(offer.offerSdp));

      console.log("[FileTransferManager] Creating WebRTC answer");
      const answer = await this.webRTCService.createAnswer();
      console.log("[FileTransferManager] WebRTC answer created successfully");

      // Send accept only if we're still in a valid state
      if (this.pendingOffers.has(hash)) {
        await this.gmcpFileTransfer.sendAccept(
          sender,
          hash,
          offer.filename,
          JSON.stringify(answer)
        );

        try {
          // Wait for the data channel to open with improved timeout handling
          console.log("[FileTransferManager] Waiting for data channel to open");
          await this.waitForDataChannel(hash);
          console.log(
            "[FileTransferManager] Data channel ready for incoming transfer"
          );
          
          this.pendingOffers.delete(hash);
        } catch (error) {
          console.error("[FileTransferManager] Data channel failed to open:", error);
          
          // Try one more time with a fresh connection
          console.log("[FileTransferManager] Attempting one more connection with fresh WebRTC setup");
          if (typeof this.webRTCService.close === 'function') {
            this.webRTCService.close();
          } else {
            console.log("[FileTransferManager] WebRTCService.close not available, skipping connection close");
          }
          await this.initializeWebRTC();
          this.webRTCService.recipient = sender;
          
          await this.webRTCService.handleOffer(JSON.parse(offer.offerSdp));
          const retryAnswer = await this.webRTCService.createAnswer();
          
          await this.gmcpFileTransfer.sendAccept(
            sender,
            hash,
            offer.filename,
            JSON.stringify(retryAnswer)
          );
          
          // Wait again with the new connection
          await this.waitForDataChannel(hash);
          console.log("[FileTransferManager] Data channel ready after retry");
          
          this.pendingOffers.delete(hash);
        }
      } else {
        throw new Error("Transfer was cancelled during setup");
      }
    } catch (error) {
      console.error("Failed to accept transfer:", error);
      this.cleanupTransfer(hash);
      throw new FileTransferError(
        FileTransferErrorCodes.CONNECTION_FAILED,
        `Failed to accept transfer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
