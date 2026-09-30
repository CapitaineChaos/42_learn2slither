// Longueur maximale atteinte à chaque session d'entraînement, avec sa moyenne
// sur les 100 sessions précédentes. Un trait vertical marque la session
// affichée.

import { INDEX, METHOD, RUNS } from '../run.js';
import { SESSIONS } from '../sim/training.js';
import { clip, frame, grid } from './canevas.js';

const WINDOW = 100;

export function averages(lengths) {
  const out = [];
  let sum = 0;
  lengths.forEach((length, i) => {
    sum += length;
    if (i >= WINDOW) sum -= lengths[i - WINDOW];
    out.push(sum / Math.min(i + 1, WINDOW));
  });
  return out;
}

export const longueur = {
  key: 'longueur',
  label: 'Longueur par session',

  draw(ctx, w, h, p) {
    const lengths = RUNS[METHOD].sessions.map((session) => session.longest);
    const smooth = averages(lengths);
    const top = Math.max(...lengths) * 1.08;
    const f = frame(w, h, { l: 46, r: 20, t: 12, b: 34 });
    grid(ctx, p, f, 1, SESSIONS, 0, top, 'session', 'longueur');
    clip(ctx, f, () => {
      ctx.fillStyle = p.edge;
      lengths.forEach((length, i) => ctx.fillRect(f.x(i + 1, 1, SESSIONS) - 0.75, f.y(length, 0, top) - 0.75, 1.5, 1.5));
      ctx.strokeStyle = p.trace;
      ctx.lineWidth = 2;
      ctx.beginPath();
      smooth.forEach((value, i) => {
        const x = f.x(i + 1, 1, SESSIONS);
        const y = f.y(value, 0, top);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      const x = Math.round(f.x(INDEX + 1, 1, SESSIONS)) + 0.5;
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, f.pad.t);
      ctx.lineTo(x, f.h - f.pad.b);
      ctx.stroke();
    });
  },

  describe() {
    const lengths = RUNS[METHOD].sessions.map((session) => session.longest);
    const smooth = averages(lengths);
    return `Longueur maximale de chacune des ${SESSIONS} sessions d'entraînement et sa moyenne sur ${WINDOW} sessions, qui passe de ${smooth[WINDOW - 1].toFixed(1)} à la session ${WINDOW} à ${smooth[SESSIONS - 1].toFixed(1)} à la session ${SESSIONS}. Session affichée : ${INDEX + 1}, longueur ${lengths[INDEX]}.`;
  },
};
