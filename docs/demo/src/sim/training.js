// Sessions d'entraînement et parties d'évaluation, comme game/training.py :
// plateau 10 × 10 en Hard, limite de faim de 2 × largeur × hauteur pas, ε
// calculé sur le nombre de sessions déjà jouées. Une mort de faim arrête la
// session, mais la mise à jour la traite comme un pas ordinaire : le serpent
// ne voit pas le compteur de faim, et le −100 punirait une action qui n'y est
// pour rien.

import { Board } from './board.js';
import { ACTIONS, REWARDS, sights, stateOf } from './interpreter.js';
import { NetworkAgent, TableAgent, epsilonAt } from './agents.js';
import { generator, seedOf } from './random.js';

export const SIZE = 10;
export const HUNGER = 2;
export const SESSIONS = 1000;
export const CHECKPOINTS = [1, 10, 100];
export const GAMES = 100;

// Graine de l'entraînement affiché, retenue parmi cinq pour ses résultats proches
// de la moyenne (README).
export const RUN = 11;

const newBoard = (seed) => new Board(SIZE, SIZE, generator(seed), HUNGER * SIZE * SIZE);

// Une partie jusqu'à la mort. Avec record, chaque pas garde ce que le cours
// affiche : plateau avant le pas, vision, état, valeurs Q, action, événement,
// récompense et mise à jour.
export function play(agent, board, rng, { learning, epsilon, record }) {
  const frames = [];
  let total = 0;
  let greens = 0;
  let reds = 0;
  while (!board.over) {
    const picture = record ? board.picture() : null;
    const lines = record ? sights(board) : null;
    const state = stateOf(board);
    const values = record ? agent.values(state) : null;
    const { action, explored } = agent.act(state, learning, epsilon, rng);
    const event = board.step(ACTIONS[action]);
    const starved = board.cause === 'faim';
    const reward = starved ? REWARDS.moved : REWARDS[event];
    total += reward;
    if (event === 'green') greens += 1;
    if (event === 'red') reds += 1;
    const next = board.over && !starved ? null : stateOf(board);
    const nextValues = record && next !== null ? agent.values(next) : null;
    const update = learning ? agent.learn(state, action, reward, next) : null;
    if (record) {
      frames.push({ picture, lines, state, values, action, explored, event, cause: board.cause, reward, next, nextValues, update, length: picture.body.length });
    }
  }
  return { frames, final: record ? board.picture() : null, cause: board.cause, longest: board.longest, steps: board.moves, total, greens, reds };
}

export function createAgent(method) {
  return method === 'table' ? new TableAgent() : NetworkAgent.initial(generator(seedOf(9, RUN)));
}

export const restore = (method, snapshot) => (method === 'table' ? TableAgent.restore(snapshot) : NetworkAgent.restore(snapshot));

export function session(agent, index, record = false) {
  const epsilon = epsilonAt(index);
  const board = newBoard(seedOf(1, index, RUN));
  return { epsilon, ...play(agent, board, generator(seedOf(2, index, RUN)), { learning: true, epsilon, record }) };
}

export function test(agent, seed) {
  return play(agent, newBoard(seedOf(5, seed)), generator(seedOf(6, seed)), { learning: false, epsilon: 0, record: true });
}

// Parties figées : mêmes plateaux pour chaque modèle, action la meilleure,
// aucune mise à jour.
export function evaluate(agent, games = GAMES) {
  const lengths = [];
  const durations = [];
  let starved = 0;
  for (let g = 0; g < games; g += 1) {
    const run = play(agent, newBoard(seedOf(3, g)), generator(seedOf(4, g)), { learning: false, epsilon: 0, record: false });
    lengths.push(run.longest);
    durations.push(run.steps);
    if (run.cause === 'faim') starved += 1;
  }
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    mean: mean(lengths),
    max: Math.max(...lengths),
    reached: lengths.filter((length) => length >= 10).length,
    duration: mean(durations),
    starved,
    lengths,
  };
}
