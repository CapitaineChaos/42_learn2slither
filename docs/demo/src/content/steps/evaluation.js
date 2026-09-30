import { plural, spec } from './format.js';

export default {
  id: 'evaluation',
  node: 'evaluation',
  phase: 'aval',
  plot: 'evaluation',
  title: 'Évaluation sans apprentissage',
  math: '\\bar{L} = \\frac{1}{100} \\sum_{g=1}^{100} L_g',
  calc: { table: 'models' },
  intro: (c) => `Pendant l'entraînement, l'exploration et les corrections brouillent la mesure.
    Chaque modèle est donc évalué figé, sur ${c.games} parties dont les plateaux sont les mêmes
    pour tous les modèles.`,
  lead: (c) => spec([
    ['Mode figé', `À chaque pas, l'agent joue l'action de plus grande valeur, et Q reste
      fixe.`],
    ['Modèles', 'Les modèles évalués sont l\'agent après 1, 10, 100 et 1000 sessions d\'entraînement.'],
    ['Résultat', `Longueur moyenne ${c.list(c.evaluations.map((e) => `${e.mean.toFixed(1)} après
      ${e.sessions} ${plural(e.sessions, 'session', 'sessions')}`))}.`],
    ['Longueur 10', `Avec le modèle de 1000 sessions, ${c.evaluations[3].reached} parties sur
      ${c.games} atteignent la longueur 10.`],
  ]),
  more: (c) => `
    <h4>Parties qui tournent en rond</h4>
    <p>Un agent figé joue toujours la même action dans le même état. Si le serpent repasse par
    une même suite d'états, il la répète jusqu'à la limite de faim. Avec le modèle de 1000
    sessions, ${c.evaluations[3].starved} parties sur ${c.games} finissent ainsi.</p>`,
};
