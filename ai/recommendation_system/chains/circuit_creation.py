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
    days = user_info.get("days" , "3")
    region = user_info.get("region", "(not specified)")

    combined_input = (
        "You're an expert travel planner. Your task is to create a detailed, engaging, and personalized "
        f"{days}-day itinerary for a trip to {region}. Please ensure the response includes key highlights, "
        "scenic routes, local cuisine recommendations, and historical or cultural experiences.\n\n"
        "### User Preferences\n"
        f"{str(user_info)}\n\n"
        "### Relevant Travel Information\n"
        + "\n\n".join([f"- {doc.page_content}" for doc in relevant_docs]) +
        "\n\n"
        f"Break down the plan day by day, starting with the arrival on Day 1 and ending with the departure on Day {days}. "
        "Make the itinerary structured, easy to follow, and inspiring. Use a friendly and professional tone, catering to the user's interests."
    )

    model = ChatOpenAI(model="gpt-4o")
    
    messages = chat_history
    messages += [
        SystemMessage(content="You are a travel planning assistant who provides engaging, well-structured, and easy-to-read itineraries."),
        HumanMessage(content=combined_input),
    ]
    

    result = model.invoke(messages)


    return result
