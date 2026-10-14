import { openIndexedDatabase, requestToPromise, transactionDone } from './persistence';
import { isRecipient, type BrowserRecipient } from './awayV2';

export interface BrowserBinding extends BrowserRecipient {
  label: string;
  primary: boolean | number;
  mode: string;
  enabled: boolean | number;
  stoppedKinds: string[];
}
export interface BrowserProfile {
  id: string;
  revision: number;
  quiet: boolean | number;
  bindings: BrowserBinding[];
}
export interface BrowserEnrollmentState {
  profile: BrowserProfile;
  subscription: PushSubscriptionJSON;
}

export interface BrowserPolicy {
  revision: number;
  phase: 'owner' | 'visitor' | 'owner-paused';
  visitorSessionId: string;
  ownerPlayers: string[];
}

export async function readBrowserPolicy(): Promise<BrowserPolicy> {
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction('installation', 'readonly');
    const [policy] = await Promise.all([
      requestToPromise<unknown>(tx.objectStore('installation').get('policy')),
      transactionDone(tx),
    ]);
    if (policy === undefined) return { revision: 0, phase: 'owner', visitorSessionId: '', ownerPlayers: [] };
    if (typeof policy !== 'object' || policy === null) throw new Error('Invalid saved browser session policy');
    const value = policy as Record<string, unknown>;
    if (!Number.isSafeInteger(value.revision) || Number(value.revision) < 0 ||
        (value.phase !== 'owner' && value.phase !== 'visitor' && value.phase !== 'owner-paused') ||
        typeof value.visitorSessionId !== 'string' || !Array.isArray(value.ownerPlayers) ||
        !value.ownerPlayers.every(player => typeof player === 'string' && !!player)) throw new Error('Invalid saved browser session policy');
    return { revision: Number(value.revision), phase: value.phase,
      visitorSessionId: value.visitorSessionId, ownerPlayers: value.ownerPlayers };
  } finally { database.close(); }
}

export async function saveBrowserPolicy(expectedRevision: number, next: Omit<BrowserPolicy, 'revision'>): Promise<BrowserPolicy> {
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction('installation', 'readwrite');
    const store = tx.objectStore('installation');
    const [saved] = await Promise.all([(async () => {
      const current = await requestToPromise<BrowserPolicy | undefined>(store.get('policy'));
      if ((current?.revision ?? 0) !== expectedRevision) throw new Error('Browser session policy changed; try again');
      const policy = { ...next, revision: expectedRevision + 1 };
      store.put(policy, 'policy');
      return policy;
    })(), transactionDone(tx)]);
    return saved;
  } finally { database.close(); }
}

export function isBrowserProfile(value: unknown): value is BrowserProfile {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  return typeof data.id === 'string' && typeof data.revision === 'number' &&
    Number.isSafeInteger(data.revision) && data.revision >= 0 &&
    (typeof data.quiet === 'boolean' || data.quiet === 0 || data.quiet === 1) &&
    Array.isArray(data.bindings) && data.bindings.length <= 64 && data.bindings.every((binding: unknown) => {
      if (!isRecipient(binding) || binding.installationId !== data.id) return false;
      return 'label' in binding && typeof binding.label === 'string' &&
        'primary' in binding && (typeof binding.primary === 'boolean' || binding.primary === 0 || binding.primary === 1) &&
        'enabled' in binding && (typeof binding.enabled === 'boolean' || binding.enabled === 0 || binding.enabled === 1) &&
        'mode' in binding && typeof binding.mode === 'string' && 'stoppedKinds' in binding &&
        Array.isArray(binding.stoppedKinds) && binding.stoppedKinds.every(kind => typeof kind === 'string');
    });
}

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

export async function readEnrollmentState(serverKey: string, installationId: string): Promise<BrowserEnrollmentState | undefined> {
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction('installation', 'readonly');
    const [state] = await Promise.all([
      requestToPromise<BrowserEnrollmentState | undefined>(tx.objectStore('installation').get(['enrollment', serverKey, installationId])),
      transactionDone(tx),
    ]);
    return state && isBrowserProfile(state.profile) && state.profile.id === installationId ? state : undefined;
  } finally { database.close(); }
}

export async function saveEnrollmentState(serverKey: string, state: BrowserEnrollmentState): Promise<boolean> {
  if (!isBrowserProfile(state.profile)) return false;
  const database = await openIndexedDatabase(schema);
  try {
    const tx = database.transaction('installation', 'readwrite');
    const store = tx.objectStore('installation');
    const [saved] = await Promise.all([(async () => {
      const id = await requestToPromise(store.get('id'));
      if (state.profile.id !== id) return false;
      const key = ['enrollment', serverKey, state.profile.id];
      const previous = await requestToPromise<BrowserEnrollmentState | undefined>(store.get(key));
      if (previous && previous.profile.revision > state.profile.revision) return false;
      store.put(state, key);
      return true;
    })(), transactionDone(tx)]);
    return saved;
  } finally { database.close(); }
}
