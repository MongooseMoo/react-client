import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePreferences } from "../stores/preferencesStore";
import { ownerKey, usePersonalDataStore, type PersonalDataOwner } from "../stores/personalDataStore";
import { useSessionStore } from "../stores/sessionStore";
import {
  AutoLogFolder,
  IndexedDbLogFolderPersistence,
  type LockManagerLike,
  type LogFileBinding,
  type LogFolderPersistence,
  renderLogParts,
  type SessionSnapshot,
  sanitizeFolderName,
  StorageBlocked,
  type StoredFolder,
} from "./AutoLogFolder";
import { AutoLogService } from "./AutoLogService";
import type { AutoLogStore } from "./AutoLogStore";
import type { AutoLogEntry, AutoLogSession, AutoLogSessionDraft } from "./AutoLogTypes";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ambientZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type Deferred = { promise: Promise<void>; resolve: () => void };
function deferred(): Deferred {
  let resolve = () => {};
  const promise = new Promise<void>((r) => { resolve = r; });
  return { promise, resolve };
}
type Hold = { entered: Deferred; release: Deferred };
const hold = (): Hold => ({ entered: deferred(), release: deferred() });

// In-memory stand-ins for the File System Access handles, faithful to the
// parts the sink uses: a writable starts empty unless keepExistingData is set,
// and nothing lands in the file until close().
class FakeFile {
  readonly kind = "file";
  bytes = new Uint8Array();
  writableOptions: Array<{ keepExistingData?: boolean } | undefined> = [];
  failWrites: DOMException | undefined;
  failOnce: DOMException | undefined;
  // Pauses the next write() on a writable until released.
  holdWrite: Hold | undefined;
  constructor(readonly name: string) {}

  get text(): string { return decoder.decode(this.bytes); }

  async getFile() {
    const bytes = this.bytes;
    return { size: bytes.length, slice: (start: number, end: number) => ({ text: async () => decoder.decode(bytes.slice(start, end)) }) };
  }

  async createWritable(options?: { keepExistingData?: boolean }) {
    this.writableOptions.push(options);
    if (this.failWrites) throw this.failWrites;
    if (this.failOnce) {
      const error = this.failOnce;
      this.failOnce = undefined;
      throw error;
    }
    let buffer = options?.keepExistingData ? this.bytes.slice() : new Uint8Array();
    let cursor = 0;
    return {
      seek: async (position: number) => { cursor = position; },
      write: async (text: string) => {
        const held = this.holdWrite;
        if (held) {
          this.holdWrite = undefined;
          held.entered.resolve();
          await held.release.promise;
        }
        const data = encoder.encode(text);
        const next = new Uint8Array(Math.max(buffer.length, cursor + data.length));
        next.set(buffer);
        next.set(data, cursor);
        buffer = next;
        cursor += data.length;
      },
      close: async () => { this.bytes = buffer; },
      abort: async () => {},
    };
  }
}

class FakeDirectory {
  readonly kind = "directory";
  files = new Map<string, FakeFile>();
  dirs = new Map<string, FakeDirectory>();
  permission: PermissionState = "granted";
  requestResult: PermissionState = "granted";
  // Pause the next directory or file lookup until released.
  holdDirectory: Hold | undefined;
  holdFile: Hold | undefined;
  // Pause the next lookup that would create a missing file.
  holdCreate: Hold | undefined;
  // Fail the next lookup that would create a missing file.
  failCreate: DOMException | undefined;
  // Fail the next removeEntry.
  failRemove: DOMException | undefined;
  removed: string[] = [];
  // The first file created anywhere below fails its first write.
  failFirstWrite: DOMException | undefined;
  private parent: FakeDirectory | undefined;
  constructor(readonly name: string) {}

  async getDirectoryHandle(name: string, options?: { create?: boolean }) {
    const held = this.holdDirectory;
    if (held) {
      this.holdDirectory = undefined;
      held.entered.resolve();
      await held.release.promise;
    }
    let dir = this.dirs.get(name);
    if (!dir) {
      if (!options?.create) throw new DOMException("missing", "NotFoundError");
      dir = new FakeDirectory(name);
      dir.parent = this;
      this.dirs.set(name, dir);
    }
    return dir;
  }

  async getFileHandle(name: string, options?: { create?: boolean }) {
    const held = this.holdFile;
    if (held) {
      this.holdFile = undefined;
      held.entered.resolve();
      await held.release.promise;
    }
    const creating = this.holdCreate;
    if (creating && options?.create && !this.files.has(name)) {
      this.holdCreate = undefined;
      creating.entered.resolve();
      await creating.release.promise;
    }
    const createFailure = this.failCreate;
    if (createFailure && options?.create && !this.files.has(name)) {
      this.failCreate = undefined;
      throw createFailure;
    }
    if (this.dirs.has(name)) throw new DOMException("is a folder", "TypeMismatchError");
    let file = this.files.get(name);
    if (!file) {
      if (!options?.create) throw new DOMException("missing", "NotFoundError");
      file = new FakeFile(name);
      const failing = this.parent ?? this;
      file.failOnce = failing.failFirstWrite;
      failing.failFirstWrite = undefined;
      this.files.set(name, file);
    }
    return file;
  }

  async removeEntry(name: string) {
    const failure = this.failRemove;
    if (failure) {
      this.failRemove = undefined;
      throw failure;
    }
    if (!this.files.delete(name)) throw new DOMException("missing", "NotFoundError");
    this.removed.push(name);
  }

  async queryPermission() { return this.permission; }
  async requestPermission() {
    this.permission = this.requestResult;
    return this.permission;
  }

  all(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const dir of this.dirs.values()) for (const file of dir.files.values()) out[`${dir.name}/${file.name}`] = file.text;
    return out;
  }

  file(path: string): FakeFile {
    const [dir, name] = path.split("/");
    const file = this.dirs.get(dir)?.files.get(name);
    if (!file) throw new Error(`no file ${path}; have ${Object.keys(this.all()).join(", ")}`);
    return file;
  }
}

class MemoryPersistence implements LogFolderPersistence {
  folders = new Map<string, StoredFolder>();
  bindings = new Map<string, LogFileBinding>();
  operations = 0;
  failPutFolder = false;
  failDeleteFolder = false;
  failNextDeleteBinding = false;
  // Fails the next getFolder with this error, then works.
  failNextGetFolder: Error | undefined;

  async getFolder(key: string) {
    this.operations++;
    const failure = this.failNextGetFolder;
    if (failure) {
      this.failNextGetFolder = undefined;
      throw failure;
    }
    return this.folders.get(key);
  }
  async putFolder(key: string, folder: StoredFolder) {
    this.operations++;
    if (this.failPutFolder) throw new Error("storage refused");
    this.folders.set(key, folder);
  }
  async deleteFolder(key: string) {
    this.operations++;
    if (this.failDeleteFolder) throw new Error("storage refused");
    this.folders.delete(key);
  }
  async listBindings(key: string) {
    this.operations++;
    return [...this.bindings.values()].filter((binding) => binding.ownerKey === key).map((binding) => structuredClone(binding));
  }
  async getBinding(sessionId: string) {
    this.operations++;
    const binding = this.bindings.get(sessionId);
    return binding && structuredClone(binding);
  }
  // Return true to make that putBinding fail.
  failPutBinding: ((binding: LogFileBinding) => boolean) | undefined;

  async putBinding(binding: LogFileBinding) {
    this.operations++;
    if (this.failPutBinding?.(binding)) throw new Error("storage refused");
    this.bindings.set(binding.sessionId, structuredClone(binding));
  }
  async deleteBinding(sessionId: string) {
    this.operations++;
    if (this.failNextDeleteBinding) {
      this.failNextDeleteBinding = false;
      throw new Error("storage refused");
    }
    this.bindings.delete(sessionId);
  }
}

