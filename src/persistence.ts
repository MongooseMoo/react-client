export type LocalStorageSchema<T> = {
  key: string;
  version: number;
  migrate: (data: unknown, storedVersion: number) => T | undefined;
};

export type StorageWriteResult =
  | "saved"
  | "quota-exceeded"
  | "unavailable";

type StoredEnvelope = {
  version: number;
  data: unknown;
};

export type IndexedDatabaseSchema = {
  name: string;
  version: number;
  upgrade: (
    database: IDBDatabase,
    oldVersion: number,
    newVersion: number | null,
    transaction: IDBTransaction,
  ) => void;
};

function isStoredEnvelope(value: unknown): value is StoredEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Partial<StoredEnvelope>).version === "number" &&
    Object.hasOwn(value, "data")
  );
}

function isQuotaExceededError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { name?: unknown; code?: unknown };
  return (
    candidate.name === "QuotaExceededError" ||
    candidate.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    candidate.code === 22 ||
    candidate.code === 1014
  );
}

function warn(operation: string, key: string, error: unknown): void {
  console.warn(`Persistence ${operation} failed for "${key}":`, error);
}

export function saveStoredValue<T>(
  schema: LocalStorageSchema<T>,
  data: T,
): StorageWriteResult {
  try {
    localStorage.setItem(
      schema.key,
      JSON.stringify({ version: schema.version, data }),
    );
    return "saved";
  } catch (error) {
    warn("write", schema.key, error);
    return isQuotaExceededError(error) ? "quota-exceeded" : "unavailable";
  }
}

export function removeStoredValue(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    warn("remove", key, error);
    return false;
  }
}

export function loadStoredValue<T>(
  schema: LocalStorageSchema<T>,
  fallback: T,
): T {
  let serialized: string | null;
  try {
    serialized = localStorage.getItem(schema.key);
  } catch (error) {
    warn("read", schema.key, error);
    return fallback;
  }

  if (serialized === null) {
    return fallback;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (parseError) {
    try {
      const migrated = schema.migrate(serialized, 0);
      if (migrated !== undefined) {
        saveStoredValue(schema, migrated);
        return migrated;
      }
    } catch (migrationError) {
      warn("migrate", schema.key, migrationError);
      removeStoredValue(schema.key);
      return fallback;
    }

    warn("parse", schema.key, parseError);
    removeStoredValue(schema.key);
    return fallback;
  }

  try {
    const envelope = isStoredEnvelope(parsed)
      ? parsed
      : { version: 0, data: parsed };
    let migrated = schema.migrate(envelope.data, envelope.version);

    // Some legacy surfaces wrote raw strings. If a raw value happens to also
    // be valid JSON, give the schema one chance to recognize the original text.
    if (migrated === undefined && !isStoredEnvelope(parsed)) {
      migrated = schema.migrate(serialized, 0);
    }

    if (migrated === undefined) {
      removeStoredValue(schema.key);
      return fallback;
    }

    if (envelope.version !== schema.version) {
      saveStoredValue(schema, migrated);
    }

    return migrated;
  } catch (error) {
    warn("migrate", schema.key, error);
    removeStoredValue(schema.key);
    return fallback;
  }
}

export function openIndexedDatabase(
  schema: IndexedDatabaseSchema,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(schema.name, schema.version);

    request.onupgradeneeded = (event) => {
      if (!request.transaction) {
        reject(new Error(`IndexedDB upgrade transaction missing for "${schema.name}"`));
        return;
      }

      schema.upgrade(
        request.result,
        event.oldVersion,
        event.newVersion,
        request.transaction,
      );
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      reject(new Error(`IndexedDB upgrade blocked for "${schema.name}"`));
    };
  });
}

export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
