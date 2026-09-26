import random

import pygame

from .apple import Apple
from . import config
from .renderer import Renderer
from .snake import Direction, Point, Snake


KEYS = {
    pygame.K_UP: Direction.UP,
    pygame.K_DOWN: Direction.DOWN,
    pygame.K_LEFT: Direction.LEFT,
    pygame.K_RIGHT: Direction.RIGHT,
}


class Game:
    def __init__(self, speed=config.SPEED):
        pygame.init()
        self.clock = pygame.time.Clock()
        self.step_duration = 1 / max(speed, 0.1)
        self.elapsed = 0.0
        self.renderer = Renderer()
        self.random = random.Random()
        self.snake = self.random_snake()
        self.apples = []
        for color in config.APPLE_START:
            self.apples.append(Apple(self.free_position(), color))
        self.running = True

    def run(self) -> None:
        try:
            while self.running:
                self.handle_events()
                self.elapsed += self.clock.tick(config.FRAME_RATE) / 1000
                while self.elapsed >= self.step_duration:
                    self.elapsed -= self.step_duration
                    self.update()
                self.renderer.draw(
                    self.snake,
                    self.apples,
                    self.elapsed / self.step_duration,
                )
        except KeyboardInterrupt:
            pass
        finally:
            pygame.quit()

    def update(self) -> None:
        if self.snake.step(config.BOARD_SIZE) is None:
            return
        for apple in list(self.apples):
            if apple.position != self.snake.head:
                continue
            if apple.color == "green":
                self.snake.grow()
            else:
                self.snake.shrink()
            self.respawn(apple)

    def respawn(self, apple) -> None:
        position = self.free_position()
        if position is None:
            self.apples.remove(apple)
        else:
            apple.position = position

    def handle_events(self) -> None:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                self.running = False
            elif event.type == pygame.KEYDOWN and event.key in KEYS:
                self.snake.turn(KEYS[event.key])

    def free_position(self):
        occupied = set(self.snake.body)
        occupied.update(
            apple.position for apple in getattr(self, "apples", [])
        )
        choices = [
            Point(x, y)
            for y in range(config.BOARD_SIZE)
            for x in range(config.BOARD_SIZE)
            if Point(x, y) not in occupied
        ]
        return self.random.choice(choices) if choices else None

    def random_snake(self) -> Snake:
        direction = self.random.choice(tuple(Direction))
        dx, dy = direction.value
        span = config.SNAKE_LENGTH - 1
        head = Point(
            self.random.randrange(
                span if dx > 0 else 0,
                config.BOARD_SIZE - (span if dx < 0 else 0),
            ),
            self.random.randrange(
                span if dy > 0 else 0,
                config.BOARD_SIZE - (span if dy < 0 else 0),
            ),
        )
        body = [head]
        while len(body) < config.SNAKE_LENGTH:
            body.append(body[-1].shifted(direction.opposite))
        return Snake(body, direction)
