// Plateau affiché : avant l'action du pas pour les étapes qui la préparent,
// après pour celles qui en tirent les conséquences (récompense, cible, mise à
// jour, fin de session).

import { STEPS } from '../content/steps.js';
import { FINAL, LAST, frameAt } from '../run.js';
import { state } from '../state.js';

export const afterAction = () => Boolean(STEPS[state.step].after);

export function pictureAt(t) {
  if (!afterAction()) return frameAt(t).picture;
  return t >= LAST ? FINAL : frameAt(t + 1).picture;
}
