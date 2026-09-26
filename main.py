import argparse

from game.app import Game
from game.config import SPEED


def arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("--speed", type=float, default=SPEED)
    return parser.parse_args()


if __name__ == "__main__":
    Game(arguments().speed).run()
