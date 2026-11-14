# Safari decode probe (ci/safari-decode-probe)

## Goal

A manually started workflow that measures where Safari's `decodeAudioData` starts the audio of the game's served AAC/m4a files. The sound catalog stores slice and loop times in seconds of those files as ffmpeg decodes them (edit list honoured). If Safari ignores the edit list, slices play 1024 or more samples off; some Safari 27 builds reject such files outright (WebKit bug 320198).

## State

- `.github/workflows/safari-decode-probe.yml`: `workflow_dispatch` only. Safari via safaridriver on `macos-15`, `macos-26`, `xcode-27`; simulator Safari on iOS 26.4 (`macos-26`) and iOS 27.2 (`xcode-27`). Uploads each `result.json` as an artifact.
- `.github/safari-probe/`: `probe.html` (fetches nine files from `https://mongoose.world/sounds/`, decodes each at its own rate in an `OfflineAudioContext`), `onset.js` (onset detection), `serve.py` (serves the page, writes the POSTed result), `drive_safari.py` (WebDriver over HTTP), `check.py` (classifies each file's onset offset; exits 1 unless every file honours the edit list).
- `node --test .github/safari-probe/onset_check.js` passes locally. Nothing else has run: no Safari, simulator or workflow run yet.

## Decisions and why

- Standard runner labels only: free for public repositories (GitHub docs, "Standard GitHub-hosted runners for public repositories").
- Actions pinned to the same SHAs as `build-test.yml`, `persist-credentials: false`, matrix values passed through `env:`, a `concurrency` group with cancel-in-progress: the PR CI runs actionlint and `zizmor --pedantic` over every workflow.
- Onset detection is a plain function in `onset.js` so it can be tested with Node on synthetic arrays; its test file is `*_check.js` so the client's vitest does not collect it.
- A file that fails to decode is a result: its error name and message are recorded and reported by `check.py`.
- `check.py` accepts a file when outcome A is among its matches: with edit-list media time 0, outcome B equals A.
- `probe.html` rejects a non-OK HTTP response before decoding, so a missing file is not reported as an EncodingError.

## Surprises

- actionlint v1.7.12 does not know the `xcode-27` label (preview image) and fails on it, matrix values included. Open decision: declare the label in `.github/actionlint.yaml`, or drop the two `xcode-27` jobs. Until then the PR's lint step goes red.
- A `workflow_dispatch` workflow can only be started once its file exists on the default branch (GitHub docs, "Events that trigger workflows", `workflow_dispatch`). It cannot be run from this branch before it is merged.

## Next step

Decide the `xcode-27` question, push, open the PR, merge it. Then start the workflow from the Actions tab ("Safari decode probe", Run workflow) or `gh workflow run safari-decode-probe.yml --ref master`, and read each job's "Classify the onsets" log and its `result.json` artifact. Fix ordinary CI failures (runtime identifier strings, first-run prompts, simulator networking) from the logs.
