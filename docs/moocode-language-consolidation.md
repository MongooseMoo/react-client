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
  - Parser-backed diagnostics are debounced in the editor window so rapid edits
    keep immediate scanner feedback without scheduling a WASM parse for every
    keystroke.
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
    discovery across assignments, `for` variables, `fork` task variables,
    `except` handler variables, and scatter targets.
  - Registered Monaco definition, reference, and rename providers for local
    MOO symbols, and added local variables to default completions.
  - Rename edits use Monaco's real `WorkspaceEdit` shape and reject invalid MOO
    identifiers or positions without a local symbol.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco declaration navigation:
  - Registered a Monaco `DeclarationProvider` for local MOO symbols so Go to
    Declaration and Go to Definition share the same local-symbol target.
  - The provider reuses the browser-side semantic model, keeping declaration
    behavior aligned with reference, rename, highlight, and CodeLens support.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode/language.test.ts`.
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
- 2026-06-06 Monaco range semantic tokens:
  - Added range-scoped semantic token encoding so Monaco can request only the
    visible/editing slice of a MOO document without changing token semantics.
  - Registered a Monaco `DocumentRangeSemanticTokensProvider` beside the
    full-document provider, sharing the same stable legend and classifier.
  - Consolidated semantic-token offset mapping through the shared MOO scanner
    position helper.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode/semanticTokens.test.ts src/editor/moocode/language.test.ts`.
