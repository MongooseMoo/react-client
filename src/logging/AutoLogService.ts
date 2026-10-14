import { usePreferences } from "../stores/preferencesStore";
import { type AutoLogStore, autoLogStore } from "./AutoLogStore";
import type {
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
    parsed.username = '';
    parsed.password = '';
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
  private unsubscribePreferences: (() => void) | null = null;
  private generation = 0;
  private starting: Promise<void> | undefined;

  constructor(store: AutoLogStore = autoLogStore) {
    this.store = store;
    this.unsubscribePreferences = usePreferences.subscribe(
      (state) => state.autologging,
      (preferences) => {
        if (!preferences.enabled) {
          this.endSession().catch((error) => {
            console.error("Failed to end autolog session after disabling autologging:", error);
          });
        } else {
          this.store.pruneToMaxBytes(preferences.maxBytes, this.currentSession?.id).catch((error) => {
            console.error("Failed to prune autolog sessions:", error);
          });
        }
      },
    );
  }

  configureSession(draft: AutoLogSessionDraft | null): void {
    if (JSON.stringify(this.sessionDraft) === JSON.stringify(draft)) return;
    this.generation++;
    this.starting = undefined;
    void this.endSession().catch(() => console.error('Failed to close the previous autolog session'));
    this.sessionDraft = draft ? { ...draft, ...(draft.owner ? { owner: { ...draft.owner } } : {}) } : null;
  }

  async startSession(): Promise<void> {
    if (this.currentSession || !this.sessionDraft || !usePreferences.getState().autologging.enabled) {
      return;
    }

    if (this.starting) return this.starting;
    const generation = this.generation;
    const draft = this.sessionDraft;
    const starting = this.store.createSession(draft).then(async (session) => {
      if (generation !== this.generation) {
        await this.store.endSession(session.id);
        return;
      }
      this.currentSession = session;
      this.sequence = 0;
    });
    this.starting = starting;
    try { await starting; }
    finally { if (this.starting === starting) this.starting = undefined; }
  }

  recordLine(line: AutoLogInputLine): void {
    const generation = this.generation;
    const timestamp = Date.now();
    if (!usePreferences.getState().autologging.enabled) {
      return;
    }

    this.ensureSession()
      .then(() => {
        if (generation !== this.generation || !this.currentSession) {
          return;
        }

        this.pendingEntries.push({
          ...line,
          sessionId: this.currentSession.id,
          sequence: this.sequence++,
          timestamp,
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
    const maxBytes = usePreferences.getState().autologging.maxBytes;
    const protectedSession = this.currentSession?.id;

    const flushPromise = this.flushPromise
      .then(() => this.store.appendEntries(entries))
      .then(() => this.store.pruneToMaxBytes(maxBytes, protectedSession));

    this.flushPromise = flushPromise.catch(() => {});
    return flushPromise;
  }

  async endSession(): Promise<void> {
    this.generation++;
    this.starting = undefined;
    const session = this.currentSession;
    this.currentSession = null;
    this.sequence = 0;
    await this.flush();
    if (session) await this.store.endSession(session.id);
  }

  dispose(): void {
    if (this.flushTimer !== null) {
      window.clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.unsubscribePreferences?.();
    this.unsubscribePreferences = null;
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
