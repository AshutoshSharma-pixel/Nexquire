import requests
import time
from datetime import datetime
import pytz

_nav_cache = {}
_nav_cache_ts = {}
NAV_TTL = 300  # 5 minutes cache

def get_live_nav(scheme_code: str) -> dict:
    """Fetch latest NAV from MFAPI - updates daily at 9PM IST"""
    now = time.time()
    if scheme_code in _nav_cache:
        if now - _nav_cache_ts.get(scheme_code, 0) < NAV_TTL:
            return _nav_cache[scheme_code]
    
    try:
        r = requests.get(
            f"https://api.mfapi.in/mf/{scheme_code}",
            timeout=8,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        data = r.json()
        nav_data = data.get("data", [])
        meta = data.get("meta", {})
        
        if nav_data:
            result = {
                "scheme_code": scheme_code,
                "scheme_name": meta.get("scheme_name", ""),
                "fund_house": meta.get("fund_house", ""),
                "nav": float(nav_data[0]["nav"]),
                "nav_date": nav_data[0]["date"],
                "nav_history": nav_data[:365],  # 1 year
            }
            _nav_cache[scheme_code] = result
            _nav_cache_ts[scheme_code] = now
            return result
    except Exception as e:
        print(f"NAV fetch error for {scheme_code}: {e}")
    
    return {}

def search_fund_by_name(name: str) -> list:
    """Search MFAPI for fund by name"""
    try:
        r = requests.get(
            f"https://api.mfapi.in/mf/search?q={requests.utils.quote(name)}",
            timeout=8
        )
        return r.json()[:10]
    except:
        return []

def calculate_current_value(
    units: float, 
    scheme_code: str
) -> dict:
    """Calculate real-time current value from live NAV"""
    nav_data = get_live_nav(scheme_code)
    if nav_data and units:
        current_nav = nav_data["nav"]
        current_value = units * current_nav
        return {
            "current_nav": current_nav,
            "nav_date": nav_data["nav_date"],
            "current_value": round(current_value, 2),
            "units": units
        }
    return {}
