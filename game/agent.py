import json
import random
from pathlib import Path

from .interpreter import ACTIONS

ALPHA = 0.1
GAMMA = 0.9
EPSILON_DECAY = 0.99
EPSILON_MIN = 0.001


class Agent:
    def __init__(self, table=None, sessions=0, record=0):
        self.table = {} if table is None else table
        self.sessions = sessions
        self.record = record
        self.random = random.Random()

    @property
    def epsilon(self) -> float:
        return max(EPSILON_MIN, EPSILON_DECAY ** self.sessions)

    def values(self, state: str) -> list[float]:
        return self.table.get(state, [0.0] * len(ACTIONS))

    def act(self, state: str, explore: bool) -> int:
        if explore and self.random.random() < self.epsilon:
            return self.random.randrange(len(ACTIONS))
        values = self.values(state)
        best = max(values)
        choices = []
        for action, value in enumerate(values):
            if value == best:
                choices.append(action)
        return self.random.choice(choices)

    def learn(self, state, action, reward, next_state) -> None:
        target = reward
        if next_state is not None:
            target += GAMMA * max(self.values(next_state))
        values = self.table.setdefault(state, [0.0] * len(ACTIONS))
        values[action] += ALPHA * (target - values[action])

    def close_session(self, length: int) -> None:
        self.sessions += 1
        self.record = max(self.record, length)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "sessions": self.sessions,
            "record": self.record,
            "table": self.table,
        }
        path.write_text(json.dumps(data))

    @classmethod
    def load(cls, path: Path) -> "Agent":
        data = json.loads(path.read_text())
        return cls(data["table"], data["sessions"], data["record"])

