import type {
  BUILTIN_VARIABLES,
  ERROR_CONSTANTS,
  OPERATOR_WORDS,
  STATEMENT_KEYWORDS,
  SYSTEM_REFERENCES,
} from './contract';
import { MOO_IDENTIFIER_PATTERN_SOURCE, MOO_SYSTEM_REFERENCE_PATTERN_SOURCE } from './contract';
import { maskMooSource, offsetAtMooPosition, type MooSourcePosition } from './scanner';
import { getMooSemanticSymbolSummary } from './semantics';
import { getMooBuiltinSignature } from './signatures';
import type { MonacoRange } from './language';
import { findMooDocumentLinkAtPosition } from './links';

export type MooHover = {
  range: MonacoRange;
  contents: Array<{ value: string }>;
};

type MooWord = {
  name: string;
  range: MonacoRange;
};

type WordOffsets = {
  startOffset: number;
  endOffset: number;
};

const BUILTIN_VARIABLE_DOCUMENTATION: Record<(typeof BUILTIN_VARIABLES)[number], string> = {
  player: 'The player whose command started this task.',
  this: 'The object whose verb is executing.',
  caller: 'The object or verb that called this verb.',
  verb: 'The name of the verb currently executing.',
  args: 'The list of arguments supplied to the verb.',
  argstr: 'The unparsed argument string supplied to the verb.',
  dobj: 'The direct object matched by command parsing.',
  dobjstr: 'The direct-object text supplied by command parsing.',
  prepstr: 'The preposition text matched by command parsing.',
  iobj: 'The indirect object matched by command parsing.',
  iobjstr: 'The indirect-object text supplied by command parsing.',
};

const SYSTEM_REFERENCE_DOCUMENTATION: Record<(typeof SYSTEM_REFERENCES)[number], string> = {
  $login: 'MOO login object.',
  $local: 'MOO local configuration object.',
  $network: 'MOO network services object.',
  $player: 'MOO player utility object.',
  $room: 'MOO room utility object.',
  $string_utils: 'MOO string utility object.',
  $telnet_utils: 'MOO telnet utility object.',
  $utils: 'MOO general utility object.',
  $wiz: 'MOO wizard utility object.',
};

const ERROR_DOCUMENTATION: Record<(typeof ERROR_CONSTANTS)[number], string> = {
  E_NONE: 'No error.',
  E_TYPE: 'Type mismatch.',
  E_DIV: 'Division by zero.',
  E_PERM: 'Permission denied.',
  E_PROPNF: 'Property not found.',
  E_VERBNF: 'Verb not found.',
  E_VARNF: 'Variable not found.',
  E_INVIND: 'Invalid index.',
  E_RECMOVE: 'Recursive move.',
  E_MAXREC: 'Maximum recursion exceeded.',
  E_RANGE: 'Range error.',
  E_ARGS: 'Incorrect arguments.',
  E_NACC: 'Network access denied or unavailable.',
  E_INVARG: 'Invalid argument.',
  E_QUOTA: 'Resource quota exceeded.',
  E_FLOAT: 'Floating-point error.',
  E_FILE: 'File operation error.',
  E_EXEC: 'Execution error.',
  E_INTRPT: 'Task interrupted.',
};

const KEYWORD_DOCUMENTATION: Partial<Record<(typeof STATEMENT_KEYWORDS)[number], string>> = {
  if: 'Begins a conditional block.',
  elseif: 'Starts another condition branch in an if block.',
  else: 'Starts the fallback branch in an if block.',
  endif: 'Closes an if block.',
  for: 'Begins iteration over a list or range.',
  endfor: 'Closes a for block.',
  fork: 'Starts a forked task block.',
  endfork: 'Closes a fork block.',
  return: 'Returns a value from the current verb.',
  while: 'Begins a loop that continues while its condition is true.',
  endwhile: 'Closes a while block.',
  try: 'Begins an exception-handling block.',
  except: 'Handles matching exceptions in a try block.',
  finally: 'Runs cleanup code before leaving a try block.',
  endtry: 'Closes a try block.',
  break: 'Leaves the nearest enclosing loop.',
  continue: 'Skips to the next iteration of the nearest enclosing loop.',
};

const OPERATOR_DOCUMENTATION: Partial<Record<(typeof OPERATOR_WORDS)[number], string>> = {
  and: 'Logical AND operator.',
  or: 'Logical OR operator.',
  bitor: 'Bitwise OR operator.',
  bitand: 'Bitwise AND operator.',
  bitxor: 'Bitwise XOR operator.',
};
const WORD_PATTERNS = [
  new RegExp(MOO_SYSTEM_REFERENCE_PATTERN_SOURCE, 'g'),
  new RegExp(MOO_IDENTIFIER_PATTERN_SOURCE, 'g'),
];

export function getMooBuiltinVariableDocumentation(name: string): string | null {
  const normalizedName = name.toLowerCase();
  return (
    BUILTIN_VARIABLE_DOCUMENTATION[normalizedName as keyof typeof BUILTIN_VARIABLE_DOCUMENTATION] ??
    null
  );
}

