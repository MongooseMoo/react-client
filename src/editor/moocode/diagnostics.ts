import type { Uri } from 'monaco-editor';
import { formatMooBuiltinArity, getMooBuiltinMetadata, type MooBuiltinMetadata } from './builtins';
import {
  MOO_BLOCKS,
  MOO_CLOSE_KEYWORDS,
  MOO_IDENTIFIER_PATTERN_SOURCE,
  MOO_LANGUAGE_ID,
  MOO_MIDDLE_KEYWORDS,
} from './contract';
import type { MonacoRange } from './language';
import { firstMooKeyword, maskMooSource, positionAtMooOffset } from './scanner';
import {
  findMooUndefinedLocalReferences,
  findMooUnknownLoopLabelReferences,
  findMooUnusedLocalDefinitions,
} from './semantics';

export type MooDiagnosticCode =
  | 'misplaced-middle'
  | 'mismatched-close'
  | 'unexpected-close'
  | 'unclosed-block'
  | 'unclosed-delimiter'
  | 'unexpected-delimiter'
  | 'unterminated-string'
  | 'loop-control-outside-loop'
  | 'unknown-loop-label'
  | 'builtin-arity'
  | 'undefined-local'
  | 'unused-local';

export type MooDiagnosticSeverity = 'error' | 'warning';

export type MooDiagnosticRelatedInformation = {
  message: string;
  range: MonacoRange;
};

export type MooDiagnostic = {
  code: MooDiagnosticCode;
  expectedCloseKeyword?: string;
  message: string;
  relatedInformation?: MooDiagnosticRelatedInformation[];
  severity?: MooDiagnosticSeverity;
  lineNumber: number;
  startColumn: number;
  endColumn: number;
};

export type MonacoMarker = Omit<MooDiagnostic, 'severity' | 'relatedInformation'> & {
  severity: number;
  source: string;
  startLineNumber: number;
  endLineNumber: number;
  relatedInformation?: Array<
    MonacoRange & {
      message: string;
      resource: Uri;
    }
  >;
};

export type MonacoMarkerSeverities = {
  error: number;
  warning: number;
};

type BlockKind = keyof typeof MOO_BLOCKS;

type BlockFrame = {
  kind: BlockKind;
  closeKeyword: string;
  lineNumber: number;
  startColumn: number;
};

type DelimiterFrame = {
  open: '(' | '[' | '{';
  close: ')' | ']' | '}';
  lineNumber: number;
  startColumn: number;
};

type ScanState = {
  inBlockComment: boolean;
};

const VALID_IDENTIFIER_PATTERN = new RegExp(`^${MOO_IDENTIFIER_PATTERN_SOURCE}$`);
const IDENTIFIER_CHARACTER_PATTERN = /^[A-Za-z0-9_]$/;
const LOOP_CONTROL_KEYWORDS = new Set(['break', 'continue']);

const OPEN_DELIMITERS: Record<string, DelimiterFrame['close']> = {
  '(': ')',
  '[': ']',
  '{': '}',
};

const CLOSE_DELIMITERS: Record<string, DelimiterFrame['open']> = {
  ')': '(',
  ']': '[',
  '}': '{',
};

