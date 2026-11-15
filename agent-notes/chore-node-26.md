# chore/node-26

## Goal
Daiverd, 2026-11-13: move the client from Node 22 to Node 26, the LTS line since October 2026. Nothing pinned it to 22 except `.node-version`, which CI reads.

## State
- Repair verified, 2026-11-14: Q asked to fix this PR. CI completed the Chromium download under Node 26, then stalled in extraction until cancellation. Updated the manifest floor and the three Playwright lockfile entries from 1.59.1 to 1.60.0.
- Hosted Node.js CI succeeded on Node 26.13.1 / npm 11.20.0: workflow audits, locked installation, typecheck, unit tests, Chromium installation, production build, audio/soundfont caching, editor ownership, browser sessions/recovery, and keyboard accessibility. Evidence: https://github.com/MongooseMoo/react-client/actions/runs/43659354121. Deployment was skipped for this PR, as intended by the workflow.
- `.node-version` 22 -> 26. `@types/node` ^20 -> ^26.6.6 (it was two majors behind even 22).
- On Node 26.13 / npm 11.20 (Windows): typecheck clean, 2967/2967 unit tests, `vite build` OK.
- Browser checks (Playwright: audio cache, editor ownership, sessions, recovery, a11y) were not run locally; this PR's CI runs them on Linux.

## Decisions and why
- Repair plan: raise the Playwright dependency floor to 1.60.0, the first release carrying the upstream extractor fix; update its three locked packages; keep Node 26 and all existing browser checks. Push to the existing PR and verify its hosted CI. Work is isolated in `C:/Users/Q/code/react-client-node-26` to preserve the primary checkout's untracked work.
- Source: https://github.com/microsoft/playwright/pull/40747 fixes the yauzl/fd-slicer stream destruction lifecycle; https://github.com/microsoft/playwright/issues/40998 identifies 1.60.0 as the fixed release. The earlier PR comment claiming a newer Playwright could not fix this is not established by the committed dependency versions.
- Read the published 1.60.0 `playwright-core` tarball directly: `package/lib/coreBundle.js` contains `ReadStream.prototype._destroy`, delegates to `Readable.prototype.destroy`, and calls the destruction callback. This is the upstream lifecycle repair, rather than a Node downgrade or installer bypass.
- One test fix, no source change. `src/launch/shareTarget.test.ts` failed on Node 26 only: Node 26's undici `Response.formData()` asserts each file part is its own `File`, and vitest's jsdom environment replaces the global `File` with jsdom's, so the parse threw and the handler answered `failed`. Browsers parse with their own File, so production is unaffected. The share-target describe block now stubs the global `File` with `node:buffer`'s for its tests. It passes 23/23 on both Node 26 and Node 22.
- Tried `@vitest-environment node` for that file first: the shared setup needs `window`, so no.
- npm 11 holds back install scripts not listed in `allowScripts` (here only esbuild's postinstall). The build works without it because esbuild's binary comes from its optional platform package. I left `allowScripts` alone rather than approving scripts project-wide.

## Surprises
- A local dependency install hit npm's Git-dependency preparation `EALLOWSCRIPTS` error, documented at https://github.com/npm/cli/issues/9783. No local test suite was run; the existing hosted workflow owns validation. The published package was inspected directly without needing local installation.
- Node 26's npm prints `install-scripts` warnings for esbuild on every install. They're harmless here.

## Next step
Finish the final note update's hosted checks and take PR #232 out of draft. The original note's merge/deployment hold remains pending Q's go-ahead.
