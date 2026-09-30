// Registre des figures. L'ordre est celui des cartes : ce que voit l'agent,
// ce qu'il estime, puis l'entraînement et l'évaluation.

import { plateau } from './plateau.js';
import { vision } from './vision.js';
import { valeurs } from './valeurs.js';
import { politique } from './politique.js';
import { longueur } from './longueur.js';
import { exploration } from './exploration.js';
import { evaluation } from './evaluation.js';

export const FIGURES = [plateau, vision, valeurs, politique, longueur, exploration, evaluation];

export const figureFor = (key) => FIGURES.find((figure) => figure.key === key) || FIGURES[0];
