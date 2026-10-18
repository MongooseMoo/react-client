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
      ['/*', 'break;', 'endif', 'values = {1, 2;', '*/', 'notify(player, "ok");'].join('\n'),
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
    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'unknown-loop-label')).toEqual(
      [],
    );
  });

  it('reports statements unreachable after terminal control flow within the same branch', () => {
    const source = [
      'if (valid(player))',
      '  return E_PERM;',
      '  notify(player, "never");',
      'else',
      '  notify(player, "ok");',
      'endif',
      'while (valid(player))',
      '  break;',
      '  suspend(1);',
      'endwhile',
    ].join('\n');
    const diagnostics = validateMooSyntax(source);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unreachable-statement',
        lineNumber: 3,
        startColumn: 3,
        endColumn: 27,
        message: 'Statement is unreachable after return.',
        severity: 'warning',
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unreachable-statement',
        lineNumber: 9,
        startColumn: 3,
        endColumn: 14,
        message: 'Statement is unreachable after break.',
        severity: 'warning',
      }),
    );
    expect(
      diagnostics.filter((diagnostic) => diagnostic.code === 'unreachable-statement'),
    ).toHaveLength(2);
  });

  it('reports statements unreachable after if blocks where every branch terminates', () => {
    const source = [
      'if (player == #-1)',
      '  return E_INVARG;',
      'endif',
      'notify(player, "maybe");',
      'if (valid(player))',
      '  return E_PERM;',
      'elseif (player == #-1)',
      '  return E_INVARG;',
      'else',
      '  return E_NONE;',
      'endif',
      'notify(player, "never");',
    ].join('\n');
    const diagnostics = validateMooSyntax(source);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unreachable-statement',
        lineNumber: 12,
        startColumn: 1,
        endColumn: 25,
        message: 'Statement is unreachable because all if branches terminate.',
        severity: 'warning',
      }),
    );
    expect(
      diagnostics.filter((diagnostic) => diagnostic.code === 'unreachable-statement'),
    ).toHaveLength(1);
  });

  it('reports statements unreachable after terminating finally blocks', () => {
    const source = [
      'try',
      '  notify(player, "body");',
      'finally',
      '  notify(player, "cleanup");',
      'endtry',
      'notify(player, "maybe");',
      'try',
      '  notify(player, "body");',
      'finally',
      '  return E_NONE;',
      'endtry',
      'notify(player, "never");',
    ].join('\n');
    const diagnostics = validateMooSyntax(source);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unreachable-statement',
        lineNumber: 12,
        startColumn: 1,
        endColumn: 25,
        message: 'Statement is unreachable because finally always terminates.',
        severity: 'warning',
      }),
    );
    expect(
      diagnostics.filter((diagnostic) => diagnostic.code === 'unreachable-statement'),
    ).toHaveLength(1);
  });

  it('reports named break and continue targets that do not match an enclosing while label', () => {
    const diagnostics = validateMooSyntax(
      [
        'items = {1, 2};',
        'while outer (valid(player))',
        '  for item in (items)',
        '    break missing;',
        '    continue outer;',
        '  endfor',
        'endwhile',
      ].join('\n'),
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unknown-loop-label',
        lineNumber: 4,
        startColumn: 11,
        endColumn: 18,
        message: 'missing does not name an enclosing while label.',
      }),
    );
    expect(
      diagnostics.filter((diagnostic) => diagnostic.code === 'unknown-loop-label'),
    ).toHaveLength(1);
  });

  it('reports likely loop-label typo targets in unknown loop-label diagnostics', () => {
    const source = [
      'while outer (valid(player))',
      '  for item in ({1, 2})',
      '    continue outter;',
      '  endfor',
      'endwhile',
    ].join('\n');

    expect(validateMooSyntax(source)).toContainEqual(
      expect.objectContaining({
        code: 'unknown-loop-label',
        lineNumber: 3,
        startColumn: 14,
        endColumn: 20,
        message: 'outter does not name an enclosing while label. Did you mean outer?',
        relatedInformation: [
          {
            message: 'Enclosing while label outer is defined here.',
            range: {
              startLineNumber: 1,
              startColumn: 7,
              endLineNumber: 1,
              endColumn: 12,
            },
          },
        ],
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

  it('does not apply ToastStunt builtin arity checks to verb calls with builtin-like names', () => {
    const diagnostics = validateMooSyntax(
      [
        'player:notify("hello", caller, this, verb, args);',
        '$room:valid(player, this, caller);',
        '$valid(player, this, caller);',
        'object:(verb_name)(player, this, caller, args);',
      ].join('\n'),
    );

    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'builtin-arity')).toEqual([]);
  });

  it('reports unknown plain builtin calls with likely ToastStunt builtin targets', () => {
    const diagnostics = validateMooSyntax(
      ['notfiy(player, "hello");', 'notify(player, "ok");'].join('\n'),
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unknown-builtin',
        lineNumber: 1,
        startColumn: 1,
        endColumn: 7,
        message: 'notfiy is not a known ToastStunt builtin. Did you mean notify?',
      }),
    );
    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'unknown-builtin')).toHaveLength(
      1,
    );
  });

  it('does not report unknown builtins for verb, dollar, dynamic, string, or comment calls', () => {
    const diagnostics = validateMooSyntax(
      [
        'player:notfiy("hello");',
        '$room:notfiy("hello");',
        '$notfiy("hello");',
        'object:(verb_name)("hello");',
        '// notfiy(player, "hello");',
        '"notfiy(player, text)"',
      ].join('\n'),
    );

    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'unknown-builtin')).toEqual([]);
  });

  it('does not report labeled while loops as unknown builtin calls', () => {
    const diagnostics = validateMooSyntax(
      [
        'while outer (valid(player))',
        '  notify(player, "ok");',
        '  notfiy(player, "typo");',
        'endwhile',
      ].join('\n'),
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unknown-builtin',
        lineNumber: 3,
        startColumn: 3,
        endColumn: 9,
        message: 'notfiy is not a known ToastStunt builtin. Did you mean notify?',
      }),
    );
    expect(diagnostics.filter((diagnostic) => diagnostic.code === 'unknown-builtin')).toHaveLength(
      1,
    );
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
    expect(
      toMonacoMarkers(source, { error: 8, warning: 4 }, 'moo://#1:test' as never),
    ).toContainEqual(
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

  it('reports likely local typo targets in undefined local diagnostics and Monaco markers', () => {
    const source = ['total = 0;', 'notify(player, totla);'].join('\n');

    expect(validateMooSyntax(source)).toContainEqual(
      expect.objectContaining({
        code: 'undefined-local',
        lineNumber: 2,
        startColumn: 16,
        endColumn: 21,
        message: 'totla is used before it is defined. Did you mean total?',
        relatedInformation: [
          {
            message: 'Similar local total is defined here.',
            range: {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 6,
            },
          },
        ],
      }),
    );
    expect(
      toMonacoMarkers(source, { error: 8, warning: 4 }, 'moo://#1:test' as never),
    ).toContainEqual(
      expect.objectContaining({
        code: 'undefined-local',
        relatedInformation: [
          expect.objectContaining({
            resource: 'moo://#1:test',
            message: 'Similar local total is defined here.',
          }),
        ],
      }),
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
