# Démo interactive

    make demo            # http://localhost:8001
    make demo PORT=9000  # autre port
    make contraste       # contrôle WCAG de la palette

Ces commandes se lancent depuis la racine du dépôt. La page ne demande aucune
compilation ni aucune dépendance Python : un serveur statique suffit.
`scripts/serveur.py` interdit au navigateur de garder les modules en cache sans
les revalider. Avec `python -m http.server`, une page rechargée peut mêler
l'ancien code au nouveau HTML. Le port par défaut, 8001, diffère de celui de la
démo de dslr (8000) : les deux démos ont des fichiers de même chemin, et un
navigateur qui a gardé ceux de dslr en cache les servirait à la place de ceux-ci.
Si un module manque malgré tout, l'écran de démarrage le signale au lieu de
bloquer sur `Démarrer`.

## Écran

Un écran de démarrage précède la démo. Il affiche le logo, la jauge de
l'entraînement, puis le choix de la fonction Q, table ou réseau de neurones, et
le bouton `Démarrer`, actif une fois l'entraînement terminé. Les deux méthodes
sont entraînées pendant que l'écran est affiché, car le choix peut changer
jusqu'à `Démarrer`. Les options sont déclarées dans `src/config.js`.

| zone | contenu |
|---|---|
| parcours | schéma de huit nœuds : présentation, plateau, vision, action, récompense, mise à jour, fin de session, évaluation |
| console | session (curseur de 1 à 1000, sur les longueurs de chaque session, et `Tester`), étape (précédent, compteur, suivant), paramètres (α ou η, γ, ε), mesures du pas (longueur, récompense cumulée, pommes vertes, action), puis pas (compteur, fin de session et sa cause), sauts, lecture, frise, aller à la fin |
| cours | lecture seule : position, titre, formule générique, idée de l'étape, fiche, calcul déroulé, tableau, En savoir plus |
| figures | une figure de tête et six miniatures ; la miniature que l'étape commente porte le liseré de l'accent ; à leur place, l'article du wiki ouvert ou le test |

Le schéma porte deux boucles, dessinées par des flèches de retour sous la
ligne. La boucle des pas revient de la mise à jour à la vision, et sa seule
sortie est la flèche de la mort. La boucle des sessions revient de la fin de
session au plateau. Chaque nœud porte une pastille par étape, et un clic sur un
nœud ou une pastille y mène.

Au bout de la boucle des pas, `Suivant` repart à la vision au pas suivant. Après
le pas qui tue le serpent, il mène à la fin de session, puis au plateau de la
session suivante. Après la 1000e, le cours passe à l'évaluation.
`Aller à la fin`, grisé hors de la boucle, saute au dernier pas de la session.

Le curseur de session choisit l'une des 1000 sessions de l'entraînement. Sous
lui, une barre par session donne sa longueur maximale. La page enregistre
l'agent au début de chaque session et rejoue la session choisie à partir de cet
agent, avec les mêmes graines. Le rejeu donne exactement la session de
l'entraînement, et le serpent y joue avec ce qu'il a appris jusque-là. Les 24
dernières sessions rejouées restent en mémoire.

La frise couvre la session affichée : la partie jouée est teintée, et un trait
vert ou rouge marque chaque pomme mangée. Le curseur de pas, les sauts `±1` et
`±10` et les flèches du clavier la parcourent ; au-delà du dernier pas, ils
passent à la session suivante. `Lecture` joue huit pas par seconde, marque une
courte pause à la fin d'une session et continue au début de la suivante.

Rien ne bouge quand le pas change. Les libellés des commandes sont constants,
chaque nombre a une largeur fixe, et la fiche et le tableau réservent la plus
grande hauteur qu'ils prendront dans la session (`views/steady.js`).

Chaque étape suit le même ordre : la formule générique, un paragraphe qui dit
pourquoi l'étape suit la précédente, la fiche, puis « En savoir plus ». Les
formules de « En savoir plus » et du wiki sont écrites par KaTeX. Les étapes qui
tirent les conséquences de l'action (récompense, cible, mise à jour, fin de
session) montrent le plateau après le déplacement.

