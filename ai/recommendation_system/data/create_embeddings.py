import os
from langchain.text_splitter import CharacterTextSplitter 
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv

load_dotenv()

current_dir = os.path.dirname(os.path.abspath(__file__))
print(current_dir)
data_dir = os.path.join(current_dir, "documents")
persistent_directory = os.path.join(current_dir, "embeddings", "chroma_db")

if not os.path.exists(persistent_directory):
    print("Persistent directory does not exist. Initializing vector store...")

    if not os.path.exists(data_dir):
        raise FileNotFoundError(
            f"The directory {data_dir} does not exist. Please check the path."
        )
    circuit_dir = os.path.join(data_dir, "circuits")
    circuits_files = [f for f in os.listdir(circuit_dir) if f.endswith(".pdf")]

    documents = []
    for circuit_file in circuits_files:
        file_path = os.path.join(circuit_dir, circuit_file)
        loader = PyPDFLoader(file_path)
        circuit_docs = loader.load()
        for doc in circuit_docs:
            doc.metadata = {"source": circuit_file}
            documents.append(doc)


    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=50) 
    docs = text_splitter.split_documents(documents)

    print("\n--- Document Chunks Information ---")
    print(f"Number of document chunks: {len(docs)}")
    print(f"Sample chunk:\n{docs[0].page_content}\n")

    print("\n--- Creating embeddings ---")
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"
    ) 
    print("\n--- Finished creating embeddings ---")

    print("\n--- Creating vector store ---")
    db = Chroma.from_documents(
        docs, embeddings, persist_directory=persistent_directory)
    print("\n--- Finished creating vector store ---")

else:
    print("Vector store already exists. No need to initialize.")
