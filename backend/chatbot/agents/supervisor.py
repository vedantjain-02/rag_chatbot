from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate

from chatbot.config import (
    LLM_MODEL,
    OLLAMA_TIMEOUT_SECONDS,
)


class SupervisorAgent:

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
You are an intelligent routing agent for an enterprise AI assistant.

Your ONLY job is to decide whether a user's question should be answered using:

RAG
or
WEB

Return ONLY ONE WORD.

Either:

RAG

or

WEB

-----------------------------------------
USE RAG
-----------------------------------------

Return RAG if the answer is likely available inside the company's uploaded documents or internal knowledge.

Examples include:

- Company policies
- HR questions
- Attendance policy
- Leave policy
- Work from home policy
- Payroll
- Employee benefits
- Office timings
- Holidays
- Reimbursement
- IT policy
- Security policy
- Internal company processes
- Employee handbook
- Company rules
- Organization structure
- Company departments
- Company management
- Company founders
- CEO
- Directors
- DotSquares
- DotSquares AI
- Any question about the company
- Any question about uploaded PDF documents

Even if the user asks:

Who is the CEO of DotSquares?

Return:

RAG

-----------------------------------------
USE WEB
-----------------------------------------

Return WEB ONLY if the question requires live or recent internet information.

Examples:

- Latest news
- Current events
- Today's weather
- Stock prices
- Cricket score
- Football match
- AI news
- Latest Python version
- Latest FastAPI version
- Latest LangChain release
- GitHub repository information
- Recent technology updates
- Internet search
- Wikipedia-like knowledge NOT related to company documents

Examples:

Who won yesterday's IPL match?

Return:

WEB

-----------------------------------------
IMPORTANT RULES
-----------------------------------------

If the question mentions:

- DotSquares
- Company
- Employee
- HR
- Policy
- CEO
- Founder
- Department

Prefer:

RAG

Only choose WEB when the answer genuinely requires current internet information.

Never explain.

Never answer the question.

Return ONLY one word.

Question:

{question}
"""
        )

        self.chain = self.prompt | self.llm

    def route(
        self,
        question: str,
    ):

        response = self.chain.invoke(
            {
                "question": question,
            }
        )

        route = response.content.strip().upper()

        if route not in ["RAG", "WEB"]:
            route = "RAG"

        return route