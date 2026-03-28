from langchain_anthropic import ChatAnthropic
import os

class BrokerAgent:
    def __init__(self):
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")

    def recommend_broker(self, knowledge_level: str, monthly_investable: float):
        # Objective logic for the demo
        recommendations = [
            {
                "name": "Zerodha",
                "score": 98 if knowledge_level == "advanced" else 85,
                "badge": "Best for Experienced",
                "pros": ["Kill Switch", "Sentinel Alerts", "Clean UI"],
                "cons": ["Annual Maintenance Fee"]
            },
            {
                "name": "Groww",
                "score": 95 if knowledge_level == "beginner" else 80,
                "badge": "Best for Beginners",
                "pros": ["Zero AMC", "Simple UI", "One-tap Invest"],
                "cons": ["Limited technical tools"]
            }
        ]
        
        return {
            "top_pick": "Zerodha" if knowledge_level == "advanced" else "Groww",
            "recommendations": recommendations,
            "ai_reasoning": f"Based on your {knowledge_level} level and ₹{monthly_investable} investable surplus, we recommend a platform that balances fee efficiency with the tools you need."
        }

broker_agent = BrokerAgent()
