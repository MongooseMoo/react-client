# chore/node-26

## Goal
Daiverd, 2026-11-13: move the client from Node 22 to Node 26, the LTS line since October 2026. Nothing pinned it to 22 except `.node-version`, which CI reads.

## State
- `.node-version` 22 -> 26. `@types/node` ^20 -> ^26.6.6 (it was two majors behind even 22).
- On Node 26.13 / npm 11.20 (Windows): typecheck clean, 2967/2967 unit tests, `vite build` OK.
- Browser checks (Playwright: audio cache, editor ownership, sessions, recovery, a11y) were not run locally; this PR's CI runs them on Linux.

## Decisions and why
- One test fix, no source change. `src/launch/shareTarget.test.ts` failed on Node 26 only: Node 26's undici `Response.formData()` asserts each file part is its own `File`, and vitest's jsdom environment replaces the global `File` with jsdom's, so the parse threw and the handler answered `failed`. Browsers parse with their own File, so production is unaffected. The share-target describe block now stubs the global `File` with `node:buffer`'s for its tests. It passes 23/23 on both Node 26 and Node 22.
- Tried `@vitest-environment node` for that file first: the shared setup needs `window`, so no.
- npm 11 holds back install scripts not listed in `allowScripts` (here only esbuild's postinstall). The build works without it because esbuild's binary comes from its optional platform package. I left `allowScripts` alone rather than approving scripts project-wide.

## Surprises
- Node 26's npm prints `install-scripts` warnings for esbuild on every install. They're harmless here.

## Next step
CI's browser checks on this PR; then Q's go-ahead (merge = deploy).
