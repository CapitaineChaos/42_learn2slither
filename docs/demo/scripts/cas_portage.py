#!/usr/bin/env python3
"""Cas de référence tirés du jeu Python, pour scripts/verifie_portage.mjs.

Chaque cas est un plateau atteint par des actions au hasard : corps, pommes,
faim, état lu par l'interpréteur, puis une action et l'événement qu'elle
produit. Un dernier jeu de cas donne des mises à jour de la table Q.
"""

import json
import os
import random
import sys
from pathlib import Path

os.environ.setdefault("PYGAME_HIDE_SUPPORT_PROMPT", "1")
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from game.agent import Agent  # noqa: E402
from game.interpreter import ACTIONS, sights, state  # noqa: E402
from game.training import agent_board  # noqa: E402


def board_cases(count: int) -> list[dict]:
    rng = random.Random(42)
    cases = []
    while len(cases) < count:
        board = agent_board(10, 10, random.Random(rng.random()))
        for _ in range(rng.randrange(40)):
            if board.over:
                break
            board.step(ACTIONS[rng.randrange(4)])
        if board.over:
            continue
        case = {
            "body": [[cell.x, cell.y] for cell in board.snake.body],
            "tail": [board.snake.tail.x, board.snake.tail.y],
            "direction": board.snake.direction.name,
            "apples": [[apple.position.x, apple.position.y, apple.color] for apple in board.apples],
            "hunger": board.hunger,
            "sights": sights(board),
            "state": state(board),
        }
        action = rng.randrange(4)
        event = board.step(ACTIONS[action])
        case["action"] = action
        case["event"] = event.value
        case["after"] = [[cell.x, cell.y] for cell in board.snake.body]
        cases.append(case)
    return cases


def learn_cases(count: int) -> list[dict]:
    rng = random.Random(7)
    cases = []
    for _ in range(count):
        agent = Agent()
        state_now, state_next = "0G0D", "D0R0"
        agent.table[state_now] = [rng.uniform(-50, 50) for _ in range(4)]
        agent.table[state_next] = [rng.uniform(-50, 50) for _ in range(4)]
        action = rng.randrange(4)
        reward = rng.choice([-0.1, 10.0, -10.0, -100.0])
        terminal = rng.random() < 0.3
        before = list(agent.table[state_now])
        agent.learn(state_now, action, reward, None if terminal else state_next)
        cases.append({
            "values": before,
            "next": agent.table[state_next],
            "action": action,
            "reward": reward,
            "terminal": terminal,
            "after": agent.table[state_now][action],
        })
    return cases


if __name__ == "__main__":
    json.dump({"boards": board_cases(3000), "updates": learn_cases(500)}, sys.stdout)
