import { EXPLORATION } from './exploration.js';
import { RENFORCEMENT } from './renforcement.js';
import { RESEAU } from './reseau.js';
import { VALEUR } from './valeur.js';

export const WIKI = { ...RENFORCEMENT, ...VALEUR, ...RESEAU, ...EXPLORATION };

// [[norme|la norme]] -> <span … data-term="norme">la norme</span>
export const LINK = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

export const linkTerms = (html) => html.replace(LINK, (_, key, text) => {
  const entry = WIKI[key];
  const label = text || entry.title.toLowerCase();
  return `<span class="sym term" role="button" tabindex="0" data-term="${key}" data-tip="${entry.short}">${label}</span>`;
});
