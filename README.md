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
- API Key Protected Backend Routes

---

## 💬 Chat Features

- Chat Sessions
- Message History
- New Chat Creation
- Auto Chat Titles
- Session Management
- Rename Sessions
- Delete Sessions

---

## 📄 Document Processing

- PDF Document Loader
- Text Chunking
- Embedding Generation
- ChromaDB Vector Storage
- Hybrid Document Retrieval

---

# 🏗️ Architecture

```text
                        User Question
                              │
                              ▼
                     Supervisor Agent
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
            RAG Agent                 Web Agent
                 │                         │
                 ▼                         ▼
         Hybrid Retriever            DuckDuckGo
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
⚙️ Tech Stack
Backend
Python
FastAPI
SQLAlchemy
PostgreSQL
Alembic
LangChain
LangGraph
Ollama
ChromaDB
Sentence Transformers
Rank-BM25
JWT Authentication
Frontend
Next.js
React
TypeScript
Tailwind CSS
AI Stack
LangGraph
LangChain
Ollama
Hybrid Retrieval
BM25
ChromaDB
Vector Search
Query Rewriting
LLM Reranking
DuckDuckGo Search
📂 Project Structure
rag_chatbot/
│
├── backend/
│   │
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
│   ├── main.py
│   └── .env
│
├── frontend/
│   │
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── .env.local
│
└── README.md

⚠️ .env and .env.local contain environment-specific configuration and secrets. They should not be committed to GitHub.

🚀 Installation
Clone Repository
git clone https://github.com/your-username/rag_chatbot.git

cd rag_chatbot
🐍 Backend Setup

Move into the backend directory:

cd backend

Create a virtual environment:

python -m venv venv
Windows
venv\Scripts\activate
Linux / macOS
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt
⚙️ Backend Environment Variables

Create a .env file inside the backend folder.

DATABASE_URL=your_database_url

JWT_SECRET_KEY=your_secret_key

X_API_KEY=your_api_key

LLM_MODEL=llama3.2

OLLAMA_TIMEOUT_SECONDS=300
Environment Variable Description
Variable	Description
DATABASE_URL	PostgreSQL database connection URL
JWT_SECRET_KEY	Secret key used for JWT authentication
X_API_KEY	API key used to protect backend routes
LLM_MODEL	Ollama model used by the application
OLLAMA_TIMEOUT_SECONDS	Timeout for Ollama requests
🔐 API Key Configuration

The backend protects API routes using the X-API-Key HTTP header.

The API key configured in:

backend/.env

must match the API key configured in:

frontend/.env.local

For example:

Backend
# backend/.env

X_API_KEY=your_api_key
Frontend
# frontend/.env.local

NEXT_PUBLIC_X_API_KEY=your_api_key

Both values must be exactly the same.

⚠️ Important: Never commit your real API key, JWT secret, database password, or other credentials to GitHub.

▶️ Run Backend

From the backend directory:

uvicorn main:app --reload

The backend will normally run on:

http://127.0.0.1:8000
💻 Frontend Setup

Open a new terminal and move into the frontend directory:

cd frontend

Install dependencies:

npm install
🔑 Frontend Environment Variables

The frontend requires its own environment file.

Create:

frontend/.env.local

Add:

NEXT_PUBLIC_API_URL=

NEXT_PUBLIC_X_API_KEY=your_api_key
API Key

The value of:

NEXT_PUBLIC_X_API_KEY

must be the same as:

X_API_KEY

from backend/.env.

Example:

# backend/.env

X_API_KEY=my-secret-api-key
# frontend/.env.local

NEXT_PUBLIC_X_API_KEY=my-secret-api-key
🔄 Restart Frontend After Changing .env.local

Next.js reads environment variables when the development server starts.

Therefore, after creating or modifying:

frontend/.env.local

restart the frontend development server.

Stop the running server:

Ctrl + C

Then start it again:

npm run dev
▶️ Run Frontend
npm run dev

The frontend will normally be available at:

http://localhost:3000
🔒 Environment Files & Security

The following files contain environment-specific configuration and should not be committed:

backend/.env
frontend/.env.local

Make sure they are included in .gitignore.

Example:

# Backend environment
backend/.env

# Frontend environment
frontend/.env.local

# Python
backend/venv/
__pycache__/

# Next.js
frontend/.next/
frontend/node_modules/

# Environment files
.env
.env.local

Never expose API keys, database credentials, JWT secrets, or other sensitive credentials in source code or public repositories.

📖 How It Works
Step 1

User asks a question.

↓

Step 2

Supervisor Agent classifies the query.

↓

Step 3

If it is an internal company question:

Hybrid Retrieval
      │
      ├── BM25 Search
      │
      └── Vector Search
              │
              ▼
        LLM Reranker
              │
              ▼
            Ollama
              │
              ▼
       Final Response

If the question is related to current events or information outside the knowledge base:

User Question
      │
      ▼
Supervisor Agent
      │
      ▼
DuckDuckGo Search
      │
      ▼
Web Response
🔍 Retrieval Pipeline
Question
   │
   ▼
Query Rewrite
   │
   ▼
┌─────────────────────┐
│                     │
│   BM25 Search       │
│         +           │
│   Vector Search     │
│                     │
└─────────────────────┘
   │
   ▼
Merge Results
   │
   ▼
LLM Reranker
   │
   ▼
Context Builder
   │
   ▼
Ollama
   │
   ▼
Answer
🧠 Multi-Agent Routing

The chatbot uses a Supervisor Agent to determine the appropriate processing path for each user query.

                     User Query
                         │
                         ▼
                 Supervisor Agent
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
         Internal Query        External Query
              │                     │
              ▼                     ▼
          RAG Agent             Web Agent
              │                     │
              ▼                     ▼
      Hybrid Retrieval        Web Search
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
                  Final Response
📡 API Modules
Authentication
Register
Login
JWT Authentication
Chat
Create Chat Session
Send Message
Retrieve History
Delete Session
Rename Session
AI
Hybrid Retrieval
Web Search
Source References
Multi-Agent Routing
🗄️ Database

The application uses PostgreSQL for persistent application data.

The database is used for functionality such as:

User accounts
Authentication data
Chat sessions
Message history
Application state

Database migrations are managed using Alembic.

🤖 Local LLM

The chatbot uses Ollama for local LLM inference.

Configure the model in:

LLM_MODEL=llama3.2

Make sure the configured Ollama model is available in your local Ollama installation before running the application.

📚 Vector Database

The application uses ChromaDB for vector storage and semantic retrieval.

Documents are processed through:

PDF
 │
 ▼
Text Extraction
 │
 ▼
Text Chunking
 │
 ▼
Embeddings
 │
 ▼
ChromaDB
🔎 Hybrid Retrieval

The chatbot combines two retrieval approaches:

BM25

Keyword-based retrieval that identifies documents based on matching terms.

Vector Search

Semantic retrieval that identifies documents based on the meaning of the query.

The results are combined before being passed to the reranking stage.

User Query
    │
    ├───────────────┐
    ▼               ▼
 BM25          Vector Search
    │               │
    └───────┬───────┘
            ▼
      Merge Results
            │
            ▼
      LLM Reranker
            │
            ▼
        Final Context
📄 Document Processing Pipeline
PDF Documents
      │
      ▼
Document Loader
      │
      ▼
Text Extraction
      │
      ▼
Text Chunking
      │
      ▼
Embedding Generation
      │
      ▼
ChromaDB
      │
      ▼
Hybrid Retrieval
🌐 Web Search

When the Supervisor Agent determines that a question requires external or current information, the Web Search Agent can use DuckDuckGo Search.

This provides an alternative path when the required information is not available in the internal knowledge base.

💬 Conversation History

The application supports persistent conversation functionality.

Users can:

Create new chats
Continue previous conversations
View message history
Rename chat sessions
Delete chat sessions
Maintain context across messages
🔐 Authentication Flow
User
 │
 ▼
Registration
 │
 ▼
Login
 │
 ▼
JWT Token
 │
 ▼
Authenticated Requests
 │
 ▼
Protected Backend APIs

Backend API routes additionally use the X-API-Key header for API-level protection.

🛠️ Development
Start Backend
cd backend

uvicorn main:app --reload
Start Frontend

Open another terminal:

cd frontend

npm run dev
🧪 Production Deployment

For production deployment, configure environment variables through the hosting provider's environment-variable system rather than committing .env files to the repository.

The backend must expose the port configured by the deployment platform.

For example:

Backend
   │
   ▼
FastAPI / Uvicorn
   │
   ▼
Production Server

The frontend should be configured with:

NEXT_PUBLIC_X_API_KEY=your_api_key

and the backend should contain the matching:

X_API_KEY=your_api_key

⚠️ After changing production environment variables, redeploy the affected service so the new values are loaded.

📈 Future Enhancements
Streaming AI Responses
Multi-document Knowledge Base
OCR Support
Voice Assistant
Tool Calling
Feedback System
Admin Dashboard
Analytics
Role Based Access Control
📷 Screenshots

Add screenshots of:

Login Page
Signup Page
Chat Interface
Source Citation Panel
Chat History
AI Response
Web Search Response
👨‍💻 Developed By
Vedant Jain

Python Backend Developer | AI Developer

GitHub:

https://github.com/vedantjain-02

LinkedIn:

https://linkedin.com/in/vedantjain1802

⭐ Support

If you like this project, don't forget to give it a ⭐ Star!

📜 License

This project is licensed under the MIT License.