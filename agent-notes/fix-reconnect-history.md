# Reconnect history

## Goal
Investigate and fix history clearing on reconnect; open a draft PR only. No live MUD login, game commands, production changes or deploy.

## State
- Verified local origin and GitHub identity: MongooseMoo/react-client, default master; fetched origin, base faf66a5e.
- Isolated worktree at C:/Users/Q/Documents/Codex/2026-10-20/task-7/react-client, branch fix/reconnect-history. Original checkout's untracked notes/reports preserved.
- Read global AGENTS.md, project CLAUDE.md, output-loss notes and relevant session/output/input source. No project .agents or nested instructions found. Task explicitly authorizes implementation and full validation over older standing restrictions.
- clearForConnect resets output entries and drops owner. Output owner subscription saves previous lines then replaces its buffer from the next owner's storage. Same-owner reconfirmation should restore persisted history; testing queued output and unauthenticated gaps.

## Decisions and why
Smallest expected change: correct output's ownership transition (~10-30 production lines) with regression coverage in the existing personalDataOwnership tests. Keep owner partitioning and logout/visitor clears.

## Surprises
- Git safe.directory required a command-scoped exception for the original checkout (sandbox account differs); no global configuration changed.
- Initial dependencies reused through a local node_modules junction; original sources untouched. Existing dependency installation lacked axe-core, so the junction was removed (only the junction, no recursive delete) and npm ci --ignore-scripts --no-audit --no-fund installed 638 exact dependencies in this worktree. Normal Husky hooks initialized with npm run prepare.

## Root-cause checkpoint
- Regression run on unchanged production source: 3 failed / 3 passed, personalDataOwnership.test.tsx. The missing lines were Last line 0, Visitor history, and Memory-only history.
- clearForConnect discards pending output before it is delivered. Output's owner subscription replaces allLines with loadOutput on each ownership change, making a temporary reconnect depend on successful localStorage writes. Visitor histories are intentionally never persisted, so this deterministically deletes the entire visitor log; unavailable storage does the same for owners. Ordinary successfully persisted owner history does restore after confirmation; no claim that every owner reconnect loses its saved log.
- Regression introduced with ownership partitioning (401bf753, Oct 14): connect clears owner and Output reloads storage. Later reset/launch changes and MIDI revert retain that behavior.
- Minimal fix underway: one bounded owner-keyed memory snapshot during reconnect, restored only for identical confirmed runtime/UUID/reference; explicit logout and visitor transitions invalidate it. Flush output microtask queue before taking the reconnect snapshot. No protocol or persistence changes.

## Validation checkpoint
- Before fix: 3 new regressions failed, 3 existing tests passed (no-cache run).
- After fix: focused 6-file run passed 162 tests; full suite passed 2,748 tests in 191 files (134s). One subsequently added explicit-clear regression passed with the ownership file's full 13 tests.
- npm run typecheck and npm run build passed. Biome lint on all four changed TS/TSX files: exit 0, 17 existing output.tsx warnings, no errors.
- Production browser check-client-recovery.mjs passed repeated forced-quota reconnect, persisted reload, visitor reconnect/privacy, session recovery, and existing cases; all external requests blocked and WebSockets/API intercepted.
- Initial new browser locator incorrectly matched both visible log and live-announcement text; scoped it to .output-line-serverMessage, then browser QA passed.
- Accessibility browser script initially could not load axe-core/axe.min.js from reused dependencies; after clean lockfile install, passed: native keyboard, stable selection, modal focus, history actions, startup and reflow.
- Latest addition: clearLog drops the memory snapshot so an explicit clear during visitor reconnect cannot resurrect deleted text.
- Normal commit hook passed typecheck and staged lint (17 existing warnings, no errors). Draft PR #201: https://github.com/MongooseMoo/react-client/pull/201. Initial head 9362578016635cbe321b6ee52304fe3e26cbd592 passed exact-head CI run 39504951824, including 2,749 tests / 191 files and all production/browser checks; deploy skipped.
- No live game login/commands or production changes. No platform denial.

## Authenticated Clear Log follow-up
- Parent reported an uncovered persisted-owner case at 9362578. Verified with a failing regression: 1 failed / 13 passed; A explicitly cleared log reappeared after reconnect confirmation.
- Cause: during reconnect storageKey is undefined. clearLog discarded the memory snapshot but never removed A's saved archive, so confirmation fell back to that archive. My initial test covered visitors only and missed this persisted-owner path.
- Small fix: include the original storageKey in the one reconnect snapshot; Clear Log removes that specific key and retains an empty snapshot until confirmation. This prevents fallback resurrection while preserving invalidation on logout/different identity and never deriving a key from another owner.
- Regression also verifies B's archive is preserved and A's cleared log stays absent after reload. Focused output/ownership tests passed 50/50; full suite passed 2,750/2,750 in 191 files (129s). Production build passed.
- Production-browser recovery QA passed a held-resume Clear Log click, confirmation and reload, alongside the original reconnect/storage/visitor cases. All requests still use fake/local fixtures.
- Follow-up commit hook passed typecheck and staged lint (17 existing output.tsx warnings, no errors).

## Next step
Commit/push the validated authenticated Clear Log follow-up to the same draft PR #201, then verify exact head CI. Implementation and local validation complete. Keep draft, never merge/deploy.
