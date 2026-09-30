export const RENFORCEMENT = {
  renforcement: {
    title: 'Apprentissage par renforcement',
    short: 'Apprentissage par essais et erreurs, guidé par des récompenses.',
    body: String.raw`
      <p>En apprentissage par renforcement, un [[agent]] agit dans un
      [[environnement]] et reçoit après chaque action une [[recompense|récompense]]. Il
      cherche la manière d'agir qui maximise la somme des récompenses reçues au fil du temps.</p>
      <p>L'agent découvre la bonne action en essayant, et une récompense peut arriver longtemps après les choix qui l'ont rendue possible. Ces deux
      traits le distinguent de l'apprentissage supervisé, où chaque exemple porte sa réponse.</p>`,
  },
  agent: {
    title: 'Agent',
    short: 'Ce qui décide : il reçoit l\'état, choisit une action et apprend des récompenses.',
    body: String.raw`
      <p>L'agent est la partie qui décide. À chaque pas, il reçoit l'[[etat|état]] de
      l'interpréteur, choisit une action et reçoit une [[recompense|récompense]].</p>
      <p>Ici, l'agent est la [[fonction-q|fonction Q]] accompagnée de sa règle de choix, la
      [[politique-epsilon|politique ε-gloutonne]].</p>`,
  },
  environnement: {
    title: 'Environnement',
    short: 'Ce sur quoi l\'agent agit : ici le plateau, ses règles et ses pommes.',
    body: String.raw`
      <p>L'environnement reçoit l'action de l'[[agent]], change d'état en conséquence et
      renvoie une [[recompense|récompense]]. Ici, c'est le plateau de 10 × 10
      cases, qui déplace le serpent, fait apparaître les pommes et décide de la mort.</p>
      <p>L'agent connaît l'environnement par ses effets, les états et les récompenses.</p>`,
  },
  etat: {
    title: 'État',
    short: 'Description de la situation transmise à l\'agent ; ici quatre symboles, soit 256 états.',
    body: String.raw`
      <p>L'état est ce que l'agent sait de la situation au moment de choisir. Ici,
      l'interpréteur résume les quatre lignes vues depuis la tête en quatre symboles, 0, G, R ou
      D, un par direction. Il y a donc \(4^4 = 256\) états possibles.</p>
      <p>Un état bien choisi se limite à ce qui compte pour la décision, car plus il y a
      d'états, plus l'agent met de temps à les rencontrer tous, et moins chacun est visité
      souvent.</p>`,
  },
  recompense: {
    title: 'Récompense',
    short: 'Nombre renvoyé par l\'environnement après chaque action, positif pour un bon résultat, négatif pour un mauvais.',
    body: String.raw`
      <p>La récompense est le retour que l'environnement donne à l'agent après chaque action.
      Ici, elle vaut +10 pour une pomme verte, −10 pour une pomme rouge, −100 pour la mort, hors
      faim, et −0.1 pour les autres pas.</p>
      <p>L'agent maximise la somme des récompenses. Pour qu'il apprenne à allonger le serpent,
      le barème doit récompenser ce qui l'allonge et pénaliser ce qui le tue.</p>`,
  },
  session: {
    title: 'Session',
    short: 'Une partie complète, du plateau neuf à la mort du serpent ; appelée aussi épisode.',
    body: String.raw`
      <p>Une session commence sur un plateau neuf et s'arrête à la mort du serpent. La
      littérature parle d'épisode. L'agent garde ce qu'il a appris d'une session à l'autre, et
      \(\varepsilon\) diminue à chaque session.</p>`,
  },
  politique: {
    title: 'Politique',
    short: 'Règle qui associe une action à chaque état.',
    body: String.raw`
      <p>Une politique dit quelle action jouer dans chaque état. Ici, elle
      choisit l'action de plus grande valeur \(Q\), sauf quand l'exploration impose un tirage au
      hasard.</p>
      <p>La politique optimale maximise la somme attendue des récompenses actualisées. Elle se
      déduit de \(Q^*\) : dans chaque état, jouer \(\arg\max_a Q^*(s, a)\).</p>`,
  },
  'observation-partielle': {
    title: 'Observation partielle',
    short: 'L\'agent voit une partie de la situation, et deux situations différentes peuvent lui donner le même état.',
    body: String.raw`
      <p>Un problème est partiellement observable quand l'état transmis à l'agent omet une partie
      de l'information utile. Ici, l'état omet la distance exacte des pommes, les cases hors des
      quatre lignes de vision et la forme du corps au-delà du premier obstacle.</p>
      <p>Deux situations qui appellent des actions différentes peuvent alors donner le même
      état. L'agent leur attribue la même valeur, une moyenne sur les situations rencontrées, et
      joue la même action dans les deux.</p>`,
  },
};
