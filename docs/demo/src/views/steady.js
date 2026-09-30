// Hauteur réservée. Un bloc dont le contenu dépend du pas est rendu, au
// changement d'étape ou de session, pour quelques pas témoins ; il garde
// ensuite la plus grande de ces hauteurs. Quand le pas change, il ne rétrécit
// ni ne grandit, et rien ne bouge sous lui.
//
// Les témoins : le premier pas, le deuxième, le milieu et le dernier pas de la
// session affichée.

import { LAST } from '../run.js';

export function reserve(element, draw, current) {
  const samples = [...new Set([0, 1, Math.round(LAST / 2), LAST])];
  element.style.minHeight = '';
  let tallest = 0;
  samples.forEach((t) => {
    draw(t);
    tallest = Math.max(tallest, element.getBoundingClientRect().height);
  });
  draw(current);
  element.style.minHeight = `${Math.ceil(tallest)}px`;
}
