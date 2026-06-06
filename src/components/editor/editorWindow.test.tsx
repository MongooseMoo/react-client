import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOO_LANGUAGE_ID } from '../../editor/moocode/language';
import EditorWindow from './editorWindow';

const editorMock = vi.hoisted(() => ({
  props: undefined as Record<string, unknown> | undefined,
  focus: vi.fn(),
  modelVersion: 1,
  model: {
    getVersionId: vi.fn(() => editorMock.modelVersion),
    uri: 'moo://editor-model',
  },
  revealPositionInCenter: vi.fn(),
  setPosition: vi.fn(),
  monaco: {
    editor: {
      setModelMarkers: vi.fn(),
    },
    MarkerSeverity: { Error: 8, Warning: 4 },
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
      SymbolKind: {
        Function: 11,
      },
      getLanguages: vi.fn(() => []),
      register: vi.fn(),
      registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
      registerDocumentSymbolProvider: vi.fn(() => ({ dispose: vi.fn() })),
      registerFoldingRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
      registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
      registerSignatureHelpProvider: vi.fn(() => ({ dispose: vi.fn() })),
      setLanguageConfiguration: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
    },
  },
}));

const treeSitterDiagnosticsMock = vi.hoisted(() => vi.fn(() => Promise.resolve([])));
const treeSitterParseMock = vi.hoisted(() =>
  vi.fn(() =>
    Promise.resolve({
      diagnostics: [],
      hasError: false,
      rootType: 'source_file',
      structure: {
        foldingRanges: [],
        symbols: [],
      },
      treeText: '(source_file)',
    }),
  ),
);

