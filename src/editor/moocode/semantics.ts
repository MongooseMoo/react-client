import {
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  OPERATOR_WORDS,
  STATEMENT_KEYWORDS,
} from './contract';
import { maskMooSource, offsetAtMooPosition, type MooSourcePosition } from './scanner';
import type { MonacoRange } from './language';

export type MooLocalSymbol = {
  name: string;
  definitions: MonacoRange[];
  references: MonacoRange[];
};

export type MooSemanticAnalysis = {
  symbols: MooLocalSymbol[];
};

export type MooTextEdit = {
  range: MonacoRange;
  text: string;
};

export type MooDocumentHighlight = {
  range: MonacoRange;
  kind: 'read' | 'write';
};

export type MooCodeLens = {
  range: MonacoRange;
  title: string;
  tooltip: string;
};

export type MooLinkedEditingRanges = {
  ranges: MonacoRange[];
  wordPattern: RegExp;
};

export type MooRenameWorkspaceEdit = { edits: MooTextEdit[] } | { rejectReason: string };

export type MooRenameLocation =
  | {
      range: MonacoRange;
      text: string;
    }
  | { rejectReason: string };

type SymbolRecord = {
  name: string;
  definitions: Occurrence[];
  references: Occurrence[];
};

type Occurrence = {
  endOffset: number;
  range: MonacoRange;
  startOffset: number;
};

const IDENTIFIER_PATTERN = /[A-Za-z_][\w$]*/g;
const LINKED_IDENTIFIER_PATTERN = /[A-Za-z_][\w$]*/;
const VALID_IDENTIFIER_PATTERN = /^[A-Za-z_][\w$]*$/;
const NON_LOCAL_NAMES = new Set<string>([
  ...STATEMENT_KEYWORDS.map((keyword) => keyword.toLowerCase()),
  ...OPERATOR_WORDS.map((word) => word.toLowerCase()),
  ...ERROR_CONSTANTS.map((error) => error.toLowerCase()),
  ...BUILTIN_VARIABLES.map((variable) => variable.toLowerCase()),
  'true',
  'false',
  'error',
]);

export function analyzeMooSemantics(source: string): MooSemanticAnalysis {
  const masked = maskMooSource(source);
  const definitions = collectDefinitions(source, masked);
  const records = new Map<string, SymbolRecord>();

  for (const definition of definitions) {
    if (NON_LOCAL_NAMES.has(definition.name.toLowerCase())) {
      continue;
    }

    const record = ensureRecord(records, definition.name);
    record.definitions.push(definition.occurrence);
  }

  for (const occurrence of collectIdentifierOccurrences(source, masked)) {
    const record = records.get(occurrence.name);
    if (!record) {
      continue;
    }

    if (record.definitions.some((definition) => sameOccurrence(definition, occurrence.occurrence))) {
      continue;
    }

    record.references.push(occurrence.occurrence);
  }

  return {
    symbols: [...records.values()]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((record) => ({
        name: record.name,
        definitions: record.definitions.map((definition) => definition.range),
        references: record.references.map((reference) => reference.range),
      })),
  };
}

export function findMooDefinition(
  source: string,
  position: MooSourcePosition,
): { range: MonacoRange } | null {
  const lookup = getSymbolAtPosition(source, position);
  if (!lookup) {
    return null;
  }

  const firstDefinition = lookup.record.definitions[0];
  return firstDefinition ? { range: firstDefinition.range } : null;
}

export function findMooReferences(
  source: string,
  position: MooSourcePosition,
): Array<{ range: MonacoRange }> {
  const lookup = getSymbolAtPosition(source, position);
  if (!lookup) {
    return [];
  }

  return allSymbolOccurrences(lookup.record).map((occurrence) => ({
    range: occurrence.range,
  }));
}

export function findMooDocumentHighlights(
  source: string,
  position: MooSourcePosition,
): MooDocumentHighlight[] {
  const lookup = getSymbolAtPosition(source, position);
  if (!lookup) {
    return [];
  }

  return [
    ...lookup.record.definitions.map((definition) => ({
      range: definition.range,
      kind: 'write' as const,
    })),
    ...lookup.record.references.map((reference) => ({
      range: reference.range,
      kind: 'read' as const,
    })),
  ].sort((left, right) => compareRanges(left.range, right.range));
}

export function getMooLinkedEditingRanges(
  source: string,
  position: MooSourcePosition,
): MooLinkedEditingRanges | null {
  const lookup = getSymbolAtPosition(source, position);
  if (!lookup) {
    return null;
  }

  const ranges = allSymbolOccurrences(lookup.record).map((occurrence) => occurrence.range);
  if (ranges.length < 2) {
    return null;
  }

  return {
    ranges,
    wordPattern: LINKED_IDENTIFIER_PATTERN,
  };
}

