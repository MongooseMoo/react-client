import { describe, expect, it } from 'vitest';
import { getMooHover } from './hover';

describe('MOO hover service', () => {
  it('describes ToastStunt builtins with signatures and documentation', () => {
    const hover = getMooHover('notify(player, "hello");', { lineNumber: 1, column: 3 });

    expect(hover).toEqual({
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 7,
      },
      contents: [
        {
          value: ['```moocode', 'notify(player, text)', '```', 'Sends text to a connected player.'].join(
            '\n',
          ),
        },
      ],
    });
  });

  it('describes generic ToastStunt builtins with registered arity and types', () => {
    const hover = getMooHover('sqlite_query(handle, sql, options);', {
      lineNumber: 1,
      column: 3,
    });

    expect(hover).toEqual({
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 13,
      },
      contents: [
        {
          value: [
            '```moocode',
            'sqlite_query(arg1: int, arg2: str, arg3?: any)',
            '```',
            'ToastStunt builtin function.',
            'Registered arity: 2 to 3 arguments.',
            'Parameter types: int, str, any.',
          ].join('\n'),
        },
      ],
    });
  });

  it('describes local symbols with definition and reference counts', () => {
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');
    const hover = getMooHover(source, { lineNumber: 2, column: 10 });

    expect(hover).toEqual({
      range: {
        startLineNumber: 2,
        startColumn: 9,
        endLineNumber: 2,
        endColumn: 14,
      },
      contents: [
        {
          value: ['```moocode', 'local total', '```', 'Defined 2 times. Referenced 2 times.'].join(
            '\n',
          ),
        },
      ],
    });
  });

  it('describes MOO error constants and ignores strings and comments', () => {
    expect(getMooHover('raise(E_PERM, "nope");', { lineNumber: 1, column: 8 })).toMatchObject({
      contents: [{ value: expect.stringContaining('Permission denied') }],
    });

    expect(getMooHover('// notify(player, "comment")', { lineNumber: 1, column: 5 })).toBeNull();
    expect(getMooHover('"E_PERM"', { lineNumber: 1, column: 3 })).toBeNull();
  });

  it('describes MOO system references', () => {
    expect(getMooHover('$string_utils:english_list(names);', { lineNumber: 1, column: 4 })).toEqual({
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 14,
      },
      contents: [
        {
          value: ['```moocode', '$string_utils', '```', 'MOO string utility object.'].join('\n'),
        },
      ],
    });
  });
});
