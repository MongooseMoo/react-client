import { getMooBuiltinMetadata } from './builtins';
import { readMooCallTargetBeforeOpen } from './calls';
import type { MonacoRange } from './language';
import { maskMooSource, offsetAtMooPosition, positionAtMooOffset } from './scanner';

export type MooBuiltinReference = {
  name: string;
  range: MonacoRange;
  url: string;
};

const IDENTIFIER_CHARACTER_PATTERN = /^[A-Za-z0-9_]$/;

export function findMooBuiltinAtPosition(
  source: string,
  position: { lineNumber: number; column: number },
): MooBuiltinReference | null {
  const positionOffset = offsetAtMooPosition(source, position);

  return (
    getMooBuiltinReferences(source).find((reference) => {
      const startOffset = offsetAtMooPosition(source, {
        lineNumber: reference.range.startLineNumber,
        column: reference.range.startColumn,
      });
      const endOffset = offsetAtMooPosition(source, {
        lineNumber: reference.range.endLineNumber,
        column: reference.range.endColumn,
      });

      return positionOffset >= startOffset && positionOffset <= endOffset;
    }) ?? null
  );
}

export function findMooBuiltinReferences(
  source: string,
  position: { lineNumber: number; column: number },
): MooBuiltinReference[] {
  const target = findMooBuiltinAtPosition(source, position);
  if (!target) {
    return [];
  }

  const targetName = target.name.toLowerCase();
  return getMooBuiltinReferences(source).filter(
    (reference) => reference.name.toLowerCase() === targetName,
  );
}

export function getMooBuiltinReferences(source: string): MooBuiltinReference[] {
  const masked = maskMooSource(source);
  const references: MooBuiltinReference[] = [];

  for (let index = 0; index < masked.length; index += 1) {
    if (masked[index] !== '(') {
      continue;
    }

    const callTarget = readMooCallTargetBeforeOpen(masked, index);
    if (callTarget?.callKind !== 'function' || !getMooBuiltinMetadata(callTarget.functionName)) {
      continue;
    }

    const span = readIdentifierSpanBefore(masked, index);
    if (!span) {
      continue;
    }

    references.push({
      name: callTarget.functionName,
      range: rangeFromOffsets(source, span.startOffset, span.endOffset),
      url: `moo://builtin/${callTarget.functionName.toLowerCase()}`,
    });
  }

  return references;
}

function readIdentifierSpanBefore(
  source: string,
  openParenIndex: number,
): { endOffset: number; startOffset: number } | null {
  let endOffset = openParenIndex;
  while (endOffset > 0 && /\s/.test(source[endOffset - 1])) {
    endOffset -= 1;
  }

  let startOffset = endOffset;
  while (startOffset > 0 && IDENTIFIER_CHARACTER_PATTERN.test(source[startOffset - 1])) {
    startOffset -= 1;
  }

  return startOffset === endOffset ? null : { endOffset, startOffset };
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
