import { describe, expect, it } from 'vitest';
import {
  analyzeMooSemantics,
  createMooRenameWorkspaceEdit,
  findMooDefinition,
  findMooReferences,
  getMooLocalCompletions,
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
      '// ghost = no;',
      'notify(player, "item");',
    ].join('\n');

    const analysis = analyzeMooSemantics(source);

    expect(analysis.symbols.map((symbol) => symbol.name)).toEqual([
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

  it('offers local completions that are in scope before the cursor', () => {
    const source = ['total = 0;', 'for item in (items)', '  it', 'endfor'].join('\n');

    expect(getMooLocalCompletions(source, { lineNumber: 3, column: 5 })).toEqual([
      expect.objectContaining({ name: 'item' }),
      expect.objectContaining({ name: 'total' }),
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
