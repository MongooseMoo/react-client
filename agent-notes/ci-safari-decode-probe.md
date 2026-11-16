# Safari decode probe (ci/safari-decode-probe)

## Goal

A manually started workflow that measures where Safari's `decodeAudioData` starts the audio of the game's served AAC/m4a files. The sound catalog stores slice and loop times in seconds of those files as ffmpeg decodes them (edit list honoured). If Safari ignores the edit list, slices play 1024 or more samples off; some Safari 27 builds reject such files outright (WebKit bug 320198).

## State

- `.github/workflows/safari-decode-probe.yml`: `workflow_dispatch` only. Safari via safaridriver on `macos-15`, `macos-26` and `xcode-27` (macOS 27.0.1, Safari 27.0.1); simulator Safari on iOS 26.4 (`macos-26`) and iOS 27.2 (`xcode-27`). Uploads each `result.json` as an artifact.
- `.github/actionlint.yaml` declares the `xcode-27` label so actionlint v1.7.12 accepts it (added with the owner's approval on 2026-11-14). The `xcode-27` jobs, removed earlier for that lint failure, are restored.
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

- actionlint v1.7.12, run by `build-test.yml`, does not know the `xcode-27` label (preview image) and fails on it, matrix values included. No actionlint release or its `main` knows the label (upstream issue 739 and PR 744 are open). The two `xcode-27` jobs were first removed so the lint check passed unchanged; the owner then approved declaring the label in `.github/actionlint.yaml` (2026-11-14), and the jobs are back. That file makes actionlint accept `xcode-27` in any workflow and nothing else. Not yet run: actionlint with this file (it runs on the PR).
- `xcode-27` is the free standard label for the macOS 27 image; `xcode-27-xlarge` is a paid larger runner and must not be used. There is no `macos-27` label. The image (runner-images `images/macos/xcode-27-arm64-Readme.md`, image version 20261104.0337.1) has macOS 27.0.1, Safari/SafariDriver 27.0.1 (22625.1.29.11.28), and simulator runtimes iOS 27.0, 27.1 and 27.2; "iPhone 17" is installed for 27.0 and 27.2, not 27.1. It is a preview image: outside the Actions SLA, and runs may queue.
- Not confirmed by a run: that the 27.2 runtime's identifier is `com.apple.CoreSimulator.SimRuntime.iOS-27-2` (built from the matrix value the same way as `iOS-26-4`). The job's "List simulator runtimes" step prints the real identifiers.
- A `workflow_dispatch` workflow can only be started once its file exists on the default branch (GitHub docs, "Events that trigger workflows", `workflow_dispatch`). It cannot be run from this branch before it is merged.

## Next step

Push, open the PR, merge it. Then start the workflow from the Actions tab ("Safari decode probe", Run workflow) or `gh workflow run safari-decode-probe.yml --ref master`, and read each job's "Classify the onsets" log and its `result.json` artifact. Fix ordinary CI failures (runtime identifier strings, first-run prompts, simulator networking) from the logs.

## Measuring a list of files (branch ci/safari-probe-passthrough-m4a, 2026-11-15)

Goal: measure every served m4a that was stored as it arrived, so only the ones Safari starts early get re-encoded. The nine-file run found one such file starting 2,112 samples early.

State:
- The workflow takes an optional `list` input: a file name in `.github/safari-probe/`. Empty (the default) runs the nine-file check exactly as before. With a list, `probe.html?list=NAME` probes the list's files one at a time, `check.py` is skipped, and `offsets.py` writes `offsets.tsv`, uploaded beside `result.json`. A list run never fails on an offset; it fails only if no result arrives.
- `passthrough-m4a.tsv`: 471 files. All 431 catalogued m4a with no `roll` sample group (33 with edit list 0, 139 with no edit list, 253 qaac files with iTunSMPB, 6 untagged `mp42` files) and a seeded sample of 40 of the 29,095 files written in 2020 by `Lavf57.83.100` (edit list 1024 plus roll group; none measured before). Columns: path, rate, bytes, layout, then ffmpeg's decode with the edit list honoured: frames, the three onsets and the peak's index, measured as `onset.js` measures. 7.3 MB in all.
- `onset.js` also returns `peakIndex`; the nine-file check does not read it.
- `offsets.tsv` per file: `offset` (samples, Safari minus ffmpeg; negative means Safari cut the front), each mark's own offset, `frames_offset`, rates, whether the byte count is as listed, and a decode error if any.
- Run locally: `node --test .github/safari-probe/onset_check.js` (5 pass) and `offsets.py` on a made-up result. Not run: the workflow, actionlint, zizmor.

Decisions and why:
- A mark that lies inside audio Safari cut is lost, and 316 of the 471 files have their peak in the first 2,112 samples. So `offset` is filled only from marks ffmpeg has at or past 2,112 samples when they agree within 2, or as 0 when all four marks are within 2 of ffmpeg's. Otherwise it is empty and `frames_offset` is the evidence: the one file measured early had exactly 2,112 fewer frames.
- With a list the page gets 600 s instead of 120 s (`drive_safari.py`) or 180 s (simulator loop). The job timeouts are unchanged.
- The list is data: another list with the same columns can be measured without a code change.

Start it (the workflow already exists on master, so a branch can be run before merging): `gh workflow run safari-decode-probe.yml --repo MongooseMoo/react-client --ref <branch> -f list=passthrough-m4a.tsv`. Read each job's "Write each listed file's offset" log (a tally per layout) and download `offsets.tsv` with `gh run download <run-id>`. A list run and a nine-file run on the same ref share the concurrency group: a new one cancels the one in progress.