Les notions du cours sont soulignées de l'accent. Le survol ou le focus affiche
leur définition courte ; un clic ou Entrée ouvre leur article à la place des
figures. `Retour` remonte la suite des articles ouverts, `Fermer` ou Échap rend
les figures. Les textes marquent une notion par `[[clé]]` ou `[[clé|texte]]`.

## Test

`Tester` ouvre le test à la place des figures. L'agent après n sessions
d'entraînement, n de 0 à 1000, joue une partie sur un plateau tiré au hasard,
avec l'action de plus grande valeur Q à chaque pas, sans exploration ni mise à
jour. Le curseur `entraînement` part de la session affichée ; le déplacer lance
une nouvelle partie, comme `Nouvelle partie`. Les mesures donnent le pas, la
longueur, la longueur maximale, les pommes mangées, le compteur de faim et la
cause de la mort. Le journal garde les 12 dernières parties finies. Les graines
du test viennent de `crypto.getRandomValues`, et une partie de test ne se rejoue
pas.

## Entraînement

Chaque méthode joue 1000 sessions sur un plateau de 10 × 10 cases, avec les
règles, l'état, les récompenses et les paramètres du jeu : α = 0,1, γ = 0,9,
ε = max(0,001 ; 0,99ⁿ), limite de faim de 200 pas. Une mort de faim arrête la
session sans la pénalité de −100 ; la mise à jour la traite comme un pas
ordinaire, car le serpent ne voit pas le compteur de faim. Chaque session
reçoit deux graines, une pour le plateau et une pour l'agent. Les modèles après
1, 10, 100 et 1000 sessions sont évalués sur les mêmes 100 parties figées.

Le réseau n'existe que dans la démo. Il reçoit l'état en 16 entrées binaires,
a 16 neurones cachés ReLU et 4 sorties, et corrige ses poids par un pas de
gradient de η = 0,001 sur l'écart à la même cible que la table. Sur cinq
graines, η = 0,001 et 16 neurones cachés ont donné des résultats réguliers ; η
= 0,005 laisse l'agent à une longueur moyenne de 3.

| graine | table | réseau | table, anciennes règles | réseau, anciennes règles |
|---|---|---|---|---|
| 11 | 21,2 | 21,8 | 18,7 | 21,6 |
| 22 | 22,1 | 19,7 | 16,9 | 22,6 |
| 33 | 24,1 | 19,4 | 17,9 | 22,7 |
| 44 | 19,0 | 22,2 | 13,2 | 21,8 |
| 55 | 20,6 | 21,6 | 16,2 | 23,4 |
| 66 | 23,5 | 6,3 | 18,8 | 19,9 |
| 77 | 22,5 | 13,2 | 20,8 | 21,0 |
| 88 | 20,2 | 23,2 | 13,8 | 20,7 |

Longueur moyenne sur les 100 parties figées après 1000 sessions. Les anciennes
règles sont une pénalité de −100 pour la faim et ε = max(0,001 ; 0,97ⁿ). Avec
elles, la table finissait par tourner en rond : une mort de faim tombée sur
l'action qui menait à une pomme la rendait très négative, et l'agent, qui
n'explorait presque plus, ne la rejouait jamais. Les nouvelles règles sont
choisies pour la table, la méthode du jeu ; le réseau était plus régulier avec
les anciennes. La démo affiche la graine 11, proche de la moyenne pour les deux
méthodes (`sim/training.js`, `RUN`). L'entraînement des deux méthodes prend
environ deux secondes.

## Cohérence avec le code Python

`src/sim/` est un portage de `game/board.py`, `game/snake.py`,
`game/interpreter.py`, `game/agent.py` et de la mise à jour de
`game/training.py`, limité à ce que joue l'agent : difficulté Hard et limite de
faim. `scripts/verifie_portage.mjs` tire 3000 plateaux du jeu Python par des
actions au hasard et compare la vision, l'état, l'événement et le corps après
une action ; il compare aussi 500 mises à jour de la table. Il ne trouve aucun
écart.

Les nombres au hasard diffèrent : le jeu tire les siens sans graine, la démo
avec des graines par session. Trois entraînements de 1000 sessions du jeu
Python, évalués sur 200 parties figées, donnent 20,2, 20,5 et 22,3, dans
l'intervalle des graines de la démo. Le jeu ne distingue que la mort de faim
(`board.starved`) ; le portage enregistre aussi les autres causes, pour le texte
de la fin de session.

