# Learn2Slither

Serpent sur plateau rectangulaire, piloté au clavier ou par une IA
Q-learning. Deux fenêtres : le plateau, et le panneau de contrôle placé à sa
droite.

## Lancer

```sh
make
make test
```

`make SPEED=20` fixe la vitesse initiale. Les sources sont copiées dans
`/dev/shm/learn2slither` avant l'exécution ; les modèles sont lus et écrits
dans `models/` du dépôt (`--models`).

## Déroulement

Une partie commence à l'arrêt : rien ne bouge avant Start (bouton du plateau,
bouton du panneau, Espace) ou, joueur humain, une flèche. Après GAME OVER,
Retry recrée une partie à l'arrêt. L'IA en temps réel enchaîne seule ses
sessions une fois démarrée.

Changer la taille, le joueur ou le modèle recrée la partie. Passer en temps
réel depuis le tour par tour met en pause ; l'entraînement aussi.

## Clavier

Les touches agissent quelle que soit la fenêtre active.

| Touche | Effet |
|---|---|
| Flèches | direction ; démarre ou reprend ; en tour par tour, direction puis un pas |
| Espace | Start, Pause, Resume, Retry ; en tour par tour, un pas |
| R | Restart |
| T | Train, Stop |
| Esc | quitter |

En temps réel, les flèches s'empilent (3 au plus) et chaque pas en consomme
une : deux virages rapprochés sont joués tous les deux. Démarrer joue le
premier pas tout de suite.

Fermer l'une des fenêtres quitte.

## Réglages

- Width, Height : 5 à 40.
- Player : Human ou AI.
- Mode : Real-time, un pas toutes les 1/Speed s ; Turn-based, un pas par
  commande (`-step-by-step` du sujet).
- Difficulty : Easy au lancement, joueur humain seulement ; l'IA joue
  toujours en Hard.
- Learning, IA seulement. On : exploration, mise à jour de la table, sessions
  comptées. Off : meilleure action, agent inchangé (`-dontlearn` du sujet).
- Model : `new` ou un fichier de `models/`. Load remplace l'agent courant ;
  Save écrit `models/<sessions>sess.json`.
- Sessions, Train : sessions jouées sans cadence, à la taille courante, en
  Hard. Le plateau montre la session en cours.

## Collisions

Obstacle : mur ou corps, queue exclue puisqu'elle se libère au même pas.
L'élan est l'avance sans nouvel ordre.

| Difficulty | Élan vers un obstacle | Ordre vers un obstacle |
|---|---|---|
| Easy | arrêt | ignoré |
| Normal | arrêt | mort |
| Hard | mort | mort |

Dans tous les modes, le serpent meurt s'il n'a plus aucune case libre autour
de la tête, ou si une pomme rouge le ramène à longueur 0. Un ordre ignoré ne
touche pas au serpent : en tour par tour, il ne consomme pas de pas. Le cou
est un obstacle comme le reste du corps : un demi-tour est ignoré en Easy et
tue en Normal et Hard.

## Agent

L'état ne dépend que des quatre lignes vues depuis la tête : un symbole par
direction (haut, gauche, bas, droite), soit 256 états indépendants de la
taille du plateau.

| Symbole | Case voisine ou ligne |
|---|---|
| D | mur ou corps sur la case voisine |
| R | pomme rouge sur la case voisine |
| G | pomme verte avant tout obstacle |
| 0 | autre |

- Récompenses : verte +10, rouge −10, pas −0,1, mort −100.
- α = 0,1, γ = 0,9, ε = max(0,001, 0,97^sessions).
- Une session sans pomme verte pendant 2 × largeur × hauteur pas se termine
  comme une mort, sinon une politique en boucle ne finit jamais.

Mesures sur 10 x 10, 200 parties figées : longueur moyenne 17 (max 38) après
1 000 sessions, 24 (max 46) après 10 000.

## Structure

- `main.py` : point d'entrée
- `game/app.py` : boucle, aiguillage des événements, actions
- `game/controls.py` : fenêtre de contrôle (pygame_gui)
- `game/hud.py` : textes du calque et du bouton Start
- `game/match.py` : une partie, ses phases et son horloge
- `game/board.py` : règles, pommes, difficulté
- `game/snake.py` : modèle du serpent et directions
- `game/settings.py` : réglages
- `game/interpreter.py` : vision, état, récompenses
- `game/agent.py` : table Q
- `game/models.py` : fichiers de modèles
- `game/training.py` : pas d'IA, entraînement par lots
- `game/renderer.py` : fenêtre du plateau, calque d'état
- `game/config.py` : dimensions, bornes, préréglages et palette
- `game/assets/theme.json` : thème pygame_gui
- `game/assets/serpent_corps.svg` : sprite du corps
- `game/assets/serpent_tete.svg` : sprite de la tête
- `game/assets/pomme.svg` : sprite de la pomme
- `game/assets/mur_horizontal.svg` et `mur_vertical.svg` : murs
- `game/assets/coin_*.svg` : coins des murs
- `tests/test_regressions.py` : non-régression

Les trois couleurs de peau des SVG sont remappées dans `game/config.py`.
Les yeux restent en blanc et noir.
Les pommes en jeu sont listées par `APPLE_START`.
La fenêtre du plateau est un carré de 672 px : la case vaut 56 px au plus et
rétrécit pour les grandes dimensions. Le calque d'état se place dans la
moitié opposée à la tête du serpent. Le rendu ajoute une case de bordure sur
chaque côté ; le fond du plateau déborde d'une demi-case dans les murs pour
remplir leurs zones transparentes.
