import { config } from '../../config.js';
import { S } from '../symbols.js';
import { at, spec } from './format.js';

const TABLE = config.method === 'table';

export default {
  id: 'maj',
  node: 'maj',
  phase: 'boucle',
  plot: 'valeurs',
  after: true,
  title: 'Mise à jour de Q',
  math: TABLE
    ? 'Q(s, a) \\leftarrow Q(s, a) + \\alpha\\,\\big(y - Q(s, a)\\big)'
    : 'w \\leftarrow w - \\eta\\,\\big(Q(s, a) - y\\big)\\,\\dfrac{\\partial Q(s, a)}{\\partial w}',
  calc: { worked: 'update' },
  intro: () => `L'écart entre la cible et l'estimation donne le sens de la correction. La mise
    à jour comble une fraction de cet écart, car la cible, calculée sur un seul pas, varie d'une
    partie à l'autre.`,
  lead: (c) => spec([
    ...(TABLE
      ? [
        ['Taux d\'apprentissage', `${S.alpha} = ${c.alpha}. Chaque mise à jour comble 10 % de
          l'écart entre la case Q(s, a) et la cible.`],
        ['Moyenne', `En comblant l'écart par petites parts, Q(s, a) tend vers la moyenne des
          cibles reçues.`],
      ]
      : [
        ['Pas', `${S.rate} = ${c.rate}. Le réseau déplace tous ses poids d'un petit pas, dans le
          sens qui rapproche Q(s, a) de la cible.`],
        ['Partage', `Les poids sont communs à tous les états. La correction modifie aussi les
          valeurs des états qui partagent des symboles avec s.`],
      ]),
    [at(c), `Q(s, ${c.actionName}) passe de ${c.before} à ${c.after}, pour une cible de ${c.target}.`, true],
  ]),
  more: () => (TABLE
    ? String.raw`
      <h4>Moyenne mobile</h4>
      \[ Q(s, a) \leftarrow (1 - \alpha)\, Q(s, a) + \alpha\, y \]
      <p>La mise à jour est une moyenne pondérée entre l'ancienne valeur et la cible. Une cible
      reçue \(k\) mises à jour plus tôt pèse \(0.9^k\) fois son poids initial
      ([[moyenne-mobile|moyenne mobile exponentielle]]).</p>
      <h4>Convergence</h4>
      <p>Avec un taux qui décroît assez lentement et chaque couple \((s, a)\) visité
      indéfiniment, la table converge vers \(Q^*\). Avec un \(\alpha\) constant, comme ici, les
      valeurs fluctuent autour de leur limite.</p>`
    : String.raw`
      <h4>Gradient</h4>
      <p>La correction est un pas de [[descente-gradient|descente de gradient]] sur l'erreur
      quadratique de l'action jouée :</p>
      \[ L = \tfrac{1}{2}\big(Q(s, a) - y\big)^2, \qquad
         \frac{\partial L}{\partial w} = \big(Q(s, a) - y\big)\,\frac{\partial Q(s, a)}{\partial w}. \]
      <p>La cible \(y\) dépend elle aussi des poids. La dérivée la traite comme une
      constante.</p>
      <h4>Rétropropagation</h4>
      <p>Avec \(\delta = Q(s, a) - y\), les dérivées se calculent de la sortie vers l'entrée
      ([[retropropagation|rétropropagation]]) :</p>
      \[ \frac{\partial L}{\partial W_2[j, a]} = \delta\, h_j, \qquad
         \frac{\partial L}{\partial W_1[i, j]} = \delta\, W_2[j, a]\, \mathbb{1}[h_j > 0]\, x_i. \]
      <p>Les poids corrigés passent par les neurones cachés actifs (\(h_j > 0\)). Dans \(W_1\),
      ils partent des 4 entrées allumées ; dans \(W_2\), ils mènent à la sortie \(a\).</p>
      <h4>Pas trop grand</h4>
      <p>Avec \(\eta = 0.005\), les entraînements de la démo restent à une longueur moyenne de
      3, la longueur de départ du serpent.</p>
      <h4>Réseaux profonds</h4>
      <p>Le DQN de Mnih et de ses coauteurs (2015) stabilise l'apprentissage d'un grand réseau
      par deux mécanismes, une mémoire des derniers pas rejouée par lots et une copie figée du
      réseau qui calcule les cibles.</p>`),
};