// Web Locks shared by every "tab" in a test: contested requests wait their
// turn, ifAvailable gets null. die() is the tab closing.
class FakeLocks {
  private holders = new Map<string, symbol>();
  private waiters = new Map<string, Array<() => void>>();

  get held(): number { return this.holders.size; }

  forTab(): LockManagerLike & { die(): void } {
    const tab = Symbol("tab");
    const deaths: Array<() => void> = [];
    const release = (name: string) => {
      if (this.holders.get(name) !== tab) return;
      this.holders.delete(name);
      this.waiters.get(name)?.shift()?.();
    };
    const request: LockManagerLike["request"] = async (name, options, callback) => {
      while (this.holders.has(name)) {
        if (options.ifAvailable) return callback(null);
        await new Promise<void>((resolve) => { this.waiters.set(name, [...(this.waiters.get(name) ?? []), resolve]); });
      }
      this.holders.set(name, tab);
      const death = new Promise<void>((resolve) => { deaths.push(resolve); });
      try {
        return await Promise.race([callback({ name }), death]);
      } finally {
        release(name);
      }
    };
    return {
      request,
      die: () => {
        for (const [name, holder] of [...this.holders]) if (holder === tab) release(name);
        for (const die of deaths) die();
      },
    };
  }
}

const ownerA: PersonalDataOwner = { runtime: "live:test:1", playerUuid: "uuid-a", playerRef: "#10" };
const ownerB: PersonalDataOwner = { runtime: "live:test:1", playerUuid: "uuid-b", playerRef: "#20" };
const startedAt = new Date(2026, 9, 18, 14, 5, 12).getTime();
const pad12 = (n: number) => String(n).padStart(12, "0");
const sid = (n: number) => `00000000-0000-4000-8000-${pad12(n)}`;
const fileOf = (n: number, part = 1) => `Ada/2026-10-18 14-05-12 ${pad12(n)}${part > 1 ? ` part ${part}` : ""}.txt`;
const at = (hours: number, minutes: number, seconds: number, day = 18) => new Date(2026, 9, day, hours, minutes, seconds).getTime();

// null is a session with no owner; undefined would take the default.
function session(n: number, owner: PersonalDataOwner | null = ownerA, extra: Partial<AutoLogSession> = {}): AutoLogSession {
  return { id: sid(n), startedAt, title: "Mongoose Client - The Hall", mode: "default",
    sanitizedUrl: "https://example.test/?password=%5Bredacted%5D", lineCount: 0, byteEstimate: 0,
    ...(owner ? { owner } : {}), ...extra };
}

function entry(n: number, sequence: number, text: string, timestamp = startedAt + 1000 * (sequence + 1)): AutoLogEntry {
  return { sessionId: sid(n), sequence, timestamp, type: "serverMessage", sourceType: "ansi", sourceContent: text };
}

// The IndexedDB autolog contents the sink renders from.
let stored: AutoLogEntry[] = [];
let storedSessions: Map<string, AutoLogSession>;
let persistence: MemoryPersistence;
let locks: FakeLocks;
let root: FakeDirectory;
let picker: ReturnType<typeof vi.fn>;

async function readSnapshot(sessionId: string, fromSequence: number): Promise<SessionSnapshot | undefined> {
  const found = storedSessions.get(sessionId);
  if (!found) return undefined;
  return {
    session: found,
    entries: stored.filter((e) => e.sessionId === sessionId && e.sequence >= fromSequence).sort((a, b) => a.sequence - b.sequence),
  };
}

function signIn(owner: PersonalDataOwner | undefined, visitor = false) {
  usePersonalDataStore.setState({ owner, policyReady: true, visitor });
}

type MakeOptions = {
  pick?: boolean;
  maxPartBytes?: number;
  tab?: LockManagerLike;
  noLocks?: boolean;
  read?: (sessionId: string, fromSequence: number) => Promise<SessionSnapshot | undefined>;
};
function makeFolder(options: MakeOptions = {}) {
  return new AutoLogFolder({
    persistence,
    readSnapshot: options.read ?? readSnapshot,
    pickDirectory: options.pick === false ? undefined : picker,
    locks: options.noLocks ? undefined : (options.tab ?? locks.forTab()),
    ...(options.maxPartBytes ? { maxPartBytes: options.maxPartBytes } : {}),
  });
}

async function chosen(options: MakeOptions = {}) {
  const folder = makeFolder(options);
  await folder.syncOwner();
  await folder.choose();
  await folder.whenIdle();
  return folder;
}

// Puts entries in the fake IndexedDB (creating their session) and returns them.
function store(...entries: AutoLogEntry[]) {
  for (const e of entries) {
    const n = Number(e.sessionId.slice(-12));
    if (!storedSessions.has(e.sessionId)) storedSessions.set(e.sessionId, session(n));
  }
  stored.push(...entries);
  return entries;
}

function endStored(n: number, endedAt: number) {
  const found = storedSessions.get(sid(n)) ?? session(n);
  storedSessions.set(sid(n), { ...found, endedAt });
}

function remember(owner: PersonalDataOwner, directory: FakeDirectory, bindingId = "binding-1") {
  persistence.folders.set(ownerKey(owner), { handle: directory as unknown as FileSystemDirectoryHandle, bindingId });
}

