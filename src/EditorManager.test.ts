import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorManager } from './EditorManager';
import type { EditorSession, McpSimpleEdit } from './mcp';

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
  let mockSimpleEdit: McpSimpleEdit;
  let mockBroadcastChannel: MockBroadcastChannel;
  let mockWindow: MockEditorWindow;

  beforeEach(() => {
    mockSimpleEdit = {
      sendSet: vi.fn(),
    } as unknown as McpSimpleEdit;

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

    editorManager = new EditorManager(mockSimpleEdit);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('opens a new editor window', () => {
    editorManager.openEditorWindow(createSession());

    expect(window.open).toHaveBeenCalledWith(expect.stringMatching(/^\/editor\?reference=test-ref&owner=/), '_blank');
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

  it('saves editor window content through SimpleEdit', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });
    editorManager.saveEditorWindow(
      createSession({
        contents: ['Updated content'],
      }),
    );

    expect(mockSimpleEdit.sendSet).toHaveBeenCalledWith({
      reference: 'test-ref',
      type: 'text/plain',
      contents: ['Updated content'],
      name: 'test.txt',
    });
  });

  it('loads a session after an editor window announces readiness', () => {
    editorManager.openEditorWindow(createSession());

    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });

    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'load',
        id: 'test-ref',
        session: expect.objectContaining(createSession()),
      }),
    );
  });

  it('handles editor window save messages', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });
    const saveEditorWindowSpy = vi.spyOn(editorManager, 'saveEditorWindow');
    const session = createSession({ contents: ['Updated content'] });

    dispatchEditorMessage(mockBroadcastChannel, {
      type: 'save',
      id: 'test-ref',
      session,
    });

    expect(saveEditorWindowSpy).toHaveBeenCalledWith(session);
  });

  it('closes open editor windows on shutdown', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });

    editorManager.shutdown();

    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
      type: 'shutdown',
      id: 'test-ref',
    });
    expect(mockBroadcastChannel.close).toHaveBeenCalled();
  });

  it('ignores unopened, wrong-reference and closed saves', () => {
    editorManager.saveEditorWindow(createSession());
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });
    dispatchEditorMessage(mockBroadcastChannel, { type: 'save', id: 'another', session: createSession() });
    dispatchEditorMessage(mockBroadcastChannel, { type: 'save', id: 'test-ref', session: createSession({ reference: 'another' }) });
    dispatchEditorMessage(mockBroadcastChannel, { type: 'close', id: 'test-ref' });
    dispatchEditorMessage(mockBroadcastChannel, { type: 'save', id: 'test-ref', session: createSession() });
    expect(mockSimpleEdit.sendSet).not.toHaveBeenCalled();
  });

  it('preserves the server-owned edit target and type', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });
    dispatchEditorMessage(mockBroadcastChannel, { type: 'save', id: 'test-ref', session: createSession({ name: 'substituted', type: 'substituted', contents: ['changed'] }) });
    expect(mockSimpleEdit.sendSet).toHaveBeenCalledWith(createSession({ contents: ['changed'] }));
  });

  it('fences late messages after disconnect reset', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });
    const oldListener = mockBroadcastChannel.onmessage;
    editorManager.reset();
    editorManager.openEditorWindow(createSession());
    oldListener?.({ data: { type: 'save', id: 'test-ref', session: createSession() } } as MessageEvent);
    expect(mockSimpleEdit.sendSet).not.toHaveBeenCalled();
  });

  it('rejects a late save after the owning browser window closes', () => {
    editorManager.openEditorWindow(createSession());
    dispatchEditorMessage(mockBroadcastChannel, { type: 'ready', id: 'test-ref' });
    mockWindow.closed = true;
    dispatchEditorMessage(mockBroadcastChannel, { type: 'save', id: 'test-ref', session: createSession() });
    expect(mockSimpleEdit.sendSet).not.toHaveBeenCalled();
  });

  it('opens independent channels for two game sessions editing the same reference', () => {
    const secondEdit = { sendSet: vi.fn() } as unknown as McpSimpleEdit;
    const secondManager = new EditorManager(secondEdit);
    editorManager.openEditorWindow(createSession());
    secondManager.openEditorWindow(createSession());
    const channelNames = vi.mocked(BroadcastChannel).mock.calls.map(([name]) => name);
    expect(channelNames).toHaveLength(2);
    expect(new Set(channelNames).size).toBe(2);
    secondManager.shutdown();
  });
});
