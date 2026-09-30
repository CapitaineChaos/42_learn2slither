import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'cible',
  node: 'maj',
  phase: 'boucle',
  plot: 'valeurs',
  after: true,
  title: 'Cible de Bellman',
  math: 'y = \\begin{cases} r & \\text{si le serpent meurt, hors faim} \\\\ r + \\gamma \\max_{a\'} Q(s\', a\') & \\text{sinon} \\end{cases}',
  calc: { worked: 'target' },
  intro: () => `Pour corriger Q(s, a), il faut une valeur de référence. La cible combine la
    récompense obtenue et la meilleure valeur estimée depuis l'état suivant.`,
  lead: (c) => spec([
    ['État suivant', `${S.next} est l'état lu après le déplacement. Une mort termine la
      session, et la cible se réduit à la récompense. La mort de faim est traitée comme un pas
      ordinaire, et sa cible garde le terme γ · max Q(s′, ·).`],
    ['Estimation', `La cible utilise l'estimation actuelle de Q pour la suite de la partie. Q
      apprend donc à partir de ses propres estimations, corrigées pas à pas par les récompenses
      réellement reçues.`],
    [at(c), c.terminal
      ? `mort, y = r = ${c.target}`
      : `r = ${c.rewardText}, max Q(s′, ·) = ${c.nextMax}, y = ${c.target}`, true],
  ]),
  more: () => String.raw`
    <h4>Équation de Bellman</h4>
    \[ Q^*(s, a) = \mathbb{E}\big[\, r + \gamma \max_{a'} Q^*(s', a') \,\big] \]
    <p>La fonction \(Q\) optimale \(Q^*\) vérifie cette égalité. La valeur d'une action y est
    la récompense immédiate plus la valeur actualisée du meilleur choix suivant. La cible est un
    tirage du membre de droite, obtenu en jouant un seul pas
    ([[bellman|équation de Bellman]]).</p>
    <h4>Hors politique</h4>
    <p>La cible prend le maximum sur les actions suivantes, même si l'agent joue ensuite une
    action au hasard. Le [[q-learning|Q-learning]] apprend ainsi la valeur de la meilleure
    politique pendant que l'agent suit une politique exploratoire. La méthode [[sarsa|SARSA]] utilise l'action réellement jouée au pas suivant et apprend la
    valeur de la politique exploratoire.</p>
    <h4>Origine</h4>
    <p>Bellman a formulé cette équation en 1957, pour la programmation dynamique. Watkins a
    proposé le Q-learning en 1989, et Watkins et Dayan en ont démontré la convergence en 1992
    pour une table dont chaque case est visitée indéfiniment.</p>`,
};
