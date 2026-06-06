import { describe, expect, it } from 'vitest';
import { toMonacoMarkers, validateMooSyntax } from './diagnostics';

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

  it('adds related information for mismatched close keywords', () => {
    const diagnostics = validateMooSyntax(
      ['if (valid(player))', '  notify(player, "ok");', 'endwhile'].join('\n'),
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'mismatched-close',
        lineNumber: 3,
        message: 'endwhile closes while, but the open block is if.',
        relatedInformation: [
          {
            message: 'Open if block is here.',
            range: {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 3,
            },
          },
        ],
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

  it('reports local references before their first definition', () => {
    const source = ['notify(player, total);', 'total = 1;', 'notify(player, total);'].join('\n');
    const diagnostics = validateMooSyntax(source);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'undefined-local',
        lineNumber: 1,
        startColumn: 16,
        endColumn: 21,
        message: 'total is used before it is defined.',
        relatedInformation: [
          {
            message: 'First total definition is here.',
            range: {
              startLineNumber: 2,
              startColumn: 1,
              endLineNumber: 2,
              endColumn: 6,
            },
          },
        ],
      }),
    );
    expect(toMonacoMarkers(source, { error: 8, warning: 4 }, 'moo://#1:test' as never)).toContainEqual(
      expect.objectContaining({
        code: 'undefined-local',
        relatedInformation: [
          {
            resource: 'moo://#1:test',
            message: 'First total definition is here.',
            startLineNumber: 2,
            startColumn: 1,
            endLineNumber: 2,
            endColumn: 6,
          },
        ],
      }),
    );
    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'undefined-local')).toHaveLength(
      1,
    );
  });

  it('reports unused local definitions as warnings', () => {
    const source = ['used = 1;', 'unused = 2;', 'notify(player, used);'].join('\n');
    const diagnostics = validateMooSyntax(source);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unused-local',
        lineNumber: 2,
        startColumn: 1,
        endColumn: 7,
        message: 'unused is defined but never used.',
        severity: 'warning',
      }),
    );
    expect(toMonacoMarkers(source, { error: 8, warning: 4 })).toContainEqual(
      expect.objectContaining({
        code: 'unused-local',
        severity: 4,
      }),
    );
  });
});