export function getMooCodeLenses(source: string): MooCodeLens[] {
  return analyzeMooSemantics(source).symbols
    .filter((symbol) => symbol.definitions.length > 0)
    .map((symbol) => ({
      range: symbol.definitions[0],
      title: `${countLabel(symbol.definitions.length, 'definition')}, ${countLabel(
        symbol.references.length,
        'reference',
      )}`,
      tooltip: `Local ${symbol.name}: ${countLabel(
        symbol.definitions.length,
        'definition',
      )}, ${countLabel(symbol.references.length, 'reference')}.`,
    }))
    .sort((left, right) => compareRanges(left.range, right.range));
}

export function createMooRenameWorkspaceEdit(
  source: string,
  position: MooSourcePosition,
  newName: string,
): MooRenameWorkspaceEdit {
  if (!VALID_IDENTIFIER_PATTERN.test(newName)) {
    return {
      rejectReason: 'MOO identifiers must start with a letter or underscore.',
    };
  }

  const lookup = getSymbolAtPosition(source, position);
  if (!lookup) {
    return {
      rejectReason: 'No local MOO symbol is available at this position.',
    };
  }

  return {
    edits: allSymbolOccurrences(lookup.record).map((occurrence) => ({
      range: occurrence.range,
      text: newName,
    })),
  };
}

export function getMooRenameLocation(
  source: string,
  position: MooSourcePosition,
): MooRenameLocation {
  const lookup = getSymbolAtPosition(source, position);
  if (!lookup) {
    return {
      rejectReason: 'No local MOO symbol is available at this position.',
    };
  }

  return {
    range: lookup.occurrence.range,
    text: lookup.record.name,
  };
}

export function getMooLocalCompletions(
  source: string,
  position: MooSourcePosition,
): Array<{ name: string; range: MonacoRange }> {
  const cursorOffset = offsetAtMooPosition(source, position);
  const records = getSymbolRecords(source);

  return [...records.values()]
    .map((record) => ({
      record,
      nearestDefinitionOffset: Math.max(
        ...record.definitions
          .filter((definition) => definition.startOffset < cursorOffset)
          .map((definition) => definition.startOffset),
      ),
    }))
    .filter((entry) => Number.isFinite(entry.nearestDefinitionOffset))
    .sort((left, right) => right.nearestDefinitionOffset - left.nearestDefinitionOffset)
    .map((entry) => ({
      name: entry.record.name,
      range: entry.record.definitions[0].range,
    }));
}

function getSymbolAtPosition(
  source: string,
  position: MooSourcePosition,
): { record: SymbolRecord; occurrence: Occurrence } | null {
  const offset = offsetAtMooPosition(source, position);
  const masked = maskMooSource(source);
  const word = wordAtOffset(masked, offset);
  if (!word) {
    return null;
  }

  const record = getSymbolRecords(source).get(word.name);
  if (!record) {
    return null;
  }

  const occurrence = allSymbolOccurrences(record).find(
    (candidate) => candidate.startOffset <= word.offset && word.offset < candidate.endOffset,
  );
  return occurrence ? { record, occurrence } : null;
}

function getSymbolRecords(source: string): Map<string, SymbolRecord> {
  const masked = maskMooSource(source);
  const definitions = collectDefinitions(source, masked);
  const records = new Map<string, SymbolRecord>();

  for (const definition of definitions) {
    if (NON_LOCAL_NAMES.has(definition.name.toLowerCase())) {
      continue;
    }

    const record = ensureRecord(records, definition.name);
    record.definitions.push(definition.occurrence);
  }

  for (const occurrence of collectIdentifierOccurrences(source, masked)) {
    const record = records.get(occurrence.name);
    if (!record) {
      continue;
    }

    if (record.definitions.some((definition) => sameOccurrence(definition, occurrence.occurrence))) {
      continue;
    }

    record.references.push(occurrence.occurrence);
  }

  return records;
}

function collectDefinitions(
  source: string,
  masked: string,
): Array<{ name: string; occurrence: Occurrence }> {
  const definitions: Array<{ name: string; occurrence: Occurrence }> = [];
  const lines = masked.split(/\r\n|\r|\n/);
  const lineOffsets = getLineOffsets(source);

  lines.forEach((line, lineIndex) => {
    const lineOffset = lineOffsets[lineIndex] ?? 0;
    collectAssignmentDefinitions(source, line, lineOffset, definitions);
    collectForDefinitions(source, line, lineOffset, definitions);
    collectForkDefinitions(source, line, lineOffset, definitions);
    collectExceptDefinitions(source, line, lineOffset, definitions);
    collectScatterDefinitions(source, line, lineOffset, definitions);
  });

  return dedupeDefinitionOccurrences(definitions);
}

function collectAssignmentDefinitions(
  source: string,
  line: string,
  lineOffset: number,
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): void {
  const assignmentPattern = /(^|[;\s])([A-Za-z_][\w$]*)\s*=(?!=|>)/g;
  for (const match of line.matchAll(assignmentPattern)) {
    const name = match[2];
    if (!name) {
      continue;
    }

    const nameStart = lineOffset + match.index + match[0].indexOf(name);
    definitions.push({
      name,
      occurrence: occurrenceAt(source, nameStart, name.length),
    });
  }
}

