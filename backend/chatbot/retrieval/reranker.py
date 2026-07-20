import json

from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate

from ..config import (
    LLM_MODEL,
    OLLAMA_TIMEOUT_SECONDS,
    FINAL_TOP_K
)


class Reranker:

    def __init__(self):

        self.llm = ChatOllama(
            model=LLM_MODEL,
            temperature=0,
            client_kwargs={
                "timeout": OLLAMA_TIMEOUT_SECONDS,
            },
        )

        self.prompt = ChatPromptTemplate.from_template(
            """
You are a document reranking assistant.

A user asked:

{query}

Below are retrieved documents.

{documents}

Select the most relevant documents for answering the user's question.

Return ONLY a JSON array of document indexes in order of relevance.

Example:

[2,5,1,4]

Do not explain anything.
"""
        )

        self.chain = self.prompt | self.llm

    def rerank(self, query, docs):
        print("========== RERANKER RUNNING ==========")
        if len(docs) <= 1:
            return docs

        document_text = []

        for i, doc in enumerate(docs):

            document_text.append(
                f"""
Document {i}

{doc.page_content}
"""
            )

        response = self.chain.invoke(
            {
                "query": query,
                "documents": "\n\n".join(document_text),
            }
        )
        print("=" * 80)
        print("Original Order")

        for i, doc in enumerate(docs):
            print(
                f"{i}: Page={doc.metadata.get('page')} | Source={doc.metadata.get('source')}"
            )

        print("=" * 80)

        try:

            order = json.loads(response.content.strip())
            print("LLM Ranking:", order)

            ranked_docs = []

            for idx in order:

                if 0 <= idx < len(docs):
                    ranked_docs.append(docs[idx])

            if ranked_docs:

                print()

                print("Final Documents")

                for i, doc in enumerate(ranked_docs[:FINAL_TOP_K]):

                    print(
                        i,
                        "Page:",
                        doc.metadata.get("page"),
                    )

                return ranked_docs[:FINAL_TOP_K]

        except Exception:
            pass

        return docs[:FINAL_TOP_K]