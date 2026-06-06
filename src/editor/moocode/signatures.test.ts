import { describe, expect, it } from 'vitest';
import { findMooCallContext, getMooSignatureHelp } from './signatures';

describe('MOO signature help analysis', () => {
  it('finds the active builtin call and parameter at the cursor', () => {
    const source = 'notify(player, "hello");';

    expect(findMooCallContext(source, { lineNumber: 1, column: 16 })).toEqual({
      functionName: 'notify',
      activeParameter: 1,
    });
    expect(getMooSignatureHelp(source, { lineNumber: 1, column: 16 })).toMatchObject({
      activeSignature: 0,
      activeParameter: 1,
      signatures: [
        {
          label: 'notify(player, text)',
          parameters: [{ label: 'player' }, { label: 'text' }],
        },
      ],
    });
  });

  it('tracks nested calls and ignores call-looking text in strings and comments', () => {
    const source = [
      '// notify(player, "comment")',
      'notify(player, tostr(value));',
      'notify(player, "raise(E_PERM, msg)");',
    ].join('\n');

    expect(findMooCallContext(source, { lineNumber: 1, column: 14 })).toBeNull();
    expect(findMooCallContext(source, { lineNumber: 2, column: 22 })).toEqual({
      functionName: 'tostr',
      activeParameter: 0,
    });
    expect(findMooCallContext(source, { lineNumber: 3, column: 29 })).toEqual({
      functionName: 'notify',
      activeParameter: 1,
    });
  });

  it('offers generic signature help for known ToastStunt builtins without curated docs', () => {
    expect(
      getMooSignatureHelp('sqlite_query(handle, sql, options);', { lineNumber: 1, column: 27 }),
    ).toMatchObject({
      activeSignature: 0,
      activeParameter: 2,
      signatures: [
        {
          label: 'sqlite_query(handle: int, sql: str, options?: any)',
          documentation: [
            'ToastStunt builtin function.',
            'Registered arity: 2 to 3 arguments.',
            'Parameter types: int, str, any.',
          ].join('\n'),
          parameters: [
            { label: 'handle', documentation: 'Registered ToastStunt type: int.' },
            { label: 'sql', documentation: 'Registered ToastStunt type: str.' },
            { label: 'options?', documentation: 'Registered ToastStunt type: any. Optional.' },
          ],
        },
      ],
    });
  });

  it('offers generic signature help for static MOO verb calls', () => {
    const source = 'player:tell("hello", caller);';

    expect(findMooCallContext(source, { lineNumber: 1, column: 24 })).toEqual({
      activeParameter: 1,
      callKind: 'verb',
      functionName: 'tell',
      receiverName: 'player',
    });
    expect(getMooSignatureHelp(source, { lineNumber: 1, column: 24 })).toEqual({
      activeSignature: 0,
      activeParameter: 1,
      signatures: [
        {
          label: 'player:tell(arg1, arg2)',
          documentation: 'MOO verb call. Arguments are available to the target verb as args.',
          parameters: [{ label: 'arg1' }, { label: 'arg2' }],
        },
      ],
    });
  });

  it('offers generic signature help for object-number and system-reference verb calls', () => {
    expect(
      getMooSignatureHelp('#123:initialize(player);', { lineNumber: 1, column: 21 }),
    ).toMatchObject({
      activeParameter: 0,
      signatures: [{ label: '#123:initialize(arg1)' }],
    });
    expect(
      getMooSignatureHelp('$room:announce("ok");', { lineNumber: 1, column: 18 }),
    ).toMatchObject({
      activeParameter: 0,
      signatures: [{ label: '$room:announce(arg1)' }],
    });
  });

  it('offers generic signature help for dynamic MOO verb calls', () => {
    const source = 'player:(verb_name)("hello", caller);';

    expect(findMooCallContext(source, { lineNumber: 1, column: 31 })).toEqual({
      activeParameter: 1,
      callKind: 'dynamic-verb',
      functionName: '(verb_name)',
      receiverName: 'player',
    });
    expect(getMooSignatureHelp(source, { lineNumber: 1, column: 31 })).toEqual({
      activeSignature: 0,
      activeParameter: 1,
      signatures: [
        {
          label: 'player:(verb_name)(arg1, arg2)',
          documentation: 'MOO verb call. Arguments are available to the target verb as args.',
          parameters: [{ label: 'arg1' }, { label: 'arg2' }],
        },
      ],
    });
  });

  it('offers generic signature help for dollar MOO verb calls', () => {
    expect(findMooCallContext('$notify("hello", caller);', { lineNumber: 1, column: 22 })).toEqual({
      activeParameter: 1,
      callKind: 'dollar-verb',
      functionName: 'notify',
    });
    expect(getMooSignatureHelp('$notify("hello", caller);', { lineNumber: 1, column: 22 })).toEqual(
      {
        activeSignature: 0,
        activeParameter: 1,
        signatures: [
          {
            label: '$notify(arg1, arg2)',
            documentation: 'MOO verb call. Arguments are available to the target verb as args.',
            parameters: [{ label: 'arg1' }, { label: 'arg2' }],
          },
        ],
      },
    );
    expect(
      getMooSignatureHelp('$(verb_name)("hello");', { lineNumber: 1, column: 18 }),
    ).toMatchObject({
      activeParameter: 0,
      signatures: [{ label: '$(verb_name)(arg1)' }],
    });
  });

  it('does not offer signature help for unknown call names', () => {
    expect(getMooSignatureHelp('custom(player, args);', { lineNumber: 1, column: 10 })).toBeNull();
  });
});
