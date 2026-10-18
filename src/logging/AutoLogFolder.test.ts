import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePersonalDataStore, type PersonalDataOwner } from "../stores/personalDataStore";
import { useSessionStore } from "../stores/sessionStore";
import { AutoLogFolder, IndexedDbLogFolderHandles, type LogFolderHandleStore, sanitizeFolderName } from "./AutoLogFolder";
import type { AutoLogEntry, AutoLogSession } from "./AutoLogTypes";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// In-memory stand-ins for the File System Access handles, faithful to the
// parts the sink uses: a writable starts empty unless keepExistingData is set,
// and nothing lands in the file until close().
class FakeFile {
  readonly kind = "file";
  bytes = new Uint8Array();
  writableOptions: Array<{ keepExistingData?: boolean } | undefined> = [];
  failWrites: DOMException | undefined;
  constructor(readonly name: string) {}

  get text(): string { return decoder.decode(this.bytes); }

  async getFile() { return { size: this.bytes.length }; }

  async createWritable(options?: { keepExistingData?: boolean }) {
    this.writableOptions.push(options);
    if (this.failWrites) throw this.failWrites;
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
  constructor(readonly name: string) {}

  async getDirectoryHandle(name: string, options?: { create?: boolean }) {
    let dir = this.dirs.get(name);
    if (!dir) {
      if (!options?.create) throw new DOMException("missing", "NotFoundError");
      dir = new FakeDirectory(name);
      this.dirs.set(name, dir);
    }
    return dir;
  }

  async getFileHandle(name: string, options?: { create?: boolean }) {
    if (this.dirs.has(name)) throw new DOMException("is a folder", "TypeMismatchError");
    let file = this.files.get(name);
    if (!file) {
      if (!options?.create) throw new DOMException("missing", "NotFoundError");
      file = new FakeFile(name);
      this.files.set(name, file);
    }
    return file;
  }

  async queryPermission() { return this.permission; }
  async requestPermission() {
    this.permission = this.requestResult;
    return this.permission;
  }

  file(path: string): FakeFile {
    const [dir, name] = path.split("/");
    const file = this.dirs.get(dir)?.files.get(name);
    if (!file) throw new Error(`no file ${path}; have ${[...this.dirs.values()].flatMap(d => [...d.files.keys()].map(f => `${d.name}/${f}`)).join(", ")}`);
    return file;
  }
}

class MemoryHandles implements LogFolderHandleStore {
  map = new Map<string, FileSystemDirectoryHandle>();
  async get(key: string) { return this.map.get(key); }
  async put(key: string, handle: FileSystemDirectoryHandle) { this.map.set(key, handle); }
  async delete(key: string) { this.map.delete(key); }
}

const ownerA: PersonalDataOwner = { runtime: "live:test:1", playerUuid: "uuid-a", playerRef: "#10" };
const ownerB: PersonalDataOwner = { runtime: "live:test:1", playerUuid: "uuid-b", playerRef: "#20" };
const ownerKeyOf = (owner: PersonalDataOwner) => JSON.stringify([owner.runtime, owner.playerUuid, owner.playerRef]);
const startedAt = new Date(2026, 9, 18, 14, 5, 12).getTime();

// null is a session with no owner; undefined would take the default.
function session(id: string, owner: PersonalDataOwner | null = ownerA): AutoLogSession {
  return { id, startedAt, title: "Mongoose Client - The Hall", mode: "default",
    sanitizedUrl: "https://example.test/?password=%5Bredacted%5D", lineCount: 0, byteEstimate: 0,
    ...(owner ? { owner } : {}) };
}

function entry(sessionId: string, sequence: number, text: string, timestamp = startedAt + 1000 * (sequence + 1)): AutoLogEntry {
  return { sessionId, sequence, timestamp, type: "serverMessage", sourceType: "ansi", sourceContent: text };
}

// The fake IndexedDB contents the sink reads back from when it has a gap.
let stored: AutoLogEntry[] = [];
let handles: MemoryHandles;
let root: FakeDirectory;
let picker: ReturnType<typeof vi.fn>;

function signIn(owner: PersonalDataOwner | undefined, visitor = false) {
  usePersonalDataStore.setState({ owner, policyReady: true, visitor });
}

function makeFolder(options: { pick?: boolean } = {}) {
  return new AutoLogFolder({
    handles,
    readEntries: async (id) => stored.filter((e) => e.sessionId === id),
    pickDirectory: options.pick === false ? undefined : picker,
  });
}

function store(...entries: AutoLogEntry[]) {
  stored.push(...entries);
  return entries;
}

describe("AutoLogFolder", () => {
  beforeEach(() => {
    announce.mockClear();
    stored = [];
    handles = new MemoryHandles();
    root = new FakeDirectory("Mongoose logs");
    picker = vi.fn(async () => root);
    useSessionStore.setState({ playerName: "Ada", playerUuid: "uuid-a", playerId: "#10" });
    signIn(ownerA);
  });

  it("reports unsupported and writes nothing without the File System Access API", async () => {
    const folder = makeFolder({ pick: false });
    expect(folder.state.getState().status).toEqual({ kind: "unsupported" });
    folder.append(session("s1"), store(entry("s1", 0, "hello")));
    await folder.whenIdle();
    expect(handles.map.size).toBe(0);
    folder.dispose();
  });

  it("writes a header and timestamped lines into the character's folder, appending each flush", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    await folder.choose();
    expect(handles.map.get(ownerKeyOf(ownerA))).toBe(root);
    expect(announce).toHaveBeenCalledWith("Saving logs to the folder Mongoose logs.", "polite");

    folder.append(session("s1"), store(entry("s1", 0, "\x1b[1mYou arrive.\x1b[0m"), entry("s1", 1, "Bob waves.\r\n")));
    folder.append(session("s1"), store(entry("s1", 2, "Line three")));
    await folder.whenIdle();

    const file = root.file("Ada/2026-10-18 14-05-12.txt");
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
    // Each flush opened the file keeping what was there, never truncating.
    expect(file.writableOptions).toEqual([{ keepExistingData: true }, { keepExistingData: true }]);
    expect(folder.state.getState().status).toEqual({ kind: "ready", folderName: "Mongoose logs", filePath: "Ada/2026-10-18 14-05-12.txt" });
    folder.dispose();
  });

  it("marks a new day inside a session that crosses midnight", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    const nextDay = new Date(2026, 9, 19, 0, 0, 3).getTime();
    folder.append(session("s1"), store(entry("s1", 0, "late"), entry("s1", 1, "early", nextDay)));
    await folder.whenIdle();
    expect(root.file("Ada/2026-10-18 14-05-12.txt").text).toContain("[14:05:13] late\n\n-- 2026-10-19 --\n[00:00:03] early\n");
    folder.dispose();
  });

