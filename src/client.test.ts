import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCacophonyInstances,
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
    mockPreferenceListeners: new Set<() => void>(),
    mockPreferenceSubscribe: vi.fn((listener: () => void) => {
      mockPreferenceListeners.add(listener);
      return () => {
        mockPreferenceListeners.delete(listener);
      };
    }),
    mockPreferencesState: {
      general: { localEcho: false },
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
  },
}));

vi.mock('./WebRTCService', () => ({
  WebRTCService: class {
    cleanup = vi.fn();
  },
}));

vi.mock('./gmcp', () => ({
  GMCPChar: class {
    packageName = 'Char';
    shutdown = vi.fn();
  },
  GMCPClientFileTransfer: class {
    packageName = 'Client.FileTransfer';
    sendReject = vi.fn();
    shutdown = vi.fn();
  },
}));

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
      const mcpPackage = new PackageConstructor({
        emit: vi.fn(),
        openEditorSession: vi.fn(),
        sendMcp: vi.fn(),
      });
      this.packageHandlers[mcpPackage.packageName] = mcpPackage;
      return mcpPackage;
    });
  },
}));

import MudClient from './client';

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
  sendSet = vi.fn();
}

class MockAutoLoginPackage {
  packageName = 'Auth.Autologin';
  packageVersion = 1;
  sendLogin = vi.fn();
}

class MockClientMediaPackage {
  packageName = 'Client.Media';
  packageVersion = 1;
  sendEffectsSupport = vi.fn();
}

function sendSocketText(socket: MockWebSocket, text: string): void {
  socket.onmessage?.({
    data: new TextEncoder().encode(text).buffer,
  } as MessageEvent);
}

describe('MudClient lifecycle cleanup', () => {
  beforeEach(() => {
    mockCacophonyInstances.length = 0;
    mockPreferenceListeners.clear();
    mockPreferenceSubscribe.mockClear();
    mockPreferencesState.sound.muteInBackground = false;
    mockWebSocketInstances.length = 0;
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

  it('emits gmcpReady after GMCP negotiation startup messages are sent', () => {
    const client = new MudClient('example.test', 443);
    client.registerGMCPPackage(MockCorePackage);
    client.registerGMCPPackage(MockCoreSupportsPackage);
    client.registerGMCPPackage(MockAutoLoginPackage);
    client.registerGMCPPackage(MockClientMediaPackage);
    const handleGmcpReady = vi.fn();
    client.on('gmcpReady', handleGmcpReady);

    client.connect();
    mockWebSocketInstances[0].onmessage?.({
      data: new Uint8Array([255, 251, 201]).buffer,
    } as MessageEvent);

    expect(client.gmcpReady).toBe(true);
    expect(handleGmcpReady).toHaveBeenCalledOnce();
  });

  it('emits sessionReady only once', () => {
    const client = new MudClient('example.test', 443);
    const handleSessionReady = vi.fn();
    client.on('sessionReady', handleSessionReady);

    client.markSessionReady();
    client.markSessionReady();

    expect(client.sessionReady).toBe(true);
    expect(handleSessionReady).toHaveBeenCalledOnce();
  });

  it('buffers partial MCP frames until the line is complete', () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];
    const receiveLine = vi.mocked(client.mcpSession.receiveLine);

    sendSocketText(socket, '#$#MCP version: 2.1');
    expect(receiveLine).not.toHaveBeenCalled();

    sendSocketText(socket, ' to: 2.1\r\n');
    expect(receiveLine).toHaveBeenCalledWith('#$#MCP version: 2.1 to: 2.1');
  });

  it('emits non-MCP prompt text without waiting for a newline', () => {
    const client = new MudClient('example.test', 443);
    const handleMessage = vi.fn();
    client.on('message', handleMessage);

    client.connect();
    sendSocketText(mockWebSocketInstances[0], 'look');

    expect(handleMessage).toHaveBeenCalledWith('look');
  });
});
