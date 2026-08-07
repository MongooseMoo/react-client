import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCacophonyInstances,
  mockFileTransferManagerInstances,
  mockPreferenceListeners,
  mockPreferenceSubscribe,
  mockPreferencesState,
  mockWebSocketInstances,
} = vi.hoisted(() => {
  return {
    mockCacophonyInstances: [] as Array<{
      muted: boolean;
      setGlobalVolume: ReturnType<typeof vi.fn>;
    }>,
    mockFileTransferManagerInstances: [] as Array<{
      acceptTransfer: ReturnType<typeof vi.fn>;
      cancelTransfer: ReturnType<typeof vi.fn>;
      cleanup: ReturnType<typeof vi.fn>;
      sendFile: ReturnType<typeof vi.fn>;
    }>,
    mockPreferenceListeners: new Set<() => void>(),
    mockPreferenceSubscribe: vi.fn((listener: () => void) => {
      mockPreferenceListeners.add(listener);
      return () => {
        mockPreferenceListeners.delete(listener);
      };
    }),
    mockPreferencesState: {
      general: {
        localEcho: false,
        syncTimezoneToServer: true,
        syncLocationToServer: false,
      },
      midi: { enabled: false },
      sound: { muteInBackground: false, volume: 1 },
      speech: {
        autoreadMode: 'off',
        voice: '',
        rate: 1,
        pitch: 1,
        volume: 1,
      },
    },
    mockWebSocketInstances: [] as Array<{
      binaryType: BinaryType;
      close: ReturnType<typeof vi.fn>;
      onclose: ((event: Event) => void) | null;
      onerror: ((event: Event) => void) | null;
      onmessage: ((event: MessageEvent) => void) | null;
      onopen: ((event: Event) => void) | null;
      readyState: number;
      send: ReturnType<typeof vi.fn>;
      url: string;
    }>,
  };
});

vi.mock('cacophony', () => ({
  Cacophony: class {
    muted = false;
    setGlobalVolume = vi.fn();

    constructor() {
      mockCacophonyInstances.push(this);
    }
  },
}));

vi.mock('./stores/preferencesStore', () => ({
  AutoreadMode: {
    All: 'all',
    Off: 'off',
    Unfocused: 'unfocused',
  },
  usePreferences: {
    getState: () => mockPreferencesState,
    subscribe: mockPreferenceSubscribe,
  },
}));

vi.mock('./EditorManager', () => ({
  EditorManager: class {
    shutdown = vi.fn();
  },
}));

vi.mock('./FileTransferManager.js', () => ({
  default: class {
    acceptTransfer = vi.fn(async () => {});
    cancelTransfer = vi.fn();
    cleanup = vi.fn();
    sendFile = vi.fn(async () => {});

    constructor() {
      mockFileTransferManagerInstances.push(this);
    }
  },
}));

vi.mock('./WebRTCService', () => ({
  WebRTCService: class {
    cleanup = vi.fn();
  },
}));

vi.mock('./gmcp', async () => {
  const actual = await vi.importActual<typeof import('./gmcp')>('./gmcp');
  return {
    ...actual,
    GMCPClientFileTransfer: class {
      packageName = 'Client.FileTransfer';
      reset = vi.fn();
      sendReject = vi.fn();
      shutdown = vi.fn();
    },
  };
});

vi.mock('./mcp', () => ({
  McpAwnsGetSet: class {
    packageName = 'mcp-awns-getset';
    shutdown = vi.fn();
  },
  McpNegotiate: class {
    packageName = 'mcp-negotiate';
    shutdown = vi.fn();
    sendNegotiate = vi.fn();
  },
  McpSession: class {
    packageHandlers: Record<string, { packageName: string; shutdown: ReturnType<typeof vi.fn> }> =
      {};
    multilineHandlers = {};
    receiveLine = vi.fn();
    reset = vi.fn();
    shutdown = vi.fn();

    registerPackage = vi.fn((PackageConstructor) => {
      const mcpPackage = new PackageConstructor();
      this.packageHandlers[mcpPackage.packageName] = mcpPackage;
      return mcpPackage;
    });
  },
}));

