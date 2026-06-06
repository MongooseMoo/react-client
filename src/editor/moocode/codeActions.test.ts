import { describe, expect, it } from 'vitest';
import { getMooQuickFixes } from './codeActions';

describe('MOO code actions', () => {
  it('offers quick fixes for missing block, delimiter, and string closers', () => {
    const source = ['if (valid(player))', '  text = "unterminated', '  values = {1, 2;'].join('\n');

    const fixes = getMooQuickFixes(source);

    expect(fixes).toContainEqual({
      title: 'Insert closing quote',
      diagnostics: [expect.objectContaining({ code: 'unterminated-string' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 23,
          endLineNumber: 2,
          endColumn: 23,
        },
        text: '"',
      },
    });
    expect(fixes).toContainEqual({
      title: 'Insert missing }',
      diagnostics: [expect.objectContaining({ code: 'unclosed-delimiter' })],
      edit: {
        range: {
          startLineNumber: 3,
          startColumn: 18,
          endLineNumber: 3,
          endColumn: 18,
        },
        text: '}',
      },
    });
    expect(fixes).toContainEqual({
      title: 'Insert missing endif',
      diagnostics: [expect.objectContaining({ code: 'unclosed-block' })],
      edit: {
        range: {
          startLineNumber: 3,
          startColumn: 18,
          endLineNumber: 3,
          endColumn: 18,
        },
        text: '\nendif',
      },
    });
  });

  it('preserves the opening block indentation when inserting a missing close keyword', () => {
    const source = ['  while (connected)', '    suspend(1);'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual(
      expect.objectContaining({
        title: 'Insert missing endwhile',
        edit: expect.objectContaining({
          text: '\n  endwhile',
        }),
      }),
    );
  });

  it('offers a quick fix for mismatched block close keywords', () => {
    const source = ['if (valid(player))', '  notify(player, "ok");', 'endwhile'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Replace with endif',
      diagnostics: [expect.objectContaining({ code: 'mismatched-close' })],
      edit: {
        range: {
          startLineNumber: 3,
          startColumn: 1,
          endLineNumber: 3,
          endColumn: 9,
        },
        text: 'endif',
      },
    });
  });

  it('offers remove quick fixes for unexpected closers and delimiters', () => {
    const source = ['endif', 'value = listappend(items, item));'].join('\n');

    const fixes = getMooQuickFixes(source);

    expect(fixes).toContainEqual({
      title: 'Remove unexpected endif',
      diagnostics: [expect.objectContaining({ code: 'unexpected-close' })],
      edit: {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 6,
        },
        text: '',
      },
    });
    expect(fixes).toContainEqual({
      title: 'Remove unexpected )',
      diagnostics: [expect.objectContaining({ code: 'unexpected-delimiter' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 32,
          endLineNumber: 2,
          endColumn: 33,
        },
        text: '',
      },
    });
  });

  it('offers quick fixes for parser-reported missing syntax', () => {
    const source = 'notify(player, "ok")';

    expect(
      getMooQuickFixes(source, [
        {
          code: 'missing-node',
          lineNumber: 1,
          startColumn: 21,
          endColumn: 22,
          message: 'Tree-sitter recovered by inserting missing ;.',
          missingText: ';',
        },
      ]),
    ).toContainEqual({
      title: 'Insert missing ;',
      diagnostics: [expect.objectContaining({ code: 'missing-node' })],
      edit: {
        range: {
          startLineNumber: 1,
          startColumn: 21,
          endLineNumber: 1,
          endColumn: 21,
        },
        text: ';',
      },
    });
  });

  it('offers a quick fix to mark an unused local as intentionally ignored', () => {
    const source = ['used = 1;', 'unused = 2;', 'notify(player, used);'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Mark unused as intentionally ignored',
      diagnostics: [expect.objectContaining({ code: 'unused-local', severity: 'warning' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 1,
        },
        text: '_',
      },
    });
  });

  it('offers a quick fix to mark all unused locals as intentionally ignored', () => {
    const source = ['used = 1;', 'unused = 2;', 'stale = 3;', 'notify(player, used);'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Mark all unused locals as intentionally ignored',
      diagnostics: [
        expect.objectContaining({ code: 'unused-local', lineNumber: 2, severity: 'warning' }),
        expect.objectContaining({ code: 'unused-local', lineNumber: 3, severity: 'warning' }),
      ],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 1,
        },
        text: '_',
      },
      edits: [
        {
          range: {
            startLineNumber: 2,
            startColumn: 1,
            endLineNumber: 2,
            endColumn: 1,
          },
          text: '_',
        },
        {
          range: {
            startLineNumber: 3,
            startColumn: 1,
            endLineNumber: 3,
            endColumn: 1,
          },
          text: '_',
        },
      ],
    });
  });

  it('offers a quick fix to remove unreachable statement lines', () => {
    const source = ['return;', 'notify(player, "never");', 'notify(player, "also never");'].join(
      '\n',
    );

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Remove unreachable statement',
      diagnostics: [expect.objectContaining({ code: 'unreachable-statement' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 3,
          endColumn: 1,
        },
        text: '',
      },
    });
  });

  it('offers a quick fix to remove all unreachable statement lines', () => {
    const source = [
      'if (valid(player))',
      '  return E_PERM;',
      '  notify(player, "never if");',
      'else',
      '  return E_NONE;',
      '  notify(player, "never else");',
      'endif',
    ].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Remove all unreachable statements',
      diagnostics: [
        expect.objectContaining({ code: 'unreachable-statement', lineNumber: 3 }),
        expect.objectContaining({ code: 'unreachable-statement', lineNumber: 6 }),
      ],
      edit: {
        range: {
          startLineNumber: 3,
          startColumn: 1,
          endLineNumber: 4,
          endColumn: 1,
        },
        text: '',
      },
      edits: [
        {
          range: {
            startLineNumber: 3,
            startColumn: 1,
            endLineNumber: 4,
            endColumn: 1,
          },
          text: '',
        },
        {
          range: {
            startLineNumber: 6,
            startColumn: 1,
            endLineNumber: 7,
            endColumn: 1,
          },
          text: '',
        },
      ],
    });
  });

  it('offers a quick fix to initialize an undefined local before first use', () => {
    const source = ['if (valid(player))', '  notify(player, total);', 'endif'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Initialize total before use',
      diagnostics: [expect.objectContaining({ code: 'undefined-local' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 1,
        },
        text: '  total = 0;\n',
      },
    });
  });

  it('offers a quick fix to initialize all undefined locals before first use', () => {
    const source = ['if (valid(player))', '  notify(player, total + count);', 'endif'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Initialize all undefined locals before use',
      diagnostics: [
        expect.objectContaining({ code: 'undefined-local', lineNumber: 2, startColumn: 18 }),
        expect.objectContaining({ code: 'undefined-local', lineNumber: 2, startColumn: 26 }),
      ],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 1,
        },
        text: '  total = 0;\n  count = 0;\n',
      },
      edits: [
        {
          range: {
            startLineNumber: 2,
            startColumn: 1,
            endLineNumber: 2,
            endColumn: 1,
          },
          text: '  total = 0;\n  count = 0;\n',
        },
      ],
    });
  });

  it('offers a quick fix to replace an undefined local with a likely visible local typo target', () => {
    const source = ['total = 0;', 'notify(player, totla);'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Replace totla with total',
      diagnostics: [expect.objectContaining({ code: 'undefined-local' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 16,
          endLineNumber: 2,
          endColumn: 21,
        },
        text: 'total',
      },
    });
  });

  it('offers a quick fix to remove extra builtin arguments', () => {
    const source = 'notify(#1, "hello", 0, 1, 2);';

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Remove extra notify argument',
      diagnostics: [expect.objectContaining({ code: 'builtin-arity' })],
      edit: {
        range: {
          startLineNumber: 1,
          startColumn: 25,
          endLineNumber: 1,
          endColumn: 28,
        },
        text: '',
      },
    });
  });

  it('offers a quick fix to add missing builtin arguments', () => {
    const source = ['handle = 1;', 'rows = sqlite_query(handle);'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Add missing sqlite_query argument',
      diagnostics: [expect.objectContaining({ code: 'builtin-arity' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 27,
          endLineNumber: 2,
          endColumn: 27,
        },
        text: ', ""',
      },
    });
  });

  it('offers a quick fix to replace unknown builtin calls with likely ToastStunt builtin targets', () => {
    const source = 'notfiy(player, "hello");';

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Replace notfiy with notify',
      diagnostics: [expect.objectContaining({ code: 'unknown-builtin' })],
      edit: {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 7,
        },
        text: 'notify',
      },
    });
  });

  it('offers a quick fix to call unknown plain function names dynamically', () => {
    const source = 'custom_dispatch(player, "hello");';

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Call custom_dispatch dynamically',
      diagnostics: [expect.objectContaining({ code: 'unknown-builtin' })],
      edit: {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 17,
        },
        text: 'call_function("custom_dispatch", ',
      },
    });
  });

  it('offers a zero-argument dynamic call quick fix for unknown plain function names', () => {
    const source = 'custom_dispatch();';

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Call custom_dispatch dynamically',
      diagnostics: [expect.objectContaining({ code: 'unknown-builtin' })],
      edit: {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 17,
        },
        text: 'call_function("custom_dispatch"',
      },
    });
  });

  it('offers a quick fix to remove unknown loop labels from loop control statements', () => {
    const source = ['while outer (valid(player))', '  break missing;', 'endwhile'].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Remove unknown loop label',
      diagnostics: [expect.objectContaining({ code: 'unknown-loop-label' })],
      edit: {
        range: {
          startLineNumber: 2,
          startColumn: 8,
          endLineNumber: 2,
          endColumn: 16,
        },
        text: '',
      },
    });
  });

  it('offers a quick fix to replace unknown loop labels with likely visible label typo targets', () => {
    const source = [
      'while outer (valid(player))',
      '  for item in ({1, 2})',
      '    continue outter;',
      '  endfor',
      'endwhile',
    ].join('\n');

    expect(getMooQuickFixes(source)).toContainEqual({
      title: 'Replace outter with outer',
      diagnostics: [expect.objectContaining({ code: 'unknown-loop-label' })],
      edit: {
        range: {
          startLineNumber: 3,
          startColumn: 14,
          endLineNumber: 3,
          endColumn: 20,
        },
        text: 'outer',
      },
    });
  });
});
