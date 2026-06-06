import { MOO_LANGUAGE_ID } from './contract';

export type MooTreeSitterDiagnosticCode = 'missing-node' | 'parse-error';

export type MooTreeSitterDiagnostic = {
  code: MooTreeSitterDiagnosticCode;
  message: string;
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
        };
      }

      try {
        return {
          rootType: tree.rootNode.type,
          hasError: tree.rootNode.hasError,
          treeText: tree.rootNode.toString(),
          diagnostics: collectTreeSitterDiagnostics(tree.rootNode),
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
    return {
      code: 'missing-node',
      message: 'Tree-sitter recovered by inserting missing MOO syntax.',
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
