import { openIndexedDatabase, requestToPromise, transactionDone } from './persistence';

const schema = {
  name: 'mongoose-browser',
  version: 1,
  upgrade(database: IDBDatabase): void {
    if (!database.objectStoreNames.contains('installation')) {
      database.createObjectStore('installation');
    }
  },
};

/** Shared metadata, not authentication. Transaction serialization makes the
 * first ID canonical even when pages and the service worker start together. */
export async function getBrowserInstallationId(): Promise<string> {
  const database = await openIndexedDatabase(schema);
  try {
    const transaction = database.transaction('installation', 'readwrite');
    const store = transaction.objectStore('installation');
    const [id] = await Promise.all([
      (async () => {
        const stored: unknown = await requestToPromise(store.get('id'));
        const id = typeof stored === 'string' && stored ? stored : crypto.randomUUID();
        if (id !== stored) store.put(id, 'id');
        return id;
      })(),
      transactionDone(transaction),
    ]);
    return id;
  } finally {
    database.close();
  }
}
