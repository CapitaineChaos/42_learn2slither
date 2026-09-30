// Wiki des notions. Un terme du cours affiche sa définition courte au survol ;
// un clic ouvre l'article à la place des figures. Les liens d'un article vers
// un autre s'empilent, et Retour remonte la pile. Fermer, ou Échap, rend les
// figures et le focus au terme qui a ouvert le wiki.

import { WIKI, linkTerms } from '../content/wiki/index.js';
import { state } from '../state.js';
import { zoom } from './figures.js';
import { expand } from './panels.js';
import { occupy, onLeave } from './side.js';
import { renderMath } from './typeset.js';

const panel = document.getElementById('wiki');
const heading = document.getElementById('wiki-title');
const body = document.getElementById('wiki-body');
const back = document.getElementById('wiki-back');
const close = document.getElementById('wiki-close');

const history = [];
let opener = null;

function show(key) {
  const entry = WIKI[key];
  if (state.zoom !== null) zoom(null);
  expand('toggle-plots');
  heading.textContent = entry.title;
  body.innerHTML = linkTerms(entry.body);
  renderMath(body);
  back.hidden = history.length < 2;
  occupy('wiki');
  panel.scrollIntoView({ block: 'nearest' });
  heading.focus({ preventScroll: true });
}

function open(key, from) {
  if (!WIKI[key] || history[history.length - 1] === key) return;
  if (!history.length) opener = from;
  history.push(key);
  show(key);
}

function previous() {
  history.pop();
  show(history[history.length - 1]);
}

function forget() {
  history.length = 0;
  opener = null;
}

function shut() {
  if (panel.hidden) return;
  const from = opener;
  occupy('plots');
  if (from && from.isConnected) from.focus();
}

export function mount() {
  onLeave('wiki', forget);
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-term]');
    if (link) open(link.dataset.term, link);
  });
  document.addEventListener('keydown', (event) => {
    const link = event.target.closest('[data-term]');
    if (!link || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    open(link.dataset.term, link);
  });
  back.addEventListener('click', previous);
  close.addEventListener('click', shut);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') shut();
  });
}
