#!/usr/bin/env python3
"""Lightweight SPA static server. Serves files from dist/, falls back to index.html for Vue Router history mode."""
import http.server
import os
import sys

DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST, **kwargs)

    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or (os.path.isdir(path) and not os.path.exists(os.path.join(path, "index.html"))):
            self.path = "/index.html"
        return super().do_GET()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = http.server.HTTPServer(("0.0.0.0", port), SPAHandler)
    print(f"Serving SPA from {DIST} on http://0.0.0.0:{port}")
    server.serve_forever()
