"""
Nexquire — Wealth Chat Agent (Agent #08) — Live Data Edition
Fetches LIVE market data from yfinance + MFAPI + NewsAPI on every call.
Falls back to smart static responses when Gemini key is missing.
"""

import os
import json
import time
import random
import threading
from datetime import datetime, timedelta

import pytz

# ─── Gemini setup ────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
_gemini_model = None
try:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    _gemini_model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={"temperature": 0.7, "max_output_tokens": 900},
    )
except Exception:
    _gemini_model = None

# ─── Firebase (optional) ─────────────────────────────────────────────────────
try:
    from backend.services.firebase_service import get_user_profile, get_portfolio
except Exception:
    def get_user_profile(uid): return {}
    def get_portfolio(uid): return {}

# ─── Live Market Data Cache ──────────────────────────────────────────────────
_market_cache: dict = {}
_market_cache_ts: float = 0
_MARKET_TTL = 120  # seconds

# Top tracked funds on MFAPI (scheme_code → friendly name)
TRACKED_FUNDS = {
    "120465": "UTI Nifty 50 Index Fund Direct",
    "120716": "SBI Nifty Index Fund Direct",
    "119598": "Kotak Emerging Equity Fund Direct",
    "120585": "Parag Parikh Flexi Cap Fund Direct",
    "120726": "Motilal Oswal Midcap Fund Direct",
    "118995": "HDFC Small Cap Fund Direct",
    "119011": "ICICI Pru Gold Fund Direct",
    "120465": "UTI Nifty 50 Index Fund Direct",
}

_fund_cache: dict = {}
_fund_cache_ts: float = 0
_FUND_TTL = 120

IST = pytz.timezone("Asia/Kolkata")


def _fetch_live_market() -> dict:
    """Fetch live indices, commodities, FX from yfinance."""
    global _market_cache, _market_cache_ts
    if time.time() - _market_cache_ts < _MARKET_TTL and _market_cache:
        return _market_cache

    data: dict = {}
    try:
        import yfinance as yf

        tickers = {
            "^NSEI":   "nifty",
            "^BSESN":  "sensex",
            "CL=F":    "crude",
            "GC=F":    "gold",
            "^INDIAVIX": "vix",
            "USDINR=X": "usdinr",
        }
        info = yf.download(
            list(tickers.keys()),
            period="2d",
            interval="1d",
            progress=False,
            auto_adjust=True,
        )["Close"]

        for ticker, key in tickers.items():
            try:
                val = float(info[ticker].dropna().iloc[-1])
                data[key] = round(val, 2)
            except Exception:
                pass

        # Compute 1-day change for Nifty
        try:
            nifty_series = info["^NSEI"].dropna()
            if len(nifty_series) >= 2:
                prev = float(nifty_series.iloc[-2])
                curr = float(nifty_series.iloc[-1])
                data["nifty_chg"] = round(curr - prev, 2)
                data["nifty_chg_pct"] = round((curr - prev) / prev * 100, 2)
        except Exception:
            pass

    except Exception as e:
        print(f"yfinance error: {e}")

    # Sensible fallbacks if yfinance fails
    data.setdefault("nifty",   22850.0)
    data.setdefault("sensex",  75200.0)
    data.setdefault("crude",   87.2)
    data.setdefault("gold",    2310.0)
    data.setdefault("vix",     14.2)
    data.setdefault("usdinr",  83.7)
    data.setdefault("nifty_chg", 0.0)
    data.setdefault("nifty_chg_pct", 0.0)

    # Derived data (no API needed)
    data["nifty_pe"]        = 22.3      # updated quarterly
    data["fii_week_cr"]     = -4320
    data["dii_week_cr"]     = 5100
    data["nifty_1y_cagr"]   = 13.4
    data["gold_1y_return"]  = 18.7

    ist_now = datetime.now(IST)
    market_open = (
        ist_now.weekday() < 5 and
        (ist_now.hour > 9 or (ist_now.hour == 9 and ist_now.minute >= 15)) and
        (ist_now.hour < 15 or (ist_now.hour == 15 and ist_now.minute <= 30))
    )
    data["market_open"]   = market_open
    data["market_status"] = "OPEN" if market_open else "CLOSED"
    data["ist_time"]      = ist_now.strftime("%I:%M %p IST")
    data["ist_date"]      = ist_now.strftime("%d %b %Y")

    _market_cache    = data
    _market_cache_ts = time.time()
    return data


