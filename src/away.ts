import { resolveApiUrl } from "./apiOrigin";
import {
  openIndexedDatabase,
  requestToPromise,
  transactionDone,
  type IndexedDatabaseSchema,
} from "./persistence";

// The away channel: lines the MOO keeps while the game socket is down. They
// arrive over Web Push with a sequence number, and commands can go out over
// HTTP. This module is shared by the page and the service worker, so nothing
// here may touch `window`, `document` or localStorage.

export const AWAY_DB_NAME = "mongoose-away";
export const AWAY_NOTIFICATION_TAG = "mongoose-room";

const AWAY_DB_VERSION = 1;
const LINES_STORE = "lines";
const STATE_STORE = "state";
const TOKEN_KEY = "token";
// Highest seq stored or shown in the current away period.
const HIGHEST_SEQ_KEY = "highestSeq";
// Highest seq a page has already put in the output.
const SHOWN_SEQ_KEY = "shownSeq";

const TOKEN_ENDPOINT = "/api/away/token";
const LINES_ENDPOINT = "/api/away/lines";
const COMMAND_ENDPOINT = "/api/away/command";
const TOKEN_REFRESH_MARGIN_SECONDS = 7 * 24 * 60 * 60;

export type AwayLine = {
  seq: number;
  text: string;
};

export type AwayToken = {
  token: string;
  // Unix seconds.
  expiresAt: number;
};

export type AwayPushData = {
  lines: Array<[number, string]>;
  from?: number;
  to?: number;
};

export type AwayCommandResult =
  | { status: "sent"; lines: AwayLine[] }
  | { status: "no-token" }
  | { status: "unauthorized" }
  | { status: "rejected"; error: string };

const awayDatabaseSchema: IndexedDatabaseSchema = {
  name: AWAY_DB_NAME,
  version: AWAY_DB_VERSION,
  upgrade: (database) => {
    if (!database.objectStoreNames.contains(LINES_STORE)) {
      database.createObjectStore(LINES_STORE, { keyPath: "seq" });
    }
    if (!database.objectStoreNames.contains(STATE_STORE)) {
      database.createObjectStore(STATE_STORE);
    }
  },
};

