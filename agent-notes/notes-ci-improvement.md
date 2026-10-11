CI improvement checkpoint — 2026-09-26
- User requested repository-ci skill, substantive CI improvements, and a PR; no merge requested.
- Isolated worktree C:/Users/Q/code/react-client-ci, branch ci/validated-deploy, based on origin/master 3f090ec; original untracked work preserved.
- Current CI lacks typecheck; independent deployment uses npm install and can publish failing code. Pages uses legacy gh-pages source; preserve that mechanism.
- Plan: consolidated workflow, tested artifact deployment, Node 22, locked install, actionlint/zizmor, SHA pins, Dependabot, timeouts and concurrency. Verified current action release SHAs via GitHub.
- npm ci still running (session 49072). Next implement workflows, validate locally, publish PR and monitor exact-head CI.

CI improvement checkpoint — implementation and local validation
- Five staged files in isolated worktree: consolidated CI/deploy, removed deploy.yml, Dependabot action pin updates, .node-version 22, README.
- actionlint 1.7.12, zizmor 1.30.1 offline/pedantic, typecheck, production browser checks, and staged whitespace check passed.
- First full Vitest run (concurrent build) timed out in output.test.tsx; isolated rerun passed 117 files / 1168 tests but exited 1 for a preferencesStore timer firing after AutoLogService.test.ts teardown. No product/test changes made.
- Current plan: commit and open PR with honest local limitation, then evaluate hosted Linux CI on exact head. Repository has no master branch protection or rulesets; gh-pages is legacy Pages source.
- All action pins verified against release commits. No deployment or merge requested/performed. Original checkout notes/artifacts remain untouched except this checkpoint file.

CI improvement checkpoint — delivered
- PR https://github.com/MongooseMoo/react-client/pull/140 opened, same-repository branch ci/validated-deploy, commit e15be8228ede8461dd1cbc2f95039a6f6693799a.
- Hosted pull_request run 36295601404 passed audits, npm ci, typecheck, all 117 test files, and production Chromium checks; deployment skipped as intended.
- Hosted checkout tested merge f433880 of candidate into base 3f090ec7b85957d09d2c336241f4d10dda242730.
- PR body updated with hosted evidence and local Windows teardown limitation; isolated worktree clean. No application/test source or settings changes.
- Task complete: PR remains open, unmerged; actual production publishing remains unexecuted.
