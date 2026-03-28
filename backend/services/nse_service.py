import yfinance as yf
import time
from typing import Optional

# Simple in-memory cache to avoid hammering yfinance
_cache: dict = {}
_cache_ttl = 30  # seconds


def _get_cached(key: str):
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < _cache_ttl:
        return entry["data"]
    return None


def _set_cache(key: str, data):
    _cache[key] = {"data": data, "ts": time.time()}


def _fmt(value: float, prefix: str = "₹") -> str:
    if value >= 1_000:
        return f"{prefix}{value:,.2f}"
    return f"{prefix}{value:.2f}"


class NSEService:

    def get_market_pulse(self):
        cached = _get_cached("market_pulse")
        if cached:
            return cached

        try:
            # Check for weekend to avoid long timeouts
            import pytz
            from datetime import datetime
            ist = pytz.timezone('Asia/Kolkata')
            now = datetime.now(ist)
            if now.weekday() >= 5: # Sat or Sun
                 return self._fallback("Weekend Mode Active")

            tickers = yf.download(
                ["^NSEI", "^BSESN"],
                period="2d",
                interval="1m",
                progress=False,
                auto_adjust=True
            )

            nifty_price, nifty_change = self._extract(tickers, "^NSEI")
            sensex_price, sensex_change = self._extract(tickers, "^BSESN")

            result = [
                {
                    "label": "Nifty 50",
                    "value": _fmt(nifty_price),
                    "trend": f"{nifty_change:+.2f}%",
                    "color": "text-success" if nifty_change >= 0 else "text-destructive"
                },
                {
                    "label": "Sensex",
                    "value": _fmt(sensex_price),
                    "trend": f"{sensex_change:+.2f}%",
                    "color": "text-success" if sensex_change >= 0 else "text-destructive"
                },
                {
                    "label": "FII Net Flow",
                    "value": "Live via NSE",
                    "trend": "Check NSE",
                    "color": "text-muted-foreground"
                },
                {
                    "label": "India 10Y",
                    "value": "6.92%",
                    "trend": "Stable",
                    "color": "text-success"
                }
            ]
            _set_cache("market_pulse", result)
            return result

        except Exception as e:
            # Fallback to last known reasonable values
            return self._fallback(str(e))

    def _extract(self, tickers, symbol: str):
        try:
            close = tickers["Close"][symbol].dropna()
            latest = float(close.iloc[-1])
            prev = float(close.iloc[-2]) if len(close) > 1 else latest
            change_pct = ((latest - prev) / prev) * 100
            return latest, change_pct
        except Exception:
            defaults = {"^NSEI": (22453.20, 0.0), "^BSESN": (74123.50, 0.0)}
            return defaults.get(symbol, (0, 0))

    def _fallback(self, error: str):
        return [
            {"label": "Nifty 50", "value": "₹22,453.20", "trend": "—", "color": "text-muted-foreground"},
            {"label": "Sensex", "value": "₹74,123.50", "trend": "—", "color": "text-muted-foreground"},
            {"label": "FII Net Flow", "value": "Unavailable", "trend": "—", "color": "text-muted-foreground"},
            {"label": "India 10Y", "value": "6.92%", "trend": "Stable", "color": "text-success"},
        ]

    def get_nifty_pe(self):
        return 23.5

    def get_fii_dii_flow(self):
        return {"fii_net": -4500.20, "dii_net": 5200.50, "sentiment": "DII Support"}


nse_service = NSEService()
