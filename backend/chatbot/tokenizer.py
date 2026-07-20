import re


def tokenize(text: str):

    text = text.lower()

    text = re.sub(
        r"[^a-z0-9 ]",
        " ",
        text,
    )

    tokens = text.split()

    return tokens