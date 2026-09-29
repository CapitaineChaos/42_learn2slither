import copy
import random
import unittest

from game.agent import Agent
from game.board import Board, Difficulty, Event
from game.match import Match, Phase
from game.settings import Pace, Settings
from game.snake import Direction, Point, Snake
from game.training import Training, agent_board, play

FACING_WALL = [Point(9, 5), Point(8, 5), Point(7, 5)]
ONE_EXIT_INTO_CORNER = [
    Point(1, 0),
    Point(1, 1),
    Point(0, 1),
    Point(0, 2),
    Point(0, 3),
]


def board_with(difficulty, body, direction) -> Board:
    board = Board(10, 10, difficulty, random.Random(0))
    board.snake = Snake(body, direction)
    board.apples = []
    return board


def match_with(difficulty, pace, body, direction) -> Match:
    settings = Settings(difficulty=difficulty, pace=pace)
    match = Match(settings, Agent(), random.Random(0))
    match.board = board_with(difficulty, body, direction)
    return match


class FrozenAgent(unittest.TestCase):
    def test_frozen_play_leaves_agent_unchanged(self):
        agent = Agent()
        training = Training(agent, 10, 10, 50)
        while not training.finished:
            training.advance(1)
        table = copy.deepcopy(agent.table)
        board = agent_board(10, 10, random.Random(0))
        for _ in range(500):
            if board.over:
                board = agent_board(10, 10, random.Random(0))
            play(board, agent, False)
        self.assertEqual(
            agent.table, table, "act() insérait les états inconnus"
        )


class BlockedMoves(unittest.TestCase):
    def test_easy_turn_based_order_into_wall_does_nothing(self):
        match = match_with(
            Difficulty.EASY, Pace.TURN_BASED, FACING_WALL, Direction.RIGHT
        )
        match.steer(Direction.RIGHT)
        self.assertEqual(
            match.board.snake.body,
            FACING_WALL,
            "garde-fou : un ordre vers le mur faisait avancer tout droit",
        )
        match.steer(Direction.UP)
        self.assertEqual(match.board.snake.head, Point(9, 4))

    def test_blocked_snake_is_not_redrawn(self):
        match = match_with(
            Difficulty.EASY, Pace.REAL_TIME, FACING_WALL, Direction.RIGHT
        )
        previous = list(match.board.snake.previous_body)
        match.step()
        self.assertEqual(match.progress(), 1.0, "attente réanimée")
        self.assertEqual(
            match.board.snake.previous_body,
            previous,
            "hold() réorientait les segments coudés",
        )

    def test_normal_order_into_wall_kills(self):
        board = board_with(Difficulty.NORMAL, FACING_WALL, Direction.RIGHT)
        self.assertEqual(board.step(), Event.BLOCKED)
        self.assertEqual(board.step(Direction.RIGHT), Event.DEAD)

    def test_dead_end_death_waits_for_last_move(self):
        match = match_with(
            Difficulty.EASY,
            Pace.REAL_TIME,
            ONE_EXIT_INTO_CORNER,
            Direction.UP,
        )
        match.steer(Direction.LEFT)
        match.update(0)
        self.assertEqual(
            match.phase, Phase.DYING, "impasse : GAME OVER avant l'animation"
        )
        self.assertLess(match.progress(), 1.0)
        match.update(match.tick_duration)
        self.assertEqual(match.phase, Phase.OVER)

    def test_quick_turns_are_all_played(self):
        match = match_with(
            Difficulty.HARD,
            Pace.REAL_TIME,
            [Point(5, 5), Point(4, 5), Point(3, 5)],
            Direction.RIGHT,
        )
        match.steer(Direction.UP)
        match.steer(Direction.LEFT)
        match.update(0)
        match.update(match.tick_duration)
        self.assertEqual(
            match.board.snake.head,
            Point(4, 4),
            "un seul ordre par pas : le premier virage était écrasé",
        )

    def test_dead_end_kills_in_every_difficulty(self):
        for difficulty in Difficulty:
            board = board_with(difficulty, ONE_EXIT_INTO_CORNER, Direction.UP)
            self.assertEqual(
                board.step(Direction.LEFT),
                Event.DEAD,
                f"{difficulty.name} : serpent coincé resté en vie",
            )

    def test_reverse_onto_neck_kills_except_in_easy(self):
        expected = {
            Difficulty.EASY: Point(6, 5),
            Difficulty.NORMAL: None,
            Difficulty.HARD: None,
        }
        for difficulty, head in expected.items():
            match = match_with(
                difficulty,
                Pace.REAL_TIME,
                [Point(5, 5), Point(4, 5), Point(3, 5)],
                Direction.RIGHT,
            )
            match.steer(Direction.LEFT)
            match.update(0)
            if head is None:
                self.assertTrue(
                    match.board.over,
                    f"{difficulty.name} : demi-tour sur le cou ignoré",
                )
            else:
                self.assertEqual(match.board.snake.head, head)


if __name__ == "__main__":
    unittest.main()
