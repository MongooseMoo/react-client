import { getMooBuiltinSignature } from './signatures';

export type MooInlayHint = {
  label: string;
  lineNumber: number;
  column: number;
};

type CallFrame = {
  functionName: string;
  argumentStartOffset: number | null;
  nestedDelimiterDepth: number;
  parameterIndex: number;
};

export function collectMooInlayHints(source: string): MooInlayHint[] {
  const masked = maskMooSourceForInlayHints(source);
  const frames: CallFrame[] = [];
  const hints: MooInlayHint[] = [];

  for (let index = 0; index < masked.length; index += 1) {
    const character = masked[index];
    const frame = frames.at(-1);

    if (character === '(') {
      const functionName = readIdentifierBefore(masked, index);
      if (functionName && getMooBuiltinSignature(functionName)) {
        frames.push({
          functionName: functionName.toLowerCase(),
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

  const signature = getMooBuiltinSignature(frame.functionName, frame.parameterIndex + 1);
  const parameter = signature?.parameters[frame.parameterIndex];
  if (!parameter) {
    return;
  }

  const position = positionAt(source, frame.argumentStartOffset);
  hints.push({
    label: `${parameter.label}:`,
    lineNumber: position.lineNumber,
    column: position.column,
  });
}

function readIdentifierBefore(source: string, openParenIndex: number): string | null {
  let endIndex = openParenIndex - 1;
  while (endIndex >= 0 && /\s/.test(source[endIndex])) {
    endIndex -= 1;
  }

  let startIndex = endIndex;
  while (startIndex >= 0 && /[A-Za-z0-9_$]/.test(source[startIndex])) {
    startIndex -= 1;
  }

  const identifier = source.slice(startIndex + 1, endIndex + 1);
  return /^[A-Za-z_][\w$]*$/.test(identifier) ? identifier : null;
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

function maskMooSourceForInlayHints(source: string): string {
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