// Runs one transaction over both stores. The database is opened and closed per
// call: the page and the service worker share it, and neither keeps it open.
async function withAwayStores<T>(
  mode: IDBTransactionMode,
  run: (lines: IDBObjectStore, state: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const database = await openIndexedDatabase(awayDatabaseSchema);
  try {
    const transaction = database.transaction([LINES_STORE, STATE_STORE], mode);
    const [result] = await Promise.all([
      run(transaction.objectStore(LINES_STORE), transaction.objectStore(STATE_STORE)),
      transactionDone(transaction),
    ]);
    return result;
  } finally {
    database.close();
  }
}

async function readSeq(state: IDBObjectStore, key: string): Promise<number> {
  const value: unknown = await requestToPromise(state.get(key));
  return typeof value === "number" ? value : 0;
}

function forgetLines(lines: IDBObjectStore, state: IDBObjectStore): void {
  lines.clear();
  state.delete(HIGHEST_SEQ_KEY);
  state.delete(SHOWN_SEQ_KEY);
}

// The lines after `after`, one per seq, in order.
function newerLines(lines: AwayLine[], after: number): AwayLine[] {
  const bySeq = new Map<number, AwayLine>();
  for (const { seq, text } of lines) {
    if (typeof seq === "number" && typeof text === "string" && seq > after) {
      bySeq.set(seq, { seq, text });
    }
  }
  return [...bySeq.values()].sort((a, b) => a.seq - b.seq);
}

function awayFetch(url: string, token: string, init: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
}

export function readAwayToken(): Promise<AwayToken | null> {
  return withAwayStores("readonly", async (_lines, state) => {
    const stored: AwayToken | undefined = await requestToPromise(state.get(TOKEN_KEY));
    return stored ?? null;
  });
}

export function storeAwayToken(token: AwayToken): Promise<void> {
  return withAwayStores("readwrite", async (_lines, state) => {
    state.put(token, TOKEN_KEY);
  });
}

export function dropAwayToken(): Promise<void> {
  return withAwayStores("readwrite", async (_lines, state) => {
    state.delete(TOKEN_KEY);
  });
}

/**
 * Makes sure a long-lived away token is stored, trading the short-lived push
 * token for one unless the stored one is still more than 7 days from expiry.
 */
export async function ensureAwayToken(pushToken: string): Promise<void> {
  const stored = await readAwayToken();
  if (stored && stored.expiresAt - Date.now() / 1000 > TOKEN_REFRESH_MARGIN_SECONDS) {
    return;
  }

  const url = resolveApiUrl(TOKEN_ENDPOINT);
  const response = await awayFetch(url, pushToken, { method: "POST" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  const payload = (await response.json()) as { token?: unknown; expires_at?: unknown };
  if (typeof payload.token !== "string" || typeof payload.expires_at !== "number") {
    throw new Error("Away token missing from server response");
  }
  await storeAwayToken({ expiresAt: payload.expires_at, token: payload.token });
}

async function fetchAwayLines(after: number, token: string): Promise<AwayLine[]> {
  const url = `${resolveApiUrl(LINES_ENDPOINT)}?after=${after}`;
  const response = await awayFetch(url, token, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  const payload = (await response.json()) as { lines?: unknown };
  return Array.isArray(payload.lines) ? (payload.lines as AwayLine[]) : [];
}

/**
 * Stores the lines a push carried and returns the ones that are new. A push
 * starting at seq 1 when lines are already stored begins a new away period,
 * so the old ones are discarded first. A gap before the push is repaired with
 * one fetch; if that fails, what the push carried is kept.
 */
export async function recordAwayPush(data: AwayPushData): Promise<AwayLine[]> {
  const pushed = newerLines(
    data.lines.filter(Array.isArray).map(([seq, text]) => ({ seq, text })),
    0,
  );
  const from = typeof data.from === "number" ? data.from : pushed[0]?.seq;

  const { highest, token } = await withAwayStores("readwrite", async (lines, state) => {
    const stored: AwayToken | undefined = await requestToPromise(state.get(TOKEN_KEY));
    const highest = await readSeq(state, HIGHEST_SEQ_KEY);
    if (from === 1 && highest >= 1) {
      forgetLines(lines, state);
      return { highest: 0, token: stored?.token };
    }
    return { highest, token: stored?.token };
  });

  let missed: AwayLine[] = [];
  if (from !== undefined && from > highest + 1 && token) {
    try {
      missed = await fetchAwayLines(highest, token);
    } catch (error) {
      console.error("[away] could not fetch the lines missing before a push", error);
    }
  }

  const fresh = newerLines([...missed, ...pushed], highest);
  if (fresh.length > 0) {
    await withAwayStores("readwrite", async (lines, state) => {
      for (const line of fresh) {
        lines.put(line);
      }
      state.put(fresh[fresh.length - 1].seq, HIGHEST_SEQ_KEY);
    });
  }
  return fresh;
}

/**
 * Returns the lines no page has shown yet (stored ones plus `extra`, which a
 * page already holds), in order, and marks them shown, so a seq is handed out
 * only once however it arrives.
 */
export function takeUnshownAwayLines(extra: AwayLine[] = []): Promise<AwayLine[]> {
  return withAwayStores("readwrite", async (lines, state) => {
    const shown = await readSeq(state, SHOWN_SEQ_KEY);
    const stored: AwayLine[] = await requestToPromise(
      lines.getAll(IDBKeyRange.lowerBound(shown, true)),
    );
    const fresh = newerLines([...stored, ...extra], shown);
    if (fresh.length > 0) {
      const last = fresh[fresh.length - 1].seq;
      state.put(last, SHOWN_SEQ_KEY);
      if (last > (await readSeq(state, HIGHEST_SEQ_KEY))) {
        state.put(last, HIGHEST_SEQ_KEY);
      }
    }
    return fresh;
  });
}

/** Forgets the stored lines and both marks; the token stays. */
export function clearAwayLines(): Promise<void> {
  return withAwayStores("readwrite", async (lines, state) => {
    forgetLines(lines, state);
  });
}

/** Sends a command over HTTP with the stored away token, if there is one. */
export async function sendAwayCommand(line: string): Promise<AwayCommandResult> {
  const stored = await readAwayToken();
  if (!stored) {
    return { status: "no-token" };
  }

  const url = resolveApiUrl(COMMAND_ENDPOINT);
  const response = await awayFetch(url, stored.token, {
    body: JSON.stringify({ line }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (response.status === 401) {
    await dropAwayToken();
    return { status: "unauthorized" };
  }

  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
    lines?: unknown;
  } | null;
  if (!response.ok) {
    const error =
      typeof payload?.error === "string" ? payload.error : `HTTP ${response.status} from ${url}`;
    return { error, status: "rejected" };
  }
  return {
    lines: Array.isArray(payload?.lines) ? (payload.lines as AwayLine[]) : [],
    status: "sent",
  };
}
