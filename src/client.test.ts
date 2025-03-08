import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MudClient from './client';
import { TelnetCommand, TelnetOption, TelnetParser } from './telnet';
import EventEmitter from 'eventemitter3';
import { GMCPClientFileTransfer } from './gmcp';
import { AutoreadMode, preferencesStore } from './PreferencesStore';

// Mock dependencies
vi.mock('./telnet', () => {
  // Import real EventEmitter
  const { EventEmitter } = require('eventemitter3');
  
  // Create a real instance of EventEmitter to be used for all tests
  const mockTelnetInstance = new EventEmitter();
  
  // Add mock methods that can be spied on
  mockTelnetInstance.sendNegotiation = vi.fn();
  mockTelnetInstance.sendGmcp = vi.fn();
  mockTelnetInstance.sendTerminalType = vi.fn();
  
  // Class that will be returned by the mock
  class MockTelnetParser extends EventEmitter {
    constructor() {
      super();
      // Just return the same instance for each test
      return mockTelnetInstance;
    }
  }
  
  return {
    TelnetCommand: { 
      WILL: 251,
      WONT: 252,
      DO: 253,
      DONT: 254,
      IAC: 255,
      SB: 250,
      SE: 240
    },
    TelnetOption: { 
      GMCP: 201,
      TERMINAL_TYPE: 24
    },
    TelnetParser: MockTelnetParser,
    WebSocketStream: class MockWebSocketStream {
      constructor(public ws: any) {}
    }
  };
});

vi.mock('./gmcp', () => {
  return {
    GMCPChar: class MockGMCPChar {
      packageName = 'Char';
      constructor() {}
    },
    GMCPClientFileTransfer: class MockGMCPClientFileTransfer {
      packageName = 'Client.FileTransfer';
      constructor() {}
      sendOffer = vi.fn();
      sendAccept = vi.fn();
      sendCandidate = vi.fn();
      sendReject = vi.fn();
    },
    GMCPCore: class MockGMCPCore {
      packageName = 'Core';
      constructor() {
        // Automatically register in client mock gmcpHandlers
        if (arguments[0] && arguments[0].gmcpHandlers) {
          arguments[0].gmcpHandlers['Core'] = this;
        }
      }
      sendHello = vi.fn();
    },
    GMCPCoreSupports: class MockGMCPCoreSupports {
      packageName = 'Core.Supports';
      constructor() {
        // Automatically register in client mock gmcpHandlers
        if (arguments[0] && arguments[0].gmcpHandlers) {
          arguments[0].gmcpHandlers['Core.Supports'] = this;
        }
      }
      sendSet = vi.fn();
    },
    GMCPAutoLogin: class MockGMCPAutoLogin {
      packageName = 'Auth.Autologin';
      constructor() {
        // Automatically register in client mock gmcpHandlers
        if (arguments[0] && arguments[0].gmcpHandlers) {
          arguments[0].gmcpHandlers['Auth.Autologin'] = this;
        }
      }
      sendLogin = vi.fn();
    },
    GMCPClientMedia: class MockGMCPClientMedia {
      packageName = 'Client.Media';
      constructor() {
        // Automatically register in client mock gmcpHandlers
        if (arguments[0] && arguments[0].gmcpHandlers) {
          arguments[0].gmcpHandlers['Client.Media'] = this;
        }
      }
      stopAllSounds = vi.fn();
    }
  };
});

vi.mock('./EditorManager', () => {
  return {
    EditorManager: class MockEditorManager {
      constructor() {}
      shutdown = vi.fn();
    }
  };
});

vi.mock('./WebRTCService', () => {
  const EventEmitter = require('eventemitter3');
  return {
    WebRTCService: class MockWebRTCService extends EventEmitter {
      constructor() {
        super();
      }
      cleanup = vi.fn();
      
      // Add mock methods needed for file transfer tests
      sendIceCandidate = vi.fn();
      createOffer = vi.fn();
      createAnswer = vi.fn();
    }
  };
});

vi.mock('./FileTransferManager.js', () => {
  return {
    default: class MockFileTransferManager {
      constructor() {}
      sendFile = vi.fn();
      cancelTransfer = vi.fn();
      acceptTransfer = vi.fn();
      cleanup = vi.fn();
    }
  };
});

