import { check, MAX_FILE, randomId } from './protocol';
import type { Receipt } from './storageDatabase';
import type { StorageApi } from './storage';
/** Called only by an explicit Save action. Persist intent before the browser side effect. */
export async function exportDownload(
  storage: StorageApi,
  receipt: Receipt,
  blob: Blob,
  current: () => boolean,
): Promise<Receipt> {
  check(current() && blob.size === receipt.meta.size && blob.size <= MAX_FILE);
  const id = randomId();
  const record = {
    id,
    contentId: receipt.meta.id,
    sender: receipt.sender,
    offer: receipt.offer,
    t: receipt.t,
    state: 'exporting' as const,
  };
  await storage.exportRecord(record);
  check(current());
  const url = URL.createObjectURL(blob);
  try {
    check(current());
    const a = document.createElement('a');
    a.href = url;
    a.download = receipt.meta.name;
    document.body.appendChild(a);
    try {
      a.click();
    } finally {
      a.remove();
    }
    await storage.exportRecord({ ...record, state: 'browser-download' });
    const next: Receipt = { ...receipt, outcome: 'browser-download', touchedAt: Date.now() };
    await storage.saveReceipt(next);
    return next;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
