"""Builds list files for the workflow's "list" input, with ffmpeg's reference numbers.

Run here:  python make_lists.py HOST ROOT REMOTE_PYTHON PREFIX < files
  HOST           ssh destination of the machine holding the served sound tree
  ROOT           the tree there (what https://mongoose.world/sounds/ serves)
  REMOTE_PYTHON  a Python there with numpy; ffmpeg and ffprobe must be on its PATH
  PREFIX         lists are written beside this file as PREFIX-01.tsv, PREFIX-02.tsv, ...
  stdin          one file per line: path under ROOT, a tab, its layout label

The files are only read on HOST. Each is decoded there with the edit list
honoured (`ffmpeg -v error -i FILE -vn -f f32le -`) and measured as onset.js
measures a decoded buffer. A list holds at most MAX_FILES files and MAX_BYTES
of audio, so one job's page finishes inside the wait drive_safari.py gives it."""
import json
import pathlib
import subprocess
import sys

MAX_FILES = 1500
MAX_BYTES = 100_000_000
HEADER = "path\trate\tbytes\tlayout\tframes\tonset_001\tonset_01peak\tonset_05peak\tpeak_index\n"

# Runs on HOST. FILES_JSON is replaced by the stdin rows before it is sent.
REMOTE = r'''
import concurrent.futures, json, os, subprocess, sys
import numpy as np

ROOT = os.path.expanduser(sys.argv[1])
FILES = json.loads(FILES_JSON)


def row(item):
    rel, layout = item
    path = os.path.join(ROOT, rel)
    stream = json.loads(subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate,channels",
         "-of", "json", path], capture_output=True, check=True).stdout)["streams"][0]
    rate, channels = int(stream["sample_rate"]), int(stream["channels"])
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    samples = np.frombuffer(raw, dtype="<f4")
    frames = len(samples) // channels
    loudest = np.abs(samples[:frames * channels].reshape(frames, channels)).max(axis=1)
    peak = float(loudest.max())
    as_double = loudest.astype(np.float64)

    def first(threshold):
        above = np.flatnonzero(as_double > threshold)
        return int(above[0]) if len(above) else "-"
    peak_index = int(np.argmax(loudest)) if peak > 0 else "-"
    return "\t".join(str(x) for x in (rel, rate, os.path.getsize(path), layout, frames,
                                      first(0.01), first(0.1 * peak), first(0.5 * peak), peak_index))


with concurrent.futures.ThreadPoolExecutor(3) as pool:
    for line in pool.map(row, FILES):
        print(line, flush=True)
'''

host, root, remote_python, prefix = sys.argv[1:5]
files = [line.rstrip("\n").split("\t") for line in sys.stdin if line.strip()]
remote = subprocess.Popen(
    ["ssh", "-o", "BatchMode=yes", host, f"nice -n 19 {remote_python} - {root}"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE,
    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
remote.stdin.write(REMOTE.replace("FILES_JSON", json.dumps(json.dumps(files))).encode())
remote.stdin.close()

here = pathlib.Path(__file__).parent
number = count = size = total = 0
out = None
for line in remote.stdout:
    line = line.decode()
    file_bytes = int(line.split("\t")[2])
    if out is None or count == MAX_FILES or size + file_bytes > MAX_BYTES:
        if out is not None:
            out.close()
        number += 1
        count = size = 0
        out = open(here / f"{prefix}-{number:02d}.tsv", "w", encoding="utf-8", newline="\n")
        out.write(HEADER)
    out.write(line)
    count += 1
    size += file_bytes
    total += 1
    if total % 1000 == 0:
        print(f"{total} of {len(files)}", file=sys.stderr, flush=True)
if out is not None:
    out.close()
status = remote.wait()
print(f"{total} of {len(files)} files in {number} lists; ssh exit {status}", file=sys.stderr)
sys.exit(0 if status == 0 and total == len(files) else 1)
