// Dessin du schéma : placement des nœuds, flèches, pastilles. Les nœuds sont
// alignés de la présentation à l'évaluation. Les flèches de retour des deux
// boucles passent sous la ligne : de la mise à jour à la vision pour les pas,
// de la fin de session au plateau pour les sessions.

import { NODES, STEPS } from '../../content/steps.js';

const host = document.getElementById('flow');
const NS = 'http://www.w3.org/2000/svg';

const W = 116;
const H = 70;
const CUT = 9;
const GAP = 20;
const EXIT = 48;
const NODE_Y = 70;
const RETURN_Y = NODE_Y + H + 18;
const HOUSE_Y = RETURN_Y + 18;

export const INSIDE = ['session', 'boucle', 'fin'];

export const nodes = {};
export const pips = [];
export const edges = [];

function el(name, attributes = {}, parent = null) {
  const element = document.createElementNS(NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (parent) parent.appendChild(element);
  return element;
}

const chamfer = (x, y) =>
  `M ${x + CUT} ${y} H ${x + W - CUT} L ${x + W} ${y + CUT} V ${y + H - CUT} L ${x + W - CUT} ${y + H} H ${x + CUT} L ${x} ${y + H - CUT} V ${y + CUT} Z`;

function layout() {
  const place = {};
  let x = 8;
  NODES.forEach((node, i) => {
    if (i > 0) x += NODES[i - 1].phase === 'boucle' && node.phase === 'fin' ? EXIT : GAP;
    place[node.key] = { x, y: NODE_Y };
    x += W;
  });
  const top = NODE_Y - 12;
  return { place, row: NODES, top, height: HOUSE_Y + 8 - top, width: x + 8 };
}

function arrowMarker(defs, id) {
  const marker = el('marker', {
    id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7,
    orient: 'auto-start-reverse',
  }, defs);
  el('path', { d: 'M 0 1 L 9 5 L 0 9 z', class: `arrow-head ${id}` }, marker);
}

// Remplissage du nœud courant ; les teintes viennent des jetons CSS (stop-color).
function candy(defs) {
  const gradient = el('linearGradient', { id: 'candy', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: 0, class: 'stop-a' }, gradient);
  el('stop', { offset: 1, class: 'stop-b' }, gradient);
}

function edge(svg, d, to, kind = 'forward') {
  const path = el('path', { d, class: `edge edge-${kind}`, 'marker-end': 'url(#arrow)' }, svg);
  edges.push({ path, to, kind });
}

function nodeGroup(svg, node, at, goto) {
  const indices = STEPS.map((step, index) => (step.node === node.key ? index : -1)).filter((i) => i >= 0);
  const group = el('g', {
    class: `node phase-${node.phase}`,
    role: 'button',
    tabindex: 0,
    'aria-label': `${node.label}, ${indices.length} étape${indices.length > 1 ? 's' : ''}`,
  }, svg);

  el('path', { d: chamfer(at.x, at.y), class: 'node-box' }, group);
  el('text', { x: at.x + W / 2, y: at.y + 25, class: 'node-label' }, group).textContent = node.label;
  el('text', { x: at.x + W / 2, y: at.y + 44, class: 'node-caption' }, group).textContent = node.caption;

  const enter = () => goto(indices[0]);
  group.addEventListener('click', enter);
  group.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); enter(); }
  });

  if (indices.length > 1) {
    const spacing = 16;
    const first = at.x + W / 2 - ((indices.length - 1) * spacing) / 2;
    indices.forEach((index, rank) => {
      const pip = el('circle', { cx: first + rank * spacing, cy: at.y + H - 12, r: 4, class: 'pip' }, group);
      const hit = el('circle', { cx: first + rank * spacing, cy: at.y + H - 12, r: 8, class: 'pip-hit' }, group);
      el('title', {}, hit).textContent = STEPS[index].title;
      hit.addEventListener('click', (event) => { event.stopPropagation(); goto(index); });
      pips.push({ pip, index });
    });
  }

  nodes[node.key] = group;
}

export function build(goto) {
  const { place, row, top, height, width } = layout();
  const svg = el('svg', { viewBox: `0 ${top} ${width} ${height}`, class: 'flow-svg', role: 'group', 'aria-label': 'Parcours' });

  const defs = el('defs', {}, svg);
  arrowMarker(defs, 'arrow');
  arrowMarker(defs, 'arrow-on');
  candy(defs);

  const middle = NODE_Y + H / 2;
  for (let i = 0; i < row.length - 1; i += 1) {
    const from = row[i];
    const to = row[i + 1];
    const x1 = place[from.key].x + W;
    const x2 = place[to.key].x;
    edge(svg, `M ${x1} ${middle} L ${x2 - 2} ${middle}`, to.key);
    if (from.phase === 'boucle' && to.phase === 'fin') {
      el('text', { x: (x1 + x2) / 2, y: middle - 10, class: 'edge-label' }, svg).textContent = 'mort';
    }
  }

  const loop = row.filter((node) => node.phase === 'boucle');
  const head = place[loop[0].key];
  const tail = place[loop[loop.length - 1].key];
  edge(svg, `M ${tail.x + W / 2} ${tail.y + H} V ${RETURN_Y} H ${head.x + W / 2} V ${head.y + H + 2}`, loop[0].key, 'return');

  // Boucle des sessions : de la fin de session au plateau.
  const start = place[row.find((node) => node.phase === 'session').key];
  const end = place[row.find((node) => node.phase === 'fin').key];
  edge(svg, `M ${end.x + W / 2} ${end.y + H} V ${HOUSE_Y} H ${start.x + W / 2} V ${NODE_Y + H + 2}`, row.find((node) => node.phase === 'session').key, 'session-return');

  NODES.forEach((node) => nodeGroup(svg, node, place[node.key], goto));
  host.appendChild(svg);
}
