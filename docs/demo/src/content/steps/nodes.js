// Nœuds du schéma de parcours, dans l'ordre de la ligne. `phase` situe le
// nœud : 'intro' avant l'entraînement ; 'session', 'boucle' et 'fin' dans une
// session, la boucle des pas entre le plateau et la fin de session ; 'aval'
// après l'entraînement.

export const NODES = [
  { key: 'presentation', phase: 'intro', label: 'Présentation', caption: 'renforcement' },
  { key: 'plateau', phase: 'session', label: 'Plateau', caption: '10 × 10' },
  { key: 'vision', phase: 'boucle', label: 'Vision', caption: 'état s' },
  { key: 'action', phase: 'boucle', label: 'Action', caption: 'Q(s, a), ε' },
  { key: 'recompense', phase: 'boucle', label: 'Récompense', caption: 'r' },
  { key: 'maj', phase: 'boucle', label: 'Mise à jour', caption: 'Q ← y' },
  { key: 'fin', phase: 'fin', label: 'Fin de session', caption: 'ε × 0.99' },
  { key: 'evaluation', phase: 'aval', label: 'Évaluation', caption: 'parties figées' },
];
