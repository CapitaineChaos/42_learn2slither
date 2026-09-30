// État partagé et abonnements.
//
// L'état a trois canaux, car les vues n'ont pas le même coût. Déplacer le
// curseur de pas redessine les figures et les nombres. Réécrire les formules
// à chaque cran ralentirait le glissement. Changer de session remplace toutes
// les données, et les vues abonnées à ce canal recalculent ce qu'elles avaient
// figé.

export const state = {
  step: 0,
  t: 0,
  session: 0,
  zoom: null,
  pick: 0,
};

const channels = { step: [], iteration: [], session: [] };

export function on(channel, listener) {
  channels[channel].push(listener);
}

export function emit(channel) {
  channels[channel].forEach((listener) => listener());
}
