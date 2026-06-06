import { describe, expect, it } from 'vitest';
import {
  MOO_SEMANTIC_TOKEN_LEGEND,
  collectMooSemanticTokens,
  encodeMooSemanticTokens,
  encodeMooSemanticTokensForRange,
} from './semanticTokens';

describe('MOO semantic tokens', () => {
  it('classifies locals, builtins, system references, literals, comments, and strings', () => {
    const source = [
      'total = 0;',
      'for item in (items)',
      '  notify(player, total);',
      '  $room:announce("ok"); // speak',
      '  raise(E_PERM);',
      'endfor',
    ].join('\n');

    expect(tokenSummary(source)).toEqual(
      expect.arrayContaining([
        '1:1:total:variable:declaration',
        '1:9:0:number:',
        '2:1:for:keyword:',
        '2:5:item:variable:declaration',
        '3:3:notify:function:defaultLibrary',
        '3:10:player:variable:defaultLibrary',
        '3:18:total:variable:',
        '4:3:$room:variable:defaultLibrary',
        '4:18:"ok":string:',
        '4:25:// speak:comment:',
        '5:9:E_PERM:type:defaultLibrary',
      ]),
    );
  });

  it('does not include invalid dollar-separated text in MOO identifier tokens', () => {
    const source = ['$room_extra:announce("ok");', '$room$extra:announce("bad");'].join('\n');

    expect(tokenSummary(source)).toEqual(
      expect.arrayContaining([
        '1:1:$room_extra:variable:defaultLibrary',
        '1:13:announce:function:',
        '2:1:$room:variable:defaultLibrary',
      ]),
    );
    expect(tokenSummary(source)).not.toEqual(
      expect.arrayContaining(['2:1:$room$extra:variable:defaultLibrary']),
    );
  });

  it('classifies loop labels as semantic variables with declaration modifiers', () => {
    const source = [
      'while outer (valid(player))',
      '  continue outer;',
      '  break outer;',
      'endwhile',
    ].join('\n');

    expect(tokenSummary(source)).toEqual(
      expect.arrayContaining([
        '1:7:outer:variable:declaration',
        '2:12:outer:variable:',
        '3:9:outer:variable:',
      ]),
    );
  });

  it('encodes Monaco semantic tokens in line-relative order', () => {
    const encoded = encodeMooSemanticTokens('total = 0;\nnotify(player, total);');

    expect(encoded.resultId).toBeUndefined();
    expect(Array.from(encoded.data)).toEqual([
      0,
      0,
      5,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('variable'),
      1,
      0,
      8,
      1,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('number'),
      0,
      1,
      0,
      6,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('function'),
      2,
      0,
      7,
      6,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('variable'),
      2,
      0,
      8,
      5,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('variable'),
      0,
    ]);
  });

  it('encodes Monaco semantic tokens scoped to a requested range', () => {
    const encoded = encodeMooSemanticTokensForRange('total = 0;\nnotify(player, total);\n// done', {
      startLineNumber: 2,
      startColumn: 1,
      endLineNumber: 2,
      endColumn: 29,
    });

    expect(Array.from(encoded.data)).toEqual([
      1,
      0,
      6,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('function'),
      2,
      0,
      7,
      6,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('variable'),
      2,
      0,
      8,
      5,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf('variable'),
      0,
    ]);
  });
});

function tokenSummary(source: string): string[] {
  return collectMooSemanticTokens(source).map((token) =>
    [
      token.lineNumber,
      token.startColumn,
      token.text,
      token.tokenType,
      token.tokenModifiers.join(','),
    ].join(':'),
  );
}
