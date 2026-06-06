import {
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  MOO_BLOCKS,
  MOO_CLOSE_KEYWORDS,
  MOO_IDENTIFIER_PATTERN_SOURCE,
  OPERATOR_WORDS,
  STATEMENT_KEYWORDS,
} from './contract';
import {
  firstMooKeyword,
  maskMooSource,
  offsetAtMooPosition,
  type MooSourcePosition,
} from './scanner';
import type { MonacoRange } from './language';

export type MooLocalSymbol = {
  name: string;
  definitions: MonacoRange[];
  references: MonacoRange[];
};

export type MooSemanticAnalysis = {
  symbols: MooLocalSymbol[];
};

export type MooSemanticSymbolSummary = {
  definitions: MonacoRange[];
  kind: 'local' | 'loop-label';
  name: string;
  occurrenceRange: MonacoRange;
  references: MonacoRange[];
};

export type MooSemanticSymbolRange = {
  isDeclaration: boolean;
  kind: MooSemanticSymbolSummary['kind'];
  range: MonacoRange;
};

export type MooUndefinedLocalReference = {
  definitionRange?: MonacoRange;
  name: string;
  range: MonacoRange;
  suggestedName?: string;
  suggestedRange?: MonacoRange;
};

export type MooUnusedLocalDefinition = {
  name: string;
  range: MonacoRange;
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

export type MooNewSymbolNameSuggestion = {
  newSymbolName: string;
};

type SymbolRecord = {
  name: string;
  definitions: Occurrence[];
  references: Occurrence[];
};

type BlockKind = keyof typeof MOO_BLOCKS;

type LabelBlockFrame = {
  kind: BlockKind;
  labelRecord?: SymbolRecord;
};

type Occurrence = {
  endOffset: number;
  range: MonacoRange;
  startOffset: number;
};

type LoopLabelReference = {
  name: string;
  occurrence: Occurrence;
  suggestedName?: string;
  suggestedRange?: MonacoRange;
};

const IDENTIFIER_PATTERN = new RegExp(MOO_IDENTIFIER_PATTERN_SOURCE, 'g');
const LINKED_IDENTIFIER_PATTERN = new RegExp(MOO_IDENTIFIER_PATTERN_SOURCE);
const VALID_IDENTIFIER_PATTERN = new RegExp(`^${MOO_IDENTIFIER_PATTERN_SOURCE}$`);
const IDENTIFIER_START_PATTERN = /^[A-Za-z_]/;
const IDENTIFIER_CHARACTER_PATTERN = /^[A-Za-z0-9_]$/;
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
  return {
    symbols: [...getSymbolRecords(source).values()]
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
  const lookup = getSymbolAtPosition(source, position) ?? getLoopLabelAtPosition(source, position);
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
  const lookup = getSymbolAtPosition(source, position) ?? getLoopLabelAtPosition(source, position);
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
  const lookup = getSymbolAtPosition(source, position) ?? getLoopLabelAtPosition(source, position);
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
  const lookup = getSymbolAtPosition(source, position) ?? getLoopLabelAtPosition(source, position);
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

export function getMooSemanticSymbolSummary(
  source: string,
  position: MooSourcePosition,
): MooSemanticSymbolSummary | null {
  const localLookup = getSymbolAtPosition(source, position);
  if (localLookup) {
    return toSemanticSymbolSummary(localLookup.record, localLookup.occurrence, 'local');
  }

  const labelLookup = getLoopLabelAtPosition(source, position);
  if (labelLookup) {
    return toSemanticSymbolSummary(labelLookup.record, labelLookup.occurrence, 'loop-label');
  }

  return null;
}

export function collectMooSemanticSymbolRanges(source: string): MooSemanticSymbolRange[] {
  const ranges: MooSemanticSymbolRange[] = [];

  for (const record of getSymbolRecords(source).values()) {
    ranges.push(...toSemanticSymbolRanges(record, 'local'));
  }

  for (const record of collectLoopLabelReferences(source).records) {
    ranges.push(...toSemanticSymbolRanges(record, 'loop-label'));
  }

  return ranges.sort((left, right) => compareRanges(left.range, right.range));
}

export function getMooCodeLenses(source: string): MooCodeLens[] {
  return [
    ...[...getSymbolRecords(source).values()].map((record) => toCodeLens(record, 'local')),
    ...collectLoopLabelReferences(source).records.map((record) => toCodeLens(record, 'loop-label')),
  ]
    .filter((lens): lens is MooCodeLens => lens !== null)
    .sort((left, right) => compareRanges(left.range, right.range));
}

export function createMooRenameWorkspaceEdit(
  source: string,
  position: MooSourcePosition,
  newName: string,
): MooRenameWorkspaceEdit {
  const validationError = validateMooIdentifier(newName);
  if (validationError) {
    return { rejectReason: validationError };
  }

  const localLookup = getSymbolAtPosition(source, position);
  const labelLookup = localLookup ? null : getLoopLabelAtPosition(source, position);
  const lookup = localLookup ?? labelLookup;
  if (!lookup) {
    return {
      rejectReason: 'No local MOO symbol or loop label is available at this position.',
    };
  }

  const conflictError = validateMooRenameConflict(
    source,
    newName,
    lookup.record.name,
  );
  if (conflictError) {
    return { rejectReason: conflictError };
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
  const lookup = getSymbolAtPosition(source, position) ?? getLoopLabelAtPosition(source, position);
  if (!lookup) {
    return {
      rejectReason: 'No local MOO symbol or loop label is available at this position.',
    };
  }

  return {
    range: lookup.occurrence.range,
    text: lookup.record.name,
  };
}

export function getMooNewSymbolNameSuggestions(
  source: string,
  range: MonacoRange,
): MooNewSymbolNameSuggestion[] {
  const location = getMooRenameLocation(source, {
    lineNumber: range.startLineNumber,
    column: range.startColumn,
  });
  if ('rejectReason' in location) {
    return [];
  }

  const currentName = location.text;
  const reservedNames = new Set([
    ...NON_LOCAL_NAMES,
    ...[...getSymbolRecords(source).values()].map((record) => record.name.toLowerCase()),
    ...collectLoopLabelReferences(source).records.map((record) => record.name.toLowerCase()),
  ]);
  const currentNameKey = currentName.toLowerCase();

  return candidateRenameNames(currentName)
    .filter((candidate) => candidate.toLowerCase() !== currentNameKey)
    .filter((candidate) => validateMooIdentifier(candidate) === null)
    .filter((candidate) => !reservedNames.has(candidate.toLowerCase()))
    .slice(0, 5)
    .map((newSymbolName) => ({ newSymbolName }));
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

export function getMooLoopLabelCompletions(
  source: string,
  position: MooSourcePosition,
): Array<{ name: string; range: MonacoRange }> {
  const cursorOffset = offsetAtMooPosition(source, position);

  return collectVisibleLoopLabelRecords(source, cursorOffset)
    .map((record) => ({
      name: record.name,
      range: record.definitions[0].range,
    }))
    .reverse();
}

export function findMooUnknownLoopLabelReferences(source: string): MooUndefinedLocalReference[] {
  return collectLoopLabelReferences(source).unknownReferences.map((reference) => {
    const unknownReference: MooUndefinedLocalReference = {
      name: reference.name,
      range: reference.occurrence.range,
    };
    if (reference.suggestedName && reference.suggestedRange) {
      unknownReference.suggestedName = reference.suggestedName;
      unknownReference.suggestedRange = reference.suggestedRange;
    }

    return unknownReference;
  });
}

export function findMooUndefinedLocalReferences(source: string): MooUndefinedLocalReference[] {
  const masked = maskMooSource(source);
  const definitions = collectDefinitions(source, masked).filter(
    (definition) => !NON_LOCAL_NAMES.has(definition.name.toLowerCase()),
  );
  const firstDefinitions = firstDefinitionsByName(definitions);
  const definitionOffsets = new Set(
    definitions.map((definition) => definition.occurrence.startOffset),
  );
  const seenOffsets = new Set<number>();
  const references: MooUndefinedLocalReference[] = [];

  for (const occurrence of collectIdentifierOccurrences(source, masked)) {
    const normalizedName = occurrence.name.toLowerCase();
    const firstDefinition = firstDefinitions.get(normalizedName);
    if (
      NON_LOCAL_NAMES.has(normalizedName) ||
      definitionOffsets.has(occurrence.occurrence.startOffset) ||
      (firstDefinition !== undefined &&
        firstDefinition.startOffset < occurrence.occurrence.startOffset) ||
      isNonVariableIdentifierOccurrence(masked, occurrence.occurrence)
    ) {
      continue;
    }

    if (seenOffsets.has(occurrence.occurrence.startOffset)) {
      continue;
    }

    seenOffsets.add(occurrence.occurrence.startOffset);
    const suggestion =
      firstDefinition === undefined
        ? findLikelyLocalTypoReplacement(source, occurrence.name, {
            lineNumber: occurrence.occurrence.range.startLineNumber,
            column: occurrence.occurrence.range.startColumn,
          })
        : null;
    const reference: MooUndefinedLocalReference = {
      name: occurrence.name,
      range: occurrence.occurrence.range,
    };
    if (firstDefinition) {
      reference.definitionRange = firstDefinition.range;
    }
    if (suggestion) {
      reference.suggestedName = suggestion.name;
      reference.suggestedRange = suggestion.range;
    }
    references.push(reference);
  }

  return references.sort((left, right) => compareRanges(left.range, right.range));
}

function findLikelyLocalTypoReplacement(
  source: string,
  name: string,
  position: MooSourcePosition,
): { name: string; range: MonacoRange } | null {
  const normalizedName = name.toLowerCase();
  const candidates = getMooLocalCompletions(source, position)
    .filter((candidate) => candidate.name.toLowerCase() !== normalizedName)
    .filter((candidate) => !isLikelyPluralVariant(normalizedName, candidate.name.toLowerCase()))
    .map((candidate) => ({
      ...candidate,
      distance: damerauLevenshteinDistance(normalizedName, candidate.name.toLowerCase()),
    }))
    .filter((candidate) => candidate.distance <= typoDistanceThreshold(name))
    .sort((left, right) => left.distance - right.distance);

  return candidates[0] ?? null;
}

function isLikelyPluralVariant(left: string, right: string): boolean {
  return left === `${right}s` || right === `${left}s`;
}

function typoDistanceThreshold(name: string): number {
  return name.length <= 4 ? 1 : 2;
}

function damerauLevenshteinDistance(left: string, right: string): number {
  const distances: number[][] = Array.from({ length: left.length + 1 }, () =>
    Array.from({ length: right.length + 1 }, () => 0),
  );

  for (let row = 0; row <= left.length; row += 1) {
    distances[row][0] = row;
  }

  for (let column = 0; column <= right.length; column += 1) {
    distances[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + substitutionCost,
      );

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        distances[row][column] = Math.min(
          distances[row][column],
          distances[row - 2][column - 2] + 1,
        );
      }
    }
  }

  return distances[left.length][right.length];
}

export function findMooUnusedLocalDefinitions(source: string): MooUnusedLocalDefinition[] {
  return [...getSymbolRecords(source).values()]
    .filter((record) => record.definitions.length > 0)
    .filter((record) => !record.name.startsWith('_'))
    .filter((record) => record.references.length === 0)
    .map((record) => ({
      name: record.name,
      range: record.definitions[0].range,
    }))
    .sort((left, right) => compareRanges(left.range, right.range));
}

function firstDefinitionsByName(
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): Map<string, Occurrence> {
  const definitionsByName = new Map<string, Occurrence>();

  for (const definition of definitions) {
    const normalizedName = definition.name.toLowerCase();
    const existing = definitionsByName.get(normalizedName);
    if (existing === undefined || definition.occurrence.startOffset < existing.startOffset) {
      definitionsByName.set(normalizedName, definition.occurrence);
    }
  }

  return definitionsByName;
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

  const record = getSymbolRecords(source).get(symbolKey(word.name));
  if (!record) {
    return null;
  }

  const occurrence = allSymbolOccurrences(record).find(
    (candidate) => candidate.startOffset <= word.offset && word.offset < candidate.endOffset,
  );
  return occurrence ? { record, occurrence } : null;
}

function getLoopLabelAtPosition(
  source: string,
  position: MooSourcePosition,
): { record: SymbolRecord; occurrence: Occurrence } | null {
  const offset = offsetAtMooPosition(source, position);
  const masked = maskMooSource(source);
  const word = wordAtOffset(masked, offset);
  if (!word) {
    return null;
  }

  for (const record of collectLoopLabelReferences(source).records) {
    const occurrence = allSymbolOccurrences(record).find(
      (candidate) => candidate.startOffset <= word.offset && word.offset < candidate.endOffset,
    );
    if (occurrence) {
      return { record, occurrence };
    }
  }

  return null;
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
    const record = records.get(symbolKey(occurrence.name));
    if (!record) {
      continue;
    }

    if (
      isNonVariableIdentifierOccurrence(masked, occurrence.occurrence) ||
      record.definitions.some((definition) => sameOccurrence(definition, occurrence.occurrence))
    ) {
      continue;
    }

    record.references.push(occurrence.occurrence);
  }

  return records;
}

function collectVisibleLoopLabelRecords(source: string, cursorOffset: number): SymbolRecord[] {
  return collectLoopLabelReferences(source, cursorOffset).visibleLabelRecords;
}

function collectLoopLabelReferences(
  source: string,
  stopOffset = source.length,
): {
  records: SymbolRecord[];
  unknownReferences: LoopLabelReference[];
  visibleLabelRecords: SymbolRecord[];
} {
  const masked = maskMooSource(source);
  const lines = masked.split(/\r\n|\r|\n/);
  const lineOffsets = getLineOffsets(source);
  const blockStack: LabelBlockFrame[] = [];
  const records: SymbolRecord[] = [];
  const unknownReferences: LoopLabelReference[] = [];
  let visibleLabelRecords: SymbolRecord[] = [];

  lines.forEach((line, lineIndex) => {
    const lineOffset = lineOffsets[lineIndex] ?? 0;
    if (lineOffset >= stopOffset) {
      return;
    }

    const lineStopOffset = Math.min(stopOffset, lineOffset + line.length);
    const scannedLine = line.slice(0, lineStopOffset - lineOffset);
    const keyword = firstMooKeyword(scannedLine);
    if (!keyword) {
      visibleLabelRecords = labelRecordsFromStack(blockStack);
      return;
    }

    const normalized = keyword.word.toLowerCase();
    if (normalized === 'break' || normalized === 'continue') {
      const reference = readLoopControlLabel(source, scannedLine, lineOffset);
      if (reference) {
        const record = findVisibleLoopLabelRecord(blockStack, reference.name);
        if (record) {
          record.references.push(reference.occurrence);
        } else if (isInsideLoop(blockStack)) {
          const suggestion = findLikelyLoopLabelReplacement(blockStack, reference.name);
          if (suggestion) {
            reference.suggestedName = suggestion.name;
            reference.suggestedRange = suggestion.definitions[0].range;
          }
          unknownReferences.push(reference);
        }
      }
    }

    const closeKind = MOO_CLOSE_KEYWORDS[normalized];
    if (closeKind) {
      blockStack.pop();
      visibleLabelRecords = labelRecordsFromStack(blockStack);
      return;
    }

    const openBlock = MOO_BLOCKS[normalized as BlockKind];
    if (openBlock) {
      const labelRecord =
        normalized === 'while'
          ? collectWhileLabelRecord(source, scannedLine, lineOffset, records)
          : undefined;
      blockStack.push({
        kind: normalized as BlockKind,
        labelRecord,
      });
    }

    visibleLabelRecords = labelRecordsFromStack(blockStack);
  });

  return { records, unknownReferences, visibleLabelRecords };
}

function collectWhileLabelRecord(
  source: string,
  line: string,
  lineOffset: number,
  records: SymbolRecord[],
): SymbolRecord | undefined {
  const match = new RegExp(`\\bwhile\\s+(${MOO_IDENTIFIER_PATTERN_SOURCE})\\s*\\(`, 'i').exec(line);
  if (!match?.[1]) {
    return undefined;
  }

  const name = match[1];
  const nameStart = lineOffset + match.index + match[0].indexOf(name);
  const record = {
    name,
    definitions: [occurrenceAt(source, nameStart, name.length)],
    references: [],
  };
  records.push(record);
  return record;
}

function readLoopControlLabel(
  source: string,
  line: string,
  lineOffset: number,
): LoopLabelReference | null {
  const match = new RegExp(
    `\\b(?:break|continue)\\s+(${MOO_IDENTIFIER_PATTERN_SOURCE})\\b`,
    'i',
  ).exec(line);
  if (!match?.[1]) {
    return null;
  }

  const name = match[1];
  const nameStart = lineOffset + match.index + match[0].indexOf(name);
  return {
    name,
    occurrence: occurrenceAt(source, nameStart, name.length),
  };
}

function findVisibleLoopLabelRecord(
  blockStack: LabelBlockFrame[],
  name: string,
): SymbolRecord | undefined {
  const key = symbolKey(name);
  for (let index = blockStack.length - 1; index >= 0; index -= 1) {
    const record = blockStack[index].labelRecord;
    if (record && symbolKey(record.name) === key) {
      return record;
    }
  }

  return undefined;
}

function findLikelyLoopLabelReplacement(
  blockStack: LabelBlockFrame[],
  name: string,
): SymbolRecord | null {
  const normalizedName = name.toLowerCase();
  const candidates = labelRecordsFromStack(blockStack)
    .filter((record) => record.name.toLowerCase() !== normalizedName)
    .map((record) => ({
      record,
      distance: damerauLevenshteinDistance(normalizedName, record.name.toLowerCase()),
    }))
    .filter((candidate) => candidate.distance <= typoDistanceThreshold(name))
    .sort((left, right) => left.distance - right.distance);

  return candidates[0]?.record ?? null;
}

function isInsideLoop(blockStack: LabelBlockFrame[]): boolean {
  return blockStack.some((frame) => MOO_BLOCKS[frame.kind].isLoop === true);
}

function labelRecordsFromStack(blockStack: LabelBlockFrame[]): SymbolRecord[] {
  return blockStack
    .map((frame) => frame.labelRecord)
    .filter((record): record is SymbolRecord => record !== undefined);
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
  const assignmentPattern = new RegExp(
    `(^|[;\\s])(${MOO_IDENTIFIER_PATTERN_SOURCE})\\s*=(?!=|>)`,
    'g',
  );
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
  const match = new RegExp(
    `\\bfor\\s+(${MOO_IDENTIFIER_PATTERN_SOURCE})(?:\\s*,\\s*(${MOO_IDENTIFIER_PATTERN_SOURCE}))?\\s+in\\b`,
    'i',
  ).exec(line);
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
  const match = new RegExp(`\\bfork\\s+(${MOO_IDENTIFIER_PATTERN_SOURCE})\\s*\\(`, 'i').exec(line);
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
  const match = new RegExp(`\\bexcept\\s+(${MOO_IDENTIFIER_PATTERN_SOURCE})\\s*\\(`, 'i').exec(
    line,
  );
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
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== '{') {
      continue;
    }

    const closeIndex = findMatchingDelimiter(line, index);
    if (closeIndex === null) {
      continue;
    }

    const nextIndex = nextNonWhitespaceIndex(line, closeIndex + 1);
    if (nextIndex !== null && line[nextIndex] === '=') {
      collectScatterTargetListDefinitions(
        source,
        line,
        lineOffset,
        index + 1,
        closeIndex,
        definitions,
      );
      index = closeIndex;
    }
  }
}

