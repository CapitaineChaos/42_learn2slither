// Démarrage : écran de chargement, polices, entraînement des deux méthodes,
// puis Démarrer, qui fixe la méthode et monte les vues. La page n'apparaît
// qu'une fois tout prêt.

import { config } from './config.js';
import { METHOD_LABELS, METHODS, compute, useMethod, useSession } from './run.js';
import { SESSIONS } from './sim/training.js';
import { state } from './state.js';
import * as loader from './views/loader.js';
import * as start from './views/start.js';

const LABELS = {
  train: ({ method, index }) => `entraînement · ${METHOD_LABELS[method]} · sessions ${index + 1} à ${index + 100}`,
  evaluate: ({ method }) => `évaluation sans apprentissage · ${METHOD_LABELS[method]}`,
};

// Polices, puis pour chaque méthode dix tranches de 100 sessions et
// l'évaluation. Les deux méthodes sont entraînées quelle que soit l'option,
// car elle peut changer jusqu'à Démarrer.
start.mount();
loader.start(1 + METHODS.length * (SESSIONS / 100 + 1));

await Promise.all([
  "1em KaTeX_Main", "italic 1em KaTeX_Math",
  "400 1em 'IBM Plex Sans'", "600 1em 'IBM Plex Sans'",
  "600 1em 'Space Grotesk'", "700 1em 'Space Grotesk'",
  "400 1em 'JetBrains Mono'", "600 1em 'JetBrains Mono'",
].map((face) => document.fonts.load(face)));
await document.fonts.ready;
await loader.step('polices');

await compute((event) => loader.step(LABELS[event.kind](event)));
loader.ready();
start.ready();

await start.chosen();
useMethod(config.method);
state.session = 0;
useSession(0);

try {
  const app = await import('./app.js');
  await app.ready();
  await loader.finish();
} catch (error) {
  loader.fail();
  throw error;
}
