import EventEmitter from "eventemitter3";
import { describe, expect, it, vi } from "vitest";

import FileTransferManager from "./FileTransferManager";
import { useSessionStore } from "./stores/sessionStore";

vi.mock("./FileTransferStore", () => ({
  FileTransferStore: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  })),
}));

function createManager() {
  useSessionStore.setState({ playerId: "player" });
  const webRTCService = Object.assign(new EventEmitter(), {
    cleanup: vi.fn(),
    isDataChannelOpen: vi.fn().mockReturnValue(false),
  });
  const client = Object.assign(new EventEmitter(), {
    webRTCService,
    onFileTransferCancel: vi.fn(),
    onFileTransferError: vi.fn(),
    onRecoveryFailed: vi.fn(),
    onConnectionRecovered: vi.fn(),
  });
  const gmcpFileTransfer = {
    sendCancel: vi.fn(),
    sendRequestResend: vi.fn(),
  };
  const webRTCOn = vi.spyOn(webRTCService, "on");
  const webRTCOff = vi.spyOn(webRTCService, "off");
  const clientOn = vi.spyOn(client, "on");
  const clientOff = vi.spyOn(client, "off");

  const manager = new FileTransferManager(client as any, gmcpFileTransfer as any);

  return {
    client,
    clientOff,
    clientOn,
    manager,
    webRTCOff,
    webRTCOn,
    webRTCService,
  };
}

describe("FileTransferManager lifecycle", () => {
  it("unsubscribes the listeners it registered during cleanup", () => {
    const {
      clientOff,
      clientOn,
      manager,
      webRTCOff,
      webRTCOn,
      webRTCService,
    } = createManager();

    manager.cleanup();

    expect(webRTCOff).toHaveBeenCalledWith(
      "dataChannelMessage",
      webRTCOn.mock.calls[0][1]
    );
    expect(clientOff).toHaveBeenCalledWith(
      "fileTransferAccepted",
      clientOn.mock.calls[0][1]
    );
    expect(webRTCService.cleanup).toHaveBeenCalledTimes(1);
  });
});
