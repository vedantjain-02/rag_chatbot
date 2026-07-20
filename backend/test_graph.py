from chatbot.graph.graph import graph

result = graph.invoke(
    {
        "question": "What is leave policy?",
        "history": [],
    }
)

print(result)