// Déplacements dans le cours, dans une session et entre les sessions.
//
// Deux boucles imbriquées, comme dans l'entraînement. La boucle des pas se
// referme d'elle-même : au bout de la mise à jour, suivant repart à la vision
// avec le pas suivant, et mène à la fin de session après le pas qui tue le
// serpent. La boucle des sessions repart de la fin de session au plateau de la
// session suivante. Après la dernière, le cours passe à l'évaluation.

import { STEPS } from './content/steps.js';
import { LAST, useSession } from './run.js';
import { SESSIONS } from './sim/training.js';
import { emit, state } from './state.js';

const INSIDE = ['session', 'boucle', 'fin'];

export const LOOP_START = STEPS.findIndex((step) => step.phase === 'boucle');
export const LOOP_END = STEPS.map((step) => step.phase).lastIndexOf('boucle');
export const FRAME_START = STEPS.findIndex((step) => INSIDE.includes(step.phase));
export const FRAME_END = STEPS.map((step) => INSIDE.includes(step.phase)).lastIndexOf(true);

export const inFrame = (at) => INSIDE.includes(STEPS[at].phase);

export function setIteration(t) {
  const target = Math.min(Math.max(Math.round(t), 0), LAST);
  if (target === state.t) return;
  state.t = target;
  emit('iteration');
}

// Changer de session change toutes les données : les vues abonnées à
// 'session' recalculent ce qu'elles avaient figé, puis le pas est replacé.
export function setSession(index, t = 0) {
  const target = Math.min(Math.max(Math.round(index), 0), SESSIONS - 1);
  if (target !== state.session) {
    state.session = target;
    useSession(target);
    emit('session');
  }
  state.t = Math.min(Math.max(Math.round(t), 0), LAST);
  emit('iteration');
}

// Déplacement dans la session ; au-delà du dernier pas, le déplacement
// continue au début de la session suivante.
export function shift(delta) {
  const target = state.t + delta;
  if (target > LAST && state.session < SESSIONS - 1) setSession(state.session + 1, 0);
  else setIteration(target);
}

function show(target) {
  if (target === state.step) return;
  state.step = target;
  emit('step');
}

// La fin de session montre le dernier pas ; le plateau, le premier.
export function goto(at) {
  const target = Math.min(Math.max(at, 0), STEPS.length - 1);
  const phase = STEPS[target].phase;
  if (phase === 'session') setIteration(0);
  else if (phase === 'fin') setIteration(LAST);
  show(target);
}

export function goNext() {
  if (state.step === LOOP_END) {
    if (state.t < LAST) {
      setIteration(state.t + 1);
      show(LOOP_START);
    } else {
      show(LOOP_END + 1);
    }
    return;
  }
  if (state.step === FRAME_END && state.session < SESSIONS - 1) {
    setSession(state.session + 1, 0);
    show(FRAME_START);
    return;
  }
  goto(state.step + 1);
}

export function goPrev() {
  if (state.step === LOOP_START && state.t > 0) {
    setIteration(state.t - 1);
    show(LOOP_END);
    return;
  }
  if (state.step === LOOP_END + 1) {
    setIteration(LAST);
    show(LOOP_END);
    return;
  }
  if (state.step === FRAME_START && state.session > 0) {
    setSession(state.session - 1, Infinity);
    show(FRAME_END);
    return;
  }
  if (state.step === FRAME_END + 1) {
    setIteration(LAST);
    show(FRAME_END);
    return;
  }
  goto(state.step - 1);
}

// Hors de la session, l'étape ne suit pas le pas : les commandes de pas
// entrent d'abord dans la boucle.
export function enterLoop() {
  if (!inFrame(state.step)) goto(LOOP_START);
  else if (STEPS[state.step].phase !== 'boucle') show(LOOP_START);
}

// La boucle ne s'interrompt qu'à la mort du serpent : en sortir revient à
// aller au dernier pas, sur la mise à jour.
export function exitLoop() {
  setIteration(LAST);
  show(LOOP_END);
}
