export {
  BUILTIN_FUNCTIONS,
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  MOO_LANGUAGE_ID,
  MOO_SESSION_TYPES,
  OPERATOR_WORDS,
  PLAINTEXT_LANGUAGE_ID,
  STATEMENT_KEYWORDS,
} from './contract';
import {
  BUILTIN_FUNCTIONS,
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  MOO_BLOCKS,
  MOO_INDENT_OPEN_KEYWORDS,
  MOO_LANGUAGE_ID,
  MOO_SESSION_TYPES,
  OPERATOR_WORDS,
  PLAINTEXT_LANGUAGE_ID,
  STATEMENT_KEYWORDS,
} from './contract';
import { analyzeMooStructure, type MooStructureSymbol } from './structure';

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
  insertText: string;
  insertTextRules?: number;
  documentation: string;
  range: MonacoRange;
};

type CompletionList = {
  suggestions: CompletionItem[];
};

type Hover = {
  contents: Array<{ value: string }>;
};

type TextModelLike = {
  getWordAtPosition(position: unknown): { word: string } | null;
};

type TextModelValueLike = {
  getValue(): string;
};

type CompletionTextModelLike = {
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
  provideDocumentSymbols: (model: TextModelValueLike) => DocumentSymbol[];
};

type FoldingRange = {
  start: number;
  end: number;
};

type FoldingRangeProvider = {
  provideFoldingRanges: (model: TextModelValueLike) => FoldingRange[];
};

export type MonacoLike = {
  languages: {
    CompletionItemInsertTextRule: {
      InsertAsSnippet: number;
    };
    CompletionItemKind: {
      Constant: number;
      Function: number;
      Keyword: number;
      Variable: number;
    };
    SymbolKind?: {
      Function: number;
    };
    getLanguages: () => Array<{ id: string }>;
    register: (language: { id: string }) => void;
    registerCompletionItemProvider: (
      languageId: string,
      provider: CompletionProvider,
    ) => { dispose: () => void };
    registerDocumentSymbolProvider?: (
      languageId: string,
      provider: DocumentSymbolProvider,
    ) => { dispose: () => void };
    registerFoldingRangeProvider?: (
      languageId: string,
      provider: FoldingRangeProvider,
    ) => { dispose: () => void };
    registerHoverProvider: (
      languageId: string,
      provider: {
        provideHover: (model: TextModelLike, position: unknown) => Hover | null;
      },
    ) => { dispose: () => void };
    setLanguageConfiguration: (languageId: string, config: MooLanguageConfiguration) => void;
    setMonarchTokensProvider: (languageId: string, language: MooMonarchLanguage) => void;
  };
};

const REGISTERED_MONACO_INSTANCES = new WeakSet<object>();

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
          /[a-zA-Z_][\w$]*/,
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
        [/\$[a-zA-Z_][\w$]*/, 'variable.predefined'],
        [/#-?\d+/, 'number.object'],
        [/\d+\.\d+(?:[eE][+-]?\d+)?/, 'number.float'],
        [/\d+(?:[eE][+-]?\d+)?/, 'number'],
        [/\/\/.*$/, 'comment'],
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
    },
  };
}

