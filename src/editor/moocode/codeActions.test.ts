import { describe, expect, it } from 'vitest';
import { getMooQuickFixes } from './codeActions';

describe('MOO code actions', () => {
  it('offers quick fixes for missing block, delimiter, and string closers', () => {
    const source = ['if (valid(player))', '  text = "unterminated', '  values = {1, 2;'].join(
      '\n',
    );

    const fixes = getMooQuickFixes(source);

    expect(fixes).toContainEqual(
      {
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
      },
    );
    expect(fixes).toContainEqual(
      {
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
      },
    );
    expect(fixes).toContainEqual(
      {
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
      },
    );
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

    expect(fixes).toContainEqual(
      {
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
      },
    );
    expect(fixes).toContainEqual(
      {
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
      },
    );
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
});
