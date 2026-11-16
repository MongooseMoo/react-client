"""Joins a list file's ffmpeg reference numbers with the probe result and writes,
for each listed file, how many samples Safari's decoded audio sits from ffmpeg's
(negative: Safari cut that much from the front). A measurement, not a check:
the offsets do not change the exit status.

Output columns: "offset" is the agreed offset in samples, empty when the marks
that could give one are lost or disagree; then each mark's own offset;
"frames_offset" is Safari's decoded length minus ffmpeg's (ffmpeg does not trim
the tail, so it is evidence of a front cut only where the file names no end
padding).

argv: list.tsv result.json offsets.tsv

List columns: path, rate, bytes, layout, frames, onset_001, onset_01peak,
onset_05peak, peak_index. The last five are ffmpeg's decode with the edit list
honoured, measured as onset.js measures a buffer; '-' means no such onset."""
import collections
import csv
import json
import statistics
import sys

with open(sys.argv[1], newline="") as f:
    expected = {row["path"]: row for row in csv.DictReader(f, delimiter="\t")}
data = json.load(open(sys.argv[2]))
print(data["userAgent"])
MARKS = ["onset_001", "onset_01peak", "onset_05peak", "peak_index"]
PRIMING = 2112


def offset(measured, reference):
    return None if measured is None or reference == "-" else measured - int(reference)


def cell(value):
    return "" if value is None else value


tally = collections.defaultdict(collections.Counter)
with open(sys.argv[3], "w", newline="") as f:
    out = csv.writer(f, delimiter="\t", lineterminator="\n")
    out.writerow(["path", "layout", "expected_onset", "safari_onset", "offset",
                  "offset_onset_001", "offset_onset_01peak", "offset_onset_05peak", "offset_peak",
                  "expected_frames", "safari_frames", "frames_offset",
                  "expected_rate", "safari_rate", "bytes_as_listed", "error"])
    for r in data["results"]:
        e = expected[r["path"]]
        if "error" in r:
            out.writerow([r["path"], e["layout"], e["onset_001"], "", "", "", "", "", "",
                          e["frames"], "", "", e["rate"], "", "", r["error"]])
            tally[e["layout"]]["error"] += 1
            continue
        measured = [r["onset"][0], r["onset"][1], r["onset"][2], r["peakIndex"]]
        four = [offset(m, e[name]) for m, name in zip(measured, MARKS)]
        # A mark inside audio Safari cut from the front is lost and its number
        # means nothing. A cut is at most the AAC priming, so marks ffmpeg has
        # at or past that many samples survive one. They give the offset when
        # they agree; when none qualifies, only "all four are 0" is an offset.
        late = [x for x, name in zip(four, MARKS) if x is not None and int(e[name]) >= PRIMING]
        known = [x for x in four if x is not None]
        agreed = None
        if late and max(late) - min(late) <= 2:
            agreed = statistics.median_low(late)
        elif known and all(abs(x) <= 2 for x in known):
            agreed = 0
        frames_offset = r["length"] - int(e["frames"])
        out.writerow([r["path"], e["layout"], e["onset_001"], cell(r["onset"][0]), cell(agreed),
                      *(cell(x) for x in four), e["frames"], r["length"], frames_offset,
                      e["rate"], r["sampleRate"], "yes" if r["bytes"] == int(e["bytes"]) else "no", ""])
        tally[e["layout"]][f"no agreed offset, frames {frames_offset:+d}" if agreed is None else agreed] += 1

print("files per layout by offset in samples (Safari minus ffmpeg):")
for layout in sorted(tally):
    print(" ", layout, dict(tally[layout].most_common()))
