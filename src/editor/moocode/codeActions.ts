import { MOO_BLOCKS, type MooBlockKind } from './contract';
import { validateMooSyntax, type MooDiagnostic } from './diagnostics';
import { firstMooKeyword } from './scanner';
import type { MonacoRange } from './language';

export type MooQuickFix = {
  title: string;
  diagnostics: MooDiagnostic[];
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

export function getMooQuickFixes(source: string): MooQuickFix[] {
  const diagnostics = validateMooSyntax(source);
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

function diagnosticRange(diagnostic: MooDiagnostic): MonacoRange {
  return {
    startLineNumber: diagnostic.lineNumber,
    startColumn: diagnostic.startColumn,
    endLineNumber: diagnostic.lineNumber,
    endColumn: diagnostic.endColumn,
  };
}

function diagnosticText(lines: string[], diagnostic: MooDiagnostic): string {
  const line = lines[diagnostic.lineNumber - 1] ?? '';

  return line.slice(diagnostic.startColumn - 1, diagnostic.endColumn - 1);
}

function leadingWhitespace(line: string): string {
  return /^\s*/.exec(line)?.[0] ?? '';
}

function isMooBlockKind(value: string | undefined): value is MooBlockKind {
  return Boolean(value && value in MOO_BLOCKS);
}
