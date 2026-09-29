from pygame import Color

BOARD_SIZE = 10
BOARD_MIN = 5
BOARD_MAX = 40
CELL_SIZE = 56
BOARD_AREA = (BOARD_SIZE + 2) * CELL_SIZE
PANEL_WIDTH = 360
WINDOW_GAP = 24
SPEED = 10
SPEEDS = (1, 2, 3, 5, 8, 10, 15, 20, 30, 60, 120, 240)
SESSIONS = (1, 10, 100, 1000, 10000)
FRAME_RATE = 60
ORDER_BUFFER = 3
STEP_ANIMATION = 0.12
SESSION_PAUSE = 0.5
TRAINING_BUDGET = 0.025
HUNGER = 2
MODELS = "models"
SNAKE_LENGTH = 3
BACKGROUND = Color("#101820")
BOARD = Color("#1b2a35")
GRID = Color("#263d49")
PANEL = Color("#0b1217")
TEXT = Color("#d8e3e8")
MUTED = Color("#6f848f")
ACCENT = Color("#b7e63c")
ACCENT_HOVER = Color("#e2ff73")
ACCENT_TEXT = BACKGROUND
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
