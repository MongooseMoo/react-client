import { MOO_IDENTIFIER_PATTERN_SOURCE, MOO_LANGUAGE_ID } from './contract';
import type { MooBlockKind, MooMiddleKeyword } from './contract';
import type {
  MooFoldingRange,
  MooStructure,
  MooStructureSymbol,
  MooStructureSymbolKind,
} from './structure';

export type MooTreeSitterDiagnosticCode = 'missing-node' | 'parse-error';

export type MooTreeSitterDiagnostic = {
  code: MooTreeSitterDiagnosticCode;
  message: string;
  missingText?: string;
  lineNumber: number;
  startColumn: number;
  endColumn: number;
};

export type MooTreeSitterMarker = MooTreeSitterDiagnostic & {
  severity: number;
  source: string;
  startLineNumber: number;
  endLineNumber: number;
};

export type MooTreeSitterParseResult = {
  rootType: string;
  hasError: boolean;
  treeText: string;
  diagnostics: MooTreeSitterDiagnostic[];
  structure: MooStructure;
};

type TreeSitterPoint = {
  row: number;
  column: number;
};

type TreeSitterNodeLike = {
  children: TreeSitterNodeLike[];
  endPosition: TreeSitterPoint;
  hasError: boolean;
  isError: boolean;
  isMissing: boolean;
  startPosition: TreeSitterPoint;
  text?: string;
  toString(): string;
  type: string;
};

type TreeSitterTreeLike = {
  delete?: () => void;
  rootNode: TreeSitterNodeLike;
};

type TreeSitterParserLike = {
  parse(source: string): TreeSitterTreeLike | null;
  setLanguage(language: unknown): unknown;
};

type TreeSitterRuntimeLike = {
  Language: {
    load(input: string | Uint8Array): Promise<unknown>;
  };
  Parser: {
    init(options?: { locateFile?: (path: string) => string }): Promise<void>;
    new (): TreeSitterParserLike;
  };
};

export type MooTreeSitterDependencies = {
  loadRuntime: () => Promise<TreeSitterRuntimeLike>;
  loadRuntimeWasmUrl: () => Promise<string>;
  loadLanguageWasmUrl: () => Promise<string>;
};

export type MooTreeSitterService = {
  parse(source: string): MooTreeSitterParseResult;
};

const DEFAULT_DEPENDENCIES: MooTreeSitterDependencies = {
  loadRuntime: () => import('web-tree-sitter'),
  loadRuntimeWasmUrl: () =>
    import('web-tree-sitter/web-tree-sitter.wasm?url').then((module) => module.default),
  loadLanguageWasmUrl: () =>
    import('tree-sitter-moocode/tree-sitter-moocode.wasm?url').then((module) => module.default),
};

let defaultServicePromise: Promise<MooTreeSitterService> | null = null;

export async function getMooTreeSitterService(
  dependencies: MooTreeSitterDependencies = DEFAULT_DEPENDENCIES,
): Promise<MooTreeSitterService> {
  if (dependencies !== DEFAULT_DEPENDENCIES) {
    return createMooTreeSitterService(dependencies);
  }

  defaultServicePromise ??= createMooTreeSitterService(dependencies);
  return defaultServicePromise;
}

export async function createMooTreeSitterService(
  dependencies: MooTreeSitterDependencies,
): Promise<MooTreeSitterService> {
  const [runtime, runtimeWasmUrl, languageWasmUrl] = await Promise.all([
    dependencies.loadRuntime(),
    dependencies.loadRuntimeWasmUrl(),
    dependencies.loadLanguageWasmUrl(),
  ]);

  await runtime.Parser.init({
    locateFile: (path) => (path === 'web-tree-sitter.wasm' ? runtimeWasmUrl : path),
  });
  const language = await runtime.Language.load(languageWasmUrl);
  const parser = new runtime.Parser();
  parser.setLanguage(language);

  return {
    parse: (source) => {
      const tree = parser.parse(source);
      if (!tree) {
        return {
          rootType: 'source_file',
          hasError: true,
          treeText: '',
          diagnostics: [
            {
              code: 'parse-error',
              message: 'Tree-sitter could not parse this MOO syntax.',
              lineNumber: 1,
              startColumn: 1,
              endColumn: 2,
            },
          ],
          structure: emptyMooStructure(),
        };
      }

      try {
        const structure = collectTreeSitterStructure(tree.rootNode);

        return {
          rootType: tree.rootNode.type,
          hasError: tree.rootNode.hasError,
          treeText: tree.rootNode.toString(),
          diagnostics: collectTreeSitterDiagnostics(tree.rootNode),
          structure,
        };
      } finally {
        tree.delete?.();
      }
    },
  };
}

