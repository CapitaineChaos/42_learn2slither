import { TOWARD, plural, spec } from './format.js';

export default {
  id: 'plateau',
  node: 'plateau',
  phase: 'session',
  plot: 'plateau',
  title: 'Plateau',
  math: null,
  calc: null,
  intro: () => `Chaque session commence sur un plateau neuf. Le serpent, deux pommes vertes et
    une pomme rouge y sont placés au hasard.`,
  lead: (c) => spec([
    ['Serpent', `Le serpent mesure 3 cases au départ, d'un seul tenant. Une pomme verte
      l'allonge d'une case, une pomme rouge le raccourcit d'une case. Chaque pomme mangée
      réapparaît sur une case libre.`],
    ['Mort', `Le serpent meurt s'il heurte un mur ou son corps, si une pomme rouge le ramène à
      la longueur 0, ou si toutes les cases voisines de la tête sont bloquées.`],
    ['Faim', `La session s'arrête aussi après ${c.hungerLimit} pas sans pomme verte, soit
      2 × largeur × hauteur. Cette limite termine les sessions où le serpent tourne en rond.`],
    [`session ${c.session}`, `${c.trained
      ? `L'agent a déjà joué ${c.trained} ${plural(c.trained, 'session', 'sessions')}.`
      : 'L\'agent commence l\'entraînement.'} Le serpent part de (${c.head.x}, ${c.head.y})
      ${TOWARD[c.direction]}.`, true],
  ]),
  more: () => `
    <p>L'origine des coordonnées (x, y) est la case en haut à gauche. x croît vers la droite,
    y vers le bas.</p>`,
};
