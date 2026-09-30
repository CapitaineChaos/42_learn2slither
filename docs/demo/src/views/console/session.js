// Choix de la session rejouée, de la 1re à la 1000e. Sous le curseur, une
// barre par session donne sa longueur maximale ; la session affichée est en
// couleur d'accent.
//
// Dans une session, choisir une autre session mène à son début, ou à sa fin
// depuis la fin de session ; ailleurs, au plateau de cette session.

import { STEPS } from '../../content/steps.js';
import { palette } from '../../figures/canevas.js';
import { FRAME_START, goto, inFrame, setSession } from '../../navigation.js';
import { METHOD, RUNS } from '../../run.js';
import { SESSIONS } from '../../sim/training.js';
import { state } from '../../state.js';
import { stop } from './play.js';

const range = document.getElementById('session');
const output = document.getElementById('session-number');
const canvas = document.getElementById('session-lengths');

function choose(index) {
  stop();
  if (inFrame(state.step)) setSession(index, STEPS[state.step].phase === 'fin' ? Infinity : 0);
  else {
    setSession(index, 0);
    goto(FRAME_START);
  }
}

function draw() {
  const width = Math.round(canvas.clientWidth);
  const height = Math.round(canvas.clientHeight);
  if (width < 8 || height < 4) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const p = palette();
  const lengths = RUNS[METHOD].sessions.map((session) => session.longest);
  const top = Math.max(...lengths);
  const bar = width / SESSIONS;
  ctx.fillStyle = p.edge;
  lengths.forEach((length, i) => {
    const h = (length / top) * height;
    ctx.fillRect(i * bar, height - h, Math.max(bar, 1), h);
  });
  ctx.fillStyle = p.accent;
  ctx.fillRect(state.session * bar - 1, 0, Math.max(bar, 1) + 2, height);
}

export function paint() {
  range.value = state.session + 1;
  output.textContent = String(state.session + 1).padStart(String(SESSIONS).length);
  range.setAttribute('aria-valuetext', `session ${state.session + 1} sur ${SESSIONS}`);
  draw();
}

export function mount() {
  range.min = 1;
  range.max = SESSIONS;

  // Un glissement émet plus d'événements que l'écran ne peut en dessiner, donc
  // seul le dernier de chaque image rejoue une session.
  let pending = null;
  range.addEventListener('input', () => {
    if (pending === null) {
      requestAnimationFrame(() => {
        const index = pending - 1;
        pending = null;
        choose(index);
      });
    }
    pending = Number(range.value);
  });

  new ResizeObserver(draw).observe(canvas);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