  it("never writes a session into a folder another owner chose", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();

    folder.append(session("b1", ownerB), store(entry("b1", 0, "B's private line")));
    folder.append(session("anon", null), store(entry("anon", 0, "no owner")));
    await folder.whenIdle();

    expect([...root.dirs.values()].flatMap((dir) => [...dir.files.values()].map((file) => `${dir.name}/${file.name}: ${file.text}`))).toEqual([]);
    folder.dispose();
  });

  it("is unavailable to visitors and keeps their choice away from the owner's folder", async () => {
    signIn(ownerA, true);
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "unavailable" });
    await folder.choose();
    expect(picker).not.toHaveBeenCalled();
    expect(handles.map.size).toBe(0);
    folder.dispose();
  });

  it("asks to reconnect after a reload, then catches up the lines it missed", async () => {
    root.permission = "prompt";
    handles.map.set(ownerKeyOf(ownerA), root as unknown as FileSystemDirectoryHandle);
    const folder = makeFolder();
    await folder.syncOwner();
    expect(folder.state.getState().status).toEqual({ kind: "needs-permission", folderName: "Mongoose logs" });

    folder.append(session("s1"), store(entry("s1", 0, "while disconnected")));
    folder.append(session("s1"), store(entry("s1", 1, "still disconnected")));
    await folder.whenIdle();
    expect(root.dirs.size).toBe(0);
    // One notice, not one per flush.
    expect(announce.mock.calls.filter(([text]) => String(text).includes("needs permission again"))).toHaveLength(1);

    await folder.reconnect();
    await folder.whenIdle();
    folder.append(session("s1"), store(entry("s1", 2, "connected")));
    await folder.whenIdle();

    expect(announce).toHaveBeenCalledWith("Log folder Mongoose logs reconnected.", "polite");
    expect(root.file("Ada/2026-10-18 14-05-12.txt").text).toMatch(/while disconnected\n.*still disconnected\n.*connected\n$/);
    expect(folder.state.getState().status.kind).toBe("ready");
    folder.dispose();
  });

  it("stays disconnected and says so when the player refuses permission", async () => {
    root.permission = "prompt";
    root.requestResult = "denied";
    handles.map.set(ownerKeyOf(ownerA), root as unknown as FileSystemDirectoryHandle);
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.reconnect();
    expect(folder.state.getState().status).toEqual({ kind: "needs-permission", folderName: "Mongoose logs" });
    expect(announce).toHaveBeenCalledWith(expect.stringContaining("was not given"), "assertive");
    folder.dispose();
  });

  it("announces a write failure once, then recovers and fills the gap", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    folder.append(session("s1"), store(entry("s1", 0, "first")));
    await folder.whenIdle();
    const file = root.file("Ada/2026-10-18 14-05-12.txt");

    file.failWrites = new DOMException("The disk is full", "QuotaExceededError");
    folder.append(session("s1"), store(entry("s1", 1, "second")));
    folder.append(session("s1"), store(entry("s1", 2, "third")));
    await folder.whenIdle();
    expect(folder.state.getState().status).toEqual({ kind: "error", folderName: "Mongoose logs", message: "The disk is full" });
    expect(announce.mock.calls.filter(([, politeness]) => politeness === "assertive")).toEqual([
      ["Could not write to the log folder Mongoose logs: The disk is full. Logs are still saved in the browser.", "assertive"],
    ]);

    file.failWrites = undefined;
    folder.append(session("s1"), store(entry("s1", 3, "fourth")));
    await folder.whenIdle();
    expect(file.text.match(/\] \w+/g)).toEqual(["] first", "] second", "] third", "] fourth"]);
    expect(announce).toHaveBeenCalledWith("Writing logs to Mongoose logs again.", "polite");
    expect(folder.state.getState().status.kind).toBe("ready");
    folder.dispose();
  });

  it("moves to needs-permission when the browser revokes access mid-session", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    folder.append(session("s1"), store(entry("s1", 0, "first")));
    await folder.whenIdle();
    root.permission = "prompt";
    root.file("Ada/2026-10-18 14-05-12.txt").failWrites = new DOMException("revoked", "NotAllowedError");
    folder.append(session("s1"), store(entry("s1", 1, "second")));
    await folder.whenIdle();
    expect(folder.state.getState().status).toEqual({ kind: "needs-permission", folderName: "Mongoose logs" });
    folder.dispose();
  });

  it("finishes the text file when the session ends", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    const s = session("s1");
    folder.append(s, store(entry("s1", 0, "hello")));
    folder.sessionEnded(s, new Date(2026, 9, 18, 15, 0, 0).getTime());
    await folder.whenIdle();

    expect(root.file("Ada/2026-10-18 14-05-12.txt").text).toMatch(/\[14:05:13\] hello\n\nEnded: 2026-10-18 15:00:00\n$/);
    expect([...root.dirs.get("Ada")?.files.keys() ?? []]).toEqual(["2026-10-18 14-05-12.txt"]);
    expect(folder.state.getState().status).toEqual({ kind: "ready", folderName: "Mongoose logs" });
    folder.dispose();
  });

  it("never overwrites an existing log with the same start time", async () => {
    const ada = await root.getDirectoryHandle("Ada", { create: true });
    const existing = await ada.getFileHandle("2026-10-18 14-05-12.txt", { create: true });
    existing.bytes = encoder.encode("older log\n");
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    folder.append(session("s1"), store(entry("s1", 0, "new")));
    await folder.whenIdle();
    expect(existing.text).toBe("older log\n");
    expect(root.file("Ada/2026-10-18 14-05-12 (2).txt").text).toContain("] new");
    folder.dispose();
  });

  it("writes the whole session so far into a newly chosen folder", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    folder.append(session("s1"), store(entry("s1", 0, "one")));
    await folder.whenIdle();

    const second = new FakeDirectory("Elsewhere");
    picker.mockResolvedValueOnce(second);
    await folder.choose();
    await folder.whenIdle();
    folder.append(session("s1"), store(entry("s1", 1, "two")));
    await folder.whenIdle();

    expect(second.file("Ada/2026-10-18 14-05-12.txt").text).toMatch(/\] one\n.*\] two\n$/);
    expect(root.file("Ada/2026-10-18 14-05-12.txt").text).not.toContain("two");
    folder.dispose();
  });

  it("stops writing and forgets the folder on Stop using folder", async () => {
    const folder = makeFolder();
    await folder.syncOwner();
    await folder.choose();
    folder.append(session("s1"), store(entry("s1", 0, "kept")));
    await folder.whenIdle();
    await folder.stopUsing();
    folder.append(session("s1"), store(entry("s1", 1, "not written")));
    await folder.whenIdle();

    expect(handles.map.size).toBe(0);
    expect(folder.state.getState().status).toEqual({ kind: "none" });
    expect(root.file("Ada/2026-10-18 14-05-12.txt").text).not.toContain("not written");
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

  it("follows the signed-in owner", async () => {
    handles.map.set(ownerKeyOf(ownerB), new FakeDirectory("B logs") as unknown as FileSystemDirectoryHandle);
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

describe("IndexedDbLogFolderHandles", () => {
  it("keeps a handle per owner key", async () => {
    const db = new IndexedDbLogFolderHandles();
    const handle = { kind: "directory", name: "Logs" } as unknown as FileSystemDirectoryHandle;
    await db.put("a", handle);
    expect(await db.get("a")).toEqual(handle);
    expect(await db.get("b")).toBeUndefined();
    await db.delete("a");
    expect(await db.get("a")).toBeUndefined();
  });
});
