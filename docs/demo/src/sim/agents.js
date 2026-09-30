// Les deux représentations de la fonction Q que le sujet autorise. La table
// est le portage de game/agent.py. Le réseau lit le même état, encodé en
// 16 entrées binaires, et apprend avec la même cible.

import { ACTIONS, STATES, SYMBOLS } from './interpreter.js';

export const ALPHA = 0.1;
export const GAMMA = 0.9;
export const EPSILON_DECAY = 0.99;
export const EPSILON_MIN = 0.001;

export const HIDDEN = 16;
export const RATE = 0.001;
export const INPUTS = ACTIONS.length * SYMBOLS.length;

const A = ACTIONS.length;

export const epsilonAt = (sessions) => Math.max(EPSILON_MIN, EPSILON_DECAY ** sessions);

// Meilleure action, égalités départagées au hasard comme dans agent.py.
function greedy(values, rng) {
  const best = Math.max(...values);
  const choices = [];
  values.forEach((value, action) => { if (value === best) choices.push(action); });
  return rng.pick(choices);
}

function choose(agent, state, explore, epsilon, rng) {
  if (explore && rng.random() < epsilon) return { action: rng.below(A), explored: true };
  return { action: greedy(agent.values(state), rng), explored: false };
}

export class TableAgent {
  constructor(table = new Float64Array(STATES * A)) {
    this.table = table;
  }

  values(state) {
    return Array.from(this.table.subarray(state * A, state * A + A));
  }

  act(state, explore, epsilon, rng) {
    return choose(this, state, explore, epsilon, rng);
  }

  learn(state, action, reward, next) {
    const target = next === null ? reward : reward + GAMMA * Math.max(...this.values(next));
    const index = state * A + action;
    const before = this.table[index];
    this.table[index] = before + ALPHA * (target - before);
    return { target, before, after: this.table[index] };
  }

  snapshot() {
    return this.table.slice();
  }

  static restore(snapshot) {
    return new TableAgent(snapshot.slice());
  }
}

// Entrée k·4 + s allumée quand la direction k montre le symbole s.
export function inputsOf(state) {
  return ACTIONS.map((_, k) => k * SYMBOLS.length + (Math.floor(state / 4 ** k) % 4));
}

export class NetworkAgent {
  constructor(weights) {
    this.w1 = weights.w1;
    this.b1 = weights.b1;
    this.w2 = weights.w2;
    this.b2 = weights.b2;
  }

  static initial(rng) {
    const uniform = (count, scale) => Float64Array.from({ length: count }, () => (rng.random() * 2 - 1) * scale);
    return new NetworkAgent({
      w1: uniform(INPUTS * HIDDEN, 0.5),
      b1: new Float64Array(HIDDEN),
      w2: uniform(HIDDEN * A, 0.1),
      b2: new Float64Array(A),
    });
  }

  forward(state) {
    const active = inputsOf(state);
    const hidden = new Float64Array(HIDDEN);
    for (let j = 0; j < HIDDEN; j += 1) {
      let sum = this.b1[j];
      for (const i of active) sum += this.w1[i * HIDDEN + j];
      hidden[j] = Math.max(0, sum);
    }
    const output = Array.from(this.b2);
    for (let j = 0; j < HIDDEN; j += 1) {
      if (hidden[j] === 0) continue;
      for (let a = 0; a < A; a += 1) output[a] += hidden[j] * this.w2[j * A + a];
    }
    return { active, hidden, output };
  }

  values(state) {
    return this.forward(state).output;
  }

  act(state, explore, epsilon, rng) {
    return choose(this, state, explore, epsilon, rng);
  }

  // Un pas de gradient sur ½ (Q(s, a) − cible)², pour la seule sortie a.
  learn(state, action, reward, next) {
    const target = next === null ? reward : reward + GAMMA * Math.max(...this.values(next));
    const { active, hidden, output } = this.forward(state);
    const before = output[action];
    const delta = before - target;
    for (let j = 0; j < HIDDEN; j += 1) {
      if (hidden[j] === 0) continue;
      const back = delta * this.w2[j * A + action];
      this.w2[j * A + action] -= RATE * delta * hidden[j];
      this.b1[j] -= RATE * back;
      for (const i of active) this.w1[i * HIDDEN + j] -= RATE * back;
    }
    this.b2[action] -= RATE * delta;
    return { target, before, after: this.values(state)[action] };
  }

  snapshot() {
    return { w1: this.w1.slice(), b1: this.b1.slice(), w2: this.w2.slice(), b2: this.b2.slice() };
  }

  static restore(snapshot) {
    return new NetworkAgent({ w1: snapshot.w1.slice(), b1: snapshot.b1.slice(), w2: snapshot.w2.slice(), b2: snapshot.b2.slice() });
  }
}
