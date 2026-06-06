import { describe, expect, it } from 'vitest';
import { collectMooDocumentColors, getMooColorPresentations } from './colors';

describe('MOO document colors', () => {
  it('finds hex colors inside MOO string literals', () => {
    const source = [
      'notify(player, "#ff8800");',
      'highlight = "#0af";',
      'comment = "not a color";',
    ].join('\n');

    expect(collectMooDocumentColors(source)).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 17,
          endLineNumber: 1,
          endColumn: 24,
        },
        color: { red: 1, green: 0.5333333333333333, blue: 0, alpha: 1 },
      },
      {
        range: {
          startLineNumber: 2,
          startColumn: 14,
          endLineNumber: 2,
          endColumn: 18,
        },
        color: { red: 0, green: 0.6666666666666666, blue: 1, alpha: 1 },
      },
    ]);
  });

  it('ignores color-looking text outside real MOO strings', () => {
    const source = [
      '// "#ff0000"',
      'bare = #123;',
    ].join('\n');

    expect(collectMooDocumentColors(source)).toEqual([]);
  });

  it('keeps scanning a MOO string after escaped quotes', () => {
    const source = 'notify(player, "escaped quote \\"#00ff00\\" still in string");';

    expect(collectMooDocumentColors(source)).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 33,
          endLineNumber: 1,
          endColumn: 40,
        },
        color: { red: 0, green: 1, blue: 0, alpha: 1 },
      },
    ]);
  });

  it('offers stable hex color presentations for Monaco color edits', () => {
    expect(
      getMooColorPresentations({
        range: {
          startLineNumber: 1,
          startColumn: 17,
          endLineNumber: 1,
          endColumn: 24,
        },
        color: { red: 0.5, green: 0.25, blue: 1, alpha: 1 },
      }),
    ).toEqual([
      {
        label: '#8040ff',
        textEdit: {
          range: {
            startLineNumber: 1,
            startColumn: 17,
            endLineNumber: 1,
            endColumn: 24,
          },
          text: '#8040ff',
        },
      },
    ]);
  });
});
