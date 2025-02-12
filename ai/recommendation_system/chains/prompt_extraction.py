"""
This chain extracts:
- Intent: "suggestions" or "circuit"
- Preferences: a list of travel preferences
- Budget: a budget interval (e.g., "500-1000")
from the provided user prompt.
"""

from langchain.chains import LLMChain
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


load_dotenv()

messages = [
    (
        "system",
        """
You are a helpful assistant that extracts key information from user prompts.
Extract the following details:
- Region: any region or country if mentioned
- Cities: a city or multiple cities if mentioned
- Intent: either "suggestions" (for destination suggestions) or "circuit" (for circuit creation).
- Preferences: list any travel preferences mentioned.
- Budget: if a budget interval is mentioned, extract it in the format "min-max" (e.g., "500-1000").
- Days: how many days the trip would be
 
Return your answer as a JSON object with keys: region , cities, intent, preferences, budget , days.

""",
    ),
    ("human", "{user_prompt}"),
]

def extract_user_info(user_prompt: str) -> dict:
    prompt = ChatPromptTemplate.from_messages(messages)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    chain = chain = prompt | llm | StrOutputParser()
    response = chain.invoke(user_prompt)
    try:
        import json

        data = json.loads(response.strip())
        return data
    except Exception as e:
        print("Error parsing extraction response:", e)
        return {"intent": "unknown", "preferences": [], "budget": ""}

