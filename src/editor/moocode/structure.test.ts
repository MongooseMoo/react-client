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
    expect(structure.symbols[0].children).toHaveLength(2);
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
    expect(structure.symbols[0].children[1]).toMatchObject({
      name: 'else',
      blockKind: 'else',
      range: {
        startLineNumber: 5,
        startColumn: 1,
        endLineNumber: 6,
        endColumn: 31,
      },
    });
    expect(structure.foldingRanges).toEqual([
      { start: 1, end: 7 },
      { start: 2, end: 4 },
      { start: 5, end: 6 },
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
    expect(structure.foldingRanges).toEqual([
      { start: 3, end: 7 },
      { start: 5, end: 6 },
    ]);
  });

  it('uses grammar identifiers in block symbol labels', () => {
    const source = ['for item$bad in (items)', 'endfor', 'fork task$bad (0)', 'endfork'].join('\n');

    expect(analyzeMooStructure(source).symbols.map((symbol) => symbol.name)).toEqual([
      'for item',
      'fork task',
    ]);
  });

  it('builds middle-clause symbols and folding ranges inside branch and handler blocks', () => {
    const source = [
      'if (valid(player))',
      '  notify(player, "ok");',
      'elseif (valid(caller))',
      '  notify(caller, "ok");',
      'else',
      '  raise(E_PERM);',
      'endif',
      'try',
      '  risky();',
      'except caught (E_PERM)',
      '  notify(player, caught);',
      'finally',
      '  cleanup();',
      'endtry',
    ].join('\n');

    const structure = analyzeMooStructure(source);

    expect(structure.symbols[0].children).toEqual([
      expect.objectContaining({
        name: 'elseif valid(caller)',
        blockKind: 'elseif',
        range: {
          startLineNumber: 3,
          startColumn: 1,
          endLineNumber: 4,
          endColumn: 24,
        },
        selectionRange: {
          startLineNumber: 3,
          startColumn: 1,
          endLineNumber: 3,
          endColumn: 7,
        },
      }),
      expect.objectContaining({
        name: 'else',
        blockKind: 'else',
        range: {
          startLineNumber: 5,
          startColumn: 1,
          endLineNumber: 6,
          endColumn: 17,
        },
      }),
    ]);
    expect(structure.symbols[1].children).toEqual([
      expect.objectContaining({
        name: 'except caught (E_PERM)',
        blockKind: 'except',
        range: {
          startLineNumber: 10,
          startColumn: 1,
          endLineNumber: 11,
          endColumn: 26,
        },
      }),
      expect.objectContaining({
        name: 'finally',
        blockKind: 'finally',
        range: {
          startLineNumber: 12,
          startColumn: 1,
          endLineNumber: 13,
          endColumn: 13,
        },
      }),
    ]);
    expect(structure.foldingRanges).toEqual([
      { start: 1, end: 7 },
      { start: 3, end: 4 },
      { start: 5, end: 6 },
      { start: 8, end: 14 },
      { start: 10, end: 11 },
      { start: 12, end: 13 },
    ]);
  });
});
