import {
  BUILTIN_FUNCTIONS,
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  MOO_IDENTIFIER_PATTERN_SOURCE,
  OPERATOR_WORDS,
  STATEMENT_KEYWORDS,
} from './contract';
import { analyzeMooSemantics } from './semantics';
import { maskMooSource, positionAtMooOffset } from './scanner';

const MOO_SEMANTIC_TOKEN_TYPES = [
  'keyword',
  'function',
  'variable',
  'type',
  'string',
  'number',
  'comment',
  'operator',
] as const;
const MOO_SEMANTIC_TOKEN_MODIFIERS = ['declaration', 'defaultLibrary'] as const;

export const MOO_SEMANTIC_TOKEN_LEGEND: {
  tokenTypes: string[];
  tokenModifiers: string[];
} = {
  tokenTypes: [...MOO_SEMANTIC_TOKEN_TYPES],
  tokenModifiers: [...MOO_SEMANTIC_TOKEN_MODIFIERS],
};

export type MooSemanticTokenType = (typeof MOO_SEMANTIC_TOKEN_TYPES)[number];
export type MooSemanticTokenModifier = (typeof MOO_SEMANTIC_TOKEN_MODIFIERS)[number];

export type MooSemanticToken = {
  lineNumber: number;
  startColumn: number;
  length: number;
  text: string;
  tokenType: MooSemanticTokenType;
  tokenModifiers: MooSemanticTokenModifier[];
};

export type MooSemanticTokenRange = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

const KEYWORDS = new Set<string>(STATEMENT_KEYWORDS.map((keyword) => keyword.toLowerCase()));
const OPERATOR_KEYWORDS = new Set<string>(OPERATOR_WORDS.map((operator) => operator.toLowerCase()));
const ERROR_NAMES = new Set<string>(ERROR_CONSTANTS);
const BUILTIN_VARIABLE_NAMES = new Set<string>(BUILTIN_VARIABLES);
const BUILTIN_FUNCTION_NAMES = new Set<string>(BUILTIN_FUNCTIONS);
const IDENTIFIER_PATTERN = new RegExp(MOO_IDENTIFIER_PATTERN_SOURCE, 'g');
const SYSTEM_REFERENCE_PATTERN = new RegExp(`\\$${MOO_IDENTIFIER_PATTERN_SOURCE}`, 'g');

export function collectMooSemanticTokens(source: string): MooSemanticToken[] {
  const tokens: MooSemanticToken[] = [];
  const masked = maskMooSource(source);
  const lineOffsets = getLineOffsets(source);
  const localSymbolRanges = collectLocalSymbolRanges(source);
  const occupiedOffsets = new Set<number>();

  for (const token of collectStringAndCommentTokens(source)) {
    tokens.push(token);
    markOccupiedOffsets(occupiedOffsets, token, lineOffsets);
  }

  collectPatternTokens(
    source,
    masked,
    SYSTEM_REFERENCE_PATTERN,
    'variable',
    ['defaultLibrary'],
    tokens,
    occupiedOffsets,
  );
  collectPatternTokens(
    source,
    masked,
    /#-?\d+|-?(?:\d+\.\d+|\d+)(?:[eE][+-]?\d+)?/g,
    'number',
    [],
    tokens,
    occupiedOffsets,
  );

  for (const match of masked.matchAll(IDENTIFIER_PATTERN)) {
    const text = match[0];
    const startOffset = match.index;
    if (occupiedOffsets.has(startOffset) || source[startOffset - 1] === '$') {
      continue;
    }

    const range = rangeFromOffsets(source, startOffset, startOffset + text.length);
    const rangeKey = semanticRangeKey(range);
    const local = localSymbolRanges.get(rangeKey);
    if (local) {
      tokens.push({
        lineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        length: text.length,
        text,
        tokenType: 'variable',
        tokenModifiers: local.isDeclaration ? ['declaration'] : [],
      });
      continue;
    }

    const lowerText = text.toLowerCase();
    if (KEYWORDS.has(lowerText)) {
      tokens.push({
        lineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        length: text.length,
        text,
        tokenType: 'keyword',
        tokenModifiers: [],
      });
      continue;
    }

    if (OPERATOR_KEYWORDS.has(lowerText)) {
      tokens.push({
        lineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        length: text.length,
        text,
        tokenType: 'operator',
        tokenModifiers: [],
      });
      continue;
    }

    if (ERROR_NAMES.has(text)) {
      tokens.push({
        lineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        length: text.length,
        text,
        tokenType: 'type',
        tokenModifiers: ['defaultLibrary'],
      });
      continue;
    }

    if (BUILTIN_VARIABLE_NAMES.has(text)) {
      tokens.push({
        lineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        length: text.length,
        text,
        tokenType: 'variable',
        tokenModifiers: ['defaultLibrary'],
      });
      continue;
    }

    if (BUILTIN_FUNCTION_NAMES.has(text) || isVerbName(masked, startOffset)) {
      tokens.push({
        lineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        length: text.length,
        text,
        tokenType: 'function',
        tokenModifiers: BUILTIN_FUNCTION_NAMES.has(text) ? ['defaultLibrary'] : [],
      });
    }
  }

  return sortSemanticTokens(dedupeSemanticTokens(tokens));
}

