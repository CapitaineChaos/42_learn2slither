from dataclasses import dataclass

from .snake import Point


@dataclass
class Apple:
    position: Point
    color: str
