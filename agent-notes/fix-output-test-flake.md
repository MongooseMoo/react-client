# fix/output-test-flake

## Goal
`src/components/output.test.tsx` "Output frozen history resilience > keeps rendering and
saving when the frozen container falls out of sync" takes ~5 s under load, times out, and
the next five tests in the file fail. Fix both: make that test fast, and stop one timed-out
test from breaking later ones. Also check the reported "window is not defined" teardown
error from a preferencesStore timer.

## State
Done and committed on `fix/output-test-flake` (not pushed). Worktree
`C:\Users\Q\code\react-client-output-flake`, base origin/master 03a193ba.

Evidence gathered:
- Baseline: the slow test took 2716 ms unloaded in isolation (1100 ms of it real-time waits).
- Cascade reproduced with a temporary `1000` ms timeout on the old test: the same 5 later
  tests failed, including "expected [] to include 'missed early'".
- Cascade cause confirmed by a probe (since removed): after the timeout, preact's
  `options.debounceRendering` was still act's hijack (`cb => options.__test__drainQueue = cb`)
  at the start of the next describe; without the timeout it was `undefined`.
- New test: 200 ms. With the out-of-sync rebuild disabled in output.tsx it fails with the
  production TypeError (`reading 'removeAttribute'`), so it still guards the bug.
- With a temporary 1 ms timeout the new test still passes and nothing cascades: its body
  never yields to a macrotask, so the vitest timeout cannot fire inside an act scope.
- preferencesStore error reproduced by a temporary probe (removed): a test left a persist
  pending, a later afterAll deleted `window` and waited 400 ms -> unhandled
  `ReferenceError: window is not defined` at `Timeout.flushPendingPreferences
  src/stores/preferencesStore.ts:245:5`, "originated in <probe> test file". After the
  setupTests fix the same probe recorded no errors.
- Verification: output.test.tsx 10/10 runs 36/36 passed; full `npx vitest run` 3/3 runs
  175 files / 2355 tests passed, no unhandled errors; `npx tsc --noEmit` exit 0; biome on
  setupTests.ts clean; on output.test.tsx 2 errors + 19 warnings, identical count on master
  (whole-file import order/format errors, noNonNullAssertion warnings carried over).

## Decisions and why
- Cascade root: the test awaited real `setTimeout(SAVE_DEBOUNCE_MS + 50)` *inside* `act()`.
  preact/test-utils `act` keeps a module-level `actDepth`; the outermost call hijacks
  `options.debounceRendering` until its callback settles. vitest cannot cancel a timed-out
  test body, so the open act scope survives; every later `act` is nested (depth > 1) and
  never flushes renders, so later tests see empty output. Fix: fake setTimeout/clearTimeout
  for the debounce and advance it outside act, so no act scope spans a macrotask. The
  describe's afterEach now calls `vi.useRealTimers()`.
- Speed: the test froze and then rebuilt 1300 rendered lines (renderToStaticMarkup each) to
  get past the 800-line a11y cap. Lowering `Output.A11Y_EXPOSED_FROZEN_LINES` to 20 for the
  test (restored in finally) reaches the same aria-hidden indexing path with 60 frozen lines.
- No other test in src/ awaits a real timer inside act (grepped).
- preferencesStore: fixed in `src/setupTests.ts` with a per-file `afterAll` that dispatches
  `pagehide`, the browser signal the store already flushes on (preferencesStore.ts:267). The
  jsdom teardown never fires it. Not importing the store in setupTests because seven test
  files `vi.mock` it. Other pagehide listeners are component-scoped and already removed by
  RTL's per-test unmount. No product code change: in a browser `window` never disappears.

## Surprises
- vitest 1.6.1 jsdom env keeps Node's setTimeout (`setTimeout` commented out of KEYS in
  node_modules/vitest/dist/vendor/index.GVFv9dZ0.js:339) and teardown deletes `window` from
  the global, so module-level debounce timers outlive the environment.
- When the persist timer fires, `persistTimer` is still set, so `flushPendingPreferences`
  calls `window.clearTimeout` (line 245); that is the line that throws. saveStoredValue
  catches its own errors (src/persistence.ts:59-68).
- The full suite did not show the teardown error in 4 runs here; it needs a long enough gap
  between one file's teardown and the next file's setup (machine load).

## Second flake: test:a11y "filechooser" timeout (commit fe96545d)
`scripts/check-accessibility.mjs` sometimes timed out waiting for "filechooser" after Enter
on "Choose database" (`/?mode=host`, 320px).
- Probe (temporary script, removed) repeated that journey with in-page logging. Unloaded:
  30/30 pass. With CDP `Emulation.setCPUThrottlingRate` 12: 1/15 pass. In every failed run
  the page did its part: keydown Enter on the focused button, trusted click,
  `input.click()` on a connected file input with `navigator.userActivation.isActive` true,
  then the input's click event. So no app race; Chromium never reported a chooser.
- Waiting 30 s instead of 5 s: 0/5, so the event is not late, it never comes.
- Cause: Playwright 1.59.1 enables interception without awaiting it. `page.waitForEvent`
  -> `on()` -> `_updateSubscription` sends `updateSubscription` fire-and-forget
  (node_modules/playwright-core/lib/client/channelOwner.js:53-58); the server then sends
  CDP `Page.setInterceptFileChooserDialog` (server/chromium/crPage.js:818-824). The script
  pressed Enter right after, so on a slow renderer the picker request ran before
  interception was on and took the native headless path (no dialog, no event).
- Controls at 12x throttle: listener registered before goto 15/15 pass; registered just
  before Enter (old script) 0/5; registered just before Enter plus 3 s before pressing 8/8.
- Fix (script only): `page.once('filechooser', ...)` before `page.goto`, then
  `expect.poll(() => chooserOpened).toBe(true)` after Enter (default expect timeout).
- Verification: `npm run build` then `npm run test:a11y` 10 consecutive runs: 10 pass,
  0 fail (machine not deliberately loaded; the throttled probe is the load evidence).
  biome ignores `scripts/` (biome.json includes), so no lint applies to this file.

## Next step
None. Push / PR only if Q asks.
