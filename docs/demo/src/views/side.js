const panels = {
  plots: document.getElementById('plots'),
  wiki: document.getElementById('wiki'),
  test: document.getElementById('test'),
};

const leaving = {};

export function onLeave(name, callback) {
  leaving[name] = callback;
}

export function occupy(name) {
  for (const [key, panel] of Object.entries(panels)) {
    const left = key !== name && !panel.hidden;
    panel.hidden = key !== name;
    if (left && leaving[key]) leaving[key]();
  }
}
