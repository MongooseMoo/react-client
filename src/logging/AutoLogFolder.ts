import { announce } from "@react-aria/live-announcer";
import { createStore, type StoreApi } from "zustand/vanilla";
import { requestToPromise, transactionDone } from "../persistence";
import { ownerKey, type PersonalDataOwner, usePersonalDataStore } from "../stores/personalDataStore";
import { useSessionStore } from "../stores/sessionStore";
import { autoLogEntryToPlainText } from "./AutoLogExport";
import { autoLogStore } from "./AutoLogStore";
import type { AutoLogEntry, AutoLogSession, AutoLogSink } from "./AutoLogTypes";

/**
 * Keeps a folder the player picked (File System Access API) holding each
 * autolog session as text files. The files are a projection of IndexedDB:
 * every file's bytes are a pure function of the session's IndexedDB record
 * and its binding (character name and base file name), so any render can be
 * repeated by any tab at any time and gives the same bytes. Nothing is
 * appended; the session's current part is rewritten whole.
 *
 * Files: `<Character>/<YYYY-MM-DD HH-MM-SS> <id>.txt`, then `... part 2.txt`
 * and so on, each at most maxPartBytes.
 *
 * Each signed-in character picks their own folder, and a session's lines only
 * go to the folder its own owner picked.
 */

export type LogFolderStatus =
  | { kind: "unsupported" }
  // No signed-in owner, or a temporary visit.
  | { kind: "unavailable" }
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "needs-permission"; folderName: string }
  | { kind: "ready"; folderName: string; filePath?: string }
  | { kind: "error"; folderName: string; message: string }
  // The folder settings themselves could not be read.
  | { kind: "storage-error"; message: string; blocked: boolean };

export type StoredFolder = {
  handle: FileSystemDirectoryHandle;
  // Changes every time the player chooses a folder; a session bound to an
  // earlier choice is not continued in a new one.
  bindingId: string;
};

// Where a session's current (last) part starts: its number, the first entry
// in it, how many bytes of that entry's rendered line earlier parts hold, and
// the day of the line before it (for the date separator).
export type PartMark = { part: number; sequence: number; offset: number; day: string };

/**
 * A session that belongs in a folder. Saved as soon as the session's owner has
 * a folder, before any permission or file work, so a later page can find it.
 * `mark` only saves re-reading earlier parts; without it a render starts
 * from part 1 and produces the same bytes.
 */
export type LogFileBinding = {
  sessionId: string;
  ownerKey: string;
  bindingId: string;
  folderName: string;
  character: string;
  // IANA zone every render formats times in, fixed when the session binds.
  timeZone: string;
  baseName: string;
  // The base name has been checked against existing files and saved.
  nameChecked: boolean;
  mark: PartMark;
};

export type SessionSnapshot = { session: AutoLogSession; entries: AutoLogEntry[] };

export interface LogFolderPersistence {
  getFolder(key: string): Promise<StoredFolder | undefined>;
  putFolder(key: string, folder: StoredFolder): Promise<void>;
  deleteFolder(key: string): Promise<void>;
  listBindings(key: string): Promise<LogFileBinding[]>;
  getBinding(sessionId: string): Promise<LogFileBinding | undefined>;
  putBinding(binding: LogFileBinding): Promise<void>;
  deleteBinding(sessionId: string): Promise<void>;
}

// The part of the Web Locks API used here; navigator.locks satisfies it.
export interface LockManagerLike {
  request(name: string, options: { ifAvailable?: boolean }, callback: (lock: unknown) => Promise<unknown>): Promise<unknown>;
}

export class StorageBlocked extends Error {
  constructor() {
    super("Another Mongoose tab is holding the log folder settings open");
    this.name = "StorageBlocked";
  }
}

const DATABASE_NAME = "mongoose-autolog-folders";
// 1: bare handle per owner. 2: { handle, bindingId } and cursors. 3: bindings
// replace cursors.
const DATABASE_VERSION = 3;
const FOLDER_STORE = "folders";
const BINDING_STORE = "bindings";
const BINDING_OWNER_INDEX = "ownerKey";

