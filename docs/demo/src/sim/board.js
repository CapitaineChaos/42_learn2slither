// Portage JavaScript de game/board.py et game/snake.py, limité à ce que joue
// l'agent : difficulté Hard, limite de faim, pas de coup ignoré.

export const SNAKE_LENGTH = 3;
export const APPLE_START = ['green', 'green', 'red'];

export const UP = { name: 'haut', dx: 0, dy: -1 };
export const LEFT = { name: 'gauche', dx: -1, dy: 0 };
export const DOWN = { name: 'bas', dx: 0, dy: 1 };
export const RIGHT = { name: 'droite', dx: 1, dy: 0 };
export const DIRECTIONS = [UP, DOWN, LEFT, RIGHT];

const opposite = (direction) => DIRECTIONS.find((other) => other.dx === -direction.dx && other.dy === -direction.dy);
const shifted = (cell, direction) => ({ x: cell.x + direction.dx, y: cell.y + direction.dy });
const same = (a, b) => a.x === b.x && a.y === b.y;

function randomCoordinate(rng, size, delta) {
  const span = SNAKE_LENGTH - 1;
  const low = delta > 0 ? span : 0;
  const high = delta < 0 ? size - span : size;
  return low + rng.below(high - low);
}

export class Board {
  constructor(width, height, rng, hungerLimit) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.hungerLimit = hungerLimit;
    this.direction = rng.pick(DIRECTIONS);
    const head = {
      x: randomCoordinate(rng, width, this.direction.dx),
      y: randomCoordinate(rng, height, this.direction.dy),
    };
    this.body = [head];
    while (this.body.length < SNAKE_LENGTH) this.body.push(shifted(this.body[this.body.length - 1], opposite(this.direction)));
    this.tail = this.body[this.body.length - 1];
    this.apples = [];
    APPLE_START.forEach((color) => this.addApple(color));
    this.moves = 0;
    this.hunger = 0;
    this.longest = this.body.length;
    this.over = false;
    this.cause = null;
  }

  get head() {
    return this.body[0];
  }

  inside(cell) {
    return cell.x >= 0 && cell.x < this.width && cell.y >= 0 && cell.y < this.height;
  }

  free(direction) {
    const cell = shifted(this.head, direction);
    if (!this.inside(cell)) return false;
    for (let i = 0; i < this.body.length - 1; i += 1) if (same(this.body[i], cell)) return false;
    return true;
  }

  step(direction) {
    if (!this.free(direction)) return this.die(this.inside(shifted(this.head, direction)) ? 'corps' : 'mur');
    this.direction = direction;
    this.body.unshift(shifted(this.head, direction));
    this.tail = this.body.pop();
    this.moves += 1;
    this.hunger += 1;
    const event = this.eat();
    if (event === 'dead') return this.die('rouge');
    if (this.trapped()) return this.die('piège');
    if (this.hunger > this.hungerLimit) return this.die('faim');
    return event;
  }

  // La cause n'existe pas dans board.py ; elle sert au texte de la fin de
  // session.
  die(cause) {
    this.over = true;
    this.cause = cause;
    return 'dead';
  }

  trapped() {
    return DIRECTIONS.every((direction) => !this.free(direction));
  }

  eat() {
    const apple = this.apples.find((candidate) => same(candidate.position, this.head));
    if (!apple) return 'moved';
    let event;
    if (apple.color === 'green') {
      this.body.push(this.tail);
      this.hunger = 0;
      this.longest = Math.max(this.longest, this.body.length);
      event = 'green';
    } else if (this.body.length === 1) {
      return 'dead';
    } else {
      this.body.pop();
      event = 'red';
    }
    this.respawn(apple);
    return event;
  }

  addApple(color) {
    const position = this.freeCell();
    if (position) this.apples.push({ position, color });
  }

  respawn(apple) {
    const position = this.freeCell();
    if (position) apple.position = position;
    else this.apples.splice(this.apples.indexOf(apple), 1);
  }

  freeCell() {
    const taken = new Set(this.body.map((cell) => cell.y * this.width + cell.x));
    this.apples.forEach((apple) => taken.add(apple.position.y * this.width + apple.position.x));
    const cells = [];
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) if (!taken.has(y * this.width + x)) cells.push({ x, y });
    }
    return cells.length ? this.rng.pick(cells) : null;
  }

  // Copie de ce que les figures dessinent, pour rejouer une session.
  picture() {
    return {
      body: this.body.map((cell) => ({ ...cell })),
      apples: this.apples.map((apple) => ({ position: { ...apple.position }, color: apple.color })),
      direction: this.direction,
      hunger: this.hunger,
    };
  }
}
