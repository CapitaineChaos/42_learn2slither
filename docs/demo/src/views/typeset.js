// Rendu KaTeX, synchrone, partagé par le cours et le wiki. Une formule seule
// s'écrit dans son cadre ; un texte est parcouru à la recherche de \( … \) et
// de \[ … \].

const OPTIONS = { throwOnError: false, strict: 'ignore' };

const DELIMITERS = [
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
];

export function renderFormula(element, tex) {
  element.textContent = '';
  if (tex) window.katex.render(tex, element, { ...OPTIONS, displayMode: true });
}

export function renderMath(element) {
  window.renderMathInElement(element, { ...OPTIONS, delimiters: DELIMITERS });
}
