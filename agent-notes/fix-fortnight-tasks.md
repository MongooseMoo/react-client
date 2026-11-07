# Keep Tasks discoverable and refresh groups after Kill

## Goal

Repair fortnight audit R07/R14 through the existing sidebar and Tasks panel.
An empty first list must leave a way to find later tasks. A successful Kill
must refresh opened groups even if their group keys still exist.

## State

Regressions and owner changes are written in the existing sidebar, panel and
store. The historical task-presence flag has been removed. This branch is
isolated from unrelated client work. Component verification uses the existing
main checkout installation, linked after checking that dependency lock hashes
match. The failed generated install is preserved as `node_modules.incomplete`.
The two new regressions fail with the original owner behavior and pass with the
repair. No global configuration or dependency policy was changed.

## Decisions and why

Use the server's first Client.Tasks.List response to offer the Tasks tab,
including an empty list. Remove the redundant everHadTasks history flag.
Use the panel's existing opened-group references to refresh those groups after
Client.Tasks.Result. Preserve the existing wire contract and periodic refresh.
Do not add task discovery polling or a second task store.

## Surprises

The installed npm forwards persistent allow-scripts policy into Git dependency
preparation as environment policy, then rejects it with EALLOWSCRIPTS. Upstream
npm issue 9783 documents this failure. Installation with scripts disabled also
failed. No global config or dependency policy has been changed. The main
checkout has the same package/lock inputs; sharing its installed dependencies
through a directory junction resolves the worktree's missing dependencies.

## Next step

`npm test -- src/components/sidebar.test.tsx src/components/TasksPanel.test.tsx`
is the explicitly edited test task. Finish its verification and commit this
bounded repair. Publication has not been requested.
