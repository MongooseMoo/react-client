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
