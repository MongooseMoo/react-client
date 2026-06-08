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
  })),
}));

function createManager() {
  useSessionStore.setState({ playerId: 'player' });
  const webRTCService = Object.assign(new EventEmitter(), {
    cleanup: vi.fn(),
    handleAnswer: vi.fn(async () => {}),
    isDataChannelOpen: vi.fn().mockReturnValue(false),
    sendData: vi.fn(async () => {}),
  });
  const gmcpFileTransfer = Object.assign(new EventEmitter(), {
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
