import { at, spec } from './format.js';

export default {
  id: 'etat',
  node: 'vision',
  phase: 'boucle',
  plot: 'vision',
  title: 'État',
  math: 's = \\big(v_{\\text{haut}},\\ v_{\\text{gauche}},\\ v_{\\text{bas}},\\ v_{\\text{droite}}\\big), \\qquad v \\in \\{0,\\ G,\\ R,\\ D\\}',
  calc: { table: 'directions', cols: ['dir', 'line', 'symbol', 'digit', 'weight'], worked: 'state' },
  intro: () => `Une ligne entière contient trop de cas pour être apprise case par case.
    L'interpréteur la résume en un symbole, qui garde ce qui compte pour le prochain
    déplacement.`,
  lead: (c) => spec([
    ['Symboles', `D si la case voisine est un mur ou le corps, R si c'est une pomme rouge, G si
      une pomme verte est visible avant tout obstacle, 0 sinon.`],
    ['Nombre d\'états', `Quatre symboles possibles dans quatre directions donnent 4⁴ = 256
      [[etat|états]].`],
    [at(c), `état ${c.symbols}, numéro ${c.state}`, true],
  ]),
  more: () => String.raw`
    <h4>Numéro de l'état</h4>
    <p>Chaque symbole reçoit un chiffre de 0 à 3 : 0 pour 0, 1 pour G, 2 pour R, 3 pour D. Le
    numéro de l'état lit ces quatre chiffres en base 4, le haut en poids faible :</p>
    \[ s = c_{\text{haut}} + 4\,c_{\text{gauche}} + 16\,c_{\text{bas}} + 64\,c_{\text{droite}}. \]
    <p>Il va de 0 à 255.</p>
    <h4>Information perdue</h4>
    <p>Deux situations différentes peuvent donner le même état. Une pomme verte à deux cases et
    une autre à huit cases donnent toutes deux G. La valeur de cet état est une moyenne sur
    toutes les situations qui y mènent. Le problème est
    [[observation-partielle|partiellement observable]].</p>
    <h4>Taille du plateau</h4>
    <p>Un plateau de toute taille donne les mêmes 256 états. Un modèle entraîné sur 10 × 10
    peut donc jouer sur un autre plateau.</p>`,
};
