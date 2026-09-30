// Portage de game/interpreter.py : vision depuis la tête, état en quatre
// symboles, récompenses. L'ordre des actions est celui du code Python : haut,
// gauche, bas, droite.

import { DOWN, LEFT, RIGHT, UP } from './board.js';

export const ACTIONS = [UP, LEFT, DOWN, RIGHT];
export const SYMBOLS = ['0', 'G', 'R', 'D'];
export const STATES = SYMBOLS.length ** ACTIONS.length;

export const REWARDS = { moved: -0.1, green: 10, red: -10, dead: -100 };

// Grille des cases occupées : S pour le corps, G et R pour les pommes.
function grid(board) {
  const cells = new Array(board.width * board.height).fill('0');
  board.apples.forEach((apple) => { cells[apple.position.y * board.width + apple.position.x] = apple.color === 'green' ? 'G' : 'R'; });
  board.body.forEach((cell) => { cells[cell.y * board.width + cell.x] = 'S'; });
  return cells;
}

function line(board, cells, direction) {
  let text = '';
  let x = board.head.x + direction.dx;
  let y = board.head.y + direction.dy;
  while (x >= 0 && x < board.width && y >= 0 && y < board.height) {
    text += cells[y * board.width + x];
    x += direction.dx;
    y += direction.dy;
  }
  return `${text}W`;
}

export const sight = (board, direction) => line(board, grid(board), direction);

export function sights(board) {
  const cells = grid(board);
  return ACTIONS.map((direction) => line(board, cells, direction));
}

export function glance(line) {
  if ('WS'.includes(line[0])) return 'D';
  if (line[0] === 'R') return 'R';
  for (const letter of line) {
    if ('WS'.includes(letter)) return '0';
    if (letter === 'G') return 'G';
  }
  return '0';
}

// Numéro de l'état : les quatre symboles lus comme un nombre en base 4, le
// symbole du haut en poids faible.
export const code = (symbols) => [...symbols].reduce((sum, symbol, k) => sum + SYMBOLS.indexOf(symbol) * 4 ** k, 0);
export const symbolsOf = (state) => ACTIONS.map((_, k) => SYMBOLS[Math.floor(state / 4 ** k) % 4]).join('');

export const stateOf = (board) => code(sights(board).map(glance).join(''));