export function validateMooSyntax(source: string): MooDiagnostic[] {
  const diagnostics: MooDiagnostic[] = [];
  const blockStack: BlockFrame[] = [];
  const delimiterStack: DelimiterFrame[] = [];
  const scanState: ScanState = { inBlockComment: false };

  const lines = source.split(/\r\n|\r|\n/);

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const scan = scanLine(line, lineNumber, delimiterStack, scanState);
    diagnostics.push(...scan.diagnostics);

    const keyword = firstMooKeyword(scan.code);
    if (!keyword) {
      return;
    }

    const normalized = keyword.word.toLowerCase();

    if (LOOP_CONTROL_KEYWORDS.has(normalized) && !blockStack.some((frame) => isLoop(frame.kind))) {
      diagnostics.push({
        code: 'loop-control-outside-loop',
        message: `${normalized} can only be used inside a for or while block.`,
        lineNumber,
        startColumn: keyword.startColumn,
        endColumn: keyword.endColumn,
      });
    }

    const middleKind = MOO_MIDDLE_KEYWORDS[normalized];
    if (middleKind && blockStack.at(-1)?.kind !== middleKind) {
      diagnostics.push({
        code: 'misplaced-middle',
        message: `${normalized} can only appear inside an ${middleKind} block.`,
        lineNumber,
        startColumn: keyword.startColumn,
        endColumn: keyword.endColumn,
      });
      return;
    }

    const closeKind = MOO_CLOSE_KEYWORDS[normalized];
    if (closeKind) {
      const open = blockStack.pop();

      if (!open) {
        diagnostics.push({
          code: 'unexpected-close',
          message: `Unexpected ${normalized} without a matching ${closeKind}.`,
          lineNumber,
          startColumn: keyword.startColumn,
          endColumn: keyword.endColumn,
        });
        return;
      }

      if (open.kind !== closeKind) {
        diagnostics.push({
          code: 'mismatched-close',
          expectedCloseKeyword: open.closeKeyword,
          message: `${normalized} closes ${closeKind}, but the open block is ${open.kind}.`,
          relatedInformation: [
            {
              message: `Open ${open.kind} block is here.`,
              range: {
                startLineNumber: open.lineNumber,
                startColumn: open.startColumn,
                endLineNumber: open.lineNumber,
                endColumn: open.startColumn + open.kind.length,
              },
            },
          ],
          lineNumber,
          startColumn: keyword.startColumn,
          endColumn: keyword.endColumn,
        });
      }

      return;
    }

    const openBlock = MOO_BLOCKS[normalized as BlockKind];
    if (openBlock) {
      blockStack.push({
        kind: normalized as BlockKind,
        closeKeyword: openBlock.close,
        lineNumber,
        startColumn: keyword.startColumn,
      });
    }
  });

  for (const delimiter of delimiterStack) {
    diagnostics.push({
      code: 'unclosed-delimiter',
      message: `${delimiter.open} is missing a matching ${delimiter.close}.`,
      lineNumber: delimiter.lineNumber,
      startColumn: delimiter.startColumn,
      endColumn: delimiter.startColumn + 1,
    });
  }

  for (const block of blockStack) {
    diagnostics.push({
      code: 'unclosed-block',
      message: `${block.kind} is missing a matching ${block.closeKeyword}.`,
      lineNumber: block.lineNumber,
      startColumn: block.startColumn,
      endColumn: block.startColumn + block.kind.length,
    });
  }

  diagnostics.push(...validateBuiltinCallArity(source));
  diagnostics.push(...validateUnknownLoopLabels(source));
  diagnostics.push(...validateUndefinedLocals(source));
  diagnostics.push(...validateUnusedLocals(source));

  return diagnostics;
}

export function toMonacoMarkers(
  source: string,
  severity: number | MonacoMarkerSeverities,
  resource?: Uri,
): MonacoMarker[] {
  return validateMooSyntax(source).map((diagnostic) => ({
    ...diagnostic,
    relatedInformation: toMonacoRelatedInformation(diagnostic, resource),
    startLineNumber: diagnostic.lineNumber,
    endLineNumber: diagnostic.lineNumber,
    severity: toMarkerSeverity(diagnostic, severity),
    source: MOO_LANGUAGE_ID,
  }));
}

function toMonacoRelatedInformation(
  diagnostic: MooDiagnostic,
  resource: Uri | undefined,
): MonacoMarker['relatedInformation'] {
  if (!resource || !diagnostic.relatedInformation) {
    return undefined;
  }

  return diagnostic.relatedInformation.map((related) => ({
    resource,
    message: related.message,
    startLineNumber: related.range.startLineNumber,
    startColumn: related.range.startColumn,
    endLineNumber: related.range.endLineNumber,
    endColumn: related.range.endColumn,
  }));
}

function toMarkerSeverity(
  diagnostic: MooDiagnostic,
  severity: number | MonacoMarkerSeverities,
): number {
  if (typeof severity === 'number') {
    return severity;
  }

  return diagnostic.severity === 'warning' ? severity.warning : severity.error;
}

function scanLine(
  line: string,
  lineNumber: number,
  delimiterStack: DelimiterFrame[],
  state: ScanState,
): { code: string; diagnostics: MooDiagnostic[] } {
  let inString = false;
  let escaped = false;
  const codeCharacters = [...line];
  const diagnostics: MooDiagnostic[] = [];

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    const column = index + 1;

    if (state.inBlockComment) {
      codeCharacters[index] = ' ';

      if (character === '*' && next === '/') {
        codeCharacters[index + 1] = ' ';
        state.inBlockComment = false;
        index += 1;
      }

      continue;
    }

    if (inString) {
      codeCharacters[index] = ' ';

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
      codeCharacters.fill(' ', index);
      break;
    }

    if (character === '/' && next === '*') {
      codeCharacters[index] = ' ';
      codeCharacters[index + 1] = ' ';
      state.inBlockComment = true;
      index += 1;
      continue;
    }

    if (character === '"') {
      codeCharacters[index] = ' ';
      inString = true;
      continue;
    }

    const closeDelimiter = OPEN_DELIMITERS[character];
    if (closeDelimiter) {
      delimiterStack.push({
        open: character as DelimiterFrame['open'],
        close: closeDelimiter,
        lineNumber,
        startColumn: column,
      });
      continue;
    }

    const openDelimiter = CLOSE_DELIMITERS[character];
    if (openDelimiter) {
      const current = delimiterStack.pop();

      if (!current || current.open !== openDelimiter) {
        diagnostics.push({
          code: 'unexpected-delimiter',
          message: `Unexpected ${character} without a matching ${openDelimiter}.`,
          lineNumber,
          startColumn: column,
          endColumn: column + 1,
        });
      }
    }
  }

  if (inString) {
    diagnostics.push({
      code: 'unterminated-string',
      message: 'String literal is missing a closing quote.',
      lineNumber,
      startColumn: line.length,
      endColumn: line.length + 1,
    });
  }

  return { code: codeCharacters.join(''), diagnostics };
}