export async function parseMooCodeWithTreeSitter(
  source: string,
  dependencies?: MooTreeSitterDependencies,
): Promise<MooTreeSitterParseResult> {
  const service = await getMooTreeSitterService(dependencies);
  return service.parse(source);
}

export async function toMonacoTreeSitterMarkers(
  source: string,
  severity: number,
  dependencies?: MooTreeSitterDependencies,
): Promise<MooTreeSitterMarker[]> {
  const parse = await parseMooCodeWithTreeSitter(source, dependencies);

  return parse.diagnostics.map((diagnostic) => ({
    ...diagnostic,
    severity,
    source: MOO_LANGUAGE_ID,
    startLineNumber: diagnostic.lineNumber,
    endLineNumber: diagnostic.lineNumber,
  }));
}

export function resetMooTreeSitterServiceForTests(): void {
  defaultServicePromise = null;
}

function emptyMooStructure(): MooStructure {
  return {
    foldingRanges: [],
    symbols: [],
  };
}

function collectTreeSitterDiagnostics(root: TreeSitterNodeLike): MooTreeSitterDiagnostic[] {
  const diagnostics: MooTreeSitterDiagnostic[] = [];
  const visit = (node: TreeSitterNodeLike) => {
    if (node.isError || node.isMissing) {
      diagnostics.push(toDiagnostic(node));
      return;
    }

    for (const child of node.children) {
      visit(child);
    }
  };

  visit(root);
  return diagnostics;
}

function toDiagnostic(node: TreeSitterNodeLike): MooTreeSitterDiagnostic {
  const lineNumber = node.startPosition.row + 1;
  const startColumn = node.startPosition.column + 1;
  const endColumn = Math.max(startColumn + 1, node.endPosition.column + 1);

  if (node.isMissing) {
    const missingText = missingNodeText(node.type);
    return {
      code: 'missing-node',
      message: `Tree-sitter recovered by inserting missing ${missingText}.`,
      missingText,
      lineNumber,
      startColumn,
      endColumn,
    };
  }

  return {
    code: 'parse-error',
    message: 'Tree-sitter could not parse this MOO syntax.',
    lineNumber,
    startColumn,
    endColumn,
  };
}

function missingNodeText(type: string): string {
  if (type === '_SEMI') {
    return ';';
  }

  return type;
}

const BLOCK_NODE_KINDS: Partial<Record<string, MooBlockKind>> = {
  fork_statement: 'fork',
  for_statement: 'for',
  if_statement: 'if',
  try_except_statement: 'try',
  try_finally_statement: 'try',
  while_statement: 'while',
};
const MIDDLE_NODE_KINDS: Partial<Record<string, MooMiddleKeyword>> = {
  elseif_clause: 'elseif',
  else_clause: 'else',
  except_statement: 'except',
  finally_statement: 'finally',
};
const WHILE_LABEL_PATTERN = new RegExp(
  `^while(?:\\s+${MOO_IDENTIFIER_PATTERN_SOURCE})?\\s*\\((.*)\\)`,
  'i',
);
const FOR_LABEL_PATTERN = new RegExp(
  `^for\\s+(${MOO_IDENTIFIER_PATTERN_SOURCE}(?:\\s*,\\s*${MOO_IDENTIFIER_PATTERN_SOURCE})?)`,
  'i',
);
const FORK_LABEL_PATTERN = new RegExp(`^fork(?:\\s+(${MOO_IDENTIFIER_PATTERN_SOURCE}))?`, 'i');

