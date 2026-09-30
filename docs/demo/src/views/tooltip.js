// Bulle des symboles et des notions. Une seule bulle, en position fixe, placée
// au-dessus de l'élément survolé ou focalisé, en dessous quand la place manque
// ou que l'élément le demande (en-têtes de tableau), et décalée pour rester
// dans la fenêtre.

const MARGIN = 8;
const GAP = 6;

const bubble = document.createElement('div');
bubble.className = 'tip';
bubble.id = 'tip';
bubble.setAttribute('role', 'tooltip');
bubble.hidden = true;
document.body.appendChild(bubble);

let owner = null;

function place(target) {
  const box = target.getBoundingClientRect();
  bubble.style.left = '0px';
  bubble.style.top = '0px';
  const size = bubble.getBoundingClientRect();
  const centered = box.left + box.width / 2 - size.width / 2;
  const left = Math.min(Math.max(centered, MARGIN), window.innerWidth - size.width - MARGIN);
  const above = box.top - GAP - size.height;
  const top = target.classList.contains('below') || above < MARGIN ? box.bottom + GAP : above;
  bubble.style.left = `${Math.max(left, MARGIN)}px`;
  bubble.style.top = `${Math.min(top, window.innerHeight - size.height - MARGIN)}px`;
}

function show(target) {
  if (owner && owner !== target) owner.removeAttribute('aria-describedby');
  owner = target;
  bubble.textContent = target.dataset.tip;
  bubble.hidden = false;
  target.setAttribute('aria-describedby', 'tip');
  place(target);
}

function hide() {
  if (!owner) return;
  owner.removeAttribute('aria-describedby');
  owner = null;
  bubble.hidden = true;
}

export function mount() {
  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest('[data-tip]');
    if (target) show(target);
  });
  document.addEventListener('pointerout', (event) => {
    if (owner && !owner.contains(event.relatedTarget)) hide();
  });
  document.addEventListener('focusin', (event) => {
    const target = event.target.closest('[data-tip]');
    if (target) show(target);
  });
  document.addEventListener('focusout', hide);
  document.addEventListener('scroll', hide, true);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
}