export function encodeMooSemanticTokens(source: string): { data: Uint32Array; resultId?: string } {
  return encodeSemanticTokens(collectMooSemanticTokens(source));
}

export function encodeMooSemanticTokensForRange(
  source: string,
  range: MooSemanticTokenRange,
): { data: Uint32Array; resultId?: string } {
  return encodeSemanticTokens(
    collectMooSemanticTokens(source).filter((token) => semanticTokenIntersectsRange(token, range)),
  );
}

function encodeSemanticTokens(tokens: MooSemanticToken[]): { data: Uint32Array; resultId?: string } {
  const encoded: number[] = [];
  let previousLine = 0;
  let previousStartCharacter = 0;

  for (const token of tokens) {
    const line = token.lineNumber - 1;
    const startCharacter = token.startColumn - 1;
    const deltaLine = line - previousLine;
    const deltaStartCharacter =
      deltaLine === 0 ? startCharacter - previousStartCharacter : startCharacter;

    encoded.push(
      deltaLine,
      deltaStartCharacter,
      token.length,
      MOO_SEMANTIC_TOKEN_LEGEND.tokenTypes.indexOf(token.tokenType),
      tokenModifiersToBitset(token.tokenModifiers),
    );

    previousLine = line;
    previousStartCharacter = startCharacter;
  }

  return { data: Uint32Array.from(encoded) };
}

function collectStringAndCommentTokens(source: string): MooSemanticToken[] {
  const tokens: MooSemanticToken[] = [];
  let inString = false;
  let inBlockComment = false;
  let escaped = false;
  let spanStart = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (inBlockComment) {
      if (character === '*' && next === '/') {
        pushSpanTokens(tokens, source, spanStart, index + 2, 'comment');
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        pushSpanTokens(tokens, source, spanStart, index + 1, 'string');
        inString = false;
      }
      continue;
    }

    if (character === '/' && next === '/') {
      const end = indexOfLineEnd(source, index);
      pushSpanTokens(tokens, source, index, end, 'comment');
      index = end - 1;
      continue;
    }

    if (character === '/' && next === '*') {
      inBlockComment = true;
      spanStart = index;
      index += 1;
      continue;
    }

    if (character === '"') {
      inString = true;
      spanStart = index;
    }
  }

  if (inBlockComment || inString) {
    pushSpanTokens(tokens, source, spanStart, source.length, inString ? 'string' : 'comment');
  }

  return tokens;
}

function collectPatternTokens(
  source: string,
  masked: string,
  pattern: RegExp,
  tokenType: MooSemanticTokenType,
  tokenModifiers: MooSemanticTokenModifier[],
  tokens: MooSemanticToken[],
  occupiedOffsets: Set<number>,
): void {
  for (const match of masked.matchAll(pattern)) {
    const text = match[0];
    const startOffset = match.index;
    if (occupiedOffsets.has(startOffset)) {
      continue;
    }

    const range = rangeFromOffsets(source, startOffset, startOffset + text.length);
    tokens.push({
      lineNumber: range.startLineNumber,
      startColumn: range.startColumn,
      length: text.length,
      text,
      tokenType,
      tokenModifiers,
    });
    markOffsetRangeOccupied(occupiedOffsets, startOffset, startOffset + text.length);
  }
}

