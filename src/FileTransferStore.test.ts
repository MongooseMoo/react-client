import 'fake-indexeddb/auto';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FileTransferStore } from './FileTransferStore';

describe('FileTransferStore', () => {
  let store: FileTransferStore;

  beforeEach(async () => {
    store = new FileTransferStore();
    await store.initialize();
    await store.clearAll();
  });

  afterEach(async () => {
    await store.clearAll();
    await store.close();
  });

  it('atomically records every concurrently saved chunk in the file metadata', async () => {
    const totalChunks = 16;
    await store.saveFileMetadata({
      hash: 'concurrent-file',
      filename: 'concurrent.bin',
      totalSize: totalChunks,
      totalChunks,
      receivedChunks: [],
      direction: 'incoming',
      sender: 'Bob',
      lastActivityTimestamp: 0,
    });

    await Promise.all(
      Array.from({ length: totalChunks }, (_, index) =>
        store.saveChunk({
          hash: 'concurrent-file',
          index,
          data: Uint8Array.of(index).buffer,
        }),
      ),
    );

    const metadata = await store.getFileMetadata('concurrent-file');
    expect(metadata?.receivedChunks.toSorted((a, b) => a - b)).toEqual(
      Array.from({ length: totalChunks }, (_, index) => index),
    );
    await expect(store.isTransferComplete('concurrent-file')).resolves.toBe(true);
  });
});
