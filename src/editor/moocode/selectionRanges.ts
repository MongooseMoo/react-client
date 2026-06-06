import { maskMooSource, offsetAtMooPosition, type MooSourcePosition } from './scanner';
import { analyzeMooStructure, type MooStructureRange, type MooStructureSymbol } from './structure';

export type MooSelectionRange = {
  range: MooStructureRange;
  parent?: MooSelectionRange;
};

export function getMooSelectionRanges(
  source: string,
  positions: MooSourcePosition[],
): MooSelectionRange[] {
  return positions.map((position) => createSelectionRange(source, position));
}

function createSelectionRange(source: string, position: MooSourcePosition): MooSelectionRange {
  const ranges = [
    wordRangeAt(source, position),
    lineRangeAt(source, position.lineNumber),
    ...enclosingBlockRanges(source, position),
    documentRange(source),
  ].filter((range): range is MooStructureRange => Boolean(range));

  return chainRanges(dedupeRanges(ranges));
}

function wordRangeAt(source: string, position: MooSourcePosition): MooStructureRange | null {
  const masked = maskMooSource(source);
  const offset = offsetAtMooPosition(masked, position);
  const offsets = wordOffsetsAt(masked, offset);
  if (!offsets) {
    return null;
  }

  return rangeFromOffsets(source, offsets.startOffset, offsets.endOffset);
}

function lineRangeAt(source: string, lineNumber: number): MooStructureRange {
  const line = source.split(/\r\n|\r|\n/)[lineNumber - 1] ?? '';
  const leadingWhitespace = /^\s*/.exec(line)?.[0].length ?? 0;
  const trailingWhitespace = /\s*$/.exec(line)?.[0].length ?? 0;
  const startColumn = Math.min(line.length + 1, leadingWhitespace + 1);
  const endColumn = Math.max(startColumn, line.length - trailingWhitespace + 1);

  return {
    startLineNumber: lineNumber,
    startColumn,
    endLineNumber: lineNumber,
    endColumn,
  };
}

function enclosingBlockRanges(source: string, position: MooSourcePosition): MooStructureRange[] {
  const symbols = flattenSymbols(analyzeMooStructure(source).symbols);

  return symbols
    .filter((symbol) => containsPosition(symbol.range, position))
    .sort((left, right) => rangeSize(left.range) - rangeSize(right.range))
    .map((symbol) => symbol.range);
}

function documentRange(source: string): MooStructureRange {
  const lines = source.split(/\r\n|\r|\n/);
  const lastLineNumber = Math.max(1, lines.length);
  const lastLine = lines[lastLineNumber - 1] ?? '';

  return {
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: lastLineNumber,
    endColumn: lastLine.length + 1,
  };
}

function chainRanges(ranges: MooStructureRange[]): MooSelectionRange {
  const [range, ...parents] = ranges;
  if (!range) {
    return { range: documentRange('') };
  }

  const selectionRange: MooSelectionRange = { range };
  let current = selectionRange;

  for (const parentRange of parents) {
    current.parent = { range: parentRange };
    current = current.parent;
  }

  return selectionRange;
}

function dedupeRanges(ranges: MooStructureRange[]): MooStructureRange[] {
  const seen = new Set<string>();
  const unique: MooStructureRange[] = [];

  for (const range of ranges) {
    const key = rangeKey(range);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(range);
  }

  return unique;
}

function flattenSymbols(symbols: MooStructureSymbol[]): MooStructureSymbol[] {
  return symbols.flatMap((symbol) => [symbol, ...flattenSymbols(symbol.children)]);
}

function wordOffsetsAt(
  source: string,
  offset: number,
): { startOffset: number; endOffset: number } | null {
  const candidateOffset =
    isWordCharacter(source[offset]) || !isWordCharacter(source[offset - 1]) ? offset : offset - 1;
  if (!isWordCharacter(source[candidateOffset])) {
    return null;
  }

  let startOffset = candidateOffset;
  while (startOffset > 0 && isWordCharacter(source[startOffset - 1])) {
    startOffset -= 1;
  }

  let endOffset = candidateOffset + 1;
  while (endOffset < source.length && isWordCharacter(source[endOffset])) {
    endOffset += 1;
  }

  return { startOffset, endOffset };
}

function isWordCharacter(character: string | undefined): boolean {
  return Boolean(character && /[\w$]/.test(character));
}

function rangeFromOffsets(
  source: string,
  startOffset: number,
  endOffset: number,
): MooStructureRange {
  const start = positionAt(source, startOffset);
  const end = positionAt(source, endOffset);

  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
}

function positionAt(source: string, offset: number): MooSourcePosition {
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

function containsPosition(range: MooStructureRange, position: MooSourcePosition): boolean {
  if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
    return false;
  }

  if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
    return false;
  }

  if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
    return false;
  }

  return true;
}

function rangeSize(range: MooStructureRange): number {
  return (
    (range.endLineNumber - range.startLineNumber) * 10000 +
    (range.endColumn - range.startColumn)
  );
}

function rangeKey(range: MooStructureRange): string {
  return [
    range.startLineNumber,
    range.startColumn,
    range.endLineNumber,
    range.endColumn,
  ].join(':');
}
