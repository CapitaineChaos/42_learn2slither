// Schéma du parcours, tracé par flow/draw.js. Ce module tient son état : le
// nœud courant s'allume, les nœuds franchis restent marqués, la flèche qui mène
// au nœud courant s'anime, les flèches de retour des boucles en cours restent
// teintées.

import { NODES, STEPS } from '../content/steps.js';
import { on, state } from '../state.js';
import { INSIDE, build, edges, nodes, pips } from './flow/draw.js';

function update() {
  const step = STEPS[state.step];
  const current = NODES.findIndex((node) => node.key === step.node);
  const inFrame = INSIDE.includes(step.phase);

  // Un nœud déjà traversé reste marqué : dans la boucle dès le deuxième pas,
  // dans la session dès la deuxième session.
  NODES.forEach((node, index) => {
    const group = nodes[node.key];
    const repeated = inFrame && INSIDE.includes(node.phase)
      && (state.session > 0 || (node.phase === 'boucle' && step.phase === 'boucle' && state.t > 0));
    group.classList.toggle('is-current', index === current);
    group.classList.toggle('is-done', index < current || repeated);
    if (index === current) group.setAttribute('aria-current', 'step');
    else group.removeAttribute('aria-current');
  });

  pips.forEach(({ pip, index }) => pip.classList.toggle('is-current', index === state.step));

  // La tête d'une boucle s'atteint par l'entrée au premier tour, par le retour
  // ensuite : premier pas ou non pour les pas, première session ou non pour
  // les sessions.
  const firstOfNode = STEPS.findIndex((candidate) => candidate.node === step.node) === state.step;
  const loopHead = NODES.find((node) => node.phase === 'boucle').key;
  const sessionHead = NODES.find((node) => node.phase === 'session').key;
  edges.forEach(({ path, to, kind }) => {
    let lit = firstOfNode && step.node === to;
    if (to === loopHead) lit = lit && (kind === 'return' ? state.t > 0 : state.t === 0);
    if (to === sessionHead) lit = lit && (kind === 'session-return' ? state.session > 0 : state.session === 0);
    const live = (kind === 'return' && step.phase === 'boucle') || (kind === 'session-return' && inFrame);
    path.classList.toggle('is-on', lit);
    path.classList.toggle('is-live', live && !lit);
    path.setAttribute('marker-end', lit ? 'url(#arrow-on)' : 'url(#arrow)');
  });
}

export function mount(goto) {
  build(goto);
  on('step', update);
  on('iteration', update);
  on('session', update);
  update();
}
