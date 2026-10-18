import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePreferences } from "../stores/preferencesStore";
import type { AutoLogStore } from "./AutoLogStore";
import { AutoLogService, createAutoLogSessionDraft, getAutoLogModeFromLocation, sanitizeLogUrl } from "./AutoLogService";
import type { AutoLogEntry, AutoLogSession, AutoLogSessionDraft } from "./AutoLogTypes";

class FakeAutoLogStore {
  sessions: AutoLogSession[] = [];
  entries: AutoLogEntry[] = [];
  prunedTo: Array<{ maxBytes: number; protectedSessionId?: string }> = [];
  ended: string[] = [];
  failNextAppend = false;

  async createSession(draft: AutoLogSessionDraft): Promise<AutoLogSession> {
    const session: AutoLogSession = {
      id: `session-${this.sessions.length}`,
      startedAt: Date.now(),
      lineCount: 0,
      byteEstimate: 0,
      ...draft,
    };
    this.sessions.push(session);
    return session;
  }

  async appendEntries(entries: AutoLogEntry[]): Promise<void> {
    if (this.failNextAppend) {
      this.failNextAppend = false;
      throw new Error("IndexedDB write failed");
    }

    this.entries.push(...entries);
  }

  async pruneToMaxBytes(maxBytes: number, protectedSessionId?: string): Promise<void> {
    this.prunedTo.push({ maxBytes, protectedSessionId });
  }

  async endSession(sessionId: string): Promise<void> {
    this.ended.push(sessionId);
  }
}

