from pathlib import Path

from .agent import Agent


class Library:
    def __init__(self, directory):
        self.directory = Path(directory)

    def names(self) -> list[str]:
        if not self.directory.is_dir():
            return []
        names = [path.stem for path in self.directory.glob("*.json")]
        names.sort(key=lambda name: (len(name), name))
        return names

    def load(self, name: str) -> Agent:
        return Agent.load(self.path(name))

    def save(self, agent: Agent) -> str:
        name = f"{agent.sessions}sess"
        agent.save(self.path(name))
        return name

    def path(self, name: str) -> Path:
        return self.directory / f"{name}.json"