function upgradeFolderDatabase(database: IDBDatabase, oldVersion: number, transaction: IDBTransaction): void {
  if (!database.objectStoreNames.contains(FOLDER_STORE)) database.createObjectStore(FOLDER_STORE);
  if (database.objectStoreNames.contains("cursors")) database.deleteObjectStore("cursors");
  if (!database.objectStoreNames.contains(BINDING_STORE)) {
    database.createObjectStore(BINDING_STORE, { keyPath: "sessionId" }).createIndex(BINDING_OWNER_INDEX, "ownerKey", { unique: false });
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
}

// A blocked open is reported at once (another tab holds an older version
// open) and not cached; if the request succeeds after that, the connection is
// closed so the next attempt opens cleanly.
function openFolderDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    let settled = false;
    request.onupgradeneeded = (event) => {
      if (request.transaction) upgradeFolderDatabase(request.result, event.oldVersion, request.transaction);
    };
    request.onsuccess = () => {
      if (settled) {
        request.result.close();
        return;
      }
      settled = true;
      resolve(request.result);
    };
    request.onerror = () => {
      if (settled) return;
      settled = true;
      reject(request.error);
    };
    request.onblocked = () => {
      if (settled) return;
      settled = true;
      reject(new StorageBlocked());
    };
  });
}

// Directory handles are structured-cloneable, so IndexedDB keeps them across
// reloads; the browser asks again for permission when the page comes back.
export class IndexedDbLogFolderPersistence implements LogFolderPersistence {
  private db: Promise<IDBDatabase> | undefined;

  private open(): Promise<IDBDatabase> {
    if (!this.db) {
      const opening = openFolderDatabase().then((db) => {
        // Never hold up a newer version in another tab.
        db.onversionchange = () => {
          db.close();
          if (this.db === opening) this.db = undefined;
        };
        return db;
      });
      opening.catch(() => {
        if (this.db === opening) this.db = undefined;
      });
      this.db = opening;
    }
    return this.db;
  }

  close(): void {
    this.db?.then((db) => db.close(), () => {});
    this.db = undefined;
  }

