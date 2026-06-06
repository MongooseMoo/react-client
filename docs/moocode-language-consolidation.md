# MOOCode Language Consolidation Log - 2026-06-05

Target architecture:
- React owns one MOO language contract consumed by Monaco tokenization,
  completions, hovers, diagnostics, and editor routing.
- Monaco runtime loading is deterministic, version-pinned, and local to the lazy
  editor route boundary.
- Tree-sitter owns structural parsing fixtures and editor queries as a separate
  reusable package.

Forbidden surfaces:
- Duplicated keyword, block, or error metadata across React language files.
- Implicit Monaco CDN runtime fallback that can drift away from the installed
  `monaco-editor` package version.
- Parser fixtures imported from unapproved repositories or generated training
  corpora.

Search gates:
- `rg -n "OPEN_BLOCKS|CLOSE_BLOCKS|MIDDLE_BLOCKS|STATEMENT_KEYWORDS =" src/editor/moocode`
- `Select-String -Path package.json,package-lock.json -Pattern 'monaco-editor','@monaco-editor/react','@monaco-editor/loader' -SimpleMatch`

Runtime gates:
- `npm test -- --run src/editor/moocode src/editor/monacoLoader.test.ts src/components/editor/editorWindow.test.tsx src/routes.test.tsx`
- `npm run typecheck`
- `npm run build`
- `npm test -- --run src`
- Tree-sitter corpus expansion is paused until approved MOO artifacts are
  identified.

Iterations:
- 2026-06-05 contract consolidation:
  - Added `src/editor/moocode/contract.ts` as the single React owner for MOO
    language id, session types, keywords, builtin variables/functions, errors,
    and block open/middle/close facts.
  - Rewired Monarch language setup and lightweight diagnostics to consume the
    contract.
  - Added `src/editor/monacoLoader.ts` and call it from the lazy editor module
    so `@monaco-editor/react` uses an explicit jsDelivr `vs` path derived from
    the installed `monaco-editor` package version. A local `monaco` object import
    was rejected because it bundled Monaco workers/languages into the lazy editor
    chunk and broke PWA precache limits.
  - Focused gate passed:
    `npm test -- --run src/editor/moocode src/editor/monacoLoader.test.ts src/components/editor/editorWindow.test.tsx src/routes.test.tsx`.
  - Search gate passed with only `contract.ts` defining `STATEMENT_KEYWORDS`
    and no `OPEN_BLOCKS`, `CLOSE_BLOCKS`, or `MIDDLE_BLOCKS` leftovers.
  - Tree-sitter corpus expansion remains paused pending approved MOO artifacts;
    `moocoder` was inspected but not used as corpus.
- 2026-06-05 Monaco structure providers:
  - Added `src/editor/moocode/structure.ts` as the browser-side block structure
    analyzer for MOO document symbols and folding ranges.
  - Registered Monaco document-symbol and folding-range providers for
    `moocode`, backed by the same block contract used by indentation and
    diagnostics.
  - Structure scanning masks strings, line comments, and block comments so
    block-looking text does not create fake symbols or folds.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-05 Monaco signature help:
  - Added `src/editor/moocode/signatures.ts` for browser-side ToastStunt
    builtin call-context detection and parameter selection.
  - Registered Monaco signature help for `moocode`, triggered by `(` and `,`.
  - Signature scanning masks strings, line comments, and block comments so
    call-looking text does not create fake parameter hints.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-05 scanner consolidation:
  - Added `src/editor/moocode/scanner.ts` as the single owner for MOO source
    masking, first-keyword detection, and Monaco-position offset mapping.
  - Consolidated structure and signature scanning onto the shared helper, and
    moved diagnostics first-keyword detection to the same owner.
  - Cleanup search gate passed with zero hits:
    `rg "stripLineForStructure|maskStringsAndComments|function firstKeyword|function offsetAt\\(" src/editor/moocode`.
  - Focused gate passed:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Tree-sitter browser parser:
  - Created and pushed `https://github.com/ctoth/tree-sitter-moocode` with
    `tree-sitter-moocode.wasm` packaged and tagged at `v0.1.0`.
  - `tree-sitter-moocode@0.1.0` npm publish is prepared but waiting on an npm
    one-time password requirement.
  - Added `web-tree-sitter` and the tagged `tree-sitter-moocode` package to the
    React client.
  - Added `src/editor/moocode/treeSitter.ts` as the lazy browser parser facade;
    it dynamically imports `web-tree-sitter` plus the runtime and MOO parser
    WASM assets.
  - Editor markers now show synchronous scanner diagnostics immediately, then
    merge parser-backed Tree-sitter diagnostics when the parser finishes loading
    for the current MOO model.
- 2026-06-06 parser-backed Monaco structure:
  - Tree-sitter parse results now include editor structure extracted from MOO
    block nodes: document symbols, nested child symbols, and folding ranges.
  - Monaco document-symbol and folding providers prefer the lazy parser-backed
    structure, then fall back to the scanner structure while WASM is loading or
    unavailable.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco semantic navigation:
  - Added `src/editor/moocode/semantics.ts` for browser-side local symbol
    discovery across assignments, `for` variables, `fork` task variables, and
    scatter targets.
  - Registered Monaco definition, reference, and rename providers for local
    MOO symbols, and added local variables to default completions.
  - Rename edits use Monaco's real `WorkspaceEdit` shape and reject invalid MOO
    identifiers or positions without a local symbol.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco semantic tokens:
  - Added `src/editor/moocode/semanticTokens.ts` for Monaco document semantic
    tokens layered on top of Monarch tokenization.
  - Semantic tokens classify local declarations/references, ToastStunt builtin
    functions and variables, MOO error constants, system references, strings,
    comments, object numbers, numeric literals, keywords, and operator words.
  - Registered a Monaco `DocumentSemanticTokensProvider` with a stable legend
    and tested the packed integer encoding Monaco consumes.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
