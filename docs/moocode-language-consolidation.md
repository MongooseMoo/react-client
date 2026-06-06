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
