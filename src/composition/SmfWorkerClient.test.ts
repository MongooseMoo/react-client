import { afterEach, describe, it, expect, vi } from 'vitest';
import { SmfWorkerClient } from './SmfWorkerClient';
afterEach(() => vi.useRealTimers());
function setup() {
  const workers: Array<{
    terminate: ReturnType<typeof vi.fn>;
    postMessage: ReturnType<typeof vi.fn>;
    onmessage: ((event: { data: unknown }) => void) | null;
    onerror: unknown;
  }> = [];
  const client = new SmfWorkerClient(() => {
    const worker = {
      terminate: vi.fn(),
      postMessage: vi.fn(),
      onmessage: null as ((event: { data: unknown }) => void) | null,
      onerror: null,
    };
    workers.push(worker);
    return worker as unknown as Worker;
  });
  return { client, workers };
}
describe('bounded SMF worker ownership', () => {
  it('terminates on cancellation and ignores stale results', async () => {
    const { client, workers } = setup(),
      controller = new AbortController();
    const pending = client.import(new ArrayBuffer(1), controller.signal);
    controller.abort();
    await expect(pending).rejects.toHaveProperty('name', 'AbortError');
    expect(workers[0].terminate).toHaveBeenCalledOnce();
    expect(workers[0].onmessage).toBeNull();
  });
  it('enforces a two-second hard deadline and never constructs a worker for excess bytes', async () => {
    vi.useFakeTimers();
    const { client, workers } = setup();
    await expect(client.import(new ArrayBuffer(1048577))).rejects.toThrow('1 MiB');
    expect(workers).toHaveLength(0);
    const pending = client.import(new ArrayBuffer(1));
    const result = expect(pending).rejects.toHaveProperty('name', 'TimeoutError');
    await vi.advanceTimersByTimeAsync(2000);
    await result;
    expect(workers[0].terminate).toHaveBeenCalledOnce();
  });
  it('supersedes older work and cleans up after successful completion', async () => {
    const { client, workers } = setup();
    const old = client.import(new ArrayBuffer(1));
    const current = client.import(new ArrayBuffer(2));
    await expect(old).rejects.toHaveProperty('name', 'AbortError');
    workers[1].onmessage?.({ data: { ok: true, result: { score: 'ready' } } });
    expect(await current).toEqual({ score: 'ready' });
    expect(workers[1].terminate).toHaveBeenCalledOnce();
  });
});
