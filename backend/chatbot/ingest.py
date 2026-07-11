from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma

from config import (
    DATA_PATH,
    CHROMA_DB_PATH,
    EMBEDDING_MODEL
)


def load_pdf():
    """Load PDF"""

    loader = PyPDFLoader(str(DATA_PATH))

    documents = loader.load()

    return documents


def split_documents(documents):
    """Split PDF into chunks"""

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    return splitter.split_documents(documents)


def create_vector_db(chunks):
    """Create Chroma Vector DB"""

    embedding = OllamaEmbeddings(
        model=EMBEDDING_MODEL
    )

    Chroma.from_documents(
        documents=chunks,
        embedding=embedding,
        persist_directory=str(CHROMA_DB_PATH)
    )


def main():

    print("Loading PDF...")

    docs = load_pdf()

    print(f"Loaded {len(docs)} pages")

    print("Splitting Documents...")

    chunks = split_documents(docs)

    print(f"Created {len(chunks)} chunks")

    print("Creating Vector Database...")

    create_vector_db(chunks)

    print("Vector Database Created Successfully")


if __name__ == "__main__":
    main()