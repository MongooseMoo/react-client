import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ownerKey, usePersonalDataStore, type PersonalDataOwner } from "../stores/personalDataStore";
import { useSessionStore } from "../stores/sessionStore";
import {
  AutoLogFolder,
  IndexedDbLogFolderPersistence,
  type LockManagerLike,
  type LogFileCursor,
  type LogFolderPersistence,
  sanitizeFolderName,
  type StoredFolder,
} from "./AutoLogFolder";
import type { AutoLogEntry, AutoLogSession } from "./AutoLogTypes";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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
  constructor(readonly name: string) {}

  get text(): string { return decoder.decode(this.bytes); }

  async getFile() { return { size: this.bytes.length }; }

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
  cursors = new Map<string, LogFileCursor>();
  operations = 0;
  failPutFolder = false;
  failDeleteFolder = false;
  // Fails the cursor save that follows a successful commit (no pending intent).
  failCommitSave = false;

  async getFolder(key: string) { this.operations++; return this.folders.get(key); }
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
  async listCursors(key: string) {
    this.operations++;
    return [...this.cursors.values()].filter((cursor) => cursor.ownerKey === key).map((cursor) => structuredClone(cursor));
  }
  async putCursor(cursor: LogFileCursor) {
    this.operations++;
    if (this.failCommitSave && !cursor.pending) throw new Error("storage refused");
    this.cursors.set(cursor.sessionId, structuredClone(cursor));
  }
  async deleteCursor(sessionId: string) { this.operations++; this.cursors.delete(sessionId); }
}

// Web Locks shared by every "tab" in a test. die() is the tab closing: the
// browser releases everything that tab held.
class FakeLocks {
  held = new Map<string, symbol>();

  forTab(): LockManagerLike & { die(): void } {
    const tab = Symbol("tab");
    const deaths: Array<() => void> = [];
    const request: LockManagerLike["request"] = async (name, options, callback) => {
      if (this.held.has(name)) {
        if (options.ifAvailable) return callback(null);
        throw new Error(`test lock ${name} is already held`);
      }
      this.held.set(name, tab);
      const death = new Promise<void>((resolve) => { deaths.push(resolve); });
      try {
        return await Promise.race([callback({ name }), death]);
      } finally {
        if (this.held.get(name) === tab) this.held.delete(name);
      }
    };
    return {
      request,
      die: () => {
        for (const [name, holder] of this.held) if (holder === tab) this.held.delete(name);
        for (const die of deaths) die();
      },
    };
  }
}

const ownerA: PersonalDataOwner = { runtime: "live:test:1", playerUuid: "uuid-a", playerRef: "#10" };
const ownerB: PersonalDataOwner = { runtime: "live:test:1", playerUuid: "uuid-b", playerRef: "#20" };
const startedAt = new Date(2026, 9, 18, 14, 5, 12).getTime();
const sid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const fileOf = (n: number, part = 1) => `Ada/2026-10-18 14-05-12 ${String(n).padStart(8, "0")}${part > 1 ? ` part ${part}` : ""}.txt`;

// null is a session with no owner; undefined would take the default.
function session(n: number, owner: PersonalDataOwner | null = ownerA, extra: Partial<AutoLogSession> = {}): AutoLogSession {
  return { id: sid(n), startedAt, title: "Mongoose Client - The Hall", mode: "default",
    sanitizedUrl: "https://example.test/?password=%5Bredacted%5D", lineCount: 0, byteEstimate: 0,
    ...(owner ? { owner } : {}), ...extra };
}

function entry(n: number, sequence: number, text: string, timestamp = startedAt + 1000 * (sequence + 1)): AutoLogEntry {
  return { sessionId: sid(n), sequence, timestamp, type: "serverMessage", sourceType: "ansi", sourceContent: text };
}

// The IndexedDB autolog contents the sink reads back from.
let stored: AutoLogEntry[] = [];
let storedSessions: Map<string, AutoLogSession>;
let persistence: MemoryPersistence;
let locks: FakeLocks;
let root: FakeDirectory;
let picker: ReturnType<typeof vi.fn>;

