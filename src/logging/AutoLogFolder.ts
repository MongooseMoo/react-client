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
 * sink only copies lines IndexedDB has already accepted, and whatever the
 * folder misses (disconnected, failing, or the tab closed mid-write) is
 * copied from IndexedDB later.
 *
 * Each signed-in character picks their own folder, and a session's lines only
 * go to the folder its own owner picked.
 *
 * A session's file is `<Character>/<YYYY-MM-DD HH-MM-SS> <id>.txt`, split into
 * `... part 2.txt` and so on at maxPartBytes: Chromium copies the whole file
 * for every keepExistingData write, so parts bound that copy.
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

export type StoredFolder = {
  handle: FileSystemDirectoryHandle;
  // Changes every time the player chooses a folder; cursors made for an
  // earlier choice are not continued in a new one.
  bindingId: string;
};

export type LogFileHeader = { title: string; startedAt: number; sanitizedUrl: string; character: string };

/**
 * How far a session's copy has got, saved next to the folder handle so a
 * later page can finish it. `pending` is written before each commit: if the
 * file has grown to exactly `sizeAfter`, that commit landed even though the
 * cursor update after it did not.
 */
export type LogFileCursor = {
  sessionId: string;
  ownerKey: string;
  bindingId: string;
  folderName: string;
  baseName: string;
  part: number;
  // Bytes of the current part already committed by this session.
  partBytes: number;
  // Highest sequence number already in the files.
  written: number;
  // Local day of the last line written, for the date separator.
  day: string;
  header: LogFileHeader;
  pending?: { part: number; sizeAfter: number; written: number; day: string };
};

export interface LogFolderPersistence {
  getFolder(key: string): Promise<StoredFolder | undefined>;
  putFolder(key: string, folder: StoredFolder): Promise<void>;
  deleteFolder(key: string): Promise<void>;
  listCursors(key: string): Promise<LogFileCursor[]>;
  putCursor(cursor: LogFileCursor): Promise<void>;
  deleteCursor(sessionId: string): Promise<void>;
}

// The part of the Web Locks API used here; navigator.locks satisfies it.
export interface LockManagerLike {
  request(name: string, options: { ifAvailable?: boolean }, callback: (lock: unknown) => Promise<unknown>): Promise<unknown>;
}

const FOLDER_STORE = "folders";
const CURSOR_STORE = "cursors";
const CURSOR_OWNER_INDEX = "ownerKey";
// Version 1 kept only the bare handle per owner; version 2 wraps it in a
// StoredFolder and adds the cursors store.
const folderDatabaseSchema: IndexedDatabaseSchema = {
  name: "mongoose-autolog-folders",
  version: 2,
  upgrade: (database, oldVersion, _newVersion, transaction) => {
    if (!database.objectStoreNames.contains(FOLDER_STORE)) database.createObjectStore(FOLDER_STORE);
    if (!database.objectStoreNames.contains(CURSOR_STORE)) {
      database.createObjectStore(CURSOR_STORE, { keyPath: "sessionId" }).createIndex(CURSOR_OWNER_INDEX, "ownerKey", { unique: false });
    }
    if (oldVersion === 1) {
      const request = transaction.objectStore(FOLDER_STORE).openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        cursor.update({ handle: cursor.value, bindingId: newBindingId() });
        cursor.continue();
      };
    }
  },
};

// Directory handles are structured-cloneable, so IndexedDB keeps them across
// reloads; the browser asks again for permission when the page comes back.
export class IndexedDbLogFolderPersistence implements LogFolderPersistence {
  private db: Promise<IDBDatabase> | undefined;

  private async transaction(store: string, mode: IDBTransactionMode): Promise<IDBTransaction> {
    this.db ??= openIndexedDatabase(folderDatabaseSchema);
    return (await this.db).transaction(store, mode);
  }

  async getFolder(key: string): Promise<StoredFolder | undefined> {
    const transaction = await this.transaction(FOLDER_STORE, "readonly");
    const folder = await requestToPromise<StoredFolder | undefined>(transaction.objectStore(FOLDER_STORE).get(key));
    await transactionDone(transaction);
    return folder;
  }