function collectTreeSitterStructure(root: TreeSitterNodeLike): MooStructure {
  const symbols = collectBlockSymbols(root.children);
  const foldingRanges = collectFoldingRanges(symbols);

  return {
    foldingRanges,
    symbols,
  };
}

function collectBlockSymbols(nodes: TreeSitterNodeLike[]): MooStructureSymbol[] {
  const symbols: MooStructureSymbol[] = [];

  for (const node of nodes) {
    const symbol = toBlockSymbol(node);
    if (symbol) {
      symbols.push(symbol);
      continue;
    }

    symbols.push(...collectBlockSymbols(node.children));
  }

  return symbols;
}

function toBlockSymbol(node: TreeSitterNodeLike): MooStructureSymbol | null {
  const blockKind = getStructureNodeKind(node.type);
  if (!blockKind) {
    return null;
  }

  const startLineNumber = node.startPosition.row + 1;
  const startColumn = node.startPosition.column + 1;
  const keywordLength = blockKind.length;
  const selectionRange = {
    startLineNumber,
    startColumn,
    endLineNumber: startLineNumber,
    endColumn: startColumn + keywordLength,
  };

  return {
    name: describeParserStructure(blockKind, node.text ?? ''),
    blockKind,
    range: {
      startLineNumber,
      startColumn,
      endLineNumber: node.endPosition.row + 1,
      endColumn: node.endPosition.column + 1,
    },
    selectionRange,
    children: collectBlockSymbols(node.children),
  };
}

function collectFoldingRanges(symbols: MooStructureSymbol[]): MooFoldingRange[] {
  const ranges: MooFoldingRange[] = [];

  const visit = (symbol: MooStructureSymbol) => {
    if (symbol.range.endLineNumber > symbol.range.startLineNumber) {
      ranges.push({
        start: symbol.range.startLineNumber,
        end: symbol.range.endLineNumber,
      });
    }

    for (const child of symbol.children) {
      visit(child);
    }
  };

  for (const symbol of symbols) {
    visit(symbol);
  }

  return ranges.sort((left, right) => left.start - right.start);
}

function getStructureNodeKind(type: string): MooStructureSymbolKind | null {
  return BLOCK_NODE_KINDS[type] ?? MIDDLE_NODE_KINDS[type] ?? null;
}

function describeParserStructure(kind: MooStructureSymbolKind, text: string): string {
  const firstLine = text.split(/\r\n|\r|\n/, 1)[0]?.trim() ?? '';

  switch (kind) {
    case 'if': {
      const condition = /^if\s*\((.*)\)/i.exec(firstLine)?.[1]?.trim();
      return condition ? `if ${condition}` : 'if';
    }
    case 'while': {
      const condition = WHILE_LABEL_PATTERN.exec(firstLine)?.[1]?.trim();
      return condition ? `while ${condition}` : 'while';
    }
    case 'for': {
      const variables = FOR_LABEL_PATTERN.exec(firstLine)?.[1];
      return variables ? `for ${variables.replace(/\s*,\s*/, ', ')}` : 'for';
    }
    case 'fork': {
      const name = FORK_LABEL_PATTERN.exec(firstLine)?.[1];
      return name ? `fork ${name}` : 'fork';
    }
    case 'try':
      return 'try';
    case 'elseif': {
      const condition = /^elseif\s*\((.*)\)/i.exec(firstLine)?.[1]?.trim();
      return condition ? `elseif ${condition}` : 'elseif';
    }
    case 'else':
      return 'else';
    case 'except': {
      const exceptClause = /^except\s+(.*)$/i.exec(firstLine)?.[1]?.trim();
      return exceptClause ? `except ${exceptClause}` : 'except';
    }
    case 'finally':
      return 'finally';
  }
}
