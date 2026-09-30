#!/usr/bin/env python3
"""Contrôle WCAG des couleurs de l'atelier.

Les paires à vérifier sont déclarées ici. Une couleur n'a de contraste que
relativement au fond sur lequel elle est posée, et ce fond n'est pas déductible
de la feuille de style seule.

Le texte de l'interface vise le seuil AAA de 7.0, sauf l'étiquette d'un bouton
plein. Les couleurs de données et les avertissements tiennent 4.5, les éléments
graphiques 3.0. Les filets décoratifs et la grille des figures portent un seuil
plus bas, indiqué dans la table. Chaque paire est contrôlée dans les deux
thèmes : le bloc :root, clair, et le bloc :root[data-theme='dark'].
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

CSS = Path(__file__).resolve().parents[1] / "css" / "tokens.css"

# (jeton, jeton de fond, seuil, description)
CHECKS = [
    ("--ink", "--surface", 7.0, "texte du cours"),
    ("--ink", "--sunk", 7.0, "texte sur zone creusée"),
    ("--ink", "--ground", 7.0, "texte sur le fond de page"),
    ("--ink", "--raised", 7.0, "texte sur zone surélevée"),
    ("--ink-soft", "--surface", 7.0, "texte secondaire"),
    ("--ink-soft", "--sunk", 7.0, "légende de figure"),
    ("--ink-faint", "--surface", 7.0, "libellés de commande"),
    ("--ink-faint", "--sunk", 7.0, "graduations d'axe"),
    ("--ink-faint", "--raised", 7.0, "libellés sur zone surélevée"),
    ("--ink-faint", "--ground", 7.0, "libellés sur le fond de page"),
    ("--on-bar", "--bar", 7.0, "texte sur barre pleine, bulle de symbole"),
    ("--accent-text", "--surface", 7.0, "étape courante, commandes d'itération"),
    ("--accent-text", "--ground", 7.0, "parcours sur le fond de page"),
    ("--accent-text", "--sunk", 7.0, "valeur d'atelier"),
    ("--accent-text", "--raised", 7.0, "frise, passage courant"),
    ("--accent-text", "--accent-soft", 7.0, "calcul déroulé, élève sélectionné"),
    ("--ink", "--accent-soft", 7.0, "texte sur nœud franchi, itération courante"),
    ("--on-accent", "--accent", 4.5, "étiquette de bouton plein, nœud courant"),
    ("--on-accent", "--hot", 4.5, "étiquette de bouton plein, fin du dégradé"),
    ("--hot", "--ground", 3.0, "flèche active du parcours"),
    ("--accent", "--surface", 3.0, "nœud courant, poignée, liseré"),
    ("--accent", "--ground", 3.0, "flèche active du parcours"),
    ("--alert", "--surface", 4.5, "erreurs et avertissements"),
    ("--alert", "--sunk", 4.5, "erreurs sur zone creusée"),
    ("--alert", "--accent-soft", 4.5, "erreur sur l'élève sélectionné"),
    ("--snake", "--sunk", 3.0, "serpent sur le plateau"),
    ("--snake-head", "--sunk", 3.0, "tête du serpent"),
    ("--apple-green", "--sunk", 3.0, "pomme verte"),
    ("--apple-red", "--sunk", 3.0, "pomme rouge"),
    ("--apple-green", "--sunk", 4.5, "lettre G de la vision"),
    ("--apple-red", "--sunk", 4.5, "lettre R de la vision"),
    ("--snake", "--sunk", 4.5, "lettre S de la vision"),
    ("--wall", "--sunk", 3.0, "mur du plateau"),
    ("--trace", "--surface", 3.0, "tracé de la descente"),
    ("--edge", "--surface", 3.0, "bord d'une commande"),
    ("--edge", "--ground", 3.0, "nœud du parcours"),
    ("--line", "--surface", 1.2, "filet de séparation"),
    ("--grid", "--surface", 1.1, "grille de figure"),
]


THEMES = [("clair", r":root"), ("sombre", r":root\[data-theme='dark'\]")]


def parse_tokens(text: str, selector: str) -> dict[str, str]:
    match = re.search(selector + r"\s*\{(.*?)\n\}", text, re.S)
    if not match:
        raise SystemExit(f"bloc {selector} introuvable dans {CSS.name}")
    return {token: value.strip() for token, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", match.group(1))}


def to_rgb(value: str) -> tuple[int, int, int]:
    value = value.strip().lstrip("#")
    if len(value) == 3:
        value = "".join(char * 2 for char in value)
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def channel(component: int) -> float:
    ratio = component / 255
    return ratio / 12.92 if ratio <= 0.04045 else ((ratio + 0.055) / 1.055) ** 2.4


def luminance(rgb: tuple[int, int, int]) -> float:
    r, g, b = (channel(component) for component in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(first: str, second: str) -> float:
    a, b = luminance(to_rgb(first)), luminance(to_rgb(second))
    lighter, darker = max(a, b), min(a, b)
    return (lighter + 0.05) / (darker + 0.05)


def check(name: str, tokens: dict[str, str]) -> int:
    print(f"thème {name}")
    failures = 0
    for front, back, threshold, label in CHECKS:
        if front not in tokens or back not in tokens:
            print(f"  MANQUE  {front} sur {back}")
            failures += 1
            continue
        ratio = contrast(tokens[front], tokens[back])
        status = "ok  " if ratio >= threshold else "ÉCHEC"
        if ratio < threshold:
            failures += 1
        print(f"  {status} {ratio:5.2f}  (min {threshold:.1f})  {front} sur {back} : {label}")
    return failures


def main() -> None:
    text = CSS.read_text(encoding="utf-8")
    failures = sum(check(name, parse_tokens(text, selector)) for name, selector in THEMES)
    if failures:
        print(f"\n{failures} paire(s) sous le seuil.")
        sys.exit(1)
    print(f"\n{len(CHECKS)} paires contrôlées dans chacun des {len(THEMES)} thèmes, toutes au-dessus du seuil.")


if __name__ == "__main__":
    main()
