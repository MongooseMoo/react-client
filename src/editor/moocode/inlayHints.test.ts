import { describe, expect, it } from 'vitest';
import { collectMooInlayHints } from './inlayHints';

describe('MOO inlay hints', () => {
  it('adds parameter labels for ToastStunt builtin call arguments', () => {
    const source = 'notify(player, "hello");\nmove(this, #4);';

    expect(collectMooInlayHints(source)).toEqual([
      {
        label: 'player:',
        lineNumber: 1,
        column: 8,
      },
      {
        label: 'text:',
        lineNumber: 1,
        column: 16,
      },
      {
        label: 'object:',
        lineNumber: 2,
        column: 6,
      },
      {
        label: 'destination:',
        lineNumber: 2,
        column: 12,
      },
    ]);
  });

  it('tracks nested call arguments and ignores strings and comments', () => {
    const source = [
      '// notify(player, "comment")',
      'notify(player, tostr(value));',
      'notify(player, "raise(E_PERM, msg)");',
    ].join('\n');

    expect(collectMooInlayHints(source)).toEqual([
      {
        label: 'player:',
        lineNumber: 2,
        column: 8,
      },
      {
        label: 'text:',
        lineNumber: 2,
        column: 16,
      },
      {
        label: 'value:',
        lineNumber: 2,
        column: 22,
      },
      {
        label: 'player:',
        lineNumber: 3,
        column: 8,
      },
      {
        label: 'text:',
        lineNumber: 3,
        column: 16,
      },
    ]);
  });

  it('adds generic parameter labels for known ToastStunt builtins without curated docs', () => {
    expect(collectMooInlayHints('sqlite_query(handle, sql, options);')).toEqual([
      {
        label: 'arg1:',
        lineNumber: 1,
        column: 14,
      },
      {
        label: 'arg2:',
        lineNumber: 1,
        column: 22,
      },
      {
        label: 'arg3?:',
        lineNumber: 1,
        column: 27,
      },
    ]);
  });
});
