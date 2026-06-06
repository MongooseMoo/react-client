import { describe, expect, it } from 'vitest';
import { firstMooKeyword, maskMooSource, offsetAtMooPosition } from './scanner';

describe('MOO scanner helpers', () => {
  it('masks strings and comments while preserving positions', () => {
    const source = [
      'notify(player, "if (x)"); // endif',
      '/* for item in (items)',
      'endfor */ try',
    ].join('\n');

    const masked = maskMooSource(source);

    expect(masked).toHaveLength(source.length);
    expect(masked).toContain('notify(player,         );         ');
    expect(masked).not.toContain('endif');
    expect(masked).not.toContain('for item');
    expect(masked).toContain('         try');
  });

  it('finds the first keyword and source offsets with one-based Monaco positions', () => {
    expect(firstMooKeyword('  while (valid(player))')).toEqual({
      word: 'while',
      startColumn: 3,
      endColumn: 8,
    });

    expect(offsetAtMooPosition('first\nsecond', { lineNumber: 2, column: 4 })).toBe(9);
  });
});
