import { describe, expect, it, vi } from 'vitest';
import { MOO_IDENTIFIER_PATTERN_SOURCE, MOO_SYSTEM_REFERENCE_PATTERN_SOURCE } from './contract';
import {
  BUILTIN_FUNCTIONS,
  ERROR_CONSTANTS,
  MOO_LANGUAGE_ID,
  createMooCodeActionProvider,
  createMooCodeLensProvider,
  createMooCompletionItems,
  createMooCompletionProvider,
  createMooDeclarationProvider,
  createMooDocumentFormattingEditProvider,
  createMooDocumentRangeFormattingEditProvider,
  createMooDocumentHighlightProvider,
  createMooDocumentRangeSemanticTokensProvider,
  createMooDefinitionProvider,
  createMooDocumentSymbolProvider,
  createMooFoldingRangeProvider,
  createMooHoverProvider,
  createMooInlineCompletionsProvider,
  createMooInlayHintsProvider,
  createMooLanguageConfiguration,
  createMooLinkedEditingRangeProvider,
  createMooLinkProvider,
  createMooMonarchLanguage,
  createMooOnTypeFormattingEditProvider,
  createMooReferenceProvider,
  createMooRenameProvider,
  createMooSelectionRangeProvider,
  createMooSemanticTokensProvider,
  getEditorLanguageForSessionType,
  registerMooLanguage,
} from './language';

