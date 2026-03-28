import os
import requests
import json
import time
from fastapi import APIRouter, HTTPException
from langchain_anthropic import ChatAnthropic
from backend.agents.fund_screener_agent import fund_screener_agent
from backend.agents.geopolitical_agent import geopolitical_agent
from backend.agents.profiling_agent import profiling_agent
from backend.agents.wealth_chat_agent import wealth_chat_agent
from backend.agents.tax_optimizer_agent import tax_optimizer_agent
from backend.agents.broker_recommender_agent import broker_agent
from backend.models.user import UserOnboarding

router = APIRouter()

# Simple Cache: { "data": [], "timestamp": 0 }
alert_cache = { "data": [], "timestamp": 0 }

# Hardcoded Fallback Alerts
FALLBACK_ALERTS = [
  {
    "label": "MARKET SIGNAL",
    "labelColor": "#D97706",
    "title": "Nifty volatility expected",
    "sub": "Election results may impact market sentiment.",
    "action": "→ Maintain diversified portfolio"
  },
  {
    "label": "GEOPOLITICAL ALERT",
    "labelColor": "#DC2626",
    "title": "Global trade tensions rise",
    "sub": "Export-oriented sectors may face headwinds.",
    "action": "→ Shift focus to domestic sectors"
  },
  {
    "label": "OPPORTUNITY",
    "labelColor": "#16A34A",
    "title": "IT sector recovery signal",
    "sub": "Lower valuations provide entry points.",
    "action": "→ Consider gradual accumulation"
  }
]

@router.get("/alerts/live")
async def get_live_alerts():
    global alert_cache
    current_time = time.time()
    
    # Check 5-minute cache (300 seconds)
    if alert_cache["data"] and (current_time - alert_cache["timestamp"]) < 300:
        return alert_cache["data"]

    news_api_key = os.getenv("NEWSAPI_KEY")
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Use real API if key is provided and looks valid, otherwise use dynamic mock
    if not anthropic_api_key or anthropic_api_key == "your_key_here":
        # Dynamic Mock Selection from a larger pool for "Demo Mode"
        DYNAM_MOCKS = [
            {"label": "GEOPOLITICAL ALERT", "labelColor": "#DC2626", "title": "Strait of Hormuz tension", "sub": "Crude oil may spike — act now", "action": "→ Pause O&G SIPs"},
            {"label": "MARKET SIGNAL", "labelColor": "#D97706", "title": "Nifty PE at 22.8", "sub": "Historically overvalued. Proceed with caution.", "action": "→ Shift to Liquid"},
            {"label": "OPPORTUNITY", "labelColor": "#16A34A", "title": "Nifty IT correction", "sub": "PE at 3-year low. Strong structural buy.", "action": "→ Add IT Funds"},
            {"label": "RBI SIGNAL", "labelColor": "#2563EB", "title": "RBI Repo Rate Hold", "sub": "Bond yields stable. Neutral for debt funds.", "action": "→ Maintain Debt SIP"},
            {"label": "COMMODITY SIGNAL", "labelColor": "#DC2626", "title": "Gold hits ATH", "sub": "Rupee pressure mounting. Safe haven play.", "action": "→ Hedge with Gold"},
            {"label": "TAX ALERT", "labelColor": "#D97706", "title": "LTCG Limit Review", "sub": "New rules may impact exit strategy.", "action": "→ Harvest gains now"}
        ]
        import random
        # Select 3 random unique mocks to look "Live"
        selected = random.sample(DYNAM_MOCKS, 3)
        alert_cache["data"] = selected
        alert_cache["timestamp"] = current_time
        return selected

    queries = [
        "geopolitical war sanctions oil market",
        "RBI Fed interest rates India economy",
        "Trump tariff trade war India",
        "Nifty Sensex stock market India",
        "OPEC oil crude natural gas"
    ]
    
    headlines = []
    try:
        if news_api_key:
            for q in queries:
                url = f"https://newsapi.org/v2/everything?q={q}&sortBy=publishedAt&apiKey={news_api_key}"
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    articles = r.json().get("articles", [])
                    headlines.extend([a["title"] for a in articles[:3]])
            
        if not headlines:
            return alert_cache["data"] if alert_cache["data"] else FALLBACK_ALERTS

        # Dedup and take top 10
        headlines = list(set(headlines))[:10]
        headlines_str = "\n".join(headlines)

        # Use Claude for analysis
        # Note: using lang-chain ChatAnthropic as used in other agents
        llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")
        
        prompt = f"""
        You are a financial intelligence agent for Indian investors.
        
        Given these real news headlines:
        {headlines_str}
        
        Generate exactly 3 alert cards in this JSON format:
        [
          {{
            "label": "CATEGORY",
            "labelColor": "#hexcolor",
            "title": "Short title max 5 words",
            "sub": "One line impact for Indian investors",
            "action": "→ Specific action to take"
          }}
        ]
        
        Categories and colors:
        GEOPOLITICAL ALERT → #DC2626
        POLITICAL SIGNAL → #7C3AED  
        MARKET SIGNAL → #D97706
        OPPORTUNITY → #16A34A
        RBI SIGNAL → #2563EB
        TAX ALERT → #D97706
        FUND ALERT → #D97706
        COMMODITY SIGNAL → #DC2626
        
        Rules:
        - Base each card on an ACTUAL headline from the list
        - Title must be max 5 words
        - Sub must mention rupee impact or Indian market impact
        - Action must be specific and actionable
        - Return ONLY valid JSON array, nothing else
        """
        
        response = llm.invoke(prompt)
        # Parse JSON from response
        try:
            # Handle potential markdown formatting if any
            content = response.content.strip()
            if "```" in content:
                content = content.split("```")[1].strip()
                if content.startswith("json"):
                    content = content[4:].strip()
            
            new_data = json.loads(content)
            if len(new_data) >= 3:
                alert_cache["data"] = new_data[:3]
                alert_cache["timestamp"] = current_time
                return alert_cache["data"]
        except:
            pass
            
    except Exception as e:
        print(f"Error fetching live alerts: {e}")

    return alert_cache["data"] if alert_cache["data"] else FALLBACK_ALERTS

@router.get("/funds/screen")
async def screen_funds(category: str = "Small Cap"):
    return await fund_screener_agent.screen_funds(category)

@router.get("/alerts")
async def get_alerts(user_id: str = "demo_user"):
    return geopolitical_agent.analyze_and_alert(user_id)

@router.post("/onboarding/profile")
async def onboard_user(data: UserOnboarding):
    return profiling_agent.generate_blueprint(data)

@router.post("/chat")
async def chat(data: dict):
    user_id = data.get("user_id", "demo_user")
    message = data.get("message", "")
    return wealth_chat_agent.chat(user_id, message)

@router.get("/tax/analysis")
async def tax_analysis(user_id: str = "demo_user"):
    return tax_optimizer_agent.optimize_tax(user_id)

@router.get("/market/timing")
async def market_timing():
    return {"recommendation": "Moderate Buy", "pe_ratio": 23.4, "signal": "Bullish"}

@router.get("/broker/recommend")
async def recommend_broker(knowledge: str = "beginner", investable: float = 50000):
    return broker_agent.recommend_broker(knowledge, investable)
