//   node docs/demo/scripts/verifie_portage.mjs

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { Board, DIRECTIONS } from '../src/sim/board.js';
import { TableAgent } from '../src/sim/agents.js';
import { ACTIONS, code, sights, stateOf } from '../src/sim/interpreter.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const python = process.env.PYTHON || `${root}.venv/bin/python`;
const cases = JSON.parse(execFileSync(python, [`${root}docs/demo/scripts/cas_portage.py`], { maxBuffer: 1 << 28 }).toString());

const NAMES = { UP: 'haut', LEFT: 'gauche', DOWN: 'bas', RIGHT: 'droite' };
const EVENTS = { moved: 'moved', green: 'green', red: 'red', dead: 'dead' };

function boardOf(item) {
  const board = Object.create(Board.prototype);
  Object.assign(board, {
    width: 10,
    height: 10,
    rng: { pick: (items) => items[0], below: () => 0, random: () => 0 },
    hungerLimit: 200,
    direction: DIRECTIONS.find((direction) => direction.name === NAMES[item.direction]),
    body: item.body.map(([x, y]) => ({ x, y })),
    tail: { x: item.tail[0], y: item.tail[1] },
    apples: item.apples.map(([x, y, color]) => ({ position: { x, y }, color })),
    moves: 0,
    hunger: item.hunger,
    longest: item.body.length,
    over: false,
    cause: null,
  });
  return board;
}

const faults = [];
cases.boards.forEach((item, i) => {
  const board = boardOf(item);
  if (sights(board).join('|') !== item.sights.join('|')) faults.push(`plateau ${i} : vision ${sights(board).join('|')} au lieu de ${item.sights.join('|')}`);
  if (stateOf(board) !== code(item.state)) faults.push(`plateau ${i} : état ${stateOf(board)} au lieu de ${code(item.state)} (${item.state})`);
  const event = board.step(ACTIONS[item.action]);
  if (event !== EVENTS[item.event]) faults.push(`plateau ${i} : événement ${event} au lieu de ${item.event}`);
  const after = board.body.map((cell) => `${cell.x},${cell.y}`).join(' ');
  const expected = item.after.map(([x, y]) => `${x},${y}`).join(' ');
  if (after !== expected) faults.push(`plateau ${i} : corps ${after} au lieu de ${expected}`);
});

cases.updates.forEach((item, i) => {
  const agent = new TableAgent();
  agent.table.set(item.values, 0);
  agent.table.set(item.next, 4);
  const { after } = agent.learn(0, item.action, item.reward, item.terminal ? null : 1);
  if (Math.abs(after - item.after) > 1e-12) faults.push(`mise à jour ${i} : ${after} au lieu de ${item.after}`);
});

faults.slice(0, 20).forEach((line) => console.error(line));
console.log(`${cases.boards.length} plateaux, ${cases.updates.length} mises à jour, ${faults.length} écart${faults.length > 1 ? 's' : ''}`);
process.exit(faults.length ? 1 : 0);