const COMPLETION_WORD_PATTERNS = [
  new RegExp(`${MOO_SYSTEM_REFERENCE_PATTERN_SOURCE}$`),
  new RegExp(`${MOO_IDENTIFIER_PATTERN_SOURCE}$`),
];

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
    expect(monarch.tokenizer).toHaveProperty('comment');
    expect(monarch.tokenizer.root).toEqual(
      expect.arrayContaining([[/\/\*/, { token: 'comment', next: '@comment' }]]),
    );
  });

  it('keeps Monarch identifier tokenization aligned with the MOO grammar', () => {
    const monarch = createMooMonarchLanguage();
    const identifierRule = monarch.tokenizer.root[0][0] as RegExp;
    const systemReferenceRule = monarch.tokenizer.root[1][0] as RegExp;

    expect(identifierRule.exec('bad$name')?.[0]).toBe('bad');
    expect(systemReferenceRule.exec('$room$extra')?.[0]).toBe('$room');
  });

  it('configures MOO brackets, comments, and statement indentation', () => {
    const config = createMooLanguageConfiguration();

    expect(config.comments?.lineComment).toBe('//');
    expect(config.comments?.blockComment).toEqual(['/*', '*/']);
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

  it('adds rich detail and documentation to Monaco completion items', () => {
    const items = createMooCompletionItems({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 1,
      endColumn: 1,
    });

    expect(items.find((item) => item.label === 'notify')).toMatchObject({
      detail: 'notify(player, text)',
      documentation: 'Sends text to a connected player.',
    });
    expect(items.find((item) => item.label === 'player')).toMatchObject({
      detail: 'Builtin variable',
      documentation: 'The player whose command started this task.',
    });
    expect(items.find((item) => item.label === 'E_PERM')).toMatchObject({
      detail: 'MOO error constant',
      documentation: 'Permission denied.',
    });
    expect(items.find((item) => item.label === 'if')).toMatchObject({
      detail: 'MOO statement keyword',
      documentation: 'Begins a conditional block.',
    });
  });

  it('uses ToastStunt arity metadata for generic builtin completion snippets', () => {
    const items = createMooCompletionItems({
      startLineNumber: 1,
      endLineNumber: 1,
      startColumn: 1,
      endColumn: 1,
    });

    expect(items.find((item) => item.label === 'sqlite_query')).toMatchObject({
      detail: 'sqlite_query(arg1: int, arg2: str, arg3?: any)',
      insertText: [
        'sqlite_query(',
        '$',
        '{1:int}',
        ', ',
        '$',
        '{2:str}',
        ', ',
        '$',
        '{3:any?}',
        ')',
      ].join(''),
    });
    expect(items.find((item) => item.label === 'threads')).toMatchObject({
      detail: 'threads()',
      insertText: 'threads()',
    });
    expect(items.find((item) => item.label === 'notify')?.insertText).toBe(
      ['notify(', '$', '{1:player}', ', ', '$', '{2:text}', ')'].join(''),
    );
  });

  it('offers block snippets with Monaco tab stops for common MOO forms', () => {
    const ifBlockSnippet = ['if (', '$', '{1:condition})\n  $0\nendif'].join('');
    const tryExceptSnippet = ['try\n  $1\nexcept (', '$', '{2:any})\n  $0\nendtry'].join('');
    const items = createMooCompletionItems(
      {
        startLineNumber: 1,
        endLineNumber: 1,
        startColumn: 1,
        endColumn: 3,
      },
      {
        languages: {
          CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
          CompletionItemKind: {
            Constant: 14,
            Function: 1,
            Keyword: 17,
            Snippet: 27,
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
    );

    expect(items).toEqual(
      expect.arrayContaining([
        {
          label: 'if block',
          kind: 27,
          detail: 'MOO block snippet',
          insertText: ifBlockSnippet,
          insertTextRules: 4,
          documentation: 'Insert an if/endif block.',
          range: {
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 1,
            endColumn: 3,
          },
        },
        expect.objectContaining({
          label: 'try/except',
          insertText: tryExceptSnippet,
        }),
      ]),
    );
  });

  it('computes completion replacement ranges from the active model word', () => {
    const provider = createMooCompletionProvider();
    const model = {
      getValue: vi.fn(() => '  not'),
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

  it('adds local MOO symbols to default completions', () => {
    const provider = createMooCompletionProvider();
    const source = ['total = 0;', 'for item in (items)', '  it', 'endfor'].join('\n');
    const completions = provider.provideCompletionItems(
      {
        getValue: () => source,
        getLineContent: () => '  it',
        getWordUntilPosition: () => ({
          word: 'it',
          startColumn: 3,
          endColumn: 5,
        }),
      },
      { lineNumber: 3, column: 5 },
    );

    expect(completions.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'item',
          documentation: 'MOO local variable',
        }),
        expect.objectContaining({
          label: 'total',
          documentation: 'MOO local variable',
        }),
      ]),
    );
  });

  it('uses expression completions inside dynamic MOO verb-name targets', () => {
    const provider = createMooCompletionProvider();
    const source = ['verb_name = "tell";', 'player:(ver'].join('\n');
    const completions = provider.provideCompletionItems(
      {
        getValue: () => source,
        getLineContent: () => 'player:(ver',
        getWordUntilPosition: () => ({
          word: 'ver',
          startColumn: 9,
          endColumn: 12,
        }),
      },
      { lineNumber: 2, column: 12 },
    );

    expect(completions.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'verb_name',
          documentation: 'MOO local variable',
        }),
        expect.objectContaining({
          label: 'if',
          detail: 'MOO statement keyword',
        }),
      ]),
    );
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

    const exceptionLabels = labelsForCompletion(provider, 'except (', 9);
    expect(exceptionLabels).toContain('any');
    expect(exceptionLabels).toContain('error');
    expect(exceptionLabels).toContain('E_PERM');
    expect(exceptionLabels).not.toContain('notify');
    expect(exceptionLabels).not.toContain('if');

    const catchLabels = labelsForCompletion(provider, '`player:tell() !', 17);
    expect(catchLabels).toContain('any');
    expect(catchLabels).toContain('error');
    expect(catchLabels).toContain('E_PERM');
    expect(catchLabels).not.toContain('notify');
    expect(catchLabels).not.toContain('if');
  });

  it('uses expression completions for @ exception selector expressions', () => {
    const provider = createMooCompletionProvider();
    const source = ['codes = {};', 'except caught (@co'].join('\n');
    const completions = provider.provideCompletionItems(
      {
        getValue: () => source,
        getLineContent: () => 'except caught (@co',
        getWordUntilPosition: () => ({
          word: 'co',
          startColumn: 17,
          endColumn: 19,
        }),
      },
      { lineNumber: 2, column: 19 },
    );

    expect(completions.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'codes',
          documentation: 'MOO local variable',
        }),
        expect.objectContaining({
          label: 'if',
          detail: 'MOO statement keyword',
        }),
      ]),
    );
    expect(completions.suggestions).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'any',
          detail: 'MOO exception selector',
        }),
      ]),
    );
    expect(labelsForCompletion(provider, '`player:tell() ! @co', 21)).toContain('if');
  });

  it('suppresses completions inside comments and string literals', () => {
    const provider = createMooCompletionProvider();

    expect(labelsForCompletion(provider, '// not', 7)).toEqual([]);
    expect(labelsForCompletion(provider, 'notify(player, "not")', 20)).toEqual([]);
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
        registerCodeActionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerCodeLensProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDeclarationProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDefinitionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentHighlightProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSymbolProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSemanticTokensProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentRangeSemanticTokensProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentRangeFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerFoldingRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerInlineCompletionsProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerInlayHintsProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerLinkedEditingRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerLinkProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerOnTypeFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerReferenceProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerRenameProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerSelectionRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
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
    expect(monaco.languages.registerCodeActionProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerCodeLensProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerCompletionItemProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDeclarationProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDefinitionProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDocumentHighlightProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDocumentSymbolProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDocumentSemanticTokensProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDocumentRangeSemanticTokensProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDocumentFormattingEditProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerDocumentRangeFormattingEditProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerFoldingRangeProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerHoverProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerInlineCompletionsProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerInlayHintsProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerLinkedEditingRangeProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerLinkProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerOnTypeFormattingEditProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerReferenceProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerRenameProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerSelectionRangeProvider).toHaveBeenCalledTimes(1);
    expect(monaco.languages.registerSignatureHelpProvider).toHaveBeenCalledTimes(1);
  });

  it('provides local definition, reference, and rename operations for Monaco', () => {
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');
    const model = {
      getValue: () => source,
      uri: 'moo://#1:test',
    };
    const declarationProvider = createMooDeclarationProvider();
    const definitionProvider = createMooDefinitionProvider();
    const referenceProvider = createMooReferenceProvider();
    const renameProvider = createMooRenameProvider();

    expect(declarationProvider.provideDeclaration(model, { lineNumber: 2, column: 10 })).toEqual({
      uri: 'moo://#1:test',
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 6,
      },
    });
    expect(definitionProvider.provideDefinition(model, { lineNumber: 2, column: 10 })).toEqual({
      uri: 'moo://#1:test',
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 6,
      },
    });
    expect(referenceProvider.provideReferences(model, { lineNumber: 3, column: 18 })).toEqual([
      expect.objectContaining({ uri: 'moo://#1:test' }),
      expect.objectContaining({ uri: 'moo://#1:test' }),
      expect.objectContaining({ uri: 'moo://#1:test' }),
      expect.objectContaining({ uri: 'moo://#1:test' }),
    ]);
    expect(
      renameProvider.provideRenameEdits(model, { lineNumber: 2, column: 10 }, 'score'),
    ).toEqual({
      edits: [
        {
          resource: 'moo://#1:test',
          textEdit: {
            range: {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 6,
            },
            text: 'score',
          },
          versionId: undefined,
        },
        expect.objectContaining({ resource: 'moo://#1:test' }),
        expect.objectContaining({ resource: 'moo://#1:test' }),
        expect.objectContaining({ resource: 'moo://#1:test' }),
      ],
    });
    expect(
      renameProvider.resolveRenameLocation?.(model, { lineNumber: 2, column: 10 }, {} as never),
    ).toEqual({
      range: {
        startLineNumber: 2,
        startColumn: 9,
        endLineNumber: 2,
        endColumn: 14,
      },
      text: 'total',
    });
    expect(
      renameProvider.resolveRenameLocation?.(model, { lineNumber: 3, column: 8 }, {} as never),
    ).toEqual({
      range: {
        startLineNumber: 3,
        startColumn: 8,
        endLineNumber: 3,
        endColumn: 8,
      },
      text: '',
      rejectReason: 'No local MOO symbol is available at this position.',
    });
  });

  it('uses document link targets for object and system reference definitions', () => {
    const parseUri = vi.fn((uri: string) => ({ parsed: uri }));
    const source = ['owner = #123;', '$player:tell("hi");'].join('\n');
    const model = {
      getValue: () => source,
      uri: 'moo://#1:test',
    };
    const declarationProvider = createMooDeclarationProvider({ Uri: { parse: parseUri } });
    const definitionProvider = createMooDefinitionProvider({ Uri: { parse: parseUri } });

    expect(definitionProvider.provideDefinition(model, { lineNumber: 1, column: 10 })).toEqual({
      uri: { parsed: 'moo://object/123' },
      range: {
        startLineNumber: 1,
        startColumn: 9,
        endLineNumber: 1,
        endColumn: 13,
      },
    });
    expect(declarationProvider.provideDeclaration(model, { lineNumber: 2, column: 4 })).toEqual({
      uri: { parsed: 'moo://system/player' },
      range: {
        startLineNumber: 2,
        startColumn: 1,
        endLineNumber: 2,
        endColumn: 8,
      },
    });
    expect(parseUri).toHaveBeenCalledWith('moo://object/123');
    expect(parseUri).toHaveBeenCalledWith('moo://system/player');
  });

  it('provides Monaco CodeLens summaries for local MOO symbols', () => {
    const provider = createMooCodeLensProvider();
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(
      provider.provideCodeLenses(
        {
          getValue: () => source,
          uri: 'moo://#1:test',
        } as never,
        {} as never,
      ),
    ).toEqual({
      lenses: [
        {
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 6,
          },
          command: {
            id: 'editor.action.showReferences',
            title: '2 definitions, 2 references',
            tooltip: 'Local total: 2 definitions, 2 references.',
            arguments: [
              'moo://#1:test',
              { lineNumber: 1, column: 1 },
              [
                {
                  uri: 'moo://#1:test',
                  range: {
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 6,
                  },
                },
                {
                  uri: 'moo://#1:test',
                  range: {
                    startLineNumber: 2,
                    startColumn: 1,
                    endLineNumber: 2,
                    endColumn: 6,
                  },
                },
                {
                  uri: 'moo://#1:test',
                  range: {
                    startLineNumber: 2,
                    startColumn: 9,
                    endLineNumber: 2,
                    endColumn: 14,
                  },
                },
                {
                  uri: 'moo://#1:test',
                  range: {
                    startLineNumber: 3,
                    startColumn: 16,
                    endLineNumber: 3,
                    endColumn: 21,
                  },
                },
              ],
            ],
          },
        },
      ],
      dispose: expect.any(Function),
    });
  });

  it('provides Monaco document highlights for local symbols', () => {
    const provider = createMooDocumentHighlightProvider({ Read: 1, Write: 2 });
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(
      provider.provideDocumentHighlights(
        {
          getValue: () => source,
        } as never,
        { lineNumber: 2, column: 10 },
        {} as never,
      ),
    ).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 6,
        },
        kind: 2,
      },
      expect.objectContaining({ kind: 2 }),
      expect.objectContaining({ kind: 1 }),
      expect.objectContaining({ kind: 1 }),
    ]);
  });

  it('provides Monaco linked editing ranges for local symbols', () => {
    const provider = createMooLinkedEditingRangeProvider();
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(
      provider.provideLinkedEditingRanges(
        {
          getValue: () => source,
        } as never,
        { lineNumber: 2, column: 10 } as never,
        {} as never,
      ),
    ).toEqual({
      ranges: [
        {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 6,
        },
        expect.objectContaining({ startLineNumber: 2, startColumn: 1 }),
        expect.objectContaining({ startLineNumber: 2, startColumn: 9 }),
        expect.objectContaining({ startLineNumber: 3, startColumn: 16 }),
      ],
      wordPattern: /[A-Za-z_][A-Za-z0-9_]*/,
    });
  });

  it('provides Monaco document links for MOO object references', () => {
    const provider = createMooLinkProvider();
    const links = provider.provideLinks(
      {
        getValue: () => 'owner = #123;',
      } as never,
      {} as never,
    );

    expect(links).toEqual({
      links: [
        {
          range: {
            startLineNumber: 1,
            startColumn: 9,
            endLineNumber: 1,
            endColumn: 13,
          },
          url: 'moo://object/123',
          tooltip: 'Open MOO object #123',
        },
      ],
      dispose: expect.any(Function),
    });
    expect(links.dispose?.()).toBeUndefined();
  });

  it('provides Monaco selection ranges for smart expand selection', () => {
    const provider = createMooSelectionRangeProvider();
    const source = ['if (valid(player))', '  notify(player, "ok");', 'endif'].join('\n');

    expect(
      provider.provideSelectionRanges(
        { getValue: () => source } as never,
        [{ lineNumber: 2, column: 12 }],
        {} as never,
      ),
    ).toEqual([
      [
        {
          range: {
            startLineNumber: 2,
            startColumn: 10,
            endLineNumber: 2,
            endColumn: 16,
          },
        },
        {
          range: {
            startLineNumber: 2,
            startColumn: 3,
            endLineNumber: 2,
            endColumn: 24,
          },
        },
        {
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 3,
            endColumn: 6,
          },
        },
      ],
    ]);
  });

  it('provides Monaco quick fixes for fixable MOO diagnostics', () => {
    const provider = createMooCodeActionProvider();
    const model = {
      getValue: () => 'while (connected)\n  suspend(1);',
      uri: 'moo://#1:tick',
    };

    const actions = provider.provideCodeActions(
      model as never,
      {} as never,
      { markers: [], trigger: 1 } as never,
      {} as never,
    );

    expect(actions).toEqual({
      actions: [
        {
          title: 'Insert missing endwhile',
          kind: 'quickfix',
          isPreferred: true,
          diagnostics: [expect.objectContaining({ code: 'unclosed-block' })],
          edit: {
            edits: [
              {
                resource: 'moo://#1:tick',
                textEdit: {
                  range: {
                    startLineNumber: 2,
                    startColumn: 14,
                    endLineNumber: 2,
                    endColumn: 14,
                  },
                  text: '\nendwhile',
                },
                versionId: undefined,
              },
            ],
          },
        },
      ],
      dispose: expect.any(Function),
    });
    expect(actions.dispose()).toBeUndefined();
  });

  it('provides Monaco quick fixes for parser markers from the current context', () => {
    const provider = createMooCodeActionProvider();
    const model = {
      getValue: () => 'notify(player, "ok")',
      uri: 'moo://#1:tick',
    };

    const actions = provider.provideCodeActions(
      model as never,
      {} as never,
      {
        markers: [
          {
            code: 'missing-node',
            lineNumber: 1,
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 21,
            endColumn: 22,
            message: 'Tree-sitter recovered by inserting missing ;.',
            missingText: ';',
            severity: 8,
            source: MOO_LANGUAGE_ID,
          },
        ],
        trigger: 1,
      } as never,
      {} as never,
    );

    expect(actions.actions).toContainEqual({
      title: 'Insert missing ;',
      kind: 'quickfix',
      isPreferred: true,
      diagnostics: [expect.objectContaining({ code: 'missing-node' })],
      edit: {
        edits: [
          {
            resource: 'moo://#1:tick',
            textEdit: {
              range: {
                startLineNumber: 1,
                startColumn: 21,
                endLineNumber: 1,
                endColumn: 21,
              },
              text: ';',
            },
            versionId: undefined,
          },
        ],
      },
    });
  });

  it('scopes Monaco quick fixes to the requested diagnostic context', () => {
    const provider = createMooCodeActionProvider();
    const model = {
      getValue: () => ['while (connected)', '  unused = 1;'].join('\n'),
      uri: 'moo://#1:tick',
    };

    const actions = provider.provideCodeActions(
      model as never,
      {} as never,
      {
        markers: [
          {
            code: { value: 'unused-local', target: 'moo://#1:tick#unused' },
            lineNumber: 2,
            startLineNumber: 2,
            endLineNumber: 2,
            startColumn: 3,
            endColumn: 9,
            message: 'unused is defined but never used.',
            severity: 4,
            source: MOO_LANGUAGE_ID,
          },
        ],
        trigger: 1,
      } as never,
      {} as never,
    );

    expect(actions.actions.map((action) => action.title)).toEqual([
      'Mark unused as intentionally ignored',
    ]);
  });

  it('provides Monaco quick fixes for unused local warnings', () => {
    const provider = createMooCodeActionProvider();
    const model = {
      getValue: () => ['used = 1;', 'unused = 2;', 'notify(player, used);'].join('\n'),
      uri: 'moo://#1:tick',
    };

    const actions = provider.provideCodeActions(
      model as never,
      {} as never,
      { markers: [], trigger: 1 } as never,
      {} as never,
    );

    expect(actions.actions).toContainEqual({
      title: 'Mark unused as intentionally ignored',
      kind: 'quickfix',
      isPreferred: true,
      diagnostics: [expect.objectContaining({ code: 'unused-local', severity: 4 })],
      edit: {
        edits: [
          {
            resource: 'moo://#1:tick',
            textEdit: {
              range: {
                startLineNumber: 2,
                startColumn: 1,
                endLineNumber: 2,
                endColumn: 1,
              },
              text: '_',
            },
            versionId: undefined,
          },
        ],
      },
    });
  });

  it('provides Monaco parameter inlay hints for builtin and verb calls', () => {
    const provider = createMooInlayHintsProvider({ Parameter: 2 });
    const hints = provider.provideInlayHints(
      { getValue: () => 'notify(player, "hello");\nplayer:tell("hi", caller);' } as never,
      {} as never,
      {} as never,
    );

    expect(hints).toEqual({
      hints: [
        {
          label: 'player:',
          position: { lineNumber: 1, column: 8 },
          kind: 2,
          paddingRight: true,
        },
        {
          label: 'text:',
          position: { lineNumber: 1, column: 16 },
          kind: 2,
          paddingRight: true,
        },
        {
          label: 'arg1:',
          position: { lineNumber: 2, column: 13 },
          kind: 2,
          paddingRight: true,
        },
        {
          label: 'arg2:',
          position: { lineNumber: 2, column: 19 },
          kind: 2,
          paddingRight: true,
        },
      ],
      dispose: expect.any(Function),
    });
    expect(hints.dispose()).toBeUndefined();
  });

  it('provides Monaco inline completions for MOO block close scaffolding', () => {
    const provider = createMooInlineCompletionsProvider();
    const source = 'if (valid(player))';
    const completions = provider.provideInlineCompletions(
      { getValue: () => source } as never,
      { lineNumber: 1, column: source.length + 1 } as never,
      {} as never,
      {} as never,
    );

    expect(completions).toEqual({
      items: [
        {
          insertText: '\n  \nendif',
          range: {
            startLineNumber: 1,
            startColumn: source.length + 1,
            endLineNumber: 1,
            endColumn: source.length + 1,
          },
        },
      ],
      suppressSuggestions: false,
    });
    expect(provider.disposeInlineCompletions(completions, { kind: 'notTaken' })).toBeUndefined();
  });

  it('provides rich Monaco hovers from MOO language metadata', () => {
    const provider = createMooHoverProvider();

    expect(
      provider.provideHover({ getValue: () => 'notify(player, "hello");' } as never, {
        lineNumber: 1,
        column: 3,
      }),
    ).toEqual({
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 7,
      },
      contents: [
        {
          value: expect.stringContaining('notify(player, text)'),
        },
      ],
    });
  });

  it('provides a full-document Monaco formatting edit', () => {
    const provider = createMooDocumentFormattingEditProvider();
    const edits = provider.provideDocumentFormattingEdits(
      {
        getValue: () => 'if (player)\nnotify(player, "ok");\nendif',
        getLineCount: () => 3,
        getLineMaxColumn: (lineNumber: number) => (lineNumber === 2 ? 22 : 6),
      } as never,
      { tabSize: 2, insertSpaces: true } as never,
      {} as never,
    );

    expect(edits).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 3,
          endColumn: 6,
        },
        text: 'if (player)\n  notify(player, "ok");\nendif',
      },
    ]);
  });

  it('provides Monaco range formatting edits for selected MOO lines', () => {
    const provider = createMooDocumentRangeFormattingEditProvider();
    const edits = provider.provideDocumentRangeFormattingEdits(
      {
        getValue: () => ['if (valid(player))', 'notify(player, "ok");', 'endif'].join('\n'),
      } as never,
      {
        startLineNumber: 2,
        startColumn: 8,
        endLineNumber: 2,
        endColumn: 14,
      } as never,
      { tabSize: 2, insertSpaces: true } as never,
      {} as never,
    );

    expect(edits).toEqual([
      {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 22,
        },
        text: '  notify(player, "ok");',
      },
    ]);
  });

  it('does not emit range formatting edits when the selected lines are already formatted', () => {
    const provider = createMooDocumentRangeFormattingEditProvider();
    const edits = provider.provideDocumentRangeFormattingEdits(
      {
        getValue: () => ['if (valid(player))', '  notify(player, "ok");', 'endif'].join('\n'),
      } as never,
      {
        startLineNumber: 2,
        startColumn: 1,
        endLineNumber: 2,
        endColumn: 22,
      } as never,
      { tabSize: 2, insertSpaces: true } as never,
      {} as never,
    );

    expect(edits).toEqual([]);
  });

  it('provides Monaco on-type formatting edits for the current MOO line', () => {
    const provider = createMooOnTypeFormattingEditProvider();
    const edits = provider.provideOnTypeFormattingEdits(
      {
        getValue: () => ['if (valid(player))', 'notify(player, "ok");', 'endif'].join('\n'),
      } as never,
      { lineNumber: 2, column: 22 } as never,
      ';',
      { tabSize: 2, insertSpaces: true } as never,
      {} as never,
    );

    expect(provider.autoFormatTriggerCharacters).toContain(';');
    expect(provider.autoFormatTriggerCharacters).toContain(')');
    expect(edits).toEqual([
      {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 22,
        },
        text: '  notify(player, "ok");',
      },
    ]);
  });

  it('does not emit on-type formatting edits when the current line is already formatted', () => {
    const provider = createMooOnTypeFormattingEditProvider();
    const edits = provider.provideOnTypeFormattingEdits(
      {
        getValue: () => ['if (valid(player))', '  notify(player, "ok");', 'endif'].join('\n'),
      } as never,
      { lineNumber: 2, column: 24 } as never,
      ';',
      { tabSize: 2, insertSpaces: true } as never,
      {} as never,
    );

    expect(edits).toEqual([]);
  });

  it('registers range formatting when Monaco exposes it', () => {
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
        registerCodeActionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDefinitionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentHighlightProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSymbolProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSemanticTokensProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentRangeFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerFoldingRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerInlayHintsProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerReferenceProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerRenameProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerSelectionRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerSignatureHelpProvider: vi.fn(() => ({ dispose: vi.fn() })),
        setLanguageConfiguration: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
      },
    };

    registerMooLanguage(monaco);

    expect(monaco.languages.registerDocumentRangeFormattingEditProvider).toHaveBeenCalledWith(
      MOO_LANGUAGE_ID,
      expect.objectContaining({
        provideDocumentRangeFormattingEdits: expect.any(Function),
      }),
    );
  });

  it('registers on-type formatting when Monaco exposes it', () => {
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
        registerCodeActionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDefinitionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentHighlightProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSymbolProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSemanticTokensProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerFoldingRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerInlayHintsProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerOnTypeFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerReferenceProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerRenameProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerSelectionRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerSignatureHelpProvider: vi.fn(() => ({ dispose: vi.fn() })),
        setLanguageConfiguration: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
      },
    };

    registerMooLanguage(monaco);

    expect(monaco.languages.registerOnTypeFormattingEditProvider).toHaveBeenCalledWith(
      MOO_LANGUAGE_ID,
      expect.objectContaining({
        autoFormatTriggerCharacters: expect.arrayContaining([';', ')']),
        provideOnTypeFormattingEdits: expect.any(Function),
      }),
    );
  });

  it('provides Monaco semantic tokens for MOO source', () => {
    const provider = createMooSemanticTokensProvider();
    const tokens = provider.provideDocumentSemanticTokens(
      { getValue: () => 'total = 0;\nnotify(player, total);' } as never,
      null,
      {} as never,
    );

    expect(provider.getLegend().tokenTypes).toContain('variable');
    expect(provider.getLegend().tokenModifiers).toContain('defaultLibrary');
    expect(Array.from(tokens.data)).toEqual(expect.arrayContaining([5, 6]));
    expect(provider.releaseDocumentSemanticTokens(undefined)).toBeUndefined();
  });

  it('provides Monaco range semantic tokens for MOO source', () => {
    const provider = createMooDocumentRangeSemanticTokensProvider();
    const tokens = provider.provideDocumentRangeSemanticTokens(
      { getValue: () => 'total = 0;\nnotify(player, total);\n// done' } as never,
      {
        startLineNumber: 2,
        startColumn: 1,
        endLineNumber: 2,
        endColumn: 29,
      } as never,
      {} as never,
    );

    expect(provider.getLegend().tokenTypes).toContain('variable');
    expect(provider.getLegend().tokenModifiers).toContain('defaultLibrary');
    expect(Array.from(tokens.data)).toEqual(expect.arrayContaining([1, 0, 6]));
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

    await expect(
      symbolProvider.provideDocumentSymbols({ getValue: () => source }),
    ).resolves.toEqual([
      expect.objectContaining({
        name: 'if valid(player)',
        kind: 11,
        range: expect.objectContaining({
          startLineNumber: 1,
          endLineNumber: 3,
        }),
      }),
    ]);
    await expect(foldingProvider.provideFoldingRanges({ getValue: () => source })).resolves.toEqual(
      [{ start: 1, end: 3 }],
    );
    expect(parse).toHaveBeenCalledWith(source);
  });

  it('falls back to scanner document symbols and folding ranges while parser structure is unavailable', async () => {
    const parse = vi.fn(async () => {
      throw new Error('WASM unavailable');
    });
    const source = ['while (connected)', '  notify(player, "tick");', 'endwhile'].join('\n');
    const symbolProvider = createMooDocumentSymbolProvider(undefined, parse);
    const foldingProvider = createMooFoldingRangeProvider(parse);

    await expect(
      symbolProvider.provideDocumentSymbols({ getValue: () => source }),
    ).resolves.toEqual([
      expect.objectContaining({
        name: 'while connected',
        range: expect.objectContaining({
          startLineNumber: 1,
          endLineNumber: 3,
        }),
      }),
    ]);
    await expect(foldingProvider.provideFoldingRanges({ getValue: () => source })).resolves.toEqual(
      [{ start: 1, end: 3 }],
    );
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
        registerCodeActionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDefinitionProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentHighlightProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSymbolProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentSemanticTokensProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerDocumentFormattingEditProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerFoldingRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerInlayHintsProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerReferenceProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerRenameProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerSelectionRangeProvider: vi.fn(() => ({ dispose: vi.fn() })),
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
    expect(
      signatureProvider.provideSignatureHelp(
        { getValue: () => 'player:tell("hello", caller);' },
        { lineNumber: 1, column: 24 },
      ),
    ).toMatchObject({
      value: {
        activeParameter: 1,
        signatures: [{ label: 'player:tell(arg1, arg2)' }],
      },
    });
    expect(
      signatureProvider.provideSignatureHelp(
        { getValue: () => 'player:(verb_name)("hello", caller);' },
        { lineNumber: 1, column: 31 },
      ),
    ).toMatchObject({
      value: {
        activeParameter: 1,
        signatures: [{ label: 'player:(verb_name)(arg1, arg2)' }],
      },
    });
  });
});

function labelsForCompletion(
  provider: ReturnType<typeof createMooCompletionProvider>,
  line: string,
  column: number,
): string[] {
  const linePrefix = line.slice(0, column - 1);
  const wordMatch = COMPLETION_WORD_PATTERNS.map((pattern) => pattern.exec(linePrefix)).find(
    (match) => match !== null,
  );
  const word = wordMatch?.[0] ?? '';
  const startColumn = column - word.length;
  const completions = provider.provideCompletionItems(
    {
      getValue: () => line,
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
