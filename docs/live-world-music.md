# Manual world-music acceptance

`scripts/check-world-music.mjs` is an opt-in live gate. It creates fresh ordinary accounts, private rooms and library references, exercises the real MOO/HTTP/browser paths, and cleans up its own fixtures. Wait for the dispatcher to confirm that the reviewed backend is ready before running it. Credentials and private asset bearers must never be copied into logs or files. This gate is not a network-dependent CI test.

By default, the harness copies `dist` (or `BUNDLE_DIST`) to a temporary directory and serves that bundle at the production client origin. Run a fresh production build first. This tests the built client against the real server.

To test the actual deployed production client, set both environment flags in PowerShell:

```powershell
$env:MONGOOSE_LIVE_WORLD_MUSIC_CHECK = '1'
$env:MONGOOSE_WORLD_DEPLOYED_CLIENT = '1'
node scripts/check-world-music.mjs
```

Deployed mode neither copies `dist` nor intercepts site assets. Each fresh browser context loads `https://client.mongoose.world` from the network with service workers blocked. The transparent WebSocket relay still carries actual server bytes; the existing single lost-acknowledgement probe remains intentional. `BUNDLE_DIST` has no effect in deployed mode.

The console identifies `built` or `deployed` mode and reports the running bundle's public `Core.Hello` build revision, derived from `virtual:commit-hash`. If that identifier is absent, it reports `unavailable`; it never substitutes the checkout revision for deployment evidence. Different reported revisions across browser contexts fail the run. Confirm the reported deployed revision against the deployment before claiming acceptance of a particular commit.

Offline checks create no browser connection or fixtures, and do not require either live flag:

```powershell
node --check scripts/check-world-music.mjs
node scripts/check-world-music.mjs --self-test
```

Unset `MONGOOSE_WORLD_DEPLOYED_CLIENT` (or set it to a value other than `1`) to return to the existing built-bundle mode. All authorization gates, fixture cleanup, HTTP integrity checks and secret-handling rules are shared by both modes. Report live outcomes in conversation; do not save copied MOO test results.
