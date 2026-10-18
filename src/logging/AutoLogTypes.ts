import type { PersonalDataOwner } from '../stores/personalDataStore';

export type AutoLogLineType =
  | "command"
  | "serverMessage"
  | "systemInfo"
  | "errorMessage";

export type AutoLogSourceType =
  | "ansi"
  | "html"
  | "command"
  | "system"
  | "error"
  | "unknown";

export type AutoLogMode = "default" | "local" | "host" | "join";

export interface AutoLogSession {
  owner?: PersonalDataOwner;
  id: string;
  startedAt: number;
  endedAt?: number;
  title: string;
  mode: AutoLogMode;
  sanitizedUrl: string;
  lineCount: number;
  byteEstimate: number;
}

export interface AutoLogEntry {
  sessionId: string;
  sequence: number;
  timestamp: number;
  type: AutoLogLineType;
  sourceType: AutoLogSourceType;
  sourceContent: string;
  metadata?: Record<string, unknown>;
}

export interface AutoLogInputLine {
  type: AutoLogLineType;
  sourceType: AutoLogSourceType;
  sourceContent: string;
  metadata?: Record<string, unknown>;
}

export interface AutoLogSessionDraft {
  owner?: PersonalDataOwner;
  title: string;
  mode: AutoLogMode;
  sanitizedUrl: string;
}

// A second destination for lines IndexedDB has already stored. Its failures
// are its own: they never reach the IndexedDB flush.
export interface AutoLogSink {
  append(session: AutoLogSession, entries: AutoLogEntry[]): void;
  sessionEnded(session: AutoLogSession, endedAt: number): void;
}

export const AUTOLOG_DB_NAME = "mongoose-autologs";
export const AUTOLOG_DB_VERSION = 1;
export const AUTOLOG_SESSIONS_STORE = "sessions";
export const AUTOLOG_ENTRIES_STORE = "entries";
export const AUTOLOG_DEFAULT_MAX_BYTES = 100 * 1024 * 1024;