  async putFolder(key: string, folder: StoredFolder): Promise<void> {
    const transaction = await this.transaction(FOLDER_STORE, "readwrite");
    transaction.objectStore(FOLDER_STORE).put(folder, key);
    await transactionDone(transaction);
  }

  async deleteFolder(key: string): Promise<void> {
    const transaction = await this.transaction(FOLDER_STORE, "readwrite");
    transaction.objectStore(FOLDER_STORE).delete(key);
    await transactionDone(transaction);
  }

  async listCursors(key: string): Promise<LogFileCursor[]> {
    const transaction = await this.transaction(CURSOR_STORE, "readonly");
    const cursors = await requestToPromise<LogFileCursor[]>(transaction.objectStore(CURSOR_STORE).index(CURSOR_OWNER_INDEX).getAll(key));
    await transactionDone(transaction);
    return cursors;
  }

  async putCursor(cursor: LogFileCursor): Promise<void> {
    const transaction = await this.transaction(CURSOR_STORE, "readwrite");
    transaction.objectStore(CURSOR_STORE).put(cursor);
    await transactionDone(transaction);
  }

  async deleteCursor(sessionId: string): Promise<void> {
    const transaction = await this.transaction(CURSOR_STORE, "readwrite");
    transaction.objectStore(CURSOR_STORE).delete(sessionId);
    await transactionDone(transaction);
  }
}

type FolderRecord = {
  directory: FileSystemDirectoryHandle;
  bindingId: string;
  permission: PermissionState | "error";
  message?: string;
  // The "needs permission" notice is spoken once per page load per folder.
  promptAnnounced?: boolean;
};

type TrackedSession = {
  session: AutoLogSession;
  key: string;
  cursor?: LogFileCursor;
  endedAt?: number;
  releaseLock: () => void;
};

// Thrown when the folder a write started with is no longer the chosen one.
class StaleFolder extends Error {}

export const MAX_PART_BYTES = 1024 * 1024;
const LOCK_PREFIX = "mongoose-autolog-folder:";
const encoder = new TextEncoder();
const byteLength = (text: string) => encoder.encode(text).length;

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

function characterName(owner: PersonalDataOwner): string {
  const session = useSessionStore.getState();
  return session.playerName && session.playerUuid === owner.playerUuid ? session.playerName : owner.playerRef;
}

// The id keeps two sessions that start in the same second apart.
function baseFileName(session: AutoLogSession): string {
  const id = session.id.replace(/[^a-z0-9]/gi, "").slice(-8) || "session";
  return `${localStamp(session.startedAt).replace(/:/g, "-")} ${id}`;
}

export function partFileName(cursor: Pick<LogFileCursor, "baseName" | "part">): string {
  return `${cursor.baseName}${cursor.part > 1 ? ` part ${cursor.part}` : ""}.txt`;
}

function formatPartHeader(cursor: LogFileCursor): string {
  const { header, part } = cursor;
  const lines = part === 1
    ? [header.title, `Character: ${header.character}`, `Started: ${localStamp(header.startedAt)}`, ...(header.sanitizedUrl ? [`URL: ${header.sanitizedUrl}`] : [])]
    : [`${header.title}, part ${part}`, `Character: ${header.character}`, `Started: ${localStamp(header.startedAt)}`, `Continues from: ${partFileName({ ...cursor, part: part - 1 })}`];
  return `${lines.join("\n")}\n\n`;
}

function formatEntry(entry: AutoLogEntry, day: string): { text: string; day: string } {
  const date = new Date(entry.timestamp);
  const entryDay = localDay(date);
  const separator = entryDay === day ? "" : `\n-- ${entryDay} --\n`;
  const line = autoLogEntryToPlainText(entry).replace(/\r?\n$/, "");
  return { text: `${separator}[${localTime(date)}] ${line}\n`, day: entryDay };
}

