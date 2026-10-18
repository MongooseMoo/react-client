import { describe, expect, it } from 'vitest';
import { getMooInlineCompletions } from './inlineCompletions';

describe('MOO inline completions', () => {
  it('suggests a matching close block at the end of an opener line', () => {
    const source = 'if (valid(player))';

    expect(getMooInlineCompletions(source, { lineNumber: 1, column: source.length + 1 })).toEqual([
      {
        insertText: '\n  \nendif',
        range: {
          startLineNumber: 1,
          startColumn: source.length + 1,
          endLineNumber: 1,
          endColumn: source.length + 1,
        },
      },
    ]);
  });

  it('preserves current indentation and infers tab indentation', () => {
    const source = ['\twhile (connected)', '\t  notify(player, "tick");'].join('\n');

    expect(getMooInlineCompletions(source, { lineNumber: 1, column: 19 })).toEqual([
      {
        insertText: '\n\t\t\n\tendwhile',
        range: {
          startLineNumber: 1,
          startColumn: 19,
          endLineNumber: 1,
          endColumn: 19,
        },
      },
    ]);
  });

  it('does not suggest a close block away from line end or when the close already follows', () => {
    expect(getMooInlineCompletions('for item in (items)', { lineNumber: 1, column: 5 })).toEqual(
      [],
    );
    expect(
      getMooInlineCompletions('for item in (items)\nendfor', { lineNumber: 1, column: 20 }),
    ).toEqual([]);
    expect(getMooInlineCompletions('// if (player)', { lineNumber: 1, column: 15 })).toEqual([]);
  });
});
