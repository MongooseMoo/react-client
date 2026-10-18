# Phase 1 re-review fixes — 2026-10-18

Task: `codex-dcpp-phase1-fix2.md`, against the independent
`claude-phase1-rereview-report.md`. Runtime/spec commit:
`555a505bd7aef84b9f4a7c58f180760d6b2a0120` on `feat/file-sharing-v2`.
The subsequent evidence commit changes only this report, JSON evidence and the
agent note. No push, deployment, production v2 activation or stash.
Node v22.18.0, npm 11.19.1, Windows, Chromium 147.0.7727.15.

## Changes and coverage

| Finding | Resolution / evidence |
| --- | --- |
| N1 | One seven-day deadline for unsaved/uncertain receipt, visible Save/Discard row and payload. This adopts v1's partial-retention default because the original contract was silent about unfinished exports. Browser handoffs keep their 24-hour Save again window. Expiry and Discard remove receipt/export intent/unshared pieces and accounting in one transaction; another visible receipt or live consumer protects shared bytes. Open-panel removal has a status announcement and focus restoration. Tests cover both memory and IndexedDB, both unfinished outcomes, exact expiry, reload, capacity recovery and sibling receipts. |
| N2 | Only rate/busy with retryAfterMs and missing replies retry Outcome. Every other accepted Error code clears the timer and exposes a hub-receipt error, preserving complete/verified/saveable local state. Thirteen parameterized non-retryable-code tests and the existing rate/busy/receipt-loss tests pass. |
| Harness | Every repository test runs an afterEach assertion against all listener exceptions collected by MemoryPort. A deliberate external listener-failure probe fails specifically at that assertion; normal transfers have no captured errors. |
| F2 / N5 | Keep the original consent reservation live until receipt or termination. Session loss may release the attempt writer without releasing this live consumer. The real reconnect test applies nearly 100 MiB of competing storage pressure between attempts, expects refusal rather than eviction, then asserts retained-piece have and successful resume. |
| N6 | Receive queue includes five-byte headers: eight 64-piece windows fit in 8,391,168 bytes. A regression injects all 512 full frames while receive processing is paused. The bounded payload allowance remains 8 MiB. |
| N7 | Repeated storage-recovery passes fence storage without disposing the already-restored v1 engine. A four-failure recovery test checks the same replacement engine survives. |
| N8 | Phase 1 ctl hello rejects unknown/later features and checks the feature subset against the hub's Reserved capabilities. Protocol tests cover both checks. |
| N3 | Architecture specifies native DB version 2 / schemaVersion 2, with an explanation of the development version-1 history-index/bitmap migration. Six stores remain; v1 namespace stays untouched. |
| N4 | Admission error and spec state the 1,024-receipts-per-day limit and explain overlapping 24-hour saved / seven-day unsaved retention, Discard and expiry recovery. |

## Required workflow: final raw results

All required final commands exited **0**. Full stdout/stderr is retained in
`C:/Users/Q/AppData/Local/Temp/` under the filenames listed here. The seven
requested validation steps were run in order, including the production build
performed by `test:audio-cache` before the strict preview/browser checks.

### Installation, workflow tools and browser installation

```text
npm ci --no-audit --no-fund
added 638 packages in 1m
EXIT=0

go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 -color
(no diagnostics)
EXIT=0

pipx run --spec zizmor==1.30.1 zizmor --offline --pedantic .github/workflows
No findings to report. Good job!
EXIT=0

npx playwright install --with-deps chromium
EXIT=0
```

Logs: `dcpp-fix2-install.log`, `dcpp-fix2-actionlint.log`,
`dcpp-fix2-zizmor.log`, `dcpp-fix2-playwright-install.log`.

### 1. `npm run typecheck`

```text
> mongoose-web-client@0.8.0 typecheck
> tsc --noEmit
TYPECHECK_EXIT=0
```

Log: `dcpp-fix2-typecheck.log`. The implementation commit hook also passed
typecheck and staged lint. Full file-sharing/UI/setup lint:

```text
Checked 26 files in 65ms. No fixes applied.
EXIT=0
```

Log: `dcpp-fix2-lint.log`.

### 2. `npm test`

```text
 Test Files  183 passed (183)
      Tests  2439 passed (2439)
   Start at  05:49:42
   Duration  28.48s (transform 49.02s, setup 98.05s, collect 117.59s, tests 86.36s, environment 390.69s, prepare 78.01s)
TEST_EXIT=0
```

Log: `dcpp-fix2-vitest.log`.

### 3. `npm run test:audio-cache`

```text
✓ built in 10.42s
✓ built in 439ms
PASS: real Monaco editing, native input descriptions, marker/filter keyboard navigation and reflow.
PASS: editor chunk failure reloads once, displays fallback and recovers.
PASS: 18 audio chunks and 16 feature chunks excluded from startup and installation; features and reverb loaded on demand and offline in a fresh page.
PASS: soundfont lazy loading, failure/retry, all three collections, real PCM through named effects, chain removal/recreation, Escape/Resume, axe and mobile reflow.
AUDIO_CACHE_EXIT=0
```

Log: `dcpp-fix2-audio-cache.log`.

### 4. Strict preview and editor ownership

```text
PORT_5301_FREE=true
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5301 --strictPort
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5301
node node_modules/@playwright/test/cli.js test tests/browser/editor-ownership.spec.ts --workers=1 --reporter=line
Running 1 test using 1 worker
  1 passed (3.2s)
EDITOR_EXIT=0
```

Served index HTML equals `dist/index.html`. SHA-256 local/served pairs:

```text
/assets/index-BvgRnwIK.js
285db782e18492d31042f200c62713c4f53b396c4b6ba8d89050e29caf46fe01
285db782e18492d31042f200c62713c4f53b396c4b6ba8d89050e29caf46fe01
/assets/ownerService-BlPr-5OI.js
c125e3bfaecb82d1d6c6cb07373f21881e525ba0260fc0ed945fa91aa382f6a3
c125e3bfaecb82d1d6c6cb07373f21881e525ba0260fc0ed945fa91aa382f6a3
/assets/storage.worker-DWKpeDA0.js
42872516131657088ab490caf7c8b59846c901991bbabda8d07ba5aaa31f978b
42872516131657088ab490caf7c8b59846c901991bbabda8d07ba5aaa31f978b
```

Logs: `dcpp-fix2-preview-proof.log`, `dcpp-fix2-editor.log`.
[Machine-readable proof](file-sharing-phase1-fix2-preview.json).

### 5. `node scripts/check-browser-sessions.mjs`

```text
Native Chromium browser-session journey passed: independent tab grants, canonical installation, actual worker push ownership, private notification metadata, cross-tab visitor pause and reload.
SESSIONS_EXIT=0
```

Log: `dcpp-fix2-sessions.log`.

### 6. `node scripts/check-client-recovery.mjs`

```text
Client recovery passed: visit end/reload/login, rejected unrelated owner, retry selection, resumption without push permission, correlated reconnect recovery and explicit obsolete editor feedback.
RECOVERY_EXIT=0
```

Log: `dcpp-fix2-recovery.log`.

### 7. `npm run test:a11y`

```text
> mongoose-web-client@0.8.0 test:a11y
> node scripts/check-accessibility.mjs
PASS: native keyboard, stable selection, modal focus, history actions, startup and reflow.
A11Y_EXIT=0
```

Log: `dcpp-fix2-a11y.log`.

## Both file-sharing browser scripts

Fresh strict dev server on checked-free port 5206:
`node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5206 --strictPort`.

