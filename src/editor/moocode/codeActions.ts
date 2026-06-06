import { MOO_BLOCKS, type MooBlockKind } from './contract';
import { getMooBuiltinMetadata } from './builtins';
import { validateMooSyntax, type MooDiagnostic } from './diagnostics';
import { firstMooKeyword } from './scanner';
import type { MonacoRange } from './language';

export type MooQuickFixDiagnostic = Omit<MooDiagnostic, 'code'> & {
  code: MooDiagnostic['code'] | 'missing-node';
  missingText?: string;
};

export type MooQuickFix = {
  title: string;
  diagnostics: MooQuickFixDiagnostic[];
  edit: {
    range: MonacoRange;
    text: string;
  };
};

const CLOSE_DELIMITER_BY_OPEN: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
};

export function getMooQuickFixes(
  source: string,
  parserDiagnostics: readonly MooQuickFixDiagnostic[] = [],
): MooQuickFix[] {
  const diagnostics: MooQuickFixDiagnostic[] = [...validateMooSyntax(source), ...parserDiagnostics];
  const lines = source.split(/\r\n|\r|\n/);
  const endRange = rangeAtEndOfSource(source);
  const fixes: MooQuickFix[] = [];

  for (const diagnostic of diagnostics) {
    switch (diagnostic.code) {
      case 'unclosed-block': {
        const line = lines[diagnostic.lineNumber - 1] ?? '';
        const keyword = firstMooKeyword(line);
        const blockKind = keyword?.word.toLowerCase();
        const closeKeyword = isMooBlockKind(blockKind) ? MOO_BLOCKS[blockKind].close : null;
        if (!closeKeyword) {
          break;
        }

        fixes.push({
          title: `Insert missing ${closeKeyword}`,
          diagnostics: [diagnostic],
          edit: {
            range: endRange,
            text: `${source.endsWith('\n') || source.endsWith('\r') ? '' : '\n'}${leadingWhitespace(line)}${closeKeyword}`,
          },
        });
        break;
      }
      case 'unclosed-delimiter': {
        const line = lines[diagnostic.lineNumber - 1] ?? '';
        const open = line[diagnostic.startColumn - 1];
        const close = CLOSE_DELIMITER_BY_OPEN[open];
        if (!close) {
          break;
        }

        fixes.push({
          title: `Insert missing ${close}`,
          diagnostics: [diagnostic],
          edit: {
            range: rangeAtEndOfLine(lines, diagnostic.lineNumber),
            text: close,
          },
        });
        break;
      }
      case 'mismatched-close':
        if (!diagnostic.expectedCloseKeyword) {
          break;
        }

        fixes.push({
          title: `Replace with ${diagnostic.expectedCloseKeyword}`,
          diagnostics: [diagnostic],
          edit: {
            range: diagnosticRange(diagnostic),
            text: diagnostic.expectedCloseKeyword,
          },
        });
        break;
      case 'unexpected-close':
      case 'unexpected-delimiter': {
        const text = diagnosticText(lines, diagnostic);

        fixes.push({
          title: `Remove unexpected ${text}`,
          diagnostics: [diagnostic],
          edit: {
            range: diagnosticRange(diagnostic),
            text: '',
          },
        });
        break;
      }
      case 'unterminated-string':
        fixes.push({
          title: 'Insert closing quote',
          diagnostics: [diagnostic],
          edit: {
            range: rangeAtEndOfLine(lines, diagnostic.lineNumber),
            text: '"',
          },
        });
        break;
      case 'missing-node':
        if (!diagnostic.missingText) {
          break;
        }

        fixes.push({
          title: `Insert missing ${diagnostic.missingText}`,
          diagnostics: [diagnostic],
          edit: {
            range: insertionRange(diagnostic),
            text: diagnostic.missingText,
          },
        });
        break;
      case 'unused-local':
        fixes.push({
          title: 'Mark unused as intentionally ignored',
          diagnostics: [diagnostic],
          edit: {
            range: insertionRange(diagnostic),
            text: '_',
          },
        });
        break;
      case 'undefined-local': {
        const line = lines[diagnostic.lineNumber - 1] ?? '';
        const name = diagnosticText(lines, diagnostic);
        if (!name) {
          break;
        }

        fixes.push({
          title: `Initialize ${name} before use`,
          diagnostics: [diagnostic],
          edit: {
            range: rangeAtStartOfLine(diagnostic.lineNumber),
            text: `${leadingWhitespace(line)}${name} = 0;\n`,
          },
        });
        break;
      }
      case 'builtin-arity': {
        const name = diagnosticText(lines, diagnostic);
        const edit = extraBuiltinArgumentsEdit(lines, diagnostic, name);
        if (!edit) {
          break;
        }

        fixes.push({
          title: `Remove extra ${name} ${edit.removedCount === 1 ? 'argument' : 'arguments'}`,
          diagnostics: [diagnostic],
          edit: {
            range: edit.range,
            text: '',
          },
        });
        break;
      }
      case 'unknown-loop-label':
        fixes.push({
          title: 'Remove unknown loop label',
          diagnostics: [diagnostic],
          edit: {
            range: loopControlLabelRemovalRange(lines, diagnostic),
            text: '',
          },
        });
        break;
      default:
        break;
    }
  }

  return fixes;
}