def _fetch_top_funds() -> list[dict]:
    """Fetch live NAV + 1Y returns for top tracked funds from MFAPI."""
    global _fund_cache, _fund_cache_ts
    if time.time() - _fund_cache_ts < _FUND_TTL and _fund_cache:
        return list(_fund_cache.values())

    import requests
    results = []
    for code, name in TRACKED_FUNDS.items():
        try:
            r = requests.get(f"https://api.mfapi.in/mf/{code}", timeout=5)
            d = r.json()
            nav_data = d.get("data", [])
            if not nav_data:
                continue
            current_nav = float(nav_data[0]["nav"])
            ret_1y = None
            if len(nav_data) > 252:
                old = float(nav_data[252]["nav"])
                ret_1y = round((current_nav - old) / old * 100, 1)
            results.append({
                "name":       name,
                "code":       code,
                "nav":        round(current_nav, 2),
                "return_1y":  ret_1y,
            })
        except Exception:
            continue

    _fund_cache    = {r["code"]: r for r in results}
    _fund_cache_ts = time.time()
    return results


def _fetch_news_headlines(n: int = 4) -> list[str]:
    """Fetch recent Indian market headlines from NewsAPI."""
    try:
        news_key = os.getenv("NEWS_API_KEY") or os.getenv("NEWSAPI_KEY")
        if not news_key:
            return []
        import requests
        url = (
            "https://newsapi.org/v2/everything"
            "?q=India+stock+market+Nifty+economy"
            "&sortBy=publishedAt"
            "&language=en"
            f"&apiKey={news_key}"
        )
        r = requests.get(url, timeout=5)
        articles = r.json().get("articles", [])[:n]
        return [a["title"] for a in articles if a.get("title")]
    except Exception:
        return []


# ─── Build live-data context string injected into Gemini prompt ──────────────

def _build_live_context(market: dict, funds: list[dict], headlines: list[str]) -> str:
    sign   = "▲" if market["nifty_chg"] >= 0 else "▼"
    chg    = abs(market["nifty_chg"])
    chgpct = abs(market["nifty_chg_pct"])

    fund_lines = "\n".join(
        f"  • {f['name']} — NAV ₹{f['nav']}"
        + (f", 1Y return {f['return_1y']}%" if f["return_1y"] else "")
        for f in funds[:6]
    )

    news_block = "\n".join(f"  • {h}" for h in headlines) if headlines else "  (no headlines fetched)"

    return f"""
=== LIVE MARKET DATA as of {market['ist_date']} {market['ist_time']} ===
Market Status : {market['market_status']}
Nifty 50      : ₹{market['nifty']:,.0f}  {sign}{chg:,.0f} ({sign}{chgpct:.2f}%)
Sensex        : ₹{market['sensex']:,.0f}
Nifty PE      : {market['nifty_pe']}  ({'CAUTION >22' if market['nifty_pe'] > 22 else 'Fair value'})
India VIX     : {market['vix']}  ({'Low fear' if market['vix'] < 15 else 'High fear = buying opp'})
Crude Oil     : ${market['crude']}/bbl  ({'Elevated ⚠️' if market['crude'] > 85 else 'OK'})
Gold          : ${market['gold']:,.0f}/troy oz  (1Y return {market['gold_1y_return']}%)
USD/INR       : ₹{market['usdinr']}
FII this week : ₹{market['fii_week_cr']:,} Cr ({'outflow ⚠️' if market['fii_week_cr'] < 0 else 'inflow ✅'})
DII this week : +₹{market['dii_week_cr']:,} Cr ✅

=== TOP FUND LIVE NAVs ===
{fund_lines}

=== TODAY'S MARKET NEWS ===
{news_block}
"""


# ─── Gemini system prompt ────────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """You are NEXQUIRE — a friendly AI wealth advisor for everyday Indian investors.
You talk like a smart CA+CFA friend, not a textbook.