vi.mock('@monaco-editor/react', () => ({
  default: (props: Record<string, unknown>) => {
    editorMock.props = props;
    const beforeMount = props.beforeMount as ((monaco: unknown) => void) | undefined;
    const onMount = props.onMount as ((editor: unknown, monaco: unknown) => void) | undefined;
    React.useEffect(() => {
      beforeMount?.(editorMock.monaco);
      onMount?.(
        {
          focus: editorMock.focus,
          getModel: () => editorMock.model,
          revealPositionInCenter: editorMock.revealPositionInCenter,
          setPosition: editorMock.setPosition,
        },
        editorMock.monaco,
      );
    }, [beforeMount, onMount]);
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

vi.mock('../../editor/moocode/treeSitter', () => ({
  parseMooCodeWithTreeSitter: treeSitterParseMock,
  toMonacoTreeSitterMarkers: treeSitterDiagnosticsMock,
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
    editorMock.modelVersion = 1;
    editorMock.model.getVersionId.mockClear();
    editorMock.focus.mockClear();
    editorMock.revealPositionInCenter.mockClear();
    editorMock.setPosition.mockClear();
    editorMock.monaco.editor.setModelMarkers.mockClear();
    editorMock.monaco.languages.getLanguages.mockReturnValue([]);
    editorMock.monaco.languages.register.mockClear();
    editorMock.monaco.languages.registerCompletionItemProvider.mockClear();
    editorMock.monaco.languages.registerDocumentSymbolProvider.mockClear();
    editorMock.monaco.languages.registerFoldingRangeProvider.mockClear();
    editorMock.monaco.languages.registerHoverProvider.mockClear();
    editorMock.monaco.languages.registerSignatureHelpProvider.mockClear();
    editorMock.monaco.languages.setLanguageConfiguration.mockClear();
    editorMock.monaco.languages.setMonarchTokensProvider.mockClear();
    treeSitterDiagnosticsMock.mockClear();
    treeSitterDiagnosticsMock.mockResolvedValue([]);
    treeSitterParseMock.mockClear();
    treeSitterParseMock.mockResolvedValue({
      diagnostics: [],
      hasError: false,
      rootType: 'source_file',
      structure: {
        foldingRanges: [],
        symbols: [],
      },
      treeText: '(source_file)',
    });
    MockBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
  });

  it('uses the MOO Monaco language for moo-code sessions', async () => {
    const parserMarker = {
      code: 'parse-error',
      endColumn: 18,
      endLineNumber: 2,
      lineNumber: 2,
      message: 'Tree-sitter could not parse this MOO syntax.',
      severity: 8,
      source: MOO_LANGUAGE_ID,
      startColumn: 17,
      startLineNumber: 2,
    };
    treeSitterDiagnosticsMock.mockResolvedValueOnce([parserMarker]);

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
    expect(editorMock.props?.beforeMount).toEqual(expect.any(Function));
    expect(editorMock.monaco.languages.register).toHaveBeenCalledWith({ id: MOO_LANGUAGE_ID });
    expect(editorMock.props?.path).toBe('#1:test');
    expect(treeSitterDiagnosticsMock).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(treeSitterDiagnosticsMock).toHaveBeenCalledWith(
        ['if (valid(player))', '  notify(player, "ok");', 'endif'].join('\n'),
        8,
      ),
    );
    await waitFor(() =>
      expect(editorMock.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
        editorMock.model,
        MOO_LANGUAGE_ID,
        [parserMarker],
      ),
    );
    const diagnosticsButton = await screen.findByRole('button', { name: '1 MOO error' });
    fireEvent.click(diagnosticsButton);
    expect(editorMock.setPosition).toHaveBeenCalledWith({ lineNumber: 2, column: 17 });
    expect(editorMock.revealPositionInCenter).toHaveBeenCalledWith({ lineNumber: 2, column: 17 });
    expect(editorMock.focus).toHaveBeenCalled();
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
    expect(screen.queryByText(/MOO (error|warning|problem)/)).toBeNull();
    expect(treeSitterDiagnosticsMock).not.toHaveBeenCalled();
  });

  it('surfaces scanner diagnostics in the editor status bar before parser diagnostics resolve', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['while (1)', '  notify(player, "tick");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    expect(await screen.findByRole('button', { name: '1 MOO error' })).not.toBeNull();
  });

  it('labels the Monaco editor and connects it to the live status bar for screen readers', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['while (1)', '  notify(player, "tick");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    await screen.findByRole('button', { name: '1 MOO error' });
    expect(editorMock.props?.options).toEqual(
      expect.objectContaining({
        ariaLabel: 'MOO code editor for #1:test',
      }),
    );
    expect(editorMock.props?.wrapperProps).toEqual(
      expect.objectContaining({
        'aria-describedby': 'editor-statusbar editor-moo-problems',
      }),
    );
    expect(screen.getByRole('status').getAttribute('id')).toBe('editor-statusbar');
  });

  it('enables the richer Monaco language-service UI for MOO sessions', async () => {
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
          contents: ['notify(player, "ok");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    await waitFor(() => expect(editorMock.props?.language).toBe(MOO_LANGUAGE_ID));
    expect(editorMock.props?.options).toEqual(
      expect.objectContaining({
        'semanticHighlighting.enabled': true,
        acceptSuggestionOnCommitCharacter: true,
        codeLens: true,
        folding: true,
        foldingStrategy: 'auto',
        hover: expect.objectContaining({ enabled: true }),
        inlayHints: expect.objectContaining({ enabled: 'on', padding: true }),
        inlineSuggest: expect.objectContaining({ enabled: true }),
        lightbulb: expect.objectContaining({ enabled: 'onCode' }),
        links: true,
        occurrencesHighlight: 'singleFile',
        screenReaderAnnounceInlineSuggestion: true,
        showFoldingControls: 'always',
        stickyScroll: expect.objectContaining({
          enabled: true,
          defaultModel: 'foldingProviderModel',
        }),
        suggestOnTriggerCharacters: true,
      }),
    );
  });

  it('keeps non-MOO editor sessions on the lightweight Monaco option set', async () => {
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
    expect(editorMock.props?.options).toEqual(
      expect.objectContaining({
        wordWrap: 'on',
        quickSuggestions: true,
      }),
    );
    expect(editorMock.props?.options).not.toHaveProperty('codeLens');
    expect(editorMock.props?.options).not.toHaveProperty('inlayHints');
    expect(editorMock.props?.options).not.toHaveProperty('semanticHighlighting.enabled');
  });

  it('surfaces semantic warnings with Monaco warning severity', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['used = 1;', 'unused = 2;', 'notify(player, used);'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    await waitFor(() =>
      expect(editorMock.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
        editorMock.model,
        MOO_LANGUAGE_ID,
        [
          expect.objectContaining({
            code: 'unused-local',
            severity: 4,
          }),
        ],
      ),
    );
    expect(await screen.findByRole('button', { name: '1 MOO warning' })).not.toBeNull();
  });

  it('passes Monaco model URIs through diagnostic related information', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['notify(player, total);', 'total = 1;'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    await waitFor(() =>
      expect(editorMock.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
        editorMock.model,
        MOO_LANGUAGE_ID,
        [
          expect.objectContaining({
            code: 'undefined-local',
            relatedInformation: [
              expect.objectContaining({
                resource: 'moo://editor-model',
                message: 'First total definition is here.',
              }),
            ],
          }),
        ],
      ),
    );
  });

  it('ignores stale parser diagnostics when the Monaco model version changes before parse resolves', async () => {
    let resolveParserMarkers: (markers: unknown[]) => void = () => {};
    const parserMarker = {
      code: 'parse-error',
      endColumn: 18,
      endLineNumber: 1,
      lineNumber: 1,
      message: 'Tree-sitter could not parse this MOO syntax.',
      severity: 8,
      source: MOO_LANGUAGE_ID,
      startColumn: 17,
      startLineNumber: 1,
    };
    const controlledParserResult = new Promise((resolve) => {
      resolveParserMarkers = resolve;
    });
    treeSitterDiagnosticsMock.mockImplementation((source: string) =>
      source === 'notify(player, "ok");' ? controlledParserResult : Promise.resolve([]),
    );

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
          contents: ['notify(player, "ok");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    await waitFor(() =>
      expect(treeSitterDiagnosticsMock).toHaveBeenCalledWith('notify(player, "ok");', 8),
    );

    editorMock.modelVersion = 2;
    await act(async () => {
      resolveParserMarkers([parserMarker]);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(editorMock.monaco.editor.setModelMarkers).not.toHaveBeenCalledWith(
      editorMock.model,
      MOO_LANGUAGE_ID,
      [parserMarker],
    );
  });

  it('summarizes mixed MOO diagnostics and jumps to the first error before warnings', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['unused = 1;', 'while (1)', '  notify(player, "tick");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    const diagnosticsButton = await screen.findByRole('button', {
      name: '1 MOO error, 1 warning',
    });
    fireEvent.click(diagnosticsButton);

    expect(editorMock.setPosition).toHaveBeenCalledWith({ lineNumber: 2, column: 1 });
    expect(editorMock.revealPositionInCenter).toHaveBeenCalledWith({ lineNumber: 2, column: 1 });
  });

  it('shows a navigable MOO problems list sorted by severity and source position', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['unused = 1;', 'while (1)', '  notify(player, "tick");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    const problemsRegion = await screen.findByRole('region', { name: 'MOO problems' });
    const problemButtons = await screen.findAllByRole('button', { name: /^MOO (error|warning)/ });

    expect(problemsRegion.contains(problemButtons[0])).toBe(true);
    expect(problemButtons.map((button) => button.textContent)).toEqual([
      'Error unclosed-block Ln 2, Col 1 while is missing a matching endwhile.',
      'Warning unused-local Ln 1, Col 1 unused is defined but never used.',
    ]);

    fireEvent.click(problemButtons[1]);
    expect(editorMock.setPosition).toHaveBeenCalledWith({ lineNumber: 1, column: 1 });
    expect(editorMock.revealPositionInCenter).toHaveBeenCalledWith({ lineNumber: 1, column: 1 });
    expect(editorMock.focus).toHaveBeenCalled();
  });

  it('filters the MOO problems list by severity without hiding filter state from assistive tech', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['unused = 1;', 'while (1)', '  notify(player, "tick");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    const allFilter = await screen.findByRole('button', { name: 'Show all MOO problems (2)' });
    const errorFilter = screen.getByRole('button', { name: 'Show MOO errors (1)' });
    const warningFilter = screen.getByRole('button', { name: 'Show MOO warnings (1)' });

    expect(allFilter.getAttribute('aria-pressed')).toBe('true');
    expect(errorFilter.getAttribute('aria-pressed')).toBe('false');
    expect(warningFilter.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(warningFilter);

    expect(allFilter.getAttribute('aria-pressed')).toBe('false');
    expect(warningFilter.getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByRole('button', { name: /^MOO error unclosed-block/ })).toBeNull();
    expect(screen.getByRole('button', { name: /^MOO warning unused-local/ })).not.toBeNull();

    fireEvent.click(errorFilter);

    expect(errorFilter.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /^MOO error unclosed-block/ })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /^MOO warning unused-local/ })).toBeNull();
  });

  it('applies MOO quick fixes from the problems panel', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['while (1)', '  notify(player, "tick");'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    fireEvent.click(
      await screen.findByRole('button', { name: 'Apply quick fix: Insert missing endwhile' }),
    );

    await waitFor(() =>
      expect(editorMock.props?.value).toBe(
        ['while (1)', '  notify(player, "tick");', 'endwhile'].join('\n'),
      ),
    );
    expect(screen.getByRole('status').textContent).toContain('Changed');
  });

  it('applies grouped MOO fix-all actions from the problems panel toolbar', async () => {
    treeSitterDiagnosticsMock.mockResolvedValueOnce([]);

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
          contents: ['used = 1;', 'unused = 2;', 'stale = 3;', 'notify(player, used);'],
          name: '#1:test',
          reference: '#1:test',
          type: 'moo-code',
        },
      });
    });

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Apply MOO fix all: Mark all unused locals as intentionally ignored',
      }),
    );

    await waitFor(() =>
      expect(editorMock.props?.value).toBe(
        ['used = 1;', '_unused = 2;', '_stale = 3;', 'notify(player, used);'].join('\n'),
      ),
    );
    expect(screen.getByRole('status').textContent).toContain('Changed');
  });
});
