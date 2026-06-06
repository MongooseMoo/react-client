import { MOO_SYSTEM_REFERENCE_PATTERN_SOURCE } from './contract';
import { readMooCallTargetBeforeOpen } from './calls';
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
const IDENTIFIER_CHARACTER_PATTERN = /^[A-Za-z0-9_]$/;

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
  const verbLinks = getMooStaticVerbLinks(source, masked);

  return [...objectLinks, ...systemLinks, ...builtinLinks, ...verbLinks].sort(
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

function getMooStaticVerbLinks(source: string, masked: string): MooDocumentLink[] {
  const links: MooDocumentLink[] = [];

  for (let index = 0; index < masked.length; index += 1) {
    if (masked[index] !== '(') {
      continue;
    }

    const target = readMooCallTargetBeforeOpen(masked, index);
    if (target?.callKind !== 'verb') {
      continue;
    }

    const receiver = toStableVerbReceiver(target.receiverName);
    if (!receiver) {
      continue;
    }

    const verbSpan = readIdentifierSpanBefore(masked, index);
    if (!verbSpan || verbSpan.name !== target.functionName) {
      continue;
    }

    if (!hasStableReceiverBoundary(masked, verbSpan.startOffset, target.receiverName)) {
      continue;
    }

    links.push({
      range: rangeFromOffsets(source, verbSpan.startOffset, verbSpan.endOffset),
      url: `moo://verb/${receiver.kind}/${receiver.name}/${target.functionName.toLowerCase()}`,
      tooltip: `Open MOO verb ${target.receiverName}:${target.functionName}`,
    });
  }

  return links;
}

function toStableVerbReceiver(
  receiverName: string,
): { kind: 'object' | 'system'; name: string } | null {
  if (/^#-?\d+$/.test(receiverName)) {
    return { kind: 'object', name: receiverName.slice(1) };
  }

  if (/^\$[A-Za-z_][A-Za-z0-9_]*$/.test(receiverName)) {
    return { kind: 'system', name: receiverName.slice(1) };
  }

  return null;
}

function hasStableReceiverBoundary(
  source: string,
  verbStartOffset: number,
  receiverName: string,
): boolean {
  const colonIndex = previousNonWhitespaceIndex(source, verbStartOffset - 1);
  if (colonIndex === null || source[colonIndex] !== ':') {
    return false;
  }

  const receiverEndIndex = previousNonWhitespaceIndex(source, colonIndex - 1);
  if (receiverEndIndex === null) {
    return false;
  }

  const receiverStartIndex = receiverEndIndex - receiverName.length + 1;
  if (
    receiverStartIndex < 0 ||
    source.slice(receiverStartIndex, receiverEndIndex + 1) !== receiverName
  ) {
    return false;
  }

  return (
    receiverStartIndex === 0 || !IDENTIFIER_CHARACTER_PATTERN.test(source[receiverStartIndex - 1])
  );
}

function readIdentifierSpanBefore(
  source: string,
  openParenIndex: number,
): { name: string; endOffset: number; startOffset: number } | null {
  let endOffset = openParenIndex;
  while (endOffset > 0 && /\s/.test(source[endOffset - 1])) {
    endOffset -= 1;
  }

  let startOffset = endOffset;
  while (startOffset > 0 && IDENTIFIER_CHARACTER_PATTERN.test(source[startOffset - 1])) {
    startOffset -= 1;
  }

  const name = source.slice(startOffset, endOffset);

  return startOffset === endOffset ? null : { name, endOffset, startOffset };
}

function previousNonWhitespaceIndex(source: string, startIndex: number): number | null {
  for (let index = startIndex; index >= 0; index -= 1) {
    if (!/\s/.test(source[index])) {
      return index;
    }
  }

  return null;
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