function collectScatterTargetListDefinitions(
  source: string,
  line: string,
  lineOffset: number,
  startIndex: number,
  endIndex: number,
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): void {
  let targetStartIndex = startIndex;
  const delimiters: string[] = [];

  for (let index = startIndex; index <= endIndex; index += 1) {
    const character = index === endIndex ? ',' : line[index];

    if (isOpeningDelimiter(character)) {
      delimiters.push(character);
      continue;
    }

    if (isClosingDelimiter(character) && delimiters.at(-1) === matchingOpenDelimiter(character)) {
      delimiters.pop();
      continue;
    }

    if (character === ',' && delimiters.length === 0) {
      collectScatterTargetDefinition(
        source,
        line,
        lineOffset,
        targetStartIndex,
        index,
        definitions,
      );
      targetStartIndex = index + 1;
    }
  }
}

function collectScatterTargetDefinition(
  source: string,
  line: string,
  lineOffset: number,
  startIndex: number,
  endIndex: number,
  definitions: Array<{ name: string; occurrence: Occurrence }>,
): void {
  const target = line.slice(startIndex, endIndex);
  const name = new RegExp(`^\\s*(?:[?@]\\s*)?(${MOO_IDENTIFIER_PATTERN_SOURCE})\\b`).exec(
    target,
  )?.[1];
  if (!name) {
    return;
  }

  const nameStart = lineOffset + startIndex + target.indexOf(name);
  definitions.push({
    name,
    occurrence: occurrenceAt(source, nameStart, name.length),
  });
}

