import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadStoredValue,
  openIndexedDatabase,
  removeStoredValue,
  saveStoredValue,
  type LocalStorageSchema,
} from "./persistence";

type ExampleState = {
  name: string;
};

const schema: LocalStorageSchema<ExampleState> = {
  key: "example-state",
  version: 2,
  migrate: (data, storedVersion) => {
    if (
      storedVersion > 2 ||
      typeof data !== "object" ||
      data === null ||
      typeof (data as { name?: unknown }).name !== "string"
    ) {
      return undefined;
    }

    return { name: (data as { name: string }).name };
  },
};

describe("local persistence", () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReset();
    vi.mocked(localStorage.setItem).mockReset();
    vi.mocked(localStorage.removeItem).mockReset();
  });

  it("loads a current versioned value through the schema migration entry point", () => {
    vi.mocked(localStorage.getItem).mockReturnValueOnce(
      JSON.stringify({ version: 2, data: { name: "current" } }),
    );

    expect(loadStoredValue(schema, { name: "fallback" })).toEqual({
      name: "current",
    });
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("migrates an unversioned legacy value and writes the current envelope", () => {
    vi.mocked(localStorage.getItem).mockReturnValueOnce(
      JSON.stringify({ name: "legacy" }),
    );

    expect(loadStoredValue(schema, { name: "fallback" })).toEqual({
      name: "legacy",
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "example-state",
      JSON.stringify({ version: 2, data: { name: "legacy" } }),
    );
  });

  it("migrates a legacy raw string that was not JSON encoded", () => {
    const rawStringSchema: LocalStorageSchema<string> = {
      key: "legacy-token",
      version: 1,
      migrate: (data, storedVersion) =>
        storedVersion === 0 && typeof data === "string" ? data : undefined,
    };
    vi.mocked(localStorage.getItem).mockReturnValueOnce("legacy-token-value");

    expect(loadStoredValue(rawStringSchema, "")).toBe("legacy-token-value");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "legacy-token",
      JSON.stringify({ version: 1, data: "legacy-token-value" }),
    );
  });

  it("returns the fallback when storage access is blocked", () => {
    vi.mocked(localStorage.getItem).mockImplementationOnce(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(loadStoredValue(schema, { name: "fallback" })).toEqual({
      name: "fallback",
    });
  });

  it("reports quota and unavailable writes through one result policy", () => {
    vi.mocked(localStorage.setItem)
      .mockImplementationOnce(() => {
        throw new DOMException("full", "QuotaExceededError");
      })
      .mockImplementationOnce(() => {
        throw new DOMException("blocked", "SecurityError");
      });

    expect(saveStoredValue(schema, { name: "quota" })).toBe("quota-exceeded");
    expect(saveStoredValue(schema, { name: "blocked" })).toBe("unavailable");
  });

  it("guards removals when storage is unavailable", () => {
    vi.mocked(localStorage.removeItem).mockImplementationOnce(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(removeStoredValue("example-state")).toBe(false);
  });
});

describe("IndexedDB persistence", () => {
  const databaseName = `persistence-test-${crypto.randomUUID()}`;

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  it("runs database creation and migrations through one versioned entry point", async () => {
    const upgrade = vi.fn((database: IDBDatabase) => {
      database.createObjectStore("records");
    });

    const database = await openIndexedDatabase({
      name: databaseName,
      version: 2,
      upgrade,
    });

    expect(upgrade).toHaveBeenCalledOnce();
    expect(upgrade).toHaveBeenCalledWith(
      database,
      0,
      2,
      expect.any(IDBTransaction),
    );
    expect(database.objectStoreNames.contains("records")).toBe(true);
    database.close();
  });
});
