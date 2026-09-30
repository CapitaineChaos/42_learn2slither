// Bascule clair / sombre. Le thème de départ est posé par index.html avant le
// premier rendu : choix mémorisé, sinon préférence du système. Les figures
// lisent leurs couleurs sur les jetons CSS au moment du tracé, donc il suffit
// de les redessiner.

import { paint } from './figures.js';

const root = document.documentElement;
const toggle = document.getElementById('theme');

const dark = () => root.dataset.theme === 'dark';

export function mount() {
  toggle.setAttribute('aria-pressed', String(dark()));
  toggle.addEventListener('click', () => {
    root.dataset.theme = dark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (error) {}
    toggle.setAttribute('aria-pressed', String(dark()));
    paint();
  });
}
