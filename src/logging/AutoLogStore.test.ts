import { beforeEach, describe, expect, it } from "vitest";
import { AutoLogStore } from "./AutoLogStore";
import { AUTOLOG_DB_NAME, AutoLogEntry, AutoLogSessionDraft } from "./AutoLogTypes";

function deleteAutoLogDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(AUTOLOG_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Autolog database delete was blocked."));
  });
}

const draft: AutoLogSessionDraft = {
  title: "Test Session",
  mode: "default",
  sanitizedUrl: "https://example.test/",
};

function makeEntry(sessionId: string, sequence: number, sourceContent: string): AutoLogEntry {
  return {
    sessionId,
    sequence,
    timestamp: 1000 + sequence,
    type: "serverMessage",
    sourceType: "ansi",
    sourceContent,
  };
}

describe("AutoLogStore", () => {
  beforeEach(async () => {
    await deleteAutoLogDatabase();
  });

  it("creates sessions and appends entries", async () => {
    const store = new AutoLogStore();
    const session = await store.createSession(draft, 100);
    await store.appendEntries([
      makeEntry(session.id, 0, "first"),
      makeEntry(session.id, 1, "second"),
    ]);

    const sessions = await store.listSessions();
    const entries = await store.getEntries(session.id);

    expect(sessions).toHaveLength(1);
    expect(sessions[0].lineCount).toBe(2);
    expect(sessions[0].byteEstimate).toBeGreaterThan(0);
    expect(entries.map((entry) => entry.sourceContent)).toEqual(["first", "second"]);

    store.close();
  });

  it("deletes a session and its entries", async () => {
    const store = new AutoLogStore();
    const session = await store.createSession(draft, 100);
    await store.appendEntries([makeEntry(session.id, 0, "line")]);

    await store.deleteSession(session.id);

    expect(await store.listSessions()).toEqual([]);
    expect(await store.getEntries(session.id)).toEqual([]);

    store.close();
  });

  it("prunes oldest whole sessions over the storage cap", async () => {
    const store = new AutoLogStore();
    const oldSession = await store.createSession({ ...draft, title: "Old" }, 100);
    const newSession = await store.createSession({ ...draft, title: "New" }, 200);
    await store.appendEntries([makeEntry(oldSession.id, 0, "old ".repeat(100))]);
    await store.appendEntries([makeEntry(newSession.id, 0, "new")]);
    const newOnlyCap = (await store.getSession(newSession.id))!.byteEstimate + 1;

    await store.pruneToMaxBytes(newOnlyCap);

    const sessions = await store.listSessions();
    expect(sessions.map((session) => session.title)).toEqual(["New"]);
    expect(await store.getEntries(oldSession.id)).toEqual([]);
    expect(await store.getEntries(newSession.id)).toHaveLength(1);

    store.close();
  });
});
