import { openIndexedDatabase, requestToPromise, transactionDone } from '../persistence';

/**
 * What one launch hands from where it arrived to the window that will show it:
 * the service worker's share target to the page it opens, or a window that
 * confirmed hosting a database to the host window it opens. Nothing here is
 * acted on by itself; the receiving page puts it in front of the player.
 */
export type LaunchItem =
  | { kind: 'share'; text: string; files: File[] }
  | { kind: 'database'; file: File };

interface StoredLaunchItem {
  item: LaunchItem;
  created: number;
}

/** A launch is collected at once by the window it opened; older entries are abandoned. */
export const LAUNCH_ITEM_LIFETIME_MS = 10 * 60 * 1000;
/** Files per share. A form posted from any site reaches the share target, so it is bounded. */
export const MAX_SHARED_FILES = 10;

const STORE = 'items';
const schema = {
  name: 'mongoose-launch',
  version: 1,
  upgrade(database: IDBDatabase): void {
    if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
  },
};

export async function putLaunchItem(item: LaunchItem, now = Date.now()): Promise<string> {
  const id = crypto.randomUUID();
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const [keys, values] = await Promise.all([
      requestToPromise(store.getAllKeys()),
      requestToPromise<StoredLaunchItem[]>(store.getAll()),
    ]);
    keys.forEach((key, index) => {
      if (!(now - values[index].created < LAUNCH_ITEM_LIFETIME_MS)) store.delete(key);
    });
    store.put({ item, created: now } satisfies StoredLaunchItem, id);
    await transactionDone(tx);
    return id;
  } finally {
    database.close();
  }
}

/** Removes and returns the item; an id is good for one read. */
export async function takeLaunchItem(id: string, now = Date.now()): Promise<LaunchItem | undefined> {
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const stored = await requestToPromise<StoredLaunchItem | undefined>(store.get(id));
    if (stored) store.delete(id);
    await transactionDone(tx);
    return stored && now - stored.created < LAUNCH_ITEM_LIFETIME_MS ? stored.item : undefined;
  } finally {
    database.close();
  }
}