function pushSpanTokens(
  tokens: MooSemanticToken[],
  source: string,
  startOffset: number,
  endOffset: number,
  tokenType: 'comment' | 'string',
): void {
  let segmentStart = startOffset;
  while (segmentStart < endOffset) {
    const lineEnd = indexOfLineEnd(source, segmentStart);
    const segmentEnd = Math.min(lineEnd, endOffset);
    if (segmentEnd > segmentStart) {
      const range = rangeFromOffsets(source, segmentStart, segmentEnd);
      const text = source.slice(segmentStart, segmentEnd);
      tokens.push({
        lineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        length: text.length,
        text,
        tokenType,
        tokenModifiers: [],
      });
    }

    segmentStart = segmentEnd;
    while (segmentStart < endOffset && isLineBreak(source[segmentStart])) {
      segmentStart += 1;
    }
  }
}

function collectLocalSymbolRanges(
  source: string,
): Map<string, { isDeclaration: boolean }> {
  const ranges = new Map<string, { isDeclaration: boolean }>();

  for (const symbol of analyzeMooSemantics(source).symbols) {
    for (const range of symbol.definitions) {
      ranges.set(semanticRangeKey(range), { isDeclaration: true });
    }

    for (const range of symbol.references) {
      ranges.set(semanticRangeKey(range), { isDeclaration: false });
    }
  }

  return ranges;
}

function tokenModifiersToBitset(modifiers: MooSemanticTokenModifier[]): number {
  return modifiers.reduce((bitset, modifier) => {
    const index = MOO_SEMANTIC_TOKEN_LEGEND.tokenModifiers.indexOf(modifier);
    return index >= 0 ? bitset | (1 << index) : bitset;
  }, 0);
}

function sortSemanticTokens(tokens: MooSemanticToken[]): MooSemanticToken[] {
  return [...tokens].sort((left, right) => {
    if (left.lineNumber !== right.lineNumber) {
      return left.lineNumber - right.lineNumber;
    }

    return left.startColumn - right.startColumn;
  });
}

function dedupeSemanticTokens(tokens: MooSemanticToken[]): MooSemanticToken[] {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    const key = `${token.lineNumber}:${token.startColumn}:${token.length}:${token.tokenType}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isVerbName(source: string, offset: number): boolean {
  let index = offset - 1;
  while (index >= 0 && /\s/.test(source[index])) {
    index -= 1;
  }

  return source[index] === ':';
}

function markOccupiedOffsets(
  occupiedOffsets: Set<number>,
  token: MooSemanticToken,
  lineOffsets: number[],
): void {
  const lineOffset = lineOffsets[token.lineNumber - 1] ?? 0;
  const startOffset = lineOffset + token.startColumn - 1;
  markOffsetRangeOccupied(occupiedOffsets, startOffset, startOffset + token.length);
}

function markOffsetRangeOccupied(
  occupiedOffsets: Set<number>,
  startOffset: number,
  endOffset: number,
): void {
  for (let offset = startOffset; offset < endOffset; offset += 1) {
    occupiedOffsets.add(offset);
  }
}

function semanticRangeKey(range: {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}): string {
  return `${range.startLineNumber}:${range.startColumn}:${range.endLineNumber}:${range.endColumn}`;
}

function semanticTokenIntersectsRange(
  token: MooSemanticToken,
  range: MooSemanticTokenRange,
): boolean {
  const tokenStart = {
    lineNumber: token.lineNumber,
    column: token.startColumn,
  };
  const tokenEnd = {
    lineNumber: token.lineNumber,
    column: token.startColumn + token.length,
  };

  return (
    comparePositions(tokenEnd, {
      lineNumber: range.startLineNumber,
      column: range.startColumn,
    }) > 0 &&
    comparePositions(tokenStart, {
      lineNumber: range.endLineNumber,
      column: range.endColumn,
    }) < 0
  );
}

function comparePositions(
  left: { lineNumber: number; column: number },
  right: { lineNumber: number; column: number },
): number {
  if (left.lineNumber !== right.lineNumber) {
    return left.lineNumber - right.lineNumber;
  }

  return left.column - right.column;
}

function rangeFromOffsets(source: string, startOffset: number, endOffset: number) {
  const start = positionAtMooOffset(source, startOffset);
  const end = positionAtMooOffset(source, endOffset);

  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
}

function getLineOffsets(source: string): number[] {
  const offsets = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') {
      offsets.push(index + 1);
    }
  }

  return offsets;
}

function indexOfLineEnd(source: string, startOffset: number): number {
  for (let index = startOffset; index < source.length; index += 1) {
    if (isLineBreak(source[index])) {
      return index;
    }
  }

  return source.length;
}

function isLineBreak(character: string | undefined): boolean {
  return character === '\n' || character === '\r';
}