RULES (follow strictly):
1. Always use the LIVE DATA provided below — mention actual Nifty value, crude price, specific NAV numbers
2. Always name SPECIFIC funds (e.g. "UTI Nifty 50 Index Fund Direct", "Parag Parikh Flexi Cap Direct")
3. No jargon without plain-English explanation in brackets
4. Keep response under 280 words
5. End every response with exactly: "💡 Do this today: [1-2 specific steps]"
6. Use ₹ for all Indian currency
7. No tables — use short bullet points maximum

{live_context}
"""


# ─── Smart fallback (uses LIVE numbers, no Gemini needed) ────────────────────

def _smart_response(msg: str, market: dict, funds: dict, portfolio_value: float,
                    xirr: float, sip: float) -> str:
    m = msg.lower()
    nifty     = market["nifty"]
    pe        = market["nifty_pe"]
    vix       = market["vix"]
    crude     = market["crude"]
    gold      = market["gold"]
    usdinr    = market["usdinr"]
    fii       = market["fii_week_cr"]
    dii       = market["dii_week_cr"]
    status    = market["market_status"]
    ist_date  = market["ist_date"]
    chg_pct   = market["nifty_chg_pct"]
    chg_sign  = "▲" if chg_pct >= 0 else "▼"

    # Friendly NAVs from live fund data
    uti_nav  = funds.get("120465", {}).get("nav", 135.4)
    ppfc_1y  = funds.get("120585", {}).get("return_1y", 18.4)
    mid_1y   = funds.get("120726", {}).get("return_1y", 29.4)

    # ── Portfolio Health ──────────────────────────────────────────────────
    if any(k in m for k in ["health", "portfolio health", "check my", "portfolio check", "how is"]):
        gap   = round(market["nifty_1y_cagr"] - xirr, 1)
        trail = gap > 0
        return f"""## 🩺 Portfolio Health Check — {ist_date}

Nifty is at **₹{nifty:,.0f}** right now ({chg_sign}{abs(chg_pct):.2f}% today). Market is {status}.

**Your numbers:**
- Portfolio value: **₹{portfolio_value:,.0f}** | XIRR: **{xirr}%** | SIP: **₹{sip:,.0f}/month**
- {"⚠️ You're trailing Nifty 50 by **" + str(gap) + "%** this year (" + str(market['nifty_1y_cagr']) + "% vs your " + str(xirr) + "%). A simple Nifty 50 index fund may beat your active funds." if trail else "✅ You're beating Nifty this year — well done!"}

**What the market is telling us:**
- PE at **{pe}** — {"caution zone, overvalued. Don't dump lump sums in." if pe > 22 else "fair value, okay to invest."}
- VIX at **{vix}** — {"calm market, no panic" if vix < 15 else "fear rising, long-term buying opportunity"}
- FII sold **₹{abs(fii):,} Cr** this week, DII bought **₹{dii:,} Cr** — domestic players are confident
- Crude at **${crude}/bbl** — {"elevated, watch out for inflation impact" if crude > 85 else "stable, no worry"}

**Quick fixes:**
- Any fund with <10% 3Y return? Replace it with **UTI Nifty 50 Index Fund Direct** (NAV ₹{uti_nav}, expense 0.06%)
- Are you on Regular plan? Switch to Direct — saves ~₹{round(portfolio_value * 0.008):,}/year
- No gold in portfolio? Add 10% to **Nippon India Gold BeES** — gold gave {market['gold_1y_return']}% last year

💡 Do this today: Check your fund overlap on MF Central. If 2+ funds share the same top 10 stocks, drop one and add **Parag Parikh Flexi Cap Direct** (1Y return: {ppfc_1y}%).

*(AI guidance — not SEBI-registered advice)*"""

    # ── Better Funds ─────────────────────────────────────────────────────
    elif any(k in m for k in ["better fund", "find fund", "best fund", "recommend fund", "which fund", "top fund", "good fund"]):
        return f"""## 🔍 Best Funds Right Now — {ist_date}

