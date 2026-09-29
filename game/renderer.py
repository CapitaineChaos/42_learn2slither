from io import BytesIO
from pathlib import Path

import cairosvg
import pygame

from . import config
from .board import Board
from .hud import Overlay


ASSETS = Path(__file__).parent / "assets"
FONTS = ("dejavusans", "liberationsans", "arial")
OVERLAY_ALPHA = 120
OVERLAY_GAP = 14
BUTTON_WIDTH = 200
BUTTON_HEIGHT = 46


def font(size: int) -> pygame.font.Font:
    return pygame.font.SysFont(FONTS, size)


class Renderer:
    def __init__(self, position):
        self.window = pygame.Window(
            "Learn2Slither",
            (config.BOARD_AREA, config.BOARD_AREA),
            position=position,
        )
        self.screen = self.window.get_surface()
        self.title_font = font(30)
        self.action_font = font(18)
        self.hint_font = font(13)
        self.button = None
        self.sprite_cache = {}
        self.resize(config.BOARD_SIZE, config.BOARD_SIZE)

    def resize(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.cell = min(
            config.CELL_SIZE,
            config.BOARD_AREA // (width + 2),
            config.BOARD_AREA // (height + 2),
        )
        self.origin = (
            (config.BOARD_AREA - (width + 2) * self.cell) // 2,
            (config.BOARD_AREA - (height + 2) * self.cell) // 2,
        )
        if self.cell not in self.sprite_cache:
            self.sprite_cache[self.cell] = self.load_sprites()
        self.sprites = self.sprite_cache[self.cell]

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

    def load_sprite(self, path: Path, colors=None) -> pygame.Surface:
        source = path.read_text()
        colors = config.SNAKE_SVG_COLORS if colors is None else colors
        for original, replacement in colors.items():
            source = source.replace(original, replacement)
        png = cairosvg.svg2png(
            bytestring=source.encode(),
            output_width=self.cell,
            output_height=self.cell,
        )
        return pygame.image.load(BytesIO(png)).convert_alpha()

    def draw(self, board: Board, alpha=0.0, overlay=None, pointer=None):
        self.screen.fill(config.BACKGROUND)
        self.draw_board()
        self.draw_walls()
        for apple in board.apples:
            self.draw_apple(apple)
        for index, (point, direction) in reversed(
            list(enumerate(board.snake.segments(alpha)))
        ):
            self.draw_sprite(point, index == 0, direction.value)
        self.button = None
        if overlay is not None:
            self.draw_overlay(overlay, self.anchor(board), pointer)
        self.window.flip()

    def pixel(self, x: float, y: float) -> tuple[float, float]:
        return (
            self.origin[0] + x * self.cell,
            self.origin[1] + y * self.cell,
        )

    def draw_board(self) -> None:
        left, top = self.pixel(0.5, 0.5)
        rect = pygame.Rect(
            left,
            top,
            (self.width + 1) * self.cell,
            (self.height + 1) * self.cell,
        )
        pygame.draw.rect(self.screen, config.BOARD, rect)
        for y in range(self.height):
            for x in range(self.width):
                rect = pygame.Rect(
                    self.pixel(x + 1, y + 1), (self.cell, self.cell)
                )
                pygame.draw.rect(self.screen, config.GRID, rect, 1)

    def draw_walls(self) -> None:
        right = self.width + 1
        bottom = self.height + 1
        self.blit_wall("top_left", 0, 0)
        self.blit_wall("top_right", right, 0)
        self.blit_wall("bottom_left", 0, bottom)
        self.blit_wall("bottom_right", right, bottom)
        for index in range(1, right):
            self.blit_wall("wall_h", index, 0)
            self.blit_wall("wall_h", index, bottom)
        for index in range(1, bottom):
            self.blit_wall("wall_v", 0, index)
            self.blit_wall("wall_v", right, index)

    def blit_wall(self, name, x, y) -> None:
        self.screen.blit(self.sprites[name], self.pixel(x, y))

    def draw_apple(self, apple) -> None:
        sprite = self.sprites[f"apple_{apple.color}"]
        position = self.pixel(apple.position.x + 1, apple.position.y + 1)
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
        center = self.pixel(point[0] + 1.5, point[1] + 1.5)
        self.screen.blit(sprite, sprite.get_rect(center=center))

    def anchor(self, board: Board) -> int:
        if board.snake.head.y < board.height / 2:
            return config.BOARD_AREA * 3 // 4
        return config.BOARD_AREA // 4

    def draw_overlay(self, overlay: Overlay, center_y: int, pointer) -> None:
        veil = pygame.Surface(self.screen.get_size(), pygame.SRCALPHA)
        veil.fill((*config.BACKGROUND[:3], OVERLAY_ALPHA))
        self.screen.blit(veil, (0, 0))
        texts = []
        if overlay.title is not None:
            texts.append(
                self.title_font.render(overlay.title, True, config.TEXT)
            )
        if overlay.detail is not None:
            texts.append(
                self.action_font.render(overlay.detail, True, config.MUTED)
            )
        heights = []
        for text in texts:
            heights.append(text.get_height())
        if overlay.action is not None:
            heights.append(BUTTON_HEIGHT)
        top = center_y - (sum(heights) + OVERLAY_GAP * (len(heights) - 1)) // 2
        center_x = config.BOARD_AREA // 2
        for text in texts:
            self.screen.blit(text, text.get_rect(midtop=(center_x, top)))
            top += text.get_height() + OVERLAY_GAP
        if overlay.action is not None:
            self.draw_button(overlay, (center_x, top), pointer)

    def draw_button(self, overlay: Overlay, midtop, pointer) -> None:
        label = self.action_font.render(
            overlay.action, True, config.ACCENT_TEXT
        )
        hint = self.hint_font.render(overlay.hint, True, config.ACCENT_TEXT)
        hint.set_alpha(150)
        width = max(BUTTON_WIDTH, label.get_width() + hint.get_width() + 56)
        rect = pygame.Rect(0, 0, width, BUTTON_HEIGHT)
        rect.midtop = midtop
        hovered = pointer is not None and rect.collidepoint(pointer)
        color = config.ACCENT_HOVER if hovered else config.ACCENT
        pygame.draw.rect(self.screen, color, rect, border_radius=8)
        self.screen.blit(
            label, label.get_rect(midleft=(rect.x + 20, rect.centery))
        )
        self.screen.blit(
            hint, hint.get_rect(midright=(rect.right - 16, rect.centery))
        )
        self.button = rect