```text
node scripts/check-file-sharing-phase1.mjs
browser: 147.0.7727.15
Tangra_Guest is carrying nothing
Morava_Guest is carrying nothing
0 -> 1: 54 bytes, exact bytes, sender complete
1 -> 0: 54 bytes, exact bytes, sender complete
errors: []
result: PASS
BROWSER_V1_EXIT=0

node scripts/check-file-sharing-v2-fixture.mjs
browser: 147.0.7727.15
bytes: 49159
transport: real RTCPeerConnection
storage: dedicated workers and native IndexedDB
receipt: verified before explicit Save
export: browser-download
sender: complete
receiver: complete
errors: []
result: PASS
BROWSER_V2_EXIT=0
```

Logs: `dcpp-fix2-browser-v1.log`, `dcpp-fix2-browser-v2.log`.
Full JSON: [v1](file-sharing-phase1-fix2-browser.json),
[v2](file-sharing-phase1-fix2-v2-fixture.json).

## Reviewer probes and harness negative proof

The supplied storage2/flow2 probes ran unchanged with their supplied config:

```text
A receipts after: 1024 received: 1
A2 failure after 1024 same-day saved receipts: Error: File history is full (1,024 receipts per day). Discard a received file or wait for retention expiry: 24 hours after Save, seven days if unsaved.
F2 held pieces for the resumed first offer: 0
E: first 1600 puts 57 ms, next 1600 puts 57 ms
G receiver: complete Outcome sends: 2
G2 Outcome sends within ~7.5 s after state errors: 1
H errors captured silently: 1 | normal transfer errors: 0,0,0,0
J UI rows: 1 | stored received receipts: 1 | payload still readable: 7
I hellos after transient storage failures: 5 status: "File transfers unavailable; retrying"
I stop() error: undefined second tab hellos: 1
 Test Files  2 passed (2)
      Tests  13 passed (13)
PROBES_EXIT=0
```

Log: `dcpp-fix2-review-probes.log`. These probes print observations, so their
green status alone is not an acceptance verdict. F2 directly releases its only
storage reference and thus still demonstrates valid eviction of unreferenced
cache. It no longer models an accepted OfferTable receive: that receive now
keeps a second consent reservation live. The real reconnect/pressure regression
tests that lifetime and retained-piece have. H's standalone config has no
repository setup; its deliberate exception remains captured there. With the
repository setup, the same deliberate exception produces this required failure:

```text
AssertionError: file-sharing harness listener errors: expected [ Error: deliberate listener failure ] to deeply equal []
 Test Files  1 failed (1)
      Tests  1 failed (1)
EXPECTED_FAILURE_EXIT=1
```

Log: `dcpp-fix2-harness-proof.log`. This temporary negative fixture is outside
the repository; the normal 2,439-test suite passes with the assertion enabled.

## Scope, earlier fixture failures and remaining acceptance

```text
git diff --quiet 0868ebff HEAD -- src/fileTransfer src/client.ts src/telnet.ts src/gmcp src/createConfiguredClient.ts src/stores
HARD_REQUIREMENT_SOURCE_DIFF_EXIT=0
git diff --quiet 37b5bbca HEAD -- src/fileTransfer src/gmcp/Auth.ts src/gmcp/Char.ts src/stores/personalDataStore.ts src/browserPolicy.ts
LEGACY_LOGIN_BASELINE_DIFF_EXIT=0
```

The flag remains off by default. No login, socket, GMCP dispatch, store or v1
source changed in this follow-up. Flag-off real v1 traffic passed both ways.

The first targeted run had two fixture failures: a retention boundary based on
a later wall-clock read, and an assertion before four storage backoffs had
completed. The first eight-window fixture also attempted too many unbound
channels at once; it now binds each transfer before filling all eight windows.
Those red outputs remain in `dcpp-fix2-targeted.log` and
`dcpp-fix2-targeted-final.log`; the complete final suite above passed. The final
isolated eight-window run is `dcpp-fix2-windows.log` (one passed).

Existing package deprecation, Vite CJS/chunk-size and Playwright color notices
remain non-failing advisories. Production v2 hub/MOO acceptance, real assistive
technology speech, Firefox/Safari and physical-device journeys are unverified.
No remote CI, push, merge or deployment was performed.
