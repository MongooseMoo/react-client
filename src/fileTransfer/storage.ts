import {
  openIndexedDatabase,
  requestToPromise,
  transactionDone,
  type IndexedDatabaseSchema,
} from '../persistence';
import type { StoredTransferKey, TransferStorage } from './types';

export interface TransferStorageOptions {
  /** Immutable recipient/runtime owner captured when the engine is created. */
  owner?: string;
  /** Epoch milliseconds; the clock that stamps each write. Defaults to the wall clock. */
  now?: () => number;
}

const PIECES = 'pieces';
const TRANSFERS = 'transfers';

interface PieceRecord extends StoredTransferKey {
  index: number;
  bytes: ArrayBuffer;
}

interface TouchRecord extends StoredTransferKey {
  touchedAt: number;
}

const pieceDatabaseSchema: IndexedDatabaseSchema = {
  name: 'file-transfer-pieces',
  version: 1,
  upgrade: (database) => {
    database.createObjectStore(PIECES, { keyPath: ['from', 'id', 'index'] });
    database.createObjectStore(TRANSFERS, { keyPath: ['from', 'id'] });
  },
};

function clockOf(options: TransferStorageOptions | undefined): () => number {
  return options?.now ?? (() => Date.now());
}

function piecesOf({ from, id }: StoredTransferKey): IDBKeyRange {
  return IDBKeyRange.bound([from, id, -Infinity], [from, id, Infinity]);
}

function deleteTransfer(transaction: IDBTransaction, key: StoredTransferKey): void {
  transaction.objectStore(PIECES).delete(piecesOf(key));
  transaction.objectStore(TRANSFERS).delete([key.from, key.id]);
}

export function transferDatabaseName(owner = 'unassigned'): string {
  return `file-transfer-pieces-v2:${owner}`;
}

export function createIndexedDbTransferStorage(options?: TransferStorageOptions): TransferStorage {
  const now = clockOf(options);
  const databaseName = transferDatabaseName(options?.owner);
  let opening: Promise<IDBDatabase> | null = null;

  function open(): Promise<IDBDatabase> {
    if (opening) {
      return opening;
    }

    const attempt = openIndexedDatabase({ ...pieceDatabaseSchema, name: databaseName });
    opening = attempt;
    attempt.catch(() => {
      // Forget a failed open so the next call tries again instead of failing forever.
      if (opening === attempt) {
        opening = null;
      }
    });
    return attempt;
  }

  async function inTransaction<T>(
    stores: string | string[],
    mode: IDBTransactionMode,
    work: (transaction: IDBTransaction) => T | Promise<T>,
  ): Promise<T> {
    const database = await open();
    const transaction = database.transaction(stores, mode);
    // Awaited together so that when one rejects the other is not left unhandled.
    const [result] = await Promise.all([work(transaction), transactionDone(transaction)]);
    return result;
  }

  return {
    async heldPieces(key) {
      const keys = await inTransaction(PIECES, 'readonly', (transaction) =>
        requestToPromise(transaction.objectStore(PIECES).getAllKeys(piecesOf(key))),
      );
      return keys.map((pieceKey) => (pieceKey as [string, string, number])[2]);
    },

    async putPiece({ from, id }, index, bytes) {
      await inTransaction([PIECES, TRANSFERS], 'readwrite', (transaction) => {
        const piece: PieceRecord = { from, id, index, bytes };
        const touch: TouchRecord = { from, id, touchedAt: now() };
        transaction.objectStore(PIECES).put(piece);
        transaction.objectStore(TRANSFERS).put(touch);
      });
    },

    async readPiece({ from, id }, index) {
      const piece = await inTransaction(PIECES, 'readonly', (transaction) =>
        requestToPromise<PieceRecord | undefined>(
          transaction.objectStore(PIECES).get([from, id, index]),
        ),
      );
      return piece?.bytes;
    },

    async discard(key) {
      await inTransaction([PIECES, TRANSFERS], 'readwrite', (transaction) => {
        deleteTransfer(transaction, key);
      });
    },

    async discardUntouchedSince(timestamp) {
      await inTransaction([PIECES, TRANSFERS], 'readwrite', async (transaction) => {
        const touches = await requestToPromise<TouchRecord[]>(
          transaction.objectStore(TRANSFERS).getAll(),
        );
        for (const touch of touches) {
          if (touch.touchedAt < timestamp) {
            deleteTransfer(transaction, touch);
          }
        }
      });
    },

    close() {
      const closing = opening;
      opening = null;
      closing?.then(
        (database) => database.close(),
        () => undefined,
      );
    },
  };
}

interface MemoryTransfer {
  touchedAt: number;
  pieces: Map<number, ArrayBuffer>;
}

export function createMemoryTransferStorage(options?: TransferStorageOptions): TransferStorage {
  const now = clockOf(options);
  const transfers = new Map<string, MemoryTransfer>();

  // JSON keeps the two parts apart whatever characters they contain.
  const slotOf = ({ from, id }: StoredTransferKey): string => JSON.stringify([from, id]);

  return {
    async heldPieces(key) {
      const held = transfers.get(slotOf(key))?.pieces.keys() ?? [];
      return [...held].sort((a, b) => a - b);
    },

    async putPiece(key, index, bytes) {
      const slot = slotOf(key);
      const transfer = transfers.get(slot) ?? { touchedAt: 0, pieces: new Map() };
      // Copied in and out, as IndexedDB does, so no caller can alter what is stored.
      transfer.pieces.set(index, bytes.slice(0));
      transfer.touchedAt = now();
      transfers.set(slot, transfer);
    },

    async readPiece(key, index) {
      return transfers.get(slotOf(key))?.pieces.get(index)?.slice(0);
    },

    async discard(key) {
      transfers.delete(slotOf(key));
    },

    async discardUntouchedSince(timestamp) {
      for (const [slot, transfer] of transfers) {
        if (transfer.touchedAt < timestamp) {
          transfers.delete(slot);
        }
      }
    },

    // Nothing to release; what is held stays, as it does when IndexedDB is reopened.
    close() {},
  };
}
