from dataclasses import dataclass
from enum import Enum


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


class Snake:
    def __init__(self, body, direction: Direction):
        self.body = list(body)
        self.previous_body = list(body)
        self.direction = direction
        self.pending = direction
        self.tail = self.body[-1]

    @property
    def head(self) -> Point:
        return self.body[0]

    def turn(self, direction: Direction) -> None:
        if direction is self.direction.opposite:
            return
        self.pending = direction

    def step(self, board_size: int):
        self.previous_body = list(self.body)
        for direction in (self.pending, self.direction):
            target = self.head.shifted(direction)
            if not self.walkable(target, board_size):
                continue
            self.direction = direction
            self.pending = direction
            self.body.insert(0, target)
            self.tail = self.body.pop()
            return target
        self.pending = self.direction
        return None

    def walkable(self, cell: Point, board_size: int) -> bool:
        if not (0 <= cell.x < board_size and 0 <= cell.y < board_size):
            return False
        return cell not in self.body[:-1]

    def grow(self) -> None:
        self.body.append(self.tail)

    def shrink(self) -> None:
        if len(self.body) > 1:
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
