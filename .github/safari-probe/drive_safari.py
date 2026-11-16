"""Opens probe.html in Safari through safaridriver (WebDriver over HTTP, stdlib only)
and waits up to 120 s for serve.py to write the result to argv[1]. With a list
file name in argv[2] the page probes that list's files and gets 600 s. CI runner only."""
import json
import pathlib
import subprocess
import sys
import time
import urllib.error
import urllib.request

out = pathlib.Path(sys.argv[1])
listed = sys.argv[2] if len(sys.argv) > 2 else ""
drv = subprocess.Popen(["/usr/bin/safaridriver", "-p", "4444"])
time.sleep(3)


def call(method, path, body=None):
    req = urllib.request.Request(
        "http://127.0.0.1:4444" + path,
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        return json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e:
        # safaridriver puts its reason in the body (run 43808738274: a bare
        # "HTTP Error 500" from POST /session); show it, then fail as before.
        print(method, path, e.code, e.read().decode(errors="replace"))
        raise


sid = call("POST", "/session", {"capabilities": {"alwaysMatch": {"browserName": "safari"}}})["value"]["sessionId"]
page = "http://127.0.0.1:8000/probe.html" + (f"?list={listed}" if listed else "")
call("POST", f"/session/{sid}/url", {"url": page})
deadline = time.time() + (600 if listed else 120)
while not out.exists() and time.time() < deadline:
    time.sleep(1)
call("DELETE", f"/session/{sid}")
drv.terminate()
sys.exit(0 if out.exists() else 1)
