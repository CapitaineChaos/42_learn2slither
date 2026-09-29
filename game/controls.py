from pathlib import Path

import pygame
import pygame_gui
from pygame_gui.elements import (
    UIButton,
    UIDropDownMenu,
    UIHorizontalSlider,
    UILabel,
    UIProgressBar,
)

from . import config
from .board import Difficulty
from .hud import start_label
from .settings import Pace, Player

THEME = Path(__file__).parent / "assets" / "theme.json"
HEIGHT = 572
MARGIN = 16
GAP = 8
ROW = 36
SECTION_GAP = 14
LABEL_WIDTH = 110
CONTROL_HEIGHT = 30
NEW_MODEL = "new"
SIZES = tuple(range(config.BOARD_MIN, config.BOARD_MAX + 1))
PLAYERS = {"Human": Player.HUMAN, "AI": Player.AI}
PACES = {"Real-time": Pace.REAL_TIME, "Turn-based": Pace.TURN_BASED}
DIFFICULTIES = {
    "Easy": Difficulty.EASY,
    "Normal": Difficulty.NORMAL,
    "Hard": Difficulty.HARD,
}
LEARNING = {"On": True, "Off": False}
SESSIONS = {str(count): count for count in config.SESSIONS}
UI_EVENTS = (
    pygame_gui.UI_BUTTON_PRESSED,
    pygame_gui.UI_DROP_DOWN_MENU_CHANGED,
    pygame_gui.UI_HORIZONTAL_SLIDER_MOVED,
)


def set_enabled(element, allowed: bool) -> None:
    if allowed and not element.is_enabled:
        element.enable()
    elif not allowed and element.is_enabled:
        element.disable()


def set_selected(button: UIButton, selected: bool) -> None:
    if selected and not button.is_selected:
        button.select()
    elif not selected and button.is_selected:
        button.unselect()


def set_text(element, text: str) -> None:
    if element.text != text:
        element.set_text(text)


def closest_index(values, value) -> int:
    distances = [abs(candidate - value) for candidate in values]
    return distances.index(min(distances))


def key_of(options: dict, value) -> str:
    for text, option in options.items():
        if option == value:
            return text
    raise KeyError(value)


class PanelManager(pygame_gui.UIManager):
    pointer_inside = False

    def calculate_scaled_mouse_position(self, position):
        if not self.pointer_inside:
            return (-1, -1)
        return super().calculate_scaled_mouse_position(position)


class Progress(UIProgressBar):
    def set_count(self, done: int, total: int) -> None:
        self.current_progress = done
        self.maximum_progress = total
        self.percent_full = done / total

    def status_text(self):
        return f"{self.current_progress:.0f} / {self.maximum_progress:.0f}"


