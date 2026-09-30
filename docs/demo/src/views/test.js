import { palette } from '../figures/canevas.js';
import { drawBoard } from '../figures/plateau.js';
import { SESSIONS } from '../sim/training.js';
import { state } from '../state.js';
import { zoom } from './figures.js';
import { expand } from './panels.js';
import { occupy, onLeave } from './side.js';
import { TestGame, sessionsText } from './test/game.js';

const panel = document.getElementById('test');
const heading = document.getElementById('test-title');
const level = document.getElementById('test-level');
const levelOutput = document.getElementById('test-sessions');
const speed = document.getElementById('test-speed');
const speedOutput = document.getElementById('test-pace');
const canvas = document.getElementById('test-canvas');
const playButton = document.getElementById('test-play');
const readout = document.getElementById('test-readout');
const log = document.getElementById('test-log');

const KEPT = 12;

let game = null;
let logged = false;
let playing = false;
let frame = null;
let previous = 0;
let carry = 0;
let opener = null;
const results = [];

function draw() {
  const box = canvas.parentElement;
  const w = Math.round(box.clientWidth);
  const h = Math.round(box.clientHeight);
  if (!game || w < 8 || h < 8) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * ratio);
  canvas.height = Math.round(h * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, w, h);
  drawBoard(ctx, w, h, palette(), game.picture, { action: game.action, dead: game.over });
}

function paintSettings() {
  const trained = Number(level.value);
  levelOutput.textContent = sessionsText(trained).padStart(13);
  level.setAttribute('aria-valuetext', sessionsText(trained));
  speedOutput.textContent = `${speed.value.padStart(2)} pas/s`;
}

function paint() {
  draw();
  readout.innerHTML = game.measures().map(([term, value, cls]) =>
    `<div><dt>${term}</dt><dd class="${cls}">${value}</dd></div>`).join('');
  canvas.setAttribute('aria-label', game.describe());
}

function paintLog() {
  log.hidden = results.length === 0;
  log.querySelector('tbody').innerHTML = results.map((result) => `<tr>
    <td>${result.trained}</td><td>${result.longest}</td>
    <td>${result.steps}</td><td>${result.cause}</td></tr>`).join('');
}

function record() {
  if (logged) return;
  logged = true;
  results.unshift(game.result());
  results.length = Math.min(results.length, KEPT);
  paintLog();
}

function stop() {
  playing = false;
  if (frame) cancelAnimationFrame(frame);
  frame = null;
  playButton.textContent = 'Lecture';
  playButton.setAttribute('aria-pressed', 'false');
}

function advance(steps) {
  game.advance(steps);
  if (game.over) {
    stop();
    record();
  }
  paint();
}

function tick(now) {
  const elapsed = Math.min(now - previous, 250);
  previous = now;
  carry += (elapsed / 1000) * Number(speed.value);
  const steps = Math.floor(carry);
  if (steps >= 1) {
    carry -= steps;
    advance(steps);
  }
  if (playing) frame = requestAnimationFrame(tick);
}

function play() {
  if (game.over) {
    game.rewind();
    paint();
  }
  playing = true;
  carry = 0;
  previous = performance.now();
  playButton.textContent = 'Pause';
  playButton.setAttribute('aria-pressed', 'true');
  frame = requestAnimationFrame(tick);
}

function restart() {
  stop();
  paintSettings();
  game = new TestGame(Number(level.value));
  logged = false;
  paint();
  play();
}

export function open() {
  if (panel.hidden) opener = document.activeElement;
  if (state.zoom !== null) zoom(null);
  expand('toggle-plots');
  level.value = state.session + 1;
  occupy('test');
  panel.scrollIntoView({ block: 'nearest' });
  heading.focus({ preventScroll: true });
  restart();
}

function close() {
  if (panel.hidden) return;
  const from = opener;
  occupy('plots');
  if (from && from.isConnected) from.focus();
}

function leave() {
  stop();
  opener = null;
}

export function mount() {
  level.max = SESSIONS;
  onLeave('test', leave);

  document.getElementById('test-open').addEventListener('click', open);
  document.getElementById('test-close').addEventListener('click', close);
  document.getElementById('test-new').addEventListener('click', restart);
  document.getElementById('test-step').addEventListener('click', () => {
    stop();
    advance(1);
  });
  playButton.addEventListener('click', () => {
    if (playing) stop();
    else play();
  });

  let pending = false;
  level.addEventListener('input', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      restart();
    });
  });
  speed.addEventListener('input', paintSettings);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  new ResizeObserver(draw).observe(canvas.parentElement);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
