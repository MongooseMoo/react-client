import { describe, expect, it } from 'vitest';
import { getMooDocumentLinks } from './links';

describe('MOO document links', () => {
  it('links object number references to stable MOO object URIs', () => {
    const source = ['owner = #123;', 'notify(player, tostr(#-1));'].join('\n');

    expect(getMooDocumentLinks(source)).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 9,
          endLineNumber: 1,
          endColumn: 13,
        },
        url: 'moo://object/123',
        tooltip: 'Open MOO object #123',
      },
      {
        range: {
          startLineNumber: 2,
          startColumn: 22,
          endLineNumber: 2,
          endColumn: 25,
        },
        url: 'moo://object/-1',
        tooltip: 'Open MOO object #-1',
      },
    ]);
  });

  it('ignores object-looking text inside comments and strings', () => {
    const source = ['// owner = #123;', 'notify(player, "#456");', 'real = #789;'].join('\n');

    expect(getMooDocumentLinks(source)).toEqual([
      {
        range: {
          startLineNumber: 3,
          startColumn: 8,
          endLineNumber: 3,
          endColumn: 12,
        },
        url: 'moo://object/789',
        tooltip: 'Open MOO object #789',
      },
    ]);
  });
});
