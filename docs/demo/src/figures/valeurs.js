// Les quatre valeurs Q de l'état courant, une barre par action. La barre de
// l'action jouée est dans la couleur d'accent. Aux étapes de la cible et de la
// mise à jour, un trait marque la cible sur cette barre et un contour la valeur
// après correction.

import { STEPS } from '../content/steps.js';
import { ACTIONS } from '../sim/interpreter.js';
import { frameAt } from '../run.js';
import { state } from '../state.js';
import { frame as box, grid } from './canevas.js';

const correcting = () => ['cible', 'maj'].includes(STEPS[state.step].id);

function bounds(values, extra) {
  const all = [...values, ...extra, 0];
  const low = Math.min(...all);
  const high = Math.max(...all);
  const span = Math.max(high - low, 1);
  return [low - span * 0.12, high + span * 0.12];
}

export const valeurs = {
  key: 'valeurs',
  label: 'Valeurs Q',

  draw(ctx, w, h, p, t) {
    const frame = frameAt(t);
    const update = frame.update;
    const extra = correcting() && update ? [update.target, update.after] : [];
    const [low, high] = bounds(frame.values, extra);
    const f = box(w, h, { l: 52, r: 12, t: 12, b: 34 });
    grid(ctx, p, f, 0, 4, low, high, '', 'Q(s, a)', true, false);
    const zero = f.y(0, low, high);
    const slot = (w - f.pad.l - f.pad.r) / 4;
    ACTIONS.forEach((direction, a) => {
      const x = f.pad.l + slot * a + slot * 0.2;
      const width = slot * 0.6;
      const y = f.y(frame.values[a], low, high);
      ctx.fillStyle = a === frame.action ? p.accent : p.edge;
      ctx.fillRect(x, Math.min(y, zero), width, Math.max(Math.abs(zero - y), 1));
      ctx.fillStyle = p.inkSoft;
      ctx.textAlign = 'center';
      ctx.font = p.label;
      ctx.fillText(direction.name, x + width / 2, h - 16);
      if (a === frame.action && extra.length) {
        const ty = f.y(update.target, low, high);
        const ay = f.y(update.after, low, high);
        ctx.strokeStyle = p.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, ty);
        ctx.lineTo(x + width + 6, ty);
        ctx.stroke();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = p.accentText;
        ctx.strokeRect(x, Math.min(ay, zero), width, Math.max(Math.abs(zero - ay), 1));
        ctx.setLineDash([]);
      }
    });
    ctx.strokeStyle = p.inkFaint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(f.pad.l, Math.round(zero) + 0.5);
    ctx.lineTo(w - f.pad.r, Math.round(zero) + 0.5);
    ctx.stroke();
  },

  describe(t) {
    const frame = frameAt(t);
    const values = ACTIONS.map((direction, a) => `${direction.name} ${frame.values[a].toFixed(2)}`).join(', ');
    const update = correcting() && frame.update ? ` Cible ${frame.update.target.toFixed(3)}, valeur après correction ${frame.update.after.toFixed(3)}.` : '';
    return `Valeurs Q de l'état courant : ${values}. Action jouée : ${ACTIONS[frame.action].name}.${update}`;
  },
};
