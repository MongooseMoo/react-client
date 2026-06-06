import { describe, expect, it, vi } from 'vitest';
import {
  createMooTreeSitterService,
  resetMooTreeSitterServiceForTests,
  toMonacoTreeSitterMarkers,
} from './treeSitter';

describe('MOO Tree-sitter service', () => {
  it('initializes web-tree-sitter lazily with the packaged runtime and language WASM assets', async () => {
    const init = vi.fn(() => Promise.resolve());
    const load = vi.fn(() => Promise.resolve({ name: 'moocode' }));
    const parse = vi.fn(() => ({
      delete: vi.fn(),
      rootNode: {
        children: [],
        endPosition: { row: 0, column: 12 },
        hasError: false,
        isError: false,
        isMissing: false,
        startPosition: { row: 0, column: 0 },
        toString: () => '(source_file)',
        type: 'source_file',
      },
    }));
    const setLanguage = vi.fn();

    const service = await createMooTreeSitterService({
      loadLanguageWasmUrl: () => Promise.resolve('/assets/tree-sitter-moocode.wasm'),
      loadRuntime: () =>
        Promise.resolve({
          Language: { load },
          Parser: class {
            static init = init;
            parse = parse;
            setLanguage = setLanguage;
          },
        }),
      loadRuntimeWasmUrl: () => Promise.resolve('/assets/web-tree-sitter.wasm'),
    });

    const result = service.parse('notify(player, "ok");');

    expect(init).toHaveBeenCalledWith({
      locateFile: expect.any(Function),
    });
    expect(init.mock.calls[0][0].locateFile('web-tree-sitter.wasm')).toBe(
      '/assets/web-tree-sitter.wasm',
    );
    expect(load).toHaveBeenCalledWith('/assets/tree-sitter-moocode.wasm');
    expect(setLanguage).toHaveBeenCalledWith({ name: 'moocode' });
    expect(result).toMatchObject({
      diagnostics: [],
      hasError: false,
      rootType: 'source_file',
      structure: {
        foldingRanges: [],
        symbols: [],
      },
    });
  });

  it('extracts block symbols and folding ranges from parser nodes', async () => {
    const service = await createMooTreeSitterService({
      loadLanguageWasmUrl: () => Promise.resolve('/moo.wasm'),
      loadRuntime: () =>
        Promise.resolve({
          Language: { load: vi.fn(() => Promise.resolve({})) },
          Parser: class {
            static init = vi.fn(() => Promise.resolve());
            parse = vi.fn(() => ({
              delete: vi.fn(),
              rootNode: {
                children: [
                  {
                    children: [
                      {
                        children: [
                          blockNode('for_statement', 'for item in (items)\nendfor', 1, 2, 3, 8),
                        ],
                        endPosition: { row: 3, column: 8 },
                        hasError: false,
                        isError: false,
                        isMissing: false,
                        startPosition: { row: 0, column: 0 },
                        toString: () => '(if_clause)',
                        type: 'if_clause',
                      },
                    ],
                    endPosition: { row: 6, column: 5 },
                    hasError: false,
                    isError: false,
                    isMissing: false,
                    startPosition: { row: 0, column: 0 },
                    toString: () => '(if_statement)',
                    type: 'if_statement',
                    text: 'if (valid(player))\n  for item in (items)\n  endfor\nendif',
                  },
                ],
                endPosition: { row: 6, column: 5 },
                hasError: false,
                isError: false,
                isMissing: false,
                startPosition: { row: 0, column: 0 },
                toString: () => '(source_file (if_statement))',
                type: 'source_file',
              },
            }));
            setLanguage = vi.fn();
          },
        }),
      loadRuntimeWasmUrl: () => Promise.resolve('/runtime.wasm'),
    });

    const structure = service.parse('if (valid(player))\nendif').structure;

    expect(structure.symbols).toEqual([
      expect.objectContaining({
        blockKind: 'if',
        name: 'if valid(player)',
        range: expect.objectContaining({
          startLineNumber: 1,
          endLineNumber: 7,
        }),
        children: [
          expect.objectContaining({
            blockKind: 'for',
            name: 'for item',
            range: expect.objectContaining({
              startLineNumber: 2,
              endLineNumber: 4,
            }),
          }),
        ],
      }),
    ]);
    expect(structure.foldingRanges).toEqual([
      { start: 1, end: 7 },
      { start: 2, end: 4 },
    ]);
  });

  it('extracts parse-error diagnostics from ERROR and missing nodes', async () => {
    const service = await createMooTreeSitterService({
      loadLanguageWasmUrl: () => Promise.resolve('/moo.wasm'),
      loadRuntime: () =>
        Promise.resolve({
          Language: { load: vi.fn(() => Promise.resolve({})) },
          Parser: class {
            static init = vi.fn(() => Promise.resolve());
            parse = vi.fn(() => ({
              delete: vi.fn(),
              rootNode: {
                children: [
                  {
                    children: [],
                    endPosition: { row: 1, column: 4 },
                    hasError: true,
                    isError: true,
                    isMissing: false,
                    startPosition: { row: 1, column: 0 },
                    toString: () => '(ERROR (identifier))',
                    type: 'ERROR',
                  },
                  {
                    children: [],
                    endPosition: { row: 2, column: 0 },
                    hasError: true,
                    isError: false,
                    isMissing: true,
                    startPosition: { row: 2, column: 0 },
                    toString: () => '(MISSING ";")',
                    type: ';',
                  },
                ],
                endPosition: { row: 2, column: 0 },
                hasError: true,
                isError: false,
                isMissing: false,
                startPosition: { row: 0, column: 0 },
                toString: () => '(source_file (ERROR) (MISSING ";"))',
                type: 'source_file',
              },
            }));
            setLanguage = vi.fn();
          },
        }),
      loadRuntimeWasmUrl: () => Promise.resolve('/runtime.wasm'),
    });

    expect(service.parse('if (\nendif').diagnostics).toEqual([
      {
        code: 'parse-error',
        endColumn: 5,
        lineNumber: 2,
        message: 'Tree-sitter could not parse this MOO syntax.',
        startColumn: 1,
      },
      {
        code: 'missing-node',
        endColumn: 2,
        lineNumber: 3,
        message: 'Tree-sitter recovered by inserting missing ;.',
        missingText: ';',
        startColumn: 1,
      },
    ]);
  });

  it('caches the default service for marker conversion', async () => {
    resetMooTreeSitterServiceForTests();
    const markers = await toMonacoTreeSitterMarkers('notify(player, );', 8, {
      loadLanguageWasmUrl: () => Promise.resolve('/moo.wasm'),
      loadRuntime: () =>
        Promise.resolve({
          Language: { load: vi.fn(() => Promise.resolve({})) },
          Parser: class {
            static init = vi.fn(() => Promise.resolve());
            parse = vi.fn(() => ({
              delete: vi.fn(),
              rootNode: {
                children: [
                  {
                    children: [],
                    endPosition: { row: 0, column: 16 },
                    hasError: true,
                    isError: true,
                    isMissing: false,
                    startPosition: { row: 0, column: 15 },
                    toString: () => '(ERROR)',
                    type: 'ERROR',
                  },
                ],
                endPosition: { row: 0, column: 17 },
                hasError: true,
                isError: false,
                isMissing: false,
                startPosition: { row: 0, column: 0 },
                toString: () => '(source_file (ERROR))',
                type: 'source_file',
              },
            }));
            setLanguage = vi.fn();
          },
        }),
      loadRuntimeWasmUrl: () => Promise.resolve('/runtime.wasm'),
    });

    expect(markers).toEqual([
      expect.objectContaining({
        code: 'parse-error',
        endColumn: 17,
        endLineNumber: 1,
        lineNumber: 1,
        severity: 8,
        source: 'moocode',
        startColumn: 16,
        startLineNumber: 1,
      }),
    ]);
  });
});

function blockNode(
  type: string,
  text: string,
  startRow: number,
  startColumn: number,
  endRow: number,
  endColumn: number,
) {
  return {
    children: [],
    endPosition: { row: endRow, column: endColumn },
    hasError: false,
    isError: false,
    isMissing: false,
    startPosition: { row: startRow, column: startColumn },
    text,
    toString: () => `(${type})`,
    type,
  };
}