function signIn(owner: PersonalDataOwner | undefined, visitor = false) {
  usePersonalDataStore.setState({ owner, policyReady: true, visitor });
}

type MakeOptions = { pick?: boolean; maxPartBytes?: number; tab?: LockManagerLike };
function makeFolder(options: MakeOptions = {}) {
  return new AutoLogFolder({
    persistence,
    readEntries: async (id) => stored.filter((e) => e.sessionId === id),
    readSession: async (id) => storedSessions.get(id),
    pickDirectory: options.pick === false ? undefined : picker,
    locks: options.tab ?? locks.forTab(),
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

function store(...entries: AutoLogEntry[]) {
  stored.push(...entries);
  return entries;
}

function remember(owner: PersonalDataOwner, directory: FakeDirectory, bindingId = "binding-1") {
  persistence.folders.set(ownerKey(owner), { handle: directory as unknown as FileSystemDirectoryHandle, bindingId });
}

const lineTexts = (text: string) => text.split("\n").filter((line) => line.startsWith("[")).map((line) => line.replace(/^\[[^\]]+\] /, ""));
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

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
    await folder.stopUsing();
    await folder.whenIdle();
    expect(folder.state.getState().status).toEqual({ kind: "unsupported" });
    expect(persistence.operations).toBe(0);
    folder.dispose();
  });

  it("writes a header and timestamped lines into the character's folder, appending each flush", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    await folder.choose();
    await folder.whenIdle();
    expect(persistence.folders.get(ownerKey(ownerA))?.handle).toBe(root);
    expect(announce).toHaveBeenCalledWith("Saving logs to the folder Mongoose logs.", "polite");

    folder.append(session(1), store(entry(1, 0, "\x1b[1mYou arrive.\x1b[0m"), entry(1, 1, "Bob waves.\r\n")));
    folder.append(session(1), store(entry(1, 2, "Line three")));
    await folder.whenIdle();

    const file = root.file(fileOf(1));
    expect(file.text).toBe([
      "Mongoose Client - The Hall",
      "Character: Ada",
      "Started: 2026-10-18 14:05:12",
      "URL: https://example.test/?password=%5Bredacted%5D",
      "",
      "[14:05:13] You arrive.",
      "[14:05:14] Bob waves.",
      "[14:05:15] Line three",
      "",
    ].join("\n"));
    expect(file.writableOptions).toEqual([{ keepExistingData: true }, { keepExistingData: true }]);
    expect(folder.state.getState().status).toEqual({ kind: "ready", folderName: "Mongoose logs", filePath: fileOf(1) });
    folder.dispose();
  });

  it("marks a new day inside a session that crosses midnight", async () => {
    const folder = await chosen();
    const nextDay = new Date(2026, 9, 19, 0, 0, 3).getTime();
    folder.append(session(1), store(entry(1, 0, "late"), entry(1, 1, "early", nextDay)));
    await folder.whenIdle();
    expect(root.file(fileOf(1)).text).toContain("[14:05:13] late\n\n-- 2026-10-19 --\n[00:00:03] early\n");
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
    expect(text.startsWith("Mongoose Client - The Hall\nCharacter: Ada\n")).toBe(true);
    expect(lineTexts(text)).toEqual(["first", "second"]);
    folder.dispose();
  });

  it("keeps the date line when the write that crosses midnight fails", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "before midnight")));
    await folder.whenIdle();
    root.file(fileOf(1)).failOnce = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session(1), store(entry(1, 1, "after midnight", new Date(2026, 9, 19, 0, 0, 3).getTime())));
    await folder.whenIdle();
    folder.append(session(1), store(entry(1, 2, "recovered", new Date(2026, 9, 19, 0, 0, 4).getTime())));
    await folder.whenIdle();
    expect(root.file(fileOf(1)).text).toContain("before midnight\n\n-- 2026-10-19 --\n[00:00:03] after midnight\n[00:00:04] recovered\n");
    folder.dispose();
  });

  it("rotates to part files with a continuation header, every line exactly once", async () => {
    const folder = await chosen({ maxPartBytes: 260 });
    for (let sequence = 0; sequence < 12; sequence++) {
      folder.append(session(1), store(entry(1, sequence, `line ${sequence} ${"x".repeat(20)}`)));
    }
    await folder.whenIdle();

    const files = root.all();
    const parts = Object.keys(files).sort((a, b) => a.length - b.length || a.localeCompare(b, undefined, { numeric: true }));
    expect(parts.length).toBeGreaterThan(2);
    expect(parts[0]).toBe(fileOf(1));
    expect(parts[1]).toBe(fileOf(1, 2));
    for (const name of parts) expect(encoder.encode(files[name]).length).toBeLessThanOrEqual(260);
    expect(files[fileOf(1, 2)].split("\n").slice(0, 4)).toEqual([
      "Mongoose Client - The Hall, part 2",
      "Character: Ada",
      "Started: 2026-10-18 14:05:12",
      `Continues from: ${fileOf(1).split("/")[1]}`,
    ]);
    expect(parts.flatMap((name) => lineTexts(files[name]))).toEqual(Array.from({ length: 12 }, (_, sequence) => `line ${sequence} ${"x".repeat(20)}`));
    expect(folder.state.getState().status).toEqual({ kind: "ready", folderName: "Mongoose logs", filePath: parts[parts.length - 1] });
    folder.dispose();
  });

  it("never writes into a file someone else changed; it continues in a new part", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "mine")));
    await folder.whenIdle();
    const file = root.file(fileOf(1));
    file.bytes = encoder.encode(`${file.text}edited by hand\n`);
    const edited = file.text;

    folder.append(session(1), store(entry(1, 1, "next")));
    await folder.whenIdle();
    expect(file.text).toBe(edited);
    expect(lineTexts(root.file(fileOf(1, 2)).text)).toEqual(["next"]);
    folder.dispose();
  });

  it("gives sessions that start in the same second in two tabs their own files", async () => {
    remember(ownerA, root);
    const tabA = makeFolder();
    const tabB = makeFolder();
    await tabA.syncOwner();
    await tabB.syncOwner();

    // Both tabs look for their file before either has created one.
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

  it("asks to reconnect after a reload, then catches up the lines it missed", async () => {
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
    folder.sessionEnded(session(1), new Date(2026, 9, 18, 15, 0, 0).getTime());
    await folder.whenIdle();

    root.file(fileOf(1)).failWrites = undefined;
    await folder.reconnect();
    await folder.whenIdle();
    const text = root.file(fileOf(1)).text;
    expect(lineTexts(text)).toEqual(["kept", "missed while revoked"]);
    expect(text.endsWith("\nEnded: 2026-10-18 15:00:00\n")).toBe(true);
    expect(persistence.cursors.size).toBe(0);
    folder.dispose();
  });

  it("finishes a session that ended while writes were failing when the player tries again", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "kept")));
    await folder.whenIdle();
    root.file(fileOf(1)).failWrites = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session(1), store(entry(1, 1, "during failure")));
    folder.sessionEnded(session(1), new Date(2026, 9, 18, 15, 0, 0).getTime());
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

  it("after a reload, finishes a session the closed page left unfinished", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    page1.append(session(1), store(entry(1, 0, "written before close")));
    await page1.whenIdle();
    // Lines IndexedDB took but the folder never got, then the tab closes.
    store(entry(1, 1, "flushed to IndexedDB only"), entry(1, 2, "last line"));
    storedSessions.set(sid(1), session(1, ownerA, { endedAt: new Date(2026, 9, 18, 14, 30, 0).getTime() }));
    page1.dispose();
    tab1.die();

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    const text = root.file(fileOf(1)).text;
    expect(lineTexts(text)).toEqual(["written before close", "flushed to IndexedDB only", "last line"]);
    expect(text.endsWith("\nEnded: 2026-10-18 14:30:00\n")).toBe(true);
    expect(persistence.cursors.size).toBe(0);
    page2.dispose();
  });

  it("says when a closed page's end time was never recorded", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    page1.append(session(1), store(entry(1, 0, "only line")));
    await page1.whenIdle();
    storedSessions.set(sid(1), session(1));
    page1.dispose();
    tab1.die();

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    expect(root.file(fileOf(1)).text.endsWith("\nEnded: not recorded (the page closed)\n")).toBe(true);
    page2.dispose();
  });

  it("leaves alone a session another open tab is still writing", async () => {
    const page1 = await chosen();
    page1.append(session(1), store(entry(1, 0, "tab one")));
    await page1.whenIdle();
    storedSessions.set(sid(1), session(1));

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    page1.append(session(1), store(entry(1, 1, "tab one again")));
    await page1.whenIdle();

    const text = root.file(fileOf(1)).text;
    expect(text).not.toContain("Ended:");
    expect(lineTexts(text)).toEqual(["tab one", "tab one again"]);
    page1.dispose();
    page2.dispose();
  });

  it("does not repeat lines when the page closed between a commit and its cursor update", async () => {
    const tab1 = locks.forTab();
    const page1 = await chosen({ tab: tab1 });
    page1.append(session(1), store(entry(1, 0, "zero")));
    await page1.whenIdle();
    persistence.failCommitSave = true;
    page1.append(session(1), store(entry(1, 1, "one")));
    await page1.whenIdle();
    persistence.failCommitSave = false;
    store(entry(1, 2, "two"));
    storedSessions.set(sid(1), session(1, ownerA, { endedAt: new Date(2026, 9, 18, 14, 30, 0).getTime() }));
    page1.dispose();
    tab1.die();

    const page2 = makeFolder();
    await page2.syncOwner();
    await page2.whenIdle();
    expect(lineTexts(root.file(fileOf(1)).text)).toEqual(["zero", "one", "two"]);
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

  it("announces a write failure once, then recovers and fills the gap", async () => {
    const folder = await chosen();
    folder.append(session(1), store(entry(1, 0, "first")));
    await folder.whenIdle();
    const file = root.file(fileOf(1));

    file.failWrites = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session(1), store(entry(1, 1, "second")));
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

describe("IndexedDbLogFolderPersistence", () => {
  it("upgrades a version 1 database: adds cursors and keeps the remembered folders", async () => {
    await new Promise<void>((resolve, reject) => {
      const deletion = indexedDB.deleteDatabase("mongoose-autolog-folders");
      deletion.onsuccess = () => resolve();
      deletion.onerror = () => reject(deletion.error);
    });
    // Version 1 stored the bare handle under the owner key.
    const handle = { kind: "directory", name: "Logs" };
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open("mongoose-autolog-folders", 1);
      open.onupgradeneeded = () => { open.result.createObjectStore("folders"); };
      open.onsuccess = () => {
        const transaction = open.result.transaction("folders", "readwrite");
        transaction.objectStore("folders").put(handle, "owner-a");
        transaction.oncomplete = () => { open.result.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
      open.onerror = () => reject(open.error);
    });

    const db = new IndexedDbLogFolderPersistence();
    const folder = await db.getFolder("owner-a");
    expect(folder?.handle).toEqual(handle);
    expect(typeof folder?.bindingId).toBe("string");
    expect(folder?.bindingId).not.toBe("");
    expect(await db.listCursors("owner-a")).toEqual([]);
  });

  it("keeps a folder per owner key and cursors per session", async () => {
    const db = new IndexedDbLogFolderPersistence();
    const handle = { kind: "directory", name: "Logs" } as unknown as FileSystemDirectoryHandle;
    await db.putFolder("a", { handle, bindingId: "b1" });
    expect(await db.getFolder("a")).toEqual({ handle, bindingId: "b1" });
    expect(await db.getFolder("b")).toBeUndefined();
    await db.deleteFolder("a");
    expect(await db.getFolder("a")).toBeUndefined();

    const cursor: LogFileCursor = {
      sessionId: "s1", ownerKey: "a", bindingId: "b1", folderName: "Ada", baseName: "base", part: 1,
      partBytes: 10, written: 3, day: "2026-10-18",
      header: { title: "T", startedAt, sanitizedUrl: "", character: "Ada" },
    };
    await db.putCursor(cursor);
    await db.putCursor({ ...cursor, sessionId: "s2", ownerKey: "b" });
    expect(await db.listCursors("a")).toEqual([cursor]);
    await db.deleteCursor("s1");
    expect(await db.listCursors("a")).toEqual([]);
  });
});
