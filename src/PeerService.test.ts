import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PeerService } from './PeerService';

type Handler = (...args: unknown[]) => void;

interface MockPeerInstance {
  connect: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  emit(event: string, ...args: unknown[]): void;
}

const { peerInstances } = vi.hoisted(() => ({
  peerInstances: [] as MockPeerInstance[],
}));

vi.mock('peerjs', () => ({
  default: class MockPeer implements MockPeerInstance {
    readonly connect = vi.fn(() => ({
      close: vi.fn(),
      on: vi.fn(),
    }));
    readonly destroy = vi.fn();
    private readonly handlers = new Map<string, Handler>();

    constructor() {
      peerInstances.push(this);
    }

    on(event: string, handler: Handler): this {
      this.handlers.set(event, handler);
      return this;
    }

    emit(event: string, ...args: unknown[]): void {
      this.handlers.get(event)?.(...args);
    }
  },
}));

describe('PeerService', () => {
  beforeEach(() => {
    peerInstances.length = 0;
  });

  it('connects through the peer whose open event started the join', () => {
    const service = new PeerService();

    void service.joinSession('first-room');
    void service.joinSession('second-room');

    const [firstPeer, secondPeer] = peerInstances;
    firstPeer.emit('open');

    expect(firstPeer.connect).toHaveBeenCalledWith('first-room', { reliable: true });
    expect(secondPeer.connect).not.toHaveBeenCalled();

    service.destroy();
  });
});
