"""
Main application file.
This script:
- Reads a user prompt,
- Extracts user preferences, budget intervals, and intent (suggestions vs. circuit),
- Routes to the corresponding chain.
"""

from chains.prompt_extraction import extract_user_info
from chains.destination_suggestion import get_destination_suggestions
from chains.circuit_creation import analyze_circuit
from langchain.schema import HumanMessage , AIMessage


def main():
    chat_history = []
    while True:
        
        user_prompt = input("Enter your prompt: ")
        if "exit" in user_prompt:
            break
        user_info = extract_user_info(user_prompt)
        chat_history.append(HumanMessage(content=user_prompt))
        print("Extracted User Info:", user_info)

        if user_info.get('intent') == 'suggestions':
            suggestions = get_destination_suggestions(user_info , chat_history)
            ai_message = {"role":"assistant" , "content" : suggestions}
            chat_history.append(ai_message)
            print("\nDestination Suggestions:")
            print(suggestions)
        elif user_info.get('intent') == 'circuit':
            analysis = analyze_circuit(user_info , chat_history )
            ai_message = {"role":"assistant" , "content" : str(analysis.content)}
            chat_history.append(ai_message)
            print("\nCircuit Analysis:")
            print(analysis)

        else:
            print("Could not determine intent from the prompt.")

if __name__ == "__main__":
    main()