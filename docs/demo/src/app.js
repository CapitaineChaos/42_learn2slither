// Monte les vues, branche le clavier, lance le premier rendu. Importé par
// boot.js à Démarrer, une fois les données calculées et la méthode fixée.

import { STEPS } from './content/steps.js';
import { FRAMES, INDEX, LAST, frameAt } from './run.js';
import { goNext, goPrev, goto } from './navigation.js';
import { on, state } from './state.js';

import * as calc from './views/calc.js';
import * as figures from './views/figures.js';
import * as flow from './views/flow.js';
import * as lesson from './views/lesson.js';
import * as nav from './views/nav.js';
import * as panels from './views/panels.js';
import * as test from './views/test.js';
import * as theme from './views/theme.js';
import * as tooltip from './views/tooltip.js';
import * as transport from './views/transport.js';
import * as wiki from './views/wiki.js';
import { say } from './views/live.js';

flow.mount(goto);
lesson.mount();
calc.mount();
figures.mount();
transport.mount();
nav.mount();
panels.mount();
theme.mount();
wiki.mount();
test.mount();
tooltip.mount();

figures.follow();

on('step', () => {
  const step = STEPS[state.step];
  say(`${step.title}. Étape ${state.step + 1} sur ${STEPS.length}.`);
});

on('session', () => {
  say(`Session ${INDEX + 1}, ${LAST + 1} pas.`);
});

on('iteration', () => {
  const frame = frameAt(state.t);
  let total = 0;
  for (let i = 0; i <= state.t; i += 1) total += FRAMES[i].reward;
  say(`Pas ${state.t + 1} sur ${LAST + 1}. Longueur ${frame.length}, récompense cumulée ${total.toFixed(1)}.`);
});

// Les flèches parcourent le cours, l'espace lance et arrête la lecture, Échap
// referme un agrandissement. Dans un champ ou sur une carte de figure, ces
// touches gardent leur rôle propre.
window.addEventListener('keydown', (event) => {
  const target = event.target;
  const inControl = target instanceof Element && target.closest('input, select, textarea, .plot');

  if (event.key === 'Escape' && state.zoom !== null) figures.zoom(null);
  if (inControl) return;

  if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); goPrev(); }
  if (event.key === ' ' && (target === document.body || target.id === 'lesson')) {
    event.preventDefault();
    transport.togglePlay();
  }
});

// La promesse est tenue quand les figures ont eu deux images pour se
// dessiner.
export async function ready() {
  await new Promise((resolve) => { requestAnimationFrame(() => requestAnimationFrame(resolve)); });
}
