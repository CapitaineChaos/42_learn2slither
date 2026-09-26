# Learn2Slither

Partie 1 : déplacement manuel d'un serpent sur un plateau 10 x 10.

## Lancer

```sh
make
```

La vitesse par défaut est de 10 déplacements par seconde. Elle se règle avec
`make SPEED=20` ou directement avec `python main.py --speed 20`.

Les sources sont copiées dans `/dev/shm/learn2slither` avant l'exécution.

Les flèches changent la direction ; `Esc` ou la fermeture de la fenêtre quitte
le jeu. Un virage vers un mur ou vers le corps est ignoré, le serpent
continue tout droit ; quand la voie droite est elle aussi bloquée il attend
un ordre praticable.

## Structure

- `main.py` : point d'entrée
- `game/app.py` : boucle et événements
- `game/snake.py` : modèle du serpent et directions
- `game/renderer.py` : rendu pygame
- `game/config.py` : dimensions et palette
- `game/assets/serpent_corps.svg` : sprite du corps
- `game/assets/serpent_tete.svg` : sprite de la tête
- `game/assets/pomme.svg` : sprite de la pomme
- `game/assets/mur_horizontal.svg` et `mur_vertical.svg` : murs
- `game/assets/coin_*.svg` : coins des murs

Les trois couleurs de peau des SVG sont remappées dans `game/config.py`.
Les yeux restent en blanc et noir.
Les pommes en jeu sont listées par `APPLE_START`.
La grille jouable reste en 10 x 10 ; le rendu ajoute une case de bordure sur
chaque côté. Le fond du plateau déborde d'une demi-case dans les murs pour
remplir leurs zones transparentes.
