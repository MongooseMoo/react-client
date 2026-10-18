import { describe, expect, it } from 'vitest';
import { getMooSelectionRanges } from './selectionRanges';

describe('MOO selection ranges', () => {
  it('builds word, statement, enclosing block, and document selection ranges', () => {
    const source = [
      'if (valid(player))',
      '  for item in (items)',
      '    notify(player, item);',
      '  endfor',
      'endif',
    ].join('\n');

    expect(getMooSelectionRanges(source, [{ lineNumber: 3, column: 21 }])).toEqual([
      {
        range: {
          startLineNumber: 3,
          startColumn: 20,
          endLineNumber: 3,
          endColumn: 24,
        },
        parent: {
          range: {
            startLineNumber: 3,
            startColumn: 5,
            endLineNumber: 3,
            endColumn: 26,
          },
          parent: {
            range: {
              startLineNumber: 2,
              startColumn: 3,
              endLineNumber: 4,
              endColumn: 9,
            },
            parent: {
              range: {
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 5,
                endColumn: 6,
              },
            },
          },
        },
      },
    ]);
  });

  it('ignores word-looking text inside comments and strings', () => {
    const source = ['if (valid(player))', '  notify(player, "item"); // item', 'endif'].join('\n');

    expect(getMooSelectionRanges(source, [{ lineNumber: 2, column: 19 }])[0]).toMatchObject({
      range: {
        startLineNumber: 2,
        startColumn: 3,
        endLineNumber: 2,
        endColumn: 34,
      },
      parent: {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 3,
          endColumn: 6,
        },
      },
    });
  });

  it('does not select invalid dollar-separated text as one word', () => {
    expect(
      getMooSelectionRanges('$room$extra:announce("bad");', [{ lineNumber: 1, column: 3 }]),
    ).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 6,
        },
        parent: {
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 29,
          },
        },
      },
    ]);
  });
});
