export const VALEUR = {
  'fonction-q': {
    title: 'Fonction Q',
    short: 'Valeur de chaque action dans chaque état : somme attendue des récompenses futures actualisées.',
    body: String.raw`
      <p>La fonction \(Q\) associe à chaque couple (état, action) la somme des récompenses
      futures que l'agent peut attendre s'il joue cette action, puis ses meilleures
      actions. Les récompenses lointaines sont multipliées par des puissances du
      [[actualisation|facteur d'actualisation]] \(\gamma\).</p>
      \[ Q(s, a) = \mathbb{E}\big[\, r_t + \gamma\, r_{t+1} + \gamma^2 r_{t+2} + \cdots \mid s_t = s,\ a_t = a \,\big] \]
      <p>Connaître \(Q\) suffit pour jouer, en choisissant dans chaque état l'action de plus
      grande valeur. Elle peut être représentée par une [[table-q|table]] ou par un
      [[reseau-neurones|réseau de neurones]].</p>`,
  },
  actualisation: {
    title: 'Facteur d\'actualisation',
    short: 'Nombre γ entre 0 et 1 qui réduit le poids des récompenses lointaines.',
    body: String.raw`
      <p>Le facteur d'actualisation \(\gamma\) multiplie une récompense par \(\gamma^k\)
      lorsqu'elle arrive \(k\) pas plus tard. Avec \(\gamma = 0.9\), une récompense dans 10 pas
      compte pour 0.35 de sa valeur, dans 50 pas pour 0.005.</p>
      <p>Avec \(\gamma\) proche de 0, l'agent est myope et compte surtout la récompense suivante.
      \(\gamma\) proche de 1 lui fait prendre en compte des conséquences lointaines, mais rend
      les valeurs plus longues à apprendre. \(\gamma < 1\) garantit aussi que la somme des
      récompenses reste finie.</p>`,
  },
  esperance: {
    title: 'Espérance',
    short: 'Moyenne d\'une quantité aléatoire, pondérée par les probabilités de ses valeurs.',
    body: String.raw`
      <p>L'espérance \(\mathbb{E}[X]\) d'une quantité aléatoire \(X\) est la moyenne de ses
      valeurs possibles, chacune pondérée par sa probabilité. Pour un dé équilibré, elle vaut
      \((1 + 2 + \dots + 6) / 6 = 3.5\).</p>
      <p>Ici, le hasard vient de l'emplacement des pommes et des actions tirées
      pendant l'exploration. \(Q(s, a)\) est une espérance, donc une moyenne sur toutes les suites
      de partie possibles après \((s, a)\). Chaque mise à jour porte sur une seule suite, d'où les
      petites corrections successives.</p>`,
  },
  bellman: {
    title: 'Équation de Bellman',
    short: 'Relation entre la valeur d\'une action, la récompense immédiate et la valeur du meilleur choix suivant.',
    body: String.raw`
      <p>La fonction \(Q\) optimale vérifie, pour tout état \(s\) et toute action \(a\),</p>
      \[ Q^*(s, a) = \mathbb{E}\big[\, r + \gamma \max_{a'} Q^*(s', a') \,\big], \]
      <p>où \(r\) est la récompense et \(s'\) l'état qui suivent l'action. La valeur d'une
      action est donc la récompense immédiate plus la valeur actualisée du meilleur choix
      suivant.</p>
      <p>Le [[q-learning|Q-learning]] se sert de cette égalité comme d'une règle de correction.
      Il calcule le membre de droite sur un seul pas observé, la cible, et rapproche \(Q(s, a)\)
      de cette cible. Bellman a formulé l'équation en 1957, dans ses travaux sur la programmation
      dynamique.</p>`,
  },
  'difference-temporelle': {
    title: 'Différence temporelle',
    short: 'Écart entre la cible r + γ max Q(s′, ·) et l\'estimation Q(s, a).',
    body: String.raw`
      <p>La différence temporelle est l'écart entre ce qu'un pas vient de montrer et ce que
      l'agent estimait :</p>
      \[ \delta = r + \gamma \max_{a'} Q(s', a') - Q(s, a). \]
      <p>Un écart positif indique que l'action vaut mieux que prévu, un écart négatif qu'elle
      vaut moins. Les méthodes par différence temporelle corrigent l'estimation à chaque pas, pendant
      la partie, en s'appuyant sur l'estimation de l'état suivant.</p>`,
  },
  'q-learning': {
    title: 'Q-learning',
    short: 'Méthode qui corrige Q(s, a) vers r + γ max Q(s′, ·) après chaque pas.',
    body: String.raw`
      <p>Le Q-learning apprend la fonction \(Q\) optimale à partir des pas joués. Après chaque
      pas, il calcule la cible \(y = r + \gamma \max_{a'} Q(s', a')\) et corrige \(Q(s, a)\) d'une
      partie de l'écart, la [[difference-temporelle|différence temporelle]].</p>
      <p>Il apprend hors politique, car la cible prend la meilleure action suivante, même quand
      l'agent explore. \(Q\) converge ainsi vers les valeurs de la meilleure politique. Watkins a
      proposé la méthode en 1989. Watkins et Dayan ont démontré sa convergence en 1992, pour une
      table dont chaque case est visitée indéfiniment avec un taux décroissant.</p>`,
  },
  sarsa: {
    title: 'SARSA',
    short: 'Variante du Q-learning dont la cible utilise l\'action réellement jouée au pas suivant.',
    body: String.raw`
      <p>SARSA tire son nom de la suite \((s, a, r, s', a')\) qu'il utilise. Sa cible est
      \(r + \gamma\, Q(s', a')\), où \(a'\) est l'action que l'agent joue vraiment au pas
      suivant, exploration comprise.</p>
      <p>SARSA apprend donc la valeur de la politique qu'il suit, et le [[q-learning|Q-learning]]
      celle de la meilleure politique. Avec une exploration forte près d'un danger, SARSA apprend
      à s'en tenir plus loin, car ses tirages au hasard y coûtent cher.</p>`,
  },
  'moyenne-mobile': {
    title: 'Moyenne mobile exponentielle',
    short: 'Moyenne où chaque nouvelle valeur pèse α et les anciennes perdent un facteur 1 − α.',
    body: String.raw`
      <p>La mise à jour \(m \leftarrow (1 - \alpha)\, m + \alpha\, x\) donne une moyenne mobile
      exponentielle des valeurs \(x\) reçues. Une valeur reçue \(k\) mises à jour plus tôt pèse
      \(\alpha (1 - \alpha)^k\).</p>
      <p>Avec \(\alpha = 0.1\), la moyenne suit les valeurs récentes et oublie peu à peu les
      anciennes. C'est la forme de la mise à jour de la [[table-q|table Q]], où \(x\) est la
      cible.</p>`,
  },
};
