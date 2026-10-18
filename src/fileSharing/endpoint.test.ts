import { afterEach, describe, expect, it, vi } from 'vitest';
import { EndpointController } from './endpoint';
import { MemoryPort } from './testHarness';
import type { PeerInbound, PeerOutbound } from './protocol';
const owner = '["runtime","uuid","#1"]';
describe('Files endpoint recovery', () => {
  it('I: retries a failed lost callback and releases the election even if shutdown storage fails', async () => {
    vi.useFakeTimers();
    const tail = new Map<string, Promise<unknown>>();
    const locks = {
      request: (name: string, _options: LockOptions, work: (lock: Lock) => Promise<void>) => {
        const pending = (tail.get(name) ?? Promise.resolve()).then(() =>
          work({ name, mode: 'exclusive' }),
        );
        tail.set(
          name,
          pending.catch(() => {}),
        );
        return pending;
      },
    } as unknown as LockManager;
    const first = new MemoryPort<PeerInbound, PeerOutbound>();
    const second = new MemoryPort<PeerInbound, PeerOutbound>();
    const lost = vi
      .fn()
      .mockRejectedValueOnce(new Error('IndexedDB open failed'))
      .mockResolvedValue(undefined);
    const a = new EndpointController({
      peer: first,
      owner,
      player: '#1',
      locks,
      acquire: async () => {},
      lost,
      random: () => 0,
    });
    const b = new EndpointController({
      peer: second,
      owner,
      player: '#1',
      locks,
      acquire: async () => {},
      lost: () => {},
    });
    await a.start();
    await b.start();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(14000);
    expect(first.sent.length).toBeGreaterThan(1);
    lost.mockRejectedValue(new Error('Storage close failed'));
    await expect(a.stop()).resolves.toBeUndefined();
    await vi.advanceTimersByTimeAsync(0);
    expect(second.sent).toHaveLength(1);
    await b.stop();
  });
  it('queues exactly one exclusive election request and hands ownership to a waiting tab', async () => {
    const tail = new Map<string, Promise<unknown>>();
    const request = vi.fn(
      (name: string, options: LockOptions, work: (lock: Lock) => Promise<void>) => {
        expect(options.ifAvailable).toBeUndefined();
        expect(options.mode).toBe('exclusive');
        const pending = (tail.get(name) ?? Promise.resolve()).then(() =>
          work({ name, mode: 'exclusive' }),
        );
        tail.set(name, pending);
        return pending;
      },
    );
    const locks = { request } as unknown as LockManager;
    const first = new MemoryPort<PeerInbound, PeerOutbound>();
    const second = new MemoryPort<PeerInbound, PeerOutbound>();
    const make = (peer: typeof first) =>
      new EndpointController({
        peer,
        owner,
        player: '#1',
        locks,
        acquire: async () => {},
        lost: () => {},
      });
    const a = make(first);
    const b = make(second);
    await a.start();
    await b.start();
    await vi.waitFor(() => expect(first.sent).toHaveLength(1));
    expect(second.sent).toHaveLength(0);
    expect(request).toHaveBeenCalledTimes(2);
    await a.stop();
    await vi.waitFor(() => expect(second.sent).toHaveLength(1));
    await b.stop();
  });
  afterEach(() => vi.useRealTimers());
  it('does not let a duplicate Ready renew an expired lease', async () => {
    vi.useFakeTimers();
    const peer = new MemoryPort<PeerInbound, PeerOutbound>();
    const lost = vi.fn();
    const endpoint = new EndpointController({
      peer,
      owner,
      player: '#1',
      acquire: async () => {},
      lost,
      random: () => 0,
    });
    await endpoint.start();
    const hello = peer.sent[0].data;
    const ready = {
      req: hello.req,
      hub: 'a'.repeat(32),
      self: { player: '#1', endpoint: hello.endpoint, epoch: 'b'.repeat(32) },
      peer: 1,
      files: 1,
      data: 1,
      features: ['base'],
      maxReceiveSize: 104857600,
      canShare: false,
      leaseMs: 30000,
      heartbeatMs: 10000,
    };
    peer.deliver('Ready', ready);
    await vi.advanceTimersByTimeAsync(25000);
    peer.deliver('Ready', ready);
    await vi.advanceTimersByTimeAsync(6000);
    expect(lost).toHaveBeenCalled();
    expect(peer.sent).toHaveLength(2);
    await endpoint.stop();
  });
  it('times out silently, backs off with fresh ids, and never uses game login', async () => {
    vi.useFakeTimers();
    const peer = new MemoryPort<PeerInbound, PeerOutbound>();
    const lost = vi.fn();
    const endpoint = new EndpointController({
      peer,
      owner,
      player: '#1',
      acquire: async () => {},
      lost,
      random: () => 0,
    });
    await endpoint.start();
    const first = peer.sent[0];
    expect(first.kind).toBe('Hello');
    await vi.advanceTimersByTimeAsync(10000);
    expect(lost).toHaveBeenCalled();
    expect(endpoint.status).toBe('');
    await vi.advanceTimersByTimeAsync(1000);
    expect(peer.sent[1].data.endpoint).not.toBe(first.data.endpoint);
    await vi.advanceTimersByTimeAsync(19000);
    expect(endpoint.status).toBe('File transfers unavailable; retrying');
    await endpoint.stop();
  });
  it('parks superseded no-lock tabs across stop/start until an explicit player action', async () => {
    const peer = new MemoryPort<PeerInbound, PeerOutbound>();
    const endpoint = new EndpointController({
      peer,
      owner,
      player: '#1',
      acquire: async () => {},
      lost: () => {},
    });
    await endpoint.start();
    const hello = peer.sent[0].data;
    const self = { player: '#1', endpoint: hello.endpoint, epoch: 'e'.repeat(32) };
    peer.deliver('Ready', {
      req: hello.req,
      hub: 'f'.repeat(32),
      self,
      peer: 1,
      files: 1,
      data: 1,
      features: ['base'],
      maxReceiveSize: 104857600,
      canShare: false,
      leaseMs: 30000,
      heartbeatMs: 10000,
    });
    peer.deliver('End', { event: 'a'.repeat(32), self, reason: 'superseded' });
    await endpoint.stop();
    await endpoint.start();
    expect(peer.sent).toHaveLength(1);
    await endpoint.activateThisTab();
    expect(peer.sent).toHaveLength(2);
    await endpoint.stop();
  });
});
