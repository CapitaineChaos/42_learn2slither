// Barre de chargement de l'écran de démarrage : une unité par étape du calcul,
// le libellé de l'étape en cours et le pourcentage.
//
// Chaque étape rend la main au navigateur pendant une durée minimale. Le
// calcul réel ne prend que quelques dizaines de millisecondes, et sans cette
// durée la progression de la barre ne serait pas visible.

const screen = document.getElementById('loader');
const bar = document.getElementById('loader-bar');
const fill = document.getElementById('loader-fill');
const stage = document.getElementById('loader-stage');
const percent = document.getElementById('loader-percent');

const MINIMUM = 45;

let done = 0;
let total = 1;

const pause = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export function start(count) {
  total = count;
}

export async function step(text) {
  done = Math.min(done + 1, total);
  const ratio = Math.round((done / total) * 100);
  stage.textContent = text;
  fill.style.width = `${ratio}%`;
  percent.textContent = `${ratio} %`;
  bar.setAttribute('aria-valuenow', String(ratio));
  await pause(MINIMUM);
}

export function ready() {
  stage.textContent = 'calcul terminé';
  screen.classList.add('is-ready');
}

// Un module introuvable, souvent une ancienne version gardée en cache par le
// navigateur, bloquerait Démarrer sans rien dire.
export function fail() {
  stage.textContent = 'chargement impossible, recharger la page sans cache (Ctrl+Maj+R)';
  screen.classList.add('is-failed');
}

export async function finish() {
  document.body.classList.remove('booting');
  screen.classList.add('is-done');
  await pause(500);
  screen.remove();
}
