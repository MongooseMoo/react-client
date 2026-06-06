import { MOO_IDENTIFIER_PATTERN_SOURCE } from './contract';

export type MooCallTarget =
  | {
      callKind: 'function';
      functionName: string;
    }
  | {
      callKind: 'verb';
      receiverName: string;
      functionName: string;
    };

const VALID_IDENTIFIER_PATTERN = new RegExp(`^${MOO_IDENTIFIER_PATTERN_SOURCE}$`);
const IDENTIFIER_CHARACTER_PATTERN = /^[A-Za-z0-9_]$/;

export function readMooCallTargetBeforeOpen(
  source: string,
  openParenIndex: number,
): MooCallTarget | null {
  const functionName = readIdentifierSpanBefore(source, openParenIndex);
  if (!functionName) {
    return null;
  }

  const receiverName = readStaticVerbReceiverBefore(source, functionName.startIndex);
  if (receiverName) {
    return {
      callKind: 'verb',
      receiverName,
      functionName: functionName.name,
    };
  }

  return {
    callKind: 'function',
    functionName: functionName.name,
  };
}

function readIdentifierSpanBefore(
  source: string,
  openParenIndex: number,
): { name: string; startIndex: number; endIndex: number } | null {
  let endIndex = openParenIndex - 1;
  while (endIndex >= 0 && /\s/.test(source[endIndex])) {
    endIndex -= 1;
  }

  let startIndex = endIndex;
  while (startIndex >= 0 && IDENTIFIER_CHARACTER_PATTERN.test(source[startIndex])) {
    startIndex -= 1;
  }

  const identifier = source.slice(startIndex + 1, endIndex + 1);
  return VALID_IDENTIFIER_PATTERN.test(identifier)
    ? { name: identifier, startIndex: startIndex + 1, endIndex: endIndex + 1 }
    : null;
}

function readStaticVerbReceiverBefore(source: string, verbStartIndex: number): string | null {
  let colonIndex = verbStartIndex - 1;
  while (colonIndex >= 0 && /\s/.test(source[colonIndex])) {
    colonIndex -= 1;
  }

  if (source[colonIndex] !== ':') {
    return null;
  }

  let endIndex = colonIndex - 1;
  while (endIndex >= 0 && /\s/.test(source[endIndex])) {
    endIndex -= 1;
  }

  if (endIndex < 0) {
    return null;
  }

  if (/\d/.test(source[endIndex])) {
    return readObjectNumberReceiverBefore(source, endIndex);
  }

  return readIdentifierReceiverBefore(source, endIndex);
}

function readObjectNumberReceiverBefore(source: string, endIndex: number): string | null {
  let startIndex = endIndex;
  while (startIndex >= 0 && /\d/.test(source[startIndex])) {
    startIndex -= 1;
  }

  if (source[startIndex] === '-') {
    startIndex -= 1;
  }

  if (source[startIndex] !== '#') {
    return null;
  }

  const receiver = source.slice(startIndex, endIndex + 1);
  return /^#-?\d+$/.test(receiver) ? receiver : null;
}

function readIdentifierReceiverBefore(source: string, endIndex: number): string | null {
  if (!IDENTIFIER_CHARACTER_PATTERN.test(source[endIndex])) {
    return null;
  }

  let startIndex = endIndex;
  while (startIndex >= 0 && IDENTIFIER_CHARACTER_PATTERN.test(source[startIndex])) {
    startIndex -= 1;
  }

  if (source[startIndex] === '$') {
    startIndex -= 1;
  }

  const receiver = source.slice(startIndex + 1, endIndex + 1);
  return /^(?:[A-Za-z_][A-Za-z0-9_]*|\$[A-Za-z_][A-Za-z0-9_]*)$/.test(receiver)
    ? receiver
    : null;
}
