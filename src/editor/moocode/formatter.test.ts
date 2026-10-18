import { describe, expect, it } from 'vitest';
import { formatMooCode, formatMooCodeRange } from './formatter';

describe('MOO formatter', () => {
  it('indents block bodies and aligns middle and close keywords', () => {
    const source = [
      'if (valid(player))',
      'notify(player, "here");',
      'elseif (player == this)',
      'return player;',
      'else',
      'try',
      'move(this, player.location);',
      'except e (ANY)',
      'raise(E_PERM, tostr(e));',
      'finally',
      'notify(player, "done");',
      'endtry',
      'endif',
    ].join('\n');

    expect(formatMooCode(source, { tabSize: 2, insertSpaces: true })).toBe(
      [
        'if (valid(player))',
        '  notify(player, "here");',
        'elseif (player == this)',
        '  return player;',
        'else',
        '  try',
        '    move(this, player.location);',
        '  except e (ANY)',
        '    raise(E_PERM, tostr(e));',
        '  finally',
        '    notify(player, "done");',
        '  endtry',
        'endif',
      ].join('\n'),
    );
  });

  it('preserves comment and string content while ignoring keyword-looking text inside them', () => {
    const source = [
      'while (valid(player))',
      '  // endif should not dedent this comment',
      'notify(player, "else endif");   ',
      '/*',
      'endwhile',
      '*/',
      'endwhile',
    ].join('\n');

    expect(formatMooCode(source, { tabSize: 4, insertSpaces: true })).toBe(
      [
        'while (valid(player))',
        '    // endif should not dedent this comment',
        '    notify(player, "else endif");',
        '    /*',
        '    endwhile',
        '    */',
        'endwhile',
      ].join('\n'),
    );
  });

  it('uses tabs when Monaco formatting options request tabs', () => {
    const source = ['for x in ({1, 2})', 'notify(player, tostr(x));', 'endfor'].join('\n');

    expect(formatMooCode(source, { tabSize: 2, insertSpaces: false })).toBe(
      ['for x in ({1, 2})', '\tnotify(player, tostr(x));', 'endfor'].join('\n'),
    );
  });

  it('formats selected full lines while preserving surrounding block context', () => {
    const source = [
      'if (valid(player))',
      'notify(player, "here");',
      'endif',
      'notify(player, "done");',
    ].join('\n');

    expect(
      formatMooCodeRange(
        source,
        {
          startLineNumber: 2,
          startColumn: 5,
          endLineNumber: 2,
          endColumn: 12,
        },
        { tabSize: 2, insertSpaces: true },
      ),
    ).toEqual({
      range: {
        startLineNumber: 2,
        startColumn: 1,
        endLineNumber: 2,
        endColumn: 24,
      },
      text: '  notify(player, "here");',
    });
  });
});
