import type * as MonacoEditor from 'monaco-editor';

export {
  BUILTIN_FUNCTIONS,
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  MOO_CODE_ACTION_FIX_ALL_KIND,
  MOO_CODE_ACTION_QUICKFIX_KIND,
  MOO_LANGUAGE_ID,
  MOO_SESSION_TYPES,
  OPERATOR_WORDS,
  PLAINTEXT_LANGUAGE_ID,
  STATEMENT_KEYWORDS,
  SYSTEM_REFERENCES,
} from './contract';
import { findMooBuiltinAtPosition } from './builtinNavigation';
import {
  getMooQuickFixes,
  type MooQuickFix,
  type MooQuickFixDiagnostic,
  type MooQuickFixEdit,
} from './codeActions';
import { getMooBuiltinMetadata, getMooBuiltinParameterLabel } from './builtins';
import { formatMooCode, formatMooCodeRange } from './formatter';
import {
  getMooBuiltinVariableDocumentation,
  getMooErrorDocumentation,
  getMooHover,
  getMooKeywordDocumentation,
} from './hover';
import { getMooInlineCompletions } from './inlineCompletions';
import { collectMooInlayHints } from './inlayHints';
import {
  findMooDocumentLinkAtPosition,
  findMooDocumentLinkReferences,
  getMooDocumentLinks,
} from './links';
import {
  BUILTIN_FUNCTIONS,
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  MOO_BLOCKS,
  MOO_CODE_ACTION_FIX_ALL_KIND,
  MOO_CODE_ACTION_QUICKFIX_KIND,
  MOO_IDENTIFIER_PATTERN_SOURCE,
  MOO_INDENT_OPEN_KEYWORDS,
  MOO_LANGUAGE_ID,
  MOO_SESSION_TYPES,
  MOO_SYSTEM_REFERENCE_PATTERN_SOURCE,
  OPERATOR_WORDS,
  PLAINTEXT_LANGUAGE_ID,
  STATEMENT_KEYWORDS,
  SYSTEM_REFERENCES,
} from './contract';
import { getMooBuiltinSignature, getMooSignatureHelp } from './signatures';
import {
  createMooRenameWorkspaceEdit,
  findMooDefinition,
  findMooDocumentHighlights,
  findMooReferences,
  getMooCodeLenses,
  getMooLinkedEditingRanges,
  getMooLocalCompletions,
  getMooLoopLabelCompletions,
  getMooNewSymbolNameSuggestions,
  getMooRenameLocation,
} from './semantics';
import { getMooSelectionRanges, type MooSelectionRange } from './selectionRanges';
import {
  MOO_SEMANTIC_TOKEN_LEGEND,
  encodeMooSemanticTokens,
  encodeMooSemanticTokensForRange,
} from './semanticTokens';
import { maskMooSource, offsetAtMooPosition } from './scanner';
import { analyzeMooStructure, type MooStructureSymbol } from './structure';
import { parseMooCodeWithTreeSitter, type MooTreeSitterParseResult } from './treeSitter';

export type MonacoRange = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

type MonarchRule = [
  RegExp | string,
  string | { token: string; next?: string } | { cases: Record<string, string> },
];

type MonarchTokenizer = Record<string, MonarchRule[]>;

export type MooMonarchLanguage = {
  defaultToken: string;
  tokenPostfix: string;
  keywords: readonly string[];
  operators: readonly string[];
  errors: readonly string[];
  builtins: readonly string[];
  builtinVariables: readonly string[];
  symbols: RegExp;
  escapes: RegExp;
  tokenizer: MonarchTokenizer;
};

export type MooLanguageConfiguration = {
  comments: {
    blockComment: [string, string];
    lineComment: string;
  };
  brackets: Array<[string, string]>;
  autoClosingPairs: Array<{ open: string; close: string; notIn?: string[] }>;
  surroundingPairs: Array<{ open: string; close: string }>;
  indentationRules: {
    increaseIndentPattern: RegExp;
    decreaseIndentPattern: RegExp;
  };
};

type CompletionItem = {
  label: string;
  kind: number;
  detail?: string;
  insertText: string;
  insertTextRules?: number;
  documentation?: string;
  range: MonacoRange;
  sortText?: string;
  filterText?: string;
  preselect?: boolean;
  commitCharacters?: string[];
  mooCompletionMetadata?: {
    kind: 'local' | 'loop';
  };
};

type CompletionList = {
  suggestions: CompletionItem[];
};

type Hover = {
  range?: MonacoRange;
  contents: Array<{ value: string }>;
  canIncreaseVerbosity?: boolean;
  canDecreaseVerbosity?: boolean;
};

type HoverContext = {
  verbosityRequest?: {
    verbosityDelta: number;
    previousHover: Hover;
  };
};

type TextModelValueLike = {
  getValue(): string;
  uri?: unknown;
};

type DocumentFormattingTextModelLike = TextModelValueLike & {
  getLineCount(): number;
  getLineMaxColumn(lineNumber: number): number;
};

type CompletionTextModelLike = {
  getValue(): string;
  getLineContent(lineNumber: number): string;
  getWordUntilPosition(position: { lineNumber: number; column: number }): {
    word: string;
    startColumn: number;
    endColumn: number;
  };
};

type CompletionPosition = {
  lineNumber: number;
  column: number;
};

type CompletionProvider = {
  triggerCharacters: string[];
  provideCompletionItems: (
    model: CompletionTextModelLike,
    position: CompletionPosition,
  ) => CompletionList;
  resolveCompletionItem?: (item: CompletionItem, token?: unknown) => CompletionItem;
};

type DocumentSymbol = {
  name: string;
  detail: string;
  kind: number;
  tags: [];
  range: MonacoRange;
  selectionRange: MonacoRange;
  children: DocumentSymbol[];
};

type DocumentSymbolProvider = {
  provideDocumentSymbols: (
    model: TextModelValueLike,
  ) => DocumentSymbol[] | Promise<DocumentSymbol[]>;
};

type FoldingRange = {
  start: number;
  end: number;
};

type FoldingRangeProvider = {
  provideFoldingRanges: (model: TextModelValueLike) => FoldingRange[] | Promise<FoldingRange[]>;
};

type SignatureParameterInformation = {
  label: string;
  documentation?: string;
};

type SignatureInformation = {
  label: string;
  documentation: string;
  parameters: SignatureParameterInformation[];
};

type SignatureHelp = {
  signatures: SignatureInformation[];
  activeSignature: number;
  activeParameter: number;
};

type SignatureHelpResult = {
  value: SignatureHelp;
  dispose: () => void;
};

type SignatureHelpProvider = {
  signatureHelpTriggerCharacters: string[];
  signatureHelpRetriggerCharacters: string[];
  provideSignatureHelp: (
    model: TextModelValueLike,
    position: CompletionPosition,
    token?: unknown,
    context?: unknown,
  ) => SignatureHelpResult | null;
};

type MooUriParser = {
  Uri?: {
    parse: (uri: string) => unknown;
  };
};

