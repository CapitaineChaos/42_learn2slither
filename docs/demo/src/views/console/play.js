// Lecture continue de la frise, et les sauts de pas.
//
// La lecture joue huit pas par seconde. Au dernier pas d'une session, elle
// marque une courte pause, puis continue au début de la session suivante,
// jusqu'à la fin de la dernière. Un saut
// manuel interrompt la lecture, sans quoi le compteur continuerait de défiler
// après une commande manuelle.

import { LAST } from '../../run.js';
import { enterLoop, setIteration, shift } from '../../navigation.js';
import { SESSIONS } from '../../sim/training.js';
import { state } from '../../state.js';

const jog = document.getElementById('jog');

const SPEED = 8;
const HOLD = 700;

let playing = false;
let frame = null;
let previous = 0;
let carry = 0;
let held = 0;

const atEnd = () => state.session === SESSIONS - 1 && state.t >= LAST;

const button = () => jog.querySelector('[data-play]');

export function stop() {
  playing = false;
  if (frame) cancelAnimationFrame(frame);
  frame = null;
  button().textContent = 'Lecture';
  button().setAttribute('aria-pressed', 'false');
}

function tick(now) {
  const elapsed = Math.min(now - previous, 250);
  previous = now;
  if (state.t >= LAST) {
    if (atEnd()) { stop(); return; }
    held += elapsed;
    if (held >= HOLD) {
      held = 0;
      carry = 0;
      shift(1);
    }
  } else {
    carry += (elapsed / 1000) * SPEED;
    const steps = Math.floor(carry);
    if (steps >= 1) {
      carry -= steps;
      setIteration(state.t + steps);
    }
  }
  frame = requestAnimationFrame(tick);
}

export function togglePlay() {
  if (playing) { stop(); return; }
  enterLoop();
  if (atEnd()) setIteration(0);
  playing = true;
  carry = 0;
  held = 0;
  previous = performance.now();
  button().textContent = 'Pause';
  button().setAttribute('aria-pressed', 'true');
  frame = requestAnimationFrame(tick);
}

// Toute commande manuelle arrête la lecture, entre dans la boucle, puis
// exécute son action.
export const jump = (action) => () => {
  stop();
  enterLoop();
  action();
};

export function mount() {
  const controls = [
    ['Début', jump(() => setIteration(0))],
    ['-10', jump(() => shift(-10))],
    ['-1', jump(() => shift(-1))],
    ['Lecture', togglePlay, 'play'],
    ['+1', jump(() => shift(1))],
    ['+10', jump(() => shift(10))],
    ['Fin', jump(() => setIteration(LAST))],
  ];
  controls.forEach(([label, action, role]) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = role === 'play' ? 'button strong' : 'button';
    element.textContent = label;
    if (role === 'play') {
      element.dataset.play = '';
      element.setAttribute('aria-pressed', 'false');
    }
    element.addEventListener('click', action);
    jog.appendChild(element);
  });
}
