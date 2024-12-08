import { WebRTCService } from "./WebRTCService";
import MudClient from "./client";
import { GMCPClientFileTransfer, GMCPMessageClientFileTransferOffer } from "./gmcp/Client/FileTransfer";

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
  filename: string;
  totalSize: number;
  receivedSize: number;
  chunks: ArrayBuffer[];
  lastActivityTimestamp: number;
  sender: string;
}

interface FileTransferRequest {
  sender: string;
  filename: string;
  answerSdp: string;
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
  public pendingOffers: Map<
    string,
    GMCPMessageClientFileTransferOffer
  > = new Map();

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
    this.client.on(
      "fileTransferAccepted",
      this.handleAcceptedTransfer.bind(this)
    );
    setInterval(() => this.checkTransferTimeouts(), 5000);
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

    // Register the outgoing transfer before initiating WebRTC
    console.log(`[FileTransferManager] Registering outgoing transfer for file: ${file.name}`);
    this.outgoingTransfers.set(file.name, {
      file,
      timeout: setTimeout(() => {
        console.warn(`[FileTransferManager] Timeout for file: ${file.name}`);
        this.handleTransferError(
          file.name,
          "send",
          new FileTransferError(
            FileTransferErrorCodes.TRANSFER_TIMEOUT,
            "Transfer offer timeout"
          )
        );
        this.cleanupTransfer(file.name);
      }, this.transferTimeout),
    });

