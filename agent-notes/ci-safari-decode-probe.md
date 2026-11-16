# Safari decode probe (ci/safari-decode-probe)

## Goal

A manually started workflow that measures where Safari's `decodeAudioData` starts the audio of the game's served AAC/m4a files. The sound catalog stores slice and loop times in seconds of those files as ffmpeg decodes them (edit list honoured). If Safari ignores the edit list, slices play 1024 or more samples off; some Safari 27 builds reject such files outright (WebKit bug 320198).

## State

- `.github/workflows/safari-decode-probe.yml`: `workflow_dispatch` only. Safari via safaridriver on `macos-15`, `macos-26` and `xcode-27`; simulator Safari on iOS 26.4 (`macos-26`) and iOS 27.2 (`xcode-27`). Uploads each `result.json` as an artifact.
- What the runners actually had (run 43792147533, 2026-11-15, "Show macOS and Safari versions" and each page's user agent): `macos-15` macOS 15.8.2 with Safari 27.2 (20625.2.8.18.4); `macos-26` macOS 26.7.2 with Safari 27.2 (21625.2.8.18.4); `xcode-27` macOS 27.2 with Safari 27.2 (22625.2.8.11.9). All three desktop pages and the iOS 27.2 simulator report `Version/27.2`; the iOS 26.4 simulator (runtime 26.4.1) reports `Version/26.4`. No job runs Safari 27.0.1: the image readme quoted under Surprises was older than the image the run got.
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
- `xcode-27` is the free standard label for the macOS 27 image; `xcode-27-xlarge` is a paid larger runner and must not be used. There is no `macos-27` label. The image (runner-images `images/macos/xcode-27-arm64-Readme.md`, image version 20261104.0337.1) listed macOS 27.0.1, Safari/SafariDriver 27.0.1 (22625.1.29.11.28) when read on 2026-11-14 (the run of 2026-11-15 got macOS 27.2 and Safari 27.2, see State), and simulator runtimes iOS 27.0, 27.1 and 27.2; "iPhone 17" is installed for 27.0 and 27.2, not 27.1. It is a preview image: outside the Actions SLA, and runs may queue.
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

Second round (2026-11-15, after run 43797802771 measured `passthrough-m4a.tsv`):
- Result of that run, the same on Safari 27.2 (macOS 15.8.2, 26.7.2, 27.2) and simulator Safari 26.4: the 33 `elst0-noroll` and 6 `noelst-noroll-notag` files start 2,112 samples early, the 139 `noelst-noroll` files 1,088 early; the 253 qaac files and the 40 sampled `Lavf57.83.100` files are not trimmed. The iOS 27.2 job failed before the page opened: `xcrun simctl openurl` timed out (code 60) just after boot. (The three tries added then were not enough; see the third round.)
- `make_lists.py` builds list files: run locally with `path<TAB>layout` rows on stdin, it computes the reference rows on the sound host over ssh (read-only there) and writes `PREFIX-NN.tsv` here, each at most 1,500 files and 100 MB. Sized from that run: 471 files took 54 to 72 s on the desktop jobs, so 1,500 fit the 600 s wait several times over.
- The `lavf57-NN.tsv` lists hold all catalogued `Lavf57.83.100` files. They are in a commit of their own and are to be deleted once measured.
- The concurrency group ends in the list name: runs for different lists queue side by side; a second run for the same list still replaces the first. Dispatch once per list.
- `offsets.py`'s `offset` column was wrong in two ways and is corrected: a mark ffmpeg has at the very start reads 0 in a cut file too when the audio starts at once, and Safari's decoder moves single marks on some files without moving the audio. A mark now counts for a value only if ffmpeg has it at or past 2,112 samples, or the value is 0 and ffmpeg has it at least 16 samples in; `offset` is the value at least two such marks share within 2 samples, else empty. Read the per-mark columns and `frames_offset` when it is empty.

Third round (run 43803691466, `lavf57-08.tsv`: 203 files, 99 MB; desktop jobs passed in 78 to 96 s, both simulator jobs failed):
- iOS 26.4: all three `openurl` tries timed out (code 60), each within 11 to 14 s, the last 46 s after boot finished. In the runs where the page did open, Safari's first page request came 82 s (iOS 26.4) and 132 to 195 s (iOS 27.2) after boot finished. So three quick tries end before Safari is up. Other projects report the same (WordPress/gutenberg PR 84640, merged: openurl waits about ten seconds, Safari's first launch took 34 s to 4 min 10 s, and Safari goes on to load the page after openurl gives up). No Apple document found.
- iOS 27.2: the page opened and fetched the list at 04:27:04, then nothing reached the runner until the 600 s wait ended. The page fetched the sound files from the game host and reported nothing in between, so the log cannot say whether it was slow or stuck, nor on which file. Cause not established. (On the 471-file list the simulators were as fast as the desktops: 50 and 63 s.)
- Changed: the page reports each file it starts (`GET /progress?N/TOTAL&path`); `serve.py` logs it and keeps the newest in `progress`; `wait_result.py` waits for the result as long as reports keep coming. The simulator step starts Safari with `simctl launch` first, does not fail on `openurl`, asks again only if the page reported nothing in 240 s (three times at most), and fails if a started page is quiet for 240 s, printing the file it was on. The 20-minute job timeout still bounds everything. The desktop jobs' wait is unchanged.
- Not run: `serve.py`'s progress handling (port 8000 is taken on the development machine) and the changed step; `wait_result.py`'s three exits were run locally.

