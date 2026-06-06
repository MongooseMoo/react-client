import { describe, expect, it, vi } from 'vitest';
import {
  BUILTIN_FUNCTIONS,
  ERROR_CONSTANTS,
  MOO_LANGUAGE_ID,
  createMooCompletionItems,
  createMooCompletionProvider,
  createMooDocumentSymbolProvider,
  createMooFoldingRangeProvider,
  createMooLanguageConfiguration,
  createMooMonarchLanguage,
  getEditorLanguageForSessionType,
  registerMooLanguage,
} from './language';

describe('MOO Monaco language support', () => {
  it('uses moocode only for MOO editor sessions', () => {
    expect(getEditorLanguageForSessionType('moo-code')).toBe(MOO_LANGUAGE_ID);
    expect(getEditorLanguageForSessionType(' lambdamoo ')).toBe(MOO_LANGUAGE_ID);
    expect(getEditorLanguageForSessionType('string')).toBe('plaintext');
    expect(getEditorLanguageForSessionType('string-list')).toBe('plaintext');
    expect(getEditorLanguageForSessionType(undefined)).toBe('plaintext');
  });

  it('defines the ToastStunt keywords, errors, and token states Monaco needs', () => {
    const monarch = createMooMonarchLanguage();

    expect(monarch.keywords).toContain('if');
    expect(monarch.keywords).toContain('elseif');
    expect(monarch.keywords).toContain('endtry');
    expect(monarch.errors).toContain('E_PERM');
    expect(monarch.builtins).toContain('notify');
    expect(monarch.tokenizer).toHaveProperty('root');
    expect(monarch.tokenizer).toHaveProperty('string');
  });

  it('configures MOO brackets, comments, and statement indentation', () => {
    const config = createMooLanguageConfiguration();

    expect(config.comments?.lineComment).toBe('//');
    expect(config.brackets).toContainEqual(['if', 'endif']);
    expect(config.brackets).toContainEqual(['try', 'endtry']);
    expect(config.autoClosingPairs).toContainEqual({ open: '"', close: '"', notIn: ['string'] });
    expect(config.indentationRules?.increaseIndentPattern.test('if (valid(player))')).toBe(true);
    expect(config.indentationRules?.decreaseIndentPattern.test('endif')).toBe(true);
  });

  it('offers core builtin and error completions with insertion text', () => {
    const notifySnippet = ['notify(', '$', '{1:player}', ', ', '$', '{2:text}', ')'].join('');
    const items = createMooCompletionItems({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 1,
      endColumn: 7,
    });

    expect(items.some((item) => item.label === 'notify' && item.insertText === notifySnippet)).toBe(
      true,
    );
    expect(items.some((item) => item.label === 'E_PERM')).toBe(true);
    expect(BUILTIN_FUNCTIONS).toContain('valid');
    expect(ERROR_CONSTANTS).toContain('E_INVARG');
  });

  it('computes completion replacement ranges from the active model word', () => {
    const provider = createMooCompletionProvider();
    const model = {
      getLineContent: vi.fn(() => '  not'),
      getWordUntilPosition: vi.fn(() => ({
        word: 'not',
        startColumn: 3,
        endColumn: 6,
      })),
    };

    const completions = provider.provideCompletionItems(model, {
      lineNumber: 1,
      column: 6,
    });

    expect(completions.suggestions.find((item) => item.label === 'notify')?.range).toEqual({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 3,
      endColumn: 6,
    });
  });

  it('filters completions for error constants, system references, and verb-call contexts', () => {
    const provider = createMooCompletionProvider();

    const errorLabels = labelsForCompletion(provider, 'raise(E_', 9);
    expect(errorLabels).toContain('E_PERM');
    expect(errorLabels).not.toContain('notify');
    expect(errorLabels).not.toContain('if');

    const systemLabels = labelsForCompletion(provider, '$lo', 4);
    expect(systemLabels).toContain('$login');
    expect(systemLabels).toContain('$local');
    expect(systemLabels).not.toContain('notify');

    const verbLabels = labelsForCompletion(provider, 'player:no', 10);
    expect(verbLabels).toContain('notify');
    expect(verbLabels).not.toContain('if');
    expect(verbLabels).not.toContain('E_PERM');
  });

  it('registers language features once for Monaco', () => {
    const monaco = {
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
    };

    registerMooLanguage(monaco);
    registerMooLanguage(monaco);

    expect(monaco.languages.register).toHaveBeenCalledTimes(1);
    expect(monaco.languages.register).toHaveBeenCalledWith({ id: MOO_LANGUAGE_ID });
    expect(monaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith(
      MOO_LANGUAGE_ID,
      expect.any(Object),
    );
    expect(monaco.languages.setLanguageConfiguration).toHaveBeenCalledWith(
      MOO_LANGUAGE_ID,
      expect.any(Object),
    );
    expect(monaco.languages.registerCompletionItemProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDocumentSymbolProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerFoldingRangeProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerHoverProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerSignatureHelpProvider).toHaveBeenCalledTimes(1);
  });

  it('provides Monaco document symbols and folding ranges from parser-backed MOO structure', async () => {
    const parse = vi.fn(async () => ({
      diagnostics: [],
      hasError: false,
      rootType: 'source_file',
      structure: {
        foldingRanges: [{ start: 1, end: 3 }],
        symbols: [
          {
            blockKind: 'if' as const,
            children: [],
            name: 'if valid(player)',
            range: {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 3,
              endColumn: 6,
            },
            selectionRange: {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 3,
            },
          },
        ],
      },
      treeText: '(source_file (if_statement))',
    }));

    const symbolProvider = createMooDocumentSymbolProvider(undefined, parse);
    const foldingProvider = createMooFoldingRangeProvider(parse);
    const source = ['if (valid(player))', '  notify(player, "ok");', 'endif'].join('\n');

    await expect(symbolProvider.provideDocumentSymbols({ getValue: () => source })).resolves.toEqual([
      expect.objectContaining({
        name: 'if valid(player)',
        kind: 11,
        range: expect.objectContaining({
          startLineNumber: 1,
          endLineNumber: 3,
        }),
      }),
    ]);
    await expect(foldingProvider.provideFoldingRanges({ getValue: () => source })).resolves.toEqual([
      { start: 1, end: 3 },
    ]);
    expect(parse).toHaveBeenCalledWith(source);
  });

  it('falls back to scanner document symbols and folding ranges while parser structure is unavailable', async () => {
    const parse = vi.fn(async () => {
      throw new Error('WASM unavailable');
    });
    const source = ['while (connected)', '  notify(player, "tick");', 'endwhile'].join('\n');
    const symbolProvider = createMooDocumentSymbolProvider(undefined, parse);
    const foldingProvider = createMooFoldingRangeProvider(parse);

    await expect(symbolProvider.provideDocumentSymbols({ getValue: () => source })).resolves.toEqual([
      expect.objectContaining({
        name: 'while connected',
        range: expect.objectContaining({
          startLineNumber: 1,
          endLineNumber: 3,
        }),
      }),
    ]);
    await expect(foldingProvider.provideFoldingRanges({ getValue: () => source })).resolves.toEqual([
      { start: 1, end: 3 },
    ]);
  });

  it('provides Monaco signature help for ToastStunt builtin calls', () => {
    const monaco = {
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
        getLanguages: vi.fn(() => [{ id: MOO_LANGUAGE_ID }]),
        register: vi.fn(),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSymbolProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerFoldingRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerSignatureHelpProvider: vi.fn(() => ({ dispose: vi.fn() })),
        setLanguageConfiguration: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
      },
    };

    registerMooLanguage(monaco);

    const source = 'notify(player, "hello");';
    const signatureProvider = monaco.languages.registerSignatureHelpProvider.mock.calls[0][1];

    expect(
      signatureProvider.provideSignatureHelp(
        { getValue: () => source },
        { lineNumber: 1, column: 16 },
      ),
    ).toMatchObject({
      value: {
        activeParameter: 1,
        signatures: [{ label: 'notify(player, text)' }],
      },
    });
  });
});

function labelsForCompletion(
  provider: ReturnType<typeof createMooCompletionProvider>,
  line: string,
  column: number,
): string[] {
  const wordMatch = /[A-Za-z_$][\w$]*$/.exec(line.slice(0, column - 1));
  const word = wordMatch?.[0] ?? '';
  const startColumn = column - word.length;
  const completions = provider.provideCompletionItems(
    {
      getLineContent: () => line,
      getWordUntilPosition: () => ({
        word,
        startColumn,
        endColumn: column,
      }),
    },
    { lineNumber: 1, column },
  );

  return completions.suggestions.map((item) => item.label);
}
