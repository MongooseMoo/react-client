import { afterEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import { usePersonalDataStore } from '../stores/personalDataStore';
import { useSessionStore } from '../stores/sessionStore';
import { check } from './protocol';
import { Phase1Hub } from './testHarness';
import { OwnerService } from './ownerService';

const mocks = vi.hoisted(() => ({
  engines: [] as { dispose: ReturnType<typeof vi.fn> }[],
  failOpen: 0,
}));
vi.mock('./legacyService', () => ({
  createLegacyService: () => {
    const engine = { dispose: vi.fn(), on: vi.fn(), transfers: () => [], off: vi.fn() };
    mocks.engines.push(engine);
    return engine;
  },
}));
vi.mock('./storage', () => ({
  StorageOwner: class {
    ready =
      mocks.failOpen-- > 0 ? Promise.reject(new Error('IndexedDB open failed')) : Promise.resolve();
    close = vi.fn(async () => {});
    adoptEphemeral = vi.fn();
    receipts = async () => [];
  },
}));
let service: OwnerService | undefined;
afterEach(async () => {
  service?.dispose();
  await Promise.resolve();
  await Promise.resolve();
  usePersonalDataStore.setState({ visitor: false, policyReady: false, owner: undefined });
  useSessionStore.getState().reset();
  mocks.engines.length = 0;
  mocks.failOpen = 0;
  vi.useRealTimers();
});
async function start() {
  usePersonalDataStore.setState({ visitor: true, policyReady: true });
  useSessionStore.getState().setPlayer('#1', 'visitor');
  const hub = new Phase1Hub();
  const port = hub.peer('#1');
  const client = {
    connected: true,
    fileSharingParked: false,
    gmcp: {
      ready: true,
      confirmedPlayer: '#1',
      identityRevision: 1,
      require: (name: string) => (name === 'Client.Peer' ? port.peer : port.files),
    },
  } as unknown as MudClient;
  service = new OwnerService(client, {} as GMCPClientFileTransfer);
  await vi.waitFor(() => expect(port.ready).toBeDefined());
  return { hub, port, client };
}
describe('OwnerService lifecycle', () => {
  it('keeps a v1 receiver while a superseded visitor is parked', async () => {
    const { hub, port, client } = await start();
    hub.end(port, 'superseded');
    await vi.waitFor(() => expect(mocks.engines.length).toBe(2));
    expect(mocks.engines[0].dispose).toHaveBeenCalledOnce();
    expect(mocks.engines[1].dispose).not.toHaveBeenCalled();
    expect(client.fileSharingParked).toBe(true);
    expect(port.peer.sent.filter((m) => m.kind === 'Hello')).toHaveLength(1);
  });
  it('counts one bad message without disposing v1 and retries transient recovery storage errors', async () => {
    const { port } = await start();
    check(service);
    service.protocolFailure();
    expect(mocks.engines[0].dispose).not.toHaveBeenCalled();
    vi.useFakeTimers();
    mocks.failOpen = 1;
    for (let i = 0; i < 9; i++) service.protocolFailure();
    await vi.advanceTimersByTimeAsync(5000);
    expect(port.peer.sent.filter((m) => m.kind === 'Hello').length).toBeGreaterThan(1);
    expect(mocks.engines[mocks.engines.length - 1].dispose).not.toHaveBeenCalled();
  });
});
