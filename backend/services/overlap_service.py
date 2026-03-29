# Top holdings for common funds (updated quarterly)
# In production: fetch from Screener.in or ValueResearch
FUND_HOLDINGS = {
    "hdfc top 100": ["Reliance", "HDFC Bank", "Infosys", "ICICI Bank", 
                     "TCS", "Bharti Airtel", "Axis Bank", "L&T",
                     "Sun Pharma", "Wipro"],
    "axis bluechip": ["Reliance", "HDFC Bank", "Infosys", "ICICI Bank",
                      "TCS", "Avenue Supermarts", "Bajaj Finance",
                      "Asian Paints", "Kotak Mahindra", "Nestle"],
    "mirae asset large cap": ["Reliance", "HDFC Bank", "Infosys", "ICICI Bank",
                               "TCS", "Axis Bank", "L&T", "Sun Pharma",
                               "Kotak Mahindra", "Bharti Airtel"],
    "parag parikh flexi cap": ["HDFC Bank", "Bajaj Holdings", "ITC",
                                "Coal India", "Power Grid", "Alphabet",
                                "Meta", "Microsoft", "Amazon", "Suzuki"],
    "sbi small cap": ["Blue Star", "Chalet Hotels", "Karur Vysya",
                      "Redington", "Sapphire Foods", "Welspun Corp",
                      "Kalpataru Projects", "Safari Industries",
                      "Ratnamani Metals", "Shyam Metalics"],
}

def calculate_overlap(holdings: list) -> dict:
    """Calculate overlap between funds in portfolio"""
    fund_stocks = {}
    
    for holding in holdings:
        name = holding.get("fund_name", "").lower()
        # Match to known fund holdings
        found = False
        for key, stocks in FUND_HOLDINGS.items():
            if any(word in name for word in key.split()):
                fund_stocks[holding["fund_name"]] = stocks
                found = True
                break
        if not found:
            fund_stocks[holding["fund_name"]] = []
    
    # Calculate pairwise overlap
    overlap_pairs = []
    fund_names = list(fund_stocks.keys())
    
    for i in range(len(fund_names)):
        for j in range(i+1, len(fund_names)):
            f1 = fund_names[i]
            f2 = fund_names[j]
            s1 = set(fund_stocks[f1])
            s2 = set(fund_stocks[f2])
            
            if s1 and s2:
                common = s1.intersection(s2)
                overlap_pct = (len(common) / max(len(s1), len(s2))) * 100
                
                if overlap_pct > 20:
                    overlap_pairs.append({
                        "fund1": f1,
                        "fund2": f2,
                        "overlap_pct": round(overlap_pct, 1),
                        "common_stocks": list(common)[:5]
                    })
    
    # Find most duplicated stocks
    all_stocks = []
    for stocks in fund_stocks.values():
        all_stocks.extend(stocks)
    
    from collections import Counter
    stock_counts = Counter(all_stocks)
    duplicated = [
        {"stock": stock, "appears_in": count}
        for stock, count in stock_counts.most_common(5)
        if count > 1
    ]
    
    overall_overlap = (
        sum(p["overlap_pct"] for p in overlap_pairs) / len(overlap_pairs)
        if overlap_pairs else 0
    )
    
    return {
        "overall_overlap_pct": round(overall_overlap, 1),
        "overlap_pairs": overlap_pairs,
        "most_duplicated_stocks": duplicated,
        "verdict": (
            "HIGH - You're less diversified than you think" 
            if overall_overlap > 40
            else "MEDIUM - Some overlap, manageable"
            if overall_overlap > 20
            else "LOW - Well diversified"
        )
    }
