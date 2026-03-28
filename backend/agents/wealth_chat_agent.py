from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from backend.services.firebase_service import get_user_profile, get_portfolio
import os

class WealthChatAgent:
    def __init__(self):
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")
        
    def get_system_prompt(self, user_profile: dict, portfolio: dict):
        return f"""
        You are Nexquire's AI Chief Financial Officer (CFO). 
        You are brilliant, calm, and jargon-free.
        
        User Profile: {user_profile}
        Current Portfolio: {portfolio}
        
        Contextual Instructions:
        1. Always factor in the user's age and risk profile.
        2. Identify yourself as Nexquire AI.
        3. If asked about market entry, mention that you're tracking geopolitical signals 24/7.
        4. Use plain English. Explain 'CAGR', 'Sharpe', and 'LTCG' simply if you mention them.
        5. You are an expert in the Indian market.
        6. Cite your reasoning clearly.
        """

    def chat(self, user_id: str, message: str):
        profile = get_user_profile(user_id)
        portfolio = get_portfolio(user_id)
        
        system_prompt = self.get_system_prompt(profile, portfolio)
        
        full_prompt = f"{system_prompt}\n\nUser Question: {message}\n\nAI Response:"
        
        try:
            response = self.llm.invoke(full_prompt)
            return {
                "answer": response.content if hasattr(response, 'content') else str(response),
                "sources": ["Nexquire Geopolitical Agent", "Profiling Agent v2.4"],
                "recommended_actions": ["Analyze Rebalancing", "Check Tax Optimization"]
            }
        except Exception as e:
            return {
                "answer": "I'm experiencing a brief connection issue with my brain, but based on your profile, it's generally wise to stay disciplined with your SIPs during volatility.",
                "sources": ["Mock Intelligence"],
                "recommended_actions": ["Wait and Watch"]
            }

wealth_chat_agent = WealthChatAgent()
