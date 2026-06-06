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

  it('does not offer signature help for unknown call names', () => {
    expect(getMooSignatureHelp('custom(player, args);', { lineNumber: 1, column: 10 })).toBeNull();
  });
});
