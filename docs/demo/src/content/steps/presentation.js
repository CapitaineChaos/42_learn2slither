import { spec } from './format.js';

export default {
  id: 'presentation',
  node: 'presentation',
  phase: 'intro',
  plot: 'plateau',
  title: 'Apprentissage par renforcement',
  math: 'Q(s, a) = \\mathbb{E}\\big[\\, r + \\gamma \\max_{a\'} Q(s\', a\') \\,\\big]',
  calc: null,
  lead: (c) => spec([
    ['Serpent', `Un serpent se déplace sur un plateau de ${c.size} × ${c.size} cases. Un
      [[agent]] choisit chacun de ses déplacements. Il apprend à jouer par essais et erreurs, d'après les [[recompense|récompenses]] que le plateau, son
      [[environnement]], lui renvoie.`],
    ['Fonction Q', `Pour chaque état et chaque action, l'agent estime ce que l'action rapporte.
      Ces estimations forment la [[fonction-q|fonction Q]], ${c.table
        ? 'rangée ici dans une [[table-q|table]] de 256 × 4 valeurs'
        : 'calculée ici par un [[reseau-neurones|réseau de neurones]] à 16 entrées, 16 neurones cachés et 4 sorties'}.`],
    ['Boucle des pas', `À chaque pas, l'agent lit l'état, choisit une action, reçoit une
      récompense et corrige son estimation. La boucle s'arrête à la mort du serpent.`],
    ['Boucle des sessions', `Une [[session]] est une partie complète. L'entraînement enchaîne
      ${c.sessions} sessions, et l'agent garde d'une session à l'autre ce qu'il a appris.
      Chaque session se rejoue pas à pas avec l'agent tel qu'il était à son début.`],
  ]),
  more: () => String.raw`
    <h4>Équation de Bellman</h4>
    <p>La formule du cadre relie la valeur d'une action à la récompense immédiate \(r\) et à
    la meilleure valeur de l'état suivant \(s'\). L'apprentissage corrige \(Q\) pas après pas
    jusqu'à ce que cette égalité soit vérifiée en moyenne. Le détail est à l'étape Cible de
    Bellman ([[bellman|équation de Bellman]]).</p>`,
};
