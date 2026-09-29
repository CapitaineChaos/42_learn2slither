import random
from dataclasses import dataclass
from enum import Enum

from . import config


class Direction(Enum):
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)

    @property
    def opposite(self) -> "Direction":
        dx, dy = self.value
        return Direction((-dx, -dy))


@dataclass(frozen=True)
class Point:
    x: int
    y: int

    def shifted(self, direction: Direction) -> "Point":
        dx, dy = direction.value
        return Point(self.x + dx, self.y + dy)


def random_coordinate(rng: random.Random, size: int, delta: int) -> int:
    span = config.SNAKE_LENGTH - 1
    low = span if delta > 0 else 0
    high = size - span if delta < 0 else size
    return rng.randrange(low, high)


class Snake:
    def __init__(self, body, direction: Direction):
        self.body = list(body)
        self.previous_body = list(body)
        self.direction = direction
        self.tail = self.body[-1]

    @classmethod
    def random(cls, width: int, height: int, rng: random.Random) -> "Snake":
        direction = rng.choice(tuple(Direction))
        dx, dy = direction.value
        head = Point(
            random_coordinate(rng, width, dx),
            random_coordinate(rng, height, dy),
        )
        body = [head]
        while len(body) < config.SNAKE_LENGTH:
            body.append(body[-1].shifted(direction.opposite))
        return cls(body, direction)

    @property
    def head(self) -> Point:
        return self.body[0]

    def advance(self, direction: Direction) -> None:
        self.previous_body = list(self.body)
        self.direction = direction
        self.body.insert(0, self.head.shifted(direction))
        self.tail = self.body.pop()

    def grow(self) -> None:
        self.body.append(self.tail)

    def shrink(self) -> None:
        self.body.pop()

    def segments(self, alpha: float):
        last = len(self.previous_body) - 1
        return [
            self.segment(
                index, cell, self.previous_body[min(index, last)], alpha
            )
            for index, cell in enumerate(self.body)
        ]

    def segment(self, index: int, cell: Point, previous: Point, alpha: float):
        point = (
            previous.x + (cell.x - previous.x) * alpha,
            previous.y + (cell.y - previous.y) * alpha,
        )
        return point, self.heading(index, cell, previous)

    def heading(self, index: int, cell: Point, previous: Point) -> Direction:
        delta = (cell.x - previous.x, cell.y - previous.y)
        if delta == (0, 0) and index:
            ahead = self.body[index - 1]
            delta = (ahead.x - cell.x, ahead.y - cell.y)
        if delta == (0, 0):
            return self.direction
        return Direction(delta)
