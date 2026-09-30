// Console, hors commandes d'étape (nav.js) : paramètres et mesures
// (console/readout.js), choix de la session (console/session.js), lecture
// et sauts (console/play.js), frise (console/frise.js).
//
// Les commandes restent actives partout. Hors de la session, où l'étape fixe
// le pas, toucher à la frise, aux sauts ou à la lecture ramène dans la boucle
// des pas, au point choisi.

import { inFrame } from '../navigation.js';
import { on, state } from '../state.js';
import * as frise from './console/frise.js';
import * as play from './console/play.js';
import * as readout from './console/readout.js';
import * as session from './console/session.js';

export function mount() {
  play.mount();
  session.mount();
  frise.mount();

  on('iteration', () => { readout.paint(); frise.paint(); });
  on('session', () => { readout.paintParams(); session.paint(); frise.marks(); });
  on('step', () => {
    if (!inFrame(state.step)) play.stop();
  });

  readout.paintParams();
  session.paint();
  readout.paint();
  frise.paint();
}

export const { togglePlay } = play;
