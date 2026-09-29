import random
import time
from collections import deque

from . import config, interpreter
from .agent import Agent
from .board import Board, Difficulty, Event


def agent_board(width: int, height: int, rng: random.Random) -> Board:
    hunger_limit = config.HUNGER * width * height
    return Board(width, height, Difficulty.HARD, rng, hunger_limit)


def play(board: Board, agent: Agent, learning: bool) -> Event:
    state = interpreter.state(board)
    action = agent.act(state, learning)
    event = board.step(interpreter.ACTIONS[action])
    if learning:
        next_state = None if board.over else interpreter.state(board)
        agent.learn(state, action, interpreter.reward(event), next_state)
    return event


class Training:
    def __init__(self, agent: Agent, width: int, height: int, total: int):
        self.agent = agent
        self.width = width
        self.height = height
        self.total = total
        self.done = 0
        self.lengths = deque(maxlen=100)
        self.random = random.Random()
        self.board = agent_board(width, height, self.random)

    @property
    def finished(self) -> bool:
        return self.done >= self.total

    @property
    def mean(self) -> float:
        if not self.lengths:
            return 0.0
        return sum(self.lengths) / len(self.lengths)

    def advance(self, budget: float) -> None:
        deadline = time.perf_counter() + budget
        while not self.finished and time.perf_counter() < deadline:
            play(self.board, self.agent, True)
            if self.board.over:
                self.close_session()

    def close_session(self) -> None:
        self.agent.close_session(self.board.longest)
        self.lengths.append(self.board.longest)
        self.done += 1
        self.board = agent_board(self.width, self.height, self.random)
