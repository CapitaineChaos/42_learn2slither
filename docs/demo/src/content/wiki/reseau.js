export const RESEAU = {
  'table-q': {
    title: 'Table Q',
    short: 'Tableau d\'une ligne par état et d\'une colonne par action ; ici 256 × 4 valeurs.',
    body: String.raw`
      <p>La table Q range une valeur par couple (état, action). Ici, elle compte 256 lignes,
      une par [[etat|état]], et 4 colonnes, une par direction, soit 1024 valeurs, toutes nulles
      au départ.</p>
      <p>Chaque case apprend de ses propres visites. La table convient lorsque les états sont
      assez peu nombreux pour être tous visités souvent.</p>`,
  },
  'reseau-neurones': {
    title: 'Réseau de neurones',
    short: 'Fonction à poids ajustables qui calcule les valeurs Q à partir de l\'état.',
    body: String.raw`
      <p>Un réseau de neurones calcule une sortie à partir d'une entrée par une suite de couches.
      Chaque couche fait une combinaison linéaire de ses entrées, puis applique une fonction non
      linéaire. Le réseau de la démo a une couche cachée :</p>
      \[ h = \max(0,\ W_1 x + b_1), \qquad Q(s, \cdot) = W_2\, h + b_2. \]
      <p>\(x\) est l'[[one-hot|encodage one-hot]] de l'état (16 nombres), \(h\) les 16 neurones
      cachés, et la sortie les 4 valeurs \(Q\). \(W_1\), \(b_1\), \(W_2\) et \(b_2\) sont les
      poids, 340 en tout, corrigés par [[descente-gradient|descente de gradient]].</p>
      <p>Le réseau partage ses poids entre les états. Il peut donc
      [[generalisation|généraliser]] à des états peu visités, au prix d'un apprentissage moins
      direct.</p>`,
  },
  'one-hot': {
    title: 'Encodage one-hot',
    short: 'Codage d\'une catégorie par un vecteur de 0 avec un seul 1.',
    body: String.raw`
      <p>L'encodage one-hot représente une catégorie parmi \(n\) par un vecteur de \(n\) nombres,
      tous nuls sauf celui de la catégorie, qui vaut 1. Le symbole G parmi (0, G, R, D) devient
      (0, 1, 0, 0).</p>
      <p>Le réseau de la démo concatène les codages des quatre directions, soit 16 entrées dont
      quatre valent 1. Un codage par un seul nombre, 0 à 3, imposerait un ordre entre les
      symboles, comme si R était entre G et D.</p>`,
  },
  relu: {
    title: 'ReLU',
    short: 'Fonction d\'activation max(0, z) : garde les valeurs positives, annule les négatives.',
    body: String.raw`
      <p>La fonction ReLU (<i>rectified linear unit</i>) vaut \(\max(0, z)\). Appliquée à chaque
      neurone caché, elle rend le réseau non linéaire. Deux couches linéaires successives
      équivalent à une seule couche linéaire.</p>
      <p>Sa dérivée vaut 1 pour \(z > 0\) et 0 pour \(z < 0\). Un neurone inactif transmet donc
      une correction nulle lors de la [[retropropagation|rétropropagation]].</p>`,
  },
  'descente-gradient': {
    title: 'Descente de gradient',
    short: 'Correction des poids dans le sens opposé au gradient de l\'erreur.',
    body: String.raw`
      <p>La descente de gradient réduit une erreur \(L\) en déplaçant chaque poids dans le sens
      qui la fait baisser le plus vite :</p>
      \[ w \leftarrow w - \eta\, \frac{\partial L}{\partial w}. \]
      <p>Le pas \(\eta\) règle l'amplitude de chaque correction. Trop petit, il ralentit
      l'apprentissage. Trop grand, il fait dépasser le minimum, et les poids peuvent diverger.
      Dans la démo, chaque pas de jeu donne une correction calculée sur ce pas, ce qui en fait
      une descente de gradient stochastique.</p>`,
  },
  retropropagation: {
    title: 'Rétropropagation',
    short: 'Calcul des dérivées de l\'erreur par rapport à tous les poids, de la sortie vers l\'entrée.',
    body: String.raw`
      <p>La rétropropagation applique la dérivation en chaîne couche par couche, en partant de la
      sortie. Pour le réseau de la démo, avec \(\delta = Q(s, a) - y\) :</p>
      \[ \frac{\partial L}{\partial W_2[j, a]} = \delta\, h_j, \qquad
         \frac{\partial L}{\partial W_1[i, j]} = \delta\, W_2[j, a]\, \mathbb{1}[h_j > 0]\, x_i. \]
      <p>Le calcul coûte à peu près autant que le calcul de la sortie. Rumelhart, Hinton et
      Williams l'ont popularisé en 1986.</p>`,
  },
  generalisation: {
    title: 'Généralisation',
    short: 'Capacité d\'un modèle à bien estimer des cas qu\'il a peu ou pas rencontrés.',
    body: String.raw`
      <p>Un modèle généralise quand ce qu'il apprend sur des cas rencontrés améliore ses
      estimations sur d'autres cas. Dans la [[table-q|table Q]], chaque case apprend de ses
      propres visites.</p>
      <p>Le [[reseau-neurones|réseau]] généralise par ses poids partagés. Deux états qui ont le
      même symbole dans une direction allument la même entrée et reçoivent une part des mêmes
      corrections. La généralisation peut aussi nuire, lorsqu'elle transfère une valeur entre deux
      états qui ont des symboles communs et appellent des actions différentes.</p>`,
  },
};
