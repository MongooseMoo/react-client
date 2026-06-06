import { describe, expect, it, vi } from 'vitest';
import {
  createCachedMooParser,
  createMooTreeSitterService,
  resetMooTreeSitterServiceForTests,
  toMonacoTreeSitterMarkers,
} from './treeSitter';

describe('MOO Tree-sitter service', () => {
  it('dedupes in-flight parser requests for the same source', async () => {
    let resolveParse: (result: ReturnType<typeof parseResult>) => void = () => {};
    const parse = vi.fn(
      () =>
        new Promise<ReturnType<typeof parseResult>>((resolve) => {
          resolveParse = resolve;
        }),
    );
    const cachedParse = createCachedMooParser(parse);

    const first = cachedParse('notify(player, "ok");');
    const second = cachedParse('notify(player, "ok");');

    expect(parse).toHaveBeenCalledTimes(1);

    resolveParse(parseResult('source_file'));

    await expect(first).resolves.toMatchObject({ rootType: 'source_file' });
    await expect(second).resolves.toMatchObject({ rootType: 'source_file' });
  });

  it('reuses recent parser results and evicts the oldest source', async () => {
    const parse = vi.fn(async (source: string) => parseResult(source));
    const cachedParse = createCachedMooParser(parse, 2);

    await cachedParse('first');
    await cachedParse('second');
    await cachedParse('first');
    await cachedParse('third');
    await cachedParse('second');

    expect(parse.mock.calls.map(([source]) => source)).toEqual([
      'first',
      'second',
      'third',
      'second',
    ]);
  });

  it('does not cache rejected parser results', async () => {
    const parse = vi
      .fn(async (_source: string) => parseResult('source_file'))
      .mockRejectedValueOnce(new Error('parse failed'));
    const cachedParse = createCachedMooParser(parse);

    await expect(cachedParse('broken')).rejects.toThrow('parse failed');
    await expect(cachedParse('broken')).resolves.toMatchObject({ rootType: 'source_file' });
    expect(parse).toHaveBeenCalledTimes(2);
  });

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

  it('extracts parser-backed middle-clause symbols and folding ranges', async () => {
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
                      blockNode(
                        'elseif_clause',
                        'elseif (valid(caller))\n  notify(caller, "ok");',
                        2,
                        0,
                        4,
                        23,
                      ),
                      blockNode('else_clause', 'else\n  raise(E_PERM);', 4, 0, 6, 16),
                    ],
                    endPosition: { row: 6, column: 5 },
                    hasError: false,
                    isError: false,
                    isMissing: false,
                    startPosition: { row: 0, column: 0 },
                    text: [
                      'if (valid(player))',
                      '  notify(player, "ok");',
                      'elseif (valid(caller))',
                      '  notify(caller, "ok");',
                      'else',
                      '  raise(E_PERM);',
                      'endif',
                    ].join('\n'),
                    toString: () => '(if_statement)',
                    type: 'if_statement',
                  },
                  {
                    children: [
                      blockNode(
                        'except_statement',
                        'except caught (E_PERM)\n  notify(player, caught);',
                        9,
                        0,
                        11,
                        24,
                      ),
                      blockNode('finally_statement', 'finally\n  cleanup();', 11, 0, 13, 12),
                    ],
                    endPosition: { row: 13, column: 6 },
                    hasError: false,
                    isError: false,
                    isMissing: false,
                    startPosition: { row: 7, column: 0 },
                    text: [
                      'try',
                      '  risky();',
                      'except caught (E_PERM)',
                      '  notify(player, caught);',
                      'finally',
                      '  cleanup();',
                      'endtry',
                    ].join('\n'),
                    toString: () => '(try_except_statement)',
                    type: 'try_except_statement',
                  },
                ],
                endPosition: { row: 13, column: 6 },
                hasError: false,
                isError: false,
                isMissing: false,
                startPosition: { row: 0, column: 0 },
                toString: () => '(source_file)',
                type: 'source_file',
              },
            }));
            setLanguage = vi.fn();
          },
        }),
      loadRuntimeWasmUrl: () => Promise.resolve('/runtime.wasm'),
    });

    const structure = service.parse('if (valid(player))\nendif\ntry\nendtry').structure;

    expect(structure.symbols[0].children).toEqual([
      expect.objectContaining({
        blockKind: 'elseif',
        name: 'elseif valid(caller)',
        range: expect.objectContaining({
          startLineNumber: 3,
          endLineNumber: 5,
        }),
      }),
      expect.objectContaining({
        blockKind: 'else',
        name: 'else',
        range: expect.objectContaining({
          startLineNumber: 5,
          endLineNumber: 7,
        }),
      }),
    ]);
    expect(structure.symbols[1].children).toEqual([
      expect.objectContaining({
        blockKind: 'except',
        name: 'except caught (E_PERM)',
      }),
      expect.objectContaining({
        blockKind: 'finally',
        name: 'finally',
      }),
    ]);
    expect(structure.foldingRanges).toEqual([
      { start: 1, end: 7 },
      { start: 3, end: 5 },
      { start: 5, end: 7 },
      { start: 8, end: 14 },
      { start: 10, end: 12 },
      { start: 12, end: 14 },
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

function parseResult(rootType: string) {
  return {
    diagnostics: [],
    hasError: false,
    rootType,
    structure: {
      foldingRanges: [],
      symbols: [],
    },
    treeText: `(${rootType})`,
  };
}

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
