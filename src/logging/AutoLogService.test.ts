import { beforeEach, describe, expect, it, vi } from "vitest";
import { preferencesStore, PrefActionType } from "../PreferencesStore";
import { AutoLogStore } from "./AutoLogStore";
import { AutoLogService, createAutoLogSessionDraft, getAutoLogModeFromLocation, sanitizeLogUrl } from "./AutoLogService";
import { AutoLogEntry, AutoLogSession, AutoLogSessionDraft } from "./AutoLogTypes";

class FakeAutoLogStore {
  sessions: AutoLogSession[] = [];
  entries: AutoLogEntry[] = [];
  prunedTo: number[] = [];
  ended: string[] = [];

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
    this.entries.push(...entries);
  }

  async pruneToMaxBytes(maxBytes: number): Promise<void> {
    this.prunedTo.push(maxBytes);
  }

  async endSession(sessionId: string): Promise<void> {
    this.ended.push(sessionId);
  }
}

describe("AutoLogService", () => {
  beforeEach(() => {
    vi.useRealTimers();
    preferencesStore.dispatch({
      type: PrefActionType.SetAutologging,
      data: { enabled: false, maxBytes: 1000 },
    });
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

    preferencesStore.dispatch({
      type: PrefActionType.SetAutologging,
      data: { enabled: true, maxBytes: 1000 },
    });

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
    expect(store.prunedTo).toContain(1000);

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
});
