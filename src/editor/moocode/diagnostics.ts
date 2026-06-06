import { MOO_LANGUAGE_ID } from './language';

export type MooDiagnosticCode =
  | 'misplaced-middle'
  | 'mismatched-close'
  | 'unexpected-close'
  | 'unclosed-block'
  | 'unclosed-delimiter'
  | 'unexpected-delimiter'
  | 'unterminated-string'
  | 'loop-control-outside-loop';

export type MooDiagnostic = {
  code: MooDiagnosticCode;
  message: string;
  lineNumber: number;
  startColumn: number;
  endColumn: number;
};

export type MonacoMarker = MooDiagnostic & {
  severity: number;
  source: string;
  startLineNumber: number;
  endLineNumber: number;
};

type BlockKind = 'if' | 'for' | 'while' | 'fork' | 'try';

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

const OPEN_BLOCKS: Record<string, { kind: BlockKind; closeKeyword: string }> = {
  if: { kind: 'if', closeKeyword: 'endif' },
  for: { kind: 'for', closeKeyword: 'endfor' },
  while: { kind: 'while', closeKeyword: 'endwhile' },
  fork: { kind: 'fork', closeKeyword: 'endfork' },
  try: { kind: 'try', closeKeyword: 'endtry' },
};

const CLOSE_BLOCKS: Record<string, BlockKind> = {
  endif: 'if',
  endfor: 'for',
  endwhile: 'while',
  endfork: 'fork',
  endtry: 'try',
};

const MIDDLE_BLOCKS: Record<string, BlockKind> = {
  elseif: 'if',
  else: 'if',
  except: 'try',
  finally: 'try',
};

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

  const lines = source.split(/\r\n|\r|\n/);

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const scan = scanLine(line, lineNumber, delimiterStack);
    diagnostics.push(...scan.diagnostics);

    const keyword = firstKeyword(scan.code);
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

    const middleKind = MIDDLE_BLOCKS[normalized];
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

    const closeKind = CLOSE_BLOCKS[normalized];
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
          message: `${normalized} closes ${closeKind}, but the open block is ${open.kind}.`,
          lineNumber,
          startColumn: keyword.startColumn,
          endColumn: keyword.endColumn,
        });
      }

      return;
    }

    const openBlock = OPEN_BLOCKS[normalized];
    if (openBlock) {
      blockStack.push({
        kind: openBlock.kind,
        closeKeyword: openBlock.closeKeyword,
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

  return diagnostics;
}

export function toMonacoMarkers(source: string, severity: number): MonacoMarker[] {
  return validateMooSyntax(source).map((diagnostic) => ({
    ...diagnostic,
    startLineNumber: diagnostic.lineNumber,
    endLineNumber: diagnostic.lineNumber,
    severity,
    source: MOO_LANGUAGE_ID,
  }));
}

function scanLine(
  line: string,
  lineNumber: number,
  delimiterStack: DelimiterFrame[],
): { code: string; diagnostics: MooDiagnostic[] } {
  let inString = false;
  let escaped = false;
  const codeCharacters = [...line];
  const diagnostics: MooDiagnostic[] = [];

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    const column = index + 1;

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

function firstKeyword(
  code: string,
): { word: string; startColumn: number; endColumn: number } | null {
  const match = /^\s*([A-Za-z_][\w$]*)/.exec(code);
  if (!match?.[1]) {
    return null;
  }

  const startColumn = match.index + match[0].indexOf(match[1]) + 1;
  return {
    word: match[1],
    startColumn,
    endColumn: startColumn + match[1].length,
  };
}

function isLoop(kind: BlockKind): boolean {
  return kind === 'for' || kind === 'while';
}
