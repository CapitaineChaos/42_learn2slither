from io import BytesIO
from pathlib import Path

import cairosvg
import pygame

from . import config
from .snake import Snake


ASSETS = Path(__file__).parent / "assets"


class Renderer:
    def __init__(self):
        size = config.WORLD_SIZE * config.CELL_SIZE
        self.screen = pygame.display.set_mode((size, size))
        pygame.display.set_caption("Learn2Slither")
        self.sprites = self.load_sprites()

    def load_sprites(self):
        return {
            "body": self.load_sprite(ASSETS / "serpent_corps.svg"),
            "head": self.load_sprite(ASSETS / "serpent_tete.svg"),
            "apple_red": self.load_sprite(
                ASSETS / "pomme.svg", config.APPLE_COLORS["red"]
            ),
            "apple_green": self.load_sprite(
                ASSETS / "pomme.svg", config.APPLE_COLORS["green"]
            ),
            "wall_h": self.load_sprite(ASSETS / "mur_horizontal.svg", {}),
            "wall_v": self.load_sprite(ASSETS / "mur_vertical.svg", {}),
            "top_left": self.load_sprite(ASSETS / "coin_haut_gauche.svg", {}),
            "top_right": self.load_sprite(ASSETS / "coin_haut_droit.svg", {}),
            "bottom_left": self.load_sprite(
                ASSETS / "coin_bas_gauche.svg", {}
            ),
            "bottom_right": self.load_sprite(
                ASSETS / "coin_bas_droit.svg", {}
            ),
        }

    @staticmethod
    def load_sprite(path: Path, colors=None) -> pygame.Surface:
        source = path.read_text()
        colors = config.SNAKE_SVG_COLORS if colors is None else colors
        for original, replacement in colors.items():
            source = source.replace(original, replacement)
        png = cairosvg.svg2png(
            bytestring=source.encode(),
            output_width=config.CELL_SIZE,
            output_height=config.CELL_SIZE,
        )
        return pygame.image.load(BytesIO(png)).convert_alpha()

    def draw(self, snake: Snake, apples=(), alpha=0.0) -> None:
        self.screen.fill(config.BACKGROUND)
        self.draw_board()
        self.draw_walls()
        for apple in apples:
            self.draw_apple(apple)
        for index, (point, direction) in reversed(
            list(enumerate(snake.segments(alpha)))
        ):
            self.draw_sprite(point, index == 0, direction.value)
        pygame.display.flip()

    def draw_board(self) -> None:
        rect = pygame.Rect(
            config.CELL_SIZE // 2,
            config.CELL_SIZE // 2,
            (config.BOARD_SIZE + 1) * config.CELL_SIZE,
            (config.BOARD_SIZE + 1) * config.CELL_SIZE,
        )
        pygame.draw.rect(self.screen, config.BOARD, rect)
        for y in range(config.BOARD_SIZE):
            for x in range(config.BOARD_SIZE):
                rect = pygame.Rect(
                    (x + 1) * config.CELL_SIZE,
                    (y + 1) * config.CELL_SIZE,
                    config.CELL_SIZE,
                    config.CELL_SIZE,
                )
                pygame.draw.rect(self.screen, config.GRID, rect, 1)

    def draw_walls(self) -> None:
        self.blit_wall("top_left", 0, 0)
        self.blit_wall("top_right", config.BOARD_SIZE + 1, 0)
        self.blit_wall("bottom_left", 0, config.BOARD_SIZE + 1)
        self.blit_wall(
            "bottom_right", config.BOARD_SIZE + 1, config.BOARD_SIZE + 1
        )
        for index in range(1, config.BOARD_SIZE + 1):
            self.blit_wall("wall_h", index, 0)
            self.blit_wall("wall_h", index, config.BOARD_SIZE + 1)
            self.blit_wall("wall_v", 0, index)
            self.blit_wall("wall_v", config.BOARD_SIZE + 1, index)

    def blit_wall(self, name, x, y) -> None:
        self.screen.blit(
            self.sprites[name],
            (x * config.CELL_SIZE, y * config.CELL_SIZE),
        )

    def draw_apple(self, apple) -> None:
        sprite = self.sprites[f"apple_{apple.color}"]
        position = (
            (apple.position.x + 1) * config.CELL_SIZE,
            (apple.position.y + 1) * config.CELL_SIZE,
        )
        self.screen.blit(sprite, position)

    def draw_sprite(self, point, head, direction) -> None:
        sprite = self.sprites["head" if head else "body"]
        angle = {
            (-1, 0): 0,
            (0, -1): -90,
            (1, 0): 180,
            (0, 1): 90,
        }[direction]
        sprite = pygame.transform.rotate(sprite, angle)
        center = (
            (point[0] + 1) * config.CELL_SIZE + config.CELL_SIZE // 2,
            (point[1] + 1) * config.CELL_SIZE + config.CELL_SIZE // 2,
        )
        self.screen.blit(sprite, sprite.get_rect(center=center))
