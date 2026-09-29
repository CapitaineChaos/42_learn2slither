from dataclasses import dataclass
from enum import Enum

from . import config
from .board import Difficulty


class Player(Enum):
    HUMAN = "human"
    AI = "ai"


class Pace(Enum):
    REAL_TIME = "real-time"
    TURN_BASED = "turn-based"


@dataclass
class Settings:
    width: int = config.BOARD_SIZE
    height: int = config.BOARD_SIZE
    speed: float = config.SPEED
    player: Player = Player.HUMAN
    pace: Pace = Pace.REAL_TIME
    difficulty: Difficulty = Difficulty.EASY
    learning: bool = True
    sessions: int = 100
