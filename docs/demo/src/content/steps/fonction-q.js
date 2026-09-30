import { config } from '../../config.js';
import { S } from '../symbols.js';
import { at, spec } from './format.js';

const TABLE = config.method === 'table';

export default {
  id: 'fonction-q',
  node: 'action',
  phase: 'boucle',
  plot: 'valeurs',
  title: 'Fonction Q',
  math: 'Q(s, a) = \\mathbb{E}\\big[\\, r_t + \\gamma\\, r_{t+1} + \\gamma^2 r_{t+2} + \\cdots \\mid s_t = s,\\ a_t = a \\,\\big]',
  calc: { table: 'directions', cols: ['dir', 'symbol', 'q'], worked: 'qvalues' },
  intro: () => `Pour choisir une direction, l'agent doit estimer ce que chacune rapporte. La
    [[fonction-q|fonction Q]] donne cette estimation, la somme des récompenses futures attendues,
    où une récompense lointaine compte moins qu'une récompense proche.`,
  lead: (c) => spec([
    TABLE
      ? ['Table', `La [[table-q|table Q]] a une ligne par état et une colonne par action, soit
        256 × 4 valeurs, toutes nulles au départ. Lire Q(s, ·) revient à lire la ligne s.`]
      : ['Réseau', `Le [[reseau-neurones|réseau]] reçoit l'état sous forme de 16 entrées
        binaires, les combine dans 16 neurones cachés et rend 4 valeurs, une par action. Ses
        poids sont tirés au hasard au départ.`],
    ['Actualisation', `${S.gamma} = ${c.gamma} est le [[actualisation|facteur
      d'actualisation]]. Une récompense reçue dans 10 pas compte pour 0.9¹⁰ ≈ 0.35 de sa valeur,
      dans 50 pas pour 0.005.`],
    [at(c), `Q(s, ·) = (haut ${c.values[0]} ; gauche ${c.values[1]} ; bas ${c.values[2]} ; droite ${c.values[3]})`, true],
  ]),
  more: () => (TABLE
    ? String.raw`
      <h4>Table</h4>
      <p>La case \((s, a)\) change quand l'agent joue l'action \(a\) dans l'état \(s\), et garde
      sa valeur entre deux visites.</p>`
    : String.raw`
      <h4>Réseau</h4>
      \[ h = \max(0,\ W_1 x + b_1), \qquad Q(s, \cdot) = W_2\, h + b_2 \]
      <p>\(x\) est l'[[one-hot|encodage one-hot]] de l'état : 16 entrées, dont 4 valent 1, une
      par direction pour son symbole. \(h\) est le vecteur des 16 neurones cachés, et
      \(\max(0, \cdot)\) la fonction [[relu|ReLU]]. Le réseau compte
      \(16 \times 16 + 16 + 16 \times 4 + 4 = 340\) poids, contre 1024 valeurs pour la
      table.</p>
      <p>Les poids sont communs à tous les états, ce qui permet au réseau de
      [[generalisation|généraliser]] d'un état aux états qui ont des symboles en commun.</p>`) + String.raw`
    <h4>Valeur et politique</h4>
    <p>La [[politique]] de l'agent choisit dans chaque état l'action de plus grande valeur
    \(Q\). Apprendre \(Q\) suffit donc à apprendre à jouer. La formule du cadre suppose qu'après
    le pas \(t\), l'agent joue ses meilleures actions ; le symbole \(\mathbb{E}\) désigne
    l'[[esperance|espérance]] sur les plateaux et les pommes tirés au hasard.</p>`,
};
