import { afterEach, describe, expect, it, vi } from 'vitest';
import { EndpointController } from './endpoint';
import { MemoryPort } from './testHarness';
import type { PeerInbound, PeerOutbound } from './protocol';
const owner = '["runtime","uuid","#1"]';
describe('Files endpoint recovery', () => {
  afterEach(() => vi.useRealTimers());
  it('times out silently, backs off with fresh ids, and never uses game login', async () => {
    vi.useFakeTimers(); const peer = new MemoryPort<PeerInbound,PeerOutbound>(); const lost = vi.fn();
    const endpoint = new EndpointController({ peer, owner, player: '#1', acquire: async () => {}, lost, random: () => 0 });
    await endpoint.start(); const first = peer.sent[0]; expect(first.kind).toBe('Hello');
    await vi.advanceTimersByTimeAsync(10000); expect(lost).toHaveBeenCalled(); expect(endpoint.status).toBe('');
    await vi.advanceTimersByTimeAsync(1000); expect(peer.sent[1].data.endpoint).not.toBe(first.data.endpoint);
    await vi.advanceTimersByTimeAsync(19000); expect(endpoint.status).toBe('File transfers unavailable; retrying'); await endpoint.stop();
  });
  it('parks superseded no-lock tabs across stop/start until an explicit player action', async () => {
    const peer = new MemoryPort<PeerInbound,PeerOutbound>(); const endpoint = new EndpointController({ peer, owner, player: '#1', acquire: async () => {}, lost: () => {} });
    await endpoint.start(); const hello = peer.sent[0].data;
    const self = { player: '#1', endpoint: hello.endpoint, epoch: 'e'.repeat(32) };
    peer.deliver('Ready',{ req: hello.req, hub: 'f'.repeat(32),self,peer:1,files:1,data:1,features:['base'],maxReceiveSize:104857600,canShare:false,leaseMs:30000,heartbeatMs:10000 });
    peer.deliver('End',{ event:'a'.repeat(32),self,reason:'superseded' }); await endpoint.stop(); await endpoint.start();
    expect(peer.sent).toHaveLength(1); await endpoint.useThisTab(); expect(peer.sent).toHaveLength(2); await endpoint.stop();
  });
});
