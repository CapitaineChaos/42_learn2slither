import { EVENTS_END } from '../../figures/plateau.js';
import { trainedAgent } from '../../run.js';
import { HUNGER, SIZE, test } from '../../sim/training.js';

const pad = (text, width) => String(text).padStart(width);

export const sessionsText = (count) => `${count} ${count > 1 ? 'sessions' : 'session'}`;

export class TestGame {
  constructor(trained) {
    this.trained = trained;
    this.run = test(trainedAgent(trained), crypto.getRandomValues(new Uint32Array(1))[0]);
    this.position = 0;
  }

  get over() {
    return this.position >= this.run.frames.length;
  }

  get picture() {
    const { frames, final } = this.run;
    return this.position < frames.length ? frames[this.position].picture : final;
  }

  get action() {
    return this.over ? null : this.run.frames[this.position].action;
  }

  advance(steps) {
    this.position = Math.min(this.position + steps, this.run.frames.length);
  }

  rewind() {
    this.position = 0;
  }

  measures() {
    const picture = this.picture;
    let greens = 0;
    let reds = 0;
    let longest = picture.body.length;
    for (let i = 0; i < this.position; i += 1) {
      const frame = this.run.frames[i];
      if (frame.event === 'green') greens += 1;
      if (frame.event === 'red') reds += 1;
      longest = Math.max(longest, frame.length);
    }
    return [
      ['pas', pad(this.position, 4), ''],
      ['longueur', pad(picture.body.length, 3), ''],
      ['maximum', pad(longest, 3), ''],
      ['vertes', pad(greens, 3), ''],
      ['rouges', pad(reds, 3), ''],
      ['faim', pad(`${picture.hunger}/${HUNGER * SIZE * SIZE}`, 7), ''],
      ['fin', pad(this.over ? EVENTS_END[this.run.cause] : '', 11), 'warn'],
    ];
  }

  describe() {
    const { body } = this.picture;
    const end = this.over ? ` Fin : ${EVENTS_END[this.run.cause]}.` : '';
    return `Agent après ${sessionsText(this.trained)}, pas ${this.position}, serpent de longueur ${body.length}, tête en (${body[0].x}, ${body[0].y}).${end}`;
  }

  result() {
    const { longest, steps, cause } = this.run;
    return { trained: this.trained, longest, steps, cause: EVENTS_END[cause] };
  }
}
