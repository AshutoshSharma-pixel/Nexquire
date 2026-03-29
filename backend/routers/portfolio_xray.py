from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import json, os, tempfile, re
from datetime import datetime
import google.generativeai as genai
import yfinance as yf

from backend.services.nav_service import (
    get_live_nav, search_fund_by_name, calculate_current_value
)
from backend.services.xirr_service import calculate_xirr
from backend.services.overlap_service import calculate_overlap
from backend.services.stress_test import run_stress_test

router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ── Fetch Nifty 1yr return for benchmark ──────────────────
def get_nifty_benchmark() -> float:
    try:
        nifty = yf.download("^NSEI", period="1y", 
                           interval="1d", progress=False)
        if not nifty.empty:
            start = float(nifty["Close"].iloc[0])
            end = float(nifty["Close"].iloc[-1])
            return round((end - start) / start * 100, 2)
    except:
        pass
    return 13.4  # fallback

# ── Upload CAMS PDF ────────────────────────────────────────
@router.post("/upload-cams")
async def upload_cams(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted")
    
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=".pdf"
    ) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        from backend.services.pdf_parser import parse_cams_pdf
        holdings = parse_cams_pdf(tmp_path)
        
        # Enrich with live NAVs
        enriched = []
        for h in holdings:
            # Search for scheme code
            results = search_fund_by_name(h["fund_name"])
            if results:
                code = str(results[0].get("schemeCode", ""))
                live = get_live_nav(code)
                if live:
                    h["scheme_code"] = code
                    h["current_nav"] = live["nav"]
                    h["nav_date"] = live["nav_date"]
                    if h.get("units"):
                        h["current_value"] = round(
                            h["units"] * live["nav"], 2
                        )
            enriched.append(h)
        
        os.unlink(tmp_path)
        return {"success": True, "holdings": enriched,
                "count": len(enriched)}
    
    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise HTTPException(500, f"PDF parse failed: {e}")

# ── Manual Entry ───────────────────────────────────────────
@router.post("/manual-entry")
async def manual_entry(data: dict):
    holdings = data.get("holdings", [])
    enriched = []
    
    for h in holdings:
        fund_name = h.get("fund_name", "")
        units = h.get("units", 0)
        scheme_code = h.get("scheme_code", "")
        
        if scheme_code:
            live = get_live_nav(scheme_code)
            if live:
                h["current_nav"] = live["nav"]
                h["nav_date"] = live["nav_date"]
                h["current_value"] = round(units * live["nav"], 2)
                h["fund_name"] = live["scheme_name"] or fund_name
        
        enriched.append(h)
    
    return {"success": True, "holdings": enriched}

# ── Fund Search Autocomplete ───────────────────────────────
@router.get("/search-fund")
async def search_fund(q: str):
    results = search_fund_by_name(q)
    return {"results": results[:8]}

# ── Live Portfolio Valuation ───────────────────────────────
@router.post("/live-valuation")
async def live_valuation(data: dict):
    """
    Recalculate portfolio value using latest NAVs.
    Call this every 5 minutes to keep values fresh.
    """
    holdings = data.get("holdings", [])
    updated = []
    total_current = 0
    
    for h in holdings:
        scheme_code = h.get("scheme_code")
        units = h.get("units", 0)
        
        if scheme_code and units:
            live = get_live_nav(scheme_code)
            if live:
                current_value = round(units * live["nav"], 2)
                h["current_nav"] = live["nav"]
                h["nav_date"] = live["nav_date"]
                h["current_value"] = current_value
                h["gain_loss"] = round(
                    current_value - h.get("amount_invested", 0), 2
                )
                h["gain_loss_pct"] = round(
                    (current_value - h.get("amount_invested", 0)) /
                    max(h.get("amount_invested", 1), 1) * 100, 2
                )
                total_current += current_value
        
        updated.append(h)
    
    total_invested = sum(
        h.get("amount_invested", 0) for h in updated
    )
    
    return {
        "holdings": updated,
        "total_invested": round(total_invested, 2),
        "total_current": round(total_current, 2),
        "total_gain_loss": round(total_current - total_invested, 2),
        "total_return_pct": round(
            (total_current - total_invested) / 
            max(total_invested, 1) * 100, 2
        ),
        "last_updated": datetime.now().isoformat(),
        "nav_note": "NAVs update once daily at 9:00 PM IST"
    }

