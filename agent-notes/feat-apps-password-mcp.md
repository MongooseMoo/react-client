# Apps tab: Password message, Claude Code password, ?approve= links

## Goal

Q, via the handoff from claude180 (in-MOO agent): finish the Apps tab work locally and PR it. Client.Apps message `Drive` is renamed `Password` (Q: "we own the stack and we prefer beauty"); new `mcp` app with a "Claude Code" section showing the `claude mcp add` command; `?approve=<code>` launch parameter fills the Apps tab's code without approving it.

## State

claude180's uncommitted diff in `mongoose@mongoose.world:~/agent-workspace/react-client` (on master df035b0e) was applied here by hand with the editing tool. Added: `launchHandling.test.ts` "app sign-in codes" tests (code held and trimmed, Apps tab asked for, nothing sent; empty code ignored; `approve` removed from the page URL). Only other old message-name use was `agent-notes/feat-apps-mqtt-key.md`, given a pointer line. "drive" stays as the WebDAV app name.

The MOO side (`$gmcp_apps`) is renamed at the same time by claude180; the client and MOO must ship together, since neither accepts the other's old name.

## Surprises

- `npm ci` in this worktree fails: "git dep preparation failed ... EALLOWSCRIPTS --allow-scripts is not allowed in project-scoped installs". Typecheck, lint and vitest were therefore not run locally; CI on the PR is the check.
- PR #230's first CI run: typecheck and `npm test` passed; "Install browser" failed with "Playwright does not support chromium on ubuntu26.04-x64" (ubuntu-latest is migrating to 26.04; microsoft/playwright#40117 open). The test job is pinned to `ubuntu-24.04` in `build-test.yml`.

## Decisions and why

- No compatibility for `Client.Apps.Drive`: we own both ends (memory: no protocol versions).

## Next step

Type check, lint, vitest; PR; CI; merge; deploy with the MOO rename.
