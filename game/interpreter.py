from .board import Board, Event
from .snake import Direction, Point

ACTIONS = (Direction.UP, Direction.LEFT, Direction.DOWN, Direction.RIGHT)
REWARDS = {
    Event.MOVED: -0.1,
    Event.GREEN: 10.0,
    Event.RED: -10.0,
    Event.BLOCKED: -1.0,
    Event.DEAD: -100.0,
}


def reward(event: Event) -> float:
    return REWARDS[event]


def state(board: Board) -> str:
    symbols = []
    for line in sights(board):
        symbols.append(glance(line))
    return "".join(symbols)


def glance(line: str) -> str:
    if line[0] in "WS":
        return "D"
    if line[0] == "R":
        return "R"
    for letter in line:
        if letter in "WS":
            return "0"
        if letter == "G":
            return "G"
    return "0"


def sights(board: Board) -> list[str]:
    body = set(board.snake.body)
    apples = {}
    for apple in board.apples:
        apples[apple.position] = "G" if apple.color == "green" else "R"
    lines = []
    for direction in ACTIONS:
        lines.append(sight(board, direction, body, apples))
    return lines


def sight(board: Board, direction: Direction, body, apples) -> str:
    letters = []
    cell = board.snake.head.shifted(direction)
    while board.inside(cell):
        letters.append(letter(cell, body, apples))
        cell = cell.shifted(direction)
    letters.append("W")
    return "".join(letters)


def letter(cell: Point, body, apples) -> str:
    if cell in body:
        return "S"
    return apples.get(cell, "0")
