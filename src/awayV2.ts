import { openIndexedDatabase, requestToPromise, transactionDone } from './persistence';

export interface BrowserRecipient {
  serverKey: string;
  installationId: string;
  playerUuid: string;
  playerRef: string;
  bindingId: string;
  revision: number;
}

export interface AwayEnvelope extends BrowserRecipient {
  version: 2;
  streamId: string;
  streamOrder: number;
  firstAvailable: number;
  from: number;
  to: number;
  lines: Array<[number, string]>;
}

export interface BrowserAwayGrant extends BrowserRecipient {
  version: 2;
  token: string;
  expires_at: number;
  sessionId: string;
}

interface StreamCursor {
  id: string;
  order: number;
  highest: number;
  firstAvailable: number;
  closed: boolean;
}

interface RecipientRecord extends BrowserRecipient { enabled: boolean; }
export const AWAY_V2_DB_NAME = 'mongoose-away-v2';
const stores = ['recipients', 'streams', 'lines', 'credentials', 'rendered'];
const schema = {
  name: AWAY_V2_DB_NAME, version: 1,
  upgrade(database: IDBDatabase): void {
    for (const name of stores) if (!database.objectStoreNames.contains(name)) database.createObjectStore(name);
  },
};

type StoreAccess = (name: string) => IDBObjectStore;
async function transaction<T>(mode: IDBTransactionMode, run: (store: StoreAccess) => Promise<T>): Promise<T> {
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction(stores, mode);
    const [result] = await Promise.all([run((name) => tx.objectStore(name)), transactionDone(tx)]);
    return result;
  } finally { database.close(); }
}

export function recipientKey(recipient: BrowserRecipient): string[] {
  return [recipient.serverKey, recipient.playerUuid, recipient.bindingId];
}

export function sameRecipient(left: BrowserRecipient, right: BrowserRecipient): boolean {
  return left.serverKey === right.serverKey && left.installationId === right.installationId &&
    left.playerUuid === right.playerUuid && left.playerRef === right.playerRef &&
    left.bindingId === right.bindingId && left.revision === right.revision;
}

export function isRecipient(value: unknown): value is BrowserRecipient {
  if (typeof value !== 'object' || value === null) return false;
  const fields = value as Record<string, unknown>;
  return ['serverKey', 'installationId', 'playerUuid', 'playerRef', 'bindingId']
    .every((key) => typeof fields[key] === 'string' && fields[key] !== '') &&
    typeof fields.revision === 'number' && Number.isSafeInteger(fields.revision) && fields.revision > 0;
}

export function isAwayEnvelope(value: unknown): value is AwayEnvelope {
  if (!isRecipient(value) || !('version' in value) || value.version !== 2 ||
      !('streamId' in value) || typeof value.streamId !== 'string' || !value.streamId) return false;
  const fields = value as unknown as Record<string, unknown>;
  if (!['streamOrder', 'firstAvailable', 'from', 'to'].every((key) =>
      typeof fields[key] === 'number' && Number.isSafeInteger(fields[key]) && Number(fields[key]) >= 0)) return false;
  return Array.isArray(fields.lines) && fields.lines.length <= 500 && fields.lines.every((line: unknown) =>
    Array.isArray(line) && line.length === 2 && Number.isSafeInteger(line[0]) && line[0] > 0 && typeof line[1] === 'string') &&
    fields.streamOrder !== 0 && fields.firstAvailable !== 0;
}

export async function registerAwayRecipient(grant: BrowserAwayGrant, expected: BrowserRecipient, enabled = true): Promise<boolean> {
  if (!sameRecipient(grant, expected) || grant.version !== 2 || !grant.token || grant.expires_at * 1000 <= Date.now()) return false;
  return transaction('readwrite', async (store) => {
    const key = recipientKey(grant);
    const previous: RecipientRecord | undefined = await requestToPromise(store('recipients').get(key));
    if (previous && (previous.revision > grant.revision || (!previous.enabled && previous.revision === grant.revision && enabled))) return false;
    store('recipients').put({ ...expected, enabled }, key);
    store('credentials').put(grant, [...key, grant.sessionId]);
    return true;
  });
}

export async function readBrowserAwayGrant(recipient: BrowserRecipient, sessionId: string): Promise<BrowserAwayGrant | undefined> {
  return transaction('readonly', async (store) => {
    const grant: BrowserAwayGrant | undefined = await requestToPromise(store('credentials').get([...recipientKey(recipient), sessionId]));
    return grant && sameRecipient(grant, recipient) && grant.expires_at * 1000 > Date.now() ? grant : undefined;
  });
}

