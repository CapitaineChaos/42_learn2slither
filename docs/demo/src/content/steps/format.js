// Mise en forme commune aux fiches : liste terme-définition, repère du pas,
// accord du pluriel.

// La ligne marquée `now` porte la valeur au pas affiché.
export const spec = (rows) => `<dl class="spec">${rows.map(([term, value, now]) =>
  `<dt class="${now ? 'is-now' : ''}">${term}</dt><dd>${value}</dd>`).join('')}</dl>`;

export const at = (c) => `pas ${c.t + 1}`;
export const plural = (n, one, many) => (n > 1 ? many : one);

export const TOWARD = { haut: 'vers le haut', gauche: 'vers la gauche', bas: 'vers le bas', droite: 'vers la droite' };
