import { afterEach, describe, expect, it, vi } from 'vitest';
import { StorageOwner } from './storage';
import { installStorageWorker, type StorageMessage, type StorageReply } from './storage.worker';
import { metadata } from './protocol';

function bridge() {
  const worker = {
    onmessage: null as ((e: MessageEvent<StorageReply>) => void) | null,
    onerror: null as (() => void) | null,
    terminate: vi.fn(),
    postMessage: (data: StorageMessage) => scope.onmessage?.(new MessageEvent('message', { data })),
  };
  const scope = {
    onmessage: null as ((e: MessageEvent<StorageMessage>) => void) | null,
    postMessage: (data: StorageReply) =>
      queueMicrotask(() => worker.onmessage?.(new MessageEvent('message', { data }))),
  };
  installStorageWorker(scope);
  return worker;
}
const binding = {
  t: 'a'.repeat(32),
  a: 1,
  source: { player: '#1', endpoint: 'b'.repeat(32), epoch: 'c'.repeat(32) },
  offer: 'd'.repeat(32),
  meta: metadata({ id: 'e'.repeat(64), name: 'test', size: 16384 }),
};
afterEach(() => vi.useRealTimers());
describe('storage worker and main-thread facade', () => {
  it('bounds queued payload bytes and continues serving metadata after refusing overload', async () => {
    const worker = bridge();
    const replies: StorageReply[] = [];
    worker.onmessage = (e) => replies.push(e.data);
    worker.postMessage({ seq: 1, owner: 'test', generation: 1, init: { persistent: false } });
    await vi.waitFor(() => expect(replies).toHaveLength(1));
    worker.postMessage({
      seq: 2,
      owner: 'test',
      generation: 1,
      command: {
        op: 'put',
        t: binding.t,
        a: 1,
        index: 0,
        bytes: new ArrayBuffer(8 * 1024 ** 2 + 1),
      },
    });
    worker.postMessage({ seq: 3, owner: 'test', generation: 1, command: { op: 'receipts' } });
    await vi.waitFor(() => expect(replies).toHaveLength(3));
    expect(replies.find((r) => r.seq === 2)?.error).toBe('Storage queue limit');
    expect(replies.find((r) => r.seq === 3)?.value).toEqual([]);
  });
  it('does not let an in-flight reservation clear a later cancellation fence', async () => {
    const worker = bridge();
    const owner = new StorageOwner('test', 1, false, worker as unknown as Worker);
    await owner.ready;
    const reserve = owner.reserve(binding);
    const put = owner.put(binding.t, 1, 0, new ArrayBuffer(16384));
    const release = owner.release(binding.t);
    await expect(reserve).rejects.toThrow('Stale');
    await expect(put).rejects.toThrow('Stale');
    await release;
    await owner.reserve({ ...binding, a: 2 });
    await owner.close();
  });
  it('serializes commands, fences queued writes immediately, and survives a failed operation', async () => {
    const worker = bridge();
    const owner = new StorageOwner('test', 1, false, worker as unknown as Worker);
    await owner.ready;
    await owner.reserve(binding);
    const put = owner.put(binding.t, 1, 0, new ArrayBuffer(16384));
    const release = owner.release(binding.t);
    await expect(put).rejects.toThrow('Stale');
    await release;
    await owner.reserve({ ...binding, a: 2 });
    expect(await owner.put(binding.t, 2, 0, new ArrayBuffer(16384))).toBe(true);
    await owner.close();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it('rejects wrong owner/generation messages instead of leaving callers pending', async () => {
    const worker = bridge();
    const replies: StorageReply[] = [];
    worker.onmessage = (e) => replies.push(e.data);
    worker.postMessage({ seq: 1, owner: 'a', generation: 1, init: { persistent: false } });
    await vi.waitFor(() => expect(replies).toHaveLength(1));
    worker.postMessage({ seq: 2, owner: 'wrong', generation: 1, command: { op: 'receipts' } });
    worker.postMessage({ seq: 3, owner: 'a', generation: 2, command: { op: 'receipts' } });
    await vi.waitFor(() => expect(replies).toHaveLength(3));
    expect(replies.slice(1).every((r) => r.error)).toBe(true);
  });
  it('terminates a failed worker and rejects outstanding and future calls', async () => {
    const worker = bridge();
    const owner = new StorageOwner('test', 1, false, worker as unknown as Worker);
    await owner.ready;
    worker.onerror?.();
    await expect(owner.receipts()).rejects.toThrow();
    await expect(owner.close()).rejects.toThrow();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
