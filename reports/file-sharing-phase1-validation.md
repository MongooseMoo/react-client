# Phase 1 client validation

Specification: `37b5bbca`. Verified runtime:
`e499bfc379386adb66a0875d71113e150bc12db8`, branch `feat/file-sharing-v2`.
No push, hub implementation or deployment was performed.

## Commits and scope

- `cd471842`: default-off packages, strict JSON/schema/frame boundaries,
  endpoint election/recovery, session and worker storage foundations.
- `d22dadc2`: direct consent, multiplexed push/bind/ready/credits/cancellation,
  reconnect and reload partial recovery, durable receipts, explicit accessible
  Save, origin quota reservations, application integration and browser harnesses.
- `e499bfc3`: sample the rollout preference at client creation so a preference
  edit preserves the existing legacy engine; reload applies a changed flag.

`general.fileSharingV2` defaults to false. The disabled client still constructs
the original `FileTransferEngine` and advertises the legacy bundle. Tests cover
the default engine, unchanged transport after a preference edit, and the enabled
bundle's complete Supports.Get response. The game login and reconnect policy
remain owned by the existing client. No later-phase stores/features were added.

## Raw final command results

Full output files are retained in `C:/Users/Q/AppData/Local/Temp/`:
`dcpp-phase1-typecheck-final.log`, `dcpp-phase1-vitest-final.log`,
`dcpp-phase1-lint-final.log`, `dcpp-phase1-build-final.log`.

```text
npx tsc --noEmit
(no diagnostic output)
TYPECHECK_EXIT=0

npx vitest run
Test Files  181 passed (181)
     Tests  2386 passed (2386)
  Start at  04:20:05
  Duration  31.94s (transform 53.80s, setup 122.72s, collect 135.00s, tests 65.30s, environment 408.12s, prepare 110.40s)
VITEST_EXIT=0

$changedFiles = @(git diff --name-only 37b5bbca HEAD -- '*.ts' '*.tsx')
npx biome lint @changedFiles
Checked 37 files in 70ms. No fixes applied.
Found 10 warnings.
Found 3 infos.
LINT_EXIT=0

npm run build
✓ built in 20.10s
✓ built in 1.63s
PWA v1.2.0
mode      injectManifest
format:   es
precache  26 entries (1346.03 KiB)
files generated
  dist/sw.js
BUILD_EXIT=0

git diff --quiet 37b5bbca HEAD -- src/fileTransfer
LEGACY_SOURCE_DIFF_EXIT=0

git diff --quiet 37b5bbca HEAD -- src/gmcp/Auth.ts src/gmcp/Char.ts src/stores/personalDataStore.ts src/browserPolicy.ts
LOGIN_SOURCE_DIFF_EXIT=0
```

The ten lint warnings and three informational findings are in the existing
`telnet.ts` and `telnet.test.ts` code (types, assertions, unused parameters,
optional chaining, const/template suggestions). New fileSharing modules and v2
UI have no lint findings. Build emits the Vite CJS deprecation and chunk-size
advisory; neither check was bypassed. Commit hooks also run typecheck/staged lint.

## Browser results

`npx vite --port 5206 --strictPort`, Chromium `147.0.7727.15`.

`node scripts/check-file-sharing-phase1.mjs`: PASS, exit 0. Separate guest
contexts; each page identified from its OWN `look me` output before selecting a
recipient: `Tangra_Guest is carrying nothing` and
`Anadolu_Guest is carrying nothing`. Both directions downloaded the exact
54-byte payload and reached sender completion; zero page errors. The script
also checks that Peer/Files are absent from Supports while FileTransfer 1 is
present. [Raw JSON](file-sharing-phase1-browser.json).

`node scripts/check-file-sharing-v2-fixture.mjs`: PASS, exit 0. A local reference
hub drives real RTCPeerConnections and dedicated storage workers with native
IndexedDB. Exact 49,159-byte payload, both sides complete, verified receipt
before explicit Save, qualified `browser-download` outcome and zero page
errors. This fixture runs outside live game/v2 registration.
[Raw JSON](file-sharing-phase1-v2-fixture.json).

Early browser-script failures were a display-label mismatch and a strict locator
matching both history and announcer. A real RTC failure exposed duplicate hello
on received channels already open at installation; the runtime guard corrected
it. Early unit tests also exposed the hub-receipt/data-terminal ordering race.
Final successful runs above are separate from those earlier failures.

## Tests and evidence limits

Vitest/jsdom/fake-indexeddb cover strict JSON and Unicode/name/schema bounds,
disabled later frames/features, exact six owner stores/version, fences and
budgets, origin reservations, retained partial adoption after fresh consent,
truncated-piece repair, multi-reference integrity purge, export uncertainty,
exclusive queued lock handoff, superseded parking and Ready/lease recovery.
The reference hub exercises endpoint and request replay, offer consent,
sender reservation, simultaneous opposite/same-content decisions, one pair
session, channel binding/order, zero bytes, scoped cancellation, symmetric
gag revocation, session reconnect, lost receipt recovery and reload partial have.
UI tests cover decision names/IP warning, explicit Save, qualified outcome and
focus recovery. These results do not establish screen-reader speech behavior.

## Unverified acceptance items

Keep v2 off until these applicable architecture gates are completed:

- Actual Phase 1 MOO hub interoperability and every new/new and mixed old/new
  direction through it; authenticated ctx/connection keys, Ready/canShare,
  native parser/raw byte caps, duplicate/case-key handling, authoritative
  expiry/order, server rate/cache/global capacity limits and overloaded output.
- Actual deployed/cached historical v1 builds, differing build strings and
  incompatible historical encodings; the live baseline used two current,
  flag-off clients. Explicit v1 selection is exercised through the reference
  capability contract, not a deployed v2 discovery implementation.
- Live gag and sound-gag changes; exact-address legacy observer cancellation;
  accept/cancel/receipt races and endpoint retirement under the real hub.
- Real same-account tab election/takeover and immediate reconnect/supersession
  races for remembered, visitor and no-Web-Locks browsers. Lock queue and parking
  logic have deterministic tests; real game auto-login across those tabs was
  not exercised with v2 enabled.
- Full application v2 registration/UI journey against that hub, including
  logout, identity/owner/visitor changes, recycled player references, changes
  in receive/quota limits and recovery of an idle v1 receiver during v2 loss.
- Real RTC faults before the first byte/during verification, exhaustive late
  terminal/control/channel races, sustained hostile ingress and all saturation
  combinations. Tests cover the listed bounded representative cases.
- Browser/process kill during an actual external download handoff, real
  QuotaExceededError/eviction, missing/truncated native records under real browser
  failure, long-term GC/retention and storage-owner takeover after a crash.
  Recovery records, quota denial and truncated/corrupt pieces are tested with
  controlled fixtures; actual OS download completion is never claimed.
- Full 100 MiB browser stress, multi-peer throughput/memory instrumentation,
  Firefox/Safari/mobile and physical-device checks, and real screen readers
  (including speech timing/duplicate announcements). No AT speech transcript or
  cross-browser parity is claimed.

Sharing/browse/search/Policy, leaves/ranges/multi-source, OPFS/streamed export,
and multi-GB gates are later phases and deliberately absent, not Phase 1 passes.
The reference hub is not a substitute for testing the real MOO's native parsing,
rate/output/record pressure or legacy observation hooks. No independent reviewer
of this resulting implementation was run.