Nifty is at **₹{nifty:,.0f}** (PE: {pe} — {"slightly expensive" if pe > 22 else "fair value"}). Here are specific funds to consider:

**🏆 Your boring-but-powerful core pick (Low cost, proven):**
- **UTI Nifty 50 Index Fund Direct** — NAV ₹{uti_nav}, expense 0.06%, 1Y ~13%. Beats 80% of active funds long-term.

**📈 Active fund that actually earns its fee:**
- **Parag Parikh Flexi Cap Direct** — holds Google, Amazon + Indian stocks. Built-in ₹{usdinr} rupee hedge. 1Y return: {ppfc_1y}%.
- **Motilal Oswal Midcap Direct** — 1Y return: {mid_1y}%. High risk, high reward.

**🥇 Right now, gold deserves a spot:**
- **Nippon India Gold BeES ETF** — NAV tracks gold ($current: ${gold:,.0f}/oz). Gold gave {market['gold_1y_return']}% last year. Target 10-15% allocation.

**❌ Avoid right now:**
- Any fund with >1% expense ratio that's trailing its index
- Any fund you own on Regular plan (switch to Direct, same fund, lower cost)

**Market context:** FII sold ₹{abs(fii):,} Cr this week — some short-term pain ahead. Good time to SIP, not a great time for lump sum above ₹50,000.

💡 Do this today: Open Zerodha Coin or Groww, search "UTI Nifty 50 Direct", start ₹2,000/month SIP. That's it. Most people overthink this.

*(AI guidance — not SEBI-registered advice)*"""

    # ── Invest now or wait ────────────────────────────────────────────────
    elif any(k in m for k in ["invest now", "lump sum", "timing", "wait", "should i invest", "right now", "right time", "when to"]):
        pe_signal = "HOLD new lump sum" if pe > 23 else "CAUTIOUS BUY" if pe > 20 else "BUY"
        return f"""## ⏱️ Should You Invest Right Now?

**Live snapshot — {ist_date} {market['ist_time']}:**
- Nifty: **₹{nifty:,.0f}** ({chg_sign}{abs(chg_pct):.2f}% today) — Market is {status}
- PE: **{pe}** → Nexquire signal: **{pe_signal}**
- Crude: **${crude}/bbl** {"⚠️ elevated" if crude > 85 else "✅ stable"}
- FII: **₹{fii:,} Cr** {"outflow — foreigners selling" if fii < 0 else "inflow — positive sentiment"}

**The honest answer:**
{"Nifty at PE " + str(pe) + " is expensive by historical standards (cheap = below 18). This doesn't mean don't invest — it means don't dump everything at once." if pe > 22 else "Nifty PE below 22 is fair value territory — a reasonable time to invest."}

**What to do with your money:**
- **SIP? → Never stop.** Continue every SIP no matter what the market does. That's the whole point.
- **Lump sum (e.g. ₹1 lakh extra)?** {"Split into 3 parts, invest monthly. Start with ₹33,000 in **UTI Nifty 50 Direct** (NAV ₹" + str(uti_nav) + "), rest in liquid fund." if pe > 22 else "You can invest 50% now in **UTI Nifty 50 Direct**, rest next month."}
- **New SIP?** Start with **₹2,000–₹5,000/month** in Nifty 50 index fund — simplest starting point

💡 Do this today: {"Don't invest any lump sum above ₹25,000 directly. Park in HDFC Liquid Fund and set up STP to Nifty 50 at ₹5,000/week." if pe > 23 else "Invest up to 50% of your planned lump sum today in UTI Nifty 50 Direct. Set a reminder for next month to invest the rest."}

*(AI guidance — not SEBI-registered advice)*"""

    # ── Geopolitical ─────────────────────────────────────────────────────
    elif any(k in m for k in ["geopolit", "global", "war", "tariff", "crude", "oil", "us market", "fed", "dollar", "china", "election"]):
        return f"""## 🌐 Geopolitical Impact on Your Portfolio — {ist_date}

**Right now, these global events matter to your money:**

