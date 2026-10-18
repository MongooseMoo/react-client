import 'fake-indexeddb/auto';

import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import type { FileTransferEngineOptions } from './FileTransferEngine';
import type { FileTransfers, TransferLinkHandlers } from './types';

const { engines } = vi.hoisted(() => ({
  engines: [] as Array<{ options: FileTransferEngineOptions }>,
}));

vi.mock('./FileTransferEngine', () => ({
  FileTransferEngine: class {
    constructor(readonly options: FileTransferEngineOptions) {
      engines.push(this);
    }
    on() {
      return this;
    }
  },
}));

import { createFileTransfers, ICE_CONFIGURATION } from './createFileTransfers';
import { ownerKey, usePersonalDataStore } from '../stores/personalDataStore';
import { transferDatabaseName } from './storage';

const SOME_ID = 'ab'.repeat(32);

const linkHandlers: TransferLinkHandlers = {
  onCandidate: () => undefined,
  onOpen: () => undefined,
  onFrame: () => undefined,
  onDown: () => undefined,
};

function fakeGmcp() {
  return {
    on: vi.fn(() => () => undefined),
    sendOffer: vi.fn(),
    sendAccept: vi.fn(),
    sendCandidate: vi.fn(),
    sendReject: vi.fn(),
    sendCancel: vi.fn(),
  };
}

function create(gmcp = fakeGmcp()): { transfers: FileTransfers; options: FileTransferEngineOptions } {
  const transfers = createFileTransfers(gmcp as unknown as GMCPClientFileTransfer);
  return { transfers, options: engines[engines.length - 1].options };
}

beforeEach(() => {
  usePersonalDataStore.setState({ policyReady: true, visitor: false, owner: { runtime: 'fixture', playerUuid: 'a', playerRef: '#1' } });
  engines.length = 0;
  globalThis.indexedDB = new IDBFactory();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createFileTransfers', () => {
  it('returns the engine it assembled', () => {
    const { transfers } = create();

    expect(engines).toHaveLength(1);
    expect(transfers).toBe(engines[0]);
  });

  it('signals over the GMCP package it was given', () => {
    const gmcp = fakeGmcp();
    const { options } = create(gmcp);

    options.signaling.sendCancel('#2', SOME_ID);
    options.signaling.subscribe({
      offer: vi.fn(),
      answer: vi.fn(),
      candidate: vi.fn(),
      reject: vi.fn(),
      cancel: vi.fn(),
    });

    expect(gmcp.sendCancel).toHaveBeenCalledWith({ recipient: '#2', hash: SOME_ID });
    expect(gmcp.on).toHaveBeenCalledWith('offer', expect.any(Function));
  });

  it('keeps received pieces in IndexedDB', async () => {
    const { options } = create();
    const key = { from: '#2', id: SOME_ID };

    await options.storage.putPiece(key, 3, new Uint8Array([1, 2, 3]).buffer);

    expect(await options.storage.heldPieces(key)).toEqual([3]);
    const owner = usePersonalDataStore.getState().owner;
    expect(owner).toBeDefined();
    expect((await indexedDB.databases()).map(({ name }) => name)).toContain(transferDatabaseName(owner ? ownerKey(owner) : undefined));
    options.storage.close();
  });

  it('opens each link as a peer connection with the ICE configuration', async () => {
    const connections: Array<RTCConfiguration | undefined> = [];
    vi.stubGlobal(
      'RTCPeerConnection',
      class {
        constructor(configuration?: RTCConfiguration) {
          connections.push(configuration);
        }
        addEventListener() {}
        createDataChannel() {
          return { addEventListener() {}, close() {} };
        }
        async createOffer() {
          return { type: 'offer', sdp: 'sdp' };
        }
        async setLocalDescription() {}
        close() {}
      },
    );
    const { options } = create();

    const link = options.createLink(linkHandlers);
    await link.createOffer();
    link.close();

    expect(connections).toEqual([ICE_CONFIGURATION]);
  });

  it('uses the Mongoose TURN and STUN servers with the policies the client has always used', () => {
    expect(ICE_CONFIGURATION).toEqual({
      iceServers: [
        {
          urls: ['turn:mongoose.world:3478', 'stun:mongoose.world:3478'],
          username: 'p2p',
          credential: 'p2p',
        },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });
  });
});

describe('the delivery of a received file', () => {
  it('blocks a delayed download after identity or visitor policy changes', () => {
    const createObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL });
    const { options } = create();
    usePersonalDataStore.getState().confirm({ runtime: 'fixture', playerUuid: 'b', playerRef: '#2' });
    void options.deliver({ from: '#2', id: SOME_ID, name: 'old.txt', blob: new Blob(['old']) });
    expect(createObjectURL).not.toHaveBeenCalled();
    const other = create();
    usePersonalDataStore.getState().setVisitor(true);
    void other.options.deliver({ from: '#2', id: SOME_ID, name: 'owner.txt', blob: new Blob(['owner']) });
    expect(createObjectURL).not.toHaveBeenCalled();
    options.storage.close();
    other.options.storage.close();
  });
  it('saves it through the browser under its name and releases the object URL', () => {
    const blob = new Blob(['hello']);
    const steps: string[] = [];
    const createObjectURL = vi.fn((_: Blob) => {
      steps.push('create');
      return 'blob:received';
    });
    const revokeObjectURL = vi.fn((_: string) => {
      steps.push('revoke');
    });
    // jsdom's URL has neither, so there is nothing to restore afterwards.
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const clicked: Array<{ href: string; download: string; attached: boolean }> = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      steps.push('click');
      clicked.push({ href: this.href, download: this.download, attached: this.isConnected });
    });
    const { options } = create();

    void options.deliver({ from: '#2', id: SOME_ID, name: 'notes.txt', blob });

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clicked).toEqual([{ href: 'blob:received', download: 'notes.txt', attached: true }]);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:received');
    expect(steps).toEqual(['create', 'click', 'revoke']);
    expect(document.querySelector('a[download]')).toBeNull();
  });
});
