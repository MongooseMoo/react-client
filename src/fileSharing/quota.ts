import { check } from './protocol';
/** Worker-only origin registry. Call while the page holds file-sharing-v2:quota. */
export class OriginQuota {
  private db?: IDBDatabase;
  private digest = '';
  async open(owner: string): Promise<void> {
    this.digest = [
      ...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(owner))),
    ]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
    this.db = await new Promise((resolve, reject) => {
      const r = indexedDB.open('file-sharing-v2:quota', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('owners', { keyPath: 'digest' });
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.onblocked = () => reject(new Error('File quota registry is blocked'));
    });
  }
  async update(bytes: number, admit = false): Promise<void> {
    check(this.db);
    const db = this.db;
    const rows: { digest: string; bytes: number }[] = await new Promise((resolve, reject) => {
      const r = db.transaction('owners').objectStore('owners').getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    if (admit) {
      const estimate = await navigator.storage?.estimate?.();
      check(
        estimate?.quota !== undefined && estimate.usage !== undefined,
        'Storage estimate unavailable',
      );
      const others = rows.filter((r) => r.digest !== this.digest).reduce((n, r) => n + r.bytes, 0);
      check(
        rows.length < 1024 || rows.some((r) => r.digest === this.digest),
        'File quota registry is full',
      );
      check(
        bytes <= Math.min(1024 ** 3, estimate.quota * 0.8) &&
          estimate.quota - estimate.usage - others - bytes >= Math.max(64 * 1024 ** 2, bytes * 0.1),
        'Insufficient file storage space',
      );
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('owners', 'readwrite');
      tx.objectStore('owners').put({ digest: this.digest, bytes });
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  }
  close(): void {
    this.db?.close();
  }
}
