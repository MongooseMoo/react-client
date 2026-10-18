import { announce } from "@react-aria/live-announcer";
import { createStore, type StoreApi } from "zustand/vanilla";
import { openIndexedDatabase, requestToPromise, transactionDone, type IndexedDatabaseSchema } from "../persistence";
import { ownerKey, type PersonalDataOwner, usePersonalDataStore } from "../stores/personalDataStore";
import { useSessionStore } from "../stores/sessionStore";
import { autoLogEntryToPlainText } from "./AutoLogExport";
import { autoLogStore } from "./AutoLogStore";
import type { AutoLogEntry, AutoLogSession, AutoLogSink } from "./AutoLogTypes";

/**
 * Writes autolog sessions as text files into a folder the player picks with
 * the File System Access API. IndexedDB stays the authoritative store: this
 * sink only copies lines that IndexedDB has already accepted, and when the
 * folder is unavailable it catches up from IndexedDB once it is back.
 *
 * Each signed-in character picks its own folder, and a session's lines only
 * ever go to the folder its own owner picked.
 */

export type LogFolderStatus =
  | { kind: "unsupported" }
  // No signed-in owner, or a temporary visit.
  | { kind: "unavailable" }
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "needs-permission"; folderName: string }
  | { kind: "ready"; folderName: string; filePath?: string }
  | { kind: "error"; folderName: string; message: string };

export interface LogFolderHandleStore {
  get(key: string): Promise<FileSystemDirectoryHandle | undefined>;
  put(key: string, handle: FileSystemDirectoryHandle): Promise<void>;
  delete(key: string): Promise<void>;
}

const FOLDER_STORE = "folders";
const folderDatabaseSchema: IndexedDatabaseSchema = {
  name: "mongoose-autolog-folders",
  version: 1,
  upgrade: (database) => {
    if (!database.objectStoreNames.contains(FOLDER_STORE)) database.createObjectStore(FOLDER_STORE);
  },
};

// Directory handles are structured-cloneable, so IndexedDB keeps them across
// reloads; the browser asks again for permission when the page comes back.
export class IndexedDbLogFolderHandles implements LogFolderHandleStore {
  private db: Promise<IDBDatabase> | undefined;

  private open(): Promise<IDBDatabase> {
    this.db ??= openIndexedDatabase(folderDatabaseSchema);
    return this.db;
  }

  async get(key: string): Promise<FileSystemDirectoryHandle | undefined> {
    const transaction = (await this.open()).transaction(FOLDER_STORE, "readonly");
    const handle = await requestToPromise<FileSystemDirectoryHandle | undefined>(transaction.objectStore(FOLDER_STORE).get(key));
    await transactionDone(transaction);
    return handle;
  }

  async put(key: string, handle: FileSystemDirectoryHandle): Promise<void> {
    const transaction = (await this.open()).transaction(FOLDER_STORE, "readwrite");
    transaction.objectStore(FOLDER_STORE).put(handle, key);
    await transactionDone(transaction);
  }

  async delete(key: string): Promise<void> {
    const transaction = (await this.open()).transaction(FOLDER_STORE, "readwrite");
    transaction.objectStore(FOLDER_STORE).delete(key);
    await transactionDone(transaction);
  }
}

type FolderRecord = {
  directory: FileSystemDirectoryHandle;
  permission: PermissionState | "error";
  message?: string;
  // The "needs permission" notice is spoken once per page load per folder.
  promptAnnounced?: boolean;
};

type TrackedSession = {
  session: AutoLogSession;
  key: string;
  // The chosen folder this session's file lives under; a newly chosen folder
  // gets a fresh file with the whole session so far.
  directory?: FileSystemDirectoryHandle;
  file?: FileSystemFileHandle;
  path?: string;
  // Highest sequence number already in the file.
  written: number;
  day: string;
};

const UNBOUND = { directory: undefined, file: undefined, path: undefined, written: -1 } as const;

const pad = (value: number) => String(value).padStart(2, "0");
const localDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const localTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const localStamp = (time: number) => `${localDay(new Date(time))} ${localTime(new Date(time))}`;

const RESERVED_NAMES = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

export function sanitizeFolderName(name: string, fallback: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what this strips
  const cleaned = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().replace(/^[.\s]+|[.\s]+$/g, "").slice(0, 80);
  if (!cleaned) return fallback;
  return RESERVED_NAMES.test(cleaned) ? `${cleaned}_` : cleaned;
}

export function logFileBaseName(startedAt: number): string {
  return localStamp(startedAt).replace(/:/g, "-");
}

function characterName(owner: PersonalDataOwner): string {
  const session = useSessionStore.getState();
  return session.playerName && session.playerUuid === owner.playerUuid ? session.playerName : owner.playerRef;
}

