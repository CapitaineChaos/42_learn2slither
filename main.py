import argparse

from game.app import App
from game.config import MODELS, SPEED


def arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("--speed", type=float, default=SPEED)
    parser.add_argument("--models", default=MODELS)
    return parser.parse_args()


if __name__ == "__main__":
    options = arguments()
    App(options.speed, options.models).run()