import MudClient from './client';
import { GMCPClientFileTransfer } from './gmcp';
import { useOutputStore } from './stores/outputStore';
import type { Stream } from './telnet';

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  binaryType: BinaryType = 'blob';
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });
  onclose: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;
  readyState = MockWebSocket.OPEN;
  send = vi.fn();

  constructor(public url: string) {
    mockWebSocketInstances.push(this);
  }
}

class MockCorePackage {
  packageName = 'Core';
  packageVersion = 1;
  sendHello = vi.fn();
}

class MockCoreSupportsPackage {
  packageName = 'Core.Supports';
  packageVersion = 1;
  advertisedModules = vi.fn(() => ['Core 1', 'Core.Supports 1']);
  sendSet = vi.fn();
}

class MockAutoLoginPackage {
  packageName = 'Auth.Autologin';
  packageVersion = 1;
  sendStoredLogin = vi.fn();
}

class MockClientMediaPackage {
  packageName = 'Client.Media';
  packageVersion = 1;
  publishEffectsSupport = vi.fn();
}

function sendSocketText(socket: MockWebSocket, text: string): void {
  socket.onmessage?.({
    data: new TextEncoder().encode(text).buffer,
  } as MessageEvent);
}

function sendSocketBytes(socket: MockWebSocket, bytes: number[]): void {
  socket.onmessage?.({
    data: new Uint8Array(bytes).buffer,
  } as MessageEvent);
}

