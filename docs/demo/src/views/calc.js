// Calcul déroulé et tableau de l'étape.
//
// L'étape choisit son calcul et son tableau (champ `calc` de l'étape). Le
// calcul reprend l'opération de l'étape avec les nombres du pas affiché ; le
// tableau donne une ligne par direction, par tranche de sessions ou par modèle.
//
// calc/worked.js écrit le calcul, calc/tables.js les tableaux.

import { STEPS } from '../content/steps.js';
import { on, state } from '../state.js';
import { TABLES } from './calc/tables.js';
import { WORKED } from './calc/worked.js';
import { reserve } from './steady.js';

const host = document.getElementById('calc');

function workedBlock(spec, t) {
  return [].concat(spec.worked || []).filter((kind) => WORKED[kind]).map((kind) => `<div class="worked">
    <p class="worked-head">calcul</p>
    ${WORKED[kind](t).map((text) => `<p class="worked-line">${text}</p>`).join('')}
  </div>`).join('');
}

function render(t) {
  const spec = STEPS[state.step].calc;
  if (!spec) { host.innerHTML = ''; return; }
  host.innerHTML = workedBlock(spec, t) + (spec.table ? TABLES[spec.table](spec, t) : '');
}

// La hauteur est réservée pour toute la session, de sorte que le tableau et
// le calcul ne bougent pas quand le pas change (views/steady.js).
function fit() {
  reserve(host, render, state.t);
}

export function mount() {
  on('step', fit);
  on('session', fit);
  on('iteration', () => render(state.t));
  fit();

  let width = host.clientWidth;
  new ResizeObserver(() => {
    if (host.clientWidth === width) return;
    width = host.clientWidth;
    fit();
  }).observe(host);
}