function errorMessage(error: unknown): string {
  // DOMException is not an Error in every environment.
  if ((error instanceof Error || error instanceof DOMException) && error.message) return error.message;
  return String(error);
}

function isPickerCancel(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function currentOwnerKey(): string | undefined {
  const { owner, policyReady, visitor } = usePersonalDataStore.getState();
  return owner && policyReady && !visitor ? ownerKey(owner) : undefined;
}

function newBindingId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type AutoLogFolderOptions = {
  persistence: LogFolderPersistence;
  readEntries: (sessionId: string) => Promise<AutoLogEntry[]>;
  readSession: (sessionId: string) => Promise<AutoLogSession | undefined>;
  pickDirectory?: () => Promise<FileSystemDirectoryHandle>;
  // Without Web Locks a closed page's unfinished sessions are left alone:
  // they cannot be told apart from another open tab's live ones.
  locks?: LockManagerLike;
  maxPartBytes?: number;
};

export class AutoLogFolder implements AutoLogSink {
  readonly state: StoreApi<{ status: LogFolderStatus }>;
  private readonly persistence: LogFolderPersistence;
  private readonly readEntries: (sessionId: string) => Promise<AutoLogEntry[]>;
  private readonly readSession: (sessionId: string) => Promise<AutoLogSession | undefined>;
  private readonly pickDirectory?: () => Promise<FileSystemDirectoryHandle>;
  private readonly locks?: LockManagerLike;
  private readonly maxPartBytes: number;
  // A folder change replaces or clears the record; writes check theirs is
  // still the one here (assertLive) so they never land in a dropped folder.
  private readonly folders = new Map<string, FolderRecord | null>();
  private readonly loading = new Map<string, Promise<FolderRecord | null>>();
  private readonly sessions = new Map<string, TrackedSession>();
  private currentKey: string | undefined;
  private queue: Promise<void> = Promise.resolve();
  private unsubscribeOwner: (() => void) | undefined;

  constructor(options: AutoLogFolderOptions) {
    this.persistence = options.persistence;
    this.readEntries = options.readEntries;
    this.readSession = options.readSession;
    this.pickDirectory = options.pickDirectory;
    this.locks = options.locks;
    this.maxPartBytes = options.maxPartBytes ?? MAX_PART_BYTES;
    const status: LogFolderStatus = this.supported ? { kind: "unavailable" } : { kind: "unsupported" };
    this.state = createStore(() => ({ status }));
    if (!this.supported) return;
    this.unsubscribeOwner = usePersonalDataStore.subscribe(() => { void this.syncOwner(); });
    void this.syncOwner();
  }

  get supported(): boolean {
    return this.pickDirectory !== undefined;
  }

  /** Resolves once every queued folder task, including ones queued meanwhile, has settled. */
  async whenIdle(): Promise<void> {
    let queue: Promise<void>;
    do {
      queue = this.queue;
      await queue;
    } while (queue !== this.queue);
  }

  dispose(): void {
    this.unsubscribeOwner?.();
    this.unsubscribeOwner = undefined;
  }

  async syncOwner(): Promise<void> {
    if (!this.supported) return;
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
      announce(`Could not open the folder picker: ${errorMessage(error)}`, "assertive");
      return;
    }
    // The picker grants readwrite when asked for it; ask again for browsers
    // that only granted read.
    if ((await this.request(directory)) !== "granted") {
      announce(`Permission to write to ${directory.name} was not given. Logs are still saved in the browser.`, "assertive");
      return;
    }
    const record: FolderRecord = { directory, bindingId: newBindingId(), permission: "granted" };
    this.folders.set(key, record);
    for (const tracked of this.sessions.values()) if (tracked.key === key) tracked.cursor = undefined;
    this.publish();
    await this.run(async () => {
      try {
        await this.persistence.putFolder(key, { handle: directory, bindingId: record.bindingId });
        announce(`Saving logs to the folder ${directory.name}.`, "polite");
      } catch (error) {
        console.error("Failed to remember the log folder:", error);
        announce(`Saving logs to the folder ${directory.name} for this visit, but the browser could not remember it, so you will need to choose it again after a reload.`, "assertive");
      }
    });
    this.catchUp(key, record);
  }

  /**
   * Asks for permission again when the browser wants it (straight from a
   * click: it needs the user's gesture), then copies everything missed.
   * After write errors it simply tries again.
   */
  async reconnect(): Promise<void> {
    const key = this.currentKey;
    const record = key ? this.folders.get(key) : undefined;
    if (!key || !record) return;
    if (record.permission !== "granted" && record.permission !== "error") {
      const permission = await this.request(record.directory);
      if (this.folders.get(key) !== record) return;
      if (permission !== "granted") {
        record.permission = permission;
        this.publish();
        announce(`Permission to write to ${record.directory.name} was not given. Logs are still saved in the browser.`, "assertive");
        return;
      }
      record.permission = "granted";
      record.message = undefined;
      announce(`Log folder ${record.directory.name} reconnected.`, "polite");
    }
    this.catchUp(key, record);
    await this.run(async () => {});
  }

  /** Resolves once no write to the folder can start or finish any more. */
  async stopUsing(): Promise<void> {
    const key = this.currentKey;
    const record = key ? this.folders.get(key) : undefined;
    if (!key || !record) return;
    this.folders.set(key, null);
    for (const tracked of [...this.sessions.values()]) {
      if (tracked.key !== key) continue;
      tracked.cursor = undefined;
      // An ended session has nowhere left to finish.
      if (tracked.endedAt !== undefined) this.forget(tracked);
    }
    this.publish();
    const name = record.directory.name;
    await this.run(async () => {
      try {
        await this.persistence.deleteFolder(key);
        for (const cursor of await this.persistence.listCursors(key)) await this.persistence.deleteCursor(cursor.sessionId);
        announce(`Stopped saving logs to ${name}. Logs are still saved in the browser.`, "polite");
      } catch (error) {
        console.error("Failed to forget the log folder:", error);
        announce(`Stopped saving logs to ${name} for this visit, but the browser could not forget the folder, so it may come back after a reload. Logs are still saved in the browser.`, "assertive");
      }
    });
  }

  append(session: AutoLogSession, entries: AutoLogEntry[]): void {
    const tracked = this.track(session);
    if (!tracked) return;
    this.enqueue(() => this.writeTracked(tracked, entries));
  }

  sessionEnded(session: AutoLogSession, endedAt: number): void {
    const tracked = this.sessions.get(session.id);
    if (!tracked) return;
    tracked.endedAt = endedAt;
    this.enqueue(() => this.writeTracked(tracked, []));
  }

  private track(session: AutoLogSession): TrackedSession | undefined {
    if (!this.supported || !session.owner) return undefined;
    const existing = this.sessions.get(session.id);
    if (existing) return existing;
    let releaseLock = () => {};
    const held = new Promise<void>((resolve) => { releaseLock = resolve; });
    // Held for as long as this page owns the session, so another tab never
    // mistakes it for one a closed page left unfinished.
    this.locks?.request(LOCK_PREFIX + session.id, {}, () => held).catch((error) => {
      console.error("Failed to lock the autolog session:", error);
    });
    const tracked: TrackedSession = { session, key: ownerKey(session.owner), releaseLock };
    this.sessions.set(session.id, tracked);
    return tracked;
  }

  private forget(tracked: TrackedSession): void {
    tracked.releaseLock();
    this.sessions.delete(tracked.session.id);
  }

  private run(task: () => Promise<void>): Promise<void> {
    this.queue = this.queue.then(task).catch((error) => {
      console.error("Log folder task failed:", error);
    });
    return this.queue;
  }

  private enqueue(task: () => Promise<void>): void {
    void this.run(task);
  }

  private catchUp(key: string, record: FolderRecord): void {
    this.publish();
    for (const tracked of this.sessions.values()) {
      if (tracked.key === key) this.enqueue(() => this.writeTracked(tracked, []));
    }
    this.reconcileOrphans(key, record);
    this.enqueue(async () => this.publish());
  }

  private async loadFolder(key: string): Promise<FolderRecord | null> {
    if (this.folders.has(key)) return this.folders.get(key) ?? null;
    let pending = this.loading.get(key);
    if (!pending) {
      pending = (async () => {
        try {
          const stored = await this.persistence.getFolder(key);
          const permission = stored ? (await stored.handle.queryPermission?.({ mode: "readwrite" })) ?? "granted" : undefined;
          if (!this.folders.has(key)) {
            this.folders.set(key, stored && permission ? { directory: stored.handle, bindingId: stored.bindingId, permission } : null);
          }
        } catch (error) {
          console.error("Failed to load the log folder:", error);
          if (!this.folders.has(key)) this.folders.set(key, null);
        } finally {
          this.loading.delete(key);
        }
        const record = this.folders.get(key) ?? null;
        if (record?.permission === "granted") this.reconcileOrphans(key, record);
        return record;
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

  // True when the folder may be written now; announces once when the browser
  // needs the player's permission again.
  private writable(key: string, record: FolderRecord): boolean {
    if (record.permission === "granted" || record.permission === "error") return true;
    if (!record.promptAnnounced && key === this.currentKey) {
      record.promptAnnounced = true;
      this.publish();
      announce(`The log folder ${record.directory.name} needs permission again. Open Preferences, Logging, and choose Reconnect. Logs are still saved in the browser.`, "polite");
    }
    return false;
  }

  private assertLive(key: string, record: FolderRecord): void {
    if (this.folders.get(key) !== record) throw new StaleFolder();
  }

  private newCursor(session: AutoLogSession, key: string, bindingId: string): LogFileCursor {
    const character = session.owner ? characterName(session.owner) : "";
    return {
      sessionId: session.id,
      ownerKey: key,
      bindingId,
      folderName: sanitizeFolderName(character, "Character"),
      baseName: baseFileName(session),
      part: 1,
      partBytes: 0,
      written: -1,
      day: localDay(new Date(session.startedAt)),
      header: { title: session.title || "Mongoose Client", startedAt: session.startedAt, sanitizedUrl: session.sanitizedUrl, character },
    };
  }

  private async writeTracked(tracked: TrackedSession, incoming: AutoLogEntry[]): Promise<void> {
    if (this.sessions.get(tracked.session.id) !== tracked) return;
    const record = await this.loadFolder(tracked.key);
    if (!record || !this.writable(tracked.key, record)) return;
    try {
      this.assertLive(tracked.key, record);
      if (tracked.cursor && tracked.cursor.bindingId !== record.bindingId) tracked.cursor = undefined;
      const cursor = tracked.cursor ?? this.newCursor(tracked.session, tracked.key, record.bindingId);
      const next = incoming.find((entry) => entry.sequence > cursor.written);
      // A gap means lines arrived while the folder was unavailable: read them
      // back from IndexedDB, which has everything up to this flush.
      const entries = next && next.sequence === cursor.written + 1 ? incoming : await this.readEntries(tracked.session.id);
      const footer = tracked.endedAt === undefined ? undefined : `\nEnded: ${localStamp(tracked.endedAt)}\n`;
      await this.writeEntries(cursor, record, entries, footer, (committed) => { tracked.cursor = committed; });
      if (footer) {
        this.forget(tracked);
        await this.persistence.deleteCursor(tracked.session.id);
      }
      this.recovered(record);
      this.publish();
    } catch (error) {
      await this.handleWriteError(error, tracked.key, record);
    }
  }

  // Copies entries after the cursor (and the footer, if given) into the
  // session's files, part by part. onCommit sees each committed cursor.
  private async writeEntries(
    start: LogFileCursor,
    record: FolderRecord,
    entries: AutoLogEntry[],
    footer: string | undefined,
    onCommit: (cursor: LogFileCursor) => void,
  ): Promise<LogFileCursor> {
    let cursor = start;
    let remaining = entries;
    let footerDone = footer === undefined;
    while (true) {
      const prepared = await this.prepare(cursor, record);
      cursor = prepared.cursor;
      const written = cursor.written;
      remaining = remaining.filter((entry) => entry.sequence > written);
      if (remaining.length === 0 && footerDone) return cursor;

      let text = cursor.partBytes === 0 ? formatPartHeader(cursor) : "";
      let size = cursor.partBytes + byteLength(text);
      let day = cursor.day;
      let last = cursor.written;
      let taken = 0;
      for (const entry of remaining) {
        const formatted = formatEntry(entry, day);
        const bytes = byteLength(formatted.text);
        if (size + bytes > this.maxPartBytes && (taken > 0 || cursor.partBytes > 0)) break;
        text += formatted.text;
        size += bytes;
        day = formatted.day;
        last = entry.sequence;
        taken++;
      }
      remaining = remaining.slice(taken);
      const withFooter = remaining.length === 0 && footer !== undefined && !footerDone;
      if (withFooter) text += footer;

      if (text) {
        cursor = await this.commit(prepared.file, prepared.size, cursor, record, text, last, day);
        onCommit(cursor);
      }
      if (withFooter) footerDone = true;
      if (remaining.length > 0) cursor = { ...cursor, part: cursor.part + 1, partBytes: 0, pending: undefined };
    }
  }

  // Opens the cursor's current part and squares the cursor with what the file
  // really holds. A file that differs from both the cursor and its pending
  // intent was changed by someone else: never write into it, use a new part.
  private async prepare(start: LogFileCursor, record: FolderRecord): Promise<{ cursor: LogFileCursor; file: FileSystemFileHandle; size: number }> {
    let cursor = start;
    while (true) {
      const folder = await record.directory.getDirectoryHandle(cursor.folderName, { create: true });
      this.assertLive(cursor.ownerKey, record);
      const file = await folder.getFileHandle(partFileName(cursor), { create: true });
      this.assertLive(cursor.ownerKey, record);
      const { size } = await file.getFile();
      this.assertLive(cursor.ownerKey, record);
      if (size === cursor.partBytes) return { cursor: { ...cursor, pending: undefined }, file, size };
      const pending = cursor.pending;
      if (pending && pending.part === cursor.part && size === pending.sizeAfter) {
        return { cursor: { ...cursor, partBytes: size, written: pending.written, day: pending.day, pending: undefined }, file, size };
      }
      cursor = { ...cursor, part: cursor.part + 1, partBytes: 0, pending: undefined };
    }
  }

  // One short closed-stream append. The cursor only moves on once close()
  // has committed the text, so a failed write retries with the same header
  // and date lines.
  private async commit(
    file: FileSystemFileHandle,
    size: number,
    cursor: LogFileCursor,
    record: FolderRecord,
    text: string,
    written: number,
    day: string,
  ): Promise<LogFileCursor> {
    const sizeAfter = size + byteLength(text);
    await this.persistence.putCursor({ ...cursor, pending: { part: cursor.part, sizeAfter, written, day } });
    this.assertLive(cursor.ownerKey, record);
    // keepExistingData plus a seek appends; Chromium still copies the
    // existing part into a swap file, which is why parts are capped.
    const writable = await file.createWritable({ keepExistingData: true });
    try {
      this.assertLive(cursor.ownerKey, record);
      await writable.seek(size);
      await writable.write(text);
      this.assertLive(cursor.ownerKey, record);
      await writable.close();
    } catch (error) {
      await writable.abort().catch(() => {});
      throw error;
    }
    const committed: LogFileCursor = { ...cursor, partBytes: sizeAfter, written, day, pending: undefined };
    try {
      await this.persistence.putCursor(committed);
    } catch (error) {
      // The saved pending intent still describes this commit.
      console.error("Failed to save the log file cursor:", error);
    }
    return committed;
  }

  // Finishes sessions a closed page left part-copied, from IndexedDB. A
  // session another open tab still holds the lock for is left alone.
  private reconcileOrphans(key: string, record: FolderRecord): void {
    const locks = this.locks;
    if (!locks) return;
    this.enqueue(async () => {
      if (this.folders.get(key) !== record) return;
      for (const cursor of await this.persistence.listCursors(key)) {
        if (this.sessions.has(cursor.sessionId) || this.folders.get(key) !== record) continue;
        await locks.request(LOCK_PREFIX + cursor.sessionId, { ifAvailable: true }, async (lock) => {
          if (!lock) return;
          if (cursor.bindingId !== record.bindingId) {
            await this.persistence.deleteCursor(cursor.sessionId);
            return;
          }
          await this.finishOrphan(cursor, record);
        });
      }
    });
  }

  private async finishOrphan(cursor: LogFileCursor, record: FolderRecord): Promise<void> {
    try {
      const session = await this.readSession(cursor.sessionId);
      const entries = session ? await this.readEntries(cursor.sessionId) : [];
      const footer = session?.endedAt !== undefined
        ? `\nEnded: ${localStamp(session.endedAt)}\n`
        : session
          ? "\nEnded: not recorded (the page closed)\n"
          // Pruned from IndexedDB before the folder got it.
          : "\nThe rest of this session was removed from browser storage before it could be copied.\n";
      await this.writeEntries(cursor, record, entries, footer, () => {});
      await this.persistence.deleteCursor(cursor.sessionId);
      this.recovered(record);
    } catch (error) {
      await this.handleWriteError(error, cursor.ownerKey, record);
    }
  }

  private recovered(record: FolderRecord): void {
    if (record.permission !== "error") return;
    record.permission = "granted";
    record.message = undefined;
    announce(`Writing logs to ${record.directory.name} again.`, "polite");
  }

  private async handleWriteError(error: unknown, key: string, record: FolderRecord): Promise<void> {
    if (error instanceof StaleFolder || this.folders.get(key) !== record) return;
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      const permission = await record.directory.queryPermission?.({ mode: "readwrite" }).catch(() => undefined);
      if (permission !== "granted") {
        record.permission = permission ?? "prompt";
        record.promptAnnounced = false;
        this.writable(key, record);
        this.publish();
        return;
      }
    }
    this.reportError(key, record, errorMessage(error));
  }

  private reportError(key: string, record: FolderRecord, message: string): void {
    const firstFailure = record.permission !== "error";
    record.permission = "error";
    record.message = message;
    this.publish();
    if (firstFailure && key === this.currentKey) {
      announce(`Could not write to the log folder ${record.directory.name}: ${message}. Logs are still saved in the browser.`, "assertive");
    }
  }

  private publish(): void {
    this.state.setState({ status: this.currentStatus() });
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
    const active = [...this.sessions.values()].find((tracked) =>
      tracked.key === key && tracked.endedAt === undefined && tracked.cursor?.bindingId === record.bindingId);
    const cursor = active?.cursor;
    return { kind: "ready", folderName, ...(cursor ? { filePath: `${cursor.folderName}/${partFileName(cursor)}` } : {}) };
  }
}

function defaultPicker(): (() => Promise<FileSystemDirectoryHandle>) | undefined {
  if (typeof window === "undefined" || typeof window.showDirectoryPicker !== "function") return undefined;
  const picker = window.showDirectoryPicker.bind(window);
  return () => picker({ id: "mongoose-logs", mode: "readwrite", startIn: "documents" });
}

function defaultLocks(): LockManagerLike | undefined {
  if (typeof navigator === "undefined" || !navigator.locks) return undefined;
  const locks = navigator.locks;
  return { request: (name, options, callback) => locks.request(name, options, callback) };
}

export const autoLogFolder = new AutoLogFolder({
  persistence: new IndexedDbLogFolderPersistence(),
  readEntries: (sessionId) => autoLogStore.getEntries(sessionId),
  readSession: (sessionId) => autoLogStore.getSession(sessionId),
  pickDirectory: defaultPicker(),
  locks: defaultLocks(),
});