class ControlPanel:
    def __init__(self, app, position):
        self.app = app
        size = (config.PANEL_WIDTH, HEIGHT)
        self.window = pygame.Window(
            "Learn2Slither · Controls", size, position=position
        )
        self.surface = self.window.get_surface()
        self.manager = PanelManager(size, THEME)
        self.handlers = {}
        self.guards = []
        self.selections = []
        self.top = MARGIN
        self.build_game_settings()
        self.build_ai_settings()
        self.build_actions()
        self.build_stats()

    def build_game_settings(self) -> None:
        app = self.app
        self.slider("Width", "width", SIZES, app.idle, app.restart)
        self.slider("Height", "height", SIZES, app.idle, app.restart)
        self.toggle("Player", "player", PLAYERS, app.idle, app.restart)
        self.toggle("Mode", "pace", PACES, app.idle, app.pace_changed)
        self.slider("Speed", "speed", config.SPEEDS, app.real_time_idle)
        self.toggle(
            "Difficulty",
            "difficulty",
            DIFFICULTIES,
            app.human_idle,
            app.difficulty_changed,
        )
        self.top += SECTION_GAP

    def build_ai_settings(self) -> None:
        app = self.app
        self.choice("Learning", "learning", LEARNING, app.ai_idle)
        label, rect = self.row("Model")
        options = [NEW_MODEL, *app.library.names()]
        self.model = UIDropDownMenu(options, NEW_MODEL, rect, self.manager)
        self.guard(app.idle, label, self.model)
        load, save = self.columns(self.row(None)[1], 2)
        self.button(load, "Load", self.load_model, app.idle)
        self.button(save, "Save", self.save_model, app.idle)
        self.choice("Sessions", "sessions", SESSIONS, app.idle)
        rect = self.row(None)[1]
        self.train = self.button(rect, "Train", app.toggle_training)
        self.top += SECTION_GAP

    def build_actions(self) -> None:
        rect = pygame.Rect(
            MARGIN, self.top, config.PANEL_WIDTH - 2 * MARGIN, CONTROL_HEIGHT
        )
        start, restart = self.columns(rect, 2)
        self.start = self.button(
            start, "Start", self.app.press_start, self.app.idle
        )
        self.button(restart, "Restart", self.app.restart, self.app.idle)
        self.top += ROW + SECTION_GAP

    def build_stats(self) -> None:
        width = config.PANEL_WIDTH - 2 * MARGIN
        rect = pygame.Rect(MARGIN, self.top, width, CONTROL_HEIGHT)
        self.progress = Progress(rect, self.manager)
        self.progress.hide()
        left, right = self.columns(rect, 2)
        self.length = UILabel(left, "", self.manager)
        self.moves = UILabel(right, "", self.manager)
        left, right = self.columns(rect.move(0, ROW), 2)
        self.sessions = UILabel(left, "", self.manager)
        self.best = UILabel(right, "", self.manager)

    def row(self, title: str | None):
        label_rect = pygame.Rect(MARGIN, self.top, LABEL_WIDTH, CONTROL_HEIGHT)
        control_left = MARGIN + LABEL_WIDTH + GAP
        control_width = config.PANEL_WIDTH - control_left - MARGIN
        rect = pygame.Rect(
            control_left, self.top, control_width, CONTROL_HEIGHT
        )
        self.top += ROW
        label = None
        if title is not None:
            label = UILabel(label_rect, title, self.manager)
        return label, rect

    def columns(self, rect: pygame.Rect, count: int) -> list[pygame.Rect]:
        width = (rect.width - GAP * (count - 1)) // count
        cells = []
        for index in range(count):
            left = rect.x + index * (width + GAP)
            if index == count - 1:
                width = rect.right - left
            cells.append(pygame.Rect(left, rect.y, width, rect.height))
        return cells

    def guard(self, allowed, *elements) -> None:
        for element in elements:
            if element is not None:
                self.guards.append((element, allowed))

    def button(self, rect, text, press, allowed=None) -> UIButton:
        button = UIButton(rect, text, self.manager)
        self.handlers[button] = lambda event: press()
        if allowed is not None:
            self.guard(allowed, button)
        return button

    def toggle(self, title, attribute, options, allowed, then=None) -> None:
        label, rect = self.row(title)
        self.guard(allowed, label)
        cells = self.columns(rect, len(options))
        for (text, value), cell in zip(options.items(), cells):
            button = UIButton(cell, text, self.manager)
            self.guard(allowed, button)
            self.selections.append((button, attribute, value))
            self.handlers[button] = self.picker(attribute, value, then)

    def picker(self, attribute, value, then):
        def picked(event):
            setattr(self.app.settings, attribute, value)
            if then is not None:
                then()

        return picked

    def choice(self, title, attribute, options, allowed, then=None) -> None:
        settings = self.app.settings
        label, rect = self.row(title)
        current = key_of(options, getattr(settings, attribute))
        menu = UIDropDownMenu(list(options), current, rect, self.manager)
        self.guard(allowed, label, menu)

        def changed(event):
            setattr(settings, attribute, options[event.text])
            if then is not None:
                then()

        self.handlers[menu] = changed

    def slider(self, title, attribute, values, allowed, then=None) -> None:
        settings = self.app.settings
        label, rect = self.row(title)
        start = closest_index(values, getattr(settings, attribute))
        slider = UIHorizontalSlider(
            rect, start, (0, len(values) - 1), self.manager
        )
        self.guard(allowed, label, slider)
        suffix = "/s" if attribute == "speed" else ""
        set_text(label, f"{title}  {values[start]:g}{suffix}")

        def moved(event):
            value = values[round(event.value)]
            setattr(settings, attribute, value)
            set_text(label, f"{title}  {value:g}{suffix}")
            if then is not None:
                then()

        self.handlers[slider] = moved

    def load_model(self) -> None:
        name = self.model.selected_option[0]
        self.app.load_model(None if name == NEW_MODEL else name)

    def save_model(self) -> None:
        name = self.app.save_model()
        if name not in [option[0] for option in self.model.options_list]:
            self.model.add_options([name])

    def handle(self, event) -> None:
        window = getattr(event, "window", None)
        self.track_pointer(event, window)
        if window is None or window is self.window:
            self.manager.process_events(event)
        handler = self.handlers.get(getattr(event, "ui_element", None))
        if event.type in UI_EVENTS and handler is not None:
            handler(event)

    def track_pointer(self, event, window) -> None:
        if event.type == pygame.WINDOWLEAVE and window is self.window:
            self.manager.pointer_inside = False
        elif event.type in (pygame.MOUSEMOTION, pygame.WINDOWENTER):
            self.manager.pointer_inside = window is self.window

    def draw(self, seconds: float) -> None:
        self.refresh()
        self.manager.update(seconds)
        self.surface.fill(config.PANEL)
        self.manager.draw_ui(self.surface)
        self.window.flip()

    def refresh(self) -> None:
        app = self.app
        for element, allowed in self.guards:
            set_enabled(element, allowed())
        for button, attribute, value in self.selections:
            current = getattr(app.settings, attribute) == value
            set_selected(button, current and button.is_enabled)
        set_text(self.start, start_label(app.match))
        set_text(self.train, "Train" if app.training is None else "Stop")
        if app.training is None:
            self.show_stats()
        else:
            self.show_progress(app.training)

    def show_stats(self) -> None:
        board = self.app.match.board
        agent = self.app.agent
        self.progress.hide()
        self.length.show()
        self.moves.show()
        set_text(self.length, f"Length  {len(board.snake.body)}")
        set_text(self.moves, f"Moves  {board.moves}")
        set_text(self.sessions, f"Sessions  {agent.sessions}")
        set_text(self.best, f"Best  {agent.record}")

    def show_progress(self, training) -> None:
        self.length.hide()
        self.moves.hide()
        self.progress.show()
        self.progress.set_count(training.done, training.total)
        set_text(self.sessions, f"Sessions  {training.agent.sessions}")
        set_text(self.best, f"Best  {training.agent.record}")