Fourth round (run 43808738274, `lavf57-05.tsv`, two failed jobs; list 08 had passed on all five in run 43806960029):
- iOS 27.2: the page reported files at about 400 a minute up to file 415 of 1500 (`gamemaster/retro-classic/impacts/retro-impact-hit-03.m4a`, 05:35:44), then nothing; `wait_result.py` failed the step 240 s later. The same list passed on iOS 26.4 and two desktops, so the file decodes elsewhere. Whether the fetch or the decode hung is not known: the page had no time limit on either and Caddy keeps no access log for `/sounds/`. The page now gives the fetch and the decode 60 s each (`within`, error name `ProbeTimeout`, message says which), tries a timed-out file once more, and otherwise records the error as that file's row and goes on. A row that needed the second try carries `attempts`; `offsets.py` prints those paths.
- `macos-15`: `drive_safari.py` line 27, safaridriver's `POST /session`, answered HTTP 500 about 32 s after the driver started. The body, where safaridriver says why, was not printed. It is now printed before the error is raised. Cause not known; one occurrence in 40 desktop jobs so far.

Result of the full measurement (2026-11-16), 29,526 served m4a files that were stored as they arrived:
- Safari trims 178 files and no others: the 33 `elst0-noroll` and 6 `noelst-noroll-notag` rows of `passthrough-m4a.tsv` by 2,112 samples, the 139 `noelst-noroll` rows by 1,088. The same on Safari 27.2 (macOS 15.8.2, 26.7.2, 27.2), simulator Safari 27.2 and simulator Safari 26.4.
- None of the 29,095 `Lavf57.83.100` files is trimmed, and none failed to fetch or decode. On the desktops and the iOS 27.2 simulator no file is more than 34 frames shorter than ffmpeg's decode; the builds' mark columns are identical line for line in every list. Single marks differ from ffmpeg's on about one file in six without the audio moving, so for these files read the length and the marks together.
- Runs: `passthrough-m4a.tsv` 43797802771. `lavf57` lists 01 to 04: 43808723654, 43808727810, 43808731392, 43808734957; 05: 43813908450 (43808738274 had two failed jobs); 06, 07: 43808741408, 43808745176; 08: 43806960029 (43803691466 failed on both simulators); 09 to 15: 43808748795, 43808754307, 43808757666, 43808761125, 43808764447, 43808767779, 43808771649; 16: 43808775325 (iOS 27.2 job lost its simulator service; rerun as 43823106468); 17 to 23: 43808778730, 43808782236, 43808785733, 43808789631, 43808793199, 43808797331, 43808800876.
- The 23 `lavf57-NN.tsv` lists are deleted from the branch now that they are measured. `make_lists.py` rebuilds them from the catalogued files whose encoder tag is `Lavf57.83.100`. The per-list table, the failed jobs and their causes, and the list of the 178 files are in the sound work's report of 2026-11-15 on this measurement (kept with the game's project notes, not in this repository).

Start it (the workflow already exists on master, so a branch can be run before merging): `gh workflow run safari-decode-probe.yml --repo MongooseMoo/react-client --ref <branch> -f list=passthrough-m4a.tsv`. Read each job's "Write each listed file's offset" log (a tally per layout) and download `offsets.tsv` with `gh run download <run-id>`. A list run and a nine-file run on the same ref share the concurrency group: a new one cancels the one in progress.
