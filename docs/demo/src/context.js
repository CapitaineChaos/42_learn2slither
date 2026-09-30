// Valeurs que les textes du cours peuvent citer. Les nombres ne sont jamais
// écrits en dur dans le contenu. Ils sont calculés ici, au moment de l'appel,
// pour la méthode, la session et le pas affichés.

import { config } from './config.js';
import { ALPHA, EPSILON_DECAY, EPSILON_MIN, GAMMA, HIDDEN, INPUTS, RATE, epsilonAt } from './sim/agents.js';
import { ACTIONS, STATES, symbolsOf } from './sim/interpreter.js';
import { CHECKPOINTS, GAMES, HUNGER, SESSIONS, SIZE } from './sim/training.js';
import { FINAL, FRAMES, INDEX, LAST, METHOD, METHOD_LABELS, RUNS, SUMMARY, frameAt } from './run.js';

export const signed = (value, digits = 2) => `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(digits)}`;
export const epsilonText = (value) => (value >= 0.01 ? value.toFixed(3) : value.toFixed(4));

const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}` : items[0]);

export const EVENTS = { moved: 'déplacement sans pomme', green: 'pomme verte mangée', red: 'pomme rouge mangée', dead: 'mort' };
export const CAUSES = {
  mur: 'Le serpent heurte un mur',
  corps: 'Le serpent heurte son propre corps',
  rouge: 'Une pomme rouge ramène le serpent à la longueur 0',
  piège: 'Toutes les cases voisines de la tête sont bloquées',
  faim: `${HUNGER * SIZE * SIZE} pas sans pomme verte`,
};

// Premier nombre de sessions pour lequel ε atteint son plancher.
const FLOOR_SESSION = Math.ceil(Math.log(EPSILON_MIN) / Math.log(EPSILON_DECAY));

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

function slices(method) {
  const lengths = RUNS[method].sessions.map((session) => session.longest);
  const out = [];
  for (let start = 0; start < lengths.length; start += 100) out.push(mean(lengths.slice(start, start + 100)));
  return out;
}

export function buildContext(t) {
  const frame = frameAt(t);
  let total = 0;
  let greens = 0;
  for (let i = 0; i <= Math.min(t, LAST); i += 1) {
    total += FRAMES[i].reward;
    if (FRAMES[i].event === 'green') greens += 1;
  }
  const update = frame.update || { target: 0, before: 0, after: 0 };
  const other = METHOD === 'table' ? 'network' : 'table';
  const evaluations = (method) => [...CHECKPOINTS, SESSIONS].map((sessions) => ({ sessions, ...RUNS[method].evaluations[sessions] }));

  return {
    t,
    last: LAST,
    table: config.method === 'table',
    method: METHOD,
    methodLabel: METHOD_LABELS[METHOD],
    otherLabel: other === 'table' ? 'la table Q' : 'le réseau de neurones',
    session: INDEX + 1,
    trained: INDEX,
    sessions: SESSIONS,
    size: SIZE,
    hungerLimit: HUNGER * SIZE * SIZE,
    games: GAMES,
    states: STATES,
    inputs: INPUTS,
    hidden: HIDDEN,
    alpha: ALPHA,
    gamma: GAMMA,
    rate: RATE,
    decay: EPSILON_DECAY,
    floor: EPSILON_MIN,
    floorSession: FLOOR_SESSION + 1,
    epsilon100: epsilonText(epsilonAt(100)),
    epsilon: epsilonText(SUMMARY.epsilon),
    nextEpsilon: epsilonText(epsilonAt(INDEX + 1)),
    lines: frame.lines,
    symbols: symbolsOf(frame.state),
    state: frame.state,
    values: frame.values.map((value) => signed(value)),
    rawValues: frame.values,
    action: frame.action,
    actionName: ACTIONS[frame.action].name,
    best: ACTIONS[frame.values.indexOf(Math.max(...frame.values))].name,
    explored: frame.explored,
    event: frame.event,
    eventText: frame.event === 'dead' && frame.cause === 'faim' ? 'mort de faim' : EVENTS[frame.event],
    reward: frame.reward,
    rewardText: signed(frame.reward, frame.reward === -0.1 ? 1 : 0),
    terminal: frame.next === null,
    nextSymbols: frame.next === null ? null : symbolsOf(frame.next),
    nextValues: frame.nextValues ? frame.nextValues.map((value) => signed(value)) : null,
    nextMax: frame.nextValues ? signed(Math.max(...frame.nextValues), 3) : null,
    target: signed(update.target, 3),
    before: signed(update.before, 3),
    after: signed(update.after, 3),
    gap: signed(update.target - update.before, 3),
    length: frame.length,
    total: total.toFixed(1),
    greens,
    head: frame.picture.body[0],
    direction: frame.picture.direction.name,
    final: FINAL,
    steps: SUMMARY.steps,
    frames: LAST + 1,
    longest: SUMMARY.longest,
    sessionTotal: SUMMARY.total.toFixed(1),
    sessionGreens: SUMMARY.greens,
    sessionReds: SUMMARY.reds,
    cause: CAUSES[SUMMARY.cause],
    slices: slices(METHOD).map((value) => value.toFixed(1)),
    otherSlices: slices(other).map((value) => value.toFixed(1)),
    evaluations: evaluations(METHOD),
    otherEvaluations: evaluations(other),
    list,
  };
}
