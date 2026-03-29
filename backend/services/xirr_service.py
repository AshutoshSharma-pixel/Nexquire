from scipy.optimize import brentq
from datetime import datetime

def calculate_xirr(cashflows: list) -> float:
    """
    cashflows = list of (date_str, amount) tuples
    Negative amount = investment (money out)
    Positive amount = current value (money in)
    
    Example:
    [
        ("2022-01-15", -10000),  # invested
        ("2022-06-15", -5000),   # invested more
        ("2024-03-29", 18000),   # current value (positive)
    ]
    """
    if len(cashflows) < 2:
        return 0.0
    
    dates = []
    amounts = []
    
    for cf in cashflows:
        date_str, amount = cf
        if isinstance(date_str, str):
            try:
                # Try common formats
                for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"]:
                    try:
                        d = datetime.strptime(date_str, fmt)
                        break
                    except:
                        continue
                else:
                    # Fallback or skip
                    continue
            except:
                continue
        else:
            d = date_str
        dates.append(d)
        amounts.append(amount)
    
    if not dates or len(dates) < 2:
        return 0.0
    
    # Sort by date
    cf_data = sorted(zip(dates, amounts))
    dates, amounts = zip(*cf_data)
    
    base_date = dates[0]
    
    def npv(rate):
        total = 0
        for d, a in zip(dates, amounts):
            years = (d - base_date).days / 365.25
            total += a / ((1 + rate) ** years)
        return total
    
    try:
        # XIRR is the rate that makes NPV zero
        # Search between -0.99 (99% loss) and 100 (10,000% gain)
        result = brentq(npv, -0.999, 100.0, 
                       maxiter=1000, xtol=1e-6)
        return round(result * 100, 2)
    except Exception as e:
        # Fallback: simple absolute return
        invested = sum(abs(a) for a in amounts if a < 0)
        current = sum(a for a in amounts if a > 0)
        if invested > 0:
            return round((current - invested) / invested * 100, 2)
        return 0.0
