import requests
from typing import List, Dict
from langchain_anthropic import ChatAnthropic
import os

class FundScreenerAgent:
    def __init__(self):
        self.mfapi_base = "https://api.mfapi.in/mf"
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")

    def get_funds_in_category(self, category: str) -> List[Dict]:
        # In a real app, we'd have a mapping. For the demo, we'll fetch all and filter or use a robust mock.
        # MFAPI returns many funds. For the demo, we'll return a curated list that matches the category.
        
        mock_data = {
            "small_cap": [
                {"name": "Quant Small Cap Fund", "score": 94, "cagr": "38.2%", "sharpe": 2.4, "expense": "0.64%", "tags": ["High Alpha", "Momentum"], "flags": [], "rank": 1},
                {"name": "Nippon India Small Cap Fund", "score": 89, "cagr": "34.5%", "sharpe": 2.1, "expense": "0.72%", "tags": ["Consistent"], "flags": ["AUM Bloat"], "rank": 2},
                {"name": "HSBC Small Cap Fund", "score": 82, "cagr": "31.2%", "sharpe": 1.8, "expense": "0.85%", "tags": ["Value"], "flags": ["Manager Change"], "rank": 3}
            ],
            "mid_cap": [
                {"name": "Motilal Oswal Midcap Fund", "score": 91, "cagr": "28.5%", "sharpe": 1.9, "expense": "0.70%", "tags": ["Quality"], "flags": [], "rank": 1},
                {"name": "HDFC Mid-Cap Opportunities Fund", "score": 88, "cagr": "26.2%", "sharpe": 1.7, "expense": "0.80%", "tags": ["Value"], "flags": [], "rank": 2}
            ],
            "large_cap": [
                {"name": "ICICI Prudential Bluechip Fund", "score": 85, "cagr": "18.5%", "sharpe": 1.4, "expense": "0.90%", "tags": ["Safe"], "flags": [], "rank": 1},
                {"name": "HDFC Top 100 Fund", "score": 83, "cagr": "17.2%", "sharpe": 1.3, "expense": "0.95%", "tags": ["Value"], "flags": [], "rank": 2}
            ]
        }
        
        norm_cat = category.lower().replace(" ", "_")
        return mock_data.get(norm_cat, mock_data["large_cap"])

    async def screen_funds(self, category: str):
        funds = self.get_funds_in_category(category)
        
        # Use LLM to generate reasoning
        prompt = f"""
        Analyze these funds in the {category} category and provide a brief, one-sentence reasoning for why they are ranked this way for a retail investor.
        Funds: {[f['name'] for f in funds]}
        """
        try:
            response = self.llm.invoke(prompt)
            reasoning = response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            reasoning = "Based on risk-adjusted returns and alpha consistency over 3 years."

        return {
            "category": category,
            "funds": funds,
            "ai_reasoning": reasoning
        }

fund_screener_agent = FundScreenerAgent()
