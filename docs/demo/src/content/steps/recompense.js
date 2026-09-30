import { at, spec } from './format.js';

export default {
  id: 'recompense',
  node: 'recompense',
  phase: 'boucle',
  plot: 'plateau',
  after: true,
  title: 'Récompense',
  math: 'r = \\begin{cases} +10 & \\text{pomme verte} \\\\ -10 & \\text{pomme rouge} \\\\ -100 & \\text{mort, hors faim} \\\\ -0.1 & \\text{sinon} \\end{cases}',
  calc: { worked: 'reward' },
  intro: () => `Le plateau exécute l'action et renvoie une [[recompense|récompense]]. L'agent
    juge ses choix d'après ce nombre.`,
  lead: (c) => spec([
    ['Barème', `Une pomme verte rapporte, une pomme rouge coûte, un pas sans pomme coûte un
      peu, la mort coûte beaucoup.`],
    ['Coût du pas', 'Le −0.1 par pas pousse l\'agent à atteindre les pommes par le plus court chemin.'],
    ['Mort de faim', `Une mort de faim reçoit la récompense d'un pas ordinaire, −0.1. Le
      compteur de faim reste hors de l'état, et un −100 punirait l'action jouée au 200e pas,
      quelle qu'elle soit.`],
    [at(c), `${c.eventText}, r = ${c.rewardText}`, true],
  ]),
  more: () => String.raw`
    <h4>Récompense retardée</h4>
    <p>Une récompense juge le dernier pas, et les conséquences d'un choix peuvent arriver
    plusieurs pas plus tard. Un virage vers une impasse coûte −0.1 comme un pas ordinaire, et
    la mort vient quelques pas après. La cible, à l'étape suivante, fait remonter ces
    conséquences vers les choix qui les ont préparées.</p>
    <h4>Ancienne pénalité de faim</h4>
    <p>Avec la pénalité de −100, une seule mort de faim tombée sur l'action qui menait vers
    une pomme verte la faisait passer de +0.06 à −9.94. L'agent cessait de la jouer et
    tournait en rond, ce qui coûte environ −1 à la longue. Sur huit graines, retirer
    cette pénalité et ralentir la décroissance de \(\varepsilon\) fait passer la longueur
    moyenne de la table de 17.0 à 21.7.</p>
    <h4>Échelle</h4>
    <p>Pour la table, multiplier toutes les récompenses par 10 multiplie toutes les valeurs
    \(Q\) par 10, et l'agent fait les mêmes choix.</p>`,
};
