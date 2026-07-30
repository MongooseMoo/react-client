import {
    openIndexedDatabase,
    requestToPromise,
    transactionDone,
    type IndexedDatabaseSchema,
} from "./persistence";

const DB_NAME = 'toaststunt-saves';
const STORE_NAME = 'checkpoints';

const checkpointDatabaseSchema: IndexedDatabaseSchema = {
    name: DB_NAME,
    version: 1,
    upgrade: (database) => {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME);
        }
    },
};

export async function saveCheckpoint(dbKey: string, data: Uint8Array): Promise<void> {
    const db = await openIndexedDatabase(checkpointDatabaseSchema);
    try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const done = transactionDone(tx);
        tx.objectStore(STORE_NAME).put(data, dbKey);
        await done;
    } finally {
        db.close();
    }
}

export async function loadCheckpoint(dbKey: string): Promise<Uint8Array | null> {
    const db = await openIndexedDatabase(checkpointDatabaseSchema);
    try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const done = transactionDone(tx);
        const result = await requestToPromise<Uint8Array | undefined>(
            tx.objectStore(STORE_NAME).get(dbKey),
        );
        await done;
        return result ?? null;
    } finally {
        db.close();
    }
}

export async function deleteCheckpoint(dbKey: string): Promise<void> {
    const db = await openIndexedDatabase(checkpointDatabaseSchema);
    try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const done = transactionDone(tx);
        tx.objectStore(STORE_NAME).delete(dbKey);
        await done;
    } finally {
        db.close();
    }
}

export async function hashDbBytes(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
