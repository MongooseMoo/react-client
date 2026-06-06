import { describe, expect, it } from 'vitest';
import { findMooBuiltinAtPosition, findMooBuiltinReferences } from './builtinNavigation';

describe('MOO builtin navigation', () => {
  it('finds builtin call definitions at the cursor', () => {
    const source = ['notify(player, "hi");', 'player:notify("verb");'].join('\n');

    expect(findMooBuiltinAtPosition(source, { lineNumber: 1, column: 3 })).toEqual({
      name: 'notify',
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 7,
      },
      url: 'moo://builtin/notify',
    });
    expect(findMooBuiltinAtPosition(source, { lineNumber: 2, column: 10 })).toBeNull();
  });

  it('finds same-builtin references while ignoring strings, comments, and verb calls', () => {
    const source = [
      'notify(player, "hi");',
      'if (valid(player))',
      '  notify(player, "still here");',
      'endif',
      'player:notify("verb");',
      '// notify(player, "comment");',
      '"notify(player, string)"',
    ].join('\n');

    expect(findMooBuiltinReferences(source, { lineNumber: 1, column: 3 })).toEqual([
      {
        name: 'notify',
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 7,
        },
        url: 'moo://builtin/notify',
      },
      {
        name: 'notify',
        range: {
          startLineNumber: 3,
          startColumn: 3,
          endLineNumber: 3,
          endColumn: 9,
        },
        url: 'moo://builtin/notify',
      },
    ]);
    expect(findMooBuiltinReferences(source, { lineNumber: 2, column: 6 })).toEqual([
      {
        name: 'valid',
        range: {
          startLineNumber: 2,
          startColumn: 5,
          endLineNumber: 2,
          endColumn: 10,
        },
        url: 'moo://builtin/valid',
      },
    ]);
  });
});
