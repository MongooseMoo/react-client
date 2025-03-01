import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditorManager } from './EditorManager';
import MudClient from './client';

// Mock MudClient
vi.mock('./client', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      sendMCPMultiline: vi.fn(),
    })),
  };
});

describe('EditorManager', () => {
  let editorManager: EditorManager;
  let mockClient: MudClient;
  let originalWindow: any;
  let mockBroadcastChannel: any;
  let mockWindow: any;
  
  beforeEach(() => {
    // Mock the client
    mockClient = new MudClient() as any;
    
    // Create mock window
    mockWindow = {
      focus: vi.fn(),
      close: vi.fn(),
      closed: false,
    };
    
    // Save original window and create mock
    originalWindow = global.window;
    global.window = {
      ...originalWindow,
      open: vi.fn().mockReturnValue(mockWindow),
    };
    
    // Mock BroadcastChannel
    mockBroadcastChannel = {
      postMessage: vi.fn(),
      onmessage: null,
      close: vi.fn(),
    };
    
    global.BroadcastChannel = vi.fn().mockImplementation(() => mockBroadcastChannel);
    
    // Create the editor manager
    editorManager = new EditorManager(mockClient);
  });
  
  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
  });
  
  it('should open a new editor window', () => {
    // Test data
    const editorSession = {
      reference: 'test-ref',
      type: 'text/plain',
      contents: 'Test content',
      name: 'test.txt',
    };
    
    // Call the method
    editorManager.openEditorWindow(editorSession);
    
    // Verify window.open was called with expected URL
    expect(window.open).toHaveBeenCalledWith(
      '/editor?reference=test-ref',
      '_blank'
    );
  });
  
  it('should focus an existing window if already open', () => {
    // Override the window.open mock for this specific test to make existing windows work
    // This is needed because our implementation of openEditorWindow
    // uses the editors Map to store existing window references
    const lookupMap = new Map();
    
    // Patch the editor manager to use our mock data
    editorManager['editors'] = lookupMap as any;
    
    // Test data
    const editorSession = {
      reference: 'test-ref',
      type: 'text/plain',
      contents: 'Test content',
      name: 'test.txt',
    };
    
    // Store a mock window in the editors map
    lookupMap.set('test-ref', {
      ...editorSession,
      window: mockWindow,
      state: 1, // EditorState.Open
    });
    
    // Call the method
    editorManager.openEditorWindow(editorSession);
    
    // Verify window.open was not called
    expect(window.open).not.toHaveBeenCalled();
    
    // Verify focus was called on the existing window
    expect(mockWindow.focus).toHaveBeenCalled();
  });
  
  it('should save editor window content', () => {
    // Test data
    const editorSession = {
      reference: 'test-ref',
      type: 'text/plain',
      contents: 'Updated content',
      name: 'test.txt',
    };
    
    // Call the save method
    editorManager.saveEditorWindow(editorSession);
    
    // Verify sendMCPMultiline was called with expected arguments
    expect(mockClient.sendMCPMultiline).toHaveBeenCalledWith(
      'dns-org-mud-moo-simpleedit-set',
      {
        reference: 'test-ref',
        type: 'text/plain',
        'content*': '',
      },
      'Updated content'
    );
  });
  
  it('should handle editor window ready message', () => {
    // Test data
    const editorSession = {
      reference: 'test-ref',
      type: 'text/plain',
      contents: 'Test content',
      name: 'test.txt',
    };
    
    // Open an editor window
    editorManager.openEditorWindow(editorSession);
    
    // Simulate 'ready' message from editor window
    const readyMessage = {
      data: {
        type: 'ready',
        id: 'test-ref',
      }
    };
    
    mockBroadcastChannel.onmessage(readyMessage);
    
    // Verify that the channel posted a message with the session data
    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'load',
        session: expect.objectContaining({
          reference: 'test-ref',
          type: 'text/plain',
          contents: 'Test content',
          name: 'test.txt',
        }),
      })
    );
  });
  
  it('should handle editor window save message', () => {
    // Spy on saveEditorWindow
    const saveEditorWindowSpy = vi.spyOn(editorManager, 'saveEditorWindow');
    
    // Test session data
    const sessionData = {
      reference: 'test-ref',
      type: 'text/plain',
      contents: 'Updated content',
      name: 'test.txt',
    };
    
    // Simulate 'save' message from editor window
    const saveMessage = {
      data: {
        type: 'save',
        session: sessionData,
      }
    };
    
    mockBroadcastChannel.onmessage(saveMessage);
    
    // Verify saveEditorWindow was called with the session data
    expect(saveEditorWindowSpy).toHaveBeenCalledWith(sessionData);
  });
  
  it('should shutdown properly', () => {
    // Override the editors map for this test
    editorManager['editors'] = new Map([
      ['test-ref', {
        reference: 'test-ref',
        type: 'text/plain',
        contents: 'Test content',
        name: 'test.txt',
        window: mockWindow,
        state: 1, // EditorState.Open
      }]
    ]) as any;
    
    // Call shutdown
    editorManager.shutdown();
    
    // Verify close was called on the window
    expect(mockWindow.close).toHaveBeenCalled();
    
    // Verify shutdown message was posted to the channel
    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
      type: 'shutdown',
      id: 'test-ref',
    });
    
    // Verify channel was closed
    expect(mockBroadcastChannel.close).toHaveBeenCalled();
  });
});