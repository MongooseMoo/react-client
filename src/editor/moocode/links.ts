import type { MonacoRange } from './language';
import { maskMooSource, positionAtMooOffset } from './scanner';

export type MooDocumentLink = {
  range: MonacoRange;
  url: string;
  tooltip: string;
};

const OBJECT_REFERENCE_PATTERN = /#-?\d+/g;

export function getMooDocumentLinks(source: string): MooDocumentLink[] {
  const masked = maskMooSource(source);

  return [...masked.matchAll(OBJECT_REFERENCE_PATTERN)].map((match) => {
    const text = match[0];
    const startOffset = match.index;
    const endOffset = startOffset + text.length;
    const objectNumber = text.slice(1);

    return {
      range: rangeFromOffsets(source, startOffset, endOffset),
      url: `moo://object/${objectNumber}`,
      tooltip: `Open MOO object ${text}`,
    };
  });
}

function rangeFromOffsets(source: string, startOffset: number, endOffset: number): MonacoRange {
  const start = positionAtMooOffset(source, startOffset);
  const end = positionAtMooOffset(source, endOffset);

  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
}
