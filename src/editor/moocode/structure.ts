import {
  MOO_BLOCKS,
  MOO_CLOSE_KEYWORDS,
  MOO_IDENTIFIER_PATTERN_SOURCE,
  MOO_MIDDLE_KEYWORDS,
  type MooBlockKind,
  type MooMiddleKeyword,
} from './contract';
import { firstMooKeyword, maskMooSource, type MooKeywordMatch } from './scanner';

export type MooStructureSymbolKind = MooBlockKind | MooMiddleKeyword;

export type MooStructureRange = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export type MooStructureSymbol = {
  name: string;
  blockKind: MooStructureSymbolKind;
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
  activeSection?: MooStructureSymbol;
  symbol: MooStructureSymbol;
};

const FOR_LABEL_PATTERN = new RegExp(
  `^(${MOO_IDENTIFIER_PATTERN_SOURCE})(?:\\s*,\\s*(${MOO_IDENTIFIER_PATTERN_SOURCE}))?`,
);
const FORK_LABEL_PATTERN = new RegExp(`^(${MOO_IDENTIFIER_PATTERN_SOURCE})`);

export function analyzeMooStructure(source: string): MooStructure {
  const symbols: MooStructureSymbol[] = [];
  const foldingRanges: MooFoldingRange[] = [];
  const stack: BlockFrame[] = [];
  const lines = source.split(/\r\n|\r|\n/);
  const maskedLines = maskMooSource(source).split(/\r\n|\r|\n/);

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const code = maskedLines[lineIndex] ?? '';
    const keyword = firstMooKeyword(code);
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

      finishActiveSection(frame, lines, foldingRanges, lineNumber - 1);
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

    if (isMooMiddleKeyword(normalized)) {
      const frame = stack.at(-1);
      if (!frame || MOO_MIDDLE_KEYWORDS[normalized] !== frame.symbol.blockKind) {
        return;
      }

      finishActiveSection(frame, lines, foldingRanges, lineNumber - 1);
      const symbol = createSymbol(normalized, code, keyword, line, lineNumber);
      frame.symbol.children.push(symbol);
      frame.activeSection = symbol;
      return;
    }

    if (!isMooBlockKind(normalized)) {
      return;
    }

    const symbol = createSymbol(normalized, code, keyword, line, lineNumber);

    const parent = currentSymbolParent(stack);
    if (parent) {
      parent.children.push(symbol);
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

function createSymbol(
  kind: MooStructureSymbolKind,
  code: string,
  keyword: MooKeywordMatch,
  line: string,
  lineNumber: number,
): MooStructureSymbol {
  return {
    name: describeBlock(kind, code, keyword),
    blockKind: kind,
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
}

function currentSymbolParent(stack: BlockFrame[]): MooStructureSymbol | undefined {
  const frame = stack.at(-1);
  return frame?.activeSection ?? frame?.symbol;
}

function finishActiveSection(
  frame: BlockFrame,
  lines: string[],
  foldingRanges: MooFoldingRange[],
  endLineNumber: number,
): void {
  const section = frame.activeSection;
  if (!section) {
    return;
  }

  const boundedEndLineNumber = Math.max(section.range.startLineNumber, endLineNumber);
  section.range = {
    ...section.range,
    endLineNumber: boundedEndLineNumber,
    endColumn: (lines[boundedEndLineNumber - 1] ?? '').length + 1,
  };
  if (section.range.endLineNumber > section.range.startLineNumber) {
    foldingRanges.push({
      start: section.range.startLineNumber,
      end: section.range.endLineNumber,
    });
  }
  frame.activeSection = undefined;
}

function describeBlock(
  kind: MooStructureSymbolKind,
  code: string,
  keyword: MooKeywordMatch,
): string {
  const remainder = code.slice(keyword.endColumn - 1).trim();

  switch (kind) {
    case 'if':
    case 'while': {
      const condition = unwrapParenthesized(remainder);
      return condition ? `${kind} ${condition}` : kind;
    }
    case 'for': {
      const variables = FOR_LABEL_PATTERN.exec(remainder);
      if (!variables?.[1]) {
        return kind;
      }

      return variables[2] ? `for ${variables[1]}, ${variables[2]}` : `for ${variables[1]}`;
    }
    case 'fork': {
      const name = FORK_LABEL_PATTERN.exec(remainder)?.[1];
      return name ? `fork ${name}` : kind;
    }
    case 'try':
      return kind;
    case 'elseif': {
      const condition = unwrapParenthesized(remainder);
      return condition ? `elseif ${condition}` : kind;
    }
    case 'else':
    case 'finally':
      return kind;
    case 'except':
      return remainder ? `except ${remainder}` : kind;
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

function isMooMiddleKeyword(value: string): value is MooMiddleKeyword {
  return value in MOO_MIDDLE_KEYWORDS;
}
