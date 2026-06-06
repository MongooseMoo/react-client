import { describe, expect, it } from 'vitest';
import { analyzeMooStructure } from './structure';

describe('MOO code structure analysis', () => {
  it('builds nested document symbols and folding ranges for block statements', () => {
    const source = [
      'if (valid(player))',
      '  for item in (items)',
      '    notify(player, item);',
      '  endfor',
      'else',
      '  notify(player, "not valid");',
      'endif',
    ].join('\n');

    const structure = analyzeMooStructure(source);

    expect(structure.symbols).toHaveLength(1);
    expect(structure.symbols[0]).toMatchObject({
      name: 'if valid(player)',
      blockKind: 'if',
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 7,
        endColumn: 6,
      },
      selectionRange: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 3,
      },
    });
    expect(structure.symbols[0].children).toHaveLength(1);
    expect(structure.symbols[0].children[0]).toMatchObject({
      name: 'for item',
      blockKind: 'for',
      range: {
        startLineNumber: 2,
        startColumn: 3,
        endLineNumber: 4,
        endColumn: 9,
      },
    });
    expect(structure.foldingRanges).toEqual([
      { start: 1, end: 7 },
      { start: 2, end: 4 },
    ]);
  });

  it('ignores block-looking keywords inside comments and strings', () => {
    const source = [
      '// if (valid(player))',
      'notify(player, "endif");',
      'try',
      '  notify(player, "except (E_PERM)");',
      'finally',
      '  notify(player, "done");',
      'endtry',
    ].join('\n');

    const structure = analyzeMooStructure(source);

    expect(structure.symbols).toHaveLength(1);
    expect(structure.symbols[0]).toMatchObject({
      name: 'try',
      blockKind: 'try',
      range: {
        startLineNumber: 3,
        startColumn: 1,
        endLineNumber: 7,
        endColumn: 7,
      },
    });
    expect(structure.foldingRanges).toEqual([{ start: 3, end: 7 }]);
  });

  it('uses grammar identifiers in block symbol labels', () => {
    const source = ['for item$bad in (items)', 'endfor', 'fork task$bad (0)', 'endfork'].join('\n');

    expect(analyzeMooStructure(source).symbols.map((symbol) => symbol.name)).toEqual([
      'for item',
      'fork task',
    ]);
  });
});
