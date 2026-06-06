import { describe, expect, it, vi } from 'vitest';
import {
  BUILTIN_FUNCTIONS,
  ERROR_CONSTANTS,
  MOO_LANGUAGE_ID,
  createMooCompletionItems,
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
        getLanguages: vi.fn(() => []),
        register: vi.fn(),
        registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
        registerHoverProvider: vi.fn(() => ({ dispose: vi.fn() })),
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
    expect(monaco.languages.registerHoverProvider).toHaveBeenCalledTimes(1);
  });
});
