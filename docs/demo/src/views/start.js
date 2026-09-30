// Écran de démarrage : les options du cours et Démarrer, actif une fois le
// calcul terminé. Chaque option est un choix exclusif ; les valeurs sont
// recopiées dans config.js à Démarrer.

import { OPTIONS, config } from '../config.js';

const form = document.getElementById('config');
const list = document.getElementById('options');
const go = document.getElementById('start');

export function mount() {
  list.innerHTML = OPTIONS.map(({ key, label, choices, value }) => `
    <fieldset class="choice">
      <legend class="choice-label">${label}</legend>
      ${choices.map((choice) => `
        <label class="option">
          <input type="radio" name="${key}" value="${choice.value}"${choice.value === value ? ' checked' : ''}>
          <span class="option-label">${choice.label}</span>
        </label>`).join('')}
    </fieldset>`).join('');
}

export function ready() {
  go.disabled = false;
}

export function chosen() {
  return new Promise((resolve) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      OPTIONS.forEach(({ key }) => { config[key] = form.elements[key].value; });
      go.disabled = true;
      resolve();
    }, { once: true });
  });
}
