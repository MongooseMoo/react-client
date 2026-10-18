import { describe, expect, it } from 'vitest';
import {
  findMooDocumentLinkAtPosition,
  findMooDocumentLinkReferences,
  getMooDocumentLinks,
} from './links';

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
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 7,
        },
        url: 'moo://builtin/notify',
        tooltip: 'Open ToastStunt builtin notify',
      },
      {
        range: {
          startLineNumber: 2,
          startColumn: 16,
          endLineNumber: 2,
          endColumn: 21,
        },
        url: 'moo://builtin/tostr',
        tooltip: 'Open ToastStunt builtin tostr',
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
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 7,
        },
        url: 'moo://builtin/notify',
        tooltip: 'Open ToastStunt builtin notify',
      },
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
      {
        range: {
          startLineNumber: 1,
          startColumn: 31,
          endLineNumber: 1,
          endColumn: 43,
        },
        url: 'moo://verb/system/string_utils/english_list',
        tooltip: 'Open MOO verb $string_utils:english_list',
      },
    ]);
  });

  it('links ToastStunt builtin calls to stable builtin URIs', () => {
    const source = [
      'notify(player, "hi");',
      'if (valid(player))',
      '  player:notify("verb");',
      'endif',
      '// notify(player, "comment");',
      '"valid(player)"',
    ].join('\n');

    expect(getMooDocumentLinks(source)).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 7,
        },
        url: 'moo://builtin/notify',
        tooltip: 'Open ToastStunt builtin notify',
      },
      {
        range: {
          startLineNumber: 2,
          startColumn: 5,
          endLineNumber: 2,
          endColumn: 10,
        },
        url: 'moo://builtin/valid',
        tooltip: 'Open ToastStunt builtin valid',
      },
    ]);
  });

  it('links static object and system verb calls to stable MOO verb URIs', () => {
    const source = [
      '#123:initialize(player);',
      '$room:announce("ok");',
      'player:tell("local receiver");',
      'player:(verb_name)("dynamic");',
    ].join('\n');

    expect(getMooDocumentLinks(source)).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 5,
        },
        url: 'moo://object/123',
        tooltip: 'Open MOO object #123',
      },
      {
        range: {
          startLineNumber: 1,
          startColumn: 6,
          endLineNumber: 1,
          endColumn: 16,
        },
        url: 'moo://verb/object/123/initialize',
        tooltip: 'Open MOO verb #123:initialize',
      },
      {
        range: {
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 6,
        },
        url: 'moo://system/room',
        tooltip: 'Open MOO system reference $room',
      },
      {
        range: {
          startLineNumber: 2,
          startColumn: 7,
          endLineNumber: 2,
          endColumn: 15,
        },
        url: 'moo://verb/system/room/announce',
        tooltip: 'Open MOO verb $room:announce',
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
          startLineNumber: 2,
          startColumn: 1,
          endLineNumber: 2,
          endColumn: 7,
        },
        url: 'moo://builtin/notify',
        tooltip: 'Open ToastStunt builtin notify',
      },
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
    const source = 'owner = #123;\nnotify($player, "ok");\n#123:initialize(player);';

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
    expect(findMooDocumentLinkAtPosition(source, { lineNumber: 3, column: 10 })).toEqual({
      range: {
        startLineNumber: 3,
        startColumn: 6,
        endLineNumber: 3,
        endColumn: 16,
      },
      url: 'moo://verb/object/123/initialize',
      tooltip: 'Open MOO verb #123:initialize',
    });
  });

  it('does not find cursor link targets inside masked comments and strings', () => {
    const source = '// #123\nnotify(player, "$player");';

    expect(findMooDocumentLinkAtPosition(source, { lineNumber: 1, column: 5 })).toBeNull();
    expect(findMooDocumentLinkAtPosition(source, { lineNumber: 2, column: 18 })).toBeNull();
  });

  it('finds same-target object and system reference links', () => {
    const source = [
      'owner = #123;',
      'if (#123 != #-1)',
      '  notify($player, $player.name);',
      'endif',
      '// #123 $player',
    ].join('\n');

    expect(findMooDocumentLinkReferences(source, { lineNumber: 1, column: 10 })).toEqual([
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
          startColumn: 5,
          endLineNumber: 2,
          endColumn: 9,
        },
        url: 'moo://object/123',
        tooltip: 'Open MOO object #123',
      },
    ]);
    expect(findMooDocumentLinkReferences(source, { lineNumber: 3, column: 21 })).toEqual([
      {
        range: {
          startLineNumber: 3,
          startColumn: 10,
          endLineNumber: 3,
          endColumn: 17,
        },
        url: 'moo://system/player',
        tooltip: 'Open MOO system reference $player',
      },
      {
        range: {
          startLineNumber: 3,
          startColumn: 19,
          endLineNumber: 3,
          endColumn: 26,
        },
        url: 'moo://system/player',
        tooltip: 'Open MOO system reference $player',
      },
    ]);
  });

  it('finds same-target builtin call links', () => {
    const source = [
      'notify(player, "hi");',
      'if (valid(player))',
      '  notify(player, "still here");',
      'endif',
      'player:notify("verb");',
    ].join('\n');

    expect(findMooDocumentLinkReferences(source, { lineNumber: 1, column: 3 })).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 7,
        },
        url: 'moo://builtin/notify',
        tooltip: 'Open ToastStunt builtin notify',
      },
      {
        range: {
          startLineNumber: 3,
          startColumn: 3,
          endLineNumber: 3,
          endColumn: 9,
        },
        url: 'moo://builtin/notify',
        tooltip: 'Open ToastStunt builtin notify',
      },
    ]);
  });

  it('finds same-target static object and system verb call links', () => {
    const source = [
      '#123:initialize(player);',
      '#123:initialize(caller);',
      '#124:initialize(player);',
      '$room:announce("one");',
      '$room:announce("two");',
    ].join('\n');

    expect(findMooDocumentLinkReferences(source, { lineNumber: 1, column: 8 })).toEqual([
      {
        range: {
          startLineNumber: 1,
          startColumn: 6,
          endLineNumber: 1,
          endColumn: 16,
        },
        url: 'moo://verb/object/123/initialize',
        tooltip: 'Open MOO verb #123:initialize',
      },
      {
        range: {
          startLineNumber: 2,
          startColumn: 6,
          endLineNumber: 2,
          endColumn: 16,
        },
        url: 'moo://verb/object/123/initialize',
        tooltip: 'Open MOO verb #123:initialize',
      },
    ]);
    expect(findMooDocumentLinkReferences(source, { lineNumber: 4, column: 9 })).toEqual([
      {
        range: {
          startLineNumber: 4,
          startColumn: 7,
          endLineNumber: 4,
          endColumn: 15,
        },
        url: 'moo://verb/system/room/announce',
        tooltip: 'Open MOO verb $room:announce',
      },
      {
        range: {
          startLineNumber: 5,
          startColumn: 7,
          endLineNumber: 5,
          endColumn: 15,
        },
        url: 'moo://verb/system/room/announce',
        tooltip: 'Open MOO verb $room:announce',
      },
    ]);
  });
});
