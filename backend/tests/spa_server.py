# -*- coding: utf-8 -*-
"""SPA uchun oddiy static server — barcha yo'llar index.html ga fallback."""
import http.server, os, functools

DIST = r"D:\Projects\TestVix\TestVixNew\frontend\TestVix\dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path):
            self.path = "/index.html"
        return super().send_head()

    def log_message(self, *a):
        pass

os.chdir(DIST)
http.server.ThreadingHTTPServer(("", 5173), Handler).serve_forever()