const storedEntries = (n: number) => stored.filter((e) => e.sessionId === sid(n)).sort((a, b) => a.sequence - b.sequence);
const partName = (base: string, part: number) => `${base}${part > 1 ? ` part ${part}` : ""}.txt`;
const zonedDay = (time: number) => new Intl.DateTimeFormat("en-CA", { timeZone: ambientZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(time);
const lineTexts = (text: string) => text.split("\n").filter((line) => line.startsWith("[")).map((line) => line.replace(/^\[[^\]]+\] /, ""));
const footers = (text: string) => text.split("\n").filter((line) => line.startsWith("Ended:"));
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const sortedParts = (files: Record<string, string>) =>
  Object.keys(files).sort((a, b) => a.length - b.length || a.localeCompare(b, undefined, { numeric: true }));

describe("AutoLogFolder", () => {
  beforeEach(() => {
    announce.mockClear();
    stored = [];
    storedSessions = new Map();
    persistence = new MemoryPersistence();
    locks = new FakeLocks();
    root = new FakeDirectory("Mongoose logs");
    picker = vi.fn(async () => root);
    useSessionStore.setState({ playerName: "Ada", playerUuid: "uuid-a", playerId: "#10" });
    signIn(ownerA);
  });

  it("touches no storage at all without the File System Access API", async () => {
    const folder = makeFolder({ pick: false });
    await folder.syncOwner();
    signIn(ownerB);
    await folder.syncOwner();
    folder.append(session(1), store(entry(1, 0, "hello")));
    folder.sessionEnded(session(1), startedAt + 5000);
    await folder.choose();
    await folder.reconnect();
    await folder.retry();
    await folder.stopUsing();
    await folder.whenIdle();
    expect(folder.state.getState().status).toEqual({ kind: "unsupported" });
    expect(persistence.operations).toBe(0);
    expect(locks.held).toBe(0);
    folder.dispose();
  });

  it("writes a header and timestamped lines, rewriting the current part whole each time", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    await folder.choose();
    await folder.whenIdle();
    expect(persistence.folders.get(ownerKey(ownerA))?.handle).toBe(root);
    expect(announce).toHaveBeenCalledWith("Saving logs to the folder Mongoose logs.", "polite");

    folder.append(session(1), store(entry(1, 0, "\x1b[1mYou arrive.\x1b[0m"), entry(1, 1, "Bob waves.\r\n")));
    await folder.whenIdle();
    folder.append(session(1), store(entry(1, 2, "Line three")));
    await folder.whenIdle();

    const file = root.file(fileOf(1));
    expect(file.text).toBe([
      "Mongoose Client - The Hall",
      `Session: ${sid(1)}`,
      "Character: Ada",
      "Started: 2026-10-18 14:05:12",
      "URL: https://example.test/?password=%5Bredacted%5D",
      "",
      "[14:05:13] You arrive.",
      "[14:05:14] Bob waves.",
      "[14:05:15] Line three",
      "",
    ].join("\n"));
    // The client owns the file: the name claim's placeholder, then each
    // render, replaces it; nothing appends.
    expect(file.writableOptions).toEqual([undefined, undefined, undefined]);
    expect(folder.state.getState().status).toEqual({ kind: "ready", folderName: "Mongoose logs", filePath: fileOf(1) });
    folder.dispose();
  });

  it("marks a new day inside a session that crosses midnight", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "late"), entry(1, 1, "early", at(0, 0, 3, 19))));
    await folder.whenIdle();
    expect(root.file(fileOf(1)).text).toContain("[14:05:13] late\n\n-- 2026-10-19 --\n[00:00:03] early\n");
    folder.dispose();
  });

  it("re-rendering gives identical bytes", async () => {
    const binding: LogFileBinding = {
      sessionId: sid(1), ownerKey: "a", bindingId: "b", folderName: "Ada", character: "Ada", timeZone: ambientZone,
      baseName: "base", nameChecked: true, mark: { part: 1, sequence: 0, offset: 0, day: "2026-10-18" },
    };
    const entries = [entry(1, 0, "x".repeat(150)), entry(1, 1, "é".repeat(200)), entry(1, 2, "tail", at(0, 0, 1, 19))];
    const first = renderLogParts(binding, session(1), entries, "\nEnded: 2026-10-19 00:00:05\n", 300);
    const second = renderLogParts(structuredClone(binding), session(1), structuredClone(entries), "\nEnded: 2026-10-19 00:00:05\n", 300);
    expect(second).toEqual(first);

    // And in a folder: rendering the same session again leaves the same bytes.
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "one"), entry(1, 1, "two")));
    await folder.whenIdle();
    const before = root.file(fileOf(1)).text;
    await folder.reconnect();
    await folder.whenIdle();
    expect(root.file(fileOf(1)).text).toBe(before);
    // Placeholder, first render, second render.
    expect(root.file(fileOf(1)).writableOptions.length).toBe(3);
    folder.dispose();
  });

  it("keeps every part, footer included, within the cap, splitting an entry too big for one part", async () => {
    const cap = 300;
    const folder = await chosen({ maxPartBytes: cap });
    const big = `${"0123456789".repeat(60)}é€`;
    const lines = [`small ${"a".repeat(20)}`, big, ...Array.from({ length: 8 }, (_, i) => `line ${i} ${"b".repeat(30)}`)];
    folder.append(session(1), store(...lines.map((text, sequence) => entry(1, sequence, text))));
    await folder.whenIdle();
    endStored(1, at(15, 0, 0));
    folder.sessionEnded(session(1), at(15, 0, 0));
    await folder.whenIdle();

    const files = root.all();
    const parts = sortedParts(files);
    expect(parts.length).toBeGreaterThan(3);
    for (const name of parts) expect(encoder.encode(files[name]).length).toBeLessThanOrEqual(cap);
    // Strip the headers and join the parts: the session text comes back whole.
    const bodies = parts.map((name) => files[name].slice(files[name].indexOf("\n\n") + 2)).join("");
    expect(bodies).toContain(`[14:05:14] ${big}\n`);
    expect(lineTexts(bodies)).toEqual(lines);
    expect(footers(bodies)).toEqual(["Ended: 2026-10-18 15:00:00"]);
    expect(files[parts[1]].split("\n").slice(0, 5)).toEqual([
      "Mongoose Client - The Hall, part 2",
      `Session: ${sid(1)}`,
      "Character: Ada",
      "Started: 2026-10-18 14:05:12",
      `Continues from: ${fileOf(1).split("/")[1]}`,
    ]);
    folder.dispose();
  });

  it("writes every batch when the session ends behind a folder backlog (real AutoLogService)", async () => {
    // The service's own store doubles as the folder's IndexedDB source.
    const sessions = new Map<string, AutoLogSession>();
    const entries: AutoLogEntry[] = [];
    const serviceStore = {
      async createSession(draft: AutoLogSessionDraft) {
        const created: AutoLogSession = { id: sid(1), startedAt, lineCount: 0, byteEstimate: 0, ...draft };
        sessions.set(created.id, created);
        return created;
      },
      async appendEntries(batch: AutoLogEntry[]) { entries.push(...batch); },
      async pruneToMaxBytes() {},
      async endSession(id: string, endedAt: number) {
        const found = sessions.get(id);
        if (found) sessions.set(id, { ...found, endedAt });
      },
    };
    const folder = await chosen({
      read: async (id, from) => {
        const found = sessions.get(id);
        return found ? { session: found, entries: entries.filter((e) => e.sessionId === id && e.sequence >= from) } : undefined;
      },
    });
    const service = new AutoLogService(serviceStore as unknown as AutoLogStore, folder);
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1e9 });
    service.configureSession({ title: "Mongoose Client - The Hall", mode: "default", sanitizedUrl: "", owner: ownerA });

    const held = hold();
    root.holdDirectory = held;
    for (const text of ["batch 0", "batch 1", "batch 2"]) {
      service.recordLine({ type: "serverMessage", sourceType: "ansi", sourceContent: text });
      await tick();
      await service.flush();
    }
    await service.endSession();
    held.release.resolve();
    await folder.whenIdle();

    const text = root.file(fileOf(1)).text;
    expect(lineTexts(text)).toEqual(["batch 0", "batch 1", "batch 2"]);
    expect(footers(text)).toHaveLength(1);
    expect(persistence.bindings.size).toBe(0);
    service.dispose();
    folder.dispose();
  });

  it("writes the footer once even when a recovery repeats the finished render", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    page1.append(session(1), store(entry(1, 0, "zero")));
    await page1.whenIdle();
    persistence.failNextDeleteBinding = true;
    endStored(1, at(14, 5, 15));
    page1.sessionEnded(session(1), at(14, 5, 15));
    await page1.whenIdle();
    expect(persistence.bindings.size).toBe(1);
    page1.dispose();
    tab1.die();

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    const text = root.file(fileOf(1)).text;
    expect(footers(text)).toEqual(["Ended: 2026-10-18 14:05:15"]);
    expect(lineTexts(text)).toEqual(["zero"]);
    expect(persistence.bindings.size).toBe(0);
    page2.dispose();
  });

  it("two recoverers of the same session give one copy", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    page1.append(session(1), store(entry(1, 0, "zero")));
    await page1.whenIdle();
    store(entry(1, 1, "one"));
    endStored(1, at(14, 30, 0));
    page1.dispose();
    tab1.die();

    // Page 3 looks while page 2 is part-way through recovering it.
    const held = hold();
    root.holdDirectory = held;
    const page2 = makeFolder();
    const page3 = makeFolder();
    void page2.syncOwner();
    await held.entered.promise;
    await page3.syncOwner();
    await page3.whenIdle();
    held.release.resolve();
    await page2.whenIdle();
    // And once more after page 2 has finished and forgotten it.
    await page3.retry();
    await page3.whenIdle();

    const files = root.all();
    expect(Object.keys(files)).toEqual([fileOf(1)]);
    expect(lineTexts(files[fileOf(1)])).toEqual(["zero", "one"]);
    expect(footers(files[fileOf(1)])).toEqual(["Ended: 2026-10-18 14:30:00"]);
    page2.dispose();
    page3.dispose();
  });

  it("finds after a reload a session that never got a single write", async () => {
    root.permission = "prompt";
    remember(ownerA, root);
    const tab1 = locks.forTab();
    const page1 = makeFolder({ tab: tab1 });
    await page1.syncOwner();
    page1.append(session(1), store(entry(1, 0, "while disconnected")));
    await page1.whenIdle();
    expect(root.all()).toEqual({});
    expect(persistence.bindings.size).toBe(1);
    page1.dispose();
    tab1.die();

    root.permission = "granted";
    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    const text = root.file(fileOf(1)).text;
    expect(lineTexts(text)).toEqual(["while disconnected"]);
    expect(footers(text)).toEqual(["Ended: not recorded (the page closed)"]);
    page2.dispose();
  });

  it("leaves the files alone and invents no footer when the session was pruned", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    page1.append(session(1), store(entry(1, 0, "zero")));
    await page1.whenIdle();
    const before = root.file(fileOf(1)).text;
    page1.dispose();
    tab1.die();
    storedSessions.delete(sid(1));
    stored = [];

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    expect(root.file(fileOf(1)).text).toBe(before);
    expect(persistence.bindings.size).toBe(0);
    page2.dispose();
  });

  it("without Web Locks, writes only its own sessions and leaves every orphan for a page that has them", async () => {
    remember(ownerA, root);
    const base = { ownerKey: ownerKey(ownerA), bindingId: "binding-1", folderName: "Ada", character: "Ada", timeZone: ambientZone, nameChecked: false };
    const mark = { part: 1, sequence: 0, offset: 0, day: "2026-10-18" };
    const bind = (n: number) => persistence.bindings.set(sid(n), { ...base, sessionId: sid(n), baseName: `2026-10-18 14-05-12 ${pad12(n)}`, mark });
    bind(1);
    store(entry(1, 0, "ended"));
    endStored(1, at(14, 30, 0));
    bind(2); // pruned: no session in IndexedDB

    const folder = makeFolder({ noLocks: true });
    await folder.syncOwner();
    await folder.whenIdle();
    expect(root.all()).toEqual({});
    expect([...persistence.bindings.keys()]).toEqual([sid(1), sid(2)]);

    folder.append(session(3), store(entry(3, 0, "this page's own")));
    await folder.whenIdle();
    expect(Object.keys(root.all())).toEqual([fileOf(3)]);
    folder.dispose();
  });

  it("takes no locks and keeps nothing for sessions when no folder is chosen", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    for (let n = 1; n <= 12; n++) {
      folder.append(session(n), store(entry(n, 0, "line")));
      endStored(n, at(15, 0, 0));
      folder.sessionEnded(session(n), at(15, 0, 0));
    }
    await folder.whenIdle();
    expect(locks.held).toBe(0);
    expect(persistence.bindings.size).toBe(0);
    folder.dispose();
  });

  it("releases its locks when disposed, and takes on no new work", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "line")));
    await folder.whenIdle();
    expect(locks.held).toBe(1);
    await folder.dispose();
    expect(locks.held).toBe(0);
    folder.append(session(2), store(entry(2, 0, "after dispose")));
    await folder.whenIdle();
    expect(locks.held).toBe(0);
    expect(Object.keys(root.all())).toEqual([fileOf(1)]);
  });

  for (const stage of ["lookup", "write"] as const) {
    it(`keeps its lock until a render caught mid-${stage} has stopped, then a recoverer finishes the session`, async () => {
      const page1 = await chosen();
      page1.append(session(1), store(entry(1, 0, "zero")));
      await page1.whenIdle();

      const held = hold();
      if (stage === "lookup") root.holdDirectory = held;
      else root.file(fileOf(1)).holdWrite = held;
      page1.append(session(1), store(entry(1, 1, "one")));
      await held.entered.promise;
      const disposing = page1.dispose();
      store(entry(1, 2, "two"));

      // While the old render is still held, its session is not up for recovery.
      const page2 = makeFolder();
      await page2.syncOwner();
      await page2.whenIdle();
      expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["zero"]);

      held.release.resolve();
      await disposing;
      expect(locks.held).toBe(0);
      expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["zero"]);

      await page2.retry();
      await page2.whenIdle();
      const text = root.file(fileOf(1)).text;
      expect(lineTexts(text)).toEqual(["zero", "one", "two"]);
      expect(footers(text)).toEqual(["Ended: not recorded (the page closed)"]);
      page2.dispose();
    });
  }

  it("claims a file name under a lock, so two tabs with the same 12-digit suffix get separate files", async () => {
    remember(ownerA, root);
    const ada = await root.getDirectoryHandle("Ada", { create: true });
    const tabA = makeFolder();
    const tabB = makeFolder();
    await tabA.syncOwner();
    await tabB.syncOwner();
    const a = session(1, ownerA, { id: "00000000-0000-4000-8000-000000000001" });
    const b = session(1, ownerA, { id: "11111111-1111-4111-8111-000000000001" });
    storedSessions.set(a.id, a);
    storedSessions.set(b.id, b);
    stored.push({ ...entry(1, 0, "TAB A"), sessionId: a.id }, { ...entry(1, 0, "TAB B"), sessionId: b.id });

    // Tab A has checked the name is free and is about to create the file.
    const held = hold();
    ada.holdCreate = held;
    tabA.append(a, []);
    await held.entered.promise;
    tabB.append(b, []);
    await tick();
    held.release.resolve();
    await Promise.all([tabA.whenIdle(), tabB.whenIdle()]);

    const files = root.all();
    expect(Object.keys(files).sort()).toEqual(["Ada/2026-10-18 14-05-12 000000000001 (2).txt", "Ada/2026-10-18 14-05-12 000000000001.txt"]);
    expect(Object.values(files).map(lineTexts).sort()).toEqual([["TAB A"], ["TAB B"]]);
    tabA.dispose();
    tabB.dispose();
  });

  for (const stored of [undefined, "Not/A_Zone"] as const) {
    it(`re-renders a session from part 1 when its saved binding has ${stored ? "an invalid" : "no"} time zone`, async () => {
      const cap = 300;
      // A binding as the build before time zones saved it, with a mark that
      // splits an entry, and parts rendered in some other zone.
      const late = { ...session(1), startedAt: Date.UTC(2026, 9, 18, 23, 50) };
      storedSessions.set(sid(1), late);
      store(entry(1, 0, "before midnight UTC", Date.UTC(2026, 9, 18, 23, 55)), entry(1, 1, `${"y".repeat(500)} end`, Date.UTC(2026, 9, 19, 0, 10)));
      const elsewhere: LogFileBinding = {
        sessionId: sid(1), ownerKey: ownerKey(ownerA), bindingId: "binding-1", folderName: "Ada", character: "Ada",
        timeZone: "Pacific/Kiritimati", baseName: "base", nameChecked: true, mark: { part: 1, sequence: 0, offset: 0, day: "2026-10-19" },
      };
      const old = renderLogParts(elsewhere, late, storedEntries(1), undefined, cap);
      expect(old.mark.offset).toBeGreaterThan(0);
      const ada = await root.getDirectoryHandle("Ada", { create: true });
      for (const part of old.parts) {
        const file = await ada.getFileHandle(partName("base", part.part), { create: true });
        file.bytes = encoder.encode(part.text);
      }
      const { timeZone: _dropped, ...withoutZone } = { ...elsewhere, mark: old.mark };
      persistence.bindings.set(sid(1), (stored === undefined ? withoutZone : { ...withoutZone, timeZone: stored }) as LogFileBinding);
      remember(ownerA, root);

      const folder = makeFolder({ maxPartBytes: cap });
      await folder.syncOwner();
      await folder.whenIdle();

      // Every part is now the render in this machine's zone, footer included.
      const expected = renderLogParts({ ...elsewhere, timeZone: ambientZone, mark: { part: 1, sequence: 0, offset: 0, day: zonedDay(late.startedAt) } },
        late, storedEntries(1), "\nEnded: not recorded (the page closed)\n", cap);
      const files = root.all();
      for (const part of expected.parts) expect(files[`Ada/${partName("base", part.part)}`]).toBe(part.text);
      const body = expected.parts.map((p) => p.text.slice(p.text.indexOf("\n\n") + 2)).join("");
      expect(body).toContain(`${"y".repeat(500)} end`);
      expect(persistence.bindings.size).toBe(0);
      folder.dispose();
    });
  }

  it("un-claims a name when creating the first file fails, so the next try claims it again", async () => {
    const folder = await chosen();
    const ada = await root.getDirectoryHandle("Ada", { create: true });
    ada.failCreate = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session(1), store(entry(1, 0, "first")));
    await folder.whenIdle();
    expect(persistence.bindings.get(sid(1))?.nameChecked).toBe(false);
    expect(root.all()).toEqual({});

    folder.append(session(1), store(entry(1, 1, "second")));
    await folder.whenIdle();
    expect(Object.keys(root.all())).toEqual([fileOf(1)]);
    expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["first", "second"]);
    folder.dispose();
  });

  it("keys the name lock on the destination folder, not the owner", async () => {
    const requested: string[] = [];
    const tab = locks.forTab();
    const recording: LockManagerLike = {
      request: (name, options, callback) => {
        requested.push(name);
        return tab.request(name, options, callback);
      },
    };
    const folder = await chosen({ tab: recording });
    folder.append(session(1), store(entry(1, 0, "line")));
    await folder.whenIdle();
    expect(requested.filter((name) => name.startsWith("mongoose-log-name:"))).toEqual([
      `mongoose-log-name:Mongoose logs/Ada/2026-10-18 14-05-12 ${pad12(1)}`,
    ]);
    folder.dispose();
  });

  // Shared by the rebuild tests: parts written at a small cap in an earlier
  // build, a binding with an invalid zone pointing at the last of them, and
  // (optionally) one of those parts replaced by someone else's file.
  async function staleRebuild(options: { foreignText?: string } = {}) {
    const lines = Array.from({ length: 10 }, (_, i) => `line ${i} ${"a".repeat(30)}`);
    store(...lines.map((text, sequence) => entry(1, sequence, text)));
    const binding: LogFileBinding = {
      sessionId: sid(1), ownerKey: ownerKey(ownerA), bindingId: "binding-1", folderName: "Ada", character: "Ada",
      timeZone: ambientZone, baseName: "base", nameChecked: true, mark: { part: 1, sequence: 0, offset: 0, day: "2026-10-18" },
    };
    const old = renderLogParts(binding, session(1), storedEntries(1), undefined, 250);
    const ada = await root.getDirectoryHandle("Ada", { create: true });
    for (const part of old.parts) {
      const file = await ada.getFileHandle(partName("base", part.part), { create: true });
      file.bytes = encoder.encode(part.text);
    }
    let foreignName: string | undefined;
    if (options.foreignText !== undefined) {
      foreignName = partName("base", old.parts.length - 1);
      const foreign = await ada.getFileHandle(foreignName, { create: true });
      foreign.bytes = encoder.encode(options.foreignText);
    }
    persistence.bindings.set(sid(1), { ...binding, timeZone: "Not/A_Zone", mark: old.mark });
    remember(ownerA, root);
    const expected = renderLogParts({ ...binding, mark: { part: 1, sequence: 0, offset: 0, day: zonedDay(startedAt) } },
      session(1), storedEntries(1), "\nEnded: not recorded (the page closed)\n", 300);
    expect(expected.parts.length).toBeLessThan(old.parts.length - 1);
    return { lines, ada, old, expected, foreignName };
  }

  const foreignFiles: Array<[string, string]> = [
    ["another session's file", "Someone's notes\nSession: someone-else\n\nkeep me\n"],
    ["a file quoting our Session line in its body", `My notes\nabout the game\n\nSession: ${sid(1)}\nCharacter: Ada\nkeep me\n`],
    ["a file with our Session line second but not our layout", `Pasted\nSession: ${sid(1)}\nNotes: mine\nkeep me\n`],
    ["a file with our Session line first", `Session: ${sid(1)}\nCharacter: Ada\nkeep me\n`],
  ];

  for (const [label, foreignText] of foreignFiles) {
    it(`after a rebuild that needs fewer parts, removes its own leftovers but never ${label}`, async () => {
      const { lines, ada, expected, foreignName } = await staleRebuild({ foreignText });
      const folder = makeFolder({ maxPartBytes: 300 });
      await folder.syncOwner();
      await folder.whenIdle();

      const names = expected.parts.map((part) => partName("base", part.part));
      expect([...ada.files.keys()].sort()).toEqual([...names, foreignName].sort());
      expect(ada.files.get(foreignName ?? "")?.text).toBe(foreignText);
      expect(ada.removed).not.toContain(foreignName);
      const joined = names.map((name) => {
        const text = ada.files.get(name)?.text ?? "";
        return text.slice(text.indexOf("\n\n") + 2);
      }).join("");
      expect(lineTexts(joined)).toEqual(lines);
      expect(footers(joined)).toEqual(["Ended: not recorded (the page closed)"]);
      expect(persistence.bindings.size).toBe(0);
      folder.dispose();
    });
  }

  it("recognises its own parts, first and continuation, even with a title that tries to look like a header", async () => {
    const tricky = session(1, ownerA, { title: "Session: fake\nCharacter: nobody" });
    storedSessions.set(tricky.id, tricky);
    const folder = await chosen({ maxPartBytes: 300 });
    for (let sequence = 0; sequence < 8; sequence++) {
      folder.append(tricky, store(entry(1, sequence, `line ${sequence} ${"b".repeat(30)}`)));
      await folder.whenIdle();
    }
    const files = root.all();
    const parts = sortedParts(files);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((name) => !name.includes("(2)"))).toBe(true);
    expect(files[parts[0]].split("\n").slice(0, 3)).toEqual([
      "Title: Session: fake Character: nobody", `Session: ${sid(1)}`, "Character: Ada",
    ]);
    expect(files[parts[1]].split("\n")[1]).toBe(`Session: ${sid(1)}`);
    // Entries can be split across parts at this cap: join the bodies first.
    const bodies = parts.map((name) => files[name].slice(files[name].indexOf("\n\n") + 2)).join("");
    expect(lineTexts(bodies)).toEqual(Array.from({ length: 8 }, (_, i) => `line ${i} ${"b".repeat(30)}`));
    folder.dispose();
  });

  it("keeps the cleanup owed when removing a leftover part fails, and finishes it on the next try", async () => {
    const { lines, ada, old, expected } = await staleRebuild();
    ada.failRemove = new DOMException("The file is in use", "NoModificationAllowedError");
    const folder = makeFolder({ maxPartBytes: 300 });
    await folder.syncOwner();
    await folder.whenIdle();
    expect(folder.state.getState().status.kind).toBe("error");
    expect(persistence.bindings.get(sid(1))?.rebuildFrom).toEqual({ parts: old.parts.length });
    expect(ada.files.size).toBeGreaterThan(expected.parts.length);

    await folder.reconnect();
    await folder.whenIdle();
    const names = expected.parts.map((part) => partName("base", part.part));
    expect([...ada.files.keys()].sort()).toEqual([...names].sort());
    expect(lineTexts(names.map((name) => ada.files.get(name)?.text ?? "").join(""))).toEqual(lines);
    expect(persistence.bindings.size).toBe(0);
    folder.dispose();
  });

  it("after a failed rollback and a rival taking the name, recovery writes under a new name and leaves the rival alone", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    let claimSaved = false;
    persistence.failPutBinding = (binding) => {
      if (binding.nameChecked) {
        claimSaved = true;
        return false;
      }
      return claimSaved;
    };
    const ada = await root.getDirectoryHandle("Ada", { create: true });
    ada.failCreate = new DOMException("The disk is full", "QuotaExceededError");
    page1.append(session(1), store(entry(1, 0, "mine")));
    await page1.whenIdle();
    // The claim stayed saved although no file reserves the name.
    expect(persistence.bindings.get(sid(1))?.nameChecked).toBe(true);
    expect(root.all()).toEqual({});
    persistence.failPutBinding = undefined;
    page1.dispose();
    tab1.die();

    const rivalText = "Rival title\nSession: rival-session\nCharacter: Ada\n\n[09:00:00] not yours\n";
    const rival = await ada.getFileHandle(fileOf(1).split("/")[1], { create: true });
    rival.bytes = encoder.encode(rivalText);
    const rivalWrites = rival.writableOptions.length;

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    expect(rival.text).toBe(rivalText);
    expect(rival.writableOptions.length).toBe(rivalWrites);
    const ours = root.file(fileOf(1).replace(".txt", " (2).txt")).text;
    expect(ours.split("\n")[1]).toBe(`Session: ${sid(1)}`);
    expect(lineTexts(ours)).toEqual(["mine"]);
    page2.dispose();
  });

  for (const [label, foreignText] of foreignFiles) {
    it(`never writes into ${label} sitting at its name`, async () => {
      const folder = await chosen();
      folder.append(session(1), store(entry(1, 0, "one")));
      await folder.whenIdle();
      const file = root.file(fileOf(1));
      file.bytes = encoder.encode(foreignText);
      const writes = file.writableOptions.length;

      folder.append(session(1), store(entry(1, 1, "two")));
      await folder.whenIdle();
      expect(file.text).toBe(foreignText);
      expect(file.writableOptions.length).toBe(writes);
      expect(lineTexts(root.file(fileOf(1).replace(".txt", " (2).txt")).text)).toEqual(["one", "two"]);
      folder.dispose();
    });
  }

  it("abandons a Choose that is still open when the sink is disposed", async () => {
    let pick = (_directory: FakeDirectory) => {};
    picker.mockImplementationOnce(() => new Promise((resolve) => { pick = resolve; }));
    const folder = makeFolder();
    await folder.syncOwner();
    const choosing = folder.choose();
    await folder.dispose();
    pick(root);
    await choosing;
    expect(persistence.folders.size).toBe(0);
    expect(announce).not.toHaveBeenCalled();
    expect(folder.state.getState().status).toEqual({ kind: "none" });
  });

  it("renders in the session's own time zone, never the ambient one, so a resumed render matches", async () => {
    // Two zones on opposite sides of the date line, neither of them likely
    // to be the machine's: whatever the ambient zone is, it is not used.
    const late = { ...session(1), startedAt: Date.UTC(2026, 9, 18, 23, 50) };
    const entries = [entry(1, 0, "before midnight UTC", Date.UTC(2026, 9, 18, 23, 55)), entry(1, 1, `${"y".repeat(400)} end`, Date.UTC(2026, 9, 19, 0, 10))];
    const bound = (timeZone: string): LogFileBinding => ({
      sessionId: sid(1), ownerKey: "a", bindingId: "b", folderName: "Ada", character: "Ada", timeZone,
      baseName: "base", nameChecked: true, mark: { part: 1, sequence: 0, offset: 0, day: timeZone === "UTC" ? "2026-10-18" : "2026-10-19" },
    });

    const utc = renderLogParts(bound("UTC"), late, entries, undefined, 300);
    const utcText = utc.parts.map((p) => p.text).join("");
    expect(utcText).toContain("Started: 2026-10-18 23:50:00");
    expect(utcText).toContain("-- 2026-10-19 --\n[00:10:00] y");
    expect(utc.mark.offset).toBeGreaterThan(0);

    // Kiritimati is UTC+14: the same instants fall on one day, no date line.
    const kiritimati = renderLogParts(bound("Pacific/Kiritimati"), late, entries, undefined, 300);
    const kiritimatiText = kiritimati.parts.map((p) => p.text).join("");
    expect(kiritimatiText).toContain("Started: 2026-10-19 13:50:00");
    expect(kiritimatiText).not.toContain("-- 2026-");

    // Resuming from the saved mark gives exactly the part the full render made.
    for (const [zone, whole] of [["UTC", utc], ["Pacific/Kiritimati", kiritimati]] as const) {
      const rest = renderLogParts({ ...bound(zone), mark: whole.mark }, late, entries.filter((e) => e.sequence >= whole.mark.sequence), undefined, 300);
      expect(rest.parts).toEqual([whole.parts[whole.parts.length - 1]]);
    }
  });

  it("bounds long header fields at 256 UTF-8 bytes and refuses a cap too small for its header", async () => {
    const title = "é".repeat(300);
    const longUrl = `https://example.test/?q=${"€".repeat(300)}`;
    const binding: LogFileBinding = {
      sessionId: sid(1), ownerKey: "a", bindingId: "b", folderName: "Ada", character: "😀".repeat(100), timeZone: ambientZone,
      baseName: "base", nameChecked: true, mark: { part: 1, sequence: 0, offset: 0, day: "2026-10-18" },
    };
    const long = { ...session(1), title, sanitizedUrl: longUrl };
    const rendered = renderLogParts(binding, long, [entry(1, 0, "x".repeat(3000))], "\nEnded: 2026-10-18 15:00:00\n", 2048);
    const [first] = rendered.parts;
    const [titleLine, , characterLine, , urlLine] = first.text.split("\n");
    for (const line of [titleLine, characterLine.replace("Character: ", ""), urlLine.replace("URL: ", "")]) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(256);
      expect(line.endsWith("…")).toBe(true);
      expect(line).not.toContain("�");
    }
    for (const part of rendered.parts) expect(encoder.encode(part.text).length).toBeLessThanOrEqual(2048);
    expect(rendered.parts.map((p) => p.text.slice(p.text.indexOf("\n\n") + 2)).join("")).toContain("x".repeat(3000));

    expect(() => renderLogParts(binding, long, [entry(1, 0, "x")], undefined, 300)).toThrow(/too small/);
  });

  it("gives ids that share their last eight characters, and existing names, their own files", async () => {
    const folder = await chosen();
    const ada = await root.getDirectoryHandle("Ada", { create: true });
    const taken = await ada.getFileHandle("2026-10-18 14-05-12 000000000003.txt", { create: true });
    taken.bytes = encoder.encode("someone else's file\n");

    const a = session(1, ownerA, { id: "00000000-0000-4000-8000-000000000001" });
    const b = session(2, ownerA, { id: "11111111-1111-4111-8111-111100000001" });
    for (const [s, text] of [[a, "A"], [b, "B"]] as const) {
      storedSessions.set(s.id, s);
      stored.push({ ...entry(1, 0, text), sessionId: s.id });
      folder.append(s, stored.filter((e) => e.sessionId === s.id));
    }
    folder.append(session(3), store(entry(3, 0, "C")));
    await folder.whenIdle();

    expect(lineTexts(root.file("Ada/2026-10-18 14-05-12 000000000001.txt").text)).toEqual(["A"]);
    expect(lineTexts(root.file("Ada/2026-10-18 14-05-12 111100000001.txt").text)).toEqual(["B"]);
    expect(taken.text).toBe("someone else's file\n");
    expect(lineTexts(root.file("Ada/2026-10-18 14-05-12 000000000003 (2).txt").text)).toEqual(["C"]);
    folder.dispose();
  });

  it("keeps the header when the very first write fails", async () => {
    const folder = await chosen();
    root.failFirstWrite = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session(1), store(entry(1, 0, "first")));
    await folder.whenIdle();
    expect(folder.state.getState().status.kind).toBe("error");

    folder.append(session(1), store(entry(1, 1, "second")));
    await folder.whenIdle();
    const text = root.file(fileOf(1)).text;
    expect(text.split("\n").slice(0, 3)).toEqual(["Mongoose Client - The Hall", `Session: ${sid(1)}`, "Character: Ada"]);
    expect(lineTexts(text)).toEqual(["first", "second"]);
    // The failed first write left no file claiming the name, so the retry
    // gets the same name, not " (2)".
    expect(Object.keys(root.all())).toEqual([fileOf(1)]);
    folder.dispose();
  });

  it("gives sessions that start in the same second in two tabs their own files", async () => {
    remember(ownerA, root);
    const tabA = makeFolder();
    const tabB = makeFolder();
    await tabA.syncOwner();
    await tabB.syncOwner();

    const held = hold();
    root.holdDirectory = held;
    tabA.append(session(1), store(entry(1, 0, "TAB A")));
    await held.entered.promise;
    tabB.append(session(2), store(entry(2, 0, "TAB B")));
    await tick();
    held.release.resolve();
    await Promise.all([tabA.whenIdle(), tabB.whenIdle()]);

    expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["TAB A"]);
    expect(lineTexts(root.file(fileOf(2)).text)).toEqual(["TAB B"]);
    tabA.dispose();
    tabB.dispose();
  });

  it("routes each session only to the folder its own owner chose, with both owners' folders known", async () => {
    const rootB = new FakeDirectory("B logs");
    remember(ownerA, root);
    remember(ownerB, rootB);
    const folder = makeFolder();
    await folder.syncOwner();

    folder.append(session(1, ownerA), store(entry(1, 0, "A's line")));
    folder.append(session(2, ownerB), store(entry(2, 0, "B's line")));
    folder.append(session(3, null), store(entry(3, 0, "no owner")));
    await folder.whenIdle();

    expect(Object.values(root.all()).flatMap(lineTexts)).toEqual(["A's line"]);
    expect(Object.values(rootB.all()).flatMap(lineTexts)).toEqual(["B's line"]);
    folder.dispose();
  });

  it("offers nothing to visitors: no folder choice, no stored handle", async () => {
    signIn(ownerA, true);
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "unavailable" });
    await folder.choose();
    expect(picker).not.toHaveBeenCalled();
    expect(persistence.folders.size).toBe(0);
    folder.dispose();
  });

  it("asks to reconnect after a reload, then writes everything so far", async () => {
    root.permission = "prompt";
    remember(ownerA, root);
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "needs-permission", folderName: "Mongoose logs" });

    folder.append(session(1), store(entry(1, 0, "while disconnected")));
    folder.append(session(1), store(entry(1, 1, "still disconnected")));
    await folder.whenIdle();
    expect(root.dirs.size).toBe(0);
    expect(announce.mock.calls.filter(([text]) => String(text).includes("needs permission again"))).toHaveLength(1);

    await folder.reconnect();
    await folder.whenIdle();
    folder.append(session(1), store(entry(1, 2, "connected")));
    await folder.whenIdle();

    expect(announce).toHaveBeenCalledWith("Log folder Mongoose logs reconnected.", "polite");
    expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["while disconnected", "still disconnected", "connected"]);
    expect(folder.state.getState().status.kind).toBe("ready");
    folder.dispose();
  });

  it("finishes a session that ended while disconnected once the player reconnects", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "kept")));
    await folder.whenIdle();
    root.permission = "prompt";
    root.file(fileOf(1)).failWrites = new DOMException("revoked", "NotAllowedError");
    folder.append(session(1), store(entry(1, 1, "missed while revoked")));
    await folder.whenIdle();
    expect(folder.state.getState().status.kind).toBe("needs-permission");
    endStored(1, at(15, 0, 0));
    folder.sessionEnded(session(1), at(15, 0, 0));
    await folder.whenIdle();

    root.file(fileOf(1)).failWrites = undefined;
    await folder.reconnect();
    await folder.whenIdle();
    const text = root.file(fileOf(1)).text;
    expect(lineTexts(text)).toEqual(["kept", "missed while revoked"]);
    expect(text.endsWith("\nEnded: 2026-10-18 15:00:00\n")).toBe(true);
    expect(persistence.bindings.size).toBe(0);
    folder.dispose();
  });

  it("finishes a session that ended while writes were failing when the player tries again", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "kept")));
    await folder.whenIdle();
    root.file(fileOf(1)).failWrites = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session(1), store(entry(1, 1, "during failure")));
    endStored(1, at(15, 0, 0));
    folder.sessionEnded(session(1), at(15, 0, 0));
    await folder.whenIdle();
    expect(folder.state.getState().status.kind).toBe("error");

    root.file(fileOf(1)).failWrites = undefined;
    await folder.reconnect();
    await folder.whenIdle();
    expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["kept", "during failure"]);
    expect(root.file(fileOf(1)).text).toContain("Ended: 2026-10-18 15:00:00");
    expect(folder.state.getState().status.kind).toBe("ready");
    folder.dispose();
  });

  it("after a crash, finishes the session from IndexedDB with its recorded end", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    page1.append(session(1), store(entry(1, 0, "written before the crash")));
    await page1.whenIdle();
    store(entry(1, 1, "flushed to IndexedDB only"), entry(1, 2, "last line"));
    endStored(1, at(14, 30, 0));
    page1.dispose();
    tab1.die();

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    const text = root.file(fileOf(1)).text;
    expect(lineTexts(text)).toEqual(["written before the crash", "flushed to IndexedDB only", "last line"]);
    expect(text.endsWith("\nEnded: 2026-10-18 14:30:00\n")).toBe(true);
    expect(persistence.bindings.size).toBe(0);
    page2.dispose();
  });

  it("leaves alone a session another open tab is still writing", async () => {
    const page1 = await chosen();
    page1.append(session(1), store(entry(1, 0, "tab one")));
    await page1.whenIdle();

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    page1.append(session(1), store(entry(1, 1, "tab one again")));
    await page1.whenIdle();

    const text = root.file(fileOf(1)).text;
    expect(footers(text)).toEqual([]);
    expect(lineTexts(text)).toEqual(["tab one", "tab one again"]);
    page1.dispose();
    page2.dispose();
  });

  it("writes nothing into a folder after Stop returns, even from a write already under way", async () => {
    const folder = await chosen();
    const held = hold();
    root.holdDirectory = held;
    folder.append(session(1), store(entry(1, 0, "WRITE AFTER STOP")));
    await held.entered.promise;

    const stopping = folder.stopUsing();
    held.release.resolve();
    await stopping;
    await folder.whenIdle();

    expect(root.all()).toEqual({});
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    expect(persistence.folders.size).toBe(0);
    expect(persistence.bindings.size).toBe(0);
    expect(locks.held).toBe(0);
    expect(announce).toHaveBeenLastCalledWith("Stopped saving logs to Mongoose logs. Logs are still saved in the browser.", "polite");
    folder.dispose();
  });

  it("sends a write under way to the new folder, not the old one, when the player picks another", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "one")));
    await folder.whenIdle();

    const held = hold();
    const ada = root.dirs.get("Ada");
    if (!ada) throw new Error("no Ada folder");
    ada.holdFile = held;
    folder.append(session(1), store(entry(1, 1, "two")));
    await held.entered.promise;
    const second = new FakeDirectory("Elsewhere");
    picker.mockResolvedValueOnce(second);
    const choosing = folder.choose();
    // Let the pick land while the write is still held.
    await tick();
    held.release.resolve();
    await choosing;
    await folder.whenIdle();

    expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["one"]);
    expect(lineTexts(second.file(fileOf(1)).text)).toEqual(["one", "two"]);
    folder.dispose();
  });

  it("says Stop only lasts this visit when the browser cannot forget the folder", async () => {
    const folder = await chosen();
    announce.mockClear();
    persistence.failDeleteFolder = true;
    await folder.stopUsing();
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    expect(announce.mock.calls).toEqual([[
      "Stopped saving logs to Mongoose logs for this visit, but the browser could not forget the folder, so it may come back after a reload. Logs are still saved in the browser.",
      "assertive",
    ]]);
    folder.dispose();
  });

  it("says a new folder only lasts this visit when the browser cannot remember it", async () => {
    persistence.failPutFolder = true;
    const folder = await chosen();
    expect(announce.mock.calls).toEqual([[
      "Saving logs to the folder Mongoose logs for this visit, but the browser could not remember it, so you will need to choose it again after a reload.",
      "assertive",
    ]]);
    expect(folder.state.getState().status.kind).toBe("ready");
    folder.dispose();
  });

  it("shows when another tab blocks the folder settings, and recovers on Try again", async () => {
    remember(ownerA, root);
    persistence.failNextGetFolder = new StorageBlocked();
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "storage-error", blocked: true, message: new StorageBlocked().message });
    folder.append(session(1), store(entry(1, 0, "kept for later")));
    await folder.whenIdle();
    expect(root.all()).toEqual({});

    await folder.retry();
    await folder.whenIdle();
    expect(folder.state.getState().status.kind).toBe("ready");
    expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["kept for later"]);
    folder.dispose();
  });

  it("treats a cancelled picker as no change", async () => {
    picker.mockRejectedValueOnce(new DOMException("cancelled", "AbortError"));
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    expect(announce).not.toHaveBeenCalled();
    folder.dispose();
  });

  it("stays disconnected and says so when the player refuses permission", async () => {
    root.permission = "prompt";
    root.requestResult = "denied";
    remember(ownerA, root);
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.reconnect();
    expect(folder.state.getState().status).toEqual({ kind: "needs-permission", folderName: "Mongoose logs" });
    expect(announce).toHaveBeenCalledWith(expect.stringContaining("was not given"), "assertive");
    folder.dispose();
  });

  it("announces a write failure once, then recovers with every line", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "first")));
    await folder.whenIdle();
    const file = root.file(fileOf(1));

    file.failWrites = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session(1), store(entry(1, 1, "second")));
    await folder.whenIdle();
    folder.append(session(1), store(entry(1, 2, "third")));
    await folder.whenIdle();
    expect(folder.state.getState().status).toEqual({ kind: "error", folderName: "Mongoose logs", message: "The disk is full" });
    expect(announce.mock.calls.filter(([, politeness]) => politeness === "assertive")).toEqual([
      ["Could not write to the log folder Mongoose logs: The disk is full. Logs are still saved in the browser.", "assertive"],
    ]);

    file.failWrites = undefined;
    folder.append(session(1), store(entry(1, 3, "fourth")));
    await folder.whenIdle();
    expect(lineTexts(file.text)).toEqual(["first", "second", "third", "fourth"]);
    expect(announce).toHaveBeenCalledWith("Writing logs to Mongoose logs again.", "polite");
    folder.dispose();
  });

  it("follows the signed-in owner", async () => {
    remember(ownerB, new FakeDirectory("B logs"));
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    signIn(ownerB);
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "ready", folderName: "B logs" });
    signIn(undefined);
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "unavailable" });
    folder.dispose();
  });
});

