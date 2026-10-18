# MOO built-in variables (LIST/OBJ/... flagged as undefined)

Goal (Q, 2026-10-04): teach tree-sitter-moocode about built-in variables from the
ToastStunt source, publish it from CI, make the client use it, PR both.

## Facts (checked)
- Toast source of truth: `src/sym_table.cc` `new_builtin_names()` + `src/include/sym_table.h` slots.
  Slots 0-15 always: NUM OBJ STR LIST ERR player this caller verb args argstr dobj dobjstr prepstr iobj iobjstr.
  DBV_Float: INT FLOAT. DBV_Map: MAP. DBV_Anon: ANON. DBV_Waif: WAIF. DBV_Bool: BOOL true false.
  Values: `src/eval_env.cc` `fill_in_rt_consts()` (type constants are ints = type codes; NUM == INT).
  Lookup is `strcasecmp` (`find_name`), so names are case-insensitive: `list` IS `LIST`.
- Client: `src/editor/moocode/contract.ts:57` BUILTIN_VARIABLES has only the 11 lowercase names.
  `semantics.ts:135` NON_LOCAL_NAMES built from it (+ true/false/error) -> LIST etc. reported as undefined locals.
  Other users: hover.ts (docs Record keyed by the names), language.ts (467, 585, 1982), semanticTokens.ts:54 (case-sensitive Set).
- Grammar pkg (`~/code/tree-sitter-moocode`, main, clean, 0.3.0 on npm): only knowledge is a
  case-SENSITIVE regex in `queries/highlights.scm`. No data export. No highlight tests.
- Release: `.github/workflows/release.yml` already publishes on `v*` tag via npm trusted publishing
  (same shape as ueb-translator). Tag must equal package.json, package-lock, tree-sitter.json versions; HEAD must be on origin/main.
  v0.3.0 Release run 36273595852 shows failure, but npm 0.3.0 and GH release v0.3.0 exist; ba1695d (wait 10 min for npm) merged after.
- react-client node_modules/tree-sitter-moocode is a real dir (0.3.0), not a symlink.

## Plan
1. Grammar: branch, add builtin-variables data export + case-insensitive highlights + guard test in CI, bump 0.4.0, PR.
2. After merge: tag v0.4.0, watch release.
3. Client: branch, depend ^0.4.0, derive BUILTIN_VARIABLES from the package, tests, PR.

## State (grammar repo, branch `builtin-variables`, uncommitted)
- Added `builtin-variables.json` (24 names, slot/kind/value/since), `scripts/check-builtin-variables.mjs`
  (guard: JSON <-> highlights.scm predicates; `--print` regenerates), `test/highlight/builtin_variables.moo`.
- Found: in tree-sitter highlight queries the LAST matching pattern wins. `(identifier) @variable` was last in
  highlights.scm, so every identifier (functions, properties, builtins) highlighted as plain `variable`.
  Verified by the new highlight test failing with "expected function.builtin, actual variable". Reordered; 30 assertions pass.
- Guard passes, `npx tree-sitter test` passes (45 corpus + highlight).
- TODO: package.json files/exports/test script + 0.4.0 in package.json, package-lock (2 places), tree-sitter.json;
  `tree-sitter generate` (parser.c carries version); README section; CI step for the guard; build wasm; roundtrip; commit; PR.
- DONE 2026-10-04: all of the TODO above committed as 2291806, pushed, PR https://github.com/MongooseMoo/tree-sitter-moocode/pull/4 (0.4.0).
  Local: npm test ok, build:wasm ok, roundtrip ok, pack dry-run includes builtin-variables.json.
- PR #4 CI green. `gh pr merge 4` DENIED by the permission classifier ("Merge Without Review"). Do not retry or route
  around it; Q merges. Tag v0.4.0 + publish therefore not done.
- Client: branch `fix/moo-builtin-variables` (from origin/master) in the main checkout.
  node_modules/tree-sitter-moocode is TEMPORARILY the packed PR branch (scratchpad tgz, `npm install --no-save`), still
  named 0.4.0. package.json/lock still say ^0.3.0. After 0.4.0 is on npm: `npm install tree-sitter-moocode@^0.4.0`
  and commit package.json + lock; until then client CI cannot pass (JSON file missing from 0.3.0).
- Client tests written first (contract, semantics, hover, semanticTokens); 3 fail as expected (35 false undefined refs).
- Client impl TODO: contract.ts derive BUILTIN_VARIABLES from the package JSON (type+context kinds; true/false stay handled
  separately); semanticTokens.ts case-insensitive + skip names after `.` (property); hover.ts docs for the 11 type constants.
- Client impl DONE: commit a44e5fff on `fix/moo-builtin-variables`, pushed, DRAFT PR
  https://github.com/MongooseMoo/react-client/pull/162. Local (against packed grammar): tsc clean, 128 files / 1434 tests pass.
  Monarch tokenizer still matches builtin variables case-sensitively (canonical spelling only); semantic tokens cover other cases.
- BLOCKER: Q must merge tree-sitter-moocode#4. Then (on main, pulled): `git tag v0.4.0 && git push origin v0.4.0`,
  watch Release run, `npm view tree-sitter-moocode@0.4.0 version`. Then in react-client branch:
  `npm install tree-sitter-moocode@^0.4.0`, commit package.json + lock, push, mark #162 ready.
- Grammar repo local checkout is on the merged-pending branch `builtin-variables`; react-client checkout is on `fix/moo-builtin-variables`.
- 2026-10-04 later: Q merged #4 (40e1a17). Tagged v0.4.0, Release run 37250955320 green, npm 0.4.0 + GH release exist.
  Local grammar branch deleted; grammar checkout on main.
- Client: 17dc7170 bumps to ^0.4.0 (registry install, lock updated). PR #162 CI green, marked ready, NOT merged (Q's call;
  `gh pr merge` is blocked for me by the permission classifier).
- (superseded) wait PR #4 CI -> merge -> `git tag v0.4.0 && git push origin v0.4.0` on main -> watch Release run -> `npm view tree-sitter-moocode@0.4.0`.
- Then client: branch, ^0.4.0, derive BUILTIN_VARIABLES from the package JSON.
