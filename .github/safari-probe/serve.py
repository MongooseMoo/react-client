"""Serves probe.html on 127.0.0.1:8000, writes the POSTed result to argv[1] and the
page's newest progress report to "progress" beside it. CI runner only."""
import http.server
import pathlib
import sys

OUT = pathlib.Path(sys.argv[1])
ROOT = pathlib.Path(__file__).parent


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def do_GET(self):
        # The page reports each file it starts; the newest report is kept
        # beside the result for wait_result.py.
        if self.path.startswith("/progress?"):
            OUT.with_name("progress").write_text(self.path)
            self.send_response(204)
            self.end_headers()
        else:
            super().do_GET()

    def do_POST(self):
        body = self.rfile.read(int(self.headers["Content-Length"]))
        OUT.write_bytes(body)
        self.send_response(204)
        self.end_headers()


http.server.ThreadingHTTPServer(("127.0.0.1", 8000), H).serve_forever()
