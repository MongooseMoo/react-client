# Goal

Implement the approved accessible Properties panel over Object.Properties GMCP, with native per-property authority and typed scalar/list/map editing. Root owns the MOO implementation and publication.

# State

Client source and focused journey tests are written on feat/property-browser. Root has independently read the protocol, store, panel and recursive value editor. Focused journey tests run with the completed source. Root owns publication and live MOO integration. The worker hit model capacity after writing source; root continues the task. The paired Object.Properties package is now registered live through $gmcp_registry.

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

# Next step

Commit through existing hooks, publish the client PR and watch required CI to completion. Complete independent review, wire/connected keyboard and screen-reader acceptance and the authorized merge/deployment. Keep tests, CI, merge, deployment and actual connected acceptance distinct.
