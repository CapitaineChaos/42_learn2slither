export const EXPLORATION = {
  exploration: {
    title: 'Exploration et exploitation',
    short: 'Compromis entre jouer l\'action qui paraît la meilleure et en essayer d\'autres.',
    body: String.raw`
      <p>Exploiter consiste à jouer l'action qui paraît la meilleure d'après les estimations
      actuelles. Explorer consiste à en essayer une autre, pour découvrir si elle vaut mieux que
      prévu.</p>
      <p>Un agent qui exploite toujours garde ses premières estimations, car il rejoue les
      actions bien notées au départ. Un agent qui explore toujours joue au hasard, quoi qu'il ait
      appris. La [[politique-epsilon|politique ε-gloutonne]] fixe la part d'exploration par
      \(\varepsilon\).</p>`,
  },
  'politique-epsilon': {
    title: 'Politique ε-gloutonne',
    short: 'Action au hasard avec la probabilité ε, meilleure action sinon.',
    body: String.raw`
      <p>La politique ε-gloutonne joue une action tirée au hasard avec la probabilité
      \(\varepsilon\), et l'action de plus grande valeur \(Q\) sinon. « Glouton » qualifie le
      choix du meilleur gain immédiat, ici la plus grande valeur estimée.</p>
      <p>Ici, \(\varepsilon = \max(0.001,\ 0.99^n)\), où \(n\) est le nombre de
      sessions déjà jouées. L'agent joue au hasard à la première session, puis de moins en moins,
      jusqu'au plancher de 0.001, atteint après 688 sessions.</p>`,
  },
};