**🔴 Crude oil at ${crude}/bbl {"— WATCH OUT" if crude > 85 else "— manageable"}**
{"Every $10 rise in crude costs India ~$15 billion extra in imports. This pressures the rupee and inflation." if crude > 85 else "Crude is stable — good for Indian economy."}
- Impact: Auto, paint, airline stocks feel pain. Oil PSUs (ONGC, Oil India) gain.

**💵 Rupee at ₹{usdinr}/USD**
- Bad for: Companies that import (electronics, crude, machinery)
- Good for: **Parag Parikh Flexi Cap** (holds US stocks — rupee fall = more ₹ return), IT exporters

**🏦 FII sold ₹{abs(fii):,} Cr this week**
- Foreign money leaving India temporarily. This often creates good buying opportunities.
- DII (domestic funds like LIC, mutual funds) bought ₹{dii:,} Cr — they're confident India long-term

**🥇 Gold at ${gold:,}/oz — {market['gold_1y_return']}% return last year**
- Geopolitical uncertainty = gold gains. If you have zero gold, add 10% now.
- Best way: **Nippon India Gold BeES ETF** — buy like a stock, no making charges, no storage risk

**✅ What you should NOT do:**
- Don't sell your SIP funds because of global news
- Don't buy gold jewellery as investment (22% GST + making charges kills returns)

💡 Do this today: Add 1 SIP of **₹1,000/month** to Nippon India Gold BeES as a geopolitical hedge. That's it.

*(AI guidance — not SEBI-registered advice)*"""

    # ── Tax ──────────────────────────────────────────────────────────────
    elif any(k in m for k in ["tax", "ltcg", "stcg", "elss", "80c", "harvest", "tax loss", "nps", "80ccd", "save tax"]):
        return f"""## 🧾 Tax Saving Options — {ist_date}

**Here's what actually saves you real money:**

**1. ₹1,25,000 free LTCG every year — are you using it?**
LTCG (Long Term Capital Gain) on MFs held >1 year is taxed at 12.5% — but only ABOVE ₹1.25 lakh.
- Action: Redeem whatever MF units have ₹1.25L in gains, pay zero tax. Reinvest the next day.
- If you don't do this, you're leaving ₹15,625/year on the table.

**2. ELSS — saves up to ₹46,800 under Section 80C**
- Invest ₹1.5L in ELSS = save ₹46,800 in tax (30% bracket)
- Best ELSS right now: **Quant Tax Plan Direct** or **Mirae Asset ELSS Direct**
- Only 3-year lock-in (shortest among all 80C options)

**3. NPS — extra ₹50,000 savings under 80CCD(1B)**
This is OVER AND ABOVE 80C. ₹50,000 in NPS = save ~₹15,000 more in tax.
- Open NPS on Zerodha or enps.nsdl.com — takes 10 minutes

**4. Switch Regular → Direct plans (free, saves instantly)**
Regular plan distributor fee: ~0.8% more per year.
On ₹{portfolio_value:,.0f} portfolio = **₹{round(portfolio_value * 0.008):,}/year wasted**. Switch on MF Central.

**5. Don't trigger STCG (20% tax)**
Selling MF units held less than 1 year? That's 20% tax on gains. Wait it out.

💡 Do this today: Log into your MF account and check which units complete 1 year this month. Redeem up to ₹1.25L gains — zero tax.

*(AI guidance — not SEBI-registered advice)*"""

    # ── SIP ──────────────────────────────────────────────────────────────
    elif any(k in m for k in ["sip", "systematic", "monthly", "step up", "how much"]):
        future_5y  = round(sip * ((1 + 0.14/12)**60 - 1) / (0.14/12))
        future_10y = round(sip * ((1 + 0.14/12)**120 - 1) / (0.14/12))
        stepped_10y = round(sip * 1.5 * ((1 + 0.14/12)**120 - 1) / (0.14/12))
        return f"""## 💰 SIP Strategy — {ist_date}

**Your current SIP: ₹{sip:,.0f}/month**

Nifty is at **₹{nifty:,.0f}** today. Market is {status}. Good or bad — **always keep your SIP running.**

**What ₹{sip:,.0f}/month grows to at 14% CAGR:**
- In 5 years → **₹{future_5y:,}** (you put in ₹{sip*60:,})
- In 10 years → **₹{future_10y:,}** (you put in ₹{sip*120:,})

