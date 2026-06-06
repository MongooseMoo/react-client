import { MOO_BLOCKS, MOO_CLOSE_KEYWORDS, MOO_MIDDLE_KEYWORDS, type MooBlockKind } from './contract';

export type MooStructureRange = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export type MooStructureSymbol = {
  name: string;
  blockKind: MooBlockKind;
  range: MooStructureRange;
  selectionRange: MooStructureRange;
  children: MooStructureSymbol[];
};

export type MooFoldingRange = {
  start: number;
  end: number;
};

export type MooStructure = {
  symbols: MooStructureSymbol[];
  foldingRanges: MooFoldingRange[];
};

type BlockFrame = {
  symbol: MooStructureSymbol;
};

type ScanState = {
  inBlockComment: boolean;
};

type KeywordMatch = {
  word: string;
  startColumn: number;
  endColumn: number;
};

export function analyzeMooStructure(source: string): MooStructure {
  const symbols: MooStructureSymbol[] = [];
  const foldingRanges: MooFoldingRange[] = [];
  const stack: BlockFrame[] = [];
  const scanState: ScanState = { inBlockComment: false };
  const lines = source.split(/\r\n|\r|\n/);

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const code = stripLineForStructure(line, scanState);
    const keyword = firstKeyword(code);
    if (!keyword) {
      return;
    }

    const normalized = keyword.word.toLowerCase();
    const closeKind = MOO_CLOSE_KEYWORDS[normalized];
    if (closeKind) {
      const frame = stack.pop();
      if (!frame) {
        return;
      }

      frame.symbol.range = {
        ...frame.symbol.range,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
      };

      if (lineNumber > frame.symbol.range.startLineNumber) {
        foldingRanges.push({
          start: frame.symbol.range.startLineNumber,
          end: lineNumber,
        });
      }
      return;
    }

    if (MOO_MIDDLE_KEYWORDS[normalized]) {
      return;
    }

    if (!isMooBlockKind(normalized)) {
      return;
    }

    const symbol: MooStructureSymbol = {
      name: describeBlock(normalized, code, keyword),
      blockKind: normalized,
      range: {
        startLineNumber: lineNumber,
        startColumn: keyword.startColumn,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
      },
      selectionRange: {
        startLineNumber: lineNumber,
        startColumn: keyword.startColumn,
        endLineNumber: lineNumber,
        endColumn: keyword.endColumn,
      },
      children: [],
    };

    const parent = stack.at(-1);
    if (parent) {
      parent.symbol.children.push(symbol);
    } else {
      symbols.push(symbol);
    }

    stack.push({ symbol });
  });

  return {
    symbols,
    foldingRanges: [...foldingRanges].sort((left, right) => left.start - right.start),
  };
}

function stripLineForStructure(line: string, state: ScanState): string {
  let inString = false;
  let escaped = false;
  const codeCharacters = [...line];

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

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
    }
  }

  return codeCharacters.join('');
}

function firstKeyword(code: string): KeywordMatch | null {
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

function describeBlock(kind: MooBlockKind, code: string, keyword: KeywordMatch): string {
  const remainder = code.slice(keyword.endColumn - 1).trim();

  switch (kind) {
    case 'if':
    case 'while': {
      const condition = unwrapParenthesized(remainder);
      return condition ? `${kind} ${condition}` : kind;
    }
    case 'for': {
      const variables = /^([A-Za-z_][\w$]*)(?:\s*,\s*([A-Za-z_][\w$]*))?/.exec(remainder);
      if (!variables?.[1]) {
        return kind;
      }

      return variables[2] ? `for ${variables[1]}, ${variables[2]}` : `for ${variables[1]}`;
    }
    case 'fork': {
      const name = /^([A-Za-z_][\w$]*)/.exec(remainder)?.[1];
      return name ? `fork ${name}` : kind;
    }
    case 'try':
      return kind;
  }
}

function unwrapParenthesized(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function isMooBlockKind(value: string): value is MooBlockKind {
  return value in MOO_BLOCKS;
}
