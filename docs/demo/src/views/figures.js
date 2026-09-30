// Les sept figures en colonne latérale : une figure de tête, les six autres en
// miniatures. Un clic, Entrée ou Espace sur une miniature la met en tête. Sur
// la figure de tête, la même action l'ouvre en superposition sur la page.
// Fermer, un clic à côté ou Échap la referment. Le changement d'étape ne
// modifie pas la figure de tête. Il encadre la miniature que l'étape commente.
//
// describe() ne sert plus qu'au nom accessible du canevas ; note(), quand une
// figure en déclare une, porte le paramètre que le tracé fixe.

import { STEPS } from '../content/steps.js';
import { FIGURES, figureFor } from '../figures/index.js';
import { palette } from '../figures/canevas.js';
import { on, state } from '../state.js';

const app = document.getElementById('app');
const plots = document.getElementById('plots');

let head = FIGURES[0].key;
const close = document.getElementById('plots-close');
const scrim = document.getElementById('scrim');
const canvases = {};
const notes = {};

const step = () => STEPS[state.step];

function paintOne(key) {
  const target = canvases[key];
  const box = target.parentElement;
  const w = Math.round(box.clientWidth);
  const h = Math.round(box.clientHeight);
  if (w < 8 || h < 8) return;
  const figure = figureFor(key);

  if (figure.dom) {
    figure.render(target, palette(), state.t, { full: state.zoom === key, width: w - 6, height: h - 6 });
  } else {
    const ratio = window.devicePixelRatio || 1;
    target.width = Math.round(w * ratio);
    target.height = Math.round(h * ratio);
    const ctx = target.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    figure.draw(ctx, w, h, palette(), state.t);
  }

  target.setAttribute('aria-label', figure.describe(state.t));
  if (figure.note) notes[key].textContent = figure.note(state.t);
}

export function paint() {
  if (state.zoom) paintOne(state.zoom);
  else FIGURES.forEach((figure) => paintOne(figure.key));
}

// La figure que l'étape commente est marquée. La figure de tête ne change que
// sur un clic.
export function follow() {
  const pointed = step().plot;
  document.querySelectorAll('.plot').forEach((card) => {
    card.classList.toggle('spot', card.dataset.plot === pointed);
  });
  paint();
}

function label(card) {
  const name = figureFor(card.dataset.plot).label;
  if (state.zoom !== null) return name;
  return card.dataset.plot === head ? `Agrandir la figure ${name}` : `Afficher en tête la figure ${name}`;
}

function relabel() {
  document.querySelectorAll('.plot').forEach((card) => {
    if (state.zoom === null) card.setAttribute('tabindex', '0');
    else card.removeAttribute('tabindex');
    card.setAttribute('aria-label', label(card));
  });
}

function lead(key) {
  head = key;
  document.querySelectorAll('.plot').forEach((card) => {
    card.classList.toggle('head', card.dataset.plot === key);
  });
  relabel();
  requestAnimationFrame(paint);
}

export function zoom(key) {
  state.zoom = key;
  plots.classList.toggle('zoomed', key !== null);
  app.classList.toggle('zoomed', key !== null);
  close.hidden = key === null;
  scrim.hidden = key === null;
  document.querySelectorAll('.plot').forEach((card) => {
    card.classList.toggle('active', card.dataset.plot === key);
  });
  relabel();
  requestAnimationFrame(paint);
}

// La figure mise en tête est ramenée dans la vue : en haut de la colonne quand
// celle-ci défile seule, sinon en haut de la page si elle en est sortie.
function reveal() {
  const column = plots.parentElement;
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (column.scrollHeight > column.clientHeight) {
    column.scrollTo({ top: 0, behavior });
    return;
  }
  const card = plots.querySelector('.plot.head');
  if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: 'start', behavior });
}

// Une miniature passe en tête. La figure de tête s'ouvre en grand.
function press(card) {
  if (state.zoom !== null) return;
  if (card.dataset.plot === head) zoom(head);
  else {
    lead(card.dataset.plot);
    reveal();
  }
}

export function mount() {
  document.querySelectorAll('[data-canvas]').forEach((element) => {
    canvases[element.dataset.canvas] = element;
  });
  document.querySelectorAll('.plot-note').forEach((element) => {
    notes[element.dataset.note] = element;
  });

  document.querySelectorAll('.plot').forEach((card) => {
    card.addEventListener('click', () => press(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        press(card);
      }
    });
  });

  close.addEventListener('click', () => zoom(null));
  scrim.addEventListener('click', () => zoom(null));

  new ResizeObserver(() => paint()).observe(plots);

  // Un changement de passage émet aussi 'iteration', donc un seul dessin suffit.
  on('iteration', paint);
  on('step', follow);
  lead(head);
}
