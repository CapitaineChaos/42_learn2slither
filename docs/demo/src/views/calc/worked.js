// Le calcul déroulé : l'opération de l'étape, écrite avec les nombres du pas
// affiché ou de la session.

import { config } from '../../config.js';
import { ALPHA, EPSILON_DECAY, GAMMA, RATE, epsilonAt } from '../../sim/agents.js';
import { ACTIONS, SYMBOLS } from '../../sim/interpreter.js';
import { FRAMES, INDEX, LAST, SUMMARY, frameAt } from '../../run.js';
import { num, paren, signed } from './format.js';

const EVENTS = { moved: 'déplacement sans pomme', green: 'pomme verte', red: 'pomme rouge', dead: 'mort' };
const name = (a) => ACTIONS[a].name;

export const WORKED = {
  state: (t) => {
    const frame = frameAt(t);
    const digits = ACTIONS.map((_, k) => Math.floor(frame.state / 4 ** k) % 4);
    return [
      `symboles ${digits.map((d) => SYMBOLS[d]).join(' ')} → chiffres ${digits.join(' ')}`,
      `s = ${digits.map((d, k) => `${d} × ${4 ** k}`).join(' + ')} = <b>${frame.state}</b>`,
    ];
  },
  qvalues: (t) => {
    const frame = frameAt(t);
    const lines = config.method === 'table'
      ? [`ligne ${frame.state} de la table`]
      : [`entrées allumées : ${ACTIONS.map((_, k) => k * 4 + (Math.floor(frame.state / 4 ** k) % 4)).join(', ')} sur 16`];
    return [...lines, `Q(s, ·) = (${frame.values.map((value) => signed(value, 2)).join(' ; ')})`];
  },
  action: (t) => {
    const frame = frameAt(t);
    const epsilon = epsilonAt(INDEX);
    const best = frame.values.indexOf(Math.max(...frame.values));
    return [
      `ε = ${epsilon.toFixed(4)}`,
      frame.explored ? 'tirage sous ε → action au hasard' : 'tirage au-dessus de ε → meilleure action',
      frame.explored ? `action : <b>${name(frame.action)}</b>` : `argmax Q(s, ·) = ${name(best)}, Q = ${signed(frame.values[best], 2)} → <b>${name(frame.action)}</b>`,
    ];
  },
  reward: (t) => {
    const frame = frameAt(t);
    if (frame.cause === 'faim') return ['mort de faim, comptée comme un pas ordinaire → r = <b>−0.1</b>'];
    return [`${EVENTS[frame.event]} → r = <b>${signed(frame.reward, frame.event === 'moved' ? 1 : 0)}</b>`];
  },
  target: (t) => {
    const frame = frameAt(t);
    const { target } = frame.update;
    if (frame.next === null) return ['mort, fin de la session', `y = r = <b>${signed(target, 1)}</b>`];
    const best = Math.max(...frame.nextValues);
    return [
      `max Q(s′, ·) = ${signed(best)}`,
      `y = r + γ · max Q(s′, ·) = ${num(frame.reward, 1)} + ${GAMMA} × ${paren(best)} = <b>${signed(target)}</b>`,
    ];
  },
  update: (t) => {
    const frame = frameAt(t);
    const { target, before, after } = frame.update;
    const a = name(frame.action);
    if (config.method === 'table') {
      return [`Q(s, ${a}) ← Q + α · (y − Q) = ${num(before)} + ${ALPHA} × (${num(target)} − ${paren(before)}) = <b>${signed(after, 4)}</b>`];
    }
    return [
      `écart Q(s, ${a}) − y = ${num(before)} − ${paren(target)} = ${signed(before - target)}`,
      `un pas de gradient, η = ${RATE} → Q(s, ${a}) = <b>${signed(after, 4)}</b>`,
    ];
  },
  session: () => {
    let greens = 0;
    FRAMES.forEach((frame) => { if (frame.event === 'green') greens += 1; });
    return [
      `${LAST + 1} pas, longueur maximale ${SUMMARY.longest}`,
      `${greens} ${greens > 1 ? 'pommes vertes' : 'pomme verte'}, récompense totale ${num(SUMMARY.total, 1)}`,
      `ε suivant = max(0.001, ${EPSILON_DECAY}<sup>${INDEX + 1}</sup>) = <b>${epsilonAt(INDEX + 1).toFixed(4)}</b>`,
    ];
  },
};
