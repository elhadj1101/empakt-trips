# chains/suggestion_chain.py
"""
This chain generates travel destination suggestions based on user preferences and budget.
It uses an LLMChain to produce three destination suggestions.
"""

from langchain.chains import LLMChain
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()





def get_destination_suggestions(user_info: dict , chat_history : list) -> list:
    messages = chat_history 

    messages += [
        (
        "system",
        """
        You are a friendly and enthusiastic travel assistant. Based on the user's preferences,
        suggest some exciting travel destinations in a well-structured, engaging paragraph.

        Consider:
        - Region: {region}
        - Cities: {cities}
        - User Preferences: {preferences}
        - Budget: {budget}

        Write the response as if you're personally recommending these places to a friend. Make it fun, descriptive, and easy to read.
        """,
        )
    ]
    prompt = ChatPromptTemplate.from_messages(messages)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    chain = prompt | llm | StrOutputParser()     
    region = user_info.get("region", "not specified")
    cities = ", ".join(user_info.get("cities", []))
    preferences = ", ".join(user_info.get("preferences", []))
    budget=user_info.get("budget", "not specified")
    
    suggestions = chain.invoke(
     {"preferences":{preferences} , "budget":{budget} , "region" : {region} , "cities" : {cities}}
    )    

    return suggestions

