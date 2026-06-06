# MOOCode Monaco Workstream

## Goal

Make the simpleedit Monaco editor syntax-aware for ToastStunt/LambdaMOO code while keeping non-code simpleedit buffers plain text.

## Executed Scope

- Register a dedicated Monaco language id: `moocode`.
- Select `moocode` only for simpleedit sessions whose MCP type is `moo-code` or a compatibility alias.
- Keep `string` and `string-list` sessions on Monaco `plaintext`.
- Add a ToastStunt-derived keyword, error constant, builtin variable, and builtin function vocabulary.
- Add Monarch tokenization for:
  - statement keywords and block terminators
  - builtin variables and functions
  - error constants
  - object literals
  - numbers, strings, string escapes, comments, delimiters, and operators
- Add language configuration for:
  - bracket pairs
  - auto-closing/surrounding pairs
  - statement indentation and outdent patterns
- Add completion items for core keywords, variables, errors, and builtin functions.
- Add hover text for the highest-frequency MOO builtin variables/functions.
- Add lightweight syntax diagnostics for:
  - unmatched block close keywords
  - missing block close keywords
  - misplaced `else`, `elseif`, `except`, and `finally`
  - unterminated strings
  - unbalanced delimiters
  - `break`/`continue` outside `for` or `while`
- Wire diagnostics into Monaco model markers for MOO buffers and clear them for non-MOO buffers.

## Source Authority

The client language vocabulary and grammar shape were derived from:

- `C:/Users/Q/src/toaststunt/moo.grammar`
- `C:/Users/Q/src/toaststunt/src/keywords.gperf`
- `C:/Users/Q/src/toaststunt/src/* register_function(...)` builtin registrations

The current implementation is intentionally a client-side editor aid. The server parser remains the compile authority.

## Future Authority Upgrade

For exact server-equivalent diagnostics, the next workstream should expose or reuse ToastStunt parser output:

- server-side `parse_ast` / validation over MCP or GMCP for connected sessions, or
- a ToastStunt parser compiled to WASM and run in a web worker for local/offline validation.

That would replace the heuristic diagnostics with parser-backed spans while keeping the Monaco registration, completions, hovers, and React plumbing from this workstream.

## Test Gates

Focused TDD gates added:

- `src/editor/moocode/language.test.ts`
- `src/editor/moocode/diagnostics.test.ts`
- `src/components/editor/editorWindow.test.tsx`

Acceptance gates:

- focused Vitest suite for the files above
- repo TypeScript typecheck
- production build
- Biome check for the changed source files
