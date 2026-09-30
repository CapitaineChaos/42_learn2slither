// Générateur pseudo-aléatoire à graine (mulberry32). Chaque session reçoit ses
// propres graines, une pour le plateau et une pour l'agent : une session se
// rejoue à l'identique à partir de l'agent enregistré à son début.

export function generator(seed) {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    random,
    below: (count) => Math.floor(random() * count),
    pick: (items) => items[Math.floor(random() * items.length)],
  };
}

export function seedOf(...parts) {
  let hash = 0x2545F491;
  for (const part of parts) hash = Math.imul(hash ^ part, 0x9E3779B1) >>> 0;
  return hash;
}