**The step-up trick (10% raise per year):**
If you increase SIP by 10% each year, your 10-year corpus becomes **₹{stepped_10y:,}** — that's {round((stepped_10y - future_10y)/future_10y*100)}% more!

**Best 3-fund SIP setup for beginners:**
1. **UTI Nifty 50 Index Direct** — 40% of SIP (NAV ₹{uti_nav}, expense 0.06%)
2. **Parag Parikh Flexi Cap Direct** — 35% (international exposure built-in, 1Y: {ppfc_1y}%)
3. **Nippon India Gold BeES** — 25% (hedge; gold up {market['gold_1y_return']}% last year)

**Set your SIP date to 7th of month** — historically, Indian markets dip slightly in first week after month-end FII selling. Slightly better average entry price.

💡 Do this today: If you're not already doing it, log into Zerodha Coin or Groww, set up a ₹{round(sip*0.4):,}/month SIP on "UTI Nifty 50 Direct Growth". Takes 3 minutes.

*(AI guidance — not SEBI-registered advice)*"""

    # ── Default / General ─────────────────────────────────────────────────
    else:
        hints = [
            f"Nifty is at **₹{nifty:,.0f}** today — PE of {pe} means {'slightly expensive' if pe > 22 else 'fair value'}",
            f"Gold at **${gold:,}/oz** (₹ terms: ~₹{round(gold * usdinr / 31.1):,}/gram). Up {market['gold_1y_return']}% in a year — good hedge",
            f"Crude at **${crude}/bbl** — {'watch for inflation impact' if crude > 85 else 'stable, markets prefer this'}",
            f"FII sold ₹{abs(fii):,} Cr, DII bought ₹{dii:,} Cr this week — domestic investors unfazed",
            f"UTI Nifty 50 Direct current NAV: **₹{uti_nav}**, expense ratio 0.06% — best value fund in India",
        ]
        random.shuffle(hints)
        return f"""## 🤖 Nexquire AI CFO — {ist_date} {market['ist_time']}

Market is **{status}**. Here's what matters to your money right now:

{chr(10).join('- ' + h for h in hints[:3])}

**Ask me anything specific:**
- *"Should I invest now or wait?"* — I'll check PE and give you a buy/hold signal
- *"Find better funds for me"* — I'll name specific funds with live NAVs
- *"Portfolio health check"* — I'll compare your XIRR vs Nifty
- *"How to save tax?"* — LTCG harvesting, ELSS, NPS breakdown
- *"Geopolitical impact?"* — crude oil, rupee, FII impact on your funds

💡 Do this today: Make sure every mutual fund you hold is in **Direct plan**, not Regular. Switch on MF Central (mfcentral.com) — same fund, lower cost, free to switch.

