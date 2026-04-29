import {
  AUTOLOG_DB_NAME,
  AUTOLOG_DB_VERSION,
  AUTOLOG_ENTRIES_STORE,
  AUTOLOG_SESSIONS_STORE,
  AutoLogEntry,
  AutoLogSession,
  AutoLogSessionDraft,
} from "./AutoLogTypes";

const SESSION_INDEX_STARTED_AT = "startedAt";
const ENTRY_INDEX_SESSION_ID = "sessionId";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `autolog-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function estimateAutoLogEntryBytes(entry: Pick<AutoLogEntry, "sourceContent" | "metadata">): number {
  const metadataBytes = entry.metadata ? JSON.stringify(entry.metadata).length : 0;
  return entry.sourceContent.length * 2 + metadataBytes + 128;
}

export class AutoLogStore {
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(AUTOLOG_DB_NAME, AUTOLOG_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(AUTOLOG_SESSIONS_STORE)) {
          const sessions = db.createObjectStore(AUTOLOG_SESSIONS_STORE, { keyPath: "id" });
          sessions.createIndex(SESSION_INDEX_STARTED_AT, "startedAt", { unique: false });
        }

        if (!db.objectStoreNames.contains(AUTOLOG_ENTRIES_STORE)) {
          const entries = db.createObjectStore(AUTOLOG_ENTRIES_STORE, { keyPath: ["sessionId", "sequence"] });
          entries.createIndex(ENTRY_INDEX_SESSION_ID, "sessionId", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    this.db.onversionchange = () => {
      this.close();
    };

    return this.db;
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  async createSession(draft: AutoLogSessionDraft, startedAt = Date.now()): Promise<AutoLogSession> {
    const db = await this.open();
    const session: AutoLogSession = {
      id: createSessionId(),
      startedAt,
      title: draft.title,
      mode: draft.mode,
      sanitizedUrl: draft.sanitizedUrl,
      lineCount: 0,
      byteEstimate: 0,
    };

    const transaction = db.transaction(AUTOLOG_SESSIONS_STORE, "readwrite");
    transaction.objectStore(AUTOLOG_SESSIONS_STORE).put(session);
    await transactionDone(transaction);
    return session;
  }

  async updateSession(session: AutoLogSession): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(AUTOLOG_SESSIONS_STORE, "readwrite");
    transaction.objectStore(AUTOLOG_SESSIONS_STORE).put(session);
    await transactionDone(transaction);
  }

  async endSession(sessionId: string, endedAt = Date.now()): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }

    await this.updateSession({ ...session, endedAt });
  }

  async appendEntries(entries: AutoLogEntry[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const sessionId = entries[0].sessionId;
    const db = await this.open();
    const transaction = db.transaction([AUTOLOG_ENTRIES_STORE, AUTOLOG_SESSIONS_STORE], "readwrite");
    const entryStore = transaction.objectStore(AUTOLOG_ENTRIES_STORE);
    const sessionStore = transaction.objectStore(AUTOLOG_SESSIONS_STORE);

    for (const entry of entries) {
      entryStore.put(entry);
    }

    const session = await requestToPromise<AutoLogSession | undefined>(sessionStore.get(sessionId));
    if (session) {
      const byteEstimate = entries.reduce((total, entry) => total + estimateAutoLogEntryBytes(entry), 0);
      sessionStore.put({
        ...session,
        lineCount: session.lineCount + entries.length,
        byteEstimate: session.byteEstimate + byteEstimate,
      });
    }

    await transactionDone(transaction);
  }

  async getSession(sessionId: string): Promise<AutoLogSession | undefined> {
    const db = await this.open();
    const transaction = db.transaction(AUTOLOG_SESSIONS_STORE, "readonly");
    const session = await requestToPromise<AutoLogSession | undefined>(
      transaction.objectStore(AUTOLOG_SESSIONS_STORE).get(sessionId)
    );
    await transactionDone(transaction);
    return session;
  }

  async listSessions(): Promise<AutoLogSession[]> {
    const db = await this.open();
    const transaction = db.transaction(AUTOLOG_SESSIONS_STORE, "readonly");
    const sessions = await requestToPromise<AutoLogSession[]>(
      transaction.objectStore(AUTOLOG_SESSIONS_STORE).index(SESSION_INDEX_STARTED_AT).getAll()
    );
    await transactionDone(transaction);
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  }

  async getEntries(sessionId: string): Promise<AutoLogEntry[]> {
    const db = await this.open();
    const transaction = db.transaction(AUTOLOG_ENTRIES_STORE, "readonly");
    const entries = await requestToPromise<AutoLogEntry[]>(
      transaction.objectStore(AUTOLOG_ENTRIES_STORE).index(ENTRY_INDEX_SESSION_ID).getAll(sessionId)
    );
    await transactionDone(transaction);
    return entries.sort((a, b) => a.sequence - b.sequence);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction([AUTOLOG_ENTRIES_STORE, AUTOLOG_SESSIONS_STORE], "readwrite");
    const entryIndex = transaction.objectStore(AUTOLOG_ENTRIES_STORE).index(ENTRY_INDEX_SESSION_ID);
    const cursorRequest = entryIndex.openCursor(IDBKeyRange.only(sessionId));

    await new Promise<void>((resolve, reject) => {
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) {
          resolve();
          return;
        }

        cursor.delete();
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });

    transaction.objectStore(AUTOLOG_SESSIONS_STORE).delete(sessionId);
    await transactionDone(transaction);
  }

  async deleteAll(): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction([AUTOLOG_ENTRIES_STORE, AUTOLOG_SESSIONS_STORE], "readwrite");
    transaction.objectStore(AUTOLOG_ENTRIES_STORE).clear();
    transaction.objectStore(AUTOLOG_SESSIONS_STORE).clear();
    await transactionDone(transaction);
  }

  async getTotalByteEstimate(): Promise<number> {
    const sessions = await this.listSessions();
    return sessions.reduce((total, session) => total + session.byteEstimate, 0);
  }

  async pruneToMaxBytes(maxBytes: number): Promise<void> {
    if (maxBytes <= 0) {
      await this.deleteAll();
      return;
    }

    const sessions = await this.listSessions();
    let total = sessions.reduce((sum, session) => sum + session.byteEstimate, 0);
    const oldestFirst = [...sessions].sort((a, b) => a.startedAt - b.startedAt);

    for (const session of oldestFirst) {
      if (total <= maxBytes) {
        return;
      }

      await this.deleteSession(session.id);
      total -= session.byteEstimate;
    }
  }
}

export const autoLogStore = new AutoLogStore();