export async function acceptAwayEnvelope(envelope: AwayEnvelope): Promise<{ accepted: boolean; highest: number; gap: boolean }> {
  if (!isAwayEnvelope(envelope)) return { accepted: false, highest: 0, gap: false };
  return transaction('readwrite', async (store) => {
    const key = recipientKey(envelope);
    const recipient: RecipientRecord | undefined = await requestToPromise(store('recipients').get(key));
    if (!recipient?.enabled || !sameRecipient(recipient, envelope)) return { accepted: false, highest: 0, gap: false };
    let cursor: StreamCursor | undefined = await requestToPromise(store('streams').get(key));
    if (cursor && (envelope.streamOrder < cursor.order ||
        (envelope.streamOrder === cursor.order && (envelope.streamId !== cursor.id || cursor.closed)))) {
      return { accepted: false, highest: cursor.highest, gap: false };
    }
    if (!cursor || envelope.streamOrder > cursor.order) {
      store('lines').delete(IDBKeyRange.bound(key, [...key, []]));
      store('rendered').delete(IDBKeyRange.bound(key, [...key, []]));
      cursor = { id: envelope.streamId, order: envelope.streamOrder, highest: envelope.firstAvailable - 1,
        firstAvailable: envelope.firstAvailable, closed: false };
    }
    cursor.firstAvailable = Math.max(cursor.firstAvailable, envelope.firstAvailable);
    cursor.highest = Math.max(cursor.highest, cursor.firstAvailable - 1);
    if (cursor.firstAvailable > 1) store('lines').delete(IDBKeyRange.bound([...key, cursor.id, 0], [...key, cursor.id, cursor.firstAvailable - 1]));
    for (const line of envelope.lines) {
      if (line[0] >= cursor.firstAvailable) store('lines').put(line[1], [...key, cursor.id, line[0]]);
    }
    while (cursor.highest < envelope.to && await requestToPromise(store('lines').get([...key, cursor.id, cursor.highest + 1])) !== undefined) cursor.highest++;
    store('streams').put(cursor, key);
    return { accepted: true, highest: cursor.highest, gap: cursor.highest < envelope.to };
  });
}

/** Rendering belongs to one tab, independently of worker receipt or another tab. */
export async function takeAwayLines(recipient: BrowserRecipient, sessionId: string): Promise<{ lines: Array<[number, string]>; missingBefore: number }> {
  return transaction('readwrite', async (store) => {
    const key = recipientKey(recipient);
    const registered: RecipientRecord | undefined = await requestToPromise(store('recipients').get(key));
    const cursor: StreamCursor | undefined = await requestToPromise(store('streams').get(key));
    if (!registered?.enabled || !sameRecipient(registered, recipient) || !cursor || cursor.closed) return { lines: [], missingBefore: 0 };
    const markerKey = [...key, cursor.id, sessionId];
    const shown: number = await requestToPromise(store('rendered').get(markerKey)) ?? 0;
    const start = Math.max(shown + 1, cursor.firstAvailable);
    const lines: Array<[number, string]> = [];
    for (let seq = start; seq <= cursor.highest; seq++) {
      const text: string | undefined = await requestToPromise(store('lines').get([...key, cursor.id, seq]));
      if (text !== undefined) lines.push([seq, text]);
    }
    store('rendered').put(Math.max(shown, cursor.highest), markerKey);
    return { lines, missingBefore: shown < cursor.firstAvailable - 1 ? cursor.firstAvailable - 1 - shown : 0 };
  });
}

export async function readAwayStream(recipient: BrowserRecipient): Promise<StreamCursor | undefined> {
  return transaction('readonly', async (store) => {
    const registered: RecipientRecord | undefined = await requestToPromise(store('recipients').get(recipientKey(recipient)));
    return registered && sameRecipient(registered, recipient) ? requestToPromise(store('streams').get(recipientKey(recipient))) : undefined;
  });
}

export async function closeAwayStream(recipient: BrowserRecipient, expectedStreamId: string): Promise<void> {
  return transaction('readwrite', async (store) => {
    const key = recipientKey(recipient);
    const cursor: StreamCursor | undefined = await requestToPromise(store('streams').get(key));
    const registered: RecipientRecord | undefined = await requestToPromise(store('recipients').get(key));
    if (registered && sameRecipient(registered, recipient) && cursor?.id === expectedStreamId) store('streams').put({ ...cursor, closed: true }, key);
  });
}

export async function disableAwayRecipient(recipient: BrowserRecipient): Promise<void> {
  return transaction('readwrite', async (store) => {
    const key = recipientKey(recipient);
    const previous: RecipientRecord | undefined = await requestToPromise(store('recipients').get(key));
    if (previous && sameRecipient(previous, recipient)) store('recipients').put({ ...previous, enabled: false }, key);
  });
}
