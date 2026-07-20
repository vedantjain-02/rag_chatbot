# memory/history_selector.py

class HistorySelector:

    def select(
        self,
        messages,
        max_messages: int = 6,
    ):
        return messages[-max_messages:]