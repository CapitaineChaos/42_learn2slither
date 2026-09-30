#!/usr/bin/env python3
"""Contrôle des figures de la démo dans un navigateur.

Le script sert le dossier, ouvre la page avec chaque méthode, parcourt les
étapes, agrandit chaque figure et échoue si la console rapporte une erreur ou
si une figure ne s'agrandit pas.

    pip install playwright        # hors requirements.txt : lourd, et inutile
                                  # pour se servir de la démo
    python3 docs/demo/scripts/verifie_figures.py [--images DOSSIER]
"""

from __future__ import annotations

import argparse
import http.server
import socket
import socketserver
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parents[1]
PLOTS = ["plateau", "vision", "valeurs", "politique", "longueur", "exploration", "evaluation"]
METHODS = ["table", "network"]


def serve(directory: Path) -> tuple[str, socketserver.TCPServer]:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)

        def log_message(self, *args):
            pass

    httpd = socketserver.TCPServer(("127.0.0.1", port), Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{port}", httpd


def check(page, method: str, faults: list[str], images: Path | None) -> None:
    page.check(f'input[name=method][value={method}]', force=True)
    page.click("#start")
    page.wait_for_timeout(2000)
    steps = int(page.locator("#step-max").inner_text())
    for index in range(steps):
        page.evaluate(f"import('./src/navigation.js').then((m) => m.goto({index}))")
        page.wait_for_timeout(250)
        if page.locator("#formula .katex-error, #more .katex-error").count():
            faults.append(f"{method}, étape {index + 1} : formule en erreur")
    page.locator('.node[aria-label^="Vision,"]').click()
    page.wait_for_timeout(500)
    for key in PLOTS:
        page.locator(f'[data-plot="{key}"]').click()
        if page.locator(".plots.zoomed").count() == 0:
            page.wait_for_timeout(300)
            page.locator(f'[data-plot="{key}"]').click()
        page.wait_for_timeout(400)
        if page.locator(f'.plots.zoomed [data-plot="{key}"].active').count() == 0:
            faults.append(f"{method}, {key} : la figure ne s'agrandit pas")
        if images:
            images.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(images / f"{method}-{key}.png"))
        page.locator("#plots-close").click()
        page.wait_for_timeout(200)


def check_test(page, method: str, faults: list[str], images: Path | None) -> None:
    page.click("#test-open")
    page.wait_for_timeout(1500)
    if not page.locator("#test").is_visible() or page.locator("#plots").is_visible():
        faults.append(f"{method}, test : le panneau ne remplace pas les figures")
    if page.locator("#test-readout div").count() != 7:
        faults.append(f"{method}, test : mesures absentes")
    page.fill("#test-speed", "60")
    page.dispatch_event("#test-speed", "input")
    page.wait_for_timeout(6000)
    if images:
        page.screenshot(path=str(images / f"{method}-test.png"))
    page.fill("#test-level", "0")
    page.dispatch_event("#test-level", "input")
    page.wait_for_timeout(300)
    if "après 0 session" not in (page.locator("#test-canvas").get_attribute("aria-label") or ""):
        faults.append(f"{method}, test : le niveau 0 n'est pas joué")
    page.wait_for_timeout(4000)
    if page.locator("#test-log tbody tr").count() < 2:
        faults.append(f"{method}, test : parties finies absentes du journal")
    page.click("#test-new")
    page.wait_for_timeout(300)
    page.evaluate("import('./src/navigation.js').then((m) => m.goto(0))")
    page.wait_for_timeout(300)
    page.locator("#lead [data-term]").first.click()
    page.wait_for_timeout(300)
    if page.locator("#test").is_visible() or not page.locator("#wiki").is_visible():
        faults.append(f"{method}, test : le wiki ne remplace pas le test")
    page.click("#wiki-close")
    page.wait_for_timeout(200)
    if not page.locator("#plots").is_visible():
        faults.append(f"{method}, test : les figures ne reviennent pas")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", type=Path, help="dossier où déposer les captures")
    options = parser.parse_args()

    base, httpd = serve(HERE)
    faults: list[str] = []

    with sync_playwright() as play:
        browser = play.chromium.launch(channel="chrome", args=["--no-sandbox"])
        for method in METHODS:
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            page.on("pageerror", lambda error: faults.append(f"exception : {error}"))
            page.on("console", lambda message: faults.append(f"console : {message.text}")
                    if message.type == "error" and "Failed to load resource" not in message.text else None)
            page.on("response", lambda answer: faults.append(f"réseau : {answer.status} {answer.url}")
                    if answer.status >= 400 and not answer.url.endswith("favicon.ico") else None)
            page.goto(f"{base}/index.html", wait_until="load")
            page.wait_for_selector("#start:not([disabled])", timeout=60000)
            check(page, method, faults, options.images)
            check_test(page, method, faults, options.images)
            page.close()
        browser.close()

    httpd.shutdown()
    for line in faults:
        print("ÉCHEC", line, file=sys.stderr)
    print("aucun défaut" if not faults else f"{len(faults)} défaut{'s' if len(faults) > 1 else ''}")
    return 1 if faults else 0


if __name__ == "__main__":
    raise SystemExit(main())
