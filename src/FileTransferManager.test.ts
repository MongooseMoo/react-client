import EventEmitter from 'eventemitter3';
import { describe, expect, it, vi } from 'vitest';

import FileTransferManager from './FileTransferManager';
import type { GMCPClientFileTransfer } from './gmcp/Client/FileTransfer';
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
    isDataChannelOpen: vi.fn().mockReturnValue(false),
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
});