function rangeAtEndOfSource(source: string): MonacoRange {
  const lines = source.split(/\r\n|\r|\n/);
  return rangeAtEndOfLine(lines, lines.length);
}

function rangeAtEndOfLine(lines: string[], lineNumber: number): MonacoRange {
  const line = lines[lineNumber - 1] ?? '';
  const column = line.length + 1;

  return {
    startLineNumber: lineNumber,
    startColumn: column,
    endLineNumber: lineNumber,
    endColumn: column,
  };
}

function rangeAtStartOfLine(lineNumber: number): MonacoRange {
  return {
    startLineNumber: lineNumber,
    startColumn: 1,
    endLineNumber: lineNumber,
    endColumn: 1,
  };
}

function diagnosticRange(diagnostic: MooQuickFixDiagnostic): MonacoRange {
  return {
    startLineNumber: diagnostic.lineNumber,
    startColumn: diagnostic.startColumn,
    endLineNumber: diagnostic.lineNumber,
    endColumn: diagnostic.endColumn,
  };
}

function insertionRange(diagnostic: MooQuickFixDiagnostic): MonacoRange {
  return {
    startLineNumber: diagnostic.lineNumber,
    startColumn: diagnostic.startColumn,
    endLineNumber: diagnostic.lineNumber,
    endColumn: diagnostic.startColumn,
  };
}

function loopControlLabelRemovalRange(
  lines: string[],
  diagnostic: MooQuickFixDiagnostic,
): MonacoRange {
  const line = lines[diagnostic.lineNumber - 1] ?? '';
  const previousColumn = diagnostic.startColumn - 1;
  const startColumn =
    previousColumn > 0 && /\s/.test(line[previousColumn - 1])
      ? previousColumn
      : diagnostic.startColumn;

  return {
    startLineNumber: diagnostic.lineNumber,
    startColumn,
    endLineNumber: diagnostic.lineNumber,
    endColumn: diagnostic.endColumn,
  };
}

function diagnosticText(lines: string[], diagnostic: MooQuickFixDiagnostic): string {
  const line = lines[diagnostic.lineNumber - 1] ?? '';

  return line.slice(diagnostic.startColumn - 1, diagnostic.endColumn - 1);
}

function leadingWhitespace(line: string): string {
  return /^\s*/.exec(line)?.[0] ?? '';
}

function extraBuiltinArgumentsEdit(
  lines: string[],
  diagnostic: MooQuickFixDiagnostic,
  name: string,
): { range: MonacoRange; removedCount: number } | null {
  const metadata = getMooBuiltinMetadata(name);
  if (!metadata || metadata.maxArgs < 0) {
    return null;
  }

  const line = lines[diagnostic.lineNumber - 1] ?? '';
  const openIndex = line.indexOf('(', diagnostic.endColumn - 1);
  if (openIndex < 0) {
    return null;
  }

  const closeIndex = findMatchingCloseParenInLine(line, openIndex);
  if (closeIndex === null) {
    return null;
  }

  const argumentCount = countTopLevelArguments(line, openIndex + 1, closeIndex);
  if (argumentCount <= metadata.maxArgs) {
    return null;
  }

  const startIndex =
    metadata.maxArgs === 0
      ? openIndex + 1
      : topLevelCommaIndexes(line, openIndex + 1, closeIndex)[metadata.maxArgs - 1];
  if (startIndex === undefined) {
    return null;
  }

  return {
    removedCount: argumentCount - metadata.maxArgs,
    range: {
      startLineNumber: diagnostic.lineNumber,
      startColumn: startIndex + 1,
      endLineNumber: diagnostic.lineNumber,
      endColumn: closeIndex + 1,
    },
  };
}

function findMatchingCloseParenInLine(line: string, openIndex: number): number | null {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = openIndex; index < line.length; index += 1) {
    const character = line[index];

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
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

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

function countTopLevelArguments(line: string, startIndex: number, endIndex: number): number {
  if (line.slice(startIndex, endIndex).trim() === '') {
    return 0;
  }

  return topLevelCommaIndexes(line, startIndex, endIndex).length + 1;
}

function topLevelCommaIndexes(line: string, startIndex: number, endIndex: number): number[] {
  const commaIndexes: number[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < endIndex; index += 1) {
    const character = line[index];

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
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '(' || character === '[' || character === '{') {
      depth += 1;
      continue;
    }

    if (character === ')' || character === ']' || character === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (character === ',' && depth === 0) {
      commaIndexes.push(index);
    }
  }

  return commaIndexes;
}

function isMooBlockKind(value: string | undefined): value is MooBlockKind {
  return Boolean(value && value in MOO_BLOCKS);
}
