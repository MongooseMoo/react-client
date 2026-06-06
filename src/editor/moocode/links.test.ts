import { describe, expect, it } from 'vitest';
import { findMooDocumentLinkAtPosition, getMooDocumentLinks } from './links';

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

  it('links dollar system-property references to stable MOO system URIs', () => {
    const source = 'notify($player, $string_utils:english_list(names));';

    expect(getMooDocumentLinks(source)).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 8,
          endLineNumber: 1,
          endColumn: 15,
        },
        url: 'moo://system/player',
        tooltip: 'Open MOO system reference $player',
      },
      {
        range: {
          startLineNumber: 1,
          startColumn: 17,
          endLineNumber: 1,
          endColumn: 30,
        },
        url: 'moo://system/string_utils',
        tooltip: 'Open MOO system reference $string_utils',
      },
    ]);
  });

  it('does not consume invalid dollar-separated text as one system reference', () => {
    const source = '$room$extra:announce("bad");';

    expect(getMooDocumentLinks(source)).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 6,
        },
        url: 'moo://system/room',
        tooltip: 'Open MOO system reference $room',
      },
      {
        range: {
          startLineNumber: 1,
          startColumn: 6,
          endLineNumber: 1,
          endColumn: 12,
        },
        url: 'moo://system/extra',
        tooltip: 'Open MOO system reference $extra',
      },
    ]);
  });

  it('ignores object-looking text inside comments and strings', () => {
    const source = [
      '// owner = #123; $player',
      'notify(player, "#456 $string_utils");',
      'real = #789;',
    ].join('\n');

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

  it('finds the link target under the cursor for navigation providers', () => {
    const source = 'owner = #123;\nnotify($player, "ok");';

    expect(findMooDocumentLinkAtPosition(source, { lineNumber: 1, column: 10 })).toEqual({
      range: {
        startLineNumber: 1,
        startColumn: 9,
        endLineNumber: 1,
        endColumn: 13,
      },
      url: 'moo://object/123',
      tooltip: 'Open MOO object #123',
    });
    expect(findMooDocumentLinkAtPosition(source, { lineNumber: 2, column: 10 })).toEqual({
      range: {
        startLineNumber: 2,
        startColumn: 8,
        endLineNumber: 2,
        endColumn: 15,
      },
      url: 'moo://system/player',
      tooltip: 'Open MOO system reference $player',
    });
  });

  it('does not find cursor link targets inside masked comments and strings', () => {
    const source = '// #123\nnotify(player, "$player");';

    expect(findMooDocumentLinkAtPosition(source, { lineNumber: 1, column: 5 })).toBeNull();
    expect(findMooDocumentLinkAtPosition(source, { lineNumber: 2, column: 18 })).toBeNull();
  });
});
