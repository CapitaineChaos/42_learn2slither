// Les 256 états en grille de 16 × 16. La ligne porte les symboles vus en bas
// et à droite, la colonne ceux vus en haut et à gauche. Dans chaque case, une
// flèche indique la meilleure action et la teinte la valeur de cette action.
// Une case vide est un état dont la table n'a encore aucune valeur. L'état
// courant est entouré. L'agent est celui du début de la session.

import { ACTIONS, STATES } from '../sim/interpreter.js';
import { AGENT, METHOD, frameAt } from '../run.js';
import { mix } from './canevas.js';

function field() {
  const values = [];
  for (let s = 0; s < STATES; s += 1) values.push(AGENT.values(s));
  return values;
}

let cache = null;

export const politique = {
  key: 'politique',
  label: 'Politique',

  draw(ctx, w, h, p, t) {
    if (!cache || cache.agent !== AGENT) cache = { agent: AGENT, values: field() };
    const { values } = cache;
    const best = values.map((row) => Math.max(...row));
    const low = Math.min(...best);
    const high = Math.max(...best);
    const cell = Math.floor(Math.min(w, h) / 16.5);
    const left = Math.round((w - cell * 16) / 2);
    const top = Math.round((h - cell * 16) / 2);
    const current = frameAt(t).state;
    for (let s = 0; s < STATES; s += 1) {
      const x = left + (s % 16) * cell;
      const y = top + Math.floor(s / 16) * cell;
      const empty = METHOD === 'table' && values[s].every((value) => value === 0);
      ctx.fillStyle = empty ? p.surface : mix(p.sunk, p.accent, high > low ? 0.15 + 0.75 * ((best[s] - low) / (high - low)) : 0.4);
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      if (empty) continue;
      const action = values[s].indexOf(best[s]);
      const { dx, dy } = ACTIONS[action];
      const cx = x + cell / 2;
      const cy = y + cell / 2;
      ctx.strokeStyle = p.ink;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(cx - dx * cell * 0.28, cy - dy * cell * 0.28);
      ctx.lineTo(cx + dx * cell * 0.28, cy + dy * cell * 0.28);
      ctx.stroke();
      ctx.fillStyle = p.ink;
      ctx.beginPath();
      ctx.arc(cx + dx * cell * 0.28, cy + dy * cell * 0.28, Math.max(1.5, cell * 0.09), 0, 6.284);
      ctx.fill();
    }
    const x = left + (current % 16) * cell;
    const y = top + Math.floor(current / 16) * cell;
    ctx.strokeStyle = p.alert;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cell, cell);
  },

  describe(t) {
    if (!cache || cache.agent !== AGENT) cache = { agent: AGENT, values: field() };
    const known = cache.values.filter((row) => row.some((value) => value !== 0)).length;
    const state = frameAt(t).state;
    const action = ACTIONS[cache.values[state].indexOf(Math.max(...cache.values[state]))].name;
    const count = METHOD === 'table' ? ` ${known} états sur ${STATES} ont déjà une valeur.` : '';
    return `Politique de l'agent au début de la session : meilleure action pour chacun des ${STATES} états.${count} Pour l'état courant, la meilleure action est ${action}.`;
  },

  note: () => 'début de session',
};
