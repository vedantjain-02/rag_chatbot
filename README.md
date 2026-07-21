# 🤖 Enterprise Multi-Agent RAG Chatbot

> An enterprise-grade AI chatbot built using **FastAPI, LangGraph, Ollama, ChromaDB, PostgreSQL, and Next.js** that delivers accurate, context-aware responses from internal company documents using Hybrid Retrieval and intelligent routing.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?logo=next.js)
![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-orange)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

# 📌 Overview

Enterprise Multi-Agent RAG Chatbot is an AI-powered assistant designed for organizations to answer employee queries using internal company documents.

Instead of relying only on a Large Language Model, the chatbot first retrieves relevant information using **Hybrid Retrieval (BM25 + Vector Search)**, reranks the retrieved documents using an LLM, and generates grounded responses through **Ollama**.

The application also includes an intelligent **Supervisor Agent** that automatically decides whether a question should be answered using the internal knowledge base (RAG) or live web search.

---

# ✨ Features

## 🤖 AI Features

- ✅ Multi-Agent Architecture using LangGraph
- ✅ Supervisor Agent for Intelligent Routing
- ✅ RAG Agent
- ✅ Web Search Agent
- ✅ Automatic RAG → Web Fallback
- ✅ Hybrid Retrieval (BM25 + Vector Search)
- ✅ Query Rewriting
- ✅ LLM Document Reranking
- ✅ Local LLM using Ollama
- ✅ Conversation History
- ✅ Source Citations
- ✅ Context-Aware Responses

---

## 🔐 Authentication

- JWT Authentication
- User Registration
- User Login
- Protected APIs

---

## 💬 Chat Features

- Chat Sessions
- Message History
- New Chat Creation
- Auto Chat Titles
- Session Management

---

## 📄 Document Processing

- PDF Document Loader
- Text Chunking
- Embedding Generation
- ChromaDB Vector Storage
- Hybrid Document Retrieval

---

# 🏗️ Architecture

```
                        User Question
                              │
                              ▼
                     Supervisor Agent
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
             RAG Agent               Web Agent
                  │                       │
                  ▼                       ▼
      Hybrid Retriever             DuckDuckGo
      (BM25 + Vector)
                  │
                  ▼
          LLM Reranker
                  │
                  ▼
             Ollama LLM
                  │
                  ▼
          Final AI Response
```

---

# ⚙️ Tech Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- LangChain
- LangGraph
- Ollama
- ChromaDB
- Sentence Transformers
- Rank-BM25
- JWT Authentication

---

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## AI Stack

- LangGraph
- LangChain
- Ollama
- Hybrid Retrieval
- BM25
- ChromaDB
- Vector Search
- Query Rewriting
- LLM Reranking
- DuckDuckGo Search

---

# 📂 Project Structure

```text
rag_chatbot/

├── backend/
│
│   ├── chatbot/
│   │   ├── agents/
│   │   ├── graph/
│   │   ├── memory/
│   │   ├── nodes/
│   │   ├── retrieval/
│   │   ├── prompts/
│   │   └── chroma_db/
│   │
│   ├── src/
│   ├── db/
│   ├── alembic/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/rag_chatbot.git

cd rag_chatbot
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=your_database_url

JWT_SECRET_KEY=your_secret_key

LLM_MODEL=llama3.2

OLLAMA_TIMEOUT_SECONDS=300
```

---

## Run Backend

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 📖 How It Works

### Step 1

User asks a question.

↓

### Step 2

Supervisor Agent classifies the query.

↓

### Step 3

If it is an internal company question

↓

Hybrid Retrieval

- BM25 Search
- Vector Search

↓

LLM Reranker

↓

Ollama

↓

Final Response

---

If the question is related to current events or information outside the knowledge base

↓

DuckDuckGo Search

↓

Web Response

---

# 🔍 Retrieval Pipeline

```
Question

↓

Query Rewrite

↓

BM25 Search

+

Vector Search

↓

Merge Results

↓

LLM Reranker

↓

Context Builder

↓

Ollama

↓

Answer
```

---

# 📡 API Modules

## Authentication

- Register
- Login
- JWT Authentication

---

## Chat

- Create Chat Session
- Send Message
- Retrieve History
- Delete Session
- Rename Session

---

## AI

- Hybrid Retrieval
- Web Search
- Source References
- Multi-Agent Routing

---

# 📈 Future Enhancements

- Streaming AI Responses
- Multi-document Knowledge Base
- OCR Support
- Voice Assistant
- Tool Calling
- Feedback System
- Admin Dashboard
- Analytics
- Role Based Access Control

---

# 📷 Screenshots

> Add screenshots of:

- Login Page
- Chat Interface
- Source Citation Panel
- Chat History
- AI Response
- Web Search Response

---

# 👨‍💻 Developed By

## Vedant Jain

Python Backend Developer | AI Developer

GitHub:
https://github.com/vedantjain-02

LinkedIn:
(Add your LinkedIn URL)

---

## ⭐ If you like this project, don't forget to give it a Star!