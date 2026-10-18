import { getBrowserInstallationId } from './browserInstallation';

export interface SessionGrant {
  purpose?: 'owner' | 'visitor';
  version: 2;
  token: string;
  sessionId: string;
  installationId: string;
  playerUuid: string;
  playerRef: string;
  expires_at: number;
  requestId: string;
}

export function isSessionGrant(value: unknown): value is SessionGrant {
  if (typeof value !== 'object' || value === null) return false;
  const fields = value as Record<string, unknown>;
  return fields.version === 2 &&
    (fields.purpose === undefined || fields.purpose === 'owner' || fields.purpose === 'visitor') &&
    ['token', 'sessionId', 'installationId', 'playerUuid', 'playerRef', 'requestId']
      .every((key) => typeof fields[key] === 'string' && fields[key] !== '') &&
    typeof fields.expires_at === 'number' && Number.isFinite(fields.expires_at);
}

interface TabRecord {
  version: 2;
  sessionId: string;
  grant?: SessionGrant;
}

interface TabSessionDependencies {
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  locks?: Pick<LockManager, 'request'>;
  installation: () => Promise<string>;
  newId: () => string;
}

/** A tab's saved grant is usable only while it exclusively owns its session.
 * Duplicate tabs copy sessionStorage, but cannot copy the held Web Lock. */
export class TabSession {
  sessionId = '';
  installationId = '';
  grant: SessionGrant | undefined;
  private preparation?: Promise<void>;
  private release?: () => void;
  private disposed = false;
  private persistent = false;
  private readonly key: string;

  constructor(serverKey: string, private readonly dependencies: TabSessionDependencies) {
    this.key = `mongoose:tab:v2:${serverKey}`;
  }

  prepare(): Promise<void> {
    this.preparation ??= this.initialize();
    return this.preparation;
  }

  private async initialize(): Promise<void> {
    const { storage, locks, installation, newId } = this.dependencies;
    this.sessionId = newId();
    let stored: TabRecord | undefined;
    try {
      const raw = storage.getItem(this.key);
      const parsed: unknown = raw === null ? null : JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && 'version' in parsed &&
          parsed.version === 2 && 'sessionId' in parsed && typeof parsed.sessionId === 'string' && parsed.sessionId) {
        stored = { version: 2, sessionId: parsed.sessionId };
        if ('grant' in parsed && isSessionGrant(parsed.grant)) stored.grant = parsed.grant;
      }
      this.installationId = await installation();
      if (this.disposed) return;
      // Without exclusive locking, never consume a copied single-use grant.
      if (!locks) return;
      const candidate = stored?.sessionId ?? this.sessionId;
      const owned = await this.acquire(locks, `${this.key}:${candidate}`);
      if (this.disposed) return;
      if (owned) {
        this.sessionId = candidate;
        if (stored?.grant?.sessionId === candidate && stored.grant.installationId === this.installationId &&
            stored.grant.expires_at * 1000 > Date.now()) this.grant = stored.grant;
      } else if (!await this.acquire(locks, `${this.key}:${this.sessionId}`)) {
        return;
      }
      if (this.disposed) return;
      this.persistent = true;
      this.persist();
    } catch {
      // Normal manual game login remains available when storage is unavailable.
      this.grant = undefined;
      this.persistent = false;
    }
  }

  private acquire(locks: Pick<LockManager, 'request'>, name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      void locks.request(name, { ifAvailable: true }, async (lock) => {
        if (!lock || this.disposed) {
          resolve(false);
          return;
        }
        const held = new Promise<void>((done) => { this.release = done; });
        resolve(true);
        await held;
      }).catch(reject);
    });
  }

  save(grant: SessionGrant): boolean {
    if (this.disposed || grant.sessionId !== this.sessionId || grant.installationId !== this.installationId) return false;
    this.grant = grant;
    this.persist();
    return true;
  }

  forgetGrant(): void {
    this.grant = undefined;
    this.persist();
  }

  private persist(): void {
    if (!this.persistent || this.disposed) return;
    try {
      this.dependencies.storage.setItem(this.key, JSON.stringify({ version: 2, sessionId: this.sessionId, grant: this.grant }));
    } catch {
      this.persistent = false;
    }
  }

  dispose(): void {
    this.disposed = true;
    this.release?.();
    this.release = undefined;
  }
}

export function createTabSession(serverKey: string): TabSession {
  // Accessing sessionStorage itself can throw, so keep that inside the adapter.
  const storage = {
    getItem: (key: string) => sessionStorage.getItem(key),
    setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
    removeItem: (key: string) => sessionStorage.removeItem(key),
  };
  return new TabSession(serverKey, {
    storage,
    locks: globalThis.navigator?.locks,
    installation: getBrowserInstallationId,
    newId: () => crypto.randomUUID(),
  });
}
