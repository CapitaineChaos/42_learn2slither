import random
from enum import Enum

from . import config
from .apple import Apple
from .snake import Direction, Point, Snake


class Difficulty(Enum):
    EASY = "easy"
    NORMAL = "normal"
    HARD = "hard"


class Event(Enum):
    MOVED = "moved"
    GREEN = "green"
    RED = "red"
    BLOCKED = "blocked"
    DEAD = "dead"


class Board:
    def __init__(
        self,
        width: int,
        height: int,
        difficulty: Difficulty = Difficulty.HARD,
        rng: random.Random | None = None,
        hunger_limit: int | None = None,
    ):
        self.width = width
        self.height = height
        self.difficulty = difficulty
        self.random = rng or random.Random()
        self.hunger_limit = hunger_limit
        self.snake = Snake.random(width, height, self.random)
        self.apples = []
        for color in config.APPLE_START:
            self.add_apple(color)
        self.moves = 0
        self.hunger = 0
        self.longest = len(self.snake.body)
        self.over = False

    def step(self, order: Direction | None = None) -> Event:
        if order is None or not self.accepts(order):
            return self.coast()
        if self.free(order):
            return self.move(order)
        return self.die()

    def accepts(self, order: Direction) -> bool:
        return self.difficulty is not Difficulty.EASY or self.free(order)

    def coast(self) -> Event:
        if self.free(self.snake.direction):
            return self.move(self.snake.direction)
        if self.difficulty is Difficulty.HARD:
            return self.die()
        return Event.BLOCKED

    def move(self, direction: Direction) -> Event:
        self.snake.advance(direction)
        self.moves += 1
        self.hunger += 1
        event = self.eat()
        if event is Event.DEAD or self.trapped() or self.starving():
            return self.die()
        return event

    def die(self) -> Event:
        self.over = True
        return Event.DEAD

    def free(self, direction: Direction) -> bool:
        cell = self.snake.head.shifted(direction)
        return self.inside(cell) and cell not in self.snake.body[:-1]

    def inside(self, cell: Point) -> bool:
        return 0 <= cell.x < self.width and 0 <= cell.y < self.height

    def trapped(self) -> bool:
        for direction in Direction:
            if self.free(direction):
                return False
        return True

    def starving(self) -> bool:
        if self.hunger_limit is None:
            return False
        return self.hunger > self.hunger_limit

    def eat(self) -> Event:
        apple = self.apple_at(self.snake.head)
        if apple is None:
            return Event.MOVED
        if apple.color == "green":
            self.snake.grow()
            self.hunger = 0
            self.longest = max(self.longest, len(self.snake.body))
            event = Event.GREEN
        elif len(self.snake.body) == 1:
            return Event.DEAD
        else:
            self.snake.shrink()
            event = Event.RED
        self.respawn(apple)
        return event

    def apple_at(self, cell: Point) -> Apple | None:
        for apple in self.apples:
            if apple.position == cell:
                return apple
        return None

    def add_apple(self, color: str) -> None:
        position = self.free_cell()
        if position is not None:
            self.apples.append(Apple(position, color))

    def respawn(self, apple: Apple) -> None:
        position = self.free_cell()
        if position is None:
            self.apples.remove(apple)
        else:
            apple.position = position

    def free_cell(self) -> Point | None:
        taken = set(self.snake.body)
        for apple in self.apples:
            taken.add(apple.position)
        cells = []
        for y in range(self.height):
            for x in range(self.width):
                if Point(x, y) not in taken:
                    cells.append(Point(x, y))
        return self.random.choice(cells) if cells else None
