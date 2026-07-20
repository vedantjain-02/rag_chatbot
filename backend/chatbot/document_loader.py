from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import DATA_PATH


def load_documents():
    loader = PyPDFLoader(str(DATA_PATH))
    return loader.load()


def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    return splitter.split_documents(documents)


def get_chunks():
    docs = load_documents()
    return split_documents(docs)