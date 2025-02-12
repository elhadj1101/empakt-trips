# chains/circuit_chain.py
"""
This chain handles circuit analysis.
It loads local circuit documents (PDFs and text files), splits them into chunks,
creates a Chroma vector store for retrieval, and then performs a Retrieval QA to answer a circuit analysis query.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings


load_dotenv()

parent_dir = Path(__file__).parent.parent
persistent_directory = os.path.join(parent_dir,"data" ,  "embeddings", "chroma_db")
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
db = Chroma(persist_directory=persistent_directory,
            embedding_function=embeddings)



def analyze_circuit(user_info: dict , chat_history : list ) -> str:
    """
    performs a retrieval (RAG) to generate an analysis based on user info.
    """

    
    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3},
    )

    relevant_docs = retriever.invoke(str(user_info))

    combined_input = (
        "You're an expert in circuit design, and your goal is to provide an insightful and structured analysis "
        "of the circuit requirements. Please ensure the response is detailed, well-organized, and easy to follow.\n\n"
        "### User Context\n"
        f"{str(user_info)}\n\n"
        "### Relevant Information\n"
        + "\n\n".join([f"- {doc.page_content}" for doc in relevant_docs]) +
        "\n\n"
        "Please present the analysis in a clear, engaging manner, as if explaining to an engineer eager to optimize their circuit design. "
        "Use a friendly yet professional tone, breaking down complex concepts into easy-to-understand sections."
    )

    model = ChatOpenAI(model="gpt-4o")
    
    messages = chat_history
    messages += [
        SystemMessage(content="You are a knowledgeable circuit design assistant who provides engaging, structured, and easy-to-read responses."),
        HumanMessage(content=combined_input),
    ]
    

    result = model.invoke(messages)


    return result
