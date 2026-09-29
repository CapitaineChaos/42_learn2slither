import random
from collections import deque
from enum import Enum

from . import config
from .agent import Agent
from .board import Board
from .settings import Pace, Player, Settings
from .snake import Direction
from .training import agent_board, play


class Phase(Enum):
    READY = "ready"
    RUNNING = "running"
    PAUSED = "paused"
    DYING = "dying"
    OVER = "over"


class Match:
    def __init__(self, settings: Settings, agent: Agent, rng: random.Random):
        self.settings = settings
        self.agent = agent
        self.board = self.new_board(rng)
        self.phase = Phase.READY
        self.orders = deque()
        self.clock = 0.0
        self.moved = False

    def new_board(self, rng: random.Random) -> Board:
        width = self.settings.width
        height = self.settings.height
        if self.settings.player is Player.AI:
            return agent_board(width, height, rng)
        return Board(width, height, self.settings.difficulty, rng)

    @property
    def tick_duration(self) -> float:
        if self.settings.pace is Pace.TURN_BASED:
            return config.STEP_ANIMATION
        return 1 / self.settings.speed

    @property
    def ended(self) -> bool:
        return self.phase in (Phase.DYING, Phase.OVER)

    def progress(self) -> float:
        if not self.moved:
            return 1.0
        return min(1.0, self.clock / self.tick_duration)

    def update(self, seconds: float) -> None:
        if self.phase is Phase.RUNNING:
            self.run(seconds)
        elif self.phase is Phase.DYING:
            self.play_last_move(seconds)

    def play_last_move(self, seconds: float) -> None:
        self.clock += seconds
        if self.clock >= self.tick_duration:
            self.finish()

    def run(self, seconds: float) -> None:
        self.clock += seconds
        if self.settings.pace is Pace.TURN_BASED:
            self.clock = min(self.clock, self.tick_duration)
            return
        while self.phase is Phase.RUNNING and self.clock >= self.tick_duration:
            self.clock -= self.tick_duration
            self.tick()

    def press_start(self) -> None:
        if self.ended:
            return
        if self.settings.pace is Pace.TURN_BASED:
            self.step()
        elif self.phase is Phase.RUNNING:
            self.phase = Phase.PAUSED
        else:
            self.start()

    def start(self) -> None:
        if self.phase is Phase.READY:
            self.clock = self.tick_duration
        self.phase = Phase.RUNNING

    def pause(self) -> None:
        if self.phase is Phase.RUNNING:
            self.phase = Phase.PAUSED

    def on_pace_change(self) -> None:
        self.moved = False
        self.clock = 0.0
        self.orders.clear()
        if self.settings.pace is Pace.REAL_TIME:
            self.pause()

    def steer(self, direction: Direction) -> None:
        if self.settings.player is Player.AI or self.ended:
            return
        if len(self.orders) >= config.ORDER_BUFFER:
            return
        if self.settings.pace is Pace.REAL_TIME:
            self.orders.append(direction)
            self.start()
        elif self.board.accepts(direction):
            self.orders.append(direction)
            self.step()

    def step(self) -> None:
        self.phase = Phase.RUNNING
        self.clock = 0.0
        self.tick()

    def tick(self) -> None:
        moves = self.board.moves
        if self.settings.player is Player.AI:
            play(self.board, self.agent, self.settings.learning)
        else:
            order = self.orders.popleft() if self.orders else None
            self.board.step(order)
        self.moved = self.board.moves > moves
        if not self.board.over:
            return
        if self.moved:
            self.phase = Phase.DYING
        else:
            self.finish()

    def finish(self) -> None:
        self.phase = Phase.OVER
        if self.settings.player is Player.AI and self.settings.learning:
            self.agent.close_session(self.board.longest)
