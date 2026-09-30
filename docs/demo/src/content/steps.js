// Contenu du cours. Chaque étape correspond à un écran et à un fichier de
// steps/, dans l'ordre du parcours.
//
// `node` rattache l'étape à un nœud du schéma (steps/nodes.js). `math` est la
// formule générique. `intro(c)` dit pourquoi l'étape suit la précédente,
// `lead(c)` est la fiche, `more(c)` « En savoir plus », dont les formules sont
// écrites en TeX entre \( \) ou \[ \]. `after` montre le plateau après
// l'action du pas. Les nombres viennent de c (context.js), jamais écrits en
// dur ; les symboles viennent de symbols.js, avec leur définition au survol.
// intro et more ne dépendent pas du pas.

import presentation from './steps/presentation.js';
import plateau from './steps/plateau.js';
import vision from './steps/vision.js';
import etat from './steps/etat.js';
import fonctionQ from './steps/fonction-q.js';
import action from './steps/action.js';
import recompense from './steps/recompense.js';
import cible from './steps/cible.js';
import maj from './steps/maj.js';
import finSession from './steps/fin-session.js';
import apprentissage from './steps/apprentissage.js';
import evaluation from './steps/evaluation.js';

export { NODES } from './steps/nodes.js';

export const STEPS = [
  presentation,
  plateau,
  vision,
  etat,
  fonctionQ,
  action,
  recompense,
  cible,
  maj,
  finSession,
  apprentissage,
  evaluation,
];
