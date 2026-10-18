# Phase 1 client review-fix validation — 2026-10-18

Runtime and browser checks use `b45a69de` on `feat/file-sharing-v2` in
`C:/Users/Q/code/react-client-file-sharing`. The documentation commit adds only
this report, preview evidence and agent notes. Nothing was pushed or deployed.
Node v22.18.0, npm 11.19.1, Windows, Chromium 147.0.7727.15.

## Commits

- `af33ec89` — indexed history retention, compact piece metadata, reservation accounting, shared payload protection, worker fencing and storage regressions.
- `2f219527` — per-listener protocol isolation, future capabilities, recovery retry/lock release, idle v1 receiver restoration and lifecycle regressions.
- `11bc6ba5` — receipt/Outcome recovery, repeatable Save, receive backpressure, per-upload errors, validated reference hub/ICE and transfer regressions.
- `2d79185d` — keep unfinished exports pinned during GC, reserve history capacity before bytes, expire completed handoff history, and test owner lock handoff on storage failure.
- `b45a69de` — keep the audio-cache test's controlled socket open so disconnect/reconnect cannot erase its injected identity.

## Findings and regression coverage

| Review finding | Change and evidence |
| --- | --- |
| P1-1 / probe A | Receipts are bounded at 1024; inactive attempts at 2048. Indexed expiry/LRU cursors and counts replace full-store reads. Cancelled tombstones are pruned by age/count; received slots are reserved before acceptance. Tests cross both old caps and prove admission resumes after handoff-history expiry. |
| P2-1 / probe D | Spec-valid/future feature subsets and 10 GiB remote receive advertisements are accepted without raising Phase 1's local 100 MiB ceiling. Unknown suffixes are dropped/counted. Listener exceptions are isolated; the endpoint flood counter handles diagnostics instead of immediately invalidating authority. Tests cover the real GmcpSession/package boundary and OwnerService's legacy receiver. |
| P2-2 / probe I | Recovery keeps a resolved transition chain and retries storage with capped exponential delays; stop releases election in finally. Owner cleanup releases the storage lock even if close fails. Tests prove a queued tab takes both locks. |
| P2-3 / probe B | Content-scoped receipt references protect every copy after reload. Releasing one copy cannot purge another receipt's bytes. |
| P2-4 | Browser handoff retains payload and Save again for 24 hours. Verified/uncertain exports remain pinned until an explicit handoff; ordinary cache GC cannot erase them. Repeat-save and eight-day GC tests cover both rules. |
| P2-5 / probe G | req/about/offer correlate errors to the sent command. Outcome retries on timeout, rate and busy until acknowledged or the endpoint/grant lifetime ends. A committed receipt never becomes a failed download. |
| P2-6 | One verification promise belongs to the offer. Session loss during verify or receipt commit does not prevent receipt/Outcome completion or start a second verification. |
| P2-7 / probe F | Release removes the unused reservation charge, retains committed bytes, and admission evicts unreferenced partials before rejecting an owner-budget overflow. |
| P2-8 | Superseded/stopped eligible owners restore an idle v1 receiver while parked. Tests preserve parking and show the replacement receiver is attached. |
| P2-9 | The bounded receive queue waits for bucket capacity before processing frames/returning stored credits. A rate pause no longer aborts a healthy transfer. |
| P2-10 | File-read errors are caught per upload. A second concurrent upload completes. |
| Other named gaps | Reference hub parses JSON and validates command/reply schemas, emits rate/busy Error replies, generates ICE candidates and coalesced end markers. Revoke is tested without OfferState/Closed assistance. OwnerService and the actual storage-worker queue/fence handler have tests, including queue overload and cancellation during an in-flight reservation. |
| Probes C/E | Canonical integer spellings are enforced. Piece metadata is a fixed bitset (at most 800 bytes), with no per-piece attempt bitmap rewrite. The reviewer's unchanged E benchmark reports first 1600 puts **76 ms**, next 1600 **68 ms**; this is memory-mode evidence, not an IndexedDB performance claim. |

The database migrates from version 1 to version 2 to add indexes and convert old
bitmap arrays. It still has exactly the six specified stores; no later-phase
content/queue/share stores or OPFS were added. A migration regression preserves
an existing verified receipt and payload.

Retention does not discard unfinished exports to make room. If all 1024 receipt
slots are held by unsaved/uncertain downloads, admission pauses before accepting
bytes; explicit Save turns these into retryable handoffs whose history expires
after 24 hours. This protects outcomes while preventing lifetime-history denial.
Cancelled tombstones retain a 24-hour default with a bounded LRU under count
pressure. Partial cache defaults to seven days, unreferenced verified cache to
24 hours; another receipt/live consumer always protects its content.

## Required commands: raw final results

Full stdout/stderr is retained under `C:/Users/Q/AppData/Local/Temp/` using the
log filenames below. Every final command below exited **0**. Snippets are literal
output selections; the full log contains the remaining output and advisories.

### `npm run typecheck`

Log: `dcpp-fix-typecheck-final.log`.

```text
> mongoose-web-client@0.8.0 typecheck
> tsc --noEmit
EXIT=0
```

### `npm test`

Log: `dcpp-fix-vitest-final.log`.

```text
 Test Files  183 passed (183)
      Tests  2416 passed (2416)
   Start at  05:21:22
   Duration  26.63s (transform 35.40s, setup 90.08s, collect 94.62s, tests 89.62s, environment 369.60s, prepare 73.76s)
EXIT=0
```

### `npm run test:audio-cache`

Log: `dcpp-fix-audio-cache-final.log`.

