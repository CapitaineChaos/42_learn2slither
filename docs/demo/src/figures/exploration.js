// ε en fonction du nombre de sessions déjà jouées, avec la session affichée.

import { INDEX } from '../run.js';
import { epsilonAt } from '../sim/agents.js';
import { SESSIONS } from '../sim/training.js';
import { clip, frame, grid } from './canevas.js';

const SPAN = 300;

export const exploration = {
  key: 'exploration',
  label: 'Exploration ε',

  draw(ctx, w, h, p) {
    const f = frame(w, h, { l: 46, r: 20, t: 12, b: 34 });
    const right = Math.max(SPAN, Math.min(SESSIONS, INDEX + 50));
    grid(ctx, p, f, 0, right, 0, 1.05, 'sessions jouées', 'ε');
    clip(ctx, f, () => {
      ctx.strokeStyle = p.trace;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let n = 0; n <= right; n += 1) {
        const x = f.x(n, 0, right);
        const y = f.y(epsilonAt(n), 0, 1.05);
        if (n === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = p.accent;
      ctx.beginPath();
      ctx.arc(f.x(INDEX, 0, right), f.y(epsilonAt(INDEX), 0, 1.05), 5, 0, 6.284);
      ctx.fill();
    });
  },

  describe() {
    return `ε en fonction du nombre de sessions déjà jouées, de 1 au départ à 0.001 au plancher. Session affichée : ${INDEX + 1}, ε = ${epsilonAt(INDEX).toFixed(4)}.`;
  },
};