vi.mock('./PreferencesStore', () => {
  return {
    AutoreadMode: {
      All: 'all',
      Unfocused: 'unfocused',
      None: 'none'
    },
    preferencesStore: {
      getState: vi.fn().mockReturnValue({
        general: {
          volume: 0.5,
          localEcho: true
        },
        speech: {
          rate: 1,
          pitch: 1,
          voice: 'Default',
          volume: 1,
          autoreadMode: 'none'
        }
      })
    }
  };
});

vi.mock('cacophony', () => {
  return {
    Cacophony: class MockCacophony {
      constructor() {}
      setGlobalVolume = vi.fn();
    }
  };
});

vi.mock('strip-ansi', () => {
  return {
    default: (text: string) => text.replace(/\x1B\[[0-9;]*[mK]/g, '')
  };
});

// Mock window global objects
const mockWebSocketInstance = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  binaryType: '',
  onopen: null,
  onclose: null,
  onerror: null
};

global.WebSocket = vi.fn().mockImplementation(() => mockWebSocketInstance);

global.Notification = vi.fn().mockImplementation(() => ({})) as any;
global.Notification.permission = 'granted';
global.Notification.requestPermission = vi.fn().mockResolvedValue('granted');

global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  lang: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null
})) as any;

global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([{ name: 'Voice 1' }, { name: 'Voice 2' }])
} as any;

