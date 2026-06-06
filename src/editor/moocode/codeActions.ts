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
      case 'unreachable-statement':
        fixes.push({
          title: 'Remove unreachable statement',
          diagnostics: [diagnostic],
          edit: {
            range: lineRemovalRange(lines, diagnostic.lineNumber),
            text: '',
          },
        });
        break;
      case 'undefined-local': {
        const line = lines[diagnostic.lineNumber - 1] ?? '';
        const name = diagnosticText(lines, diagnostic);
        if (!name) {
          break;
        }

        if (diagnostic.suggestedName) {
          fixes.push({
            title: `Replace ${name} with ${diagnostic.suggestedName}`,
            diagnostics: [diagnostic],
            edit: {
              range: diagnosticRange(diagnostic),
              text: diagnostic.suggestedName,
            },
          });
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
        const extraArgumentEdit = extraBuiltinArgumentsEdit(lines, diagnostic, name);
        if (extraArgumentEdit) {
          fixes.push({
            title: `Remove extra ${name} ${
              extraArgumentEdit.removedCount === 1 ? 'argument' : 'arguments'
            }`,
            diagnostics: [diagnostic],
            edit: {
              range: extraArgumentEdit.range,
              text: '',
            },
          });
          break;
        }

        const missingArgumentEdit = missingBuiltinArgumentsEdit(lines, diagnostic, name);
        if (missingArgumentEdit) {
          fixes.push({
            title: `Add missing ${name} ${
              missingArgumentEdit.addedCount === 1 ? 'argument' : 'arguments'
            }`,
            diagnostics: [diagnostic],
            edit: missingArgumentEdit.edit,
          });
        }
        break;
      }
      case 'unknown-builtin': {
        const name = diagnosticText(lines, diagnostic);
        if (!diagnostic.suggestedName) {
          const dynamicCallEdit = dynamicBuiltinCallEdit(lines, diagnostic, name);
          if (dynamicCallEdit) {
            fixes.push({
              title: `Call ${name} dynamically`,
              diagnostics: [diagnostic],
              edit: dynamicCallEdit,
            });
          }
          break;
        }

        fixes.push({
          title: `Replace ${name} with ${diagnostic.suggestedName}`,
          diagnostics: [diagnostic],
          edit: {
            range: diagnosticRange(diagnostic),
            text: diagnostic.suggestedName,
          },
        });
        const dynamicCallEdit = dynamicBuiltinCallEdit(lines, diagnostic, name);
        if (dynamicCallEdit) {
          fixes.push({
            title: `Call ${name} dynamically`,
            diagnostics: [diagnostic],
            edit: dynamicCallEdit,
          });
        }
        break;
      }
      case 'unknown-loop-label':
        if (diagnostic.suggestedName) {
          fixes.push({
            title: `Replace ${diagnosticText(lines, diagnostic)} with ${diagnostic.suggestedName}`,
            diagnostics: [diagnostic],
            edit: {
              range: diagnosticRange(diagnostic),
              text: diagnostic.suggestedName,
            },
          });
        }

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

function lineRemovalRange(lines: string[], lineNumber: number): MonacoRange {
  if (lineNumber < lines.length) {
    return {
      startLineNumber: lineNumber,
      startColumn: 1,
      endLineNumber: lineNumber + 1,
      endColumn: 1,
    };
  }

  if (lineNumber > 1) {
    const previousLine = lines[lineNumber - 2] ?? '';
    const line = lines[lineNumber - 1] ?? '';

    return {
      startLineNumber: lineNumber - 1,
      startColumn: previousLine.length + 1,
      endLineNumber: lineNumber,
      endColumn: line.length + 1,
    };
  }

  const line = lines[lineNumber - 1] ?? '';
  return {
    startLineNumber: lineNumber,
    startColumn: 1,
    endLineNumber: lineNumber,
    endColumn: line.length + 1,
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

function dynamicBuiltinCallEdit(
  lines: string[],
  diagnostic: MooQuickFixDiagnostic,
  name: string,
): MooQuickFix['edit'] | null {
  const call = findBuiltinCallInLine(lines, diagnostic);
  if (!call) {
    return null;
  }

  const argumentCount = countTopLevelArguments(call.line, call.openIndex + 1, call.closeIndex);

  return {
    range: {
      startLineNumber: diagnostic.lineNumber,
      startColumn: diagnostic.startColumn,
      endLineNumber: diagnostic.lineNumber,
      endColumn: call.openIndex + 2,
    },
    text: `call_function("${name}"${argumentCount === 0 ? '' : ', '}`,
  };
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

  const call = findBuiltinCallInLine(lines, diagnostic);
  if (!call) {
    return null;
  }

  const argumentCount = countTopLevelArguments(call.line, call.openIndex + 1, call.closeIndex);
  if (argumentCount <= metadata.maxArgs) {
    return null;
  }

  const startIndex =
    metadata.maxArgs === 0
      ? call.openIndex + 1
      : topLevelCommaIndexes(call.line, call.openIndex + 1, call.closeIndex)[metadata.maxArgs - 1];
  if (startIndex === undefined) {
    return null;
  }

  return {
    removedCount: argumentCount - metadata.maxArgs,
    range: {
      startLineNumber: diagnostic.lineNumber,
      startColumn: startIndex + 1,
      endLineNumber: diagnostic.lineNumber,
      endColumn: call.closeIndex + 1,
    },
  };
}

function missingBuiltinArgumentsEdit(
  lines: string[],
  diagnostic: MooQuickFixDiagnostic,
  name: string,
): { edit: MooQuickFix['edit']; addedCount: number } | null {
  const metadata = getMooBuiltinMetadata(name);
  const call = findBuiltinCallInLine(lines, diagnostic);
  if (!metadata || !call) {
    return null;
  }

  const argumentCount = countTopLevelArguments(call.line, call.openIndex + 1, call.closeIndex);
  if (argumentCount >= metadata.minArgs) {
    return null;
  }

  const missingArguments = metadata.parameterTypes
    .slice(argumentCount, metadata.minArgs)
    .map(defaultExpressionForParameterType);
  if (missingArguments.length === 0) {
    return null;
  }

  return {
    addedCount: missingArguments.length,
    edit: {
      range: {
        startLineNumber: diagnostic.lineNumber,
        startColumn: call.closeIndex + 1,
        endLineNumber: diagnostic.lineNumber,
        endColumn: call.closeIndex + 1,
      },
      text: `${argumentCount === 0 ? '' : ', '}${missingArguments.join(', ')}`,
    },
  };
}

function findBuiltinCallInLine(
  lines: string[],
  diagnostic: MooQuickFixDiagnostic,
): { closeIndex: number; line: string; openIndex: number } | null {
  const line = lines[diagnostic.lineNumber - 1] ?? '';
  const openIndex = line.indexOf('(', diagnostic.endColumn - 1);
  if (openIndex < 0) {
    return null;
  }

  const closeIndex = findMatchingCloseParenInLine(line, openIndex);
  if (closeIndex === null) {
    return null;
  }

  return { closeIndex, line, openIndex };
}

function defaultExpressionForParameterType(type: string): string {
  switch (type) {
    case 'str':
      return '""';
    case 'obj':
      return '#-1';
    case 'list':
      return '{}';
    case 'map':
      return '[]';
    case 'float':
      return '0.0';
    default:
      return '0';
  }
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
