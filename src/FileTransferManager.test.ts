import EventEmitter from 'eventemitter3';
import { describe, expect, it, vi } from 'vitest';

import FileTransferManager from './FileTransferManager';
import type { FileTransferAccept, GMCPClientFileTransfer } from './gmcp/Client/FileTransfer';
import { useSessionStore } from './stores/sessionStore';
import type { WebRTCService } from './WebRTCService';

vi.mock('./FileTransferStore', () => ({
  FileTransferStore: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    saveFileMetadata: vi.fn().mockResolvedValue(undefined),
    saveChunk: vi.fn().mockResolvedValue(undefined),
  })),
}));

// jsdom's Blob does not implement arrayBuffer(); computeFileHash needs it.
if (typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Mirror the wire framing produced by FileTransferManager.sendChunk:
// [u32 LE headerSize][header JSON UTF-8][chunk bytes].
function frameChunk(
  header: {
    hash: string;
    filename: string;
    chunkIndex: number;
    totalChunks: number;
    chunkSize: number;
    totalSize: number;
  },
  chunkBytes: Uint8Array,
): ArrayBuffer {
  const headerBuffer = new TextEncoder().encode(JSON.stringify(header));
  const headerSizeBuffer = new ArrayBuffer(4);
  new DataView(headerSizeBuffer).setUint32(0, headerBuffer.byteLength, true);
  const out = new Uint8Array(4 + headerBuffer.byteLength + chunkBytes.byteLength);
  out.set(new Uint8Array(headerSizeBuffer), 0);
  out.set(headerBuffer, 4);
  out.set(chunkBytes, 4 + headerBuffer.byteLength);
  return out.buffer;
}

// Build a single-chunk framed buffer for the given bytes and header hash/filename.
function frameSingleChunk(hash: string, filename: string, bytes: Uint8Array): ArrayBuffer {
  return frameChunk(
    {
      hash,
      filename,
      chunkIndex: 0,
      totalChunks: 1,
      chunkSize: bytes.byteLength,
      totalSize: bytes.byteLength,
    },
    bytes,
  );
}

// The receive-completion path chains async work (store writes, FileReader-backed
// arrayBuffer, crypto.subtle.digest), so drain several macrotask turns.
const flush = async () => {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

// jsdom lacks URL.createObjectURL and does not navigate on anchor click.
// Stub both and capture the download attribute the manager sets.
function installDownloadCapture() {
  const originalCreate = (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  const originalRevoke = (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
  (URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => 'blob:mock');
  (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();
  const downloads: string[] = [];
  const clickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function click(this: HTMLAnchorElement) {
      downloads.push(this.download);
    });
  return {
    clickSpy,
    downloads,
    restore() {
      clickSpy.mockRestore();
      (URL as unknown as { createObjectURL: unknown }).createObjectURL = originalCreate;
      (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = originalRevoke;
    },
  };
}

function createManager() {
  useSessionStore.setState({ playerId: 'player' });
  const webRTCService = Object.assign(new EventEmitter(), {
    cleanup: vi.fn(),
    createPeerConnection: vi.fn(async () => {}),
    handleOffer: vi.fn(async () => {}),
    createAnswer: vi.fn(async () => ({ type: 'answer', sdp: 'mock' })),
    handleAnswer: vi.fn(async () => {}),
    isDataChannelOpen: vi.fn().mockReturnValue(false),
    sendData: vi.fn(async () => {}),
  });
  const gmcpFileTransfer = Object.assign(new EventEmitter(), {
    sendAccept: vi.fn(async () => {}),
    sendReject: vi.fn(),
    sendCancel: vi.fn(),
    sendRequestResend: vi.fn(),
  });
  const webRTCOn = vi.spyOn(webRTCService, 'on');
  const webRTCOff = vi.spyOn(webRTCService, 'off');
  const gmcpOn = vi.spyOn(gmcpFileTransfer, 'on');
  const gmcpOff = vi.spyOn(gmcpFileTransfer, 'off');

  const manager = new FileTransferManager(
    webRTCService as unknown as WebRTCService,
    gmcpFileTransfer as unknown as GMCPClientFileTransfer,
  );

  return {
    gmcpFileTransfer,
    gmcpOff,
    gmcpOn,
    manager,
    webRTCOff,
    webRTCOn,
    webRTCService,
  };
}

describe('FileTransferManager lifecycle', () => {
  it('unsubscribes the listeners it registered during cleanup', () => {
    const { gmcpOff, gmcpOn, manager, webRTCOff, webRTCOn, webRTCService } = createManager();

    manager.cleanup();

    expect(webRTCOff).toHaveBeenCalledWith('dataChannelMessage', webRTCOn.mock.calls[0][1]);
    expect(gmcpOff).toHaveBeenCalledWith(
      'offer',
      gmcpOn.mock.calls.find(([event]) => event === 'offer')?.[1],
    );
    expect(gmcpOff).toHaveBeenCalledWith(
      'accept',
      gmcpOn.mock.calls.find(([event]) => event === 'accept')?.[1],
    );
    expect(webRTCService.cleanup).toHaveBeenCalledTimes(1);
  });

  it('emits fileTransferAccepted when an outgoing transfer is accepted', async () => {
    const { manager, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const handleAccepted = vi.fn();
    manager.on('fileTransferAccepted', handleAccepted);
    const transfers = manager as unknown as {
      outgoingTransfers: Map<
        string,
        {
          file: File;
          filename: string;
          hash: string;
          lastActivityTimestamp: number;
          recipient: string;
        }
      >;
    };
    transfers.outgoingTransfers.set('file-hash', {
      file: new File(['hello'], 'hello.txt'),
      filename: 'hello.txt',
      hash: 'file-hash',
      lastActivityTimestamp: Date.now(),
      recipient: 'Bob',
    });

    await manager.handleAcceptedTransfer({
      sender: 'Bob',
      hash: 'file-hash',
      filename: 'hello.txt',
      answerSdp: '{}',
    } as FileTransferAccept);

    expect(handleAccepted).toHaveBeenCalledWith({
      sender: 'Bob',
      hash: 'file-hash',
      filename: 'hello.txt',
    });
  });
});

describe('FileTransferManager receive consent + integrity', () => {
  // Drive the real accept path: deliver an offer over GMCP, then accept it.
  // With isDataChannelOpen()=true, initializeWebRTC and waitForDataChannel resolve
  // immediately, so acceptTransfer runs to completion and records the accepted offer.
  async function acceptOffer(
    manager: FileTransferManager,
    gmcpFileTransfer: EventEmitter,
    offer: { sender: string; hash: string; filename: string; filesize: number },
  ): Promise<void> {
    gmcpFileTransfer.emit('offer', { ...offer, offerSdp: '{}' });
    await manager.acceptTransfer(offer.sender, offer.hash);
  }

  function readIncomingTransfers(manager: FileTransferManager): Map<string, unknown> {
    return (manager as unknown as { incomingTransfers: Map<string, unknown> }).incomingTransfers;
  }

  it('C1: drops chunks for a hash that was never accepted (no download, no completion)', async () => {
    const { manager, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const capture = installDownloadCapture();
    try {
      const bytes = new TextEncoder().encode('unsolicited payload');
      const hash = await sha256Hex(bytes);
      const onComplete = vi.fn();
      const onError = vi.fn();
      manager.on('fileReceiveComplete', onComplete);
      manager.on('fileTransferError', onError);

      webRTCService.emit('dataChannelMessage', frameSingleChunk(hash, 'evil.exe', bytes));
      await flush();

      expect(onComplete).not.toHaveBeenCalled();
      expect(capture.clickSpy).not.toHaveBeenCalled();
      expect(readIncomingTransfers(manager).size).toBe(0);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toMatchObject({ hash, direction: 'receive' });
      expect(onError.mock.calls[0][0].error).toMatch(/accept|unsolicited/i);
    } finally {
      capture.restore();
    }
  });

  it('C2 (theater): drops a self-consistent file whose hash was never accepted', async () => {
    // The user accepted offer hash A ("good file"). The peer instead pushes a different
    // file ("evil payload") whose header.hash matches its own bytes — the old integrity
    // check (computedHash === header.hash) would pass and auto-download. It must be rejected
    // because the delivered hash was never consented to.
    const { manager, gmcpFileTransfer, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const capture = installDownloadCapture();
    try {
      const goodBytes = new TextEncoder().encode('good file');
      const acceptedHash = await sha256Hex(goodBytes);
      await acceptOffer(manager, gmcpFileTransfer, {
        sender: 'Bob',
        hash: acceptedHash,
        filename: 'photo.jpg',
        filesize: goodBytes.byteLength,
      });

      const evilBytes = new TextEncoder().encode('evil payload');
      const evilHash = await sha256Hex(evilBytes); // self-consistent: header.hash === bytes' hash
      const onComplete = vi.fn();
      const onError = vi.fn();
      manager.on('fileReceiveComplete', onComplete);
      manager.on('fileTransferError', onError);

      webRTCService.emit('dataChannelMessage', frameSingleChunk(evilHash, 'invoice.exe', evilBytes));
      await flush();

      expect(onComplete).not.toHaveBeenCalled();
      expect(capture.clickSpy).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toMatchObject({ hash: evilHash, direction: 'receive' });
    } finally {
      capture.restore();
    }
  });

  it('C2 (integrity): rejects accepted-hash chunks whose assembled bytes do not match', async () => {
    // Accept hash A. Deliver bytes that hash to B but label the header with the accepted
    // hash A so the chunk passes the consent gate; the integrity check must compare the
    // assembled bytes against the ACCEPTED hash and reject on mismatch.
    const { manager, gmcpFileTransfer, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const capture = installDownloadCapture();
    try {
      const goodBytes = new TextEncoder().encode('the agreed-upon file');
      const acceptedHash = await sha256Hex(goodBytes);
      await acceptOffer(manager, gmcpFileTransfer, {
        sender: 'Bob',
        hash: acceptedHash,
        filename: 'report.pdf',
        filesize: goodBytes.byteLength,
      });

      const tamperedBytes = new TextEncoder().encode('tampered file body!!');
      expect(tamperedBytes.byteLength).toBe(goodBytes.byteLength); // pass the size cross-check
      const onComplete = vi.fn();
      const onError = vi.fn();
      manager.on('fileReceiveComplete', onComplete);
      manager.on('fileTransferError', onError);

      // header.hash = acceptedHash (passes the gate) but the bytes are different.
      webRTCService.emit(
        'dataChannelMessage',
        frameSingleChunk(acceptedHash, 'report.pdf', tamperedBytes),
      );
      await flush();

      expect(onComplete).not.toHaveBeenCalled();
      expect(capture.clickSpy).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      const integrityError = onError.mock.calls.find(([e]) => /integrity|hash/i.test(e.error));
      expect(integrityError).toBeDefined();
    } finally {
      capture.restore();
    }
  });

  it('H2: downloads with the accepted offer filename, ignoring a spoofed chunk header filename', async () => {
    const { manager, gmcpFileTransfer, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const capture = installDownloadCapture();
    try {
      const bytes = new TextEncoder().encode('legitimate content');
      const hash = await sha256Hex(bytes);
      await acceptOffer(manager, gmcpFileTransfer, {
        sender: 'Bob',
        hash,
        filename: 'photo.jpg',
        filesize: bytes.byteLength,
      });

      const onComplete = vi.fn();
      manager.on('fileReceiveComplete', onComplete);

      // Peer spoofs the header filename to something dangerous.
      webRTCService.emit('dataChannelMessage', frameSingleChunk(hash, 'invoice.exe', bytes));
      await flush();

      expect(capture.downloads).toEqual(['photo.jpg']);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete.mock.calls[0][0]).toMatchObject({ filename: 'photo.jpg' });
    } finally {
      capture.restore();
    }
  });

  it('H2: sanitizes a path-laden accepted filename to a bare basename', async () => {
    const { manager, gmcpFileTransfer, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const capture = installDownloadCapture();
    try {
      const bytes = new TextEncoder().encode('content here');
      const hash = await sha256Hex(bytes);
      await acceptOffer(manager, gmcpFileTransfer, {
        sender: 'Bob',
        hash,
        filename: '../../etc/passwd',
        filesize: bytes.byteLength,
      });

      const onComplete = vi.fn();
      manager.on('fileReceiveComplete', onComplete);

      webRTCService.emit('dataChannelMessage', frameSingleChunk(hash, '../../etc/passwd', bytes));
      await flush();

      expect(capture.downloads).toEqual(['passwd']);
      expect(onComplete.mock.calls[0][0]).toMatchObject({ filename: 'passwd' });
    } finally {
      capture.restore();
    }
  });

  it('rejects an accepted transfer whose declared size does not match the offer', async () => {
    const { manager, gmcpFileTransfer, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const capture = installDownloadCapture();
    try {
      const bytes = new TextEncoder().encode('sized content');
      const hash = await sha256Hex(bytes);
      await acceptOffer(manager, gmcpFileTransfer, {
        sender: 'Bob',
        hash,
        filename: 'doc.txt',
        filesize: bytes.byteLength + 999, // offer promised a different size
      });

      const onComplete = vi.fn();
      const onError = vi.fn();
      manager.on('fileReceiveComplete', onComplete);
      manager.on('fileTransferError', onError);

      webRTCService.emit('dataChannelMessage', frameSingleChunk(hash, 'doc.txt', bytes));
      await flush();

      expect(onComplete).not.toHaveBeenCalled();
      expect(capture.clickSpy).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    } finally {
      capture.restore();
    }
  });

  it('happy path: an accepted offer with matching bytes completes and downloads', async () => {
    const { manager, gmcpFileTransfer, webRTCService } = createManager();
    webRTCService.isDataChannelOpen.mockReturnValue(true);
    const capture = installDownloadCapture();
    try {
      const bytes = new TextEncoder().encode('a perfectly ordinary file');
      const hash = await sha256Hex(bytes);
      await acceptOffer(manager, gmcpFileTransfer, {
        sender: 'Bob',
        hash,
        filename: 'notes.txt',
        filesize: bytes.byteLength,
      });

      const onComplete = vi.fn();
      const onError = vi.fn();
      manager.on('fileReceiveComplete', onComplete);
      manager.on('fileTransferError', onError);

      webRTCService.emit('dataChannelMessage', frameSingleChunk(hash, 'notes.txt', bytes));
      await flush();

      expect(onError).not.toHaveBeenCalled();
      expect(capture.downloads).toEqual(['notes.txt']);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete.mock.calls[0][0]).toMatchObject({ hash, filename: 'notes.txt' });
      expect(readIncomingTransfers(manager).size).toBe(0);
    } finally {
      capture.restore();
    }
  });
});
