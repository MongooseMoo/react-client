import { check, type Endpoint, MAX_FILE } from './protocol';
import type { Binding, Receipt, ExportRecord } from './storageDatabase';
import type { StorageCommand, StorageReply } from './storage.worker';
export type StorageApi = Pick<
  StorageOwner,
  | 'hash'
  | 'readForExport'
  | 'reserve'
  | 'put'
  | 'verify'
  | 'release'
  | 'releaseSaved'
  | 'receipt'
  | 'saveReceipt'
  | 'exportRecord'
  | 'receipts'
  | 'close'
>;
/** Main-thread facade: the worker alone opens owner databases. The election owns this lifetime. */
export class StorageOwner {
  private readonly persistent: boolean;
  persistenceDenied = false;
  private seq = 0;
  private closing = false;
  private failed?: Error;
  private bytes = 0;
  private readonly pending = new Map<
    number,
    { resolve(v: unknown): void; reject(e: Error): void; bytes: number }
  >();
  ready: Promise<void>;
  constructor(
    public owner: string,
    readonly generation: number,
    persistent: boolean,
    private readonly worker = new Worker(new URL('./storage.worker.ts', import.meta.url), {
      type: 'module',
    }),
  ) {
    this.persistent = persistent;
    worker.onmessage = (e: MessageEvent<StorageReply>) => {
      const p = this.pending.get(e.data.seq);
      if (!p) return;
      this.pending.delete(e.data.seq);
      this.bytes -= p.bytes;
      if (e.data.error) p.reject(new Error(e.data.error));
      else p.resolve(e.data.value);
    };
    worker.onerror = () => {
      this.failed = new Error('File storage worker failed');
      for (const p of this.pending.values()) p.reject(this.failed);
      this.pending.clear();
      this.bytes = 0;
    };
    this.ready = this.quotaLock(() => this.post({ init: { persistent } })).then(() => undefined);
  }
  private async quotaLock<T>(work: () => Promise<T>): Promise<T> {
    if (this.persistent && navigator.locks)
      return navigator.locks.request(
        'file-sharing-v2:quota',
        { mode: 'exclusive' },
        work,
      ) as Promise<T>;
    return work();
  }
  adoptEphemeral(owner: string): void {
    this.ready = this.ready
      .then(() => this.post({ command: { op: 'adoptEphemeral', owner } }))
      .then(() => {
        this.owner = owner;
      });
  }
  private post(
    extra: { init: { persistent: boolean } } | { command: StorageCommand },
  ): Promise<unknown> {
    check(!this.closing && !this.failed && this.pending.size < 512, 'File storage unavailable');
    const bytes =
      'command' in extra && extra.command.op === 'put' ? extra.command.bytes.byteLength : 0;
    check(this.bytes + bytes <= 8 * 1024 ** 2, 'File storage buffer limit');
    this.bytes += bytes;
    const seq = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(seq, { resolve, reject, bytes });
      try {
        this.worker.postMessage({ seq, owner: this.owner, generation: this.generation, ...extra });
      } catch (error) {
        this.pending.delete(seq);
        this.bytes -= bytes;
        reject(error);
      }
    });
  }
  private async call<T>(command: StorageCommand): Promise<T> {
    await this.ready;
    return (await this.post({ command })) as T;
  }
  hash(file: Blob, token: string): Promise<string> {
    return this.call({ op: 'hash', file, token });
  }
  readForExport(sender: Endpoint, offer: string): Promise<Blob> {
    return this.call({ op: 'readForExport', sender, offer });
  }
  async reserve(binding: Binding): Promise<number[]> {
    check(binding.meta.size <= MAX_FILE);
    if (this.persistent && binding.meta.size >= 16 * 1024 ** 2)
      this.persistenceDenied = !(await navigator.storage?.persist?.());
    return this.quotaLock(() => this.call({ op: 'reserve', binding }));
  }
  put(t: string, a: number, index: number, bytes: ArrayBuffer): Promise<boolean> {
    return this.call({ op: 'put', t, a, index, bytes });
  }
  verify(t: string, a: number): Promise<Blob> {
    return this.call({ op: 'verify', t, a });
  }
  release(t: string): Promise<void> {
    return this.call({ op: 'release', t });
  }
  releaseSaved(t: string): Promise<void> {
    return this.quotaLock(() => this.call({ op: 'releaseSaved', t }));
  }
  receipt(sender: Endpoint, offer: string): Promise<Receipt | undefined> {
    return this.call({ op: 'receipt', sender, offer });
  }
  saveReceipt(receipt: Receipt): Promise<void> {
    return this.call({ op: 'saveReceipt', receipt });
  }
  exportRecord(record: ExportRecord): Promise<void> {
    return this.call({ op: 'exportRecord', record });
  }
  receipts(): Promise<Receipt[]> {
    return this.call({ op: 'receipts' });
  }
  async close(): Promise<void> {
    if (this.closing) return;
    try {
      await this.call({ op: 'close' });
    } finally {
      this.closing = true;
      this.worker.terminate();
      for (const p of this.pending.values()) p.reject(new Error('Storage closed'));
      this.pending.clear();
    }
  }
}
