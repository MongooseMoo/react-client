import { describe, expect, it } from 'vitest';
import { validateMooSyntax } from './diagnostics';

describe('validateMooSyntax', () => {
  it('accepts balanced MOO blocks and delimiters', () => {
    const diagnostics = validateMooSyntax(
      [
        'if (valid(player))',
        '  for x in ({1, 2, 3})',
        '    notify(player, tostr(x));',
        '  endfor',
        'else',
        '  return E_PERM;',
        'endif',
      ].join('\n'),
    );

    expect(diagnostics).toEqual([]);
  });

  it('reports unmatched closing block keywords', () => {
    const diagnostics = validateMooSyntax('endif');

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unexpected-close',
        lineNumber: 1,
        message: 'Unexpected endif without a matching if.',
      }),
    );
  });

  it('reports missing closing block keywords at the opening line', () => {
    const diagnostics = validateMooSyntax('while (1)\n  suspend(1);');

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unclosed-block',
        lineNumber: 1,
        message: 'while is missing a matching endwhile.',
      }),
    );
  });

  it('reports misplaced block middle keywords', () => {
    const diagnostics = validateMooSyntax('try\n  notify(player, "ok");\nelse\nendtry');

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'misplaced-middle',
        lineNumber: 3,
        message: 'else can only appear inside an if block.',
      }),
    );
  });

  it('reports unterminated strings and unbalanced delimiters', () => {
    const diagnostics = validateMooSyntax('notify(player, "unterminated;\nfoo = {1, 2;');

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unterminated-string',
        lineNumber: 1,
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unclosed-delimiter',
        lineNumber: 2,
        message: '{ is missing a matching }.',
      }),
    );
  });

  it('ignores block comment contents when validating blocks and delimiters', () => {
    const diagnostics = validateMooSyntax(
      [
        '/*',
        'break;',
        'endif',
        'values = {1, 2;',
        '*/',
        'notify(player, "ok");',
      ].join('\n'),
    );

    expect(diagnostics).toEqual([]);
  });

  it('reports break and continue outside loops', () => {
    const diagnostics = validateMooSyntax('break;\ncontinue outer;');

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'loop-control-outside-loop',
        lineNumber: 1,
        message: 'break can only be used inside a for or while block.',
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'loop-control-outside-loop',
        lineNumber: 2,
        message: 'continue can only be used inside a for or while block.',
      }),
    );
  });

  it('reports ToastStunt builtin calls outside their registered arity', () => {
    const diagnostics = validateMooSyntax(
      [
        'sqlite_query(handle);',
        'notify(player, "hello", 0, 1, 2);',
        'pass(a, b, c, d, e);',
        '// sqlite_query(handle);',
        '"notify(player, text, a, b, c)"',
      ].join('\n'),
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'builtin-arity',
        lineNumber: 1,
        message: 'sqlite_query expects 2 to 3 arguments, but got 1.',
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'builtin-arity',
        lineNumber: 2,
        message: 'notify expects 2 to 4 arguments, but got 5.',
      }),
    );
    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'builtin-arity')).toHaveLength(2);
  });

  it('reports likely undefined local references', () => {
    const diagnostics = validateMooSyntax(
      ['total = count + 1;', 'notify(player, total);', '// ghost;'].join('\n'),
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'undefined-local',
        lineNumber: 1,
        startColumn: 9,
        endColumn: 14,
        message: 'count is used before it is defined.',
      }),
    );
    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'undefined-local')).toHaveLength(
      1,
    );
  });
});