export function formatLogFileHeader(session: AutoLogSession, character: string): string {
  return [
    session.title || "Mongoose Client",
    `Character: ${character}`,
    `Started: ${localStamp(session.startedAt)}`,
    ...(session.sanitizedUrl ? [`URL: ${session.sanitizedUrl}`] : []),
    "",
    "",
  ].join("\n");
}

function errorMessage(error: unknown): string {
  // DOMException is not an Error in every environment.
  if ((error instanceof Error || error instanceof DOMException) && error.message) return error.message;
  return String(error);
}

async function appendText(file: FileSystemFileHandle, text: string): Promise<void> {
  const { size } = await file.getFile();
  // keepExistingData plus a seek appends without rewriting earlier lines.
  const writable = await file.createWritable({ keepExistingData: true });
  try {
    await writable.seek(size);
    await writable.write(text);
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => {});
    throw error;
  }
}

async function nameTaken(directory: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try {
    await directory.getFileHandle(name);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return false;
    // A folder with that name.
    if (error instanceof DOMException && error.name === "TypeMismatchError") return true;
    throw error;
  }
}

function isPickerCancel(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function currentOwnerKey(): string | undefined {
  const { owner, policyReady, visitor } = usePersonalDataStore.getState();
  return owner && policyReady && !visitor ? ownerKey(owner) : undefined;
}

export type AutoLogFolderOptions = {
  handles: LogFolderHandleStore;
  readEntries: (sessionId: string) => Promise<AutoLogEntry[]>;
  pickDirectory?: () => Promise<FileSystemDirectoryHandle>;
};

export class AutoLogFolder implements AutoLogSink {
  readonly state: StoreApi<{ status: LogFolderStatus }>;
  private readonly handles: LogFolderHandleStore;
  private readonly readEntries: (sessionId: string) => Promise<AutoLogEntry[]>;
  private readonly pickDirectory?: () => Promise<FileSystemDirectoryHandle>;
  private readonly folders = new Map<string, FolderRecord | null>();
  private readonly loading = new Map<string, Promise<FolderRecord | null>>();
  private readonly sessions = new Map<string, TrackedSession>();
  private currentKey: string | undefined;
  private queue: Promise<void> = Promise.resolve();
  private unsubscribeOwner: (() => void) | undefined;

  constructor(options: AutoLogFolderOptions) {
    this.handles = options.handles;
    this.readEntries = options.readEntries;
    this.pickDirectory = options.pickDirectory;
    const status: LogFolderStatus = this.supported ? { kind: "unavailable" } : { kind: "unsupported" };
    this.state = createStore(() => ({ status }));
    if (!this.supported) return;
    this.unsubscribeOwner = usePersonalDataStore.subscribe(() => { void this.syncOwner(); });
    void this.syncOwner();
  }

  get supported(): boolean {
    return this.pickDirectory !== undefined;
  }

  /** Resolves when every queued folder write has settled. */
  whenIdle(): Promise<void> {
    return this.queue;
  }

  dispose(): void {
    this.unsubscribeOwner?.();
    this.unsubscribeOwner = undefined;
  }

  async syncOwner(): Promise<void> {
    const key = currentOwnerKey();
    if (key !== this.currentKey) {
      this.currentKey = key;
      this.publish();
    }
    if (!key) return;
    await this.loadFolder(key);
    if (key === this.currentKey) this.publish();
  }

  /** Must run straight from a click: the picker needs the user's gesture. */
  async choose(): Promise<void> {
    const key = this.currentKey;
    if (!key || !this.pickDirectory) return;
    let directory: FileSystemDirectoryHandle;
    try {
      directory = await this.pickDirectory();
    } catch (error) {
      if (isPickerCancel(error)) return;
      this.reportError(key, `Could not open the folder picker: ${errorMessage(error)}`);
      return;
    }
    // The picker grants readwrite when asked for it; ask again for older
    // browsers that only granted read.
    const permission = await this.request(directory);
    if (permission !== "granted") {
      announce(`Permission to write to ${directory.name} was not given. Logs are still saved in the browser.`, "assertive");
      return;
    }
    try {
      await this.handles.put(key, directory);
    } catch (error) {
      // The folder still works for this visit; it just will not be remembered.
      console.error("Failed to remember the log folder:", error);
    }
    this.folders.set(key, { directory, permission: "granted" });
    announce(`Saving logs to the folder ${directory.name}.`, "polite");
    this.catchUp(key);
  }

  /** Must run straight from a click: requestPermission needs the user's gesture. */
  async reconnect(): Promise<void> {
    const key = this.currentKey;
    const record = key ? this.folders.get(key) : undefined;
    if (!key || !record) return;
    const permission = await this.request(record.directory);
    if (permission !== "granted") {
      record.permission = permission;
      this.publish();
      announce(`Permission to write to ${record.directory.name} was not given. Logs are still saved in the browser.`, "assertive");
      return;
    }
    record.permission = "granted";
    record.message = undefined;
    announce(`Log folder ${record.directory.name} reconnected.`, "polite");
    this.catchUp(key);
  }

  async stopUsing(): Promise<void> {
    const key = this.currentKey;
    const record = key ? this.folders.get(key) : undefined;
    if (!key || !record) return;
    this.folders.set(key, null);
    for (const tracked of this.sessions.values()) {
      if (tracked.key === key) Object.assign(tracked, UNBOUND);
    }
    this.publish();
    announce(`Stopped saving logs to ${record.directory.name}. Logs are still saved in the browser.`, "polite");
    try {
      await this.handles.delete(key);
    } catch (error) {
      console.error("Failed to forget the log folder:", error);
    }
  }

  append(session: AutoLogSession, entries: AutoLogEntry[]): void {
    const tracked = this.track(session);
    if (!tracked) return;
    this.enqueue(() => this.writeSession(tracked, entries));
  }

  sessionEnded(session: AutoLogSession, endedAt: number): void {
    const tracked = this.sessions.get(session.id);
    if (!tracked) return;
    this.enqueue(async () => {
      try {
        await this.writeSession(tracked, []);
        // No HTML copy here: most sessions end by closing the tab, which cuts
        // a whole-file write short and leaves an empty file behind. The log
        // viewer's HTML export covers that need.
        if (!tracked.file || !(await this.writable(tracked))) return;
        await appendText(tracked.file, `\nEnded: ${localStamp(endedAt)}\n`);
      } catch (error) {
        this.reportError(tracked.key, errorMessage(error));
      } finally {
        this.sessions.delete(session.id);
        this.publish();
      }
    });
  }

  private track(session: AutoLogSession): TrackedSession | undefined {
    if (!this.supported || !session.owner) return undefined;
    let tracked = this.sessions.get(session.id);
    if (!tracked) {
      tracked = { session, key: ownerKey(session.owner), written: -1, day: localDay(new Date(session.startedAt)) };
      this.sessions.set(session.id, tracked);
    }
    return tracked;
  }

  private enqueue(task: () => Promise<void>): void {
    this.queue = this.queue.then(task).catch((error) => {
      console.error("Log folder write failed:", error);
    });
  }

  private catchUp(key: string): void {
    this.publish();
    for (const tracked of this.sessions.values()) {
      if (tracked.key === key) this.enqueue(() => this.writeSession(tracked, []));
    }
    this.enqueue(async () => this.publish());
  }

  private async loadFolder(key: string): Promise<FolderRecord | null> {
    if (this.folders.has(key)) return this.folders.get(key) ?? null;
    let pending = this.loading.get(key);
    if (!pending) {
      pending = (async () => {
        try {
          const directory = await this.handles.get(key);
          const record: FolderRecord | null = directory
            ? { directory, permission: (await directory.queryPermission?.({ mode: "readwrite" })) ?? "granted" }
            : null;
          if (!this.folders.has(key)) this.folders.set(key, record);
        } catch (error) {
          console.error("Failed to load the log folder:", error);
          if (!this.folders.has(key)) this.folders.set(key, null);
        } finally {
          this.loading.delete(key);
        }
        return this.folders.get(key) ?? null;
      })();
      this.loading.set(key, pending);
    }
    return pending;
  }

  private async request(directory: FileSystemDirectoryHandle): Promise<PermissionState> {
    try {
      return (await directory.requestPermission?.({ mode: "readwrite" })) ?? "granted";
    } catch (error) {
      console.error("Log folder permission request failed:", error);
      return "denied";
    }
  }

  // True when the session's folder may be written now; announces once when
  // the browser needs the player's permission again.
  private async writable(tracked: TrackedSession): Promise<boolean> {
    const record = await this.loadFolder(tracked.key);
    if (!record) return false;
    if (record.permission === "granted" || record.permission === "error") return true;
    if (!record.promptAnnounced && tracked.key === this.currentKey) {
      record.promptAnnounced = true;
      this.publish();
      announce(`The log folder ${record.directory.name} needs permission again. Open Preferences, Logging, and choose Reconnect. Logs are still saved in the browser.`, "polite");
    }
    return false;
  }

  private async writeSession(tracked: TrackedSession, incoming: AutoLogEntry[]): Promise<void> {
    if (!(await this.writable(tracked))) return;
    const record = this.folders.get(tracked.key);
    if (!record) return;
    if (tracked.directory !== record.directory) {
      Object.assign(tracked, UNBOUND, { directory: record.directory });
    }

    try {
      const next = incoming.find((entry) => entry.sequence > tracked.written);
      // A gap means lines arrived while the folder was unavailable: read them
      // back from IndexedDB, which has everything up to this flush.
      const entries = next && next.sequence === tracked.written + 1
        ? incoming.filter((entry) => entry.sequence > tracked.written)
        : (await this.readEntries(tracked.session.id)).filter((entry) => entry.sequence > tracked.written);
      if (entries.length === 0) return;

      let prefix = "";
      if (!tracked.file) {
        prefix = await this.createFile(tracked, record.directory);
      }
      const text = prefix + this.formatEntries(tracked, entries);
      // createFile set the file above when it was missing.
      if (tracked.file) await appendText(tracked.file, text);
      tracked.written = entries[entries.length - 1].sequence;
      if (record.permission === "error") {
        record.permission = "granted";
        record.message = undefined;
        announce(`Writing logs to ${record.directory.name} again.`, "polite");
      }
      this.publish();
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        record.permission = (await record.directory.queryPermission?.({ mode: "readwrite" }).catch(() => undefined)) ?? "prompt";
        if (record.permission === "granted") {
          this.reportError(tracked.key, errorMessage(error));
        } else {
          record.promptAnnounced = false;
          await this.writable(tracked);
        }
        return;
      }
      this.reportError(tracked.key, errorMessage(error));
    }
  }

  // Opens a fresh file for the session and returns the header to write first.
  private async createFile(tracked: TrackedSession, directory: FileSystemDirectoryHandle): Promise<string> {
    const character = tracked.session.owner ? characterName(tracked.session.owner) : "";
    const folderName = sanitizeFolderName(character, "Character");
    const folder = await directory.getDirectoryHandle(folderName, { create: true });
    const base = logFileBaseName(tracked.session.startedAt);
    let name = `${base}.txt`;
    for (let copy = 2; await nameTaken(folder, name); copy++) {
      name = `${base} (${copy}).txt`;
    }
    tracked.file = await folder.getFileHandle(name, { create: true });
    tracked.path = `${folderName}/${name}`;
    return formatLogFileHeader(tracked.session, character);
  }

  private formatEntries(tracked: TrackedSession, entries: AutoLogEntry[]): string {
    let text = "";
    for (const entry of entries) {
      const date = new Date(entry.timestamp);
      const day = localDay(date);
      if (day !== tracked.day) {
        tracked.day = day;
        text += `\n-- ${day} --\n`;
      }
      const line = autoLogEntryToPlainText(entry).replace(/\r?\n$/, "");
      text += `[${localTime(date)}] ${line}\n`;
    }
    return text;
  }

  private reportError(key: string, message: string): void {
    const record = this.folders.get(key);
    const firstFailure = record?.permission !== "error";
    if (record) {
      record.permission = "error";
      record.message = message;
    }
    this.publish();
    if (firstFailure && key === this.currentKey) {
      const folder = record ? ` ${record.directory.name}` : "";
      announce(`Could not write to the log folder${folder}: ${message}. Logs are still saved in the browser.`, "assertive");
    }
  }

  private setStatus(status: LogFolderStatus): void {
    this.state.setState({ status });
  }

  private publish(): void {
    this.setStatus(this.currentStatus());
  }

  private currentStatus(): LogFolderStatus {
    if (!this.supported) return { kind: "unsupported" };
    const key = this.currentKey;
    if (!key) return { kind: "unavailable" };
    if (!this.folders.has(key)) return { kind: "loading" };
    const record = this.folders.get(key);
    if (!record) return { kind: "none" };
    const folderName = record.directory.name;
    if (record.permission === "error") return { kind: "error", folderName, message: record.message ?? "Unknown error" };
    if (record.permission !== "granted") return { kind: "needs-permission", folderName };
    const active = [...this.sessions.values()].find((tracked) => tracked.key === key && tracked.directory === record.directory && tracked.path);
    return { kind: "ready", folderName, ...(active?.path ? { filePath: active.path } : {}) };
  }
}

function defaultPicker(): (() => Promise<FileSystemDirectoryHandle>) | undefined {
  if (typeof window === "undefined" || typeof window.showDirectoryPicker !== "function") return undefined;
  const picker = window.showDirectoryPicker.bind(window);
  return () => picker({ id: "mongoose-logs", mode: "readwrite", startIn: "documents" });
}

export const autoLogFolder = new AutoLogFolder({
  handles: new IndexedDbLogFolderHandles(),
  readEntries: (sessionId) => autoLogStore.getEntries(sessionId),
  pickDirectory: defaultPicker(),
});