- 2026-06-06 Monaco quick fixes:
  - Added `src/editor/moocode/codeActions.ts` for browser-side quick fixes
    derived from the existing MOO diagnostics.
  - Registered a Monaco `CodeActionProvider` that inserts missing block close
    keywords, delimiters, and string quotes with Monaco workspace edits.
  - Provider metadata advertises `quickfix` actions so Monaco can route lightbulb
    requests efficiently.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco parameter inlay hints:
  - Added `src/editor/moocode/inlayHints.ts` for browser-side parameter hints
    derived from the same ToastStunt builtin signatures used by signature help.
  - Registered a Monaco `InlayHintsProvider` for `moocode`, with parameter
    labels on builtin function-call arguments.
  - Inlay hint scanning masks comments and strings, tracks nested calls, and
    sorts hints by source position so nested builtin calls render deterministically.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco document formatting:
  - Added `src/editor/moocode/formatter.ts` for browser-side whole-document
    MOO formatting using the shared block contract.
  - Registered a Monaco `DocumentFormattingEditProvider` for `moocode`.
  - Formatting aligns block open/middle/close keywords, respects Monaco spaces
    versus tabs options, trims trailing whitespace, and masks comments/strings
    before reading block keywords.
  - Fixed the shared MOO source masker to preserve Monaco-compatible UTF-16
    offsets when strings or comments contain non-BMP characters.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco rich hovers:
  - Added `src/editor/moocode/hover.ts` as the browser-side hover service.
  - Replaced the small inline hover table with Monaco hovers backed by builtin
    signatures, builtin variables, MOO error constants, statement/operator
    keywords, and local symbol analysis.
  - Hover scanning uses the shared masked source helper so strings and comments
    do not produce language hovers.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco document highlights:
  - Added semantic read/write document highlights for local MOO symbols using
    the same local-symbol analysis as references and rename.
  - Registered a Monaco `DocumentHighlightProvider` for `moocode`.
  - Highlights are suppressed for builtins and masked comment/string content.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco selection ranges:
  - Added `src/editor/moocode/selectionRanges.ts` for smart expand-selection
    chains: identifier, statement line, enclosing MOO blocks, then document.
  - Registered a Monaco `SelectionRangeProvider` for `moocode`.
  - Word-level selection uses the shared source masker so string/comment text
    does not create fake identifier ranges.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco rename preparation:
  - Added semantic rename-location resolution for local MOO symbols.
  - Monaco now rejects invalid rename positions before opening the inline
    rename field, while valid local symbols resolve to their exact word range.
  - Reused the existing local-symbol model so comments, strings, builtins, and
    unknown globals remain non-renameable.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco range formatting:
  - Added line-based selection formatting through Monaco's
    `DocumentRangeFormattingEditProvider`.
  - Range formatting reuses the whole-document formatter for block context, then
    returns only the selected full-line replacement.
  - No-op range formatting requests return no edits, keeping Monaco's command
    quiet when selected lines are already formatted.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco completion metadata:
  - Completion items now include Monaco `detail` fields and richer
    documentation for builtin functions, builtin variables, error constants,
    and MOO keywords.
  - Completion metadata reuses the same builtin signature and hover
    documentation sources as signature help and hover cards.
  - Exception-handler completion contexts now offer `any`, `error`, and MOO
    error constants inside `except name? (...)` instead of the full default
    completion list.
  - Existing labels, snippets, and replacement ranges are unchanged.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco on-type formatting:
  - Added a Monaco `OnTypeFormattingEditProvider` for MOO line formatting after
    statement and delimiter trigger characters.
  - On-type formatting uses full-document formatter context, but returns only a
    current-line edit so typing inside nested blocks fixes indentation without
    disturbing surrounding code.
  - Already formatted current lines return no edits.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco CodeLens:
  - Added local-symbol CodeLens summaries for browser-side MOO semantics.
  - CodeLens entries appear at each primary local definition and summarize
    definition/reference counts using the same semantic model as rename,
    references, hovers, and highlights.
  - CodeLens commands now use Monaco's built-in `editor.action.showReferences`
    command with concrete local reference locations instead of an unregistered
    custom command id.
  - Builtins, comments, strings, and unknown globals remain excluded.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco inline completions:
  - Added a Monaco `InlineCompletionsProvider` for block-close scaffolding.
  - Inline completions suggest matching `end*` block lines at the end of MOO
    block openers, preserving current indentation and tab style.
  - Suggestions are suppressed when the next meaningful line already closes the
    block or when the opener appears inside masked comments/strings.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco block snippets:
  - Added snippet completions for common MOO block forms: `if`, `if/else`,
    list/range `for`, `while`, `fork`, `try/except`, and `try/finally`.
  - Snippets use Monaco tab stops and the installed snippet insertion rule, while
    staying out of error-constant, system-reference, and verb-call completion
    contexts.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 masked completion suppression:
  - Reused the shared MOO source masker so Monaco completions are suppressed
    inside line comments, block comments, and string literals.
  - This brings completions in line with hovers, signatures, inline completions,
    selection ranges, and semantic navigation, which already ignore masked text.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco linked editing:
  - Added a Monaco `LinkedEditingRangeProvider` for local MOO symbols.
  - Linked editing reuses the semantic local-symbol model behind rename,
    references, highlights, hovers, and CodeLens, so builtins and masked
    comment/string text remain excluded.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 Monaco document links:
  - Added a Monaco `LinkProvider` for MOO object-number references like `#123`
    and `#-1`.
  - Document links use stable `moo://object/<number>` targets and
    `moo://system/<property>` targets with descriptive tooltips, and reuse the
    shared source masker so comments and strings do not become clickable.
  - Added shared scanner offset-to-position mapping for Monaco-compatible link
    ranges.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode`.
- 2026-06-06 accessible diagnostics status:
  - Added a live editor status-bar summary for MOO diagnostics so parser and
    scanner problems are visible outside Monaco squiggles.
  - The summary updates immediately from scanner markers, then refreshes when
    async Tree-sitter markers arrive, and stays hidden for plaintext sessions.
  - When diagnostics exist, the status summary is a keyboard-reachable button
    that focuses Monaco on the first MOO problem.
  - Added a quick fix for mismatched block close keywords, so a bad closer like
    `endwhile` under an `if` can be replaced with `endif` from Monaco's
    lightbulb actions.
  - Added remove quick fixes for unexpected close keywords and unexpected
    delimiters, using narrow edits over the exact offending token.
  - Cleaned up editor toolbar buttons with explicit button types and without
    `accessKey` shortcuts that conflict with assistive-technology keymaps.
  - Focused red-to-green gate:
    `npm test -- --run src/components/editor/editorWindow.test.tsx`.
- 2026-06-06 Monaco block comments:
  - Added MOO `/* ... */` block comments to Monaco's language configuration so
    editor comment commands understand both MOO comment forms.
  - Added a Monarch block-comment tokenizer state so block comments are
    highlighted consistently with the scanner, diagnostics, completions, hovers,
    and other masked-source language features.
  - Brought lightweight diagnostics into parity with block comments so comment
    contents no longer create false loop-control, block-close, or delimiter
    markers.
  - Focused red-to-green gate:
    `npm test -- --run src/editor/moocode/language.test.ts`.
