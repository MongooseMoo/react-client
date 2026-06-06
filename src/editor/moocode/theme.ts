import type * as MonacoEditor from 'monaco-editor';

/**
 * Name the MOO editor theme is registered under. Pass this as the Monaco
 * `theme` prop so the editor uses our dark palette instead of the default
 * light `vs` theme.
 */
export const MOO_EDITOR_THEME_NAME = 'mongoose-moo-dark';

/**
 * Editor surface colors. These mirror the app's design tokens in `App.css`
 * (`--color-bg`, `--color-text`, accents). The editor runs on its own route
 * that does not load App.css, so the values are restated here on purpose.
 */
const EDITOR_BACKGROUND = '#14141a';
const EDITOR_FOREGROUND = '#e8e8ed';

/**
 * Rich, dedicated syntax palette tuned for legibility on the dark editor
 * surface. Each hue carries meaning: keywords vs operators vs builtins vs
 * builtin variables / system references vs numbers vs object numbers, etc.
 * Every foreground here is contrast-checked against EDITOR_BACKGROUND in
 * theme.test.ts.
 */
export const MOO_SYNTAX_COLORS = {
  keyword: '#ff7ab2', // statement keywords: if / while / for / try ...
  operator: '#89ddff', // word + symbolic operators: and / or / not / in / + - = ...
  builtinFunction: '#82aaff', // predefined builtins: notify(), valid() ...
  builtinVariable: '#c792ea', // me / this_player / caller and $system references
  errorConstant: '#ffb86c', // E_INVARG / E_TYPE / E_PERM ...
  number: '#f78c6c', // integers and floats
  objectNumber: '#ffcb6b', // #123 object references
  comment: '#8b97ad', // // line and /* block */ comments
  string: '#c3e88d', // "string literals"
  stringEscape: '#5ccfe6', // \n \t \" escape sequences
  stringEscapeInvalid: '#ff5370', // malformed escapes
  delimiter: '#abb2bf', // ; , .
  type: '#5ccfe6', // semantic type tokens
  variable: EDITOR_FOREGROUND, // semantic local variables (plain identifiers)
} as const;

/**
 * Token-coloring rules. Monaco matches theme rules against token scopes by
 * dotted prefix, and MOO monarch tokens carry a `.moo` postfix — so a rule for
 * `keyword` also colors `keyword.moo`, and `number` covers `number.float.moo`.
 * Both the monarch token names and the standard scopes that semantic tokens map
 * to (e.g. `entity.name.function`, `variable`, `type`) are listed so both
 * tokenization paths land on the same palette.
 */
export function createMooThemeRules(): MonacoEditor.editor.ITokenThemeRule[] {
  const c = MOO_SYNTAX_COLORS;

  return [
    { token: 'keyword', foreground: c.keyword, fontStyle: 'bold' },
    { token: 'operator', foreground: c.operator },
    { token: 'predefined', foreground: c.builtinFunction },
    { token: 'variable.predefined', foreground: c.builtinVariable },
    { token: 'constant.language.error', foreground: c.errorConstant, fontStyle: 'bold' },
    { token: 'number', foreground: c.number },
    { token: 'number.float', foreground: c.number },
    { token: 'number.object', foreground: c.objectNumber },
    { token: 'comment', foreground: c.comment, fontStyle: 'italic' },
    { token: 'string', foreground: c.string },
    { token: 'string.quote', foreground: c.string },
    { token: 'string.escape', foreground: c.stringEscape },
    { token: 'string.escape.invalid', foreground: c.stringEscapeInvalid, fontStyle: 'underline' },
    { token: 'delimiter', foreground: c.delimiter },
    { token: 'identifier', foreground: EDITOR_FOREGROUND },

    // Scopes Monaco's semantic tokens resolve to.
    { token: 'entity.name.function', foreground: c.builtinFunction },
    { token: 'function', foreground: c.builtinFunction },
    { token: 'variable', foreground: c.variable },
    { token: 'type', foreground: c.type },
    { token: 'entity.name.type', foreground: c.type },
  ];
}

/**
 * Surface/chrome colors for the Monaco editor instance, drawn from the app
 * palette so the editor blends with the rest of the dark UI.
 */
function createMooThemeColors(): MonacoEditor.editor.IColors {
  return {
    'editor.background': EDITOR_BACKGROUND,
    'editor.foreground': EDITOR_FOREGROUND,
    'editorCursor.foreground': '#5ba0ff',
    'editorLineNumber.foreground': '#5b6472',
    'editorLineNumber.activeForeground': '#a0a0b0',
    'editor.lineHighlightBackground': '#1a1a22',
    'editor.selectionBackground': '#5ba0ff40',
    'editor.inactiveSelectionBackground': '#5ba0ff20',
    'editor.selectionHighlightBackground': '#5ba0ff20',
    'editor.wordHighlightBackground': '#5ba0ff20',
    'editor.findMatchBackground': '#fbbf2455',
    'editor.findMatchHighlightBackground': '#fbbf2433',
    // Both the deprecated and current indent-guide keys, for Monaco version drift.
    'editorIndentGuide.background': '#22222d',
    'editorIndentGuide.activeBackground': '#333345',
    'editorIndentGuide.background1': '#22222d',
    'editorIndentGuide.activeBackground1': '#333345',
    'editorWhitespace.foreground': '#2a2a38',
    'editorBracketMatch.background': '#5ba0ff20',
    'editorBracketMatch.border': '#5ba0ff',
    'editorGutter.background': EDITOR_BACKGROUND,
    'editorError.foreground': '#f87171',
    'editorWarning.foreground': '#fbbf24',
    'editorWidget.background': '#1a1a22',
    'editorWidget.border': '#2a2a38',
    'editorSuggestWidget.background': '#1a1a22',
    'editorSuggestWidget.border': '#2a2a38',
    'editorSuggestWidget.selectedBackground': '#2a2a38',
    'editorHoverWidget.background': '#1a1a22',
    'editorHoverWidget.border': '#2a2a38',
    'editorStickyScroll.background': '#0f0f14',
    'editorStickyScrollHover.background': '#1a1a22',
  };
}

export function createMooEditorTheme(): MonacoEditor.editor.IStandaloneThemeData {
  return {
    base: 'vs-dark',
    inherit: true,
    rules: createMooThemeRules(),
    colors: createMooThemeColors(),
  };
}

type ThemeDefiner = {
  editor?: {
    defineTheme?: (name: string, theme: MonacoEditor.editor.IStandaloneThemeData) => void;
  };
};

/**
 * Register the MOO dark theme on a Monaco instance. Safe to call when
 * `editor.defineTheme` is unavailable (e.g. test mocks) — it no-ops.
 */
export function defineMooEditorTheme(monaco: ThemeDefiner): void {
  monaco.editor?.defineTheme?.(MOO_EDITOR_THEME_NAME, createMooEditorTheme());
}
