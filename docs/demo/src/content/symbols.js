// Définition de chaque symbole du cours, affichée au survol ou au focus.

export const NOTES = {
  s: 'État : les quatre symboles vus depuis la tête, en haut, à gauche, en bas et à droite.',
  a: 'Action : l\'une des quatre directions, haut, gauche, bas ou droite.',
  r: 'Récompense renvoyée par le plateau après l\'action.',
  q: 'Valeur Q : somme attendue des récompenses futures, actualisées par γ, si l\'agent joue a dans l\'état s puis ses meilleures actions.',
  y: 'Cible : r + γ · max Q(s′, ·), ou r si le serpent meurt, hors faim.',
  next: 'État suivant, lu après le déplacement.',
  alpha: 'Taux d\'apprentissage de la table : part de l\'écart entre la cible et Q comblée à chaque mise à jour.',
  rate: 'Pas du réseau : facteur du gradient retranché aux poids à chaque mise à jour.',
  gamma: 'Facteur d\'actualisation : poids d\'une récompense reçue un pas plus tard.',
  epsilon: 'Probabilité de jouer une action au hasard.',
  line: 'Cases vues depuis la tête jusqu\'au mur. W mur, S corps, G pomme verte, R pomme rouge, 0 case vide.',
  symbol: 'Résumé de la ligne. D danger sur la case voisine, R pomme rouge voisine, G pomme verte visible, 0 sinon.',
  digit: 'Chiffre du symbole en base 4 : 0 pour 0, 1 pour G, 2 pour R, 3 pour D.',
  weight: 'Poids de la direction dans le numéro de l\'état, 4 puissance k.',
  mean: 'Longueur maximale moyenne sur les parties figées.',
  reached: 'Nombre de parties où le serpent atteint une longueur de 10.',
  duration: 'Nombre moyen de pas avant la mort.',
};

export const tip = (text, note, below = false) =>
  `<abbr class="sym${below ? ' below' : ''}" tabindex="0" data-tip="${note}">${text}</abbr>`;

export const S = {
  s: tip('s', NOTES.s),
  a: tip('a', NOTES.a),
  r: tip('r', NOTES.r),
  q: tip('Q', NOTES.q),
  y: tip('y', NOTES.y),
  next: tip('s′', NOTES.next),
  alpha: tip('α', NOTES.alpha),
  rate: tip('η', NOTES.rate),
  gamma: tip('γ', NOTES.gamma),
  epsilon: tip('ε', NOTES.epsilon),
};
