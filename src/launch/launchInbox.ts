import { DEFAULT_MAX_FILE_SIZE } from '../fileTransfer/types';
import { openIndexedDatabase, requestToPromise, transactionDone } from '../persistence';

/**
 * What one launch hands from where it arrived to the window that will show it:
 * the service worker's share target to the page it opens, or a window that
 * confirmed hosting a database to the host window it opens. Nothing here is
 * acted on by itself; the receiving page puts it in front of the player.
 *
 * Any site can post a form to the share target, with no gesture from the
 * player, so what is kept here is bounded: per file, per share, and in all.
 */
export type LaunchItem =
  | { kind: 'share'; text: string; files: File[] }
  | { kind: 'database'; file: File };

/** A launch is collected at once by the window it opened; older entries are abandoned. */
export const LAUNCH_ITEM_LIFETIME_MS = 10 * 60 * 1000;
/** Files per share. */
export const MAX_SHARED_FILES = 10;
/** A shared file is offered for transfer, so it may be no larger than a transfer allows. */
export const MAX_SHARED_FILE_BYTES = DEFAULT_MAX_FILE_SIZE;
/** All files of one share together. */
export const MAX_SHARE_BYTES = 200 * 1024 * 1024;
/** Items kept at once, and their bytes together, whatever their kind. */
export const MAX_INBOX_ITEMS = 5;
export const MAX_INBOX_BYTES = 200 * 1024 * 1024;

export type LaunchInboxRefusal = 'too-large' | 'inbox-full';

export class LaunchInboxError extends Error {
  constructor(readonly reason: LaunchInboxRefusal) {
    super(reason === 'too-large' ? 'Launch item is too large' : 'Launch inbox is full');
  }
}

/** Kept apart from the payloads so that counting and expiring never reads a file. */
interface LaunchMeta {
  created: number;
  bytes: number;
}

const PAYLOADS = 'payloads';
const META = 'meta';
const BY_CREATED = 'created';
const schema = {
  name: 'mongoose-launch',
  version: 2,
  upgrade(database: IDBDatabase): void {
    // Version 1 (payload and time together) never shipped; discarded on purpose.
    if (database.objectStoreNames.contains('items')) database.deleteObjectStore('items');
    if (!database.objectStoreNames.contains(PAYLOADS)) database.createObjectStore(PAYLOADS);
    if (!database.objectStoreNames.contains(META)) {
      database.createObjectStore(META).createIndex(BY_CREATED, 'created');
    }
  },
};

/** Longest file name and media type kept; a sender chooses both. */
export const MAX_FILE_NAME_LENGTH = 255;
export const MAX_FILE_TYPE_LENGTH = 127;

/** The file as kept: an overlong name or type is cut, never stored whole. */
function boundedFile(file: File): File {
  if (file.name.length <= MAX_FILE_NAME_LENGTH && file.type.length <= MAX_FILE_TYPE_LENGTH) return file;
  return new File([file], file.name.slice(0, MAX_FILE_NAME_LENGTH), {
    type: file.type.slice(0, MAX_FILE_TYPE_LENGTH),
    lastModified: file.lastModified,
  });
}

export function boundedLaunchItem(item: LaunchItem): LaunchItem {
  return item.kind === 'database'
    ? { kind: 'database', file: boundedFile(item.file) }
    : { kind: 'share', text: item.text, files: item.files.map(boundedFile) };
}

/** What an item takes in storage, strings at two bytes a character. */
export function launchItemBytes(item: LaunchItem): number {
  const fileBytes = (file: File) => file.size + (file.name.length + file.type.length) * 2;
  return item.kind === 'database'
    ? fileBytes(item.file)
    : item.text.length * 2 + item.files.reduce((total, file) => total + fileBytes(file), 0);
}

/** Deletes every abandoned item, walking the time index only. */
function pruneExpired(tx: IDBTransaction, now: number): Promise<void> {
  const payloads = tx.objectStore(PAYLOADS);
  const meta = tx.objectStore(META);
  const cursor = meta.index(BY_CREATED).openKeyCursor(IDBKeyRange.upperBound(now - LAUNCH_ITEM_LIFETIME_MS));
  return new Promise((resolve, reject) => {
    cursor.onerror = () => reject(cursor.error);
    cursor.onsuccess = () => {
      const position = cursor.result;
      if (!position) {
        resolve();
        return;
      }
      payloads.delete(position.primaryKey);
      meta.delete(position.primaryKey);
      position.continue();
    };
  });
}

async function withInbox<T>(work: (tx: IDBTransaction) => Promise<T>): Promise<T> {
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction([PAYLOADS, META], 'readwrite');
    const [result] = await Promise.all([work(tx), transactionDone(tx)]);
    return result;
  } finally {
    database.close();
  }
}

/** Keeps the item for one read, or refuses it when it would take the inbox past its bounds. */
export function putLaunchItem(offered: LaunchItem, now = Date.now()): Promise<string> {
  const item = boundedLaunchItem(offered);
  const bytes = launchItemBytes(item);
  if (bytes > MAX_INBOX_BYTES) return Promise.reject(new LaunchInboxError('too-large'));
  return withInbox(async (tx) => {
    await pruneExpired(tx, now);
    const kept = await requestToPromise<LaunchMeta[]>(tx.objectStore(META).getAll());
    const keptBytes = kept.reduce((total, meta) => total + meta.bytes, 0);
    if (kept.length >= MAX_INBOX_ITEMS || keptBytes + bytes > MAX_INBOX_BYTES) {
      throw new LaunchInboxError('inbox-full');
    }
    const id = crypto.randomUUID();
    tx.objectStore(PAYLOADS).put(item, id);
    tx.objectStore(META).put({ created: now, bytes } satisfies LaunchMeta, id);
    return id;
  });
}

/** Removes and returns the item; an id is good for one read. */
export function takeLaunchItem(id: string, now = Date.now()): Promise<LaunchItem | undefined> {
  return withInbox(async (tx) => {
    await pruneExpired(tx, now);
    const item = await requestToPromise<LaunchItem | undefined>(tx.objectStore(PAYLOADS).get(id));
    tx.objectStore(PAYLOADS).delete(id);
    tx.objectStore(META).delete(id);
    return item;
  });
}

/** Removes an item nobody will read, such as one whose hand-off was abandoned. */
export function discardLaunchItem(id: string): Promise<void> {
  return withInbox(async (tx) => {
    tx.objectStore(PAYLOADS).delete(id);
    tx.objectStore(META).delete(id);
  });
}

/** Deletes abandoned items; run when a client page starts. */
export function pruneLaunchItems(now = Date.now()): Promise<void> {
  return withInbox((tx) => pruneExpired(tx, now));
}
