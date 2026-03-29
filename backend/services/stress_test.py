import yfinance as yf

def run_stress_test(holdings: list, total_value: float) -> dict:
    """Run portfolio stress test scenarios"""
    
    # Categorize holdings
    equity_value = sum(
        h.get("current_value", 0) for h in holdings
        if h.get("category", "").lower() not in ["debt", "liquid", "gold", "debt fund", "liquid fund"]
    )
    gold_value = sum(
        h.get("current_value", 0) for h in holdings
        if "gold" in h.get("category", "").lower() or "gold" in h.get("fund_name", "").lower()
    )
    debt_value = total_value - equity_value - gold_value
    
    # Large cap vs small/mid split
    large_cap = sum(
        h.get("current_value", 0) for h in holdings
        if "large" in h.get("category", "").lower() or "bluechip" in h.get("fund_name", "").lower()
    )
    small_mid = equity_value - large_cap
    
    # Scenario 1: Nifty drops 20%
    # Large caps fall ~20%, small/mid fall ~30%, gold rises 5%
    nifty_20_loss = (
        large_cap * 0.20 +
        small_mid * 0.30 -
        gold_value * 0.05
    )
    
    # Scenario 2: Crude hits $120
    # Energy sector gains, inflation hits consumption stocks
    # Overall market -8%, gold +10%
    crude_120_loss = (
        equity_value * 0.08 -
        gold_value * 0.10
    )
    
    # Scenario 3: Rupee falls 10%
    # IT stocks gain (exporters), import-heavy fall
    intl_exposure = sum(
        h.get("current_value", 0) for h in holdings
        if any(kw in h.get("fund_name", "").lower() 
               for kw in ["parag parikh", "international", "nasdaq", "us", "fang", "overseas"])
    )
    rupee_fall_impact = -(intl_exposure * 0.10)  # gain (negative loss)
    
    # Scenario 4: Interest rates rise 100bps
    debt_impact = debt_value * 0.06  # debt funds fall
    
    return {
        "nifty_crash_20pct": {
            "scenario": "Nifty falls 20% (like March 2020)",
            "estimated_loss": round(nifty_20_loss),
            "portfolio_impact_pct": round(nifty_20_loss/total_value*100, 1) if total_value > 0 else 0,
            "recovery_outlook": "Historically recovers in 12-18 months"
        },
        "crude_spike_120": {
            "scenario": "Crude oil hits $120/barrel",
            "estimated_loss": round(crude_120_loss),
            "portfolio_impact_pct": round(crude_120_loss/total_value*100, 1) if total_value > 0 else 0,
            "recovery_outlook": "Inflation-driven correction, 6-9 months"
        },
        "rupee_depreciation_10pct": {
            "scenario": "Rupee falls 10% vs USD",
            "estimated_gain_loss": round(rupee_fall_impact),
            "portfolio_impact_pct": round(rupee_fall_impact/total_value*100, 1) if total_value > 0 else 0,
            "recovery_outlook": "International fund holdings benefit"
        },
        "rate_hike_100bps": {
            "scenario": "RBI hikes rates by 1%",
            "estimated_loss": round(debt_impact),
            "portfolio_impact_pct": round(debt_impact/total_value*100, 1) if total_value > 0 else 0,
            "recovery_outlook": "Short duration funds recover in 3 months"
        }
    }
