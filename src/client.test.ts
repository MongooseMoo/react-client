import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockAwayStore,
  mockCacophonyInstances,
  mockFileTransferManagerInstances,
  mockPreferenceListeners,
  mockPreferenceSubscribe,
  mockPreferencesState,
  mockWebSocketInstances,
} = vi.hoisted(() => {
  return {
    mockAwayStore: { enabled: false },
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

vi.mock('./FileTransferManager', () => ({
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

// A client reads the away store (IndexedDB) as soon as it connects. Only the
// 'away channel' tests switch the store on; everywhere else it is inert, so no
// database work outlives a test or stalls under fake timers.
vi.mock('./away', async () => {
  const actual = await vi.importActual<typeof import('./away')>('./away');
  return {
    ...actual,
    clearAwayLines: () => (mockAwayStore.enabled ? actual.clearAwayLines() : Promise.resolve()),
    sendAwayCommand: (line: string) =>
      mockAwayStore.enabled
        ? actual.sendAwayCommand(line)
        : Promise.resolve({ status: 'no-token' }),
    takeUnshownAwayLines: (extra?: Array<{ seq: number; text: string }>, period?: unknown) =>
      mockAwayStore.enabled ? actual.takeUnshownAwayLines(extra, period) : Promise.resolve([]),
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

import { readAwayToken, recordAwayPush, storeAwayToken, takeUnshownAwayLines } from './away';
import { deleteAwayDatabase } from './awayTestHelpers';
import MudClient from './client';
import { GMCPClientFileTransfer, GMCPCore } from './gmcp';
import { useConnectionStore } from './stores/connectionStore';
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
  reset = vi.fn();
  sendHello = vi.fn();
  shutdown = vi.fn();
}

class MockCoreSupportsPackage {
  packageName = 'Core.Supports';
  packageVersion = 1;
  advertisedModules = vi.fn(() => ['Core 1', 'Core.Supports 1']);
  reset = vi.fn();
  sendSet = vi.fn();
  shutdown = vi.fn();
}

class MockAutoLoginPackage {
  packageName = 'Auth.Autologin';
  packageVersion = 1;
  reset = vi.fn();
  sendStoredLogin = vi.fn();
  shutdown = vi.fn();
}

class MockClientMediaPackage {
  packageName = 'Client.Media';
  packageVersion = 1;
  publishEffectsSupport = vi.fn();
  reset = vi.fn();
  shutdown = vi.fn();
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
  const connectedClients = new Set<MudClient>();

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
    const connect = MudClient.prototype.connect;
    vi.spyOn(MudClient.prototype, 'connect').mockImplementation(function (this: MudClient) {
      connectedClients.add(this);
      connect.call(this);
    });
  });

  // A connected client listens for page events until it is shut down; none
  // may outlive its test and react to events a later test dispatches.
  afterEach(() => {
    for (const client of connectedClients) client.shutdown();
    connectedClients.clear();
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
    // Stop this client answering resume events fired by later tests.
    client.shutdown();
  });

  it('constructs one file transfer owner on demand and cleans it up without connecting', async () => {
    const client = new MudClient('example.test', 443);
    client.configureFileTransfer(client.gmcp.register(GMCPClientFileTransfer as never));
    expect(mockFileTransferManagerInstances).toHaveLength(0);
    const first = client.getFileTransferManager();
    const second = client.getFileTransferManager();
    expect(first).toBe(second);
    const manager = await first;
    expect(mockFileTransferManagerInstances).toHaveLength(1);
    client.shutdown();
    expect(manager.cleanup).toHaveBeenCalledOnce();
  });

  it('does not construct file transfer resources after shutdown during import', async () => {
    const client = new MudClient('example.test', 443);
    client.configureFileTransfer(client.gmcp.register(GMCPClientFileTransfer as never));
    const loading = client.getFileTransferManager();
    client.shutdown();
    await expect(loading).rejects.toThrow('cancelled');
    expect(mockFileTransferManagerInstances).toHaveLength(0);
  });

  it('preserves GMCP transport until file transfer cleanup completes', async () => {
    const client = new MudClient('example.test', 443);
    client.configureFileTransfer(
      client.gmcp.register(GMCPClientFileTransfer as never),
    );
    client.connect();
    const cleanupOrder: string[] = [];
    await client.getFileTransferManager();
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

  it('reports a disconnected command without adding local echo', async () => {
    mockPreferencesState.general.localEcho = true;
    const client = new MudClient('example.test', 443);

    expect(() => client.sendCommand('look')).not.toThrow();

    // outputStore batches appends into a microtask flush; let it run.
    await Promise.resolve();
    expect(useOutputStore.getState().entries).toEqual([
      {
        id: 1,
        type: 'error',
        error: new Error('Cannot send while disconnected'),
      },
    ]);
    expect(mockWebSocketInstances).toEqual([]);
  });

  it('buffers text split across frames until the line is complete', async () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];

    sendSocketText(socket, 'Hello ');
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketText(socket, 'world\r\n');
    // outputStore batches appends into a microtask flush; let it run.
    await Promise.resolve();
    expect(useOutputStore.getState().entries).toEqual([
      {
        id: 1,
        type: 'message',
        message: 'Hello world',
      },
    ]);
  });

  it('buffers partial MCP frames until the line is complete', async () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];
    const receiveLine = vi.mocked(client.mcpSession.receiveLine);

    sendSocketText(socket, '#');
    expect(receiveLine).not.toHaveBeenCalled();
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketText(socket, '$#MCP version: 2.1 to: 2.1\r\n');
    expect(receiveLine).toHaveBeenCalledWith('#$#MCP version: 2.1 to: 2.1');
    await Promise.resolve();
    expect(useOutputStore.getState().entries).toEqual([]);
  });

  it('records non-MCP prompt text at a Telnet GA boundary', async () => {
    const client = new MudClient('example.test', 443);

    client.connect();
    const socket = mockWebSocketInstances[0];
    sendSocketText(socket, 'look');
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketBytes(socket, [255, 249]);

    // outputStore batches appends into a microtask flush; let it run.
    await Promise.resolve();
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
      // scheduling a reconnect.
      mockWebSocketInstances[0].onclose?.(new Event('close'));

      // The user then intentionally disconnects before that reconnect fires.
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

  it('reassembles a multibyte character split across two frames', async () => {
    const client = new MudClient('example.test', 443);
    client.connect();
    const socket = mockWebSocketInstances[0];

    // "é" (U+00E9) is 0xC3 0xA9 in UTF-8; deliver each byte in its own frame.
    sendSocketBytes(socket, [0xc3]);
    sendSocketBytes(socket, [0xa9]);
    expect(useOutputStore.getState().entries).toEqual([]);

    sendSocketText(socket, '\n');

    // outputStore batches appends into a microtask flush; let it run.
    await Promise.resolve();
    expect(useOutputStore.getState().entries).toContainEqual(
      expect.objectContaining({ type: 'message', message: 'é' }),
    );
    expect(useOutputStore.getState().entries).not.toContainEqual(
      expect.objectContaining({ type: 'message', message: '�' }),
    );
  });

  it('resets the streaming decoder on cleanup so a partial does not bleed into the next connection', async () => {
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

    // outputStore batches appends into a microtask flush; let it run.
    await Promise.resolve();
    // Without a reset the retained 0xC3 + 0xA9 would decode to "é"; after reset the
    // orphan continuation byte is an invalid sequence -> U+FFFD, never "é".
    expect(useOutputStore.getState().entries).not.toContainEqual(
      expect.objectContaining({ type: 'message', message: 'é' }),
    );
    expect(useOutputStore.getState().entries).toContainEqual(
      expect.objectContaining({ type: 'message', message: '�' }),
    );
  });

  describe('reconnect on resume', () => {
    const clients: MudClient[] = [];

    function createClient(): MudClient {
      const client = new MudClient('example.test', 443);
      clients.push(client);
      return client;
    }

    // Connects and completes GMCP negotiation with the real Core package, so
    // Core.Ping can be sent on this connection.
    function connectWithGmcp(client: MudClient): MockWebSocket {
      client.gmcp.register(GMCPCore);
      client.gmcp.register(MockCoreSupportsPackage as never);
      client.gmcp.register(MockAutoLoginPackage as never);
      client.gmcp.register(MockClientMediaPackage as never);
      client.connect();
      const socket = latestSocket();
      socket.onopen?.(new Event('open'));
      sendSocketBytes(socket, [255, 251, 201]);
      socket.send.mockClear();
      return socket;
    }

    function latestSocket(): MockWebSocket {
      return mockWebSocketInstances[mockWebSocketInstances.length - 1] as MockWebSocket;
    }

    function dropSocket(socket: MockWebSocket): void {
      socket.readyState = MockWebSocket.CLOSED;
      socket.onclose?.(new Event('close'));
    }

    function setVisibility(state: DocumentVisibilityState): void {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: state,
      });
    }

    function becomeVisible(): void {
      setVisibility('visible');
      document.dispatchEvent(new Event('visibilitychange'));
    }

    function sentPings(socket: MockWebSocket): number {
      return socket.send.mock.calls.filter(([data]) =>
        new TextDecoder().decode(data as Uint8Array).includes('Core.Ping'),
      ).length;
    }

    const resumeTriggers: Array<[string, () => void]> = [
      ['visibilitychange to visible', becomeVisible],
      ['pageshow', () => window.dispatchEvent(new Event('pageshow'))],
      ['online', () => window.dispatchEvent(new Event('online'))],
    ];

    beforeEach(() => {
      vi.useFakeTimers();
      clients.length = 0;
    });

    afterEach(() => {
      for (const client of clients) client.shutdown();
      Reflect.deleteProperty(document, 'visibilityState');
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it.each(resumeTriggers)(
      'reconnects immediately on %s when the socket has closed',
      (_label, trigger) => {
        const client = createClient();
        client.connect();
        dropSocket(mockWebSocketInstances[0]);

        trigger();

        expect(mockWebSocketInstances).toHaveLength(2);
      },
    );

    it('cancels the pending reconnect timer when resuming, so it connects only once', () => {
      const client = createClient();
      client.connect();
      dropSocket(mockWebSocketInstances[0]);

      becomeVisible();
      vi.advanceTimersByTime(60000);

      expect(mockWebSocketInstances).toHaveLength(2);
    });

    it('does not reconnect when the page becomes hidden', () => {
      const client = createClient();
      client.connect();
      dropSocket(mockWebSocketInstances[0]);

      setVisibility('hidden');
      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('does not open a second socket while one is still connecting', () => {
      const client = createClient();
      client.connect();
      mockWebSocketInstances[0].readyState = MockWebSocket.CONNECTING;

      becomeVisible();

      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('ignores a late close event from a socket it already replaced', () => {
      const client = createClient();
      const reset = vi.fn();
      client.registerDisconnectReset(reset);
      client.connect();
      const firstSocket = mockWebSocketInstances[0];
      // Closed while hidden, with the close event not delivered yet.
      firstSocket.readyState = MockWebSocket.CLOSED;

      becomeVisible();
      expect(mockWebSocketInstances).toHaveLength(2);
      expect(reset).toHaveBeenCalledTimes(1);
      mockWebSocketInstances[1].onopen?.(new Event('open'));

      firstSocket.onclose?.(new Event('close'));
      vi.advanceTimersByTime(60000);

      expect(reset).toHaveBeenCalledTimes(1);
      expect(client.connected).toBe(true);
      expect(mockWebSocketInstances).toHaveLength(2);
    });

    it('backs off 1s, 2s, 5s, then 10s for every later attempt, and resets when a socket opens', () => {
      const client = createClient();
      client.connect();

      for (const delay of [1000, 2000, 5000, 10000, 10000]) {
        const count = mockWebSocketInstances.length;
        dropSocket(latestSocket());

        vi.advanceTimersByTime(delay - 1);
        expect(mockWebSocketInstances).toHaveLength(count);
        vi.advanceTimersByTime(1);
        expect(mockWebSocketInstances).toHaveLength(count + 1);
      }

      const count = mockWebSocketInstances.length;
      latestSocket().onopen?.(new Event('open'));
      dropSocket(latestSocket());
      vi.advanceTimersByTime(1000);

      expect(mockWebSocketInstances).toHaveLength(count + 1);
    });

    it('keeps retrying on schedule while the browser reports being offline', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      const client = createClient();
      client.connect();
      dropSocket(mockWebSocketInstances[0]);

      vi.advanceTimersByTime(1000);
      expect(mockWebSocketInstances).toHaveLength(2);

      dropSocket(mockWebSocketInstances[1]);
      vi.advanceTimersByTime(2000);
      expect(mockWebSocketInstances).toHaveLength(3);
    });

    it.each(resumeTriggers)('probes an open socket with Core.Ping on %s', (_label, trigger) => {
      const socket = connectWithGmcp(createClient());

      trigger();

      expect(sentPings(socket)).toBe(1);
      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('keeps the socket when the server answers the ping', () => {
      const socket = connectWithGmcp(createClient());

      becomeVisible();
      vi.advanceTimersByTime(3999);
      sendSocketBytes(socket, [
        255,
        250,
        201,
        ...new TextEncoder().encode('Core.Ping'),
        255,
        240,
      ]);
      vi.advanceTimersByTime(60000);

      expect(socket.close).not.toHaveBeenCalled();
      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('keeps the socket when any other inbound data arrives during the probe', () => {
      const socket = connectWithGmcp(createClient());

      becomeVisible();
      sendSocketText(socket, 'The wind howls.\r\n');
      vi.advanceTimersByTime(60000);

      expect(socket.close).not.toHaveBeenCalled();
      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('closes a silent socket after 4s and reconnects exactly once', () => {
      const client = createClient();
      const reset = vi.fn();
      const socket = connectWithGmcp(client);
      client.registerDisconnectReset(reset);

      becomeVisible();
      vi.advanceTimersByTime(3999);
      expect(socket.close).not.toHaveBeenCalled();
      expect(mockWebSocketInstances).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(socket.close).toHaveBeenCalledOnce();
      expect(reset).toHaveBeenCalledTimes(1);
      expect(mockWebSocketInstances).toHaveLength(2);

      // The dead socket's close event arrives late; it must not tear down or
      // re-dial the replacement.
      socket.onclose?.(new Event('close'));
      vi.advanceTimersByTime(60000);

      expect(reset).toHaveBeenCalledTimes(1);
      expect(mockWebSocketInstances).toHaveLength(2);
    });

    it('runs only one probe at a time', () => {
      const socket = connectWithGmcp(createClient());

      becomeVisible();
      window.dispatchEvent(new Event('pageshow'));
      window.dispatchEvent(new Event('online'));

      expect(sentPings(socket)).toBe(1);

      vi.advanceTimersByTime(60000);
      expect(socket.close).toHaveBeenCalledOnce();
      expect(mockWebSocketInstances).toHaveLength(2);
    });

    it('probes again on a later resume once the previous probe passed', () => {
      const socket = connectWithGmcp(createClient());

      becomeVisible();
      sendSocketText(socket, 'The wind howls.\r\n');
      becomeVisible();

      expect(sentPings(socket)).toBe(2);
    });

    it('skips the probe when GMCP has not been negotiated', () => {
      const client = createClient();
      client.gmcp.register(GMCPCore);
      client.connect();
      const socket = mockWebSocketInstances[0];
      socket.onopen?.(new Event('open'));

      becomeVisible();
      vi.advanceTimersByTime(60000);

      expect(socket.send).not.toHaveBeenCalled();
      expect(socket.close).not.toHaveBeenCalled();
      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('abandons the probe when the socket closes on its own', () => {
      const socket = connectWithGmcp(createClient());

      becomeVisible();
      dropSocket(socket);
      vi.advanceTimersByTime(1000);
      expect(mockWebSocketInstances).toHaveLength(2);

      vi.advanceTimersByTime(60000);

      expect(mockWebSocketInstances[1].close).not.toHaveBeenCalled();
      expect(mockWebSocketInstances).toHaveLength(2);
    });

    it.each(resumeTriggers)(
      'neither reconnects nor probes on %s after an intentional close',
      (_label, trigger) => {
        const client = createClient();
        const socket = connectWithGmcp(client);
        client.close();

        trigger();
        vi.advanceTimersByTime(60000);

        expect(sentPings(socket)).toBe(0);
        expect(mockWebSocketInstances).toHaveLength(1);
      },
    );

    it('does not let a running probe reconnect after an intentional close', () => {
      const client = createClient();
      const socket = connectWithGmcp(client);

      becomeVisible();
      client.close();
      vi.advanceTimersByTime(60000);

      expect(socket.close).toHaveBeenCalledOnce();
      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it.each(resumeTriggers)('does nothing on %s in local mode', (_label, trigger) => {
      const addWindowListener = vi.spyOn(window, 'addEventListener');
      const addDocumentListener = vi.spyOn(document, 'addEventListener');
      const client = createClient();
      addWindowListener.mockClear();
      const stream = { on: vi.fn(), write: vi.fn() } as unknown as Stream;
      client.connectLocal(stream);

      trigger();
      vi.advanceTimersByTime(60000);

      expect(addWindowListener).not.toHaveBeenCalled();
      expect(addDocumentListener).not.toHaveBeenCalled();
      expect(stream.write).not.toHaveBeenCalled();
      expect(mockWebSocketInstances).toHaveLength(0);
    });

    it('registers the resume listeners once and removes them on shutdown', () => {
      const addWindowListener = vi.spyOn(window, 'addEventListener');
      const removeWindowListener = vi.spyOn(window, 'removeEventListener');
      const addDocumentListener = vi.spyOn(document, 'addEventListener');
      const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
      const client = createClient();
      client.connect();
      dropSocket(mockWebSocketInstances[0]);
      client.connect();

      const listenersFor = (spy: typeof addWindowListener, type: string) =>
        spy.mock.calls.filter(([name]) => name === type).map(([, listener]) => listener);
      const pageshow = listenersFor(addWindowListener, 'pageshow');
      const online = listenersFor(addWindowListener, 'online');
      const visibilitychange = listenersFor(
        addDocumentListener as unknown as typeof addWindowListener,
        'visibilitychange',
      );
      expect(pageshow).toHaveLength(1);
      expect(online).toHaveLength(1);
      expect(visibilitychange).toHaveLength(1);

      client.shutdown();

      expect(removeWindowListener).toHaveBeenCalledWith('pageshow', pageshow[0]);
      expect(removeWindowListener).toHaveBeenCalledWith('online', online[0]);
      expect(removeDocumentListener).toHaveBeenCalledWith('visibilitychange', visibilitychange[0]);

      dropSocket(latestSocket());
      becomeVisible();
      window.dispatchEvent(new Event('pageshow'));
      window.dispatchEvent(new Event('online'));

      expect(mockWebSocketInstances).toHaveLength(2);
    });
  });

  describe('away channel', () => {
    const COMMAND_URL = 'https://mongoose.world/api/away/command';
    const clients: MudClient[] = [];
    let fetchMock: ReturnType<typeof vi.fn>;
    let serviceWorker: ReturnType<typeof stubServiceWorker>;

    type AwayClient = {
      awayWork: Promise<void>;
      sendCommandWhileAway: (command: string, disconnected: Error) => Promise<void>;
    };

    function createClient(): MudClient {
      const client = new MudClient('example.test', 443);
      clients.push(client);
      return client;
    }

    // The page side of a registered service worker: lets a test deliver a
    // worker message and observe the notifications being closed.
    function stubServiceWorker() {
      const listeners = new Set<(event: MessageEvent) => void>();
      const notification = { close: vi.fn() };
      const getNotifications = vi.fn(async (_filter?: { tag?: string }) => [notification]);
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: {
          addEventListener: (type: string, listener: (event: MessageEvent) => void) => {
            if (type === 'message') listeners.add(listener);
          },
          getRegistration: async () => ({ getNotifications }),
          removeEventListener: (_type: string, listener: (event: MessageEvent) => void) => {
            listeners.delete(listener);
          },
        },
      });
      return {
        deliver: (data: unknown) => {
          for (const listener of listeners) listener({ data } as MessageEvent);
        },
        getNotifications,
        notification,
      };
    }

    // Waits until the client's queued away work (IndexedDB, fetch) has run and
    // the output store has flushed.
    async function awaySettled(client: MudClient): Promise<void> {
      const away = client as unknown as AwayClient;
      let work: Promise<void>;
      do {
        work = away.awayWork;
        await work;
      } while (work !== away.awayWork);
      await Promise.resolve();
    }

    // Sends a command and waits for the HTTP fallback (if it was taken) and
    // everything it queued.
    async function sendCommandAndSettle(client: MudClient, command: string): Promise<void> {
      const fallback = vi.spyOn(client as unknown as AwayClient, 'sendCommandWhileAway');
      client.sendCommand(command);
      await Promise.all(fallback.mock.results.map((result) => result.value));
      await awaySettled(client);
    }

    function awayLines(...lines: Array<[number, string]>) {
      return { lines: lines.map(([seq, text]) => ({ seq, text })), type: 'away-lines' };
    }

    function shownMessages(): string[] {
      return useOutputStore
        .getState()
        .entries.flatMap((entry) => (entry.type === 'message' ? [entry.message] : []));
    }

    function shownErrors(): string[] {
      return useOutputStore
        .getState()
        .entries.flatMap((entry) => (entry.type === 'error' ? [entry.error.message] : []));
    }

    function storeToken(): Promise<void> {
      return storeAwayToken({
        expiresAt: Math.floor(Date.now() / 1000) + 30 * 86400,
        token: 'away-1',
      });
    }

    function commandResponse(...lines: Array<[number, string]>): Response {
      return commandResponseIn(1, ...lines);
    }

    function commandResponseIn(period: number, ...lines: Array<[number, string]>): Response {
      return Response.json({
        lines: lines.map(([seq, text]) => ({ seq, text })),
        ok: 1,
        period,
        seq: lines.length > 0 ? lines[lines.length - 1][0] : 0,
      });
    }

    // What the server's Char.Name does in the configured client: the player
    // is logged in.
    function logIn(): void {
      useConnectionStore.getState().setSessionReady(true);
    }

    beforeEach(() => {
      useConnectionStore.getState().reset();
      mockAwayStore.enabled = true;
      clients.length = 0;
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_API_ORIGIN', '');
      fetchMock = vi.fn(async () => commandResponse());
      vi.stubGlobal('fetch', fetchMock);
      serviceWorker = stubServiceWorker();
    });

    afterEach(async () => {
      for (const client of clients) {
        client.shutdown();
        await awaySettled(client);
      }
      Reflect.deleteProperty(navigator, 'serviceWorker');
      Reflect.deleteProperty(document, 'visibilityState');
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
      useConnectionStore.getState().reset();
      mockAwayStore.enabled = false;
      await deleteAwayDatabase();
    });

    describe('lines while disconnected', () => {
      it('shows lines from the service worker as provisional output, each seq once', async () => {
        const client = createClient();
        client.connect();

        serviceWorker.deliver(awayLines([1, 'Bob waves.'], [2, 'Bob says, "hi"']));
        serviceWorker.deliver(awayLines([2, 'Bob says, "hi"'], [3, 'Bob leaves.']));
        await awaySettled(client);

        expect(useOutputStore.getState().entries).toEqual([
          { id: 1, message: 'Bob waves.', provisional: true, type: 'message' },
          { id: 2, message: 'Bob says, "hi"', provisional: true, type: 'message' },
          { id: 3, message: 'Bob leaves.', provisional: true, type: 'message' },
        ]);
      });

      it('shows stored lines on load and the newer ones when the page becomes visible', async () => {
        await recordAwayPush({ from: 1, lines: [[1, 'one']], to: 1 });
        const client = createClient();
        client.connect();
        await awaySettled(client);
        expect(shownMessages()).toEqual(['one']);

        await recordAwayPush({ from: 2, lines: [[2, 'two']], to: 2 });
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          value: 'visible',
        });
        document.dispatchEvent(new Event('visibilitychange'));
        await awaySettled(client);

        expect(shownMessages()).toEqual(['one', 'two']);
      });

      it('does not show the same stored lines again after a reload', async () => {
        await recordAwayPush({ from: 1, lines: [[1, 'one']], to: 1 });
        const first = createClient();
        first.connect();
        await awaySettled(first);
        first.shutdown();
        await awaySettled(first);
        useOutputStore.getState().reset();

        const second = createClient();
        second.connect();
        await awaySettled(second);

        expect(shownMessages()).toEqual([]);
      });

      it('ignores other service worker messages', async () => {
        const client = createClient();
        client.connect();

        serviceWorker.deliver({ type: 'something-else' });
        serviceWorker.deliver(null);
        await awaySettled(client);

        expect(useOutputStore.getState().entries).toEqual([]);
      });

      it('does not show away lines while the socket is connected', async () => {
        const client = createClient();
        client.connect();
        mockWebSocketInstances[0].onopen?.(new Event('open'));

        serviceWorker.deliver(awayLines([1, 'Bob waves.']));
        await awaySettled(client);

        expect(shownMessages()).toEqual([]);
      });

      it('stops listening to the service worker after shutdown', async () => {
        const client = createClient();
        client.connect();
        client.shutdown();

        serviceWorker.deliver(awayLines([1, 'Bob waves.']));
        await awaySettled(client);

        expect(shownMessages()).toEqual([]);
      });
    });

    describe('reconnect', () => {
      it('clears the stored lines and marks and closes the room notifications', async () => {
        await recordAwayPush({
          from: 1,
          lines: [
            [1, 'one'],
            [2, 'two'],
          ],
          to: 2,
        });
        const client = createClient();
        client.connect();
        await awaySettled(client);
        expect(shownMessages()).toEqual(['one', 'two']);
        expect(serviceWorker.getNotifications).not.toHaveBeenCalled();

        mockWebSocketInstances[0].onopen?.(new Event('open'));
        logIn();
        await awaySettled(client);

        expect(serviceWorker.getNotifications).toHaveBeenCalledWith({ tag: 'mongoose-room' });
        expect(serviceWorker.notification.close).toHaveBeenCalledOnce();
        expect(await takeUnshownAwayLines()).toEqual([]);
        // A fresh period starting at seq 1 is shown again: the marks were reset.
        await recordAwayPush({ from: 1, lines: [[1, 'next period']], to: 1 });
        expect(await takeUnshownAwayLines()).toEqual([{ seq: 1, text: 'next period' }]);
      });

      it('does not clear anything at page load, before the socket opens', async () => {
        await recordAwayPush({ from: 1, lines: [[1, 'one']], to: 1 });
        const client = createClient();
        client.connect();
        await awaySettled(client);

        expect(serviceWorker.getNotifications).not.toHaveBeenCalled();
        expect(shownMessages()).toEqual(['one']);
      });

      it('keeps everything when the socket opens but nobody logs in', async () => {
        await recordAwayPush({
          from: 1,
          lines: [
            [1, 'one'],
            [2, 'two'],
          ],
          to: 2,
        });
        const client = createClient();
        client.connect();
        await awaySettled(client);

        mockWebSocketInstances[0].onopen?.(new Event('open'));
        await awaySettled(client);

        expect(serviceWorker.getNotifications).not.toHaveBeenCalled();
        // The shown mark is still at 2: seq 2 is not handed out again.
        expect(await takeUnshownAwayLines([{ seq: 2, text: 'two' }])).toEqual([]);
      });

      it('logs in without a service worker', async () => {
        Reflect.deleteProperty(navigator, 'serviceWorker');
        await recordAwayPush({ from: 1, lines: [[1, 'one']], to: 1 });
        const client = createClient();
        client.connect();

        mockWebSocketInstances[0].onopen?.(new Event('open'));
        logIn();
        await awaySettled(client);

        expect(client.connected).toBe(true);
        expect(await takeUnshownAwayLines()).toEqual([]);
      });

      it('leaves the away store alone when a local-mode session logs in', async () => {
        await recordAwayPush({ from: 1, lines: [[1, 'one']], to: 1 });
        const client = createClient();
        client.connectLocal({ on: vi.fn(), write: vi.fn() } as unknown as Stream);

        logIn();
        await awaySettled(client);

        expect(serviceWorker.getNotifications).not.toHaveBeenCalled();
        expect(await takeUnshownAwayLines()).toEqual([{ seq: 1, text: 'one' }]);
      });

      it('stops ending away periods after shutdown', async () => {
        const client = createClient();
        client.connect();
        client.shutdown();

        logIn();
        await awaySettled(client);

        expect(serviceWorker.getNotifications).not.toHaveBeenCalled();
      });
    });

    describe('commands while disconnected', () => {
      it('sends the command over HTTP and shows the returned lines as provisional', async () => {
        await storeToken();
        fetchMock.mockResolvedValue(commandResponse([4, 'You look around.'], [5, 'The Lounge']));
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');

        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledWith(COMMAND_URL, {
          body: JSON.stringify({ line: 'look' }),
          headers: { Authorization: 'Bearer away-1', 'Content-Type': 'application/json' },
          method: 'POST',
        });
        expect(mockWebSocketInstances[0].send).not.toHaveBeenCalled();
        expect(useOutputStore.getState().entries).toEqual([
          { id: 1, message: 'You look around.', provisional: true, type: 'message' },
          { id: 2, message: 'The Lounge', provisional: true, type: 'message' },
        ]);
      });

      it('does not show a returned seq again when the service worker also delivers it', async () => {
        await storeToken();
        fetchMock.mockResolvedValue(commandResponse([4, 'You look around.']));
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');
        serviceWorker.deliver(awayLines([4, 'You look around.'], [5, 'Bob waves.']));
        await awaySettled(client);

        expect(shownMessages()).toEqual(['You look around.', 'Bob waves.']);
      });

      it('discards what was stored and shown-marked when the response is from a different period', async () => {
        await storeToken();
        await recordAwayPush({
          from: 1,
          lines: [
            [1, 'one'],
            [2, 'two'],
          ],
          period: 7,
          to: 2,
        });
        const client = createClient();
        client.connect();
        await awaySettled(client);
        fetchMock.mockResolvedValue(commandResponseIn(8, [1, 'You look around.']));

        await sendCommandAndSettle(client, 'look');

        // Seq 1 is shown again: it is a different line in the new period.
        expect(shownMessages()).toEqual(['one', 'two', 'You look around.']);
        // The old period's highest seq went too: seq 2 of the new one is no gap.
        fetchMock.mockClear();
        expect(await recordAwayPush({ from: 2, lines: [[2, 'Bob waves.']], period: 8, to: 2 })).toEqual([
          { seq: 2, text: 'Bob waves.' },
        ]);
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('keeps the marks when the response is from the same period', async () => {
        await storeToken();
        await recordAwayPush({
          from: 1,
          lines: [
            [1, 'one'],
            [2, 'two'],
          ],
          period: 7,
          to: 2,
        });
        const client = createClient();
        client.connect();
        await awaySettled(client);
        fetchMock.mockResolvedValue(commandResponseIn(7, [2, 'two'], [3, 'You look around.']));

        await sendCommandAndSettle(client, 'look');

        expect(shownMessages()).toEqual(['one', 'two', 'You look around.']);
      });

      it('advances the highest seq seen so the service worker does not refetch the output', async () => {
        await storeToken();
        fetchMock.mockResolvedValue(commandResponse([1, 'You look around.'], [2, 'The Lounge']));
        const client = createClient();
        client.connect();
        await sendCommandAndSettle(client, 'look');
        fetchMock.mockClear();

        await recordAwayPush({ from: 3, lines: [[3, 'Bob waves.']], to: 3 });

        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('applies autosay before sending', async () => {
        await storeToken();
        const client = createClient();
        client.connect();
        client.autosay = true;

        await sendCommandAndSettle(client, 'hello there');

        expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ line: 'say hello there' }));
      });

      it('echoes the command before its output when local echo is on', async () => {
        mockPreferencesState.general.localEcho = true;
        await storeToken();
        fetchMock.mockResolvedValue(commandResponse([1, 'You look around.']));
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');

        expect(useOutputStore.getState().entries).toEqual([
          { command: 'look', id: 1, type: 'command' },
          { id: 2, message: 'You look around.', provisional: true, type: 'message' },
        ]);
      });

      it('drops the token on 401 and shows the disconnected error', async () => {
        mockPreferencesState.general.localEcho = true;
        await storeToken();
        fetchMock.mockResolvedValue(Response.json({ error: 'Invalid token' }, { status: 401 }));
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');

        expect(await readAwayToken()).toBeNull();
        expect(useOutputStore.getState().entries).toEqual([
          { error: new Error('Cannot send while disconnected'), id: 1, type: 'error' },
        ]);
      });

      it.each([
        [403, 'Guests cannot send commands while away.'],
        [429, 'Too fast; wait a moment.'],
        [400, 'Missing line.'],
      ])("shows the server's error text on %i and keeps the token", async (status, error) => {
        await storeToken();
        fetchMock.mockResolvedValue(Response.json({ error }, { status }));
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');

        expect(useOutputStore.getState().entries).toEqual([
          { error: new Error(error), id: 1, type: 'error' },
        ]);
        expect((await readAwayToken())?.token).toBe('away-1');
      });

      it('shows the HTTP status when an error response carries no error text', async () => {
        await storeToken();
        fetchMock.mockResolvedValue(new Response('Bad Gateway', { status: 502 }));
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');

        expect(shownErrors()).toEqual([`HTTP 502 from ${COMMAND_URL}`]);
      });

      it('shows the failure when the request cannot be made', async () => {
        await storeToken();
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');

        expect(shownErrors()).toEqual(['Failed to fetch']);
      });

      it('behaves as before with no away token: an error, no request, no echo', async () => {
        mockPreferencesState.general.localEcho = true;
        const client = createClient();
        client.connect();

        await sendCommandAndSettle(client, 'look');

        expect(fetchMock).not.toHaveBeenCalled();
        expect(useOutputStore.getState().entries).toEqual([
          { error: new Error('Cannot send while disconnected'), id: 1, type: 'error' },
        ]);
      });

      it('sends over the socket, not HTTP, while connected', async () => {
        await storeToken();
        const client = createClient();
        client.connect();
        mockWebSocketInstances[0].onopen?.(new Event('open'));

        await sendCommandAndSettle(client, 'look');

        expect(mockWebSocketInstances[0].send).toHaveBeenCalledWith('look\r\n');
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('never uses HTTP in local mode, even with a token stored', async () => {
        await storeToken();
        const client = createClient();
        const closeListeners: Array<() => void> = [];
        const stream = {
          on: vi.fn((event: string, callback: () => void) => {
            if (event === 'close') closeListeners.push(callback);
          }),
          write: vi.fn(),
        } as unknown as Stream;
        client.connectLocal(stream);
        for (const listener of closeListeners) listener();

        client.sendCommand('look');
        // Exactly as today: the error is queued synchronously.
        await Promise.resolve();

        expect(useOutputStore.getState().entries).toEqual([
          { error: new Error('Cannot send while disconnected'), id: 1, type: 'error' },
        ]);
        await awaySettled(client);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(stream.write).not.toHaveBeenCalled();
      });
    });
  });
});
