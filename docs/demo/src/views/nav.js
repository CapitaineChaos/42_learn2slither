// Commandes d'étape de la console. Les libellés ne changent jamais, car un
// bouton qui change de texte change de largeur et pousse ses voisins. Au bout
// de la boucle, suivant repart à la vision au pas suivant, ce que le schéma
// montre. Aller à la fin, grisé hors de la boucle, saute au dernier pas.

import { STEPS } from '../content/steps.js';
import { LAST } from '../run.js';
import { LOOP_END, exitLoop, goNext, goPrev } from '../navigation.js';
import { on, state } from '../state.js';

const previous = document.getElementById('prev');
const next = document.getElementById('next');
const exit = document.getElementById('exit');
const count = document.getElementById('step-count');
const total = document.getElementById('step-max');

const WIDTH = String(STEPS.length).length;

function update() {
  const inLoop = STEPS[state.step].phase === 'boucle';
  next.disabled = state.step === STEPS.length - 1;
  previous.disabled = state.step === 0;
  exit.disabled = !inLoop || (state.step === LOOP_END && state.t === LAST);
  count.textContent = String(state.step + 1).padStart(WIDTH);
}

export function mount() {
  total.textContent = STEPS.length;
  previous.addEventListener('click', goPrev);
  next.addEventListener('click', goNext);
  exit.addEventListener('click', exitLoop);
  on('step', update);
  on('iteration', update);
  on('session', update);
  update();
}
