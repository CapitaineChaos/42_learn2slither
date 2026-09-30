// Région d'annonce pour les lecteurs d'écran. Le message est retardé, car
// pendant un glissement du curseur d'itération une annonce par cran serait
// inintelligible.

const host = document.getElementById('live');
let timer = null;

export function say(text) {
  clearTimeout(timer);
  timer = setTimeout(() => { host.textContent = text; }, 400);
}
