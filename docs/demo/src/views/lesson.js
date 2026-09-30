// Panneau de cours. Le titre, la formule, l'idée de l'étape et « En savoir
// plus » ne changent qu'avec l'étape ou le modèle ; la fiche se
// réécrit à chaque itération, sans formule. Les liens [[…]] des textes
// deviennent des termes du wiki (views/wiki.js).
//
// Au changement d'étape, le cours remonte en haut et la fiche réserve sa plus
// grande hauteur (views/steady.js). La formule a un cadre de hauteur fixe.

import { NODES, STEPS } from '../content/steps.js';
import { linkTerms } from '../content/wiki/index.js';
import { buildContext } from '../context.js';
import { INDEX } from '../run.js';
import { on, state } from '../state.js';
import { reserve } from './steady.js';
import { renderFormula, renderMath } from './typeset.js';

const scroller = document.querySelector('.lesson-scroll');
const where = document.getElementById('where');
const title = document.getElementById('title');
const formula = document.getElementById('formula');
const intro = document.getElementById('intro');
const lead = document.getElementById('lead');
const more = document.getElementById('more');
const moreBox = document.getElementById('more-box');

const step = () => STEPS[state.step];

// La position tient sur une seule ligne et se tronque plutôt que de pousser
// le titre.
function locate(current) {
  const node = NODES.find((candidate) => candidate.key === current.node);
  const siblings = STEPS.filter((candidate) => candidate.node === current.node);
  const rank = siblings.length > 1 ? ` · ${siblings.indexOf(current) + 1}/${siblings.length}` : '';
  const phase = {
    intro: '',
    session: `session ${INDEX + 1}`,
    boucle: `session ${INDEX + 1} · pas ${state.t + 1}`,
    fin: `session ${INDEX + 1}`,
    aval: 'après l\'entraînement',
  }[current.phase];
  const inside = ['session', 'boucle', 'fin'].includes(current.phase);
  const lead = phase ? `<span class="where-phase ${inside ? 'phase-boucle' : ''}">${phase}</span>` : '';
  return `${lead}<span class="where-node">${node.label}${rank}</span>`;
}

function drawLead(t) {
  lead.innerHTML = linkTerms(step().lead(buildContext(t)));
}

function renderValues() {
  drawLead(state.t);
}

function fitLead() {
  reserve(lead, drawLead, state.t);
}

function renderText() {
  const current = step();
  const context = buildContext(state.t);
  intro.innerHTML = current.intro ? linkTerms(current.intro(context)) : '';
  more.innerHTML = linkTerms(current.more(context));
  moreBox.hidden = more.textContent.trim() === '';
  if (!moreBox.hidden) renderMath(more);
}

function renderStep() {
  const current = step();
  scroller.scrollTop = 0;
  where.innerHTML = locate(current);
  title.textContent = current.title;
  renderFormula(formula, typeof current.math === 'function' ? current.math(buildContext(state.t)) : current.math);

  renderText();
  fitLead();
}

export function mount() {
  on('step', renderStep);
  on('iteration', () => {
    renderValues();
    where.innerHTML = locate(step());
  });
  on('session', () => {
    where.innerHTML = locate(step());
    renderText();
    fitLead();
  });
  renderStep();

  // La hauteur réservée dépend de la largeur de la colonne.
  let width = scroller.clientWidth;
  new ResizeObserver(() => {
    if (scroller.clientWidth === width) return;
    width = scroller.clientWidth;
    fitLead();
  }).observe(scroller);
}
