// La vision telle que le sujet l'affiche au terminal : la colonne et la ligne
// de la tête, du mur au mur, H pour la tête.

import { frameAt } from '../run.js';

const COLORS = (p) => ({ W: p.inkFaint, S: p.snake, G: p.appleGreen, R: p.appleRed, H: p.accentText, 0: p.inkSoft });

export function cross(lines) {
  const [up, left, down, right] = lines;
  const column = [...up].reverse();
  const row = `${[...left].reverse().join('')}H${right}`;
  const x = left.length;
  return { rows: [...column, row, ...down], headRow: column.length, x, row };
}

export const vision = {
  key: 'vision',
  label: 'Vision',

  draw(ctx, w, h, p, t) {
    const { rows, headRow, x, row } = cross(frameAt(t).lines);
    const colors = COLORS(p);
    const size = Math.floor(Math.min(h / (rows.length + 1), w / (row.length + 2)));
    const left = Math.round((w - row.length * size) / 2);
    const top = Math.round((h - rows.length * size) / 2);
    ctx.fillStyle = p.sunk;
    ctx.fillRect(left - size / 2, top - size / 2, row.length * size + size, rows.length * size + size);
    ctx.font = `600 ${Math.round(size * 0.8)}px ${p.monoFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    rows.forEach((text, r) => {
      if (r === headRow) {
        [...text].forEach((letter, c) => {
          ctx.fillStyle = colors[letter];
          ctx.fillText(letter, left + c * size + size / 2, top + r * size + size / 2);
        });
      } else {
        ctx.fillStyle = colors[text];
        ctx.fillText(text, left + x * size + size / 2, top + r * size + size / 2);
      }
    });
  },

  describe(t) {
    const [up, left, down, right] = frameAt(t).lines;
    return `Vision du serpent depuis la tête : en haut ${up}, à gauche ${left}, en bas ${down}, à droite ${right}.`;
  },
};
