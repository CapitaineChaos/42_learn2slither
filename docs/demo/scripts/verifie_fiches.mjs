//   node docs/demo/scripts/verifie_fiches.mjs

import { readdirSync } from 'node:fs';

import { config } from '../src/config.js';
import { METHODS, compute, useMethod, useSession } from '../src/run.js';

const FAULTS = [
  ['valeur absente', /undefined|NaN|\[object|\bnull\b|\bfalse\b/],
  ['nombre non arrondi', /\d\.\d{7,}/],
  ['pluriel après 1', /(^|[^\d.,])1 (sessions|pommes|parties|états)/],
];

const { LINK, WIKI } = await import('../src/content/wiki/index.js');

const STEP_FILES = readdirSync(new URL('../src/content/steps/', import.meta.url))
  .filter((name) => name !== 'nodes.js' && name !== 'format.js');

await compute(async () => {});
const run = await import('../src/run.js');
const { buildContext } = await import('../src/context.js');
const { FIGURES } = await import('../src/figures/index.js');
const { STEPS } = await import('../src/content/steps.js');
const { state } = await import('../src/state.js');

const found = new Map();

function checkLinks(id, text, where) {
  for (const [, term] of text.matchAll(LINK)) {
    const key = `${id} : notion absente du wiki ${term}`;
    if (!WIKI[term] && !found.has(key)) found.set(key, `${key} (${where})`);
  }
}

function check(id, text, where) {
  for (const [label, pattern] of FAULTS) {
    const match = text.match(pattern);
    const key = `${id} : ${label}`;
    if (match && !found.has(key)) found.set(key, `${key} « ${match[0]} » (${where})`);
  }
  checkLinks(id, text, where);
}

for (const [term, entry] of Object.entries(WIKI)) {
  checkLinks(`wiki ${term}`, entry.body, 'article');
  if (/["<]/.test(entry.short)) found.set(`wiki ${term} : bulle`, `wiki ${term} : guillemet droit ou chevron dans la bulle`);
}

for (const method of METHODS) {
  config.method = method;
  useMethod(method);
  const steps = [];
  for (const name of STEP_FILES) steps.push((await import(`../src/content/steps/${name}?${method}`)).default);
  for (const index of [0, 9, 99, 499, 999]) {
    useSession(index);
    state.session = index;
    const last = run.LAST;
    for (const t of new Set([0, 1, Math.round(last / 2), last].filter((value) => value <= last))) {
      const context = buildContext(t);
      const where = `${method}, session ${index + 1}, pas ${t + 1}`;
      for (const step of steps) {
        const math = typeof step.math === 'function' ? step.math(context) : (step.math || '');
        check(step.id, `${step.intro ? step.intro(context) : ''} ${step.lead(context)} ${step.more(context)} ${math}`, where);
      }
      for (let index = 0; index < STEPS.length; index += 1) {
        state.step = index;
        for (const figure of FIGURES) check(`figure ${figure.key}`, figure.describe(t), where);
      }
    }
  }
}

for (const line of found.values()) console.error(line);
console.log(`${STEP_FILES.length} fiches, ${FIGURES.length} figures, ${Object.keys(WIKI).length} notions, ${found.size} défaut${found.size > 1 ? 's' : ''}`);
process.exit(found.size ? 1 : 0);
