import { describe, expect, it, vi } from 'vitest';
import {
  createMooEditorTheme,
  createMooThemeRules,
  defineMooEditorTheme,
  MOO_EDITOR_THEME_NAME,
  MOO_SYNTAX_COLORS,
} from './theme';

function channelToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`Expected a 6-digit hex color, got "${hex}"`);
  }
  const int = Number.parseInt(match[1], 16);
  const r = channelToLinear((int >> 16) & 0xff);
  const g = channelToLinear((int >> 8) & 0xff);
  const b = channelToLinear(int & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const EDITOR_BACKGROUND = createMooEditorTheme().colors['editor.background'];

describe('MOO editor theme', () => {
  it('is a dark theme that inherits the Monaco vs-dark base', () => {
    const theme = createMooEditorTheme();
    expect(theme.base).toBe('vs-dark');
    expect(theme.inherit).toBe(true);
  });

  it('sets the editor surface to the app dark background and light foreground', () => {
    const { colors } = createMooEditorTheme();
    expect(colors['editor.background']).toBe('#14141a');
    expect(colors['editor.foreground']).toBe('#e8e8ed');
  });

  it('colors every MOO monarch token type the tokenizer emits', () => {
    const tokens = new Set(createMooThemeRules().map((rule) => rule.token));
    const required = [
      'keyword',
      'operator',
      'predefined', // builtin functions
      'variable.predefined', // builtin variables + $system references
      'constant.language.error', // E_* error constants
      'number',
      'number.float',
      'number.object', // #123 object references
      'comment',
      'string',
      'string.quote',
      'string.escape',
      'string.escape.invalid',
      'delimiter',
      'identifier',
    ];
    for (const token of required) {
      expect(tokens.has(token)).toBe(true);
    }
  });

  it('gives every syntax color at least WCAG AA (4.5:1) contrast on the editor background', () => {
    for (const [name, color] of Object.entries(MOO_SYNTAX_COLORS)) {
      const ratio = contrastRatio(color, EDITOR_BACKGROUND);
      expect(
        ratio,
        `${name} (${color}) contrast ${ratio.toFixed(2)}:1 against ${EDITOR_BACKGROUND}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('registers the theme under its published name when Monaco can define themes', () => {
    const defineTheme = vi.fn();
    defineMooEditorTheme({ editor: { defineTheme } });
    expect(defineTheme).toHaveBeenCalledTimes(1);
    expect(defineTheme).toHaveBeenCalledWith(MOO_EDITOR_THEME_NAME, createMooEditorTheme());
  });

  it('no-ops safely when the Monaco instance cannot define themes', () => {
    expect(() => defineMooEditorTheme({})).not.toThrow();
    expect(() => defineMooEditorTheme({ editor: {} })).not.toThrow();
  });
});
