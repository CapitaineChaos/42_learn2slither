// Frise de la session affichée, sous le curseur de pas : un trait vert par
// pomme verte mangée, un trait rouge par pomme rouge, au pas où elle l'est. La
// partie déjà jouée est teintée.

import { FRAMES, LAST, INDEX } from '../../run.js';
import { enterLoop, setIteration, shift } from '../../navigation.js';
import { state } from '../../state.js';
import { jump, stop } from './play.js';

const range = document.getElementById('iter');
const frise = document.getElementById('frise');

const at = (t) => (LAST ? (t / LAST) * 100 : 100);

export function marks() {
  frise.innerHTML = `<span class="frise-fill"></span>${FRAMES.map((frame, t) => (frame.event === 'green' || frame.event === 'red'
    ? `<span class="mark ${frame.event}" style="left: ${at(t)}%"></span>` : '')).join('')}`;
  range.max = LAST;
}

export function paint() {
  frise.querySelector('.frise-fill').style.width = `${at(state.t)}%`;
  range.value = state.t;
  range.setAttribute('aria-valuetext', `session ${INDEX + 1}, pas ${state.t + 1} sur ${LAST + 1}`);
}

export function mount() {
  marks();

  let pending = null;
  range.addEventListener('input', () => {
    stop();
    if (pending === null) {
      requestAnimationFrame(() => {
        const t = pending;
        pending = null;
        enterLoop();
        setIteration(t);
      });
    }
    pending = Number(range.value);
  });

  // Au clavier, un cran vaut un pas ; Début et Fin restent dans la session.
  range.addEventListener('keydown', (event) => {
    const moves = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key in moves) jump(() => shift(moves[event.key]))();
    else if (event.key === 'Home') jump(() => setIteration(0))();
    else if (event.key === 'End') jump(() => setIteration(LAST))();
    else return;
    event.preventDefault();
  });
}