function collectForDefinitions(
  source: string,
  line: string,
  lineOffset: number,
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): void {
  const match = /\bfor\s+([A-Za-z_][\w$]*)(?:\s*,\s*([A-Za-z_][\w$]*))?\s+in\b/i.exec(line);
  if (!match?.[1]) {
    return;
  }

  for (const name of [match[1], match[2]].filter(Boolean) as string[]) {
    const nameStart = lineOffset + match.index + match[0].indexOf(name);
    definitions.push({
      name,
      occurrence: occurrenceAt(source, nameStart, name.length),
    });
  }
}

function collectForkDefinitions(
  source: string,
  line: string,
  lineOffset: number,
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): void {
  const match = /\bfork\s+([A-Za-z_][\w$]*)\s*\(/i.exec(line);
  if (!match?.[1]) {
    return;
  }

  const name = match[1];
  const nameStart = lineOffset + match.index + match[0].indexOf(name);
  definitions.push({
    name,
    occurrence: occurrenceAt(source, nameStart, name.length),
  });
}

function collectExceptDefinitions(
  source: string,
  line: string,
  lineOffset: number,
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): void {
  const match = /\bexcept\s+([A-Za-z_][\w$]*)\s*\(/i.exec(line);
  if (!match?.[1]) {
    return;
  }

  const name = match[1];
  const nameStart = lineOffset + match.index + match[0].indexOf(name);
  definitions.push({
    name,
    occurrence: occurrenceAt(source, nameStart, name.length),
  });
}

function collectScatterDefinitions(
  source: string,
  line: string,
  lineOffset: number,
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): void {
  for (const match of line.matchAll(/\{([^}]*)\}\s*=/g)) {
    const targetList = match[1] ?? '';
    const targetListOffset = lineOffset + match.index + 1;

    for (const target of targetList.split(',')) {
      const name = /^\s*(?:[?@]\s*)?([A-Za-z_][\w$]*)/.exec(target)?.[1];
      if (!name) {
        continue;
      }

      const nameStart = targetListOffset + targetList.indexOf(target) + target.indexOf(name);
      definitions.push({
        name,
        occurrence: occurrenceAt(source, nameStart, name.length),
      });
    }
  }
}

function collectIdentifierOccurrences(
  source: string,
  masked: string,
): Array<{ name: string; occurrence: Occurrence }> {
  return [...masked.matchAll(IDENTIFIER_PATTERN)].map((match) => {
    const name = match[0];
    return {
      name,
      occurrence: occurrenceAt(source, match.index, name.length),
    };
  });
}

function dedupeDefinitionOccurrences(
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): Array<{ name: string; occurrence: Occurrence }> {
  const seen = new Set<string>();
  return definitions.filter((definition) => {
    const key = `${definition.name}:${definition.occurrence.startOffset}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function ensureRecord(records: Map<string, SymbolRecord>, name: string): SymbolRecord {
  const existing = records.get(name);
  if (existing) {
    return existing;
  }

  const record = {
    name,
    definitions: [],
    references: [],
  };
  records.set(name, record);
  return record;
}

function allSymbolOccurrences(record: SymbolRecord): Occurrence[] {
  return [...record.definitions, ...record.references].sort(
    (left, right) => left.startOffset - right.startOffset,
  );
}

function sameOccurrence(left: Occurrence, right: Occurrence): boolean {
  return left.startOffset === right.startOffset && left.endOffset === right.endOffset;
}

function compareRanges(left: MonacoRange, right: MonacoRange): number {
  if (left.startLineNumber !== right.startLineNumber) {
    return left.startLineNumber - right.startLineNumber;
  }

  return left.startColumn - right.startColumn;
}

function countLabel(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function wordAtOffset(source: string, offset: number): { name: string; offset: number } | null {
  const candidateOffset =
    isIdentifierCharacter(source[offset]) || !isIdentifierCharacter(source[offset - 1])
      ? offset
      : offset - 1;
  if (!isIdentifierCharacter(source[candidateOffset])) {
    return null;
  }

  let start = candidateOffset;
  while (start > 0 && isIdentifierCharacter(source[start - 1])) {
    start -= 1;
  }

  let end = candidateOffset + 1;
  while (end < source.length && isIdentifierCharacter(source[end])) {
    end += 1;
  }

  const name = source.slice(start, end);
  return VALID_IDENTIFIER_PATTERN.test(name) ? { name, offset: candidateOffset } : null;
}

function isIdentifierCharacter(character: string | undefined): boolean {
  return Boolean(character && /[\w$]/.test(character));
}

function occurrenceAt(source: string, startOffset: number, length: number): Occurrence {
  return {
    startOffset,
    endOffset: startOffset + length,
    range: rangeFromOffsets(source, startOffset, startOffset + length),
  };
}

function rangeFromOffsets(source: string, startOffset: number, endOffset: number): MonacoRange {
  const start = positionAt(source, startOffset);
  const end = positionAt(source, endOffset);

  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
}

function positionAt(source: string, offset: number): MooSourcePosition {
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

function getLineOffsets(source: string): number[] {
  const offsets = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') {
      offsets.push(index + 1);
    }
  }

  return offsets;
}