    try {
      await this.client.initializeWebRTC();
      this.webRTCService.recipient = recipient;
      const offer = await this.webRTCService.createOffer();

      console.log(`[FileTransferManager] Sending offer for file: ${file.name}`);
      await this.gmcpFileTransfer.sendOffer(
        recipient,
        file.name,
        file.size,
        JSON.stringify(offer)
      );

      // Wait for connection to be established
      await this.webRTCService.waitForConnection();
    } catch (error) {
      console.error(`[FileTransferManager] Failed to send file ${file.name}:`, error);
      this.handleTransferError(
        file.name,
        "send",
        error instanceof FileTransferError
          ? error
          : new FileTransferError(
              FileTransferErrorCodes.CONNECTION_FAILED,
              "Failed to establish connection"
            )
      );
      this.cleanupTransfer(file.name);
    }
  }

  private async startFileTransfer(file: File): Promise<void> {
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

      await this.sendChunk(file.name, chunk, offset, file.size);

      offset += chunk.byteLength;

      this.client.onFileSendProgress({
        filename: file.name,
        sentBytes: offset,
        totalBytes: file.size,
      });
    }
  }

  private async sendChunk(
    filename: string,
    chunk: ArrayBuffer,
    offset: number,
    totalSize: number
  ): Promise<void> {
    try {
      const header = {
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
    console.log("[FileTransferManager] Handling accepted transfer for file transfer request ", transfer);
    const { sender, filename, answerSdp } = transfer;
    const outgoingTransfer = this.outgoingTransfers.get(filename);
    if (!outgoingTransfer) {
      const error = `No outgoing transfer found for file: ${filename}. Active transfers: ${Array.from(this.outgoingTransfers.keys()).join(', ')}`;
      console.error(`[FileTransferManager] ${error}`);
      this.client.onFileTransferError(filename, "send", error);
      return;
    }

    try {
      console.log(`[FileTransferManager] Processing WebRTC answer for file: ${filename}`);
      const answerObj = JSON.parse(answerSdp);
      console.log(`[FileTransferManager] Answer object for file: ${filename}`, answerObj);
      await this.client.webRTCService.handleAnswer(answerObj);

      console.log(`[FileTransferManager] Waiting for data channel to open for file: ${filename}`);
      await this.waitForDataChannel();
      console.log(`[FileTransferManager] Data channel ready for outgoing transfer of: ${filename}`);

      await this.startFileTransfer(outgoingTransfer.file);
      console.log(`[FileTransferManager] File transfer completed successfully: ${filename}`);
      this.client.onFileSendComplete(filename);
    } catch (error) {
      console.error(`[FileTransferManager] Error in accepted transfer for ${filename}:`, error);
      this.handleTransferError(filename, "send", error);
    } finally {
      console.log(`[FileTransferManager] Cleaning up successful transfer: ${filename}`);
      clearTimeout(outgoingTransfer.timeout);
      this.outgoingTransfers.delete(filename);
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

  private handleIncomingChunk(data: ArrayBuffer): void {
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

      // Extract sender from the transfer key in pendingOffers
      const sender =
        Array.from(this.pendingOffers.entries()).find(
          ([_, offer]) => offer.filename === header.filename
        )?.[1]?.sender || "unknown";

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
          sender: sender,
        };
        this.incomingTransfers.set(header.filename, transfer);
      }

      transfer.chunks[header.chunkIndex] = chunkData;
      transfer.receivedSize += chunkData.byteLength;
      transfer.lastActivityTimestamp = Date.now();

      this.client.onFileReceiveProgress({
        filename: header.filename,
        receivedBytes: transfer.receivedSize,
        totalBytes: transfer.totalSize,
      });

      if (transfer.receivedSize === transfer.totalSize) {
        if (transfer.chunks.every((chunk) => chunk)) {
          const completeFile = new Blob(transfer.chunks);
          // Create a URL for the blob and trigger download
          const downloadUrl = window.URL.createObjectURL(completeFile);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          downloadLink.download = header.filename;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadUrl);

          this.client.onFileReceiveComplete({
            filename: header.filename,
            file: completeFile,
          });
          this.incomingTransfers.delete(header.filename);
        } else {
          this.client.onFileTransferError(
            header.filename,
            "receive",
            "Missing chunks in received file"
          );
        }
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
    console.log(`[FileTransferManager] Starting cleanup for file: ${filename}`);
    
    // Cleanup outgoing transfers
    const transfer = this.outgoingTransfers.get(filename);
    if (transfer) {
      console.log(`[FileTransferManager] Cleaning up outgoing transfer for: ${filename}`);
      clearTimeout(transfer.timeout);
      this.outgoingTransfers.delete(filename);
    }

    // Cleanup incoming transfers
    if (this.incomingTransfers.has(filename)) {
      console.log(`[FileTransferManager] Cleaning up incoming transfer for: ${filename}`);
      this.incomingTransfers.delete(filename);
    }

    // Cleanup pending offers
    let offersRemoved = 0;
    for (const [key, offer] of this.pendingOffers.entries()) {
      if (offer.filename === filename) {
        console.log(`[FileTransferManager] Removing pending offer for: ${filename}`);
        this.pendingOffers.delete(key);
        offersRemoved++;
      }
    }

    console.log(`[FileTransferManager] Cleanup complete for ${filename}. Removed ${offersRemoved} pending offers`);
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
          await this.startFileTransfer(transfer.file);
        }
      } else if (direction === "receive") {
        // Logic to attempt recovery for incoming transfers
        const transfer = this.incomingTransfers.get(filename);
        if (transfer) {
          // Notify the sender to resend the offer
          this.client.gmcp_fileTransfer.sendRequestResend(
            transfer.sender,
            filename
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
    console.log("[FileTransferManager] Accepting transfer", sender, filename);

    // Check if we're already handling this transfer
    if (this.incomingTransfers.has(filename)) {
      throw new Error("Already receiving this file");
    }

    // Check if we have a valid offer
    const offer = this.pendingOffers.get(`${sender}-${filename}`);
    if (!offer) {
      throw new Error("No pending offer found for this transfer");
    }
    console.log("[FileTransferManager] Found pending offer for transfer", offer);
    try {
      // Initialize WebRTC first
      await this.client.initializeWebRTC();
      this.webRTCService.recipient = sender;

      console.log("[FileTransferManager] Setting remote description with offer");
      await this.webRTCService.handleOffer(JSON.parse(offer.offerSdp));

      console.log("[FileTransferManager] Creating WebRTC answer");
      const answer = await this.webRTCService.createAnswer();
      console.log("[FileTransferManager] WebRTC answer created successfully");

      // Send accept only if we're still in a valid state
      if (this.pendingOffers.has(`${sender}-${filename}`)) {
        await this.gmcpFileTransfer.sendAccept(
          sender,
          filename,
          JSON.stringify(answer)
        );

        // Wait for the data channel to open
        await this.waitForDataChannel();
        console.log("[FileTransferManager] Data channel ready for incoming transfer");

        this.pendingOffers.delete(`${sender}-${filename}`);
      } else {
        throw new Error("Transfer was cancelled during setup");
      }
    } catch (error) {
      console.error("Failed to accept transfer:", error);
      this.cleanupTransfer(filename);
      throw new FileTransferError(
        FileTransferErrorCodes.CONNECTION_FAILED,
        `Failed to accept transfer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
