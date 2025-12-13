import { openDB, IDBPDatabase } from 'idb';

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

export class FileTransferStore {
  private db: IDBPDatabase | null = null;
  private dbName = 'file-transfer-store';
  private dbVersion = 1;

  async initialize(): Promise<void> {
    this.db = await openDB(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: ['hash', 'index'] });
          chunkStore.createIndex('hash', 'hash', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('metadata')) {
          const metadataStore = db.createObjectStore('metadata', { keyPath: 'hash' });
          metadataStore.createIndex('direction', 'direction', { unique: false });
        }
      }
    });
  }

  async saveChunk(chunk: FileChunk): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('chunks', chunk);
    
    // Update metadata to track received chunks
    const metadata = await this.getFileMetadata(chunk.hash);
    if (metadata) {
      if (!metadata.receivedChunks.includes(chunk.index)) {
        metadata.receivedChunks.push(chunk.index);
        metadata.lastActivityTimestamp = Date.now();
        await this.updateFileMetadata(metadata);
      }
    }
  }

  async getChunk(hash: string, index: number): Promise<FileChunk | undefined> {
    if (!this.db) await this.initialize();
    return this.db!.get('chunks', [hash, index]);
  }

  async getAllChunks(hash: string): Promise<FileChunk[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAllFromIndex('chunks', 'hash', hash);
  }

  async saveFileMetadata(metadata: FileMetadata): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('metadata', metadata);
  }

  async updateFileMetadata(metadata: FileMetadata): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('metadata', metadata);
  }

  async getFileMetadata(hash: string): Promise<FileMetadata | undefined> {
    if (!this.db) await this.initialize();
    return this.db!.get('metadata', hash);
  }

  async getAllFileMetadata(): Promise<FileMetadata[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAll('metadata');
  }

  async getIncompleteTransfers(direction: 'incoming' | 'outgoing'): Promise<FileMetadata[]> {
    if (!this.db) await this.initialize();
    const allMetadata = await this.db!.getAllFromIndex('metadata', 'direction', direction);
    return allMetadata.filter(metadata => 
      metadata.receivedChunks.length < metadata.totalChunks
    );
  }

  async deleteFile(hash: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    // Delete all chunks
    const tx = this.db!.transaction(['chunks', 'metadata'], 'readwrite');
    const chunks = await tx.objectStore('chunks').getAllFromIndex('hash', hash);
    
    for (const chunk of chunks) {
      await tx.objectStore('chunks').delete([hash, chunk.index]);
    }
    
    // Delete metadata
    await tx.objectStore('metadata').delete(hash);
    await tx.done;
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction(['chunks', 'metadata'], 'readwrite');
    await tx.objectStore('chunks').clear();
    await tx.objectStore('metadata').clear();
    await tx.done;
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