function isLoop(kind: BlockKind): boolean {
  return MOO_BLOCKS[kind].isLoop === true;
}

function validateBuiltinCallArity(source: string): MooDiagnostic[] {
  const masked = maskMooSource(source);
  const diagnostics: MooDiagnostic[] = [];

  for (let index = 0; index < masked.length; index += 1) {
    if (masked[index] !== '(') {
      continue;
    }

    const functionIdentifier = readIdentifierBefore(masked, index);
    if (!functionIdentifier) {
      continue;
    }

    if (!isPlainFunctionCallIdentifier(masked, functionIdentifier.startOffset)) {
      continue;
    }

    const metadata = getMooBuiltinMetadata(functionIdentifier.name);
    if (!metadata) {
      continue;
    }

    const closeOffset = findMatchingCallClose(masked, index);
    if (closeOffset === null) {
      continue;
    }

    const argumentCount = countCallArguments(masked.slice(index + 1, closeOffset));
    if (isBuiltinArityValid(argumentCount, metadata)) {
      index = closeOffset;
      continue;
    }

    const start = positionAtMooOffset(source, functionIdentifier.startOffset);
    diagnostics.push({
      code: 'builtin-arity',
      message: `${functionIdentifier.name.toLowerCase()} expects ${formatMooBuiltinArity(metadata)}, but got ${argumentCount}.`,
      lineNumber: start.lineNumber,
      startColumn: start.column,
      endColumn: start.column + functionIdentifier.name.length,
    });
    index = closeOffset;
  }

  return diagnostics;
}

function validateUndefinedLocals(source: string): MooDiagnostic[] {
  return findMooUndefinedLocalReferences(source).map((reference) => ({
    code: 'undefined-local',
    message: `${reference.name} is used before it is defined.`,
    relatedInformation: reference.definitionRange
      ? [
          {
            message: `First ${reference.name} definition is here.`,
            range: reference.definitionRange,
          },
        ]
      : undefined,
    lineNumber: reference.range.startLineNumber,
    startColumn: reference.range.startColumn,
    endColumn: reference.range.endColumn,
  }));
}

function validateUnknownLoopLabels(source: string): MooDiagnostic[] {
  return findMooUnknownLoopLabelReferences(source).map((reference) => ({
    code: 'unknown-loop-label',
    message: `${reference.name} does not name an enclosing while label.`,
    lineNumber: reference.range.startLineNumber,
    startColumn: reference.range.startColumn,
    endColumn: reference.range.endColumn,
  }));
}

function validateUnusedLocals(source: string): MooDiagnostic[] {
  return findMooUnusedLocalDefinitions(source).map((definition) => ({
    code: 'unused-local',
    message: `${definition.name} is defined but never used.`,
    severity: 'warning',
    lineNumber: definition.range.startLineNumber,
    startColumn: definition.range.startColumn,
    endColumn: definition.range.endColumn,
  }));
}

function readIdentifierBefore(
  source: string,
  openParenIndex: number,
): { name: string; startOffset: number } | null {
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
    ? { name: identifier, startOffset: startIndex + 1 }
    : null;
}

function isPlainFunctionCallIdentifier(source: string, identifierStartOffset: number): boolean {
  const previous = previousNonWhitespaceCharacter(source, identifierStartOffset);
  return previous !== ':' && previous !== '.' && previous !== '$';
}

function previousNonWhitespaceCharacter(source: string, offset: number): string | null {
  for (let index = offset - 1; index >= 0; index -= 1) {
    if (!/\s/.test(source[index])) {
      return source[index];
    }
  }

  return null;
}

function findMatchingCallClose(source: string, openOffset: number): number | null {
  let depth = 0;

  for (let index = openOffset; index < source.length; index += 1) {
    const character = source[index];
    if (character === '(' || character === '[' || character === '{') {
      depth += 1;
      continue;
    }

    if (character !== ')' && character !== ']' && character !== '}') {
      continue;
    }

    depth -= 1;
    if (depth === 0) {
      return character === ')' ? index : null;
    }
  }

  return null;
}

function countCallArguments(argumentSource: string): number {
  if (argumentSource.trim() === '') {
    return 0;
  }

  let argumentCount = 1;
  let depth = 0;

  for (const character of argumentSource) {
    if (character === '(' || character === '[' || character === '{') {
      depth += 1;
      continue;
    }

    if (character === ')' || character === ']' || character === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (character === ',' && depth === 0) {
      argumentCount += 1;
    }
  }

  return argumentCount;
}

function isBuiltinArityValid(argumentCount: number, metadata: MooBuiltinMetadata): boolean {
  return (
    argumentCount >= metadata.minArgs && (metadata.maxArgs < 0 || argumentCount <= metadata.maxArgs)
  );
}
