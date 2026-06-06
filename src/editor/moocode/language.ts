export const MOO_LANGUAGE_ID = 'moocode';
const PLAINTEXT_LANGUAGE_ID = 'plaintext';

export const MOO_SESSION_TYPES = ['moo-code', 'moocode', 'lambdamoo'] as const;

export const STATEMENT_KEYWORDS = [
  'if',
  'else',
  'elseif',
  'endif',
  'for',
  'in',
  'endfor',
  'fork',
  'endfork',
  'return',
  'while',
  'endwhile',
  'try',
  'except',
  'finally',
  'endtry',
  'ANY',
  'break',
  'continue',
] as const;

export const OPERATOR_WORDS = ['and', 'or', 'bitor', 'bitand', 'bitxor'] as const;

export const ERROR_CONSTANTS = [
  'E_NONE',
  'E_TYPE',
  'E_DIV',
  'E_PERM',
  'E_PROPNF',
  'E_VERBNF',
  'E_VARNF',
  'E_INVIND',
  'E_RECMOVE',
  'E_MAXREC',
  'E_RANGE',
  'E_ARGS',
  'E_NACC',
  'E_INVARG',
  'E_QUOTA',
  'E_FLOAT',
  'E_FILE',
  'E_EXEC',
  'E_INTRPT',
] as const;

export const BUILTIN_VARIABLES = [
  'player',
  'this',
  'caller',
  'verb',
  'args',
  'argstr',
  'dobj',
  'dobjstr',
  'prepstr',
  'iobj',
  'iobjstr',
] as const;

export const BUILTIN_FUNCTIONS = [
  'abs',
  'add_property',
  'add_verb',
  'all_members',
  'ancestors',
  'boot_player',
  'callers',
  'caller_perms',
  'children',
  'chparent',
  'chparents',
  'clear_property',
  'connected_players',
  'connected_seconds',
  'connection_info',
  'connection_name',
  'connection_options',
  'ctime',
  'decode_binary',
  'delete_property',
  'delete_verb',
  'descendants',
  'dump_database',
  'equal',
  'eval',
  'explode',
  'floatstr',
  'forked',
  'function_info',
  'idle_seconds',
  'index',
  'is_clear_property',
  'is_member',
  'is_player',
  'isa',
  'length',
  'listappend',
  'listdelete',
  'listinsert',
  'listset',
  'listeners',
  'listen',
  'match',
  'max',
  'max_object',
  'memory_usage',
  'min',
  'move',
  'notify',
  'object_bytes',
  'open_network_connection',
  'parent',
  'parents',
  'pass',
  'players',
  'properties',
  'property_info',
  'queue_info',
  'queued_tasks',
  'raise',
  'random',
  'read',
  'recycled_objects',
  'resume',
  'rindex',
  'rmatch',
  'seconds_left',
  'server_log',
  'server_version',
  'set_player_flag',
  'set_property_info',
  'set_task_perms',
  'set_verb_args',
  'set_verb_code',
  'set_verb_info',
  'setadd',
  'setremove',
  'shutdown',
  'sort',
  'strcmp',
  'strsub',
  'substitute',
  'suspend',
  'task_id',
  'task_perms',
  'task_stack',
  'ticks_left',
  'time',
  'tofloat',
  'toint',
  'toliteral',
  'toobj',
  'tostr',
  'typeof',
  'unlisten',
  'valid',
  'value_bytes',
  'verb_args',
  'verb_code',
  'verb_info',
  'verbs',
] as const;

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
    getLanguages: () => Array<{ id: string }>;
    register: (language: { id: string }) => void;
    registerCompletionItemProvider: (
      languageId: string,
      provider: {
        triggerCharacters?: string[];
        provideCompletionItems: () => CompletionList;
      },
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
      ['if', 'endif'],
      ['for', 'endfor'],
      ['while', 'endwhile'],
      ['fork', 'endfork'],
      ['try', 'endtry'],
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
        /^\s*(?:if|elseif|else|for|while|fork|try|except|finally)\b(?!.*\b(?:endif|endfor|endwhile|endfork|endtry)\b).*$/i,
      decreaseIndentPattern:
        /^\s*(?:elseif|else|except|finally|endif|endfor|endwhile|endfork|endtry)\b/i,
    },
  };
}

export function createMooCompletionItems(
  range: MonacoRange,
  monaco?: MonacoLike,
): CompletionItem[] {
  const kind = monaco?.languages.CompletionItemKind ?? {
    Constant: 14,
    Function: 1,
    Keyword: 17,
    Variable: 4,
  };
  const snippetRule = monaco?.languages.CompletionItemInsertTextRule.InsertAsSnippet;

  return [
    ...STATEMENT_KEYWORDS.map((keyword) => ({
      label: keyword,
      kind: kind.Keyword,
      insertText: keyword,
      documentation: 'MOO statement keyword',
      range,
    })),
    ...BUILTIN_VARIABLES.map((variable) => ({
      label: variable,
      kind: kind.Variable,
      insertText: variable,
      documentation: 'MOO builtin variable',
      range,
    })),
    ...ERROR_CONSTANTS.map((error) => ({
      label: error,
      kind: kind.Constant,
      insertText: error,
      documentation: 'MOO error constant',
      range,
    })),
    ...BUILTIN_FUNCTIONS.map((name) => {
      const signature = BUILTIN_SNIPPETS[name] ?? `${name}($1)`;

      return {
        label: name,
        kind: kind.Function,
        insertText: signature,
        insertTextRules: snippetRule,
        documentation: 'ToastStunt builtin function',
        range,
      };
    }),
  ];
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
  monaco.languages.registerCompletionItemProvider(MOO_LANGUAGE_ID, {
    triggerCharacters: ['.', ':', '$', 'E', '_'],
    provideCompletionItems: () => ({
      suggestions: createMooCompletionItems(DEFAULT_COMPLETION_RANGE, monaco),
    }),
  });
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

const DEFAULT_COMPLETION_RANGE: MonacoRange = {
  startLineNumber: 1,
  startColumn: 1,
  endLineNumber: 1,
  endColumn: 1,
};

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
