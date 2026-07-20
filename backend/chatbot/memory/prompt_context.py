class PromptContext:

    @staticmethod
    def build(history):

        if not history:
            return "No previous conversation."

        lines = []

        for msg in history:

            role = msg["role"].capitalize()
            content = msg["content"]

            lines.append(f"{role}: {content}")

        return "\n".join(lines)