export type MonacoLike = {
  Uri?: {
    parse: (uri: string) => MonacoEditor.Uri;
  };
  languages: {
    CodeActionKind?: {
      QuickFix: string;
    };
    InlayHintKind?: {
      Parameter: number;
    };
    DocumentHighlightKind?: {
      Read: number;
      Write: number;
    };
    CompletionItemInsertTextRule: {
      InsertAsSnippet: number;
    };
    CompletionItemKind: {
      Constant: number;
      Function: number;
      Keyword: number;
      Snippet?: number;
      Variable: number;
    };
    SymbolKind?: {
      Function: number;
    };
    getLanguages: () => Array<{ id: string }>;
    register: (language: { id: string }) => void;
    registerCodeActionProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.CodeActionProvider,
      metadata?: MonacoEditor.languages.CodeActionProviderMetadata,
    ) => { dispose: () => void };
    registerCodeLensProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.CodeLensProvider,
    ) => { dispose: () => void };
    registerCompletionItemProvider: (
      languageId: string,
      provider: CompletionProvider,
    ) => { dispose: () => void };
    registerDefinitionProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.DefinitionProvider,
    ) => { dispose: () => void };
    registerDeclarationProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.DeclarationProvider,
    ) => { dispose: () => void };
    registerImplementationProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.ImplementationProvider,
    ) => { dispose: () => void };
    registerDocumentHighlightProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.DocumentHighlightProvider,
    ) => { dispose: () => void };
    registerDocumentSymbolProvider?: (
      languageId: string,
      provider: DocumentSymbolProvider,
    ) => { dispose: () => void };
    registerDocumentSemanticTokensProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.DocumentSemanticTokensProvider,
    ) => { dispose: () => void };
    registerDocumentRangeSemanticTokensProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.DocumentRangeSemanticTokensProvider,
    ) => { dispose: () => void };
    registerDocumentFormattingEditProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.DocumentFormattingEditProvider,
    ) => { dispose: () => void };
    registerDocumentRangeFormattingEditProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.DocumentRangeFormattingEditProvider,
    ) => { dispose: () => void };
    registerFoldingRangeProvider?: (
      languageId: string,
      provider: FoldingRangeProvider,
    ) => { dispose: () => void };
    registerHoverProvider: (
      languageId: string,
      provider: {
        provideHover: (
          model: TextModelValueLike,
          position: CompletionPosition,
          token?: unknown,
          context?: HoverContext,
        ) => Hover | null;
      },
    ) => { dispose: () => void };
    registerInlineCompletionsProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.InlineCompletionsProvider,
    ) => { dispose: () => void };
    registerInlayHintsProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.InlayHintsProvider,
    ) => { dispose: () => void };
    registerLinkedEditingRangeProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.LinkedEditingRangeProvider,
    ) => { dispose: () => void };
    registerLinkProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.LinkProvider,
    ) => { dispose: () => void };
    registerNewSymbolNameProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.NewSymbolNamesProvider,
    ) => { dispose: () => void };
    registerOnTypeFormattingEditProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.OnTypeFormattingEditProvider,
    ) => { dispose: () => void };
    registerReferenceProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.ReferenceProvider,
    ) => { dispose: () => void };
    registerRenameProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.RenameProvider,
    ) => { dispose: () => void };
    registerSelectionRangeProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.SelectionRangeProvider,
    ) => { dispose: () => void };
    registerSignatureHelpProvider?: (
      languageId: string,
      provider: SignatureHelpProvider,
    ) => { dispose: () => void };
    registerTypeDefinitionProvider?: (
      languageId: string,
      provider: MonacoEditor.languages.TypeDefinitionProvider,
    ) => { dispose: () => void };
    setLanguageConfiguration: (languageId: string, config: MooLanguageConfiguration) => void;
    setMonarchTokensProvider: (languageId: string, language: MooMonarchLanguage) => void;
  };
};

const REGISTERED_MONACO_INSTANCES = new WeakSet<object>();
const MOO_IDENTIFIER_PATTERN = new RegExp(MOO_IDENTIFIER_PATTERN_SOURCE);
const MOO_SYSTEM_REFERENCE_PATTERN = new RegExp(MOO_SYSTEM_REFERENCE_PATTERN_SOURCE);
const EXCEPT_COMPLETION_PATTERN = new RegExp(
  `\\bexcept\\s+(?:${MOO_IDENTIFIER_PATTERN_SOURCE}\\s*)?\\([^)]*$`,
  'i',
);
const CATCH_COMPLETION_PATTERN = new RegExp(
  `!\\s*(?:${MOO_IDENTIFIER_PATTERN_SOURCE}\\s*,\\s*)*[A-Za-z_]*$`,
  'i',
);

export function getEditorLanguageForSessionType(sessionType: string | undefined): string {
  const normalized = sessionType?.trim().toLowerCase();

  if (normalized && MOO_SESSION_TYPES.includes(normalized as (typeof MOO_SESSION_TYPES)[number])) {
    return MOO_LANGUAGE_ID;
  }

  return PLAINTEXT_LANGUAGE_ID;
}