function findMatchingDelimiter(line: string, openIndex: number): number | null {
  const openDelimiter = line[openIndex];
  const closeDelimiter = matchingCloseDelimiter(openDelimiter);
  if (!closeDelimiter) {
    return null;
  }

  let depth = 0;
  for (let index = openIndex; index < line.length; index += 1) {
    if (line[index] === openDelimiter) {
      depth += 1;
      continue;
    }

    if (line[index] === closeDelimiter) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return null;
}

function isOpeningDelimiter(character: string): boolean {
  return character === '(' || character === '[' || character === '{';
}

function isClosingDelimiter(character: string): boolean {
  return character === ')' || character === ']' || character === '}';
}

function matchingOpenDelimiter(character: string): string | null {
  switch (character) {
    case ')':
      return '(';
    case ']':
      return '[';
    case '}':
      return '{';
    default:
      return null;
  }
}

function matchingCloseDelimiter(character: string): string | null {
  switch (character) {
    case '(':
      return ')';
    case '[':
      return ']';
    case '{':
      return '}';
    default:
      return null;
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
  const key = symbolKey(name);
  const existing = records.get(key);
  if (existing) {
    return existing;
  }

  const record = {
    name,
    definitions: [],
    references: [],
  };
  records.set(key, record);
  return record;
}

function symbolKey(name: string): string {
  return name.toLowerCase();
}

function allSymbolOccurrences(record: SymbolRecord): Occurrence[] {
  return [...record.definitions, ...record.references].sort(
    (left, right) => left.startOffset - right.startOffset,
  );
}

function toSemanticSymbolSummary(
  record: SymbolRecord,
  occurrence: Occurrence,
  kind: MooSemanticSymbolSummary['kind'],
): MooSemanticSymbolSummary {
  return {
    kind,
    name: record.name,
    definitions: record.definitions.map((definition) => definition.range),
    occurrenceRange: occurrence.range,
    references: record.references.map((reference) => reference.range),
  };
}

function toSemanticSymbolRanges(
  record: SymbolRecord,
  kind: MooSemanticSymbolSummary['kind'],
): MooSemanticSymbolRange[] {
  return [
    ...record.definitions.map((definition) => ({
      kind,
      range: definition.range,
      isDeclaration: true,
    })),
    ...record.references.map((reference) => ({
      kind,
      range: reference.range,
      isDeclaration: false,
    })),
  ];
}

function toCodeLens(
  record: SymbolRecord,
  kind: MooSemanticSymbolSummary['kind'],
): MooCodeLens | null {
  const firstDefinition = record.definitions[0];
  if (!firstDefinition) {
    return null;
  }

  const label = kind === 'loop-label' ? 'Loop label' : 'Local';

  return {
    range: firstDefinition.range,
    title: `${countLabel(record.definitions.length, 'definition')}, ${countLabel(
      record.references.length,
      'reference',
    )}`,
    tooltip: `${label} ${record.name}: ${countLabel(
      record.definitions.length,
      'definition',
    )}, ${countLabel(record.references.length, 'reference')}.`,
  };
}

function sameOccurrence(left: Occurrence, right: Occurrence): boolean {
  return left.startOffset === right.startOffset && left.endOffset === right.endOffset;
}

function isNonVariableIdentifierOccurrence(source: string, occurrence: Occurrence): boolean {
  if (isBareExceptionSelectorIdentifier(source, occurrence)) {
    return true;
  }

  if (isLoopControlLabelIdentifier(source, occurrence)) {
    return true;
  }

  const previous = previousNonWhitespaceCharacter(source, occurrence.startOffset);
  if (previous === '.' || previous === ':' || previous === '$') {
    return true;
  }

  const next = nextNonWhitespaceCharacter(source, occurrence.endOffset);
  return next === '(' || next === '$';
}

function isBareExceptionSelectorIdentifier(source: string, occurrence: Occurrence): boolean {
  const line = lineAroundOffset(source, occurrence.startOffset);
  const localStart = occurrence.startOffset - line.startOffset;

  return (
    isBareExceptClauseSelector(line.text, localStart) ||
    isBareCatchExpressionSelector(line.text, localStart)
  );
}

function isBareExceptClauseSelector(line: string, localStart: number): boolean {
  const openIndex = line.lastIndexOf('(', localStart);
  if (openIndex < 0 || line.slice(0, openIndex).search(/\bexcept\b/i) < 0) {
    return false;
  }

  const closeIndex = line.indexOf(')', openIndex + 1);
  if (closeIndex >= 0 && localStart > closeIndex) {
    return false;
  }

  return !isAtExpressionExceptionSelector(line, openIndex + 1, localStart);
}

function isBareCatchExpressionSelector(line: string, localStart: number): boolean {
  const catchStart = line.lastIndexOf('`', localStart);
  const bangIndex = line.lastIndexOf('!', localStart);
  if (catchStart < 0 || bangIndex < catchStart) {
    return false;
  }

  const tailStart = bangIndex + 1;
  const selectorPrefix = line.slice(tailStart, localStart);
  if (selectorPrefix.includes("'") || selectorPrefix.includes('=>')) {
    return false;
  }

  return !isAtExpressionExceptionSelector(line, tailStart, localStart);
}

function isAtExpressionExceptionSelector(
  line: string,
  selectorListStart: number,
  localStart: number,
): boolean {
  const segmentStart = Math.max(selectorListStart, line.lastIndexOf(',', localStart - 1) + 1);
  return line.slice(segmentStart, localStart).trimStart().startsWith('@');
}

function lineAroundOffset(source: string, offset: number): { text: string; startOffset: number } {
  const startOffset = Math.max(source.lastIndexOf('\n', offset - 1) + 1, 0);
  const endOffset = source.indexOf('\n', offset);

  return {
    text: source.slice(startOffset, endOffset < 0 ? source.length : endOffset),
    startOffset,
  };
}

function isLoopControlLabelIdentifier(source: string, occurrence: Occurrence): boolean {
  const line = lineAroundOffset(source, occurrence.startOffset);
  const localStart = occurrence.startOffset - line.startOffset;

  return /\b(?:break|continue)\s+$/i.test(line.text.slice(0, localStart));
}

function validateMooIdentifier(value: string): string | null {
  if (!IDENTIFIER_START_PATTERN.test(value[0] ?? '')) {
    return 'MOO identifiers must start with a letter or underscore.';
  }

  if (!VALID_IDENTIFIER_PATTERN.test(value)) {
    return 'MOO identifiers may contain only letters, digits, and underscores.';
  }

  return null;
}

function validateMooRenameConflict(
  source: string,
  newName: string,
  currentName: string,
): string | null {
  const targetKey = symbolKey(newName);
  const currentKey = symbolKey(currentName);

  if (targetKey === currentKey) {
    return null;
  }

  if (NON_LOCAL_NAMES.has(targetKey)) {
    return `${newName} is a reserved MOO name.`;
  }

  const localConflict = [...getSymbolRecords(source).values()].some(
    (record) => symbolKey(record.name) === targetKey,
  );
  if (localConflict) {
    return `A MOO local named ${newName} already exists.`;
  }

  const labelConflict = collectLoopLabelReferences(source).records.some(
    (record) => symbolKey(record.name) === targetKey,
  );
  if (labelConflict) {
    return `A MOO loop label named ${newName} already exists.`;
  }

  return null;
}

function candidateRenameNames(name: string): string[] {
  const normalized = toSnakeCase(name);
  if (normalized === 'i') {
    return ['index', 'item_index', 'loop_index', 'counter'];
  }

  if (normalized === 'tmp' || normalized === 'temp') {
    return ['value', 'result', 'scratch', 'item'];
  }

  const stem = normalized || 'value';
  return [`new_${stem}`, `${stem}_value`, `${stem}_result`, `${stem}_count`, `${stem}_item`];
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function previousNonWhitespaceCharacter(source: string, offset: number): string | null {
  for (let index = offset - 1; index >= 0; index -= 1) {
    if (!/\s/.test(source[index])) {
      return source[index];
    }
  }

  return null;
}

function nextNonWhitespaceIndex(source: string, offset: number): number | null {
  for (let index = offset; index < source.length; index += 1) {
    if (!/\s/.test(source[index])) {
      return index;
    }
  }

  return null;
}

function nextNonWhitespaceCharacter(source: string, offset: number): string | null {
  for (let index = offset; index < source.length; index += 1) {
    if (!/\s/.test(source[index])) {
      return source[index];
    }
  }

  return null;
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
  return Boolean(character && IDENTIFIER_CHARACTER_PATTERN.test(character));
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