export function getMooErrorDocumentation(name: string): string | null {
  const upperName = name.toUpperCase();
  return ERROR_DOCUMENTATION[upperName as keyof typeof ERROR_DOCUMENTATION] ?? null;
}

export function getMooSystemReferenceDocumentation(name: string): string | null {
  const normalizedName = name.toLowerCase();
  return (
    SYSTEM_REFERENCE_DOCUMENTATION[normalizedName as keyof typeof SYSTEM_REFERENCE_DOCUMENTATION] ??
    null
  );
}

export function getMooKeywordDocumentation(name: string): string | null {
  const normalizedName = name.toLowerCase();
  return (
    KEYWORD_DOCUMENTATION[normalizedName as keyof typeof KEYWORD_DOCUMENTATION] ??
    OPERATOR_DOCUMENTATION[normalizedName as keyof typeof OPERATOR_DOCUMENTATION] ??
    null
  );
}

export function getMooHover(source: string, position: MooSourcePosition): MooHover | null {
  const word = wordAtPosition(source, position);
  if (!word) {
    return getDocumentLinkHover(source, position);
  }

  const localHover = getLocalSymbolHover(source, word);
  if (localHover) {
    return localHover;
  }

  const normalizedName = word.name.toLowerCase();
  const upperName = word.name.toUpperCase();
  const builtinSignature = getMooBuiltinSignature(normalizedName);
  if (builtinSignature) {
    return hover(word.range, builtinSignature.label, builtinSignature.documentation);
  }

  const variableDocumentation = getMooBuiltinVariableDocumentation(normalizedName);
  if (variableDocumentation) {
    return hover(word.range, normalizedName, variableDocumentation);
  }

  const systemReferenceDocumentation = getMooSystemReferenceDocumentation(normalizedName);
  if (systemReferenceDocumentation) {
    return hover(word.range, normalizedName, systemReferenceDocumentation);
  }

  const errorDocumentation = getMooErrorDocumentation(upperName);
  if (errorDocumentation) {
    return hover(word.range, upperName, errorDocumentation);
  }

  const keywordDocumentation = getMooKeywordDocumentation(normalizedName);
  if (keywordDocumentation) {
    return hover(word.range, normalizedName, keywordDocumentation);
  }

  return getDocumentLinkHover(source, position);
}

function getDocumentLinkHover(source: string, position: MooSourcePosition): MooHover | null {
  const link = findMooDocumentLinkAtPosition(source, position);
  if (!link) {
    return null;
  }

  const label = textForRange(source, link.range);
  if (link.url.startsWith('moo://object/')) {
    return hover(link.range, label, ['MOO object reference.', `Target: ${link.url}`].join('\n'));
  }

  if (link.url.startsWith('moo://system/')) {
    return hover(
      link.range,
      label,
      ['MOO system object reference.', `Target: ${link.url}`].join('\n'),
    );
  }

  return null;
}

function getLocalSymbolHover(source: string, word: MooWord): MooHover | null {
  const symbol = getMooSemanticSymbolSummary(source, {
    lineNumber: word.range.startLineNumber,
    column: word.range.startColumn,
  });
  if (!symbol) {
    return null;
  }

  const label = symbol.kind === 'loop-label' ? `loop label ${symbol.name}` : `local ${symbol.name}`;
  return hover(
    symbol.occurrenceRange,
    label,
    `${countLabel(symbol.definitions.length, 'Defined')} ${countLabel(
      symbol.references.length,
      'Referenced',
    )}`,
  );
}

function hover(range: MonacoRange, label: string, documentation: string): MooHover {
  return {
    range,
    contents: [
      {
        value: ['```moocode', label, '```', documentation].join('\n'),
      },
    ],
  };
}

function countLabel(count: number, verb: string): string {
  return `${verb} ${count === 1 ? '1 time.' : `${count} times.`}`;
}

function wordAtPosition(source: string, position: MooSourcePosition): MooWord | null {
  const masked = maskMooSource(source);
  const offset = offsetAtMooPosition(masked, position);
  const wordOffsets = wordOffsetsAt(masked, offset);
  if (!wordOffsets) {
    return null;
  }

  return {
    name: source.slice(wordOffsets.startOffset, wordOffsets.endOffset),
    range: rangeFromOffsets(source, wordOffsets.startOffset, wordOffsets.endOffset),
  };
}

function wordOffsetsAt(source: string, offset: number): WordOffsets | null {
  const candidateOffset = Math.max(0, offset - 1);

  for (const pattern of WORD_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;
      if (startOffset <= candidateOffset && candidateOffset < endOffset) {
        return { startOffset, endOffset };
      }
    }
  }

  return null;
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

function textForRange(source: string, range: MonacoRange): string {
  const startOffset = offsetAtMooPosition(source, {
    lineNumber: range.startLineNumber,
    column: range.startColumn,
  });
  const endOffset = offsetAtMooPosition(source, {
    lineNumber: range.endLineNumber,
    column: range.endColumn,
  });

  return source.slice(startOffset, endOffset);
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