describe("sanitizeFolderName", () => {
  it("makes names safe on every desktop file system", () => {
    expect(sanitizeFolderName('Ada: "the" <Bold>/Brave?', "x")).toBe("Ada the Bold Brave");
    expect(sanitizeFolderName("  ..  ", "Character")).toBe("Character");
    expect(sanitizeFolderName("CON", "x")).toBe("CON_");
  });
});

function deleteFolderDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const deletion = indexedDB.deleteDatabase("mongoose-autolog-folders");
    deletion.onsuccess = () => resolve();
    deletion.onerror = () => reject(deletion.error);
  });
}

// Opens the database as the round 1 build did: version 1, the bare handle
// under the owner key, and no versionchange handler.
function openVersion1(handle: unknown): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("mongoose-autolog-folders", 1);
    open.onupgradeneeded = () => { open.result.createObjectStore("folders"); };
    open.onsuccess = () => {
      const transaction = open.result.transaction("folders", "readwrite");
      transaction.objectStore("folders").put(handle, "owner-a");
      transaction.oncomplete = () => resolve(open.result);
      transaction.onerror = () => reject(transaction.error);
    };
    open.onerror = () => reject(open.error);
  });
}

describe("IndexedDbLogFolderPersistence", () => {
  beforeEach(async () => {
    await deleteFolderDatabase();
  });

  it("upgrades a version 1 database: keeps the remembered folders and adds bindings", async () => {
    const handle = { kind: "directory", name: "Logs" };
    (await openVersion1(handle)).close();

    const db = new IndexedDbLogFolderPersistence();
    const folder = await db.getFolder("owner-a");
    expect(folder?.handle).toEqual(handle);
    expect(typeof folder?.bindingId).toBe("string");
    expect(folder?.bindingId).not.toBe("");
    expect(await db.listBindings("owner-a")).toEqual([]);
    db.close();
  });

  it("reports an upgrade blocked by an old tab, then retries once that tab closes", async () => {
    const handle = { kind: "directory", name: "Remembered" };
    const old = await openVersion1(handle);

    const db = new IndexedDbLogFolderPersistence();
    await expect(db.getFolder("owner-a")).rejects.toBeInstanceOf(StorageBlocked);
    old.close();
    await tick();
    expect((await db.getFolder("owner-a"))?.handle).toEqual(handle);
    db.close();
  });

  it("closes its connection when a newer version needs the database", async () => {
    const db = new IndexedDbLogFolderPersistence();
    await db.getFolder("anyone");
    const upgraded = await new Promise<string>((resolve) => {
      const open = indexedDB.open("mongoose-autolog-folders", 99);
      open.onblocked = () => resolve("blocked");
      open.onsuccess = () => { open.result.close(); resolve("opened"); };
    });
    expect(upgraded).toBe("opened");
    db.close();
  });

  it("keeps a folder per owner key and bindings per session", async () => {
    const db = new IndexedDbLogFolderPersistence();
    const handle = { kind: "directory", name: "Logs" } as unknown as FileSystemDirectoryHandle;
    await db.putFolder("a", { handle, bindingId: "b1" });
    expect(await db.getFolder("a")).toEqual({ handle, bindingId: "b1" });
    expect(await db.getFolder("b")).toBeUndefined();
    await db.deleteFolder("a");
    expect(await db.getFolder("a")).toBeUndefined();

    const binding: LogFileBinding = {
      sessionId: "s1", ownerKey: "a", bindingId: "b1", folderName: "Ada", character: "Ada", timeZone: "Europe/Paris", baseName: "base",
      nameChecked: true, mark: { part: 2, sequence: 40, offset: 7, day: "2026-10-18" },
    };
    await db.putBinding(binding);
    await db.putBinding({ ...binding, sessionId: "s2", ownerKey: "b" });
    expect(await db.listBindings("a")).toEqual([binding]);
    expect(await db.getBinding("s1")).toEqual(binding);
    await db.deleteBinding("s1");
    expect(await db.listBindings("a")).toEqual([]);
    db.close();
  });
});
