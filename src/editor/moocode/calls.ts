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
    }
  | {
      callKind: 'dynamic-verb';
      receiverName: string;
      functionName: string;
    };

const VALID_IDENTIFIER_PATTERN = new RegExp(`^${MOO_IDENTIFIER_PATTERN_SOURCE}$`);
const IDENTIFIER_CHARACTER_PATTERN = /^[A-Za-z0-9_]$/;

export function readMooCallTargetBeforeOpen(
  source: string,
  openParenIndex: number,
): MooCallTarget | null {
  const dynamicVerbCall = readDynamicVerbCallBeforeOpen(source, openParenIndex);
  if (dynamicVerbCall) {
    return dynamicVerbCall;
  }

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

function readDynamicVerbCallBeforeOpen(
  source: string,
  openParenIndex: number,
): MooCallTarget | null {
  const expressionCloseIndex = previousNonWhitespaceIndex(source, openParenIndex - 1);
  if (expressionCloseIndex === null || source[expressionCloseIndex] !== ')') {
    return null;
  }

  const expressionOpenIndex = findMatchingOpenParenBefore(source, expressionCloseIndex);
  if (expressionOpenIndex === null) {
    return null;
  }

  const receiverName = readStaticVerbReceiverBefore(source, expressionOpenIndex);
  if (!receiverName) {
    return null;
  }

  return {
    callKind: 'dynamic-verb',
    receiverName,
    functionName: source.slice(expressionOpenIndex, expressionCloseIndex + 1),
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
  const colonIndex = previousNonWhitespaceIndex(source, verbStartIndex - 1);

  if (colonIndex === null || source[colonIndex] !== ':') {
    return null;
  }

  const endIndex = previousNonWhitespaceIndex(source, colonIndex - 1);
  if (endIndex === null) {
    return null;
  }

  if (/\d/.test(source[endIndex])) {
    return readObjectNumberReceiverBefore(source, endIndex);
  }

  return readIdentifierReceiverBefore(source, endIndex);
}

function previousNonWhitespaceIndex(source: string, startIndex: number): number | null {
  for (let index = startIndex; index >= 0; index -= 1) {
    if (!/\s/.test(source[index])) {
      return index;
    }
  }

  return null;
}

function findMatchingOpenParenBefore(source: string, closeParenIndex: number): number | null {
  let depth = 0;

  for (let index = closeParenIndex; index >= 0; index -= 1) {
    if (source[index] === ')') {
      depth += 1;
      continue;
    }

    if (source[index] === '(') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return null;
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