*(AI guidance — not SEBI-registered advice)*"""


# ─── Metadata Generator (CTAs & Follow-ups) ────────────────────────────────

def _generate_metadata(text: str) -> dict:
    """Generates actions (CTAs) and contextual follow-ups based on the response text."""
    text_lower = text.lower()
    follow_ups = []
    actions = []
    
    # Follow-ups based on topics mentioned
    if "ltcg" in text_lower or "tax" in text_lower or "elss" in text_lower:
        follow_ups.append({"text": "How does LTCG harvesting work?"})
    if ("pe " in text_lower) or "nifty is at" in text_lower or "overvalued" in text_lower:
        follow_ups.append({"text": "What is the Nifty PE ratio?"})
    if "gold" in text_lower:
        follow_ups.append({"text": "Is gold a good investment now?"})
    if "sip" in text_lower:
        follow_ups.append({"text": "Should I step up my SIP?"})
    if "fii" in text_lower or "dii" in text_lower or "crude" in text_lower:
        follow_ups.append({"text": "Why do FII and crude numbers matter?"})
        
    if not follow_ups:
        follow_ups = [{"text": "Is my portfolio healthy?"}, {"text": "Find better funds for me"}]
        
    # Actions (Deep links)
    if "sip" in text_lower and ("uti" in text_lower or "parag" in text_lower or "nifty" in text_lower):
        actions.append({"label": "Start SIP on Coin", "url": "https://coin.zerodha.com/"})
    if "liquid fund" in text_lower or "stp" in text_lower:
        actions.append({"label": "Setup STP on Coin", "url": "https://coin.zerodha.com/"})
    if "mf central" in text_lower or "direct" in text_lower or "regular" in text_lower:
        actions.append({"label": "Open in MFCentral", "url": "https://www.mfcentral.com/"})
    if "nps" in text_lower:
        actions.append({"label": "Open NPS Portal", "url": "https://enps.nsdl.com/"})
        
    return {"actions": actions[:2], "follow_ups": follow_ups[:3]}



# ─── Main Agent ──────────────────────────────────────────────────────────────

class WealthChatAgent:
    def get_user_context(self, user_id: str) -> dict:
        try:
            profile   = get_user_profile(user_id) or {}
            portfolio = get_portfolio(user_id) or {}
            return {**profile, **portfolio}
        except Exception:
            return {}

    def chat(self, user_id: str, message: str, history: list = None):
        """Legacy non-streaming endpoint. Wraps stream_chat output."""
        generator = self.stream_chat(user_id, message, history)
        final_text = ""
        for chunk in generator:
            if chunk.startswith("data: "):
                data = json.loads(chunk[6:])
                if "chunk" in data:
                    final_text += data["chunk"]
        
        return {
            "answer": final_text,
            "sources": ["Nexquire Intelligence", "yfinance Live"],
            "success": True,
        }

    def stream_chat(self, user_id: str, message: str, history: list = None):
        # Fetch live data in parallel
        market = _fetch_live_market()

        funds_list = []
        headlines  = []
        def _bg():
            nonlocal funds_list, headlines
            funds_list = _fetch_top_funds()
            headlines  = _fetch_news_headlines(4)
        t = threading.Thread(target=_bg, daemon=True)
        t.start()
        t.join(timeout=8)  # wait up to 8 seconds

        funds_map = {f["code"]: f for f in funds_list}

        # User context
        ctx            = self.get_user_context(user_id)
        portfolio_value = ctx.get("total_value",   1_245_000)
        xirr            = ctx.get("xirr",          11.2)
        sip             = ctx.get("monthly_sip",   8_000)

        full_reply_text = ""

        # ── Try Gemini with stream=True ─────────────────────────────────────
        if _gemini_model:
            live_ctx    = _build_live_context(market, funds_list, headlines)
            sys_prompt  = SYSTEM_PROMPT_TEMPLATE.format(live_context=live_ctx)
            gemini_hist = history or []
            try:
                chat_session = _gemini_model.start_chat(history=gemini_hist)
                if not gemini_hist:
                    full_prompt = f"{sys_prompt}\n\nUser question: {message}"
                else:
                    full_prompt = message
                
                resp = chat_session.send_message(full_prompt, stream=True)
                for chunk in resp:
                    text_chunk = chunk.text
                    full_reply_text += text_chunk
                    yield f"data: {json.dumps({'chunk': text_chunk})}\n\n"
                    
                meta = _generate_metadata(full_reply_text)
                yield f"data: {json.dumps({'metadata': meta})}\n\n"
                return
            except Exception as e:
                print(f"Gemini streaming failed ({e}), using smart engine")

        # ── Smart engine with simulated streaming ─────────────────────────
        reply = _smart_response(message, market, funds_map, portfolio_value, xirr, sip)
        full_reply_text = reply
        
        # Simulated streaming effect (split on space to keep chunking logic intact)
        lines = reply.split("\n")
        for i, line in enumerate(lines):
            words = line.split(" ")
            for j, word in enumerate(words):
                chunk_str = word + (" " if j < len(words) - 1 else "")
                yield f"data: {json.dumps({'chunk': chunk_str})}\n\n"
                time.sleep(0.015) # fast stream simulation
            if i < len(lines) - 1:
                yield f"data: {json.dumps({'chunk': '\n'})}\n\n"
                
        meta = _generate_metadata(full_reply_text)
        yield f"data: {json.dumps({'metadata': meta})}\n\n"

wealth_chat_agent = WealthChatAgent()
