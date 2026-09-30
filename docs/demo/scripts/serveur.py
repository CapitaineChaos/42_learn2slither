#!/usr/bin/env python3
"""Serveur statique de la démo.

`python -m http.server` n'envoie aucun en-tête de cache. Le navigateur garde
alors les modules JavaScript quelques minutes sans les redemander, et une page
rechargée peut mêler l'ancien code au nouveau HTML. Ici, chaque réponse porte
`Cache-Control: no-cache`. Le navigateur revalide donc tout à chaque
chargement, et un fichier inchangé ne coûte qu'une réponse 304.

    python3 docs/demo/scripts/serveur.py [PORT]
"""

from __future__ import annotations

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT)))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
