// Longueur moyenne sur les parties figées pour les modèles entraînés 1, 10,
// 100 et 1000 sessions, une barre par modèle. Un tiret marque la meilleure
// partie, un point la moyenne de l'autre méthode.

import { METHOD, RUNS } from '../run.js';
import { CHECKPOINTS, SESSIONS } from '../sim/training.js';
import { frame, grid } from './canevas.js';

const MODELS = [...CHECKPOINTS, SESSIONS];

export const evaluation = {
  key: 'evaluation',
  label: 'Évaluation',

  draw(ctx, w, h, p) {
    const own = RUNS[METHOD].evaluations;
    const other = RUNS[METHOD === 'table' ? 'network' : 'table'].evaluations;
    const top = Math.max(...MODELS.map((m) => own[m].max)) * 1.1;
    const f = frame(w, h, { l: 46, r: 12, t: 12, b: 34 });
    grid(ctx, p, f, 0, MODELS.length, 0, top, '', 'longueur', true, false);
    const slot = (w - f.pad.l - f.pad.r) / MODELS.length;
    MODELS.forEach((model, i) => {
      const x = f.pad.l + slot * i + slot * 0.25;
      const width = slot * 0.5;
      const y = f.y(own[model].mean, 0, top);
      ctx.fillStyle = p.accent;
      ctx.fillRect(x, y, width, f.y(0, 0, top) - y);
      ctx.strokeStyle = p.ink;
      ctx.lineWidth = 2;
      const my = f.y(own[model].max, 0, top);
      ctx.beginPath();
      ctx.moveTo(x + width * 0.25, my);
      ctx.lineTo(x + width * 0.75, my);
      ctx.stroke();
      ctx.fillStyle = p.inkSoft;
      ctx.beginPath();
      ctx.arc(x + width / 2, f.y(other[model].mean, 0, top), 4, 0, 6.284);
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.font = p.label;
      ctx.fillText(String(model), x + width / 2, h - 16);
    });
  },

  describe() {
    const own = RUNS[METHOD].evaluations;
    const parts = MODELS.map((model) => `${model} ${model > 1 ? 'sessions' : 'session'} : ${own[model].mean.toFixed(1)}`).join(', ');
    return `Longueur moyenne sans apprentissage, par modèle : ${parts}.`;
  },
};
