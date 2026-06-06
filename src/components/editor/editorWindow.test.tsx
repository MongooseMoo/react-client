import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOO_LANGUAGE_ID } from '../../editor/moocode/language';
import EditorWindow from './editorWindow';

const editorMock = vi.hoisted(() => ({
  props: undefined as Record<string, unknown> | undefined,
  focus: vi.fn(),
  model: {},
  monaco: {
    editor: {
      setModelMarkers: vi.fn(),
    },
    MarkerSeverity: { Error: 8 },
    loader: {
      config: vi.fn(),
    },
    languages: {
      CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
      CompletionItemKind: {
        Constant: 14,
        Function: 1,
        Keyword: 17,
        Variable: 4,
      },
      getLanguages: vi.fn(() => []),
      register: vi.fn(),
      registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
      registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
      setLanguageConfiguration: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
    },
  },
}));

vi.mock('@monaco-editor/react', () => ({
  default: (props: Record<string, unknown>) => {
    editorMock.props = props;
    const onMount = props.onMount as ((editor: unknown, monaco: unknown) => void) | undefined;
    React.useEffect(() => {
      onMount?.({ focus: editorMock.focus, getModel: () => editorMock.model }, editorMock.monaco);
    }, [onMount]);
    return <div data-testid="monaco-editor" />;
  },
  loader: editorMock.monaco.loader,
}));

vi.mock('../../hooks/usePreferences', () => ({
  usePreferences: () => [
    {
      editor: {
        accessibilityMode: false,
        autocompleteEnabled: true,
      },
    },
    vi.fn(),
  ],
}));

vi.mock('../../editor/monacoLoader', () => ({
  configureMonacoLoader: vi.fn(),
}));

class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];

  listeners: Array<(event: MessageEvent) => void> = [];
  postMessage = vi.fn();
  close = vi.fn();

  constructor(public name: string) {
    MockBroadcastChannel.instances.push(this);
  }

  addEventListener(_type: 'message', listener: (event: MessageEvent) => void) {
    this.listeners.push(listener);
  }

  removeEventListener(_type: 'message', listener: (event: MessageEvent) => void) {
    this.listeners = this.listeners.filter((candidate) => candidate !== listener);
  }

  emit(data: unknown) {
    for (const listener of this.listeners) {
      listener({ data } as MessageEvent);
    }
  }
}

describe('EditorWindow language selection', () => {
  beforeEach(() => {
    editorMock.props = undefined;
    editorMock.focus.mockClear();
    editorMock.monaco.editor.setModelMarkers.mockClear();
    editorMock.monaco.languages.getLanguages.mockReturnValue([]);
    MockBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
  });

  it('uses the MOO Monaco language for moo-code sessions', async () => {
    render(
      <MemoryRouter initialEntries={['/editor?reference=%231:test']}>
        <EditorWindow />
      </MemoryRouter>,
    );

    await waitFor(() => expect(MockBroadcastChannel.instances[0]?.listeners.length).toBe(1));

    act(() => {
      MockBroadcastChannel.instances[0].emit({
        type: 'load',
        session: {
          contents: ['if (valid(player))', '  notify(player, "ok");', 'endif'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    await waitFor(() => expect(editorMock.props?.language).toBe(MOO_LANGUAGE_ID));
    expect(editorMock.props?.path).toBe('#1:test');
    expect(editorMock.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
      editorMock.model,
      MOO_LANGUAGE_ID,
      [],
    );
  });

  it('uses plaintext for non-MOO simpleedit sessions', async () => {
    render(
      <MemoryRouter initialEntries={['/editor?reference=note']}>
        <EditorWindow />
      </MemoryRouter>,
    );

    await waitFor(() => expect(MockBroadcastChannel.instances[0]?.listeners.length).toBe(1));

    act(() => {
      MockBroadcastChannel.instances[0].emit({
        type: 'load',
        session: {
          contents: ['plain text'],
          name: 'note',
          reference: 'note',
          type: 'string',
        },
      });
    });

    await waitFor(() => expect(editorMock.props?.language).toBe('plaintext'));
    expect(editorMock.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
      editorMock.model,
      MOO_LANGUAGE_ID,
      [],
    );
  });
});
