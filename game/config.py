from pygame import Color

BOARD_SIZE = 10
WORLD_SIZE = BOARD_SIZE + 2
CELL_SIZE = 56
SPEED = 10
FRAME_RATE = 60
SNAKE_LENGTH = 3
BACKGROUND = Color("#101820")
BOARD = Color("#1b2a35")
GRID = Color("#263d49")
APPLE_COLORS = {
    "red": {"#777777": "#8f1d2c", "#bbbbbb": "#e83f50"},
    "green": {"#777777": "#286b36", "#bbbbbb": "#63c95a"},
}
APPLE_START = ("green", "green", "red")
SNAKE = Color("#b7e63c")
SNAKE_HEAD = Color("#e2ff73")
SNAKE_DARK = Color("#28752d")
SNAKE_SHADOW = Color("#12351d")
SNAKE_HIGHLIGHT = Color("#d9ff55")
SNAKE_OUTLINE = Color("#07140d")
SNAKE_SVG_COLORS = {
    "#333333": "#28752d",
    "#999999": "#72bd37",
    "#eeeeee": "#d9ff55",
}
