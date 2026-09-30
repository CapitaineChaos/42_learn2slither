// Les deux entraînements, un par méthode, calculés au chargement par compute().
// Pour chaque session, le résumé (longueur, pas, récompense, ε) et l'agent au
// début de la session. Les modèles après 1, 10, 100 et 1000 sessions sont
// évalués sur des parties figées.
//
// useSession() rejoue une session à partir de l'agent enregistré à son début,
// pas par pas, et l'expose par des liaisons vivantes, lues par les vues au
// moment de dessiner.

import { CHECKPOINTS, SESSIONS, createAgent, evaluate, restore, session } from './sim/training.js';

export const METHODS = ['table', 'network'];
export const METHOD_LABELS = { table: 'table Q', network: 'réseau de neurones' };

export const RUNS = {};

export async function compute(report) {
  for (const method of METHODS) {
    const agent = createAgent(method);
    const sessions = [];
    const evaluations = {};
    for (let index = 0; index < SESSIONS; index += 1) {
      if (index % 100 === 0) await report({ kind: 'train', method, index });
      if (CHECKPOINTS.includes(index)) evaluations[index] = evaluate(restore(method, agent.snapshot()));
      const snapshot = agent.snapshot();
      const { epsilon, longest, steps, total, greens, reds, cause } = session(agent, index);
      sessions.push({ snapshot, epsilon, longest, steps, total, greens, reds, cause });
    }
    evaluations[SESSIONS] = evaluate(agent);
    RUNS[method] = { sessions, evaluations, agent };
    await report({ kind: 'evaluate', method });
  }
}

export let METHOD;
export let INDEX;
export let FRAMES;
export let FINAL;
export let LAST;
export let AGENT;
export let SUMMARY;

export function useMethod(method) {
  METHOD = method;
}

// Les dernières sessions rejouées restent en mémoire : revenir sur l'une d'elles
// ne la rejoue pas.
const replays = new Map();
const KEPT = 24;

function replayOf(index) {
  const key = `${METHOD}:${index}`;
  if (replays.has(key)) {
    const replay = replays.get(key);
    replays.delete(key);
    replays.set(key, replay);
    return replay;
  }
  const replay = session(restore(METHOD, RUNS[METHOD].sessions[index].snapshot), index, true);
  replays.set(key, replay);
  if (replays.size > KEPT) replays.delete(replays.keys().next().value);
  return replay;
}

// Rejoue la session index. AGENT est l'agent au début de la session, avant
// tout apprentissage de celle-ci.
export function useSession(index) {
  const record = RUNS[METHOD].sessions[index];
  const replay = replayOf(index);
  INDEX = index;
  FRAMES = replay.frames;
  FINAL = replay.final;
  LAST = FRAMES.length - 1;
  AGENT = restore(METHOD, record.snapshot);
  SUMMARY = record;
}

export const frameAt = (t) => FRAMES[Math.min(Math.max(t, 0), LAST)];

export function trainedAgent(sessions) {
  const run = RUNS[METHOD];
  const snapshot = sessions < SESSIONS ? run.sessions[sessions].snapshot : run.agent.snapshot();
  return restore(METHOD, snapshot);
}
