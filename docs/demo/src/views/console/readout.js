// Paramètres de l'apprentissage, compteur de pas avec la fin de session et sa
// cause, et les mesures du pas affiché. Largeurs fixées, en caractères,
// d'après la plus longue session, de sorte que changer de session ou de pas
// ne décale rien.

import { NOTES, tip } from '../../content/symbols.js';
import { config } from '../../config.js';
import { ALPHA, GAMMA, RATE } from '../../sim/agents.js';
import { FINAL, FRAMES, LAST, METHOD, RUNS, SUMMARY, frameAt } from '../../run.js';
import { state } from '../../state.js';

const output = document.getElementById('iteration');
const maximum = document.getElementById('iteration-max');
const kind = document.getElementById('stop-kind');
const params = document.getElementById('params');
const readout = document.getElementById('readout');

const pad = (text, width) => String(text).padStart(width);
const CAUSES = { mur: 'mur', corps: 'corps', rouge: 'rouge', piège: 'piège', faim: 'faim' };


export function paintParams() {
  const table = config.method === 'table';
  params.innerHTML = [
    table ? [tip('α', NOTES.alpha, true), ALPHA] : [tip('η', NOTES.rate, true), RATE],
    [tip('γ', NOTES.gamma, true), GAMMA],
    [tip('ε', NOTES.epsilon, true), SUMMARY.epsilon.toFixed(3)],
  ].map(([term, value]) => `<div><dt>${term}</dt><dd class="param">${value}</dd></div>`).join('');
}

export function paint() {
  const width = String(Math.max(...RUNS[METHOD].sessions.map((session) => session.steps)) + 1).length;
  const frame = frameAt(state.t);
  let total = 0;
  let greens = 0;
  for (let i = 0; i <= state.t; i += 1) {
    total += FRAMES[i].reward;
    if (FRAMES[i].event === 'green') greens += 1;
  }
  const length = state.t === LAST ? FINAL.body.length : frameAt(state.t + 1).length;

  output.textContent = pad(state.t + 1, width);
  maximum.textContent = pad(LAST + 1, width);
  kind.textContent = CAUSES[SUMMARY.cause];

  readout.innerHTML = [
    ['longueur', pad(length, 2), ''],
    ['récompense', pad(total.toFixed(1), 7), total < 0 ? 'warn' : ''],
    ['vertes', pad(greens, 2), ''],
    ['action', frame.explored ? 'hasard' : 'meilleure', frame.explored ? 'warn' : ''],
  ].map(([term, value, cls]) =>
    `<div><dt>${term}</dt><dd class="${cls}">${value}</dd></div>`).join('');
}