# ── MAIN ANALYSIS ENGINE ───────────────────────────────────
@router.post("/analyze")
async def analyze_portfolio(data: dict):
    holdings = data.get("holdings", [])
    user_profile = data.get("user_profile", {})
    
    if not holdings:
        raise HTTPException(400, "No holdings provided")
    
    # Step 1: Get live valuations
    total_invested = sum(
        h.get("amount_invested", 0) for h in holdings
    )
    total_current = sum(
        h.get("current_value", 0) for h in holdings
    )
    
    # Step 2: Calculate XIRR
    cashflows = []
    for h in holdings:
        if h.get("purchase_date") and h.get("amount_invested"):
            cashflows.append((
                h["purchase_date"],
                -abs(h["amount_invested"])
            ))
    
    # Add current value as final cashflow
    if cashflows:
        cashflows.append((
            datetime.now().strftime("%Y-%m-%d"),
            total_current
        ))
    
    xirr = calculate_xirr(cashflows) if cashflows else 0
    
    # Step 3: Benchmark
    nifty_1yr = get_nifty_benchmark()
    beating_nifty = xirr > nifty_1yr
    
    # Step 4: Allocation breakdown
    total_val = max(total_current, 1)
    categories = {}
    for h in holdings:
        cat = h.get("category", "Unknown")
        categories[cat] = categories.get(cat, 0) + \
                         h.get("current_value", 0)
    
    allocation = {
        cat: round(val/total_val*100, 1)
        for cat, val in categories.items()
    }
    
    # Step 5: Detect problems
    problems = []
    age = user_profile.get("age", 30)
    
    for h in holdings:
        fname = h.get("fund_name", "")
        fval = h.get("current_value", 0)
        
        # Regular plan check
        if "regular" in fname.lower():
            annual_loss = round(fval * 0.008)
            problems.append({
                "type": "regular_plan",
                "severity": "HIGH",
                "fund": fname,
                "message": f"Regular plan — paying distributor commission",
                "rupee_impact": f"Costs ₹{annual_loss:,}/year",
                "action": "Switch to Direct on MF Central (free, 5 mins)"
            })
        
        # Low return check
        fund_return = h.get("gain_loss_pct", 0)
        if fund_return < 8 and h.get("amount_invested", 0) > 10000:
            problems.append({
                "type": "underperformance",
                "severity": "MEDIUM",
                "fund": fname,
                "message": f"Only {fund_return}% return — below inflation",
                "rupee_impact": f"₹{round(fval*0.05):,} opportunity cost",
                "action": "Replace with top-ranked fund in same category"
            })
    
    # Age-based allocation check
    small_mid_pct = allocation.get("Small Cap", 0) + \
                   allocation.get("Mid Cap", 0)
    if age > 40 and small_mid_pct > 40:
        problems.append({
            "type": "age_allocation",
            "severity": "HIGH",
            "fund": "Portfolio Level",
            "message": f"{small_mid_pct}% in Small/Mid Cap at age {age}",
            "rupee_impact": "High volatility risk near retirement",
            "action": f"Reduce to 25% Small/Mid Cap, shift to Large Cap"
        })
    
    # Missing gold check
    has_gold = any(
        "gold" in h.get("fund_name", "").lower() or
        "gold" in h.get("category", "").lower()
        for h in holdings
    )
    if not has_gold:
        problems.append({
            "type": "missing_gold",
            "severity": "LOW",
            "fund": "Portfolio Level",
            "message": "No gold allocation — missing inflation hedge",
            "rupee_impact": "Missed 18.7% gold return last year",
            "action": "Add 10% to Nippon India Gold BeES ETF"
        })
    
    # AMC concentration check
    amc_values = {}
    for h in holdings:
        amc = h.get("fund_name", "").split()[0]
        amc_values[amc] = amc_values.get(amc, 0) + \
                         h.get("current_value", 0)
    
    for amc, val in amc_values.items():
        if val/total_val > 0.5:
            problems.append({
                "type": "amc_concentration",
                "severity": "MEDIUM",
                "fund": f"{amc} funds",
                "message": f"{round(val/total_val*100)}% in one AMC",
                "rupee_impact": "AMC-specific risk",
                "action": "Diversify across at least 3 different AMCs"
            })
    
    # Step 6: Overlap analysis
    overlap = calculate_overlap(holdings)
    
    # Step 7: Stress test
    stress = run_stress_test(holdings, total_current)
    
    # Step 8: Tax analysis
    today = datetime.now()
    tax_opportunities = []
    
    for h in holdings:
        if h.get("purchase_date"):
            try:
                purchase = datetime.strptime(
                    h["purchase_date"], "%Y-%m-%d"
                )
                days_held = (today - purchase).days
                gain = h.get("current_value", 0) - \
                      h.get("amount_invested", 0)
                
                if 350 <= days_held <= 380 and gain > 0:
                    tax_opportunities.append({
                        "fund": h["fund_name"],
                        "days_held": days_held,
                        "gain": round(gain),
                        "tax_saving": round(gain * 0.125),
                        "action": "Approaching 1 year — book gains soon"
                    })
                elif days_held >= 365 and gain > 0:
                    tax_free = min(gain, 125000)
                    tax_opportunities.append({
                        "fund": h["fund_name"],
                        "days_held": days_held,
                        "gain": round(gain),
                        "tax_free_gain": round(tax_free),
                        "action": "LTCG eligible — harvest up to ₹1.25L"
                    })
            except:
                pass
    
    # Step 9: Better alternatives via Gemini
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    underperformers = [
        h for h in holdings
        if h.get("gain_loss_pct", 100) < 10
    ]
    
    full_holdings_serializable = []
    for h in holdings:
        full_holdings_serializable.append({
            "fund": str(h.get("fund_name", "")),
            "value": float(h.get("current_value", 0)),
            "return_pct": float(h.get("gain_loss_pct", 0)),
            "category": str(h.get("category", "Unknown"))
        })

    alternatives_prompt = f"""
You are Nexquire's AI Portfolio Auditor for Indian investors.

Portfolio summary:
- Total value: ₹{float(total_current):,.0f}
- XIRR: {float(xirr)}%
- Nifty 1yr benchmark: {float(nifty_1yr)}%
- Beating market: {beating_nifty}
- Age: {age}

Underperforming funds:
{json.dumps(underperformers[:5], indent=2, default=str)}

All problems detected:
{json.dumps(problems, indent=2, default=str)}

Overlap analysis:
{json.dumps(overlap, indent=2, default=str)}

Full holdings:
{json.dumps(full_holdings_serializable, indent=2)}

Provide comprehensive portfolio audit in this EXACT JSON:
{{
    "grade": "B+",
    "grade_color": "#D97706",
    "grade_reason": "one sentence why this grade",
    "overall_verdict": "2-3 sentences plain English verdict",
    "portfolio_summary": "one line describing portfolio style",
    "top_problems": [
        {{
            "problem": "specific problem description",
            "rupee_impact": "₹X per year or ₹X total",
            "urgency": "URGENT/HIGH/MEDIUM/LOW",
            "fix_effort": "5 minutes/1 hour/1 week"
        }}
    ],
    "top_recommendations": [
        {{
            "rank": 1,
            "action": "specific actionable step",
            "expected_benefit": "₹X or X% improvement",
            "how_to": "exact steps to take",
            "effort": "5 mins/1 hour/Today"
        }}
    ],
    "the_one_thing": "The single most important action right now",
    "better_alternatives": [
        {{
            "current_fund": "exact fund name from holdings",
            "suggested_fund": "specific better fund name",
            "reason": "why it's better",
            "expected_improvement": "X% better return or ₹X saved"
        }}
    ],
    "what_if_nifty_instead": {{
        "question": "What if you had invested in Nifty 50 index instead?",
        "nifty_value_now": "₹X",
        "your_value_now": "₹X",
        "difference": "₹X ahead/behind",
        "lesson": "one sentence insight"
    }},
    "whatsapp_summary": "2-line summary perfect for sharing on WhatsApp"
}}

Return ONLY valid JSON. No markdown fences.
Be specific with fund names and rupee amounts.
"""
    
    try:
        response = model.generate_content(alternatives_prompt)
        text = re.sub(r'```json|```', '', 
                     response.text).strip()
        ai_analysis = json.loads(text)
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        ai_analysis = {
            "grade": "B",
            "grade_color": "#2563EB",
            "grade_reason": "Portfolio needs optimization",
            "overall_verdict": "Your portfolio has good fundamentals but several areas for improvement.",
            "top_problems": problems[:3],
            "top_recommendations": [
                {
                    "rank": 1,
                    "action": "Switch Regular plans to Direct",
                    "expected_benefit": "Save ₹8,000-15,000/year",
                    "how_to": "Visit mfcentral.com → Switch → select Direct plan",
                    "effort": "15 mins"
                }
            ],
            "the_one_thing": "Switch all Regular plans to Direct plans on MF Central",
            "better_alternatives": [],
            "what_if_nifty_instead": {
                "question": "What if you had invested in Nifty 50 index instead?",
                "difference": "Analysis requires more data",
                "lesson": "Index funds beat 80% of active funds long-term"
            },
            "whatsapp_summary": f"Portfolio value ₹{total_current:,.0f} | XIRR {xirr}% | {'Beating' if beating_nifty else 'Trailing'} Nifty"
        }
    
    # Final response
    return {
        "success": True,
        "portfolio": {
            "total_invested": round(total_invested),
            "total_current": round(total_current),
            "total_gain_loss": round(total_current - total_invested),
            "total_return_pct": round(
                (total_current - total_invested) /
                max(total_invested, 1) * 100, 2
            ),
            "xirr": xirr,
            "nifty_benchmark": nifty_1yr,
            "beating_nifty": beating_nifty,
            "holdings_count": len(holdings),
            "last_updated": datetime.now().isoformat()
        },
        "holdings": holdings,
        "allocation": allocation,
        "problems": problems,
        "overlap": overlap,
        "stress_test": stress,
        "tax_opportunities": tax_opportunities,
        "ai_analysis": ai_analysis
    }
