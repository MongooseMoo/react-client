import { check, type Endpoint, MAX_FILE } from './protocol';
import type { Binding, Receipt, ExportRecord } from './storageDatabase';
import type { StorageCommand, StorageReply } from './storage.worker';
export type StorageApi = Pick<StorageOwner, 'reserve' | 'put' | 'verify' | 'release' | 'receipt' | 'saveReceipt' | 'exportRecord' | 'receipts' | 'close'>;
/** Main-thread facade: the worker alone opens owner databases. The election owns this lifetime. */
export class StorageOwner {
  private seq = 0;
  private closing = false;
  private bytes = 0;
  private readonly pending = new Map<number, { resolve(v: unknown): void; reject(e: Error): void; bytes: number }>();
  readonly ready: Promise<void>;
  constructor(readonly owner: string, readonly generation: number, persistent: boolean, private readonly worker = new Worker(new URL('./storage.worker.ts', import.meta.url), { type: 'module' })) {
    worker.onmessage = (e: MessageEvent<StorageReply>) => { const p = this.pending.get(e.data.seq); if (!p) return; this.pending.delete(e.data.seq); this.bytes -= p.bytes; if (e.data.error) p.reject(new Error(e.data.error)); else p.resolve(e.data.value); };
    worker.onerror = () => { for (const p of this.pending.values()) p.reject(new Error('File storage worker failed')); this.pending.clear(); this.bytes = 0; };
    this.ready = this.post({ init: { persistent } }).then(() => undefined);
  }
  private post(extra: { init: { persistent: boolean } } | { command: StorageCommand }): Promise<unknown> {
    check(!this.closing && this.pending.size < 512, 'File storage unavailable');
    const bytes = 'command' in extra && extra.command.op === 'put' ? extra.command.bytes.byteLength : 0;
    check(this.bytes + bytes <= 8 * 1024 ** 2, 'File storage buffer limit'); this.bytes += bytes;
    const seq = ++this.seq;
    return new Promise((resolve,reject) => { this.pending.set(seq,{ resolve,reject,bytes }); this.worker.postMessage({ seq, owner: this.owner, generation: this.generation, ...extra }); });
  }
  private async call<T>(command: StorageCommand): Promise<T> { await this.ready; return await this.post({ command }) as T; }
  async reserve(binding: Binding): Promise<number[]> {
    check(binding.meta.size <= MAX_FILE);
    if (binding.meta.size >= 16 * 1024 ** 2) {
      await navigator.storage?.persist?.();
      const estimate = await navigator.storage?.estimate?.();
      check(estimate?.quota !== undefined && estimate.usage !== undefined && estimate.quota - estimate.usage >= binding.meta.size + Math.max(64 * 1024 ** 2,binding.meta.size / 10), 'Insufficient file storage space');
    }
    return this.call({ op: 'reserve', binding });
  }
  put(t: string,a: number,index: number,bytes: ArrayBuffer): Promise<boolean> { return this.call({ op: 'put',t,a,index,bytes }); }
  verify(t: string,a: number): Promise<Blob> { return this.call({ op: 'verify',t,a }); }
  release(t: string): Promise<void> { return this.call({ op: 'release',t }); }
  receipt(sender: Endpoint,offer: string): Promise<Receipt | undefined> { return this.call({ op: 'receipt',sender,offer }); }
  saveReceipt(receipt: Receipt): Promise<void> { return this.call({ op: 'saveReceipt',receipt }); }
  exportRecord(record: ExportRecord): Promise<void> { return this.call({ op: 'exportRecord',record }); }
  receipts(): Promise<Receipt[]> { return this.call({ op: 'receipts' }); }
  async close(): Promise<void> { if (this.closing) return; try { await this.call({ op: 'close' }); } finally { this.closing = true; this.worker.terminate(); for (const p of this.pending.values()) p.reject(new Error('Storage closed')); this.pending.clear(); } }
}
