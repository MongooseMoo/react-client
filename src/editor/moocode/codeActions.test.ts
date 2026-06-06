import { describe, expect, it } from 'vitest';
import { getMooQuickFixes } from './codeActions';

describe('MOO code actions', () => {
  it('offers quick fixes for missing block, delimiter, and string closers', () => {
    const source = ['if (valid(player))', '  text = "unterminated', '  values = {1, 2;'].join(
      '\n',
    );

    expect(getMooQuickFixes(source)).toEqual([
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
    ]);
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
});
