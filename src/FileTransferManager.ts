import { WebRTCService } from './WebRTCService';
import MudClient from './client';

interface FileTransferProgress {
  filename: string;
  totalSize: number;
  receivedSize: number;
  chunks: ArrayBuffer[];
}

export class FileTransferManager {
  private webRTCService: WebRTCService;
  private client: MudClient;
  private chunkSize: number = 16384; // 16 KB chunks
  private incomingTransfers: Map<string, FileTransferProgress> = new Map();

  constructor(client: MudClient, webRTCService: WebRTCService) {
    this.client = client;
    this.webRTCService = webRTCService;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.client.on('dataChannelMessage', (data: ArrayBuffer) => {
      this.handleIncomingChunk(data);
    });
  }

  async sendFile(file: File): Promise<void> {
    const fileReader = new FileReader();
    let offset = 0;

    const readNextChunk = () => {
      const slice = file.slice(offset, offset + this.chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };

    fileReader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        const chunk = e.target.result;
        const header = new TextEncoder().encode(JSON.stringify({
          filename: file.name,
          chunkIndex: offset / this.chunkSize,
          totalChunks: Math.ceil(file.size / this.chunkSize),
          chunkSize: chunk.byteLength,
          totalSize: file.size
        }));

        const headerSize = new Uint32Array([header.byteLength]);
        const data = new Uint8Array(4 + header.byteLength + chunk.byteLength);
        data.set(new Uint8Array(headerSize.buffer), 0);
        data.set(header, 4);
        data.set(new Uint8Array(chunk), 4 + header.byteLength);

        this.webRTCService.sendData(data.buffer);

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
        }
      }
    };

    readNextChunk();
  }

  private handleIncomingChunk(data: ArrayBuffer): void {
    const headerSize = new Uint32Array(data.slice(0, 4))[0];
    const headerData = new TextDecoder().decode(data.slice(4, 4 + headerSize));
    const header = JSON.parse(headerData);
    const chunk = data.slice(4 + headerSize);

    let transfer = this.incomingTransfers.get(header.filename);
    if (!transfer) {
      transfer = {
        filename: header.filename,
        totalSize: header.totalSize,
        receivedSize: 0,
        chunks: new Array(header.totalChunks)
      };
      this.incomingTransfers.set(header.filename, transfer);
    }

    transfer.chunks[header.chunkIndex] = chunk;
    transfer.receivedSize += chunk.byteLength;

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
  }
}
