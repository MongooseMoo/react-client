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
        tooltip: 'ToastStunt builtin parameter player for notify(player, text).',
      },
      {
        label: 'text:',
        lineNumber: 1,
        column: 16,
        tooltip: 'ToastStunt builtin parameter text for notify(player, text).',
      },
      {
        label: 'object:',
        lineNumber: 2,
        column: 6,
        tooltip: 'ToastStunt builtin parameter object for move(object, destination).',
      },
      {
        label: 'destination:',
        lineNumber: 2,
        column: 12,
        tooltip: 'ToastStunt builtin parameter destination for move(object, destination).',
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
        tooltip: 'ToastStunt builtin parameter player for notify(player, text).',
      },
      {
        label: 'text:',
        lineNumber: 2,
        column: 16,
        tooltip: 'ToastStunt builtin parameter text for notify(player, text).',
      },
      {
        label: 'value:',
        lineNumber: 2,
        column: 22,
        tooltip: 'ToastStunt builtin parameter value for tostr(value).',
      },
      {
        label: 'player:',
        lineNumber: 3,
        column: 8,
        tooltip: 'ToastStunt builtin parameter player for notify(player, text).',
      },
      {
        label: 'text:',
        lineNumber: 3,
        column: 16,
        tooltip: 'ToastStunt builtin parameter text for notify(player, text).',
      },
    ]);
  });

  it('adds generic parameter labels for known ToastStunt builtins without curated docs', () => {
    expect(collectMooInlayHints('sqlite_query(handle, sql, options);')).toEqual([
      {
        label: 'handle:',
        lineNumber: 1,
        column: 14,
        tooltip:
          'ToastStunt builtin parameter handle for sqlite_query(handle: int, sql: str, options?: any).',
      },
      {
        label: 'sql:',
        lineNumber: 1,
        column: 22,
        tooltip:
          'ToastStunt builtin parameter sql for sqlite_query(handle: int, sql: str, options?: any).',
      },
      {
        label: 'options?:',
        lineNumber: 1,
        column: 27,
        tooltip:
          'Optional ToastStunt builtin parameter options? for sqlite_query(handle: int, sql: str, options?: any).',
      },
    ]);
  });

  it('adds generic parameter labels for static MOO verb call arguments', () => {
    expect(collectMooInlayHints('player:tell("hello", caller);')).toEqual([
      {
        label: 'arg1:',
        lineNumber: 1,
        column: 13,
        tooltip: 'MOO verb argument 1. The target verb receives this value as args[1].',
      },
      {
        label: 'arg2:',
        lineNumber: 1,
        column: 22,
        tooltip: 'MOO verb argument 2. The target verb receives this value as args[2].',
      },
    ]);
  });

  it('adds generic parameter labels for object-number and system-reference verb calls', () => {
    const source = '#123:initialize(player);\n$room:announce(tostr(message));';

    expect(collectMooInlayHints(source)).toEqual([
      {
        label: 'arg1:',
        lineNumber: 1,
        column: 17,
        tooltip: 'MOO verb argument 1. The target verb receives this value as args[1].',
      },
      {
        label: 'arg1:',
        lineNumber: 2,
        column: 16,
        tooltip: 'MOO verb argument 1. The target verb receives this value as args[1].',
      },
      {
        label: 'value:',
        lineNumber: 2,
        column: 22,
        tooltip: 'ToastStunt builtin parameter value for tostr(value).',
      },
    ]);
  });

  it('adds generic parameter labels for dynamic MOO verb call arguments', () => {
    expect(collectMooInlayHints('player:(verb_name)("hello", caller);')).toEqual([
      {
        label: 'arg1:',
        lineNumber: 1,
        column: 20,
        tooltip: 'MOO verb argument 1. The target verb receives this value as args[1].',
      },
      {
        label: 'arg2:',
        lineNumber: 1,
        column: 29,
        tooltip: 'MOO verb argument 2. The target verb receives this value as args[2].',
      },
    ]);
  });

  it('adds generic parameter labels for dollar MOO verb call arguments', () => {
    expect(collectMooInlayHints('$notify("hello", caller);\n$(verb_name)("ok");')).toEqual([
      {
        label: 'arg1:',
        lineNumber: 1,
        column: 9,
        tooltip: 'MOO verb argument 1. The target verb receives this value as args[1].',
      },
      {
        label: 'arg2:',
        lineNumber: 1,
        column: 18,
        tooltip: 'MOO verb argument 2. The target verb receives this value as args[2].',
      },
      {
        label: 'arg1:',
        lineNumber: 2,
        column: 14,
        tooltip: 'MOO verb argument 1. The target verb receives this value as args[1].',
      },
    ]);
  });
});
