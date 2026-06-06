import { MOO_SYSTEM_REFERENCE_PATTERN_SOURCE } from './contract';
import { getMooBuiltinReferences } from './builtinNavigation';
import type { MonacoRange } from './language';
import { maskMooSource, offsetAtMooPosition, positionAtMooOffset } from './scanner';

export type MooDocumentLink = {
  range: MonacoRange;
  url: string;
  tooltip: string;
};

const OBJECT_REFERENCE_PATTERN = /#-?\d+/g;
const SYSTEM_REFERENCE_PATTERN = new RegExp(MOO_SYSTEM_REFERENCE_PATTERN_SOURCE, 'g');

export function getMooDocumentLinks(source: string): MooDocumentLink[] {
  const masked = maskMooSource(source);

  const objectLinks = [...masked.matchAll(OBJECT_REFERENCE_PATTERN)].map((match) => {
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
  const systemLinks = [...masked.matchAll(SYSTEM_REFERENCE_PATTERN)].map((match) => {
    const text = match[0];
    const startOffset = match.index;
    const endOffset = startOffset + text.length;
    const propertyName = text.slice(1);

    return {
      range: rangeFromOffsets(source, startOffset, endOffset),
      url: `moo://system/${propertyName}`,
      tooltip: `Open MOO system reference ${text}`,
    };
  });
  const builtinLinks = getMooBuiltinReferences(source).map((reference) => ({
    range: reference.range,
    url: reference.url,
    tooltip: `Open ToastStunt builtin ${reference.name}`,
  }));

  return [...objectLinks, ...systemLinks, ...builtinLinks].sort(
    (left, right) =>
      left.range.startLineNumber - right.range.startLineNumber ||
      left.range.startColumn - right.range.startColumn,
  );
}

export function findMooDocumentLinkAtPosition(
  source: string,
  position: { lineNumber: number; column: number },
): MooDocumentLink | null {
  const positionOffset = offsetAtMooPosition(source, position);

  return (
    getMooDocumentLinks(source).find((link) => {
      const startOffset = offsetAtMooPosition(source, {
        lineNumber: link.range.startLineNumber,
        column: link.range.startColumn,
      });
      const endOffset = offsetAtMooPosition(source, {
        lineNumber: link.range.endLineNumber,
        column: link.range.endColumn,
      });

      return positionOffset >= startOffset && positionOffset <= endOffset;
    }) ?? null
  );
}

export function findMooDocumentLinkReferences(
  source: string,
  position: { lineNumber: number; column: number },
): MooDocumentLink[] {
  const target = findMooDocumentLinkAtPosition(source, position);
  if (!target) {
    return [];
  }

  return getMooDocumentLinks(source).filter((link) => link.url === target.url);
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
