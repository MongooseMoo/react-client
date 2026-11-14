"""Opens probe.html in Safari through safaridriver (WebDriver over HTTP, stdlib only)
and waits up to 120 s for serve.py to write the result to argv[1]. CI runner only."""
import json
import pathlib
import subprocess
import sys
import time
import urllib.request

out = pathlib.Path(sys.argv[1])
drv = subprocess.Popen(["/usr/bin/safaridriver", "-p", "4444"])
time.sleep(3)


def call(method, path, body=None):
    req = urllib.request.Request(
        "http://127.0.0.1:4444" + path,
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    return json.load(urllib.request.urlopen(req, timeout=120))


sid = call("POST", "/session", {"capabilities": {"alwaysMatch": {"browserName": "safari"}}})["value"]["sessionId"]
call("POST", f"/session/{sid}/url", {"url": "http://127.0.0.1:8000/probe.html"})
deadline = time.time() + 120
while not out.exists() and time.time() < deadline:
    time.sleep(1)
call("DELETE", f"/session/{sid}")
drv.terminate()
sys.exit(0 if out.exists() else 1)
