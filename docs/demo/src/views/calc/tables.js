// Tableaux du cours : les quatre directions du pas affiché, la longueur
// moyenne par tranche de 100 sessions, et les modèles évalués.

import { NOTES, tip } from '../../content/symbols.js';
import { ACTIONS, SYMBOLS } from '../../sim/interpreter.js';
import { CHECKPOINTS, SESSIONS } from '../../sim/training.js';
import { METHOD, METHOD_LABELS, RUNS, frameAt } from '../../run.js';
import { signed } from './format.js';

const other = () => (METHOD === 'table' ? 'network' : 'table');

const DIRECTION_COLUMNS = {
  dir: { head: () => 'direction', cell: (frame, a) => ACTIONS[a].name },
  line: { head: () => tip('ligne vue', NOTES.line, true), cell: (frame, a) => `<code class="sight">${frame.lines[a]}</code>` },
  symbol: { head: () => tip('symbole', NOTES.symbol, true), cell: (frame, a) => symbolOf(frame, a) },
  digit: { head: () => tip('chiffre', NOTES.digit, true), cell: (frame, a) => SYMBOLS.indexOf(symbolOf(frame, a)) },
  weight: { head: () => tip('poids', NOTES.weight, true), cell: (frame, a) => 4 ** a },
  q: { head: () => tip('Q(s, a)', NOTES.q, true), cell: (frame, a) => signed(frame.values[a]) },
  chosen: { head: () => 'action', cell: (frame, a) => (a === frame.action ? (frame.explored ? 'hasard' : 'meilleure') : '') },
};

function symbolOf(frame, a) {
  return SYMBOLS[Math.floor(frame.state / 4 ** a) % 4];
}

function directions(spec, t) {
  const frame = frameAt(t);
  const head = spec.cols.map((col) => `<th scope="col" class="col-${col}">${DIRECTION_COLUMNS[col].head()}</th>`).join('');
  const body = ACTIONS.map((_, a) => `<tr class="${a === frame.action ? 'picked' : ''}">${spec.cols.map((col) =>
    `<td class="col-${col}">${DIRECTION_COLUMNS[col].cell(frame, a)}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table class="students">
    <caption>directions · pas ${t + 1}</caption>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;
}

function slices() {
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const lengths = (method) => RUNS[method].sessions.map((session) => session.longest);
  const own = lengths(METHOD);
  const alt = lengths(other());
  const rows = [];
  for (let start = 0; start < SESSIONS; start += 100) {
    rows.push(`<tr><td>${start + 1} à ${start + 100}</td><td>${mean(own.slice(start, start + 100)).toFixed(1)}</td>
      <td>${mean(alt.slice(start, start + 100)).toFixed(1)}</td></tr>`);
  }
  return `<div class="table-wrap"><table class="students">
    <caption>longueur moyenne par tranche de 100 sessions</caption>
    <thead><tr><th scope="col">sessions</th><th scope="col">${METHOD_LABELS[METHOD]}</th><th scope="col">${METHOD_LABELS[other()]}</th></tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table></div>`;
}

function models() {
  const own = RUNS[METHOD].evaluations;
  const alt = RUNS[other()].evaluations;
  const rows = [...CHECKPOINTS, SESSIONS].map((model) => `<tr><td>${model}</td><td>${own[model].mean.toFixed(1)}</td>
    <td>${own[model].max}</td><td>${own[model].reached}</td><td>${own[model].duration.toFixed(0)}</td>
    <td>${alt[model].mean.toFixed(1)}</td></tr>`).join('');
  return `<div class="table-wrap"><table class="students">
    <caption>parties figées · ${RUNS[METHOD].evaluations[SESSIONS].lengths.length} par modèle</caption>
    <thead><tr><th scope="col">sessions</th><th scope="col">${tip('moyenne', NOTES.mean, true)}</th>
      <th scope="col">max</th><th scope="col">${tip('≥ 10', NOTES.reached, true)}</th><th scope="col">${tip('durée', NOTES.duration, true)}</th>
      <th scope="col">${METHOD_LABELS[other()]}</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

export const TABLES = { directions, slices, models };
