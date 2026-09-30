import { plural, spec } from './format.js';

export default {
  id: 'fin-session',
  node: 'fin',
  phase: 'fin',
  plot: 'plateau',
  after: true,
  title: 'Fin de session',
  math: '\\varepsilon_n = \\max\\big(0.001,\\ 0.99^{\\,n}\\big)',
  calc: { worked: 'session' },
  intro: () => `La session s'arrête à la mort du serpent. L'agent garde ce qu'il a appris, et la
    session suivante repart d'un plateau neuf avec un peu moins d'exploration.`,
  lead: (c) => spec([
    ['Mort', `${c.cause}.`],
    ['Bilan', `${c.frames} pas, longueur maximale ${c.longest}, ${c.sessionGreens}
      ${plural(c.sessionGreens, 'pomme verte', 'pommes vertes')} et ${c.sessionReds}
      ${plural(c.sessionReds, 'rouge', 'rouges')}, récompense totale ${c.sessionTotal}.`],
    ['Exploration', `n est le nombre de sessions jouées. La session suivante joue avec
      ε = ${c.nextEpsilon}.`],
  ]),
  more: () => '',
};
