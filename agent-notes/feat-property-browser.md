# Goal

Implement the approved accessible Properties panel over Object.Properties GMCP, with native per-property authority and typed scalar/list/map editing. Root owns the MOO implementation and publication.

# State

Independent verifier is reviewing the published PR #212 diff, its actual callers and the paired live MOO source. Review evidence belongs in the required review ledger; no test result copies are written here.

Client PR #212 is published from feat/property-browser. Root independently read the protocol, store, panel and recursive value editor, repaired cross-target listing retention and pagination criteria, and updated existing sidebar expectations for the appended tab. Root owns publication and live MOO integration. The paired Object.Properties package is registered live through $gmcp_registry. A disposable browser exercised the real panel against an ordinary live guest, saved its description and restored the original; the connected test is tests/browser/property-browser-live.spec.ts and runs separately from isolated CI.

# Decisions and why

- Append Properties after Photos to preserve existing destinations.
- Keep a transient result/draft store; reset it for connection, identity, sign-out and visitor changes. Do not persist property data.
- Use native tables, disclosures and labeled form controls. Number text stays text on the wire, preserving full-width integers.
- Reject malformed results, correlate requests to the active connection, and preserve drafts on refusal or timeout.
- Opaque/truncated values anywhere in a property disable whole-value replacement. The server remains authoritative for every permission and mutation.
- Native metadata flag editing follows property write admission; owner transfer is wizard-only. The server supplies separate metadataWritable and ownerWritable fields.

# Surprises

The current client retains ordinary input/output across reconnects. Property data must still clear on the package's existing reset lifecycle, rather than changing that unrelated policy.

Dependency setup hit npm's git-dependency propagation error for the existing allow-scripts policy. The worker diagnosed the installed npm source and attempted an empty CLI override with ignore-scripts while preserving the repository allowlist. Check actual installation state before retrying. Do not weaken script policy.

Dependencies are now present. The initial test used change events on text inputs, which do not exercise the Preact input handler; corrected those to input events, consistent with the existing Help panel tests. The select-change event remains a change event.

Browser extension/DevTools access was unavailable and native control refused URL verification for an existing user window. No further input was sent there. The separate program-under-test browser uses an isolated disposable context, not that user window. It covers keyboard entry/save, focus, a narrow viewport, forced colors and an automated panel scan. Actual NVDA speech has not been observed; do not equate browser semantics with a screen-reader transcript.

# Next step

Publish the connected browser test and updated note with the task change, watch the PR's current checks, obtain the required independent verifier verdict and perform the authorized normal merge/deployment. Verify production assets and registered GMCP remain current, then remove the owned worktree/branch. Keep tests, CI, merge, deployment and actual connected acceptance distinct.