```text
✓ built in 11.80s
✓ built in 521ms
PASS: real Monaco editing, native input descriptions, marker/filter keyboard navigation and reflow.
PASS: editor chunk failure reloads once, displays fallback and recovers.
PASS: 18 audio chunks and 16 feature chunks excluded from startup and installation; features and reverb loaded on demand and offline in a fresh page.
PASS: soundfont lazy loading, failure/retry, all three collections, real PCM through named effects, chain removal/recreation, Escape/Resume, axe and mobile reflow.
EXIT=0
```

### `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5301 node node_modules/@playwright/test/cli.js test tests/browser/editor-ownership.spec.ts --workers=1 --reporter=line`

Log: `dcpp-fix-editor.log`.

```text
Running 1 test using 1 worker
[1/1] tests\browser\editor-ownership.spec.ts:7:5 › two game sessions and reopened editors keep saves and shutdown with their owner
  1 passed (6.0s)
EXIT=0
```

### `node scripts/check-browser-sessions.mjs`

Log: `dcpp-fix-sessions.log`.

```text
Native Chromium browser-session journey passed: independent tab grants, canonical installation, actual worker push ownership, private notification metadata, cross-tab visitor pause and reload.
EXIT=0
```

### `node scripts/check-client-recovery.mjs`

Log: `dcpp-fix-recovery.log`.

```text
Client recovery passed: visit end/reload/login, rejected unrelated owner, retry selection, resumption without push permission, correlated reconnect recovery and explicit obsolete editor feedback.
EXIT=0
```

### `npm run test:a11y`

Log: `dcpp-fix-a11y.log`.

```text
> mongoose-web-client@0.8.0 test:a11y
> node scripts/check-accessibility.mjs

PASS: native keyboard, stable selection, modal focus, history actions, startup and reflow.
EXIT=0
```

The editor fixture ran against a strict Vite preview:

```text
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5301 --strictPort
PORT_5301_FREE=true
entry=/assets/index-wkeeVz9u.js
localSHA256=9ff396d1dae4d6938d6b674691d3295a2fdd49636be843dd095cb8d43e654ae6
servedSHA256=9ff396d1dae4d6938d6b674691d3295a2fdd49636be843dd095cb8d43e654ae6
matches=true
```

[Preview proof](file-sharing-phase1-fix-preview.json).

### Both file-sharing browser scripts

Dev server: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5206 --strictPort`.
These were rerun after the final source changes.

```text
node scripts/check-file-sharing-phase1.mjs
browser: 147.0.7727.15
Tangra_Guest is carrying nothing
Anadolu_Guest is carrying nothing
0 -> 1: 54 bytes, exact bytes, sender complete
1 -> 0: 54 bytes, exact bytes, sender complete
errors: []
result: PASS
EXIT=0

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
EXIT=0
```

The complete raw JSON results are [v1](file-sharing-phase1-browser.json) and
[v2](file-sharing-phase1-v2-fixture.json). Complete command output is also in
`dcpp-fix-browser-v1-final.log` and `dcpp-fix-browser-v2-final.log`.

### Other workflow/static checks

```text
go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 -color
(no diagnostics)
EXIT=0

pipx run --spec zizmor==1.30.1 zizmor --offline --pedantic .github/workflows
No findings to report. Good job!
EXIT=0

npx playwright install --with-deps chromium
EXIT=0

git diff --quiet 37b5bbca HEAD -- src/fileTransfer
LEGACY_SOURCE_DIFF_EXIT=0

git diff --quiet 37b5bbca HEAD -- src/gmcp/Auth.ts src/gmcp/Char.ts src/stores/personalDataStore.ts src/browserPolicy.ts
LOGIN_SOURCE_DIFF_EXIT=0
```

Commit hooks passed typecheck/staged lint for every implementation commit. The
full change set also passed Biome lint. Actionlint/zizmor/install logs are
`dcpp-fix-actionlint.log`, `dcpp-fix-zizmor.log`, `dcpp-fix-playwright-install.log`.
The flag remains off by default. Disabled package/session dispatch, unchanged
legacy engine selection, advertisement, silent Supports.Get and real bidirectional
v1 receive/send are all covered. Game login source is unchanged.

## Earlier failures and limits

- Initial regression run: 14 failed tests and one unhandled recovery rejection.
  The worker cancellation race and unsaved-GC regression also failed before their
  respective fixes; the raw red logs remain in Temp (`dcpp-regression-red.log`,
  `dcpp-reserve-fence-red.log`, `dcpp-unsaved-retention-red.log`).
- An early full-suite run timed out in the newly added bulk fake-IDB history
  fixture. The lifetime-capacity test now drives the memory backend through the
  public API; separate real fake-IDB saturation, index and migration tests remain.
  Final full-suite result is 183 files / 2416 tests passed.
- The first audio-cache workflow run timed out waiting for Autologs after its
  socket-closing fixture lost the injected identity. Keeping that controlled
  socket open fixed the fixture. The exact production command subsequently passed.
- Build retains the existing Vite CJS/chunk-size advisories; Playwright reports
  the existing NO_COLOR/FORCE_COLOR notice. None of these checks was skipped.
- Production v2 hub/MOO deployment, server parser/rate/legacy-observer acceptance,
  real assistive-technology speech and Safari/Firefox/device journeys are still
  unverified. No production v2 activation, remote CI, push or merge was performed.
- This addresses all P1/P2 findings and the named test gaps. Lower-priority review
  topics still include composite sender/offer in-memory keys, transient ICE
  disconnect grace, the remaining status/live-region UI refinements, stricter
  Peer.Error code separation and origin-quota reconciliation during active writes.
  No claim is made that every P3 item was resolved.
