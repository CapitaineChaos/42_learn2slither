import { config } from '../../config.js';
import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'action',
  node: 'action',
  phase: 'boucle',
  plot: 'valeurs',
  title: 'Choix de l\'action',
  math: 'a = \\begin{cases} \\text{une action au hasard} & \\text{avec la probabilité } \\varepsilon \\\\ \\arg\\max_{a\'} Q(s, a\') & \\text{sinon} \\end{cases}',
  calc: { table: 'directions', cols: ['dir', 'q', 'chosen'], worked: 'action' },
  intro: () => `L'agent joue le plus souvent l'action de plus grande valeur Q. Il en joue parfois
    une au hasard pour mesurer la valeur des autres, d'autant moins souvent que l'entraînement
    avance.`,
  lead: (c) => spec([
    ['Exploration', `${S.epsilon} = max(0.001, 0.99ⁿ), où n est le nombre de sessions déjà
      jouées. ε vaut 1 à la première session, ${c.epsilon100} à la 101e et 0.001 à partir de la
      ${c.floorSession}e.`],
    ['Égalités', `Quand plusieurs actions ont la même valeur, l'agent tire l'une d'elles au
      hasard.${config.method === 'table'
        ? ' Au départ, toutes les valeurs de la table sont nulles, et chaque choix est un tirage.'
        : ''}`],
    [at(c), c.explored
      ? `ε = ${c.epsilon}. Le tirage tombe sous ε, et l'action est tirée au hasard : ${c.actionName}.`
      : `ε = ${c.epsilon}. Le tirage tombe au-dessus de ε, et l'agent joue la meilleure action : ${c.actionName}.`, true],
  ]),
  more: () => String.raw`
    <h4>Exploration et exploitation</h4>
    <p>Exploiter consiste à jouer l'action qui paraît la meilleure, explorer à en essayer une
    autre pour en mesurer la valeur. L'exploration fait rejouer une action sous-estimée au
    départ, et son estimation se corrige ([[exploration|exploration et exploitation]]). La
    [[politique-epsilon|politique ε-gloutonne]] règle ce compromis par \(\varepsilon\).</p>
    <h4>Décroissance de ε</h4>
    <p>Au début, les estimations sont arbitraires, et le hasard coûte peu. Plus tard, elles
    deviennent fiables, et le hasard fait perdre des pommes ou tue le serpent. \(\varepsilon\)
    décroît donc d'un facteur 0.99 par session, jusqu'au plancher de 0.001.</p>
    <p>Avec un facteur 0.97, le plancher arrive dès la 228e session. Une valeur faussée par
    malchance est ensuite rarement rejouée, donc rarement corrigée. Avec 0.99, le plancher
    arrive à la 689e session.</p>
    <h4>Évaluation</h4>
    <p>L'évaluation joue avec \(\varepsilon = 0\), donc la meilleure action à chaque
    pas.</p>`,
};