describe('MudClient lifecycle cleanup', () => {
  beforeEach(() => {
    mockCacophonyInstances.length = 0;
    mockFileTransferManagerInstances.length = 0;
    mockPreferenceListeners.clear();
    mockPreferenceSubscribe.mockClear();
    mockPreferencesState.general.localEcho = false;
    mockPreferencesState.sound.muteInBackground = false;
    mockWebSocketInstances.length = 0;
    useOutputStore.getState().reset();
    vi.stubGlobal('WebSocket', MockWebSocket);
    Object.defineProperty(window, 'WebSocket', {
      configurable: true,
      value: MockWebSocket,
    });
  });

  it('shutdown removes window focus listeners and preferences subscription', () => {
    const addListener = vi.spyOn(window, 'addEventListener');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const client = new MudClient('example.test', 443);

    expect(mockPreferenceListeners.size).toBe(1);

    client.shutdown();

    expect(mockPreferenceListeners.size).toBe(0);
    expect(removeListener).toHaveBeenCalledWith('focus', addListener.mock.calls[0][1]);
    expect(removeListener).toHaveBeenCalledWith('blur', addListener.mock.calls[1][1]);
  });

  it('shutdown closes an open websocket and suppresses reconnect on close', () => {
    const client = new MudClient('example.test', 443);
    client.connect();

    expect(mockWebSocketInstances).toHaveLength(1);
    const socket = mockWebSocketInstances[0];

    client.shutdown();
    socket.onclose?.(new Event('close'));

    expect(socket.close).toHaveBeenCalledOnce();
    expect(mockWebSocketInstances).toHaveLength(1);
  });

  it('marks GMCP ready after GMCP negotiation startup messages are sent', () => {
    const client = new MudClient('example.test', 443);
    client.gmcp.register(MockCorePackage as never);
    client.gmcp.register(MockCoreSupportsPackage as never);
    client.gmcp.register(MockAutoLoginPackage as never);
    client.gmcp.register(MockClientMediaPackage as never);

    client.connect();
    mockWebSocketInstances[0].onmessage?.({
      data: new Uint8Array([255, 251, 201]).buffer,
    } as MessageEvent);

    expect(client.gmcp.ready).toBe(true);
  });

  it('preserves GMCP transport until file transfer cleanup completes', () => {
    const client = new MudClient('example.test', 443);
    client.configureFileTransfer(
      client.gmcp.register(GMCPClientFileTransfer as never),
    );
    client.connect();
    const cleanupOrder: string[] = [];
    const fileTransferManager = mockFileTransferManagerInstances[0];
    fileTransferManager.cleanup.mockImplementation(() => {
      cleanupOrder.push('fileTransferManager.cleanup');
    });
    vi.spyOn(client.gmcp, 'reset').mockImplementation(() => {
      cleanupOrder.push('gmcp.reset');
    });

    client.close();

    expect(cleanupOrder).toEqual(['fileTransferManager.cleanup', 'gmcp.reset']);
  });

  it('runs disconnect resets in registration order and isolates failures', () => {
    const client = new MudClient('example.test', 443);
    const resetOrder: string[] = [];
    const resetError = new Error('reset failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    client.registerDisconnectReset(() => resetOrder.push('first'));
    client.registerDisconnectReset(() => {
      resetOrder.push('second');
      throw resetError;
    });
    client.registerDisconnectReset(() => resetOrder.push('third'));
    client.connect();

    client.close();

    expect(resetOrder).toEqual(['first', 'second', 'third']);
    expect(consoleError).toHaveBeenCalledWith('Disconnect reset failed:', resetError);
  });

  it('runs disconnect resets once per disconnect and again after reconnect', () => {
    const client = new MudClient('example.test', 443);
    const reset = vi.fn();
    client.registerDisconnectReset(reset);
    client.connect();
    const firstSocket = mockWebSocketInstances[0];

    client.close();
    firstSocket.onclose?.(new Event('close'));

    expect(reset).toHaveBeenCalledTimes(1);

    client.connect();
    client.close();

    expect(reset).toHaveBeenCalledTimes(2);
  });

  it('automatically registers MCP package disconnect resets', () => {
    const client = new MudClient('example.test', 443);
    const mcpPackage = client.registerMcpPackage(
      class {
        packageName = 'test-package';
        reset = vi.fn();
      } as never,
    ) as unknown as { reset: ReturnType<typeof vi.fn> };
    client.connect();

    client.close();

    expect(mcpPackage.reset).toHaveBeenCalledOnce();
  });

  it('clears a closed local transport and rejects later sends', () => {
    const client = new MudClient('example.test', 443);
    const closeListeners: Array<() => void> = [];
    const stream = {
      close: vi.fn(() => {
        closeListeners.forEach((listener) => {
          listener();
        });
      }),
      on: vi.fn((event: string, callback: () => void) => {
        if (event === 'close') closeListeners.push(callback);
      }),
      write: vi.fn(),
    } as unknown as Stream & { close(): void };
    client.connectLocal(stream);

    client.send('look\r\n');
    expect(stream.write).toHaveBeenCalledOnce();

    client.close();

    expect(stream.close).toHaveBeenCalledOnce();
    expect(client.connected).toBe(false);
    expect(
      client as unknown as { localMode: boolean; localStream?: Stream },
    ).toMatchObject({
      localMode: false,
      localStream: undefined,
    });
    expect(() => client.send('look\r\n')).toThrow(
      new Error('Cannot send while disconnected'),
    );
    expect(stream.write).toHaveBeenCalledOnce();
  });

  it.each([
    ['CONNECTING', MockWebSocket.CONNECTING],
    ['CLOSING', MockWebSocket.CLOSING],
    ['CLOSED', MockWebSocket.CLOSED],
  ])('rejects sends while the WebSocket is %s', (_label, readyState) => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];
    socket.onopen?.(new Event('open'));
    socket.readyState = readyState;

    expect(() => client.send('look\r\n')).toThrow(
      new Error('Cannot send while disconnected'),
    );
    expect(socket.send).not.toHaveBeenCalled();
    client.close();
  });

  it('sends through a connected open WebSocket', () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];
    socket.onopen?.(new Event('open'));

    client.send('look\r\n');

    expect(socket.send).toHaveBeenCalledWith('look\r\n');
  });

  it('reports a disconnected command without adding local echo', () => {
    mockPreferencesState.general.localEcho = true;
    const client = new MudClient('example.test', 443);

    expect(() => client.sendCommand('look')).not.toThrow();

    expect(useOutputStore.getState().entries).toEqual([
      {
        id: 1,
        type: 'error',
        error: new Error('Cannot send while disconnected'),
      },
    ]);
    expect(mockWebSocketInstances).toEqual([]);
  });

  it('buffers text split across frames until the line is complete', () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];

    sendSocketText(socket, 'Hello ');
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketText(socket, 'world\r\n');
    expect(useOutputStore.getState().entries).toEqual([
      {
        id: 1,
        type: 'message',
        message: 'Hello world',
      },
    ]);
  });

  it('buffers partial MCP frames until the line is complete', () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];
    const receiveLine = vi.mocked(client.mcpSession.receiveLine);

    sendSocketText(socket, '#');
    expect(receiveLine).not.toHaveBeenCalled();
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketText(socket, '$#MCP version: 2.1 to: 2.1\r\n');
    expect(receiveLine).toHaveBeenCalledWith('#$#MCP version: 2.1 to: 2.1');
    expect(useOutputStore.getState().entries).toEqual([]);
  });

  it('records non-MCP prompt text at a Telnet GA boundary', () => {
    const client = new MudClient('example.test', 443);

    client.connect();
    const socket = mockWebSocketInstances[0];
    sendSocketText(socket, 'look');
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketBytes(socket, [255, 249]);

    expect(useOutputStore.getState().entries).toContainEqual({
      id: 1,
      type: 'message',
      message: 'look',
    });
  });

  it('cancels a pending auto-reconnect when the user disconnects within the window', () => {
    vi.useFakeTimers();
    try {
      const client = new MudClient('example.test', 443);
      client.connect();
      expect(mockWebSocketInstances).toHaveLength(1);

      // Unexpected drop: onclose fires while intentionalDisconnect is still false,
      // scheduling a reconnect 10s out.
      mockWebSocketInstances[0].onclose?.(new Event('close'));

      // The user then intentionally disconnects inside that 10s window.
      client.close();
      vi.advanceTimersByTime(10000);

      // No reconnect: connect() never ran again, so no second socket was created.
      expect(mockWebSocketInstances).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('auto-reconnects after an unexpected drop when no disconnect intervenes', () => {
    vi.useFakeTimers();
    try {
      const client = new MudClient('example.test', 443);
      client.connect();
      expect(mockWebSocketInstances).toHaveLength(1);

      mockWebSocketInstances[0].onclose?.(new Event('close'));
      vi.advanceTimersByTime(10000);

      // Reconnect fired: connect() created a second socket.
      expect(mockWebSocketInstances).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reassembles a multibyte character split across two frames', () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];

    // "é" (U+00E9) is 0xC3 0xA9 in UTF-8; deliver each byte in its own frame.
    sendSocketBytes(socket, [0xc3]);
    sendSocketBytes(socket, [0xa9]);
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketText(socket, '\n');

    expect(useOutputStore.getState().entries).toContainEqual(
      expect.objectContaining({ type: 'message', message: 'é' }),
    );
    expect(useOutputStore.getState().entries).not.toContainEqual(
      expect.objectContaining({ type: 'message', message: '�' }),
    );
  });

  it('resets the streaming decoder on cleanup so a partial does not bleed into the next connection', () => {
    const client = new MudClient('example.test', 443);
    client.connect();

    // First connection receives only the lead byte of "é", held by the streaming decoder.
    sendSocketBytes(mockWebSocketInstances[0], [0xc3]);

    // Intentional disconnect tears the connection down (and must reset the decoder).
    client.close();
    useOutputStore.getState().reset();

    // A fresh connection delivers the orphaned continuation byte alone.
    client.connect();
    sendSocketBytes(mockWebSocketInstances[1], [0xa9]);
    sendSocketText(mockWebSocketInstances[1], '\n');

    // Without a reset the retained 0xC3 + 0xA9 would decode to "é"; after reset the
    // orphan continuation byte is an invalid sequence -> U+FFFD, never "é".
    expect(useOutputStore.getState().entries).not.toContainEqual(
      expect.objectContaining({ type: 'message', message: 'é' }),
    );
    expect(useOutputStore.getState().entries).toContainEqual(
      expect.objectContaining({ type: 'message', message: '�' }),
    );
  });
});