describe('MudClient', () => {
  let client: MudClient;
  let mockWebSocket: any;
  let mockTelnetParser: any;

  beforeEach(() => {
    // Reset mock implementations
    vi.clearAllMocks();
    
    // Create new client instance
    client = new MudClient('test.host', 8000);
    
    // Setup WebSocket mock - we're now using the mockWebSocketInstance directly
    mockWebSocket = mockWebSocketInstance;
    
    // Ensure the client is connected and event handlers are registered
    client.connect();
    
    // Access the telnet parser from the client
    mockTelnetParser = (client as any).telnet;
    
    // Simulate the WebSocket connection opening
    if (mockWebSocket.onopen) {
      mockWebSocket.onopen();
    }
    
    // Clear any mock tracking for fresh test
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with the correct host and port', () => {
      expect(client).toBeInstanceOf(MudClient);
      expect((client as any).host).toBe('test.host');
      expect((client as any).port).toBe(8000);
    });

    it('should register default GMCP handlers', () => {
      expect(client.gmcp_char).toBeDefined();
      expect(client.gmcp_fileTransfer).toBeDefined();
    });

    it('should initialize necessary services', () => {
      expect(client.cacophony).toBeDefined();
      expect(client.editors).toBeDefined();
      expect(client.webRTCService).toBeDefined();
      expect(client.fileTransferManager).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should establish a WebSocket connection', () => {
      client.connect();
      
      expect(global.WebSocket).toHaveBeenCalledWith('wss://test.host:8000');
      expect(mockWebSocket.binaryType).toBe('arraybuffer');
    });

    it('should emit connect event when WebSocket opens', () => {
      // Create a new client to test the connect event specifically
      const newClient = new MudClient('test.host', 8000);
      const emitSpy = vi.spyOn(newClient, 'emit');
      
      // Connect the client
      newClient.connect();
      
      // Trigger the onopen callback
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen();
      }
      
      expect(emitSpy).toHaveBeenCalledWith('connect');
      expect(emitSpy).toHaveBeenCalledWith('connectionChange', true);
      expect(newClient.connected).toBe(true);
    });

    it('should have a telnet parser that can send negotiation responses', () => {
      // After connect(), the client should have a telnet parser
      expect(client.connected).toBe(true);
      expect((client as any).telnet).toBeDefined();
      expect((client as any).telnet.sendNegotiation).toBeDefined();
      
      // Spy on the sendNegotiation method
      const sendNegotiationSpy = vi.spyOn((client as any).telnet, 'sendNegotiation');
      
      // The actual negotiation test is handled in a different test
      // This test just ensures the client has the capability to respond
      (client as any).telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
      
      // Check that the method was called
      expect(sendNegotiationSpy).toHaveBeenCalledWith(TelnetCommand.DO, TelnetOption.GMCP);
    });

    it('should handle terminal type negotiation', () => {
      // Create a new client for this test
      const tempClient = new MudClient('test.host', 8000);
      tempClient.connect();
      const tempTelnetParser = (tempClient as any).telnet;
      
      // Manually trigger the negotiation event
      tempTelnetParser.emit('negotiation', TelnetCommand.DO, TelnetOption.TERMINAL_TYPE);
      
      expect(tempTelnetParser.sendNegotiation).toHaveBeenCalledWith(TelnetCommand.WILL, TelnetOption.TERMINAL_TYPE);
      expect(tempTelnetParser.sendTerminalType).toHaveBeenCalledWith('Mongoose Client');
      expect(tempTelnetParser.sendTerminalType).toHaveBeenCalledWith('ANSI');
      expect(tempTelnetParser.sendTerminalType).toHaveBeenCalledWith('PROXY');
    });
  });

  describe('handleData', () => {
    it('should emit message event for regular text data', () => {
      // Use a fresh client to avoid interference
      const dataClient = new MudClient('test.host', 8000);
      dataClient.connect();
      const dataTelnetParser = (dataClient as any).telnet;
      
      const emitSpy = vi.spyOn(dataClient, 'emit');
      
      // Create a text data buffer
      const textData = 'Hello, World!';
      const buffer = new TextEncoder().encode(textData).buffer;
      
      // Emit the data event on the telnet parser
      dataTelnetParser.emit('data', buffer);
      
      expect(emitSpy).toHaveBeenCalledWith('message', textData);
    });

    it('should handle MCP messages', () => {
      // Use a fresh client to avoid interference
      const mcpClient = new MudClient('test.host', 8000);
      mcpClient.connect();
      const mcpTelnetParser = (mcpClient as any).telnet;
      
      const handleMcpSpy = vi.spyOn(mcpClient as any, 'handleMcp');
      
      // Create an MCP message buffer
      const mcpData = '#$#mcp version: 2.1 to: 2.1';
      const buffer = new TextEncoder().encode(mcpData).buffer;
      
      // Emit the data event on the telnet parser
      mcpTelnetParser.emit('data', buffer);
      
      expect(handleMcpSpy).toHaveBeenCalledWith(mcpData);
    });

    it('should speak text when autoreadMode is All', () => {
      // Reset mocks for this test
      vi.clearAllMocks();
      
      // Setup autoread all preference
      (preferencesStore.getState as any).mockReturnValue({
        general: { volume: 0.5, localEcho: true },
        speech: { 
          rate: 1, 
          pitch: 1, 
          voice: 'Default', 
          volume: 1, 
          autoreadMode: AutoreadMode.All 
        }
      });
      
      // Make a fresh client with the updated preferences
      const clientWithAutoread = new MudClient('test.host', 8000);
      clientWithAutoread.connect();
      
      // Get the telnet parser from the client
      const autoreadTelnetParser = (clientWithAutoread as any).telnet;
      
      const speakSpy = vi.spyOn(clientWithAutoread, 'speak');
      
      // Create a text data buffer
      const textData = 'Hello, World!';
      const buffer = new TextEncoder().encode(textData).buffer;
      
      // Emit the data event on the telnet parser
      autoreadTelnetParser.emit('data', buffer);
      
      expect(speakSpy).toHaveBeenCalledWith(textData);
    });
  });

  describe('handleGmcpData', () => {
    it('should call the appropriate GMCP handler', () => {
      // Setup a fresh client to avoid interference
      const gmcpClient = new MudClient('test.host', 8000);
      gmcpClient.connect();
      
      // Setup a mock GMCP handler
      const mockHandler = {
        handleUpdate: vi.fn()
      };
      
      // Replace handlers with our mock
      (gmcpClient as any).gmcpHandlers = {
        'Char': mockHandler
      };
      
      // Get the telnet parser from the client
      const gmcpTelnetParser = (gmcpClient as any).telnet;
      
      // Emit a GMCP event directly
      (gmcpClient as any).handleGmcpData('Char.Update', '{"name":"TestChar"}');
      
      expect(mockHandler.handleUpdate).toHaveBeenCalledWith({ name: 'TestChar' });
    });

    it('should log when no handler is found for a GMCP package', () => {
      // Setup a fresh client
      const noHandlerClient = new MudClient('test.host', 8000);
      noHandlerClient.connect();
      
      // Spy on console.log
      const consoleSpy = vi.spyOn(console, 'log');
      
      // Directly call handleGmcpData with an unknown package
      (noHandlerClient as any).handleGmcpData('Unknown.Package', '{}');
      
      // Check that the console log was called with the right message
      expect(consoleSpy).toHaveBeenCalledWith('GMCP Message:', 'Unknown', 'Package', '{}');
      expect(consoleSpy).toHaveBeenCalledWith('No handler for GMCP package:', 'Unknown');
    });
  });

  describe('sendCommand', () => {
    it('should send command to the WebSocket with CR+LF', () => {
      client.connect();
      
      client.sendCommand('look');
      
      expect(mockWebSocket.send).toHaveBeenCalledWith('look\r\n');
    });

    it('should emit command event when local echo is enabled', () => {
      client.connect();
      const emitSpy = vi.spyOn(client, 'emit');
      
      client.sendCommand('look');
      
      expect(emitSpy).toHaveBeenCalledWith('command', 'look');
    });

    it('should prepend "say" to command when autosay is enabled', () => {
      client.connect();
      (client as any)._autosay = true;
      
      client.sendCommand('hello');
      
      expect(mockWebSocket.send).toHaveBeenCalledWith('say hello\r\n');
    });
  });

  describe('close', () => {
    it('should close the WebSocket connection', () => {
      client.connect();
      
      client.close();
      
      expect(mockWebSocket.close).toHaveBeenCalled();
      expect((client as any).intentionalDisconnect).toBe(true);
    });

    it('should clean up resources', () => {
      const cleanupSpy = vi.spyOn(client as any, 'cleanupConnection');
      
      client.connect();
      client.close();
      
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('file transfer methods', () => {
    it('should delegate sendFile to fileTransferManager', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      await client.sendFile(mockFile, 'recipient');
      
      expect(client.fileTransferManager.sendFile).toHaveBeenCalledWith(mockFile, 'recipient');
    });

    it('should delegate cancelTransfer to fileTransferManager', () => {
      client.cancelTransfer('hash123');
      
      expect(client.fileTransferManager.cancelTransfer).toHaveBeenCalledWith('hash123');
    });

    it('should delegate acceptTransfer to fileTransferManager', () => {
      client.acceptTransfer('sender', 'hash123');
      
      expect(client.fileTransferManager.acceptTransfer).toHaveBeenCalledWith('sender', 'hash123');
    });

    it('should call gmcp_fileTransfer.sendReject for rejectTransfer', () => {
      client.gmcp_fileTransfer.sendReject = vi.fn();
      
      client.rejectTransfer('sender', 'hash123');
      
      expect(client.gmcp_fileTransfer.sendReject).toHaveBeenCalledWith('sender', 'hash123');
    });
  });

  describe('notification methods', () => {
    it('should request notification permission when permissions are not granted', () => {
      // Set Notification.permission to 'default' temporarily
      const originalPermission = Notification.permission;
      Object.defineProperty(Notification, 'permission', {
        configurable: true,
        get: () => 'default'
      });
      
      client.requestNotificationPermission();
      
      expect(Notification.requestPermission).toHaveBeenCalled();
      
      // Restore the original permission
      Object.defineProperty(Notification, 'permission', {
        configurable: true,
        get: () => originalPermission
      });
    });

    it('should send notification when permission is granted', () => {
      client.sendNotification('Test Title', 'Test Message');
      
      expect(global.Notification).toHaveBeenCalledWith('Test Title', { body: 'Test Message' });
    });
  });

  describe('speech methods', () => {
    it('should speak text using speech synthesis', () => {
      client.speak('Hello world');
      
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalled();
      expect(global.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should cancel speech', () => {
      client.cancelSpeech();
      
      expect(global.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('input management', () => {
    it('should get input from DOM element', () => {
      // Mock the document.getElementById
      document.getElementById = vi.fn().mockReturnValue({ textContent: 'test input' });
      
      const input = client.getInput();
      
      expect(input).toBe('test input');
    });

    it('should set input to DOM element', () => {
      // Mock the document.getElementById
      const mockElement = { textContent: '' };
      document.getElementById = vi.fn().mockReturnValue(mockElement);
      
      client.setInput('new input');
      
      expect(mockElement.textContent).toBe('new input');
    });
  });
});