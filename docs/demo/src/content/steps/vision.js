import { at, spec } from './format.js';

export default {
  id: 'vision',
  node: 'vision',
  phase: 'boucle',
  plot: 'vision',
  title: 'Vision',
  math: null,
  calc: { table: 'directions', cols: ['dir', 'line'] },
  intro: () => `À chaque pas, l'agent reçoit du plateau les quatre lignes de cases qui partent de
    la tête du serpent, jusqu'au mur.`,
  lead: (c) => spec([
    ['Lettres', `W désigne le mur, S un segment du corps, G une pomme verte, R une pomme rouge et
      0 une case vide.`],
    ['Ordre', `Chaque ligne se lit de la tête vers le mur. Les directions sont prises dans
      l'ordre haut, gauche, bas, droite.`],
    [at(c), `haut ${c.lines[0]}, gauche ${c.lines[1]}, bas ${c.lines[2]}, droite ${c.lines[3]}`, true],
  ]),
  more: () => `
    <p>La même vision s'écrit en croix, sur la colonne et la ligne de la tête, avec H pour la
    tête.</p>`,
};
