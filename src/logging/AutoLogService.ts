import { preferencesStore } from "../PreferencesStore";
import { AutoLogStore, autoLogStore } from "./AutoLogStore";
import {
  AutoLogEntry,
  AutoLogInputLine,
  AutoLogMode,
  AutoLogSession,
  AutoLogSessionDraft,
} from "./AutoLogTypes";

const FLUSH_INTERVAL_MS = 2000;
const FLUSH_BATCH_SIZE = 50;
const SENSITIVE_URL_PARAMS = new Set([
  "password",
  "pass",
  "token",
  "access_token",
  "refresh_token",
  "username",
  "user",
]);

export function sanitizeLogUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (SENSITIVE_URL_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.set(key, "[redacted]");
      }
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

export function getAutoLogModeFromLocation(search: string): AutoLogMode {
  const params = new URLSearchParams(search);
  const mode = params.get("mode");
  const dbUrl = params.get("db");

  if (mode === "host") return "host";
  if (mode === "join") return "join";
  if (mode === "local" || dbUrl !== null) return "local";
  return "default";
}

export function createAutoLogSessionDraft(
  title: string,
  location: Pick<Location, "href" | "search"> = window.location
): AutoLogSessionDraft {
  return {
    title,
    mode: getAutoLogModeFromLocation(location.search),
    sanitizedUrl: sanitizeLogUrl(location.href),
  };
}

export class AutoLogService {
  private store: AutoLogStore;
  private sessionDraft: AutoLogSessionDraft | null = null;
  private currentSession: AutoLogSession | null = null;
  private pendingEntries: AutoLogEntry[] = [];
  private sequence = 0;
  private flushTimer: number | null = null;
  private flushPromise: Promise<void> = Promise.resolve();

  constructor(store: AutoLogStore = autoLogStore) {
    this.store = store;
    preferencesStore.subscribe(() => {
      const preferences = preferencesStore.getState().autologging;
      if (!preferences.enabled) {
        this.endSession().catch((error) => {
          console.error("Failed to end autolog session after disabling autologging:", error);
        });
      } else {
        this.store.pruneToMaxBytes(preferences.maxBytes).catch((error) => {
          console.error("Failed to prune autolog sessions:", error);
        });
      }
    });
  }

  configureSession(draft: AutoLogSessionDraft | null): void {
    this.sessionDraft = draft;
  }

  async startSession(): Promise<void> {
    if (this.currentSession || !this.sessionDraft || !preferencesStore.getState().autologging.enabled) {
      return;
    }

    this.currentSession = await this.store.createSession(this.sessionDraft);
    this.sequence = 0;
  }

  recordLine(line: AutoLogInputLine): void {
    if (!preferencesStore.getState().autologging.enabled) {
      return;
    }

    this.ensureSession()
      .then(() => {
        if (!this.currentSession) {
          return;
        }

        this.pendingEntries.push({
          ...line,
          sessionId: this.currentSession.id,
          sequence: this.sequence++,
          timestamp: Date.now(),
        });

        if (this.pendingEntries.length >= FLUSH_BATCH_SIZE) {
          this.flush().catch((error) => {
            console.error("Failed to flush autolog entries:", error);
          });
        } else {
          this.scheduleFlush();
        }
      })
      .catch((error) => {
        console.error("Failed to record autolog entry:", error);
      });
  }

  async flush(): Promise<void> {
    if (this.flushTimer !== null) {
      window.clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.pendingEntries.length === 0) {
      return this.flushPromise;
    }

    const entries = this.pendingEntries;
    this.pendingEntries = [];
    const maxBytes = preferencesStore.getState().autologging.maxBytes;

    this.flushPromise = this.flushPromise
      .then(() => this.store.appendEntries(entries))
      .then(() => this.store.pruneToMaxBytes(maxBytes));

    return this.flushPromise;
  }

  async endSession(): Promise<void> {
    const session = this.currentSession;
    await this.flush();

    if (session) {
      await this.store.endSession(session.id);
    }

    this.currentSession = null;
    this.sequence = 0;
  }

  dispose(): void {
    if (this.flushTimer !== null) {
      window.clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private async ensureSession(): Promise<void> {
    if (!this.currentSession) {
      await this.startSession();
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) {
      return;
    }

    this.flushTimer = window.setTimeout(() => {
      this.flush().catch((error) => {
        console.error("Failed to flush autolog entries:", error);
      });
    }, FLUSH_INTERVAL_MS);
  }
}

export const autoLogService = new AutoLogService();
