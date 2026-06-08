import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorManager } from './EditorManager';
import type MudClient from './client';
import type { EditorSession } from './mcp';

type MockBroadcastChannel = {
  close: ReturnType<typeof vi.fn>;
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
};

type MockEditorWindow = {
  close: ReturnType<typeof vi.fn>;
  closed: boolean;
  focus: ReturnType<typeof vi.fn>;
};

function createSession(overrides: Partial<EditorSession> = {}): EditorSession {
  return {
    reference: 'test-ref',
    type: 'text/plain',
    contents: ['Test content'],
    name: 'test.txt',
    ...overrides,
  };
}

function dispatchEditorMessage(channel: MockBroadcastChannel, data: unknown): void {
  channel.onmessage?.({ data } as MessageEvent);
}

describe('EditorManager', () => {
  let editorManager: EditorManager;
  let mockClient: MudClient;
  let mockBroadcastChannel: MockBroadcastChannel;
  let mockWindow: MockEditorWindow;

  beforeEach(() => {
    mockClient = {
      mcpSession: {
        sendMultiline: vi.fn(),
      },
    } as unknown as MudClient;

    mockWindow = {
      focus: vi.fn(),
      close: vi.fn(),
      closed: false,
    };
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);

    mockBroadcastChannel = {
      postMessage: vi.fn(),
      onmessage: null,
      close: vi.fn(),
    };
    vi.stubGlobal(
      'BroadcastChannel',
      vi.fn().mockImplementation(() => mockBroadcastChannel),
    );

    editorManager = new EditorManager(mockClient);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('opens a new editor window', () => {
    editorManager.openEditorWindow(createSession());

    expect(window.open).toHaveBeenCalledWith('/editor?reference=test-ref', '_blank');
    expect(mockWindow.focus).toHaveBeenCalled();
  });

  it('focuses an existing open window', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });
    mockWindow.focus.mockClear();

    editorManager.openEditorWindow(createSession());

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(mockWindow.focus).toHaveBeenCalledOnce();
  });

  it('saves editor window content through the MCP session', () => {
    editorManager.saveEditorWindow(
      createSession({
        contents: ['Updated content'],
      }),
    );

    expect(mockClient.mcpSession.sendMultiline).toHaveBeenCalledWith(
      'dns-org-mud-moo-simpleedit-set',
      {
        reference: 'test-ref',
        type: 'text/plain',
        'content*': '',
      },
      ['Updated content'],
    );
  });

  it('loads a session after an editor window announces readiness', () => {
    editorManager.openEditorWindow(createSession());

    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });

    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'load',
        session: expect.objectContaining(createSession()),
      }),
    );
  });

  it('handles editor window save messages', () => {
    const saveEditorWindowSpy = vi.spyOn(editorManager, 'saveEditorWindow');
    const session = createSession({ contents: ['Updated content'] });

    dispatchEditorMessage(mockBroadcastChannel, {
      type: 'save',
      session,
    });

    expect(saveEditorWindowSpy).toHaveBeenCalledWith(session);
  });

  it('closes open editor windows on shutdown', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });

    editorManager.shutdown();

    expect(mockWindow.close).toHaveBeenCalled();
    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
      type: 'shutdown',
      id: 'test-ref',
    });
    expect(mockBroadcastChannel.close).toHaveBeenCalled();
  });
});
