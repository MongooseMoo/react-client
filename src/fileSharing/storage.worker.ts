import { StorageDatabase, type Binding, type Receipt, type ExportRecord } from './storageDatabase';
export type StorageCommand = { op: 'reserve'; binding: Binding } | { op: 'put'; t: string; a: number; index: number; bytes: ArrayBuffer } |
  { op: 'verify'; t: string; a: number } | { op: 'release' | 'fence'; t: string } | { op: 'receipt'; sender: Receipt['sender']; offer: string } |
  { op: 'saveReceipt'; receipt: Receipt } | { op: 'exportRecord'; record: ExportRecord } | { op: 'receipts' | 'close' };
export type StorageRequest = { seq: number; owner: string; generation: number; command: StorageCommand };
export type StorageReply = { seq: number; value?: unknown; error?: string };
export async function execute(db: StorageDatabase, c: StorageCommand): Promise<unknown> {
  switch (c.op) {
    case 'reserve': return db.reserve(c.binding);
    case 'put': return db.put(c.t,c.a,c.index,c.bytes);
    case 'verify': return db.verify(c.t,c.a);
    case 'release': return db.release(c.t);
    case 'fence': return db.fence(c.t);
    case 'receipt': return db.receipt(c.sender,c.offer);
    case 'saveReceipt': return db.saveReceipt(c.receipt);
    case 'exportRecord': return db.exportRecord(c.record);
    case 'receipts': return db.receipts();
    case 'close': return db.close();
  }
}
// Importing the executor in tests does not install a page message handler.
if (typeof document === 'undefined') {
  const scope = self as unknown as { onmessage: ((e: MessageEvent) => void) | null; postMessage(data: StorageReply): void };
  let db: StorageDatabase | undefined; let owner = ''; let generation = 0; let serial = Promise.resolve(); let pending = 0; let queuedBytes = 0;
  scope.onmessage = (e: MessageEvent<StorageRequest | { seq: number; owner: string; generation: number; init: { persistent: boolean } }>) => {
    const m = e.data;
    if ('init' in m) {
      if (db) return; owner = m.owner; generation = m.generation; db = new StorageDatabase(owner,m.init.persistent);
      serial = db.open().then(() => scope.postMessage({ seq: m.seq }), error => scope.postMessage({ seq: m.seq, error: String(error) })); return;
    }
    if (!db || m.owner !== owner || m.generation !== generation) return;
    const bytes = m.command.op === 'put' ? m.command.bytes.byteLength : 0;
    if (++pending > 512 || queuedBytes + bytes > 8 * 1024 ** 2) { pending--; scope.postMessage({ seq: m.seq, error: 'Storage queue limit' }); return; }
    queuedBytes += bytes;
    if (m.command.op === 'fence' || m.command.op === 'release') db.fence(m.command.t);
    const current = db;
    serial = serial.then(async () => {
      try { scope.postMessage({ seq: m.seq, value: await execute(current,m.command) }); }
      catch (error) { scope.postMessage({ seq: m.seq, error: error instanceof Error ? error.message : String(error) }); }
      finally { pending--; queuedBytes -= bytes; }
    });
  };
}
