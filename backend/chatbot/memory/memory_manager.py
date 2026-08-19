# memory/memory_manager.py

from .history_loader import HistoryLoader
from .history_selector import HistorySelector
from .prompt_context import PromptContext


class MemoryManager:

    def __init__(self, db):

        self.loader = HistoryLoader(db)
        self.selector = HistorySelector()
        self.builder = PromptContext

    def get_context(
        self,
        session_id: int,
    ):

        messages = self.loader.load_recent_messages(
            session_id
        )

        selected = self.selector.select(
            messages
        )

        return self.builder.build(
            selected
        )