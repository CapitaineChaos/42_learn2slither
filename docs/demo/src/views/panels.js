// Repli du schéma du parcours et de la colonne des figures, tous deux
// déployés au chargement. Replier les figures referme d'abord un
// agrandissement, dont la carte disparaîtrait sous le voile.

import { state } from '../state.js';
import { zoom } from './figures.js';

const app = document.getElementById('app');

function bind(id, hidden, before = () => {}) {
  const button = document.getElementById(id);
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    before(open);
    button.setAttribute('aria-expanded', String(open));
    app.classList.toggle(hidden, !open);
  });
}

export function expand(id) {
  const button = document.getElementById(id);
  if (button.getAttribute('aria-expanded') !== 'true') button.click();
}

export function mount() {
  bind('toggle-flow', 'no-flow');
  bind('toggle-plots', 'no-plots', (open) => {
    if (!open && state.zoom !== null) zoom(null);
  });
}
