from dataclasses import dataclass
from typing import Callable

from .match import Match, Phase
from .settings import Pace

TITLES = {Phase.READY: None, Phase.PAUSED: "PAUSED", Phase.OVER: "GAME OVER"}
START_LABELS = {
    Phase.READY: "Start",
    Phase.RUNNING: "Pause",
    Phase.PAUSED: "Resume",
}


@dataclass
class Overlay:
    title: str | None = None
    detail: str | None = None
    action: str | None = None
    hint: str = ""
    press: Callable[[], None] | None = None


def start_label(match: Match) -> str:
    if match.ended:
        return "Retry"
    if match.settings.pace is Pace.TURN_BASED:
        return "Step"
    return START_LABELS[match.phase]


def match_overlay(match: Match, autoplay: bool, press) -> Overlay | None:
    if match.phase in (Phase.RUNNING, Phase.DYING):
        return None
    if match.phase is Phase.OVER and autoplay:
        return Overlay("GAME OVER")
    title = TITLES[match.phase]
    return Overlay(title, None, start_label(match), "Space", press)


def training_overlay(training, press) -> Overlay:
    progress = f"{training.done} / {training.total}"
    return Overlay("TRAINING", progress, "Stop", "T", press)
