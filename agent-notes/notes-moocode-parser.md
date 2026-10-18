# MOO parser improvement — notes (2026-09-24)

Goal (Q): move tree-sitter-moocode from ctoth → MongooseMoo, improve it heavily,
validate against real Mongoose verb code WITHOUT committing any Mongoose code.

## Facts
- Grammar: `~/code/tree-sitter-moocode` (clean, 2 commits, origin git@github.com:ctoth/tree-sitter-moocode). npm `tree-sitter-moocode@0.1.0`, consumed in react-client `src/editor/moocode/treeSitter.ts:90`.
- `MongooseMoo/tree-sitter-moocode` does not exist yet; transfer NOT done (needs Q's go-ahead).
- `~/code/mongoose_db/flat/` is useless: 7180 verb files, all empty.
- Newest local db: `~/src/lambdamoo-db-py/mongoose.db.new.latest` (Jun 17 2026, 92 MB).
- Extracted 11,140 verb bodies → scratchpad `verbs/<obj>/<idx>_<name>.moo` via scratchpad `extract_verbs.py` (uses lambdamoo-db-py venv). Scratchpad = outside every repo, so no commit risk.

## Baseline (current grammar, 11,140 verbs)
99.56% clean (49 fail). Output: scratchpad `parse-baseline.txt`. Buckets:
- ~30 float exponent literals `1e-09`, `1e+15`
- ~12 `$sysprop = expr` assignment (assignment left only allows identifier|postfix)
- ~4 `error` used as a variable name (`{error, msg} = args`, `error = 1`)
- `true` as variable (`verbs = true = {}`), `` `o:(v)() ! 1' ``
Only 8 corpus tests. "Clean parse" != correct tree; need a structural oracle.
Toast parser.y at `~/src/toaststunt/src/parser.y`.

## Done
- Q said "do it all". Repo TRANSFERRED → MongooseMoo/tree-sitter-moocode (public). Local remote updated.

## Toast truth (parser.y / keywords.gperf / unparse.cc @ eaaa197)
- Precedence low→high: `=`(right) < `? |`(nonassoc) < `|| &&` (SAME level, left)
  < compare incl `in` < `|. &. ^.` (same) < `<< >>` < `+ -` < `* / %` < `^`(right)
  < unary `! ~ -` < postfix `. : [ $`.
- Keywords case-insensitive (gperf --ignore-case). ANY, E_* are keywords (tERROR). NO true/false/error keywords → identifiers.
- No `//` comments; only `/* */`.
- Numbers have no sign (unary minus folds). Floats: `1.5`, `.5`, `1.` (if not `..`), `1e5`, `1e-09`. `1..2` = int TO int.
- catch codes = `ANY` | ne_arglist (arbitrary exprs, `@x`). Assignment left = any expr (semantic check later).
- `@` only in arglists/scatter, not a general expression.
- `$` / `^` alone = last/first index (only valid in index context).
- Unparser: prec table 1..12 in unparse.cc:227; bracket_lt/bracket_le rules. Plan: JS unparser over TS tree, diff vs db text = structural oracle.
- react-client only depends on statement/block node names (treeSitter.ts BLOCK_NODE_KINDS/MIDDLE_NODE_KINDS).

## Progress
- Branch `toast-fidelity` in ~/code/tree-sitter-moocode. grammar.js rewritten to Toast prec table,
  case-insensitive kw(), error_code token, float exponents, unsigned numbers, restricted assignment
  left, scatter_item w/ conflict [_expression, scatter_item], hidden _expression (supertype) + _argument,
  arguments node, parenthesized_expression, splice only in args, `/* */` only.
- Generates clean. Sample checks OK (`a || b && c` left-assoc same level, `x-1`, `$p = 0`, scatter w/ `error`).

- New grammar: 11140/11140 parse (100%), ~50% faster.
- DB text is FULLY parenthesized (fully_parenthesize=1), so plain round trip can't see binop precedence.
  scripts/roundtrip.mjs does step1 (full-paren re-render == original) + step2 (minimal-paren render →
  reparse → full render == original). Result: 11140/11140 ok.
- Mutation testing the oracle in scratchpad/mutant (copy of grammar). Prec must be integer.

- Mutant 1 (&& at compare level): oracle caught 1414. Mutant 2 (unary below ^): NOT caught — corpus
  never has `-x ^ y`. => oracle limited by corpus coverage; hand corpus tests needed for edge precedence.
- OLD corpus test pinned `a || (b && c)` (wrong). Writing new corpus: precedence/literals/expressions/
  statements/errors.txt, fill with `tree-sitter test --update`, then REVIEW each tree by hand.
- queries/highlights.scm needs update (any/error/true/false/number/.: gone).

- Corpus: 5 files, all trees reviewed by hand vs Toast table — correct. queries updated
  (ANY, error_code, integer, first/last_index, true/false via #match, scatter_item). tree-sitter test green.
- Known permissive: `{a,b}[1] = x` accepted (Toast rejects semantically); ternary nonassoc; `1.` float.

- LambdaCore (1726) + toastcore (1948) verbs: roundtrip 100% too.
- Committed b7fe610 on toast-fidelity (v0.2.0, README, repo URL → MongooseMoo). Diff scanned: no Mongoose content.

- Grammar PR: https://github.com/MongooseMoo/tree-sitter-moocode/pull/1 (no consumer context).
- react-client: branch feature/tree-sitter-moocode-0.2 (from master; left fix/html-output-xss).
  node_modules/tree-sitter-moocode is a --no-save SYMLINK to ../tree-sitter-moocode (0.1 backup in scratchpad/tsm-0.1-backup).
  260 existing moocode tests pass; they MOCK the runtime. Added src/editor/moocode/treeSitter.grammar.test.ts
  (real wasm): 8 pass on 0.2, 6 fail on 0.1. Uncommitted — needs npm publish 0.2.0 + dep bump first.
- Correction: `x-1` already worked in 0.1 (context-aware lexing); unsigned numbers are cleanup, not a fix.

## Release (2026-09-24)
- npm: 0.1.0 published 2026-06-06 by ctoth. Q logged in (npm whoami = ctoth).
- MERGE of PR #1 DENIED by auto-mode classifier (merge without review) → Q must merge.
- Q asked: trusted publishing via CI like ../ueb-translator (release.yml on v* tag, OIDC, --provenance,
  integrity verify, gh release). Added .github/workflows/{ci,release}.yml, allowScripts for tree-sitter-cli,
  test/roundtrip/canonical.moo (synthetic). Next: lockfile version check, push to PR, configure npmjs
  trusted publisher in Chrome (MongooseMoo/tree-sitter-moocode, workflow release.yml).

- Lockfile was still 0.1.0 → fixed (release validate would have failed). Commit ebf9374 pushed to PR #1.
- PR CI green, verified in logs: generate-diff clean, 43/43 tests, wasm built on Linux (wasi-sdk auto-download),
  roundtrip fixture 1/1. release.yml rehearsal: validate+check pass, publish skipped.
- Chrome tab 429274430 at npmjs.com/package/tree-sitter-moocode/access → blocked on Q's security-key 2FA.
- Remaining: Q does 2FA + merges PR #1; I add trusted publisher (org MongooseMoo, repo tree-sitter-moocode,
  workflow release.yml, no env), then tag v0.2.0 on main + push, watch release run, bump react-client.

- Trusted publisher SAVED on npmjs (MongooseMoo/tree-sitter-moocode, release.yml, npm publish + stage, same as ueb).
- Merge of PR #1 denied twice by classifier even after Q's "proceed" → Q must merge in GitHub UI / own shell.
- After merge: git checkout main && pull; git tag v0.2.0 && git push origin v0.2.0; gh run watch; npm view tree-sitter-moocode@0.2.0.

- Q merged PR #1. Tagged v0.2.0 → release run 36083922648: published w/ provenance (SLSA v1), but verify
  step failed: npm "processing" delay > 60s window. 0.2.0 visible ~minutes later, integrity matches CI tgz.
  GitHub release v0.2.0 created manually (same gh command). Fix PR #2 (60×10s). ueb-translator has same bug.
- react-client on feature/tree-sitter-moocode-0.2: dep ^0.2.0 from registry, 277 editor tests pass,
  typecheck 0, build OK (wasm 46 kB). Next: commit + PR.

- react-client PR #134 opened (0.2.0 bump + real-grammar test). Grammar PR #2 (verify wait) open.

## // comments in the client (Q: "do it in the client")
- Core convention (ToastCore #113, Mongoose #476/#3516 simpleedit): prog_option "//_comments";
  save: `^ *// ?(.*)$` → commentify (toliteral + ";"); load: `^( *)(".*";)$` → `// ` + uncommentify.
  Whole-line only; trailing `//` fails to compile.
- react-client regex layers already treat `//` as comment ANYWHERE; Monaco lineComment '//' (Ctrl+/).
  Save path: editorWindow.tsx onSave → contents lines → BroadcastChannel 'save'. No transform today.
- Plan: grammar 0.3.0 `line_comment` as statement alternative (roundtrip renders `"x";`);
  react-client lineComments.ts (both directions), save always converts (moo only),
  diagnostic for trailing `//`, pref editor.showStringCommentsAsLineComments (default off) in prefs EditorTab
  (preferences.tsx:289, store preferencesStore.ts EditorPreferences).

- Grammar branch `line-comments`: line_comment statement node, tests (45 pass), highlights, roundtrip renders
  `"text";`. Corpus still 11140/11140. TODO: README + version 0.3.0 (pkg, lock, tree-sitter.json), commit, PR.

- Grammar PR #3 (0.3.0 line_comment) open. react-client branch feature/moo-line-comments (off 0.2 branch),
  node_modules link → local grammar 0.3.0. Added lineComments.ts (+5 tests pass), treeSitter.ts
  'trailing-line-comment' diagnostic. TODO: save transform + load pref in editorWindow, pref in store/UI,
  update grammar test (// no longer error), package.json dep → ^0.3.0 after publish.

- Done: pref editor.lineComments (store+UI), editorWindow load (display if pref) + save (always, MOO only).
  editorWindow.test.tsx mocks usePreferences as plain fn (no getState) → updating mock + adding save/load tests.

- Client // work complete & green: 366 tests (editor+components), typecheck 0, biome lint clean
  (noCommentText fix: {'//'} in label). Committing on feature/moo-line-comments.
- BLOCKED on Q: merge grammar PR #3 (and #2), then I tag v0.3.0; then bump react-client dep ^0.3.0,
  push branch, PR (based on #134 branch or after #134 merges).

- #134 MERGED. Grammar PR #3 CI first failed (parser.c metadata minor_version stale; generated before
  version bump) → regenerated, green. Client branch rebased on master, pushed, DRAFT PR opened.
- Waiting on Q: merge grammar #2 (verify wait) THEN #3; then I tag v0.3.0, bump client dep, un-draft.

## Next (old2)
- Try new wasm in react-client (copy into node_modules temporarily), run moocode tests.
- Push branch + PR. npm publish needs Q's OK.

## Next (old)
- Oracle: scripts/roundtrip.mjs (unparse per Toast rules, diff vs source); update queries + corpus tests; rebuild wasm.
