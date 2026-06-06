import { readMooCallTargetBeforeOpen } from './calls';
import { positionAtMooOffset } from './scanner';
import { getMooBuiltinSignature } from './signatures';

export type MooInlayHint = {
  label: string;
  lineNumber: number;
  column: number;
};

type CallFrame = {
  callKind: 'builtin' | 'verb';
  functionName: string;
  argumentStartOffset: number | null;
  nestedDelimiterDepth: number;
  parameterIndex: number;
};

export function collectMooInlayHints(source: string): MooInlayHint[] {
  const masked = maskMooSourceForArgumentHints(source);
  const frames: CallFrame[] = [];
  const hints: MooInlayHint[] = [];

  for (let index = 0; index < masked.length; index += 1) {
    const character = masked[index];
    const frame = frames.at(-1);

    if (character === '(') {
      const callTarget = readMooCallTargetBeforeOpen(masked, index);
      if (
        callTarget?.callKind === 'verb' ||
        callTarget?.callKind === 'dynamic-verb' ||
        callTarget?.callKind === 'dollar-verb'
      ) {
        frames.push({
          callKind: 'verb',
          functionName: callTarget.functionName.toLowerCase(),
          argumentStartOffset: null,
          nestedDelimiterDepth: 0,
          parameterIndex: 0,
        });
      } else if (callTarget?.callKind === 'function' && getMooBuiltinSignature(callTarget.functionName)) {
        frames.push({
          callKind: 'builtin',
          functionName: callTarget.functionName.toLowerCase(),
          argumentStartOffset: null,
          nestedDelimiterDepth: 0,
          parameterIndex: 0,
        });
      } else {
        if (frame) {
          frame.nestedDelimiterDepth += 1;
        }
      }
      continue;
    }

    if (character === '[' || character === '{') {
      if (frame) {
        frame.nestedDelimiterDepth += 1;
      }
      continue;
    }

    if (character === ')' || character === ']' || character === '}') {
      if (!frame) {
        continue;
      }

      if (frame.nestedDelimiterDepth > 0) {
        frame.nestedDelimiterDepth -= 1;
        continue;
      }

      flushArgumentHint(source, frame, hints);
      frames.pop();
      continue;
    }

    if (!frame || frame.nestedDelimiterDepth > 0) {
      continue;
    }

    if (character === ',') {
      flushArgumentHint(source, frame, hints);
      frame.argumentStartOffset = null;
      frame.parameterIndex += 1;
      continue;
    }

    if (frame.argumentStartOffset === null && !/\s/.test(character)) {
      frame.argumentStartOffset = index;
    }
  }

  return hints.sort((left, right) => {
    if (left.lineNumber !== right.lineNumber) {
      return left.lineNumber - right.lineNumber;
    }

    return left.column - right.column;
  });
}

function flushArgumentHint(source: string, frame: CallFrame, hints: MooInlayHint[]): void {
  if (frame.argumentStartOffset === null) {
    return;
  }

  const parameter =
    frame.callKind === 'verb'
      ? { label: `arg${frame.parameterIndex + 1}` }
      : getMooBuiltinSignature(frame.functionName, frame.parameterIndex + 1)?.parameters[
          frame.parameterIndex
        ];
  if (!parameter) {
    return;
  }

  const position = positionAtMooOffset(source, frame.argumentStartOffset);
  hints.push({
    label: `${parameter.label}:`,
    lineNumber: position.lineNumber,
    column: position.column,
  });
}

function maskMooSourceForArgumentHints(source: string): string {
  let inString = false;
  let inBlockComment = false;
  let escaped = false;
  const characters = source.split('');

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (inBlockComment) {
      maskCharacter(characters, index);

      if (character === '*' && next === '/') {
        maskCharacter(characters, index + 1);
        inBlockComment = false;
        index += 1;
      }

      continue;
    }

    if (inString) {
      maskCharacter(characters, index);

      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '/' && next === '/') {
      for (let commentIndex = index; commentIndex < source.length; commentIndex += 1) {
        const commentCharacter = source[commentIndex];
        if (commentCharacter === '\r' || commentCharacter === '\n') {
          break;
        }
        characters[commentIndex] = ' ';
      }
      continue;
    }

    if (character === '/' && next === '*') {
      characters[index] = ' ';
      characters[index + 1] = ' ';
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (character === '"') {
      inString = true;
    }
  }

  return characters.join('');
}

function maskCharacter(characters: string[], index: number): void {
  if (characters[index] !== '\r' && characters[index] !== '\n') {
    characters[index] = ' ';
  }
}
