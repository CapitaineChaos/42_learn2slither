import random
import sys

import pygame

from . import config, hud
from .agent import Agent
from .controls import ControlPanel
from .match import Match, Phase
from .models import Library
from .renderer import Renderer
from .settings import Pace, Player, Settings
from .snake import Direction
from .training import Training

KEYS = {
    pygame.K_UP: Direction.UP,
    pygame.K_DOWN: Direction.DOWN,
    pygame.K_LEFT: Direction.LEFT,
    pygame.K_RIGHT: Direction.RIGHT,
}


def window_positions():
    desktop_width, desktop_height = pygame.display.get_desktop_sizes()[0]
    total = config.BOARD_AREA + config.WINDOW_GAP + config.PANEL_WIDTH
    left = max(0, (desktop_width - total) // 2)
    top = max(0, (desktop_height - config.BOARD_AREA) // 2)
    panel_left = left + config.BOARD_AREA + config.WINDOW_GAP
    return (left, top), (panel_left, top)


class App:
    def __init__(self, speed=config.SPEED, models=config.MODELS):
        pygame.init()
        board_position, panel_position = window_positions()
        self.clock = pygame.time.Clock()
        self.random = random.Random()
        self.settings = Settings(speed=max(speed, 0.1))
        self.library = Library(models)
        self.agent = Agent()
        self.training = None
        self.renderer = Renderer(board_position)
        self.pointer = None
        self.overlay = None
        self.restart()
        self.controls = ControlPanel(self, panel_position)
        self.running = True

    def run(self) -> None:
        try:
            while self.running:
                seconds = self.clock.tick(config.FRAME_RATE) / 1000
                for event in pygame.event.get():
                    self.handle(event)
                self.update(seconds)
                self.draw(seconds)
        except KeyboardInterrupt:
            pass
        finally:
            pygame.quit()

    def update(self, seconds: float) -> None:
        if self.training is not None:
            self.train()
        else:
            self.match.update(seconds)
            self.autoplay(seconds)

    def autoplay(self, seconds: float) -> None:
        if self.match.phase is not Phase.OVER or not self.watching_ai():
            return
        self.wait += seconds
        if self.wait >= config.SESSION_PAUSE:
            self.restart()
            self.match.press_start()

    def watching_ai(self) -> bool:
        return (
            self.settings.player is Player.AI
            and self.settings.pace is Pace.REAL_TIME
        )

    def train(self) -> None:
        self.training.advance(config.TRAINING_BUDGET)
        if self.training.finished:
            self.toggle_training()

    def toggle_training(self) -> None:
        if self.training is None:
            self.match.pause()
            self.training = Training(
                self.agent,
                self.settings.width,
                self.settings.height,
                self.settings.sessions,
            )
            return
        self.training = None
        if self.settings.player is Player.AI:
            self.restart()

    def restart(self) -> None:
        self.match = Match(self.settings, self.agent, self.random)
        self.wait = 0.0

    def press_start(self) -> None:
        if self.match.ended:
            self.restart()
        else:
            self.match.press_start()

    def pace_changed(self) -> None:
        self.match.on_pace_change()

    def difficulty_changed(self) -> None:
        self.match.board.difficulty = self.settings.difficulty

    def load_model(self, name: str | None) -> None:
        try:
            self.agent = Agent() if name is None else self.library.load(name)
        except (OSError, ValueError, KeyError) as error:
            print(f"{name}: {error}", file=sys.stderr)
            return
        if self.settings.player is Player.AI:
            self.restart()

    def save_model(self) -> str:
        return self.library.save(self.agent)

    def idle(self) -> bool:
        return self.training is None

    def human_idle(self) -> bool:
        return self.idle() and self.settings.player is Player.HUMAN

    def ai_idle(self) -> bool:
        return self.idle() and self.settings.player is Player.AI

    def real_time_idle(self) -> bool:
        return self.idle() and self.settings.pace is Pace.REAL_TIME

    def handle(self, event) -> None:
        self.controls.handle(event)
        if event.type in (pygame.QUIT, pygame.WINDOWCLOSE):
            self.running = False
        elif event.type == pygame.KEYDOWN:
            self.press_key(event.key)
        elif getattr(event, "window", None) is self.renderer.window:
            self.handle_board_event(event)

    def press_key(self, key: int) -> None:
        if key == pygame.K_ESCAPE:
            self.running = False
        elif key == pygame.K_t:
            self.toggle_training()
        elif not self.idle():
            return
        elif key in KEYS:
            self.match.steer(KEYS[key])
        elif key == pygame.K_SPACE:
            self.press_start()
        elif key == pygame.K_r:
            self.restart()

    def handle_board_event(self, event) -> None:
        if event.type == pygame.MOUSEMOTION:
            self.pointer = event.pos
        elif event.type == pygame.WINDOWLEAVE:
            self.pointer = None
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            self.click_overlay(event.pos)

    def click_overlay(self, position) -> None:
        button = self.renderer.button
        if button is None or not button.collidepoint(position):
            return
        if self.overlay is not None and self.overlay.press is not None:
            self.overlay.press()

    def draw(self, seconds: float) -> None:
        if self.training is None:
            self.overlay = hud.match_overlay(
                self.match, self.watching_ai(), self.press_start
            )
            board = self.match.board
            progress = self.match.progress()
        else:
            self.overlay = hud.training_overlay(
                self.training, self.toggle_training
            )
            board = self.training.board
            progress = 1.0
        self.renderer.draw(board, progress, self.overlay, self.pointer)
        self.controls.draw(seconds)
