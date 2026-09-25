import { createRequire } from 'node:module';
import { beforeAll, describe, expect, it } from 'vitest';
import { createMooTreeSitterService, type MooTreeSitterService } from './treeSitter';

// Loads the real tree-sitter-moocode grammar instead of a mocked runtime, so a
// grammar upgrade that renames block nodes or rejects valid MOO fails here.
const require = createRequire(import.meta.url);

let service: MooTreeSitterService;

beforeAll(async () => {
  service = await createMooTreeSitterService({
    loadRuntime: () => import('web-tree-sitter'),
    loadRuntimeWasmUrl: async () => require.resolve('web-tree-sitter/web-tree-sitter.wasm'),
    loadLanguageWasmUrl: async () =>
      require.resolve('tree-sitter-moocode/tree-sitter-moocode.wasm'),
  });
});

describe('MOO Tree-sitter grammar', () => {
  it.each([
    ['exponent floats', 'return abs(x - 0.32) < 1e-09;'],
    ['system property assignment', '$shutdown = 0;'],
    ['error as a variable name', '{error, ?message = ""} = args;'],
    ['catch codes that are expressions', "x = `o:(v)() ! 1';"],
    ['subtraction without spaces', 'return x-1;'],
    ['case-insensitive keywords', 'IF (x)\n  RETURN E_PERM;\nENDIF'],
  ])('parses %s without diagnostics', (_name, source) => {
    const result = service.parse(source);

    expect(result.diagnostics).toEqual([]);
    expect(result.hasError).toBe(false);
  });

  it('reports // as a parse error because MOO has no line comments', () => {
    const result = service.parse('x = 1; // not a comment');

    expect(result.hasError).toBe(true);
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it('extracts block and middle-clause symbols from real parser nodes', () => {
    const source = [
      'if (a)',
      '  for x in (items)',
      '  endfor',
      'elseif (b)',
      '  while loop (1)',
      '  endwhile',
      'else',
      '  try',
      '  except (ANY)',
      '  endtry',
      'endif',
    ].join('\n');

    const { symbols } = service.parse(source).structure;

    expect(symbols.map((symbol) => symbol.blockKind)).toEqual(['if']);
    const kinds = (list: typeof symbols): unknown[] =>
      list.map((symbol) => [symbol.blockKind, kinds(symbol.children)]);
    expect(kinds(symbols[0].children)).toEqual([
      ['for', []],
      ['elseif', [['while', []]]],
      ['else', [['try', [['except', []]]]]],
    ]);
  });
});
