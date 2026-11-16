"""Waits for the page's result while the page keeps reporting progress.

argv: result file, progress file (written by serve.py), seconds without news
Exit 0: the result exists.
Exit 2: the page never reported a file in that many seconds (it did not open).
Exit 1: the page started and then reported nothing for that many seconds; the
        last report, which names the file it was on, is printed.
The job's timeout bounds a page that keeps reporting but never finishes."""
import pathlib
import sys
import time

result, progress, patience = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), float(sys.argv[3])
last_news = time.time()
while not result.exists():
    if progress.exists():
        last_news = max(last_news, progress.stat().st_mtime)
    if time.time() - last_news > patience:
        if progress.exists():
            print(f"no progress for {patience:.0f} s; last report: {progress.read_text()}")
            sys.exit(1)
        print(f"the page reported nothing in {patience:.0f} s")
        sys.exit(2)
    time.sleep(1)
