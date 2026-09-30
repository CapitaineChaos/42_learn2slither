// Le plateau de 10 × 10 cases : murs, pommes, serpent, et les quatre lignes
// de la vision tirées depuis la tête. La ligne de l'action choisie est tracée
// dans la couleur d'accent.

import { ACTIONS } from '../sim/interpreter.js';
import { SIZE } from '../sim/training.js';
import { INDEX, LAST, SUMMARY, frameAt } from '../run.js';
import { afterAction, pictureAt } from './board.js';

export const EVENTS_END = { mur: 'mur', corps: 'corps', rouge: 'pomme rouge', piège: 'piège', faim: 'faim' };

function geometry(w, h) {
  const cell = Math.floor(Math.min(w, h) / (SIZE + 1));
  const side = cell * SIZE;
  return { cell, left: Math.round((w - side) / 2), top: Math.round((h - side) / 2), side };
}

export function drawBoard(ctx, w, h, p, picture, { action = null, dead = false } = {}) {
  const { cell, left, top, side } = geometry(w, h);
  const at = (x, y) => [left + x * cell + cell / 2, top + y * cell + cell / 2];

  ctx.fillStyle = p.sunk;
  ctx.fillRect(left, top, side, side);
  ctx.strokeStyle = p.grid;
  ctx.lineWidth = 1;
  for (let k = 1; k < SIZE; k += 1) {
    ctx.beginPath();
    ctx.moveTo(left + k * cell + 0.5, top);
    ctx.lineTo(left + k * cell + 0.5, top + side);
    ctx.moveTo(left, top + k * cell + 0.5);
    ctx.lineTo(left + side, top + k * cell + 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = p.wall;
  ctx.lineWidth = 3;
  ctx.strokeRect(left - 1.5, top - 1.5, side + 3, side + 3);

  if (action !== null) {
    const [hx, hy] = at(picture.body[0].x, picture.body[0].y);
    ACTIONS.forEach((direction, a) => {
      const steps = direction.dx ? (direction.dx > 0 ? SIZE - 1 - picture.body[0].x : picture.body[0].x)
        : (direction.dy > 0 ? SIZE - 1 - picture.body[0].y : picture.body[0].y);
      ctx.strokeStyle = a === action ? p.accent : p.edge;
      ctx.lineWidth = a === action ? 2.5 : 1.25;
      ctx.setLineDash(a === action ? [] : [4, 4]);
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + direction.dx * (steps + 0.5) * cell, hy + direction.dy * (steps + 0.5) * cell);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  picture.apples.forEach((apple) => {
    const [x, y] = at(apple.position.x, apple.position.y);
    ctx.fillStyle = apple.color === 'green' ? p.appleGreen : p.appleRed;
    ctx.beginPath();
    ctx.arc(x, y, cell * 0.32, 0, 6.284);
    ctx.fill();
  });

  const inset = Math.max(2, cell * 0.12);
  for (let i = picture.body.length - 1; i >= 0; i -= 1) {
    const part = picture.body[i];
    ctx.fillStyle = i === 0 ? p.snakeHead : p.snake;
    ctx.fillRect(left + part.x * cell + inset, top + part.y * cell + inset, cell - 2 * inset, cell - 2 * inset);
  }

  if (dead) {
    const [x, y] = at(picture.body[0].x, picture.body[0].y);
    ctx.strokeStyle = p.alert;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, cell * 0.62, 0, 6.284);
    ctx.stroke();
  }
}

export const plateau = {
  key: 'plateau',
  label: 'Plateau',

  draw(ctx, w, h, p, t) {
    drawBoard(ctx, w, h, p, pictureAt(t), {
      action: afterAction() ? null : frameAt(t).action,
      dead: afterAction() && t >= LAST,
    });
  },

  describe(t) {
    const picture = pictureAt(t);
    const head = picture.body[0];
    const apples = (color) => picture.apples.filter((apple) => apple.color === color)
      .map((apple) => `(${apple.position.x}, ${apple.position.y})`).join(' et ');
    const moment = afterAction() ? 'après l\'action' : 'avant l\'action';
    const end = afterAction() && t >= LAST ? ` Fin de session : ${EVENTS_END[SUMMARY.cause]}.` : '';
    return `Plateau de ${SIZE} × ${SIZE} cases, session ${INDEX + 1}, pas ${t + 1}, ${moment}. Serpent de longueur ${picture.body.length}, tête en (${head.x}, ${head.y}). Pommes vertes en ${apples('green') || 'aucune case'}, pomme rouge en ${apples('red') || 'aucune case'}.${end}`;
  },
};