export function createMooLanguageConfiguration(): MooLanguageConfiguration {
  return {
    comments: {
      lineComment: '//',
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
      ...Object.entries(MOO_BLOCKS).map(
        ([open, block]) => [open, block.close] as [string, string],
      ),
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
      increaseIndentPattern:
        new RegExp(
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
): CompletionItem[] {
  const kind = monaco?.languages.CompletionItemKind ?? {
    Constant: 14,
    Function: 1,
    Keyword: 17,
    Variable: 4,
  };
  const snippetRule = monaco?.languages.CompletionItemInsertTextRule.InsertAsSnippet;

  const statements = STATEMENT_KEYWORDS.map((keyword) => ({
    label: keyword,
    kind: kind.Keyword,
    insertText: keyword,
    documentation: 'MOO statement keyword',
    range,
  }));
  const variables = BUILTIN_VARIABLES.map((variable) => ({
    label: variable,
    kind: kind.Variable,
    insertText: variable,
    documentation: 'MOO builtin variable',
    range,
  }));
  const errors = ERROR_CONSTANTS.map((error) => ({
    label: error,
    kind: kind.Constant,
    insertText: error,
    documentation: 'MOO error constant',
    range,
  }));
  const systemReferences = SYSTEM_REFERENCES.map((reference) => ({
    label: reference,
    kind: kind.Variable,
    insertText: reference,
    documentation: 'MOO system object reference',
    range,
  }));
  const functions = BUILTIN_FUNCTIONS.map((name) => {
    const signature = BUILTIN_SNIPPETS[name] ?? `${name}($1)`;

    return {
      label: name,
      kind: kind.Function,
      insertText: signature,
      insertTextRules: snippetRule,
      documentation: 'ToastStunt builtin function',
      range,
    };
  });

  switch (context) {
    case 'error':
      return errors;
    case 'system-reference':
      return systemReferences;
    case 'verb':
      return functions;
    case 'default':
      return [...statements, ...variables, ...errors, ...functions];
  }
}

export function createMooCompletionProvider(monaco?: MonacoLike): CompletionProvider {
  return {
    triggerCharacters: ['.', ':', '$', 'E', '_'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: createMooCompletionItems(range, monaco, getCompletionContext(model, position)),
      };
    },
  };
}

export function createMooDocumentSymbolProvider(monaco?: MonacoLike): DocumentSymbolProvider {
  const symbolKind = monaco?.languages.SymbolKind?.Function ?? 11;

  return {
    provideDocumentSymbols: (model) =>
      analyzeMooStructure(model.getValue()).symbols.map((symbol) =>
        toDocumentSymbol(symbol, symbolKind),
      ),
  };
}

export function createMooFoldingRangeProvider(): FoldingRangeProvider {
  return {
    provideFoldingRanges: (model) => analyzeMooStructure(model.getValue()).foldingRanges,
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
  monaco.languages.registerCompletionItemProvider(MOO_LANGUAGE_ID, createMooCompletionProvider(monaco));
  monaco.languages.registerDocumentSymbolProvider?.(
    MOO_LANGUAGE_ID,
    createMooDocumentSymbolProvider(monaco),
  );
  monaco.languages.registerFoldingRangeProvider?.(MOO_LANGUAGE_ID, createMooFoldingRangeProvider());
  monaco.languages.registerHoverProvider(MOO_LANGUAGE_ID, {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position)?.word;
      if (!word) {
        return null;
      }

      const value = HOVER_TEXT[word];
      if (!value) {
        return null;
      }

      return {
        contents: [{ value }],
      };
    },
  });
}

type CompletionContext = 'default' | 'error' | 'system-reference' | 'verb';

const SYSTEM_REFERENCES = [
  '$login',
  '$local',
  '$network',
  '$player',
  '$room',
  '$string_utils',
  '$telnet_utils',
  '$utils',
  '$wiz',
] as const;

function getCompletionContext(
  model: CompletionTextModelLike,
  position: CompletionPosition,
): CompletionContext {
  const linePrefix = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
  const currentWord = model.getWordUntilPosition(position).word;

  if (/\bE_[A-Za-z_]*$/.test(linePrefix)) {
    return 'error';
  }

  if (currentWord.startsWith('$') || /\$[A-Za-z_]*$/.test(linePrefix)) {
    return 'system-reference';
  }

  if (/:\(?[A-Za-z_]*$/.test(linePrefix)) {
    return 'verb';
  }

  return 'default';
}

function toDocumentSymbol(symbol: MooStructureSymbol, kind: number): DocumentSymbol {
  return {
    name: symbol.name,
    detail: 'MOO block',
    kind,
    tags: [],
    range: symbol.range,
    selectionRange: symbol.selectionRange,
    children: symbol.children.map((child) => toDocumentSymbol(child, kind)),
  };
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

function placeholder(index: number, name: string): string {
  return `\${${index}:${name}}`;
}

const HOVER_TEXT: Record<string, string> = {
  player: 'The player whose command started this task.',
  this: 'The object whose verb is executing.',
  caller: 'The object or verb that called this verb.',
  args: 'The list of arguments supplied to the verb.',
  notify: '`notify(player, text)` sends text to a connected player.',
  pass: '`pass(...)` calls the inherited verb implementation.',
  valid: '`valid(object)` returns whether an object reference is valid.',
};
