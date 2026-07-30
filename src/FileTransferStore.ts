import {
  openIndexedDatabase,
  requestToPromise,
  transactionDone,
  type IndexedDatabaseSchema,
} from "./persistence";

export interface FileChunk {
  hash: string;
  index: number;
  data: ArrayBuffer;
}

export interface FileMetadata {
  hash: string;
  filename: string;
  totalSize: number;
  totalChunks: number;
  receivedChunks: number[];
  direction: 'incoming' | 'outgoing';
  sender?: string;
  recipient?: string;
  lastActivityTimestamp: number;
  mimeType?: string;
}

const fileTransferDatabaseSchema: IndexedDatabaseSchema = {
  name: "file-transfer-store",
  version: 1,
  upgrade: (database) => {
    if (!database.objectStoreNames.contains("chunks")) {
      const chunkStore = database.createObjectStore("chunks", {
        keyPath: ["hash", "index"],
      });
      chunkStore.createIndex("hash", "hash", { unique: false });
    }

    if (!database.objectStoreNames.contains("metadata")) {
      const metadataStore = database.createObjectStore("metadata", {
        keyPath: "hash",
      });
      metadataStore.createIndex("direction", "direction", { unique: false });
    }
  },
};

export class FileTransferStore {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await openIndexedDatabase(fileTransferDatabaseSchema);
  }

  async saveChunk(chunk: FileChunk): Promise<void> {
    if (!this.db) await this.initialize();

    const tx = this.db!.transaction(['chunks', 'metadata'], 'readwrite');
    const done = transactionDone(tx);
    await requestToPromise(tx.objectStore('chunks').put(chunk));

    const metadata = await requestToPromise<FileMetadata | undefined>(
      tx.objectStore('metadata').get(chunk.hash),
    );
    if (metadata) {
      if (!metadata.receivedChunks.includes(chunk.index)) {
        await requestToPromise(
          tx.objectStore('metadata').put({
            ...metadata,
            receivedChunks: [...metadata.receivedChunks, chunk.index],
            lastActivityTimestamp: Date.now(),
          }),
        );
      }
    }
    await done;
  }

  async getChunk(hash: string, index: number): Promise<FileChunk | undefined> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('chunks', 'readonly');
    const done = transactionDone(tx);
    const chunk = await requestToPromise<FileChunk | undefined>(
      tx.objectStore('chunks').get([hash, index]),
    );
    await done;
    return chunk;
  }

  async getAllChunks(hash: string): Promise<FileChunk[]> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('chunks', 'readonly');
    const done = transactionDone(tx);
    const chunks = await requestToPromise<FileChunk[]>(
      tx.objectStore('chunks').index('hash').getAll(hash),
    );
    await done;
    return chunks;
  }

  async saveFileMetadata(metadata: FileMetadata): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('metadata', 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore('metadata').put(metadata);
    await done;
  }

  async updateFileMetadata(metadata: FileMetadata): Promise<void> {
    await this.saveFileMetadata(metadata);
  }

  async getFileMetadata(hash: string): Promise<FileMetadata | undefined> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('metadata', 'readonly');
    const done = transactionDone(tx);
    const metadata = await requestToPromise<FileMetadata | undefined>(
      tx.objectStore('metadata').get(hash),
    );
    await done;
    return metadata;
  }

  async getAllFileMetadata(): Promise<FileMetadata[]> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('metadata', 'readonly');
    const done = transactionDone(tx);
    const metadata = await requestToPromise<FileMetadata[]>(
      tx.objectStore('metadata').getAll(),
    );
    await done;
    return metadata;
  }

  async getIncompleteTransfers(direction: 'incoming' | 'outgoing'): Promise<FileMetadata[]> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('metadata', 'readonly');
    const done = transactionDone(tx);
    const allMetadata = await requestToPromise<FileMetadata[]>(
      tx.objectStore('metadata').index('direction').getAll(direction),
    );
    await done;
    return allMetadata.filter(metadata =>
      metadata.receivedChunks.length < metadata.totalChunks
    );
  }

  async deleteFile(hash: string): Promise<void> {
    if (!this.db) await this.initialize();

    // Delete all chunks
    const tx = this.db!.transaction(['chunks', 'metadata'], 'readwrite');
    const done = transactionDone(tx);
    const chunks = await requestToPromise<FileChunk[]>(
      tx.objectStore('chunks').index('hash').getAll(hash),
    );

    for (const chunk of chunks) {
      tx.objectStore('chunks').delete([hash, chunk.index]);
    }

    // Delete metadata
    tx.objectStore('metadata').delete(hash);
    await done;
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();

    const tx = this.db!.transaction(['chunks', 'metadata'], 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore('chunks').clear();
    tx.objectStore('metadata').clear();
    await done;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Helper method to reconstruct a file from chunks
  async reconstructFile(hash: string): Promise<Blob | null> {
    const metadata = await this.getFileMetadata(hash);
    if (!metadata) return null;
    
    const chunks = await this.getAllChunks(hash);
    if (chunks.length !== metadata.totalChunks) return null;
    
    // Sort chunks by index
    chunks.sort((a, b) => a.index - b.index);
    
    // Create a blob from all chunks
    return new Blob(
      chunks.map(chunk => chunk.data),
      { type: metadata.mimeType || 'application/octet-stream' }
    );
  }

  // Check if a file transfer is complete
  async isTransferComplete(hash: string): Promise<boolean> {
    const metadata = await this.getFileMetadata(hash);
    if (!metadata) return false;
    
    return metadata.receivedChunks.length === metadata.totalChunks;
  }
}