  private async transaction(store: string, mode: IDBTransactionMode): Promise<IDBTransaction> {
    return (await this.open()).transaction(store, mode);
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

  async listBindings(key: string): Promise<LogFileBinding[]> {
    const transaction = await this.transaction(BINDING_STORE, "readonly");
    const bindings = await requestToPromise<LogFileBinding[]>(transaction.objectStore(BINDING_STORE).index(BINDING_OWNER_INDEX).getAll(key));
    await transactionDone(transaction);
    return bindings;
  }

  async getBinding(sessionId: string): Promise<LogFileBinding | undefined> {
    const transaction = await this.transaction(BINDING_STORE, "readonly");
    const binding = await requestToPromise<LogFileBinding | undefined>(transaction.objectStore(BINDING_STORE).get(sessionId));
    await transactionDone(transaction);
    return binding;
  }

  async putBinding(binding: LogFileBinding): Promise<void> {
    const transaction = await this.transaction(BINDING_STORE, "readwrite");
    transaction.objectStore(BINDING_STORE).put(binding);
    await transactionDone(transaction);
  }

  async deleteBinding(sessionId: string): Promise<void> {
    const transaction = await this.transaction(BINDING_STORE, "readwrite");
    transaction.objectStore(BINDING_STORE).delete(sessionId);
    await transactionDone(transaction);
  }
}

export const MAX_PART_BYTES = 1024 * 1024;
// Kept free in every part for the footer (the longest is about 40 bytes), so
// adding the footer never moves a part boundary or breaks the cap.
const FOOTER_RESERVE = 64;
const PAGE_CLOSED_FOOTER = "\nEnded: not recorded (the page closed)\n";
const LOCK_PREFIX = "mongoose-autolog-folder:";
const NAME_LOCK_PREFIX = "mongoose-log-name:";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const byteLength = (text: string) => encoder.encode(text).length;

// Times are always formatted in the session's own IANA time zone, saved in
// its binding, never the ambient one: a zone change between two renders
// would otherwise move date lines and shift every saved byte offset.
const formatters = new Map<string, Intl.DateTimeFormat>();
function zoned(time: number, timeZone: string): { day: string; time: string } {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    formatters.set(timeZone, formatter);
  }
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(time)) parts[part.type] = part.value;
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}:${parts.second}` };
}
const zonedStamp = (time: number, timeZone: string) => {
  const { day, time: clock } = zoned(time, timeZone);
  return `${day} ${clock}`;
};
const endedFooter = (endedAt: number, timeZone: string) => `\nEnded: ${zonedStamp(endedAt, timeZone)}\n`;
const ambientTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const HEADER_FIELD_BYTES = 256;

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

// The last 12 hex digits of a random UUID: collisions are not a practical
// concern, and an existing name is still checked before the first write.
function baseFileName(session: AutoLogSession, timeZone: string): string {
  const id = session.id.replace(/[^a-z0-9]/gi, "").slice(-12) || "session";
  return `${zonedStamp(session.startedAt, timeZone).replace(/:/g, "-")} ${id}`;
}

export function partFileName(baseName: string, part: number): string {
  return `${baseName}${part > 1 ? ` part ${part}` : ""}.txt`;
}

// The longest prefix of text within maxBytes, cut between code points; may
// be empty.
function utf8Prefix(text: string, maxBytes: number): string {
  let bytes = 0;
  let end = 0;
  for (const char of text) {
    const size = byteLength(char);
    if (bytes + size > maxBytes) break;
    bytes += size;
    end += char.length;
  }
  return text.slice(0, end);
}

// Header fields come from the server and the URL, so they are bounded.
function boundField(text: string): string {
  return byteLength(text) <= HEADER_FIELD_BYTES ? text : `${utf8Prefix(text, HEADER_FIELD_BYTES - byteLength("…"))}…`;
}

function partHeader(binding: LogFileBinding, session: AutoLogSession, part: number): string {
  const title = boundField(session.title || "Mongoose Client");
  const character = `Character: ${boundField(binding.character)}`;
  const started = `Started: ${zonedStamp(session.startedAt, binding.timeZone)}`;
  const lines = part === 1
    ? [title, character, started, ...(session.sanitizedUrl ? [`URL: ${boundField(session.sanitizedUrl)}`] : [])]
    : [`${title}, part ${part}`, character, started, `Continues from: ${partFileName(binding.baseName, part - 1)}`];
  return `${lines.join("\n")}\n\n`;
}

function renderLine(entry: AutoLogEntry, day: string, timeZone: string): { text: string; day: string } {
  const at = zoned(entry.timestamp, timeZone);
  const separator = at.day === day ? "" : `\n-- ${at.day} --\n`;
  const line = autoLogEntryToPlainText(entry).replace(/\r?\n$/, "");
  return { text: `${separator}[${at.time}] ${line}\n`, day: at.day };
}

// The widest UTF-8 code point: an empty part must have room for at least one.
const MAX_CODE_POINT_BYTES = 4;

/**
 * Renders a session's parts from `binding.mark` on. Pure: the same inputs
 * always give the same parts. Every part but the last is closed (no later
 * entry can land in it); the last is the current part, with the footer if
 * one is given. `entries` must start at `binding.mark.sequence`.
 */
export function renderLogParts(
  binding: LogFileBinding,
  session: AutoLogSession,
  entries: AutoLogEntry[],
  footer: string | undefined,
  maxPartBytes: number,
): { parts: Array<{ part: number; text: string }>; mark: PartMark } {
  const budget = maxPartBytes - FOOTER_RESERVE;
  // Every part must hold its header, the footer reserve and one code point,
  // or splitting an entry could never make progress.
  const header = (part: number) => {
    const text = partHeader(binding, session, part);
    if (byteLength(text) + MAX_CODE_POINT_BYTES > budget) {
      throw new Error(`Log part size ${maxPartBytes} is too small for its header`);
    }
    return text;
  };
  const parts: Array<{ part: number; text: string }> = [];
  let mark = binding.mark;
  let text = header(mark.part);
  let size = byteLength(text);
  let hasContent = false;
  let day = mark.day;

  const close = (next: PartMark) => {
    parts.push({ part: mark.part, text });
    mark = next;
    text = header(next.part);
    size = byteLength(text);
    hasContent = false;
  };

  entries.forEach((entry, index) => {
    const dayBefore = day;
    const line = renderLine(entry, day, binding.timeZone);
    let offset = index === 0 ? binding.mark.offset : 0;
    let rest = offset > 0 ? decoder.decode(encoder.encode(line.text).subarray(offset)) : line.text;
    while (true) {
      const restBytes = byteLength(rest);
      if (size + restBytes <= budget) {
        text += rest;
        size += restBytes;
        hasContent = true;
        break;
      }
      if (hasContent) {
        close({ part: mark.part + 1, sequence: entry.sequence, offset, day: dayBefore });
        continue;
      }
      // Too big even for an empty part: fill this one and carry on in the next.
      // The header check guarantees room for a code point, so this always
      // consumes some of the entry.
      const chunk = utf8Prefix(rest, budget - size);
      if (!chunk) throw new Error("Log part splitting made no progress");
      text += chunk;
      offset += byteLength(chunk);
      rest = rest.slice(chunk.length);
      close({ part: mark.part + 1, sequence: entry.sequence, offset, day: dayBefore });
    }
    day = line.day;
  });

  if (footer) text += footer;
  parts.push({ part: mark.part, text });
  return { parts, mark };
}

const sameMark = (a: PartMark, b: PartMark) => a.part === b.part && a.sequence === b.sequence && a.offset === b.offset && a.day === b.day;

type FolderRecord = {
  directory: FileSystemDirectoryHandle;
  bindingId: string;
  permission: PermissionState | "error";
  message?: string;
  // The "needs permission" notice is spoken once per page load per folder.
  promptAnnounced?: boolean;
};

// A session this page is logging. Bound (binding + lock) only once its
// owner has a folder.
type LiveSession = {
  session: AutoLogSession;
  key: string;
  binding?: LogFileBinding;
  releaseLock?: () => void;
  // Settles once the browser has actually let the session lock go.
  lockSettled?: Promise<unknown>;
  ended: boolean;
  queued: boolean;
};

type RenderMode = "live" | "orphan";

// Thrown when the folder a write started with is no longer the chosen one.
class StaleFolder extends Error {}

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

export type AutoLogFolderOptions = {
  persistence: LogFolderPersistence;
  // The session and its entries from a sequence on, in one consistent read.
  readSnapshot: (sessionId: string, fromSequence: number) => Promise<SessionSnapshot | undefined>;
  pickDirectory?: () => Promise<FileSystemDirectoryHandle>;
  // With Web Locks, a session another tab is writing is never recovered here.
  // Without them nothing is recovered at all: only this page's own live
  // sessions are written, and orphans wait for a page that has Web Locks.
  // (Every browser with the folder picker has Web Locks.)
  locks?: LockManagerLike;
  maxPartBytes?: number;
};

export class AutoLogFolder implements AutoLogSink {
  readonly state: StoreApi<{ status: LogFolderStatus }>;
  private readonly persistence: LogFolderPersistence;
  private readonly readSnapshot: AutoLogFolderOptions["readSnapshot"];
  private readonly pickDirectory?: () => Promise<FileSystemDirectoryHandle>;
  private readonly locks?: LockManagerLike;
  private readonly maxPartBytes: number;
  // A folder change replaces or clears the record; writes check theirs is
  // still the one here (assertLive) so they never land in a dropped folder.
  private readonly folders = new Map<string, FolderRecord | null>();
  private readonly loading = new Map<string, Promise<FolderRecord | null | undefined>>();
  private readonly storageErrors = new Map<string, { message: string; blocked: boolean }>();
  private readonly live = new Map<string, LiveSession>();
  private currentKey: string | undefined;
  private queue: Promise<void> = Promise.resolve();
  private unsubscribeOwner: (() => void) | undefined;
  private disposing: Promise<void> | undefined;

  constructor(options: AutoLogFolderOptions) {
    this.persistence = options.persistence;
    this.readSnapshot = options.readSnapshot;
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

  // Supported and not disposed: the only state that takes on new work.
  private get active(): boolean {
    return this.supported && !this.disposing;
  }

  /** Resolves once every queued folder task, including ones queued meanwhile, has settled. */
  async whenIdle(): Promise<void> {
    let queue: Promise<void>;
    do {
      queue = this.queue;
      await queue;
    } while (queue !== this.queue);
  }

  /**
   * Stops taking work and invalidates every write under way (each checks
   * before opening and before committing). Resolves once the queue has
   * drained; the session locks are released only then, so no other tab can
   * recover a session while a write of this page's could still land.
   */
  dispose(): Promise<void> {
    if (this.disposing) return this.disposing;
    this.unsubscribeOwner?.();
    this.unsubscribeOwner = undefined;
    this.disposing = (async () => {
      await this.whenIdle();
      const released = [...this.live.values()].map((live) => {
        const settled = live.lockSettled;
        this.unbind(live);
        return settled;
      });
      this.live.clear();
      await Promise.all(released);
    })();
    return this.disposing;
  }

  async syncOwner(): Promise<void> {
    if (!this.active) return;
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
    if (!key || !this.pickDirectory || !this.active) return;
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
    this.storageErrors.delete(key);
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
   * click: it needs the user's gesture), then renders everything owed.
   * After write errors it simply tries again.
   */
  async reconnect(): Promise<void> {
    const key = this.currentKey;
    const record = key ? this.folders.get(key) : undefined;
    if (!key || !record || !this.active) return;
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

  /** Reads the folder settings again after they could not be read. */
  async retry(): Promise<void> {
    const key = this.currentKey;
    if (!key || !this.active) return;
    this.storageErrors.delete(key);
    this.publish();
    const record = await this.loadFolder(key);
    this.publish();
    if (record) this.catchUp(key, record);
    await this.run(async () => {});
  }

  /** Resolves once no write to the folder can start or finish any more. */
  async stopUsing(): Promise<void> {
    const key = this.currentKey;
    const record = key ? this.folders.get(key) : undefined;
    if (!key || !record || !this.active) return;
    this.folders.set(key, null);
    for (const live of [...this.live.values()]) {
      if (live.key !== key) continue;
      this.unbind(live);
      if (live.ended) this.live.delete(live.session.id);
    }
    this.publish();
    const name = record.directory.name;
    await this.run(async () => {
      try {
        await this.persistence.deleteFolder(key);
        for (const binding of await this.persistence.listBindings(key)) await this.persistence.deleteBinding(binding.sessionId);
        announce(`Stopped saving logs to ${name}. Logs are still saved in the browser.`, "polite");
      } catch (error) {
        console.error("Failed to forget the log folder:", error);
        announce(`Stopped saving logs to ${name} for this visit, but the browser could not forget the folder, so it may come back after a reload. Logs are still saved in the browser.`, "assertive");
      }
    });
  }

  // The entries themselves are not needed: every render reads IndexedDB.
  append(session: AutoLogSession, _entries: AutoLogEntry[]): void {
    if (!this.active || !session.owner) return;
    let live = this.live.get(session.id);
    if (!live) {
      live = { session, key: ownerKey(session.owner), ended: false, queued: false };
      this.live.set(session.id, live);
    }
    this.schedule(live);
  }

  // Just one more render, queued after the earlier ones; it reads endedAt
  // and every remaining line from IndexedDB.
  sessionEnded(session: AutoLogSession, _endedAt: number): void {
    const live = this.live.get(session.id);
    if (!live || !this.active) return;
    live.ended = true;
    this.schedule(live);
  }

  private schedule(live: LiveSession): void {
    if (live.queued || !this.active) return;
    live.queued = true;
    this.enqueue(async () => {
      live.queued = false;
      await this.renderLive(live);
    });
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
    for (const live of this.live.values()) if (live.key === key) this.schedule(live);
    this.recover(key, record);
    this.enqueue(async () => this.publish());
  }

  // Undefined when the settings could not be read (kept until Try again);
  // null when the owner has no folder.
  private async loadFolder(key: string): Promise<FolderRecord | null | undefined> {
    if (this.folders.has(key)) return this.folders.get(key) ?? null;
    if (this.storageErrors.has(key)) return undefined;
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
          if (!this.folders.has(key)) {
            this.storageErrors.set(key, { message: errorMessage(error), blocked: error instanceof StorageBlocked });
            return undefined;
          }
        } finally {
          this.loading.delete(key);
        }
        const record = this.folders.get(key) ?? null;
        if (record?.permission === "granted") this.recover(key, record);
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
    if (this.disposing || this.folders.get(key) !== record) throw new StaleFolder();
  }

  // Takes the session's lock (so no other tab recovers it), then saves its
  // binding: nobody can see the binding without the lock already held.
  private async bind(live: LiveSession, record: FolderRecord): Promise<void> {
    this.assertLive(live.key, record);
    if (!live.releaseLock) {
      let granted = () => {};
      const lockHeld = new Promise<void>((resolve) => { granted = resolve; });
      let release = () => {};
      const held = new Promise<void>((resolve) => { release = resolve; });
      live.releaseLock = release;
      if (this.locks) {
        live.lockSettled = this.locks.request(LOCK_PREFIX + live.session.id, {}, () => {
          granted();
          return held;
        }).catch((error) => {
          console.error("Failed to lock the autolog session:", error);
          granted();
        });
        await lockHeld;
      }
    }
    this.assertLive(live.key, record);
    const { session } = live;
    const character = session.owner ? characterName(session.owner) : "";
    const timeZone = ambientTimeZone();
    const binding: LogFileBinding = {
      sessionId: session.id,
      ownerKey: live.key,
      bindingId: record.bindingId,
      folderName: sanitizeFolderName(character, "Character"),
      character,
      timeZone,
      baseName: baseFileName(session, timeZone),
      nameChecked: false,
      mark: { part: 1, sequence: 0, offset: 0, day: zoned(session.startedAt, timeZone).day },
    };
    live.binding = binding;
    try {
      await this.persistence.putBinding(binding);
    } catch (error) {
      // This page still writes it; only recovery after a reload is lost.
      console.error("Failed to save the log file binding:", error);
    }
  }

  private unbind(live: LiveSession): void {
    live.releaseLock?.();
    live.releaseLock = undefined;
    live.lockSettled = undefined;
    live.binding = undefined;
  }

  private drop(live: LiveSession): void {
    this.unbind(live);
    this.live.delete(live.session.id);
  }

  private async renderLive(live: LiveSession): Promise<void> {
    if (this.live.get(live.session.id) !== live) return;
    const record = await this.loadFolder(live.key);
    // Settings unreadable: keep the session for Try again.
    if (record === undefined) return;
    if (record === null) {
      // No folder: nothing is owed.
      if (live.ended) this.drop(live);
      return;
    }
    try {
      if (live.binding?.bindingId !== record.bindingId) await this.bind(live, record);
      this.assertLive(live.key, record);
      if (!this.writable(live.key, record) || !live.binding) return;
      const result = await this.renderBinding(live.binding, record, "live", (claimed) => { live.binding = claimed; });
      live.binding = result.binding;
      if (result.outcome === "complete" || result.outcome === "gone") {
        this.drop(live);
        await this.forgetBinding(live.session.id);
      }
      this.recovered(record);
      this.publish();
    } catch (error) {
      await this.handleWriteError(error, live.key, record);
    }
  }

  // Renders one session into the folder from IndexedDB. "gone": the session
  // was pruned, files left as they are. "complete": the footer is written.
  // onClaimed hears the claimed name at once, even if a write then fails, so
  // a retry never mistakes the session's own file for someone else's.
  private async renderBinding(
    start: LogFileBinding,
    record: FolderRecord,
    mode: RenderMode,
    onClaimed: (binding: LogFileBinding) => void = () => {},
  ): Promise<{ binding: LogFileBinding; outcome: "written" | "complete" | "gone" }> {
    let binding = start;
    const key = binding.ownerKey;
    const snapshot = await this.readSnapshot(binding.sessionId, binding.mark.sequence);
    this.assertLive(key, record);
    if (!snapshot) return { binding, outcome: "gone" };
    const { endedAt } = snapshot.session;
    const footer = endedAt !== undefined ? endedFooter(endedAt, binding.timeZone) : mode === "orphan" ? PAGE_CLOSED_FOOTER : undefined;

    const folder = await record.directory.getDirectoryHandle(binding.folderName, { create: true });
    this.assertLive(key, record);
    if (!binding.nameChecked) {
      binding = await this.claimName(binding, folder, record);
      onClaimed(binding);
    }
    const layout = renderLogParts(binding, snapshot.session, snapshot.entries, footer, this.maxPartBytes);
    for (const part of layout.parts) {
      await this.writeFile(folder, partFileName(binding.baseName, part.part), part.text, key, record);
    }
    if (!sameMark(layout.mark, binding.mark)) {
      binding = { ...binding, mark: layout.mark };
      try {
        await this.persistence.putBinding(binding);
      } catch (error) {
        // Costs a longer render next time, never wrong output.
        console.error("Failed to save the log file binding:", error);
      }
    }
    return { binding, outcome: footer ? "complete" : "written" };
  }

  // Before a session's first file: never take over an existing file. The
  // check, saving the claim, and creating the first file happen under one
  // Web Lock per name, so two tabs whose sessions share a base name cannot
  // both find it free. The claim is saved before anything is written, so a
  // later render reuses it instead of treating our file as someone else's.
  private async claimName(binding: LogFileBinding, folder: FileSystemDirectoryHandle, record: FolderRecord): Promise<LogFileBinding> {
    const original = binding.baseName;
    const claim = async (): Promise<LogFileBinding> => {
      let baseName = original;
      for (let copy = 2; await nameTaken(folder, partFileName(baseName, 1)); copy++) baseName = `${original} (${copy})`;
      this.assertLive(binding.ownerKey, record);
      const claimed = { ...binding, baseName, nameChecked: true };
      await this.persistence.putBinding(claimed);
      this.assertLive(binding.ownerKey, record);
      await folder.getFileHandle(partFileName(baseName, 1), { create: true });
      return claimed;
    };
    if (!this.locks) return claim();
    let claimed: LogFileBinding | undefined;
    await this.locks.request(`${NAME_LOCK_PREFIX}${binding.ownerKey}/${binding.folderName}/${original}`, {}, async () => {
      claimed = await claim();
    });
    if (!claimed) throw new Error("The log file name lock was not granted");
    return claimed;
  }

  private async writeFile(folder: FileSystemDirectoryHandle, name: string, text: string, key: string, record: FolderRecord): Promise<void> {
    const file = await folder.getFileHandle(name, { create: true });
    this.assertLive(key, record);
    const writable = await file.createWritable();
    try {
      this.assertLive(key, record);
      await writable.write(text);
      this.assertLive(key, record);
      await writable.close();
    } catch (error) {
      await writable.abort().catch(() => {});
      throw error;
    }
  }

  private async forgetBinding(sessionId: string): Promise<void> {
    try {
      await this.persistence.deleteBinding(sessionId);
    } catch (error) {
      // A later page renders it again: the same bytes, then forgets it.
      console.error("Failed to forget the log file binding:", error);
    }
  }

  // Renders sessions bound to this folder that no page here is writing:
  // ones a closed page left unfinished, or pruned ones to forget. Only with
  // Web Locks: without them a live tab's session cannot be told from a dead
  // page's, so orphans wait for a page that has them.
  private recover(key: string, record: FolderRecord): void {
    const locks = this.locks;
    if (!locks || !this.active) return;
    this.enqueue(async () => {
      if (this.disposing || this.folders.get(key) !== record || !this.writable(key, record)) return;
      let listed: LogFileBinding[];
      try {
        listed = await this.persistence.listBindings(key);
      } catch (error) {
        console.error("Failed to list log file bindings:", error);
        return;
      }
      for (const { sessionId } of listed) {
        if (this.live.has(sessionId) || this.folders.get(key) !== record) continue;
        const recoverOne = async () => {
          try {
            // Read again: another recoverer may have finished it meanwhile.
            const binding = await this.persistence.getBinding(sessionId);
            if (!binding || this.folders.get(key) !== record) return;
            if (binding.bindingId !== record.bindingId) {
              await this.forgetBinding(sessionId);
              return;
            }
            const result = await this.renderBinding(binding, record, "orphan");
            if (result.outcome === "complete" || result.outcome === "gone") await this.forgetBinding(sessionId);
            this.recovered(record);
          } catch (error) {
            await this.handleWriteError(error, key, record);
          }
        };
        await locks.request(LOCK_PREFIX + sessionId, { ifAvailable: true }, async (lock) => {
          if (lock) await recoverOne();
        });
      }
    });
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
    const storageError = this.storageErrors.get(key);
    if (storageError) return { kind: "storage-error", ...storageError };
    if (!this.folders.has(key)) return { kind: "loading" };
    const record = this.folders.get(key);
    if (!record) return { kind: "none" };
    const folderName = record.directory.name;
    if (record.permission === "error") return { kind: "error", folderName, message: record.message ?? "Unknown error" };
    if (record.permission !== "granted") return { kind: "needs-permission", folderName };
    const binding = [...this.live.values()].find((live) =>
      live.key === key && !live.ended && live.binding?.bindingId === record.bindingId && live.binding.nameChecked)?.binding;
    return { kind: "ready", folderName, ...(binding ? { filePath: `${binding.folderName}/${partFileName(binding.baseName, binding.mark.part)}` } : {}) };
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
  readSnapshot: (sessionId, fromSequence) => autoLogStore.getSessionSnapshot(sessionId, fromSequence),
  pickDirectory: defaultPicker(),
  locks: defaultLocks(),
});