## Lisibilité

Les couleurs viennent des échelles
[Radix Colors](https://www.radix-ui.com/colors), en clair et en sombre : gris
mauve pour les fonds et le texte, un seul accent violet réservé au parcours. Le
serpent est en vert lime, les pommes en vert et en rouge, comme dans le jeu. Le
serpent se distingue des pommes par sa forme, carrée, et les pommes l'une de
l'autre par leur couleur et par leur lettre dans la vision. `verifie_contraste.py`
contrôle 38 paires dans chaque thème.

Les figures et le wiki reprennent la démo de dslr : habillage hexagonal, polices
Space Grotesk, IBM Plex Sans et JetBrains Mono, mise en page en document qui
défile sous 78 rem de large ou 40 rem de haut, bulles gardées dans la fenêtre.

## Contrôles

    python3 docs/demo/scripts/verifie_contraste.py   # 38 paires, dans chaque thème
    node docs/demo/scripts/verifie_fiches.mjs        # fiches, noms accessibles des figures et liens du wiki, pour chaque méthode et les sessions 1, 10, 100, 500 et 1000
    node docs/demo/scripts/verifie_portage.mjs       # portage comparé au jeu Python (demande le venv du jeu)
    python3 docs/demo/scripts/verifie_figures.py     # les sept figures, les formules et le test dans un navigateur, pour chaque méthode

## Fichiers

Aucun fichier de `src/` ou de `css/` ne dépasse 200 lignes.

    index.html                   la page et les identifiants que les vues cherchent

    css/tokens.css               palette et échelle typographique
    css/base.css                 éléments, champs, anneau de focus, bulle des symboles
    css/controls.css             boutons hexagonaux, outils des panneaux, logo
    css/shell.css                grille de page, panneaux repliables
    css/start.css                écran de démarrage : jauge, choix de la méthode
    css/flow.css                 schéma du parcours
    css/console.css              console : groupes, boutons, mesures, mises en page
    css/frise.css                curseurs de session et de pas, frise des pommes mangées
    css/lesson.css               colonne de cours, idée, fiche, En savoir plus
    css/calc.css                 calcul déroulé et tableaux
    css/figures.css              colonne des figures et agrandissement
    css/wiki.css                 termes soulignés et article du wiki
    css/test.css                 panneau de test : réglages, plateau, mesures, journal

    src/sim/random.js            générateur à graine
    src/sim/board.js             plateau et serpent, portage de board.py et snake.py
    src/sim/interpreter.js       vision, état, récompenses, portage de interpreter.py
    src/sim/agents.js            table Q (portage de agent.py) et réseau de neurones
    src/sim/training.js          sessions, rejeu enregistré, parties figées

    src/boot.js                  démarrage : polices, entraînement, Démarrer, montage
    src/config.js                options de l'écran de démarrage
    src/run.js                   entraînements, rejeu d'une session, liaisons vivantes
    src/navigation.js            déplacements dans le cours, les boucles et la frise
    src/context.js               les nombres que les textes peuvent citer
    src/state.js                 état courant et trois canaux d'abonnement
    src/app.js                   montage des vues, annonces, clavier

    src/content/steps.js         ordre des étapes
    src/content/steps/*.js       une étape par fichier : formule, idée, fiche, En savoir plus, calcul
    src/content/symbols.js       définition de chaque symbole, affichée au survol
    src/content/wiki/*.js        notions : renforcement, valeur, réseau, exploration

    src/figures/*.js             plateau, vision, valeurs Q, politique, longueur, exploration, évaluation

    src/views/                   vues reprises de la démo dslr et adaptées aux sessions
    src/views/side.js            occupant de la colonne latérale : figures, wiki ou test
    src/views/test.js            panneau de test : lecture, réglages, journal
    src/views/test/game.js       partie de test d'un agent figé, mesures
    src/views/calc/tables.js     tableaux : directions, tranches de sessions, modèles
    src/views/calc/worked.js     calculs déroulés

    vendor/katex/                KaTeX et son extension auto-render, polices woff2 ; licence MIT
    vendor/*.woff2               Space Grotesk, IBM Plex Sans, JetBrains Mono ; licences OFL à côté