describe("AutoLogService", () => {
  it('cannot attach delayed session creation or old lines to a new owner', async () => {
    const store = new FakeAutoLogStore();
    const create = store.createSession.bind(store);
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    store.createSession = async draft => {
      const session = await create(draft);
      if (draft.title === 'A') await held;
      return session;
    };
    const service = new AutoLogService(store as unknown as AutoLogStore);
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1000 });
    service.configureSession({ title: 'A', mode: 'default', sanitizedUrl: '',
      owner: { runtime: 'fixture', playerUuid: 'a', playerRef: '#1' } });
    service.recordLine({ type: 'serverMessage', sourceType: 'ansi', sourceContent: 'Old A line' });
    service.configureSession({ title: 'B', mode: 'default', sanitizedUrl: '',
      owner: { runtime: 'fixture', playerUuid: 'b', playerRef: '#2' } });
    service.recordLine({ type: 'serverMessage', sourceType: 'ansi', sourceContent: 'New B line' });
    await new Promise(resolve => setTimeout(resolve, 0));
    release();
    await new Promise(resolve => setTimeout(resolve, 0));
    await service.flush();
    expect(store.ended).toContain('session-0');
    expect(store.entries.map(entry => [entry.sessionId, entry.sourceContent])).toEqual([['session-1', 'New B line']]);
    expect(store.sessions[1].owner?.playerUuid).toBe('b');
    service.dispose();
  });
  beforeEach(() => {
    vi.useRealTimers();
    usePreferences.getState().setAutologging({ enabled: false, maxBytes: 1000 });
  });

  it("redacts sensitive URL parameters", () => {
    const sanitized = sanitizeLogUrl("https://example.test/?username=q&password=secret&room=1");

    expect(sanitized).toContain("username=%5Bredacted%5D");
    expect(sanitized).toContain("password=%5Bredacted%5D");
    expect(sanitized).toContain("room=1");
  });

  it("detects URL mode for session metadata", () => {
    expect(getAutoLogModeFromLocation("?mode=join")).toBe("join");
    expect(getAutoLogModeFromLocation("?mode=host")).toBe("host");
    expect(getAutoLogModeFromLocation("?db=/Minimal.db")).toBe("local");
    expect(getAutoLogModeFromLocation("")).toBe("default");
  });

  it("records and flushes entries when enabled", async () => {
    const store = new FakeAutoLogStore();
    const service = new AutoLogService(store as unknown as AutoLogStore);
    service.configureSession(createAutoLogSessionDraft("Test", {
      href: "https://example.test/?password=secret",
      search: "?password=secret",
    }));

    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1000 });

    service.recordLine({
      type: "serverMessage",
      sourceType: "ansi",
      sourceContent: "hello",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await service.flush();

    expect(store.sessions).toHaveLength(1);
    expect(store.sessions[0].sanitizedUrl).toContain("password=%5Bredacted%5D");
    expect(store.entries).toHaveLength(1);
    expect(store.entries[0]).toMatchObject({
      sessionId: "session-0",
      sequence: 0,
      sourceContent: "hello",
    });
    expect(store.prunedTo).toContainEqual({
      maxBytes: 1000,
      protectedSessionId: "session-0",
    });

    service.dispose();
  });

  it("ignores entries when disabled", async () => {
    const store = new FakeAutoLogStore();
    const service = new AutoLogService(store as unknown as AutoLogStore);
    service.configureSession({ title: "Test", mode: "default", sanitizedUrl: "https://example.test/" });

    service.recordLine({
      type: "serverMessage",
      sourceType: "ansi",
      sourceContent: "hello",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await service.flush();

    expect(store.sessions).toEqual([]);
    expect(store.entries).toEqual([]);

    service.dispose();
  });

  it("does not prune sessions when an unrelated preference domain changes", async () => {
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1000 });
    const store = new FakeAutoLogStore();
    const service = new AutoLogService(store as unknown as AutoLogStore);

    usePreferences.getState().setGeneral({
      localEcho: true,
      syncTimezoneToServer: true,
      syncLocationToServer: false,
    });
    await Promise.resolve();

    expect(store.prunedTo).toEqual([]);
    service.dispose();
  });

  it("recovers the flush queue after an IndexedDB write fails", async () => {
    const store = new FakeAutoLogStore();
    const service = new AutoLogService(store as unknown as AutoLogStore);
    service.configureSession({
      title: "Test",
      mode: "default",
      sanitizedUrl: "https://example.test/",
    });
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1000 });

    service.recordLine({
      type: "serverMessage",
      sourceType: "ansi",
      sourceContent: "failed",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    store.failNextAppend = true;

    await expect(service.flush()).rejects.toThrow("IndexedDB write failed");

    service.recordLine({
      type: "serverMessage",
      sourceType: "ansi",
      sourceContent: "recovered",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await service.flush();

    expect(store.entries.map((entry) => entry.sourceContent)).toEqual(["recovered"]);
    service.dispose();
  });

  it("feeds the folder sink only lines IndexedDB accepted, then tells it the session ended", async () => {
    const store = new FakeAutoLogStore();
    const sink = { append: vi.fn(), sessionEnded: vi.fn() };
    const service = new AutoLogService(store as unknown as AutoLogStore, sink);
    service.configureSession({ title: "Test", mode: "default", sanitizedUrl: "" });
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1000 });

    service.recordLine({ type: "serverMessage", sourceType: "ansi", sourceContent: "lost to IndexedDB" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    store.failNextAppend = true;
    await expect(service.flush()).rejects.toThrow("IndexedDB write failed");
    expect(sink.append).not.toHaveBeenCalled();

    service.recordLine({ type: "serverMessage", sourceType: "ansi", sourceContent: "kept" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await service.endSession();

    expect(sink.append).toHaveBeenCalledTimes(1);
    const [session, entries] = sink.append.mock.calls[0];
    expect(session.id).toBe("session-0");
    expect(entries.map((entry: AutoLogEntry) => entry.sourceContent)).toEqual(["kept"]);
    expect(sink.sessionEnded).toHaveBeenCalledWith(expect.objectContaining({ id: "session-0" }), expect.any(Number));
    expect(sink.append.mock.invocationCallOrder[0]).toBeLessThan(sink.sessionEnded.mock.invocationCallOrder[0]);
    service.dispose();
  });

  it("releases the current session when its final flush fails", async () => {
    const store = new FakeAutoLogStore();
    const service = new AutoLogService(store as unknown as AutoLogStore);
    service.configureSession({
      title: "Test",
      mode: "default",
      sanitizedUrl: "https://example.test/",
    });
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1000 });
    await service.startSession();

    service.recordLine({
      type: "serverMessage",
      sourceType: "ansi",
      sourceContent: "failed",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    store.failNextAppend = true;

    await expect(service.endSession()).rejects.toThrow("IndexedDB write failed");
    await service.startSession();

    expect(store.sessions).toHaveLength(2);
    service.dispose();
  });
});