export function createMooMonarchLanguage(): MooMonarchLanguage {
  return {
    defaultToken: '',
    tokenPostfix: '.moo',
    keywords: STATEMENT_KEYWORDS,
    operators: OPERATOR_WORDS,
    errors: ERROR_CONSTANTS,
    builtins: BUILTIN_FUNCTIONS,
    builtinVariables: BUILTIN_VARIABLES,
    symbols: /[=><!~?:&|+*/^%-]+/,
    escapes: /\\(?:[nrt"\\]|x[0-9A-Fa-f]{2})/,
    tokenizer: {
      root: [
        [
          MOO_IDENTIFIER_PATTERN,
          {
            cases: {
              '@keywords': 'keyword',
              '@operators': 'operator',
              '@errors': 'constant.language.error',
              '@builtins': 'predefined',
              '@builtinVariables': 'variable.predefined',
              '@default': 'identifier',
            },
          },
        ],
        [MOO_SYSTEM_REFERENCE_PATTERN, 'variable.predefined'],
        [/#-?\d+/, 'number.object'],
        [/\d+\.\d+(?:[eE][+-]?\d+)?/, 'number.float'],
        [/\d+(?:[eE][+-]?\d+)?/, 'number'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, { token: 'comment', next: '@comment' }],
        [/"/, { token: 'string.quote', next: '@string' }],
        [/[{}()[\]]/, '@brackets'],
        [/@symbols/, { token: 'operator' }],
        [/[;,.]/, 'delimiter'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', next: '@pop' }],
      ],
      comment: [
        [/[^*/]+/, 'comment'],
        [/\*\//, { token: 'comment', next: '@pop' }],
        [/./, 'comment'],
      ],
    },
  };
}

export function createMooLanguageConfiguration(): MooLanguageConfiguration {
  return {
    comments: {
      blockComment: ['/*', '*/'],
      lineComment: '//',
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
      ...Object.entries(MOO_BLOCKS).map(([open, block]) => [open, block.close] as [string, string]),
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    indentationRules: {
      increaseIndentPattern: new RegExp(
        `^\\s*(?:${MOO_INDENT_OPEN_KEYWORDS.join('|')})\\b(?!.*\\b(?:endif|endfor|endwhile|endfork|endtry)\\b).*$`,
        'i',
      ),
      decreaseIndentPattern:
        /^\s*(?:elseif|else|except|finally|endif|endfor|endwhile|endfork|endtry)\b/i,
    },
  };
}

export function createMooCompletionItems(
  range: MonacoRange,
  monaco?: MonacoLike,
  context: CompletionContext = 'default',
  locals: Array<{ name: string }> = [],
  loopLabels: Array<{ name: string }> = [],
  includeRichMetadata = true,
): CompletionItem[] {
  const kind = monaco?.languages.CompletionItemKind ?? {
    Constant: 14,
    Function: 1,
    Keyword: 17,
    Snippet: 27,
    Variable: 4,
  };
  const snippetRule = monaco?.languages.CompletionItemInsertTextRule.InsertAsSnippet;
  const snippetKind = kind.Snippet ?? kind.Keyword;

  const statements = STATEMENT_KEYWORDS.map((keyword) => ({
    label: keyword,
    kind: kind.Keyword,
    insertText: keyword,
    range,
    sortText: completionSortText('keyword', keyword),
    filterText: completionFilterText('keyword', keyword),
    ...(includeRichMetadata
      ? {
          detail: 'MOO statement keyword',
          documentation: getMooKeywordDocumentation(keyword) ?? 'MOO statement keyword',
        }
      : {}),
  }));
  const variables = BUILTIN_VARIABLES.map((variable) => ({
    label: variable,
    kind: kind.Variable,
    insertText: variable,
    range,
    sortText: completionSortText('variable', variable),
    filterText: completionFilterText('variable', variable),
    commitCharacters: completionCommitCharacters('variable'),
    ...(includeRichMetadata
      ? {
          detail: 'Builtin variable',
          documentation: getMooBuiltinVariableDocumentation(variable) ?? 'MOO builtin variable',
        }
      : {}),
  }));
  const errors = ERROR_CONSTANTS.map((error) => ({
    label: error,
    kind: kind.Constant,
    insertText: error,
    range,
    sortText: completionSortText('error', error),
    filterText: completionFilterText('error', error),
    commitCharacters: completionCommitCharacters('error'),
    ...(includeRichMetadata
      ? {
          detail: 'MOO error constant',
          documentation: getMooErrorDocumentation(error) ?? 'MOO error constant',
        }
      : {}),
  }));
  const exceptionCodes = [
    {
      label: 'any',
      kind: kind.Keyword,
      insertText: 'any',
      range,
      sortText: completionSortText('exception', 'any'),
      filterText: completionFilterText('exception', 'any'),
      commitCharacters: completionCommitCharacters('exception'),
      ...(includeRichMetadata
        ? {
            detail: 'MOO exception selector',
            documentation: 'Matches any raised MOO exception.',
          }
        : {}),
    },
    {
      label: 'error',
      kind: kind.Keyword,
      insertText: 'error',
      range,
      sortText: completionSortText('exception', 'error'),
      filterText: completionFilterText('exception', 'error'),
      commitCharacters: completionCommitCharacters('exception'),
      ...(includeRichMetadata
        ? {
            detail: 'MOO exception selector',
            documentation: 'Matches a generic MOO error value.',
          }
        : {}),
    },
    ...errors,
  ];
  const systemReferences = SYSTEM_REFERENCES.map((reference) => ({
    label: reference,
    kind: kind.Variable,
    insertText: reference,
    range,
    sortText: completionSortText('system', reference),
    filterText: completionFilterText('system', reference),
    commitCharacters: completionCommitCharacters('system'),
    ...(includeRichMetadata
      ? {
          detail: 'System object reference',
          documentation: 'MOO system object reference',
        }
      : {}),
  }));
  const functions = BUILTIN_FUNCTIONS.map((name) => {
    const signature = BUILTIN_SNIPPETS[name] ?? createMooBuiltinSnippet(name);
    const builtinSignature = includeRichMetadata ? getMooBuiltinSignature(name) : null;

    return {
      label: name,
      kind: kind.Function,
      insertText: signature,
      insertTextRules: snippetRule,
      range,
      sortText: completionSortText('function', name),
      filterText: completionFilterText('function', name),
      ...(builtinSignature
        ? {
            detail: builtinSignature.label,
            documentation: builtinSignature.documentation,
          }
        : {}),
    };
  });
  const localVariables = locals.map((local, index) => ({
    label: local.name,
    kind: kind.Variable,
    insertText: local.name,
    range,
    sortText: completionSortText('local', local.name),
    filterText: completionFilterText('local', local.name),
    preselect: index === 0,
    commitCharacters: completionCommitCharacters('local'),
    mooCompletionMetadata: { kind: 'local' as const },
    ...(includeRichMetadata
      ? {
          detail: 'Local variable',
          documentation: 'MOO local variable',
        }
      : {}),
  }));
  const loopLabelItems = loopLabels.map((label, index) => ({
    label: label.name,
    kind: kind.Variable,
    insertText: label.name,
    range,
    sortText: completionSortText('loop', label.name),
    filterText: completionFilterText('loop', label.name),
    preselect: index === 0,
    commitCharacters: completionCommitCharacters('loop'),
    mooCompletionMetadata: { kind: 'loop' as const },
    ...(includeRichMetadata
      ? {
          detail: 'Loop label',
          documentation: 'Enclosing while label',
        }
      : {}),
  }));

  switch (context) {
    case 'error':
      return errors;
    case 'exception':
      return exceptionCodes;
    case 'loop-label':
      return loopLabelItems;
    case 'system-reference':
      return systemReferences;
    case 'verb':
      return createMooVerbCompletionItems(range, kind.Function);
    case 'default':
      return [
        ...localVariables,
        ...createMooBlockSnippetItems(range, snippetKind, snippetRule, includeRichMetadata),
        ...statements,
        ...variables,
        ...errors,
        ...functions,
      ];
  }
}

export function createMooCodeActionProvider(): MonacoEditor.languages.CodeActionProvider {
  return {
    provideCodeActions: (model, _range, context) => {
      const fixes = filterMooQuickFixesForRequestedKind(
        filterMooQuickFixesForMarkers(
          getMooQuickFixes(model.getValue(), quickFixDiagnosticsFromMarkers(context.markers)),
          context.markers,
        ),
        context.only,
      );

      return {
        actions: fixes.map((fix) => ({
          title: fix.title,
          kind: fix.kind ?? MOO_CODE_ACTION_QUICKFIX_KIND,
          isPreferred: true,
          diagnostics: fix.diagnostics.map(toCodeActionMarker),
          edit: {
            edits: mooQuickFixEdits(fix).map((edit) => ({
              resource: model.uri,
              textEdit: {
                range: edit.range,
                text: edit.text,
              },
              versionId: undefined,
            })),
          },
        })),
        dispose: () => {},
      };
    },
  };
}

function filterMooQuickFixesForRequestedKind(
  fixes: MooQuickFix[],
  requestedKind: string | undefined,
): MooQuickFix[] {
  if (!requestedKind) {
    return fixes;
  }

  return fixes.filter((fix) =>
    codeActionKindMatches((fix.kind ?? MOO_CODE_ACTION_QUICKFIX_KIND), requestedKind),
  );
}

function codeActionKindMatches(actionKind: string, requestedKind: string): boolean {
  return actionKind === requestedKind || actionKind.startsWith(`${requestedKind}.`);
}

function mooQuickFixEdits(fix: MooQuickFix): MooQuickFixEdit[] {
  return fix.edits ?? [fix.edit];
}

type MooQuickFixMarkerTarget = {
  code: string;
  endColumn: number;
  startColumn: number;
  startLineNumber: number;
};

function filterMooQuickFixesForMarkers(
  fixes: MooQuickFix[],
  markers: readonly MonacoEditor.editor.IMarkerData[],
): MooQuickFix[] {
  const targets = markers
    .map(toMooQuickFixMarkerTarget)
    .filter((target): target is MooQuickFixMarkerTarget => target !== null);

  if (targets.length === 0) {
    return fixes;
  }

  return fixes.filter((fix) =>
    fix.diagnostics.some((diagnostic) =>
      targets.some((target) => diagnosticMatchesMarkerTarget(diagnostic, target)),
    ),
  );
}

function toMooQuickFixMarkerTarget(
  marker: MonacoEditor.editor.IMarkerData,
): MooQuickFixMarkerTarget | null {
  const code = markerCode(marker.code);
  if (!code) {
    return null;
  }

  return {
    code,
    endColumn: marker.endColumn,
    startColumn: marker.startColumn,
    startLineNumber: marker.startLineNumber,
  };
}

function diagnosticMatchesMarkerTarget(
  diagnostic: MooQuickFixDiagnostic,
  target: MooQuickFixMarkerTarget,
): boolean {
  return (
    diagnostic.code === target.code &&
    diagnostic.lineNumber === target.startLineNumber &&
    diagnostic.startColumn === target.startColumn &&
    diagnostic.endColumn === target.endColumn
  );
}

function quickFixDiagnosticsFromMarkers(
  markers: readonly MonacoEditor.editor.IMarkerData[],
): MooQuickFixDiagnostic[] {
  return markers
    .map((marker): MooQuickFixDiagnostic | null => {
      const code = markerCode(marker.code);
      if (code !== 'missing-node') {
        return null;
      }

      return {
        code,
        lineNumber: marker.startLineNumber,
        startColumn: marker.startColumn,
        endColumn: marker.endColumn,
        message: marker.message,
        missingText: markerMissingText(marker),
      };
    })
    .filter((diagnostic): diagnostic is MooQuickFixDiagnostic => diagnostic !== null);
}

function markerCode(code: MonacoEditor.editor.IMarkerData['code']): string | null {
  if (typeof code === 'string') {
    return code;
  }

  return code?.value ?? null;
}

function markerMissingText(marker: MonacoEditor.editor.IMarkerData): string | undefined {
  if ('missingText' in marker && typeof marker.missingText === 'string') {
    return marker.missingText;
  }

  return undefined;
}

export function createMooCodeLensProvider(): MonacoEditor.languages.CodeLensProvider {
  return {
    provideCodeLenses: (model) => {
      const source = model.getValue();
      return {
        lenses: getMooCodeLenses(source).map((lens) => ({
          range: lens.range,
          command: {
            id: 'editor.action.showReferences',
            title: lens.title,
            tooltip: lens.tooltip,
            arguments: [
              model.uri,
              {
                lineNumber: lens.range.startLineNumber,
                column: lens.range.startColumn,
              },
              findMooReferences(source, {
                lineNumber: lens.range.startLineNumber,
                column: lens.range.startColumn,
              }).map((reference) => ({
                uri: model.uri,
                range: reference.range,
              })),
            ],
          },
        })),
        dispose: () => {},
      };
    },
  };
}

function toCodeActionMarker(diagnostic: MooQuickFixDiagnostic): MonacoEditor.editor.IMarkerData {
  const { relatedInformation: _relatedInformation, ...markerDiagnostic } = diagnostic;

  return {
    ...markerDiagnostic,
    severity: diagnostic.severity === 'warning' ? 4 : 8,
    startLineNumber: diagnostic.lineNumber,
    endLineNumber: diagnostic.lineNumber,
    source: MOO_LANGUAGE_ID,
  };
}

export function createMooCompletionProvider(monaco?: MonacoLike): CompletionProvider {
  return {
    triggerCharacters: ['.', ':', '$', 'E', '_'],
    provideCompletionItems: (model, position) => {
      if (isCompletionInMaskedSource(model.getValue(), position)) {
        return { suggestions: [] };
      }

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: createMooCompletionItems(
          range,
          monaco,
          getCompletionContext(model, position),
          getMooLocalCompletions(model.getValue(), position),
          getMooLoopLabelCompletions(model.getValue(), position),
          false,
        ),
      };
    },
    resolveCompletionItem: (item) => resolveMooCompletionItem(item),
  };
}

export function createMooDefinitionProvider(
  uriParser?: MooUriParser,
): MonacoEditor.languages.DefinitionProvider {
  return {
    provideDefinition: (model, position) => provideMooTargetLocation(model, position, uriParser),
  };
}

export function createMooDeclarationProvider(
  uriParser?: MooUriParser,
): MonacoEditor.languages.DeclarationProvider {
  return {
    provideDeclaration: (model, position) => provideMooTargetLocation(model, position, uriParser),
  };
}

export function createMooImplementationProvider(
  uriParser?: MooUriParser,
): MonacoEditor.languages.ImplementationProvider {
  return {
    provideImplementation: (model, position) =>
      provideMooTargetLocation(model, position, uriParser),
  };
}

export function createMooTypeDefinitionProvider(
  uriParser?: MooUriParser,
): MonacoEditor.languages.TypeDefinitionProvider {
  return {
    provideTypeDefinition: (model, position) =>
      provideMooTargetLocation(model, position, uriParser),
  };
}

function provideMooTargetLocation(
  model: TextModelValueLike,
  position: CompletionPosition,
  uriParser?: MooUriParser,
): MonacoEditor.languages.Location | null {
  const source = model.getValue();
  const definition = findMooDefinition(source, position);
  if (definition) {
    return { uri: model.uri as MonacoEditor.Uri, range: definition.range };
  }

  const link = findMooDocumentLinkAtPosition(source, position);
  if (link) {
    return { uri: toMooDefinitionUri(link.url, uriParser), range: link.range };
  }

  const builtin = findMooBuiltinAtPosition(source, position);
  return builtin ? { uri: toMooDefinitionUri(builtin.url, uriParser), range: builtin.range } : null;
}

function toMooDefinitionUri(uri: string, uriParser?: MooUriParser): MonacoEditor.Uri {
  return (uriParser?.Uri?.parse(uri) ?? uri) as MonacoEditor.Uri;
}

export function createMooDocumentHighlightProvider(
  documentHighlightKind: { Read: number; Write: number } = { Read: 1, Write: 2 },
): MonacoEditor.languages.DocumentHighlightProvider {
  return {
    provideDocumentHighlights: (model, position) => {
      const source = model.getValue();
      const semanticHighlights = findMooDocumentHighlights(source, position);
      if (semanticHighlights.length > 0) {
        return semanticHighlights.map((highlight) =>
          toMooDocumentHighlight(highlight, documentHighlightKind),
        );
      }

      return findMooDocumentLinkReferences(source, position).map((reference) => ({
        range: reference.range,
        kind: documentHighlightKind.Read,
      }));
    },
  };
}

function toMooDocumentHighlight(
  highlight: { range: MonacoRange; kind: 'read' | 'write' },
  documentHighlightKind: { Read: number; Write: number },
): MonacoEditor.languages.DocumentHighlight {
  return {
    range: highlight.range,
    kind: highlight.kind === 'write' ? documentHighlightKind.Write : documentHighlightKind.Read,
  };
}

type MooParser = (source: string) => Promise<MooTreeSitterParseResult>;

export function createMooDocumentSymbolProvider(
  monaco?: MonacoLike,
  parse: MooParser = parseMooCodeWithTreeSitter,
): DocumentSymbolProvider {
  const symbolKind = monaco?.languages.SymbolKind?.Function ?? 11;

  return {
    provideDocumentSymbols: async (model) => {
      const source = model.getValue();
      const symbols = await getParserStructure(source, parse, 'symbols');
      const structureSymbols = symbols ?? analyzeMooStructure(source).symbols;

      return structureSymbols.map((symbol) => toDocumentSymbol(symbol, symbolKind));
    },
  };
}

export function createMooFoldingRangeProvider(
  parse: MooParser = parseMooCodeWithTreeSitter,
): FoldingRangeProvider {
  return {
    provideFoldingRanges: async (model) => {
      const source = model.getValue();
      const foldingRanges = await getParserStructure(source, parse, 'foldingRanges');

      return foldingRanges ?? analyzeMooStructure(source).foldingRanges;
    },
  };
}

export function createMooDocumentFormattingEditProvider(): MonacoEditor.languages.DocumentFormattingEditProvider {
  return {
    provideDocumentFormattingEdits: (model, options) => {
      const source = model.getValue();
      const formatted = formatMooCode(source, {
        tabSize: options.tabSize,
        insertSpaces: options.insertSpaces,
      });

      if (formatted === source) {
        return [];
      }

      return [
        {
          range: fullModelRange(model as DocumentFormattingTextModelLike),
          text: formatted,
        },
      ];
    },
  };
}

export function createMooDocumentRangeFormattingEditProvider(): MonacoEditor.languages.DocumentRangeFormattingEditProvider {
  return {
    provideDocumentRangeFormattingEdits: (model, range, options) => {
      const edit = formatMooCodeRange(model.getValue(), range, {
        tabSize: options.tabSize,
        insertSpaces: options.insertSpaces,
      });

      return edit ? [edit] : [];
    },
  };
}

export function createMooOnTypeFormattingEditProvider(): MonacoEditor.languages.OnTypeFormattingEditProvider {
  return {
    autoFormatTriggerCharacters: [';', ')', ']', '}'],
    provideOnTypeFormattingEdits: (model, position, _character, options) => {
      const edit = formatMooCodeRange(
        model.getValue(),
        {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        {
          tabSize: options.tabSize,
          insertSpaces: options.insertSpaces,
        },
      );

      return edit ? [edit] : [];
    },
  };
}

export function createMooInlayHintsProvider(
  inlayHintKind: { Parameter: number } = { Parameter: 2 },
): MonacoEditor.languages.InlayHintsProvider {
  return {
    provideInlayHints: (model) => ({
      hints: collectMooInlayHints(model.getValue()).map((hint) => ({
        label: hint.label,
        position: {
          lineNumber: hint.lineNumber,
          column: hint.column,
        },
        kind: inlayHintKind.Parameter,
        paddingRight: true,
      })),
      dispose: () => {},
    }),
  };
}

export function createMooInlineCompletionsProvider(): MonacoEditor.languages.InlineCompletionsProvider {
  return {
    provideInlineCompletions: (model, position) => ({
      items: getMooInlineCompletions(model.getValue(), position),
      suppressSuggestions: false,
    }),
    disposeInlineCompletions: () => {},
  };
}

export function createMooLinkedEditingRangeProvider(): MonacoEditor.languages.LinkedEditingRangeProvider {
  return {
    provideLinkedEditingRanges: (model, position) =>
      getMooLinkedEditingRanges(model.getValue(), position),
  };
}

export function createMooLinkProvider(): MonacoEditor.languages.LinkProvider {
  return {
    provideLinks: (model) => ({
      links: getMooDocumentLinks(model.getValue()),
      dispose: () => {},
    }),
  };
}

export function createMooHoverProvider(): {
  provideHover: (
    model: TextModelValueLike,
    position: CompletionPosition,
    token?: unknown,
    context?: HoverContext,
  ) => Hover | null;
} {
  return {
    provideHover: (model, position, _token, context) =>
      withMooHoverVerbosity(getMooHover(model.getValue(), position), context),
  };
}

export function createMooReferenceProvider(): MonacoEditor.languages.ReferenceProvider {
  return {
    provideReferences: (model, position) => {
      const source = model.getValue();
      const semanticReferences = findMooReferences(source, position);
      const references =
        semanticReferences.length > 0
          ? semanticReferences
          : findMooDocumentLinkReferences(source, position);

      return references.map((reference) => ({
        uri: model.uri,
        range: reference.range,
      }));
    },
  };
}

export function createMooRenameProvider(): MonacoEditor.languages.RenameProvider {
  return {
    resolveRenameLocation: (model, position) => {
      const location = getMooRenameLocation(model.getValue(), position);
      if ('rejectReason' in location) {
        return {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: '',
          rejectReason: location.rejectReason,
        };
      }

      return location;
    },
    provideRenameEdits: (model, position, newName) => {
      const rename = createMooRenameWorkspaceEdit(model.getValue(), position, newName);
      if ('rejectReason' in rename) {
        return {
          edits: [],
          rejectReason: rename.rejectReason,
        };
      }

      return {
        edits: rename.edits.map((edit) => ({
          resource: model.uri,
          textEdit: {
            range: edit.range,
            text: edit.text,
          },
          versionId: undefined,
        })),
      };
    },
  };
}

export function createMooNewSymbolNameProvider(): MonacoEditor.languages.NewSymbolNamesProvider {
  return {
    supportsAutomaticNewSymbolNamesTriggerKind: Promise.resolve(true),
    provideNewSymbolNames: (model, range) =>
      getMooNewSymbolNameSuggestions(model.getValue(), range),
  };
}

export function createMooSelectionRangeProvider(): MonacoEditor.languages.SelectionRangeProvider {
  return {
    provideSelectionRanges: (model, positions) =>
      getMooSelectionRanges(model.getValue(), positions).map(flattenSelectionRange),
  };
}

export function createMooSemanticTokensProvider(): MonacoEditor.languages.DocumentSemanticTokensProvider {
  return {
    getLegend: () => MOO_SEMANTIC_TOKEN_LEGEND,
    provideDocumentSemanticTokens: (model) => encodeMooSemanticTokens(model.getValue()),
    releaseDocumentSemanticTokens: () => {},
  };
}

export function createMooDocumentRangeSemanticTokensProvider(): MonacoEditor.languages.DocumentRangeSemanticTokensProvider {
  return {
    getLegend: () => MOO_SEMANTIC_TOKEN_LEGEND,
    provideDocumentRangeSemanticTokens: (model, range) =>
      encodeMooSemanticTokensForRange(model.getValue(), range),
  };
}

export function createMooSignatureHelpProvider(): SignatureHelpProvider {
  return {
    signatureHelpTriggerCharacters: ['(', ','],
    signatureHelpRetriggerCharacters: [','],
    provideSignatureHelp: (model, position) => {
      const signatureHelp = getMooSignatureHelp(model.getValue(), position);
      if (!signatureHelp) {
        return null;
      }

      return {
        value: signatureHelp,
        dispose: () => {},
      };
    },
  };
}

export function registerMooLanguage(monaco: MonacoLike) {
  if (REGISTERED_MONACO_INSTANCES.has(monaco)) {
    return;
  }

  REGISTERED_MONACO_INSTANCES.add(monaco);

  const hasLanguage = monaco.languages
    .getLanguages()
    .some((language) => language.id === MOO_LANGUAGE_ID);
  if (!hasLanguage) {
    monaco.languages.register({ id: MOO_LANGUAGE_ID });
  }

  monaco.languages.setMonarchTokensProvider(MOO_LANGUAGE_ID, createMooMonarchLanguage());
  monaco.languages.setLanguageConfiguration(MOO_LANGUAGE_ID, createMooLanguageConfiguration());
  monaco.languages.registerCodeActionProvider?.(MOO_LANGUAGE_ID, createMooCodeActionProvider(), {
    providedCodeActionKinds: [
      monaco.languages.CodeActionKind?.QuickFix ?? MOO_CODE_ACTION_QUICKFIX_KIND,
      MOO_CODE_ACTION_FIX_ALL_KIND,
    ],
  });
  monaco.languages.registerCodeLensProvider?.(MOO_LANGUAGE_ID, createMooCodeLensProvider());
  monaco.languages.registerCompletionItemProvider(
    MOO_LANGUAGE_ID,
    createMooCompletionProvider(monaco),
  );
  monaco.languages.registerDeclarationProvider?.(
    MOO_LANGUAGE_ID,
    createMooDeclarationProvider(monaco),
  );
  monaco.languages.registerDefinitionProvider?.(
    MOO_LANGUAGE_ID,
    createMooDefinitionProvider(monaco),
  );
  monaco.languages.registerImplementationProvider?.(
    MOO_LANGUAGE_ID,
    createMooImplementationProvider(monaco),
  );
  monaco.languages.registerDocumentHighlightProvider?.(
    MOO_LANGUAGE_ID,
    createMooDocumentHighlightProvider(
      monaco.languages.DocumentHighlightKind ?? { Read: 1, Write: 2 },
    ),
  );
  monaco.languages.registerDocumentSymbolProvider?.(
    MOO_LANGUAGE_ID,
    createMooDocumentSymbolProvider(monaco),
  );
  monaco.languages.registerDocumentSemanticTokensProvider?.(
    MOO_LANGUAGE_ID,
    createMooSemanticTokensProvider(),
  );
  monaco.languages.registerDocumentRangeSemanticTokensProvider?.(
    MOO_LANGUAGE_ID,
    createMooDocumentRangeSemanticTokensProvider(),
  );
  monaco.languages.registerDocumentFormattingEditProvider?.(
    MOO_LANGUAGE_ID,
    createMooDocumentFormattingEditProvider(),
  );
  monaco.languages.registerDocumentRangeFormattingEditProvider?.(
    MOO_LANGUAGE_ID,
    createMooDocumentRangeFormattingEditProvider(),
  );
  monaco.languages.registerFoldingRangeProvider?.(MOO_LANGUAGE_ID, createMooFoldingRangeProvider());
  monaco.languages.registerInlineCompletionsProvider?.(
    MOO_LANGUAGE_ID,
    createMooInlineCompletionsProvider(),
  );
  monaco.languages.registerInlayHintsProvider?.(
    MOO_LANGUAGE_ID,
    createMooInlayHintsProvider(monaco.languages.InlayHintKind ?? { Parameter: 2 }),
  );
  monaco.languages.registerLinkedEditingRangeProvider?.(
    MOO_LANGUAGE_ID,
    createMooLinkedEditingRangeProvider(),
  );
  monaco.languages.registerLinkProvider?.(MOO_LANGUAGE_ID, createMooLinkProvider());
  monaco.languages.registerOnTypeFormattingEditProvider?.(
    MOO_LANGUAGE_ID,
    createMooOnTypeFormattingEditProvider(),
  );
  monaco.languages.registerReferenceProvider?.(MOO_LANGUAGE_ID, createMooReferenceProvider());
  monaco.languages.registerRenameProvider?.(MOO_LANGUAGE_ID, createMooRenameProvider());
  monaco.languages.registerNewSymbolNameProvider?.(
    MOO_LANGUAGE_ID,
    createMooNewSymbolNameProvider(),
  );
  monaco.languages.registerSelectionRangeProvider?.(
    MOO_LANGUAGE_ID,
    createMooSelectionRangeProvider(),
  );
  monaco.languages.registerSignatureHelpProvider?.(
    MOO_LANGUAGE_ID,
    createMooSignatureHelpProvider(),
  );
  monaco.languages.registerTypeDefinitionProvider?.(
    MOO_LANGUAGE_ID,
    createMooTypeDefinitionProvider(monaco),
  );
  monaco.languages.registerHoverProvider(MOO_LANGUAGE_ID, createMooHoverProvider());
}

type CompletionContext =
  | 'default'
  | 'error'
  | 'exception'
  | 'loop-label'
  | 'system-reference'
  | 'verb';

type CompletionSortTier =
  | 'local'
  | 'loop'
  | 'system'
  | 'exception'
  | 'snippet'
  | 'keyword'
  | 'variable'
  | 'error'
  | 'function';

const COMPLETION_SORT_PREFIX: Record<CompletionSortTier, string> = {
  local: '00',
  loop: '00',
  system: '00',
  exception: '00',
  snippet: '02',
  keyword: '03',
  variable: '04',
  error: '05',
  function: '06',
};
const VALUE_COMPLETION_COMMIT_CHARACTERS = ['.', ':', '[', ',', ')', ']', ';'];
const LOOP_LABEL_COMPLETION_COMMIT_CHARACTERS = [';'];
const ERROR_COMPLETION_COMMIT_CHARACTERS = [',', ')', ';', '|'];
const EXCEPTION_COMPLETION_COMMIT_CHARACTERS = [',', ')'];
const VERB_COMPLETION_COMMIT_CHARACTERS = ['('];

function getCompletionContext(
  model: CompletionTextModelLike,
  position: CompletionPosition,
): CompletionContext {
  const linePrefix = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
  const currentWord = model.getWordUntilPosition(position).word;

  if (/\bE_[A-Za-z_]*$/.test(linePrefix)) {
    return 'error';
  }

  if (isExceptionCompletionContext(linePrefix)) {
    return 'exception';
  }

  if (/\b(?:break|continue)\s+[A-Za-z_]*$/i.test(linePrefix)) {
    return 'loop-label';
  }

  if (currentWord.startsWith('$') || /\$[A-Za-z_]*$/.test(linePrefix)) {
    return 'system-reference';
  }

  if (/:[A-Za-z_]*$/.test(linePrefix)) {
    return 'verb';
  }

  return 'default';
}

function isExceptionCompletionContext(linePrefix: string): boolean {
  if (EXCEPT_COMPLETION_PATTERN.test(linePrefix)) {
    return !isAtExpressionExceptionSelectorCompletion(linePrefix, linePrefix.lastIndexOf('(') + 1);
  }

  return CATCH_COMPLETION_PATTERN.test(linePrefix);
}

function isAtExpressionExceptionSelectorCompletion(
  linePrefix: string,
  selectorListStart: number,
): boolean {
  const segmentStart = Math.max(selectorListStart, linePrefix.lastIndexOf(',') + 1);
  return linePrefix.slice(segmentStart).trimStart().startsWith('@');
}

function isCompletionInMaskedSource(source: string, position: CompletionPosition): boolean {
  const masked = maskMooSource(source);
  const lineStartOffset = offsetAtMooPosition(source, {
    lineNumber: position.lineNumber,
    column: 1,
  });
  const cursorOffset = offsetAtMooPosition(source, position);
  const originalPrefix = source.slice(lineStartOffset, cursorOffset);
  const maskedPrefix = masked.slice(lineStartOffset, cursorOffset);

  for (let index = originalPrefix.length - 1; index >= 0; index -= 1) {
    if (/\s/.test(originalPrefix[index])) {
      continue;
    }

    return maskedPrefix[index] === ' ';
  }

  return false;
}

async function getParserStructure<K extends keyof MooTreeSitterParseResult['structure']>(
  source: string,
  parse: MooParser,
  key: K,
): Promise<MooTreeSitterParseResult['structure'][K] | null> {
  try {
    const parsed = await parse(source);
    const values = parsed.structure[key];

    return values.length > 0 ? values : null;
  } catch {
    return null;
  }
}

function toDocumentSymbol(symbol: MooStructureSymbol, kind: number): DocumentSymbol {
  return {
    name: symbol.name,
    detail: isMooClauseSymbol(symbol) ? 'MOO clause' : 'MOO block',
    kind,
    tags: [],
    range: symbol.range,
    selectionRange: symbol.selectionRange,
    children: symbol.children.map((child) => toDocumentSymbol(child, kind)),
  };
}

function isMooClauseSymbol(symbol: MooStructureSymbol): boolean {
  return ['elseif', 'else', 'except', 'finally'].includes(symbol.blockKind);
}

function fullModelRange(model: DocumentFormattingTextModelLike): MonacoRange {
  const lastLineNumber = model.getLineCount();

  return {
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: lastLineNumber,
    endColumn: model.getLineMaxColumn(lastLineNumber),
  };
}

function flattenSelectionRange(
  selectionRange: MooSelectionRange,
): MonacoEditor.languages.SelectionRange[] {
  const ranges: MonacoEditor.languages.SelectionRange[] = [];
  let current: MooSelectionRange | undefined = selectionRange;

  while (current) {
    ranges.push({ range: current.range });
    current = current.parent;
  }

  return ranges;
}

function withMooHoverVerbosity(hover: Hover | null, context?: HoverContext): Hover | null {
  if (!hover) {
    return null;
  }

  const verbosityDelta = context?.verbosityRequest?.verbosityDelta ?? 0;
  if (verbosityDelta > 0) {
    return {
      ...hover,
      contents: hover.contents.map((content) => ({
        value: `${content.value}\n\n---\n**MOO hover detail**\n\n- Token range: ${formatHoverRange(
          hover.range,
        )}\n- Source: ToastStunt/MOO language metadata.`,
      })),
      canIncreaseVerbosity: false,
      canDecreaseVerbosity: true,
    };
  }

  return {
    ...hover,
    canIncreaseVerbosity: true,
    canDecreaseVerbosity: false,
  };
}

function formatHoverRange(range: MonacoRange | undefined): string {
  if (!range) {
    return 'current cursor position';
  }

  if (range.startLineNumber === range.endLineNumber) {
    return `line ${range.startLineNumber}, columns ${range.startColumn}-${range.endColumn}`;
  }

  return `line ${range.startLineNumber}, column ${range.startColumn} to line ${range.endLineNumber}, column ${range.endColumn}`;
}

const BUILTIN_SNIPPETS: Partial<Record<(typeof BUILTIN_FUNCTIONS)[number], string>> = {
  add_property: `add_property(${placeholder(1, 'object')}, ${placeholder(2, 'property')}, ${placeholder(3, 'value')}, ${placeholder(4, 'info')})`,
  add_verb: `add_verb(${placeholder(1, 'object')}, ${placeholder(2, 'info')}, ${placeholder(3, 'args')})`,
  eval: `eval(${placeholder(1, 'code')})`,
  forked: 'forked()',
  length: `length(${placeholder(1, 'value')})`,
  listappend: `listappend(${placeholder(1, 'list')}, ${placeholder(2, 'value')})`,
  listdelete: `listdelete(${placeholder(1, 'list')}, ${placeholder(2, 'index')})`,
  listinsert: `listinsert(${placeholder(1, 'list')}, ${placeholder(2, 'value')}, ${placeholder(3, 'index')})`,
  listset: `listset(${placeholder(1, 'list')}, ${placeholder(2, 'value')}, ${placeholder(3, 'index')})`,
  match: `match(${placeholder(1, 'string')}, ${placeholder(2, 'pattern')})`,
  move: `move(${placeholder(1, 'object')}, ${placeholder(2, 'destination')})`,
  notify: `notify(${placeholder(1, 'player')}, ${placeholder(2, 'text')})`,
  pass: 'pass($1)',
  property_info: `property_info(${placeholder(1, 'object')}, ${placeholder(2, 'property')})`,
  raise: `raise(${placeholder(1, 'error')}, ${placeholder(2, 'message')})`,
  random: `random(${placeholder(1, 'max')})`,
  read: `read(${placeholder(1, 'player')})`,
  set_verb_code: `set_verb_code(${placeholder(1, 'object')}, ${placeholder(2, 'verb')}, ${placeholder(3, 'code')})`,
  suspend: `suspend(${placeholder(1, 'seconds')})`,
  toliteral: `toliteral(${placeholder(1, 'value')})`,
  tostr: `tostr(${placeholder(1, 'value')})`,
  valid: `valid(${placeholder(1, 'object')})`,
  verb_code: `verb_code(${placeholder(1, 'object')}, ${placeholder(2, 'verb')})`,
  verb_info: `verb_info(${placeholder(1, 'object')}, ${placeholder(2, 'verb')})`,
};

const BLOCK_SNIPPETS = [
  {
    label: 'if block',
    insertText: `if (${placeholder(1, 'condition')})\n  ${tabstop(0)}\nendif`,
    documentation: 'Insert an if/endif block.',
  },
  {
    label: 'if/else',
    insertText: `if (${placeholder(1, 'condition')})\n  ${placeholder(2, 'then')}\nelse\n  ${tabstop(0)}\nendif`,
    documentation: 'Insert an if/else/endif block.',
  },
  {
    label: 'for list',
    insertText: `for ${placeholder(1, 'item')} in (${placeholder(2, 'list')})\n  ${tabstop(0)}\nendfor`,
    documentation: 'Insert a for/endfor loop over a list expression.',
  },
  {
    label: 'for range',
    insertText: `for ${placeholder(1, 'index')} in [${placeholder(2, 'start')}..${placeholder(3, 'end')}]\n  ${tabstop(0)}\nendfor`,
    documentation: 'Insert a for/endfor loop over an inclusive range.',
  },
  {
    label: 'while block',
    insertText: `while (${placeholder(1, 'condition')})\n  ${tabstop(0)}\nendwhile`,
    documentation: 'Insert a while/endwhile loop.',
  },
  {
    label: 'fork block',
    insertText: `fork ${placeholder(1, 'task')} (${placeholder(2, 'seconds')})\n  ${tabstop(0)}\nendfork`,
    documentation: 'Insert a fork/endfork task block.',
  },
  {
    label: 'try/except',
    insertText: `try\n  ${tabstop(1)}\nexcept (${placeholder(2, 'any')})\n  ${tabstop(0)}\nendtry`,
    documentation: 'Insert a try/except/endtry handler.',
  },
  {
    label: 'try/finally',
    insertText: `try\n  ${placeholder(1, 'body')}\nfinally\n  ${tabstop(0)}\nendtry`,
    documentation: 'Insert a try/finally/endtry cleanup block.',
  },
] as const;

function createMooBlockSnippetItems(
  range: MonacoRange,
  kind: number,
  insertTextRules: number | undefined,
  includeRichMetadata = true,
): CompletionItem[] {
  return BLOCK_SNIPPETS.map((snippet) => ({
    label: snippet.label,
    kind,
    insertText: snippet.insertText,
    insertTextRules,
    range,
    sortText: completionSortText('snippet', snippet.label),
    ...(includeRichMetadata
      ? {
          detail: 'MOO block snippet',
          documentation: snippet.documentation,
        }
      : {}),
  }));
}

function createMooVerbCompletionItems(range: MonacoRange, kind: number): CompletionItem[] {
  return BUILTIN_FUNCTIONS.map((name) => ({
    label: name,
    kind,
    detail: 'MOO verb name',
    insertText: name,
    documentation: 'Complete a static MOO verb-call name.',
    range,
    sortText: completionSortText('function', name),
    filterText: completionFilterText('function', name),
    commitCharacters: VERB_COMPLETION_COMMIT_CHARACTERS,
  }));
}

function resolveMooCompletionItem(item: CompletionItem): CompletionItem {
  const semanticDocumentation = resolveMooSemanticCompletionDocumentation(item);
  if (semanticDocumentation) {
    return {
      ...item,
      detail: item.detail ?? semanticDocumentation.detail,
      documentation: item.documentation ?? semanticDocumentation.documentation,
    };
  }

  const builtinDocumentation = resolveMooBuiltinCompletionDocumentation(item.label);
  if (builtinDocumentation) {
    return {
      ...item,
      detail: item.detail ?? builtinDocumentation.detail,
      documentation: item.documentation ?? builtinDocumentation.documentation,
    };
  }

  const snippetDocumentation = resolveMooSnippetCompletionDocumentation(item.label);
  if (snippetDocumentation) {
    return {
      ...item,
      detail: item.detail ?? snippetDocumentation.detail,
      documentation: item.documentation ?? snippetDocumentation.documentation,
    };
  }

  const catalogDocumentation = resolveMooCatalogCompletionDocumentation(item.label);
  if (catalogDocumentation) {
    return {
      ...item,
      detail: item.detail ?? catalogDocumentation.detail,
      documentation: item.documentation ?? catalogDocumentation.documentation,
    };
  }

  return item;
}

function resolveMooSemanticCompletionDocumentation(
  item: CompletionItem,
): { detail: string; documentation: string } | null {
  switch (item.mooCompletionMetadata?.kind) {
    case 'local':
      return {
        detail: 'Local variable',
        documentation: 'MOO local variable',
      };
    case 'loop':
      return {
        detail: 'Loop label',
        documentation: 'Enclosing while label',
      };
    case undefined:
      return null;
  }
}

function resolveMooBuiltinCompletionDocumentation(
  label: string,
): { detail: string; documentation: string } | null {
  if (!BUILTIN_FUNCTIONS.includes(label as (typeof BUILTIN_FUNCTIONS)[number])) {
    return null;
  }

  const builtinSignature = getMooBuiltinSignature(label);

  return {
    detail: builtinSignature?.label ?? 'ToastStunt builtin function',
    documentation: builtinSignature?.documentation ?? 'ToastStunt builtin function',
  };
}

function resolveMooSnippetCompletionDocumentation(
  label: string,
): { detail: string; documentation: string } | null {
  const snippet = BLOCK_SNIPPETS.find((candidate) => candidate.label === label);
  if (!snippet) {
    return null;
  }

  return {
    detail: 'MOO block snippet',
    documentation: snippet.documentation,
  };
}

function resolveMooCatalogCompletionDocumentation(
  label: string,
): { detail: string; documentation: string } | null {
  if (STATEMENT_KEYWORDS.includes(label as (typeof STATEMENT_KEYWORDS)[number])) {
    return {
      detail: 'MOO statement keyword',
      documentation: getMooKeywordDocumentation(label) ?? 'MOO statement keyword',
    };
  }

  if (BUILTIN_VARIABLES.includes(label as (typeof BUILTIN_VARIABLES)[number])) {
    return {
      detail: 'Builtin variable',
      documentation: getMooBuiltinVariableDocumentation(label) ?? 'MOO builtin variable',
    };
  }

  if (ERROR_CONSTANTS.includes(label as (typeof ERROR_CONSTANTS)[number])) {
    return {
      detail: 'MOO error constant',
      documentation: getMooErrorDocumentation(label) ?? 'MOO error constant',
    };
  }

  if (SYSTEM_REFERENCES.includes(label as (typeof SYSTEM_REFERENCES)[number])) {
    return {
      detail: 'System object reference',
      documentation: 'MOO system object reference',
    };
  }

  if (label === 'any') {
    return {
      detail: 'MOO exception selector',
      documentation: 'Matches any raised MOO exception.',
    };
  }

  if (label === 'error') {
    return {
      detail: 'MOO exception selector',
      documentation: 'Matches a generic MOO error value.',
    };
  }

  return null;
}

function completionSortText(tier: CompletionSortTier, label: string): string {
  return `${COMPLETION_SORT_PREFIX[tier]}_${tier}_${label.toLowerCase()}`;
}

function completionFilterText(tier: CompletionSortTier, label: string): string {
  switch (tier) {
    case 'error':
      return `${label} ${label.replace(/^E_/, '')}`;
    case 'system':
      return `${label} ${label.slice(1)}`;
    case 'exception':
    case 'function':
    case 'keyword':
    case 'local':
    case 'loop':
    case 'snippet':
    case 'variable':
      return label;
  }
}

function completionCommitCharacters(tier: CompletionSortTier): string[] | undefined {
  switch (tier) {
    case 'local':
    case 'system':
    case 'variable':
      return VALUE_COMPLETION_COMMIT_CHARACTERS;
    case 'loop':
      return LOOP_LABEL_COMPLETION_COMMIT_CHARACTERS;
    case 'error':
      return ERROR_COMPLETION_COMMIT_CHARACTERS;
    case 'exception':
      return EXCEPTION_COMPLETION_COMMIT_CHARACTERS;
    case 'function':
    case 'keyword':
    case 'snippet':
      return undefined;
  }
}

function placeholder(index: number, name: string): string {
  return `\${${index}:${name}}`;
}

function tabstop(index: number): string {
  return `$${index}`;
}

function createMooBuiltinSnippet(name: string): string {
  const metadata = getMooBuiltinMetadata(name);
  if (!metadata) {
    return `${name}($1)`;
  }

  const parameterCount = metadata.maxArgs >= 0 ? metadata.maxArgs : metadata.minArgs;
  if (parameterCount === 0) {
    return `${name}()`;
  }

  const parameters = Array.from({ length: parameterCount }, (_, index) => {
    const label = getMooBuiltinParameterLabel(name, index);
    const optionalMarker = index >= metadata.minArgs ? '?' : '';

    return placeholder(index + 1, `${label}${optionalMarker}`);
  });

  return `${name}(${parameters.join(', ')})`;
}
