import { spec } from './format.js';

export default {
  id: 'apprentissage',
  node: 'evaluation',
  phase: 'aval',
  plot: 'longueur',
  title: 'Courbe d\'apprentissage',
  math: '\\bar{L}_n = \\frac{1}{100} \\sum_{k=n-99}^{n} L_k',
  calc: { table: 'slices' },
  intro: () => `Une session isolée dépend beaucoup du plateau tiré au hasard. La moyenne sur les
    100 dernières sessions montre la tendance de l'apprentissage.`,
  lead: (c) => spec([
    ['Notation', 'L<sub>k</sub> est la longueur maximale atteinte à la session k.'],
    ['Début', `Tant que ε est grand, l'agent joue presque au hasard. Sur les 100 premières
      sessions, la longueur moyenne est de ${c.slices[0]}.`],
    ['Fin', `Sur les 100 dernières sessions, elle atteint ${c.slices[9]}.`],
    ['Autre méthode', `Avec ${c.otherLabel}, les mêmes moyennes valent ${c.otherSlices[0]} puis
      ${c.otherSlices[9]}.`],
  ]),
  more: () => String.raw`
    <h4>Table et réseau</h4>
    <p>Dans l'entraînement affiché, la table dépasse une moyenne de 10 à la cinquième
    centaine de sessions, le réseau à la sixième. Les deux méthodes restent proches de 3 tant
    que \(\varepsilon\) dépasse 0.1, soit pendant les 230 premières sessions environ.</p>
    <h4>Variabilité</h4>
    <p>Sur huit graines d'entraînement de 1000 sessions, évaluées sur les mêmes 100 parties
    figées, la longueur moyenne va de 19.0 à 24.1 pour la table et de 6.3 à 23.2 pour le
    réseau. La graine affichée donne 21.2 et 21.8.</p>
    <p>Les règles de la mort de faim et de \(\varepsilon\) ont été choisies pour la table.
    Avec une pénalité de −100 pour la faim et un facteur 0.97, le réseau était plus régulier,
    de 19.9 à 23.4 sur les mêmes graines. Une explication probable tient aux poids partagés,
    qui répartissent la pénalité sur des états voisins. Dans la table, elle tombe sur une seule
    case.</p>`,
};
