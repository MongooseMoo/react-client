import { describe, expect, it } from 'vitest';
import { lineCommentsToStringStatements, stringStatementsToLineComments } from './lineComments';

describe('MOO line comments', () => {
  it('turns whole-line // comments into string statements', () => {
    expect(
      lineCommentsToStringStatements([
        '// plain',
        '  //no space after slashes',
        '\t// tab indent',
        '//',
        '// say "hi" \\ bye',
      ]),
    ).toEqual([
      '"plain";',
      '  "no space after slashes";',
      '\t"tab indent";',
      '"";',
      '"say \\"hi\\" \\\\ bye";',
    ]);
  });

  it('leaves code, trailing comments and strings containing // alone', () => {
    const lines = ['x = 1; // trailing', 'url = "http://example.com";', 'y = a / b;'];

    expect(lineCommentsToStringStatements(lines)).toEqual(lines);
  });

  it('turns string statements into // comments', () => {
    expect(
      stringStatementsToLineComments([
        '"plain";',
        '  "indented";',
        '"";',
        '"say \\"hi\\" \\\\ bye";',
      ]),
    ).toEqual(['// plain', '  // indented', '//', '// say "hi" \\ bye']);
  });

  it('only converts lines that are a single string literal statement', () => {
    const lines = [
      '"a" + "b";',
      'return "x";',
      '"unterminated;',
      '"x"; y = 1;',
      'notify(player, "x");',
    ];

    expect(stringStatementsToLineComments(lines)).toEqual(lines);
  });

  it('round-trips string statements through // comments', () => {
    const lines = ['"plain";', '  "  keeps inner spacing";', '"";', '"q\\"uote \\\\";', 'x = 1;'];

    expect(lineCommentsToStringStatements(stringStatementsToLineComments(lines))).toEqual(lines);
  });
});
