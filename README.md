# 🤖 Enterprise RAG Chatbot

An enterprise-grade Retrieval-Augmented Generation (RAG) chatbot built to provide accurate, context-aware responses from internal company documents. The application combines FastAPI, Next.js, ChromaDB, PostgreSQL, and Google Gemini to deliver an intelligent document-based conversational experience.

---

## 📌 Overview

This chatbot enables users to ask natural language questions and receive AI-generated responses grounded in the organization's knowledge base. Instead of relying solely on a language model, it retrieves relevant information from indexed documents before generating answers, improving both accuracy and reliability.

---

## ✨ Features

- 🔐 JWT-based User Authentication
- 💬 AI-powered conversational chatbot
- 📄 PDF document ingestion
- 🔎 Semantic document search using vector embeddings
- 🧠 Retrieval-Augmented Generation (RAG)
- 🗂️ Chat session management
- 📝 Chat history storage
- ⚡ FastAPI REST APIs
- 🎨 Modern Next.js frontend
- 📱 Responsive user interface

---

## 🛠 Tech Stack

### Backend
- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Alembic
- ChromaDB
- LangChain
- Google Gemini API
- JWT Authentication

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

---

## 🏗️ Project Structure

```text
rag_chatbot/
│
├── backend/
│   ├── chatbot/
│   ├── config/
│   ├── db/
│   ├── src/
│   ├── shared/
│   ├── alembic/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.mjs
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd rag_chatbot
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
DATABASE_URL=your_database_url
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET_KEY=your_secret_key
```

### Run Backend

```bash
uvicorn main:app --reload
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 📖 How It Works

1. Documents are uploaded to the knowledge base.
2. Documents are converted into embeddings.
3. Embeddings are stored in ChromaDB.
4. User submits a question.
5. Relevant document chunks are retrieved.
6. Retrieved context is sent to Google Gemini.
7. AI generates a grounded response.

---

## 🔒 Authentication

- User Signup
- User Login
- JWT Access Token
- Protected APIs

---

## 📡 API Modules

### Authentication
- User Registration
- Login

### Chatbot
- Ask Questions
- Retrieve Responses
- Chat Sessions
- Message History

---

## 📈 Future Enhancements

- Streaming AI Responses
- OCR Support
- Multi-document Search
- Voice-based Interaction
- Role-based Access Control
- Feedback & Analytics

---

## ⚠️ Disclaimer

This project is intended for internal organizational use. Company-specific documents, branding, and confidential information are not included in this repository.

---

## 👨‍💻 Developed By

**Vedant Jain**

Python Developer