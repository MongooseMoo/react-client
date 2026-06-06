import { describe, expect, it } from 'vitest';
import {
  analyzeMooSemantics,
  createMooRenameWorkspaceEdit,
  findMooDefinition,
  findMooDocumentHighlights,
  findMooReferences,
  findMooUndefinedLocalReferences,
  getMooCodeLenses,
  getMooLinkedEditingRanges,
  getMooLocalCompletions,
  getMooRenameLocation,
} from './semantics';

describe('MOO semantic model', () => {
  it('discovers local definitions from assignments, loops, forks, and scatter targets', () => {
    const source = [
      'total = 0;',
      'for item, index in (items)',
      '  {name, ?value = 0, @rest} = item;',
      '  fork task (0)',
      '    total = total + value;',
      '  endfork',
      'endfor',
      'try',
      '  raise(E_PERM);',
      'except error_code (E_PERM)',
      '  notify(player, error_code);',
      'endtry',
      '// ghost = no;',
      'notify(player, "item");',
    ].join('\n');

    const analysis = analyzeMooSemantics(source);

    expect(analysis.symbols.map((symbol) => symbol.name)).toEqual([
      'error_code',
      'index',
      'item',
      'name',
      'rest',
      'task',
      'total',
      'value',
    ]);
    expect(analysis.symbols.find((symbol) => symbol.name === 'ghost')).toBeUndefined();
    expect(analysis.symbols.find((symbol) => symbol.name === 'player')).toBeUndefined();
    expect(analysis.symbols.find((symbol) => symbol.name === 'notify')).toBeUndefined();
  });

  it('finds definitions and references for a local name at the cursor', () => {
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(findMooDefinition(source, positionFor(source, 'total +'))?.range).toEqual(
      wordRange(source, 'total', 1),
    );
    expect(findMooReferences(source, positionFor(source, 'total);'))).toEqual([
      { range: wordRange(source, 'total', 1) },
      { range: wordRange(source, 'total', 2) },
      { range: wordRange(source, 'total', 3) },
      { range: wordRange(source, 'total', 4) },
    ]);
  });

  it('finds read and write document highlights for the local name at the cursor', () => {
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(findMooDocumentHighlights(source, positionFor(source, 'total +'))).toEqual([
      { range: wordRange(source, 'total', 1), kind: 'write' },
      { range: wordRange(source, 'total', 2), kind: 'write' },
      { range: wordRange(source, 'total', 3), kind: 'read' },
      { range: wordRange(source, 'total', 4), kind: 'read' },
    ]);
    expect(findMooDocumentHighlights(source, positionFor(source, 'player'))).toEqual([]);
    expect(findMooDocumentHighlights('// total = 0;', { lineNumber: 1, column: 4 })).toEqual([]);
  });

  it('finds linked editing ranges for local names only', () => {
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(getMooLinkedEditingRanges(source, positionFor(source, 'total +'))).toEqual({
      ranges: [
        wordRange(source, 'total', 1),
        wordRange(source, 'total', 2),
        wordRange(source, 'total', 3),
        wordRange(source, 'total', 4),
      ],
      wordPattern: /[A-Za-z_][\w$]*/,
    });
    expect(getMooLinkedEditingRanges(source, positionFor(source, 'player'))).toBeNull();
    expect(getMooLinkedEditingRanges('// total = 0;', { lineNumber: 1, column: 4 })).toBeNull();
  });

  it('creates local symbol CodeLens summaries at primary definitions', () => {
    const source = [
      'total = 0;',
      'for item in (items)',
      '  total = total + item;',
      'endfor',
      'notify(player, total);',
      '// ghost = no;',
    ].join('\n');

    expect(getMooCodeLenses(source)).toEqual([
      {
        range: wordRange(source, 'total', 1),
        title: '2 definitions, 2 references',
        tooltip: 'Local total: 2 definitions, 2 references.',
      },
      {
        range: wordRange(source, 'item', 1),
        title: '1 definition, 1 reference',
        tooltip: 'Local item: 1 definition, 1 reference.',
      },
    ]);
  });

  it('creates whole-symbol rename edits and rejects invalid rename targets', () => {
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(createMooRenameWorkspaceEdit(source, positionFor(source, 'total +'), 'score')).toEqual({
      edits: [
        { range: wordRange(source, 'total', 1), text: 'score' },
        { range: wordRange(source, 'total', 2), text: 'score' },
        { range: wordRange(source, 'total', 3), text: 'score' },
        { range: wordRange(source, 'total', 4), text: 'score' },
      ],
    });
    expect(createMooRenameWorkspaceEdit(source, positionFor(source, 'total +'), '9bad')).toEqual({
      rejectReason: 'MOO identifiers must start with a letter or underscore.',
    });
    expect(createMooRenameWorkspaceEdit(source, positionFor(source, 'player'), 'actor')).toEqual({
      rejectReason: 'No local MOO symbol is available at this position.',
    });
  });

  it('resolves rename locations only for local MOO symbols', () => {
    const source = ['total = 0;', 'total = total + 1;', 'notify(player, total);'].join('\n');

    expect(getMooRenameLocation(source, positionFor(source, 'total +'))).toEqual({
      range: wordRange(source, 'total', 3),
      text: 'total',
    });
    expect(getMooRenameLocation(source, positionFor(source, 'player'))).toEqual({
      rejectReason: 'No local MOO symbol is available at this position.',
    });
    expect(getMooRenameLocation('// total = 0;', { lineNumber: 1, column: 4 })).toEqual({
      rejectReason: 'No local MOO symbol is available at this position.',
    });
  });

  it('offers local completions that are in scope before the cursor', () => {
    const source = ['total = 0;', 'for item in (items)', '  it', 'endfor'].join('\n');

    expect(getMooLocalCompletions(source, { lineNumber: 3, column: 5 })).toEqual([
      expect.objectContaining({ name: 'item' }),
      expect.objectContaining({ name: 'total' }),
    ]);
  });

  it('finds likely undefined local references without flagging language-owned names', () => {
    const source = [
      'total = count + 1;',
      'notify(player, total);',
      'player:tell(total);',
      'this.name = total;',
      '$utils:format(total);',
      'utils = total;',
      'notify(player, utils);',
      '// ghost;',
    ].join('\n');

    expect(findMooUndefinedLocalReferences(source)).toEqual([
      {
        name: 'count',
        range: wordRange(source, 'count', 1),
      },
    ]);
    expect(analyzeMooSemantics(source).symbols.map((symbol) => symbol.name)).toContain('utils');
  });

  it('reports local references that appear before their first definition', () => {
    const source = [
      'notify(player, total);',
      'total = 1;',
      'notify(player, total);',
      'for item in (items)',
      '  notify(player, item);',
      'endfor',
      'items = {};',
    ].join('\n');

    expect(findMooUndefinedLocalReferences(source)).toEqual([
      {
        name: 'total',
        range: wordRange(source, 'total', 1),
      },
      {
        name: 'items',
        range: wordRange(source, 'items', 1),
      },
    ]);
  });
});

function positionFor(source: string, text: string) {
  const offset = source.indexOf(text);
  if (offset < 0) {
    throw new Error(`Could not find ${text}`);
  }

  return positionAt(source, offset);
}

function wordRange(source: string, word: string, occurrence: number) {
  let offset = -1;
  for (let index = 0; index < occurrence; index += 1) {
    offset = source.indexOf(word, offset + 1);
    if (offset < 0) {
      throw new Error(`Could not find ${word} occurrence ${occurrence}`);
    }
  }

  const start = positionAt(source, offset);
  const end = positionAt(source, offset + word.length);

  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
}

function positionAt(source: string, offset: number) {
  let lineNumber = 1;
  let column = 1;

  for (let index = 0; index < offset; index += 1) {
    if (source[index] === '\n') {
      lineNumber += 1;
      column = 1;
      continue;
    }

    if (source[index] !== '\r') {
      column += 1;
    }
  }

  return { lineNumber, column };
}
