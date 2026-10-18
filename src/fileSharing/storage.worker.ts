import { StorageDatabase, type Binding, type Receipt, type ExportRecord } from './storageDatabase';
export type StorageCommand =
  | { op: 'adoptEphemeral'; owner: string }
  | { op: 'readForExport'; sender: Receipt['sender']; offer: string }
  | { op: 'discard'; sender: Receipt['sender']; offer: string }
  | { op: 'hash'; file: Blob; token: string }
  | { op: 'reserve'; binding: Binding }
  | { op: 'put'; t: string; a: number; index: number; bytes: ArrayBuffer }
  | { op: 'verify'; t: string; a: number }
  | { op: 'release' | 'releaseSaved' | 'fence'; t: string }
  | { op: 'receipt'; sender: Receipt['sender']; offer: string }
  | { op: 'saveReceipt'; receipt: Receipt }
  | { op: 'exportRecord'; record: ExportRecord }
  | { op: 'receipts' | 'close' };
export type StorageRequest = {
  seq: number;
  owner: string;
  generation: number;
  command: StorageCommand;
};
export type StorageReply = { seq: number; value?: unknown; error?: string };
export async function execute(
  db: StorageDatabase,
  c: StorageCommand,
  current = () => true,
): Promise<unknown> {
  switch (c.op) {
    case 'adoptEphemeral':
      return db.adoptEphemeral(c.owner);
    case 'readForExport':
      return db.readForExport(c.sender, c.offer);
    case 'discard':
      return db.discard(c.sender, c.offer);
    case 'hash':
      return db.hash(c.file, c.token);
    case 'reserve':
      return db.reserve(c.binding, current);
    case 'put':
      return db.put(c.t, c.a, c.index, c.bytes);
    case 'verify':
      return db.verify(c.t, c.a);
    case 'release':
      return db.release(c.t);
    case 'releaseSaved':
      return db.releaseSaved(c.t);
    case 'fence':
      return db.fence(c.t);
    case 'receipt':
      return db.receipt(c.sender, c.offer);
    case 'saveReceipt':
      return db.saveReceipt(c.receipt);
    case 'exportRecord':
      return db.exportRecord(c.record);
    case 'receipts':
      return db.receipts();
    case 'close':
      return db.close();
  }
}
export type StorageMessage =
  | StorageRequest
  | {
      seq: number;
      owner: string;
      generation: number;
      init: { persistent: boolean };
    };
export type StorageWorkerScope = {
  onmessage: ((e: MessageEvent<StorageMessage>) => void) | null;
  postMessage(data: StorageReply): void;
};
/** The test seam installs the same queue/fence handler used by the dedicated worker. */
export function installStorageWorker(scope: StorageWorkerScope): void {
  let db: StorageDatabase | undefined;
  let owner = '';
  let generation = 0;
  let serial = Promise.resolve();
  let pending = 0;
  let queuedBytes = 0;
  const reservations = new Map<string, Set<{ cancelled: boolean }>>();
  scope.onmessage = (
    e: MessageEvent<
      | StorageRequest
      | { seq: number; owner: string; generation: number; init: { persistent: boolean } }
    >,
  ) => {
    const m = e.data;
    if ('init' in m) {
      if (db) return;
      owner = m.owner;
      generation = m.generation;
      db = new StorageDatabase(owner, m.init.persistent, undefined, true);
      serial = db.open().then(
        () => scope.postMessage({ seq: m.seq }),
        (error) => scope.postMessage({ seq: m.seq, error: String(error) }),
      );
      return;
    }
    if (!db || m.owner !== owner || m.generation !== generation) {
      scope.postMessage({ seq: m.seq, error: 'Stale storage owner or generation' });
      return;
    }
    const bytes = m.command.op === 'put' ? m.command.bytes.byteLength : 0;
    if (++pending > 512 || queuedBytes + bytes > 8 * 1024 ** 2) {
      pending--;
      scope.postMessage({ seq: m.seq, error: 'Storage queue limit' });
      return;
    }
    queuedBytes += bytes;
    const reservation = { cancelled: false };
    const token = m.command.op === 'reserve' ? m.command.binding.t : undefined;
    if (token) {
      const rows = reservations.get(token) ?? new Set();
      rows.add(reservation);
      reservations.set(token, rows);
    }
    if (m.command.op === 'fence' || m.command.op === 'release') {
      for (const row of reservations.get(m.command.t) ?? []) row.cancelled = true;
      db.fence(m.command.t);
    }
    if (m.command.op === 'close') db.invalidate();
    const current = db;
    serial = serial.then(async () => {
      try {
        const value = await execute(current, m.command, () => !reservation.cancelled);
        if (m.command.op === 'adoptEphemeral') owner = current.ownerKey;
        scope.postMessage({ seq: m.seq, value });
      } catch (error) {
        scope.postMessage({
          seq: m.seq,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        pending--;
        queuedBytes -= bytes;
        if (token) {
          reservations.get(token)?.delete(reservation);
          if (!reservations.get(token)?.size) reservations.delete(token);
        }
      }
    });
  };
}

if (typeof document === 'undefined') installStorageWorker(self as unknown as StorageWorkerScope);
